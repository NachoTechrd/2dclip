        window.onload = function () {
            getOrCreateGuestId();
            mergeCustomAssetsIntoCatalog();
            try {
                const localSettings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
                applyUserSettings(localSettings);
            } catch (e) {}
            setAIGeneratorEngine(aiGeneratorEngine || 'azure', true);
            loadElevenConfig();
            checkStudioAuth();

            if (window.__NT_CUSTOM_CONFIG__) {
                currentConfig = window.__NT_CUSTOM_CONFIG__;
            } else {
                try {
                    const saved = localStorage.getItem(STORAGE_KEY);
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        if (parsed && Array.isArray(parsed.scenes)) currentConfig = parsed;
                    }
                } catch (e) {}
            }
            syncGlobalInputsFromConfig();
            if (typeof syncTemplateSelectorUI === 'function') {
                syncTemplateSelectorUI(currentConfig?._templateKey || 'atom_brazos');
            }
            synchronizeAllSceneDurations();
            populateVoicesDropdown();
            setTimeout(populateVoicesDropdown, 300);
            setTimeout(populateVoicesDropdown, 1200);
            renderScene(0);
            renderActiveSceneEditor();
            sceneStartTime = performance.now();
            animFrameId = requestAnimationFrame(tickLoop);
            if (typeof refreshAllApiKeyBadges === 'function') refreshAllApiKeyBadges();
            initCloudSession();
        };

