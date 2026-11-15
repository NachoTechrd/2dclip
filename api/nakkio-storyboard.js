// api/nakkio-storyboard.js - Director Creativo Multi-Tenant 2DClip PRO para NAKKIO Community Manager
const crypto = require('crypto');
const {
  getAzureConfig,
  buildAzureCandidateUrls,
  normalizeAiScriptPayload,
} = require('./_shared');

const NARRATIVE_FORMULAS = [
  'curiosidad_atom',
  'dolor_solucion',
  'antes_despues',
  'demo_producto',
  'oferta_flash',
  'autoridad_mito',
];

const HIGHLIGHT_STYLES = [
  'hl-tiktok-green',
  'hl-pill',
  'hl-box',
  'hl-glow',
  'hl-purple-neon',
];

function safeTimingEqual(a, b) {
  const ba = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function pickFormula({ requestedFormula, excludeFormulas = [] }) {
  const clean = String(requestedFormula || '').trim();
  if (clean && clean !== 'auto' && NARRATIVE_FORMULAS.includes(clean)) {
    return clean;
  }
  const excluded = new Set((Array.isArray(excludeFormulas) ? excludeFormulas : []).map(String));
  const pool = NARRATIVE_FORMULAS.filter((f) => !excluded.has(f));
  const finalPool = pool.length > 0 ? pool : NARRATIVE_FORMULAS;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

function buildNakkioDirectorPrompt({
  brand,
  domain,
  businessType,
  businessDescription,
  tone,
  targetAudience,
  focusProducts,
  ctaText,
  formula,
  highlightStyle,
  aspectRatio,
  brandColors,
  productImageUrl,
}) {
  const brandName = String(brand || 'Nuestra Tienda').trim();
  const brandTag = brandName.startsWith('@')
    ? brandName
    : `@${brandName.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'tienda'}`;
  const cleanDomain = String(domain || 'nakkio.com').replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  const productsText = Array.isArray(focusProducts) && focusProducts.length > 0
    ? focusProducts.slice(0, 5).map((p) => `- ${p}`).join('\n')
    : `- Servicios y productos principales de ${brandName}`;

  const formulaGuides = {
    curiosidad_atom: 'Abre con un dato curioso o error oculto irresistible del rubro; revela en la escena 3 el mecanismo real y cierra con CTA.',
    dolor_solucion: 'Escena 1 ataca el dolor/frustración común del cliente; Escena 2 muestra qué lo causa; Escena 3-4 presentan la solución exacta del negocio; Escena 5 CTA.',
    antes_despues: 'Contrasta el caos o resultado pobre del "Antes" vs la transformación limpia del "Ahora" trabajando con la marca.',
    demo_producto: 'Destaca un producto/servicio estrella concreto, sus 3 ventajas medibles en uso real, garantía y llamado directo.',
    oferta_flash: 'Gancho de oportunidad inmediata sin inventar descuentos falsos; urgencia real basada en disponibilidad/atención rápida.',
    autoridad_mito: 'Desmiente un mito común de la industria (usa sello_mito_falso.svg si aplica) y demuestra por qué el método profesional del negocio sí funciona.',
  };

  const visualRules = [
    '- environment permitidos (varía en CADA escena, mínimo 4 entornos distintos por video): "env_saas_studio", "env_saas_tech", "env_saas_retail", "env_saas_gold", "env_saas_dark_slate", "env_saas_dark_emerald", "env_store_business", "env_ai_lab", "env_cyber_city", "env_radial_fire", "env_brain_xray", "env_tv_livingroom", "env_ocean_nature".',
    '- graphicType permitidos (VARÍA entre escenas para nunca repetir la misma estructura): "product_showcase", "saas_3d_product_fanout", "saas_iphone_whatsapp_flow", "saas_pos_scanner_register", "saas_growth_chart_ticker", "saas_nfc_qr_plaque", "nakkio_chat", "posent_terminal", "ai_brain_workflow", "checklist_pro", "comparison_split", "strike_cards", "actor_rocket_launch", "actor_money_rain", "actor_owner_stressed", "actor_magnifying_glass", "micro_soldering_chip", "cta_conversion".',
    '- overlayImg1 (elige SVGs acordes al tema del negocio o "" en máximo 1 escena): "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/emprendedor_exito.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/dueno_negocio_estresado.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/tecnico_experto_lentes.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/agente_robot_ia.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/cohete_despegue_pro.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/cerebro_neuronal_3d.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/celular_whatsapp_venta.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/candado_seguridad_cyber.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/grafica_crecimiento_verde.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/trofeo_exito_oro.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/placa_chip_micro_soldadura.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/lupa_forense_detective.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/fajo_billetes_100.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/edificios/tienda_comercio_pos.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/edificios/servidor_datacenter_ia.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/sellos/sello_estafa_peligro.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/sellos/sello_mito_falso.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/sellos/sello_verificado_pro.svg".',
    '- cameraMotion permitidos: "cam-dynamic-push", "cam-dutch-tilt", "cam-snap-zoom", "cam-whip-pan", "cam-drift-left", "cam-zoom-in", "cam-zoom-out", "cam-impact-shake".',
    '- transition permitidos: "trans-zoom-burst", "trans-slide-left", "trans-flash-white", "trans-glitch", "trans-crossfade", "trans-flash-wipe".',
    '- sfx / sfxBeat2 / sfxBeat3 permitidos: "FXS/vine boom.mp3", "FXS/whoosh.mp3", "FXS/whoosh 2.mp3", "FXS/pop 2.mp3", "FXS/pop.mp3", "FXS/cash.mp3", "FXS/coin.mp3", "FXS/punch.mp3", "FXS/transition.mp3", "FXS/cartoon transition.mp3", "FXS/camera shutter.mp3", "FXS/sudden-suspense.mp3".',
  ].join('\n');

  const system = `Eres el Director Creativo PRO de Motion Graphics 2D para negocios reales en Latinoamérica y República Dominicana (estilo Proyecto Atom + Hormozi comercial).
Debes crear guiones de 5 escenas para formato ${aspectRatio === '1:1' ? '1:1 cuadrado' : '9:16 vertical Reel/Short'} totalmente personalizados al negocio real del cliente.

REGLAS CRÍTICAS:
1. FIDELIDAD TOTAL AL NEGOCIO: Usa exclusivamente el nombre comercial (${brandName}), productos/servicios listados y dominio (${cleanDomain}). NUNCA inventes precios ni promociones que no se indicaron.
2. ORTOGRAFÍA PERFECTA EN ESPAÑOL: Tildes correctas (á, é, í, ó, ú, ñ) y signos (¿ ¡). Frases cortas, habladas con ritmo natural (10 a 18 palabras por escena en "script").
3. FÓRMULA NARRATIVA OBLIGATORIA (${formula}): ${formulaGuides[formula] || formulaGuides.curiosidad_atom}
4. IDENTIDAD DE MARCA: Colores preferidos primary=${brandColors?.primary || '#22D3EE'}, secondary=${brandColors?.secondary || '#10B981'}. Alterna colores vibrantes acordes sin saturar.
5. DIRECCIÓN VISUAL (NUNCA REPETIR PLANTILLAS NI CAJAS IGUALES):
   - En cada una de las 5 escenas cambia el "environment", "graphicType", "cameraMotion" y "transition".
   - En Escena 1 o Escena 2 usa "visualDecision": "custom_bg" (máximo 2 escenas) con "customBgPrompt" en inglés cinematográfico limpio de estudio (SIN texto, SIN letras, SIN marcas ajenas) adaptada al rubro ${businessType || 'comercial'}.
   - En las demás escenas usa "visualDecision": "svg_25d" combinando gráficos 2.5D y rutas SVG de ELEMENTOS que encajen con la frase exacta.${productImageUrl ? '\n   - Hay foto real de producto disponible: reserva una escena destacada con graphicType="product_showcase" o "saas_3d_product_fanout".' : ''}

ESTRUCTURA VISUAL DE 2DCLIP STUDIO:
${visualRules}

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO:
{
  "title": "Título breve atractivo",
  "brand": "${brandTag}",
  "domain": "${cleanDomain}",
  "priceTag": "DESTACADO",
  "ctaText": "${String(ctaText || `ESCRÍBENOS A ${brandName}`).slice(0, 40).toUpperCase()}",
  "highlightStyle": "${highlightStyle}",
  "scenes": [
    {
      "id": "hook",
      "duration": 4200,
      "environment": "env_cyber_city",
      "cameraMotion": "cam-dynamic-push",
      "transition": "trans-zoom-burst",
      "script": "Frase de gancho hablada corta y natural.",
      "bannerTop": "TITULAR ARRIBA",
      "bannerHighlight": "FRASE IMPACTO",
      "bottomRibbon": "Cinta corta inferior",
      "timerBadge": "01 · CLAVE",
      "graphicType": "product_showcase",
      "overlayImg1": "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/cohete_despegue_pro.svg",
      "visualDecision": "custom_bg",
      "customBgPrompt": "Dramatic studio commercial backdrop related to the business, moody rim light, sleek bokeh, no text, no letters",
      "sfx": "FXS/vine boom.mp3",
      "sfxBeat2": "FXS/pop 2.mp3",
      "sfxBeat3": "FXS/whoosh.mp3",
      "headlineColor": "${brandColors?.primary || '#22D3EE'}",
      "reactionEmoji": "🔥",
      "card1": "Dato real 1",
      "card2": "Dato real 2",
      "card3": "Dato real 3",
      "stampText": ""
    }
  ]
}`;

  const user = [
    `NEGOCIO: ${brandName}`,
    `RUBRO: ${businessType || 'Comercio y servicios'}`,
    businessDescription ? `DESCRIPCIÓN: ${String(businessDescription).slice(0, 400)}` : '',
    tone ? `TONO: ${tone}` : '',
    targetAudience ? `PÚBLICO: ${targetAudience}` : '',
    `PRODUCTOS / SERVICIOS REALES:\n${productsText}`,
    `TEMA DEL VIDEO: ${String(topic || '').trim() || `Oferta destacada de ${brandName}`}`,
    `FÓRMULA NARRATIVA: ${formula}`,
    `FORMATO: ${aspectRatio === '1:1' ? '1:1 cuadrado' : '9:16 vertical'}`,
  ]
    .filter(Boolean)
    .join('\n');

  return { system, user, brandTag, cleanDomain };
}

async function callAzureChat(azConfig, messages) {
  const candidates = buildAzureCandidateUrls(azConfig.endpoint, azConfig.chatDeployment, 'chat');
  if (candidates.length === 0) {
    throw new Error('AZURE_OPENAI_ENDPOINT inválido o no configurado en 2DClip.');
  }

  const isReasoningModel = /gpt-5|^o[134]/i.test(String(azConfig.chatDeployment || ''));
  let lastError = '';
  for (const candidate of candidates) {
    const variants = isReasoningModel
      ? [
          { useMaxCompletionTokens: true, omitTemperature: true, reasoningEffort: 'low' },
          { useMaxCompletionTokens: true, omitTemperature: true },
          { useMaxCompletionTokens: true, omitTemperature: true, omitResponseFormat: true },
        ]
      : [
          { useMaxCompletionTokens: false, omitTemperature: false },
          { useMaxCompletionTokens: true, omitTemperature: false },
          { useMaxCompletionTokens: false, omitTemperature: false, omitResponseFormat: true },
        ];

    for (const opts of variants) {
      const payload = { messages };
      if (candidate.useModelField && azConfig.chatDeployment) {
        payload.model = azConfig.chatDeployment;
      }
      if (opts.useMaxCompletionTokens) {
        payload.max_completion_tokens = 2600;
      } else {
        payload.max_tokens = 2600;
      }
      if (opts.reasoningEffort) payload.reasoning_effort = opts.reasoningEffort;
      if (!opts.omitTemperature) payload.temperature = 0.78;
      if (!opts.omitResponseFormat) payload.response_format = { type: 'json_object' };

      try {
        const resp = await fetch(candidate.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': azConfig.apiKey,
            Authorization: `Bearer ${azConfig.apiKey}`,
          },
          body: JSON.stringify(payload),
        });
        if (resp.ok) {
          const data = await resp.json().catch(() => null);
          const content = data?.choices?.[0]?.message?.content;
          if (content && String(content).trim()) {
            return { content: String(content), model: data?.model || azConfig.chatDeployment };
          }
        } else {
          const errJson = await resp.json().catch(() => ({}));
          lastError = errJson.error?.message || `HTTP ${resp.status}`;
          if (resp.status === 401 || resp.status === 403) {
            throw new Error(`Azure rechazó API key (${resp.status}): ${lastError}`);
          }
          if (resp.status === 404) break;
        }
      } catch (err) {
        lastError = err.message;
        if (err.message.includes('Azure rechazó')) throw err;
      }
    }
  }
  throw new Error(lastError || 'No se pudo obtener respuesta de Azure OpenAI.');
}

function extractJsonObject(rawText) {
  let clean = String(rawText || '').trim();
  const fenced = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) {
    clean = fenced[1].trim();
  } else {
    const f = clean.indexOf('{');
    const l = clean.lastIndexOf('}');
    if (f !== -1 && l > f) clean = clean.slice(f, l + 1);
  }
  return JSON.parse(clean);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Nakkio-Secret');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const az = getAzureConfig({}, {});
    return res.status(200).json({
      success: true,
      service: '2dclip-nakkio-director',
      configured: Boolean(az.endpoint && az.apiKey),
      formulas: NARRATIVE_FORMULAS,
      highlightStyles: HIGHLIGHT_STYLES,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const expectedSecret = String(process.env.NAK_2DCLIP_SECRET || '').trim();
  if (expectedSecret) {
    const supplied = req.headers['x-nakkio-secret'] || '';
    if (!safeTimingEqual(supplied, expectedSecret)) {
      return res.status(401).json({ error: 'No autorizado (X-Nakkio-Secret inválido).' });
    }
  }

  const body = req.body || {};
  const rawAz = body.azureConfig || {};
  const normalizedAzInput = {
    ...body,
    ...rawAz,
    azureEndpoint: rawAz.azureEndpoint || rawAz.endpoint || body.azureEndpoint || body.endpoint,
    azureApiKey: rawAz.azureApiKey || rawAz.apiKey || body.azureApiKey || body.apiKey,
    azureDeployment:
      rawAz.azureDeployment || rawAz.chatDeployment || rawAz.deployment || body.azureDeployment,
  };
  const azConfig = getAzureConfig(normalizedAzInput, {});
  if (!azConfig.endpoint || !azConfig.apiKey) {
    return res.status(400).json({
      error: 'Faltan credenciales Azure OpenAI (azureConfig en request o AZURE_OPENAI_* en Vercel).',
    });
  }

  const formulaUsed = pickFormula({
    requestedFormula: body.formula,
    excludeFormulas: body.excludeFormulas,
  });
  const highlightStyleUsed = HIGHLIGHT_STYLES.includes(body.highlightStyle)
    ? body.highlightStyle
    : HIGHLIGHT_STYLES[Math.floor(Math.random() * HIGHLIGHT_STYLES.length)];

  try {
    const { system, user, brandTag, cleanDomain } = buildNakkioDirectorPrompt({
      brand: body.brand,
      domain: body.domain,
      businessType: body.businessType,
      businessDescription: body.businessDescription,
      tone: body.tone,
      targetAudience: body.targetAudience,
      focusProducts: body.focusProducts,
      ctaText: body.ctaText,
      topic: body.topic,
      formula: formulaUsed,
      highlightStyle: highlightStyleUsed,
      aspectRatio: body.aspectRatio === '1:1' ? '1:1' : '9:16',
      brandColors: body.brandColors,
      productImageUrl: body.productImageUrl,
    });

    const result = await callAzureChat(azConfig, [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ]);

    const parsed = normalizeAiScriptPayload(extractJsonObject(result.content));
    if (!parsed || !Array.isArray(parsed.scenes) || parsed.scenes.length < 2) {
      return res.status(502).json({ error: 'Azure respondió sin escenas válidas.' });
    }

    parsed.brand = parsed.brand || brandTag;
    parsed.domain = parsed.domain || cleanDomain;
    parsed.highlightStyle = parsed.highlightStyle || highlightStyleUsed;
    parsed.aspectRatio = body.aspectRatio === '1:1' ? '1:1' : '9:16';

    return res.status(200).json({
      success: true,
      formulaUsed,
      highlightStyleUsed: parsed.highlightStyle,
      model: result.model || azConfig.chatDeployment,
      config: parsed,
    });
  } catch (err) {
    console.error('[nakkio-storyboard] Error:', err);
    return res.status(500).json({ error: err.message || 'Error generando guion 2DClip PRO.' });
  }
};
module.exports.config = { maxDuration: 60 };

