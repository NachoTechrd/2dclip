                // ==========================================
        // UNIFIED AUTH + PERSISTENT USER SETTINGS + CLOUD SYNC (MONGODB + CLOUDINARY)
        // ==========================================
        const AUTH_STORAGE_KEY = 'viral2d_auth_token';
        const AUTH_TOKEN_VALID = 'auth_session_verified_2026';
        const GUEST_STORAGE_KEY = 'nt_guest_id_v1';
        const SETTINGS_STORAGE_KEY = 'nt_user_settings_v1';

        const VALID_B64_TOKENS = ['Sm9zZSQxMjA0', 'am9zZSQxMjA0', 'Sm9zZTEyMDQ=', 'MTIwNA=='];
        const VALID_HASH_TOKENS = [
            '2f708bcbe134dc96f34c517977cffa0d7140087045d2647046b58b9a90b2ec8c',
            'a443d873b54b3b944fd72f78296136c2de76fcb0eb5cb4c38cb35f2c06929877',
            '4ace281311f0a9f1f6f59cdea26b605b4a857e32332e853ef5022c8e19e13f9e',
            '0af7d7158becc6d02dc41536107090e77195cf90c556cadb37866528cc94e8a9',
            'd5cd501dabed525888b48b2e703e3e0ba3f97fa292dc3da4180517d4ce9cf327'
        ];

        let currentUser = null;
        let currentUserToken = localStorage.getItem('nt_cloud_token') || null;
        let currentCloudProjectId = localStorage.getItem('nt_cloud_project_id') || null;
        let authCurrentTab = 'login';
        let gateAuthMode = 'login';
        let cloudSyncTimeout = null;
        let settingsSyncTimeout = null;
        let activeIngredientTargetProp = 'overlayImg1';

        function getOrCreateGuestId() {
            let gid = localStorage.getItem(GUEST_STORAGE_KEY);
            if (!gid || gid.length < 8) {
                gid = 'guest_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
                localStorage.setItem(GUEST_STORAGE_KEY, gid);
            }
            return gid;
        }

        function getCloudHeaders(includeJsonContentType = false) {
            const headers = { 'X-Guest-Id': getOrCreateGuestId() };
            if (includeJsonContentType) headers['Content-Type'] = 'application/json';
            if (currentUserToken) headers['Authorization'] = 'Bearer ' + currentUserToken;
            return headers;
        }

        function isTokenValid(val) {
            if (!val) return false;
            const clean = val.trim();
            try {
                if (VALID_B64_TOKENS.includes(btoa(clean))) return true;
            } catch (e) {}
            return false;
        }

        async function computeSHA256(str) {
            try {
                const buffer = new TextEncoder().encode(str);
                const digest = await crypto.subtle.digest('SHA-256', buffer);
                return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (e) {
                return '';
            }
        }

        function checkStudioAuth() {
            const legacyToken = localStorage.getItem(AUTH_STORAGE_KEY);
            const guestMode = localStorage.getItem('nt_guest_mode_accepted');
            const overlay = document.getElementById('auth-gate-overlay');
            if (currentUserToken || legacyToken === AUTH_TOKEN_VALID || guestMode === 'true') {
                if (overlay) overlay.classList.add('hidden');
            } else {
                if (overlay) overlay.classList.remove('hidden');
            }
        }

        function setGateAuthMode(mode) {
            gateAuthMode = mode === 'register' ? 'register' : 'login';
            const tabL = document.getElementById('gate-tab-login');
            const tabR = document.getElementById('gate-tab-register');
            const nameWrap = document.getElementById('gate-name-wrap');
            const submitBtn = document.getElementById('gate-auth-submit');
            if (gateAuthMode === 'login') {
                if (tabL) tabL.className = 'py-1.5 rounded-lg text-xs font-black bg-amber-500 text-slate-950 transition';
                if (tabR) tabR.className = 'py-1.5 rounded-lg text-xs font-black text-slate-400 hover:text-white transition';
                if (nameWrap) nameWrap.classList.add('hidden');
                if (submitBtn) submitBtn.textContent = '🔓 Entrar al Studio Pro';
            } else {
                if (tabR) tabR.className = 'py-1.5 rounded-lg text-xs font-black bg-amber-500 text-slate-950 transition';
                if (tabL) tabL.className = 'py-1.5 rounded-lg text-xs font-black text-slate-400 hover:text-white transition';
                if (nameWrap) nameWrap.classList.remove('hidden');
                if (submitBtn) submitBtn.textContent = '✨ Crear Cuenta y Entrar';
            }
        }

        function enterStudioAsGuest() {
            getOrCreateGuestId();
            localStorage.setItem('nt_guest_mode_accepted', 'true');
            const overlay = document.getElementById('auth-gate-overlay');
            if (overlay) overlay.classList.add('hidden');
            showStudioToast('👤 Modo Invitado activo con guardado local y en la nube', 3500);
        }

        async function handleGateAuthSubmit(e) {
            if (e && e.preventDefault) e.preventDefault();
            const passInput = document.getElementById('auth-password');
            const emailInput = document.getElementById('auth-email');
            const nameInput = document.getElementById('auth-name');
            const errorMsg = document.getElementById('gate-auth-error-msg');
            const overlay = document.getElementById('auth-gate-overlay');

            const pass = (passInput ? passInput.value : '').trim();
            const email = (emailInput ? emailInput.value : '').trim().toLowerCase();
            const name = (nameInput ? nameInput.value : '').trim();

            if (errorMsg) errorMsg.classList.add('hidden');

            // 1. Si hay correo y contraseña, autenticar/registrar contra MongoDB Atlas /api/auth
            if (email.includes('@') && pass) {
                try {
                    const resp = await fetch('/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: gateAuthMode === 'register' ? 'register' : 'login',
                            email,
                            password: pass,
                            name
                        })
                    });
                    const data = await resp.json().catch(() => ({}));
                    if (resp.ok && data.success && data.token) {
                        currentUserToken = data.token;
                        currentUser = data.user;
                        localStorage.setItem('nt_cloud_token', currentUserToken);
                        localStorage.setItem(AUTH_STORAGE_KEY, AUTH_TOKEN_VALID);
                        if (data.settings) applyUserSettings(data.settings);
                        if (Array.isArray(data.customAssets)) mergeServerCustomAssets(data.customAssets);
                        updateUserAccountBadge(currentUser);
                        if (overlay) overlay.classList.add('hidden');
                        showStudioToast(`🟢 Bienvenido ${currentUser.name || currentUser.email}`, 3500);
                        return;
                    } else if (data.error) {
                        if (errorMsg) {
                            errorMsg.textContent = '❌ ' + data.error;
                            errorMsg.classList.remove('hidden');
                        }
                        return;
                    }
                } catch (netErr) {
                    // Continuar al verificador de licencia local si no hay red
                }
            }

            // 2. Legacy license passkey fallback
            let authorized = isTokenValid(pass) || isTokenValid(email);
            if (!authorized) {
                const hashPass = await computeSHA256(pass);
                const hashPair = await computeSHA256(email + ':' + pass);
                if (VALID_HASH_TOKENS.includes(hashPass) || VALID_HASH_TOKENS.includes(hashPair)) {
                    authorized = true;
                }
            }

            if (authorized) {
                localStorage.setItem(AUTH_STORAGE_KEY, AUTH_TOKEN_VALID);
                if (overlay) overlay.classList.add('hidden');
                if (errorMsg) errorMsg.classList.add('hidden');
            } else {
                if (errorMsg) {
                    errorMsg.textContent = '❌ Credenciales incorrectas. Usa tu cuenta o entra como invitado.';
                    errorMsg.classList.remove('hidden');
                }
            }
        }

        function logoutStudio() {
            handleLogout();
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem('nt_guest_mode_accepted');
            window.location.reload();
        }

        // ==========================================
        // UNIFIED SETTINGS & API KEYS PERSISTENCE ENGINE
        // ==========================================
        function collectAllUserSettings() {
            let elevenSaved = {};
            let prevAll = {};
            try { elevenSaved = JSON.parse(localStorage.getItem(ELEVEN_STORAGE_KEY) || '{}'); } catch (e) {}
            try { prevAll = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}'); } catch (e) {}

            const readOptInput = (id, prevVal) => {
                const el = document.getElementById(id);
                return el ? el.value.trim() : (prevVal || '');
            };

            return {
                aiProvider: aiGeneratorEngine || prevAll.aiProvider || 'azure',
                azureOpenaiEndpoint: readOptInput('modal-azure-endpoint-input', prevAll.azureOpenaiEndpoint),
                azureOpenaiApiKey: readOptInput('modal-azure-key-input', prevAll.azureOpenaiApiKey),
                azureOpenaiDeployment: readOptInput('modal-azure-chat-dep-input', prevAll.azureOpenaiDeployment),
                azureImageDeployment: readOptInput('modal-azure-img-dep-input', prevAll.azureImageDeployment),
                azureSpeechKey: readOptInput('modal-azure-speech-key-input', prevAll.azureSpeechKey),
                azureSpeechRegion: readOptInput('modal-azure-speech-region-input', prevAll.azureSpeechRegion),
                azureVoiceName: document.getElementById('azure-voice-select')?.value || prevAll.azureVoiceName || 'es-DO-EmilioNeural',
                geminiApiKey: getEffectiveGeminiKey(),
                elevenlabsApiKey: getEffectiveElevenKey() || elevenSaved.apiKey || '',
                elevenVoiceId: document.getElementById('eleven-voice-select')?.value || elevenSaved.voiceId || 'pNInz6obpgDQGcFmaJgB',
                elevenStability: parseFloat(document.getElementById('eleven-stability')?.value || elevenSaved.stability || '0.45'),
                elevenSimilarity: parseFloat(document.getElementById('eleven-similarity')?.value || elevenSaved.similarity || '0.80'),
                elevenStyle: parseFloat(document.getElementById('eleven-style')?.value || elevenSaved.style || '0.35'),
                voiceUri: selectedVoiceURI || 'google_cloud_hd',
                ttsRate: ttsRate || 1.10,
                ttsPitch: typeof ttsPitch === 'number' ? ttsPitch : 1.0,
                defaultBrand: currentConfig?.brand || '@nachotechrd',
                defaultDomain: currentConfig?.domain || 'nakkio.com',
                defaultPriceTag: currentConfig?.priceTag || 'MÉTODO PRO',
                defaultCtaText: currentConfig?.ctaText || 'SÍGUEME @NACHOTECH',
                highlightStyle: currentConfig?.highlightStyle || 'hl-box',
                aspectRatio: currentAspectRatio || '9-16',
                bgmEnabled: !!bgmEnabled,
                bgmTrack: currentBgmTrack || 'downtempo',
                bgmVolume: typeof bgmVolume === 'number' ? bgmVolume : 0.14,
                sfxEnabled: !!sfxEnabled,
                sfxVolume: typeof sfxVolume === 'number' ? sfxVolume : 0.80
            };
        }

        function persistAllUserSettingsLocal() {
            try {
                const s = collectAllUserSettings();
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(s));
                if (s.geminiApiKey) localStorage.setItem(GEMINI_STORAGE_KEY, s.geminiApiKey);
                localStorage.setItem(ELEVEN_STORAGE_KEY, JSON.stringify({
                    apiKey: s.elevenlabsApiKey,
                    voiceId: s.elevenVoiceId,
                    stability: s.elevenStability,
                    similarity: s.elevenSimilarity,
                    style: s.elevenStyle
                }));
            } catch (e) {}
        }

        function applyUserSettings(s) {
            if (!s || typeof s !== 'object') return;
            try {
                if (s.aiProvider === 'azure' || s.aiProvider === 'gemini') {
                    setAIGeneratorEngine(s.aiProvider, true);
                }
                const azureMap = [
                    ['modal-azure-endpoint-input', s.azureOpenaiEndpoint],
                    ['modal-azure-key-input', s.azureOpenaiApiKey],
                    ['modal-azure-chat-dep-input', s.azureOpenaiDeployment],
                    ['modal-azure-img-dep-input', s.azureImageDeployment],
                    ['modal-azure-speech-key-input', s.azureSpeechKey],
                    ['modal-azure-speech-region-input', s.azureSpeechRegion]
                ];
                azureMap.forEach(([id, val]) => {
                    const el = document.getElementById(id);
                    if (el && typeof val === 'string' && val) el.value = val;
                });
                if (s.azureVoiceName) {
                    const azVoiceEl = document.getElementById('azure-voice-select');
                    if (azVoiceEl) azVoiceEl.value = s.azureVoiceName;
                }
                if (s.geminiApiKey) {
                    localStorage.setItem(GEMINI_STORAGE_KEY, s.geminiApiKey);
                    const gInput = document.getElementById('gemini-api-key-input');
                    const mInput = document.getElementById('modal-gemini-key-input');
                    if (gInput && !gInput.value) gInput.value = s.geminiApiKey;
                    if (mInput) mInput.value = s.geminiApiKey;
                }
                if (s.elevenlabsApiKey || s.elevenVoiceId) {
                    const prevEleven = JSON.parse(localStorage.getItem(ELEVEN_STORAGE_KEY) || '{}');
                    const mergedEleven = {
                        apiKey: s.elevenlabsApiKey || prevEleven.apiKey || '',
                        voiceId: s.elevenVoiceId || prevEleven.voiceId || 'pNInz6obpgDQGcFmaJgB',
                        stability: s.elevenStability ?? prevEleven.stability ?? 0.45,
                        similarity: s.elevenSimilarity ?? prevEleven.similarity ?? 0.80,
                        style: s.elevenStyle ?? prevEleven.style ?? 0.35
                    };
                    localStorage.setItem(ELEVEN_STORAGE_KEY, JSON.stringify(mergedEleven));
                    loadElevenConfig();
                }
                if (typeof s.bgmTrack === 'string' && s.bgmTrack) {
                    currentBgmTrack = s.bgmTrack;
                    const trkSel = document.getElementById('bgm-track-select');
                    if (trkSel) trkSel.value = currentBgmTrack;
                }
                if (typeof s.bgmVolume === 'number') {
                    bgmVolume = s.bgmVolume;
                    const volEl = document.getElementById('bgm-volume-slider');
                    if (volEl) volEl.value = bgmVolume;
                    updateBGMVolume(bgmVolume);
                }
                if (typeof s.sfxEnabled === 'boolean') sfxEnabled = s.sfxEnabled;
                if (typeof s.ttsRate === 'number' && s.ttsRate >= 0.6) {
                    ttsRate = s.ttsRate;
                    const rateEl = document.getElementById('tts-rate-slider');
                    if (rateEl) rateEl.value = ttsRate;
                }
                if (s.voiceUri) {
                    selectedVoiceURI = s.voiceUri;
                    localStorage.setItem('nt_free_voice_uri', selectedVoiceURI);
                }
                if (s.aspectRatio && typeof setStageAspectRatio === 'function') {
                    setStageAspectRatio(s.aspectRatio);
                }
                if (currentConfig) {
                    if (s.defaultBrand && !localStorage.getItem(STORAGE_KEY)) currentConfig.brand = s.defaultBrand;
                    if (s.defaultDomain && !localStorage.getItem(STORAGE_KEY)) currentConfig.domain = s.defaultDomain;
                    syncGlobalInputsFromConfig();
                }
                persistAllUserSettingsLocal();
            } catch (e) {}
        }

        function mergeServerCustomAssets(serverAssets) {
            if (!Array.isArray(serverAssets) || serverAssets.length === 0) return;
            try {
                const key = 'nt_user_custom_assets_v1';
                const localList = JSON.parse(localStorage.getItem(key) || '[]');
                serverAssets.forEach(sa => {
                    if (sa && sa.path && !localList.some(l => l.path === sa.path)) {
                        localList.push(sa);
                    }
                });
                localStorage.setItem(key, JSON.stringify(localList.slice(0, 60)));
                mergeCustomAssetsIntoCatalog();
            } catch (e) {}
        }

        function mergeCustomAssetsIntoCatalog() {
            if (!Array.isArray(window.NT_CUSTOM_ASSETS_LIST)) window.NT_CUSTOM_ASSETS_LIST = [];
            try {
                const userAssets = JSON.parse(localStorage.getItem('nt_user_custom_assets_v1') || '[]');
                userAssets.forEach(ua => {
                    if (ua && ua.path && !window.NT_CUSTOM_ASSETS_LIST.some(x => x.path === ua.path)) {
                        window.NT_CUSTOM_ASSETS_LIST.unshift(ua);
                    }
                });
            } catch (e) {}
        }

        function debouncedSettingsCloudSync() {
            if (!currentUserToken) return;
            if (settingsSyncTimeout) clearTimeout(settingsSyncTimeout);
            settingsSyncTimeout = setTimeout(() => {
                syncUserSettingsToCloud(true);
            }, 1500);
        }

        async function syncUserSettingsToCloud(silent = false) {
            persistAllUserSettingsLocal();
            if (!currentUserToken) return false;
            try {
                let customAssets = [];
                try { customAssets = JSON.parse(localStorage.getItem('nt_user_custom_assets_v1') || '[]'); } catch (e) {}
                const resp = await fetch('/api/auth?action=settings', {
                    method: 'POST',
                    headers: getCloudHeaders(true),
                    body: JSON.stringify({
                        settings: collectAllUserSettings(),
                        customAssets
                    })
                });
                if (resp.ok) {
                    if (!silent) showStudioToast('✓ Claves API y preferencias guardadas en tu cuenta nube', 3500);
                    return true;
                }
            } catch (e) {}
            return false;
        }

        function openApiKeysModal() {
            const modal = document.getElementById('api-keys-modal');
            const mGemini = document.getElementById('modal-gemini-key-input');
            const mEleven = document.getElementById('modal-eleven-key-input');
            const mBrand = document.getElementById('modal-default-brand-input');
            const mDomain = document.getElementById('modal-default-domain-input');
            const saved = getStoredUserSettingsObj();
            const setVal = (id, v) => {
                const el = document.getElementById(id);
                if (el && typeof v === 'string') el.value = v;
            };
            setVal('modal-azure-endpoint-input', saved.azureOpenaiEndpoint || '');
            setVal('modal-azure-key-input', saved.azureOpenaiApiKey || '');
            setVal('modal-azure-chat-dep-input', saved.azureOpenaiDeployment || '');
            setVal('modal-azure-img-dep-input', saved.azureImageDeployment || '');
            setVal('modal-azure-speech-key-input', saved.azureSpeechKey || '');
            setVal('modal-azure-speech-region-input', saved.azureSpeechRegion || '');

            if (mGemini) mGemini.value = getEffectiveGeminiKey();
            if (mEleven) mEleven.value = getEffectiveElevenKey();
            if (mBrand) mBrand.value = currentConfig?.brand || '@nachotechrd';
            if (mDomain) mDomain.value = currentConfig?.domain || 'nakkio.com';
            if (typeof refreshAllApiKeyBadges === 'function') refreshAllApiKeyBadges();
            if (modal) modal.classList.remove('hidden');
        }

        function closeApiKeysModal() {
            const modal = document.getElementById('api-keys-modal');
            if (modal) modal.classList.add('hidden');
        }

        async function testGeminiFromHub() {
            const val = document.getElementById('modal-gemini-key-input')?.value || '';
            await testGeminiApiKey(val, 'modal-gemini-status');
        }

        async function saveApiKeysAndSettings() {
            const gKey = (document.getElementById('modal-gemini-key-input')?.value || '').trim();
            const eKey = (document.getElementById('modal-eleven-key-input')?.value || '').trim();
            const brandVal = (document.getElementById('modal-default-brand-input')?.value || '').trim();
            const domainVal = (document.getElementById('modal-default-domain-input')?.value || '').trim();

            saveGeminiApiKey(gKey, true);
            const eTabInput = document.getElementById('eleven-api-key-input');
            if (eTabInput) eTabInput.value = eKey;
            saveElevenConfig(true);

            if (brandVal && currentConfig) currentConfig.brand = brandVal;
            if (domainVal && currentConfig) currentConfig.domain = domainVal;
            syncGlobalInputsFromConfig();
            saveStateToLocalStorage();
            persistAllUserSettingsLocal();

            const cloudOk = await syncUserSettingsToCloud(true);
            closeApiKeysModal();
            playSFX('ding');
            showStudioToast(cloudOk ? '✓ Claves Azure / Gemini / ElevenLabs guardadas en nube y navegador' : '✓ Claves API guardadas permanentemente en este navegador', 3500);
        }


        // Toast de Notificaciones Flotantes
        function showStudioToast(msg, duration = 3500) {
            let toast = document.getElementById('studio-global-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'studio-global-toast';
                toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-[#0e1422]/95 border border-cyan-500/50 text-white text-xs font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all duration-300 transform translate-y-12 opacity-0 pointer-events-none';
                document.body.appendChild(toast);
            }
            toast.innerHTML = msg;
            toast.classList.remove('translate-y-12', 'opacity-0', 'pointer-events-none');
            setTimeout(() => {
                toast.classList.add('translate-y-12', 'opacity-0', 'pointer-events-none');
            }, duration);
        }

        // Inicializar Sesión al Cargar
        async function initCloudSession() {
            if (!currentUserToken) {
                updateUserAccountBadge(null);
                return;
            }
            try {
                const resp = await fetch('/api/auth?action=me', {
                    headers: getCloudHeaders(false)
                });
                if (resp.ok) {
                    const data = await resp.json();
                    if (data.success && data.user) {
                        currentUser = data.user;
                        if (data.settings) applyUserSettings(data.settings);
                        if (Array.isArray(data.customAssets)) mergeServerCustomAssets(data.customAssets);
                        updateUserAccountBadge(currentUser);
                        checkStudioAuth();
                        console.log('✓ Sesión en la Nube Restaurada:', currentUser.email);
                    } else {
                        localStorage.removeItem('nt_cloud_token');
                        currentUserToken = null;
                        updateUserAccountBadge(null);
                    }
                } else if (resp.status === 401) {
                    localStorage.removeItem('nt_cloud_token');
                    currentUserToken = null;
                    updateUserAccountBadge(null);
                }
            } catch(e) {
                console.warn('Modo offline: sin conexión con MongoDB Atlas', e);
            }
        }

        function updateUserAccountBadge(user) {
            const labelEl = document.getElementById('user-account-label');
            const dotEl = document.getElementById('user-status-dot');
            if (user) {
                const shortEmail = user.email.length > 14 ? (user.email.substring(0, 12) + '...') : user.email;
                if (labelEl) labelEl.textContent = shortEmail + (user.role === 'admin' ? ' (Admin)' : '');
                if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
            } else {
                if (labelEl) labelEl.textContent = 'Mi Cuenta';
                if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-slate-500';
            }
        }

        function openAuthModal() {
            const modal = document.getElementById('cloud-auth-modal');
            const loggedSection = document.getElementById('auth-logged-in-section');
            const loggedEmail = document.getElementById('logged-user-email');
            const loggedBadge = document.getElementById('logged-user-badge');

            if (currentUser) {
                if (loggedSection) loggedSection.classList.remove('hidden');
                if (loggedEmail) loggedEmail.textContent = currentUser.email;
                if (loggedBadge) loggedBadge.textContent = (currentUser.role || 'CREATOR').toUpperCase();
            } else {
                if (loggedSection) loggedSection.classList.add('hidden');
            }
            if (modal) modal.classList.remove('hidden');
        }

        function closeAuthModal() {
            const modal = document.getElementById('cloud-auth-modal');
            if (modal) modal.classList.add('hidden');
        }

        function switchAuthTab(tab) {
            authCurrentTab = tab;
            const tabLogin = document.getElementById('auth-tab-login');
            const tabReg = document.getElementById('auth-tab-register');
            const fieldName = document.getElementById('auth-field-name');
            const submitBtn = document.getElementById('auth-submit-btn');

            if (tab === 'login') {
                tabLogin.className = 'flex-1 py-2 rounded-lg bg-cyan-600 text-white shadow';
                tabReg.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white';
                fieldName.classList.add('hidden');
                submitBtn.textContent = 'Entrar a mi Cuenta';
            } else {
                tabReg.className = 'flex-1 py-2 rounded-lg bg-cyan-600 text-white shadow';
                tabLogin.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white';
                fieldName.classList.remove('hidden');
                submitBtn.textContent = 'Crear mi Cuenta Gratis';
            }
        }

        async function handleAuthSubmit(e) {
            if (e && e.preventDefault) e.preventDefault();
            const emailInput = document.getElementById('auth-input-email');
            const passInput = document.getElementById('auth-input-password');
            const nameInput = document.getElementById('auth-input-name');
            const errMsg = document.getElementById('auth-error-msg');
            const succMsg = document.getElementById('auth-success-msg');

            if (errMsg) errMsg.classList.add('hidden');
            if (succMsg) succMsg.classList.add('hidden');

            const payload = {
                action: authCurrentTab,
                email: emailInput.value.trim(),
                password: passInput.value
            };
            if (authCurrentTab === 'register' && nameInput.value.trim()) {
                payload.name = nameInput.value.trim();
            }

            try {
                const resp = await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await resp.json();

                if (!resp.ok) {
                    if (errMsg) {
                        errMsg.textContent = data.error || 'Error de autenticación';
                        errMsg.classList.remove('hidden');
                    }
                    return;
                }

                currentUserToken = data.token;
                currentUser = data.user;
                localStorage.setItem('nt_cloud_token', currentUserToken);
                localStorage.setItem(AUTH_STORAGE_KEY, AUTH_TOKEN_VALID);
                if (data.settings) applyUserSettings(data.settings);
                if (Array.isArray(data.customAssets)) mergeServerCustomAssets(data.customAssets);
                updateUserAccountBadge(currentUser);
                checkStudioAuth();

                if (succMsg) {
                    succMsg.textContent = authCurrentTab === 'login' ? '¡Bienvenido de nuevo! Tus claves y proyectos están listos.' : '¡Cuenta creada con éxito!';
                    succMsg.classList.remove('hidden');
                }

                showStudioToast(`🟢 Conectado como ${currentUser.email}`, 4000);
                setTimeout(() => {
                    closeAuthModal();
                    syncUserSettingsToCloud(true);
                    saveCurrentProjectToCloud();
                }, 900);

            } catch (err) {
                if (errMsg) {
                    errMsg.textContent = 'Error de conexión con el servidor de nube';
                    errMsg.classList.remove('hidden');
                }
            }
        }

        function handleLogout() {
            localStorage.removeItem('nt_cloud_token');
            localStorage.removeItem('nt_cloud_project_id');
            currentUser = null;
            currentUserToken = null;
            currentCloudProjectId = null;
            updateUserAccountBadge(null);
            closeAuthModal();
            showStudioToast('Sesión cerrada correctamente', 3000);
        }

        async function flushSceneDataUrlsToCloudinary() {
            if (!currentConfig || !Array.isArray(currentConfig.scenes)) return;
            for (const sc of currentConfig.scenes) {
                for (const [prop, resType, folder] of [
                    ['overlayImg1', 'image', '2dclip_overlays'],
                    ['overlayImg2', 'image', '2dclip_overlays'],
                    ['customBgUrl', 'image', '2dclip_backgrounds'],
                    ['customAudioUrl', 'audio', '2dclip_voices']
                ]) {
                    if (typeof sc[prop] === 'string' && sc[prop].startsWith('data:')) {
                        const cloudUrl = await uploadAssetDataUrlToCloud(sc[prop], resType, folder);
                        if (cloudUrl) sc[prop] = cloudUrl;
                    }
                }
            }
        }

        // GUARDAR PROYECTO ACTUAL EN MONGODB ATLAS
        async function saveCurrentProjectToCloud(asNew = false) {
            const saveBtnText = document.getElementById('cloud-save-text');
            const saveIcon = document.getElementById('cloud-save-icon');
            if (saveBtnText) saveBtnText.textContent = 'Guardando...';
            if (saveIcon) saveIcon.textContent = '⏳';

            try {
                await flushSceneDataUrlsToCloudinary();
            } catch (e) {}

            const cleanConfig = buildCleanSerializableConfig(true);
            const projectId = asNew ? null : currentCloudProjectId;
            const projectData = {
                id: projectId,
                title: cleanConfig.scenes[0]?.bannerHighlight || cleanConfig.scenes[0]?.bannerTop || 'Mi Video Viral',
                domain: cleanConfig.domain || 'nakkio.com',
                brand: cleanConfig.brand || '@nachotechrd',
                priceTag: cleanConfig.priceTag || 'MÉTODO PRO',
                ctaText: cleanConfig.ctaText || 'SÍGUEME @NACHOTECH',
                scenes: cleanConfig.scenes,
                highlightStyle: cleanConfig.highlightStyle || 'hl-box',
                bgmTrack: currentBgmTrack || 'downtempo',
                bgmEnabled: !!bgmEnabled,
                bgmVolume: typeof bgmVolume === 'number' ? bgmVolume : 0.14,
                sfxEnabled: !!sfxEnabled,
                aspectRatio: currentAspectRatio || '9-16'
            };

            try {
                const resp = await fetch('/api/projects', {
                    method: 'POST',
                    headers: getCloudHeaders(true),
                    body: JSON.stringify(projectData)
                });
                const data = await resp.json();

                if (resp.ok && data.success) {
                    currentCloudProjectId = data.projectId;
                    localStorage.setItem('nt_cloud_project_id', currentCloudProjectId);
                    saveStateToLocalStorage();
                    await syncUserSettingsToCloud(true);
                    showStudioToast('☁️ ✓ Proyecto y recursos guardados en MongoDB Atlas', 4000);
                } else {
                    saveStateToLocalStorage();
                    showStudioToast('Aviso: guardado en almacenamiento local', 3000);
                }
            } catch (err) {
                console.warn('Error guardando en la nube, usando local:', err);
                saveStateToLocalStorage();
                showStudioToast('✓ Guardado en copia local', 2500);
            } finally {
                if (saveBtnText) saveBtnText.textContent = 'Guardar en Nube';
                if (saveIcon) saveIcon.textContent = '☁️';
            }
        }

        function debouncedCloudAutoSync() {
            if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
            cloudSyncTimeout = setTimeout(() => {
                saveCurrentProjectToCloud();
            }, 3000);
        }

        // ABRIR Y CARGAR PROYECTOS DE LA NUBE
        async function openCloudProjectsModal() {
            const modal = document.getElementById('cloud-projects-modal');
            if (modal) modal.classList.remove('hidden');
            await loadCloudProjectsList();
        }

        function closeCloudProjectsModal() {
            const modal = document.getElementById('cloud-projects-modal');
            if (modal) modal.classList.add('hidden');
        }

        async function loadCloudProjectsList() {
            const listEl = document.getElementById('cloud-projects-list');
            const countEl = document.getElementById('cloud-projects-count');
            if (!listEl) return;

            listEl.innerHTML = `
                <div class="flex items-center justify-center py-12 text-slate-400 text-xs font-bold gap-2">
                    <span class="animate-spin">⏳</span> Consultando base de datos en la nube...
                </div>
            `;

            try {
                const resp = await fetch('/api/projects', { headers: getCloudHeaders(false) });
                const data = await resp.json();

                if (!resp.ok || !data.success) {
                    listEl.innerHTML = `
                        <div class="p-6 text-center text-slate-400 text-xs">
                            No se pudieron cargar los proyectos de la nube. Verifica tu conexión o inicia sesión.
                        </div>
                    `;
                    return;
                }

                const projects = data.projects || [];
                if (countEl) countEl.textContent = `${projects.length} proyecto(s) guardado(s)`;

                if (projects.length === 0) {
                    listEl.innerHTML = `
                        <div class="p-8 text-center text-slate-400 text-xs space-y-2">
                            <p class="text-base">📭 Aún no tienes proyectos guardados en la nube.</p>
                            <p class="text-[11px] text-slate-500">Toca <strong>"Guardar en Nube"</strong> en la barra superior para almacenar tu trabajo.</p>
                        </div>
                    `;
                    return;
                }

                let html = '';
                projects.forEach(p => {
                    const dateStr = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() + ' ' + new Date(p.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    html += `
                        <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between gap-3 transition">
                            <div class="flex-1 min-w-0">
                                <h4 class="text-xs font-black text-white truncate flex items-center gap-2">
                                    <span>🎬</span> ${p.title}
                                </h4>
                                <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                                    <span class="text-amber-400 font-bold">${p.domain}</span>
                                    <span>•</span>
                                    <span>${p.sceneCount} escenas</span>
                                    <span>•</span>
                                    <span>🕒 ${dateStr}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5 flex-shrink-0">
                                <button onclick="loadProjectFromCloud('${p.id}')" class="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow flex items-center gap-1 transition">
                                    <span>📂</span> Cargar
                                </button>
                                <button onclick="deleteProjectFromCloud('${p.id}', event)" class="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs transition" title="Eliminar proyecto">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `;
                });
                listEl.innerHTML = html;

            } catch (err) {
                listEl.innerHTML = `
                    <div class="p-6 text-center text-rose-400 text-xs font-bold">
                        Error conectando con la base de datos de MongoDB.
                    </div>
                `;
            }
        }

        async function loadProjectFromCloud(id) {
            try {
                showStudioToast('⏳ Descargando proyecto de la nube...', 2500);
                const resp = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
                    headers: getCloudHeaders(false)
                });
                const data = await resp.json();

                if (!resp.ok || !data.success || !data.project) {
                    showStudioToast('❌ Error cargando el proyecto', 3000);
                    return;
                }

                const p = data.project;
                currentCloudProjectId = p._id || id;
                localStorage.setItem('nt_cloud_project_id', currentCloudProjectId);

                currentConfig = {
                    brand: p.brand || '@nachotechrd',
                    domain: p.domain || 'nakkio.com',
                    priceTag: p.settings?.priceTag || 'MÉTODO PRO',
                    ctaText: p.settings?.ctaText || 'SÍGUEME @NACHOTECHRD',
                    highlightStyle: p.highlightStyle || 'hl-box',
                    scenes: p.scenes || []
                };

                if (p.aspectRatio && typeof setStageAspectRatio === 'function') {
                    setStageAspectRatio(p.aspectRatio);
                }
                if (p.settings?.bgmTrack) changeBGMTrack(p.settings.bgmTrack);
                if (typeof p.settings?.bgmVolume === 'number') {
                    bgmVolume = p.settings.bgmVolume;
                    updateBGMVolume(bgmVolume);
                }
                if (typeof p.settings?.sfxEnabled === 'boolean') sfxEnabled = p.settings.sfxEnabled;
                if (typeof p.settings?.bgmEnabled === 'boolean' && p.settings.bgmEnabled !== bgmEnabled) {
                    toggleBGM(p.settings.bgmEnabled);
                }

                syncGlobalInputsFromConfig();
                currentSceneIndex = 0;
                sceneStartTime = performance.now();
                renderScene(0);
                renderActiveSceneEditor();
                updateTotalDurationBadge();
                saveStateToLocalStorage();
                if (typeof preloadAllSceneVoices === 'function') preloadAllSceneVoices();
                closeCloudProjectsModal();

                showStudioToast(`✓ Proyecto "${p.title}" cargado al 100%`, 4000);

            } catch(e) {
                showStudioToast('❌ Error al cargar proyecto de la nube', 3000);
            }
        }

        async function deleteProjectFromCloud(id, event) {
            if (event) event.stopPropagation();
            if (!confirm('¿Deseas eliminar este proyecto de tu cuenta en la nube?')) return;

            try {
                const resp = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
                    method: 'DELETE',
                    headers: getCloudHeaders(false)
                });
                if (resp.ok) {
                    showStudioToast('✓ Proyecto eliminado de la nube', 3000);
                    loadCloudProjectsList();
                }
            } catch(e) {
                showStudioToast('❌ Error eliminando proyecto', 3000);
            }
        }

