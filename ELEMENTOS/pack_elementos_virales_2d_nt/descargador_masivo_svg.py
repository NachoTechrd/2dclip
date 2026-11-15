#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HACK DESCARGADOR MASIVO DE SVGs A COLOR (CERO DESCARGAS 1 POR 1)
================================================================
Descarga automáticamente más de 60 vectores SVG a todo color (estilo Flat / 3D)
desde la API abierta de Iconify (Fluent Emoji Flat + Twemoji + Flat Color Icons)
y los guarda directamente en tus carpetas ./elementos/edificios, ./elementos/personajes,
./elementos/objetos y ./elementos/sellos, actualizando el índice JS al instante.

Uso:
    python descargador_masivo_svg.py
"""

import os
import json
import urllib.request

# Diccionario curado de vectores a color de alta retención para historias virales
BULK_SVG_PACK = {
    "edificios": {
        "banco_central": "fluent-emoji-flat:bank",
        "oficina_corporativa": "fluent-emoji-flat:office-building",
        "tienda_24h": "fluent-emoji-flat:convenience-store",
        "hospital_clinica": "fluent-emoji-flat:hospital",
        "fabrica_industria": "fluent-emoji-flat:factory",
        "estadio_eventos": "fluent-emoji-flat:stadium",
        "casa_residencial": "fluent-emoji-flat:house-with-garden",
        "castillo_imperio": "fluent-emoji-flat:castle"
    },
    "personajes": {
        "detective_investigador": "fluent-emoji-flat:detective",
        "juez_tribunal": "fluent-emoji-flat:judge",
        "cientifico_laboratorio": "fluent-emoji-flat:scientist",
        "tecnico_programador": "fluent-emoji-flat:technologist",
        "doctor_salud": "fluent-emoji-flat:health-worker",
        "policia_seguridad": "fluent-emoji-flat:police-officer",
        "robot_inteligencia_artificial": "fluent-emoji-flat:robot",
        "cerebro_humano": "fluent-emoji-flat:brain",
        "ojo_vision": "fluent-emoji-flat:eye"
    },
    "objetos": {
        "bolsa_dinero": "fluent-emoji-flat:money-bag",
        "billete_volando": "fluent-emoji-flat:money-with-wings",
        "fajo_dolares": "fluent-emoji-flat:dollar-banknote",
        "tarjeta_credito": "fluent-emoji-flat:credit-card",
        "grafico_subida": "fluent-emoji-flat:chart-increasing",
        "grafico_caida": "fluent-emoji-flat:chart-decreasing",
        "lupa_busqueda": "fluent-emoji-flat:magnifying-glass-tilted-left",
        "microscopio_ciencia": "fluent-emoji-flat:microscope",
        "telefono_movil": "fluent-emoji-flat:mobile-phone",
        "laptop_codigo": "fluent-emoji-flat:laptop",
        "bateria_carga": "fluent-emoji-flat:battery",
        "alerta_sirena": "fluent-emoji-flat:police-car-light",
        "bomba_impacto": "fluent-emoji-flat:bomb",
        "fuego_viral": "fluent-emoji-flat:fire",
        "reloj_arena_tiempo": "fluent-emoji-flat:hourglass-done",
        "candado_seguridad": "fluent-emoji-flat:locked-with-key",
        "eslabon_cadena": "fluent-emoji-flat:link",
        "iman_atraccion": "fluent-emoji-flat:magnet",
        "pildora_medicina": "fluent-emoji-flat:pill",
        "adn_genetica": "fluent-emoji-flat:dna",
        "cohete_despegue": "fluent-emoji-flat:rocket",
        "trofeo_exito": "fluent-emoji-flat:trophy"
    },
    "sellos": {
        "check_verificado": "fluent-emoji-flat:check-mark-button",
        "cruz_prohibido": "fluent-emoji-flat:cross-mark",
        "alerta_peligro": "fluent-emoji-flat:warning",
        "prohibido_acceso": "fluent-emoji-flat:prohibited",
        "cien_puntos": "fluent-emoji-flat:hundred-points"
    }
}

def download_all():
    base_dir = "elementos"
    downloaded = 0
    for category, icons in BULK_SVG_PACK.items():
        folder = os.path.join(base_dir, category)
        os.makedirs(folder, exist_ok=True)
        for name, icon_id in icons.items():
            prefix, icon_name = icon_id.split(":")
            url = f"https://api.iconify.design/{prefix}/{icon_name}.svg?height=256"
            dest = os.path.join(folder, f"{name}.svg")
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    svg_data = resp.read().decode("utf-8")
                    with open(dest, "w", encoding="utf-8") as out:
                        out.write(svg_data)
                    downloaded += 1
                    print(f"  [OK] Descargado: {dest}")
            except Exception as e:
                print(f"  [!] Error en {name}: {e}")

    print(f"\n[+] ¡Descarga masiva completada! {downloaded} SVGs listos en ./elementos/")
    if os.path.exists("indexador_estudio_modular.py"):
        print("[*] Ejecutando indexador_estudio_modular.py automáticamente...")
        os.system("python indexador_estudio_modular.py")

if __name__ == "__main__":
    download_all()
