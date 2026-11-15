// api/elevenlabs.js - Generador de Voz Hiper-Realista con ElevenLabs + Timestamps + Cloudinary
const { getUserSettingsFromRequest, uploadToCloudinary } = require('./_shared');

async function resolveElevenLabsKey(req) {
    const headerKey = String(req.headers['xi-api-key'] || '').trim();
    if (headerKey) return headerKey;

    const bodyKey = String((req.body && req.body.apiKey) || '').trim();
    if (bodyKey) return bodyKey;

    const saved = await getUserSettingsFromRequest(req);
    if (saved.elevenlabsApiKey) return String(saved.elevenlabsApiKey).trim();

    return String(process.env.ELEVENLABS_API_KEY || process.env.elevenlabs || '').trim();
}

const CURATED_ELEVEN_VOICES = [
    { voice_id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie / Adam (Documental Viral)' },
    { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Narrador Cinematográfico)' },
    { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella / Sofía (Dinámica Reels)' },
    { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Autoridad / Negocios)' },
    { voice_id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh (Storytelling Profundo)' }
];

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Xi-Api-Key');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const apiKey = await resolveElevenLabsKey(req);

    // Chequeo rápido de estado del servidor (sin requerir key en cliente)
    if (req.method === 'GET' && req.query && req.query.action === 'status') {
        return res.status(200).json({
            success: true,
            configured: Boolean(apiKey),
            voicesCount: CURATED_ELEVEN_VOICES.length
        });
    }

    if (!apiKey) {
        return res.status(400).json({
            error: 'Falta tu clave API de ElevenLabs. Configúrala en Vercel o ingrésala en 🔑 Claves API.'
        });
    }

    // Listar voces disponibles (con fallback curado si la clave tiene solo permisos de TTS)
    if (req.method === 'GET') {
        try {
            const resp = await fetch('https://api.elevenlabs.io/v1/voices', {
                headers: { 'xi-api-key': apiKey }
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                const detailMsg = String((data && data.detail && (data.detail.message || data.detail)) || '');
                if (resp.status === 401 && /missing_permissions|voices_read/i.test(detailMsg)) {
                    return res.status(200).json({
                        voices: CURATED_ELEVEN_VOICES,
                        fallbackVoices: true,
                        note: 'Clave con permiso TTS directo (lista curada activa).'
                    });
                }
                return res.status(resp.status).json({
                    error: detailMsg || 'Error consultando voces de ElevenLabs'
                });
            }
            return res.status(200).json(data);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    // Generar voz (opcionalmente con timestamps) y subir a Cloudinary
    if (req.method === 'POST') {
        const {
            text,
            voiceId = 'IKne3meq5aSn9XLyUdCD',
            modelId = 'eleven_multilingual_v2',
            withTimestamps = false,
            voiceSettings = {}
        } = req.body || {};

        if (!text || !String(text).trim()) {
            return res.status(400).json({ error: 'Falta el texto a sintetizar' });
        }

        const vs = {
            stability: typeof voiceSettings.stability === 'number' ? voiceSettings.stability : 0.48,
            similarity_boost: typeof voiceSettings.similarity_boost === 'number' ? voiceSettings.similarity_boost : 0.85,
            style: typeof voiceSettings.style === 'number' ? voiceSettings.style : 0.2,
            use_speaker_boost: true
        };

        try {
            const endpointPath = withTimestamps
                ? `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=mp3_44100_128`
                : `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`;

            const ttsResp = await fetch(endpointPath, {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: String(text).trim(),
                    model_id: modelId,
                    voice_settings: vs
                })
            });

            if (!ttsResp.ok) {
                const errText = await ttsResp.text();
                return res.status(ttsResp.status).json({ error: 'Error de ElevenLabs: ' + errText });
            }

            let base64Raw = '';
            let alignment = null;

            if (withTimestamps) {
                const jsonPayload = await ttsResp.json();
                base64Raw = jsonPayload.audio_base64 || '';
                alignment = jsonPayload.alignment || jsonPayload.normalized_alignment || null;
            } else {
                const audioBuffer = Buffer.from(await ttsResp.arrayBuffer());
                base64Raw = audioBuffer.toString('base64');
            }

            const dataUri = `data:audio/mp3;base64,${base64Raw}`;
            let cloudinaryUrl = '';
            let duration = null;

            if (base64Raw) {
                try {
                    const up = await uploadToCloudinary(dataUri, 'video', '2dclip_voices');
                    if (up && up.secure_url) {
                        cloudinaryUrl = up.secure_url;
                        duration = up.duration;
                    }
                } catch (cErr) {
                    console.warn('Error subiendo audio a Cloudinary:', cErr.message);
                }
            }

            if (withTimestamps || cloudinaryUrl) {
                return res.status(200).json({
                    success: true,
                    url: cloudinaryUrl || dataUri,
                    audio_base64: cloudinaryUrl ? undefined : base64Raw,
                    alignment,
                    duration,
                    permanent: !!cloudinaryUrl
                });
            }

            const rawBuffer = Buffer.from(base64Raw, 'base64');
            res.setHeader('Content-Type', 'audio/mpeg');
            return res.status(200).send(rawBuffer);

        } catch (err) {
            console.error('Error en /api/elevenlabs:', err);
            return res.status(500).json({ error: err.message || 'Error generando voz' });
        }
    }

    return res.status(405).json({ error: 'Método no permitido' });
};
