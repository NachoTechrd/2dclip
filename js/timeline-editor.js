        // ==========================================
        // 7. TIMELINE LOOP & PLAYBACK CONTROLS
        // ==========================================
                let loopMode = 'single'; // 'single' (repite la escena actual al editar) o 'all' (repite todo el video)

        function toggleLoopMode() {
            loopMode = (loopMode === 'single') ? 'all' : 'single';
            const btn = document.getElementById('loop-mode-btn');
            if (btn) {
                if (loopMode === 'single') {
                    btn.innerHTML = '🔂 Bucle: Solo Escena';
                    btn.className = 'px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1 shadow-sm';
                    btn.title = 'Bucle activo en la escena actual: permite editar con calma mientras se repite la escena';
                } else {
                    btn.innerHTML = '🔁 Bucle: Todo el Video';
                    btn.className = 'px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1';
                    btn.title = 'Bucle continuo por todas las escenas de la historia';
                }
            }
        }

        function isUserEditingInEditor() {
            const active = document.activeElement;
            if (!active) return false;
            if (active.isContentEditable) return true;
            if (active.classList && active.classList.contains('nt-stage-text-editable')) return true;
            const tag = (active.tagName || '').toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
            const editorEl = document.getElementById('active-scene-editor');
            return Boolean(editorEl && editorEl.contains(active));
        }

        function ensureTickLoop() {
            if (!animFrameId) {
                animFrameId = requestAnimationFrame(tickLoop);
            }
        }

        function tickLoop(now) {
            animFrameId = requestAnimationFrame(tickLoop);
            if (!isPlaying || !currentConfig || !Array.isArray(currentConfig.scenes) || currentConfig.scenes.length === 0) {
                return;
            }

            try {
                if (currentSceneIndex >= currentConfig.scenes.length) {
                    currentSceneIndex = 0;
                }

                const scene = currentConfig.scenes[currentSceneIndex];
                const naturalDuration = getSceneDurationMs(scene);
                const elapsed = now - sceneStartTime;

                // 1. Progress Bar Update: Hold at 98% if speech is still talking past nominal duration
                const rawPct = Math.min(100, (elapsed / naturalDuration) * 100);

                // --- MOTOR DE COREOGRAFÍA NARRATIVA EN 3 COMPASES (BEAT 1, 2, 3) ---
                const vectorStageEl = document.getElementById('vector-graphic-stage');
                if (vectorStageEl) {
                    let targetBeat = 1;
                    if (rawPct >= 64) targetBeat = 3;
                    else if (rawPct >= 32) targetBeat = 2;

                    const currentBeatAttr = parseInt(vectorStageEl.getAttribute('data-active-beat') || '0', 10);
                    if (currentBeatAttr !== targetBeat) {
                        vectorStageEl.setAttribute('data-active-beat', String(targetBeat));
                        vectorStageEl.classList.remove('stage-beat-1', 'stage-beat-2', 'stage-beat-3');
                        vectorStageEl.classList.add(`stage-beat-${targetBeat}`);
                        if (targetBeat === 2) {
                            playCustomOrSynthSFX(scene.sfxBeat2 || 'pop', 2);
                        }
                        if (targetBeat === 3) {
                            playCustomOrSynthSFX(scene.sfxBeat3 || 'cyber', 3);
                            const sEl = document.getElementById('stage-rubber-stamp');
                            if (sEl && scene.stampText && scene.stampText.trim()) {
                                sEl.textContent = scene.stampText.trim().toUpperCase();
                                sEl.classList.remove('hidden', 'rubber-stamp-slam');
                                void sEl.offsetWidth; // Reinicia el keyframe de golpe
                                sEl.classList.add('rubber-stamp-slam');
                            }
                            const bEl = document.getElementById('stage-jail-bars');
                            if (bEl && scene.jailBars) {
                                bEl.classList.remove('hidden');
                            }
                        }
                    }
                }

                const activeBar = document.getElementById(`prog-bar-${currentSceneIndex}`);
                if (activeBar) {
                    if (elapsed >= naturalDuration && isCurrentSpeechPlaying) {
                        activeBar.style.width = '98%';
                    } else {
                        activeBar.style.width = `${rawPct}%`;
                    }
                }

                // 2. Timeline Elapsed Display
                let accumulatedPast = 0;
                for (let i = 0; i < currentSceneIndex; i++) {
                    accumulatedPast += getSceneDurationMs(currentConfig.scenes[i]);
                }
                const totalElapsed = (accumulatedPast + elapsed) / 1000;
                const totalMs = currentConfig.scenes.reduce((acc, s) => acc + getSceneDurationMs(s), 0);
                const timeBadge = document.getElementById('playback-time-badge');
                if (timeBadge) {
                    timeBadge.textContent = `${totalElapsed.toFixed(1)}s / ${(totalMs / 1000).toFixed(1)}s`;
                }

                // 3. Audio Synchronization Lock: NEVER cut off voice mid-sentence!
                if (isCurrentSpeechPlaying) {
                    // Maximum safety limit (16 seconds) in case of an uncaught browser speech freeze
                    if (elapsed < Math.max(naturalDuration + 2500, 16000)) {
                        return; // Wait for voice to finish pronouncing every word!
                    }
                }

                // 4. Natural breathing pause (350ms) after speech ends before advancing
                if (speechFinishTimestamp > 0 && (now - speechFinishTimestamp) < 350) {
                    return; // Smooth pacing buffer
                }

                // 5. Scene Duration Expiration
                if (elapsed >= naturalDuration) {
                    sceneStartTime = now;
                    speechFinishTimestamp = 0;

                    // Si el modo de repetición es 'single' (solo la escena actual mientras se edita):
                    if (loopMode === 'single' && !isRecordingWebM && !isCleanRecordingActive) {
                        renderScene(currentSceneIndex);
                        return;
                    }

                    // Check if we reached the end of the final scene of the video:
                    if (currentSceneIndex >= currentConfig.scenes.length - 1) {
                        if (isRecordingWebM) {
                            finishInBrowserRecording();
                            return;
                        }
                        if (isCleanRecordingActive) {
                            finishCleanRecording();
                            return;
                        }
                        // Looping preview: return to scene 0
                        currentSceneIndex = 0;
                        renderScene(0);
                        if (!isUserEditingInEditor()) {
                            renderActiveSceneEditor();
                        }
                        renderSceneTabsStrip();
                        preloadAllSceneVoices();
                        return;
                    }

                    // Advance to NEXT scene (Scene 0 -> Scene 1 -> Scene 2 -> Scene 3 -> Scene 4...)
                    const nextIdx = currentSceneIndex + 1;
                    currentSceneIndex = nextIdx;
                    renderScene(nextIdx);
                    if (!isUserEditingInEditor()) {
                        renderActiveSceneEditor();
                    }
                    renderSceneTabsStrip();
                }
            } catch (loopErr) {
                console.error("TickLoop frame error:", loopErr);
            }
        }

        function togglePlayPause() {
            if (typeof isCurrentlyInteractingStage !== 'undefined' && isCurrentlyInteractingStage) return;
            if (document.activeElement && document.activeElement.isContentEditable) return;
            isPlaying = !isPlaying;
            const btn = document.getElementById('play-pause-btn');
            if (isPlaying) {
                unlockSpeechAudio();
                sceneStartTime = performance.now();
                if (btn) {
                    btn.innerHTML = '⏸ Pausar';
                    btn.className = 'px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-amber-500/25';
                }
                if (bgmEnabled) {
                    startBGMDrone();
                }
                renderScene(currentSceneIndex);
                ensureTickLoop();
            } else {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                isCurrentSpeechPlaying = false;
                speechFinishTimestamp = 0;
                clearWordTimers();
                stopBGMDrone();
                if (activeSceneAudioPlayer) activeSceneAudioPlayer.pause();
                if (btn) {
                    btn.innerHTML = '▶ Reproducir';
                    btn.className = 'px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30';
                }
            }
        }

        function restartVideo() {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            isCurrentSpeechPlaying = false;
            speechFinishTimestamp = 0;
            clearWordTimers();
            if (activeSceneAudioPlayer) activeSceneAudioPlayer.pause();

            sceneStartTime = performance.now();
            isPlaying = true;
            if (bgmEnabled) {
                startBGMDrone();
            }
            const btn = document.getElementById('play-pause-btn');
            if (btn) {
                btn.innerHTML = '⏸ Pausar';
                btn.className = 'px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-amber-500/25';
            }
            currentSceneIndex = 0;
            renderScene(0);
            renderActiveSceneEditor();
            ensureTickLoop();
        }

        function prevSceneManual() {
            sceneStartTime = performance.now();
            const prevIdx = (currentSceneIndex - 1 + currentConfig.scenes.length) % currentConfig.scenes.length;
            renderScene(prevIdx);
            renderActiveSceneEditor();
            ensureTickLoop();
        }

        function nextSceneManual() {
            sceneStartTime = performance.now();
            const nextIdx = (currentSceneIndex + 1) % currentConfig.scenes.length;
            renderScene(nextIdx);
            renderActiveSceneEditor();
            ensureTickLoop();
        }

        function selectSceneFromEditor(idx) {
            sceneStartTime = performance.now();
            renderScene(idx);
            renderActiveSceneEditor();
            ensureTickLoop();
        }

        function toggleSFX() {
            sfxEnabled = !sfxEnabled;
            const btn = document.getElementById('sfx-toggle-btn');
            btn.textContent = sfxEnabled ? '🔊 SFX: ON' : '🔇 SFX: OFF';
            btn.className = sfxEnabled
                ? 'px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition'
                : 'px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold transition';
        }

        function toggleTTS() {
            ttsEnabled = !ttsEnabled;
            if (!ttsEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
            const btn = document.getElementById('tts-toggle-btn');
            btn.textContent = ttsEnabled ? '🗣️ Voz IA: ON' : '🗣️ Voz IA: OFF';
            btn.className = ttsEnabled
                ? 'px-2.5 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition'
                : 'px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold transition';
        }

        // ==========================================
        // 8. EDITOR CONTROLS & TIMELINE MANAGEMENT
        // ==========================================
        function syncTemplateSelectorUI(key) {
            const sel = document.getElementById('header-template-select');
            if (sel && key && Array.from(sel.options || []).some(o => o.value === key)) {
                sel.value = key;
            }
            const mobSel = document.getElementById('mobile-template-select');
            if (mobSel) {
                if (sel && mobSel.options && mobSel.options.length <= 1 && sel.innerHTML) {
                    mobSel.innerHTML = sel.innerHTML;
                }
                if (key && Array.from(mobSel.options || []).some(o => o.value === key)) {
                    mobSel.value = key;
                }
            }
            document.querySelectorAll('.tpl-btn').forEach(b => {
                b.className = 'tpl-btn px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all text-slate-300 hover:bg-slate-800';
            });
            const activeBtn = document.getElementById(`btn-tpl-${key}`);
            if (activeBtn) {
                activeBtn.className = 'tpl-btn px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all bg-amber-500 text-slate-950 shadow';
            }
            document.querySelectorAll('.m-tpl-btn').forEach(b => {
                b.className = 'm-tpl-btn px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-300 bg-slate-900 border border-slate-800 flex-shrink-0 hover:text-white transition';
            });
            const activeMobileTpl = document.getElementById(`m-tpl-${key}`);
            if (activeMobileTpl) {
                activeMobileTpl.className = 'm-tpl-btn px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500 text-slate-950 flex-shrink-0 shadow transition';
            }
        }

        function loadTemplate(key) {
            if (!TEMPLATES[key]) return;
            currentConfig = JSON.parse(JSON.stringify(TEMPLATES[key]));
            currentConfig._templateKey = key;
            synchronizeAllSceneDurations();
            syncTemplateSelectorUI(key);
            syncGlobalInputsFromConfig();
            saveStateToLocalStorage();
            sceneStartTime = performance.now();
            renderScene(0);
            renderActiveSceneEditor();
        }

        function syncGlobalInputsFromConfig() {
            document.getElementById('input-brand-name').value = currentConfig.brand || '@nachotechrd';
            document.getElementById('input-domain-name').value = currentConfig.domain || 'nachotechrd';
            document.getElementById('input-price-tag').value = currentConfig.priceTag || 'SÍGUEME HOY';
            document.getElementById('input-cta-text').value = currentConfig.ctaText || 'SÍGUEME @NACHOTECH';
            document.getElementById('input-highlight-style').value = currentConfig.highlightStyle || 'hl-box';
        }

        function updateGlobalBrand() {
            currentConfig.brand = document.getElementById('input-brand-name').value;
            currentConfig.domain = document.getElementById('input-domain-name').value;
            currentConfig.priceTag = document.getElementById('input-price-tag').value;
            currentConfig.ctaText = document.getElementById('input-cta-text').value;
            renderScene(currentSceneIndex);
        }

        function updateHighlightStyle(styleClass) {
            currentConfig.highlightStyle = styleClass;
            renderScene(currentSceneIndex);
        }

        function renderSceneTabsStrip() {
            const strip = document.getElementById('scene-tabs-strip');
            strip.innerHTML = currentConfig.scenes.map((_, i) => `
                <button onclick="selectSceneFromEditor(${i})" class="px-3 py-1 rounded-xl text-xs font-extrabold transition ${
                    i === currentSceneIndex
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                        : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                }">
                    Escena ${i + 1}
                </button>
            `).join('');
        }

        function renderActiveSceneEditor() {
            const scene = currentConfig.scenes[currentSceneIndex];
            const container = document.getElementById('active-scene-editor');
            container.innerHTML = `
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-black uppercase tracking-wider text-amber-400">Escena ${currentSceneIndex + 1} de ${currentConfig.scenes.length}</span>
                        <button onclick="speakText(currentConfig.scenes[${currentSceneIndex}].script)" class="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-bold hover:bg-blue-500/25">
                            🔊 Probar Voz
                        </button>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="autoCalcDuration()" class="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" title="Calcula duración óptima según palabras">
                            ⏱ Auto-Tiempo
                        </button>
                        <label class="text-[11px] text-slate-400 font-bold">Seg:</label>
                        <input type="number" step="0.2" min="2" max="15" value="${(getSceneDurationMs(scene) / 1000).toFixed(1)}" onchange="updateSceneField('duration', this.value * 1000)" class="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white text-center">
                        ${currentConfig.scenes.length > 2 ? `<button onclick="deleteCurrentScene()" class="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20">🗑</button>` : ''}
                    </div>
                </div>

                <div>
                    <div class="flex items-center justify-between mb-1">
                        <label class="block text-[10px] font-extrabold uppercase text-slate-400">1. Narración / Subtítulos en Pantalla</label>
                        <button type="button" id="btn-enhance-scene-azure" onclick="enhanceActiveSceneWithAzure()" class="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/35 hover:to-indigo-500/35 border border-sky-400/40 text-sky-200 text-[10px] font-extrabold transition">
                            ✨ Mejorar Texto con Azure GPT
                        </button>
                    </div>
                    <textarea id="editor-input-script" rows="2" oninput="updateSceneField('script', this.value)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-amber-400">${scene.script}</textarea>
                </div>

                <!-- SCENE CUSTOM AUDIO / VOICE RECORDER -->
                <div class="bg-slate-950 border border-slate-800/90 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-black uppercase text-purple-400">🎙️ Voz de esta Escena:</span>
                        <span id="scene-audio-status-${currentSceneIndex}" class="text-[10px] font-bold px-2 py-0.5 rounded ${scene.customAudioUrl ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">
                            ${scene.customAudioUrl ? '✓ Audio Personalizado Activo' : '🗣️ Usando Voz IA del Sistema'}
                        </span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button onclick="toggleRecordSceneMic(${currentSceneIndex})" id="btn-scene-mic-${currentSceneIndex}" class="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1 transition">
                            <span>🎙️</span> <span id="mic-label-${currentSceneIndex}">Grabar con Micrófono</span>
                        </button>
                        <label class="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold cursor-pointer transition">
                            📁 Subir MP3/WAV
                            <input type="file" accept="audio/*" onchange="uploadSceneAudio(event, ${currentSceneIndex})" class="hidden">
                        </label>
                        ${scene.customAudioUrl ? `
                            <button onclick="previewSceneAudio(${currentSceneIndex})" class="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">▶ Oír</button>
                            <button onclick="deleteSceneAudio(${currentSceneIndex})" class="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold">✕</button>
                        ` : ''}
                    </div>
                </div>


                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <div>
                        <label class="block text-[10px] font-extrabold uppercase text-amber-400 mb-1">🏞️ Escenario / Lugar</label>
                        <select onchange="updateSceneField('environment', this.value)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2 py-1.5 text-xs font-extrabold text-white focus:outline-none focus:border-amber-400">
                            <option value="env_saas_studio" ${scene.environment === 'env_saas_studio' ? 'selected' : ''}>🎬 Estudio Cinemático Obsidian + Bokeh</option>
                            <option value="env_saas_tech" ${scene.environment === 'env_saas_tech' ? 'selected' : ''}>⚡ Tech HUD Grid Matrix</option>
                            <option value="env_saas_retail" ${scene.environment === 'env_saas_retail' ? 'selected' : ''}>🛍️ Retail Boutique Spotlight</option>
                            <option value="env_saas_gold" ${scene.environment === 'env_saas_gold' ? 'selected' : ''}>👑 Bóveda de Lujo Oro 24K</option>
                            <option value="env_door_room" ${scene.environment === 'env_door_room' ? 'selected' : ''}>🚪 Marco de Puerta / Habitación</option>
                            <option value="env_saas_clean_light" ${scene.environment === 'env_saas_clean_light' ? 'selected' : ''}>✨ SaaS Clean Light (Buzzfy White)</option>
                            <option value="env_saas_dark_emerald" ${scene.environment === 'env_saas_dark_emerald' ? 'selected' : ''}>💎 SaaS Dark Emerald (Rubroo Green)</option>
                            <option value="env_saas_dark_slate" ${scene.environment === 'env_saas_dark_slate' ? 'selected' : ''}>🌌 SaaS Dark Slate (Tech Midnight)</option>
                            <option value="env_underwater_abyss"  ${scene.environment === 'env_underwater_abyss' ? 'selected' : ''}>🦈 Fondo del Océano (Submarino Vivo)</option>
                            <option value="env_sky_clouds" ${scene.environment === 'env_sky_clouds' ? 'selected' : ''}>✈️ Cielo en Movimiento (Vuelo & Nubes)</option>
                            <option value="env_tropical_beach" ${scene.environment === 'env_tropical_beach' ? 'selected' : ''}>🏝️ Playa Tropical & Subsuelo</option>
                            <option value="env_dark_grid" ${scene.environment === 'env_dark_grid' ? 'selected' : ''}>🌐 Matriz Ciber-Grid 3D</option>
                            <option value="env_ocean_nature" ${scene.environment === 'env_ocean_nature' ? 'selected' : ''}>🌊 Naturaleza: Cascada & Mar</option>
                            <option value="env_studio_ringlight" ${scene.environment === 'env_studio_ringlight' ? 'selected' : ''}>💡 Estudio + Aro de Luz</option>
                            <option value="env_store_business" ${scene.environment === 'env_store_business' ? 'selected' : ''}>🏪 Mostrador Negocio / Tienda</option>
                            <option value="env_tv_livingroom" ${scene.environment === 'env_tv_livingroom' ? 'selected' : ''}>🛋️ Sala Nocturna + Smart TV</option>
                            <option value="env_brain_xray" ${scene.environment === 'env_brain_xray' ? 'selected' : ''}>🧠 Laboratorio Rayos X / Cerebro</option>
                            <option value="env_ai_lab" ${scene.environment === 'env_ai_lab' ? 'selected' : ''}>🧪 Laboratorio IA & Hologramas</option>
                            <option value="env_earth_magma" ${scene.environment === 'env_earth_magma' ? 'selected' : ''}>🌋 Corte Terrestre & Magma</option>
                            <option value="env_cyber_city" ${scene.environment === 'env_cyber_city' ? 'selected' : ''}>🌆 Ciudad Cyberpunk / Servidores</option>
                            <option value="env_radial_fire" ${scene.environment === 'env_radial_fire' ? 'selected' : ''}>🔥 Fondo Radial Fuego (CTA)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold uppercase text-cyan-400 mb-1">🎭 Ilustración / Personaje</label>
                        <select onchange="updateSceneField('graphicType', this.value)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2 py-1.5 text-xs font-extrabold text-cyan-300 focus:outline-none focus:border-amber-400">
                                                         <option value="saas_iphone_whatsapp_flow" ${scene.graphicType === 'saas_iphone_whatsapp_flow' ? 'selected' : ''}>📱 SaaS iPhone WhatsApp Flow (Nakkio)</option>
                             <option value="saas_ios_toggle_action" ${scene.graphicType === 'saas_ios_toggle_action' ? 'selected' : ''}>🔘 SaaS iOS Toggle Switch (Buzzfy)</option>
                             <option value="saas_3d_product_fanout" ${scene.graphicType === 'saas_3d_product_fanout' ? 'selected' : ''}>🃏 SaaS 3D Product Fan-Out (Catálogo)</option>
                             <option value="saas_pos_scanner_register" ${scene.graphicType === 'saas_pos_scanner_register' ? 'selected' : ''}>🏪 SaaS POS Scanner Láser (Posent)</option>
                             <option value="saas_growth_chart_ticker" ${scene.graphicType === 'saas_growth_chart_ticker' ? 'selected' : ''}>📈 SaaS Growth Chart & Ticker (Métricas)</option>
                             <option value="saas_nfc_qr_plaque" ${scene.graphicType === 'saas_nfc_qr_plaque' ? 'selected' : ''}>📶 SaaS Placa NFC & QR (Rubroo)</option>
                             <option value="coconut_water_tree"  ${scene.graphicType === 'coconut_water_tree' ? 'selected' : ''}>🥥 Palmera & Filtración de Coco</option>
                             <option value="smartphone_radio_waves" ${scene.graphicType === 'smartphone_radio_waves' ? 'selected' : ''}>📱 Smartphone & Ondas de Radio</option>
                             <option value="internet_submarine_cables" ${scene.graphicType === 'internet_submarine_cables' ? 'selected' : ''}>🌊 Cables Submarinos de Internet</option>
                             <option value="airplane_aerodynamics" ${scene.graphicType === 'airplane_aerodynamics' ? 'selected' : ''}>✈️ Avión & Sustentación Bernoulli</option>
                             <option value="clock_time_warp" ${scene.graphicType === 'clock_time_warp' ? 'selected' : ''}>⏳ Reloj Vórtice del Tiempo</option>
                             <option value="gold_wealth_pyramid" ${scene.graphicType === 'gold_wealth_pyramid' ? 'selected' : ''}>💰 Pirámide de Oro & Activos</option>
                             <option value="glucose_stomach_digest" ${scene.graphicType === 'glucose_stomach_digest' ? 'selected' : ''}>🍞 Digestión, Glucosa & Sueño</option>
                             <option value="neural_matrix_math" ${scene.graphicType === 'neural_matrix_math' ? 'selected' : ''}>🤖 Matriz Matemática & Tokens IA</option>
                             <option value="video_timeline_director" ${scene.graphicType === 'video_timeline_director' ? 'selected' : ''}>🎬 Claqueta & Timeline de Video</option>
                             <option value="placebo_pill_spark" ${scene.graphicType === 'placebo_pill_spark' ? 'selected' : ''}>💊 Cápsula Placebo & Sanación</option>
                             <option value="actor_door_push" ${scene.graphicType === 'actor_door_push' ? 'selected' : ''}>🧍‍♂️ Empujar Puerta (Fuerza)</option>
                            <option value="actor_arms_floating" ${scene.graphicType === 'actor_arms_floating' ? 'selected' : ''}>🦅 Brazos Flotando (Alas)</option>
                            <option value="actor_salt_ocean" ${scene.graphicType === 'actor_salt_ocean' ? 'selected' : ''}>🧂 Salero Gigante en Mar</option>
                            <option value="actor_rain_rocks" ${scene.graphicType === 'actor_rain_rocks' ? 'selected' : ''}>🌧️ Lluvia Erosionando Rocas</option>
                            <option value="actor_brain_nerves" ${scene.graphicType === 'actor_brain_nerves' ? 'selected' : ''}>🧠 Impulso Eléctrico Cerebral</option>
                            <option value="actor_ringlight_lie" ${scene.graphicType === 'actor_ringlight_lie' ? 'selected' : ''}>💍 Móvil "TE MINTIERON"</option>
                            <option value="actor_owner_stressed" ${scene.graphicType === 'actor_owner_stressed' ? 'selected' : ''}>😰 Dueño Colapsado (99+ Chats)</option>
                            <option value="nakkio_chat" ${scene.graphicType === 'nakkio_chat' ? 'selected' : ''}>🤖 Nakkio: Chat WhatsApp IA</option>
                            <option value="posent_terminal" ${scene.graphicType === 'posent_terminal' ? 'selected' : ''}>🏪 Posent: Terminal POS & Caja</option>
                            <option value="ntradar_scanner" ${scene.graphicType === 'ntradar_scanner' ? 'selected' : ''}>📡 NTRadar: Escáner Táctico</option>
                            <option value="ntdesweb_code" ${scene.graphicType === 'ntdesweb_code' ? 'selected' : ''}>💻 NTDESWEB: Código & Web</option>
                            <option value="actor_rocket_launch" ${scene.graphicType === 'actor_rocket_launch' ? 'selected' : ''}>🚀 Cohete Despegando</option>
                            <option value="actor_money_rain" ${scene.graphicType === 'actor_money_rain' ? 'selected' : ''}>💰 Lluvia de Billetes & Ganancia</option>
                            <option value="actor_iceberg_deep" ${scene.graphicType === 'actor_iceberg_deep' ? 'selected' : ''}>🧊 Iceberg: 90% Oculto</option>
                            <option value="actor_magnifying_glass" ${scene.graphicType === 'actor_magnifying_glass' ? 'selected' : ''}>🔍 Lupa Detectora de Fuga</option>
                            <option value="ai_brain_workflow" ${scene.graphicType === 'ai_brain_workflow' ? 'selected' : ''}>⚡ Flujo Neuronal IA (3 Nodos)</option>
                            <option value="checklist_pro" ${scene.graphicType === 'checklist_pro' ? 'selected' : ''}>📱 Móvil + 3 Checks Verdes</option>
                            <option value="strike_cards" ${scene.graphicType === 'strike_cards' ? 'selected' : ''}>❌ 3 Problemas Tachados en Vivo</option>
                            <option value="comparison_split" ${scene.graphicType === 'comparison_split' ? 'selected' : ''}>⚖️ Comparativa: Antes vs Ahora</option>
                            <option value="nt_vault_hub" ${scene.graphicType === 'nt_vault_hub' ? 'selected' : ''}>📁 Bóveda Ecosistema NT</option>
                            <option value="cta_conversion" ${scene.graphicType === 'cta_conversion' ? 'selected' : ''}>🚀 Botón Conversión + Clic 👆</option>
                            <option value="route_map_flight" ${scene.graphicType === 'route_map_flight' ? 'selected' : ''}>✈️ Mapa Satelital: Vuelo / Ruta con Trayectoria</option>
                            <option value="walking_dog_stage" ${scene.graphicType === 'walking_dog_stage' ? 'selected' : ''}>🐕 Perro / Cachorro Caminando (Rigging 2D)</option>
                            <option value="walking_person_stage" ${scene.graphicType === 'walking_person_stage' ? 'selected' : ''}>🚶 Persona Caminando (Ciclo Articulado)</option>
                            <option value="modular_building_hole" ${scene.graphicType === 'modular_building_hole' ? 'selected' : ''}>🏛️ Edificio Modular + Letrero + Hueco Billetes</option>
                            <option value="modular_receipt_stamp" ${scene.graphicType === 'modular_receipt_stamp' ? 'selected' : ''}>🧾 Recibo "La Cuenta" + Sello Rojo</option>
                            <option value="dual_image_showcase" ${scene.graphicType === 'dual_image_showcase' ? 'selected' : ''}>🖼️ Showcase Doble Imagen Superpuesta</option>
                            <option value="retro_brick_phone_25d" ${scene.graphicType === 'retro_brick_phone_25d' ? 'selected' : ''}>🧱 Celular Ladrillo 1983 (2.5D)</option>
                            <option value="vintage_computer_bug_25d" ${scene.graphicType === 'vintage_computer_bug_25d' ? 'selected' : ''}>🖥️ Primer Computador ENIAC Bug (2.5D)</option>
                            <option value="judge_gavel_court_25d" ${scene.graphicType === 'judge_gavel_court_25d' ? 'selected' : ''}>⚖️ Tribunal y Mazo del Juez (2.5D)</option>
                            <option value="bacteria_microscope_25d" ${scene.graphicType === 'bacteria_microscope_25d' ? 'selected' : ''}>🦠 Microscopio & Bacterias (10ms)</option>
                            <option value="eye_blindspot_test_25d" ${scene.graphicType === 'eye_blindspot_test_25d' ? 'selected' : ''}>👁️ Test Óptico & Punto Ciego (2.5D)</option>
                            <option value="viral_hook_scoreboard_25d" ${scene.graphicType === 'viral_hook_scoreboard_25d' ? 'selected' : ''}>📊 Tablero Métrica Viral (2.5D)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold uppercase text-emerald-400 mb-1">🎥 Movimiento de Cámara</label>
                        <select onchange="updateSceneField('cameraMotion', this.value)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2 py-1.5 text-xs font-bold text-emerald-300 focus:outline-none focus:border-amber-400">
                            <option value="cam-dynamic-push" ${scene.cameraMotion === 'cam-dynamic-push' ? 'selected' : ''}>🎬 Dynamic Push + Micro Shake Pro</option>
                            <option value="cam-zoom-in" ${scene.cameraMotion === 'cam-zoom-in' ? 'selected' : ''}>🔍 Zoom In Dramático</option>
                            <option value="cam-zoom-out" ${scene.cameraMotion === 'cam-zoom-out' ? 'selected' : ''}>🔭 Zoom Out Revelador</option>
                            <option value="cam-snap-zoom" ${scene.cameraMotion === 'cam-snap-zoom' ? 'selected' : ''}>⚡ Snap Zoom Viral</option>
                            <option value="cam-pan-right" ${scene.cameraMotion === 'cam-pan-right' ? 'selected' : ''}>↔️ Paneo Lateral Cinematográfico</option>
                            <option value="cam-drift-left" ${scene.cameraMotion === 'cam-drift-left' ? 'selected' : ''}>⬅️ Deriva Lateral Suave</option>
                            <option value="cam-dutch-tilt" ${scene.cameraMotion === 'cam-dutch-tilt' ? 'selected' : ''}>📐 Dutch Tilt (Ángulo Épico)</option>
                            <option value="cam-whip-pan" ${scene.cameraMotion === 'cam-whip-pan' ? 'selected' : ''}>💨 Whip Pan (Entrada Rápida)</option>
                            <option value="cam-impact-shake" ${scene.cameraMotion === 'cam-impact-shake' ? 'selected' : ''}>💥 Sacudida de Impacto (Boom)</option>
                            <option value="cam-shake-intense" ${scene.cameraMotion === 'cam-shake-intense' ? 'selected' : ''}>🌋 Temblor Intenso</option>
                            <option value="cam-tilt-up" ${scene.cameraMotion === 'cam-tilt-up' ? 'selected' : ''}>⬆️ Inclinación Ascendente (Tilt)</option>
                            <option value="cam-orbit-slow" ${scene.cameraMotion === 'cam-orbit-slow' ? 'selected' : ''}>🌀 Flotación & Órbita Suave</option>
                            <option value="cam-zoom-slow" ${scene.cameraMotion === 'cam-zoom-slow' ? 'selected' : ''}>🎥 Zoom Lento Documental</option>
                            <option value="" ${!scene.cameraMotion ? 'selected' : ''}>⏹️ Cámara Fija</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold uppercase text-purple-400 mb-1">✨ Transición de Escena</label>
                        <select onchange="updateSceneField('transition', this.value)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2 py-1.5 text-xs font-bold text-purple-300 focus:outline-none focus:border-amber-400">
                            <option value="trans-zoom-burst" ${scene.transition === 'trans-zoom-burst' ? 'selected' : ''}>💥 Zoom Burst (Empuje)</option>
                            <option value="trans-slide-left" ${scene.transition === 'trans-slide-left' ? 'selected' : ''}>📲 Deslizar Lateral (Swipe Reel)</option>
                            <option value="trans-flash-white" ${scene.transition === 'trans-flash-white' ? 'selected' : ''}>📸 Destello Flash Blanco</option>
                            <option value="trans-glitch" ${scene.transition === 'trans-glitch' ? 'selected' : ''}>👾 Glitch Digital Cyber</option>
                            <option value="trans-crossfade" ${scene.transition === 'trans-crossfade' ? 'selected' : ''}>🌫️ Crossfade Suave</option>
                            <option value="trans-flash-wipe" ${scene.transition === 'trans-flash-wipe' ? 'selected' : ''}>⚡ Destello de Luz (Wipe)</option>
                            <option value="" ${!scene.transition ? 'selected' : ''}>⏹️ Corte Directo</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-6 gap-2">
                    <div class="sm:col-span-2">
                        <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Titular Arriba (Blanco)</label>
                        <input id="editor-input-bannerTop" type="text" placeholder="Ej: TU BRAZO VA A" value="${scene.bannerTop || ''}" oninput="updateSceneField('bannerTop', this.value)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white">
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-[10px] font-extrabold uppercase text-yellow-400 mb-1">Titular Gigante (Impacto)</label>
                        <input id="editor-input-bannerHighlight" type="text" placeholder="Ej: SUBIR SOLO" value="${scene.bannerHighlight || ''}" oninput="updateSceneField('bannerHighlight', this.value)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs font-black text-yellow-400">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold uppercase text-amber-400 mb-1">Color Titular</label>
                        <select onchange="updateSceneField('headlineColor', this.value)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2 py-1.5 text-xs font-bold text-white">
                            <option value="#facc15" ${scene.headlineColor === '#facc15' || !scene.headlineColor ? 'selected' : ''}>🟨 Amarillo</option>
                            <option value="#38bdf8" ${scene.headlineColor === '#38bdf8' ? 'selected' : ''}>🟦 Neón Cian</option>
                            <option value="#34d399" ${scene.headlineColor === '#34d399' ? 'selected' : ''}>🟩 Verde Lima</option>
                            <option value="#ef4444" ${scene.headlineColor === '#ef4444' ? 'selected' : ''}>🟥 Rojo Fuego</option>
                            <option value="#f97316" ${scene.headlineColor === '#f97316' ? 'selected' : ''}>🟧 Naranja</option>
                            <option value="#e879f9" ${scene.headlineColor === '#e879f9' ? 'selected' : ''}>🟪 Rosa Neón</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold uppercase text-rose-400 mb-1">Emoji Reacción</label>
                        <select onchange="updateSceneField('reactionEmoji', this.value)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2 py-1.5 text-xs font-bold text-white">
                            <option value="" ${!scene.reactionEmoji ? 'selected' : ''}>🚫 Ninguno</option>
                            <option value="🤯" ${scene.reactionEmoji === '🤯' ? 'selected' : ''}>🤯 Boom</option>
                            <option value="🚀" ${scene.reactionEmoji === '🚀' ? 'selected' : ''}>🚀 Cohete</option>
                            <option value="💰" ${scene.reactionEmoji === '💰' ? 'selected' : ''}>💰 Dinero</option>
                            <option value="⚠️" ${scene.reactionEmoji === '⚠️' ? 'selected' : ''}>⚠️ Alerta</option>
                            <option value="❌" ${scene.reactionEmoji === '❌' ? 'selected' : ''}>❌ Error</option>
                            <option value="✅" ${scene.reactionEmoji === '✅' ? 'selected' : ''}>✅ Éxito</option>
                            <option value="🔥" ${scene.reactionEmoji === '🔥' ? 'selected' : ''}>🔥 Fuego</option>
                            <option value="😱" ${scene.reactionEmoji === '😱' ? 'selected' : ''}>😱 Shock</option>
                            <option value="⚡" ${scene.reactionEmoji === '⚡' ? 'selected' : ''}>⚡ Rayo</option>
                            <option value="🧠" ${scene.reactionEmoji === '🧠' ? 'selected' : ''}>🧠 Cerebro</option>
                        </select>
                    </div>
                </div>

                    <!-- PANEL MODULAR: 3 PUNTOS DE SONIDO SFX (COMPÁS 1, 2 Y 3) -->
                    <div class="bg-gradient-to-r from-slate-950 via-[#0e1422] to-slate-950 border border-amber-500/30 rounded-xl p-3 space-y-2.5">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px] font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                                <span>🔊</span> Efectos de Sonido en 3 Compases (102 FXS + Synth):
                            </span>
                            <span class="text-[9px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Entrada • Acción • Clímax</span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                                <label class="block text-[9px] font-extrabold uppercase text-slate-400 mb-1">1. Entrada (Compás 1):</label>
                                <div class="flex gap-1">
                                    <select onchange="updateSceneField('sfx', this.value)" class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-amber-300 focus:outline-none">
                                        ${getSFXOptionsHTML(scene.sfx, 'whoosh')}
                                    </select>
                                    <button onclick="playCustomOrSynthSFX(currentConfig.scenes[${currentSceneIndex}].sfx || 'whoosh')" class="px-1.5 py-1 rounded bg-slate-800 text-[10px] hover:bg-slate-700 text-white" title="Probar Sonido">▶</button>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[9px] font-extrabold uppercase text-slate-400 mb-1">2. Acción/Ticker (Compás 2):</label>
                                <div class="flex gap-1">
                                    <select onchange="updateSceneField('sfxBeat2', this.value)" class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-cyan-300 focus:outline-none">
                                        ${getSFXOptionsHTML(scene.sfxBeat2, 'pop')}
                                    </select>
                                    <button onclick="playCustomOrSynthSFX(currentConfig.scenes[${currentSceneIndex}].sfxBeat2 || 'pop')" class="px-1.5 py-1 rounded bg-slate-800 text-[10px] hover:bg-slate-700 text-white" title="Probar Sonido">▶</button>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[9px] font-extrabold uppercase text-slate-400 mb-1">3. Clímax/Sello (Compás 3):</label>
                                <div class="flex gap-1">
                                    <select onchange="updateSceneField('sfxBeat3', this.value)" class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-rose-300 focus:outline-none">
                                        ${getSFXOptionsHTML(scene.sfxBeat3, 'cyber')}
                                    </select>
                                    <button onclick="playCustomOrSynthSFX(currentConfig.scenes[${currentSceneIndex}].sfxBeat3 || 'cyber')" class="px-1.5 py-1 rounded bg-slate-800 text-[10px] hover:bg-slate-700 text-white" title="Probar Sonido">▶</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PANEL MODULAR: 2 IMÁGENES SUPERPUESTAS + PROPS (SELLO ROJO & REJAS) -->
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2.5">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px] font-black text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
                                <span>🖼️</span> Superposición de 2 Imágenes + Props (Estilo Baninter):
                            </span>
                            <div class="flex items-center gap-2">
                                <label class="text-[10px] font-extrabold text-slate-300 flex items-center gap-1 cursor-pointer">
                                    <input type="checkbox" ${scene.jailBars ? 'checked' : ''} onchange="updateSceneField('jailBars', this.checked); renderScene(currentSceneIndex);" class="accent-red-500 rounded">
                                    <span>🔒 Rejas de Cárcel</span>
                                </label>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <!-- Overlay Img 1 -->
                            <div class="sm:col-span-4 bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1.5">
                                <div class="flex items-center justify-between">
                                    <label class="text-[9px] font-extrabold uppercase text-slate-300">Img 1 (Principal):</label>
                                    ${scene.overlayImg1 ? `<button onclick="updateSceneField('overlayImg1', ''); renderScene(currentSceneIndex); renderActiveSceneEditor();" class="text-[9px] text-rose-400 font-bold">✕ Quitar</button>` : ''}
                                </div>
                                <div class="grid grid-cols-3 gap-1">
                                    <label class="bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-1 text-[10px] font-bold text-center text-cyan-300 cursor-pointer truncate">
                                        ${scene.overlayImg1 ? '✓ Subida' : '+ Subir'}
                                        <input type="file" accept="image/*" onchange="uploadOverlayImage(event, 'overlayImg1')" class="hidden">
                                    </label>
                                    <button type="button" onclick="openIngredientsGallery('overlayImg1')" class="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg px-1.5 py-1 text-[10px] font-extrabold text-cyan-200 truncate">🎨 Galería</button>
                                    <button type="button" onclick="openAzureImageModal('overlayImg1')" class="bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/40 rounded-lg px-1.5 py-1 text-[10px] font-extrabold text-sky-200 truncate" title="Generar ilustración con Azure gpt-image-2">🪄 IA Azure</button>
                                </div>
                                <select onchange="selectOverlayAsset(this.value, 'overlayImg1')" class="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[9px] text-slate-300 truncate">
                                    ${getAssetOptionsHTML(scene.overlayImg1)}
                                </select>
                                ${scene.overlayImg1 ? `
                                    <div class="flex items-center gap-1 mt-1">
                                        <button type="button" onclick="adjustPropScale('overlayImg1', -0.1)" class="flex-1 py-0.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-bold rounded" title="Hacer más pequeño">🔍➖</button>
                                        <button type="button" onclick="adjustPropScale('overlayImg1', 0.1)" class="flex-1 py-0.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-bold rounded" title="Hacer más grande">🔍➕</button>
                                        <button type="button" onclick="resetPropTransform('overlayImg1')" class="py-0.5 px-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[9px] font-bold rounded" title="Restablecer">↺</button>
                                    </div>
                                ` : ''}
                            </div>

                            <!-- Overlay Img 2 -->
                            <div class="sm:col-span-4 bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1.5">
                                <div class="flex items-center justify-between">
                                    <label class="text-[9px] font-extrabold uppercase text-slate-300">Img 2 (Secundaria):</label>
                                    ${scene.overlayImg2 ? `<button onclick="updateSceneField('overlayImg2', ''); renderScene(currentSceneIndex); renderActiveSceneEditor();" class="text-[9px] text-rose-400 font-bold">✕ Quitar</button>` : ''}
                                </div>
                                <div class="grid grid-cols-3 gap-1">
                                    <label class="bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-1 text-[10px] font-bold text-center text-amber-300 cursor-pointer truncate">
                                        ${scene.overlayImg2 ? '✓ Subida' : '+ Subir'}
                                        <input type="file" accept="image/*" onchange="uploadOverlayImage(event, 'overlayImg2')" class="hidden">
                                    </label>
                                    <button type="button" onclick="openIngredientsGallery('overlayImg2')" class="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg px-1.5 py-1 text-[10px] font-extrabold text-amber-200 truncate">🎨 Galería</button>
                                    <button type="button" onclick="openAzureImageModal('overlayImg2')" class="bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/40 rounded-lg px-1.5 py-1 text-[10px] font-extrabold text-sky-200 truncate" title="Generar ilustración con Azure gpt-image-2">🪄 IA Azure</button>
                                </div>
                                <select onchange="selectOverlayAsset(this.value, 'overlayImg2')" class="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[9px] text-slate-300 truncate">
                                    ${getAssetOptionsHTML(scene.overlayImg2)}
                                </select>
                                ${scene.overlayImg2 ? `
                                    <div class="flex items-center gap-1 mt-1">
                                        <button type="button" onclick="adjustPropScale('overlayImg2', -0.1)" class="flex-1 py-0.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-bold rounded" title="Hacer más pequeño">🔍➖</button>
                                        <button type="button" onclick="adjustPropScale('overlayImg2', 0.1)" class="flex-1 py-0.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-bold rounded" title="Hacer más grande">🔍➕</button>
                                        <button type="button" onclick="resetPropTransform('overlayImg2')" class="py-0.5 px-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[9px] font-bold rounded" title="Restablecer">↺</button>
                                    </div>
                                ` : ''}
                            </div>

                            <!-- Layout & Sello -->
                            <div class="sm:col-span-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                                <label class="block text-[9px] font-extrabold uppercase text-slate-300 mb-1">Diseño Dual:</label>
                                <select onchange="updateSceneField('dualLayout', this.value); renderScene(currentSceneIndex);" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-1.5 py-1 text-[10px] font-bold text-white">
                                    <option value="" ${!scene.dualLayout ? 'selected' : ''}>Lado a Lado</option>
                                    <option value="layout-stack" ${scene.dualLayout === 'layout-stack' ? 'selected' : ''}>Arriba / Abajo</option>
                                    <option value="layout-pip" ${scene.dualLayout === 'layout-pip' ? 'selected' : ''}>Grande + Miniatura</option>
                                </select>
                            </div>

                            <!-- Sello de Goma -->
                            <div class="sm:col-span-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                                <label class="block text-[9px] font-extrabold uppercase text-red-400 mb-1">Sello Rojo (Compás 3):</label>
                                <input id="editor-input-stampText" type="text" placeholder="Ej: TÚ / FALSO" value="${scene.stampText || ''}" oninput="updateSceneField('stampText', this.value)" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-black text-red-400">
                            </div>

                            <!-- Pro Tip Banner -->
                            <div class="col-span-full bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 text-[10px] text-amber-300 font-bold flex items-center gap-2">
                                <span>✨</span>
                                <span><b>Lienzo Interactivo:</b> Arrastra personajes o sellos con el mouse o con tu dedo. Agrándalos con la esquina <b>↘</b> o con la rueda del mouse. Haz clic en cualquier texto del video para editarlo al instante.</span>
                            </div>
                        </div>
                    </div>

                <!-- CINTA INFERIOR Y BADGE ESQUINA -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                        <label class="block text-[10px] font-extrabold uppercase text-rose-400 mb-1">🏷️ Cinta Inferior Roja (Ribbon):</label>
                        <input id="editor-input-bottomRibbon" type="text" placeholder="Ej: Historia real de miles de negocios" value="${scene.bottomRibbon || ''}" oninput="updateSceneField('bottomRibbon', this.value)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">⏱️ Badge Circular (Esquina Derecha):</label>
                        <input id="editor-input-timerBadge" type="text" placeholder="Ej: 10 PM / 24/7 / 2AM" value="${scene.timerBadge || ''}" oninput="updateSceneField('timerBadge', this.value)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    <div>
                        <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Etiqueta Interna 1</label>
                        <input id="editor-input-card1" type="text" value="${scene.card1 || ''}" oninput="updateSceneField('card1', this.value)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Etiqueta Interna 2</label>
                        <input id="editor-input-card2" type="text" value="${scene.card2 || ''}" oninput="updateSceneField('card2', this.value)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Etiqueta Interna 3</label>
                        <input id="editor-input-card3" type="text" value="${scene.card3 || ''}" oninput="updateSceneField('card3', this.value)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold uppercase text-cyan-400 mb-1">🖼️ Fondo Propio / Galería</label>
                        <div class="flex items-center gap-1">
                            <label class="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-[11px] font-bold text-cyan-300 cursor-pointer text-center truncate">
                                ${scene.customBgUrl ? '✓ Fondo' : '+ Subir'}
                                <input type="file" accept="image/*" onchange="uploadSceneCustomBg(event)" class="hidden">
                            </label>
                            <button type="button" onclick="openIngredientsGallery('customBgUrl')" class="px-2 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-[11px] font-bold" title="Elegir de la Galería Visual">🎨</button>
                            <button type="button" onclick="openAzureImageModal('customBgUrl')" class="px-2 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/40 text-sky-200 text-[11px] font-bold" title="Generar Fondo IA con Azure gpt-image-2">🪄</button>
                            ${scene.customBgUrl ? `<button onclick="updateSceneField('customBgUrl', ''); renderActiveSceneEditor();" class="px-2 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold">✕</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        function uploadSceneCustomBg(event) {
            const file = event.target.files[0];
            if (!file) return;
            const sceneIdx = currentSceneIndex;
            const reader = new FileReader();
            reader.onload = async function(e) {
                const dataUrl = e.target.result;
                if (currentConfig.scenes[sceneIdx]) {
                    currentConfig.scenes[sceneIdx].customBgUrl = dataUrl;
                }
                renderScene(sceneIdx);
                renderActiveSceneEditor();
                if (typeof showStudioToast === 'function') showStudioToast('☁️ Subiendo fondo a Cloudinary CDN...', 2500);
                const cloudUrl = await uploadAssetDataUrlToCloud(dataUrl, 'image', '2dclip_backgrounds');
                if (cloudUrl && currentConfig.scenes[sceneIdx]) {
                    currentConfig.scenes[sceneIdx].customBgUrl = cloudUrl;
                    saveUserCustomAssetToLibrary(cloudUrl, 'Fondo ' + file.name.replace(/\.[^.]+$/, ''));
                    renderScene(currentSceneIndex);
                    renderActiveSceneEditor();
                    saveStateToLocalStorage();
                    if (typeof showStudioToast === 'function') showStudioToast('✓ Fondo guardado en la nube', 2500);
                } else {
                    saveStateToLocalStorage();
                }
            };
            reader.readAsDataURL(file);
        }

        function updateSceneField(field, value, options = {}) {
            const scene = currentConfig && currentConfig.scenes && currentConfig.scenes[currentSceneIndex];
            if (!scene) return;
            scene[field] = value;
            if (field === 'script') {
                scene.duration = calculateNaturalSceneDurationMs(value, ttsRate);
                updateTotalDurationBadge();
            }

            // Actualización para titulares de texto directos
            if (['bannerTop', 'bannerHighlight', 'bottomRibbon', 'timerBadge'].includes(field)) {
                if (!options.fromStage) {
                    const el = document.getElementById('stage-' + field);
                    if (el && el !== document.activeElement) {
                        el.textContent = value;
                    }
                }
                saveStateToLocalStorage();
                return;
            }

            // Para tarjetas, gráficos, ambientes, sellos y overlays: re-renderizar en vivo de inmediato
            sceneStartTime = performance.now();
            renderScene(currentSceneIndex);
            saveStateToLocalStorage();
        }

        function autoCalcDuration() {
            const scene = currentConfig.scenes[currentSceneIndex];
            scene.duration = calculateNaturalSceneDurationMs(scene.script, ttsRate);
            renderScene(currentSceneIndex);
            renderActiveSceneEditor();
            updateTotalDurationBadge();
        }

        function addNewScene() {
            currentConfig.scenes.push({
                duration: 4300,
                environment: "env_door_room",
                cameraMotion: "cam-zoom-in",
                transition: "trans-zoom-burst",
                script: "Nueva escena lista para continuar con la explicación.",
                bannerTop: "PASO SIGUIENTE",
                bannerHighlight: "MIRA EL RESULTADO",
                bottomRibbon: "Explicación visual",
                timerBadge: "⚡",
                graphicType: "actor_door_push",
                sfx: "whoosh",
                card1: "Causa inicial",
                card2: "Efecto visible",
                card3: "Resultado"
            });
            currentSceneIndex = currentConfig.scenes.length - 1;
            sceneStartTime = performance.now();
            renderScene(currentSceneIndex);
            renderActiveSceneEditor();
        }

        function duplicateCurrentScene() {
            const copy = JSON.parse(JSON.stringify(currentConfig.scenes[currentSceneIndex]));
            currentConfig.scenes.splice(currentSceneIndex + 1, 0, copy);
            currentSceneIndex++;
            sceneStartTime = performance.now();
            renderScene(currentSceneIndex);
            renderActiveSceneEditor();
        }

        function deleteCurrentScene() {
            if (currentConfig.scenes.length <= 2) return;
            currentConfig.scenes.splice(currentSceneIndex, 1);
            if (currentSceneIndex >= currentConfig.scenes.length) {
                currentSceneIndex = currentConfig.scenes.length - 1;
            }
            sceneStartTime = performance.now();
            renderScene(currentSceneIndex);
            renderActiveSceneEditor();
        }

        function moveScene(direction) {
            const targetIdx = currentSceneIndex + direction;
            if (targetIdx < 0 || targetIdx >= currentConfig.scenes.length) return;
            const temp = currentConfig.scenes[currentSceneIndex];
            currentConfig.scenes[currentSceneIndex] = currentConfig.scenes[targetIdx];
            currentConfig.scenes[targetIdx] = temp;
            currentSceneIndex = targetIdx;
            sceneStartTime = performance.now();
            renderScene(currentSceneIndex);
            renderActiveSceneEditor();
        }

        function switchRightTab(tabName) {
            ['scenes', 'assistant', 'audio', 'prompt'].forEach(t => {
                const content = document.getElementById(`tab-content-${t}`);
                const btn = document.getElementById(`tab-btn-${t}`);
                if (t === tabName) {
                    content.classList.remove('hidden');
                    btn.className = 'px-3 py-1.5 rounded-lg text-xs font-extrabold bg-amber-500 text-slate-950 transition';
                } else {
                    content.classList.add('hidden');
                    btn.className = 'px-3 py-1.5 rounded-lg text-xs font-extrabold text-slate-400 hover:text-white transition';
                }
            });
        }

        // ==========================================
        // 9. GUIDED ASSISTANT LOGIC (SMART STORY BUILDER)
        // ==========================================
        function openAIScriptModal() {
            switchRightTab('assistant');
        }

        function applyWizardStory() {
            const formula = document.getElementById('wiz-formula-select').value;
            const brandKey = document.getElementById('wiz-brand-select').value;
            const topic = document.getElementById('wiz-topic-input').value.trim() || "¿Por qué tu cerebro olvida lo que ibas a hacer?";
            const customHook = document.getElementById('wiz-hook-input').value.trim();
            const customCTA = document.getElementById('wiz-cta-input').value.trim() || `SÍGUEME @${brandKey.toUpperCase()}`;

            let baseConfig;
            if (formula === 'reto_atom') baseConfig = JSON.parse(JSON.stringify(TEMPLATES.atom_brazos));
            else if (formula === 'desmitificando') baseConfig = JSON.parse(JSON.stringify(TEMPLATES.atom_mintieron));
            else if (formula === 'problema_solucion') baseConfig = JSON.parse(JSON.stringify(TEMPLATES.nakkio));
            else if (formula === 'tutorial_3pasos') baseConfig = JSON.parse(JSON.stringify(TEMPLATES.atom_tutorial_3pasos));
            else baseConfig = JSON.parse(JSON.stringify(TEMPLATES.atom_iceberg_secreto));

            baseConfig.scenes[0].script = `¿Alguna vez te has preguntado la razón real detrás de ${topic.toLowerCase()}?`;
            baseConfig.scenes[0].bannerTop = customHook || "MIRA LO QUE PASA CON";
            baseConfig.scenes[0].bannerHighlight = topic.toUpperCase().slice(0, 22);
            baseConfig.ctaText = customCTA;

            currentConfig = baseConfig;
            syncGlobalInputsFromConfig();
            switchRightTab('scenes');
            sceneStartTime = performance.now();
            renderScene(0);
            renderActiveSceneEditor();
        }


        // ==========================================
        // 11. BOOTSTRAP INITIALIZATION
        // ==========================================
        
        // ==========================================
        // EXTRA PRO CAPABILITIES: TELEPROMPTER & EMOJIS
        // ==========================================
        function openTeleprompterModal() {
            const modal = document.getElementById('teleprompter-modal');
            const container = document.getElementById('teleprompter-text-container');
            const countLabel = document.getElementById('teleprompter-word-count');
            
            let totalWords = 0;
            let html = '';
            
            currentConfig.scenes.forEach((s, idx) => {
                const words = (s.script || '').trim().split(/\s+/).filter(Boolean);
                totalWords += words.length;
                html += `
                    <div class="border-b border-slate-800/80 pb-2">
                        <span class="text-[10px] font-black uppercase text-amber-400 tracking-wider">Escena ${idx + 1} (${(s.duration / 1000).toFixed(1)}s):</span>
                        <p class="text-white text-xs font-bold mt-1">${s.script || ''}</p>
                    </div>
                `;
            });

            container.innerHTML = html;
            const approxSec = Math.round(totalWords / 2.6);
            countLabel.textContent = `Total: ${totalWords} palabras • ~${approxSec}s lectura estimada`;
            modal.classList.remove('hidden');
        }

        function closeTeleprompterModal() {
            document.getElementById('teleprompter-modal').classList.add('hidden');
        }

        function copyTeleprompterText() {
            const fullScript = currentConfig.scenes.map((s, idx) => `[Escena ${idx + 1}] ${s.script}`).join('\n\n');
            const textarea = document.createElement('textarea');
            textarea.value = fullScript;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            const btn = document.getElementById('btn-copy-teleprompter');
            btn.textContent = '✅ ¡Copiado!';
            setTimeout(() => { btn.textContent = '📋 Copiar Texto'; }, 2000);
        }

        
        // ==========================================
        // ASPECT RATIO & MOBILE NAVIGATION CONTROLS
        // ==========================================
        let currentAspectRatio = '9-16';

        

        // ==========================================
        // TEMPLATE GALLERY MODAL LOGIC
        // ==========================================
        function openTemplateGalleryModal() {
            const m = document.getElementById('template-gallery-modal');
            if (m) m.classList.remove('hidden');
        }

        function closeTemplateGalleryModal() {
            const m = document.getElementById('template-gallery-modal');
            if (m) m.classList.add('hidden');
        }

        function selectTemplateFromGallery(key) {
            loadTemplate(key);
            closeTemplateGalleryModal();
            playSFX('pop');
        }

        function openTemplateGeneratorModal() {
            document.getElementById('template-generator-modal').classList.remove('hidden');
        }

        function closeTemplateGeneratorModal() {
            document.getElementById('template-generator-modal').classList.add('hidden');
        }

        function generateAndApplyMagicTemplate() {
            const niche = document.getElementById('gen-tpl-niche').value.trim() || "Automatización con IA";
            const brand = document.getElementById('gen-tpl-brand').value.trim() || "@nachotechrd";
            const domain = document.getElementById('gen-tpl-domain').value.trim() || "nakkio.com";
            const style = document.getElementById('gen-tpl-style').value;

            let newTemplate = {
                brand: brand,
                domain: domain,
                priceTag: "MÉTODO PRO",
                ctaText: `SÍGUEME ${brand.toUpperCase()}`,
                highlightStyle: "hl-glow",
                scenes: []
            };

            if (style === 'curiosidad_atom') {
                newTemplate.highlightStyle = "hl-pill";
                newTemplate.scenes = [
                    {
                        duration: 4400,
                        environment: "env_door_room",
                        cameraMotion: "cam-dynamic-push",
                        transition: "trans-zoom-burst",
                        headlineColor: "#facc15",
                        reactionEmoji: "🤯",
                        script: `¿Por qué casi nadie en ${niche.toLowerCase()} conoce este principio que lo cambia todo?`,
                        bannerTop: "EL SECRETO DE",
                        bannerHighlight: niche.toUpperCase().slice(0, 20),
                        bottomRibbon: "Prueba este experimento",
                        timerBadge: "30s",
                        graphicType: "actor_door_push",
                        sfx: "impact",
                        card1: "El gran error",
                        card2: "Lo que ignoras",
                        card3: "30 SEGUNDOS"
                    },
                    {
                        duration: 4300,
                        environment: "env_brain_xray",
                        cameraMotion: "cam-dutch-tilt",
                        transition: "trans-slide-left",
                        headlineColor: "#38bdf8",
                        reactionEmoji: "🧠",
                        script: "Cuando fuerzas las cosas de forma manual, tu energía se agota antes de ver resultados.",
                        bannerTop: "ESFUERZO MANUAL",
                        bannerHighlight: "VS SISTEMA AUTOMÁTICO",
                        bottomRibbon: "Mecanismo biológico y mental",
                        timerBadge: "01",
                        graphicType: "actor_brain_nerves",
                        sfx: "cyber",
                        card1: "Fuerza manual",
                        card2: "Agotamiento",
                        card3: "Cero escala"
                    },
                    {
                        duration: 4400,
                        environment: "env_ai_lab",
                        cameraMotion: "cam-snap-zoom",
                        transition: "trans-crossfade",
                        headlineColor: "#34d399",
                        reactionEmoji: "⚡",
                        script: `Pero cuando aplicas tecnología y arquitectura inteligente, todo fluye sin resistencia.`,
                        bannerTop: "MIRA LA DIFERENCIA",
                        bannerHighlight: "CON EL MÉTODO CORRECTO",
                        bottomRibbon: "Flujo continuo",
                        timerBadge: "02",
                        graphicType: "ai_brain_workflow",
                        sfx: "whoosh",
                        card1: "Sistemas activos",
                        card2: "Cero fricción",
                        card3: "Resultados 24/7"
                    },
                    {
                        duration: 4200,
                        environment: "env_cyber_city",
                        cameraMotion: "cam-whip-pan",
                        transition: "trans-slide-left",
                        headlineColor: "#f97316",
                        reactionEmoji: "🚀",
                        script: `Sin perder horas, sin depender de la suerte y con control total de tu crecimiento.`,
                        bannerTop: "OLVÍDATE DE",
                        bannerHighlight: "IMPROVISAR A CIEGAS",
                        bottomRibbon: "Crecimiento asegurado",
                        timerBadge: "✓",
                        graphicType: "strike_cards",
                        sfx: "pop",
                        card1: "Procesos lentos",
                        card2: "Pérdida de tiempo",
                        card3: "Frustración"
                    },
                    {
                        duration: 4200,
                        environment: "env_radial_fire",
                        cameraMotion: "cam-impact-shake",
                        transition: "trans-flash-wipe",
                        headlineColor: "#facc15",
                        reactionEmoji: "🔥",
                        script: `Sígueme en ${brand} para descubrir cómo dominar ${niche.toLowerCase()} con herramientas reales.`,
                        bannerTop: "DOMINA ESTE MÉTODO HOY",
                        bannerHighlight: brand.toUpperCase(),
                        bottomRibbon: "Comparte este video",
                        timerBadge: "YA",
                        graphicType: "cta_conversion",
                        sfx: "ding",
                        card1: brand,
                        card2: niche,
                        card3: "MÉTODO PRO"
                    }
                ];
            } else {
                // High Energy Sales / Business Template
                newTemplate.highlightStyle = "hl-box";
                newTemplate.scenes = [
                    {
                        duration: 4400,
                        environment: "env_store_business",
                        cameraMotion: "cam-dynamic-push",
                        transition: "trans-zoom-burst",
                        headlineColor: "#ef4444",
                        reactionEmoji: "⚠️",
                        script: `Así es como la mayoría pierde clientes y dinero en ${niche.toLowerCase()} sin darse cuenta.`,
                        bannerTop: "LA FUGA SILENCIOSA EN",
                        bannerHighlight: niche.toUpperCase().slice(0, 20),
                        bottomRibbon: "Problema real de hoy",
                        timerBadge: "-$$$",
                        graphicType: "actor_owner_stressed",
                        sfx: "impact",
                        card1: "Clientes perdidos",
                        card2: "Atención tardía",
                        card3: "Dinero quemado"
                    },
                    {
                        duration: 4300,
                        environment: "env_tv_livingroom",
                        cameraMotion: "cam-dutch-tilt",
                        transition: "trans-slide-left",
                        headlineColor: "#facc15",
                        reactionEmoji: "🐢",
                        script: "Mientras tardas horas en responder, tu cliente ya le compró a quien automatizó su proceso.",
                        bannerTop: "EN MENOS DE 5 MINUTOS",
                        bannerHighlight: "SE VAN CON OTRO",
                        bottomRibbon: "La velocidad lo es todo",
                        timerBadge: "5m",
                        graphicType: "comparison_split",
                        sfx: "whoosh",
                        card1: "Tardanza manual",
                        card2: "Respuesta en 2 seg",
                        card3: "Cierra la venta"
                    },
                    {
                        duration: 4400,
                        environment: "env_ai_lab",
                        cameraMotion: "cam-snap-zoom",
                        transition: "trans-crossfade",
                        headlineColor: "#34d399",
                        reactionEmoji: "🤖",
                        script: `Con nuestro sistema activo, atiendes, cotizas y cobras en automático los trescientos sesenta y cinco días.`,
                        bannerTop: "SISTEMA ACTIVO 24/7",
                        bannerHighlight: "VENDE MIENTRAS DUERMES",
                        bottomRibbon: domain,
                        timerBadge: "100%",
                        graphicType: "nakkio_chat",
                        sfx: "cash",
                        card1: "¿Tienen disponible?",
                        card2: "¡Sí! Aquí está el link",
                        card3: "VENTA CERRADA"
                    },
                    {
                        duration: 4200,
                        environment: "env_cyber_city",
                        cameraMotion: "cam-whip-pan",
                        transition: "trans-slide-left",
                        headlineColor: "#38bdf8",
                        reactionEmoji: "💰",
                        script: "Sin empleados agotados, sin responder de madrugada y con reportes exactos al centavo.",
                        bannerTop: "CRECIMIENTO REAL",
                        bannerHighlight: "SIN DOLORES DE CABEZA",
                        bottomRibbon: "Escala masiva",
                        timerBadge: "PRO",
                        graphicType: "actor_money_rain",
                        sfx: "cash",
                        card1: "INGRESOS AL DÍA",
                        card2: "Ventas automáticas",
                        card3: "CONTROL TOTAL"
                    },
                    {
                        duration: 4200,
                        environment: "env_radial_fire",
                        cameraMotion: "cam-impact-shake",
                        transition: "trans-flash-wipe",
                        headlineColor: "#facc15",
                        reactionEmoji: "🚀",
                        script: `Visita ${domain} o envíame un mensaje en ${brand} para activar tu demostración hoy.`,
                        bannerTop: "LLEVA TU NEGOCIO AL NIVEL PRO",
                        bannerHighlight: domain.toUpperCase(),
                        bottomRibbon: `Desarrollado por ${brand}`,
                        timerBadge: "HOY",
                        graphicType: "cta_conversion",
                        sfx: "ding",
                        card1: domain,
                        card2: niche,
                        card3: "ACTIVA TU DEMO"
                    }
                ];
            }

            // Save and apply
            currentConfig = newTemplate;
            syncGlobalInputsFromConfig();
            closeTemplateGeneratorModal();
            sceneStartTime = performance.now();
            renderScene(0);
            renderActiveSceneEditor();
            saveStateToLocalStorage();
            alert(`✨ ¡Plantilla para "${niche}" generada con éxito y aplicada al video!`);
        }



        

        // ==========================================
        // VISUAL INGREDIENTS GALLERY PICKER (SVGs + ASSETS)
        // ==========================================
        function openIngredientsGallery(targetProp = 'overlayImg1') {
            activeIngredientTargetProp = targetProp || 'overlayImg1';
            mergeCustomAssetsIntoCatalog();
            const modal = document.getElementById('ingredients-gallery-modal');
            const search = document.getElementById('ingredients-search-input');
            const label = document.getElementById('ingredients-target-label');
            if (label) {
                label.textContent = targetProp === 'customBgUrl'
                    ? 'Asignando a: Fondo Personalizado'
                    : (targetProp === 'overlayImg2' ? 'Asignando a: Imagen Superpuesta 2' : 'Asignando a: Imagen Superpuesta 1');
            }
            if (search) search.value = '';
            filterIngredientsGallery('');
            if (modal) modal.classList.remove('hidden');
        }

        function closeIngredientsGallery() {
            const modal = document.getElementById('ingredients-gallery-modal');
            if (modal) modal.classList.add('hidden');
        }

        function filterIngredientsGallery(query = '') {
            const grid = document.getElementById('ingredients-gallery-grid');
            if (!grid) return;
            const q = String(query || '').toLowerCase().trim();
            const list = (window.NT_CUSTOM_ASSETS_LIST || []).filter(item => {
                if (!q) return true;
                return (item.name || '').toLowerCase().includes(q) || (item.path || '').toLowerCase().includes(q);
            });

            if (list.length === 0) {
                grid.innerHTML = '<div class="col-span-full py-10 text-center text-xs text-slate-400">No se encontraron recursos visuales con ese filtro.</div>';
                return;
            }

            grid.innerHTML = list.map(item => {
                const normPath = normalizeAssetPath(item.path);
                const safePath = normPath.replace(/'/g, "\\'");
                const currentVal = normalizeAssetPath(currentConfig?.scenes?.[currentSceneIndex]?.[activeIngredientTargetProp] || '');
                const isSelected = currentVal === normPath;
                return `
                    <button type="button" onclick="pickIngredientAsset('${safePath}')" class="group text-left bg-slate-950/90 hover:bg-slate-900 border ${isSelected ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-800 hover:border-cyan-500/50'} rounded-2xl p-2.5 flex flex-col gap-2 transition">
                        <div class="w-full h-24 rounded-xl bg-[#070b14] border border-slate-800/80 flex items-center justify-center p-2 overflow-hidden">
                            <img src="${encodeURI(normPath)}" alt="${item.name}" class="max-w-full max-h-full object-contain group-hover:scale-105 transition" loading="lazy" />
                        </div>
                        <div class="text-[10px] font-extrabold text-slate-200 leading-tight line-clamp-2">${item.name}</div>
                    </button>
                `;
            }).join('');
        }

        function pickIngredientAsset(path) {
            const normPath = normalizeAssetPath(path);
            if (!currentConfig?.scenes?.[currentSceneIndex]) return;
            currentConfig.scenes[currentSceneIndex][activeIngredientTargetProp] = normPath;
            renderScene(currentSceneIndex);
            renderActiveSceneEditor();
            saveStateToLocalStorage();
            closeIngredientsGallery();
            playSFX('pop');
            if (currentUserToken) debouncedCloudAutoSync();
        }

