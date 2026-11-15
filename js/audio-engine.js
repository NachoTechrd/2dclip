        // ==========================================
        // 2. AUDIO SYNTHESIZER & BGM GENERATOR
        // ==========================================
        const STORAGE_KEY = 'nt_atom_story_engine_v4_state';
        let currentConfig = JSON.parse(JSON.stringify(TEMPLATES.atom_brazos));
        let currentSceneIndex = 0;
        let isPlaying = true;
        let sfxEnabled = true;
        let ttsEnabled = true;
        let bgmEnabled = false;
        let currentBgmTrack = 'downtempo';
        let bgmVolume = 0.14;
        let sfxVolume = 0.80;
        let ttsRate = 1.12;
        let selectedVoiceURI = "";
        let sceneStartTime = performance.now();
        let wordTimers = [];
        let animFrameId = null;
        let audioCtx = null;
        let bgmIntervalId = null;
        let bgmGainNode = null;
        let sfxGainNode = null;
        let isRecordingWebM = false;
        let mediaRecorder = null;
        let recordedChunks = [];

        let masterRecordDest = null;
        let activeAudioBufferSource = null;

        function getAudioCtx() {
            if (!audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioCtx = new AudioContext();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            if (!masterRecordDest) {
                masterRecordDest = audioCtx.createMediaStreamDestination();
            }
            return audioCtx;
        }

        function connectToMasterAudio(node) {
            if (!node) return;
            try {
                const ctx = getAudioCtx();
                node.connect(ctx.destination);
                if (masterRecordDest) {
                    node.connect(masterRecordDest);
                }
            } catch(e) {}
        }

        function getBGMGainNode() {
            const ctx = getAudioCtx();
            if (!bgmGainNode || bgmGainNode.context !== ctx) {
                bgmGainNode = ctx.createGain();
                bgmGainNode.gain.setValueAtTime(bgmVolume, ctx.currentTime);
                connectToMasterAudio(bgmGainNode);
            }
            return bgmGainNode;
        }

        function getSFXGainNode() {
            const ctx = getAudioCtx();
            if (!sfxGainNode || sfxGainNode.context !== ctx) {
                sfxGainNode = ctx.createGain();
                sfxGainNode.gain.setValueAtTime(sfxVolume, ctx.currentTime);
                connectToMasterAudio(sfxGainNode);
            }
            return sfxGainNode;
        }

        function duckBGM(isDucking) {
            if (!bgmEnabled || !bgmGainNode || !audioCtx) return;
            try {
                const now = audioCtx.currentTime;
                const target = isDucking ? Math.max(0.02, bgmVolume * 0.35) : bgmVolume;
                bgmGainNode.gain.cancelScheduledValues(now);
                bgmGainNode.gain.setTargetAtTime(target, now, isDucking ? 0.08 : 0.25);
            } catch (e) {}
        }

        function stopVoicePlayback() {
            if (speechDispatchTimer) {
                clearTimeout(speechDispatchTimer);
                speechDispatchTimer = null;
            }
            if (activeAudioBufferSource) {
                try { activeAudioBufferSource.stop(); } catch(e) {}
                activeAudioBufferSource = null;
            }
            if (activeSceneAudioPlayer) {
                try {
                    activeSceneAudioPlayer.pause();
                    activeSceneAudioPlayer.currentTime = 0;
                } catch(e) {}
                activeSceneAudioPlayer = null;
            }
            if ('speechSynthesis' in window) {
                try {
                    window.speechSynthesis.cancel();
                    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
                } catch(e) {}
            }
            isCurrentSpeechPlaying = false;
            duckBGM(false);
        }

        // Pro Multi-Layered WebAudio SFX Synthesizer (White Noise + Filter Sweeps + Harmonics)
        function createNoiseBuffer(ctx, durationSec) {
            const sampleRate = ctx.sampleRate || 44100;
            const frameCount = Math.max(1, Math.floor(sampleRate * durationSec));
            const buffer = ctx.createBuffer(1, frameCount, sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < frameCount; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            return buffer;
        }

        function playSFX(type) {
            if (!sfxEnabled) return;
            try {
                const ctx = getAudioCtx();
                const out = getSFXGainNode();
                const now = ctx.currentTime;

                if (type === 'whoosh' || type === 'swoosh') {
                    // Filtered white noise air sweep + sub body
                    const noise = ctx.createBufferSource();
                    noise.buffer = createNoiseBuffer(ctx, 0.36);
                    const filter = ctx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.Q.setValueAtTime(2.2, now);
                    filter.frequency.setValueAtTime(180, now);
                    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.14);
                    filter.frequency.exponentialRampToValueAtTime(160, now + 0.34);
                    const nGain = ctx.createGain();
                    nGain.gain.setValueAtTime(0.001, now);
                    nGain.gain.linearRampToValueAtTime(0.32, now + 0.10);
                    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                    noise.connect(filter);
                    filter.connect(nGain);
                    nGain.connect(out);
                    noise.start(now);
                    noise.stop(now + 0.36);

                    const sub = ctx.createOscillator();
                    const sGain = ctx.createGain();
                    sub.type = 'sine';
                    sub.frequency.setValueAtTime(160, now);
                    sub.frequency.exponentialRampToValueAtTime(48, now + 0.24);
                    sGain.gain.setValueAtTime(0.18, now);
                    sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                    sub.connect(sGain);
                    sGain.connect(out);
                    sub.start(now);
                    sub.stop(now + 0.26);
                } else if (type === 'pop' || type === 'clack') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(320, now);
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.055);
                    osc.frequency.exponentialRampToValueAtTime(420, now + 0.10);
                    gain.gain.setValueAtTime(0.26, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
                    osc.connect(gain);
                    gain.connect(out);
                    osc.start(now);
                    osc.stop(now + 0.12);
                } else if (type === 'cash') {
                    [1318.51, 1760.0, 2637.02].forEach((freq, i) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = i === 2 ? 'triangle' : 'sine';
                        osc.frequency.setValueAtTime(freq, now + i * 0.045);
                        gain.gain.setValueAtTime(0.001, now);
                        gain.gain.setValueAtTime(0.18, now + i * 0.045);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42 + i * 0.06);
                        osc.connect(gain);
                        gain.connect(out);
                        osc.start(now + i * 0.045);
                        osc.stop(now + 0.50 + i * 0.06);
                    });
                } else if (type === 'radar') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1480, now);
                    osc.frequency.exponentialRampToValueAtTime(1465, now + 0.35);
                    gain.gain.setValueAtTime(0.18, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.40);
                    osc.connect(gain);
                    gain.connect(out);
                    osc.start(now);
                    osc.stop(now + 0.42);
                } else if (type === 'cyber' || type === 'glitch') {
                    const filter = ctx.createBiquadFilter();
                    filter.type = 'highpass';
                    filter.frequency.setValueAtTime(400, now);
                    const g = ctx.createGain();
                    g.gain.setValueAtTime(0.14, now);
                    g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                    filter.connect(g);
                    g.connect(out);

                    [440, 880, 1320, 660].forEach((f, idx) => {
                        const osc = ctx.createOscillator();
                        osc.type = idx % 2 === 0 ? 'sawtooth' : 'square';
                        osc.frequency.setValueAtTime(f, now + idx * 0.035);
                        osc.connect(filter);
                        osc.start(now + idx * 0.035);
                        osc.stop(now + idx * 0.035 + 0.045);
                    });
                } else if (type === 'ding' || type === 'sparkle') {
                    [880, 1318.51, 1760].forEach((f, idx) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(f, now + idx * 0.04);
                        gain.gain.setValueAtTime(0.16 / (idx + 1), now + idx * 0.04);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
                        osc.connect(gain);
                        gain.connect(out);
                        osc.start(now + idx * 0.04);
                        osc.stop(now + 0.56);
                    });
                } else if (type === 'impact' || type === 'boom') {
                    // Punch transient + deep sub drop + low noise thump
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(175, now);
                    osc.frequency.exponentialRampToValueAtTime(28, now + 0.46);
                    gain.gain.setValueAtTime(0.45, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
                    osc.connect(gain);
                    gain.connect(out);
                    osc.start(now);
                    osc.stop(now + 0.50);

                    const noise = ctx.createBufferSource();
                    noise.buffer = createNoiseBuffer(ctx, 0.16);
                    const lp = ctx.createBiquadFilter();
                    lp.type = 'lowpass';
                    lp.frequency.setValueAtTime(520, now);
                    const nGain = ctx.createGain();
                    nGain.gain.setValueAtTime(0.28, now);
                    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
                    noise.connect(lp);
                    lp.connect(nGain);
                    nGain.connect(out);
                    noise.start(now);
                    noise.stop(now + 0.17);
                }
            } catch (e) {}
        }

        // Ambient Background Music Generator (Multi-Voice Polyphonic Synth Loop)
        function toggleBGM(forceState) {
            if (typeof forceState === 'boolean') {
                bgmEnabled = forceState;
            } else {
                bgmEnabled = !bgmEnabled;
            }

            const btn = document.getElementById('bgm-toggle-btn');
            const statusBadge = document.getElementById('bgm-status-text');
            if (bgmEnabled) {
                if (btn) {
                    btn.textContent = '🎵 BGM: ON';
                    btn.className = 'px-2.5 py-1.5 rounded-xl bg-purple-500 text-slate-950 font-black text-xs transition shadow-md shadow-purple-500/25';
                }
                if (statusBadge) {
                    statusBadge.textContent = 'Activo';
                    statusBadge.className = 'text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300';
                }
                startBGMDrone();
            } else {
                if (btn) {
                    btn.textContent = '🎵 BGM: OFF';
                    btn.className = 'px-2.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition';
                }
                if (statusBadge) {
                    statusBadge.textContent = 'Desactivado';
                    statusBadge.className = 'text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300';
                }
                stopBGMDrone();
            }
            if (typeof persistAllUserSettingsLocal === 'function') persistAllUserSettingsLocal();
        }

        function changeBGMTrack(track) {
            currentBgmTrack = track || 'downtempo';
            const sel = document.getElementById('bgm-track-select');
            if (sel && sel.value !== currentBgmTrack) sel.value = currentBgmTrack;
            if (bgmEnabled) {
                startBGMDrone();
            }
            if (typeof persistAllUserSettingsLocal === 'function') persistAllUserSettingsLocal();
        }

        function startBGMDrone() {
            stopBGMDrone();
            try {
                const ctx = getAudioCtx();
                const bgmOut = getBGMGainNode();
                const volSlider = document.getElementById('bgm-volume-slider');
                if (volSlider) bgmVolume = parseFloat(volSlider.value) || 0.14;
                bgmOut.gain.setValueAtTime(isCurrentSpeechPlaying ? Math.max(0.02, bgmVolume * 0.35) : bgmVolume, ctx.currentTime);

                const tracks = {
                    downtempo: {
                        tempoMs: 650,
                        wave: 'triangle',
                        cutoff: 900,
                        chords: [
                            [130.81, 155.56, 196.00, 233.08],
                            [116.54, 146.83, 174.61, 207.65],
                            [103.83, 130.81, 155.56, 196.00],
                            [98.00, 123.47, 146.83, 196.00]
                        ],
                        arp: [261.63, 311.13, 392.00, 466.16, 392.00, 311.13]
                    },
                    cyberpunk: {
                        tempoMs: 280,
                        wave: 'sawtooth',
                        cutoff: 1250,
                        chords: [
                            [110.00, 164.81, 220.00],
                            [98.00, 146.83, 196.00],
                            [87.31, 130.81, 174.61],
                            [82.41, 123.47, 164.81]
                        ],
                        arp: [220.00, 261.63, 329.63, 440.00, 329.63, 261.63]
                    },
                    corporate: {
                        tempoMs: 520,
                        wave: 'sine',
                        cutoff: 1400,
                        chords: [
                            [146.83, 220.00, 293.66, 369.99],
                            [130.81, 196.00, 261.63, 329.63],
                            [123.47, 185.00, 246.94, 329.63],
                            [110.00, 164.81, 220.00, 277.18]
                        ],
                        arp: [440.00, 587.33, 739.99, 587.33]
                    },
                    epic: {
                        tempoMs: 440,
                        wave: 'sawtooth',
                        cutoff: 780,
                        chords: [
                            [98.00, 146.83, 196.00, 233.08],
                            [87.31, 130.81, 174.61, 220.00],
                            [77.78, 116.54, 155.56, 196.00],
                            [73.42, 110.00, 146.83, 185.00]
                        ],
                        arp: [196.00, 233.08, 293.66, 392.00]
                    }
                };
                tracks.tech_pulse = tracks.cyberpunk;
                tracks.suspense_doc = tracks.epic;
                tracks.upbeat_viral = tracks.corporate;

                const spec = tracks[currentBgmTrack] || tracks.downtempo;
                let step = 0;

                const playStep = () => {
                    if (!bgmEnabled) return;
                    const now = ctx.currentTime;
                    const chord = spec.chords[Math.floor(step / 4) % spec.chords.length];

                    // Every 4 steps trigger warm lush pad + sub bass
                    if (step % 4 === 0) {
                        const dur = (spec.tempoMs * 4) / 1000;
                        const padFilter = ctx.createBiquadFilter();
                        padFilter.type = 'lowpass';
                        padFilter.frequency.setValueAtTime(spec.cutoff, now);
                        const padGain = ctx.createGain();
                        padGain.gain.setValueAtTime(0.001, now);
                        padGain.gain.linearRampToValueAtTime(0.45, now + 0.15);
                        padGain.gain.exponentialRampToValueAtTime(0.01, now + dur + 0.15);
                        padFilter.connect(padGain);
                        padGain.connect(bgmOut);

                        chord.forEach((freq) => {
                            const osc = ctx.createOscillator();
                            osc.type = spec.wave;
                            osc.frequency.setValueAtTime(freq, now);
                            osc.connect(padFilter);
                            osc.start(now);
                            osc.stop(now + dur + 0.2);
                        });
                    }

                    // Rhythmic arpeggio pluck
                    const arpFreq = spec.arp[step % spec.arp.length];
                    const arpOsc = ctx.createOscillator();
                    const arpFilter = ctx.createBiquadFilter();
                    const arpGain = ctx.createGain();
                    arpFilter.type = 'lowpass';
                    arpFilter.frequency.setValueAtTime(spec.cutoff * 1.4, now);
                    arpOsc.type = 'triangle';
                    arpOsc.frequency.setValueAtTime(arpFreq, now);
                    arpGain.gain.setValueAtTime(0.001, now);
                    arpGain.gain.linearRampToValueAtTime(0.32, now + 0.02);
                    arpGain.gain.exponentialRampToValueAtTime(0.001, now + (spec.tempoMs / 1000) * 0.9);
                    arpOsc.connect(arpFilter);
                    arpFilter.connect(arpGain);
                    arpGain.connect(bgmOut);
                    arpOsc.start(now);
                    arpOsc.stop(now + (spec.tempoMs / 1000));

                    step++;
                };

                playStep();
                bgmIntervalId = setInterval(playStep, spec.tempoMs);
            } catch (e) {}
        }

        function stopBGMDrone() {
            if (bgmIntervalId) {
                clearInterval(bgmIntervalId);
                bgmIntervalId = null;
            }
        }

        function updateBGMVolume(val) {
            const parsed = parseFloat(val);
            if (!isNaN(parsed)) {
                bgmVolume = Math.max(0, Math.min(0.6, parsed));
            }
            const label = document.getElementById('bgm-volume-label');
            if (label) {
                label.textContent = `${Math.round((bgmVolume / 0.35) * 100)}%`;
            }
            if (bgmGainNode && audioCtx) {
                const target = isCurrentSpeechPlaying ? Math.max(0.02, bgmVolume * 0.35) : bgmVolume;
                bgmGainNode.gain.setTargetAtTime(target, audioCtx.currentTime, 0.05);
            }
            if (typeof persistAllUserSettingsLocal === 'function') persistAllUserSettingsLocal();
        }

        // ==========================================
        // 100% FREE BROWSER SPEECH SYNTHESIS ENGINE
        // ==========================================
        ttsRate = 1.10;
        let ttsPitch = 1.00;
        selectedVoiceURI = localStorage.getItem('nt_free_voice_uri') || '';
        let speechUnlocked = false;

        function unlockSpeechAudio() {
            if (speechUnlocked) return;
            speechUnlocked = true;
            if ('speechSynthesis' in window) {
                try {
                    window.speechSynthesis.resume();
                    const silentUtter = new SpeechSynthesisUtterance(' ');
                    silentUtter.volume = 0.01;
                    window.speechSynthesis.speak(silentUtter);
                } catch(e) {}
            }
        }
        document.addEventListener('click', unlockSpeechAudio, { once: true });
        document.addEventListener('touchstart', unlockSpeechAudio, { once: true });

        function getBestSpanishVoices() {
            if (!('speechSynthesis' in window)) return [];
            const voices = window.speechSynthesis.getVoices();
            if (!voices || voices.length === 0) return [];

            const es = voices.filter(v => v.lang && (v.lang.toLowerCase().startsWith('es') || v.lang.toLowerCase().includes('-es')));
            const list = es.length > 0 ? es : voices;

            return list.sort((a, b) => {
                const scoreA = getVoiceQualityScore(a);
                const scoreB = getVoiceQualityScore(b);
                return scoreB - scoreA;
            });
        }

        function getVoiceQualityScore(v) {
            const name = (v.name || '').toLowerCase();
            let score = 0;
            if (name.includes('natural') || name.includes('online')) score += 100;
            if (name.includes('google')) score += 60;
            if (name.includes('alvaro') || name.includes('elvira') || name.includes('jorge') || name.includes('dalia') || name.includes('monica') || name.includes('paulina') || name.includes('diego')) score += 40;
            if (v.lang && (v.lang.toLowerCase() === 'es-es' || v.lang.toLowerCase() === 'es-mx')) score += 10;
            return score;
        }

        function populateVoicesDropdown() {
            const select = document.getElementById('voice-select-dropdown');
            if (!select) return;

            const voices = ('speechSynthesis' in window) ? getBestSpanishVoices() : [];

            // Opción 1: ¡LA VOZ HERMOSA GOOGLE CLOUD HD! (La que el usuario escuchó y grabó)
            let optionsHtml = `
                <option value="google_cloud_hd">🌐 ✨ Google Cloud HD (Voz Latina Online • Súper Clara y Recomendada)</option>
            `;

            if (voices && voices.length > 0) {
                optionsHtml += voices.map((v, i) => {
                    const name = v.name || 'Voz';
                    let tag = '🗣️';
                    if (name.toLowerCase().includes('natural') || name.toLowerCase().includes('online')) tag = '⭐ [Ultra Realista]';
                    else if (name.toLowerCase().includes('google')) tag = '✨ [Google Sistema]';
                    else tag = '🗣️ [Sistema]';
                    return `<option value="${v.voiceURI}">${tag} ${name} (${v.lang})</option>`;
                }).join('');
            }

            select.innerHTML = optionsHtml;

            // Restore saved or select Google Cloud HD by default!
            const savedVoice = localStorage.getItem('nt_free_voice_uri');
            if (savedVoice && (savedVoice === 'google_cloud_hd' || (voices && voices.some(v => v.voiceURI === savedVoice)))) {
                selectedVoiceURI = savedVoice;
                select.value = savedVoice;
            } else {
                selectedVoiceURI = 'google_cloud_hd';
                select.value = 'google_cloud_hd';
                localStorage.setItem('nt_free_voice_uri', 'google_cloud_hd');
            }
        }

        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = populateVoicesDropdown;
        }

        function updateVoiceSelection() {
            selectedVoiceURI = document.getElementById('voice-select-dropdown').value;
            localStorage.setItem('nt_free_voice_uri', selectedVoiceURI);
            testFreeVoiceNow();
        }

        function updateTTSParams() {
            ttsRate = parseFloat(document.getElementById('tts-rate-slider').value);
            document.getElementById('tts-rate-label').textContent = `${ttsRate.toFixed(2)}x`;
            if (typeof synchronizeAllSceneDurations === 'function') {
                synchronizeAllSceneDurations();
                renderActiveSceneEditor();
            }
        }

        function updateTTSPitch() {
            ttsPitch = parseFloat(document.getElementById('tts-pitch-slider').value);
            document.getElementById('tts-pitch-label').textContent = `${ttsPitch.toFixed(2)}x`;
        }

        function applyVoicePreset(rate, pitch) {
            ttsRate = rate;
            ttsPitch = pitch;
            document.getElementById('tts-rate-slider').value = rate;
            document.getElementById('tts-rate-label').textContent = `${rate.toFixed(2)}x`;
            document.getElementById('tts-pitch-slider').value = pitch;
            document.getElementById('tts-pitch-label').textContent = `${pitch.toFixed(2)}x`;
            if (typeof synchronizeAllSceneDurations === 'function') {
                synchronizeAllSceneDurations();
                renderActiveSceneEditor();
            }
            playSFX('ding');
            testFreeVoiceNow();
        }

        function testFreeVoiceNow() {
            speakText("¡Hola! Esta es la voz gratuita que narrará tus videos virales en 2D.");
        }

        let isCurrentSpeechPlaying = false;
        let speechFinishTimestamp = 0;
        let hasActiveBoundaryEvents = false;
        let speechDispatchTimer = null;
        let currentUtterance = null;

        window.NT_GOOGLE_TTS_CACHE = window.NT_GOOGLE_TTS_CACHE || {};

        function speakText(text) {
            if (!ttsEnabled) return;
            if (!text || !text.trim()) return;

            const cleanScript = text.trim();

            // MODO 1: ¡LA VOZ HERMOSA GOOGLE CLOUD HD (ONLINE DIGITAL)!
            if (selectedVoiceURI === 'google_cloud_hd' || !selectedVoiceURI) {
                const ctx = getAudioCtx();

                // Si ya está en la memoria caché, reproducir de inmediato con sincronización exacta
                if (window.NT_GOOGLE_TTS_CACHE && window.NT_GOOGLE_TTS_CACHE[cleanScript]) {
                    stopVoicePlayback();
                    isCurrentSpeechPlaying = true;
                    speechFinishTimestamp = 0;
                    clearWordTimers();

                    const buf = window.NT_GOOGLE_TTS_CACHE[cleanScript];
                    const src = ctx.createBufferSource();
                    src.buffer = buf;
                    if (typeof ttsRate === 'number' && ttsRate > 0.5) {
                        src.playbackRate.value = ttsRate;
                    }
                    connectToMasterAudio(src);
                    activeAudioBufferSource = src;
                    duckBGM(true);

                    const words = cleanScript.split(/\s+/).filter(Boolean);
                    const effectiveDurationMs = (buf.duration * 1000) / (src.playbackRate.value || 1.0);
                    const msPerWord = words.length > 0 ? (effectiveDurationMs / words.length) : 320;
                    words.forEach((w, i) => {
                        const t = setTimeout(() => {
                            highlightWordIndex(i, words.length);
                        }, i * msPerWord);
                        wordTimers.push(t);
                    });

                    src.onended = function() {
                        isCurrentSpeechPlaying = false;
                        speechFinishTimestamp = performance.now();
                        highlightWordIndex(words.length - 1, words.length);
                        activeAudioBufferSource = null;
                        duckBGM(false);
                    };

                    src.start(0);
                    return;
                }

                // Si aún no está en caché, descargarlo desde /api/tts y reproducirlo
                fetchAndDecodeSceneVoice(cleanScript).then(buf => {
                    if (buf) {
                        if (!window.NT_GOOGLE_TTS_CACHE) window.NT_GOOGLE_TTS_CACHE = {};
                        window.NT_GOOGLE_TTS_CACHE[cleanScript] = buf;
                        speakText(cleanScript);
                    } else {
                        speakBrowserText(cleanScript);
                    }
                }).catch(() => {
                    speakBrowserText(cleanScript);
                });
                return;
            }

            // MODO 2: SÍNTESIS NATIVA DEL NAVEGADOR
            speakBrowserText(cleanScript);
        }

        function speakBrowserText(cleanScript) {
            if (!ttsEnabled || !('speechSynthesis' in window)) return;
            if (!cleanScript) return;

            try {
                if (speechDispatchTimer) {
                    clearTimeout(speechDispatchTimer);
                    speechDispatchTimer = null;
                }
                window.speechSynthesis.cancel();
                if (window.speechSynthesis.paused) {
                    window.speechSynthesis.resume();
                }

                isCurrentSpeechPlaying = true;
                speechFinishTimestamp = 0;
                hasActiveBoundaryEvents = false;

                const utter = new SpeechSynthesisUtterance(cleanScript);
                currentUtterance = utter;
                utter.rate = ttsRate || 1.10;
                utter.pitch = ttsPitch || 1.00;

                const voices = getBestSpanishVoices();
                let voiceToUse = null;

                if (selectedVoiceURI && selectedVoiceURI !== 'google_cloud_hd') {
                    voiceToUse = voices.find(v => v.voiceURI === selectedVoiceURI);
                }
                if (!voiceToUse && voices.length > 0) {
                    voiceToUse = voices[0];
                }

                if (voiceToUse) {
                    utter.voice = voiceToUse;
                    utter.lang = voiceToUse.lang || 'es-ES';
                } else {
                    utter.lang = 'es-ES';
                }

                const words = cleanScript.split(/\s+/).filter(Boolean);
                const wordMeta = [];
                let searchPos = 0;
                words.forEach((w, idx) => {
                    const start = cleanScript.indexOf(w, searchPos);
                    const end = start !== -1 ? start + w.length : searchPos + w.length;
                    searchPos = end;
                    wordMeta.push({ index: idx, word: w, start: Math.max(0, start), end: Math.max(0, end) });
                });

                utter.onstart = function() {
                    isCurrentSpeechPlaying = true;
                    speechFinishTimestamp = 0;
                };

                utter.onboundary = function(e) {
                    if (e.name === 'word' || e.name === 'sentence') {
                        hasActiveBoundaryEvents = true;
                        const charIdx = e.charIndex;
                        let matched = wordMeta.find(m => charIdx >= m.start && charIdx <= m.end);
                        if (!matched) {
                            matched = wordMeta.find(m => charIdx <= m.end);
                        }
                        if (matched) {
                            highlightWordIndex(matched.index, words.length);
                        }
                    }
                };

                utter.onend = function() {
                    isCurrentSpeechPlaying = false;
                    speechFinishTimestamp = performance.now();
                    highlightWordIndex(words.length - 1, words.length);
                };

                utter.onerror = function(err) {
                    console.warn('SpeechSynthesis utterance ended with error:', err);
                    isCurrentSpeechPlaying = false;
                    speechFinishTimestamp = performance.now();
                };

                speechDispatchTimer = setTimeout(() => {
                    if (isPlaying && isCurrentSpeechPlaying) {
                        window.speechSynthesis.speak(utter);
                    }
                }, 40);

            } catch (e) {
                console.warn('SpeechSynthesis error:', e);
                isCurrentSpeechPlaying = false;
                speechFinishTimestamp = performance.now();
            }
        }


        // ==========================================
        // MASTER UPGRADE: CUSTOM AUDIO, IPHONE & TEMPLATES
        // ==========================================
        let mediaRecorderAudio = null;
        let audioChunks = [];
        let isRecordingMic = false;
        let activeSceneAudioPlayer = null;
        let hudRecordingTimerId = null;
        let hudRecSeconds = 0;

        // ============================================================================
        // MOTOR ELEVENLABS PRO (TIMESTAMPS KARAOKE + CACHÉ + DIGITAL AUDIO MASTER ROUTING)
        // ============================================================================
        const ELEVEN_STORAGE_KEY = 'nt_elevenlabs_settings_v5';
        const elevenAudioCache = new Map(); // Evita gastar créditos si el texto y voz son iguales
        let activeAlignmentTimers = [];

        function getEffectiveElevenKey() {
            const fromTab = (document.getElementById('eleven-api-key-input')?.value || '').trim();
            if (fromTab) return fromTab;
            const fromModal = (document.getElementById('modal-eleven-key-input')?.value || '').trim();
            if (fromModal) return fromModal;
            try {
                const saved = JSON.parse(localStorage.getItem(ELEVEN_STORAGE_KEY) || '{}');
                if (saved.apiKey) return String(saved.apiKey).trim();
            } catch (e) {}
            return '';
        }

        function loadElevenConfig() {
            try {
                const saved = JSON.parse(localStorage.getItem(ELEVEN_STORAGE_KEY) || '{}');
                const keyInput = document.getElementById('eleven-api-key-input');
                const modalKeyInput = document.getElementById('modal-eleven-key-input');
                const voiceSelect = document.getElementById('eleven-voice-select');
                if (keyInput && saved.apiKey) keyInput.value = saved.apiKey;
                if (modalKeyInput && saved.apiKey) modalKeyInput.value = saved.apiKey;
                if (voiceSelect && saved.voiceId) voiceSelect.value = saved.voiceId;
                if (saved.stability !== undefined && document.getElementById('eleven-stability')) {
                    document.getElementById('eleven-stability').value = saved.stability;
                    const stabVal = document.getElementById('el-stab-val');
                    if (stabVal) stabVal.textContent = saved.stability;
                }
                if (saved.similarity !== undefined && document.getElementById('eleven-similarity')) {
                    document.getElementById('eleven-similarity').value = saved.similarity;
                    const simVal = document.getElementById('el-sim-val');
                    if (simVal) simVal.textContent = saved.similarity;
                }
                if (saved.style !== undefined && document.getElementById('eleven-style')) {
                    document.getElementById('eleven-style').value = saved.style;
                    const styleVal = document.getElementById('el-style-val');
                    if (styleVal) styleVal.textContent = saved.style;
                }
                updateElevenBadgeStatus();
            } catch (e) {}
        }

        function saveElevenConfig(skipCloudSync = false) {
            const apiKey = (document.getElementById('eleven-api-key-input')?.value || getEffectiveElevenKey() || '').trim();
            const voiceId = document.getElementById('eleven-voice-select')?.value || 'pNInz6obpgDQGcFmaJgB';
            const stability = parseFloat(document.getElementById('eleven-stability')?.value || '0.45');
            const similarity = parseFloat(document.getElementById('eleven-similarity')?.value || '0.80');
            const style = parseFloat(document.getElementById('eleven-style')?.value || '0.35');

            const modalKeyInput = document.getElementById('modal-eleven-key-input');
            if (modalKeyInput && apiKey && modalKeyInput.value !== apiKey) modalKeyInput.value = apiKey;

            localStorage.setItem(ELEVEN_STORAGE_KEY, JSON.stringify({ apiKey, voiceId, stability, similarity, style }));
            updateElevenBadgeStatus();
            if (typeof persistAllUserSettingsLocal === 'function') persistAllUserSettingsLocal();
            if (!skipCloudSync && typeof debouncedSettingsCloudSync === 'function') debouncedSettingsCloudSync();
        }

        function updateElevenBadgeStatus() {
            const badge = document.getElementById('eleven-status-badge');
            const apiKey = getEffectiveElevenKey();
            if (!badge) return;
            if (apiKey.length > 10) {
                badge.textContent = '✓ ElevenLabs Conectado';
                badge.className = 'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono-code';
            } else if (window.__NT_SERVER_KEY_STATUS__ && window.__NT_SERVER_KEY_STATUS__.elevenlabs) {
                badge.textContent = '✓ ElevenLabs Activo en Servidor';
                badge.className = 'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono-code';
            } else {
                badge.textContent = '🔒 Ingresa tu API Key';
                badge.className = 'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono-code';
            }
        }

        // Carga tus propias voces clonadas o guardadas desde tu cuenta o servidor de ElevenLabs
        async function fetchElevenLabsVoices() {
            const apiKey = getEffectiveElevenKey();
            const hasServerKey = Boolean(window.__NT_SERVER_KEY_STATUS__ && window.__NT_SERVER_KEY_STATUS__.elevenlabs);
            if (!apiKey && !hasServerKey && !(typeof currentUserToken !== 'undefined' && currentUserToken)) {
                alert('Primero pega tu API Key de ElevenLabs en Claves API o Audio & BGM.');
                return;
            }
            const badge = document.getElementById('eleven-status-badge');
            if (badge) badge.textContent = '⏳ Cargando voces...';

            try {
                let data = null;
                try {
                    const headers = {};
                    if (apiKey) headers['xi-api-key'] = apiKey;
                    if (typeof currentUserToken !== 'undefined' && currentUserToken) {
                        headers['Authorization'] = 'Bearer ' + currentUserToken;
                    }
                    const srvRes = await fetch('/api/elevenlabs', { headers });
                    const srvJson = await srvRes.json().catch(() => ({}));
                    if (srvRes.ok && Array.isArray(srvJson.voices)) {
                        data = srvJson;
                    } else if (!apiKey) {
                        throw new Error(srvJson.error || `HTTP ${srvRes.status}`);
                    }
                } catch (srvErr) {
                    if (!apiKey) throw srvErr;
                }

                if (!data && apiKey) {
                    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
                        headers: { 'xi-api-key': apiKey }
                    });
                    if (!res.ok) throw new Error('API Key inválida o sin permisos');
                    data = await res.json();
                }

                const select = document.getElementById('eleven-voice-select');
                if (select && data && Array.isArray(data.voices) && data.voices.length > 0) {
                    const prevVoice = select.value;
                    select.innerHTML = data.voices.map(v => {
                        const cat = v.category === 'cloned' ? '🧬 [Clonada]' : (v.category === 'generated' ? '✨ [Diseñada]' : '🎙️');
                        return `<option value="${v.voice_id}">${cat} ${v.name}</option>`;
                    }).join('');
                    if (prevVoice && Array.from(select.options).some(o => o.value === prevVoice)) {
                        select.value = prevVoice;
                    }
                    saveElevenConfig();
                    if (badge) {
                        badge.textContent = data.fallbackVoices
                            ? `✓ ${data.voices.length} Voces TTS Listas`
                            : `✓ ${data.voices.length} Voces Cargadas`;
                        badge.className = 'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono-code';
                    }
                    playSFX('ding');
                }
            } catch (err) {
                console.error(err);
                if (badge) badge.textContent = '❌ Error de API Key';
                alert('No se pudieron cargar las voces: ' + (err.message || 'Verifica tu API Key de ElevenLabs.'));
            }
        }

        // Convierte los timestamps por carácter de ElevenLabs en tiempos exactos por palabra
        function computeWordTimestampsFromAlignment(scriptText, alignment) {
            const words = (scriptText || '').trim().split(/\s+/).filter(Boolean);
            if (!alignment || !Array.isArray(alignment.character_start_times_seconds)) return null;

            const chars = alignment.characters || [];
            const starts = alignment.character_start_times_seconds || [];
            const ends = alignment.character_end_times_seconds || [];
            if (chars.length === 0 || starts.length === 0) return null;

            const wordTimings = [];
            let charCursor = 0;

            words.forEach((word, wIdx) => {
                while (charCursor < chars.length && /\s/.test(chars[charCursor])) {
                    charCursor++;
                }
                const startSec = starts[Math.min(charCursor, starts.length - 1)] || 0;
                charCursor += word.length;
                const endSec = ends[Math.min(Math.max(0, charCursor - 1), ends.length - 1)] || (startSec + 0.25);

                wordTimings.push({
                    wordIndex: wIdx,
                    word: word,
                    startMs: Math.round(startSec * 1000),
                    endMs: Math.round(endSec * 1000)
                });
            });

            const totalAudioMs = Math.round(Math.max(...ends, 2.2) * 1000);
            return { wordTimings, totalAudioMs };
        }

        // Convierte base64 MP3 a AudioBuffer en memoria para reproducción Web Audio y captura WebM directa
        async function decodeBase64ToAudioBuffer(base64Data) {
            try {
                const binaryString = atob(base64Data);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const ctx = getAudioCtx();
                const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
                return audioBuffer;
            } catch (e) {
                console.warn('Error al decodificar AudioBuffer de ElevenLabs:', e);
                return null;
            }
        }

        // Genera el audio MP3 + Timestamps de una escena específica y lo guarda en caché
        async function requestElevenLabsSceneAudio(sceneIndex) {
            const apiKey = getEffectiveElevenKey();
            const scene = currentConfig.scenes[sceneIndex];
            if (!scene || !scene.script) return false;

            const voiceId = document.getElementById('eleven-voice-select')?.value || 'pNInz6obpgDQGcFmaJgB';
            const stability = parseFloat(document.getElementById('eleven-stability')?.value || '0.45');
            const similarity = parseFloat(document.getElementById('eleven-similarity')?.value || '0.80');
            const style = parseFloat(document.getElementById('eleven-style')?.value || '0.35');

            const cacheKey = `${voiceId}_${stability}_${similarity}_${style}_${scene.script.trim()}`;
            if (elevenAudioCache.has(cacheKey)) {
                const cached = elevenAudioCache.get(cacheKey);
                scene.customAudioUrl = cached.audioDataUrl;
                scene._cachedAudioBuffer = cached.audioBuffer;
                scene.elevenWordTimings = cached.wordTimings;
                scene.duration = cached.durationMs;
                return true;
            }

            let data = null;

            // 1. Intentar primero vía backend /api/elevenlabs (usa key enviada o la guardada en la cuenta del usuario)
            if (typeof fetch === 'function') {
                try {
                    const headers = { 'Content-Type': 'application/json' };
                    if (apiKey) headers['xi-api-key'] = apiKey;
                    if (typeof currentUserToken !== 'undefined' && currentUserToken) {
                        headers['Authorization'] = 'Bearer ' + currentUserToken;
                    }
                    const serverRes = await fetch('/api/elevenlabs', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            text: scene.script.trim(),
                            voiceId,
                            apiKey: apiKey || undefined,
                            withTimestamps: true,
                            voiceSettings: {
                                stability,
                                similarity_boost: similarity,
                                style,
                                use_speaker_boost: true
                            }
                        })
                    });
                    if (serverRes.ok) {
                        const srvJson = await serverRes.json();
                        if (srvJson && (srvJson.audio_base64 || srvJson.audioUrl || srvJson.url)) {
                            data = srvJson;
                        }
                    } else if (!apiKey) {
                        const errJson = await serverRes.json().catch(() => ({}));
                        throw new Error(errJson.error || `ElevenLabs HTTP ${serverRes.status}`);
                    }
                } catch (srvErr) {
                    if (!apiKey) {
                        alert(`❌ Error de ElevenLabs: ${srvErr.message}\n\nIngresa tu API Key en "🔑 Claves API" o en la pestaña Audio & BGM.`);
                        return false;
                    }
                }
            }

            // 2. Fallback directo al API de ElevenLabs usando la clave del usuario si el servidor no respondió
            if (!data) {
                if (!apiKey) {
                    alert('Ingresa tu API Key de ElevenLabs en "🔑 Claves API" o en la pestaña Audio & BGM.');
                    if (typeof openApiKeysModal === 'function') openApiKeysModal();
                    return false;
                }
                const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
                    method: 'POST',
                    headers: {
                        'xi-api-key': apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: scene.script.trim(),
                        model_id: 'eleven_multilingual_v2',
                        voice_settings: {
                            stability,
                            similarity_boost: similarity,
                            style,
                            use_speaker_boost: true
                        }
                    })
                });

                if (!res.ok) {
                    const errTxt = await res.text();
                    throw new Error(`ElevenLabs HTTP ${res.status}: ${errTxt}`);
                }
                data = await res.json();
            }

            const rawBase64 = data.audio_base64 || '';
            const audioDataUrl = data.audioUrl || data.url || (rawBase64 ? `data:audio/mp3;base64,${rawBase64}` : '');
            const parsedAlign = computeWordTimestampsFromAlignment(scene.script, data.alignment);

            const durationMs = parsedAlign
                ? Math.max(2600, parsedAlign.totalAudioMs + 420)
                : calculateNaturalSceneDurationMs(scene.script, 1.0);

            const wordTimings = parsedAlign ? parsedAlign.wordTimings : null;

            // Decodificar también a AudioBuffer para transmisión digital al bus de grabación WebM
            let audioBuffer = rawBase64 ? await decodeBase64ToAudioBuffer(rawBase64) : null;
            if (!audioBuffer && audioDataUrl && !audioDataUrl.startsWith('data:')) {
                try {
                    const ctx = getAudioCtx();
                    const r = await fetch(audioDataUrl);
                    if (r.ok) audioBuffer = await ctx.decodeAudioData(await r.arrayBuffer());
                } catch (e) {}
            }

            scene.customAudioUrl = audioDataUrl;
            scene._cachedAudioBuffer = audioBuffer;
            scene.elevenWordTimings = wordTimings;
            scene.duration = durationMs;

            elevenAudioCache.set(cacheKey, { audioDataUrl, audioBuffer, wordTimings, durationMs });
            return true;
        }

        // Botón: Generar solo la escena actual
        async function generateElevenCurrentScene() {
            const btn = document.getElementById('btn-eleven-scene');
            const oldText = btn ? btn.innerHTML : '';
            try {
                if (btn) {
                    btn.disabled = true;
                    btn.innerHTML = '⏳ Generando voz...';
                }
                const ok = await requestElevenLabsSceneAudio(currentSceneIndex);
                if (ok) {
                    playSFX('ding');
                    updateTotalDurationBadge();
                    sceneStartTime = performance.now();
                    renderScene(currentSceneIndex);
                    renderActiveSceneEditor();
                }
            } catch (e) {
                console.error(e);
                alert('Error al generar con ElevenLabs: ' + e.message);
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = oldText;
                }
            }
        }

        // Botón: Generar las 5 escenas de todo el video en 1 clic
        async function generateElevenAllScenes() {
            const btn = document.getElementById('btn-eleven-all');
            const badge = document.getElementById('eleven-status-badge');
            const oldText = btn ? btn.innerHTML : '';
            try {
                if (btn) btn.disabled = true;
                const total = currentConfig.scenes.length;

                for (let i = 0; i < total; i++) {
                    if (btn) btn.innerHTML = `⏳ Generando Escena ${i + 1}/${total}...`;
                    if (badge) badge.textContent = `🎙️ Procesando ${i + 1}/${total}...`;
                    await requestElevenLabsSceneAudio(i);
                }

                if (badge) badge.textContent = `✓ ${total}/${total} Escenas Listas`;
                playSFX('cash');
                updateTotalDurationBadge();
                restartVideo();
            } catch (e) {
                console.error(e);
                alert('Error generando lote con ElevenLabs: ' + e.message);
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = oldText;
                }
            }
        }

        // Decodificador y cargador de voz digital de alta fidelidad (Serverless / Direct Web Audio)
        async function fetchAndDecodeSceneVoice(text) {
            if (!text || !text.trim()) return null;
            const cleanText = text.trim();
            const ctx = getAudioCtx();

            const endpoints = [
                `/api/tts?text=${encodeURIComponent(cleanText)}&lang=es`,
                `https://videos-ia-topaz.vercel.app/api/tts?text=${encodeURIComponent(cleanText)}&lang=es`
            ];

            for (const ep of endpoints) {
                try {
                    const res = await fetch(ep);
                    if (res.ok) {
                        const arrayBuf = await res.arrayBuffer();
                        if (arrayBuf && arrayBuf.byteLength > 200) {
                            const audioBuffer = await ctx.decodeAudioData(arrayBuf);
                            return audioBuffer;
                        }
                    }
                } catch(err) {}
            }
            return null;
        }

        async function preloadAllSceneVoices() {
            const scenes = (currentConfig && currentConfig.scenes) ? currentConfig.scenes : [];
            const tasks = scenes.map(async (scene) => {
                if (scene.customAudioUrl && !scene._cachedAudioBuffer) {
                    try {
                        const ctx = getAudioCtx();
                        const res = await fetch(scene.customAudioUrl);
                        if (res.ok) {
                            const arrayBuf = await res.arrayBuffer();
                            scene._cachedAudioBuffer = await ctx.decodeAudioData(arrayBuf);
                        }
                    } catch(err) {
                        console.warn('Error al precargar voz personalizada:', err);
                    }
                } else if ((selectedVoiceURI === 'google_cloud_hd' || !selectedVoiceURI) && scene.script && !scene._cachedAudioBuffer) {
                    try {
                        const clean = scene.script.trim();
                        if (window.NT_GOOGLE_TTS_CACHE && window.NT_GOOGLE_TTS_CACHE[clean]) {
                            scene._cachedAudioBuffer = window.NT_GOOGLE_TTS_CACHE[clean];
                        } else {
                            const buf = await fetchAndDecodeSceneVoice(clean);
                            if (buf) {
                                if (!window.NT_GOOGLE_TTS_CACHE) window.NT_GOOGLE_TTS_CACHE = {};
                                window.NT_GOOGLE_TTS_CACHE[clean] = buf;
                                scene._cachedAudioBuffer = buf;
                            }
                        }
                    } catch(err) {
                        console.warn('Error al precargar Google Cloud TTS:', err);
                    }
                }
            });
            await Promise.allSettled(tasks);
        }

        // Reproductor de Escena Unificado (Prioriza ElevenLabs/AudioBuffer Digital sobre Voz Gratis)
        function playSceneSoundtrack(scene) {
            stopVoicePlayback();
            activeAlignmentTimers.forEach(t => clearTimeout(t));
            activeAlignmentTimers = [];

            const ctx = getAudioCtx();

            // 1. AudioBuffer pre-cargado vía Web Audio (ElevenLabs decodificado o Serverless TTS)
            // Conecta al bus maestro de grabación digital directa (Opus 48kHz sin pérdida)
            if (scene && scene._cachedAudioBuffer) {
                try {
                    isCurrentSpeechPlaying = true;
                    speechFinishTimestamp = 0;
                    clearWordTimers();

                    const bufferSource = ctx.createBufferSource();
                    bufferSource.buffer = scene._cachedAudioBuffer;
                    if (typeof ttsRate === 'number' && ttsRate > 0.5 && !scene.elevenWordTimings) {
                        bufferSource.playbackRate.value = ttsRate;
                    }

                    connectToMasterAudio(bufferSource);
                    activeAudioBufferSource = bufferSource;
                    duckBGM(true);

                    const words = (scene.script || '').trim().split(/\s+/).filter(Boolean);

                    // Si tenemos timestamps exactos por palabra de ElevenLabs, sincronizar al milisegundo
                    if (Array.isArray(scene.elevenWordTimings) && scene.elevenWordTimings.length > 0) {
                        scene.elevenWordTimings.forEach(item => {
                            const timerId = setTimeout(() => {
                                if (isPlaying) highlightWordIndex(item.wordIndex, words.length);
                            }, item.startMs);
                            activeAlignmentTimers.push(timerId);
                        });
                    } else {
                        // Sincronización proporcional según la duración exacta del buffer
                        const effectiveDurationMs = (bufferSource.buffer.duration * 1000) / (bufferSource.playbackRate.value || 1.0);
                        const msPerWord = words.length > 0 ? (effectiveDurationMs / words.length) : 320;
                        words.forEach((w, i) => {
                            const t = setTimeout(() => {
                                highlightWordIndex(i, words.length);
                            }, i * msPerWord);
                            wordTimers.push(t);
                        });
                    }

                    bufferSource.onended = function() {
                        isCurrentSpeechPlaying = false;
                        speechFinishTimestamp = performance.now();
                        highlightWordIndex(words.length - 1, words.length);
                        activeAudioBufferSource = null;
                        duckBGM(false);
                    };

                    bufferSource.start(0);
                    return;
                } catch (bufErr) {
                    console.warn('Error al reproducir audio digital:', bufErr);
                }
            }

            // 2. Si la escena tiene customAudioUrl (ej. MP3 o data URL de ElevenLabs sin decodificar)
            if (scene && scene.customAudioUrl) {
                clearWordTimers();
                const audio = new Audio(scene.customAudioUrl);
                activeSceneAudioPlayer = audio;
                isCurrentSpeechPlaying = true;
                speechFinishTimestamp = 0;

                const words = (scene.script || '').trim().split(/\s+/).filter(Boolean);

                audio.onplay = () => {
                    isCurrentSpeechPlaying = true;
                    if (Array.isArray(scene.elevenWordTimings) && scene.elevenWordTimings.length > 0) {
                        scene.elevenWordTimings.forEach(item => {
                            const timerId = setTimeout(() => {
                                if (isPlaying) highlightWordIndex(item.wordIndex, words.length);
                            }, item.startMs);
                            activeAlignmentTimers.push(timerId);
                        });
                    } else {
                        const totalMs = (audio.duration && !isNaN(audio.duration)) ? audio.duration * 1000 : getSceneDurationMs(scene);
                        const stepMs = totalMs / Math.max(1, words.length);
                        words.forEach((_, idx) => {
                            const timerId = setTimeout(() => {
                                if (isPlaying) highlightWordIndex(idx, words.length);
                            }, Math.round(idx * stepMs));
                            activeAlignmentTimers.push(timerId);
                        });
                    }
                };

                audio.onended = () => {
                    isCurrentSpeechPlaying = false;
                    speechFinishTimestamp = performance.now();
                    highlightWordIndex(words.length - 1, words.length);
                };

                audio.onerror = () => {
                    isCurrentSpeechPlaying = false;
                    speechFinishTimestamp = performance.now();
                };

                audio.play().catch(err => {
                    console.warn('Autoplay bloqueado hasta interacción:', err);
                    isCurrentSpeechPlaying = false;
                });
                return;
            }

            // 3. Fallback directo a síntesis vocal nativa del navegador (Voz Gratuita Seleccionada)
            // Se ejecuta de inmediato sin peticiones de red duplicadas ni desfases
            if (isPlaying && scene && scene.script && !activeAudioBufferSource && !isCurrentSpeechPlaying) {
                speakText(scene.script);
            }
        }

        // Microphone Voice Recording per Scene
        async function toggleRecordSceneMic(sceneIndex) {
            const btn = document.getElementById(`btn-scene-mic-${sceneIndex}`);
            const label = document.getElementById(`mic-label-${sceneIndex}`);

            if (isRecordingMic) {
                // Stop recording
                if (mediaRecorderAudio && mediaRecorderAudio.state === 'recording') {
                    mediaRecorderAudio.stop();
                }
                isRecordingMic = false;
                if (label) label.textContent = 'Grabar con Micrófono';
                if (btn) btn.className = 'px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1 transition';
            } else {
                // Start recording
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    audioChunks = [];
                    mediaRecorderAudio = new MediaRecorder(stream);
                    
                    mediaRecorderAudio.ondataavailable = function(e) {
                        if (e.data.size > 0) audioChunks.push(e.data);
                    };

                    mediaRecorderAudio.onstop = async function() {
                        const mime = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/mp4')) ? 'audio/mp4' : 'audio/webm';
                        const blob = new Blob(audioChunks, { type: mime });
                        const reader = new FileReader();
                        reader.onload = async function(e) {
                            const base64Data = e.target.result;
                            currentConfig.scenes[sceneIndex].customAudioUrl = base64Data;
                            renderActiveSceneEditor();

                            // Measure audio length to auto-set scene duration
                            const tempAudio = new Audio(base64Data);
                            tempAudio.onloadedmetadata = function() {
                                if (tempAudio.duration && tempAudio.duration > 1) {
                                    currentConfig.scenes[sceneIndex].duration = Math.round(tempAudio.duration * 1000 + 400);
                                    updateTotalDurationBadge();
                                }
                            };

                            // Subida automática a Cloudinary para persistencia permanente multidispositivo
                            try {
                                showStudioToast('☁️ Guardando voz en Cloudinary CDN...', 3000);
                                const upResp = await fetch('/api/upload', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ file: base64Data, resource_type: 'audio', folder: '2dclip_voices' })
                                });
                                const upData = await upResp.json();
                                if (upData.success && upData.url) {
                                    currentConfig.scenes[sceneIndex].customAudioUrl = upData.url;
                                    showStudioToast('✓ Voz sincronizada permanentemente en la nube', 4000);
                                    saveStateToLocalStorage();
                                    if (typeof currentUserToken !== 'undefined' && currentUserToken) {
                                        debouncedCloudAutoSync();
                                    }
                                }
                            } catch (upErr) {
                                console.warn('Aviso: audio guardado en almacenamiento local:', upErr);
                            }
                        };
                        reader.readAsDataURL(blob);
                        stream.getTracks().forEach(track => track.stop());
                    };

                    mediaRecorderAudio.start();
                    isRecordingMic = true;
                    if (label) label.textContent = '⏹ Detener Grabación';
                    if (btn) btn.className = 'px-2.5 py-1 rounded-lg bg-rose-600 text-white mic-recording-pulse border border-white text-[11px] font-bold flex items-center gap-1 transition';
                } catch (err) {
                    alert('Por favor autoriza el uso del micrófono en tu navegador o móvil para grabar tu voz.');
                }
            }
        }

        // Upload MP3/WAV for scene
        function uploadSceneAudio(event, sceneIndex) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async function(e) {
                const dataUrl = e.target.result;
                currentConfig.scenes[sceneIndex].customAudioUrl = dataUrl;
                delete currentConfig.scenes[sceneIndex]._cachedAudioBuffer;
                const tempAudio = new Audio(dataUrl);
                tempAudio.onloadedmetadata = function() {
                    if (tempAudio.duration && tempAudio.duration > 1) {
                        currentConfig.scenes[sceneIndex].duration = Math.round(tempAudio.duration * 1000 + 400);
                        renderActiveSceneEditor();
                        updateTotalDurationBadge();
                    }
                };
                renderActiveSceneEditor();
                if (typeof showStudioToast === 'function') showStudioToast('☁️ Subiendo audio MP3/WAV a Cloudinary...', 2500);
                const cloudUrl = await uploadAssetDataUrlToCloud(dataUrl, 'audio', '2dclip_voices');
                if (cloudUrl && currentConfig.scenes[sceneIndex]) {
                    currentConfig.scenes[sceneIndex].customAudioUrl = cloudUrl;
                    saveStateToLocalStorage();
                    renderActiveSceneEditor();
                    if (typeof showStudioToast === 'function') showStudioToast('✓ Audio guardado en la nube', 2500);
                } else {
                    saveStateToLocalStorage();
                }
            };
            reader.readAsDataURL(file);
        }

        function previewSceneAudio(sceneIndex) {
            const url = currentConfig.scenes[sceneIndex].customAudioUrl;
            if (url) {
                const a = new Audio(url);
                a.play();
            }
        }

        function deleteSceneAudio(sceneIndex) {
            delete currentConfig.scenes[sceneIndex].customAudioUrl;
            renderActiveSceneEditor();
        }

        // iPhone Fullscreen Clean Recording Engine
        function openIphoneRecordModal() {
            document.getElementById('iphone-record-modal').classList.remove('hidden');
        }

        function closeIphoneRecordModal() {
            document.getElementById('iphone-record-modal').classList.add('hidden');
        }

        function startIphoneCleanPlayback() {
            closeIphoneRecordModal();
            document.body.classList.add('iphone-recording-active');
            document.getElementById('iphone-pure-exit').classList.remove('hidden');
            
            // Countdown 3-2-1
            const countdownEl = document.getElementById('countdown-overlay');
            const numEl = document.getElementById('countdown-number');
            countdownEl.classList.remove('hidden');
            numEl.textContent = '3';
            
            setTimeout(() => {
                numEl.textContent = '2';
                setTimeout(() => {
                    numEl.textContent = '1';
                    setTimeout(() => {
                        countdownEl.classList.add('hidden');
                        restartVideo();
                    }, 800);
                }, 800);
            }, 800);
        }

        function exitIphoneRecording() {
            document.body.classList.remove('iphone-recording-active');
            document.getElementById('iphone-pure-exit').classList.add('hidden');
        }

        // Functional HUD Record Action
        function toggleHudRecordAction() {
            const btnText = document.getElementById('hud-rec-btn-text');
            const timerLabel = document.getElementById('rec-hud-time');

            if (!isRecordingWebM) {
                startInBrowserRecording();
                if (btnText) btnText.textContent = '⏹ Detener y Guardar';
                hudRecSeconds = 0;
                hudRecordingTimerId = setInterval(() => {
                    hudRecSeconds++;
                    const m = String(Math.floor(hudRecSeconds / 60)).padStart(2, '0');
                    const s = String(hudRecSeconds % 60).padStart(2, '0');
                    if (timerLabel) timerLabel.textContent = `${m}:${s}`;
                }, 1000);
            } else {
                finishInBrowserRecording();
                if (btnText) btnText.textContent = '🔴 Iniciar Grabación WebM';
                if (hudRecordingTimerId) {
                    clearInterval(hudRecordingTimerId);
                    hudRecordingTimerId = null;
                }
            }
        }

        // Template Generator Modal Logic
        
