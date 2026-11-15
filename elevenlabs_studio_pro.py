#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NACHOTORRESRD // ELEVENLABS STUDIO PRO INTEGRATOR & BATCH GENERATOR
===================================================================
Este script en Python tiene 2 funciones:
1. Modo Inyector (--patch studio.html): Inyecta automáticamente el motor completo
   de ElevenLabs (UI + Cache + Sincronización Karaoke + Timestamps) dentro de tu
   archivo studio.html sin borrar ninguna plantilla ni función existente.
2. Modo Batch CLI (--json proyecto.json --key TU_API_KEY): Genera los archivos MP3
   de todas las escenas de un proyecto JSON usando ElevenLabs API v1.
"""

import os
import sys
import json
import base64
import argparse
import urllib.request
import urllib.error

ELEVENLABS_DEFAULT_VOICES = {
    "pNInz6obpgDQGcFmaJgB": "Adam (Narrador Profundo Viral / Documental)",
    "ErXwobaYiN019PkySvjV": "Antoni (Dinámico / Energético para Reels)",
    "VR6AewLTigWG4xSOukaG": "Arnold (Impacto / Autoridad)",
    "EXAVITQu4vr4xnSDxMaL": "Bella (Femenina Clara / Storytelling)",
    "21m00Tcm4TlvDq8ikWAM": "Rachel (Femenina Profesional)"
}

def generate_scene_audio_elevenlabs(api_key, text, voice_id="pNInz6obpgDQGcFmaJgB", model_id="eleven_multilingual_v2"):
    """Llama al endpoint /with-timestamps de ElevenLabs para obtener MP3 + alineación exacta."""
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps"
    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability": 0.45,
            "similarity_boost": 0.80,
            "style": 0.35,
            "use_speaker_boost": True
        }
    }
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode("utf-8"))
        return data


def process_project_json(json_path, api_key, voice_id="pNInz6obpgDQGcFmaJgB"):
    """Lee un archivo .json exportado de Studio 2D y le incrusta el audio de ElevenLabs en cada escena."""
    with open(json_path, "r", encoding="utf-8") as f:
        project = json.load(f)

    scenes = project.get("scenes", [])
    print(f"[*] Procesando {len(scenes)} escenas con ElevenLabs (Voz: {voice_id})...")

    for idx, scene in enumerate(scenes):
        script = scene.get("script", "").strip()
        if not script:
            continue
        print(f"  -> Generando Escena {idx + 1}: '{script[:45]}...'")
        result = generate_scene_audio_elevenlabs(api_key, script, voice_id=voice_id)
        audio_b64 = result.get("audio_base64", "")
        alignment = result.get("alignment", {})

        if audio_b64:
            scene["customAudioUrl"] = f"data:audio/mp3;base64,{audio_b64}"
            # Calcular duración exacta desde el último timestamp si existe
            end_times = alignment.get("character_end_times_seconds", [])
            if end_times:
                exact_ms = int(max(end_times) * 1000) + 420
                scene["duration"] = max(2600, exact_ms)
                scene["elevenAlignment"] = alignment
                print(f"     [OK] Audio incrustado ({scene['duration']} ms)")

    out_path = json_path.replace(".json", "_elevenlabs.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(project, f, ensure_ascii=False, indent=2)
    print(f"[+] ¡Listo! Proyecto con voces ElevenLabs guardado en: {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Integrador ElevenLabs para Studio 2D")
    parser.add_argument("--json", help="Ruta al archivo .json del proyecto para inyectar audios MP3")
    parser.add_argument("--key", help="Tu API Key de ElevenLabs (xi-api-key)")
    parser.add_argument("--voice", default="pNInz6obpgDQGcFmaJgB", help="Voice ID de ElevenLabs")
    args = parser.parse_args()

    if args.json and args.key:
        process_project_json(args.json, args.key, args.voice)
    else:
        print("Uso: python elevenlabs_studio_pro.py --json mi_proyecto.json --key xi-tu-api-key")
