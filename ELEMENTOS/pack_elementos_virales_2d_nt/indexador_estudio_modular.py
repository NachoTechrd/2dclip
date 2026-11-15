#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NACHOTORRESRD // INDEXADOR AUTOMÁTICO DE 102 SOUND FX + CARPETA DE ELEMENTOS
=============================================================================
Escanea tus carpetas locales de sonidos (`./sfx`) y elementos gráficos
(`./elementos/fondos`, `./elementos/edificios`, `./elementos/personajes`, `./elementos/objetos`)
y genera automáticamente `assets_library.js` para que `studio.html` cargue tus
102 efectos de sonido y todos tus PNG/SVG reutilizables sin subirlos uno por uno.

Uso:
    python indexador_estudio_modular.py
"""

import os
import json
import mimetypes

SFX_DIR = "sfx"
ELEMENTS_DIR = "elementos"
OUTPUT_JS = "assets_library.js"

# Clasificador automático por palabras clave en el nombre del archivo de audio
SFX_CATEGORY_KEYWORDS = {
    "transicion": ["whoosh", "swoosh", "swipe", "slide", "wind", "trans", "pass"],
    "impacto": ["hit", "impact", "boom", "thud", "slam", "punch", "bass", "drop", "stamp", "sello"],
    "dinero_ui": ["cash", "coin", "money", "register", "ding", "bell", "chime", "success", "check", "pop", "click", "bubble"],
    "tech_alerta": ["glitch", "cyber", "laser", "scan", "radar", "beep", "alarm", "error", "wrong", "buzzer", "typing", "key"],
    "ambiente_suspenso": ["riser", "drone", "suspense", "tension", "heartbeat", "clock", "tick", "jail", "door", "cell"]
}

def guess_sfx_category(filename):
    lower = filename.lower()
    for cat, words in SFX_CATEGORY_KEYWORDS.items():
        if any(w in lower for w in words):
            return cat
    return "general"

def ensure_folders():
    folders = [
        SFX_DIR,
        os.path.join(ELEMENTS_DIR, "fondos"),
        os.path.join(ELEMENTS_DIR, "edificios"),
        os.path.join(ELEMENTS_DIR, "personajes"),
        os.path.join(ELEMENTS_DIR, "objetos"),
        os.path.join(ELEMENTS_DIR, "sellos")
    ]
    created = []
    for folder in folders:
        if not os.path.exists(folder):
            os.makedirs(folder, exist_ok=True)
            created.append(folder)
    return created

def scan_sfx():
    sfx_list = []
    if not os.path.exists(SFX_DIR):
        return sfx_list

    valid_ext = (".mp3", ".wav", ".ogg", ".m4a", ".webm")
    for root, _, files in os.walk(SFX_DIR):
        for f in sorted(files):
            if f.lower().endswith(valid_ext):
                rel_path = os.path.join(root, f).replace("\\", "/")
                clean_name = os.path.splitext(f)[0].replace("_", " ").replace("-", " ").strip()
                category = guess_sfx_category(f)
                sfx_list.append({
                    "id": f"sfx_{len(sfx_list) + 1}",
                    "name": clean_name.title(),
                    "file": rel_path,
                    "category": category
                })
    return sfx_list

def scan_elements():
    elements = {
        "fondos": [],
        "edificios": [],
        "personajes": [],
        "objetos": [],
        "sellos": []
    }
    if not os.path.exists(ELEMENTS_DIR):
        return elements

    valid_img = (".png", ".svg", ".webp", ".jpg", ".jpeg", ".gif")
    for sub in elements.keys():
        sub_path = os.path.join(ELEMENTS_DIR, sub)
        if not os.path.exists(sub_path):
            continue
        for root, _, files in os.walk(sub_path):
            for f in sorted(files):
                if f.lower().endswith(valid_img):
                    rel_path = os.path.join(root, f).replace("\\", "/")
                    clean_name = os.path.splitext(f)[0].replace("_", " ").replace("-", " ").strip()
                    elements[sub].append({
                        "id": f"{sub}_{len(elements[sub]) + 1}",
                        "name": clean_name.title(),
                        "src": rel_path,
                        "type": sub
                    })
    return elements

def main():
    created = ensure_folders()
    if created:
        print(f"[*] Carpetas creadas automáticamente: {', '.join(created)}")

    sfx_items = scan_sfx()
    element_items = scan_elements()

    payload = {
        "total_sfx": len(sfx_items),
        "sfx": sfx_items,
        "elements": element_items
    }

    js_content = (
        "// AUTO-GENERADO POR indexador_estudio_modular.py\n"
        f"window.__NT_ASSETS_LIBRARY__ = {json.dumps(payload, ensure_ascii=False, indent=2)};\n"
    )

    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write(js_content)

    total_elems = sum(len(v) for v in element_items.values())
    print(f"[+] ¡Indexación completada en '{OUTPUT_JS}'!")
    print(f"    -> Efectos de sonido detectados en ./{SFX_DIR}: {len(sfx_items)}")
    print(f"    -> Elementos visuales detectados en ./{ELEMENTS_DIR}: {total_elems}")

if __name__ == "__main__":
    main()
