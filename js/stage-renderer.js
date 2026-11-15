        // ==========================================
        // 5. SCENE RENDERER WITH TRANSITIONS & PARTICLES
        // ==========================================
        function calculateNaturalSceneDurationMs(script, rate = 1.1) {
            if (!script || !script.trim()) return 3500;
            const words = script.trim().split(/\s+/).filter(Boolean);
            if (words.length === 0) return 3500;

            let totalMs = 0;
            words.forEach(w => {
                const cleanLen = w.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]/g, '').length;
                const wordTime = Math.max(160, Math.min(650, cleanLen * 68));
                totalMs += wordTime;

                if (/[.,!?:;]/.test(w)) {
                    totalMs += /[.?!]/.test(w) ? 380 : 200;
                }
            });

            const adjustedForRate = totalMs / (rate || 1.10);
            const finalDuration = Math.round(adjustedForRate + 450);
            return Math.max(2600, Math.min(16000, finalDuration));
        }

        function getSceneDurationMs(scene) {
            if (!scene) return 3600;
            const naturalSpeechMs = calculateNaturalSceneDurationMs(scene.script, ttsRate || 1.10);
            let d = scene.duration;
            if (typeof d === 'string') {
                d = parseFloat(d.replace(/[^0-9.]/g, ''));
            }
            if (typeof d !== 'number' || isNaN(d) || !d || d <= 0) {
                d = naturalSpeechMs;
            } else {
                if (d < 50) d = d * 1000;
                // CRITICAL RULE: Scene duration CANNOT cut off the speech!
                if (!scene.customAudioUrl) {
                    d = Math.max(d, naturalSpeechMs);
                }
            }
            return Math.max(2500, Math.min(16000, Math.round(d)));
        }

        function synchronizeAllSceneDurations() {
            if (currentConfig && Array.isArray(currentConfig.scenes)) {
                currentConfig.scenes.forEach(s => {
                    if (!s.customAudioUrl) {
                        s.duration = calculateNaturalSceneDurationMs(s.script, ttsRate || 1.10);
                    }
                });
                updateTotalDurationBadge();
            }
        }

        // ==========================================================================
        // DYNAMIC 1-2 LINE SUBTITLE CHUNKING ENGINE (SOCIAL MEDIA SAFE ZONE)
        // ==========================================================================
        let currentSceneChunks = [];
        let activeChunkIndex = 0;

        function buildSubtitleChunks(words, maxWords = 5, maxChars = 28) {
            if (!words || words.length === 0) return [];
            const chunks = [];
            let cur = [];
            let curLen = 0;

            for (let i = 0; i < words.length; i++) {
                const w = words[i];
                const wLen = w.length + 1;

                if (cur.length > 0 && (cur.length >= maxWords || curLen + wLen > maxChars)) {
                    const remaining = words.length - i;
                    if (remaining > 1 || cur.length >= 6) {
                        chunks.push(cur);
                        cur = [];
                        curLen = 0;
                    }
                }

                cur.push({ word: w, globalIndex: i });
                curLen += wLen;
            }

            if (cur.length > 0) {
                if (cur.length === 1 && chunks.length > 0 && chunks[chunks.length - 1].length <= 4) {
                    chunks[chunks.length - 1].push(...cur);
                } else {
                    chunks.push(cur);
                }
            }
            return chunks;
        }

        function renderActiveChunk(chunkIdx) {
            const subContainer = document.getElementById('subtitle-container');
            if (!subContainer || !currentSceneChunks || currentSceneChunks.length === 0) return;
            activeChunkIndex = chunkIdx;
            const chunk = currentSceneChunks[chunkIdx] || [];

            subContainer.innerHTML = chunk.map(item => {
                const w = item.word;
                const cleanUpper = w.toUpperCase().replace(/[^A-Z0-9ÁÉÍÓÚÑ]/g, '');
                const isImpact = ['CUIDADO', 'ERROR', 'GRATIS', 'SECRETO', 'MINTIERON', '30', '100%', 'DINERO', 'IA', 'NUNCA'].includes(cleanUpper);
                return `<span id="w-tok-${item.globalIndex}" data-boost="${isImpact}" class="word-token ${isImpact ? 'keyword-boost' : ''}">${w}</span>`;
            }).join(' ');
        }

        function highlightWordIndex(targetIdx, totalWords) {
            if (!currentSceneChunks || currentSceneChunks.length === 0) return;

            let chunkIdx = currentSceneChunks.findIndex(chunk => chunk.some(item => item.globalIndex === targetIdx));
            if (chunkIdx === -1) {
                chunkIdx = (targetIdx >= totalWords - 1) ? (currentSceneChunks.length - 1) : 0;
            }

            if (chunkIdx !== activeChunkIndex) {
                renderActiveChunk(chunkIdx);
            }

            const activeChunk = currentSceneChunks[activeChunkIndex] || [];
            activeChunk.forEach(item => {
                const el = document.getElementById(`w-tok-${item.globalIndex}`);
                if (!el) return;
                const isBoost = el.getAttribute('data-boost') === 'true';
                if (item.globalIndex === targetIdx) {
                    el.className = `word-token active-word spoken ${isBoost ? 'keyword-boost' : ''}`;
                } else if (item.globalIndex < targetIdx) {
                    el.className = `word-token spoken ${isBoost ? 'keyword-boost' : ''}`;
                } else {
                    el.className = `word-token ${isBoost ? 'keyword-boost' : ''}`;
                }
            });

            if (targetIdx === 1 || targetIdx === Math.floor(totalWords / 2)) {
                playSFX('pop');
            }
        }

        // ==========================================
        // SISTEMA MODULAR DE INGREDIENTES, SFX Y SUPERPOSICIÓN DUAL
        // ==========================================
        const customSfxBufferCache = new Map();

        function normalizeSfxPath(sfxKeyOrPath) {
            let s = String(sfxKeyOrPath || '').trim();
            if (!s || s === 'none') return '';
            if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:') || s.startsWith('blob:')) return s;
            if (s.includes('FXS/')) s = s.slice(s.indexOf('FXS/'));
            return s;
        }

        function triggerStageBeatVisual(beatNum) {
            const rig = document.getElementById('camera-rig');
            const flash = document.getElementById('stage-beat-flash');
            if (rig && (beatNum === 1 || beatNum === 2 || beatNum === 3)) {
                rig.classList.remove('stage-beat-impact');
                void rig.offsetWidth;
                rig.classList.add('stage-beat-impact');
                setTimeout(() => rig.classList.remove('stage-beat-impact'), 320);
            }
            if (flash && (beatNum === 1 || beatNum === 3)) {
                flash.classList.remove('beat-flash-active');
                void flash.offsetWidth;
                flash.classList.add('beat-flash-active');
                setTimeout(() => flash.classList.remove('beat-flash-active'), 360);
            }
        }

        async function preloadSceneSFX(scene) {
            if (!scene) return;
            const paths = [scene.sfx, scene.sfxBeat2, scene.sfxBeat3].map(normalizeSfxPath).filter(Boolean);
            for (const p of paths) {
                if (p.includes('/') || p.endsWith('.mp3') || p.endsWith('.wav') || p.endsWith('.ogg')) {
                    const url = encodeURI(p);
                    if (!customSfxBufferCache.has(url)) {
                        try {
                            const ctx = getAudioCtx();
                            const res = await fetch(url);
                            if (res.ok) {
                                const ab = await res.arrayBuffer();
                                const buf = await ctx.decodeAudioData(ab);
                                customSfxBufferCache.set(url, buf);
                            }
                        } catch(e) {}
                    }
                }
            }
        }

        async function playCustomOrSynthSFX(sfxKeyOrPath, beatNum = 0) {
            if (beatNum) triggerStageBeatVisual(beatNum);
            if (!sfxEnabled || !sfxKeyOrPath) return;
            const cleanKey = normalizeSfxPath(sfxKeyOrPath);
            if (!cleanKey || cleanKey === 'none') return;

            // Si es ruta de archivo SFX (de FXS o sfx/)
            if (cleanKey.includes('/') || cleanKey.endsWith('.mp3') || cleanKey.endsWith('.wav') || cleanKey.endsWith('.ogg')) {
                const url = encodeURI(cleanKey);
                try {
                    const ctx = getAudioCtx();
                    const sfxOut = getSFXGainNode();
                    if (customSfxBufferCache.has(url)) {
                        const buf = customSfxBufferCache.get(url);
                        const src = ctx.createBufferSource();
                        src.buffer = buf;
                        src.connect(sfxOut);
                        src.start(0);
                        return;
                    }
                    const res = await fetch(url);
                    if (res.ok) {
                        const ab = await res.arrayBuffer();
                        const buf = await ctx.decodeAudioData(ab);
                        customSfxBufferCache.set(url, buf);
                        const src = ctx.createBufferSource();
                        src.buffer = buf;
                        src.connect(sfxOut);
                        src.start(0);
                        return;
                    }
                } catch(err) {
                    try {
                        const audio = new Audio(url);
                        audio.volume = Math.min(1, sfxVolume || 0.70);
                        audio.play().catch(() => {});
                    } catch(e) {}
                }
            } else {
                playSFX(cleanKey);
            }
        }

        // Animador de Contador Numérico Estilo Baninter (RD$0 -> RD$55.000.000.000)
        function animateLiveMoneyTicker() {
            const el = document.getElementById('live-money-ticker');
            if (!el) return;
            const rawTarget = el.getAttribute('data-target') || el.textContent || 'RD$55.000.000.000';
            const prefixMatch = rawTarget.match(/^[^0-9]+/);
            const prefix = prefixMatch ? prefixMatch[0] : 'RD$';
            const digitsOnly = parseInt(rawTarget.replace(/[^0-9]/g, ''), 10);
            if (isNaN(digitsOnly) || digitsOnly <= 0) return;

            const duration = 2100;
            const start = performance.now();

            function stepTicker(now) {
                const progress = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - progress, 3);
                const currentVal = Math.floor(digitsOnly * eased);
                el.textContent = prefix + currentVal.toLocaleString('es-DO');
                if (progress < 1) {
                    requestAnimationFrame(stepTicker);
                } else {
                    el.textContent = rawTarget;
                }
            }
            requestAnimationFrame(stepTicker);
        }

        // ==========================================================================
        // NORMALIZADOR AUTOMÁTICO DE RUTAS DE ASSETS (VERCEL + RUTAS LOCALES)
        // ==========================================================================
        let __ntAssetBasenameLookup = null;
        function resolveCatalogAssetByBasename(rawPath) {
            const filename = String(rawPath || '').split('/').pop().split('\\').pop().toLowerCase();
            if (!filename) return '';
            if (!__ntAssetBasenameLookup) {
                __ntAssetBasenameLookup = {};
                if (Array.isArray(window.NT_CUSTOM_ASSETS_LIST)) {
                    window.NT_CUSTOM_ASSETS_LIST.forEach(item => {
                        const rel = item && item.path ? String(item.path).replace(/^[\\/]+/, '') : '';
                        if (rel) {
                            const b = rel.split('/').pop().toLowerCase();
                            if (!__ntAssetBasenameLookup[b]) __ntAssetBasenameLookup[b] = rel;
                        }
                    });
                }
            }
            return __ntAssetBasenameLookup[filename] || '';
        }

        function normalizeAssetPath(path) {
            if (!path) return '';
            if (typeof path !== 'string') return path;
            if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) {
                return path;
            }
            let p = path.trim().replace(/^[\\/]+/, '').replace(/\\/g, '/');
            const lower = p.toLowerCase();

            // Si coincide exactamente por nombre de archivo en el catálogo real de disco, úsalo (corrige carpetas o mayúsculas)
            const matchedFromCatalog = resolveCatalogAssetByBasename(p);
            if (matchedFromCatalog && (lower.startsWith('elementos/') || !p.includes('/'))) {
                p = matchedFromCatalog;
            } else if (lower.startsWith('elementos/pack_elementos_virales_2d_nt/')) {
                p = 'ELEMENTOS/' + p.substring('elementos/'.length);
            } else if (lower.startsWith('elementos/pack_animados_rutas_y_caminatas/')) {
                p = 'ELEMENTOS/' + p.substring('elementos/'.length);
            } else if (lower.startsWith('elementos/')) {
                p = 'ELEMENTOS/pack_elementos_virales_2d_nt/' + p.toLowerCase();
            } else if (lower.startsWith('animados/')) {
                p = 'ELEMENTOS/pack_animados_rutas_y_caminatas/' + p;
            } else if (lower.startsWith('fxs/')) {
                p = 'FXS/' + p.substring('fxs/'.length);
            } else if (!p.startsWith('ELEMENTOS/') && !p.startsWith('FXS/')) {
                p = 'ELEMENTOS/pack_elementos_virales_2d_nt/elementos/' + p;
            }

            if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
                return p;
            }
            return '/' + p;
        }

        function handleAssetLoadError(imgEl) {
            if (!imgEl) return;
            if (!imgEl._hasRetriedFallback) {
                imgEl._hasRetriedFallback = true;
                const currentSrc = imgEl.getAttribute('src') || '';
                const catalogFix = resolveCatalogAssetByBasename(currentSrc);
                if (catalogFix && !currentSrc.endsWith(catalogFix)) {
                    imgEl.src = (window.location?.protocol === 'file:' ? '' : '/') + catalogFix;
                    return;
                }
                imgEl.src = currentSrc.startsWith('/') ? currentSrc.substring(1) : '/' + currentSrc;
                return;
            }
            // Si el recurso definitivamente no existe en disco, ocultar la etiqueta rota para nunca mostrar "Overlay 1"
            imgEl.style.display = 'none';
            if (imgEl.parentElement && imgEl.parentElement.classList.contains('interactive-prop-box')) {
                imgEl.parentElement.style.display = 'none';
            }
        }

        // ==========================================================================
        // MOTOR DE ARRASTRE, REDIMENSIÓN Y CONTROL INTERACTIVO DE ELEMENTOS EN STAGE
        // ==========================================================================
        let activeDragProp = null;
        let activeResizeProp = null;
        let dragStartCoords = { x: 0, y: 0 };
        let propInitTransform = { x: 0, y: 0, scale: 1 };
        let isCurrentlyInteractingStage = false;
        let initialPinchDist = null;
        let initialPinchScale = 1;

        function getPropTransform(propKey) {
            const scene = currentConfig && currentConfig.scenes && currentConfig.scenes[currentSceneIndex];
            if (!scene) return { x: 0, y: 75, scale: 0.85 };
            const transformKey = propKey === 'overlayImg1' ? 'overlay1Transform' : (propKey === 'overlayImg2' ? 'overlay2Transform' : 'stampTransform');
            if (scene[transformKey] && typeof scene[transformKey].x === 'number') {
                return scene[transformKey];
            }
            if (propKey === 'stamp') return { x: 0, y: 0, scale: 1 };
            return propKey === 'overlayImg1' 
                ? { x: 0, y: 75, scale: 0.85 } 
                : { x: 70, y: 95, scale: 0.65 };
        }

        function renderDualOverlayLayer(scene) {
            const container = document.getElementById('stage-dual-overlay');
            if (!container) return;

            if (!scene.overlayImg1 && !scene.overlayImg2) {
                container.innerHTML = '';
                return;
            }

            let html = '';
            if (scene.overlayImg1) {
                const t1 = getPropTransform('overlayImg1');
                const src1 = normalizeAssetPath(scene.overlayImg1);
                html += `
                    <div id="interactive-prop-overlayImg1" class="interactive-prop-box select-none" data-prop="overlayImg1"
                         style="left: 50%; top: 50%; transform: translate(calc(-50% + ${t1.x}px), calc(-50% + ${t1.y}px)) scale(${t1.scale}); touch-action: none;"
                         onpointerdown="startStagePropDrag(event, 'overlayImg1')"
                         onwheel="handlePropWheelZoom(event, 'overlayImg1')"
                         onclick="event.stopPropagation()">
                        <img src="${src1}" onerror="handleAssetLoadError(this)" class="overlay-img-card" draggable="false" alt="Overlay 1" />
                        
                        <!-- Barra de Herramientas Flotante -->
                        <div class="prop-controls-toolbar" onclick="event.stopPropagation()" onpointerdown="event.stopPropagation()">
                            <button type="button" class="prop-tool-btn" onclick="adjustPropScale('overlayImg1', -0.1, event)" title="Hacer más pequeño">➖</button>
                            <button type="button" class="prop-tool-btn" onclick="adjustPropScale('overlayImg1', 0.1, event)" title="Hacer más grande">➕</button>
                            <button type="button" class="prop-tool-btn" onclick="quickSnapProp('overlayImg1', 'center', event)" title="Centrar">🎯</button>
                            <button type="button" class="prop-tool-btn" onclick="resetPropTransform('overlayImg1', event)" title="Restablecer">↺</button>
                            <button type="button" class="prop-tool-btn prop-tool-del" onclick="removeOverlayProp('overlayImg1', event)" title="Quitar">✕</button>
                        </div>
                        
                        <!-- Tirador de Esquina para Redimensionar -->
                        <div class="prop-resize-handle" onpointerdown="startStagePropResize(event, 'overlayImg1')" title="Arrastra para cambiar tamaño">↘</div>
                    </div>
                `;
            }

            if (scene.overlayImg2) {
                const t2 = getPropTransform('overlayImg2');
                const src2 = normalizeAssetPath(scene.overlayImg2);
                html += `
                    <div id="interactive-prop-overlayImg2" class="interactive-prop-box select-none" data-prop="overlayImg2"
                         style="left: 50%; top: 50%; transform: translate(calc(-50% + ${t2.x}px), calc(-50% + ${t2.y}px)) scale(${t2.scale}); touch-action: none;"
                         onpointerdown="startStagePropDrag(event, 'overlayImg2')"
                         onwheel="handlePropWheelZoom(event, 'overlayImg2')"
                         onclick="event.stopPropagation()">
                        <img src="${src2}" onerror="handleAssetLoadError(this)" class="overlay-img-card" draggable="false" alt="Overlay 2" />
                        
                        <!-- Barra de Herramientas Flotante -->
                        <div class="prop-controls-toolbar" onclick="event.stopPropagation()" onpointerdown="event.stopPropagation()">
                            <button type="button" class="prop-tool-btn" onclick="adjustPropScale('overlayImg2', -0.1, event)" title="Hacer más pequeño">➖</button>
                            <button type="button" class="prop-tool-btn" onclick="adjustPropScale('overlayImg2', 0.1, event)" title="Hacer más grande">➕</button>
                            <button type="button" class="prop-tool-btn" onclick="quickSnapProp('overlayImg2', 'bottom', event)" title="Abajo">⬇</button>
                            <button type="button" class="prop-tool-btn" onclick="resetPropTransform('overlayImg2', event)" title="Restablecer">↺</button>
                            <button type="button" class="prop-tool-btn prop-tool-del" onclick="removeOverlayProp('overlayImg2', event)" title="Quitar">✕</button>
                        </div>
                        
                        <!-- Tirador de Esquina para Redimensionar -->
                        <div class="prop-resize-handle" onpointerdown="startStagePropResize(event, 'overlayImg2')" title="Arrastra para cambiar tamaño">↘</div>
                    </div>
                `;
            }

            container.innerHTML = html;
        }

        function startStagePropDrag(e, propKey) {
            if (e.target.closest('.prop-controls-toolbar, .prop-resize-handle')) return;
            e.preventDefault();
            e.stopPropagation();
            isCurrentlyInteractingStage = true;
            if (isPlaying) togglePlayPause();

            const scene = currentConfig.scenes[currentSceneIndex];
            const transformKey = propKey === 'overlayImg1' ? 'overlay1Transform' : (propKey === 'overlayImg2' ? 'overlay2Transform' : 'stampTransform');
            const curT = getPropTransform(propKey);

            activeDragProp = propKey;
            const startX = e.clientX;
            const startY = e.clientY;
            const initX = curT.x;
            const initY = curT.y;
            const scale = curT.scale || (propKey === 'stamp' ? 1 : 0.85);

            const el = propKey === 'stamp' ? document.getElementById('stage-rubber-stamp') : document.getElementById('interactive-prop-' + propKey);
            if (el) {
                el.classList.add('prop-dragging', 'prop-selected');
                document.querySelectorAll('.interactive-prop-box').forEach(p => {
                    if (p !== el) p.classList.remove('prop-selected');
                });
            }

            const onPointerMove = (ev) => {
                if (activeDragProp !== propKey) return;
                ev.preventDefault();
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                const newX = Math.round(initX + dx);
                const newY = Math.round(initY + dy);

                scene[transformKey] = { x: newX, y: newY, scale };

                if (el) {
                    if (propKey === 'stamp') {
                        el.style.transform = `translate(${newX}px, ${newY}px) rotate(-12deg) scale(${scale})`;
                    } else {
                        el.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px)) scale(${scale})`;
                    }
                }
            };

            const onPointerUp = (ev) => {
                if (activeDragProp === propKey) {
                    activeDragProp = null;
                    if (el) el.classList.remove('prop-dragging');
                    document.removeEventListener('pointermove', onPointerMove);
                    document.removeEventListener('pointerup', onPointerUp);
                    document.removeEventListener('pointercancel', onPointerUp);
                    setTimeout(() => { isCurrentlyInteractingStage = false; }, 150);
                    saveStateToLocalStorage();
                    if (typeof currentUserToken !== 'undefined' && currentUserToken) {
                        debouncedCloudAutoSync();
                    }
                }
            };

            document.addEventListener('pointermove', onPointerMove, { passive: false });
            document.addEventListener('pointerup', onPointerUp);
            document.addEventListener('pointercancel', onPointerUp);
        }

        function startStagePropResize(e, propKey) {
            e.stopPropagation();
            e.preventDefault();
            isCurrentlyInteractingStage = true;
            if (isPlaying) togglePlayPause();

            const scene = currentConfig.scenes[currentSceneIndex];
            const transformKey = propKey === 'overlayImg1' ? 'overlay1Transform' : (propKey === 'overlayImg2' ? 'overlay2Transform' : 'stampTransform');
            const curT = getPropTransform(propKey);

            activeResizeProp = propKey;
            const startX = e.clientX;
            const startY = e.clientY;
            const initScale = curT.scale || 0.85;
            const initX = curT.x;
            const initY = curT.y;

            const el = propKey === 'stamp' ? document.getElementById('stage-rubber-stamp') : document.getElementById('interactive-prop-' + propKey);

            const onPointerMove = (ev) => {
                if (activeResizeProp !== propKey) return;
                ev.preventDefault();
                const delta = (ev.clientX - startX) + (ev.clientY - startY);
                let newScale = parseFloat((initScale + (delta / 250)).toFixed(2));
                if (newScale < 0.25) newScale = 0.25;
                if (newScale > 2.5) newScale = 2.5;

                scene[transformKey] = { x: initX, y: initY, scale: newScale };
                if (el) {
                    if (propKey === 'stamp') {
                        el.style.transform = `translate(${initX}px, ${initY}px) rotate(-12deg) scale(${newScale})`;
                    } else {
                        el.style.transform = `translate(calc(-50% + ${initX}px), calc(-50% + ${initY}px)) scale(${newScale})`;
                    }
                }
            };

            const onPointerUp = (ev) => {
                if (activeResizeProp === propKey) {
                    activeResizeProp = null;
                    document.removeEventListener('pointermove', onPointerMove);
                    document.removeEventListener('pointerup', onPointerUp);
                    document.removeEventListener('pointercancel', onPointerUp);
                    setTimeout(() => { isCurrentlyInteractingStage = false; }, 150);
                    saveStateToLocalStorage();
                    if (typeof currentUserToken !== 'undefined' && currentUserToken) {
                        debouncedCloudAutoSync();
                    }
                }
            };

            document.addEventListener('pointermove', onPointerMove, { passive: false });
            document.addEventListener('pointerup', onPointerUp);
            document.addEventListener('pointercancel', onPointerUp);
        }

        function handlePropWheelZoom(e, propKey) {
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY < 0 ? 0.08 : -0.08;
            adjustPropScale(propKey, delta, e);
        }

        function adjustPropScale(propKey, delta, e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            const scene = currentConfig && currentConfig.scenes && currentConfig.scenes[currentSceneIndex];
            if (!scene) return;
            const transformKey = propKey === 'overlayImg1' ? 'overlay1Transform' : (propKey === 'overlayImg2' ? 'overlay2Transform' : 'stampTransform');
            const curT = getPropTransform(propKey);
            let newScale = parseFloat(((curT.scale || 0.85) + delta).toFixed(2));
            if (newScale < 0.25) newScale = 0.25;
            if (newScale > 2.5) newScale = 2.5;

            scene[transformKey] = { x: curT.x, y: curT.y, scale: newScale };
            const el = propKey === 'stamp' ? document.getElementById('stage-rubber-stamp') : document.getElementById('interactive-prop-' + propKey);
            if (el) {
                if (propKey === 'stamp') {
                    el.style.transform = `translate(${curT.x}px, ${curT.y}px) rotate(-12deg) scale(${newScale})`;
                } else {
                    el.style.transform = `translate(calc(-50% + ${curT.x}px), calc(-50% + ${curT.y}px)) scale(${newScale})`;
                }
            }
            saveStateToLocalStorage();
        }

        function quickSnapProp(propKey, position, e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            const scene = currentConfig && currentConfig.scenes && currentConfig.scenes[currentSceneIndex];
            if (!scene) return;
            const transformKey = propKey === 'overlayImg1' ? 'overlay1Transform' : (propKey === 'overlayImg2' ? 'overlay2Transform' : 'stampTransform');
            let coords = { x: 0, y: 70, scale: 0.85 };
            if (position === 'center') coords = { x: 0, y: 0, scale: 0.95 };
            else if (position === 'top') coords = { x: 0, y: -90, scale: 0.75 };
            else if (position === 'bottom') coords = { x: 0, y: 120, scale: 0.75 };
            else if (position === 'left') coords = { x: -80, y: 60, scale: 0.75 };
            else if (position === 'right') coords = { x: 80, y: 60, scale: 0.75 };

            scene[transformKey] = coords;
            renderDualOverlayLayer(scene);
            saveStateToLocalStorage();
        }

        function resetPropTransform(propKey, e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            const scene = currentConfig && currentConfig.scenes && currentConfig.scenes[currentSceneIndex];
            if (!scene) return;
            const transformKey = propKey === 'overlayImg1' ? 'overlay1Transform' : (propKey === 'overlayImg2' ? 'overlay2Transform' : 'stampTransform');
            const defaultT = propKey === 'overlayImg1' ? { x: 0, y: 75, scale: 0.85 } : { x: 70, y: 95, scale: 0.65 };
            scene[transformKey] = defaultT;
            renderDualOverlayLayer(scene);
            saveStateToLocalStorage();
        }

        function removeOverlayProp(propKey, e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            const scene = currentConfig && currentConfig.scenes && currentConfig.scenes[currentSceneIndex];
            if (!scene) return;
            scene[propKey] = '';
            renderScene(currentSceneIndex);
            renderActiveSceneEditor();
            saveStateToLocalStorage();
        }

        // MOTOR DE EDICIÓN DE TEXTO DIRECTA EN VIVO EN EL STAGE (CLIC / TOUCH)
        // ==========================================================================
        function initStageInlineTextEditing() {
            const stage = document.getElementById('video-stage');
            if (!stage || stage._ntInlineInitDone) return;
            stage._ntInlineInitDone = true;

            // In BUBBLE phase (NOT capture phase!): stops play/pause click when clicking elements
            stage.addEventListener('click', (e) => {
                const target = e.target.closest('.nt-stage-text-editable, .interactive-prop-box, .prop-controls-toolbar, .prop-resize-handle, #stage-rubber-stamp');
                if (target) {
                    e.stopPropagation();
                }
            });

            // Live synchronization while typing directly in stage elements
            stage.addEventListener('input', (e) => {
                const editable = e.target.closest('.nt-stage-text-editable');
                if (!editable) return;
                const field = editable.getAttribute('data-field');
                if (!field) return;

                let val = editable.innerText.trim();
                if (val.startsWith('💬 ')) val = val.substring(2).trim();
                if (val.startsWith('⏳ ')) val = val.substring(2).trim();
                if (val.startsWith('⚡ ')) val = val.substring(2).trim();
                if (val.startsWith('✓ ')) val = val.substring(2).trim();

                const scene = currentConfig && currentConfig.scenes && currentConfig.scenes[currentSceneIndex];
                if (scene) {
                    scene[field] = val;
                    const editorInp = document.getElementById('editor-input-' + field);
                    if (editorInp && editorInp.value !== val) {
                        editorInp.value = val;
                    }
                    saveStateToLocalStorage();
                }
            });

            stage.addEventListener('keydown', (e) => {
                const editable = e.target.closest('.nt-stage-text-editable');
                if (!editable) return;
                if (e.key === 'Enter') {
                    e.preventDefault();
                    editable.blur();
                } else if (e.key === 'Escape') {
                    editable.blur();
                }
            });

            stage.addEventListener('blur', (e) => {
                const editable = e.target.closest('.nt-stage-text-editable');
                if (!editable) return;
                saveStateToLocalStorage();
            }, true);

            // Pinch-to-zoom on touch screens
            stage.addEventListener('touchstart', (e) => {
                const propBox = e.target.closest('.interactive-prop-box');
                if (!propBox) return;
                if (e.touches.length === 2) {
                    e.preventDefault();
                    e.stopPropagation();
                    const p1 = e.touches[0];
                    const p2 = e.touches[1];
                    initialPinchDist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
                    const propKey = propBox.getAttribute('data-prop');
                    const curT = getPropTransform(propKey);
                    initialPinchScale = curT.scale || 0.85;
                }
            }, { passive: false });

            stage.addEventListener('touchmove', (e) => {
                const propBox = e.target.closest('.interactive-prop-box');
                if (!propBox || e.touches.length !== 2 || !initialPinchDist) return;
                e.preventDefault();
                e.stopPropagation();
                const p1 = e.touches[0];
                const p2 = e.touches[1];
                const curDist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
                const ratio = curDist / initialPinchDist;
                let newScale = +(initialPinchScale * ratio).toFixed(2);
                newScale = Math.max(0.25, Math.min(3.5, newScale));

                const propKey = propBox.getAttribute('data-prop');
                const scene = currentConfig.scenes[currentSceneIndex];
                const transformKey = propKey === 'overlayImg1' ? 'overlay1Transform' : 'overlay2Transform';
                const curT = getPropTransform(propKey);
                scene[transformKey] = { ...curT, scale: newScale };
                propBox.style.transform = `translate(calc(-50% + ${curT.x}px), calc(-50% + ${curT.y}px)) scale(${newScale})`;
            }, { passive: false });

            stage.addEventListener('touchend', () => {
                if (initialPinchDist) {
                    initialPinchDist = null;
                    saveStateToLocalStorage();
                }
            });
        }

        async function uploadAssetDataUrlToCloud(dataUrl, resourceType = 'image', folder = '2dclip_assets') {
            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file: dataUrl, resource_type: resourceType, folder })
                });
                const data = await res.json();
                if (res.ok && data.success && data.url) {
                    return data.url;
                }
            } catch (e) {}
            return null;
        }

        function saveUserCustomAssetToLibrary(url, labelName) {
            if (!url || url.startsWith('data:')) return;
            try {
                const key = 'nt_user_custom_assets_v1';
                const list = JSON.parse(localStorage.getItem(key) || '[]');
                if (!list.some(item => item.path === url)) {
                    list.unshift({
                        id: url,
                        name: `[MIS SUBIDAS] ${labelName || 'Imagen Personalizada'}`,
                        path: url,
                        isCustom: true
                    });
                    localStorage.setItem(key, JSON.stringify(list.slice(0, 60)));
                }
                if (typeof mergeCustomAssetsIntoCatalog === 'function') {
                    mergeCustomAssetsIntoCatalog();
                }
                if (typeof syncUserSettingsToCloud === 'function') {
                    syncUserSettingsToCloud(true);
                }
            } catch (e) {}
        }

        function uploadOverlayImage(event, targetProp) {
            const file = event.target.files[0];
            if (!file) return;
            const sceneIdx = currentSceneIndex;
            const reader = new FileReader();
            reader.onload = async function(e) {
                const dataUrl = e.target.result;
                if (currentConfig.scenes[sceneIdx]) {
                    currentConfig.scenes[sceneIdx][targetProp] = dataUrl;
                }
                renderScene(sceneIdx);
                renderActiveSceneEditor();
                if (typeof showStudioToast === 'function') showStudioToast('☁️ Subiendo imagen a Cloudinary CDN...', 2500);
                const cloudUrl = await uploadAssetDataUrlToCloud(dataUrl, 'image', '2dclip_overlays');
                if (cloudUrl && currentConfig.scenes[sceneIdx]) {
                    currentConfig.scenes[sceneIdx][targetProp] = cloudUrl;
                    saveUserCustomAssetToLibrary(cloudUrl, file.name.replace(/\.[^.]+$/, ''));
                    renderScene(currentSceneIndex);
                    renderActiveSceneEditor();
                    saveStateToLocalStorage();
                    if (typeof showStudioToast === 'function') showStudioToast('✓ Imagen guardada en tu librería nube', 2800);
                } else {
                    saveStateToLocalStorage();
                }
            };
            reader.readAsDataURL(file);
        }

        function getAssetOptionsHTML(currentVal) {
            const val = normalizeAssetPath(currentVal || '');
            let html = '<option value="">-- O elige de la librería viral (' + ((window.NT_CUSTOM_ASSETS_LIST && window.NT_CUSTOM_ASSETS_LIST.length) || 0) + ') --</option>';
            if (window.NT_CUSTOM_ASSETS_LIST && Array.isArray(window.NT_CUSTOM_ASSETS_LIST)) {
                window.NT_CUSTOM_ASSETS_LIST.forEach(item => {
                    const normItemPath = normalizeAssetPath(item.path);
                    const sel = (val === normItemPath || (currentVal && currentVal === item.path)) ? 'selected' : '';
                    html += `<option value="${normItemPath}" ${sel}>${item.name}</option>`;
                });
            }
            return html;
        }

        function selectOverlayAsset(path, targetProp) {
            if (!currentConfig || !currentConfig.scenes || !currentConfig.scenes[currentSceneIndex]) return;
            const normPath = normalizeAssetPath(path);
            currentConfig.scenes[currentSceneIndex][targetProp] = normPath;
            
            // Re-render en vivo en stage inmediato sin perder foco ni recargar todo el formulario
            renderScene(currentSceneIndex);
            
            // Actualizar miniatura y botones de imagen en el editor en vivo
            const statusBadge = document.getElementById('status-' + targetProp);
            if (statusBadge) {
                statusBadge.textContent = normPath ? '✓ Imagen Cargada' : '+ Subir Img';
                statusBadge.className = normPath 
                    ? 'text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40'
                    : 'text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded';
            }
            saveStateToLocalStorage();
            if (typeof currentUserToken !== 'undefined' && currentUserToken) {
                debouncedCloudAutoSync();
            }
        }

        function getSFXOptionsHTML(currentVal, defaultVal) {
            const val = currentVal || defaultVal || '';
            const synthOptions = [
                { id: 'whoosh', name: '💨 Whoosh (Transición)' },
                { id: 'pop', name: '🎈 Pop (Elemento/Dato)' },
                { id: 'cash', name: '💰 Cash / Monedas' },
                { id: 'radar', name: '📡 Radar (Pulso)' },
                { id: 'cyber', name: '⚡ Cyber (Glitch)' },
                { id: 'ding', name: '🔔 Ding (Acierto)' },
                { id: 'impact', name: '💥 Impacto Pesado' },
                { id: 'none', name: '🚫 Ninguno (Silencio)' }
            ];

            let html = synthOptions.map(opt => `<option value="${opt.id}" ${val === opt.id ? 'selected' : ''}>${opt.name}</option>`).join('');

            const customList = (window.NT_CUSTOM_SFX_LIST && window.NT_CUSTOM_SFX_LIST.length > 0)
                ? window.NT_CUSTOM_SFX_LIST
                : [
                    { path: 'FXS/whoosh.mp3', name: '[FXS] Whoosh' },
                    { path: 'FXS/whoosh 2.mp3', name: '[FXS] Whoosh 2' },
                    { path: 'FXS/cash.mp3', name: '[FXS] Cash' },
                    { path: 'FXS/coin.mp3', name: '[FXS] Coin' },
                    { path: 'FXS/pop.mp3', name: '[FXS] Pop' },
                    { path: 'FXS/punch.mp3', name: '[FXS] Punch' },
                    { path: 'FXS/vine boom.mp3', name: '[FXS] Vine Boom' },
                    { path: 'FXS/explosion.mp3', name: '[FXS] Explosion' },
                    { path: 'FXS/camera shut.mp3', name: '[FXS] Camera Shut' },
                    { path: 'FXS/paper swipe.mp3', name: '[FXS] Paper Swipe' },
                    { path: 'FXS/door.mp3', name: '[FXS] Door' },
                    { path: 'FXS/windows error.mp3', name: '[FXS] Windows Error' }
                ];

            if (customList.length > 0) {
                html += '<optgroup label="📂 Efectos de Sonido (FXS / 102 Sound FXs)">';
                customList.forEach(item => {
                    html += `<option value="${item.path}" ${val === item.path ? 'selected' : ''}>🎵 ${item.name}</option>`;
                });
                html += '</optgroup>';
            }
            return html;
        }

        function renderScene(index) {
            clearWordTimers();
            const scenes = currentConfig.scenes;
            if (index >= scenes.length) index = 0;
            if (index < 0) index = scenes.length - 1;
            currentSceneIndex = index;
            const scene = scenes[index];

            const stage = document.getElementById('video-stage');
            stage.classList.remove('hl-box', 'hl-pill', 'hl-underline', 'hl-glow', 'hl-tiktok-green', 'hl-mrbeast', 'hl-clean-white', 'hl-red-alert', 'hl-purple-neon');
            stage.classList.add(currentConfig.highlightStyle || 'hl-box');

            const cameraRig = document.getElementById('camera-rig');
            cameraRig.className = 'scene-camera-layer';
            void cameraRig.offsetWidth;
            if (scene.cameraMotion) {
                scene.cameraMotion.trim().split(/\s+/).forEach(c => {
                    if (c) cameraRig.classList.add(c);
                });
            }
            if (scene.transition) {
                scene.transition.trim().split(/\s+/).forEach(c => {
                    if (c) cameraRig.classList.add(c);
                });
            }

            const envLayer = document.getElementById('environment-backdrop-layer');
            envLayer.innerHTML = buildEnvironmentBackdropHTML(scene.environment || 'env_door_room');

            const customImgEl = document.getElementById('custom-bg-image-layer');
            if (scene.customBgUrl && scene.customBgUrl.trim() !== '') {
                customImgEl.src = scene.customBgUrl;
                customImgEl.classList.remove('hidden');
            } else {
                customImgEl.classList.add('hidden');
            }

            updateContextualParticles(scene.environment);
            updateAmbientOrbs(scene.environment);

            document.getElementById('stage-top-domain').textContent = `🌐 ${currentConfig.domain || 'nakkio.com'}`;
            document.getElementById('stage-top-tag').textContent = currentConfig.brand || '@nachotechrd';
            document.getElementById('brand-watermark').textContent = `${currentConfig.brand} • ${currentConfig.domain}`;
            document.getElementById('scene-counter-badge').textContent = `Escena ${index + 1}/${scenes.length}`;
            document.getElementById('total-scenes-count').textContent = scenes.length;

            updateTotalDurationBadge();
            renderProgressBars();

            const bannerEl = document.getElementById('hook-banner-container');
            if (scene.bannerTop || scene.bannerHighlight) {
                bannerEl.innerHTML = `
                    <div class="spring-pop atom-headline-top leading-[1.08] px-1">
                        ${scene.bannerTop ? `<div id="stage-banner-top" class="nt-stage-text-editable text-lg sm:text-xl font-black text-white uppercase tracking-tight" data-field="bannerTop" contenteditable="true" spellcheck="false" title="✏️ Clic para editar texto">${scene.bannerTop}</div>` : ''}
                        ${scene.bannerHighlight ? `<div id="stage-banner-highlight" class="nt-stage-text-editable text-xl sm:text-2xl font-black text-yellow-300 uppercase tracking-tight" data-field="bannerHighlight" contenteditable="true" spellcheck="false" title="✏️ Clic para editar texto">${scene.bannerHighlight}</div>` : ''}
                    </div>
                `;
            } else {
                bannerEl.innerHTML = '';
            }

            const words = (scene.script || '').trim().split(/\s+/).filter(Boolean);
            currentSceneChunks = buildSubtitleChunks(words, 5, 28);
            activeChunkIndex = 0;
            renderActiveChunk(0);

            // Build weighted cadence fallback for all browsers:
            let accumulatedMs = 60;
            words.forEach((w, i) => {
                const cleanLen = w.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]/g, '').length;
                let wordWeight = Math.max(160, cleanLen * 68);
                if (/[.,!?:;]/.test(w)) {
                    wordWeight += /[.?!]/.test(w) ? 350 : 180;
                }
                const wordDuration = wordWeight / (ttsRate || 1.10);

                const t = setTimeout(() => {
                    if (!hasActiveBoundaryEvents) {
                        highlightWordIndex(i, words.length);
                    }
                }, accumulatedMs);
                wordTimers.push(t);

                accumulatedMs += wordDuration;
            });

            const ribbonEl = document.getElementById('bottom-ribbon-container');
            if (scene.bottomRibbon && scene.bottomRibbon.trim() !== '') {
                ribbonEl.innerHTML = `
                    <div id="stage-bottom-ribbon" class="spring-pop inline-block bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[11px] sm:text-xs px-3.5 py-1.5 rounded-lg shadow-xl border border-white/40 uppercase tracking-wide transform -rotate-1 nt-stage-text-editable" data-field="bottomRibbon" contenteditable="true" spellcheck="false" title="✏️ Clic para editar cinta">
                        ${scene.bottomRibbon}
                    </div>
                `;
            } else {
                ribbonEl.innerHTML = '';
            }

            const timerEl = document.getElementById('corner-timer-badge');
            if (scene.timerBadge && scene.timerBadge.trim() !== '') {
                timerEl.innerHTML = `
                    <div id="stage-timer-badge" class="spring-pop-2 w-11 h-11 rounded-full bg-black/85 border-2 border-white/85 text-white font-black text-xs flex items-center justify-center shadow-2xl nt-stage-text-editable" data-field="timerBadge" contenteditable="true" spellcheck="false" title="✏️ Clic para editar badge">
                        ${scene.timerBadge}
                    </div>
                `;
            } else {
                timerEl.innerHTML = '';
            }

            const graphicContainer = document.getElementById('vector-graphic-stage');
            graphicContainer.innerHTML = buildVectorGraphicHTML(scene);
            graphicContainer.setAttribute('data-active-beat', '1');
            graphicContainer.classList.remove('stage-beat-2', 'stage-beat-3');
            graphicContainer.classList.add('stage-beat-1');

            // Props Reset: El sello espera oculto si se reproduce, o se muestra en preview estático si se edita en pausa
            const stampEl = document.getElementById('stage-rubber-stamp');
            if (stampEl) {
                if (scene.stampText && scene.stampText.trim()) {
                    stampEl.textContent = scene.stampText.trim().toUpperCase();
                    stampEl.classList.add('nt-stage-text-editable');
                    stampEl.setAttribute('data-field', 'stampText');
                    stampEl.setAttribute('contenteditable', 'true');
                    stampEl.setAttribute('spellcheck', 'false');
                    stampEl.setAttribute('title', '✏️ Clic para editar texto o arrastra');
                    const stampT = getPropTransform('stamp');
                    if (isPlaying) {
                        stampEl.classList.add('hidden');
                        stampEl.style.transform = '';
                    } else {
                        stampEl.classList.remove('hidden', 'rubber-stamp-slam');
                        stampEl.style.opacity = '1';
                        stampEl.style.transform = `translate(${stampT.x}px, ${stampT.y}px) rotate(-12deg) scale(${stampT.scale || 1})`;
                    }
                } else {
                    stampEl.textContent = '';
                    stampEl.classList.add('hidden');
                }
            }
            const barsEl = document.getElementById('stage-jail-bars');
            if (barsEl) { barsEl.classList.add('hidden'); }
            initStageInlineTextEditing();

            renderDualOverlayLayer(scene);
            animateLiveMoneyTicker();
            preloadSceneSFX(scene);

            playCustomOrSynthSFX(scene.sfx || 'whoosh', isPlaying ? 1 : 0);
            if (isPlaying) {
                playSceneSoundtrack(scene);
            }

            renderSceneTabsStrip();
            saveStateToLocalStorage();
        }

        function renderProgressBars() {
            const container = document.getElementById('scene-progress-bars');
            const scenes = currentConfig.scenes;
            container.innerHTML = scenes.map((_, i) => {
                let fillWidth = '0%';
                if (i < currentSceneIndex) fillWidth = '100%';
                return `
                    <div class="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div id="prog-bar-${i}" class="h-full bg-white rounded-full transition-all duration-75" style="width:${fillWidth}"></div>
                    </div>
                `;
            }).join('');
        }

        function clearWordTimers() {
            wordTimers.forEach(t => clearTimeout(t));
            wordTimers = [];
        }

        function updateTotalDurationBadge() {
            const totalMs = currentConfig.scenes.reduce((acc, s) => acc + getSceneDurationMs(s), 0);
            const totalSec = (totalMs / 1000).toFixed(1);
            const badge = document.getElementById('total-duration-badge');
            if (badge) badge.textContent = `⏱️ ${totalSec}s total`;
        }

        // ==========================================
        // 6. CONTEXTUAL PARTICLES & AMBIENT ORBS
        // ==========================================
        function updateContextualParticles(envType) {
            const layer = document.getElementById('particles-layer');
            if (!layer) return;

            let html = '';
            let count = 16;
            let colors = ['#facc15', '#38bdf8', '#f97316', '#ffffff'];

            if (envType === 'env_radial_fire' || envType === 'env_earth_magma') {
                colors = ['#ef4444', '#f97316', '#facc15', '#ffffff'];
                for (let i = 0; i < count; i++) {
                    const size = Math.floor(Math.random() * 8) + 4;
                    const left = Math.floor(Math.random() * 90) + 5;
                    const top = Math.floor(Math.random() * 85) + 8;
                    const delay = (Math.random() * 2.8).toFixed(2);
                    const color = colors[i % colors.length];
                    html += `<div class="particle particle-spark" style="width:${size}px;height:${size}px;left:${left}%;top:${top}%;background:${color};animation-delay:${delay}s;"></div>`;
                }
            } else if (envType === 'env_cyber_city' || envType === 'env_ai_lab' || envType === 'env_brain_xray') {
                const codeChars = ['0', '1', '{', '}', '<', '>', '/', '#', 'AI'];
                for (let i = 0; i < 14; i++) {
                    const left = Math.floor(Math.random() * 88) + 6;
                    const top = Math.floor(Math.random() * 70) + 10;
                    const delay = (Math.random() * 3.5).toFixed(2);
                    const char = codeChars[i % codeChars.length];
                    html += `<div class="particle-code text-cyan-400" style="left:${left}%;top:${top}%;animation-delay:${delay}s;">${char}</div>`;
                }
            } else {
                for (let i = 0; i < count; i++) {
                    const size = Math.floor(Math.random() * 6) + 4;
                    const left = Math.floor(Math.random() * 92) + 4;
                    const top = Math.floor(Math.random() * 88) + 6;
                    const delay = (Math.random() * 3.5).toFixed(2);
                    const color = colors[i % colors.length];
                    html += `<div class="particle" style="width:${size}px;height:${size}px;left:${left}%;top:${top}%;background:${color};animation-delay:${delay}s;"></div>`;
                }
            }
            layer.innerHTML = html;
        }

        function updateAmbientOrbs(envType) {
            const container = document.getElementById('ambient-orbs-layer');
            if (!container) return;

            let orb1 = 'background: #38bdf8; top: 20%; left: 10%; width: 140px; height: 140px;';
            let orb2 = 'background: #f59e0b; bottom: 25%; right: 10%; width: 160px; height: 160px;';

            if (envType === 'env_radial_fire') {
                orb1 = 'background: #ef4444; top: 15%; left: 15%; width: 180px; height: 180px;';
                orb2 = 'background: #f97316; bottom: 20%; right: 15%; width: 180px; height: 180px;';
            } else if (envType === 'env_cyber_city' || envType === 'env_ai_lab') {
                orb1 = 'background: #06b6d4; top: 25%; left: 5%; width: 150px; height: 150px;';
                orb2 = 'background: #8b5cf6; bottom: 20%; right: 10%; width: 160px; height: 160px;';
            }

            container.innerHTML = `
                <div class="ambient-orb" style="${orb1}"></div>
                <div class="ambient-orb" style="${orb2}"></div>
            `;
        }

