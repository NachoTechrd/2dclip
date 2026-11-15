// api/gemini.js - Generador de Guiones Virales 2D Cinematográficos con Gemini AI
const { getUserSettingsFromRequest, normalizeAiScriptPayload } = require('./_shared');

const VALID_GEMINI_MODELS = [
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3-flash-preview',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite'
];

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Gemini-Key');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const body = req.body || {};
    let apiKey = String(
        body.apiKey ||
        req.headers['x-gemini-key'] ||
        ''
    ).trim();

    if (!apiKey) {
        const savedSettings = await getUserSettingsFromRequest(req);
        if (savedSettings.geminiApiKey) {
            apiKey = String(savedSettings.geminiApiKey).trim();
        }
    }

    if (!apiKey) {
        apiKey = String(process.env.GEMINI_API_KEY || process.env.gemini_api || '').trim();
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            configured: Boolean(apiKey),
            models: VALID_GEMINI_MODELS
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Usa GET o POST.' });
    }

    if (!apiKey) {
        return res.status(400).json({
            error: 'Falta tu clave API de Gemini. Configura GEMINI_API_KEY en Vercel o ingrésala en 🔑 Claves API.'
        });
    }

    // Modo prueba rápida de clave
    if (body.action === 'test') {
        try {
            const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
            const data = await listResp.json();
            if (!listResp.ok) {
                return res.status(listResp.status).json({
                    error: (data && data.error && data.error.message) || 'Clave API inválida'
                });
            }
            const models = (data.models || [])
                .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
                .map(m => (m.name || '').replace('models/', ''));
            return res.status(200).json({ success: true, models });
        } catch (err) {
            return res.status(500).json({ error: err.message || 'Error verificando clave Gemini' });
        }
    }

    const {
        prompt = '',
        topic = 'general',
        brand = '@nachotechrd',
        domain = 'nakkio.com',
        preferredModel = ''
    } = body;

    if (!String(prompt || topic).trim()) {
        return res.status(400).json({ error: 'Describe el tema o prompt del video.' });
    }

    const systemInstruction = `Eres un director creativo y guionista experto en videos virales 2D estilo documental dinámico (Reels, TikTok, Shorts) con ritmo en 3 compases por escena (Beat 1 Impacto -> Beat 2 Desarrollo -> Beat 3 Clímax/Prueba).
Crea un guión de 4 a 5 escenas altamente visuales para el tema: "${topic || prompt}".
Marca: ${brand}. Dominio: ${domain}.

REGLAS ESTRICTAS DE DISEÑO Y AUDIO:
1. Cada escena debe variar el graphicType, environment, cameraMotion, transition y los sonidos en los 3 compases (sfx, sfxBeat2, sfxBeat3).
2. Usa estas opciones válidas de graphicType:
   saas_iphone_whatsapp_flow, posent_terminal, ai_brain_workflow, saas_growth_chart_ticker, saas_ios_toggle_action, saas_3d_product_fanout, bacteria_microscope_25d, eye_blindspot_test_25d, viral_hook_scoreboard_25d, gold_wealth_pyramid, checklist_pro, strike_cards, comparison_split, clock_time_warp, dual_image_showcase, nt_vault_hub, modular_building_hole, modular_receipt_stamp, cta_conversion, airplane_aerodynamics, smartphone_radio_waves
3. Usa estas opciones válidas de environment:
   env_cyber_city, env_ai_lab, env_saas_studio, env_saas_tech, env_saas_retail, env_saas_gold, env_studio_ringlight, env_store_business, env_door_room, env_tv_livingroom, env_brain_xray, env_earth_magma, env_ocean_nature, env_tropical_beach, env_radial_fire, env_dark_grid
4. Usa estas opciones de cameraMotion:
   cam-dynamic-push, cam-zoom-in, cam-zoom-out, cam-snap-zoom, cam-dutch-tilt, cam-pan-right, cam-whip-pan, cam-tilt-up, cam-impact-shake
5. Usa estas opciones de transition:
   trans-zoom-burst, trans-slide-left, trans-flash-wipe, trans-glitch, trans-crossfade
6. Para sfx / sfxBeat2 / sfxBeat3, alterna efectos reales de archivo o sintetizados:
   - Archivos reales: "FXS/vine boom.mp3", "FXS/whoosh.mp3", "FXS/pop 2.mp3", "FXS/cash.mp3", "FXS/coin.mp3", "FXS/punch.mp3", "FXS/transition.mp3", "FXS/sudden-suspense.mp3"
   - Sintetizados: "impact", "whoosh", "pop", "ding", "cash", "alert", "cyber"
7. Opcionalmente asigna a overlayImg1 y overlayImg2 rutas reales del pack de ilustraciones:
   "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/agente_robot_ia.svg",
   "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/dueno_negocio_estresado.svg",
   "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/emprendedor_exito.svg",
   "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/fajo_billetes_100.svg",
   "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/celular_whatsapp_venta.svg",
   "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/cohete_despegue_pro.svg",
   "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/cerebro_neuronal_3d.svg",
   "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/grafica_crecimiento_verde.svg",
   "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/candado_seguridad_cyber.svg",
   "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/edificios/banco_central_clasico.svg",
   "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/edificios/tienda_comercio_pos.svg",
   "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/lupa_forense_detective.svg",
   "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/sellos/sello_mito_falso.svg",
   "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/sellos/sello_estafa_peligro.svg"

Devuelve EXCLUSIVAMENTE un objeto JSON válido con este formato (duration SIEMPRE en milisegundos, ej. 4500):
{
  "title": "Título viral corto",
  "domain": "${domain}",
  "brand": "${brand}",
  "scenes": [
    {
      "duration": 4500,
      "bannerTop": "GANCHO CORTO EN MAYÚSCULAS",
      "bannerHighlight": "FRASE CLAVE IMPACTANTE",
      "bottomRibbon": "Dato clave o llamada de cierre",
      "timerBadge": "01 · GANCHO",
      "script": "Narración hablada natural, directa y magnética en español (14 a 24 palabras).",
      "graphicType": "ai_brain_workflow",
      "environment": "env_cyber_city",
      "cameraMotion": "cam-dynamic-push",
      "transition": "trans-zoom-burst",
      "headlineColor": "#facc15",
      "reactionEmoji": "🔥",
      "sfx": "FXS/vine boom.mp3",
      "sfxBeat2": "FXS/whoosh.mp3",
      "sfxBeat3": "FXS/pop 2.mp3",
      "overlayImg1": "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/agente_robot_ia.svg",
      "overlayImg2": "",
      "stampText": "¡VERIFICADO!",
      "card1": "Dato 1 corto",
      "card2": "Dato 2 corto",
      "card3": "Dato 3 corto"
    }
  ]
}`;

    const candidateModels = [];
    if (preferredModel && typeof preferredModel === 'string') {
        candidateModels.push(preferredModel.replace(/^models\//, '').trim());
    }
    for (const m of VALID_GEMINI_MODELS) {
        if (!candidateModels.includes(m)) candidateModels.push(m);
    }

    let lastError = 'No se pudo conectar con Gemini.';
    let lastStatus = 500;

    for (const modelName of candidateModels) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000);
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;
            const resp = await fetch(url, {
                method: 'POST',
                signal: controller.signal,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${systemInstruction}\n\nInstrucción del usuario: ${prompt || topic}` }]
                    }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.75
                    }
                })
            });

            if (!resp.ok) {
                const errText = await resp.text();
                lastStatus = resp.status;
                lastError = errText;
                // Si el modelo no existe o está deprecado, probar el siguiente modelo
                if (resp.status === 404 || errText.includes('not found') || errText.includes('not supported') || errText.includes('no longer available')) {
                    continue;
                }
                // Si es error de autenticación/clave inválida, detener inmediatamente
                if (resp.status === 400 || resp.status === 401 || resp.status === 403) {
                    let msg = errText;
                    try { msg = JSON.parse(errText)?.error?.message || msg; } catch (e) {}
                    return res.status(resp.status).json({ error: 'Error de clave/permiso Gemini: ' + msg });
                }
                continue;
            }

            const data = await resp.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) {
                lastError = 'Gemini devolvió una respuesta vacía.';
                continue;
            }

            const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
            const parsed = normalizeAiScriptPayload(JSON.parse(cleanJson));
            return res.status(200).json({
                success: true,
                model: modelName,
                script: parsed,
                config: parsed
            });
        } catch (err) {
            lastError = err.name === 'AbortError' ? `Tiempo agotado en ${modelName}` : (err.message || 'Error de red/JSON en Gemini');
        } finally {
            clearTimeout(timeoutId);
        }
    }

    return res.status(lastStatus || 500).json({
        error: 'Error de Gemini: ' + lastError
    });
};
module.exports.config = { maxDuration: 60 };
