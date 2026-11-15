// api/upload.js - Subida Universal de Audios e Imágenes a Cloudinary
const cloudinary = require('cloudinary').v2;

const DEFAULT_CLOUDINARY_URL = "cloudinary://518284149751299:_MHLBEU57YD2o4zpJP5QadYJU-c@vuddoaj2";

function initCloudinary() {
    const url = process.env.CLOUDINARY_URL || DEFAULT_CLOUDINARY_URL;
    const regex = /cloudinary:\/\/([^:]+):([^@]+)@(.+)/;
    const match = url.match(regex);
    if (!match) throw new Error('Formato inválido de CLOUDINARY_URL');
    cloudinary.config({
        api_key: match[1],
        api_secret: match[2],
        cloud_name: match[3],
        secure: true
    });
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
    }

    try {
        initCloudinary();
        const { file, resource_type = 'auto', folder = '2dclip_assets' } = req.body || {};

        if (!file) {
            return res.status(400).json({ error: 'Falta el archivo en base64 o URL (file)' });
        }

        const uploadType = (resource_type === 'audio' || resource_type === 'voice') ? 'video' : resource_type;

        const result = await cloudinary.uploader.upload(file, {
            folder,
            resource_type: uploadType,
            overwrite: false
        });

        return res.status(200).json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            duration: result.duration || 0,
            format: result.format,
            bytes: result.bytes
        });

    } catch (err) {
        console.error('Error en /api/upload:', err);
        return res.status(500).json({ error: err.message || 'Error al subir a Cloudinary' });
    }
};
