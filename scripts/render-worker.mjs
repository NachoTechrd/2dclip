#!/usr/bin/env node
// scripts/render-worker.mjs - Renderizador Headless 1080p 2DClip PRO para GitHub Actions (0 MB RAM en Render)
import { execFileSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const cloudinary = require('cloudinary').v2;
const { chromium } = require('playwright');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.json': 'application/json; charset=utf-8',
};

function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const reqUrl = new URL(req.url || '/', 'http://127.0.0.1');
      let relPath = decodeURIComponent(reqUrl.pathname).replace(/^\/+/, '');
      if (!relPath) relPath = 'render.html';
      const safePath = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '');
      let fullPath = path.join(rootDir, safePath);
      if (!fullPath.startsWith(rootDir)) {
        res.writeHead(403);
        return res.end('Forbidden');
      }
      if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
        res.writeHead(404);
        return res.end('Not found');
      }
      const ext = path.extname(fullPath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
      });
      fs.createReadStream(fullPath).pipe(res);
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, port: addr.port });
    });
  });
}

function configureCloudinary(cloudinaryUrlEnv) {
  const raw = String(cloudinaryUrlEnv || process.env.CLOUDINARY_URL || '').trim();
  const match = raw.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (!match) {
    throw new Error('Falta CLOUDINARY_URL en Secrets de GitHub Actions o en el payload del job.');
  }
  cloudinary.config({
    api_key: match[1],
    api_secret: match[2],
    cloud_name: match[3],
    secure: true,
  });
}

async function downloadFile(url, destPath) {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Descarga fallida (${resp.status}) para ${url}`);
  }
  const ab = await resp.arrayBuffer();
  await fs.promises.writeFile(destPath, Buffer.from(ab));
  return destPath;
}

function resolveSfxPath(rawSfx) {
  if (!rawSfx || rawSfx === 'none' || rawSfx === 'mute') return null;
  const s = String(rawSfx).trim();
  const directCandidate = path.resolve(REPO_ROOT, s);
  if (directCandidate.startsWith(REPO_ROOT) && fs.existsSync(directCandidate)) {
    return directCandidate;
  }
  const aliasMap = {
    whoosh: 'FXS/whoosh.mp3',
    pop: 'FXS/pop 2.mp3',
    coin: 'FXS/coin.mp3',
    cash: 'FXS/cash.mp3',
    transition: 'FXS/transition.mp3',
    vine_boom: 'FXS/vine boom.mp3',
    impact: 'FXS/vine boom.mp3',
    shutter: 'FXS/camera shutter.mp3',
    beep: 'FXS/beep.mp3',
    ding: 'FXS/pop.mp3',
    cyber: 'FXS/whoosh 2.mp3',
  };
  const mapped = aliasMap[s.toLowerCase()];
  if (mapped) {
    const p = path.resolve(REPO_ROOT, mapped);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function postCallback(callbackUrl, callbackSecret, bodyObj) {
  if (!callbackUrl) return;
  const payloadStr = JSON.stringify(bodyObj);
  const headers = { 'Content-Type': 'application/json' };
  if (callbackSecret) {
    headers['x-nakkio-worker-signature'] = crypto
      .createHmac('sha256', callbackSecret)
      .update(payloadStr)
      .digest('hex');
  }
  const resp = await fetch(callbackUrl, {
    method: 'POST',
    headers,
    body: payloadStr,
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`Callback HTTP ${resp.status}: ${errText}`);
  }
}

async function main() {
  const payloadFile = process.env.WORKER_PAYLOAD_FILE;
  let payload;
  if (payloadFile && fs.existsSync(payloadFile)) {
    payload = JSON.parse(await fs.promises.readFile(payloadFile, 'utf8'));
  } else if (process.env.WORKER_PAYLOAD_JSON) {
    payload = JSON.parse(process.env.WORKER_PAYLOAD_JSON);
  } else {
    throw new Error('Falta WORKER_PAYLOAD_FILE o WORKER_PAYLOAD_JSON.');
  }

  const {
    jobId,
    callbackUrl,
    callbackSecret = process.env.VIDEO_WORKER_SECRET || '',
    aspectRatio = '9:16',
    storyboard,
    voiceUrls = [],
    durationsMs = [],
  } = payload;

  const isSquare = aspectRatio === '1:1';
  const videoSize = isSquare ? { width: 1080, height: 1080 } : { width: 1080, height: 1920 };
  const viewport = { ...videoSize };

  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), '2dclip-worker-'));
  let staticServer = null;
  let browser = null;

  try {
    configureCloudinary(payload.cloudinaryUrl);

    // 1. Descargar pistas de voz TTS reales (si existen)
    const localVoiceFiles = [];
    for (let i = 0; i < voiceUrls.length; i++) {
      const vUrl = voiceUrls[i];
      if (vUrl && /^https?:\/\//i.test(vUrl)) {
        const dest = path.join(tmpDir, `voice_${i}.mp3`);
        try {
          await downloadFile(vUrl, dest);
          localVoiceFiles.push({ sceneIndex: i, path: dest });
        } catch (dlErr) {
          console.warn(`[Worker] No se pudo descargar audio escena ${i}:`, dlErr.message);
        }
      }
    }

    // 2. Servidor estático local de 2dclip
    const srv = await startStaticServer(REPO_ROOT);
    staticServer = srv.server;
    const renderUrl = `http://127.0.0.1:${srv.port}/render.html`;

    // 3. Captura limpia en Chromium 1080p
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      recordVideo: {
        dir: tmpDir,
        size: videoSize,
      },
    });
    const recStartWallMs = Date.now();
    const page = await context.newPage();
    page.on('pageerror', (e) => console.warn('[PageError]', e.message));

    await page.goto(renderUrl, { waitUntil: 'networkidle', timeout: 45000 });
    await page.evaluate(async (cfg) => {
      await window.__2DCLIP_HEADLESS__.loadProject(cfg);
    }, { ...storyboard, aspectRatio });

    const playStartWallMs = Date.now();
    const trimStartSec = Math.max(0, (playStartWallMs - recStartWallMs) / 1000);

    const sequenceResult = await page.evaluate(async (durs) => {
      return await window.__2DCLIP_HEADLESS__.playEntireSequence(durs);
    }, durationsMs);

    const videoObj = page.video();
    await context.close();
    const rawWebmPath = await videoObj.path();

    await browser.close();
    browser = null;

    // 4. Armar audio exacto (Voz + SFX) + recorte preciso + encode MP4 H.264 1080p
    const totalSec = Math.max(4, Number((sequenceResult.totalMs / 1000).toFixed(2)));
    const marks = Array.isArray(sequenceResult.marks) ? sequenceResult.marks : [];

    const audioInputs = [];
    const filterParts = [];
    const mixLabels = [];

    for (const vf of localVoiceFiles) {
      const mark = marks.find((m) => m.sceneIndex === vf.sceneIndex);
      const delayMs = Math.max(0, Math.round(mark?.startMs || 0));
      const inputIdx = 1 + audioInputs.length;
      audioInputs.push(vf.path);
      const label = `v${vf.sceneIndex}`;
      filterParts.push(
        `[${inputIdx}:a]aresample=44100,aformat=channel_layouts=stereo,volume=1.22,adelay=${delayMs}|${delayMs}[${label}]`
      );
      mixLabels.push(`[${label}]`);
    }

    const scenes = Array.isArray(storyboard?.scenes) ? storyboard.scenes : [];
    scenes.forEach((sc, idx) => {
      const mark = marks.find((m) => m.sceneIndex === idx);
      const baseMs = Math.max(0, Math.round(mark?.startMs || idx * 4000));
      const durMs = Math.max(2500, Math.round(mark?.durationMs || 4200));

      const sfxEvents = [
        { raw: sc?.sfx, atMs: baseMs, vol: 0.28 },
        { raw: sc?.sfxBeat2, atMs: baseMs + Math.round(durMs * 0.34), vol: 0.22 },
        { raw: sc?.sfxBeat3, atMs: baseMs + Math.round(durMs * 0.67), vol: 0.22 },
      ];

      sfxEvents.forEach((ev, evIdx) => {
        const sfxFile = resolveSfxPath(ev.raw);
        if (!sfxFile) return;
        const inputIdx = 1 + audioInputs.length;
        audioInputs.push(sfxFile);
        const label = `s${idx}_${evIdx}`;
        filterParts.push(
          `[${inputIdx}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${ev.vol},adelay=${ev.atMs}|${ev.atMs}[${label}]`
        );
        mixLabels.push(`[${label}]`);
      });
    });

    const finalMp4Path = path.join(tmpDir, `nakkio_2dclip_${jobId || Date.now()}.mp4`);
    const ffmpegArgs = [
      '-y',
      '-ss',
      trimStartSec.toFixed(3),
      '-i',
      rawWebmPath,
    ];

    audioInputs.forEach((aPath) => {
      ffmpegArgs.push('-i', aPath);
    });

    if (mixLabels.length > 0) {
      filterParts.push(
        `${mixLabels.join('')}amix=inputs=${mixLabels.length}:duration=longest:normalize=0,apad=whole_dur=${totalSec}[aout]`
      );
      ffmpegArgs.push(
        '-filter_complex',
        filterParts.join(';'),
        '-map',
        '0:v',
        '-map',
        '[aout]',
        '-c:a',
        'aac',
        '-b:a',
        '160k'
      );
    } else {
      ffmpegArgs.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100', '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '128k');
    }

    ffmpegArgs.push(
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '21',
      '-pix_fmt',
      'yuv420p',
      '-r',
      '30',
      '-t',
      totalSec.toFixed(2),
      '-movflags',
      '+faststart',
      finalMp4Path
    );

    execFileSync('ffmpeg', ffmpegArgs, { stdio: 'inherit' });

    // 5. Subir MP4 a Cloudinary y notificar a NAKKIO
    const stats = await fs.promises.stat(finalMp4Path);
    const uploadRes = await cloudinary.uploader.upload(finalMp4Path, {
      resource_type: 'video',
      folder: 'whabot_multimedia',
      public_id: `nakkio_2dclip_${jobId || Date.now()}`,
    });

    await postCallback(callbackUrl, callbackSecret, {
      jobId,
      status: 'completed',
      videoUrl: uploadRes.secure_url,
      cloudinaryPublicId: uploadRes.public_id,
      sizeBytes: Number(stats.size || uploadRes.bytes || 0),
      durationSec: Number(uploadRes.duration || totalSec),
      width: videoSize.width,
      height: videoSize.height,
    });

    console.log(`[Worker] Video 1080p completado y enviado a NAKKIO: ${uploadRes.secure_url}`);
  } catch (err) {
    console.error('[Worker] Error fatal:', err);
    try {
      await postCallback(callbackUrl, callbackSecret, {
        jobId,
        status: 'failed',
        error: err?.message || 'Error en render worker de 2DClip',
      });
    } catch (cbErr) {
      console.error('[Worker] También falló el callback de error:', cbErr.message);
    }
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (staticServer) staticServer.close();
    await fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main();
