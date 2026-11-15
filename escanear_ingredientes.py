#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NACHOTORRESRD // ESCANEADOR AUTOMÁTICO DE SFX E INGREDIENTES VISUALES
Genera 'assets_catalogo.js' con todos los sonidos (FXS/sfx) e imágenes (ELEMENTOS/ingredientes).
"""

import os
import json

SFX_DIRS = ["FXS", "sfx"]
ASSETS_DIRS = ["ELEMENTOS", "ingredientes", "assets"]
OUTPUT_JS = "assets_catalogo.js"

def scan_folders(folder_list, valid_exts):
    items = []
    seen = set()
    for base_dir in folder_list:
        if not os.path.exists(base_dir):
            continue
        for root, _, files in os.walk(base_dir):
            for f in sorted(files):
                if f.lower().endswith(valid_exts):
                    rel_path = os.path.join(root, f).replace("\\", "/")
                    if rel_path in seen:
                        continue
                    seen.add(rel_path)
                    clean_name = os.path.splitext(f)[0].replace("_", " ").replace("-", " ").title()
                    category = os.path.basename(root) if root != base_dir else base_dir
                    items.append({
                        "id": rel_path,
                        "name": f"[{category.upper()}] {clean_name}",
                        "path": rel_path
                    })
    return items

if __name__ == "__main__":
    sfx_list = scan_folders(SFX_DIRS, (".mp3", ".wav", ".ogg", ".m4a"))
    img_list = scan_folders(ASSETS_DIRS, (".png", ".svg", ".webp", ".gif", ".jpg"))

    js_content = f"""// CATÁLOGO AUTO-GENERADO PARA STUDIO.HTML (NACHOTORRESRD)
window.NT_CUSTOM_SFX_LIST = {json.dumps(sfx_list, ensure_ascii=False, indent=2)};
window.NT_CUSTOM_ASSETS_LIST = {json.dumps(img_list, ensure_ascii=False, indent=2)};
console.log("✓ Catálogo cargado: " + (window.NT_CUSTOM_SFX_LIST ? window.NT_CUSTOM_SFX_LIST.length : 0) + " SFX y " + (window.NT_CUSTOM_ASSETS_LIST ? window.NT_CUSTOM_ASSETS_LIST.length : 0) + " ingredientes visuales.");
"""
    with open(OUTPUT_JS, "w", encoding="utf-8") as out:
        out.write(js_content)
    print(f"¡Listo! {len(sfx_list)} sonidos SFX y {len(img_list)} imágenes exportados a {OUTPUT_JS}")

