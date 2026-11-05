# Game publication plan

Make every identified game and relevant version from GitHub and Google Drive playable on the web, tested and published. Work on one game at a time and commit changes. An archive link, successful build or visible menu is not a finished web adaptation.

## Repository checkpoint and renewed audit

The current owner request is to checkpoint every game in its own repository before further repairs, reuse existing repositories, and create private repositories where no source repository exists. [game-repositories.json](../data/game-repositories.json) tracks the repository, baseline commit and new audit separately from historical release evidence. Public source-repository visibility is being clarified; public release hosting remains available.

Each checkpoint must retain the original source tree alongside the nested web copy. Source paths were compared with their original commit, and the resulting restoration/checkpoint commits are recorded in the repository map. Never commit an uninitialized empty Git index over an existing source tree.

Audit published games in inventory order, one game at a time, including touch and keyboard in a mobile context. Record actual gameplay and recovery results, repair failures, then commit each tested result in its game repository and update the homepage release when needed. Keep unfinished Rall adaptations in the queue and keep the two excluded demos removed.

## Current priorities

Rall054 Original and AI Enhanced 1.1 are published and verified. ShadowRacer Original and faithful AI Enhanced 1.0 are also published and verified. The enhanced editions retain the original game identity; current checks and source commits are in the inventory.

Rall v080 and Rall008 have playable hosted builds but are unlisted at the owner’s request because they are personal. Do not relist them. Marble Tables, Read and Place, SDL Space — Survival and all Remix editions remain withdrawn; their source and media are preserved privately. Keep the police-car and bus POCs excluded. No Source or Folder buttons belong in the game listings.

Continue faithful enhanced work with the remaining eligible adapted older games, one at a time. Existing release evidence is historical; each new edition needs actual keyboard/touch gameplay and fullscreen checks before publication. The publication inventory and catalog are the current release list.

## Required behaviour

- English interface, help and new documentation.
- Mobile touch and physical-keyboard gameplay, including a keyboard attached to a phone or tablet.
- Complete gameplay actions with simultaneous inputs where required; clean release after cancellation, blur, pause and restart.
- Readable portrait and landscape layouts and working homepage launch paths.
- Preserve the original gameplay, levels, graphics and audio. Keep original archives and document compatibility changes and uncertain version relationships.
- Test real multiplayer clients and servers when multiplayer is part of the game.

## Website sections

Game filters are All games, Retro games, AI games and Quiz games, with Quiz games last. Memit belongs to Quiz games. Knowledge, word and maths quizzes are grouped under Quiz games; the other games follow the Retro/AI classification.

## Categories

**Retro games** are older originals adapted for the web using AI. **AI games** are the newer games from roughly the last two years, following Johannes's classification. A new adaptation does not change an older original into a newer AI game.

## Workflow for each game

1. Inspect the original release, source, documentation, mechanics and assets.
2. Reuse a working web build or adapt the native game faithfully. A generic demo with the same title is insufficient.
3. Implement English instructions, both input methods, start, restart and error recovery.
4. Run meaningful gameplay and browser tests: movement or answers, success/failure, restart, stage changes, touch, desktop keyboard and mobile-browser keyboard. Use actual input events rather than forcing game state.
5. Inspect desktop and mobile screenshots, fix observed issues and rerun relevant checks.
6. Make a game-specific commit and publish only the tested version. Static games use the existing GitHub Pages site; existing separate game services retain their appropriate hosting.
7. Verify gameplay, links and release identity at the canonical public URL. Record evidence and commits in [the inventory](../data/games-inventory.json), then commit the status update.
8. Advance only after verification, or document a concrete limitation that currently prevents completion. Never mark an unfinished adaptation as published and verified.

## Inventory

The machine-readable queue, source links, version relationships, test evidence and URLs are in [games-inventory.json](../data/games-inventory.json). Original titles below remain identifiers for the archived games.

| Order | Game | Release status |
| --- | --- | --- |
| 1 | Frågespelet | Published and verified under earlier release checks |
| 2 | Milians Grimace Matte-spel — Gemini | Published and verified under earlier release checks |
| 3 | Milians Grimace Matte-spel — Codex | Published and verified under earlier release checks |
| 4 | Läs- och ordquiz | Published and verified under earlier release checks |
| 5 | Memit | Published and verified under earlier release checks |
| 6 | Skoluppgifter / Ordhjälten | Published and verified under earlier release checks |
| 7 | Small Wonders / Inuti språkmodellen | Removed from homepage at owner request |
| 8 | Marble Tables | Withdrawn at owner request |
| 9 | Simple Driving Game | Excluded at owner request; do not republish |
| 10 | Bus Test Game | Excluded at owner request; do not republish |
| 11 | Godot Reading Game | Withdrawn at owner request |
| 12 | Top-down Driving | Withdrawn at owner request |
| 13 | SDL Space — Survival | Withdrawn at owner request |
| 14 | Hello Multiplayer Game | Removed from homepage at owner request |
| 15 | 3D Network Game | Published and verified under earlier release checks |
| 16 | Neon Bastion & Manta | Published and verified under earlier release checks |
| 17 | WorldForge | Published and verified under earlier release checks |
| 18 | ShadowRacer | Original and faithful AI Enhanced published and verified |
| 19 | Rall v026 — ASCII | Published and verified under earlier release checks |
| 20 | Rall v030 — Fighter | Published and verified under earlier release checks |
| 21 | Rall v054 / rall0054 — Tank | Original and AI Enhanced 1.1 published and verified |
| 22 | Rall006 — Tank | Pending |
| 23 | Rall v066 — Tank2 | Pending |
| 24 | Rall v073 — Party | Pending |
| 25 | Rall v080 — Fighter | Hosted build retained; unlisted at owner request |
| 26 | Rall008 | Hosted build retained; unlisted at owner request |
| 27 | Rall v082 — Fighter Multi | Pending |

## Additional candidates

Inspect picture_puzzle, lightbot, relearn and test_share_unity_hello_world before classifying or excluding them. Empty starters must not be presented as completed games. Jaro/Grodan story and artwork folders and the 10–20 Rall photo album are archive material rather than game programs. Engine scaffolds also require evidence of actual gameplay before being listed as games.

## Input audit

[INPUT_SUPPORT_AUDIT.md](INPUT_SUPPORT_AUDIT.md) tracks the expanded touch and physical-keyboard requirement, including attached-keyboard scenarios in a mobile browser. Earlier release evidence remains historical evidence; new input checks must be recorded explicitly.

Small Wonders, Top-down Driving and Hello Multiplayer Game are withdrawn from homepage publication. Their original source remains in the existing private repositories. Standalone Small Wonders and multiplayer deployments are separate from this homepage withdrawal.
