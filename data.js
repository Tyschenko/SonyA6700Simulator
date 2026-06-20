/* ============================================================
   A6700 Field Guide — photographic data
   Values grounded in Sony A6700 specs and standard exposure theory.
   ============================================================ */

/* Dial value ladders. Index-based sliders map onto these.
   "ev" = relative brightness contribution in stops (higher = brighter image). */
const APERTURE_STOPS = [
  { label: "f/3.5", f: 3.5, ev: 6.0 },   // widest on kit zooms (wide end)
  { label: "f/4",   f: 4,   ev: 5.5 },
  { label: "f/4.5", f: 4.5, ev: 5.0 },
  { label: "f/5.6", f: 5.6, ev: 4.0 },
  { label: "f/6.3", f: 6.3, ev: 3.5 },   // tele end of your zooms
  { label: "f/8",   f: 8,   ev: 3.0 },
  { label: "f/11",  f: 11,  ev: 2.0 },
  { label: "f/13",  f: 13,  ev: 1.5 },
  { label: "f/16",  f: 16,  ev: 1.0 },
  { label: "f/22",  f: 22,  ev: 0.0 }
];

const SHUTTER_STOPS = [
  { label: "1/4000", s: 1/4000, ev: 0.0 },
  { label: "1/2000", s: 1/2000, ev: 1.0 },
  { label: "1/1000", s: 1/1000, ev: 2.0 },
  { label: "1/500",  s: 1/500,  ev: 3.0 },
  { label: "1/250",  s: 1/250,  ev: 4.0 },
  { label: "1/125",  s: 1/125,  ev: 5.0 },
  { label: "1/60",   s: 1/60,   ev: 6.0 },
  { label: "1/30",   s: 1/30,   ev: 7.0 },
  { label: "1/15",   s: 1/15,   ev: 8.0 },
  { label: "1/8",    s: 1/8,    ev: 9.0 },
  { label: "1/4",    s: 1/4,    ev: 10.0 },
  { label: '1"',     s: 1,      ev: 12.0 },
  { label: '4"',     s: 4,      ev: 14.0 }
];

const ISO_STOPS = [
  { label: "100",   iso: 100,   ev: 0.0 },
  { label: "200",   iso: 200,   ev: 1.0 },
  { label: "400",   iso: 400,   ev: 2.0 },
  { label: "800",   iso: 800,   ev: 3.0 },
  { label: "1600",  iso: 1600,  ev: 4.0 },
  { label: "3200",  iso: 3200,  ev: 5.0 },
  { label: "6400",  iso: 6400,  ev: 6.0 },
  { label: "12800", iso: 12800, ev: 7.0 },
  { label: "25600", iso: 25600, ev: 8.0 },
  { label: "32000", iso: 32000, ev: 8.3 }
];

/* Per-dial contextual hints keyed by index */
const APERTURE_HINTS = [
  "Widest opening on your kit lenses — maximum light and the creamiest background blur.",
  "Still very wide. Lovely subject separation, lots of light.",
  "Wide-ish — about as open as your zooms get at longer focal lengths.",
  "A balanced middle ground. Good blur, a touch more in focus.",
  "Tele end of your 70-350. Sharp subject, softly blurred background.",
  "The classic 'sweet spot' — sharpest results on most lenses. Great for landscapes.",
  "Narrow. Deep focus front-to-back, but you lose a lot of light.",
  "Quite narrow. Everything sharp; watch your shutter/ISO for darkness.",
  "Very narrow — huge depth of field, but diffraction starts to soften fine detail.",
  "Smallest opening. Maximum depth of field, least light, softest from diffraction."
];
const SHUTTER_HINTS = [
  "Blisteringly fast — freezes anything, but needs bright light.",
  "Freezes fast action like birds in flight or a tennis swing.",
  "Freezes sports and running subjects cleanly.",
  "Freezes most action and is forgiving handheld.",
  "Safe everyday speed. Freezes walking people and gestures.",
  "Fine handheld for still subjects. Good general-purpose speed.",
  "Getting slow — fine for static scenes, watch for camera shake.",
  "Slow. Hand-hold carefully (lean on IBIS) or you'll get blur.",
  "Quite slow — moving subjects will streak. Tripod recommended.",
  "Slow enough that handholding usually fails. Use a tripod.",
  "Long exposure territory — tripod only. Great for silky water/light trails.",
  "One full second — tripod essential. Motion becomes artistic streaks.",
  "Several seconds — night, stars, light trails. Tripod + stable ground."
];
const ISO_HINTS = [
  "Base ISO — the cleanest, most detailed your sensor gets. Use it whenever there's enough light.",
  "Still essentially noise-free. Great for daylight.",
  "Very clean. Perfect for shade or overcast days.",
  "Clean for indoor light. Tiny amount of grain at most.",
  "Mild grain, easily cleaned up. Good for dim interiors.",
  "Noticeable grain but very usable — handheld indoors and dusk.",
  "Grain is clear now. Your practical ceiling for keeping detail.",
  "High grain and reduced detail. Use only when you must get the shot.",
  "Heavy grain — emergency use for very dark scenes.",
  "Maximum native ISO. Very noisy; a sharp noisy shot beats a blurry clean one."
];

/* Scenes. baseEV = the total EV the scene needs for a correct exposure
   (sum of aperture.ev + shutter.ev + iso.ev should land near this).
   rec = recommended slider indices [aperture, shutter, iso]. */
const SCENES = {
  portrait: {
    name: "Portrait", img: "assets/scenes/portrait.jpg", baseEV: 10.0,
    rec: [0, 4, 0], priority: "blur",
    blurSubject: 0.18, focusY: 0.42
  },
  landscape: {
    name: "Landscape", img: "assets/scenes/landscape.jpg", baseEV: 8.0,
    rec: [5, 5, 0], priority: "sharp",
    blurSubject: 0.95, focusY: 0.5
  },
  wildlife: {
    name: "Wildlife", img: "assets/scenes/wildlife.jpg", baseEV: 8.5,
    rec: [4, 2, 3], priority: "freeze",
    blurSubject: 0.32, focusY: 0.45
  },
  macro: {
    name: "Macro", img: "assets/scenes/macro.jpg", baseEV: 9.0,
    rec: [5, 4, 2], priority: "blur",
    blurSubject: 0.10, focusY: 0.5
  },
  sports: {
    name: "Sports", img: "assets/scenes/sports.jpg", baseEV: 8.0,
    rec: [3, 2, 2], priority: "freeze",
    blurSubject: 0.40, focusY: 0.4
  },
  night: {
    name: "Night", img: "assets/scenes/night.jpg", baseEV: 17.0,
    rec: [0, 6, 5], priority: "light",
    blurSubject: 0.6, focusY: 0.5
  }
};

/* Scene presets shown in the recipes section */
const PRESETS = [
  {
    scene: "portrait", tag: "People",
    title: "Outdoor portrait, daylight",
    a: 0, s: 4, i: 0,
    why: "A wide f/3.5 melts the background so your subject pops, 1/250 freezes small head movements, and base ISO keeps skin tones clean and smooth.",
    lens: "18-135mm @ 50-85mm or 70-350mm for tight, compressed headshots"
  },
  {
    scene: "landscape", tag: "Nature",
    title: "Sharp landscape",
    a: 5, s: 5, i: 0,
    why: "f/8 is the sharpness sweet spot and gives front-to-back focus, ISO 100 keeps it noise-free, and 1/125 is fine handheld in good light (use a tripod if it drops lower).",
    lens: "16-50mm or 18-135mm at the wide end (16-24mm)"
  },
  {
    scene: "wildlife", tag: "Animals",
    title: "Wildlife & birds",
    a: 4, s: 2, i: 3,
    why: "Your 70-350 opens to ~f/6.3 at the long end, 1/1000 freezes twitchy animals, and ISO 800 keeps that shutter fast without much grain. Use Animal-eye AF.",
    lens: "70-350mm — your reach lens"
  },
  {
    scene: "macro", tag: "Close-up",
    title: "Close-up & detail",
    a: 5, s: 4, i: 2,
    why: "Depth of field is razor-thin up close, so f/8 keeps more of the subject sharp; 1/250 beats tiny hand movements; ISO 400 covers the light you lose stopping down.",
    lens: "70-350mm at distance or 18-135mm up close"
  },
  {
    scene: "sports", tag: "Action",
    title: "Sports & fast action",
    a: 3, s: 2, i: 2,
    why: "1/1000 freezes the moment, f/5.6 gives a little focus margin while staying bright, and ISO 400 balances exposure. Switch to Continuous-Hi burst and 'Faster' min-shutter.",
    lens: "70-350mm for distant action, 18-135mm courtside"
  },
  {
    scene: "night", tag: "Low light",
    title: "Night & city streets",
    a: 0, s: 6, i: 5,
    why: "Open wide to f/3.5 for all the light you can get, 1/60 is the slowest you can safely handhold with IBIS, and ISO 3200 lifts the rest — accept some grain to keep it sharp.",
    lens: "16-50mm or 18-135mm (wide, lets in more light)"
  }
];

/* Condition guides with X/Y/Z reasoning */
const GUIDES = [
  {
    icon: "☀️", title: "Portrait on a bright sunny day",
    sub: "Hard light, plenty to work with",
    recipe: [["f/4","a"],["1/1000","s"],["ISO 100","i"]],
    reasons: [
      ["X", "<strong>Wide aperture (f/4)</strong> blurs the busy background so your subject stands out — even in flat midday light."],
      ["Y", "<strong>Fast shutter (1/1000)</strong> is needed because a wide aperture lets in so much bright sunlight; a slower shutter would blow out the highlights."],
      ["Z", "<strong>Base ISO 100</strong> keeps skin tones clean — there's no reason to amplify when light is abundant."]
    ],
    lens: "Reach for the 18-135mm around 85mm, or the 70-350mm for flattering compression and even more background blur. Position the person in open shade or backlit to avoid harsh shadows and squinting."
  },
  {
    icon: "🌥️", title: "Portrait when light is low (indoors / dusk)",
    sub: "Not enough light — protect sharpness",
    recipe: [["f/3.5","a"],["1/125","s"],["ISO 1600","i"]],
    reasons: [
      ["X", "<strong>Widest aperture (f/3.5)</strong> grabs every bit of available light — critical because your zooms aren't bright primes."],
      ["Y", "<strong>1/125 shutter</strong> is the slowest that still freezes a person's small movements handheld; going slower risks motion blur."],
      ["Z", "<strong>ISO 1600</strong> lifts the exposure the rest of the way. A little grain is far better than a dark or blurry photo — and the A6700 handles it well."]
    ],
    lens: "Use the 16-50mm or 18-135mm at their widest zoom for maximum light. Get your subject near a window. If it's still dark, raise ISO before slowing the shutter further."
  },
  {
    icon: "🏔️", title: "Grand landscape, front-to-back sharp",
    sub: "Maximise depth and detail",
    recipe: [["f/8","a"],["1/125","s"],["ISO 100","i"]],
    reasons: [
      ["X", "<strong>f/8</strong> is the lens's sharpest aperture and gives deep depth of field so foreground rocks and distant peaks are all in focus."],
      ["Y", "<strong>ISO 100</strong> delivers the cleanest file with the widest dynamic range — essential for skies and shadow detail."],
      ["Z", "<strong>1/125 shutter</strong> works handheld in daylight; if light fades and shutter drops below ~1/60, mount a tripod rather than raising ISO."]
    ],
    lens: "16-50mm or 18-135mm at 16-24mm for sweeping wide views. Focus about a third into the scene for the deepest sharpness. Tripod for sunrise/sunset when light is low."
  },
  {
    icon: "🦌", title: "Wildlife & birds",
    sub: "Distant, unpredictable subjects",
    recipe: [["f/6.3","a"],["1/1000","s"],["ISO 800","i"]],
    reasons: [
      ["X", "<strong>1/1000 shutter</strong> (or faster for birds in flight) freezes sudden movement and counters the camera shake that long telephoto reach exaggerates."],
      ["Y", "<strong>f/6.3</strong> is the widest your 70-350 opens to at full reach — it gathers the most light while throwing the background out of focus."],
      ["Z", "<strong>ISO 800</strong> (Auto, capped ~6400) keeps that fast shutter possible. Set min-shutter to 'Faster' so the camera prioritises speed over low ISO."]
    ],
    lens: "The 70-350mm is the lens for this — your only one with real reach (up to 525mm equivalent). Turn on Animal/Bird subject recognition AF and shoot Continuous-Hi bursts."
  },
  {
    icon: "🌷", title: "Macro & close-up detail",
    sub: "Depth of field is paper-thin",
    recipe: [["f/8","a"],["1/250","s"],["ISO 400","i"]],
    reasons: [
      ["X", "<strong>f/8 (or narrower)</strong> is essential because depth of field is razor-thin at close distances — wide apertures leave only a sliver in focus."],
      ["Y", "<strong>1/250 shutter</strong> beats the tiny hand movements that are magnified up close, and any breeze moving the subject."],
      ["Z", "<strong>ISO 400</strong> recovers the light you give up by stopping down to f/8 — a fair trade for the extra sharpness."]
    ],
    lens: "Get close with the 18-135mm, or use the 70-350mm from a short distance for working room (great for skittish insects). Manual focus + focus magnifier nails the plane of focus."
  },
  {
    icon: "🎾", title: "Sports & fast action",
    sub: "Freeze the decisive moment",
    recipe: [["f/5.6","a"],["1/1000","s"],["ISO 400","i"]],
    reasons: [
      ["X", "<strong>1/1000 (or 1/2000)</strong> freezes a sprinter, a racquet swing, or a car so there's no motion blur on the subject."],
      ["Y", "<strong>f/5.6</strong> gives a touch of focus margin (so a moving subject stays sharp) while staying bright enough to feed that fast shutter."],
      ["Z", "<strong>ISO 400</strong> balances the exposure; in dimmer arenas push it up so the shutter never has to slow down — speed matters more than a clean file here."]
    ],
    lens: "70-350mm for distant sidelines action, 18-135mm when you're close. Continuous-Hi drive, AF-C tracking, and 'Faster' min-shutter so the camera always favours speed."
  },
  {
    icon: "🌃", title: "Night & low-light handheld",
    sub: "Survival mode — keep it sharp",
    recipe: [["f/3.5","a"],["1/60","s"],["ISO 3200","i"]],
    reasons: [
      ["X", "<strong>Widest aperture (f/3.5)</strong> opens the lens fully to gather every photon available."],
      ["Y", "<strong>1/60 shutter</strong> is about the slowest you can safely handhold (your IBIS helps); slower and your own movement blurs the shot."],
      ["Z", "<strong>ISO 3200</strong> lifts the rest of the exposure. Grain is the price of a sharp handheld night shot — and it's far better than a blurry one."]
    ],
    lens: "16-50mm or 18-135mm at the widest zoom let in the most light. If you have a tripod, drop to ISO 100, close to f/8 and use a multi-second shutter for clean, glowing night scenes."
  },
  {
    icon: "❄️", title: "Snow, beach & very bright scenes",
    sub: "Stop the camera fooling itself",
    recipe: [["f/8","a"],["1/500","s"],["ISO 100","i"]],
    reasons: [
      ["X", "<strong>Dial in +0.7 to +1 exposure compensation.</strong> The meter sees all that white and underexposes, leaving grey snow — overexpose to make it white again."],
      ["Y", "<strong>ISO 100 + f/8</strong> handle the abundant light cleanly and keep the whole scene sharp."],
      ["Z", "<strong>1/500 shutter</strong> prevents overexposure and freezes any movement; check the histogram so highlights aren't fully clipped."]
    ],
    lens: "Any of your lenses works — choose by framing. A polariser or lens hood helps cut glare off snow and water."
  }
];

/* Lenses */
const LENSES = [
  {
    name: "Sony E 16-50mm f/3.5-5.6 PZ",
    title: "The compact everyday zoom",
    equiv: "≈ 24-75mm equivalent",
    role: "Tiny, light and always-on. Wide enough for rooms and streets, long enough for casual portraits. The one to leave on for walking around.",
    best: ["Street", "Travel light", "Vlogging", "Groups", "Everyday"],
    range: [16, 50], min: 16, max: 350
  },
  {
    name: "Sony E 18-135mm f/3.5-5.6 OSS",
    title: "The do-everything travel zoom",
    equiv: "≈ 27-202mm equivalent",
    role: "The most versatile single lens in your bag. Covers wide landscapes through to portrait and light telephoto without a swap — ideal when you can only carry one.",
    best: ["Travel", "Events", "Portraits", "Hiking", "Daylight wildlife"],
    range: [18, 135], min: 16, max: 350
  },
  {
    name: "Sony E 70-350mm f/4.5-6.3 G OSS",
    title: "The long-reach telephoto",
    equiv: "≈ 105-525mm equivalent",
    role: "Your reach lens. Pulls distant subjects close, compresses backgrounds, and isolates a subject beautifully. The go-to for anything you can't walk up to.",
    best: ["Wildlife", "Birds", "Sports", "Compressed portraits", "Distant detail"],
    range: [70, 350], min: 16, max: 350
  }
];

/* Cheat-sheet subject rows */
const CHEAT_ROWS = [
  ["Portrait (day)", "A / Aperture", "f/3.5-5.6", "1/250+", "100-400", "18-135 / 70-350"],
  ["Portrait (low light)", "A", "f/3.5", "1/125", "1600-3200", "16-50 / 18-135"],
  ["Landscape", "A", "f/8-f/11", "1/125", "100", "16-50 / 18-135 wide"],
  ["Wildlife / birds", "A or M", "f/6.3", "1/1000+", "800-6400", "70-350"],
  ["Macro / close-up", "A or M", "f/8-f/11", "1/250", "400", "18-135 / 70-350"],
  ["Sports / action", "S / Shutter", "f/5.6", "1/1000-1/2000", "400-3200", "70-350 / 18-135"],
  ["Night (handheld)", "A or M", "f/3.5", "1/60", "3200-6400", "16-50 / 18-135"],
  ["Night (tripod)", "M / Manual", "f/8", "2-15 sec", "100", "16-50 / 18-135"],
  ["Snow / beach", "A", "f/8", "1/500", "100", "any (+1 EV comp)"]
];
