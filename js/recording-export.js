        // ==========================================
        // 10. RECORDING & EXPORT UTILITIES
        // ==========================================
// ==========================================
        // UNIFIED RECORDING & CLEAN CAPTURE ENGINE
        // ==========================================
        function toggleRecordingMode() {
            // Unify: All recording buttons trigger clean recording flow!
            startCleanRecordingFlow();
        }

        // Direct Browser WebM Recording using MediaStream + Region Capture (CropTarget)
        async function startInBrowserRecording() {
            if (isRecordingWebM) return;

            // 1. Pausar reproducción previa y reiniciar a la escena 0
            isPlaying = false;
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            if (activeSceneAudioPlayer) activeSceneAudioPlayer.pause();
            stopBGMDrone();
            currentSceneIndex = 0;
            renderScene(0);

            // Iniciar precarga de voces de inmediato en segundo plano
            preloadAllSceneVoices();

            const stageEl = document.getElementById('video-stage');

            try {
                let stream = null;

                // 2. REGION CAPTURE API (CropTarget) in Chromium
                if ('CropTarget' in window && typeof CropTarget.fromElement === 'function') {
                    try {
                        const cropTarget = await CropTarget.fromElement(stageEl);
                        stream = await navigator.mediaDevices.getDisplayMedia({
                            preferCurrentTab: true,
                            selfBrowserSurface: "include",
                            video: true,
                            audio: true
                        });
                        const [videoTrack] = stream.getVideoTracks();
                        if (videoTrack && typeof videoTrack.cropTo === 'function') {
                            await videoTrack.cropTo(cropTarget);
                            console.log('✓ Precision Region Capture applied directly to #video-stage');
                        }
                    } catch(cropErr) {
                        console.warn('CropTarget attempt:', cropErr);
                    }
                }

                // Fallback standard display media if Region Capture was denied or unsupported
                if (!stream) {
                    stream = await navigator.mediaDevices.getDisplayMedia({
                        preferCurrentTab: true,
                        video: { displaySurface: "window" },
                        audio: true
                    });
                }

                // 3. User granted permission! Enter clean recording mode now
                unlockSpeechAudio();
                document.body.classList.add('clean-record-mode');
                isCleanRecordingActive = true;
                const exitPill = document.getElementById('pure-exit-pill');
                if (exitPill) exitPill.classList.remove('hidden');

                // Asegurar que las voces de todas las escenas estén precargadas
                await preloadAllSceneVoices();

                // Let layout settle
                await new Promise(r => setTimeout(r, 200));

                // 4. Countdown 3-2-1
                const countdownEl = document.getElementById('countdown-overlay');
                const numEl = document.getElementById('countdown-number');
                if (countdownEl && numEl) {
                    countdownEl.classList.remove('hidden');
                    numEl.textContent = '3';
                    playSFX('pop');
                    await new Promise(r => setTimeout(r, 700));
                    numEl.textContent = '2';
                    playSFX('pop');
                    await new Promise(r => setTimeout(r, 700));
                    numEl.textContent = '1';
                    playSFX('pop');
                    await new Promise(r => setTimeout(r, 700));
                    countdownEl.classList.add('hidden');
                }

                recordedChunks = [];

                // Mezclador de Audio Digital Maestro: Web Audio Bus + Tab Audio + Mic
                const ctx = getAudioCtx();
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                }
                if (!masterRecordDest) {
                    masterRecordDest = ctx.createMediaStreamDestination();
                }

                // Pistas de audio de la captura de pantalla/pestaña
                const tabAudioTracks = stream.getAudioTracks();
                let finalAudioTrack = null;

                const micToggle = document.getElementById('record-mic-toggle');

                if (tabAudioTracks.length > 0) {
                    // El usuario activó "Permitir también audio de las pestañas" (como en Chrome)
                    // Esta pista ya contiene todo lo que suena en la pestaña: Voz IA (speechSynthesis), SFX y BGM, con cero duplicación.
                    console.log('✓ Audio de pestaña capturado con éxito (incluye Voz IA + SFX + BGM)');
                    if (micToggle && micToggle.checked) {
                        try {
                            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                            const mixDest = ctx.createMediaStreamDestination();
                            const tabSource = ctx.createMediaStreamSource(new MediaStream([tabAudioTracks[0]]));
                            tabSource.connect(mixDest);
                            const micSource = ctx.createMediaStreamSource(micStream);
                            micSource.connect(mixDest);
                            finalAudioTrack = mixDest.stream.getAudioTracks()[0];
                            console.log('✓ Mezcla de audio de pestaña + micrófono aplicada al WebM');
                        } catch(micErr) {
                            console.warn('Permiso de micrófono no otorgado para mezcla:', micErr);
                            finalAudioTrack = tabAudioTracks[0];
                        }
                    } else {
                        finalAudioTrack = tabAudioTracks[0];
                    }
                } else {
                    // Fallback si el usuario no compartió el audio de la pestaña
                    console.warn('⚠️ No se detectó audio de pestaña. Usando bus de audio digital como respaldo (SFX + BGM).');
                    const digitalAudioTracks = masterRecordDest ? masterRecordDest.stream.getAudioTracks() : [];
                    if (digitalAudioTracks.length > 0) {
                        finalAudioTrack = digitalAudioTracks[0];
                    }
                }

                const finalTracks = [...stream.getVideoTracks()];
                if (finalAudioTrack) {
                    finalTracks.push(finalAudioTrack);
                    console.log('✓ Pista de audio inyectada exitosamente en el archivo WebM');
                } else {
                    console.warn('⚠️ No se encontró pista de audio para el WebM');
                }
                const recordStream = new MediaStream(finalTracks);

                // Selección inteligente de códec: MP4 prioritario para iPhone/Safari y WebM para Chrome
                const candidateMimeTypes = [
                    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
                    'video/mp4;codecs=avc1',
                    'video/mp4',
                    'video/webm;codecs=vp9,opus',
                    'video/webm;codecs=vp8,opus',
                    'video/webm;codecs=h264,opus',
                    'video/webm;codecs=opus',
                    'video/webm'
                ];
                let mimeType = '';
                for (const cand of candidateMimeTypes) {
                    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(cand)) {
                        mimeType = cand;
                        break;
                    }
                }
                if (!mimeType) mimeType = 'video/mp4';

                mediaRecorder = new MediaRecorder(recordStream, { mimeType });

                mediaRecorder.ondataavailable = function(e) {
                    if (e.data && e.data.size > 0) recordedChunks.push(e.data);
                };

                mediaRecorder.onstop = function() {
                    const isMp4 = mimeType.toLowerCase().includes('mp4');
                    const blobType = isMp4 ? 'video/mp4' : 'video/webm';
                    const fileExt = isMp4 ? 'mp4' : 'webm';
                    const blob = new Blob(recordedChunks, { type: blobType });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    const aspectStr = (currentAspectRatio || '9-16').replace('-', 'x');
                    a.download = `Reel_${(currentConfig.domain || 'viral').replace(/[^a-zA-Z0-9]/g, '_')}_${aspectStr}.${fileExt}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    stream.getTracks().forEach(track => track.stop());
                    recordStream.getTracks().forEach(track => track.stop());
                    stopBGMDrone();
                    isRecordingWebM = false;

                    exitCleanRecording();
                    playSFX('ding');
                    showStudioToast(`✓ Video descargado con éxito (${fileExt.toUpperCase()})`, 5000);
                };

                // Listen to native Chrome "Dejar de compartir" button
                const [firstVideoTrack] = stream.getVideoTracks();
                if (firstVideoTrack) {
                    firstVideoTrack.addEventListener('ended', () => {
                        if (isRecordingWebM) {
                            finishInBrowserRecording();
                        } else {
                            exitCleanRecording();
                        }
                    });
                }

                // 5. Start MediaRecorder with timeslice 250ms
                mediaRecorder.start(250);
                isRecordingWebM = true;

                // 6. Play from scene 0 to the final scene smoothly
                currentSceneIndex = 0;
                sceneStartTime = performance.now();
                isPlaying = true;
                if (bgmEnabled) {
                    startBGMDrone();
                }
                renderScene(0);
                renderActiveSceneEditor();
                ensureTickLoop();

            } catch (err) {
                console.warn('Recording cancelled or error:', err);
                isRecordingWebM = false;
                stopBGMDrone();
                exitCleanRecording();
            }
        }

        function finishInBrowserRecording() {
            stopBGMDrone();
            if (activeSceneAudioPlayer) {
                activeSceneAudioPlayer.pause();
                activeSceneAudioPlayer = null;
            }
            if (isRecordingWebM && mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        }

        function exportProjectJSON() {
            const blob = new Blob([JSON.stringify(currentConfig, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `NT_Proyecto_${(currentConfig.domain || 'reel').replace(/[^a-zA-Z0-9]/g, '_')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function importProjectJSON(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const parsed = JSON.parse(e.target.result);
                    if (parsed && Array.isArray(parsed.scenes)) {
                        currentConfig = parsed;
                        syncGlobalInputsFromConfig();
                        sceneStartTime = performance.now();
                        renderScene(0);
                        renderActiveSceneEditor();
                    }
                } catch (err) {}
            };
            reader.readAsText(file);
        }

        function copyMasterPrompt() {
            const text = document.getElementById('master-prompt-box').innerText;
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            const btn = document.getElementById('copy-prompt-btn');
            btn.textContent = '✅ ¡Prompt Copiado!';
            setTimeout(() => { btn.textContent = '📋 Copiar Prompt'; }, 2200);
        }

        function exportStandaloneHTML() {
            const fullSource = document.documentElement.outerHTML;
            const customBootScript = `<script>window.__NT_CUSTOM_CONFIG__ = ${JSON.stringify(currentConfig)};<\/script>`;
            const baseTag = window.location && /^https?:/.test(window.location.origin) ? `<base href="${window.location.origin}/">` : '';
            const exportedHTML = fullSource.replace('</head>', `${baseTag}${customBootScript}</head>`);

            const blob = new Blob([exportedHTML], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `NachoTech_Motion_Studio_${(currentConfig.domain || 'Pro').replace(/[^a-zA-Z0-9]/g, '_')}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function buildCleanSerializableConfig(stripLargeDataUrls = false) {
            const cleanScenes = (currentConfig.scenes || []).map(sc => {
                const clone = Object.assign({}, sc);
                delete clone._cachedAudioBuffer;
                if (stripLargeDataUrls) {
                    ['overlayImg1', 'overlayImg2', 'customBgUrl', 'customAudioUrl'].forEach(k => {
                        if (typeof clone[k] === 'string' && clone[k].startsWith('data:') && clone[k].length > 65000) {
                            delete clone[k];
                        }
                    });
                }
                return clone;
            });
            return Object.assign({}, currentConfig, { scenes: cleanScenes });
        }

        function saveStateToLocalStorage() {
            const badge = document.getElementById('autosave-indicator');
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(buildCleanSerializableConfig(false)));
                if (badge) badge.textContent = '✓ Guardado auto';
            } catch (e) {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildCleanSerializableConfig(true)));
                    if (badge) badge.textContent = '✓ Guardado (texto/config)';
                } catch (err2) {}
            }
        }


        // ==========================================
        // PURE RECORDING FLOW (IPHONE & PC CLEAN RECORDING)
        // ==========================================
        let isCleanRecordingActive = false;
        let currentMobileView = 'stage';

        function toggleMobileView() {
            const btn = document.getElementById('mobile-toggle-view-btn');
            if (currentMobileView === 'stage') {
                setMobileView('editor');
                currentMobileView = 'editor';
                if (btn) btn.innerHTML = '📱 Ver Video';
            } else {
                setMobileView('stage');
                currentMobileView = 'stage';
                if (btn) btn.innerHTML = '⚙️ Editor';
            }
        }

        function startCleanRecordingFlow() {
            unlockSpeechAudio();
            isCleanRecordingActive = true;
            document.body.classList.add('clean-record-mode');

            // Hide complete card and show discreet exit pill
            const completeCard = document.getElementById('recording-complete-card');
            if (completeCard) completeCard.classList.add('hidden');
            const exitPill = document.getElementById('pure-exit-pill');
            if (exitPill) exitPill.classList.remove('hidden');

            // Pause video and prepare scene 0
            isPlaying = false;
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            if (activeSceneAudioPlayer) activeSceneAudioPlayer.pause();
            currentSceneIndex = 0;
            renderScene(0);

            // Show center 3-2-1 countdown on stage
            const countdownEl = document.getElementById('countdown-overlay');
            const numEl = document.getElementById('countdown-number');
            if (countdownEl && numEl) {
                countdownEl.classList.remove('hidden');
                numEl.textContent = '3';
                playSFX('pop');
                
                setTimeout(() => {
                    numEl.textContent = '2';
                    playSFX('pop');
                    setTimeout(() => {
                        numEl.textContent = '1';
                        playSFX('pop');
                        setTimeout(() => {
                            countdownEl.classList.add('hidden');
                            playSFX('impact');
                            currentSceneIndex = 0;
                            sceneStartTime = performance.now();
                            isPlaying = true;
                            renderScene(0);
                            renderActiveSceneEditor();
                            ensureTickLoop();
                        }, 800);
                    }, 800);
                }, 800);
            } else {
                currentSceneIndex = 0;
                sceneStartTime = performance.now();
                isPlaying = true;
                renderScene(0);
                renderActiveSceneEditor();
                ensureTickLoop();
            }
        }

        function finishCleanRecording() {
            isPlaying = false;
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            if (activeSceneAudioPlayer) activeSceneAudioPlayer.pause();

            // If browser WebM recording is running, stop it and download!
            if (isRecordingWebM && mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                return;
            }

            playSFX('ding');
            const completeCard = document.getElementById('recording-complete-card');
            if (completeCard) completeCard.classList.remove('hidden');
        }

        function repeatCleanRecording() {
            const completeCard = document.getElementById('recording-complete-card');
            if (completeCard) completeCard.classList.add('hidden');
            startCleanRecordingFlow();
        }

        function exitCleanRecording() {
            isCleanRecordingActive = false;
            isRecordingWebM = false;
            document.body.classList.remove('clean-record-mode');
            const completeCard = document.getElementById('recording-complete-card');
            if (completeCard) completeCard.classList.add('hidden');
            const exitPill = document.getElementById('pure-exit-pill');
            if (exitPill) exitPill.classList.add('hidden');
            restartVideo();
        }

        // Escape key exits recording
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isCleanRecordingActive) {
                exitCleanRecording();
            }
        });

        function setStageAspectRatio(ratio) {
            currentAspectRatio = ratio;
            const stage = document.getElementById('video-stage');
            stage.classList.remove('aspect-9-16', 'aspect-1-1', 'aspect-16-9', 'aspect-4-5');
            stage.classList.add(`aspect-${ratio}`);

            // Update button styles in top toolbar
            document.querySelectorAll('.aspect-btn').forEach(b => {
                b.className = 'aspect-btn px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition text-slate-300 hover:bg-slate-800';
            });
            const activeBtn = document.getElementById(`btn-aspect-${ratio}`);
            if (activeBtn) {
                activeBtn.className = 'aspect-btn px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition bg-amber-500 text-slate-950 shadow-md';
            }

            // Sync mobile header pills
            document.querySelectorAll('.m-aspect-btn').forEach(b => {
                b.className = 'm-aspect-btn px-2 py-0.5 rounded-lg text-[10px] font-extrabold text-slate-400 hover:text-white transition';
            });
            const activeMobileBtn = document.getElementById(`m-btn-aspect-${ratio}`);
            if (activeMobileBtn) {
                activeMobileBtn.className = 'm-aspect-btn px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-500 text-slate-950 transition';
            }

            const mobileAspectSelect = document.getElementById('mobile-aspect-select');
            if (mobileAspectSelect) mobileAspectSelect.value = ratio;

            // Sync with modal cards
            document.querySelectorAll('.rec-fmt-card').forEach(c => {
                c.className = 'rec-fmt-card p-3 rounded-2xl bg-slate-900 border border-slate-700 text-left transition hover:scale-102';
                const title = c.querySelector('div:nth-child(2)');
                if (title) title.className = 'text-xs font-black text-white uppercase';
            });
            const activeCard = document.getElementById(`opt-rec-${ratio}`);
            if (activeCard) {
                activeCard.className = 'rec-fmt-card p-3 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-left transition hover:scale-102';
                const title = activeCard.querySelector('div:nth-child(2)');
                if (title) title.className = 'text-xs font-black text-amber-300 uppercase';
            }
        }

        function openRecordFormatModal() {
            setStageAspectRatio(currentAspectRatio);
            document.getElementById('record-format-modal').classList.remove('hidden');
        }

        function closeRecordFormatModal() {
            document.getElementById('record-format-modal').classList.add('hidden');
        }

        function selectRecordFormat(ratio) {
            setStageAspectRatio(ratio);
        }

        function confirmAndStartRecording() {
            closeRecordFormatModal();
            startInBrowserRecording();
        }

        // Mobile View Switcher (Preview vs Editor)
        function setMobileView(view) {
            const stageCol = document.querySelector('.stage-column');
            const editorCol = document.querySelector('.editor-sidebar');
            const btnStage = document.getElementById('mobile-tab-view-stage');
            const btnEditor = document.getElementById('mobile-tab-view-editor');

            if (view === 'stage') {
                if (stageCol) stageCol.style.display = 'flex';
                if (editorCol) editorCol.style.display = 'none';
                if (btnStage) {
                    btnStage.className = 'mobile-tab-btn active flex-1 py-2 px-3 rounded-xl text-xs font-black bg-amber-500 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-md';
                }
                if (btnEditor) {
                    btnEditor.className = 'mobile-tab-btn flex-1 py-2 px-3 rounded-xl text-xs font-black bg-slate-800 text-slate-300 transition flex items-center justify-center gap-1.5';
                }
            } else {
                if (stageCol) stageCol.style.display = 'none';
                if (editorCol) editorCol.style.display = 'flex';
                if (btnEditor) {
                    btnEditor.className = 'mobile-tab-btn active flex-1 py-2 px-3 rounded-xl text-xs font-black bg-amber-500 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-md';
                }
                if (btnStage) {
                    btnStage.className = 'mobile-tab-btn flex-1 py-2 px-3 rounded-xl text-xs font-black bg-slate-800 text-slate-300 transition flex items-center justify-center gap-1.5';
                }
            }
        }

        // Check screen width on resize
        window.addEventListener('resize', () => {
            const stageCol = document.querySelector('.stage-column');
            const editorCol = document.querySelector('.editor-sidebar');
            if (window.innerWidth >= 1024) {
                if (stageCol) stageCol.style.display = 'flex';
                if (editorCol) editorCol.style.display = 'flex';
            }
        });

        

        // ==========================================================================
        // GRABACIÓN AUTOMÁTICA DIRECTA EN MP4 PARA IPHONE & SAFARI (SIN PERMISOS)
        // ==========================================================================
        async function startDirectCanvasMp4Recording() {
            closeRecordFormatModal();
            const stageEl = document.getElementById('video-stage');
            if (!stageEl) return;

            unlockSpeechAudio();
            document.body.classList.add('clean-record-mode');
            isCleanRecordingActive = true;
            const exitPill = document.getElementById('pure-exit-pill');
            if (exitPill) exitPill.classList.remove('hidden');

            showStudioToast('🎬 Preparando grabación limpia de alta velocidad...', 2000);
            await preloadAllSceneVoices();

            const countdownEl = document.getElementById('countdown-overlay');
            const numEl = document.getElementById('countdown-number');
            if (countdownEl && numEl) {
                countdownEl.classList.remove('hidden');
                numEl.textContent = '3';
                playSFX('pop');
                await new Promise(r => setTimeout(r, 650));
                numEl.textContent = '2';
                playSFX('pop');
                await new Promise(r => setTimeout(r, 650));
                numEl.textContent = '1';
                playSFX('pop');
                await new Promise(r => setTimeout(r, 650));
                countdownEl.classList.add('hidden');
            }

            const ctx = getAudioCtx();
            if (ctx.state === 'suspended') await ctx.resume();
            if (!masterRecordDest) masterRecordDest = ctx.createMediaStreamDestination();

            if (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function' && !/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                startInBrowserRecording();
                return;
            }

            currentSceneIndex = 0;
            sceneStartTime = performance.now();
            isPlaying = true;
            if (bgmEnabled) startBGMDrone();
            renderScene(0);

            showStudioToast('📱 Modo Grabación Activo: Graba la pantalla desde el Centro de Control de tu iPhone', 6000);
        }

