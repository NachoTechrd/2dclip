// api/auth.js - Autenticación, Perfil y Persistencia de Claves/Configuración en MongoDB Atlas
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId, JWT_SECRET, ADMIN_EMAILS, getDatabase, verifyUserToken } = require('./_shared');

function sanitizeSettings(raw) {
    if (!raw || typeof raw !== 'object') return {};
    const allowed = [
        'aiProvider',
        'geminiApiKey',
        'geminiModel',
        'azureOpenaiEndpoint',
        'azureOpenaiApiKey',
        'azureOpenaiDeployment',
        'azureImageDeployment',
        'azureSpeechKey',
        'azureSpeechRegion',
        'azureVoiceName',
        'azureTtsDeployment',
        'elevenlabsApiKey',
        'elevenVoiceId',
        'elevenModelId',
        'elevenStability',
        'elevenSimilarity',
        'elevenStyle',
        'voiceEngine',
        'voiceUri',
        'ttsRate',
        'ttsPitch',
        'defaultBrand',
        'defaultDomain',
        'defaultPriceTag',
        'defaultCtaText',
        'highlightStyle',
        'aspectRatio',
        'bgmEnabled',
        'bgmTrack',
        'bgmVolume',
        'sfxEnabled',
        'sfxVolume'
    ];
    const clean = {};
    for (const k of allowed) {
        if (raw[k] !== undefined) {
            clean[k] = typeof raw[k] === 'string' ? raw[k].trim() : raw[k];
        }
    }
    return clean;
}

function formatUserPayload(user, isAdminOverride) {
    const isAdmin = isAdminOverride || ADMIN_EMAILS.includes((user.email || '').toLowerCase()) || user.role === 'admin';
    return {
        id: user._id.toString(),
        email: user.email,
        name: user.name || (user.email ? user.email.split('@')[0] : 'Creador'),
        role: isAdmin ? 'admin' : (user.role || 'creator'),
        settings: user.settings || {},
        customAssets: Array.isArray(user.customAssets) ? user.customAssets : []
    };
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Guest-Id');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const action = req.query.action || (req.body && req.body.action) || 'me';

    try {
        const db = await getDatabase();
        const usersCol = db.collection('users');

        // 1. REGISTRO DE USUARIO
        if (action === 'register' && req.method === 'POST') {
            const { email, password, name, settings } = req.body || {};
            if (!email || !password) {
                return res.status(400).json({ error: 'Email y contraseña requeridos' });
            }
            if (String(password).length < 4) {
                return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
            }
            const cleanEmail = email.trim().toLowerCase();
            const existing = await usersCol.findOne({ email: cleanEmail });
            if (existing) {
                return res.status(409).json({ error: 'Ya existe una cuenta con este correo' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const isAdmin = ADMIN_EMAILS.includes(cleanEmail);

            const newUser = {
                email: cleanEmail,
                name: (name || cleanEmail.split('@')[0]).trim(),
                password: hashedPassword,
                role: isAdmin ? 'admin' : 'creator',
                settings: sanitizeSettings(settings),
                customAssets: [],
                createdAt: new Date(),
                lastLoginAt: new Date()
            };

            const result = await usersCol.insertOne(newUser);
            newUser._id = result.insertedId;
            const token = jwt.sign(
                { userId: result.insertedId.toString(), email: cleanEmail, role: newUser.role, name: newUser.name },
                JWT_SECRET,
                { expiresIn: '30d' }
            );

            return res.status(201).json({
                success: true,
                token,
                user: formatUserPayload(newUser, isAdmin)
            });
        }

        // 2. INICIO DE SESIÓN
        if (action === 'login' && req.method === 'POST') {
            const { email, password } = req.body || {};
            if (!email || !password) {
                return res.status(400).json({ error: 'Email y contraseña requeridos' });
            }
            const cleanEmail = email.trim().toLowerCase();
            const user = await usersCol.findOne({ email: cleanEmail });
            if (!user) {
                return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
            }

            const isAdmin = ADMIN_EMAILS.includes(cleanEmail) || user.role === 'admin';
            const role = isAdmin ? 'admin' : (user.role || 'creator');

            await usersCol.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date(), role } });
            user.role = role;

            const token = jwt.sign(
                { userId: user._id.toString(), email: cleanEmail, role, name: user.name || cleanEmail.split('@')[0] },
                JWT_SECRET,
                { expiresIn: '30d' }
            );

            return res.status(200).json({
                success: true,
                token,
                user: formatUserPayload(user, isAdmin)
            });
        }

        // 3. VERIFICAR SESIÓN ACTIVA (ME)
        if (action === 'me') {
            const decoded = verifyUserToken(req);
            if (!decoded) {
                return res.status(401).json({ error: 'Token no proporcionado o expirado' });
            }

            const user = await usersCol.findOne({ _id: new ObjectId(decoded.userId) });
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            return res.status(200).json({
                success: true,
                user: formatUserPayload(user)
            });
        }

        // 4. OBTENER / GUARDAR CONFIGURACIÓN, CLAVES API Y ASSETS PERSONALIZADOS DEL USUARIO
        if (action === 'settings') {
            const decoded = verifyUserToken(req);
            if (!decoded) {
                return res.status(401).json({ error: 'Inicia sesión para guardar configuración en tu cuenta' });
            }

            const userId = new ObjectId(decoded.userId);
            const user = await usersCol.findOne({ _id: userId });
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            if (req.method === 'GET') {
                return res.status(200).json({
                    success: true,
                    settings: user.settings || {},
                    customAssets: Array.isArray(user.customAssets) ? user.customAssets : []
                });
            }

            if (req.method === 'POST') {
                const { settings, name, addCustomAsset, removeCustomAssetUrl } = req.body || {};
                const mergedSettings = {
                    ...(user.settings || {}),
                    ...sanitizeSettings(settings)
                };

                let customAssets = Array.isArray(user.customAssets) ? [...user.customAssets] : [];
                if (addCustomAsset && addCustomAsset.url) {
                    const exists = customAssets.some(a => a.url === addCustomAsset.url);
                    if (!exists) {
                        customAssets.unshift({
                            label: String(addCustomAsset.label || 'Recurso subido').slice(0, 80),
                            url: String(addCustomAsset.url),
                            category: String(addCustomAsset.category || 'mis_subidas'),
                            createdAt: new Date().toISOString()
                        });
                        customAssets = customAssets.slice(0, 120);
                    }
                }
                if (removeCustomAssetUrl) {
                    customAssets = customAssets.filter(a => a.url !== removeCustomAssetUrl);
                }

                const updateFields = {
                    settings: mergedSettings,
                    customAssets,
                    updatedAt: new Date()
                };
                if (name && typeof name === 'string' && name.trim()) {
                    updateFields.name = name.trim().slice(0, 60);
                }

                await usersCol.updateOne({ _id: userId }, { $set: updateFields });
                const updated = await usersCol.findOne({ _id: userId });
                return res.status(200).json({
                    success: true,
                    message: 'Configuración y claves guardadas en tu cuenta',
                    user: formatUserPayload(updated),
                    settings: updated.settings || {},
                    customAssets: updated.customAssets || []
                });
            }
        }

        return res.status(400).json({ error: 'Acción no válida' });

    } catch (err) {
        console.error('Error en /api/auth:', err);
        return res.status(500).json({ error: err.message || 'Error del servidor de base de datos' });
    }
};
