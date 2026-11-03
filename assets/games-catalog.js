// Only tested releases belong here. The complete work queue is in data/games-inventory.json.
window.joynesPublishedGames = [
  {
    id: "rall-030",
    title: "Rall v030 — Fighter",
    kind: "retro",
    description: "AI remake of a retro game · Original 1999 · Side-scrolling combat with fists, swords and computer opponents. Original stages, two players, music, and character and stage editors. Keyboard and touch.",
    href: "games/rall-030/",
    source: "https://github.com/joynes/joynes.se/blob/master/games/rall-030/source-notes.md",
    sourceLabel: "Sources and preservation",
    version: "1999-web.1"
  },
  {
    id: "rall-026",
    title: "Rall v026 — ASCII",
    kind: "retro",
    description: "AI remake of a retro game · Original 1998 · Rooftop duels with the original ASCII graphics, voices and music. One player against the computer or two players on one screen. Keyboard and touch.",
    href: "games/rall-026/",
    source: "https://github.com/joynes/joynes.se/blob/master/games/rall-026/source-notes.md",
    sourceLabel: "Sources and preservation",
    version: "1998-web.1"
  },
  {
    id: "shadow-racer",
    title: "ShadowRacer",
    kind: "retro",
    description: "AI remake of a retro game · Original 2008 · Drive a sprung car through the complete obstacle course. Two preserved original editions, crashes, timing and local records. Keyboard and touch.",
    href: "games/shadow-racer/",
    source: "https://github.com/joynes/joynes.se/blob/master/games/shadow-racer/source-notes.md",
    sourceLabel: "Sources and preservation",
    version: "2008-web.1"
  },
  {
    id: "worldforge",
    title: "WorldForge",
    kind: "ai",
    description: "AI game · Original 2026 · Build a shared 3D water park with other players. Blocks, pools, slides and custom characters are saved. Keyboard, mouse and landscape touch controls.",
    href: "https://worldforge-self-test.joynez11.chatgpt.site/",
    embed: false,
    playLabel: "Open WorldForge",
    source: "https://github.com/joynes/joynes.se/blob/master/docs/games/worldforge.md",
    sourceLabel: "About the game",
    version: "9751aa6"
  },
  {
    id: "neon-interceptor",
    title: "Neon Bastion & Manta",
    kind: "ai",
    description: "AI game · Original 2026 · Two arcade shooters with 20 and 21 sectors, a hangar, boss practice and co-op for 2–3 pilots. Keyboard and touch. Play in landscape.",
    href: "https://neon-interceptor.joynez11.chatgpt.site/",
    embed: false,
    playLabel: "Play Bastion",
    modes: [["Play Manta", "https://manta-interceptor.joynez11.chatgpt.site/"]],
    source: "https://github.com/joynes/joynes.se/blob/master/docs/games/neon-interceptor.md",
    sourceLabel: "About the games",
    version: "0.3.15"
  },
  {
    id: "network-3d",
    title: "3D Network Game",
    kind: "ai",
    description: "AI game · Original 2025 · Explore a shared 3D forest with other players. Original character and walking animation, 100 trees and 50 rocks. Keyboard, mouse and two touch sticks. Initial character download: 51 MiB.",
    href: "https://test-3d-network-game.fly.dev/",
    embed: false,
    playLabel: "Open 3D world",
    source: "https://github.com/joynes/joynes.se/blob/master/docs/games/network-3d.md",
    sourceLabel: "About the web version",
    version: "1.1.0"
  },
  {
    id: "network-2d",
    title: "Hello Multiplayer Game",
    kind: "ai",
    description: "AI game · Original 2025 · Move colourful characters around a shared arena in real time. Keyboard, touch and autopilot. Play together in separate windows.",
    href: "https://test-network-game.fly.dev/",
    embed: false,
    playLabel: "Open arena",
    modes: [["Autopilot", "https://test-network-game.fly.dev/?bot=1"]],
    source: "https://github.com/joynes/joynes.se/blob/master/docs/games/network-2d.md",
    sourceLabel: "About the web version",
    version: "1.1.0"
  },
  {
    id: "sdl-space",
    title: "SDL Space — hinderbana",
    kind: "retro",
    description: "AI remake of a retro game · Original 2020 · Dodge incoming rocks with a mouse, finger or keyboard. Original SDL2/WebAssembly engine, shader graphics and sound effect preserved.",
    href: "games/sdl-space/",
    source: "https://github.com/joynes/sdl2-samples-with-wasm-support/tree/184adda998c5b91e07c0f7cfebe464d87cd4b09a",
    sourceLabel: "Original code and web build",
    version: "2020-sdl-web.1"
  },
  {
    id: "car-topview",
    title: "Bilspel ovanifrån",
    kind: "ai",
    description: "AI game · Original December 2024 · Free driving with a police car, drifting and the original engine sound. Keyboard or simultaneous touch buttons. No races or scoring.",
    href: "games/car-topview/",
    source: "https://github.com/joynes/joynes.se/tree/master/games/car-topview",
    sourceLabel: "Web code and origins",
    version: "2024-car-web.1"
  },
  {
    id: "godot-reading",
    title: "Läs och placera",
    kind: "retro",
    description: "AI remake of a retro game · Original 2023–2024 · Move three objects and place the balloon to the right of the rocket. A restored reading prototype with two shelves, a floor and newly drawn pictures.",
    href: "games/godot-reading/",
    source: "https://github.com/joynes/joynes.se/tree/master/games/godot-reading",
    sourceLabel: "Web code and origins",
    version: "2024-reading-web.1"
  },
  {
    id: "marble-tables",
    title: "Marble Tables",
    kind: "retro",
    description: "AI remake of a retro game · Original 2022 · An open 3D marble playground. Drag and drop colourful marbles among the ramps. Original Unity physics preserved, with a new interface made using AI. Touch, mouse and keyboard.",
    href: "games/marble-tables/",
    embed: false,
    source: "https://github.com/joynes/marble-web-test",
    sourceLabel: "Original web build",
    version: "1.0.2-web.1"
  },
  {
    id: "small-wonders",
    title: "Small Wonders / Inuti språkmodellen",
    kind: "ai",
    description: "AI game · Open in a separate tab: the LLM tower introduction, name workshop and earlier maths adventure. Later chapters are previews.",
    href: "https://joynes.github.io/llmspel-play/",
    modes: [["Name workshop", "https://joynes.github.io/llmspel-play/?demo"], ["Maths adventure", "https://joynes.github.io/llmspel-play/?garden"]],
    embed: false,
    playLabel: "LLM tower",
    source: "https://github.com/joynes/llmspel-play",
    sourceLabel: "Web build",
    version: "5d3c30c"
  },
  {
    id: "hardword",
    title: "Skoluppgifter / Ordhjälten",
    kind: "ai",
    description: "AI game · Swedish, five maths areas, reading, the Ice Age, 19 crosswords and Breakout. Age selection, saved progress, a shop and offline support.",
    href: "games/hardword/",
    source: "https://github.com/joynes/hardword",
    version: "118-web.2"
  },
  {
    id: "memit",
    title: "Memit",
    kind: "retro",
    description: "AI remake of a retro game · Original 2013 · Four memory modes with a restored Dota set: 127 heroes, picture guessing and name tests.",
    href: "games/memit/",
    source: "https://github.com/joynes/memit",
    version: "2.0.0"
  },
  {
    id: "quiz-sdl",
    title: "Läs- och ordquiz",
    kind: "retro",
    description: "AI remake of a retro game · Original 2023 · Three stages with 35 words, picture choices, letter sounds and coins. Original pictures and audio preserved.",
    href: "games/quiz-sdl/",
    source: "https://github.com/joynes/quiz_game",
    version: "1.0.0"
  },
  {
    id: "grimace-codex",
    title: "Milians Grimace Matte-spel — Codex",
    kind: "ai",
    description: "AI game · Codex edition · Ten addition and ten subtraction questions. Continue your progress or replay a completed stage.",
    href: "games/grimace-codex/",
    source: "https://github.com/joynes/test-codex-math-game",
    version: "2.0.0"
  },
  {
    id: "grimace-gemini",
    title: "Milians Grimace Matte-spel",
    kind: "ai",
    description: "AI game · Gemini edition · Practise addition and subtraction with Grimace. Increasing difficulty and separately saved progress.",
    href: "games/grimace-gemini/",
    source: "https://github.com/joynes/test-gemini-math-game",
    version: "2.0.0"
  },
  {
    id: "web-quizzes",
    title: "Frågespelet",
    kind: "retro",
    description: "AI remake of a retro game · Original 2023 · 12 stages and 154 knowledge questions. Play on desktop or mobile and save your best results.",
    href: "games/web-quizzes/",
    source: "https://github.com/joynes/web_quizzes",
    version: "2.0.0"
  }
];
