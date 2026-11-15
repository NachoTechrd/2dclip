// api/azure-ai.js - Generador y Mejorador de Guiones Virales con Azure AI Foundry / OpenAI (gpt-5.6-sol)
const { getUserSettingsFromRequest, getAzureConfig, buildAzureCandidateUrls, normalizeAiScriptPayload } = require('./_shared');

const DIRECTOR_RANDOM_TOPICS = {
    curiosidad: [
        'Por qué nunca puedes recordar el momento exacto en que te quedaste dormido',
        'El truco visual por el que tu cerebro borra tu propia nariz todo el día',
        'Por qué el agua fría hace ruido distinto al agua caliente cuando cae',
        'La ilusión del espejo que engaña a tu sistema nervioso en 5 segundos'
    ],
    ciencia: [
        'Por qué los aviones de 400 toneladas no se caen en medio del aire',
        'El verdadero motivo por el que el vidrio es sólido pero deja pasar la luz',
        'Por qué sientes sueño justo después de almorzar aunque dormiste 8 horas',
        'Cómo viaja tu mensaje de WhatsApp bajo el océano en milisegundos'
    ],
    tech: [
        'Qué ocurre dentro de tu celular en el instante en que presionas Enviar',
        'El mito peligroso de meter tu teléfono mojado en arroz y qué hacer realmente',
        'Cómo detectar cuando un cargador falso está quemando el chip de carga',
        'Por qué tu batería baja de 100% a 80% más lento que de 20% a 0%'
    ],
    negocio: [
        'Por qué el 80% de tus clientes preguntan precio por WhatsApp y desaparecen',
        'El error invisible en tu caja diaria que fuga ganancias sin que lo notes',
        'Cómo atender y cerrar pedidos automáticamente a las 2 de la mañana',
        'Por qué una página web lenta te hace perder más dinero que no tener redes'
    ],
    dinero: [
        'Por qué los diamantes cuestan fortunas cuando en realidad no son escasos',
        'La diferencia exacta entre ganar mucho dinero y construir activos reales',
        'Cómo el efecto señuelo en los precios te hace comprar el paquete caro',
        'Por qué ahorrar dinero inmóvil pierde valor frente a invertir en sistemas'
    ]
};

function pickDirectorTopic(rawTopic, category = 'random') {
    const clean = String(rawTopic || '').trim();
    if (clean && clean.toUpperCase() !== 'RANDOM') {
        return { topicUsed: clean, categoryUsed: category || 'custom' };
    }
    const keys = Object.keys(DIRECTOR_RANDOM_TOPICS);
    const chosenCat = (category && DIRECTOR_RANDOM_TOPICS[category])
        ? category
        : keys[Math.floor(Math.random() * keys.length)];
    const pool = DIRECTOR_RANDOM_TOPICS[chosenCat];
    const seed = pool[Math.floor(Math.random() * pool.length)];
    return { topicUsed: seed, categoryUsed: chosenCat };
}

function buildMasterSystemPrompt({ brand, domain, formula, highlightStyle, directorMode }) {
    return `Eres el Director Creativo Automático de Motion Graphics 2D y Guionista Viral #1 en Español (estilo Proyecto Atom, Kurzgesagt y Hormozi).
Genera guiones cortos 9:16 de ALTÍSIMA retención para TikTok, Instagram Reels y YouTube Shorts.

REGLAS DE ORO:
1. ORTOGRAFÍA Y NATURALIDAD PERFECTAS: Usa tildes (á, é, í, ó, ú, ñ) y signos de apertura (¿ ¡). Frases cortas, directas, con ritmo hablado y cero relleno robótico.
2. ESTRUCTURA EN 5 ESCENAS (20-24 segundos total):
   - Escena 1 (Gancho Psicológico <=10 palabras): Frase contraintuitiva o curiosidad irresistible en el primer segundo.
   - Escena 2 (Problema / Dolor Real): Escena visual impactante que ilustre el fallo o misterio.
   - Escena 3 (Mecanismo / Revelación IA o Ciencia): Cómo funciona realmente paso a paso.
   - Escena 4 (Prueba / Contraste / 3 Beneficios): Resultados tangibles o comparación Antes vs Ahora.
   - Escena 5 (CTA Magnético): Llamado a la acción claro hacia ${brand || '@nachotechrd'} y ${domain || 'nakkio.com'}.
3. FÓRMULA NARRATIVA SOLICITADA: ${formula || 'curiosidad_atom'}
4. ESTILO VISUAL Y SONORO DE 2DCLIP STUDIO (USA EXACTAMENTE ESTOS IDENTIFICADORES):
   - environment: "env_saas_studio", "env_saas_tech", "env_saas_retail", "env_saas_gold", "env_door_room", "env_saas_dark_slate", "env_saas_clean_light", "env_saas_dark_emerald", "env_ocean_nature", "env_studio_ringlight", "env_store_business", "env_tv_livingroom", "env_brain_xray", "env_ai_lab", "env_earth_magma", "env_cyber_city", "env_radial_fire".
   - graphicType: "saas_iphone_whatsapp_flow", "saas_ios_toggle_action", "saas_3d_product_fanout", "saas_pos_scanner_register", "saas_growth_chart_ticker", "saas_nfc_qr_plaque", "bacteria_microscope_25d", "eye_blindspot_test_25d", "viral_hook_scoreboard_25d", "actor_door_push", "actor_arms_floating", "actor_brain_nerves", "actor_owner_stressed", "nakkio_chat", "posent_terminal", "ntradar_scanner", "ntdesweb_code", "actor_rocket_launch", "actor_money_rain", "actor_iceberg_deep", "actor_magnifying_glass", "ai_brain_workflow", "checklist_pro", "strike_cards", "comparison_split", "cta_conversion".
   - overlayImg1 (opcional SVG 2.5D — usa EXACTAMENTE estas rutas completas o ""): "", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/emprendedor_exito.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/cohete_despegue_pro.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/cerebro_neuronal_3d.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/celular_whatsapp_venta.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/candado_seguridad_cyber.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/grafica_crecimiento_verde.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/trofeo_exito_oro.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/sellos/sello_estafa_peligro.svg".
   - cameraMotion: "cam-dynamic-push", "cam-dutch-tilt", "cam-snap-zoom", "cam-whip-pan", "cam-drift-left", "cam-zoom-in", "cam-zoom-out", "cam-impact-shake".
   - transition: "trans-zoom-burst", "trans-slide-left", "trans-flash-white", "trans-glitch", "trans-crossfade", "trans-flash-wipe".
   - sfx / sfxBeat2 / sfxBeat3: "FXS/vine boom.mp3", "FXS/whoosh.mp3", "FXS/pop 2.mp3", "FXS/cash.mp3", "FXS/coin.mp3", "FXS/punch.mp3", "FXS/transition.mp3", "FXS/sudden-suspense.mp3", "impact", "whoosh", "pop", "cash", "cyber", "ding".
   - highlightStyle: "${highlightStyle || 'hl-tiktok-green'}".
5. DIRECCIÓN INTELIGENTE DE ARTE (SVG vs GPT-IMAGE-2):
   - Decide por escena el campo "visualDecision":
     * "custom_bg" -> Úsalo SOLO en 1 o máximo 2 escenas clave (Escena 1 o Escena 2) donde un fondo cinematográfico vertical 9:16 generado por gpt-image-2 eleve el impacto. Incluye "customBgPrompt" en inglés (12-20 palabras, vertical dark atmospheric scene, NO text, NO letters).
     * "custom_overlay" -> Úsalo si hace falta un objeto 2.5D único que NO exista en los SVG anteriores (máximo 1 escena), con "imagePrompt" en inglés sin texto.
     * "svg_25d" -> En las demás escenas (3 a 4 escenas) usa directamente los gráficos 2.5D y rutas SVG del catálogo para mantener consistencia y velocidad.${directorMode ? '\n   - MODO DIRECTOR AUTÓNOMO ACTIVO: si el tema del usuario es muy corto o genérico, enriquécelo con un ángulo específico y sorprendente para que el clip salga 100% listo para publicar.' : ''}

RESPONDE EXCLUSIVAMENTE CON JSON VÁLIDO:
{
  "brand": "${brand || '@nachotechrd'}",
  "domain": "${domain || 'nakkio.com'}",
  "priceTag": "MÉTODO PRO",
  "ctaText": "SÍGUEME ${(brand || '@NACHOTECH').toUpperCase()}",
  "highlightStyle": "${highlightStyle || 'hl-tiktok-green'}",
  "scenes": [
    {
      "duration": 4300,
      "environment": "env_saas_studio",
      "cameraMotion": "cam-dynamic-push",
      "transition": "trans-zoom-burst",
      "script": "Narración hablada con ritmo viral.",
      "bannerTop": "TITULAR ARRIBA",
      "bannerHighlight": "FRASE CLAVE",
      "bottomRibbon": "Cinta inferior",
      "timerBadge": "30s",
      "graphicType": "saas_growth_chart_ticker",
      "overlayImg1": "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/cohete_despegue_pro.svg",
      "visualDecision": "custom_bg",
      "customBgPrompt": "Dramatic dark neon 9:16 studio backdrop with subtle glowing light rays, clean composition, no text",
      "imagePrompt": "Stylized 2.5D dark futuristic studio illustration with glowing rocket chart, no text",
      "sfx": "FXS/vine boom.mp3",
      "sfxBeat2": "FXS/pop 2.mp3",
      "sfxBeat3": "FXS/cash.mp3",
      "headlineColor": "#facc15",
      "reactionEmoji": "🚀",
      "card1": "Dato 1",
      "card2": "Dato 2",
      "card3": "Dato 3",
      "stampText": ""
    }
  ]
}`;
}

async function callAzureChat(azConfig, messages, expectJson = true) {
    const candidates = buildAzureCandidateUrls(azConfig.endpoint, azConfig.chatDeployment, 'chat');
    if (candidates.length === 0) {
        throw new Error('AZURE_OPENAI_ENDPOINT inválido o no configurado.');
    }

    const isReasoningModel = /gpt-5|^o[134]/i.test(String(azConfig.chatDeployment || ''));
    let lastError = '';
    for (const candidate of candidates) {
        const makePayload = (opts = {}) => {
            const body = { messages };
            if (candidate.useModelField && azConfig.chatDeployment) {
                body.model = azConfig.chatDeployment;
            }
            if (opts.useMaxCompletionTokens) {
                body.max_completion_tokens = 2400;
            } else {
                body.max_tokens = 2400;
            }
            if (opts.reasoningEffort) {
                body.reasoning_effort = opts.reasoningEffort;
            }
            if (!opts.omitTemperature) {
                body.temperature = 0.7;
            }
            if (expectJson && !opts.omitResponseFormat) {
                body.response_format = { type: 'json_object' };
            }
            return body;
        };

        const variants = isReasoningModel
            ? [
                { useMaxCompletionTokens: true, omitTemperature: true, reasoningEffort: 'low' },
                { useMaxCompletionTokens: true, omitTemperature: true },
                { useMaxCompletionTokens: true, omitTemperature: true, omitResponseFormat: true },
                {}
            ]
            : [
                {},
                { useMaxCompletionTokens: true, omitTemperature: true },
                { useMaxCompletionTokens: true, omitTemperature: true, omitResponseFormat: true },
                { omitResponseFormat: true }
            ];

        for (const variant of variants) {
            try {
                const resp = await fetch(candidate.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': azConfig.apiKey,
                        'Authorization': `Bearer ${azConfig.apiKey}`
                    },
                    body: JSON.stringify(makePayload(variant))
                });

                if (resp.ok) {
                    const data = await resp.json().catch(() => null);
                    const content = data?.choices?.[0]?.message?.content;
                    if (content) {
                        return { content, model: data.model || azConfig.chatDeployment, endpointUrl: candidate.url };
                    }
                } else {
                    const errJson = await resp.json().catch(() => ({}));
                    lastError = errJson.error?.message || `HTTP ${resp.status}`;
                    if (resp.status === 401 || resp.status === 403) {
                        throw new Error(`Azure rechazó la API Key (${resp.status}): ${lastError}`);
                    }
                    // Si es 404 (ruta/versión distinta), pasar al siguiente endpoint candidato
                    if (resp.status === 404) break;
                }
            } catch (err) {
                lastError = err.message;
                if (err.message.includes('Azure rechazó')) throw err;
            }
        }
    }

    throw new Error(lastError || 'No se pudo conectar con la implementación de Azure OpenAI.');
}

function extractJsonObject(rawText) {
    let clean = String(rawText || '').trim();
    const fenced = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenced) clean = fenced[1].trim();
    else {
        const f = clean.indexOf('{');
        const l = clean.lastIndexOf('}');
        if (f !== -1 && l > f) clean = clean.slice(f, l + 1);
    }
    return JSON.parse(clean);
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
        return res.status(200).json({
            success: true,
            configured: Boolean(azConfig.endpoint && azConfig.apiKey),
            hasChatDeployment: Boolean(azConfig.chatDeployment),
            hasImageDeployment: Boolean(azConfig.imageDeployment),
            hasSpeechConfig: Boolean((azConfig.speechKey && azConfig.speechRegion) || azConfig.ttsDeployment),
            chatDeployment: azConfig.chatDeployment,
            imageDeployment: azConfig.imageDeployment
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Usa GET o POST.' });
    }

    if (!azConfig.endpoint || !azConfig.apiKey) {
        return res.status(400).json({
            error: 'Falta configurar AZURE_OPENAI_ENDPOINT o AZURE_OPENAI_API_KEY en Vercel o en Claves API.'
        });
    }

    const { action = 'script', topic, brand, domain, formula, highlightStyle, scene, goal } = body;

    try {
        if (action === 'test') {
            const result = await callAzureChat(azConfig, [
                { role: 'user', content: 'Responde únicamente con OK' }
            ], false);
            return res.status(200).json({
                success: true,
                deployment: azConfig.chatDeployment,
                model: result.model,
                reply: result.content.slice(0, 60)
            });
        }

        if (action === 'enhance_scene') {
            if (!scene || (!scene.script && !topic)) {
                return res.status(400).json({ error: 'Falta el texto de la escena para mejorar.' });
            }
            const sys = `Eres un copywriter viral de TikTok/Reels experto en ganchos psicológicos y retención.
Mejora los textos de UNA sola escena para hacerla más magnética, concisa y fácil de narrar en voz alta en español perfecto (con tildes y signos ¿ ¡).
Responde SOLO en JSON con estas claves exactas:
{
  "script": "Narración mejorada (12 a 22 palabras max, muy natural)",
  "bannerTop": "TITULAR ARRIBA EN 2-4 PALABRAS",
  "bannerHighlight": "FRASE IMPACTO 2-5 PALABRAS",
  "bottomRibbon": "Cinta corta 3-5 palabras",
  "card1": "Etiqueta 1",
  "card2": "Etiqueta 2",
  "card3": "Etiqueta 3",
  "imagePrompt": "Prompt en inglés descriptivo para ilustración 2.5D sin texto"
}`;
            const userMsg = `Objetivo/Tono: ${goal || 'Más viral, claro y persuasivo'}\nTema general: ${topic || brand || 'Video viral'}\nEscena actual:\n- script: ${scene.script || ''}\n- bannerTop: ${scene.bannerTop || ''}\n- bannerHighlight: ${scene.bannerHighlight || ''}\n- bottomRibbon: ${scene.bottomRibbon || ''}\n- card1/2/3: ${scene.card1 || ''} / ${scene.card2 || ''} / ${scene.card3 || ''}`;

            const result = await callAzureChat(azConfig, [
                { role: 'system', content: sys },
                { role: 'user', content: userMsg }
            ], true);
            const improved = extractJsonObject(result.content);
            return res.status(200).json({
                success: true,
                provider: 'azure',
                model: result.model || azConfig.chatDeployment,
                improved
            });
        }

        // Default: full 5-scene viral video script generation ('script' o 'director')
        const isDirector = action === 'director';
        const { topicUsed, categoryUsed } = isDirector
            ? pickDirectorTopic(topic, body.category)
            : { topicUsed: String(topic || '').trim(), categoryUsed: body.category || 'custom' };

        if (!topicUsed) {
            return res.status(400).json({ error: 'Escribe el tema de tu video para generar el guion con Azure.' });
        }

        const bizHint = body.businessContext ? ` Contexto del negocio del cliente: ${String(body.businessContext).slice(0, 300)}.` : '';
        const systemPrompt = buildMasterSystemPrompt({ brand, domain, formula, highlightStyle, directorMode: isDirector });
        const result = await callAzureChat(azConfig, [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Dirige y arma un video viral de 5 escenas listo para publicar sobre: "${topicUsed}".${bizHint}` }
        ], true);

        const parsedConfig = normalizeAiScriptPayload(extractJsonObject(result.content));
        if (!parsedConfig || !Array.isArray(parsedConfig.scenes) || parsedConfig.scenes.length < 2) {
            return res.status(502).json({ error: 'Azure respondió sin una estructura válida de escenas.' });
        }

        return res.status(200).json({
            success: true,
            mode: action,
            topicUsed,
            categoryUsed,
            provider: 'azure',
            model: result.model || azConfig.chatDeployment,
            config: parsedConfig
        });

    } catch (err) {
        console.error('Error en /api/azure-ai:', err);
        return res.status(500).json({ error: err.message || 'Error conectando con Azure OpenAI.' });
    }
};
module.exports.config = { maxDuration: 60 };

