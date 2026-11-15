// api/tts.js - Endpoint Serverless Universal (CommonJS + ESM) para Audio TTS en Español Nativo
// Compatible al 100% con Vercel Serverless Functions en Node.js 18/20 sin requerir package.json ESM.

async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { text, lang = 'es' } = req.query || {};

    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Falta el parámetro text' });
    }

    const cleanText = text.trim();

    // Función inteligente de división por oraciones / palabras (límite seguro: 150 caracteres)
    function splitTextToChunks(t, maxLen = 150) {
        if (t.length <= maxLen) return [t];
        const words = t.split(/\s+/);
        const chunks = [];
        let cur = '';

        for (const w of words) {
            const candidate = cur ? (cur + ' ' + w) : w;
            if (candidate.length <= maxLen) {
                cur = candidate;
            } else {
                if (cur) chunks.push(cur);
                cur = w;
            }
        }
        if (cur) chunks.push(cur);
        return chunks;
    }

    const chunks = splitTextToChunks(cleanText, 150);

    try {
        const buffers = [];
        for (const chunk of chunks) {
            const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
            const response = await fetch(googleTtsUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                console.warn(`Error en fragmento TTS (${response.status}):`, chunk);
                continue;
            }

            const ab = await response.arrayBuffer();
            buffers.push(Buffer.from(ab));
        }

        if (buffers.length === 0) {
            return res.status(502).json({ error: 'No se pudo generar audio para el texto proporcionado' });
        }

        const combinedAudio = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
        return res.status(200).send(combinedAudio);

    } catch (err) {
        console.error('Error general en /api/tts:', err);
        return res.status(500).json({ error: err.message || 'Error interno del servidor de voz' });
    }
}

module.exports = handler;
module.exports.default = handler;
