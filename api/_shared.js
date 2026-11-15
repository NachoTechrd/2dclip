// api/_shared.js - Utilidades compartidas de MongoDB Atlas, JWT, Cloudinary y Azure AI para 2DClip Studio
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

const DEFAULT_MONGO_URI = "mongodb+srv://nachotechrd_db_user:Ps1xrd8DPfPsGFNj@2dclip.cfditti.mongodb.net";
const DEFAULT_CLOUDINARY_URL = "cloudinary://518284149751299:_MHLBEU57YD2o4zpJP5QadYJU-c@vuddoaj2";
const JWT_SECRET = process.env.JWT_SECRET || 'antigravity_2dclip_jwt_secret_key_2026';
const ADMIN_EMAILS = (process.env.ADMIN || 'djnachord@gmail.com, nachotechrd@gmail.com')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

let cachedClient = null;
let cachedDb = null;

function initCloudinary() {
    const url = process.env.CLOUDINARY_URL || DEFAULT_CLOUDINARY_URL;
    const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (!match) throw new Error('Formato inválido de CLOUDINARY_URL');
    cloudinary.config({
        api_key: match[1],
        api_secret: match[2],
        cloud_name: match[3],
        secure: true
    });
    return cloudinary;
}

async function uploadToCloudinary(fileData, resourceType = 'auto', folder = '2dclip_assets') {
    const cld = initCloudinary();
    const uploadType = (resourceType === 'audio' || resourceType === 'voice') ? 'video' : resourceType;
    return cld.uploader.upload(fileData, {
        folder,
        resource_type: uploadType,
        overwrite: false
    });
}

function getAzureConfig(bodyOrHeaders = {}, userSettings = {}) {
    const pick = (...vals) => {
        for (const v of vals) {
            if (typeof v === 'string' && v.trim()) return v.trim().replace(/^["']|["']$/g, '');
        }
        return '';
    };
    const endpoint = pick(
        bodyOrHeaders.azureEndpoint,
        userSettings.azureOpenaiEndpoint,
        process.env.AZURE_OPENAI_ENDPOINT
    );
    const apiKey = pick(
        bodyOrHeaders.azureApiKey,
        userSettings.azureOpenaiApiKey,
        process.env.AZURE_OPENAI_API_KEY
    );
    const chatDeployment = pick(
        bodyOrHeaders.azureDeployment,
        userSettings.azureOpenaiDeployment,
        process.env.AZURE_OPENAI_DEPLOYMENT,
        'nt-2d-clip-gpt-5.6-sol-1'
    );
    const imageDeployment = pick(
        bodyOrHeaders.azureImageDeployment,
        userSettings.azureImageDeployment,
        process.env.AZURE_IMAGE_DEPLOYMENT,
        'gpt-image-2'
    );
    const speechKey = pick(
        bodyOrHeaders.azureSpeechKey,
        userSettings.azureSpeechKey,
        process.env.AZURE_SPEECH_KEY,
        process.env.AZURE_SPEECH_API_KEY
    );
    const speechRegion = pick(
        bodyOrHeaders.azureSpeechRegion,
        userSettings.azureSpeechRegion,
        process.env.AZURE_SPEECH_REGION,
        process.env.AZURE_REGION
    );
    const ttsDeployment = pick(
        bodyOrHeaders.azureTtsDeployment,
        userSettings.azureTtsDeployment,
        process.env.AZURE_TTS_DEPLOYMENT,
        process.env.AZURE_OPENAI_TTS_DEPLOYMENT
    );
    return { endpoint, apiKey, chatDeployment, imageDeployment, speechKey, speechRegion, ttsDeployment };
}

function buildAzureCandidateUrls(endpointRaw, deployment, kind = 'chat') {
    if (!endpointRaw) return [];
    let parsed;
    try {
        parsed = new URL(endpointRaw.startsWith('http') ? endpointRaw : `https://${endpointRaw}`);
    } catch (e) {
        return [];
    }
    const origin = parsed.origin;
    const cleanPath = parsed.pathname.replace(/\/+$/, '');
    const encDep = encodeURIComponent(deployment || '');
    const isV1Endpoint = cleanPath.includes('/openai/v1');
    const urls = [];

    if (kind === 'chat') {
        if (cleanPath.includes('/chat/completions')) {
            urls.push({ url: parsed.toString(), useModelField: false });
        }
        if (isV1Endpoint) {
            urls.push({ url: `${origin}/openai/v1/chat/completions`, useModelField: true });
        }
        if (cleanPath.includes('/api/projects/')) {
            urls.push({ url: `${origin}${cleanPath}/openai/deployments/${encDep}/chat/completions?api-version=2025-01-01-preview`, useModelField: false });
            urls.push({ url: `${origin}${cleanPath}/models/chat/completions?api-version=2024-05-01-preview`, useModelField: true });
        }
        urls.push({ url: `${origin}/openai/deployments/${encDep}/chat/completions?api-version=2025-01-01-preview`, useModelField: false });
        urls.push({ url: `${origin}/openai/deployments/${encDep}/chat/completions?api-version=2024-12-01-preview`, useModelField: false });
        urls.push({ url: `${origin}/openai/deployments/${encDep}/chat/completions?api-version=2024-10-21`, useModelField: false });
        if (!isV1Endpoint) {
            urls.push({ url: `${origin}/openai/v1/chat/completions`, useModelField: true });
        }
        urls.push({ url: `${origin}/models/chat/completions?api-version=2024-05-01-preview`, useModelField: true });
    } else if (kind === 'image') {
        if (cleanPath.includes('/images/generations')) {
            urls.push({ url: parsed.toString(), useModelField: false });
        }
        if (isV1Endpoint) {
            urls.push({ url: `${origin}/openai/v1/images/generations`, useModelField: true });
        }
        if (cleanPath.includes('/api/projects/')) {
            urls.push({ url: `${origin}${cleanPath}/openai/deployments/${encDep}/images/generations?api-version=2025-04-01-preview`, useModelField: false });
        }
        urls.push({ url: `${origin}/openai/deployments/${encDep}/images/generations?api-version=2025-04-01-preview`, useModelField: false });
        urls.push({ url: `${origin}/openai/deployments/${encDep}/images/generations?api-version=2024-12-01-preview`, useModelField: false });
        urls.push({ url: `${origin}/openai/deployments/${encDep}/images/generations?api-version=2024-02-01`, useModelField: false });
        if (!isV1Endpoint) {
            urls.push({ url: `${origin}/openai/v1/images/generations`, useModelField: true });
        }
    } else if (kind === 'audio_speech') {
        if (isV1Endpoint) {
            urls.push({ url: `${origin}/openai/v1/audio/speech`, useModelField: true });
        }
        urls.push({ url: `${origin}/openai/deployments/${encDep}/audio/speech?api-version=2025-03-01-preview`, useModelField: false });
        if (!isV1Endpoint) {
            urls.push({ url: `${origin}/openai/v1/audio/speech`, useModelField: true });
        }
    }
    return urls;
}

const CANONICAL_SVG_MAP = {
    'perro_caminando_animado.svg': 'ELEMENTOS/pack_animados_rutas_y_caminatas/animados/perro_caminando_animado.svg',
    'persona_caminando_ciclo.svg': 'ELEMENTOS/pack_animados_rutas_y_caminatas/animados/persona_caminando_ciclo.svg',
    'ruta_mapa_vuelo_gps.svg': 'ELEMENTOS/pack_animados_rutas_y_caminatas/animados/ruta_mapa_vuelo_gps.svg',
    'agente_robot_ia.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/agente_robot_ia.svg',
    'banquero_traje_corbata.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/banquero_traje_corbata.svg',
    'dueno_negocio_estresado.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/dueno_negocio_estresado.svg',
    'emprendedor_exito.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/emprendedor_exito.svg',
    'multitud_ciudadanos.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/multitud_ciudadanos.svg',
    'tecnico_experto_lentes.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/tecnico_experto_lentes.svg',
    'candado_seguridad_cyber.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/candado_seguridad_cyber.svg',
    'celular_whatsapp_venta.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/celular_whatsapp_venta.svg',
    'cerebro_neuronal_3d.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/cerebro_neuronal_3d.svg',
    'cohete_despegue_pro.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/cohete_despegue_pro.svg',
    'fajo_billetes_100.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/fajo_billetes_100.svg',
    'grafica_crecimiento_verde.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/grafica_crecimiento_verde.svg',
    'lingotes_oro_3d.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/lingotes_oro_3d.svg',
    'lupa_forense_detective.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/lupa_forense_detective.svg',
    'mazo_juez_sentencia.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/mazo_juez_sentencia.svg',
    'placa_chip_micro_soldadura.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/placa_chip_micro_soldadura.svg',
    'recibo_la_cuenta.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/recibo_la_cuenta.svg',
    'rejas_carcel_prision.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/rejas_carcel_prision.svg',
    'trofeo_exito_oro.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/trofeo_exito_oro.svg',
    'banco_central_clasico.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/edificios/banco_central_clasico.svg',
    'servidor_datacenter_ia.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/edificios/servidor_datacenter_ia.svg',
    'tienda_comercio_pos.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/edificios/tienda_comercio_pos.svg',
    'torre_corporativa_25d.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/edificios/torre_corporativa_25d.svg',
    'tribunal_corte_justicia.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/edificios/tribunal_corte_justicia.svg',
    'sello_estafa_peligro.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/sellos/sello_estafa_peligro.svg',
    'sello_mito_falso.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/sellos/sello_mito_falso.svg',
    'sello_tu_pagas.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/sellos/sello_tu_pagas.svg',
    'sello_verificado_pro.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/sellos/sello_verificado_pro.svg',
    'fachada_tienda_moderna.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/edificios/tienda_comercio_pos.svg',
    'sello_aprobado_verificado.svg': 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/sellos/sello_verificado_pro.svg'
};

const GRAPHIC_TYPE_ALIASES = {
    saas_pos_store_sync: 'posent_terminal',
    saas_ai_robot_operator: 'ai_brain_workflow',
    saas_analytics_dashboard: 'saas_growth_chart_ticker'
};

function resolveCanonicalAssetPath(rawPath) {
    if (!rawPath || typeof rawPath !== 'string') return '';
    const trimmed = rawPath.trim();
    if (!trimmed) return '';
    if (/^(data:|blob:|https?:\/\/)/i.test(trimmed)) return trimmed;
    const base = trimmed.split('/').pop().split('\\').pop().toLowerCase();
    if (CANONICAL_SVG_MAP[base]) return CANONICAL_SVG_MAP[base];
    return trimmed;
}

function normalizeAiScriptPayload(payload) {
    if (!payload || typeof payload !== 'object') return payload;
    if (Array.isArray(payload.scenes)) {
        payload.scenes = payload.scenes.map((sc) => {
            if (!sc || typeof sc !== 'object') return sc;
            const out = { ...sc };
            if (typeof out.duration === 'number' && out.duration > 0 && out.duration < 100) {
                out.duration = Math.round(out.duration * 1000);
            } else if (!out.duration || typeof out.duration !== 'number') {
                out.duration = 4500;
            }
            if (out.graphicType && GRAPHIC_TYPE_ALIASES[out.graphicType]) {
                out.graphicType = GRAPHIC_TYPE_ALIASES[out.graphicType];
            }
            if (out.overlayImg1) out.overlayImg1 = resolveCanonicalAssetPath(out.overlayImg1);
            if (out.overlayImg2) out.overlayImg2 = resolveCanonicalAssetPath(out.overlayImg2);
            return out;
        });
    }
    return payload;
}

async function getDatabase() {
    if (cachedDb) return cachedDb;
    let uri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;
    if (!uri.includes('retryWrites')) {
        uri += (uri.includes('?') ? '&' : '?') + 'retryWrites=true&w=majority';
    }
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    await client.connect();
    cachedClient = client;
    cachedDb = client.db('2dclip_studio');
    return cachedDb;
}

function verifyUserToken(req) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return null;
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
}

async function getUserSettingsFromRequest(req) {
    const decoded = verifyUserToken(req);
    if (!decoded || !decoded.userId) return {};
    try {
        const db = await getDatabase();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(decoded.userId) },
            { projection: { settings: 1 } }
        );
        return (user && user.settings) || {};
    } catch (e) {
        return {};
    }
}

module.exports = {
    ObjectId,
    JWT_SECRET,
    ADMIN_EMAILS,
    getDatabase,
    verifyUserToken,
    getUserSettingsFromRequest,
    uploadToCloudinary,
    getAzureConfig,
    buildAzureCandidateUrls,
    normalizeAiScriptPayload,
    resolveCanonicalAssetPath
};
