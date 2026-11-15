// api/projects.js - Guardado y Sincronización de Proyectos Multidispositivo en MongoDB Atlas
const { ObjectId, getDatabase, verifyUserToken } = require('./_shared');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Guest-Id');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const db = await getDatabase();
        const projectsCol = db.collection('projects');
        const user = verifyUserToken(req);

        const rawGuest = String(req.headers['x-guest-id'] || req.query.guestId || '').trim();
        const guestId = rawGuest.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'guest_default';
        const ownerId = user ? user.userId : ('guest_' + guestId);

        // 1. LISTAR O CARGAR PROYECTO DEL USUARIO
        if (req.method === 'GET') {
            const { id } = req.query;

            if (id) {
                let idFilter;
                try {
                    idFilter = { _id: new ObjectId(id) };
                } catch (e) {
                    idFilter = { customId: id };
                }
                const project = await projectsCol.findOne({ ...idFilter, ownerId });
                if (!project) {
                    return res.status(404).json({ error: 'Proyecto no encontrado o sin permisos para acceder' });
                }
                return res.status(200).json({
                    success: true,
                    project: {
                        ...project,
                        id: project._id.toString()
                    }
                });
            }

            const projects = await projectsCol
                .find({ ownerId })
                .sort({ updatedAt: -1 })
                .limit(50)
                .toArray();

            return res.status(200).json({
                success: true,
                ownerType: user ? 'account' : 'guest',
                count: projects.length,
                projects: projects.map(p => ({
                    id: p._id.toString(),
                    title: p.title || 'Proyecto sin título',
                    domain: p.domain || 'nakkio.com',
                    brand: p.brand || '@nachotechrd',
                    sceneCount: (p.scenes && p.scenes.length) || 0,
                    thumbnail: (p.scenes && p.scenes[0] && p.scenes[0].overlayImg1) || '',
                    updatedAt: p.updatedAt,
                    createdAt: p.createdAt
                }))
            });
        }

        // 2. GUARDAR / ACTUALIZAR PROYECTO
        if (req.method === 'POST') {
            const body = req.body || {};
            const {
                id,
                title,
                domain,
                brand,
                priceTag,
                ctaText,
                scenes,
                highlightStyle,
                bgmTrack,
                bgmEnabled,
                bgmVolume,
                sfxEnabled,
                aspectRatio,
                settings
            } = body;

            if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
                return res.status(400).json({ error: 'El proyecto debe contener al menos 1 escena' });
            }

            const projectData = {
                ownerId,
                userEmail: user ? user.email : 'invitado',
                title: (title || scenes[0].bannerHighlight || 'Mi Video Viral').trim(),
                domain: domain || 'nakkio.com',
                brand: brand || '@nachotechrd',
                priceTag: priceTag || '',
                ctaText: ctaText || '',
                scenes,
                highlightStyle: highlightStyle || 'hl-box',
                bgmTrack: bgmTrack || 'downtempo',
                bgmEnabled: !!bgmEnabled,
                bgmVolume: typeof bgmVolume === 'number' ? bgmVolume : 0.35,
                sfxEnabled: sfxEnabled !== false,
                aspectRatio: aspectRatio || '9-16',
                settings: settings || {},
                updatedAt: new Date()
            };

            let resultId = id;
            let updatedExisting = false;

            if (id && String(id).length === 24) {
                try {
                    const upd = await projectsCol.updateOne(
                        { _id: new ObjectId(id), ownerId },
                        { $set: projectData }
                    );
                    if (upd.matchedCount > 0) {
                        updatedExisting = true;
                    }
                } catch (e) {
                    updatedExisting = false;
                }
            }

            if (!updatedExisting) {
                projectData.createdAt = new Date();
                const ins = await projectsCol.insertOne(projectData);
                resultId = ins.insertedId.toString();
            }

            return res.status(200).json({
                success: true,
                message: updatedExisting ? 'Proyecto actualizado en la nube' : 'Proyecto guardado en la nube con éxito',
                projectId: resultId,
                updatedAt: projectData.updatedAt
            });
        }

        // 3. ELIMINAR PROYECTO
        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Falta el ID del proyecto' });

            let query = {};
            try {
                query = { _id: new ObjectId(id), ownerId };
            } catch (e) {
                query = { customId: id, ownerId };
            }

            const del = await projectsCol.deleteOne(query);
            if (del.deletedCount === 0) {
                return res.status(404).json({ error: 'Proyecto no encontrado' });
            }
            return res.status(200).json({ success: true, message: 'Proyecto eliminado con éxito' });
        }

        return res.status(405).json({ error: 'Método no permitido' });

    } catch (err) {
        console.error('Error en /api/projects:', err);
        return res.status(500).json({ error: err.message || 'Error del servidor de proyectos' });
    }
};
