// js/render-headless.js - Controlador de reproducción limpia para worker 1080p y previsualización embebida
(function () {
  let headlessTimers = [];
  let headlessRafId = null;
  let activeSceneDurationMs = 4200;

  function clearHeadlessTimers() {
    headlessTimers.forEach((id) => clearTimeout(id));
    headlessTimers = [];
    if (headlessRafId) {
      cancelAnimationFrame(headlessRafId);
      headlessRafId = null;
    }
  }

  function collectImageUrlsFromConfig(cfg) {
    const urls = [];
    if (cfg?.logoUrl) urls.push(cfg.logoUrl);
    if (cfg?.productImageUrl) urls.push(cfg.productImageUrl);
    (cfg?.scenes || []).forEach((sc) => {
      if (sc?.customBgUrl) urls.push(sc.customBgUrl);
      if (sc?.overlayImg1) urls.push(sc.overlayImg1);
      if (sc?.overlayImg2) urls.push(sc.overlayImg2);
    });
    return [...new Set(urls.filter((u) => typeof u === 'string' && u.trim()))];
  }

  function preloadImageUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const timer = setTimeout(() => resolve(false), 8000);
      img.onload = () => {
        clearTimeout(timer);
        resolve(true);
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(false);
      };
      img.src = url;
    });
  }

  function applyAspectClass(aspectRatio) {
    const stage = document.getElementById('video-stage');
    if (!stage) return;
    stage.classList.remove('aspect-9-16', 'aspect-1-1', 'aspect-16-9', 'aspect-4-5');
    if (aspectRatio === '1:1' || aspectRatio === '1-1') {
      stage.classList.add('aspect-1-1');
    } else if (aspectRatio === '4:5' || aspectRatio === '4-5') {
      stage.classList.add('aspect-4-5');
    } else if (aspectRatio === '16:9' || aspectRatio === '16-9') {
      stage.classList.add('aspect-16-9');
    } else {
      stage.classList.add('aspect-9-16');
    }
  }

  function applyBrandVisuals(cfg) {
    const logoEl = document.getElementById('stage-brand-logo');
    if (logoEl) {
      if (cfg?.logoUrl && /^https?:\/\//i.test(cfg.logoUrl)) {
        logoEl.src = cfg.logoUrl;
        logoEl.classList.remove('hidden');
      } else {
        logoEl.classList.add('hidden');
      }
    }
    const dotEl = document.getElementById('brand-pulse-dot');
    const primary = cfg?.brandColors?.primary;
    if (dotEl && primary && /^#[0-9a-fA-F]{3,8}$/.test(primary)) {
      dotEl.style.backgroundColor = primary;
    }
  }

  function triggerSceneBeats(scene, durationMs) {
    const vecStage = document.getElementById('vector-graphic-stage');
    const stampEl = document.getElementById('stage-rubber-stamp');
    const flashEl = document.getElementById('stage-beat-flash');

    const tBeat2 = setTimeout(() => {
      if (vecStage) {
        vecStage.setAttribute('data-active-beat', '2');
        vecStage.classList.remove('stage-beat-1');
        vecStage.classList.add('stage-beat-2');
      }
      if (flashEl) {
        flashEl.style.opacity = '0.35';
        setTimeout(() => { flashEl.style.opacity = '0'; }, 140);
      }
    }, Math.round(durationMs * 0.34));

    const tBeat3 = setTimeout(() => {
      if (vecStage) {
        vecStage.setAttribute('data-active-beat', '3');
        vecStage.classList.remove('stage-beat-2');
        vecStage.classList.add('stage-beat-3');
      }
      if (stampEl && scene?.stampText && String(scene.stampText).trim()) {
        stampEl.classList.remove('hidden');
        void stampEl.offsetWidth;
        stampEl.classList.add('rubber-stamp-slam');
      }
    }, Math.round(durationMs * 0.67));

    headlessTimers.push(tBeat2, tBeat3);
  }

  function animateProgressLoop(sceneIndex, durationMs) {
    const startTs = performance.now();
    const progEl = document.getElementById(`prog-bar-${sceneIndex}`);

    function step() {
      const elapsed = performance.now() - startTs;
      const pct = Math.max(0, Math.min(100, (elapsed / Math.max(400, durationMs)) * 100));
      if (progEl) progEl.style.width = `${pct.toFixed(1)}%`;
      if (elapsed < durationMs) {
        headlessRafId = requestAnimationFrame(step);
      }
    }
    headlessRafId = requestAnimationFrame(step);
  }

  async function loadProject(config) {
    if (!config || !Array.isArray(config.scenes) || config.scenes.length === 0) {
      throw new Error('Configuración de escenas inválida en render headless.');
    }

    // Desactivar síntesis de voz del navegador y audio WebAudio si ffmpeg mezclará el audio limpio
    window.ttsEnabled = false;
    window.sfxEnabled = false;
    window.bgmEnabled = false;
    window.isPlaying = true;
    window.isCleanRecordingActive = true;

    const prepared = JSON.parse(JSON.stringify(config));
    if (prepared.productImageUrl) {
      const showcaseIdx = prepared.scenes.findIndex((s) =>
        s.graphicType === 'product_showcase' || s.graphicType === 'saas_3d_product_fanout'
      );
      const targetIdx = showcaseIdx >= 0 ? showcaseIdx : 0;
      if (prepared.scenes[targetIdx] && !prepared.scenes[targetIdx].overlayImg2) {
        prepared.scenes[targetIdx].overlayImg2 = prepared.productImageUrl;
      }
    }

    window.currentConfig = prepared;
    applyAspectClass(prepared.aspectRatio || '9:16');
    applyBrandVisuals(prepared);

    const urls = collectImageUrlsFromConfig(prepared);
    await Promise.all([
      Promise.all(urls.map(preloadImageUrl)),
      (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve(),
    ]);

    window.renderScene(0);
    return {
      sceneCount: prepared.scenes.length,
      aspectRatio: prepared.aspectRatio || '9:16',
    };
  }

  function playSceneAt(sceneIndex, durationMsOverride) {
    clearHeadlessTimers();
    const scenes = (window.currentConfig && window.currentConfig.scenes) || [];
    const sc = scenes[sceneIndex];
    if (!sc) return 0;

    const rawDur = Number(durationMsOverride || sc.duration || 4200);
    activeSceneDurationMs = Math.max(2500, Math.min(16000, rawDur < 100 ? rawDur * 1000 : rawDur));

    window.isPlaying = true;
    window.renderScene(sceneIndex);
    triggerSceneBeats(sc, activeSceneDurationMs);
    animateProgressLoop(sceneIndex, activeSceneDurationMs);

    return activeSceneDurationMs;
  }

  async function playEntireSequence(durationsMsList) {
    const scenes = (window.currentConfig && window.currentConfig.scenes) || [];
    const marks = [];
    const t0 = performance.now();

    for (let i = 0; i < scenes.length; i++) {
      const customMs = Array.isArray(durationsMsList) ? durationsMsList[i] : undefined;
      const startMs = Math.round(performance.now() - t0);
      const durMs = playSceneAt(i, customMs);
      marks.push({ sceneIndex: i, startMs, durationMs: durMs });
      await new Promise((r) => setTimeout(r, durMs));
    }

    clearHeadlessTimers();
    return {
      totalMs: Math.round(performance.now() - t0),
      marks,
    };
  }

  window.__2DCLIP_HEADLESS__ = {
    loadProject,
    playSceneAt,
    playEntireSequence,
  };

  window.addEventListener('message', async (ev) => {
    const data = ev?.data;
    if (!data || data.type !== '2DCLIP_LOAD_AND_PLAY') return;
    try {
      await loadProject(data.config);
      await playEntireSequence(data.durationsMs);
    } catch (err) {
      console.error('[2DCLIP_HEADLESS] Error:', err);
    }
  });
})();

