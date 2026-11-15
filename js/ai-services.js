        // ==========================================
        // GOOGLE GEMINI VIRAL REEL GENERATOR ENGINE
        // ==========================================
        const GEMINI_STORAGE_KEY = 'nt_gemini_api_key';

        function getStoredGeminiKey() {
            return (localStorage.getItem(GEMINI_STORAGE_KEY) || '').trim();
        }

        function getEffectiveGeminiKey() {
            const modalInput = (document.getElementById('gemini-api-key-input')?.value || '').trim();
            const keysModalInput = (document.getElementById('modal-gemini-key-input')?.value || '').trim();
            return (modalInput || keysModalInput || getStoredGeminiKey()).replace(/^["']|["']$/g, '');
        }

        // ==========================================
        // TEST GEMINI API KEY & REAL-TIME STATUS
        // ==========================================
        window.__NT_SERVER_KEY_STATUS__ = window.__NT_SERVER_KEY_STATUS__ || {
            azure: false,
            azureTts: false,
            gemini: false,
            elevenlabs: false
        };

        async function refreshAllApiKeyBadges() {
            const headers = typeof getCloudHeaders === 'function' ? getCloudHeaders(false) : {};
            const [azRes, ttsRes, gemRes, elRes] = await Promise.allSettled([
                fetch('/api/azure-ai', { headers }).then(r => r.ok ? r.json() : null),
                fetch('/api/azure-tts', { headers }).then(r => r.ok ? r.json() : null),
                fetch('/api/gemini', { headers }).then(r => r.ok ? r.json() : null),
                fetch('/api/elevenlabs?action=status', { headers }).then(r => r.ok ? r.json() : null)
            ]);

            if (azRes.status === 'fulfilled' && azRes.value) {
                window.__NT_SERVER_KEY_STATUS__.azure = Boolean(azRes.value.configured);
            }
            if (ttsRes.status === 'fulfilled' && ttsRes.value) {
                window.__NT_SERVER_KEY_STATUS__.azureTts = Boolean(ttsRes.value.configured);
            }
            if (gemRes.status === 'fulfilled' && gemRes.value) {
                window.__NT_SERVER_KEY_STATUS__.gemini = Boolean(gemRes.value.configured);
            }
            if (elRes.status === 'fulfilled' && elRes.value) {
                window.__NT_SERVER_KEY_STATUS__.elevenlabs = Boolean(elRes.value.configured);
            }

            // Actualizar badge de Azure AI
            const azStatusEl = document.getElementById('azure-key-status');
            if (azStatusEl) {
                const creds = typeof getAzureClientPayload === 'function' ? getAzureClientPayload() : {};
                if (creds.azureApiKey || window.__NT_SERVER_KEY_STATUS__.azure) {
                    azStatusEl.innerHTML = `<span class="text-emerald-400 font-bold">✓ Listo en Servidor (${azRes.value?.chatDeployment || 'gpt-5.6-sol'} + ${azRes.value?.imageDeployment || 'gpt-image-2'})</span>`;
                } else {
                    azStatusEl.innerHTML = '<span class="text-amber-300 font-bold">⚙️ Configura AZURE_OPENAI_* en Vercel o Claves API</span>';
                }
            }

            // Actualizar badge de Azure Speech (evitar ❌ rojo alarmante al inicio si no se configuró Speech Key todavía)
            const ttsBadge = document.getElementById('azure-tts-status-badge');
            if (ttsBadge) {
                const creds = typeof getAzureClientPayload === 'function' ? getAzureClientPayload() : {};
                if (creds.azureSpeechKey || window.__NT_SERVER_KEY_STATUS__.azureTts) {
                    ttsBadge.textContent = '✓ Azure Speech Listo';
                    ttsBadge.className = 'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono-code';
                } else {
                    ttsBadge.textContent = '⚙️ Speech Key Opcional (Omitida)';
                    ttsBadge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-600/60 font-mono-code';
                }
            }

            // Actualizar badges de Gemini
            const hasGem = Boolean(getEffectiveGeminiKey() || window.__NT_SERVER_KEY_STATUS__.gemini);
            ['gemini-key-status', 'modal-gemini-key-input-status'].forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                if (getEffectiveGeminiKey()) {
                    el.innerHTML = '<span class="text-emerald-400 font-bold text-[10px]">✓ Clave Gemini Guardada</span>';
                } else if (window.__NT_SERVER_KEY_STATUS__.gemini) {
                    el.innerHTML = '<span class="text-emerald-400 font-bold text-[10px]">✓ Gemini Activo en Servidor Vercel</span>';
                }
            });
            const gemStatusEl = document.getElementById('gemini-key-status');
            if (gemStatusEl && hasGem && !gemStatusEl.textContent.includes('❌')) {
                gemStatusEl.innerHTML = getEffectiveGeminiKey()
                    ? '<span class="text-emerald-400 font-bold text-[10px]">✓ Clave Gemini Local Listo</span>'
                    : '<span class="text-emerald-400 font-bold text-[10px]">✓ Gemini Activo en Servidor Vercel</span>';
            }

            if (typeof updateElevenBadgeStatus === 'function') {
                updateElevenBadgeStatus();
            }
        }

        async function testGeminiApiKey(customKeyArg, customStatusElId) {
            const keyInput = document.getElementById('gemini-api-key-input');
            const statusEl = document.getElementById(customStatusElId || 'gemini-key-status');
            const apiKey = (typeof customKeyArg === 'string' && customKeyArg.trim() ? customKeyArg : getEffectiveGeminiKey()).trim().replace(/^["']|["']$/g, '');
            const hasServerKey = Boolean(window.__NT_SERVER_KEY_STATUS__ && window.__NT_SERVER_KEY_STATUS__.gemini);

            if (!apiKey && !hasServerKey && !(typeof currentUserToken !== 'undefined' && currentUserToken)) {
                if (statusEl) statusEl.innerHTML = '<span class="text-amber-400 font-bold text-[10px]">⚠️ Pega tu API Key de Google Gemini primero</span>';
                if (keyInput && !customKeyArg) keyInput.focus();
                return false;
            }

            if (statusEl) statusEl.innerHTML = '<span class="text-cyan-400 font-bold text-[10px] animate-pulse">⏳ Verificando con Google AI Studio...</span>';

            try {
                // Intentar primero vía backend /api/gemini (usa clave enviada o GEMINI_API_KEY de Vercel)
                let serverVerified = null;
                try {
                    const srvHeaders = { 'Content-Type': 'application/json' };
                    if (apiKey) srvHeaders['x-gemini-key'] = apiKey;
                    if (typeof currentUserToken !== 'undefined' && currentUserToken) {
                        srvHeaders['Authorization'] = 'Bearer ' + currentUserToken;
                    }
                    const srvRes = await fetch('/api/gemini', {
                        method: 'POST',
                        headers: srvHeaders,
                        body: JSON.stringify({ action: 'test', apiKey: apiKey || undefined })
                    });
                    if (srvRes.ok) {
                        const srvData = await srvRes.json().catch(() => null);
                        if (srvData && srvData.success) {
                            serverVerified = srvData.model || (Array.isArray(srvData.models) && srvData.models[0]) || 'gemini-2.5-flash';
                        }
                    }
                } catch (e) {}

                let foundName = serverVerified;

                // Si no respondió el servidor (o estamos en local estático), verificar directo con Google AI Studio
                if (!foundName) {
                    let listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
                    if (!listRes.ok) {
                        listRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey)}`);
                    }
                    if (listRes.ok) {
                        const listData = await listRes.json();
                        const models = (listData.models || []).filter(m => {
                            const n = (m.name || '').toLowerCase();
                            return n.includes('gemini-') && !n.includes('tts') && !n.includes('embed') && !n.includes('audio') && !n.includes('image') && !n.includes('gemma') && !n.includes('lyria') && !n.includes('transcribe') && !n.includes('deep-research') && m.supportedGenerationMethods?.includes('generateContent');
                        });
                        if (models.length > 0) {
                            const names = models.map(m => m.name.replace('models/', ''));
                            foundName =
                                names.find(n => n === 'gemini-3.1-flash-lite') ||
                                names.find(n => n === 'gemini-flash-lite-latest') ||
                                names.find(n => n === 'gemini-3-flash-preview') ||
                                names.find(n => n.includes('flash') && !n.includes('2.0') && !n.includes('2.5')) ||
                                names[0];
                        }
                    }
                }

                if (!foundName) {
                    const probes = [
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${encodeURIComponent(apiKey)}`,
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${encodeURIComponent(apiKey)}`
                    ];
                    for (const probeUrl of probes) {
                        const pr = await fetch(probeUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ contents: [{ parts: [{ text: 'ok' }] }] })
                        });
                        if (pr.ok) {
                            foundName = probeUrl.split('/models/')[1].split(':')[0];
                            break;
                        }
                    }
                }

                if (foundName) {
                    saveGeminiApiKey(apiKey);
                    if (statusEl) statusEl.innerHTML = `<span class="text-emerald-400 font-bold text-[10px]">✓ Conectada: ${foundName} activo</span>`;
                    playSFX('ding');
                    return true;
                } else {
                    if (statusEl) statusEl.innerHTML = `<span class="text-rose-400 font-bold text-[10px]">❌ Clave rechazada por Google AI Studio. Verifica que esté activa.</span>`;
                    return false;
                }
            } catch (err) {
                if (statusEl) statusEl.innerHTML = `<span class="text-rose-400 font-bold text-[10px]">❌ Error de red: ${err.message}</span>`;
                return false;
            }
        }

        function saveGeminiApiKey(key, skipCloudSync = false) {
            const clean = String(key || '').trim().replace(/^["']|["']$/g, '');
            localStorage.setItem(GEMINI_STORAGE_KEY, clean);
            const gInput = document.getElementById('gemini-api-key-input');
            const mInput = document.getElementById('modal-gemini-key-input');
            if (gInput && gInput.value !== clean) gInput.value = clean;
            if (mInput && mInput.value !== clean) mInput.value = clean;
            if (typeof persistAllUserSettingsLocal === 'function') persistAllUserSettingsLocal();
            if (!skipCloudSync && typeof debouncedSettingsCloudSync === 'function') debouncedSettingsCloudSync();
        }

        function toggleGeminiKeyVisibility() {
            const input = document.getElementById('gemini-api-key-input');
            if (input) input.type = input.type === 'password' ? 'text' : 'password';
        }

        // ==========================================
        // AZURE AI FOUNDRY: GPT-5.6-SOL + GPT-IMAGE-2 + NEURAL VOICES
        // ==========================================
        let aiGeneratorEngine = 'azure';
        let activeAzureImageTargetProp = 'overlayImg1';
        const azureAudioCache = new Map();

        function getStoredUserSettingsObj() {
            try {
                return JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}') || {};
            } catch (e) {
                return {};
            }
        }

        function getAzureClientPayload() {
            const saved = getStoredUserSettingsObj();
            const ep = (document.getElementById('modal-azure-endpoint-input')?.value ?? saved.azureOpenaiEndpoint ?? '').trim();
            const key = (document.getElementById('modal-azure-key-input')?.value ?? saved.azureOpenaiApiKey ?? '').trim();
            const chatDep = (document.getElementById('modal-azure-chat-dep-input')?.value ?? saved.azureOpenaiDeployment ?? '').trim();
            const imgDep = (document.getElementById('modal-azure-img-dep-input')?.value ?? saved.azureImageDeployment ?? '').trim();
            const speechKey = (document.getElementById('modal-azure-speech-key-input')?.value ?? saved.azureSpeechKey ?? '').trim();
            const speechRegion = (document.getElementById('modal-azure-speech-region-input')?.value ?? saved.azureSpeechRegion ?? '').trim();
            return {
                azureEndpoint: ep || undefined,
                azureApiKey: key || undefined,
                azureDeployment: chatDep || undefined,
                azureImageDeployment: imgDep || undefined,
                azureSpeechKey: speechKey || undefined,
                azureSpeechRegion: speechRegion || undefined
            };
        }

        function setAIGeneratorEngine(engine, skipSave = false) {
            aiGeneratorEngine = engine === 'gemini' ? 'gemini' : 'azure';
            const btnAzure = document.getElementById('ai-engine-btn-azure');
            const btnGemini = document.getElementById('ai-engine-btn-gemini');
            const azureBox = document.getElementById('azure-engine-info-box');
            const geminiBox = document.getElementById('gemini-key-config-box');
            const actionBtn = document.getElementById('btn-generate-gemini-action');

            if (aiGeneratorEngine === 'azure') {
                if (btnAzure) btnAzure.className = 'py-2 px-3 rounded-lg text-xs font-black bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow transition';
                if (btnGemini) btnGemini.className = 'py-2 px-3 rounded-lg text-xs font-black text-slate-300 hover:text-white transition';
                if (azureBox) azureBox.classList.remove('hidden');
                if (geminiBox) geminiBox.classList.add('hidden');
                if (actionBtn) actionBtn.innerHTML = '<span>🔷</span> ¡Crear Video con Azure AI!';
            } else {
                if (btnAzure) btnAzure.className = 'py-2 px-3 rounded-lg text-xs font-black text-slate-300 hover:text-white transition';
                if (btnGemini) btnGemini.className = 'py-2 px-3 rounded-lg text-xs font-black bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow transition';
                if (azureBox) azureBox.classList.add('hidden');
                if (geminiBox) geminiBox.classList.remove('hidden');
                if (actionBtn) actionBtn.innerHTML = '<span>✨</span> ¡Crear Video con Gemini!';
            }

            if (!skipSave && typeof persistAllUserSettingsLocal === 'function') {
                persistAllUserSettingsLocal();
                if (typeof debouncedSettingsCloudSync === 'function') debouncedSettingsCloudSync();
            }
        }

        async function testAzureDeployment(statusElId = 'azure-key-status') {
            const statusEl = document.getElementById(statusElId);
            if (statusEl) statusEl.innerHTML = '<span class="text-sky-300 font-bold">⏳ Probando Azure Foundry...</span>';
            try {
                const creds = getAzureClientPayload();
                const res = await fetch('/api/azure-ai', {
                    method: 'POST',
                    headers: getCloudHeaders(true),
                    body: JSON.stringify({ action: 'test', ...creds })
                });
                const data = await res.json().catch(() => ({}));
                let ttsNote = '';
                try {
                    const ttsRes = await fetch('/api/azure-tts', { headers: getCloudHeaders(false) });
                    const ttsData = await ttsRes.json().catch(() => ({}));
                    if (ttsData && ttsData.configured) {
                        ttsNote = ' | Voces Speech: ✓ Listas';
                    }
                } catch (e) {}

                if (res.ok && data.success) {
                    if (statusEl) {
                        statusEl.innerHTML = `<span class="text-emerald-400 font-bold">✓ Conectado: ${data.deployment || 'Azure GPT'} (${data.model || 'OK'})${ttsNote}</span>`;
                    }
                    playSFX('ding');
                    return true;
                }
                const errMsg = data.error || `HTTP ${res.status}`;
                if (statusEl) statusEl.innerHTML = `<span class="text-rose-400 font-bold">❌ ${errMsg}</span>`;
                return false;
            } catch (err) {
                if (statusEl) statusEl.innerHTML = `<span class="text-rose-400 font-bold">❌ Error de red: ${err.message}</span>`;
                return false;
            }
        }

        async function refreshAzureModalStatus() {
            const statusEl = document.getElementById('azure-key-status');
            if (!statusEl) return;
            try {
                const res = await fetch('/api/azure-ai', { headers: getCloudHeaders(false) });
                const data = await res.json().catch(() => ({}));
                if (res.ok && data && data.configured) {
                    statusEl.innerHTML = `<span class="text-emerald-400 font-bold">✓ Listo (${data.chatDeployment || 'GPT-5.6'} + ${data.imageDeployment || 'gpt-image-2'})</span>`;
                } else {
                    statusEl.innerHTML = '<span class="text-amber-300 font-bold">⚙️ Configura AZURE_OPENAI_* en Vercel o Claves API</span>';
                }
            } catch (e) {}
        }

        async function enhanceActiveSceneWithAzure() {
            const scene = currentConfig?.scenes?.[currentSceneIndex];
            if (!scene) return;
            const btn = document.getElementById('btn-enhance-scene-azure');
            const oldHtml = btn ? btn.innerHTML : '';
            try {
                if (btn) {
                    btn.disabled = true;
                    btn.innerHTML = '⏳ Mejorando escena...';
                }
                const creds = getAzureClientPayload();
                const res = await fetch('/api/azure-ai', {
                    method: 'POST',
                    headers: getCloudHeaders(true),
                    body: JSON.stringify({
                        action: 'enhance_scene',
                        scene,
                        brand: currentConfig.brand || '@nachotechrd',
                        domain: currentConfig.domain || 'nakkio.com',
                        ...creds
                    })
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.success || !data.improved) {
                    throw new Error(data.error || 'No se pudo mejorar esta escena con Azure.');
                }

                const imp = data.improved;
                if (imp.script) scene.script = imp.script;
                if (imp.bannerTop !== undefined) scene.bannerTop = imp.bannerTop;
                if (imp.bannerHighlight) scene.bannerHighlight = imp.bannerHighlight;
                if (imp.bottomRibbon !== undefined) scene.bottomRibbon = imp.bottomRibbon;
                if (imp.card1 !== undefined) scene.card1 = imp.card1;
                if (imp.card2 !== undefined) scene.card2 = imp.card2;
                if (imp.card3 !== undefined) scene.card3 = imp.card3;
                if (imp.imagePrompt) scene._suggestedImagePrompt = imp.imagePrompt;

                delete scene._cachedAudioBuffer;
                synchronizeAllSceneDurations();
                saveStateToLocalStorage();
                renderScene(currentSceneIndex);
                renderActiveSceneEditor();
                playSFX('ding');
                showStudioToast(`✨ Escena ${currentSceneIndex + 1} mejorada con Azure (${data.model || 'GPT-5.6'})`, 3500);
            } catch (err) {
                console.error('Error enhanceActiveSceneWithAzure:', err);
                alert(`❌ No se pudo mejorar con Azure:\n${err.message}`);
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = oldHtml;
                }
            }
        }

        function autofillAzureImagePromptFromScene() {
            const scene = currentConfig?.scenes?.[currentSceneIndex];
            const promptEl = document.getElementById('azure-image-prompt-input');
            if (!promptEl || !scene) return;
            const suggested = scene._suggestedImagePrompt || [scene.bannerHighlight, scene.script].filter(Boolean).join('. ');
            promptEl.value = suggested || 'Emprendedor moderno usando inteligencia artificial en su teléfono móvil con hologramas y monedas doradas';
        }

        function openAzureImageModal(targetProp = 'overlayImg1') {
            activeAzureImageTargetProp = targetProp || 'overlayImg1';
            const modal = document.getElementById('azure-image-modal');
            const labelEl = document.getElementById('azure-img-target-label');
            const sizeEl = document.getElementById('azure-image-size-select');
            const styleEl = document.getElementById('azure-image-style-select');
            const statusBox = document.getElementById('azure-image-status-box');
            const promptEl = document.getElementById('azure-image-prompt-input');

            const names = {
                overlayImg1: 'Imagen / Objeto Principal (Escena ' + (currentSceneIndex + 1) + ')',
                overlayImg2: 'Segundo Elemento Visual (Escena ' + (currentSceneIndex + 1) + ')',
                customBgUrl: 'Fondo Completo Escena ' + (currentSceneIndex + 1)
            };
            if (labelEl) labelEl.textContent = (names[activeAzureImageTargetProp] || 'Escena actual') + ' • Se guarda en Ingredientes Reciclables';
            if (sizeEl) sizeEl.value = activeAzureImageTargetProp === 'customBgUrl' ? '1024x1536' : '1024x1024';
            if (styleEl) styleEl.value = activeAzureImageTargetProp === 'customBgUrl' ? 'backdrop916' : 'vector25d';
            if (statusBox) {
                statusBox.classList.add('hidden');
                statusBox.textContent = '';
            }
            if (promptEl && !promptEl.value.trim()) {
                autofillAzureImagePromptFromScene();
            }
            if (modal) modal.classList.remove('hidden');
        }

        function closeAzureImageModal() {
            const modal = document.getElementById('azure-image-modal');
            if (modal) modal.classList.add('hidden');
        }

        async function generateImageWithAzure() {
            const prompt = (document.getElementById('azure-image-prompt-input')?.value || '').trim();
            const style = document.getElementById('azure-image-style-select')?.value || 'vector25d';
            const size = document.getElementById('azure-image-size-select')?.value || '1024x1024';
            const statusBox = document.getElementById('azure-image-status-box');
            const btn = document.getElementById('btn-generate-azure-image');

            if (!prompt) {
                alert('Describe brevemente qué ilustración quieres generar con Azure gpt-image-2.');
                document.getElementById('azure-image-prompt-input')?.focus();
                return;
            }

            try {
                if (btn) {
                    btn.disabled = true;
                    btn.classList.add('opacity-50');
                    btn.innerHTML = '⏳ Generando imagen en Azure...';
                }
                if (statusBox) {
                    statusBox.classList.remove('hidden');
                    statusBox.innerHTML = '⏳ Conectando con <strong>gpt-image-2</strong> y subiendo resultado a Cloudinary...';
                }

                const creds = getAzureClientPayload();
                const res = await fetch('/api/azure-image', {
                    method: 'POST',
                    headers: getCloudHeaders(true),
                    body: JSON.stringify({
                        prompt,
                        style,
                        size,
                        quality: 'medium',
                        ...creds
                    })
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.success || !data.url) {
                    throw new Error(data.error || `Error generando imagen HTTP ${res.status}`);
                }

                const scene = currentConfig?.scenes?.[currentSceneIndex];
                if (scene) {
                    scene[activeAzureImageTargetProp] = data.url;
                    if (activeAzureImageTargetProp === 'overlayImg1' && scene.overlayImgScale == null) {
                        scene.overlayImgScale = 100;
                    }
                }
                const shortLabel = 'IA: ' + prompt.slice(0, 24).trim();
                if (typeof saveUserCustomAssetToLibrary === 'function') {
                    saveUserCustomAssetToLibrary(data.url, shortLabel);
                }
                saveStateToLocalStorage();
                renderScene(currentSceneIndex);
                renderActiveSceneEditor();
                playSFX('cash');
                closeAzureImageModal();
                showStudioToast(`🎨 Imagen generada con ${data.deployment || 'gpt-image-2'} y guardada en tus ingredientes`, 4000);
            } catch (err) {
                console.error('Error generateImageWithAzure:', err);
                if (statusBox) {
                    statusBox.classList.remove('hidden');
                    statusBox.innerHTML = `<span class="text-rose-400">❌ ${err.message}</span>`;
                }
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.classList.remove('opacity-50');
                    btn.innerHTML = '🎨 Generar y Aplicar a Escena';
                }
            }
        }

        function saveAzureVoicePreference() {
            if (typeof persistAllUserSettingsLocal === 'function') persistAllUserSettingsLocal();
            if (typeof debouncedSettingsCloudSync === 'function') debouncedSettingsCloudSync();
        }

        async function requestAzureSceneAudio(sceneIndex) {
            const scene = currentConfig?.scenes?.[sceneIndex];
            if (!scene || !scene.script || !scene.script.trim()) return false;

            const voiceName = document.getElementById('azure-voice-select')?.value || getStoredUserSettingsObj().azureVoiceName || 'es-DO-EmilioNeural';
            const ratePct = Math.round(((ttsRate || 1.0) - 1.0) * 100);
            const rateStr = `${ratePct >= 0 ? '+' : ''}${ratePct}%`;
            const cacheKey = `az_${voiceName}_${rateStr}_${scene.script.trim()}`;

            if (azureAudioCache.has(cacheKey)) {
                const cached = azureAudioCache.get(cacheKey);
                scene.customAudioUrl = cached.audioDataUrl;
                scene._cachedAudioBuffer = cached.audioBuffer;
                scene.duration = cached.durationMs;
                return true;
            }

            const creds = getAzureClientPayload();
            const res = await fetch('/api/azure-tts', {
                method: 'POST',
                headers: getCloudHeaders(true),
                body: JSON.stringify({
                    text: scene.script.trim(),
                    voiceName,
                    rate: rateStr,
                    uploadToCdn: true,
                    azureSpeechKey: creds.azureSpeechKey,
                    azureSpeechRegion: creds.azureSpeechRegion
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success || (!data.audio_base64 && !data.audioUrl)) {
                throw new Error(data.error || `Azure TTS HTTP ${res.status}`);
            }

            const rawBase64 = data.audio_base64 || '';
            const audioDataUrl = data.audioUrl || `data:audio/mp3;base64,${rawBase64}`;
            let audioBuffer = rawBase64 ? await decodeBase64ToAudioBuffer(rawBase64) : null;
            if (!audioBuffer && audioDataUrl && !audioDataUrl.startsWith('data:')) {
                try {
                    const ctx = getAudioCtx();
                    const r = await fetch(audioDataUrl);
                    if (r.ok) audioBuffer = await ctx.decodeAudioData(await r.arrayBuffer());
                } catch (e) {}
            }

            const durationMs = audioBuffer && audioBuffer.duration > 0.4
                ? Math.max(2400, Math.round(audioBuffer.duration * 1000 + 380))
                : calculateNaturalSceneDurationMs(scene.script, ttsRate || 1.0);

            scene.customAudioUrl = audioDataUrl;
            scene._cachedAudioBuffer = audioBuffer;
            scene.duration = durationMs;
            azureAudioCache.set(cacheKey, { audioDataUrl, audioBuffer, durationMs });
            return true;
        }

        async function testAzureSpeechVoice() {
            const badge = document.getElementById('azure-tts-status-badge');
            const voiceName = document.getElementById('azure-voice-select')?.value || 'es-DO-EmilioNeural';
            if (badge) badge.textContent = '⏳ Probando...';
            try {
                const creds = getAzureClientPayload();
                const res = await fetch('/api/azure-tts', {
                    method: 'POST',
                    headers: getCloudHeaders(true),
                    body: JSON.stringify({
                        text: 'Hola, esta es tu nueva voz neural de Azure AI en 2DClip.',
                        voiceName,
                        uploadToCdn: false,
                        azureSpeechKey: creds.azureSpeechKey,
                        azureSpeechRegion: creds.azureSpeechRegion
                    })
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.success || (!data.audio_base64 && !data.audioUrl)) {
                    throw new Error(data.error || `HTTP ${res.status}`);
                }
                const audioSrc = data.audioUrl || `data:audio/mp3;base64,${data.audio_base64}`;
                const audio = new Audio(audioSrc);
                await audio.play().catch(() => {});
                if (badge) badge.textContent = `✓ Voz ${data.voiceName || voiceName} Activa`;
                playSFX('ding');
            } catch (err) {
                if (badge) badge.textContent = '❌ Configura Azure Speech Key';
                alert(`❌ Azure Neural Voice no disponible aún:\n${err.message}\n\nPuedes agregar AZURE_SPEECH_KEY y AZURE_SPEECH_REGION en Vercel o en "🔑 Claves API".`);
            }
        }

        async function generateAzureCurrentScene() {
            const btn = document.getElementById('btn-azure-tts-scene');
            const badge = document.getElementById('azure-tts-status-badge');
            const oldText = btn ? btn.innerHTML : '';
            try {
                if (btn) {
                    btn.disabled = true;
                    btn.innerHTML = '⏳ Generando voz...';
                }
                if (badge) badge.textContent = '⏳ Sintetizando...';
                const ok = await requestAzureSceneAudio(currentSceneIndex);
                if (ok) {
                    if (badge) badge.textContent = `✓ Escena ${currentSceneIndex + 1} Lista`;
                    playSFX('ding');
                    updateTotalDurationBadge();
                    saveStateToLocalStorage();
                    sceneStartTime = performance.now();
                    renderScene(currentSceneIndex);
                    renderActiveSceneEditor();
                }
            } catch (err) {
                console.error('Error Azure TTS escena:', err);
                if (badge) badge.textContent = '❌ Error Speech';
                alert('Error generando voz con Azure AI:\n' + err.message);
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = oldText;
                }
            }
        }

        async function generateAzureAllScenes() {
            const btn = document.getElementById('btn-azure-tts-all');
            const badge = document.getElementById('azure-tts-status-badge');
            const oldText = btn ? btn.innerHTML : '';
            try {
                if (btn) btn.disabled = true;
                const total = currentConfig.scenes.length;
                for (let i = 0; i < total; i++) {
                    if (btn) btn.innerHTML = `⏳ Escena ${i + 1}/${total}...`;
                    if (badge) badge.textContent = `🎙️ Azure ${i + 1}/${total}...`;
                    await requestAzureSceneAudio(i);
                }
                if (badge) badge.textContent = `✓ ${total}/${total} Escenas Listas`;
                playSFX('cash');
                updateTotalDurationBadge();
                saveStateToLocalStorage();
                restartVideo();
            } catch (err) {
                console.error('Error Azure TTS lote:', err);
                if (badge) badge.textContent = '❌ Error lote';
                alert('Error generando lote de voces con Azure AI:\n' + err.message);
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = oldText;
                }
            }
        }

        function openGeminiModal() {
            const modal = document.getElementById('gemini-generator-modal');
            const keyInput = document.getElementById('gemini-api-key-input');
            if (keyInput) keyInput.value = getStoredGeminiKey();
            setAIGeneratorEngine(aiGeneratorEngine || 'azure', true);
            refreshAzureModalStatus();
            if (modal) modal.classList.remove('hidden');
        }

        function closeGeminiModal() {
            const modal = document.getElementById('gemini-generator-modal');
            if (modal) modal.classList.add('hidden');
        }

        function fillGeminiTopic(text) {
            const input = document.getElementById('gemini-topic-input');
            if (input) input.value = text;
        }

        const CLIENT_RANDOM_DIRECTOR_IDEAS = {
            negocio: [
                'Por qué el 80% de tus clientes preguntan precio por WhatsApp y desaparecen',
                'El error invisible en tu caja diaria que fuga ganancias sin que lo notes',
                'Cómo atender y cerrar ventas automáticamente a las 2 de la mañana',
                'Por qué una página web lenta te hace perder más dinero que no tener redes'
            ],
            curiosidad: [
                'Por qué nunca puedes recordar el momento exacto en que te quedaste dormido',
                'El truco visual por el que tu cerebro borra tu propia nariz todo el día',
                'Por qué el agua fría suena diferente al agua caliente cuando cae',
                'La ilusión del espejo que engaña a tu sistema nervioso en 5 segundos'
            ],
            ciencia: [
                'Por qué los aviones de 400 toneladas no se caen en medio del aire',
                'Por qué sientes sueño justo después de comer aunque dormiste bien',
                'Cómo viaja tu mensaje de WhatsApp bajo el océano en milisegundos',
                'La razón real por la que el vidrio es sólido pero deja pasar la luz'
            ],
            tech: [
                'El mito peligroso de meter tu teléfono mojado en arroz',
                'Cómo detectar cuando un cargador falso está quemando el chip de carga',
                'Por qué tu batería baja lento de 100% a 80% y rápido de 20% a 0%',
                'Qué pasa dentro de tu celular cuando aparece el toque fantasma'
            ],
            dinero: [
                'Por qué los diamantes cuestan fortunas cuando en realidad no son escasos',
                'La diferencia exacta entre ganar dinero rápido y construir activos reales',
                'Cómo el efecto señuelo en los precios te hace comprar el paquete caro',
                'Por qué ahorrar dinero quieto pierde valor frente a sistemas automatizados'
            ]
        };

        function triggerRandomDirectorIdea() {
            const catSel = document.getElementById('director-category-select')?.value || 'random';
            const keys = Object.keys(CLIENT_RANDOM_DIRECTOR_IDEAS);
            const chosenCat = CLIENT_RANDOM_DIRECTOR_IDEAS[catSel]
                ? catSel
                : keys[Math.floor(Math.random() * keys.length)];
            const pool = CLIENT_RANDOM_DIRECTOR_IDEAS[chosenCat];
            const currentVal = (document.getElementById('gemini-topic-input')?.value || '').trim();
            const filtered = pool.filter(x => x !== currentVal);
            const pick = (filtered.length ? filtered : pool)[Math.floor(Math.random() * (filtered.length || pool.length))];
            fillGeminiTopic(pick);
            if (typeof showStudioToast === 'function') {
                showStudioToast(`🎲 Idea (${chosenCat}): "${pick.slice(0, 48)}..."`, 2400);
            }
            return pick;
        }

        function copyExternalAgentSnippet() {
            const el = document.getElementById('external-agent-snippet');
            if (!el) return;
            const txt = el.textContent || '';
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(txt).then(() => {
                    if (typeof showStudioToast === 'function') showStudioToast('📋 Endpoint copiado para tu Agente Community Manager', 3000);
                }).catch(() => {});
            }
        }

        async function autoNarrateGeneratedVideo(stepEl) {
            const wantVoice = Boolean(document.getElementById('azure-auto-voice-toggle')?.checked);
            if (!wantVoice || !currentConfig || !Array.isArray(currentConfig.scenes)) return;

            const hasEleven = Boolean(
                (typeof getEffectiveElevenKey === 'function' && getEffectiveElevenKey()) ||
                (window.__NT_SERVER_KEY_STATUS__ && window.__NT_SERVER_KEY_STATUS__.elevenlabs)
            );
            const hasAzureSpeech = Boolean(
                (window.__NT_SERVER_KEY_STATUS__ && window.__NT_SERVER_KEY_STATUS__.azureSpeech) ||
                localStorage.getItem('nt_azure_speech_key_v1')
            );

            const total = currentConfig.scenes.length;
            if (hasEleven && typeof requestElevenLabsSceneAudio === 'function') {
                let okCount = 0;
                for (let i = 0; i < total; i++) {
                    if (stepEl) stepEl.innerHTML = `<span>🎙️</span> Narrando con ElevenLabs (${i + 1}/${total})...`;
                    try {
                        await requestElevenLabsSceneAudio(i);
                        okCount++;
                    } catch (e) {
                        console.warn(`Auto-voz ElevenLabs escena ${i + 1}:`, e.message);
                    }
                }
                if (okCount > 0) {
                    if (typeof updateTotalDurationBadge === 'function') updateTotalDurationBadge();
                    saveStateToLocalStorage();
                    return;
                }
            }

            if (hasAzureSpeech && typeof requestAzureSceneAudio === 'function') {
                let okCount = 0;
                for (let i = 0; i < total; i++) {
                    if (stepEl) stepEl.innerHTML = `<span>🎙️</span> Narrando con Azure Speech (${i + 1}/${total})...`;
                    try {
                        await requestAzureSceneAudio(i);
                        okCount++;
                    } catch (e) {
                        console.warn(`Auto-voz Azure escena ${i + 1}:`, e.message);
                    }
                }
                if (okCount > 0) {
                    if (typeof updateTotalDurationBadge === 'function') updateTotalDurationBadge();
                    saveStateToLocalStorage();
                    return;
                }
            }

            if (typeof ttsEnabled !== 'undefined') {
                ttsEnabled = true;
            }
            if (stepEl) stepEl.innerHTML = '<span>✓</span> Voz automática del navegador activada (0 claves extra)';
        }

        async function generateVideoWithGemini() {
            const apiKey = getEffectiveGeminiKey();
            let topic = (document.getElementById('gemini-topic-input')?.value || '').trim();
            const category = document.getElementById('director-category-select')?.value || 'random';
            const formula = document.getElementById('gemini-formula-select')?.value || 'Storytelling Viral';
            const subStyle = document.getElementById('gemini-sub-style-select')?.value || 'hl-box';
            const brand = (document.getElementById('gemini-brand-input')?.value || '').trim() || currentConfig.brand || '@nachotechrd';
            const domain = currentConfig.domain || 'nakkio.com';
            const hasCloudAccount = Boolean(typeof currentUserToken !== 'undefined' && currentUserToken);
            const hasServerGemini = Boolean(window.__NT_SERVER_KEY_STATUS__ && window.__NT_SERVER_KEY_STATUS__.gemini);

            if (!topic && aiGeneratorEngine !== 'azure') {
                topic = triggerRandomDirectorIdea();
            }

            if (aiGeneratorEngine === 'gemini' && !apiKey && !hasCloudAccount && !hasServerGemini) {
                alert('⚠️ Por favor ingresa tu Google Gemini API Key o cambia a "🔷 Azure GPT-5.6".');
                document.getElementById('gemini-api-key-input')?.focus();
                return;
            }

            if (aiGeneratorEngine === 'gemini' && apiKey) saveGeminiApiKey(apiKey);

            const loadingBox = document.getElementById('gemini-loading-box');
            const step1 = document.getElementById('gemini-step-1');
            const step2 = document.getElementById('gemini-step-2');
            const step3 = document.getElementById('gemini-step-3');
            const btn = document.getElementById('btn-generate-gemini-action');

            loadingBox.classList.remove('hidden');
            btn.disabled = true;
            btn.classList.add('opacity-50');

            if (aiGeneratorEngine === 'azure') {
                step1.innerHTML = '<span>⏳</span> Director Azure (gpt-5.6-sol) analizando tema y retención...';
                step2.innerHTML = '<span>⏳</span> Creando guion, ganchos, FXS y dirección de arte 2.5D...';
                step3.innerHTML = '<span>⏳</span> Preparando fondos gpt-image-2 y voz...';

                try {
                    const creds = getAzureClientPayload();
                    const res = await fetch('/api/azure-ai', {
                        method: 'POST',
                        headers: getCloudHeaders(true),
                        body: JSON.stringify({
                            action: 'director',
                            topic: topic || 'RANDOM',
                            category,
                            brand,
                            domain,
                            formula,
                            highlightStyle: subStyle,
                            ...creds
                        })
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok || !data.success || !data.config || !Array.isArray(data.config.scenes)) {
                        throw new Error(data.error || `Error Azure HTTP ${res.status}`);
                    }

                    if (!topic && data.topicUsed) {
                        fillGeminiTopic(data.topicUsed);
                    }
                    step1.innerHTML = `<span>✓</span> Director Azure (${data.model || 'gpt-5.6-sol'}): "${(data.topicUsed || topic).slice(0, 42)}"`;
                    step2.innerHTML = '<span>✓</span> 5 escenas con FXS, cámara y gráficos 2.5D armadas';

                    const autoImages = Boolean(document.getElementById('azure-auto-images-toggle')?.checked);
                    if (autoImages) {
                        // Arte Híbrido Inteligente: solo genera 1-2 piezas clave con gpt-image-2 para mantener velocidad y conservar SVGs
                        const targets = [];
                        data.config.scenes.forEach((sc, idx) => {
                            if (sc.visualDecision === 'custom_bg' || sc.visualDecision === 'custom_overlay') {
                                targets.push({ idx, mode: sc.visualDecision });
                            }
                        });
                        if (targets.length === 0 && data.config.scenes.length > 0) {
                            targets.push({ idx: 0, mode: 'custom_bg' });
                        }
                        const cappedTargets = targets.slice(0, 2);

                        for (let t = 0; t < cappedTargets.length; t++) {
                            const { idx, mode } = cappedTargets[t];
                            const sc = data.config.scenes[idx];
                            const isBackdrop = mode === 'custom_bg';
                            step3.innerHTML = `<span>⏳</span> Generando ${isBackdrop ? 'fondo 9:16' : 'arte 2.5D'} en Escena ${idx + 1} (${t + 1}/${cappedTargets.length})...`;
                            try {
                                const imgRes = await fetch('/api/azure-image', {
                                    method: 'POST',
                                    headers: getCloudHeaders(true),
                                    body: JSON.stringify({
                                        prompt: isBackdrop
                                            ? (sc.customBgPrompt || sc.imagePrompt || sc.bannerHighlight || sc.script)
                                            : (sc.imagePrompt || sc.bannerHighlight || sc.script),
                                        style: isBackdrop ? 'backdrop916' : 'vector25d',
                                        size: isBackdrop ? '1024x1536' : '1024x1024',
                                        quality: 'low',
                                        ...creds
                                    })
                                });
                                const imgData = await imgRes.json().catch(() => ({}));
                                if (imgRes.ok && imgData.success && imgData.url) {
                                    if (isBackdrop) {
                                        sc.customBgUrl = imgData.url;
                                    } else {
                                        sc.overlayImg1 = imgData.url;
                                        sc.overlayImgScale = 100;
                                    }
                                    if (typeof saveUserCustomAssetToLibrary === 'function') {
                                        saveUserCustomAssetToLibrary(imgData.url, `${isBackdrop ? 'Fondo' : 'IA'} Escena ${idx + 1}`);
                                    }
                                }
                            } catch (imgErr) {
                                console.warn(`Arte escena ${idx + 1} omitido:`, imgErr);
                            }
                        }
                    }

                    data.config.highlightStyle = subStyle;
                    currentConfig = data.config;
                    synchronizeAllSceneDurations();
                    syncGlobalInputsFromConfig();
                    saveStateToLocalStorage();

                    await autoNarrateGeneratedVideo(step3);
                    step3.innerHTML = '<span>✓</span> ¡Clip dirigido por Azure 100% listo para publicar!';

                    setTimeout(() => {
                        closeGeminiModal();
                        loadingBox.classList.add('hidden');
                        btn.disabled = false;
                        btn.classList.remove('opacity-50');
                        playSFX('ding');
                        sceneStartTime = performance.now();
                        renderScene(0);
                        renderActiveSceneEditor();
                        if (typeof showStudioToast === 'function') {
                            showStudioToast('🎬 ¡Clip listo! Presiona ▶ Play o 🔴 Grabar', 4500);
                        }
                    }, 450);
                    return;
                } catch (err) {
                    console.error('Error con Azure AI Foundry:', err);
                    step1.innerHTML = `<span>❌</span> ${err.message}`;
                    alert(`❌ Error al generar con Azure AI:\n${err.message}\n\nRevisa tus variables AZURE_OPENAI_* en Vercel o en "🔑 Claves API".`);
                    loadingBox.classList.add('hidden');
                    btn.disabled = false;
                    btn.classList.remove('opacity-50');
                    return;
                }
            }

            step1.innerHTML = '<span>⏳</span> Conectando con Google Gemini 2.5 Flash...';
            step2.innerHTML = '<span>⏳</span> Escribiendo guion viral y coreografía de 3 compases...';
            step3.innerHTML = '<span>⏳</span> Asignando escenarios premium, SVG 2.5D y SFX reales...';

            const prompt = `Eres el Director Creativo de Motion Graphics y Storytelling para videos virales 9:16 de alto impacto.
Crea un video de exactamente 5 escenas (20 a 22 segundos total) sobre:
"${topic}"

FÓRMULA NARRATIVA: ${formula}
MARCA / CREADOR: ${brand}
DOMINIO WEB: ${domain}

REGLAS OBLIGATORIAS:
1. ORTOGRAFÍA PERFECTA EN ESPAÑOL: Tildes (á, é, í, ó, ú, ñ) y signos de apertura (¿ ¡).
2. ESTILO 5 ESCENAS:
   - Escena 1: Gancho psicológico explosivo (<=10 palabras).
   - Escena 2: Demostración o problema real.
   - Escena 3: Revelación / mecanismo inteligente.
   - Escena 4: Beneficios / prueba o contraste visual.
   - Escena 5: Llamado a la acción claro hacia ${brand} / ${domain}.
3. OPCIONES VISUALES Y SONORAS VÁLIDAS (USA EXACTAMENTE ESTOS VALORES):
   - environment: "env_saas_studio", "env_saas_tech", "env_saas_retail", "env_saas_gold", "env_door_room", "env_saas_dark_slate", "env_saas_clean_light", "env_saas_dark_emerald", "env_ocean_nature", "env_studio_ringlight", "env_store_business", "env_tv_livingroom", "env_brain_xray", "env_ai_lab", "env_earth_magma", "env_cyber_city", "env_radial_fire".
   - graphicType: "saas_iphone_whatsapp_flow", "saas_ios_toggle_action", "saas_3d_product_fanout", "saas_pos_scanner_register", "saas_growth_chart_ticker", "saas_nfc_qr_plaque", "bacteria_microscope_25d", "eye_blindspot_test_25d", "viral_hook_scoreboard_25d", "actor_door_push", "actor_arms_floating", "actor_brain_nerves", "actor_owner_stressed", "nakkio_chat", "posent_terminal", "ntradar_scanner", "ntdesweb_code", "actor_rocket_launch", "actor_money_rain", "actor_iceberg_deep", "actor_magnifying_glass", "ai_brain_workflow", "checklist_pro", "strike_cards", "comparison_split", "cta_conversion".
   - overlayImg1 (opcional SVG 2.5D): "", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/personajes/emprendedor_exito.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/cohete_despegue_pro.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/cerebro_neuronal_3d.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/celular_whatsapp_venta.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/candado_seguridad_cyber.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/grafica_crecimiento_verde.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/trofeo_exito_oro.svg", "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/sellos/sello_estafa_peligro.svg".
   - cameraMotion: "cam-dynamic-push", "cam-dutch-tilt", "cam-snap-zoom", "cam-whip-pan", "cam-drift-left", "cam-zoom-in", "cam-zoom-out", "cam-impact-shake".
   - transition: "trans-zoom-burst", "trans-slide-left", "trans-flash-white", "trans-glitch", "trans-crossfade", "trans-flash-wipe".
   - sfx / sfxBeat2 / sfxBeat3: "FXS/vine boom.mp3", "FXS/whoosh.mp3", "FXS/pop 2.mp3", "FXS/cash.mp3", "FXS/coin.mp3", "FXS/punch.mp3", "FXS/transition.mp3", "FXS/sudden-suspense.mp3", "impact", "whoosh", "pop", "cash", "cyber", "ding".
   - headlineColor: "#facc15", "#22c55e", "#38bdf8", "#ef4444", "#f97316", "#ffffff".

RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO:
{
  "brand": "${brand}",
  "domain": "${domain}",
  "priceTag": "MÉTODO PRO",
  "ctaText": "SÍGUEME ${brand.toUpperCase()}",
  "highlightStyle": "${subStyle}",
  "scenes": [
    {
      "duration": 4300,
      "environment": "env_saas_studio",
      "cameraMotion": "cam-dynamic-push",
      "transition": "trans-zoom-burst",
      "script": "Texto de narración con tildes perfectas.",
      "bannerTop": "FRASE ARRIBA",
      "bannerHighlight": "FRASE CLAVE",
      "bottomRibbon": "CINTA INFERIOR",
      "timerBadge": "30s",
      "graphicType": "saas_growth_chart_ticker",
      "overlayImg1": "ELEMENTOS/pack_elementos_virales_2d_nt/elementos/objetos/cohete_despegue_pro.svg",
      "sfx": "FXS/vine boom.mp3",
      "sfxBeat2": "FXS/pop 2.mp3",
      "sfxBeat3": "FXS/cash.mp3",
      "headlineColor": "#facc15",
      "reactionEmoji": "🚀",
      "card1": "Detalle 1",
      "card2": "Detalle 2",
      "card3": "Detalle 3"
    }
  ]
}`;

            try {
                let validGeneratedConfig = null;
                let successfulCandidateName = '';
                let lastError = '';

                // 1. Intentar primero a través del endpoint /api/gemini (prioriza clave enviada o clave guardada en tu cuenta MongoDB Atlas)
                try {
                    const srvHeaders = { 'Content-Type': 'application/json' };
                    if (apiKey) srvHeaders['x-gemini-key'] = apiKey;
                    if (typeof currentUserToken !== 'undefined' && currentUserToken) {
                        srvHeaders['Authorization'] = 'Bearer ' + currentUserToken;
                    }
                    const srvRes = await fetch('/api/gemini', {
                        method: 'POST',
                        headers: srvHeaders,
                        body: JSON.stringify({
                            prompt,
                            apiKey: apiKey || undefined,
                            topic,
                            brand,
                            domain,
                            formula,
                            highlightStyle: subStyle
                        })
                    });
                    const srvData = await srvRes.json().catch(() => ({}));
                    const srvGenerated = srvData && (srvData.config || srvData.script);
                    if (srvRes.ok && srvData && srvData.success && srvGenerated && Array.isArray(srvGenerated.scenes) && srvGenerated.scenes.length >= 2) {
                        validGeneratedConfig = srvGenerated;
                        successfulCandidateName = srvData.model || 'Gemini Server';
                    } else if (!srvRes.ok && srvData.error) {
                        lastError = srvData.error;
                    }
                } catch (srvErr) {
                    lastError = srvErr.message;
                }

                // 2. Si el backend no completó (ej. preview estático) y tenemos apiKey local, ejecutar cascada moderna 2.5/2.0 directa
                if (!validGeneratedConfig && apiKey) {
                    function isEligibleGeminiModel(name) {
                        if (!name) return false;
                        const n = name.toLowerCase();
                        if (!n.includes('gemini-')) return false;
                        if (n.includes('tts') || n.includes('embed') || n.includes('audio') ||
                            n.includes('imagen') || n.includes('image') || n.includes('gemma') || n.includes('learnlm') ||
                            n.includes('robotics') || n.includes('medlm') || n.includes('lyria') ||
                            n.includes('transcribe') || n.includes('deep-research') || n.includes('nano-banana')) {
                            return false;
                        }
                        return true;
                    }

                    function scoreGeminiModel(name) {
                        const n = name.toLowerCase();
                        if (n.includes('gemini-3.1-flash-lite') && !n.includes('preview')) return 120;
                        if (n.includes('gemini-flash-lite-latest')) return 115;
                        if (n.includes('gemini-3-flash-preview')) return 110;
                        if (n.includes('gemini-3.5-flash-lite')) return 105;
                        if (n.includes('gemini-3.5-flash')) return 100;
                        if (n.includes('gemini-2.5-flash') && !n.includes('lite')) return 70;
                        if (n.includes('flash')) return 60;
                        return 30;
                    }

                    const discoveredModels = [];
                    try {
                        const resBeta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
                        if (resBeta.ok) {
                            const dataBeta = await resBeta.json();
                            (dataBeta.models || []).forEach(m => {
                                if (isEligibleGeminiModel(m.name) && m.supportedGenerationMethods?.includes('generateContent')) {
                                    discoveredModels.push({ apiVersion: 'v1beta', name: m.name, score: scoreGeminiModel(m.name) });
                                }
                            });
                        }
                    } catch (e) {}

                    discoveredModels.sort((a, b) => b.score - a.score);
                    const candidateEndpoints = discoveredModels.map(dm => ({
                        url: `https://generativelanguage.googleapis.com/${dm.apiVersion}/${dm.name}:generateContent?key=${encodeURIComponent(apiKey)}`,
                        name: `${dm.name.replace('models/', '')} (${dm.apiVersion})`
                    }));

                    const staticWaterfall = [
                        { url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`, name: 'gemini-3.1-flash-lite (v1beta)' },
                        { url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${encodeURIComponent(apiKey)}`, name: 'gemini-flash-lite-latest (v1beta)' },
                        { url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${encodeURIComponent(apiKey)}`, name: 'gemini-3-flash-preview (v1beta)' },
                        { url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`, name: 'gemini-3.5-flash-lite (v1beta)' }
                    ];
                    staticWaterfall.forEach(sw => {
                        if (!candidateEndpoints.some(ce => ce.url === sw.url)) candidateEndpoints.push(sw);
                    });

                    const strictPrompt = prompt + "\n\nIMPORTANTE: Responde ÚNICAMENTE con JSON válido comenzando con { y terminando con }.";

                    for (let i = 0; i < candidateEndpoints.length; i++) {
                        const candidate = candidateEndpoints[i];
                        step1.innerHTML = `<span>⏳</span> Conectando con ${candidate.name}...`;

                        try {
                            let res = await fetch(candidate.url, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    contents: [{ parts: [{ text: strictPrompt }] }],
                                    generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
                                })
                            });
                            if (!res.ok && res.status === 400) {
                                res = await fetch(candidate.url, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        contents: [{ parts: [{ text: strictPrompt }] }],
                                        generationConfig: { temperature: 0.7 }
                                    })
                                });
                            }
                            if (res.ok) {
                                const data = await res.json().catch(() => null);
                                const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                                let cleanJsonStr = rawText.trim();
                                const m = cleanJsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                                if (m) cleanJsonStr = m[1].trim();
                                else {
                                    const f = cleanJsonStr.indexOf('{');
                                    const l = cleanJsonStr.lastIndexOf('}');
                                    if (f !== -1 && l > f) cleanJsonStr = cleanJsonStr.substring(f, l + 1);
                                }
                                const parsed = JSON.parse(cleanJsonStr);
                                if (parsed && Array.isArray(parsed.scenes) && parsed.scenes.length >= 2) {
                                    validGeneratedConfig = parsed;
                                    successfulCandidateName = candidate.name;
                                    break;
                                }
                            } else {
                                const errData = await res.json().catch(() => ({}));
                                lastError = errData.error?.message || `HTTP ${res.status}`;
                                if (res.status === 400 && lastError.toLowerCase().includes('api key')) {
                                    throw new Error('Tu Google Gemini API Key es inválida o fue revocada.');
                                }
                            }
                        } catch (fetchErr) {
                            lastError = fetchErr.message;
                            if (lastError.includes('API Key')) throw fetchErr;
                        }
                    }
                }

                if (!validGeneratedConfig) {
                    throw new Error(lastError || 'No se pudo generar el guion con Gemini. Verifica tu clave API y tu cuota en aistudio.google.com.');
                }

                step1.innerHTML = `<span>✓</span> Conectado a Gemini (${successfulCandidateName})`;
                step2.innerHTML = '<span>✓</span> Guion viral con ortografía y ritmo generado';

                validGeneratedConfig.highlightStyle = subStyle;
                currentConfig = validGeneratedConfig;
                synchronizeAllSceneDurations();
                syncGlobalInputsFromConfig();
                saveStateToLocalStorage();

                await autoNarrateGeneratedVideo(step3);
                step3.innerHTML = '<span>✓</span> ¡Video ensamblado con escenas, voz y SFX reales!';

                setTimeout(() => {
                    closeGeminiModal();
                    loadingBox.classList.add('hidden');
                    btn.disabled = false;
                    btn.classList.remove('opacity-50');
                    playSFX('ding');
                    sceneStartTime = performance.now();
                    renderScene(0);
                    renderActiveSceneEditor();
                    if (typeof showStudioToast === 'function') {
                        showStudioToast('🎬 ¡Clip listo! Presiona ▶ Play o 🔴 Grabar', 4500);
                    }
                }, 450);
            } catch (err) {
                console.error('Error con Gemini API:', err);
                step1.innerHTML = `<span>❌</span> ${err.message}`;
                alert(`❌ Error al generar con Gemini:\n${err.message}\n\nVerifica tu clave API en "🔑 Claves API" o en aistudio.google.com.`);
                loadingBox.classList.add('hidden');
                btn.disabled = false;
                btn.classList.remove('opacity-50');
            }
        }

        
