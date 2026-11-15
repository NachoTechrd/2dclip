// api/azure-image.js - Generación de Ilustraciones 2.5D y Fondos con Azure OpenAI (gpt-image-2) + Cloudinary
const { getUserSettingsFromRequest, getAzureConfig, buildAzureCandidateUrls, uploadToCloudinary } = require('./_shared');

function buildStyledImagePrompt(userPrompt, stylePreset = 'vector25d') {
    const clean = String(userPrompt || '').trim();
    const styles = {
        vector25d: 'Clean modern 2.5D stylized vector digital illustration, vibrant depth, soft volumetric lighting, crisp edges, isolated composition, dark slate atmospheric backdrop, NO text, NO letters, NO watermarks.',
        backdrop916: 'Cinematic vertical 9:16 stylized environment scene background, dramatic volumetric lighting, depth of field, rich color grading, clean composition leaving space in center for foreground graphics, NO text.',
        isometric_saas: 'Polished isometric 3D SaaS tech diorama icon illustration, glowing emerald and cyan glassmorphism accents, studio dark background, crisp glossy vector render, NO text.',
        sticker_prop: 'Bold 2.5D glossy studio object prop centered cleanly against a deep dark vignette background, expressive silhouette, vibrant rim light, NO text.'
    };
    const suffix = styles[stylePreset] || styles.vector25d;
    return `${clean}. ${suffix}`;
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Guest-Id');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido. Usa POST.' });

    const userSettings = await getUserSettingsFromRequest(req);
    const body = req.body || {};
    const azConfig = getAzureConfig(body, userSettings);

    if (!azConfig.endpoint || !azConfig.apiKey) {
        return res.status(400).json({
            error: 'Falta configurar AZURE_OPENAI_ENDPOINT o AZURE_OPENAI_API_KEY en Vercel o Claves API.'
        });
    }

    const { prompt, style = 'vector25d', size = '1024x1536', quality = 'medium' } = body;
    if (!prompt || !String(prompt).trim()) {
        return res.status(400).json({ error: 'Describe la imagen que deseas generar.' });
    }

    const styledPrompt = buildStyledImagePrompt(prompt, style);
    const candidates = buildAzureCandidateUrls(azConfig.endpoint, azConfig.imageDeployment, 'image');
    if (candidates.length === 0) {
        return res.status(400).json({ error: 'AZURE_OPENAI_ENDPOINT inválido.' });
    }

    let generatedItem = null;
    let usedEndpoint = '';
    let lastError = '';

    for (const candidate of candidates) {
        const sizeCandidates = size === '1024x1536' ? ['1024x1536', '1024x1792', '1024x1024'] : [size, '1024x1024'];
        const uniqueSizes = [...new Set(sizeCandidates)];

        for (const trySize of uniqueSizes) {
            const payloadVariants = [
                { prompt: styledPrompt, n: 1, size: trySize, quality },
                { prompt: styledPrompt, n: 1, size: trySize }
            ];

            for (const pVar of payloadVariants) {
                if (candidate.useModelField && azConfig.imageDeployment) {
                    pVar.model = azConfig.imageDeployment;
                }
                try {
                    const resp = await fetch(candidate.url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'api-key': azConfig.apiKey,
                            'Authorization': `Bearer ${azConfig.apiKey}`
                        },
                        body: JSON.stringify(pVar)
                    });

                    if (resp.ok) {
                        const data = await resp.json().catch(() => null);
                        const item = data?.data?.[0];
                        if (item && (item.b64_json || item.url)) {
                            generatedItem = item;
                            usedEndpoint = candidate.url;
                            break;
                        }
                    } else {
                        const errJson = await resp.json().catch(() => ({}));
                        lastError = errJson.error?.message || `HTTP ${resp.status}`;
                        if (resp.status === 401 || resp.status === 403) {
                            return res.status(resp.status).json({ error: `Azure rechazó la clave (${resp.status}): ${lastError}` });
                        }
                        if (resp.status === 404) break;
                    }
                } catch (err) {
                    lastError = err.message;
                }
            }
            if (generatedItem) break;
        }
        if (generatedItem) break;
    }

    if (!generatedItem) {
        return res.status(502).json({
            error: lastError || `No se pudo generar la imagen con ${azConfig.imageDeployment}.`
        });
    }

    try {
        const sourceFile = generatedItem.b64_json
            ? `data:image/png;base64,${generatedItem.b64_json}`
            : generatedItem.url;

        let finalUrl = sourceFile;
        try {
            const uploaded = await uploadToCloudinary(sourceFile, 'image', '2dclip_azure_ai');
            if (uploaded && uploaded.secure_url) {
                finalUrl = uploaded.secure_url;
            }
        } catch (cldErr) {
            console.warn('Aviso: no se pudo subir imagen Azure a Cloudinary, devolviendo resultado directo:', cldErr.message);
            if (generatedItem.url) finalUrl = generatedItem.url;
        }

        return res.status(200).json({
            success: true,
            url: finalUrl,
            deployment: azConfig.imageDeployment,
            endpoint: usedEndpoint
        });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error procesando imagen generada.' });
    }
};
module.exports.config = { maxDuration: 60 };

