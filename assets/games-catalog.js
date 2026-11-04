// Only tested releases belong here. The complete work queue is in data/games-inventory.json.
window.joynesPublishedGames = [
  {
    id: "rall-054",
    title: "Rall v054 — Tanks",
    kind: "retro",
    description: "Retro · 2002 · Original tank battles and AI Enhanced.",
    href: "games/rall-054/",
    editions: [
      { id: "original", label: "Original", href: "games/rall-054/" },
      { id: "enhanced", label: "AI Enhanced", href: "games/rall-054/restored/", version: "1.1.0" }
    ],
    version: "2002-web.4"
  },
  {
    id: "rall-030",
    title: "Rall v030 — Fighter",
    kind: "retro",
    description: "Retro · 1999 · Fighting for one or two players, with stage and character editors.",
    href: "games/rall-030/",
    version: "1999-web.1"
  },
  {
    id: "rall-026",
    title: "Rall v026 — ASCII",
    kind: "retro",
    description: "Retro · 1998 · ASCII rooftop duels for one or two players.",
    href: "games/rall-026/",
    version: "1998-web.1"
  },
  {
    id: "shadow-racer",
    title: "ShadowRacer",
    kind: "retro",
    description: "Retro · 2008 · Original physics, restored graphics and audio.",
    href: "games/shadow-racer/",
    editions: [
      { id: "original", label: "Original", href: "games/shadow-racer/" },
      { id: "enhanced", label: "AI Enhanced", href: "games/shadow-racer/restored/", version: "1.0.0" }
    ],
    version: "2008-web.6"
  },
  {
    id: "worldforge",
    title: "WorldForge",
    kind: "ai",
    description: "AI · 2026 · Build a shared 3D water park.",
    href: "https://worldforge-self-test.joynez11.chatgpt.site/",
    embed: false,
    playLabel: "Open WorldForge",
    version: "9751aa6"
  },
  {
    id: "neon-interceptor",
    title: "Neon Bastion & Manta",
    kind: "ai",
    description: "AI · 2026 · Two arcade shooters with solo and co-op play.",
    href: "https://neon-interceptor.joynez11.chatgpt.site/",
    embed: false,
    playLabel: "Play Bastion",
    modes: [["Play Manta", "https://manta-interceptor.joynez11.chatgpt.site/"]],
    version: "0.3.15"
  },
  {
    id: "network-3d",
    title: "3D Network Game",
    kind: "ai",
    description: "AI · 2025 · Explore a shared 3D forest. First download: 51 MiB.",
    href: "https://test-3d-network-game.fly.dev/",
    embed: false,
    playLabel: "Open 3D world",
    version: "1.1.0"
  },
  {
    id: "network-2d",
    title: "Hello Multiplayer Game",
    kind: "ai",
    description: "AI · 2025 · A shared arena with a touchpad, keyboard and fullscreen.",
    href: "https://test-network-game.fly.dev/",
    embed: false,
    playLabel: "Open arena",
    modes: [["Autopilot", "https://test-network-game.fly.dev/?bot=1"]],
    version: "1.1.2"
  },
  {
    id: "car-topview",
    title: "Top-down Driving",
    kind: "ai",
    description: "Free driving with the original physics.",
    href: "games/car-topview/",
    editions: [
      { id: "original", label: "Original", href: "games/car-topview/" }
    ],
    version: "2024-car-web.6"
  },
  {
    id: "small-wonders",
    title: "Small Wonders",
    kind: "ai",
    description: "AI · Three playable routes: an LLM tower, names and maths.",
    href: "https://joynes.github.io/llmspel-play/",
    modes: [["Name workshop", "https://joynes.github.io/llmspel-play/?demo"], ["Maths adventure", "https://joynes.github.io/llmspel-play/?garden"]],
    embed: false,
    playLabel: "LLM tower",
    version: "ba1f7bf"
  },
  {
    id: "hardword",
    genre: "quiz",
    title: "Learning Games",
    kind: "ai",
    description: "AI · Learning activities, crosswords and Breakout.",
    href: "games/hardword/",
    version: "118-web.3"
  },
  {
    id: "memit",
    genre: "quiz",
    title: "Memit",
    kind: "retro",
    description: "Retro · 2013 · Four memory modes with 127 Dota heroes.",
    href: "games/memit/",
    version: "2.0.0"
  },
  {
    id: "quiz-sdl",
    genre: "quiz",
    title: "Word Quiz",
    kind: "retro",
    description: "Retro · 2023 · Match words, pictures and letter sounds.",
    href: "games/quiz-sdl/",
    version: "1.0.0"
  },
  {
    id: "grimace-codex",
    genre: "quiz",
    title: "Grimace Maths — Codex",
    kind: "ai",
    description: "AI · Codex · Two sets of ten maths questions.",
    href: "games/grimace-codex/",
    version: "2.0.0"
  },
  {
    id: "grimace-gemini",
    genre: "quiz",
    title: "Grimace Maths — Gemini",
    kind: "ai",
    description: "AI · Gemini · Addition and subtraction with growing difficulty.",
    href: "games/grimace-gemini/",
    version: "2.0.0"
  },
  {
    id: "web-quizzes",
    genre: "quiz",
    title: "Quiz Game",
    kind: "retro",
    description: "Retro · 2023 · 154 questions across 12 stages.",
    href: "games/web-quizzes/",
    version: "2.0.0"
  }
];
