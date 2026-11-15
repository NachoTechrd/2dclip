        // ==========================================
        // 3. MULTILAYER SCENARIO ENVIRONMENTS (12 SVG SCENARIOS)
        // ==========================================
        function buildEnvironmentBackdropHTML(envType) {
            switch (envType) {
                case 'env_saas_clean_light':
                    return `<div class="backdrop-saas-clean-light"></div>`;

                case 'env_saas_dark_emerald':
                    return `<div class="backdrop-saas-dark-emerald"></div>`;

                case 'env_saas_dark_slate':
                    return `<div class="backdrop-saas-dark-slate"></div>`;

                case 'env_underwater_abyss':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <linearGradient id="abyssWater" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#0284c7"/>
                                    <stop offset="22%" stop-color="#0369a1"/>
                                    <stop offset="65%" stop-color="#0c4a6e"/>
                                    <stop offset="100%" stop-color="#020617"/>
                                </linearGradient>
                                <linearGradient id="sunRayGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#7dd3fc" stop-opacity="0.35"/>
                                    <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
                                </linearGradient>
                            </defs>
                            <!-- Deep Ocean Backdrop -->
                            <rect width="360" height="640" fill="url(#abyssWater)"/>
                            <!-- Animated Waving Water Surface at Top -->
                            <path d="M-40 45 Q45 25 130 45 T300 45 T420 45 L420 0 L-40 0 Z" fill="#38bdf8" opacity="0.45">
                                <animateTransform attributeName="transform" type="translate" values="-30,0; 30,0; -30,0" dur="3.5s" repeatCount="indefinite"/>
                            </path>
                            <path d="M-40 58 Q60 75 160 58 T360 58 L360 0 L-40 0 Z" fill="#bae6fd" opacity="0.25">
                                <animateTransform attributeName="transform" type="translate" values="25,0; -25,0; 25,0" dur="2.8s" repeatCount="indefinite"/>
                            </path>
                            <!-- Shimmering Underwater Sun Rays -->
                            <polygon points="30,40 95,40 165,480 5,480" fill="url(#sunRayGrad)">
                                <animate attributeName="opacity" values="0.3;0.75;0.3" dur="4s" repeatCount="indefinite"/>
                            </polygon>
                            <polygon points="185,40 265,40 345,520 140,520" fill="url(#sunRayGrad)">
                                <animate attributeName="opacity" values="0.65;0.25;0.65" dur="3.2s" repeatCount="indefinite"/>
                            </polygon>
                            <!-- Rising Underwater Bubbles -->
                            <circle cx="55" cy="540" r="5" fill="none" stroke="#bae6fd" stroke-width="1.5" opacity="0.7">
                                <animate attributeName="cy" from="560" to="60" dur="4.2s" repeatCount="indefinite"/>
                                <animate attributeName="cx" values="55;68;50;55" dur="2.1s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="145" cy="580" r="3.5" fill="#e0f2fe" opacity="0.5">
                                <animate attributeName="cy" from="590" to="70" dur="3.4s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="245" cy="520" r="6" fill="none" stroke="#bae6fd" stroke-width="1.5" opacity="0.65">
                                <animate attributeName="cy" from="580" to="55" dur="4.8s" repeatCount="indefinite"/>
                                <animate attributeName="cx" values="245;230;252;245" dur="2.4s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="310" cy="500" r="4" fill="#bae6fd" opacity="0.45">
                                <animate attributeName="cy" from="550" to="65" dur="3.1s" repeatCount="indefinite"/>
                            </circle>
                            <!-- Abyssal Seabed Trench & Rocks -->
                            <path d="M0 535 Q90 505 185 530 T360 520 L360 640 L0 640 Z" fill="#091326"/>
                            <path d="M0 560 Q110 540 220 565 T360 550 L360 640 L0 640 Z" fill="#040914"/>
                            <!-- Swaying Seaweed on Ocean Floor -->
                            <path d="M42 565 Q30 520 48 485 Q62 520 48 565" fill="#0d9488" opacity="0.55">
                                <animateTransform attributeName="transform" type="rotate" values="-6 45 565; 6 45 565; -6 45 565" dur="2.6s" repeatCount="indefinite"/>
                            </path>
                            <path d="M318 560 Q305 515 324 475 Q338 515 324 560" fill="#0f766e" opacity="0.55">
                                <animateTransform attributeName="transform" type="rotate" values="6 320 560; -6 320 560; 6 320 560" dur="3.0s" repeatCount="indefinite"/>
                            </path>
                        </svg>
                    `;

                case 'env_sky_clouds':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <linearGradient id="flightSky" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#0c4a6e"/>
                                    <stop offset="45%" stop-color="#0284c7"/>
                                    <stop offset="85%" stop-color="#38bdf8"/>
                                    <stop offset="100%" stop-color="#bae6fd"/>
                                </linearGradient>
                            </defs>
                            <rect width="360" height="640" fill="url(#flightSky)"/>
                            <!-- Glowing High-Altitude Sun -->
                            <circle cx="290" cy="110" r="45" fill="#fef08a" opacity="0.25"/>
                            <circle cx="290" cy="110" r="28" fill="#fde047" opacity="0.5"/>
                            <!-- Fast Moving Cloud Layer 1 (Background) -->
                            <g opacity="0.35" fill="#ffffff">
                                <ellipse cx="80" cy="190" rx="55" ry="22"/>
                                <ellipse cx="110" cy="180" rx="40" ry="26"/>
                                <ellipse cx="55" cy="185" rx="35" ry="18"/>
                                <animateTransform attributeName="transform" type="translate" from="380 0" to="-220 0" dur="6.5s" repeatCount="indefinite"/>
                            </g>
                            <!-- Fast Moving Cloud Layer 2 (Midground) -->
                            <g opacity="0.55" fill="#f8fafc">
                                <ellipse cx="180" cy="430" rx="70" ry="26"/>
                                <ellipse cx="215" cy="418" rx="48" ry="30"/>
                                <ellipse cx="145" cy="422" rx="45" ry="22"/>
                                <animateTransform attributeName="transform" type="translate" from="400 0" to="-280 0" dur="4.2s" repeatCount="indefinite"/>
                            </g>
                            <!-- High-Speed Wind Lines Shooting Across Sky -->
                            <line x1="360" y1="250" x2="460" y2="250" stroke="#e0f2fe" stroke-width="2.5" stroke-linecap="round" opacity="0.6">
                                <animate attributeName="x1" from="380" to="-160" dur="0.9s" repeatCount="indefinite"/>
                                <animate attributeName="x2" from="460" to="-80" dur="0.9s" repeatCount="indefinite"/>
                            </line>
                            <line x1="360" y1="350" x2="480" y2="350" stroke="#e0f2fe" stroke-width="3" stroke-linecap="round" opacity="0.7">
                                <animate attributeName="x1" from="420" to="-200" dur="0.75s" repeatCount="indefinite"/>
                                <animate attributeName="x2" from="510" to="-110" dur="0.75s" repeatCount="indefinite"/>
                            </line>
                            <line x1="360" y1="490" x2="440" y2="490" stroke="#bae6fd" stroke-width="2" stroke-linecap="round" opacity="0.5">
                                <animate attributeName="x1" from="360" to="-180" dur="1.1s" repeatCount="indefinite"/>
                                <animate attributeName="x2" from="430" to="-110" dur="1.1s" repeatCount="indefinite"/>
                            </line>
                        </svg>
                    `;

                case 'env_tropical_beach':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <linearGradient id="tropSky" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#0369a1"/>
                                    <stop offset="55%" stop-color="#0ea5e9"/>
                                    <stop offset="100%" stop-color="#7dd3fc"/>
                                </linearGradient>
                                <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#fde047"/>
                                    <stop offset="30%" stop-color="#eab308"/>
                                    <stop offset="60%" stop-color="#78350f"/>
                                    <stop offset="100%" stop-color="#271c14"/>
                                </linearGradient>
                            </defs>
                            <!-- Tropical Blue Sky -->
                            <rect width="360" height="430" fill="url(#tropSky)"/>
                            <!-- Tropical Sun -->
                            <circle cx="65" cy="115" r="36" fill="#fef08a" opacity="0.45">
                                <animate attributeName="r" values="34;42;34" dur="3s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="65" cy="115" r="24" fill="#facc15" opacity="0.8"/>
                            <!-- Turquoise Tropical Sea Horizon -->
                            <rect x="0" y="385" width="360" height="65" fill="#06b6d4"/>
                            <path d="M-20 415 Q90 402 180 415 T380 415" stroke="#cffafe" stroke-width="4" fill="none" opacity="0.7">
                                <animateTransform attributeName="transform" type="translate" values="-15,0; 15,0; -15,0" dur="2.4s" repeatCount="indefinite"/>
                            </path>
                            <!-- Golden Island Beach + Underground Soil Cross-Section -->
                            <path d="M0 435 Q180 410 360 440 L360 640 L0 640 Z" fill="url(#sandGrad)"/>
                            <!-- Underground Water Table Glow -->
                            <ellipse cx="180" cy="575" rx="140" ry="26" fill="#0284c7" opacity="0.45">
                                <animate attributeName="opacity" values="0.35;0.65;0.35" dur="2.2s" repeatCount="indefinite"/>
                            </ellipse>
                        </svg>
                    `;

                case 'env_dark_grid':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <rect width="360" height="640" fill="#030712"/>
                            <circle cx="180" cy="280" r="180" fill="#0284c7" opacity="0.18">
                                <animate attributeName="r" values="160;195;160" dur="4s" repeatCount="indefinite"/>
                            </circle>
                            <!-- Animated Cyber Perspective Grid -->
                            <g stroke="#38bdf8" stroke-opacity="0.22" stroke-width="1.2">
                                <line x1="0" y1="140" x2="360" y2="140"/>
                                <line x1="0" y1="220" x2="360" y2="220"/>
                                <line x1="0" y1="300" x2="360" y2="300"/>
                                <line x1="0" y1="380" x2="360" y2="380"/>
                                <line x1="0" y1="460" x2="360" y2="460"/>
                                <line x1="60" y1="0" x2="20" y2="640"/>
                                <line x1="120" y1="0" x2="100" y2="640"/>
                                <line x1="180" y1="0" x2="180" y2="640"/>
                                <line x1="240" y1="0" x2="260" y2="640"/>
                                <line x1="300" y1="0" x2="340" y2="640"/>
                            </g>
                            <!-- Scanning Horizontal Laser Line -->
                            <line x1="0" y1="100" x2="360" y2="100" stroke="#38bdf8" stroke-width="2" opacity="0.5">
                                <animate attributeName="y1" values="120;520;120" dur="5s" repeatCount="indefinite"/>
                                <animate attributeName="y2" values="120;520;120" dur="5s" repeatCount="indefinite"/>
                            </line>
                        </svg>
                    `;

                case 'env_saas_studio':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <radialGradient id="studioObsidian" cx="50%" cy="32%" r="72%">
                                    <stop offset="0%" stop-color="#1e1b4b"/>
                                    <stop offset="50%" stop-color="#0f172a"/>
                                    <stop offset="100%" stop-color="#030712"/>
                                </radialGradient>
                                <radialGradient id="studioKeyLight" cx="50%" cy="30%" r="50%">
                                    <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.32"/>
                                    <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
                                </radialGradient>
                            </defs>
                            <rect width="360" height="640" fill="url(#studioObsidian)"/>
                            <circle cx="180" cy="210" r="210" fill="url(#studioKeyLight)"/>
                            <circle cx="65" cy="145" r="42" fill="#a855f7" opacity="0.14"/>
                            <circle cx="305" cy="495" r="56" fill="#06b6d4" opacity="0.14"/>
                            <ellipse cx="180" cy="590" rx="220" ry="60" fill="#1e293b" opacity="0.65"/>
                            <circle cx="180" cy="250" r="145" fill="none" stroke="#38bdf8" stroke-width="1" stroke-dasharray="6 8" opacity="0.28">
                                <animateTransform attributeName="transform" type="rotate" from="0 180 250" to="360 180 250" dur="36s" repeatCount="indefinite"/>
                            </circle>
                        </svg>`;
                case 'env_saas_tech':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <linearGradient id="saasTechGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#020617"/>
                                    <stop offset="50%" stop-color="#082f49"/>
                                    <stop offset="100%" stop-color="#020617"/>
                                </linearGradient>
                            </defs>
                            <rect width="360" height="640" fill="url(#saasTechGrad)"/>
                            <g stroke="#22d3ee" stroke-opacity="0.18" stroke-width="1">
                                <line x1="0" y1="160" x2="360" y2="160"/><line x1="0" y1="320" x2="360" y2="320"/><line x1="0" y1="480" x2="360" y2="480"/>
                                <line x1="90" y1="0" x2="90" y2="640"/><line x1="180" y1="0" x2="180" y2="640"/><line x1="270" y1="0" x2="270" y2="640"/>
                            </g>
                            <circle cx="180" cy="240" r="120" fill="none" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="12 6" opacity="0.35">
                                <animateTransform attributeName="transform" type="rotate" from="360 180 240" to="0 180 240" dur="22s" repeatCount="indefinite"/>
                            </circle>
                        </svg>`;
                case 'env_saas_retail':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <radialGradient id="saasRetailGrad" cx="50%" cy="35%" r="70%">
                                    <stop offset="0%" stop-color="#065f46"/>
                                    <stop offset="55%" stop-color="#064e3b"/>
                                    <stop offset="100%" stop-color="#022c22"/>
                                </radialGradient>
                            </defs>
                            <rect width="360" height="640" fill="url(#saasRetailGrad)"/>
                            <polygon points="90,0 270,0 340,640 20,640" fill="#34d399" opacity="0.08"/>
                            <rect x="0" y="510" width="360" height="130" fill="#064e3b" opacity="0.9"/>
                            <line x1="0" y1="510" x2="360" y2="510" stroke="#34d399" stroke-width="2" opacity="0.45"/>
                        </svg>`;
                case 'env_saas_gold':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <radialGradient id="saasGoldBg" cx="50%" cy="38%" r="65%">
                                    <stop offset="0%" stop-color="#451a03"/>
                                    <stop offset="55%" stop-color="#1c1917"/>
                                    <stop offset="100%" stop-color="#09090b"/>
                                </radialGradient>
                            </defs>
                            <rect width="360" height="640" fill="url(#saasGoldBg)"/>
                            <circle cx="180" cy="240" r="165" fill="none" stroke="#facc15" stroke-width="1.5" stroke-dasharray="10 8" opacity="0.28">
                                <animateTransform attributeName="transform" type="rotate" from="0 180 240" to="360 180 240" dur="28s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="180" cy="240" r="120" fill="#f59e0b" opacity="0.14"/>
                        </svg>`;

                case 'env_door_room':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#0b1322"/>
                                    <stop offset="65%" stop-color="#1e293b"/>
                                    <stop offset="100%" stop-color="#090d16"/>
                                </linearGradient>
                                <radialGradient id="hallGlow" cx="50%" cy="48%" r="60%">
                                    <stop offset="0%" stop-color="#fef08a"/>
                                    <stop offset="45%" stop-color="#f59e0b"/>
                                    <stop offset="100%" stop-color="#78350f"/>
                                </radialGradient>
                                <linearGradient id="floorWood" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#451a03"/>
                                    <stop offset="100%" stop-color="#1c0d02"/>
                                </linearGradient>
                            </defs>
                            <rect width="360" height="640" fill="url(#wallGrad)"/>
                            <!-- Wall wainscoting panels -->
                            <rect x="16" y="130" width="38" height="330" rx="4" fill="#0f172a" stroke="#334155" stroke-width="1.5" opacity="0.7"/>
                            <rect x="306" y="130" width="38" height="330" rx="4" fill="#0f172a" stroke="#334155" stroke-width="1.5" opacity="0.7"/>
                            <!-- Perspective Floor -->
                            <rect x="0" y="505" width="360" height="135" fill="url(#floorWood)"/>
                            <rect x="0" y="498" width="360" height="10" fill="#78350f"/>
                            <!-- Open Illuminated Doorway -->
                            <rect x="74" y="116" width="212" height="392" fill="url(#hallGlow)"/>
                            <!-- Door Frame Trim -->
                            <rect x="54" y="100" width="22" height="408" fill="#92400e" stroke="#451a03" stroke-width="3"/>
                            <rect x="284" y="100" width="22" height="408" fill="#92400e" stroke="#451a03" stroke-width="3"/>
                            <rect x="46" y="90" width="268" height="28" rx="4" fill="#b45309" stroke="#451a03" stroke-width="3"/>
                            <!-- Swinging Wooden Door leaf -->
                            <polygon points="76,118 148,136 148,492 76,508" fill="#78350f" stroke="#451a03" stroke-width="3"/>
                            <circle cx="136" cy="322" r="5" fill="#facc15"/>
                            <!-- Volumetric Light Beam onto Floor -->
                            <polygon points="76,118 286,118 355,640 5,640" fill="rgba(253,224,71,0.16)">
                                <animate attributeName="opacity" values="0.75;1;0.75" dur="3.5s" repeatCount="indefinite"/>
                            </polygon>
                        </svg>
                    `;

                case 'env_ocean_nature':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#0f172a"/>
                                    <stop offset="55%" stop-color="#1e3a5f"/>
                                    <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.7"/>
                                </linearGradient>
                                <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#0284c7"/>
                                    <stop offset="50%" stop-color="#0369a1"/>
                                    <stop offset="100%" stop-color="#020617"/>
                                </linearGradient>
                            </defs>
                            <rect width="360" height="430" fill="url(#skyGrad)"/>
                            <circle cx="280" cy="115" r="34" fill="#fef08a" opacity="0.22"/>
                            <circle cx="280" cy="115" r="20" fill="#fde68a" opacity="0.75"/>
                            <!-- Layered Misty Mountains -->
                            <polygon points="-30,425 90,210 225,425" fill="#334155"/>
                            <polygon points="105,425 255,175 395,425" fill="#1e293b"/>
                            <polygon points="0,275 72,300 90,450 0,450" fill="#0f172a"/>
                            <!-- Animated Waterfall -->
                            <path d="M52,295 Q74,360 76,440" stroke="#7dd3fc" stroke-width="18" fill="none" opacity="0.85"/>
                            <path d="M52,295 Q74,360 76,440" stroke="#ffffff" stroke-width="5" stroke-dasharray="14 10" fill="none" opacity="0.8">
                                <animate attributeName="stroke-dashoffset" from="48" to="0" dur="1.2s" repeatCount="indefinite"/>
                            </path>
                            <rect x="0" y="425" width="360" height="215" fill="url(#seaGrad)"/>
                            <path d="M-20,445 Q90,435 180,445 T380,445" fill="none" stroke="#bae6fd" stroke-width="2.5" opacity="0.5">
                                <animateTransform attributeName="transform" type="translate" values="-15,0;15,0;-15,0" dur="3s" repeatCount="indefinite"/>
                            </path>
                        </svg>
                    `;

                case 'env_studio_ringlight':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <radialGradient id="warmStudio" cx="50%" cy="42%" r="65%">
                                    <stop offset="0%" stop-color="#3b0764"/>
                                    <stop offset="50%" stop-color="#1e1b4b"/>
                                    <stop offset="100%" stop-color="#050814"/>
                                </radialGradient>
                                <radialGradient id="ringBloom" cx="50%" cy="44%" r="42%">
                                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
                                    <stop offset="55%" stop-color="#f472b6" stop-opacity="0.18"/>
                                    <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
                                </radialGradient>
                            </defs>
                            <rect width="360" height="640" fill="url(#warmStudio)"/>
                            <rect width="360" height="640" fill="url(#ringBloom)"/>
                            <!-- Tripod Stand -->
                            <line x1="180" y1="435" x2="180" y2="640" stroke="#334155" stroke-width="10"/>
                            <!-- Neon Ring Light Halo -->
                            <circle cx="180" cy="285" r="148" fill="none" stroke="#f472b6" stroke-width="28" opacity="0.28"/>
                            <circle cx="180" cy="285" r="148" fill="none" stroke="#ffffff" stroke-width="12" opacity="0.92">
                                <animate attributeName="opacity" values="0.85;1;0.85" dur="2.6s" repeatCount="indefinite"/>
                            </circle>
                        </svg>
                    `;

                case 'env_store_business':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <radialGradient id="shopGlow" cx="50%" cy="35%" r="65%">
                                    <stop offset="0%" stop-color="#064e3b"/>
                                    <stop offset="55%" stop-color="#0f172a"/>
                                    <stop offset="100%" stop-color="#020617"/>
                                </radialGradient>
                            </defs>
                            <rect width="360" height="640" fill="url(#shopGlow)"/>
                            <!-- Illuminated Store Shelves -->
                            <rect x="24" y="135" width="312" height="10" rx="3" fill="#475569"/>
                            <rect x="24" y="218" width="312" height="10" rx="3" fill="#475569"/>
                            <line x1="28" y1="145" x2="332" y2="145" stroke="#10b981" stroke-width="2" opacity="0.5"/>
                            <line x1="28" y1="228" x2="332" y2="228" stroke="#38bdf8" stroke-width="2" opacity="0.45"/>
                            <!-- Shelf Products -->
                            <rect x="44" y="96" width="28" height="39" rx="5" fill="#38bdf8" opacity="0.75"/>
                            <rect x="86" y="104" width="24" height="31" rx="5" fill="#facc15" opacity="0.75"/>
                            <rect x="122" y="98" width="30" height="37" rx="5" fill="#a855f7" opacity="0.65"/>
                            <rect x="252" y="92" width="34" height="43" rx="5" fill="#34d399" opacity="0.75"/>
                            <rect x="294" y="102" width="24" height="33" rx="5" fill="#fb7185" opacity="0.7"/>
                            <!-- Store Counter with Ambient LED Strip -->
                            <rect x="0" y="420" width="360" height="220" fill="#1e293b"/>
                            <rect x="0" y="408" width="360" height="16" fill="#64748b"/>
                            <rect x="0" y="424" width="360" height="4" fill="#10b981" opacity="0.85"/>
                        </svg>
                    `;

                case 'env_tv_livingroom':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <radialGradient id="tvGlow" cx="50%" cy="38%" r="55%">
                                    <stop offset="0%" stop-color="#2563eb" stop-opacity="0.45"/>
                                    <stop offset="55%" stop-color="#0f172a"/>
                                    <stop offset="100%" stop-color="#020617"/>
                                </radialGradient>
                            </defs>
                            <rect width="360" height="640" fill="url(#tvGlow)"/>
                            <!-- Floating Smart TV Frame -->
                            <rect x="28" y="140" width="304" height="186" rx="14" fill="#020617" stroke="#38bdf8" stroke-width="3" opacity="0.85"/>
                            <rect x="38" y="150" width="284" height="166" rx="8" fill="#0f172a"/>
                            <!-- Media Stand -->
                            <rect x="44" y="438" width="272" height="18" rx="5" fill="#334155"/>
                            <rect x="74" y="456" width="212" height="72" fill="#0f172a"/>
                            <rect x="115" y="428" width="130" height="10" rx="3" fill="#475569"/>
                        </svg>
                    `;

                case 'env_brain_xray':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <radialGradient id="xrayGlow" cx="50%" cy="46%" r="55%">
                                    <stop offset="0%" stop-color="#0284c7" stop-opacity="0.42"/>
                                    <stop offset="100%" stop-color="#020617"/>
                                </radialGradient>
                            </defs>
                            <rect width="360" height="640" fill="url(#xrayGlow)"/>
                            <g stroke="#38bdf8" stroke-opacity="0.18" stroke-width="1">
                                <line x1="0" y1="120" x2="360" y2="120"/><line x1="0" y1="240" x2="360" y2="240"/>
                                <line x1="0" y1="360" x2="360" y2="360"/><line x1="0" y1="480" x2="360" y2="480"/>
                                <line x1="90" y1="0" x2="90" y2="640"/><line x1="180" y1="0" x2="180" y2="640"/><line x1="270" y1="0" x2="270" y2="640"/>
                            </g>
                            <circle cx="180" cy="295" r="145" fill="none" stroke="#22d3ee" stroke-width="2" stroke-dasharray="8 6" opacity="0.4">
                                <animateTransform attributeName="transform" type="rotate" from="0 180 295" to="360 180 295" dur="22s" repeatCount="indefinite"/>
                            </circle>
                            <line x1="0" y1="120" x2="360" y2="120" stroke="#22d3ee" stroke-width="2.5" opacity="0.55">
                                <animate attributeName="y1" values="100;500;100" dur="4s" repeatCount="indefinite"/>
                                <animate attributeName="y2" values="100;500;100" dur="4s" repeatCount="indefinite"/>
                            </line>
                        </svg>
                    `;

                case 'env_ai_lab':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <radialGradient id="aiCoreGlow" cx="50%" cy="46%" r="55%">
                                    <stop offset="0%" stop-color="#6366f1" stop-opacity="0.38"/>
                                    <stop offset="55%" stop-color="#0f172a"/>
                                    <stop offset="100%" stop-color="#020617"/>
                                </radialGradient>
                            </defs>
                            <rect width="360" height="640" fill="url(#aiCoreGlow)"/>
                            <!-- Side Server Pillars -->
                            <rect x="12" y="120" width="46" height="380" rx="6" fill="#090d16" stroke="#1e293b" stroke-width="2"/>
                            <rect x="302" y="120" width="46" height="380" rx="6" fill="#090d16" stroke="#1e293b" stroke-width="2"/>
                            <g fill="#22d3ee">
                                <circle cx="28" cy="170" r="3"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.1s" repeatCount="indefinite"/></circle>
                                <circle cx="42" cy="170" r="3" fill="#10b981"/>
                                <circle cx="28" cy="240" r="3" fill="#10b981"/>
                                <circle cx="42" cy="240" r="3"><animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite"/></circle>
                                <circle cx="318" cy="170" r="3"><animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite"/></circle>
                                <circle cx="332" cy="170" r="3" fill="#a855f7"/>
                                <circle cx="318" cy="240" r="3" fill="#10b981"/>
                                <circle cx="332" cy="240" r="3"/>
                            </g>
                            <!-- Perspective Lab Deck -->
                            <polygon points="36,510 324,510 360,640 0,640" fill="#0f172a" stroke="#22d3ee" stroke-opacity="0.4"/>
                            <circle cx="180" cy="295" r="135" fill="none" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="12 8" opacity="0.45">
                                <animateTransform attributeName="transform" type="rotate" from="360 180 295" to="0 180 295" dur="24s" repeatCount="indefinite"/>
                            </circle>
                        </svg>
                    `;

                case 'env_earth_magma':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <radialGradient id="magmaCore" cx="50%" cy="68%" r="60%">
                                    <stop offset="0%" stop-color="#f97316"/>
                                    <stop offset="45%" stop-color="#7c2d12"/>
                                    <stop offset="100%" stop-color="#140402"/>
                                </radialGradient>
                            </defs>
                            <rect width="360" height="640" fill="url(#magmaCore)"/>
                            <polygon points="0,470 180,190 360,470 360,640 0,640" fill="#270b04" opacity="0.88"/>
                            <!-- Glowing Lava Cracks -->
                            <path d="M180,230 L164,340 L195,430 L170,560" fill="none" stroke="#fb923c" stroke-width="4" opacity="0.85">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>
                            </path>
                            <circle cx="180" cy="490" r="120" fill="#ea580c" opacity="0.32"/>
                        </svg>
                    `;

                case 'env_cyber_city':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <linearGradient id="cyberSky" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#020617"/>
                                    <stop offset="60%" stop-color="#0f172a"/>
                                    <stop offset="100%" stop-color="#1e1b4b"/>
                                </linearGradient>
                            </defs>
                            <rect width="360" height="640" fill="url(#cyberSky)"/>
                            <!-- Neon Horizon Halo -->
                            <circle cx="180" cy="310" r="165" fill="#06b6d4" opacity="0.2">
                                <animate attributeName="r" values="155;178;155" dur="4s" repeatCount="indefinite"/>
                            </circle>
                            <!-- Skyline Towers with Lit Windows -->
                            <rect x="14" y="210" width="56" height="330" fill="#090f1d" stroke="#1e293b"/>
                            <rect x="82" y="145" width="74" height="395" fill="#0f172a" stroke="#38bdf8" stroke-opacity="0.25"/>
                            <rect x="208" y="170" width="70" height="370" fill="#17153b" stroke="#a855f7" stroke-opacity="0.25"/>
                            <rect x="290" y="235" width="56" height="305" fill="#090f1d" stroke="#1e293b"/>
                            <!-- Neon Window Bars -->
                            <g fill="#22d3ee" opacity="0.55">
                                <rect x="96" y="170" width="14" height="6"/><rect x="122" y="170" width="14" height="6"/>
                                <rect x="96" y="205" width="14" height="6"/><rect x="122" y="235" width="14" height="6"/>
                                <rect x="224" y="195" width="14" height="6" fill="#c084fc"/><rect x="248" y="220" width="14" height="6" fill="#c084fc"/>
                            </g>
                            <!-- Cyber Street Floor -->
                            <polygon points="0,535 360,535 360,640 0,640" fill="#020617"/>
                            <line x1="0" y1="535" x2="360" y2="535" stroke="#22d3ee" stroke-width="2" opacity="0.7"/>
                        </svg>
                    `;

                default:
                case 'env_radial_fire':
                    return `
                        <svg class="w-full h-full object-cover" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <radialGradient id="fireGrad" cx="50%" cy="40%" r="65%">
                                    <stop offset="0%" stop-color="#dc2626"/>
                                    <stop offset="52%" stop-color="#7f1d1d"/>
                                    <stop offset="100%" stop-color="#090203"/>
                                </radialGradient>
                            </defs>
                            <rect width="360" height="640" fill="url(#fireGrad)"/>
                            <circle cx="180" cy="255" r="145" fill="#f97316" opacity="0.22">
                                <animate attributeName="r" values="130;160;130" dur="3.2s" repeatCount="indefinite"/>
                            </circle>
                        </svg>
                    `;
            }
        }

        // ==========================================
        // 4. ANIMATED ACTORS & ILLUSTRATIONS (20 DYNAMIC TYPES)
        // ==========================================
        function buildVectorGraphicHTML(scene) {
            const domain = currentConfig.domain || "nachotechrd";
            const priceTag = currentConfig.priceTag || "SÍGUEME HOY";
            const ctaText = currentConfig.ctaText || "SÍGUEME @NACHOTECH";

            switch (scene.graphicType) {
                case 'saas_iphone_whatsapp_flow': {
                    // Mockup iPhone 3D con flujo de WhatsApp inteligente (Nakkio)
                    const card1 = scene.card1 || 'Hola, ¿tienen catálogo disponible?';
                    const card2 = scene.card2 || '¡Hola! Aquí tienes nuestro catálogo web interactivo 🛍️';
                    const card3 = scene.card3 || 'Venta Cerrada en 2 seg';
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center saas-3d-scene">
                            <div class="saas-phone-frame scale-90 sm:scale-100">
                                <!-- Dynamic Island -->
                                <div class="saas-phone-island"></div>

                                <!-- Status Bar -->
                                <div class="flex items-center justify-between px-6 pt-3 pb-1 text-[10px] font-bold text-white/80 z-20">
                                    <span>10:30</span>
                                    <div class="flex items-center gap-1.5">
                                        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4 21l3.5-.95C8.98 20.63 10.45 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/></svg>
                                        <span class="text-[9px]">5G</span>
                                        <div class="w-4 h-2 border border-white/70 rounded-sm p-0.5"><div class="h-full bg-emerald-400 rounded-2xs w-full"></div></div>
                                    </div>
                                </div>

                                <!-- WhatsApp Header -->
                                <div class="bg-[#0b141a] px-3 py-2 border-b border-[#202c33] flex items-center justify-between z-20">
                                    <div class="flex items-center gap-2">
                                        <div class="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-sm shadow">🤖</div>
                                        <div class="leading-tight">
                                            <div class="text-[11px] font-bold text-white flex items-center gap-1">
                                                Nakkio AI Agent
                                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            </div>
                                            <div class="text-[8px] text-emerald-400 font-medium">en línea las 24 hrs</div>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2 text-slate-400 text-xs">
                                        <span>📹</span>
                                        <span>📞</span>
                                    </div>
                                </div>

                                <!-- WhatsApp Chat Canvas -->
                                <div class="flex-1 bg-[#0b141a] p-3 flex flex-col justify-end space-y-2.5 overflow-hidden relative">
                                    <!-- Background WhatsApp Pattern -->
                                    <div class="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]"></div>

                                    <!-- Mensaje del Cliente (Compás 1) -->
                                    <div class="actor-beat-1 self-start max-w-[85%] bg-[#202c33] text-slate-100 rounded-2xl rounded-tl-xs px-3 py-2 text-[10.5px] shadow-md border border-white/5 relative">
                                        <p class="leading-relaxed font-medium">${card1}</p>
                                        <div class="text-[8px] text-slate-400 text-right mt-0.5">10:30 PM</div>
                                    </div>

                                    <!-- Indicador de Escritura de la IA -->
                                    <div class="actor-beat-1 self-start flex items-center gap-1 px-3 py-1.5 bg-[#202c33]/70 rounded-full text-[9px] text-emerald-400 font-mono-code">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
                                        <span class="text-[8px] ml-1">Escribiendo respuesta...</span>
                                    </div>

                                    <!-- Respuesta Automática de la IA con Catálogo (Compás 2) -->
                                    <div class="actor-beat-2 self-end max-w-[88%] bg-[#005c4b] text-white rounded-2xl rounded-tr-xs p-2.5 shadow-lg border border-emerald-400/30">
                                        <p class="text-[10px] leading-snug font-medium mb-1.5">${card2}</p>
                                        <!-- Tarjeta de Catálogo Interactivo -->
                                        <div class="bg-black/30 rounded-xl p-2 border border-emerald-400/20 flex items-center gap-2">
                                            <div class="w-10 h-10 rounded-lg bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-lg flex-shrink-0">🛍️</div>
                                            <div class="flex-1 min-w-0">
                                                <div class="text-[9px] font-black text-amber-300 truncate">Catálogo Oficial Nakkio</div>
                                                <div class="text-[8px] text-emerald-200">54 productos disponibles</div>
                                            </div>
                                        </div>
                                        <div class="mt-2 text-center">
                                            <div class="inline-block w-full py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wide shadow hover:bg-emerald-400">
                                                🛒 Ver Catálogo Web
                                            </div>
                                        </div>
                                        <div class="text-[7.5px] text-emerald-200/80 text-right mt-1 flex items-center justify-end gap-1">
                                            <span>10:30 PM</span>
                                            <span class="text-sky-300 font-bold">✓✓</span>
                                        </div>
                                    </div>

                                    <!-- Badge de Venta Exitosa en Clímax (Compás 3) -->
                                    <div class="actor-beat-3 self-center my-1 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 px-3 py-1 rounded-full font-black text-[9.5px] shadow-xl flex items-center gap-1.5 transform scale-105">
                                        <span>⚡</span>
                                        <span>${card3}</span>
                                    </div>
                                </div>

                                <!-- Bottom Input Bar Mockup -->
                                <div class="bg-[#1e293b] px-3 py-2 flex items-center gap-2 border-t border-slate-700/50 z-20">
                                    <span class="text-xs text-slate-400">😊</span>
                                    <div class="flex-1 bg-slate-950 rounded-full px-3 py-1 text-[9px] text-slate-400 font-mono-code">Escribe un mensaje...</div>
                                    <div class="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 text-xs font-bold">🎙️</div>
                                </div>
                            </div>
                        </div>
                    `;
                }

                case 'saas_ios_toggle_action': {
                    // Micro-interacción: Tarjeta limpia con interruptor iOS que se enciende con clic de cursor (estilo Buzzfy)
                    const card1 = scene.card1 || 'Automatización Inteligente';
                    const card2 = scene.card2 || 'Vende en WhatsApp e Instagram 24/7';
                    const card3 = scene.card3 || '100% en Piloto Automático';
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center saas-3d-scene">
                            <!-- Tarjeta Principal Blanca / Cristal -->
                            <div class="w-72 bg-white text-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 relative overflow-hidden transform transition duration-500">
                                <!-- Header con Avatar e Iconos -->
                                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <div class="flex items-center gap-2.5">
                                        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-lg shadow-md font-bold">
                                            🤖
                                        </div>
                                        <div>
                                            <div class="text-xs font-black text-slate-900 uppercase tracking-tight">${card1}</div>
                                            <div class="text-[9px] text-slate-500 font-medium">Nakkio Automation Engine</div>
                                        </div>
                                    </div>
                                    <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono-code text-[9px] font-bold">AI PRO</span>
                                </div>

                                <!-- Subtítulo / Descripción -->
                                <div class="py-3.5">
                                    <p class="text-xs text-slate-700 font-bold leading-snug">${card2}</p>
                                </div>

                                <!-- Fila del Toggle Switch de iOS con Cursor animado -->
                                <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between relative">
                                    <div class="leading-tight">
                                        <div class="text-[11px] font-black text-slate-900">Modo 24/7 Activo</div>
                                        <div class="text-[9px] text-slate-500">Atención sin pausas</div>
                                    </div>

                                    <!-- El Switch de Palanca iOS -->
                                    <div class="saas-toggle-track">
                                        <div class="saas-toggle-knob"></div>
                                    </div>

                                    <!-- Cursor del Mouse que se acerca y hace clic -->
                                    <div class="absolute right-5 bottom-1 pointer-events-none saas-cursor-anim z-30">
                                        <svg class="w-6 h-6 drop-shadow-md" viewBox="0 0 24 24" fill="none">
                                            <path d="M4 3L11.5 21L14.5 13.5L22 10.5L4 3Z" fill="#0f172a" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                </div>

                                <!-- Status / Badge en Beat 3 -->
                                <div class="actor-beat-3 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                                    <div class="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black">
                                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                        <span>${card3}</span>
                                    </div>
                                    <div class="flex text-amber-400 text-xs">⭐⭐⭐⭐⭐</div>
                                </div>
                            </div>
                        </div>
                    `;
                }

                case 'saas_3d_product_fanout': {
                    // Abanico 3D de Productos / Catálogo Web interactivo (estilo Buzzfy)
                    const card1 = scene.card1 || 'Catálogo Web Interactivo';
                    const card2 = scene.card2 || 'Tus productos se venden solos';
                    const card3 = scene.card3 || '¡Pedido Pagado! • RD$ 2,850';
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center saas-3d-scene">
                            <!-- Titular de la escena en tarjeta flotante -->
                            <div class="actor-beat-1 mb-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md text-center z-30">
                                <span class="text-[10px] font-black text-slate-800 uppercase tracking-wide">🛍️ ${card1}</span>
                            </div>

                            <!-- Contenedor del Abanico 3D -->
                            <div class="relative w-72 h-64 flex items-center justify-center">
                                <!-- Tarjeta Izquierda (Producto 1) -->
                                <div class="saas-fanout-card saas-fan-left flex flex-col justify-between p-2.5">
                                    <div class="w-full h-24 rounded-xl bg-slate-100 flex items-center justify-center text-3xl shadow-inner">
                                        👟
                                    </div>
                                    <div>
                                        <div class="text-[10px] font-black text-slate-800">Calzado Urbano</div>
                                        <div class="text-[8.5px] text-emerald-600 font-bold">RD$ 2,400</div>
                                    </div>
                                    <div class="w-full py-1 bg-slate-900 text-white text-[8px] font-bold rounded-lg text-center">Disponible</div>
                                </div>

                                <!-- Tarjeta Centro (Producto Destacado) -->
                                <div class="saas-fanout-card saas-fan-center flex flex-col justify-between p-3 border-2 border-emerald-500">
                                    <div class="w-full h-26 rounded-xl bg-gradient-to-tr from-emerald-100 to-teal-50 flex items-center justify-center text-4xl shadow-inner relative">
                                        📱
                                        <span class="absolute top-1.5 right-1.5 bg-rose-500 text-white font-black text-[7.5px] px-1.5 py-0.5 rounded-full">TOP</span>
                                    </div>
                                    <div>
                                        <div class="text-[11px] font-black text-slate-900 leading-tight">iPhone 14 Pro Max</div>
                                        <div class="text-[9.5px] text-emerald-600 font-black">RD$ 48,900</div>
                                    </div>
                                    <div class="w-full py-1 bg-emerald-500 text-slate-950 text-[9px] font-black rounded-lg text-center shadow">Comprar en 1 Clic</div>
                                </div>

                                <!-- Tarjeta Derecha (Producto 3) -->
                                <div class="saas-fanout-card saas-fan-right flex flex-col justify-between p-2.5">
                                    <div class="w-full h-24 rounded-xl bg-slate-100 flex items-center justify-center text-3xl shadow-inner">
                                        🎧
                                    </div>
                                    <div>
                                        <div class="text-[10px] font-black text-slate-800">Audífonos Pro</div>
                                        <div class="text-[8.5px] text-emerald-600 font-bold">RD$ 1,850</div>
                                    </div>
                                    <div class="w-full py-1 bg-slate-900 text-white text-[8px] font-bold rounded-lg text-center">Disponible</div>
                                </div>
                            </div>

                            <!-- Badge de Confirmación de Compra en Beat 3 -->
                            <div class="actor-beat-3 mt-4 px-4 py-1.5 rounded-full bg-slate-950 text-white border border-emerald-400 shadow-xl flex items-center gap-2 z-30">
                                <span class="text-emerald-400 font-black text-xs">✓</span>
                                <span class="text-[10.5px] font-black text-white">${card3}</span>
                            </div>
                        </div>
                    `;
                }

                case 'saas_pos_scanner_register': {
                    // Punto de Venta con Tablet + Escáner Láser de Código de Barras (Posent)
                    const card1 = scene.card1 || 'Producto Escaneado';
                    const card2 = scene.card2 || 'Total: RD$ 2,450';
                    const card3 = scene.card3 || 'INVENTARIO CUADRADO';
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center saas-3d-scene">
                            <!-- Tablet POS Principal -->
                            <div class="w-72 bg-slate-950 text-white rounded-3xl p-4 shadow-2xl border-2 border-slate-700 relative overflow-hidden">
                                <!-- Header de Posent POS -->
                                <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                                    <div class="flex items-center gap-2">
                                        <div class="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-sm font-black text-blue-400">🏪</div>
                                        <div class="leading-tight">
                                            <div class="text-[10px] font-black text-white">POSENT CLOUD POS</div>
                                            <div class="text-[8px] text-emerald-400 font-bold">✓ Caja Z Conectada</div>
                                        </div>
                                    </div>
                                    <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[8.5px] border border-emerald-500/30">VERSIÓN FREE</span>
                                </div>

                                <!-- Zona de Escaneo Láser Central -->
                                <div class="my-3 bg-slate-900/90 rounded-2xl p-3 border border-slate-800 relative overflow-hidden">
                                    <!-- Haz Láser Rojo Animado -->
                                    <div class="saas-laser-beam z-20"></div>

                                    <!-- Código de Barras Escaneado -->
                                    <div class="flex flex-col items-center justify-center py-2 relative z-10">
                                        <svg class="w-40 h-10 fill-current text-white/90" viewBox="0 0 200 40">
                                            <rect x="0" y="0" width="4" height="40"/>
                                            <rect x="8" y="0" width="2" height="40"/>
                                            <rect x="14" y="0" width="6" height="40"/>
                                            <rect x="24" y="0" width="2" height="40"/>
                                            <rect x="30" y="0" width="8" height="40"/>
                                            <rect x="42" y="0" width="3" height="40"/>
                                            <rect x="50" y="0" width="5" height="40"/>
                                            <rect x="60" y="0" width="2" height="40"/>
                                            <rect x="66" y="0" width="7" height="40"/>
                                            <rect x="78" y="0" width="3" height="40"/>
                                            <rect x="86" y="0" width="6" height="40"/>
                                            <rect x="96" y="0" width="2" height="40"/>
                                            <rect x="104" y="0" width="7" height="40"/>
                                            <rect x="116" y="0" width="4" height="40"/>
                                            <rect x="124" y="0" width="2" height="40"/>
                                            <rect x="132" y="0" width="8" height="40"/>
                                            <rect x="144" y="0" width="3" height="40"/>
                                            <rect x="152" y="0" width="6" height="40"/>
                                            <rect x="162" y="0" width="2" height="40"/>
                                            <rect x="170" y="0" width="5" height="40"/>
                                            <rect x="180" y="0" width="4" height="40"/>
                                            <rect x="190" y="0" width="6" height="40"/>
                                        </svg>
                                        <span class="text-[8px] font-mono-code text-slate-400 mt-1">7 501000 123456</span>
                                    </div>

                                    <!-- Fila de Producto Entrando al Carrito en Beat 2 -->
                                    <div class="actor-beat-2 mt-1 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                                        <span class="font-bold text-amber-300">✓ ${card1}</span>
                                        <span class="font-mono-code text-emerald-400 font-bold">-1 en stock</span>
                                    </div>
                                </div>

                                <!-- Total de Venta y Sello de Cuadre en Beat 3 -->
                                <div class="flex items-center justify-between pt-1">
                                    <div>
                                        <div class="text-[8.5px] text-slate-400 font-bold uppercase">Monto Total</div>
                                        <div class="text-sm font-black text-white font-mono-code">${card2}</div>
                                    </div>
                                    <div class="actor-beat-3 px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-[9px] shadow-lg flex items-center gap-1">
                                        <span>✓</span>
                                        <span>${card3}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }

                case 'saas_growth_chart_ticker': {
                    // Tarjeta Analítica con Gráfico de Línea SVG animado y Contador (Buzzfy)
                    const card1 = scene.card1 || 'Ventas en Piloto Automático';
                    const card2 = scene.card2 || 'RD$ 94,500';
                    const card3 = scene.card3 || 'CRECIMIENTO +340%';
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center saas-3d-scene">
                            <div class="w-72 bg-[#0b0f19] text-white rounded-3xl p-5 shadow-2xl border border-slate-800 relative overflow-hidden">
                                <!-- Header con Métrica -->
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${card1}</div>
                                        <div class="text-2xl font-black text-white font-mono-code mt-0.5">${card2}</div>
                                    </div>
                                    <div class="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black text-[9px] flex items-center gap-1">
                                        <span>▲</span>
                                        <span>${card3}</span>
                                    </div>
                                </div>

                                <!-- Gráfico SVG con Línea Ascendente Animada -->
                                <div class="my-4 relative h-28 w-full">
                                    <svg class="w-full h-full overflow-visible" viewBox="0 0 240 100" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stop-color="#10b981" stop-opacity="0.45"/>
                                                <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
                                            </linearGradient>
                                        </defs>
                                        <!-- Área de relleno -->
                                        <path d="M 0 90 Q 50 85, 90 60 T 170 35 T 240 12 L 240 100 L 0 100 Z" fill="url(#chartGrad)" />
                                        <!-- Línea de trazo -->
                                        <path class="saas-chart-stroke" d="M 0 90 Q 50 85, 90 60 T 170 35 T 240 12" fill="none" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
                                        <!-- Punto final brillante -->
                                        <circle cx="240" cy="12" r="5" fill="#34d399" class="animate-ping" />
                                        <circle cx="240" cy="12" r="4" fill="#ffffff" stroke="#10b981" stroke-width="2" />
                                    </svg>
                                </div>

                                <!-- Resumen inferior -->
                                <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[9px] text-slate-400 font-bold">
                                    <span>Día 1</span>
                                    <span>Día 15</span>
                                    <span class="text-emerald-400">Hoy (Pico Máximo)</span>
                                </div>
                            </div>
                        </div>
                    `;
                }

                case 'saas_nfc_qr_plaque': {
                    // Placa acrílica de mesa con teléfono acercándose y escaneando (Rubroo)
                    const card1 = scene.card1 || 'ACERCA TU CELULAR';
                    const card2 = scene.card2 || 'MESA 1 • MENÚ EN VIVO';
                    const card3 = scene.card3 || 'PEDIDO EN 1 TOQUE';
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center saas-3d-scene">
                            <!-- Placa de Mesa Acrílica Negra y Dorada -->
                            <div class="w-64 bg-slate-950 border-2 border-amber-400/80 rounded-2xl p-4 shadow-2xl relative text-center">
                                <!-- Header de la Mesa -->
                                <div class="inline-block px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] tracking-widest uppercase mb-2">
                                    MESA 1
                                </div>

                                <!-- Dos Códigos QR / NFC -->
                                <div class="grid grid-cols-2 gap-2 my-2">
                                    <!-- NFC Box -->
                                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center">
                                        <div class="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-base mb-1">
                                            📶
                                        </div>
                                        <div class="text-[8px] font-black text-amber-300">${card1}</div>
                                    </div>
                                    <!-- QR Box -->
                                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center">
                                        <div class="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center">
                                            <svg class="w-full h-full text-slate-950 fill-current" viewBox="0 0 24 24"><path d="M2 2h8v8H2zm2 2v4h4V4zm10-2h8v8h-8zm2 2v4h4V4zM2 14h8v8H2zm2 2v4h4v-4zm10 0h2v2h-2zm4 0h2v2h-2zm-4 4h2v2h-2zm4 0h2v2h-2z"/></svg>
                                        </div>
                                        <div class="text-[8px] font-black text-slate-300 mt-1">MENÚ & WIFI</div>
                                    </div>
                                </div>

                                <!-- Notificación de Conexión en Beat 2 / Beat 3 -->
                                <div class="actor-beat-2 mt-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 font-bold text-[9px] flex items-center justify-center gap-1.5">
                                    <span>✓</span>
                                    <span>${card2}</span>
                                </div>
                            </div>

                            <!-- Teléfono que se acerca flotando por arriba -->
                            <div class="actor-beat-3 mt-3 px-3 py-1 rounded-full bg-white text-slate-950 font-black text-[10px] shadow-xl flex items-center gap-1">
                                <span>📱</span>
                                <span>${card3}</span>
                            </div>
                        </div>
                    `;
                }

                case 'coconut_water_tree':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 spring-pop drop-shadow-2xl" viewBox="0 0 260 270">
                                <defs>
                                    <linearGradient id="cocoTrunk" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stop-color="#78350f"/>
                                        <stop offset="50%" stop-color="#b45309"/>
                                        <stop offset="100%" stop-color="#451a03"/>
                                    </linearGradient>
                                    <linearGradient id="cocoWaterGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#7dd3fc"/>
                                        <stop offset="50%" stop-color="#38bdf8"/>
                                        <stop offset="100%" stop-color="#0284c7"/>
                                    </linearGradient>
                                    <clipPath id="cocoWaterClip">
                                        <ellipse cx="178" cy="162" rx="40" ry="34"/>
                                    </clipPath>
                                </defs>

                                <!-- Underground Soil & Deep Root Network -->
                                <path d="M15 225 Q130 212 245 225 L250 260 L10 260 Z" fill="#3f230f" stroke="#78350f" stroke-width="2"/>
                                <path id="rootPath1" d="M35 252 Q65 242 82 222" stroke="#b45309" stroke-width="4" stroke-linecap="round" fill="none"/>
                                <path id="rootPath2" d="M125 254 Q100 240 86 222" stroke="#b45309" stroke-width="4" stroke-linecap="round" fill="none"/>
                                <path d="M84 256 L84 222" stroke="#d97706" stroke-width="4.5" stroke-linecap="round"/>

                                <!-- Palm Tree Curved Trunk -->
                                <path d="M74 224 Q98 150 78 78 L94 78 Q114 150 94 224 Z" fill="url(#cocoTrunk)" stroke="#451a03" stroke-width="2"/>
                                <!-- Trunk Bark Rings -->
                                <path d="M77 200 Q88 196 96 200 M81 175 Q92 171 99 175 M83 150 Q94 146 100 150 M82 125 Q92 121 98 125 M80 100 Q89 96 95 100" stroke="#451a03" stroke-width="2" fill="none"/>

                                <!-- ANIMATED WATER STREAM PUMPING UP FROM ROOTS THROUGH TRUNK -->
                                <path id="upwardWaterPath" d="M50 250 Q78 235 85 215 Q100 150 86 80" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,6" opacity="0.7">
                                    <animate attributeName="stroke-dashoffset" from="48" to="0" dur="0.7s" repeatCount="indefinite"/>
                                </path>
                                <!-- Moving Water Droplets Rising Inside Tree -->
                                <circle r="5.5" fill="#7dd3fc" stroke="#ffffff" stroke-width="1.5">
                                    <animateMotion path="M50 250 Q78 235 85 215 Q100 150 86 80" dur="1.3s" repeatCount="indefinite"/>
                                </circle>
                                <circle r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5">
                                    <animateMotion path="M115 252 Q92 235 85 215 Q100 150 86 80" dur="1.3s" begin="0.65s" repeatCount="indefinite"/>
                                </circle>

                                <!-- SWAYING TROPICAL PALM CROWN -->
                                <g>
                                    <animateTransform attributeName="transform" type="rotate" values="-5 86 78; 6 86 78; -5 86 78" dur="2.2s" repeatCount="indefinite"/>
                                    <path d="M86 78 Q35 42 5 68 Q45 25 86 78" fill="#15803d"/>
                                    <path d="M86 78 Q135 40 172 62 Q130 22 86 78" fill="#16a34a"/>
                                    <path d="M86 78 Q85 18 65 8 Q105 22 86 78" fill="#22c55e"/>
                                    <path d="M86 78 Q42 22 15 28 Q58 14 86 78" fill="#22c55e"/>
                                    <path d="M86 78 Q130 20 160 28 Q118 14 86 78" fill="#15803d"/>
                                    <!-- Coconuts hanging on tree -->
                                    <circle cx="78" cy="84" r="9" fill="#78350f" stroke="#451a03" stroke-width="2"/>
                                    <circle cx="95" cy="83" r="9.5" fill="#92400e" stroke="#451a03" stroke-width="2"/>
                                </g>

                                <!-- Filtered Pure Water Stream Pouring Into Cut Coconut -->
                                <path d="M98 85 Q145 88 175 128" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="8,5">
                                    <animate attributeName="stroke-dashoffset" from="52" to="0" dur="0.5s" repeatCount="indefinite"/>
                                </path>
                                <circle r="5" fill="#e0f2fe">
                                    <animateMotion path="M98 85 Q145 88 175 135" dur="0.75s" repeatCount="indefinite"/>
                                </circle>

                                <!-- GIANT HERO CUT-OPEN 3D COCONUT WITH SLOSHING WATER & CHARACTER FACE -->
                                <g>
                                    <animateTransform attributeName="transform" type="translate" values="0,-4; 0,4; 0,-4" dur="2.0s" repeatCount="indefinite"/>
                                    <!-- Outer Brown Husk -->
                                    <ellipse cx="178" cy="160" rx="54" ry="50" fill="#451a03" stroke="#92400e" stroke-width="4"/>
                                    <!-- Inner White Coconut Meat -->
                                    <ellipse cx="178" cy="162" rx="46" ry="41" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
                                    <!-- Inner Cavity Background -->
                                    <ellipse cx="178" cy="162" rx="40" ry="34" fill="#0c4a6e"/>

                                    <!-- Animated Sloshing Water Inside Coconut -->
                                    <g clip-path="url(#cocoWaterClip)">
                                        <path d="M120 155 Q150 142 180 155 T240 155 L240 215 L120 215 Z" fill="url(#cocoWaterGrad)">
                                            <animateTransform attributeName="transform" type="translate" values="-18,4; 18,-6; -18,4" dur="1.6s" repeatCount="indefinite"/>
                                        </path>
                                        <!-- Water Bubbles Inside Coconut -->
                                        <circle cx="165" cy="180" r="3.5" fill="#e0f2fe" opacity="0.8">
                                            <animate attributeName="cy" values="190;152;190" dur="1.4s" repeatCount="indefinite"/>
                                        </circle>
                                        <circle cx="192" cy="175" r="4.5" fill="#e0f2fe" opacity="0.8">
                                            <animate attributeName="cy" values="192;148;192" dur="1.1s" repeatCount="indefinite"/>
                                        </circle>
                                    </g>

                                    <!-- Quirky "Weird + Real" Expressive Eyes on the Coconut -->
                                    <circle cx="162" cy="136" r="6" fill="#0f172a"/>
                                    <circle cx="160" cy="134" r="2" fill="#ffffff"/>
                                    <circle cx="194" cy="136" r="6" fill="#0f172a"/>
                                    <circle cx="192" cy="134" r="2" fill="#ffffff"/>
                                    <!-- Happy Drinking Straw -->
                                    <path d="M198 152 L222 102 L236 98" stroke="#f43f5e" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-black/85 border border-sky-400 text-sky-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5">
                                <span>🥥</span> ${scene.card1} • ${scene.card2}
                            </div>
                        </div>
                    `;

                case 'smartphone_radio_waves':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 270 260">
                                <defs>
                                    <linearGradient id="cyberPhoneGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stop-color="#1e293b"/>
                                        <stop offset="100%" stop-color="#090d16"/>
                                    </linearGradient>
                                    <linearGradient id="screenHolo" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#0284c7"/>
                                        <stop offset="100%" stop-color="#1e1b4b"/>
                                    </linearGradient>
                                </defs>

                                <!-- COMPÁS 1: EMISOR ACÚSTICO CYBER + SMARTPHONE ISOMÉTRICO 2.5D -->
                                <g class="actor-beat-1">
                                    <!-- Ondas acústicas entrando al micrófono -->
                                    <path d="M22 112 Q12 130 22 148" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round">
                                        <animate attributeName="opacity" values="0.2;1;0.2" dur="0.6s" repeatCount="indefinite"/>
                                    </path>
                                    <path d="M32 104 Q18 130 32 156" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round">
                                        <animate attributeName="opacity" values="1;0.2;1" dur="0.6s" repeatCount="indefinite"/>
                                    </path>
                                    <!-- Smartphone 2.5D con bisel volumétrico -->
                                    <g class="svg-float-3d" transform="translate(42, 72)">
                                        <rect x="-4" y="4" width="62" height="112" rx="14" fill="#0284c7"/>
                                        <rect x="0" y="0" width="62" height="112" rx="14" fill="url(#cyberPhoneGrad)" stroke="#7dd3fc" stroke-width="2.5"/>
                                        <rect x="6" y="10" width="50" height="92" rx="8" fill="url(#screenHolo)"/>
                                        <!-- Ecualizador de Voz Dinámico en Pantalla -->
                                        <rect x="13" y="44" width="5" height="24" rx="2.5" fill="#facc15">
                                            <animate attributeName="height" values="10;36;10" dur="0.35s" repeatCount="indefinite"/>
                                            <animate attributeName="y" values="51;38;51" dur="0.35s" repeatCount="indefinite"/>
                                        </rect>
                                        <rect x="22" y="36" width="5" height="36" rx="2.5" fill="#22c55e">
                                            <animate attributeName="height" values="38;12;38" dur="0.28s" repeatCount="indefinite"/>
                                            <animate attributeName="y" values="37;50;37" dur="0.28s" repeatCount="indefinite"/>
                                        </rect>
                                        <rect x="31" y="40" width="5" height="28" rx="2.5" fill="#38bdf8">
                                            <animate attributeName="height" values="14;40;14" dur="0.42s" repeatCount="indefinite"/>
                                            <animate attributeName="y" values="49;36;49" dur="0.42s" repeatCount="indefinite"/>
                                        </rect>
                                        <rect x="40" y="46" width="5" height="20" rx="2.5" fill="#f43f5e">
                                            <animate attributeName="height" values="32;10;32" dur="0.31s" repeatCount="indefinite"/>
                                            <animate attributeName="y" values="40;51;40" dur="0.31s" repeatCount="indefinite"/>
                                        </rect>
                                    </g>
                                </g>

                                <!-- COMPÁS 2: TRANSDUCCIÓN BINARIA (0101) VIAJANDO POR ONDA PORTADORA -->
                                <g class="actor-beat-2">
                                    <path id="carrierWavePath" d="M104 115 C135 52 165 162 212 72" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-dasharray="8,6">
                                        <animate attributeName="stroke-dashoffset" from="56" to="0" dur="0.4s" repeatCount="indefinite"/>
                                    </path>
                                    <!-- Cápsula Binaria 0101 viajando por la onda -->
                                    <g>
                                        <rect x="-22" y="-11" width="44" height="22" rx="7" fill="#090d16" stroke="#38bdf8" stroke-width="2"/>
                                        <text x="0" y="4" fill="#7dd3fc" font-size="10" font-family="monospace" font-weight="900" text-anchor="middle">0101</text>
                                        <animateMotion path="M104 115 C135 52 165 162 212 72" dur="0.9s" repeatCount="indefinite"/>
                                    </g>
                                    <!-- Cápsula de Voz viajando desfasada -->
                                    <g>
                                        <rect x="-20" y="-10" width="40" height="20" rx="7" fill="#052e16" stroke="#4ade80" stroke-width="2"/>
                                        <text x="0" y="4" fill="#4ade80" font-size="9.5" font-family="monospace" font-weight="900" text-anchor="middle">300Mm/s</text>
                                        <animateMotion path="M104 115 C135 52 165 162 212 72" dur="0.9s" begin="0.45s" repeatCount="indefinite"/>
                                    </g>
                                </g>

                                <!-- COMPÁS 3: TORRE 5G Y DOMOS ELECTROMAGNÉTICOS DE ALTA FRECUENCIA -->
                                <g class="actor-beat-3" transform="translate(186, 46)">
                                    <!-- Domos de radiación electromagnética -->
                                    <circle cx="28" cy="24" r="14" fill="none" stroke="#facc15" stroke-width="2.5">
                                        <animate attributeName="r" values="10;68" dur="1.2s" repeatCount="indefinite"/>
                                        <animate attributeName="opacity" values="1;0" dur="1.2s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle cx="28" cy="24" r="14" fill="none" stroke="#38bdf8" stroke-width="2.5">
                                        <animate attributeName="r" values="10;68" dur="1.2s" begin="0.6s" repeatCount="indefinite"/>
                                        <animate attributeName="opacity" values="1;0" dur="1.2s" begin="0.6s" repeatCount="indefinite"/>
                                    </circle>
                                    <!-- Estructura Torre 5G -->
                                    <path d="M28 24 L6 172 M28 24 L50 172 M12 74 L44 74 M15 114 L41 114 M9 152 L47 152 M12 74 L41 114 M44 74 L15 114" stroke="#e2e8f0" stroke-width="3" fill="none"/>
                                    <circle cx="28" cy="24" r="8" fill="#ef4444" stroke="#ffffff" stroke-width="2" class="svg-pulse-glow"/>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-black/85 border border-cyan-400 text-cyan-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5">
                                <span>📱</span> ${scene.card1} • ${scene.card2}
                            </div>
                        </div>
                    `;

                case 'micro_soldering_chip':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 260 260">
                                <!-- COMPÁS 1: PLACA MADRE PCB + CHIP IC CON CORROSIÓN/FALLO -->
                                <g class="actor-beat-1">
                                    <rect x="28" y="48" width="204" height="154" rx="16" fill="#064e3b" stroke="#10b981" stroke-width="3"/>
                                    <!-- Pistas de cobre con corriente viajando -->
                                    <path d="M28 90 L90 90 M170 90 L232 90 M28 155 L90 155 M170 155 L232 155 M130 48 L130 85 M130 165 L130 202" stroke="#f59e0b" stroke-width="3"/>
                                    <!-- Chip IC Tristar / PMIC Central -->
                                    <rect x="86" y="82" width="88" height="86" rx="10" fill="#0f172a" stroke="#64748b" stroke-width="2.5"/>
                                    <!-- Pines metálicos del IC -->
                                    <g fill="#cbd5e1">
                                        <rect x="76" y="94" width="10" height="6"/><rect x="76" y="112" width="10" height="6"/><rect x="76" y="130" width="10" height="6"/><rect x="76" y="148" width="10" height="6"/>
                                        <rect x="174" y="94" width="10" height="6"/><rect x="174" y="112" width="10" height="6"/><rect x="174" y="130" width="10" height="6"/><rect x="174" y="148" width="10" height="6"/>
                                    </g>
                                    <!-- Cortocircuito rojo parpadeante -->
                                    <circle cx="130" cy="125" r="18" fill="#ef4444" opacity="0.45">
                                        <animate attributeName="r" values="10;28;10" dur="0.65s" repeatCount="indefinite"/>
                                    </circle>
                                    <text x="130" y="129" fill="#fca5a5" font-size="10" font-family="monospace" font-weight="900" text-anchor="middle">IC FAULT</text>
                                </g>

                                <!-- COMPÁS 2: CAUTÍN DE MICRO-SOLDADURA + CHISPAS LÁSER REPARANDO -->
                                <g class="actor-beat-2">
                                    <g>
                                        <animateTransform attributeName="transform" type="translate" values="0,0; -8,6; 6,-4; 0,0" dur="1.1s" repeatCount="indefinite"/>
                                        <polygon points="134,122 152,96 218,30 232,44 166,110" fill="#94a3b8" stroke="#f8fafc" stroke-width="1.5"/>
                                        <polygon points="130,126 138,114 146,122" fill="#facc15"/>
                                    </g>
                                    <!-- Chispas de estaño y calor -->
                                    <circle cx="130" cy="125" r="5" fill="#fef08a">
                                        <animate attributeName="r" values="3;12;3" dur="0.25s" repeatCount="indefinite"/>
                                    </circle>
                                </g>

                                <!-- COMPÁS 3: PULSO DE ENERGÍA VERDE RESTAURADO AL 100% -->
                                <g class="actor-beat-3">
                                    <circle r="5" fill="#4ade80">
                                        <animateMotion path="M28 90 L130 90 L130 155 L232 155" dur="0.8s" repeatCount="indefinite"/>
                                    </circle>
                                    <rect x="62" y="210" width="136" height="26" rx="8" fill="#052e16" stroke="#22c55e" stroke-width="2"/>
                                    <text x="130" y="227" fill="#4ade80" font-size="10" font-weight="900" text-anchor="middle">🔬 MICRO-SOLDADURA OK</text>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-black/85 border border-emerald-400 text-emerald-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl">
                                🛠️ ${scene.card1} • ${scene.card2}
                            </div>
                        </div>
                    `;

                case 'internet_submarine_cables':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 spring-pop drop-shadow-2xl" viewBox="0 0 260 265">
                                <defs>
                                    <linearGradient id="armorGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#94a3b8"/>
                                        <stop offset="50%" stop-color="#334155"/>
                                        <stop offset="100%" stop-color="#0f172a"/>
                                    </linearGradient>
                                </defs>

                                <!-- TOP WAVING OCEAN SURFACE LINE + BOAT -->
                                <path d="M5 32 Q65 18 130 32 T255 32" fill="none" stroke="#7dd3fc" stroke-width="4">
                                    <animate attributeName="d" values="M5 32 Q65 18 130 32 T255 32; M5 32 Q65 44 130 32 T255 32; M5 32 Q65 18 130 32 T255 32" dur="2.0s" repeatCount="indefinite"/>
                                </path>
                                <text x="130" y="18" fill="#bae6fd" font-size="9" font-weight="900" text-anchor="middle" font-family="sans-serif">🌊 OCÉANO ATLÁNTICO (4,000m PROFUNDIDAD)</text>

                                <!-- RISING AIR BUBBLES -->
                                <circle cx="45" cy="180" r="4.5" fill="none" stroke="#bae6fd" stroke-width="1.5">
                                    <animate attributeName="cy" from="190" to="38" dur="2.2s" repeatCount="indefinite"/>
                                </circle>
                                <circle cx="135" cy="170" r="3.5" fill="#7dd3fc" opacity="0.6">
                                    <animate attributeName="cy" from="185" to="38" dur="1.7s" repeatCount="indefinite"/>
                                </circle>
                                <circle cx="215" cy="185" r="5" fill="none" stroke="#bae6fd" stroke-width="1.5">
                                    <animate attributeName="cy" from="195" to="38" dur="2.6s" repeatCount="indefinite"/>
                                </circle>

                                <!-- ANIMATED SWIMMING SHARK TRYING TO BITE THE CABLE -->
                                <g>
                                    <animateTransform attributeName="transform" type="translate" values="-38,0; 38,0; -38,0" dur="3.4s" repeatCount="indefinite"/>
                                    <g transform="translate(135, 95)">
                                        <!-- Shark Body -->
                                        <path d="M-45 0 Q-10 -22 35 -4 L58 -22 L50 0 L58 18 L35 6 Q-10 20 -45 0 Z" fill="#475569" stroke="#94a3b8" stroke-width="1.5"/>
                                        <!-- Shark Belly -->
                                        <path d="M-35 4 Q0 16 30 5 Q0 8 -35 4 Z" fill="#e2e8f0"/>
                                        <!-- Dorsal Fin -->
                                        <path d="M-5 -14 L8 -36 L20 -11 Z" fill="#334155"/>
                                        <!-- Angry Eye -->
                                        <circle cx="-26" cy="-4" r="3" fill="#ef4444"/>
                                        <line x1="-31" y1="-9" x2="-21" y2="-6" stroke="#0f172a" stroke-width="2"/>
                                        <!-- Sharp Teeth Jaw -->
                                        <polyline points="-38,4 -34,9 -30,4 -26,9 -22,4 -18,9 -14,4" fill="none" stroke="#ffffff" stroke-width="2"/>
                                    </g>
                                </g>

                                <!-- DEEP OCEAN SEABED FLOOR -->
                                <path d="M5 198 Q75 182 140 198 T255 192 L255 245 L5 245 Z" fill="#090d16" stroke="#1e293b" stroke-width="2"/>

                                <!-- GIANT ARMORED SUBMARINE FIBER OPTIC CABLE ACROSS SEABED -->
                                <!-- Left & Right Steel Armor Jacket -->
                                <path d="M5 185 Q60 172 95 180" stroke="url(#armorGrad)" stroke-width="24" stroke-linecap="round" fill="none"/>
                                <path d="M165 180 Q205 188 255 175" stroke="url(#armorGrad)" stroke-width="24" stroke-linecap="round" fill="none"/>
                                <!-- Exposed Inner Glass Fiber Core in Center Cutaway -->
                                <path d="M85 180 L175 180" stroke="#0284c7" stroke-width="16" stroke-linecap="round"/>
                                <!-- High-Speed Laser Beams Shooting Through Cable -->
                                <path d="M5 185 Q60 172 95 180 L165 180 Q205 188 255 175" stroke="#38bdf8" stroke-width="6" fill="none"/>
                                <path d="M5 185 Q60 172 95 180 L165 180 Q205 188 255 175" stroke="#facc15" stroke-width="4" stroke-dasharray="14,18" fill="none">
                                    <animate attributeName="stroke-dashoffset" from="128" to="0" dur="0.4s" repeatCount="indefinite"/>
                                </path>
                                <!-- Glowing Laser Data Orbs Racing Along Cable -->
                                <circle r="6" fill="#ffffff" stroke="#facc15" stroke-width="3">
                                    <animateMotion path="M5 185 Q60 172 95 180 L165 180 Q205 188 255 175" dur="0.85s" repeatCount="indefinite"/>
                                </circle>

                                <!-- Sparks Flying Where Shark Bites Armor -->
                                <g transform="translate(130, 165)">
                                    <polygon points="0,-12 4,-3 14,-4 6,2 9,11 0,5 -9,11 -6,2 -14,-4 -4,-3" fill="#facc15">
                                        <animate attributeName="opacity" values="1;0.1;1" dur="0.35s" repeatCount="indefinite"/>
                                        <animateTransform attributeName="transform" type="scale" values="0.7;1.3;0.7" dur="0.35s" repeatCount="indefinite"/>
                                    </polygon>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-black/85 border border-sky-400 text-sky-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5">
                                <span>🌊</span> ${scene.card1} • ${scene.card2}
                            </div>
                        </div>
                    `;

                case 'airplane_aerodynamics':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 spring-pop drop-shadow-2xl" viewBox="0 0 260 265">
                                <defs>
                                    <linearGradient id="jetBody" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#ffffff"/>
                                        <stop offset="65%" stop-color="#e2e8f0"/>
                                        <stop offset="100%" stop-color="#64748b"/>
                                    </linearGradient>
                                    <linearGradient id="jetWing" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stop-color="#38bdf8"/>
                                        <stop offset="100%" stop-color="#1d4ed8"/>
                                    </linearGradient>
                                </defs>

                                <!-- FAST MOVING CLOUDS RUSHING PAST THE AIRPLANE -->
                                <g fill="#ffffff" opacity="0.65">
                                    <ellipse cx="40" cy="60" rx="28" ry="11"/>
                                    <ellipse cx="55" cy="55" rx="18" ry="13"/>
                                    <animateTransform attributeName="transform" type="translate" from="-80 0" to="310 0" dur="1.3s" repeatCount="indefinite"/>
                                </g>
                                <g fill="#e0f2fe" opacity="0.5">
                                    <ellipse cx="30" cy="215" rx="34" ry="12"/>
                                    <ellipse cx="52" cy="210" rx="22" ry="14"/>
                                    <animateTransform attributeName="transform" type="translate" from="-90 0" to="320 0" dur="1.0s" repeatCount="indefinite"/>
                                </g>

                                <!-- HIGH-SPEED BERNOULLI AIRFLOW LINES RACING OVER & UNDER THE JET -->
                                <path d="M10 115 Q115 55 245 105" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-dasharray="14,10">
                                    <animate attributeName="stroke-dashoffset" from="-96" to="0" dur="0.4s" repeatCount="indefinite"/>
                                </path>
                                <path d="M10 170 Q125 175 245 165" fill="none" stroke="#f97316" stroke-width="3.5" stroke-dasharray="10,10">
                                    <animate attributeName="stroke-dashoffset" from="-80" to="0" dur="0.75s" repeatCount="indefinite"/>
                                </path>

                                <!-- COMPLETE 3D COMMERCIAL JET AIRLINER SOARING & BOBBING IN FLIGHT -->
                                <g>
                                    <animateTransform attributeName="transform" type="translate" values="0,-9; 0,9; 0,-9" dur="1.8s" repeatCount="indefinite"/>
                                    <g transform="rotate(-8 130 135)">
                                        <!-- Jet Exhaust Roaring Flames (Behind Turbine) -->
                                        <polygon points="155,152 215,144 205,156 225,162 155,164" fill="#f97316">
                                            <animateTransform attributeName="transform" type="scale" values="1,1; 1.18,0.9; 1,1" dur="0.18s" repeatCount="indefinite"/>
                                        </polygon>
                                        <polygon points="155,155 195,150 190,160 155,161" fill="#38bdf8"/>

                                        <!-- Back Wing -->
                                        <polygon points="105,125 165,82 185,82 140,125" fill="#1e40af"/>
                                        <!-- Tail Vertical Stabilizer Fin -->
                                        <polygon points="195,122 232,72 248,72 228,128" fill="#2563eb" stroke="#60a5fa" stroke-width="1.5"/>
                                        <!-- Main Airplane Fuselage (Body) -->
                                        <path d="M22 138 C22 118 55 112 95 112 L215 116 C235 116 245 126 240 136 C235 144 210 148 185 148 L65 148 C35 148 22 144 22 138 Z" fill="url(#jetBody)" stroke="#3b82f6" stroke-width="2"/>
                                        <!-- Cockpit Blue Glass Windshield -->
                                        <path d="M32 130 C38 120 55 118 65 118 L60 130 Z" fill="#0284c7" stroke="#ffffff" stroke-width="1"/>
                                        <!-- Passenger Windows Row -->
                                        <circle cx="85" cy="128" r="3.5" fill="#0ea5e9"/>
                                        <circle cx="100" cy="128" r="3.5" fill="#0ea5e9"/>
                                        <circle cx="115" cy="128" r="3.5" fill="#facc15"/>
                                        <circle cx="130" cy="128" r="3.5" fill="#0ea5e9"/>
                                        <circle cx="145" cy="128" r="3.5" fill="#0ea5e9"/>
                                        <circle cx="160" cy="128" r="3.5" fill="#0ea5e9"/>
                                        <circle cx="175" cy="128" r="3.5" fill="#0ea5e9"/>

                                        <!-- Swept Front Aerodynamic Wing (Curved Bernoulli Profile) -->
                                        <path d="M90 136 C115 130 155 132 195 172 L165 176 L105 144 Z" fill="url(#jetWing)" stroke="#93c5fd" stroke-width="2"/>

                                        <!-- Under-Wing Giant Turbofan Engine -->
                                        <rect x="115" y="146" width="42" height="20" rx="8" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
                                        <ellipse cx="115" cy="156" rx="5" ry="9" fill="#0f172a"/>
                                        <!-- Spinning Turbine Fan Inside Engine -->
                                        <line x1="115" y1="148" x2="115" y2="164" stroke="#38bdf8" stroke-width="2">
                                            <animate attributeName="opacity" values="1;0.2;1" dur="0.12s" repeatCount="indefinite"/>
                                        </line>
                                    </g>
                                </g>

                                <!-- GIANT GREEN LIFT ARROWS PUSHING THE AIRPLANE UPWARDS -->
                                <g>
                                    <animateTransform attributeName="transform" type="translate" values="0,12; 0,-10; 0,12" dur="0.95s" repeatCount="indefinite"/>
                                    <path d="M85 215 L85 172" stroke="#22c55e" stroke-width="6" stroke-linecap="round"/>
                                    <polygon points="85,158 75,175 95,175" fill="#22c55e"/>
                                    <path d="M155 215 L155 172" stroke="#22c55e" stroke-width="6" stroke-linecap="round"/>
                                    <polygon points="155,158 145,175 165,175" fill="#22c55e"/>
                                </g>
                                <text x="130" y="38" fill="#fde047" font-size="11" font-weight="900" text-anchor="middle" font-family="sans-serif">✈️ 400 TONELADAS VOLANDO A 900 KM/H</text>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-black/85 border border-emerald-400 text-emerald-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5">
                                <span>✈️</span> ${scene.card1} • ${scene.card2}
                            </div>
                        </div>
                    `;

                case 'clock_time_warp':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 spring-pop drop-shadow-2xl" viewBox="0 0 260 265">
                                <defs>
                                    <radialGradient id="warpVortex" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stop-color="#facc15"/>
                                        <stop offset="45%" stop-color="#ec4899"/>
                                        <stop offset="100%" stop-color="#312e81"/>
                                    </radialGradient>
                                </defs>

                                <!-- SPINNING OUTER TIME VORTEX SPIRAL -->
                                <g>
                                    <animateTransform attributeName="transform" type="rotate" from="0 130 130" to="360 130 130" dur="6s" repeatCount="indefinite"/>
                                    <circle cx="130" cy="130" r="96" fill="none" stroke="#818cf8" stroke-width="2.5" stroke-dasharray="16,10" opacity="0.5"/>
                                    <circle cx="130" cy="130" r="82" fill="none" stroke="#f43f5e" stroke-width="3" stroke-dasharray="22,14" opacity="0.7"/>
                                </g>

                                <!-- SPINNING MECHANICAL GEARS -->
                                <g>
                                    <animateTransform attributeName="transform" type="rotate" from="360 62 72" to="0 62 72" dur="3.5s" repeatCount="indefinite"/>
                                    <circle cx="62" cy="72" r="22" fill="#1e293b" stroke="#facc15" stroke-width="3"/>
                                    <rect x="58" y="44" width="8" height="56" rx="2" fill="#facc15"/>
                                    <rect x="34" y="68" width="56" height="8" rx="2" fill="#facc15"/>
                                </g>

                                <!-- FLYING CALENDAR PAGES TEARING OFF INTO THE WIND -->
                                <g>
                                    <animateTransform attributeName="transform" type="translate" values="0,0; 68,-55" dur="1.1s" repeatCount="indefinite"/>
                                    <animate attributeName="opacity" values="1;0" dur="1.1s" repeatCount="indefinite"/>
                                    <rect x="155" y="70" width="38" height="44" rx="6" fill="#ffffff" stroke="#ef4444" stroke-width="2" transform="rotate(15 174 92)"/>
                                    <rect x="155" y="70" width="38" height="12" rx="4" fill="#ef4444" transform="rotate(15 174 92)"/>
                                    <text x="172" y="102" fill="#0f172a" font-size="11" font-weight="900" text-anchor="middle">2026</text>
                                </g>

                                <!-- MAIN CLOCK DIAL -->
                                <circle cx="130" cy="130" r="66" fill="url(#warpVortex)" stroke="#fde047" stroke-width="4"/>
                                <circle cx="130" cy="130" r="56" fill="#0f172a" opacity="0.82"/>
                                <!-- Clock Numbers -->
                                <text x="130" y="88" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">12</text>
                                <text x="176" y="134" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">3</text>
                                <text x="130" y="180" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">6</text>
                                <text x="84" y="134" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">9</text>

                                <!-- FAST SPINNING HOUR & MINUTE HANDS -->
                                <line x1="130" y1="130" x2="130" y2="95" stroke="#38bdf8" stroke-width="5" stroke-linecap="round">
                                    <animateTransform attributeName="transform" type="rotate" from="0 130 130" to="360 130 130" dur="3.0s" repeatCount="indefinite"/>
                                </line>
                                <line x1="130" y1="130" x2="130" y2="80" stroke="#facc15" stroke-width="3.5" stroke-linecap="round">
                                    <animateTransform attributeName="transform" type="rotate" from="0 130 130" to="360 130 130" dur="0.55s" repeatCount="indefinite"/>
                                </line>
                                <circle cx="130" cy="130" r="6" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-black/85 border border-amber-400 text-amber-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5">
                                <span>⏳</span> ${scene.card1} • ${scene.card2}
                            </div>
                        </div>
                    `;

                case 'gold_wealth_pyramid':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 280 270">
                                <defs>
                                    <linearGradient id="isoBuildingFront" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#38bdf8"/>
                                        <stop offset="100%" stop-color="#0369a1"/>
                                    </linearGradient>
                                    <linearGradient id="isoBuildingSide" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stop-color="#0284c7"/>
                                        <stop offset="100%" stop-color="#0f172a"/>
                                    </linearGradient>
                                    <linearGradient id="gold3DTop" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stop-color="#fef08a"/>
                                        <stop offset="50%" stop-color="#facc15"/>
                                        <stop offset="100%" stop-color="#ca8a04"/>
                                    </linearGradient>
                                    <filter id="neonGreenGlow" x="-30%" y="-30%" width="160%" height="160%">
                                        <feGaussianBlur stdDeviation="4" result="blur"/>
                                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                    </filter>
                                </defs>

                                <!-- COMPÁS 1: CÁPSULA DE BANCO PASIVO QUEMÁNDOSE POR INFLACIÓN -->
                                <g class="actor-beat-1" transform="translate(14, 108)">
                                    <rect x="0" y="18" width="96" height="82" rx="14" fill="#090d16" fill-opacity="0.88" stroke="#ef4444" stroke-width="2"/>
                                    <!-- Billete flotando y temblando por el fuego -->
                                    <g>
                                        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-4; 0,2; 0,0" dur="0.55s" repeatCount="indefinite"/>
                                        <rect x="14" y="34" width="68" height="36" rx="6" fill="#14532d" stroke="#4ade80" stroke-width="2"/>
                                        <circle cx="48" cy="52" r="10" fill="#166534"/>
                                        <text x="48" y="56" fill="#bbf7d0" font-size="12" font-weight="900" text-anchor="middle" font-family="monospace">$100</text>
                                    </g>
                                    <!-- Fuego multicapa vivo consumiendo el billete -->
                                    <g transform="translate(48, 36)">
                                        <path d="M-26,4 Q-16,-26 -4,-4 Q8,-34 18,-6 Q28,-22 26,6 Z" fill="#ef4444" opacity="0.9">
                                            <animateTransform attributeName="transform" type="scale" values="1,1; 1.12,1.28; 0.94,0.92; 1,1" dur="0.32s" repeatCount="indefinite"/>
                                        </path>
                                        <path d="M-16,6 Q-6,-16 4,0 Q14,-18 18,6 Z" fill="#f97316">
                                            <animateTransform attributeName="transform" type="scale" values="1,1; 0.9,1.35; 1.1,0.9; 1,1" dur="0.24s" repeatCount="indefinite"/>
                                        </path>
                                        <path d="M-8,6 Q0,-10 8,6 Z" fill="#fef08a">
                                            <animateTransform attributeName="transform" type="scale" values="1,1; 1.2,1.4; 1,1" dur="0.18s" repeatCount="indefinite"/>
                                        </path>
                                    </g>
                                    <!-- Píldora legible sin superposición -->
                                    <rect x="8" y="78" width="80" height="16" rx="5" fill="#450a0a" stroke="#f87171" stroke-width="1"/>
                                    <text x="48" y="89" fill="#fecaca" font-size="8.5" font-weight="900" text-anchor="middle">🔥 INFLACIÓN -85%</text>
                                </g>

                                <!-- COMPÁS 2: TORRE ISOMÉTRICA 2.5D DE ACTIVOS + LINGOTES 3D -->
                                <g class="actor-beat-2" transform="translate(132, 46)">
                                    <g class="svg-float-3d">
                                        <!-- Techo Isométrico -->
                                        <polygon points="64,12 104,28 64,44 24,28" fill="#7dd3fc" stroke="#bae6fd" stroke-width="1.5"/>
                                        <!-- Cara Izquierda Iluminada -->
                                        <polygon points="24,28 64,44 64,148 24,132" fill="url(#isoBuildingFront)" stroke="#38bdf8" stroke-width="1.5"/>
                                        <!-- Cara Derecha Sombreada -->
                                        <polygon points="64,44 104,28 104,132 64,148" fill="url(#isoBuildingSide)" stroke="#0284c7" stroke-width="1.5"/>
                                        <!-- Ventanas encendiéndose secuencialmente -->
                                        <g fill="#fef08a">
                                            <polygon points="32,44 54,53 54,65 32,56"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" repeatCount="indefinite"/></polygon>
                                            <polygon points="32,70 54,79 54,91 32,82"><animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite"/></polygon>
                                            <polygon points="32,96 54,105 54,117 32,108"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.1s" repeatCount="indefinite"/></polygon>
                                        </g>
                                        <!-- Base de Lingotes de Oro 3D -->
                                        <g transform="translate(4, 128)">
                                            <polygon points="8,22 20,8 62,8 50,22" fill="url(#gold3DTop)" stroke="#fef08a" stroke-width="1"/>
                                            <polygon points="8,22 50,22 50,32 8,32" fill="#eab308" stroke="#a16207" stroke-width="1"/>
                                            <polygon points="56,22 68,8 110,8 98,22" fill="url(#gold3DTop)" stroke="#fef08a" stroke-width="1"/>
                                            <polygon points="56,22 98,22 98,32 56,32" fill="#eab308" stroke="#a16207" stroke-width="1"/>
                                            <polygon points="32,8 44,-6 86,-6 74,8" fill="url(#gold3DTop)" stroke="#ffffff" stroke-width="1.5"/>
                                            <polygon points="32,8 74,8 74,18 32,18" fill="#f59e0b" stroke="#a16207" stroke-width="1"/>
                                        </g>
                                    </g>
                                </g>

                                <!-- COMPÁS 3: CURVA EXPONENCIAL EN VIVO + FLUJO DE MONEDAS -->
                                <g class="actor-beat-3">
                                    <path id="wealthCurvePath" d="M32 212 C105 208 155 155 242 36" fill="none" stroke="#22c55e" stroke-width="6" stroke-linecap="round" filter="url(#neonGreenGlow)" stroke-dasharray="320" stroke-dashoffset="320">
                                        <animate attributeName="stroke-dashoffset" values="320;0;0" keyTimes="0;0.55;1" dur="2.2s" repeatCount="indefinite"/>
                                    </path>
                                    <!-- Punta de flecha viajando por la curva -->
                                    <polygon points="246,28 226,38 242,52" fill="#4ade80" filter="url(#neonGreenGlow)">
                                        <animateTransform attributeName="transform" type="scale" values="0.85;1.2;0.85" dur="0.7s" repeatCount="indefinite"/>
                                    </polygon>
                                    <!-- Monedas viajando por el riel de riqueza -->
                                    <g>
                                        <circle r="11" fill="#facc15" stroke="#ffffff" stroke-width="2"/>
                                        <text x="0" y="4" fill="#713f12" font-size="11" font-weight="900" text-anchor="middle">$</text>
                                        <animateMotion path="M32 212 C105 208 155 155 242 36" dur="1.35s" repeatCount="indefinite"/>
                                    </g>
                                    <g>
                                        <circle r="9" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>
                                        <text x="0" y="3.5" fill="#713f12" font-size="9" font-weight="900" text-anchor="middle">$</text>
                                        <animateMotion path="M32 212 C105 208 155 155 242 36" dur="1.35s" begin="0.65s" repeatCount="indefinite"/>
                                    </g>
                                    <!-- Badge de retorno exponencial -->
                                    <rect x="148" y="14" width="112" height="24" rx="8" fill="#052e16" stroke="#4ade80" stroke-width="1.5"/>
                                    <text x="204" y="30" fill="#4ade80" font-size="10" font-weight="900" text-anchor="middle">📈 +340% FLUJO REAL</text>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-black/85 border border-amber-400 text-amber-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5">
                                <span>💰</span> ${scene.card1} • ${scene.card2}
                            </div>
                        </div>
                    `;

                case 'glucose_stomach_digest':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 spring-pop drop-shadow-2xl" viewBox="0 0 260 265">
                                <!-- HUMAN SILHOUETTE & SLEEPY HEAD AT TOP -->
                                <g transform="translate(130, 58)">
                                    <circle cx="0" cy="0" r="32" fill="#e08b6b" stroke="#9a3412" stroke-width="2"/>
                                    <!-- Drooping Sleepy Eyelids Blinking Shut -->
                                    <path d="M-18 -4 Q-11 4 -4 -4" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
                                    <path d="M4 -4 Q11 4 18 -4" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
                                    <!-- Yawning Mouth Opening & Closing -->
                                    <ellipse cx="0" cy="12" rx="8" ry="6" fill="#7f1d1d">
                                        <animate attributeName="ry" values="3;9;3" dur="1.8s" repeatCount="indefinite"/>
                                    </ellipse>
                                </g>

                                <!-- FLOATING Zzz SLEEP LETTERS RISING FROM HEAD -->
                                <g>
                                    <text x="172" y="55" fill="#c084fc" font-size="22" font-weight="900">Z</text>
                                    <text x="192" y="38" fill="#e9d5ff" font-size="16" font-weight="900">z</text>
                                    <text x="206" y="24" fill="#f3e8ff" font-size="12" font-weight="900">z</text>
                                    <animateTransform attributeName="transform" type="translate" values="0,8; 14,-18; 0,8" dur="1.8s" repeatCount="indefinite"/>
                                </g>

                                <!-- ESOPHAGUS TUBE WITH FOOD DROPPING DOWN -->
                                <line x1="130" y1="90" x2="130" y2="145" stroke="#fda4af" stroke-width="10" stroke-linecap="round"/>
                                <circle cx="130" cy="95" r="5" fill="#facc15">
                                    <animate attributeName="cy" from="92" to="152" dur="0.85s" repeatCount="indefinite"/>
                                </circle>

                                <!-- CHURNING ANIMATED STOMACH IN CENTER -->
                                <g>
                                    <animateTransform attributeName="transform" type="scale" values="1,1; 1.08,0.93; 1,1" additive="sum" dur="1.1s" repeatCount="indefinite"/>
                                    <path d="M105 130 C75 130 62 155 68 188 C75 225 128 240 165 220 C190 205 190 172 170 155 C155 142 140 148 135 132 Z" fill="#e11d48" stroke="#fda4af" stroke-width="3"/>
                                    <!-- Sloshing Yellow Gastric Acid Wave Inside Stomach -->
                                    <path d="M78 190 Q120 175 172 190 Q165 222 125 225 Q85 222 78 190 Z" fill="#facc15" opacity="0.75">
                                        <animate attributeName="d" values="M78 190 Q120 175 172 190 Q165 222 125 225 Q85 222 78 190 Z; M78 190 Q120 205 172 190 Q165 222 125 225 Q85 222 78 190 Z; M78 190 Q120 175 172 190 Q165 222 125 225 Q85 222 78 190 Z" dur="1.1s" repeatCount="indefinite"/>
                                    </path>
                                </g>

                                <!-- GLUCOSE & TRYPTOPHAN MOLECULES SHOOTING UP TO BRAIN -->
                                <path id="bloodToBrain" d="M175 180 Q215 125 162 55" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,6"/>
                                <circle r="6" fill="#a855f7" stroke="#ffffff" stroke-width="1.5">
                                    <animateMotion path="M175 180 Q215 125 162 55" dur="1.1s" repeatCount="indefinite"/>
                                </circle>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-black/85 border border-rose-400 text-rose-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5">
                                <span>🥱</span> ${scene.card1} • ${scene.card2}
                            </div>
                        </div>
                    `;

                case 'neural_matrix_math':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 spring-pop drop-shadow-2xl" viewBox="0 0 260 265">
                                <!-- HOLOGRAPHIC MATRIX GRID BACKDROP -->
                                <rect x="20" y="25" width="220" height="165" rx="16" fill="#090d18" stroke="#38bdf8" stroke-width="2.5"/>

                                <!-- LASER SCANBAR SWEEPING ACROSS NUMBERS -->
                                <rect x="24" y="35" width="212" height="14" fill="#38bdf8" opacity="0.28">
                                    <animate attributeName="y" values="32;168;32" dur="1.6s" repeatCount="indefinite"/>
                                </rect>

                                <!-- NEURAL NETWORK AXONS & MOVING SYNAPTIC PULSES -->
                                <path id="axon1" d="M55 65 L130 95 L205 65" fill="none" stroke="#334155" stroke-width="2.5"/>
                                <path id="axon2" d="M55 110 L130 95 L205 110" fill="none" stroke="#334155" stroke-width="2.5"/>
                                <path id="axon3" d="M55 150 L130 135 L205 150" fill="none" stroke="#334155" stroke-width="2.5"/>

                                <!-- Electric Synaptic Orbs Racing Through Network -->
                                <circle r="5" fill="#facc15">
                                    <animateMotion path="M55 65 L130 95 L205 65" dur="0.75s" repeatCount="indefinite"/>
                                </circle>
                                <circle r="5" fill="#38bdf8">
                                    <animateMotion path="M55 110 L130 95 L205 110" dur="0.75s" begin="0.25s" repeatCount="indefinite"/>
                                </circle>
                                <circle r="5" fill="#22c55e">
                                    <animateMotion path="M55 150 L130 135 L205 150" dur="0.75s" begin="0.5s" repeatCount="indefinite"/>
                                </circle>

                                <!-- Input Layer Nodes -->
                                <circle cx="55" cy="65" r="12" fill="#0284c7" stroke="#7dd3fc" stroke-width="2"/>
                                <text x="55" y="69" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">0.89</text>
                                <circle cx="55" cy="110" r="12" fill="#0284c7" stroke="#7dd3fc" stroke-width="2"/>
                                <text x="55" y="114" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">-0.4</text>
                                <circle cx="55" cy="150" r="12" fill="#0284c7" stroke="#7dd3fc" stroke-width="2"/>
                                <text x="55" y="154" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">0.99</text>

                                <!-- Central Spinning Matrix Core -->
                                <g>
                                    <animateTransform attributeName="transform" type="rotate" from="0 130 110" to="360 130 110" dur="4s" repeatCount="indefinite"/>
                                    <polygon points="130,78 158,94 158,126 130,142 102,126 102,94" fill="#7c3aed" stroke="#facc15" stroke-width="2.5"/>
                                </g>
                                <text x="130" y="114" fill="#ffffff" font-size="10" font-weight="900" text-anchor="middle" font-family="monospace">W×X</text>

                                <!-- Output Token Nodes -->
                                <circle cx="205" cy="65" r="12" fill="#16a34a" stroke="#86efac" stroke-width="2"/>
                                <circle cx="205" cy="110" r="12" fill="#16a34a" stroke="#86efac" stroke-width="2"/>
                                <circle cx="205" cy="150" r="12" fill="#16a34a" stroke="#86efac" stroke-width="2"/>

                                <!-- PROBABILITY BAR FILLING UP IN REAL TIME -->
                                <rect x="30" y="202" width="200" height="22" rx="11" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
                                <rect x="32" y="204" width="175" height="18" rx="9" fill="#22c55e">
                                    <animate attributeName="width" values="40;185;40" dur="2.0s" repeatCount="indefinite"/>
                                </rect>
                                <text x="130" y="217" fill="#ffffff" font-size="9.5" font-weight="900" text-anchor="middle">PREDICCIÓN DE TOKEN: 99.2%</text>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-black/85 border border-cyan-400 text-cyan-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5">
                                <span>🤖</span> ${scene.card1} • ${scene.card2}
                            </div>
                        </div>
                    `;

                case 'video_timeline_director':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 spring-pop drop-shadow-2xl" viewBox="0 0 260 265">
                                <!-- HOLLYWOOD CLAPPERBOARD SNAPPING SHUT -->
                                <g transform="translate(45, 22)">
                                    <rect x="0" y="24" width="170" height="68" rx="10" fill="#0f172a" stroke="#facc15" stroke-width="2.5"/>
                                    <!-- Animated Clapper Stick Snapping -->
                                    <g>
                                        <animateTransform attributeName="transform" type="rotate" values="-22 0 24; 0 0 24; -22 0 24" dur="1.0s" repeatCount="indefinite"/>
                                        <rect x="0" y="4" width="170" height="18" rx="4" fill="#1e293b" stroke="#ffffff" stroke-width="2"/>
                                        <polygon points="15,4 32,4 22,22 5,22" fill="#facc15"/>
                                        <polygon points="50,4 67,4 57,22 40,22" fill="#facc15"/>
                                        <polygon points="85,4 102,4 92,22 75,22" fill="#facc15"/>
                                        <polygon points="120,4 137,4 127,22 110,22" fill="#facc15"/>
                                    </g>
                                    <text x="85" y="52" fill="#22c55e" font-size="12" font-weight="900" text-anchor="middle" font-family="monospace">● REC 1080x1920</text>
                                    <text x="85" y="74" fill="#ffffff" font-size="11" font-weight="900" text-anchor="middle">🔥 2.4M VISTAS</text>
                                </g>

                                <!-- MULTI-TRACK TIMELINE WITH SCRUBBING PLAYHEAD & LIVE AUDIO WAVEFORM -->
                                <g transform="translate(22, 122)">
                                    <rect x="0" y="0" width="216" height="98" rx="12" fill="#090d16" stroke="#38bdf8" stroke-width="2"/>
                                    <!-- Video Clips Track -->
                                    <rect x="12" y="12" width="60" height="18" rx="5" fill="#f59e0b"/>
                                    <rect x="76" y="12" width="75" height="18" rx="5" fill="#3b82f6"/>
                                    <rect x="155" y="12" width="48" height="18" rx="5" fill="#ec4899"/>
                                    <!-- Karaoke Track -->
                                    <rect x="12" y="36" width="192" height="18" rx="5" fill="#065f46" stroke="#10b981" stroke-width="1.5"/>
                                    <text x="108" y="48" fill="#a7f3d0" font-size="9" font-weight="900" text-anchor="middle">KARAOKE SINCRONIZADO IA</text>
                                    <!-- Bouncing Audio Equalizer Waveform Bars -->
                                    <g fill="#38bdf8">
                                        <rect x="24" y="64" width="6" height="22" rx="2"><animate attributeName="height" values="8;24;8" dur="0.35s" repeatCount="indefinite"/></rect>
                                        <rect x="38" y="60" width="6" height="26" rx="2"><animate attributeName="height" values="26;10;26" dur="0.4s" repeatCount="indefinite"/></rect>
                                        <rect x="52" y="62" width="6" height="24" rx="2"><animate attributeName="height" values="12;26;12" dur="0.3s" repeatCount="indefinite"/></rect>
                                        <rect x="66" y="64" width="6" height="22" rx="2"><animate attributeName="height" values="24;8;24" dur="0.45s" repeatCount="indefinite"/></rect>
                                        <rect x="80" y="60" width="6" height="26" rx="2"><animate attributeName="height" values="10;26;10" dur="0.35s" repeatCount="indefinite"/></rect>
                                        <rect x="94" y="62" width="6" height="24" rx="2"><animate attributeName="height" values="26;12;26" dur="0.38s" repeatCount="indefinite"/></rect>
                                        <rect x="108" y="60" width="6" height="26" rx="2"><animate attributeName="height" values="12;26;12" dur="0.32s" repeatCount="indefinite"/></rect>
                                        <rect x="122" y="64" width="6" height="22" rx="2"><animate attributeName="height" values="24;8;24" dur="0.42s" repeatCount="indefinite"/></rect>
                                    </g>
                                    <!-- Animated Red Playhead Scrubbing Across Timeline -->
                                    <g>
                                        <animateTransform attributeName="transform" type="translate" values="15,0; 195,0; 15,0" dur="2.2s" repeatCount="indefinite"/>
                                        <line x1="0" y1="4" x2="0" y2="94" stroke="#ef4444" stroke-width="3"/>
                                        <polygon points="0,10 -7,0 7,0" fill="#ef4444"/>
                                    </g>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-black/85 border border-emerald-400 text-emerald-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5">
                                <span>🎬</span> ${scene.card1} • ${scene.card2}
                            </div>
                        </div>
                    `;

                case 'placebo_pill_spark':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 spring-pop drop-shadow-2xl" viewBox="0 0 260 265">
                                <!-- HUMAN BRAIN & BODY SILHOUETTE RECEIVING HEALING -->
                                <path d="M85 225 C85 175 102 155 130 155 C158 155 175 175 175 225 Z" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>
                                <circle cx="130" cy="122" r="28" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
                                <!-- Glowing Brain Inside Head -->
                                <ellipse cx="130" cy="116" rx="18" ry="13" fill="#ec4899" opacity="0.85">
                                    <animate attributeName="opacity" values="0.5;1;0.5" dur="0.9s" repeatCount="indefinite"/>
                                </ellipse>

                                <!-- GIANT 3D CAPSULE AT TOP OPENING IN MID-AIR -->
                                <g transform="translate(130, 48)">
                                    <!-- Left Half of Capsule Pulling Left -->
                                    <g>
                                        <animateTransform attributeName="transform" type="translate" values="0,0; -16,0; 0,0" dur="1.2s" repeatCount="indefinite"/>
                                        <path d="M-48 -18 L-4 -18 L-4 18 L-48 18 C-58 18 -66 10 -66 0 C-66 -10 -58 -18 -48 -18 Z" fill="#0ea5e9" stroke="#ffffff" stroke-width="2"/>
                                    </g>
                                    <!-- Right Half of Capsule Pulling Right -->
                                    <g>
                                        <animateTransform attributeName="transform" type="translate" values="0,0; 16,0; 0,0" dur="1.2s" repeatCount="indefinite"/>
                                        <path d="M4 -18 L48 -18 C58 -18 66 -10 66 0 C66 10 58 18 48 18 L4 18 Z" fill="#f43f5e" stroke="#ffffff" stroke-width="2"/>
                                    </g>
                                    <!-- Burst Flash Inside Open Capsule -->
                                    <circle cx="0" cy="0" r="14" fill="#fde047">
                                        <animate attributeName="r" values="6;22;6" dur="0.6s" repeatCount="indefinite"/>
                                    </circle>
                                </g>

                                <!-- HEALING ENDORPHIN PARTICLES POURING FROM CAPSULE INTO BRAIN & BODY -->
                                <circle r="5" fill="#22c55e" stroke="#ffffff" stroke-width="1.5">
                                    <animateMotion path="M130 55 L130 185" dur="0.85s" repeatCount="indefinite"/>
                                </circle>
                                <circle r="4.5" fill="#facc15">
                                    <animateMotion path="M122 55 Q105 110 125 185" dur="0.85s" begin="0.3s" repeatCount="indefinite"/>
                                </circle>
                                <circle r="4.5" fill="#38bdf8">
                                    <animateMotion path="M138 55 Q155 110 135 185" dur="0.85s" begin="0.6s" repeatCount="indefinite"/>
                                </circle>

                                <!-- LIVE ECG HEARTBEAT WAVE ACROSS CHEST -->
                                <path d="M55 198 L98 198 L108 175 L120 218 L134 168 L146 212 L156 198 L205 198" fill="none" stroke="#22c55e" stroke-width="4" stroke-linecap="round" stroke-dasharray="180,40">
                                    <animate attributeName="stroke-dashoffset" from="220" to="0" dur="1.0s" repeatCount="indefinite"/>
                                </path>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-black/85 border border-pink-400 text-pink-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5">
                                <span>💊</span> ${scene.card1} • ${scene.card2}
                            </div>
                        </div>
                    `;

                case 'actor_door_push':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-2">
                            <svg class="w-64 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 260 260">
                                <defs>
                                    <linearGradient id="pushSuitGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#f97316"/>
                                        <stop offset="100%" stop-color="#b91c1c"/>
                                    </linearGradient>
                                    <linearGradient id="jambGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stop-color="#1e293b"/>
                                        <stop offset="100%" stop-color="#334155"/>
                                    </linearGradient>
                                </defs>
                                <!-- Marcos arquitectónicos de puerta con presión lateral -->
                                <rect x="18" y="24" width="20" height="205" rx="6" fill="url(#jambGrad)" stroke="#475569" stroke-width="2"/>
                                <rect x="222" y="24" width="20" height="205" rx="6" fill="url(#jambGrad)" stroke="#475569" stroke-width="2"/>
                                <!-- Ondas de presión muscular izquierda/derecha -->
                                <g>
                                    <circle cx="42" cy="132" r="18" fill="none" stroke="#facc15" stroke-width="3">
                                        <animate attributeName="r" values="8;26;8" dur="0.9s" repeatCount="indefinite"/>
                                        <animate attributeName="opacity" values="0.95;0;0.95" dur="0.9s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle cx="218" cy="132" r="18" fill="none" stroke="#facc15" stroke-width="3">
                                        <animate attributeName="r" values="8;26;8" dur="0.9s" repeatCount="indefinite"/>
                                        <animate attributeName="opacity" values="0.95;0;0.95" dur="0.9s" repeatCount="indefinite"/>
                                    </circle>
                                </g>
                                <!-- Flechas cinéticas de fuerza hacia afuera -->
                                <path d="M76 132 L46 132" stroke="#fde047" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 5"/>
                                <path d="M184 132 L214 132" stroke="#fde047" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 5"/>
                                <!-- Sombra y cuerpo estilizado 2.5D -->
                                <ellipse cx="130" cy="222" rx="44" ry="8" fill="#000000" opacity="0.45"/>
                                <g class="svg-breathe">
                                    <rect x="98" y="102" width="64" height="94" rx="20" fill="url(#pushSuitGrad)" stroke="#fdba74" stroke-width="2"/>
                                    <path d="M116 102 L130 124 L144 102" fill="#f8fafc" opacity="0.9"/>
                                    <rect x="121" y="84" width="18" height="22" rx="7" fill="#eab08c"/>
                                    <!-- Cabeza moderna 2.5D -->
                                    <ellipse cx="130" cy="60" rx="25" ry="28" fill="#f4b896" stroke="#c27857" stroke-width="2"/>
                                    <path d="M104 54 C106 25 154 25 156 54 C144 40 116 40 104 54 Z" fill="#0f172a"/>
                                    <circle cx="120" cy="60" r="3.5" fill="#0f172a"/>
                                    <circle cx="140" cy="60" r="3.5" fill="#0f172a"/>
                                    <path d="M122 75 Q130 71 138 75" stroke="#7c2d12" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                                    <!-- Brazos empujando los marcos -->
                                    <g class="arm-push-left">
                                        <path d="M100 114 L46 128 L52 146 L104 134 Z" fill="#ea580c" stroke="#fed7aa" stroke-width="1.5"/>
                                        <circle cx="46" cy="136" r="10" fill="#f4b896" stroke="#c27857" stroke-width="1.5"/>
                                    </g>
                                    <g class="arm-push-right">
                                        <path d="M160 114 L214 128 L208 146 L156 134 Z" fill="#ea580c" stroke="#fed7aa" stroke-width="1.5"/>
                                        <circle cx="214" cy="136" r="10" fill="#f4b896" stroke="#c27857" stroke-width="1.5"/>
                                    </g>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-slate-950/90 backdrop-blur-md border border-amber-400/70 text-amber-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl">
                                ⚡ ${scene.card1 || 'Presión 30s'} • ${scene.card2 || 'Tensión Máxima'}
                            </div>
                        </div>
                    `;

                case 'actor_arms_floating':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-2">
                            <svg class="w-64 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 260 260">
                                <defs>
                                    <radialGradient id="antigravAura" cx="50%" cy="45%" r="50%">
                                        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.45"/>
                                        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
                                    </radialGradient>
                                    <linearGradient id="levitateSuit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#38bdf8"/>
                                        <stop offset="100%" stop-color="#1d4ed8"/>
                                    </linearGradient>
                                </defs>
                                <circle cx="130" cy="125" r="95" fill="url(#antigravAura)"/>
                                <!-- Flechas de elevación automática -->
                                <g>
                                    <animateTransform attributeName="transform" type="translate" values="0,8; 0,-10; 0,8" dur="1.1s" repeatCount="indefinite"/>
                                    <path d="M46 135 Q42 90 68 58" stroke="#4ade80" stroke-width="4" stroke-dasharray="6 5" fill="none" stroke-linecap="round"/>
                                    <polygon points="68,48 58,64 76,66" fill="#4ade80"/>
                                    <path d="M214 135 Q218 90 192 58" stroke="#4ade80" stroke-width="4" stroke-dasharray="6 5" fill="none" stroke-linecap="round"/>
                                    <polygon points="192,48 184,66 202,64" fill="#4ade80"/>
                                </g>
                                <ellipse cx="130" cy="218" rx="42" ry="8" fill="#000000" opacity="0.45"/>
                                <g class="svg-float-3d">
                                    <rect x="98" y="106" width="64" height="90" rx="20" fill="url(#levitateSuit)" stroke="#bae6fd" stroke-width="2"/>
                                    <rect x="121" y="88" width="18" height="22" rx="7" fill="#eab08c"/>
                                    <ellipse cx="130" cy="64" rx="25" ry="28" fill="#f4b896" stroke="#c27857" stroke-width="2"/>
                                    <path d="M104 58 C106 28 154 28 156 58 C142 42 118 42 104 58 Z" fill="#0f172a"/>
                                    <circle cx="120" cy="64" r="3.8" fill="#0f172a"/>
                                    <circle cx="140" cy="64" r="3.8" fill="#0f172a"/>
                                    <ellipse cx="130" cy="78" rx="6" ry="7" fill="#0f172a"/>
                                    <!-- Brazos elevándose solos en ángulo flotante -->
                                    <g class="arm-rise-left">
                                        <path d="M100 116 L52 78 L62 62 L108 102 Z" fill="#38bdf8" stroke="#e0f2fe" stroke-width="1.5"/>
                                        <circle cx="54" cy="68" r="10" fill="#f4b896" stroke="#c27857" stroke-width="1.5"/>
                                    </g>
                                    <g class="arm-rise-right">
                                        <path d="M160 116 L208 78 L198 62 L152 102 Z" fill="#38bdf8" stroke="#e0f2fe" stroke-width="1.5"/>
                                        <circle cx="206" cy="68" r="10" fill="#f4b896" stroke="#c27857" stroke-width="1.5"/>
                                    </g>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-emerald-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl border border-white/60">
                                🦅 ${scene.card1 || 'Sin Esfuerzo'} • ${scene.card3 || '100% Real'}
                            </div>
                        </div>
                    `;

                case 'actor_salt_ocean':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-2">
                            <svg class="w-64 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 260 250">
                                <defs>
                                    <linearGradient id="glassBody" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stop-color="#f8fafc" stop-opacity="0.9"/>
                                        <stop offset="100%" stop-color="#94a3b8" stop-opacity="0.7"/>
                                    </linearGradient>
                                    <linearGradient id="oceanBasin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#0284c7"/>
                                        <stop offset="100%" stop-color="#0f172a"/>
                                    </linearGradient>
                                </defs>
                                <!-- Ola marina receptora en 2.5D -->
                                <path d="M15 182 Q75 162 130 180 T245 178 L245 228 L15 228 Z" fill="url(#oceanBasin)" stroke="#38bdf8" stroke-width="2.5"/>
                                <path d="M15 182 Q75 162 130 180 T245 178" fill="none" stroke="#bae6fd" stroke-width="3">
                                    <animate attributeName="d" values="M15 182 Q75 162 130 180 T245 178; M15 178 Q75 194 130 176 T245 184; M15 182 Q75 162 130 180 T245 178" dur="2.2s" repeatCount="indefinite"/>
                                </path>
                                <!-- Dispensador 2.5D de minerales cristalinos -->
                                <g transform="translate(128, 42) rotate(28)">
                                    <animateTransform attributeName="transform" type="rotate" values="24 128 42; 34 128 42; 24 128 42" dur="1.4s" repeatCount="indefinite" additive="sum"/>
                                    <rect x="-30" y="0" width="60" height="78" rx="14" fill="url(#glassBody)" stroke="#e2e8f0" stroke-width="2.5"/>
                                    <rect x="-24" y="10" width="12" height="54" rx="6" fill="#ffffff" opacity="0.45"/>
                                    <text x="0" y="42" fill="#0f172a" font-size="14" font-weight="900" text-anchor="middle" font-family="monospace">NaCl</text>
                                    <path d="M-30 72 Q0 92 30 72 Z" fill="#334155" stroke="#94a3b8" stroke-width="1.5"/>
                                </g>
                                <!-- Cristales cúbicos cayendo al mar -->
                                <g class="falling-grain">
                                    <rect x="92" y="114" width="9" height="9" rx="2" fill="#ffffff" transform="rotate(20 96 118)"/>
                                    <rect x="114" y="128" width="11" height="11" rx="2" fill="#e0f2fe" transform="rotate(42 119 133)"/>
                                    <rect x="98" y="146" width="8" height="8" rx="2" fill="#fef08a" transform="rotate(15 102 150)"/>
                                    <rect x="122" y="156" width="10" height="10" rx="2" fill="#ffffff" transform="rotate(35 127 161)"/>
                                </g>
                                <rect x="65" y="192" width="130" height="22" rx="11" fill="#090d16" fill-opacity="0.85" stroke="#38bdf8" stroke-width="1.5"/>
                                <text x="130" y="207" fill="#bae6fd" font-size="10" font-weight="900" text-anchor="middle">💎 3.5% SALINIDAD GLOBAL</text>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-amber-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl border border-white/70">
                                🧂 ${scene.card1 || 'Sodio + Cloro'} ➔ ${scene.card2 || 'Océano Vivo'}
                            </div>
                        </div>
                    `;

                case 'actor_brain_nerves':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 260 250">
                                <defs>
                                    <radialGradient id="brainCoreGlow" cx="50%" cy="45%" r="55%">
                                        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.75"/>
                                        <stop offset="60%" stop-color="#0284c7" stop-opacity="0.25"/>
                                        <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
                                    </radialGradient>
                                    <linearGradient id="cortexGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stop-color="#7dd3fc"/>
                                        <stop offset="50%" stop-color="#0ea5e9"/>
                                        <stop offset="100%" stop-color="#1d4ed8"/>
                                    </linearGradient>
                                </defs>
                                <!-- COMPÁS 1: CEREBRO 2.5D RESPIRANDO CON AURA NEURONAL -->
                                <g class="actor-beat-1">
                                    <circle cx="130" cy="92" r="68" fill="url(#brainCoreGlow)">
                                        <animate attributeName="r" values="58;76;58" dur="1.8s" repeatCount="indefinite"/>
                                    </circle>
                                    <g class="svg-float-3d">
                                        <path d="M82 95 C62 82 64 52 88 42 C102 22 135 22 148 38 C176 36 194 62 180 88 C192 108 172 126 148 122 L104 122 C82 126 68 110 82 95 Z" fill="url(#cortexGrad)" stroke="#e0f2fe" stroke-width="2.5"/>
                                        <!-- Surcos cerebrales iluminados -->
                                        <path d="M96 62 Q125 48 152 64 M92 84 Q130 72 164 86 M106 102 Q130 92 154 104" fill="none" stroke="#bae6fd" stroke-width="2.5" stroke-linecap="round"/>
                                    </g>
                                </g>

                                <!-- COMPÁS 2: IMPULSOS ELÉCTRICOS VIAJANDO POR LOS NERVIOS MOTORES -->
                                <g class="actor-beat-2">
                                    <path id="nerveLeft" d="M130 122 L130 150 L64 202" fill="none" stroke="#facc15" stroke-width="4" stroke-linecap="round" stroke-dasharray="140" stroke-dashoffset="140">
                                        <animate attributeName="stroke-dashoffset" values="140;0;0" dur="1.2s" repeatCount="indefinite"/>
                                    </path>
                                    <path id="nerveRight" d="M130 122 L130 150 L196 202" fill="none" stroke="#facc15" stroke-width="4" stroke-linecap="round" stroke-dasharray="140" stroke-dashoffset="140">
                                        <animate attributeName="stroke-dashoffset" values="140;0;0" dur="1.2s" repeatCount="indefinite"/>
                                    </path>
                                    <circle r="6" fill="#ffffff" stroke="#facc15" stroke-width="2">
                                        <animateMotion path="M130 122 L130 150 L64 202" dur="0.75s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle r="6" fill="#ffffff" stroke="#38bdf8" stroke-width="2">
                                        <animateMotion path="M130 122 L130 150 L196 202" dur="0.75s" begin="0.35s" repeatCount="indefinite"/>
                                    </circle>
                                </g>

                                <!-- COMPÁS 3: NODOS SINÁPTICOS ACTIVADOS AL 100% -->
                                <g class="actor-beat-3">
                                    <circle cx="64" cy="202" r="12" fill="#ef4444" stroke="#ffffff" stroke-width="2">
                                        <animate attributeName="r" values="9;16;9" dur="0.6s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle cx="196" cy="202" r="12" fill="#ef4444" stroke="#ffffff" stroke-width="2">
                                        <animate attributeName="r" values="9;16;9" dur="0.6s" repeatCount="indefinite"/>
                                    </circle>
                                    <rect x="65" y="192" width="130" height="24" rx="8" fill="#090d16" stroke="#38bdf8" stroke-width="1.5"/>
                                    <text x="130" y="208" fill="#7dd3fc" font-size="9.5" font-weight="900" text-anchor="middle">⚡ SINAPSIS AL 200%</text>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-cyan-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-xl">
                                🧠 ${scene.card1 || ''} • ${scene.card3 || ''}
                            </div>
                        </div>
                    `;

                case 'actor_rain_rocks':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-2">
                            <svg class="w-64 h-60 drop-shadow-2xl overflow-visible" viewBox="0 0 260 240">
                                <defs>
                                    <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#64748b"/>
                                        <stop offset="100%" stop-color="#1e293b"/>
                                    </linearGradient>
                                </defs>
                                <!-- Nube de tormenta ácida estilizada -->
                                <path d="M62 72 Q42 72 42 54 Q42 36 66 36 Q78 14 112 18 Q144 10 162 34 Q192 34 192 56 Q192 72 170 72 Z" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
                                <!-- Gotas ácidas animadas + iones de minerales desprendiéndose -->
                                <g class="falling-grain" stroke="#38bdf8" stroke-width="3" stroke-linecap="round">
                                    <line x1="78" y1="78" x2="72" y2="104"/>
                                    <line x1="115" y1="78" x2="109" y2="104"/>
                                    <line x1="152" y1="78" x2="146" y2="104"/>
                                    <circle cx="96" cy="116" r="4" fill="#facc15" stroke="none"/>
                                    <circle cx="132" cy="122" r="4" fill="#fde047" stroke="none"/>
                                </g>
                                <!-- Cordillera mineral con vetas brillantes y río hacia el mar -->
                                <polygon points="34,196 86,120 128,154 166,118 226,196" fill="url(#mountainGrad)" stroke="#94a3b8" stroke-width="2"/>
                                <path d="M126 154 Q142 176 196 196" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" fill="none"/>
                                <circle cx="106" cy="162" r="4" fill="#facc15"/>
                                <circle cx="174" cy="166" r="4" fill="#38bdf8"/>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-sky-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl border border-white/50">
                                🌧️ ${scene.card1 || 'Lluvia Ácida'} ➔ ${scene.card2 || 'Minerales'}
                            </div>
                        </div>
                    `;

                case 'actor_ringlight_lie':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-3">
                            <div class="spring-pop relative w-52 bg-slate-950/90 backdrop-blur-xl rounded-[28px] border-2 border-rose-500/70 shadow-[0_20px_50px_rgba(244,63,94,0.3)] p-4 flex flex-col items-center gap-3">
                                <div class="w-full flex items-center justify-between">
                                    <span class="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center gap-1">
                                        <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> REC
                                    </span>
                                    <span class="text-[9px] font-mono-code font-bold text-slate-400">RING LIGHT PRO</span>
                                </div>
                                <div class="relative w-24 h-24 rounded-full border-[6px] border-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.6)] flex items-center justify-center bg-slate-900">
                                    <div class="spring-pop-1 bg-rose-600 text-white font-black text-sm px-3.5 py-1.5 rounded-xl border-2 border-white shadow-2xl transform -rotate-6 whitespace-nowrap">
                                        ${scene.card1 || '¡MITO!'}
                                    </div>
                                </div>
                                <div class="w-full bg-white text-slate-900 px-3 py-2 rounded-2xl shadow-lg text-center">
                                    <div class="text-[11px] font-black text-slate-900 leading-tight">${scene.card2 || 'Lo que te vendieron'}</div>
                                    <div class="text-[9px] font-mono-code font-bold text-rose-600 uppercase mt-0.5">${scene.card3 || 'DESMENTIDO'}</div>
                                </div>
                            </div>
                        </div>
                    `;

                case 'actor_owner_stressed':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-3">
                            <div class="spring-pop relative w-64 bg-[#0b1120]/95 backdrop-blur-xl border-2 border-rose-500/80 rounded-3xl p-4 shadow-[0_20px_50px_rgba(239,68,68,0.3)]">
                                <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                                    <div class="flex items-center gap-2">
                                        <span class="w-9 h-9 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-xl">😰</span>
                                        <div class="text-left">
                                            <div class="text-[10px] font-black text-rose-400 uppercase nt-stage-text-editable" data-field="card1" contenteditable="true" spellcheck="false">${scene.card1 || 'ALERTA CRÍTICA'}</div>
                                            <div class="text-[9px] text-slate-400 font-mono-code">SISTEMA SATURADO</div>
                                        </div>
                                    </div>
                                    <span class="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black animate-pulse">+99</span>
                                </div>
                                <div class="space-y-2 text-left">
                                    <div class="spring-pop-1 bg-rose-950/70 border border-rose-500/40 px-3 py-2 rounded-xl text-[11px] font-bold text-white flex items-center justify-between gap-2">
                                        <span class="nt-stage-text-editable" data-field="card2" contenteditable="true" spellcheck="false">⚠️ ${scene.card2 || 'Fuga detectada'}</span>
                                        <span class="text-rose-400 font-black">✕</span>
                                    </div>
                                    <div class="spring-pop-2 bg-amber-950/60 border border-amber-500/40 px-3 py-2 rounded-xl text-[11px] font-bold text-white flex items-center justify-between gap-2">
                                        <span class="nt-stage-text-editable" data-field="card3" contenteditable="true" spellcheck="false">⏳ ${scene.card3 || 'Tiempo perdido'}</span>
                                        <span class="text-amber-300 font-black">!</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                case 'nakkio_chat':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-3">
                            <div class="spring-pop w-64 bg-[#0b141a] rounded-3xl border-2 border-emerald-500 shadow-2xl overflow-hidden">
                                <div class="bg-[#202c33] px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800">
                                    <div class="flex items-center gap-2">
                                        <span class="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">🤖</span>
                                        <div>
                                            <div class="text-xs font-extrabold text-white leading-none">Nakkio IA 24/7</div>
                                            <div class="text-[9px] text-emerald-400 font-bold mt-0.5">En línea ahora</div>
                                        </div>
                                    </div>
                                    <span class="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">AUTO</span>
                                </div>
                                <div class="p-3.5 space-y-2 text-left">
                                    <div class="bg-[#202c33] text-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-2xl rounded-tl-sm w-4/5 shadow nt-stage-text-editable" data-field="card1" contenteditable="true" spellcheck="false" title="✏️ Clic para editar">
                                        ${scene.card1 || ''}
                                    </div>
                                    <div class="spring-pop-1 bg-[#005c4b] text-white text-[11px] font-bold px-3 py-1.5 rounded-2xl rounded-tr-sm ml-auto w-5/6 shadow nt-stage-text-editable" data-field="card2" contenteditable="true" spellcheck="false" title="✏️ Clic para editar">
                                        ⚡ ${scene.card2 || ''}
                                    </div>
                                    <div class="spring-pop-2 bg-emerald-400 text-slate-950 font-black text-xs py-1.5 px-3 rounded-xl text-center shadow-lg nt-stage-text-editable" data-field="card3" contenteditable="true" spellcheck="false" title="✏️ Clic para editar">
                                        ✓ ${scene.card3 || ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                case 'posent_terminal':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-3">
                            <div class="spring-pop w-64 bg-slate-900 rounded-3xl border-2 border-cyan-400 shadow-2xl p-4 text-center relative overflow-hidden">
                                <div class="laser-scanner absolute left-0 right-0 h-1 bg-red-500 shadow-[0_0_12px_#ef4444] z-10"></div>
                                <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                                    <span class="text-[10px] font-mono-code font-bold text-cyan-300">POSENTRD.COM</span>
                                    <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black">${scene.card3}</span>
                                </div>
                                <div class="bg-slate-950 rounded-xl p-2.5 border border-slate-800 mb-2">
                                    <div class="text-[10px] text-slate-400 font-bold">CUADRE DE CAJA EXACTO</div>
                                    <div class="text-xl font-black text-emerald-400 font-mono-code mt-0.5">$48,950.00</div>
                                </div>
                                <div class="grid grid-cols-2 gap-1.5 text-[10px] font-black">
                                    <div class="bg-cyan-500/20 text-cyan-300 py-1.5 rounded-lg border border-cyan-500/30">✓ ${scene.card1}</div>
                                    <div class="bg-amber-500/20 text-amber-300 py-1.5 rounded-lg border border-amber-500/30">📦 ${scene.card2}</div>
                                </div>
                            </div>
                        </div>
                    `;

                case 'ntradar_scanner':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <div class="relative flex items-center justify-center">
                                <svg class="w-56 h-56 spring-pop drop-shadow-2xl" viewBox="0 0 240 240">
                                    <circle cx="120" cy="120" r="104" fill="#04120e" stroke="#10b981" stroke-width="3" stroke-opacity="0.6"/>
                                    <circle cx="120" cy="120" r="72" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 4" stroke-opacity="0.5"/>
                                    <circle cx="120" cy="120" r="40" fill="none" stroke="#10b981" stroke-width="1.5" stroke-opacity="0.4"/>
                                    <line x1="16" y1="120" x2="224" y2="120" stroke="#10b981" stroke-opacity="0.3" stroke-width="1"/>
                                    <line x1="120" y1="16" x2="120" y2="224" stroke="#10b981" stroke-opacity="0.3" stroke-width="1"/>
                                    <g class="radar-sweep">
                                        <path d="M120 120 L120 16 A104 104 0 0 1 210 68 Z" fill="url(#radarGrad)"/>
                                        <line x1="120" y1="120" x2="120" y2="16" stroke="#34d399" stroke-width="2.5"/>
                                    </g>
                                    <circle cx="160" cy="74" r="6" fill="#ef4444" class="animate-ping"/>
                                    <circle cx="160" cy="74" r="5" fill="#f87171"/>
                                    <circle cx="80" cy="155" r="5" fill="#34d399"/>
                                    <defs>
                                        <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stop-color="#10b981" stop-opacity="0.6"/>
                                            <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div class="spring-pop-2 absolute -bottom-2 bg-rose-600 text-white font-black px-4 py-1.5 rounded-full shadow-2xl border-2 border-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                                    <span>📡</span> <span>${scene.card2}</span>
                                </div>
                            </div>
                            <div class="spring-pop-3 mt-4 bg-black/60 border border-emerald-400/40 px-4 py-1 rounded-xl text-xs font-extrabold text-emerald-300 font-mono-code">
                                ${scene.card1} • ${scene.card3}
                            </div>
                        </div>
                    `;

                case 'ntdesweb_code':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-3">
                            <div class="spring-pop w-64 bg-[#0d1117] rounded-2xl border-2 border-indigo-500 shadow-2xl overflow-hidden">
                                <div class="bg-[#161b22] px-3 py-2 flex items-center justify-between border-b border-slate-800">
                                    <div class="flex gap-1.5">
                                        <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                        <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    </div>
                                    <span class="text-[10px] font-mono-code font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">${domain}</span>
                                </div>
                                <div class="p-3.5 space-y-2 font-mono-code text-left">
                                    <div class="text-[11px] text-cyan-400 font-bold">${scene.card1}</div>
                                    <div class="h-2 w-3/4 bg-indigo-500/40 rounded"></div>
                                    <div class="h-2 w-1/2 bg-emerald-500/40 rounded"></div>
                                    <div class="spring-pop-2 mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-sans font-black text-xs py-2 px-3 rounded-xl text-center shadow-lg">
                                        🚀 ${scene.card2}
                                    </div>
                                </div>
                            </div>
                            <div class="spring-pop-3 -mt-2.5 bg-amber-400 text-slate-950 font-black px-4 py-1 rounded-xl shadow-xl text-xs transform rotate-2">
                                ⚡ ${scene.card3}
                            </div>
                        </div>
                    `;

                case 'actor_rocket_launch':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <div class="rocket-float relative flex flex-col items-center">
                                <svg class="w-48 h-56 drop-shadow-2xl overflow-visible" viewBox="0 0 180 210">
                                    <defs>
                                        <linearGradient id="rocketHull" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stop-color="#ffffff"/>
                                            <stop offset="55%" stop-color="#e2e8f0"/>
                                            <stop offset="100%" stop-color="#94a3b8"/>
                                        </linearGradient>
                                        <linearGradient id="rocketPlume" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stop-color="#fef08a"/>
                                            <stop offset="45%" stop-color="#f97316"/>
                                            <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
                                        </linearGradient>
                                    </defs>
                                    <!-- Estelas de velocidad laterales -->
                                    <line x1="25" y1="30" x2="25" y2="120" stroke="#38bdf8" stroke-width="2" stroke-dasharray="14 10" opacity="0.5"/>
                                    <line x1="155" y1="45" x2="155" y2="135" stroke="#38bdf8" stroke-width="2" stroke-dasharray="12 12" opacity="0.5"/>
                                    <!-- Flama propulsora -->
                                    <g class="rocket-flame" transform="translate(90, 148)">
                                        <polygon points="0,62 -22,0 22,0" fill="url(#rocketPlume)"/>
                                        <polygon points="0,38 -11,0 11,0" fill="#fef08a"/>
                                    </g>
                                    <!-- Aletas aerodinámicas -->
                                    <path d="M56 112 L26 154 L58 144 Z" fill="#dc2626" stroke="#fca5a5" stroke-width="1.5"/>
                                    <path d="M124 112 L154 154 L122 144 Z" fill="#dc2626" stroke="#fca5a5" stroke-width="1.5"/>
                                    <!-- Fuselaje principal 2.5D -->
                                    <path d="M90 12 C64 52 54 104 54 146 L126 146 C126 104 116 52 90 12 Z" fill="url(#rocketHull)" stroke="#cbd5e1" stroke-width="2"/>
                                    <path d="M90 12 C76 34 70 54 67 68 L113 68 C110 54 104 34 90 12 Z" fill="#ef4444"/>
                                    <circle cx="90" cy="92" r="16" fill="#0369a1" stroke="#38bdf8" stroke-width="3.5"/>
                                    <circle cx="85" cy="87" r="5" fill="#ffffff" opacity="0.85"/>
                                </svg>
                            </div>
                            <div class="spring-pop-2 -mt-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl border border-white/60">
                                🚀 ${scene.card1 || 'Despegue IA'} • ${scene.card3 || '10x Velocidad'}
                            </div>
                        </div>
                    `;

                case 'actor_money_rain':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-2">
                            <div class="relative w-64 h-56 flex items-center justify-center">
                                <div class="falling-bill absolute top-2 left-4 bg-emerald-500 text-slate-950 font-black text-[11px] px-3 py-1 rounded-lg border border-white shadow-xl">+$100</div>
                                <div class="falling-bill absolute top-6 right-4 bg-emerald-400 text-slate-950 font-black text-[11px] px-3 py-1 rounded-lg border border-white shadow-xl" style="animation-delay: 0.55s;">+$500</div>
                                <div class="falling-bill absolute top-14 left-12 bg-amber-400 text-slate-950 font-black text-[11px] px-3 py-1 rounded-lg border border-white shadow-xl" style="animation-delay: 1.1s;">+$1,500</div>
                                <div class="spring-pop relative w-60 bg-[#081512]/95 backdrop-blur-xl border-2 border-emerald-400/80 rounded-3xl p-4 text-center shadow-[0_20px_50px_rgba(16,185,129,0.3)] z-10">
                                    <div class="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl mx-auto mb-2">💰</div>
                                    <div class="text-sm font-black text-emerald-300 font-mono-code">${scene.card1 || 'ACTIVO RENTABLE'}</div>
                                    <div class="text-[11px] font-bold text-white mt-1">${scene.card2 || 'Ingresos escalables'}</div>
                                </div>
                            </div>
                            <div class="spring-pop-2 bg-amber-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-xl border border-white/60">
                                📈 ${scene.card3 || 'Crecimiento Real'}
                            </div>
                        </div>
                    `;

                case 'actor_iceberg_deep':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-3">
                            <svg class="w-64 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 260 250">
                                <defs>
                                    <linearGradient id="iceTipLeft" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stop-color="#ffffff"/>
                                        <stop offset="100%" stop-color="#bae6fd"/>
                                    </linearGradient>
                                    <linearGradient id="iceTipRight" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stop-color="#e0f2fe"/>
                                        <stop offset="100%" stop-color="#7dd3fc"/>
                                    </linearGradient>
                                    <linearGradient id="deepIceLeft" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#0ea5e9"/>
                                        <stop offset="100%" stop-color="#1e3a8a"/>
                                    </linearGradient>
                                    <linearGradient id="deepIceRight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#0284c7"/>
                                        <stop offset="100%" stop-color="#0f172a"/>
                                    </linearGradient>
                                </defs>

                                <!-- COMPÁS 2: MASA SUBMARINA 2.5D FACETADA + SONAR DE PROFUNDIDAD -->
                                <g class="actor-beat-2">
                                    <!-- Ondas de Sonar Escaneando el 90% Oculto -->
                                    <ellipse cx="130" cy="145" rx="35" ry="20" fill="none" stroke="#38bdf8" stroke-width="2">
                                        <animate attributeName="rx" values="25;105" dur="1.8s" repeatCount="indefinite"/>
                                        <animate attributeName="ry" values="12;65" dur="1.8s" repeatCount="indefinite"/>
                                        <animate attributeName="opacity" values="0.85;0" dur="1.8s" repeatCount="indefinite"/>
                                    </ellipse>
                                    <!-- Polígono Submarino Facetado 3D Flotando -->
                                    <g class="svg-float-3d">
                                        <polygon points="88,78 130,78 130,224 46,168 62,112" fill="url(#deepIceLeft)" stroke="#38bdf8" stroke-width="1.5"/>
                                        <polygon points="130,78 172,78 208,158 130,224" fill="url(#deepIceRight)" stroke="#0284c7" stroke-width="1.5"/>
                                        <!-- Facetas internas de cristal -->
                                        <polygon points="88,78 130,135 62,112" fill="#38bdf8" opacity="0.25"/>
                                        <polygon points="172,78 130,135 208,158" fill="#0369a1" opacity="0.4"/>
                                    </g>
                                </g>

                                <!-- COMPÁS 1: PUNTA VISIBLE 10% + OLAS EN MOVIMIENTO + ETIQUETA SIN CORTE -->
                                <g class="actor-beat-1">
                                    <g class="svg-float-3d">
                                        <polygon points="130,18 88,78 130,78" fill="url(#iceTipLeft)" stroke="#ffffff" stroke-width="1.5"/>
                                        <polygon points="130,18 172,78 130,78" fill="url(#iceTipRight)" stroke="#bae6fd" stroke-width="1.5"/>
                                    </g>
                                    <!-- Superficie del Mar Animada -->
                                    <path d="M8 78 Q70 70 130 78 T252 78" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round">
                                        <animate attributeName="d" values="M8 78 Q70 70 130 78 T252 78; M8 78 Q70 86 130 78 T252 78; M8 78 Q70 70 130 78 T252 78" dur="2.1s" repeatCount="indefinite"/>
                                    </path>
                                    <!-- Píldora Superior Flotante (NUNCA SE CORTA CON EL ICEBERG) -->
                                    <rect x="10" y="46" width="96" height="22" rx="7" fill="#090d16" fill-opacity="0.92" stroke="#38bdf8" stroke-width="1.5"/>
                                    <text x="58" y="60" fill="#7dd3fc" font-size="8.5" font-weight="900" text-anchor="middle">👁️ VISIBLE (10%)</text>
                                </g>

                                <!-- COMPÁS 3: RED NEURONAL INTERNA DE SISTEMAS + BADGE 90% OCULTO -->
                                <g class="actor-beat-3">
                                    <!-- Nodos de Arquitectura brillando dentro del Iceberg -->
                                    <path id="icebergNet" d="M82 145 L130 112 L176 145 L130 190 Z" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="5,4"/>
                                    <circle r="4.5" fill="#fef08a">
                                        <animateMotion path="M82 145 L130 112 L176 145 L130 190 Z" dur="1.6s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle cx="82" cy="145" r="5" fill="#facc15" class="svg-pulse-glow"/>
                                    <circle cx="130" cy="112" r="5" fill="#38bdf8" class="svg-pulse-glow"/>
                                    <circle cx="176" cy="145" r="5" fill="#facc15" class="svg-pulse-glow"/>
                                    <!-- Píldora Central de Alto Contraste -->
                                    <rect x="64" y="138" width="132" height="28" rx="9" fill="#090d16" fill-opacity="0.92" stroke="#facc15" stroke-width="2"/>
                                    <text x="130" y="156" fill="#fef08a" font-size="10.5" font-weight="900" text-anchor="middle">⚡ EL 90% OCULTO</text>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-sky-500 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-xl">
                                🧊 ${scene.card1} ➔ ${scene.card2}
                            </div>
                        </div>
                    `;

                case 'actor_magnifying_glass':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 260 250">
                                <!-- COMPÁS 1: DOCUMENTO / PLACA OBJETIVO BAJO AUDITORÍA -->
                                <g class="actor-beat-1">
                                    <rect x="42" y="36" width="160" height="176" rx="16" fill="#0f172a" stroke="#334155" stroke-width="3"/>
                                    <line x1="64" y1="68" x2="148" y2="68" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
                                    <line x1="64" y1="92" x2="176" y2="92" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
                                    <line x1="64" y1="116" x2="160" y2="116" stroke="#ef4444" stroke-width="7" stroke-linecap="round"/>
                                    <line x1="64" y1="140" x2="170" y2="140" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
                                    <circle cx="174" cy="116" r="8" fill="#ef4444">
                                        <animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite"/>
                                    </circle>
                                </g>

                                <!-- COMPÁS 2: LUPA FORENSE ESCANEANDO EN MOVIMIENTO -->
                                <g class="actor-beat-2">
                                    <g>
                                        <animateTransform attributeName="transform" type="translate" values="-22,-18; 24,14; -12,22; -22,-18" dur="2.6s" repeatCount="indefinite"/>
                                        <line x1="145" y1="145" x2="205" y2="205" stroke="#f59e0b" stroke-width="16" stroke-linecap="round"/>
                                        <circle cx="110" cy="110" r="52" fill="#0ea5e9" fill-opacity="0.28" stroke="#38bdf8" stroke-width="8"/>
                                        <path d="M82 82 A36 36 0 0 1 132 76" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
                                        <!-- Láser escáner dentro del lente -->
                                        <line x1="64" y1="110" x2="156" y2="110" stroke="#fde047" stroke-width="2.5">
                                            <animate attributeName="y1" values="78;142;78" dur="1.1s" repeatCount="indefinite"/>
                                            <animate attributeName="y2" values="78;142;78" dur="1.1s" repeatCount="indefinite"/>
                                        </line>
                                    </g>
                                </g>

                                <!-- COMPÁS 3: ALERTA DE HALLAZGO DETECTADO -->
                                <g class="actor-beat-3">
                                    <rect x="48" y="176" width="164" height="28" rx="8" fill="#450a0a" stroke="#ef4444" stroke-width="2"/>
                                    <text x="130" y="194" fill="#fca5a5" font-size="10" font-weight="900" text-anchor="middle">🔍 EVIDENCIA DETECTADA</text>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-amber-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-xl shadow-xl">
                                🔎 ${scene.card1 || ''} • ${scene.card2 || ''}
                            </div>
                        </div>
                    `;

                case 'retro_brick_phone_25d':
                    // NUEVO ACTOR VIRAL: El Primer Celular de la Historia (Motorola DynaTAC 1973/1983 - 1 Kg, 10h carga, $3,995)
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 260 260">
                                <!-- COMPÁS 1: EL LADRILLO DYNATAC 8000X EN 2.5D -->
                                <g class="actor-beat-1">
                                    <g class="svg-float-3d">
                                        <!-- Antena gruesa de goma -->
                                        <rect x="142" y="12" width="10" height="58" rx="5" fill="#1e293b" stroke="#475569" stroke-width="2"/>
                                        <!-- Sombra lateral 2.5D -->
                                        <rect x="86" y="68" width="76" height="156" rx="10" fill="#94a3b8"/>
                                        <!-- Cuerpo crema ochentero -->
                                        <rect x="94" y="64" width="74" height="156" rx="10" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2.5"/>
                                        <!-- Auricular y Pantalla LED Roja -->
                                        <rect x="104" y="76" width="54" height="22" rx="4" fill="#334155"/>
                                        <rect x="104" y="104" width="54" height="20" rx="3" fill="#450a0a" stroke="#ef4444" stroke-width="1.5"/>
                                        <text x="131" y="118" fill="#ef4444" font-family="monospace" font-size="10" font-weight="900" text-anchor="middle">800-1983</text>
                                        <!-- Teclado físico numérico -->
                                        <g fill="#475569">
                                            <rect x="106" y="132" width="14" height="10" rx="2"/><rect x="124" y="132" width="14" height="10" rx="2"/><rect x="142" y="132" width="14" height="10" rx="2"/>
                                            <rect x="106" y="146" width="14" height="10" rx="2"/><rect x="124" y="146" width="14" height="10" rx="2"/><rect x="142" y="146" width="14" height="10" rx="2"/>
                                            <rect x="106" y="160" width="14" height="10" rx="2"/><rect x="124" y="160" width="14" height="10" rx="2"/><rect x="142" y="160" width="14" height="10" rx="2"/>
                                        </g>
                                    </g>
                                </g>

                                <!-- COMPÁS 2: PESO DE 1.1 KILOS + BATERÍA DE SOLO 30 MINUTOS -->
                                <g class="actor-beat-2">
                                    <circle cx="147" cy="16" r="10" fill="none" stroke="#38bdf8" stroke-width="2.5">
                                        <animate attributeName="r" values="8;48" dur="1.1s" repeatCount="indefinite"/>
                                        <animate attributeName="opacity" values="1;0" dur="1.1s" repeatCount="indefinite"/>
                                    </circle>
                                    <rect x="14" y="96" width="72" height="44" rx="10" fill="#090d16" stroke="#facc15" stroke-width="2"/>
                                    <text x="50" y="114" fill="#facc15" font-size="9" font-weight="900" text-anchor="middle">⚖️ PESABA</text>
                                    <text x="50" y="130" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">1.1 KILOS</text>
                                </g>

                                <!-- COMPÁS 3: ETIQUETA DE PRECIO HISTÓRICO ($3,995 USD) -->
                                <g class="actor-beat-3">
                                    <rect x="172" y="118" width="80" height="48" rx="10" fill="#052e16" stroke="#4ade80" stroke-width="2"/>
                                    <text x="212" y="136" fill="#86efac" font-size="8.5" font-weight="900" text-anchor="middle">PRECIO 1983</text>
                                    <text x="212" y="154" fill="#4ade80" font-size="13" font-weight="900" text-anchor="middle">$3,995</text>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-black/85 border border-amber-400 text-amber-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl">
                                🧱 ${scene.card1 || ''} • ${scene.card2 || ''}
                            </div>
                        </div>
                    `;

                case 'vintage_computer_bug_25d':
                    // NUEVO ACTOR VIRAL: El Primer Computador (ENIAC 30 Toneladas / Tubos de Vacío / El Primer Bug Real)
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 260 260">
                                <!-- COMPÁS 1: BASTIDOR GIGANTE ENIAC DE 30 TONELADAS -->
                                <g class="actor-beat-1">
                                    <rect x="26" y="34" width="208" height="172" rx="12" fill="#1e293b" stroke="#64748b" stroke-width="3"/>
                                    <rect x="38" y="46" width="84" height="148" rx="6" fill="#090d16" stroke="#334155" stroke-width="2"/>
                                    <rect x="138" y="46" width="84" height="148" rx="6" fill="#090d16" stroke="#334155" stroke-width="2"/>
                                    <!-- Luces de válvulas de vacío parpadeando -->
                                    <g fill="#f59e0b">
                                        <circle cx="56" cy="68" r="5"><animate attributeName="opacity" values="0.2;1;0.2" dur="0.4s" repeatCount="indefinite"/></circle>
                                        <circle cx="80" cy="68" r="5"><animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite"/></circle>
                                        <circle cx="104" cy="68" r="5"><animate attributeName="opacity" values="0.3;1;0.3" dur="0.3s" repeatCount="indefinite"/></circle>
                                        <circle cx="156" cy="68" r="5"><animate attributeName="opacity" values="1;0.3;1" dur="0.45s" repeatCount="indefinite"/></circle>
                                        <circle cx="180" cy="68" r="5"><animate attributeName="opacity" values="0.2;1;0.2" dur="0.35s" repeatCount="indefinite"/></circle>
                                        <circle cx="204" cy="68" r="5"><animate attributeName="opacity" values="1;0.1;1" dur="0.6s" repeatCount="indefinite"/></circle>
                                    </g>
                                    <!-- Cintas magnéticas girando -->
                                    <g>
                                        <animateTransform attributeName="transform" type="rotate" from="0 64 135" to="360 64 135" dur="2.2s" repeatCount="indefinite"/>
                                        <circle cx="64" cy="135" r="18" fill="none" stroke="#94a3b8" stroke-width="4" stroke-dasharray="12,8"/>
                                    </g>
                                    <g>
                                        <animateTransform attributeName="transform" type="rotate" from="360 100 135" to="0 100 135" dur="2.2s" repeatCount="indefinite"/>
                                        <circle cx="100" cy="135" r="18" fill="none" stroke="#94a3b8" stroke-width="4" stroke-dasharray="12,8"/>
                                    </g>
                                </g>

                                <!-- COMPÁS 2: LA POLILLA REAL (PRIMER "BUG" INFORMÁTICO DE 1947) ENTRANDO AL RELÉ -->
                                <g class="actor-beat-2">
                                    <g>
                                        <animateMotion path="M 240 40 Q 190 95 180 135" dur="1.4s" repeatCount="indefinite"/>
                                        <ellipse cx="0" cy="0" rx="14" ry="8" fill="#eab308" transform="rotate(-25)"/>
                                        <ellipse cx="0" cy="0" rx="14" ry="8" fill="#ca8a04" transform="rotate(25)"/>
                                        <circle cx="0" cy="0" r="5" fill="#422006"/>
                                    </g>
                                    <circle cx="180" cy="135" r="16" fill="#ef4444" opacity="0.45">
                                        <animate attributeName="r" values="8;24;8" dur="0.5s" repeatCount="indefinite"/>
                                    </circle>
                                </g>

                                <!-- COMPÁS 3: BITÁCORA OFICIAL "FIRST ACTUAL CASE OF BUG" -->
                                <g class="actor-beat-3">
                                    <rect x="44" y="212" width="172" height="28" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
                                    <text x="130" y="230" fill="#78350f" font-size="9.5" font-weight="900" text-anchor="middle">🪲 PRIMER «BUG» REAL (1947)</text>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-black/85 border border-cyan-400 text-cyan-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl">
                                🖥️ ${scene.card1 || ''} • ${scene.card2 || ''}
                            </div>
                        </div>
                    `;

                case 'judge_gavel_court_25d':
                    // NUEVO ACTOR VIRAL: Sala del Juez + Mazo Golpeando en Vivo (Estilo Baninter 00:52)
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 260 260">
                                <!-- COMPÁS 1: ESTRADO DEL TRIBUNAL + JUEZ -->
                                <g class="actor-beat-1">
                                    <circle cx="130" cy="74" r="26" fill="#e08b6b" stroke="#78350f" stroke-width="2"/>
                                    <path d="M104 68 C104 42 156 42 156 68 Z" fill="#0f172a"/>
                                    <circle cx="121" cy="74" r="3" fill="#0f172a"/><circle cx="139" cy="74" r="3" fill="#0f172a"/>
                                    <path d="M90 142 C90 108 170 108 170 142 Z" fill="#0f172a" stroke="#334155" stroke-width="2"/>
                                    <!-- Escritorio de madera 2.5D -->
                                    <rect x="28" y="138" width="204" height="78" rx="8" fill="#78350f" stroke="#b45309" stroke-width="3"/>
                                    <rect x="42" y="150" width="52" height="54" rx="4" fill="#451a03"/>
                                    <rect x="104" y="150" width="52" height="54" rx="4" fill="#451a03"/>
                                    <rect x="166" y="150" width="52" height="54" rx="4" fill="#451a03"/>
                                </g>

                                <!-- COMPÁS 2: MAZO DEL JUEZ GOLPEANDO LA BASE CON ONDA EXPANSIVA -->
                                <g class="actor-beat-2">
                                    <ellipse cx="188" cy="136" rx="22" ry="7" fill="#451a03" stroke="#f59e0b" stroke-width="2"/>
                                    <g>
                                        <animateTransform attributeName="transform" type="rotate" values="-38 152 128; 8 152 128; -38 152 128" dur="0.75s" repeatCount="indefinite"/>
                                        <rect x="150" y="122" width="42" height="8" rx="4" fill="#fde047"/>
                                        <rect x="178" y="106" width="22" height="36" rx="6" fill="#92400e" stroke="#facc15" stroke-width="2"/>
                                    </g>
                                    <circle cx="188" cy="134" r="8" fill="none" stroke="#facc15" stroke-width="2.5">
                                        <animate attributeName="r" values="6;32" dur="0.75s" repeatCount="indefinite"/>
                                        <animate attributeName="opacity" values="1;0" dur="0.75s" repeatCount="indefinite"/>
                                    </circle>
                                </g>

                                <!-- COMPÁS 3: SENTENCIA EN PANTALLA -->
                                <g class="actor-beat-3">
                                    <rect x="44" y="218" width="172" height="28" rx="8" fill="#450a0a" stroke="#ef4444" stroke-width="2"/>
                                    <text x="130" y="236" fill="#fecaca" font-size="11" font-weight="900" text-anchor="middle">⚖️ ${scene.card1 || 'SENTENCIA FIRME'}</text>
                                </g>
                            </svg>
                        </div>
                    `;

                case 'ai_brain_workflow':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-3 gap-3.5">
                            <div class="spring-pop w-full max-w-[290px] bg-slate-950/85 backdrop-blur-xl border border-cyan-500/35 rounded-3xl p-3.5 shadow-[0_20px_50px_rgba(6,182,212,0.2)]">
                                <div class="flex items-center justify-between gap-1.5">
                                    <div class="flex-1 bg-slate-900 border border-amber-400/50 p-2 rounded-2xl text-center shadow-lg">
                                        <div class="text-lg">💡</div>
                                        <div class="text-[9.5px] font-black text-amber-300 uppercase leading-tight mt-0.5">${scene.card1 || 'Entrada'}</div>
                                    </div>
                                    <div class="text-cyan-400 font-black text-sm animate-pulse">➔</div>
                                    <div class="flex-1 bg-gradient-to-br from-cyan-500 to-indigo-600 text-white p-2.5 rounded-2xl text-center shadow-xl border border-white/50">
                                        <div class="text-xl">🧠</div>
                                        <div class="text-[10px] font-black uppercase leading-tight mt-0.5">${scene.card2 || 'Motor IA'}</div>
                                    </div>
                                    <div class="text-emerald-400 font-black text-sm animate-pulse">➔</div>
                                    <div class="flex-1 bg-slate-900 border border-emerald-400/50 p-2 rounded-2xl text-center shadow-lg">
                                        <div class="text-lg">🚀</div>
                                        <div class="text-[9.5px] font-black text-emerald-300 uppercase leading-tight mt-0.5">${scene.card3 || 'Resultado'}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="spring-pop-2 bg-slate-950/85 backdrop-blur-md border border-cyan-400/40 px-4 py-1.5 rounded-full text-[11px] font-extrabold text-cyan-300 shadow-xl">
                                ⚡ Flujo Automatizado • ${currentConfig.brand || '@nachotechrd'}
                            </div>
                        </div>
                    `;

                case 'checklist_pro':
                    return `
                        <div class="relative w-full h-full flex items-center justify-center px-2">
                            <div class="spring-pop w-40 sm:w-44 h-64 bg-gradient-to-b from-slate-900 to-slate-950 rounded-[28px] border-4 border-slate-700 shadow-[0_25px_55px_rgba(0,0,0,0.65)] p-3 flex flex-col justify-between">
                                <div class="w-12 h-2.5 bg-black rounded-full mx-auto"></div>
                                <div class="my-auto flex flex-col items-center text-center">
                                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg text-white font-black text-lg border border-white/25">
                                        NT
                                    </div>
                                    <span class="mt-2 text-[11px] font-black text-cyan-300 font-mono-code">${domain}</span>
                                </div>
                                <div class="bg-emerald-500 text-slate-950 font-black text-[10px] py-1 rounded-xl text-center uppercase shadow">
                                    ✓ Sistema Verificado
                                </div>
                            </div>
                            <div class="flex flex-col gap-2.5 -ml-3 z-10">
                                <div class="spring-pop-1 bg-white text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-200">
                                    <span class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shrink-0">✓</span>
                                    <span>${scene.card1 || 'Paso 1'}</span>
                                </div>
                                <div class="spring-pop-2 bg-white text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-200">
                                    <span class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shrink-0">✓</span>
                                    <span>${scene.card2 || 'Paso 2'}</span>
                                </div>
                                <div class="spring-pop-3 bg-white text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-200">
                                    <span class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shrink-0">✓</span>
                                    <span>${scene.card3 || 'Paso 3'}</span>
                                </div>
                            </div>
                        </div>
                    `;

                case 'strike_cards':
                    return `
                        <div class="w-full h-full flex flex-col items-center justify-center gap-2.5 px-3">
                            <div class="spring-pop w-full max-w-[276px] bg-slate-950/90 backdrop-blur-xl border-2 border-rose-500/40 rounded-2xl p-2.5 flex items-center justify-between shadow-2xl">
                                <div class="flex items-center gap-2.5">
                                    <span class="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center justify-center font-black text-xs">01</span>
                                    <span class="strike-line text-xs sm:text-sm font-extrabold text-white">${scene.card1 || 'Error 1'}</span>
                                </div>
                                <span class="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0">✕</span>
                            </div>
                            <div class="spring-pop-1 w-full max-w-[276px] bg-slate-950/90 backdrop-blur-xl border-2 border-amber-500/40 rounded-2xl p-2.5 flex items-center justify-between shadow-2xl">
                                <div class="flex items-center gap-2.5">
                                    <span class="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-black text-xs">02</span>
                                    <span class="strike-line text-xs sm:text-sm font-extrabold text-white">${scene.card2 || 'Error 2'}</span>
                                </div>
                                <span class="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0">✕</span>
                            </div>
                            <div class="spring-pop-2 w-full max-w-[276px] bg-slate-950/90 backdrop-blur-xl border-2 border-rose-500/40 rounded-2xl p-2.5 flex items-center justify-between shadow-2xl">
                                <div class="flex items-center gap-2.5">
                                    <span class="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-black text-xs">03</span>
                                    <span class="strike-line text-xs sm:text-sm font-extrabold text-white">${scene.card3 || 'Error 3'}</span>
                                </div>
                                <span class="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0">✕</span>
                            </div>
                        </div>
                    `;

                case 'comparison_split':
                    return `
                        <div class="w-full h-full flex items-center justify-center gap-3 px-3">
                            <div class="spring-pop flex-1 bg-slate-950/90 border-2 border-rose-500/50 rounded-3xl p-3.5 text-center shadow-xl">
                                <div class="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-xl mx-auto mb-1.5">❌</div>
                                <div class="text-[9.5px] font-black uppercase text-rose-400 tracking-wider">Mito / Antes</div>
                                <div class="strike-line text-xs font-extrabold text-slate-300 mt-1 leading-snug">${scene.card1 || 'Método Lento'}</div>
                            </div>
                            <div class="spring-pop-2 flex-1 bg-gradient-to-b from-emerald-900/90 to-slate-950 border-2 border-emerald-400 rounded-3xl p-4 text-center shadow-[0_15px_35px_rgba(16,185,129,0.3)] transform scale-105">
                                <div class="w-10 h-10 rounded-2xl bg-emerald-400/20 border border-emerald-400/50 flex items-center justify-center text-xl mx-auto mb-1.5">⚡</div>
                                <div class="text-[9.5px] font-black uppercase text-emerald-300 tracking-wider">${scene.card3 || 'Realidad Pro'}</div>
                                <div class="text-xs sm:text-sm font-black text-white mt-1 leading-snug">${scene.card2 || 'Resultado Real'}</div>
                            </div>
                        </div>
                    `;

                case 'nt_vault_hub':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <div class="spring-pop mb-2 px-4 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-cyan-300 font-mono-code font-extrabold text-xs">
                                ${scene.card2}
                            </div>
                            <div class="spring-pop-1 relative w-56 h-32 bg-gradient-to-b from-amber-300 to-amber-500 rounded-2xl shadow-2xl border-2 border-amber-100 flex flex-col items-center justify-center p-4 transform -rotate-2">
                                <div class="absolute -top-3 left-4 w-20 h-4 bg-amber-400 rounded-t-xl border-t-2 border-l-2 border-r-2 border-amber-100"></div>
                                <div class="text-slate-950 font-black text-base text-center leading-tight">
                                    ${scene.card1}
                                </div>
                                <div class="spring-pop-2 absolute -top-3.5 -right-3 bg-white text-rose-600 border-2 border-rose-600 font-black text-[11px] px-2.5 py-0.5 rounded-lg shadow-lg transform rotate-12">
                                    ${scene.card3}
                                </div>
                            </div>
                            <div class="spring-pop-3 flex items-center justify-center -space-x-2 mt-3">
                                <div class="w-11 h-14 rounded-xl bg-gradient-to-b from-emerald-500 to-slate-900 border-2 border-white/80 transform -rotate-12 flex items-center justify-center shadow-lg text-white text-xs font-black">AI</div>
                                <div class="w-11 h-14 rounded-xl bg-gradient-to-b from-blue-500 to-slate-900 border-2 border-white/80 transform -rotate-6 flex items-center justify-center shadow-lg text-white text-xs font-black">POS</div>
                                <div class="w-11 h-14 rounded-xl bg-gradient-to-b from-rose-500 to-slate-900 border-2 border-white/80 transform rotate-0 flex items-center justify-center shadow-lg text-white text-xs font-black">RAD</div>
                                <div class="w-11 h-14 rounded-xl bg-gradient-to-b from-indigo-500 to-slate-900 border-2 border-white/80 transform rotate-6 flex items-center justify-center shadow-lg text-white text-xs font-black">DEV</div>
                            </div>
                        </div>
                    `;

                case 'modular_building_hole':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-2">
                            <!-- COMPÁS 1: CONTADOR NUMÉRICO EN VIVO ARRIBA -->
                            <div class="actor-beat-1 mb-2 bg-[#1a0f16]/95 border-2 border-red-500/80 rounded-2xl px-4 py-1.5 shadow-[0_0_25px_rgba(239,68,68,0.45)]">
                                <div id="live-money-ticker" data-target="${scene.card2 || 'RD$55.000.000.000'}" class="font-mono-code text-lg sm:text-xl font-black text-red-500 tracking-tight">
                                    ${scene.card2 || 'RD$55.000.000.000'}
                                </div>
                            </div>

                            <svg class="w-64 h-60 drop-shadow-2xl overflow-visible" viewBox="0 0 260 240">
                                <!-- COMPÁS 1: EDIFICIO GENÉRICO CON CARTEL PERSONALIZABLE -->
                                <g class="actor-beat-1">
                                    <polygon points="130,12 20,54 240,54" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
                                    <rect x="28" y="54" width="204" height="22" rx="3" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
                                    <text x="130" y="69" fill="#1e293b" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1">${(scene.card1 || 'BANINTER').toUpperCase()}</text>
                                    <rect x="42" y="76" width="18" height="92" fill="#cbd5e1"/>
                                    <rect x="82" y="76" width="18" height="92" fill="#cbd5e1"/>
                                    <rect x="160" y="76" width="18" height="92" fill="#cbd5e1"/>
                                    <rect x="200" y="76" width="18" height="92" fill="#cbd5e1"/>
                                    <rect x="112" y="96" width="36" height="72" fill="#854d0e" stroke="#422006" stroke-width="2"/>
                                    <rect x="20" y="168" width="220" height="12" rx="3" fill="#94a3b8"/>
                                </g>

                                <!-- COMPÁS 2: HUECO FINANCIERO + LLUVIA DE BILLETES CAYENDO AL HUECO -->
                                <g class="actor-beat-2">
                                    <ellipse cx="130" cy="202" rx="98" ry="24" fill="#1f0909" stroke="#991b1b" stroke-width="4"/>
                                    <ellipse cx="130" cy="205" rx="82" ry="16" fill="#090202"/>
                                    <g>
                                        <animateTransform attributeName="transform" type="translate" values="0,-25; 0,18" dur="0.95s" repeatCount="indefinite"/>
                                        <rect x="75" y="125" width="46" height="24" rx="3" fill="#eab308" stroke="#713f12" stroke-width="1.5" transform="rotate(-18 98 137)"/>
                                        <text x="98" y="140" fill="#422006" font-size="7" font-weight="900" text-anchor="middle" transform="rotate(-18 98 137)">${scene.card3 || 'RD$1000'}</text>
                                    </g>
                                    <g>
                                        <animateTransform attributeName="transform" type="translate" values="0,-30; 0,20" dur="0.8s" begin="0.3s" repeatCount="indefinite"/>
                                        <rect x="128" y="118" width="46" height="24" rx="3" fill="#facc15" stroke="#713f12" stroke-width="1.5" transform="rotate(14 151 130)"/>
                                        <text x="151" y="133" fill="#422006" font-size="7" font-weight="900" text-anchor="middle" transform="rotate(14 151 130)">${scene.card3 || 'RD$1000'}</text>
                                    </g>
                                    <g class="svg-breathe">
                                        <rect x="88" y="162" width="48" height="25" rx="3" fill="#ca8a04" stroke="#422006" stroke-width="1.5" transform="rotate(-8 112 174)"/>
                                        <rect x="118" y="160" width="48" height="25" rx="3" fill="#eab308" stroke="#422006" stroke-width="1.5" transform="rotate(12 142 172)"/>
                                        <rect x="102" y="148" width="48" height="25" rx="3" fill="#facc15" stroke="#422006" stroke-width="1.5" transform="rotate(-3 126 160)"/>
                                    </g>
                                </g>
                            </svg>
                        </div>
                    `;

                case 'modular_receipt_stamp':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-3">
                            <svg class="w-60 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 240 260">
                                <!-- COMPÁS 1: PAPEL DE FACTURA DENTADO ENTRANDO EN INCLINACIÓN -->
                                <g class="actor-beat-1" transform="rotate(-3 120 130)">
                                    <polygon points="34,16 206,16 206,236 192,226 178,236 164,226 150,236 136,226 122,236 108,226 94,236 80,226 66,236 52,226 34,236" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
                                    <text x="120" y="52" fill="#0f172a" font-size="20" font-weight="900" text-anchor="middle">${(scene.card1 || 'LA CUENTA').toUpperCase()}</text>
                                    <line x1="54" y1="74" x2="145" y2="74" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
                                    <line x1="162" y1="74" x2="186" y2="74" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
                                    <line x1="54" y1="92" x2="130" y2="92" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
                                    <line x1="162" y1="92" x2="186" y2="92" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
                                    <line x1="54" y1="110" x2="152" y2="110" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
                                    <line x1="162" y1="110" x2="186" y2="110" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
                                    <line x1="48" y1="128" x2="192" y2="128" stroke="#cbd5e1" stroke-width="2"/>
                                </g>

                                <!-- COMPÁS 2: TOTAL EN ROJO IMPACTO -->
                                <g class="actor-beat-2" transform="rotate(-3 120 130)">
                                    <text x="120" y="148" fill="#334155" font-size="11" font-weight="900" text-anchor="middle">TOTAL</text>
                                    <text x="120" y="168" fill="#dc2626" font-size="15.5" font-weight="900" text-anchor="middle">${scene.card2 || 'RD$55.000 MILLONES'}</text>
                                    <text x="85" y="198" fill="#0f172a" font-size="13" font-weight="900" text-anchor="middle">A PAGAR:</text>
                                </g>

                                <!-- COMPÁS 3: GOLPE DE SELLO ROJO EN VIVO -->
                                <g class="actor-beat-3" transform="translate(148, 195) rotate(-12)">
                                    <rect x="-48" y="-20" width="96" height="40" rx="6" fill="#fef2f2" fill-opacity="0.92" stroke="#dc2626" stroke-width="4"/>
                                    <text x="0" y="8" fill="#dc2626" font-size="22" font-weight="900" text-anchor="middle">${(scene.card3 || 'TÚ').toUpperCase()}</text>
                                </g>
                            </svg>
                        </div>
                    `;

                case 'dual_image_showcase':
                    // Showcase interactivo unificado: renderDualOverlayLayer gestiona las imágenes interactivas en stage-dual-overlay
                    return `
                        <div class="overlay-dual-stage flex items-center justify-center w-full h-full pointer-events-none">
                            ${scene.card1 ? `<div class="absolute bottom-16 left-6 px-3 py-1 rounded-full bg-black/85 border border-amber-400/40 text-[11px] font-black text-amber-300 shadow-xl pointer-events-auto">${scene.card1}</div>` : ''}
                            ${scene.card2 ? `<div class="absolute bottom-16 right-6 px-3 py-1 rounded-full bg-black/85 border border-cyan-400/40 text-[11px] font-black text-cyan-300 shadow-xl pointer-events-auto">${scene.card2}</div>` : ''}
                        </div>
                    `;

                case 'route_map_flight':
                    // Mapa Satelital con Trayectoria Punteada en Vivo + Avión 2.5D con rotate="auto"
                    // card1 = Ciudad Origen (ej. BARRANQUILLA / SANTO DOMINGO)
                    // card2 = Ciudad Destino (ej. MIAMI / MADRID / NUEVA YORK)
                    // card3 = Etiqueta de Ruta (ej. 1,850 KM • VUELO EN VIVO)
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-72 drop-shadow-2xl overflow-visible rounded-3xl border-2 border-sky-500/40" viewBox="0 0 360 520">
                                <defs>
                                    <radialGradient id="satOcean" cx="50%" cy="50%" r="70%">
                                        <stop offset="0%" stop-color="#06284d"/>
                                        <stop offset="60%" stop-color="#031329"/>
                                        <stop offset="100%" stop-color="#010712"/>
                                    </radialGradient>
                                    <linearGradient id="satLand" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stop-color="#2d5a27"/>
                                        <stop offset="100%" stop-color="#132a13"/>
                                    </linearGradient>
                                    <mask id="flightMaskLive">
                                        <path d="M 195 455 C 175 340, 145 245, 88 95" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-dasharray="420" stroke-dashoffset="420">
                                            <animate attributeName="stroke-dashoffset" values="420;0;0" keyTimes="0;0.82;1" dur="3.8s" repeatCount="indefinite"/>
                                        </path>
                                    </mask>
                                </defs>

                                <!-- Fondo Satelital y Relieve Caribe / América -->
                                <rect width="360" height="520" rx="24" fill="url(#satOcean)"/>
                                <g opacity="0.55" fill="#06b6d4" filter="blur(6px)">
                                    <ellipse cx="122" cy="135" rx="28" ry="12" transform="rotate(-20 122 135)"/>
                                    <ellipse cx="156" cy="162" rx="22" ry="9"/>
                                    <ellipse cx="225" cy="215" rx="18" ry="8"/>
                                </g>
                                <g fill="url(#satLand)" stroke="#4d7c43" stroke-width="1.5">
                                    <path d="M 0 0 L 195 0 L 145 45 L 98 85 L 92 122 L 68 124 L 60 75 L 0 65 Z"/>
                                    <path d="M 38 175 Q 98 172 162 208 L 142 218 Q 85 192 34 188 Z"/>
                                    <ellipse cx="108" cy="252" rx="18" ry="6"/>
                                    <path d="M 185 222 Q 238 215 282 238 L 275 258 Q 228 252 182 242 Z"/>
                                    <path d="M 95 520 L 152 435 Q 205 415 255 405 L 310 445 L 360 440 L 360 520 Z"/>
                                </g>

                                <!-- Nombres de Islas / Referencias -->
                                <text x="72" y="192" fill="#cbd5e1" font-size="10" font-weight="800">Cuba</text>
                                <text x="108" y="272" fill="#cbd5e1" font-size="9" font-weight="800" text-anchor="middle">Jamaica</text>
                                <text x="235" y="242" fill="#fde047" font-size="10" font-weight="900" text-anchor="middle">Hispaniola</text>

                                <!-- Pin de Origen (card1) -->
                                <circle cx="195" cy="455" r="6" fill="#38bdf8"/>
                                <circle cx="195" cy="455" r="6" fill="none" stroke="#38bdf8" stroke-width="2.5">
                                    <animate attributeName="r" values="6;24" dur="1.3s" repeatCount="indefinite"/>
                                    <animate attributeName="opacity" values="1;0" dur="1.3s" repeatCount="indefinite"/>
                                </circle>
                                <rect x="130" y="466" width="130" height="22" rx="6" fill="#090d16" fill-opacity="0.9" stroke="#38bdf8" stroke-width="1.5"/>
                                <text x="195" y="481" fill="#ffffff" font-size="10.5" font-weight="900" text-anchor="middle">📍 ${scene.card1 || 'BARRANQUILLA'}</text>

                                <!-- Pin de Destino (card2) -->
                                <circle cx="88" cy="95" r="6" fill="#facc15"/>
                                <circle cx="88" cy="95" r="6" fill="none" stroke="#facc15" stroke-width="2.5">
                                    <animate attributeName="r" values="6;24" dur="1.3s" repeatCount="indefinite"/>
                                    <animate attributeName="opacity" values="1;0" dur="1.3s" repeatCount="indefinite"/>
                                </circle>
                                <rect x="28" y="58" width="120" height="22" rx="6" fill="#090d16" fill-opacity="0.9" stroke="#facc15" stroke-width="1.5"/>
                                <text x="88" y="73" fill="#fef08a" font-size="10.5" font-weight="900" text-anchor="middle">🏁 ${scene.card2 || 'MIAMI'}</text>

                                <!-- LÍNEA PUNTEADA AZUL QUE SE DIBUJA PROGRESIVAMENTE -->
                                <path d="M 195 455 C 175 340, 145 245, 88 95"
                                      fill="none"
                                      stroke="#3b82f6"
                                      stroke-width="5"
                                      stroke-linecap="round"
                                      stroke-dasharray="7,10"
                                      mask="url(#flightMaskLive)"/>

                                <!-- AVIÓN 2.5D RECORRIENDO LA RUTA CON ROTACIÓN AUTOMÁTICA -->
                                <g>
                                    <g>
                                        <path d="M 28 0 C 20 -5, 10 -6, -22 -5 L -28 -16 L -34 -16 L -26 -3 L -32 0 L -26 3 L -34 16 L -28 16 L -22 5 C 10 6, 20 5, 28 0 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
                                        <polygon points="4,-4 -10,-34 -18,-34 -10,-4" fill="#e2e8f0"/>
                                        <polygon points="4,4 -10,34 -18,34 -10,4" fill="#cbd5e1"/>
                                        <ellipse cx="18" cy="0" rx="4" ry="2.5" fill="#0284c7"/>
                                    </g>
                                    <animateMotion path="M 195 455 C 175 340, 145 245, 88 95"
                                                   dur="3.8s"
                                                   keyPoints="0;1;1"
                                                   keyTimes="0;0.82;1"
                                                   calcMode="linear"
                                                   rotate="auto"
                                                   repeatCount="indefinite"/>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-black/85 border border-sky-400 text-sky-300 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl">
                                ✈️ ${scene.card3 || `${scene.card1 || 'Origen'} ➔ ${scene.card2 || 'Destino'}`}
                            </div>
                        </div>
                    `;

                case 'walking_dog_stage':
                    // Perro / Cachorro Articulado Caminando en Vivo (4 patas con pivote + cola + cabeza + desplazamiento)
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-64 h-60 drop-shadow-2xl overflow-visible" viewBox="0 0 280 240">
                                <defs>
                                    <linearGradient id="dogBodyGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#f59e0b"/>
                                        <stop offset="100%" stop-color="#b45309"/>
                                    </linearGradient>
                                </defs>
                                <!-- Suelo en Movimiento Parallax -->
                                <line x1="15" y1="196" x2="265" y2="196" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
                                <line x1="20" y1="204" x2="260" y2="204" stroke="#38bdf8" stroke-width="3" stroke-dasharray="18,24" stroke-linecap="round">
                                    <animate attributeName="stroke-dashoffset" from="0" to="84" dur="0.6s" repeatCount="indefinite"/>
                                </line>
                                <ellipse cx="140" cy="196" rx="52" ry="8" fill="#000000" opacity="0.45">
                                    <animate attributeName="rx" values="48;58;48" dur="0.35s" repeatCount="indefinite"/>
                                </ellipse>

                                <!-- Perro Articulado con Ciclo de Trote -->
                                <g>
                                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-6; 0,0" dur="0.35s" repeatCount="indefinite"/>
                                    <!-- Patas Traseras y Delanteras de Fondo -->
                                    <g><animateTransform attributeName="transform" type="rotate" values="26 98 142; -26 98 142; 26 98 142" dur="0.7s" repeatCount="indefinite"/><rect x="90" y="138" width="15" height="52" rx="7.5" fill="#92400e"/></g>
                                    <g><animateTransform attributeName="transform" type="rotate" values="-26 168 142; 26 168 142; -26 168 142" dur="0.7s" repeatCount="indefinite"/><rect x="160" y="138" width="15" height="52" rx="7.5" fill="#92400e"/></g>
                                    <!-- Cola Batiéndose -->
                                    <g><animateTransform attributeName="transform" type="rotate" values="-18 82 118; 22 82 118; -18 82 118" dur="0.28s" repeatCount="indefinite"/><path d="M 84 120 Q 52 92 58 68 Q 70 82 88 112 Z" fill="url(#dogBodyGrad)" stroke="#78350f" stroke-width="2"/></g>
                                    <!-- Tronco -->
                                    <rect x="78" y="104" width="106" height="50" rx="25" fill="url(#dogBodyGrad)" stroke="#78350f" stroke-width="2.5"/>
                                    <!-- Patas de Frente en Oposición -->
                                    <g><animateTransform attributeName="transform" type="rotate" values="-28 98 142; 28 98 142; -28 98 142" dur="0.7s" repeatCount="indefinite"/><rect x="90" y="138" width="16" height="54" rx="8" fill="url(#dogBodyGrad)" stroke="#78350f" stroke-width="2"/><ellipse cx="101" cy="190" rx="11" ry="6" fill="#fef3c7"/></g>
                                    <g><animateTransform attributeName="transform" type="rotate" values="28 168 142; -28 168 142; 28 168 142" dur="0.7s" repeatCount="indefinite"/><rect x="160" y="138" width="16" height="54" rx="8" fill="url(#dogBodyGrad)" stroke="#78350f" stroke-width="2"/><ellipse cx="171" cy="190" rx="11" ry="6" fill="#fef3c7"/></g>
                                    <!-- Collar y Cabeza con Orejas -->
                                    <path d="M 158 102 L 178 126" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/>
                                    <circle cx="172" cy="128" r="6" fill="#facc15"/>
                                    <g>
                                        <animateTransform attributeName="transform" type="rotate" values="-4 172 98; 5 172 98; -4 172 98" dur="0.35s" repeatCount="indefinite"/>
                                        <path d="M 156 72 L 140 32 L 172 56 Z" fill="#78350f"/>
                                        <circle cx="182" cy="82" r="30" fill="url(#dogBodyGrad)" stroke="#78350f" stroke-width="2.5"/>
                                        <ellipse cx="208" cy="90" rx="16" ry="12" fill="#fef3c7" stroke="#78350f" stroke-width="2"/>
                                        <ellipse cx="220" cy="85" rx="6" ry="4.5" fill="#0f172a"/>
                                        <path d="M 206 98 Q 212 112 218 98" fill="#f43f5e"/>
                                        <circle cx="192" cy="76" r="6.5" fill="#0f172a"/><circle cx="194" cy="74" r="2.2" fill="#ffffff"/>
                                        <path d="M 172 68 L 158 26 L 190 56 Z" fill="url(#dogBodyGrad)" stroke="#78350f" stroke-width="2"/>
                                    </g>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-amber-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-xl">
                                🐕 ${scene.card1 || 'En Movimiento'} • ${scene.card2 || 'Paso a Paso'}
                            </div>
                        </div>
                    `;

                case 'walking_person_stage':
                    // Persona Articulada Caminando en Ciclo Real (Brazos y Piernas Alternando + Piso en Movimiento)
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center">
                            <svg class="w-60 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 260 260">
                                <line x1="20" y1="232" x2="240" y2="232" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
                                <line x1="30" y1="240" x2="230" y2="240" stroke="#facc15" stroke-width="3" stroke-dasharray="16,22" stroke-linecap="round">
                                    <animate attributeName="stroke-dashoffset" from="0" to="76" dur="0.7s" repeatCount="indefinite"/>
                                </line>
                                <ellipse cx="130" cy="232" rx="36" ry="7" fill="#000000" opacity="0.5">
                                    <animate attributeName="rx" values="30;40;30" dur="0.4s" repeatCount="indefinite"/>
                                </ellipse>
                                <g>
                                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-7; 0,0" dur="0.4s" repeatCount="indefinite"/>
                                    <!-- Brazo y Pierna Izquierda (Atrás) -->
                                    <g><animateTransform attributeName="transform" type="rotate" values="32 130 98; -32 130 98; 32 130 98" dur="0.8s" repeatCount="indefinite"/><rect x="122" y="94" width="16" height="58" rx="8" fill="#0369a1"/><circle cx="130" cy="154" r="8" fill="#d97757"/></g>
                                    <g><animateTransform attributeName="transform" type="rotate" values="-28 130 152; 28 130 152; -28 130 152" dur="0.8s" repeatCount="indefinite"/><rect x="120" y="148" width="20" height="74" rx="9" fill="#1e293b"/><path d="M 118 216 L 148 216 C 152 216 154 226 146 226 L 118 226 Z" fill="#94a3b8"/></g>
                                    <!-- Torso y Cabeza -->
                                    <rect x="108" y="86" width="44" height="72" rx="16" fill="#0284c7" stroke="#bae6fd" stroke-width="2"/>
                                    <g>
                                        <animateTransform attributeName="transform" type="rotate" values="-3 130 78; 4 130 78; -3 130 78" dur="0.4s" repeatCount="indefinite"/>
                                        <rect x="123" y="72" width="14" height="18" rx="5" fill="#d97757"/>
                                        <circle cx="130" cy="54" r="24" fill="#e08b6b" stroke="#9a3412" stroke-width="2"/>
                                        <path d="M 106 50 C 106 24, 154 24, 154 48 C 142 38, 118 38, 106 50 Z" fill="#0f172a"/>
                                        <circle cx="142" cy="52" r="3.5" fill="#0f172a"/>
                                        <path d="M 136 64 Q 143 68 148 63" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
                                    </g>
                                    <!-- Pierna y Brazo Derecho (Frente) -->
                                    <g><animateTransform attributeName="transform" type="rotate" values="28 130 152; -28 130 152; 28 130 152" dur="0.8s" repeatCount="indefinite"/><rect x="120" y="148" width="20" height="74" rx="9" fill="#334155" stroke="#64748b" stroke-width="1.5"/><path d="M 118 216 L 150 216 C 155 216 156 227 148 227 L 118 227 Z" fill="#facc15" stroke="#ffffff" stroke-width="1.5"/></g>
                                    <g><animateTransform attributeName="transform" type="rotate" values="-32 130 98; 32 130 98; -32 130 98" dur="0.8s" repeatCount="indefinite"/><rect x="122" y="94" width="16" height="58" rx="8" fill="#38bdf8" stroke="#bae6fd" stroke-width="1.5"/><circle cx="130" cy="154" r="8.5" fill="#e08b6b"/></g>
                                </g>
                            </svg>
                            <div class="spring-pop-2 -mt-2 bg-cyan-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-xl">
                                🚶‍♂️ ${scene.card1 || 'Avanzando'} • ${scene.card2 || 'Ruta Activa'}
                            </div>
                        </div>
                    `;

                case 'bacteria_microscope_25d':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-2">
                            <svg class="w-64 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 260 250">
                                <defs>
                                    <radialGradient id="petriGlow" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
                                        <stop offset="70%" stop-color="#065f46" stop-opacity="0.5"/>
                                        <stop offset="100%" stop-color="#022c22" stop-opacity="0.9"/>
                                    </radialGradient>
                                </defs>
                                <!-- Lente de Microscopio 2.5D -->
                                <circle cx="130" cy="118" r="88" fill="url(#petriGlow)" stroke="#34d399" stroke-width="5"/>
                                <circle cx="130" cy="118" r="72" fill="none" stroke="#6ee7b7" stroke-width="1.5" stroke-dasharray="8 6">
                                    <animateTransform attributeName="transform" type="rotate" from="0 130 118" to="360 130 118" dur="10s" repeatCount="indefinite"/>
                                </circle>
                                <!-- Microorganismos animados multiplicándose en 10ms -->
                                <g>
                                    <animateTransform attributeName="transform" type="translate" values="-4,3; 5,-4; -4,3" dur="1.6s" repeatCount="indefinite"/>
                                    <ellipse cx="96" cy="98" rx="18" ry="8" fill="#84cc16" stroke="#ecfccb" stroke-width="2" transform="rotate(-24 96 98)"/>
                                    <circle cx="92" cy="96" r="2.5" fill="#14532d"/>
                                    <circle cx="100" cy="99" r="2.5" fill="#14532d"/>
                                </g>
                                <g>
                                    <animateTransform attributeName="transform" type="translate" values="5,-4; -5,4; 5,-4" dur="1.3s" repeatCount="indefinite"/>
                                    <ellipse cx="152" cy="116" rx="20" ry="9" fill="#facc15" stroke="#fef9c3" stroke-width="2" transform="rotate(32 152 116)"/>
                                    <circle cx="148" cy="114" r="3" fill="#713f12"/>
                                    <circle cx="158" cy="118" r="2.5" fill="#713f12"/>
                                </g>
                                <g>
                                    <animateTransform attributeName="transform" type="scale" values="0.92;1.12;0.92" dur="0.9s" repeatCount="indefinite" additive="sum"/>
                                    <circle cx="118" cy="148" r="11" fill="#fb7185" stroke="#ffe4e6" stroke-width="2"/>
                                    <circle cx="164" cy="84" r="8" fill="#38bdf8" stroke="#e0f2fe" stroke-width="1.8"/>
                                    <circle cx="82" cy="134" r="7" fill="#a78bfa" stroke="#ede9fe" stroke-width="1.8"/>
                                </g>
                                <!-- Línea láser de medición microscópica -->
                                <line x1="48" y1="118" x2="212" y2="118" stroke="#facc15" stroke-width="2.5" opacity="0.85">
                                    <animate attributeName="y1" values="58;178;58" dur="1.5s" repeatCount="indefinite"/>
                                    <animate attributeName="y2" values="58;178;58" dur="1.5s" repeatCount="indefinite"/>
                                </line>
                                <rect x="52" y="198" width="156" height="26" rx="13" fill="#090d16" stroke="#ef4444" stroke-width="2"/>
                                <text x="130" y="215" fill="#fca5a5" font-size="10.5" font-weight="900" text-anchor="middle" font-family="monospace">🦠 ${scene.card3 || '10ms = CONTAGIO'}</text>
                            </svg>
                            <div class="spring-pop-2 -mt-1 bg-rose-600 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-2xl border border-white/50">
                                🔬 ${scene.card1 || 'Transferencia'} • ${scene.card2 || '0.01 Segundos'}
                            </div>
                        </div>
                    `;

                case 'eye_blindspot_test_25d':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-2">
                            <svg class="w-64 h-64 drop-shadow-2xl overflow-visible" viewBox="0 0 260 250">
                                <defs>
                                    <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stop-color="#0f172a"/>
                                        <stop offset="42%" stop-color="#0284c7"/>
                                        <stop offset="85%" stop-color="#38bdf8"/>
                                        <stop offset="100%" stop-color="#0369a1"/>
                                    </radialGradient>
                                </defs>
                                <!-- Ojo anatómico interactivo 2.5D -->
                                <path d="M22 118 Q130 28 238 118 Q130 208 22 118 Z" fill="#f8fafc" stroke="#38bdf8" stroke-width="3.5"/>
                                <circle cx="130" cy="118" r="46" fill="url(#irisGrad)" stroke="#0f172a" stroke-width="2"/>
                                <circle cx="130" cy="118" r="20" fill="#020617"/>
                                <circle cx="144" cy="104" r="7" fill="#ffffff" opacity="0.9"/>
                                <!-- Cruz óptica + Punto ciego desapareciendo -->
                                <g class="actor-beat-2">
                                    <rect x="44" y="182" width="172" height="36" rx="14" fill="#090d16" stroke="#facc15" stroke-width="2"/>
                                    <text x="72" y="206" fill="#ffffff" font-size="18" font-weight="900" text-anchor="middle">✚</text>
                                    <circle cx="184" cy="200" r="10" fill="#ef4444">
                                        <animate attributeName="opacity" values="1;0.08;1" dur="2.2s" repeatCount="indefinite"/>
                                    </circle>
                                    <text x="128" y="203" fill="#94a3b8" font-size="8.5" font-weight="800" text-anchor="middle" font-family="monospace">${scene.card3 || 'PUNTO CIEGO'}</text>
                                </g>
                            </svg>
                            <div class="spring-pop-2 bg-indigo-500 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-2xl border border-white/50">
                                👁️ ${scene.card1 || 'Nervio Óptico'} • ${scene.card2 || 'Cerebro Rellena'}
                            </div>
                        </div>
                    `;

                case 'viral_hook_scoreboard_25d':
                    return `
                        <div class="relative w-full h-full flex flex-col items-center justify-center px-3">
                            <div class="spring-pop w-64 bg-slate-950/90 backdrop-blur-xl border-2 border-amber-400/70 rounded-3xl p-4 shadow-[0_20px_50px_rgba(245,158,11,0.25)] space-y-2.5">
                                <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                                    <span class="text-[10px] font-black text-amber-300 uppercase tracking-wider">⚡ MÉTRICA EN VIVO</span>
                                    <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black font-mono-code">PRO 2.5D</span>
                                </div>
                                <div class="bg-slate-900 rounded-2xl p-3 border border-slate-800 text-center">
                                    <div class="text-xs font-extrabold text-slate-400 uppercase">${scene.card1 || 'IMPACTO VISUAL'}</div>
                                    <div class="text-2xl font-black text-white mt-0.5">${scene.card2 || '94% RETENCIÓN'}</div>
                                </div>
                                <div class="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                                    <div class="h-full w-11/12 bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 rounded-full"></div>
                                </div>
                                <div class="text-[11px] font-black text-cyan-300 text-center">${scene.card3 || 'Resultado Comprobado'}</div>
                            </div>
                        </div>
                    `;

                default:
                case 'cta_conversion':
                    return `
                        <div class="w-full h-full flex flex-col items-center justify-center gap-3.5 px-3">
                            <div class="spring-pop bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-black px-5 py-2 rounded-2xl shadow-xl border border-amber-100 text-xs uppercase tracking-wider">
                                🌐 ${scene.card1 || domain}
                            </div>
                            <div class="relative">
                                <div class="spring-pop-1 cta-pulse bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 text-white font-black px-6 py-3.5 rounded-full border-2 border-white/75 flex items-center gap-2 text-sm sm:text-base tracking-wide shadow-[0_15px_35px_rgba(249,115,22,0.45)]">
                                    <span>🚀</span>
                                    <span>${ctaText}</span>
                                </div>
                                <div class="absolute -bottom-5 -right-3 text-2xl drop-shadow-lg pointer-events-none animate-bounce">
                                    👆
                                </div>
                            </div>
                            <div class="spring-pop-2 bg-slate-950/90 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl shadow-xl border border-amber-400/60 flex flex-col items-center mt-1">
                                <span class="text-base sm:text-lg font-black text-amber-300 leading-none">${priceTag}</span>
                                <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 mt-1">${scene.card2 || 'Comenta o guarda este reel'}</span>
                            </div>
                        </div>
                    `;
            }
        }

