// api/azure-tts.js - Síntesis de Voz con Azure AI Neural Voices + Azure OpenAI Speech + Cloudinary
const { getUserSettingsFromRequest, getAzureConfig, buildAzureCandidateUrls, uploadToCloudinary } = require('./_shared');

const AZURE_NEURAL_VOICES = [
    { id: 'es-DO-EmilioNeural', name: '🇩🇴 Emilio (Rep. Dominicana - Masculina Pro)', lang: 'es-DO' },
    { id: 'es-DO-RamonaNeural', name: '🇩🇴 Ramona (Rep. Dominicana - Femenina Clara)', lang: 'es-DO' },
    { id: 'es-MX-JorgeNeural', name: '🇲🇽 Jorge (México - Narrador Viral)', lang: 'es-MX' },
    { id: 'es-MX-DaliaNeural', name: '🇲🇽 Dalia (México - Dinámica)', lang: 'es-MX' },
    { id: 'es-CO-GonzaloNeural', name: '🇨🇴 Gonzalo (Colombia - Documental)', lang: 'es-CO' },
    { id: 'es-CO-SalomeNeural', name: '🇨🇴 Salomé (Colombia - Cálida)', lang: 'es-CO' },
    { id: 'es-US-AlonsoNeural', name: '🇺🇸 Alonso (Español Neutro USA)', lang: 'es-US' },
    { id: 'es-US-PalomaNeural', name: '🇺🇸 Paloma (Español Neutro USA)', lang: 'es-US' },
    { id: 'es-ES-AlvaroNeural', name: '🇪🇸 Álvaro (España - Documental)', lang: 'es-ES' },
    { id: 'es-ES-ElviraNeural', name: '🇪🇸 Elvira (España - Comercial)', lang: 'es-ES' },
    { id: 'es-AR-TomasNeural', name: '🇦🇷 Tomás (Argentina)', lang: 'es-AR' },
    { id: 'es-AR-ElenaNeural', name: '🇦🇷 Elena (Argentina)', lang: 'es-AR' },
    { id: 'en-US-AndrewMultilingualNeural', name: '🌎 Andrew Multilingual (EN/ES)', lang: 'en-US' },
    { id: 'en-US-AvaMultilingualNeural', name: '🌎 Ava Multilingual (EN/ES)', lang: 'en-US' }
];

function escapeXml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function inferRegionFromEndpoint(endpointRaw) {
    const str = String(endpointRaw || '').toLowerCase();
    const m = str.match(/https?:\/\/(eastus2|eastus|westus2|westus3|westus|centralus|southcentralus|northcentralus|brazilsouth|westeurope|northeurope|swedencentral|uksouth|francecentral|japaneast|australiaeast|southeastasia)\./);
    return m ? m[1] : '';
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Guest-Id');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const userSettings = await getUserSettingsFromRequest(req);
    const body = req.body || {};
    const azConfig = getAzureConfig(body, userSettings);

    if (req.method === 'GET') {
        const inferredRegion = azConfig.speechRegion || inferRegionFromEndpoint(azConfig.endpoint);
        return res.status(200).json({
            success: true,
            configured: Boolean((azConfig.speechKey && inferredRegion) || (azConfig.apiKey && inferredRegion) || (azConfig.endpoint && azConfig.apiKey && azConfig.ttsDeployment)),
            hasDedicatedSpeechKey: Boolean(azConfig.speechKey),
            region: inferredRegion || '',
            ttsDeployment: azConfig.ttsDeployment || '',
            voices: AZURE_NEURAL_VOICES
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Usa GET o POST.' });
    }

    const {
        text,
        voiceName = 'es-DO-EmilioNeural',
        rate = 1.08,
        pitch = 1.0,
        uploadToCdn = true
    } = body;

    if (!text || !String(text).trim()) {
        return res.status(400).json({ error: 'Falta el texto para narrar con Azure.' });
    }

    const cleanText = String(text).trim();
    const voiceMeta = AZURE_NEURAL_VOICES.find(v => v.id === voiceName);
    const langTag = voiceMeta ? voiceMeta.lang : (voiceName.split('-').slice(0, 2).join('-') || 'es-DO');

    let audioBuffer = null;
    let lastError = '';

    // 1. Azure AI Speech Service (Neural SSML Voices)
    const region = azConfig.speechRegion || inferRegionFromEndpoint(azConfig.endpoint);
    const keysToTry = [azConfig.speechKey, azConfig.apiKey].filter(Boolean);

    if (region && keysToTry.length > 0) {
        const pctRate = Math.round(((parseFloat(rate) || 1.0) - 1.0) * 100);
        const rateStr = `${pctRate >= 0 ? '+' : ''}${pctRate}%`;
        const pctPitch = Math.round(((parseFloat(pitch) || 1.0) - 1.0) * 50);
        const pitchStr = `${pctPitch >= 0 ? '+' : ''}${pctPitch}%`;

        const ssml = `<speak version='1.0' xml:lang='${langTag}'><voice xml:lang='${langTag}' name='${voiceName}'><prosody rate='${rateStr}' pitch='${pitchStr}'>${escapeXml(cleanText)}</prosody></voice></speak>`;

        for (const key of keysToTry) {
            try {
                const ttsRes = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
                    method: 'POST',
                    headers: {
                        'Ocp-Apim-Subscription-Key': key,
                        'Content-Type': 'application/ssml+xml',
                        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
                        'User-Agent': '2DClipStudio'
                    },
                    body: ssml
                });
                if (ttsRes.ok) {
                    audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
                    break;
                } else {
                    const txt = await ttsRes.text().catch(() => '');
                    lastError = `Azure Speech HTTP ${ttsRes.status}${txt ? ': ' + txt.slice(0, 120) : ''}`;
                }
            } catch (err) {
                lastError = err.message;
            }
        }
    }

    // 2. Fallback opcional a implementación Azure OpenAI Audio Speech (si el usuario desplegó gpt-4o-mini-tts / tts-1)
    if (!audioBuffer && azConfig.endpoint && azConfig.apiKey && azConfig.ttsDeployment) {
        const candidates = buildAzureCandidateUrls(azConfig.endpoint, azConfig.ttsDeployment, 'audio_speech');
        for (const candidate of candidates) {
            try {
                const payload = {
                    input: cleanText,
                    voice: 'alloy',
                    response_format: 'mp3',
                    speed: Math.max(0.5, Math.min(2.0, parseFloat(rate) || 1.0))
                };
                if (candidate.useModelField) payload.model = azConfig.ttsDeployment;
                const resp = await fetch(candidate.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': azConfig.apiKey,
                        'Authorization': `Bearer ${azConfig.apiKey}`
                    },
                    body: JSON.stringify(payload)
                });
                if (resp.ok) {
                    audioBuffer = Buffer.from(await resp.arrayBuffer());
                    break;
                } else {
                    lastError = `Azure OpenAI TTS HTTP ${resp.status}`;
                }
            } catch (err) {
                lastError = err.message;
            }
        }
    }

    if (!audioBuffer || audioBuffer.length < 100) {
        const guidance = !region
            ? 'Configura AZURE_SPEECH_KEY y AZURE_SPEECH_REGION (ej: eastus o eastus2) en Vercel o en "🔑 Claves API".'
            : (lastError || 'No se pudo generar el audio neural con Azure. Verifica AZURE_SPEECH_KEY y AZURE_SPEECH_REGION.');
        return res.status(400).json({ error: guidance, needsSpeechConfig: true });
    }

    const base64Audio = audioBuffer.toString('base64');
    const dataUri = `data:audio/mpeg;base64,${base64Audio}`;
    let audioUrl = dataUri;

    if (uploadToCdn) {
        try {
            const uploaded = await uploadToCloudinary(dataUri, 'audio', '2dclip_azure_voices');
            if (uploaded && uploaded.secure_url) audioUrl = uploaded.secure_url;
        } catch (e) {}
    }

    return res.status(200).json({
        success: true,
        provider: 'azure-tts',
        voiceName,
        audioUrl,
        audio_base64: base64Audio
    });
};

