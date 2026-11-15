#!/usr/bin/env node
// scripts/worker-server.mjs - Servidor HTTP persistente para renderizado 1080p (Hugging Face Spaces / Docker / VPS)
import { spawn } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKER_SCRIPT = path.join(__dirname, 'render-worker.mjs');
const PORT = Number(process.env.PORT || 7860);

const jobQueue = [];
let activeCount = 0;
const MAX_CONCURRENT = Math.max(1, Number(process.env.MAX_CONCURRENT_RENDERS || 1));

function safeTimingEqual(a, b) {
  const ba = Buffer.from(String(a || ''), 'utf8');
  const bb = Buffer.from(String(b || ''), 'utf8');
  if (ba.length === 0 || ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > 2 * 1024 * 1024) {
        reject(new Error('Payload demasiado grande (>2MB)'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('JSON inválido'));
      }
    });
    req.on('error', reject);
  });
}

function pumpQueue() {
  if (activeCount >= MAX_CONCURRENT || jobQueue.length === 0) return;
  const item = jobQueue.shift();
  activeCount++;

  const tmpFile = path.join(os.tmpdir(), `render_job_${item.jobId || Date.now()}_${Math.random().toString(36).slice(2, 6)}.json`);
  fs.promises
    .writeFile(tmpFile, JSON.stringify(item.payload), 'utf8')
    .then(() => {
      const child = spawn(process.execPath, [WORKER_SCRIPT], {
        stdio: 'inherit',
        env: {
          ...process.env,
          WORKER_PAYLOAD_FILE: tmpFile,
        },
      });
      child.on('exit', async (code) => {
        console.log(`[WorkerServer] Job ${item.jobId} finalizado con código ${code}`);
        await fs.promises.rm(tmpFile, { force: true }).catch(() => {});
        activeCount--;
        pumpQueue();
      });
      child.on('error', async (err) => {
        console.error(`[WorkerServer] Error spawning worker para job ${item.jobId}:`, err);
        await fs.promises.rm(tmpFile, { force: true }).catch(() => {});
        activeCount--;
        pumpQueue();
      });
    })
    .catch((err) => {
      console.error(`[WorkerServer] Error escribiendo payload temp:`, err);
      activeCount--;
      pumpQueue();
    });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
    res.writeHead(200);
    return res.end(
      JSON.stringify({
        ok: true,
        service: '2dclip-render-worker',
        activeCount,
        queuedCount: jobQueue.length,
        maxConcurrent: MAX_CONCURRENT,
      })
    );
  }

  if (req.method === 'POST' && req.url === '/render') {
    const expectedSecret = String(
      process.env.VIDEO_WORKER_SECRET || process.env.NAK_2DCLIP_SECRET || ''
    ).trim();
    if (expectedSecret) {
      const supplied = String(req.headers['x-nakkio-secret'] || '').trim();
      if (!safeTimingEqual(supplied, expectedSecret)) {
        res.writeHead(401);
        return res.end(JSON.stringify({ ok: false, error: 'No autorizado (x-nakkio-secret inválido).' }));
      }
    }

    try {
      const payload = await readJsonBody(req);
      if (!payload?.jobId || !payload?.storyboard?.scenes?.length) {
        res.writeHead(400);
        return res.end(JSON.stringify({ ok: false, error: 'Falta jobId o storyboard.scenes.' }));
      }

      jobQueue.push({ jobId: String(payload.jobId), payload });
      pumpQueue();

      res.writeHead(202);
      return res.end(
        JSON.stringify({
          ok: true,
          queued: true,
          jobId: String(payload.jobId),
          position: jobQueue.length + (activeCount > 0 ? 1 : 0),
        })
      );
    } catch (err) {
      res.writeHead(400);
      return res.end(JSON.stringify({ ok: false, error: err?.message || 'Error procesando solicitud.' }));
    }
  }

  res.writeHead(404);
  return res.end(JSON.stringify({ ok: false, error: 'Ruta no encontrada.' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[2DClip Worker Server] Escuchando en http://0.0.0.0:${PORT}`);
});

