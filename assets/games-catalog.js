// Only tested releases belong here. The complete work queue is in data/games-inventory.json.
window.joynesPublishedGames = [
  {
    id: "neon-interceptor",
    title: "Neon Bastion & Manta",
    kind: "ai",
    description: "AI-spel · Original 2026 · Två arkadflygspel med 20 respektive 21 sektorer, hangar, bossträning och samarbete för 2–3 piloter. Tangentbord och touch. Spelas liggande.",
    href: "https://neon-interceptor.joynez11.chatgpt.site/",
    embed: false,
    playLabel: "Spela Bastion",
    modes: [["Spela Manta", "https://manta-interceptor.joynez11.chatgpt.site/"]],
    source: "https://github.com/joynes/joynes.se/blob/master/docs/games/neon-interceptor.md",
    sourceLabel: "Om spelen",
    version: "0.3.15"
  },
  {
    id: "network-3d",
    title: "3D Network Game",
    kind: "ai",
    description: "AI-spel · Original 2025 · Utforska en gemensam 3D-skog med andra spelare. Ursprunglig figur och gånganimation, 100 träd och 50 stenar. Tangentbord, mus och två tumkontroller. Figuren hämtas första gången: 51 MiB.",
    href: "https://test-3d-network-game.fly.dev/",
    embed: false,
    playLabel: "Öppna 3D-världen",
    source: "https://github.com/joynes/joynes.se/blob/master/docs/games/network-3d.md",
    sourceLabel: "Om webbversionen",
    version: "1.1.0"
  },
  {
    id: "network-2d",
    title: "Hello Multiplayer Game",
    kind: "ai",
    description: "AI-spel · Original 2025 · Rör färgade figurer på en gemensam spelplan i realtid. Tangentbord, touch och autopilot. Spela tillsammans i egna fönster.",
    href: "https://test-network-game.fly.dev/",
    embed: false,
    playLabel: "Öppna spelplanen",
    modes: [["Autopilot", "https://test-network-game.fly.dev/?bot=1"]],
    source: "https://github.com/joynes/joynes.se/blob/master/docs/games/network-2d.md",
    sourceLabel: "Om webbversionen",
    version: "1.1.0"
  },
  {
    id: "sdl-space",
    title: "SDL Space — hinderbana",
    kind: "retro",
    description: "AI-remake av retrospel · Original 2020 · Undvik inkommande stenar med mus, finger eller tangentbord. Ursprunglig SDL2-/WebAssembly-motor, shadergrafik och ljudeffekt bevarade.",
    href: "games/sdl-space/",
    source: "https://github.com/joynes/sdl2-samples-with-wasm-support/tree/184adda998c5b91e07c0f7cfebe464d87cd4b09a",
    sourceLabel: "Originalkod och webbbygge",
    version: "2020-sdl-web.1"
  },
  {
    id: "car-topview",
    title: "Bilspel ovanifrån",
    kind: "ai",
    description: "AI-spel · Original december 2024 · Fri körning med polisbil, drift och ursprungligt motorljud. Styr med tangentbord eller samtidiga touchknappar. Inga lopp eller poäng.",
    href: "games/car-topview/",
    source: "https://github.com/joynes/joynes.se/tree/master/games/car-topview",
    sourceLabel: "Webbkod och ursprung",
    version: "2024-car-web.1"
  },
  {
    id: "godot-reading",
    title: "Läs och placera",
    kind: "retro",
    description: "AI-remake av retrospel · Original 2023–2024 · Flytta tre föremål och lägg ballongen till höger om raketen. En återställd läsprototyp med två hyllor, golv och nyritade bilder.",
    href: "games/godot-reading/",
    source: "https://github.com/joynes/joynes.se/tree/master/games/godot-reading",
    sourceLabel: "Webbkod och ursprung",
    version: "2024-reading-web.1"
  },
  {
    id: "unity-bus",
    title: "Bus Test Game — Buss",
    kind: "retro",
    description: "AI-remake av retrospel · Original 2023 · Den äldre bussversionen: tre checkpoint-portar, en 3D-stad och ursprunglig Unity-fysik. Mus, tangentbord och touch.",
    href: "games/unity-bus/",
    embed: false,
    source: "https://github.com/joynes/unity_bus",
    sourceLabel: "Originalbygge",
    version: "2023-bus-web.1"
  },
  {
    id: "simple-driving",
    title: "Simple Driving Game — Polisbil",
    kind: "retro",
    description: "AI-remake av retrospel · Original 2023 · Kör polisbilen genom stadens tre portar. Ursprunglig 3D-stad och Unity-fysik, återställd polisbil, tangentbord och touch.",
    href: "games/simple-driving/",
    embed: false,
    source: "https://github.com/joynes/joynes.se/tree/master/games/simple-driving",
    sourceLabel: "Webbkod",
    version: "2023-police-web.1"
  },
  {
    id: "marble-tables",
    title: "Marble Tables",
    kind: "retro",
    description: "AI-remake av retrospel · Original 2022 · En öppen 3D-kulbana. Dra och släpp färgade kulor bland ramperna. Originalets Unity-fysik bevarad, nytt webbgränssnitt med AI.",
    href: "games/marble-tables/",
    embed: false,
    source: "https://github.com/joynes/marble-web-test",
    sourceLabel: "Ursprungligt webbbygge",
    version: "1.0.2-web.1"
  },
  {
    id: "small-wonders",
    title: "Small Wonders / Inuti språkmodellen",
    kind: "ai",
    description: "AI-spel · Spela i egen flik: LLM-tornets introduktion, namnverkstaden och det äldre matematikäventyret. Senare kapitel är förhandsvisningar.",
    href: "https://joynes.github.io/llmspel-play/",
    modes: [["Namnverkstad", "https://joynes.github.io/llmspel-play/?demo"], ["Matematikäventyret", "https://joynes.github.io/llmspel-play/?garden"]],
    embed: false,
    playLabel: "LLM-tornet",
    source: "https://github.com/joynes/llmspel-play",
    sourceLabel: "Webbbygge",
    version: "5d3c30c"
  },
  {
    id: "hardword",
    title: "Skoluppgifter / Ordhjälten",
    kind: "ai",
    description: "AI-spel · Svenska, fem matteområden, läsning, istiden, 19 korsord och Breakout. Åldersval, sparade framsteg, butik och offlinestöd.",
    href: "games/hardword/",
    source: "https://github.com/joynes/hardword",
    version: "118-web.2"
  },
  {
    id: "memit",
    title: "Memit",
    kind: "retro",
    description: "AI-remake av retrospel · Original 2013 · Fyra minneslägen med en återställd Dota-uppsättning: 127 hjältar, bildgissning och namnprov.",
    href: "games/memit/",
    source: "https://github.com/joynes/memit",
    version: "2.0.0"
  },
  {
    id: "quiz-sdl",
    title: "Läs- och ordquiz",
    kind: "retro",
    description: "AI-remake av retrospel · Original 2023 · Tre banor med 35 ord, bildval, bokstavsljud och mynt. Originalets bilder och ljud är bevarade.",
    href: "games/quiz-sdl/",
    source: "https://github.com/joynes/quiz_game",
    version: "1.0.0"
  },
  {
    id: "grimace-codex",
    title: "Milians Grimace Matte-spel — Codex",
    kind: "ai",
    description: "AI-spel · Codex-versionen · Tio plusfrågor och tio minusfrågor. Fortsätt där du slutade eller spela om en klarad bana.",
    href: "games/grimace-codex/",
    source: "https://github.com/joynes/test-codex-math-game",
    version: "2.0.0"
  },
  {
    id: "grimace-gemini",
    title: "Milians Grimace Matte-spel",
    kind: "ai",
    description: "AI-spel · Gemini-versionen · Räkna plus och minus med Grimace. Ökande svårighetsgrad och separata sparade framsteg.",
    href: "games/grimace-gemini/",
    source: "https://github.com/joynes/test-gemini-math-game",
    version: "2.0.0"
  },
  {
    id: "web-quizzes",
    title: "Frågespelet",
    kind: "retro",
    description: "AI-remake av retrospel · Original 2023 · 12 banor och 154 kunskapsfrågor. Spela på dator eller mobil och spara dina bästa resultat.",
    href: "games/web-quizzes/",
    source: "https://github.com/joynes/web_quizzes",
    version: "2.0.0"
  }
];
