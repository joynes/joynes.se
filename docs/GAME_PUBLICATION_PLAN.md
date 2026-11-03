# Game publication plan

Make every identified game and relevant version from GitHub and Google Drive playable on the web, tested and published. Work on one game at a time and commit changes. An archive link, successful build or visible menu is not a finished web adaptation.

## Repository checkpoint and renewed audit

The current owner request is to checkpoint every game in its own repository before further repairs, reuse existing repositories, and create private repositories where no source repository exists. [game-repositories.json](../data/game-repositories.json) tracks the repository, baseline commit and new audit separately from historical release evidence. Public source-repository visibility is being clarified; public release hosting remains available.

Audit published games in inventory order, one game at a time, including touch and keyboard in a mobile context. Record actual gameplay and recovery results, repair failures, then commit each tested result in its game repository and update the homepage release when needed. Keep unfinished Rall adaptations in the queue and keep the two excluded demos removed.

## Current priorities

Finish **rall0054**, **v080** and **rall008** as separate games. They are not yet playable web releases. The active rall0054 compatibility investigation is recorded in [the input audit](INPUT_SUPPORT_AUDIT.md).

Eighteen games remain published after removing the police-car and bus proof-of-concept demos at the owner's request. These demos must not be republished without a new request. That count does not mean that the new physical-keyboard-on-mobile requirement has already been verified for every game. Existing releases receive an additional input audit; Marble Tables is the first explicit keyboard repair.

## Required behaviour

- English interface, help and new documentation.
- Mobile touch and physical-keyboard gameplay, including a keyboard attached to a phone or tablet.
- Complete gameplay actions with simultaneous inputs where required; clean release after cancellation, blur, pause and restart.
- Readable portrait and landscape layouts and working homepage launch paths.
- Preserve the original gameplay, levels, graphics and audio. Keep original archives and document compatibility changes and uncertain version relationships.
- Test real multiplayer clients and servers when multiplayer is part of the game.

## Website sections

Games contains three subsections: Quiz games, Retro games and AI games. Knowledge, word and maths quizzes are grouped under Quiz games; the other games follow the Retro/AI classification.

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
| 7 | Small Wonders / Inuti språkmodellen | Published and verified under earlier release checks |
| 8 | Marble Tables | Published and verified under earlier release checks |
| 9 | Simple Driving Game | Excluded at owner request; do not republish |
| 10 | Bus Test Game | Excluded at owner request; do not republish |
| 11 | Godot Reading Game | Published and verified under earlier release checks |
| 12 | Bilspel ovanifrån | Published and verified under earlier release checks |
| 13 | SDL Space / hinderbana | Published and verified under earlier release checks |
| 14 | Hello Multiplayer Game | Published and verified under earlier release checks |
| 15 | 3D Network Game | Published and verified under earlier release checks |
| 16 | Neon Bastion & Manta | Published and verified under earlier release checks |
| 17 | WorldForge | Published and verified under earlier release checks |
| 18 | ShadowRacer | Published and verified under earlier release checks |
| 19 | Rall v026 — ASCII | Published and verified under earlier release checks |
| 20 | Rall v030 — Fighter | Published and verified under earlier release checks |
| 21 | Rall v054 / rall0054 — Tank | In progress — not yet published |
| 22 | Rall006 — Tank | Pending |
| 23 | Rall v066 — Tank2 | Pending |
| 24 | Rall v073 — Party | Pending |
| 25 | Rall v080 — Fighter | Pending |
| 26 | Rall008 | Pending |
| 27 | Rall v082 — Fighter Multi | Pending |

## Additional candidates

Inspect picture_puzzle, lightbot, relearn and test_share_unity_hello_world before classifying or excluding them. Empty starters must not be presented as completed games. Jaro/Grodan story and artwork folders and the 10–20 Rall photo album are archive material rather than game programs. Engine scaffolds also require evidence of actual gameplay before being listed as games.

## Input audit

[INPUT_SUPPORT_AUDIT.md](INPUT_SUPPORT_AUDIT.md) tracks the expanded touch and physical-keyboard requirement, including attached-keyboard scenarios in a mobile browser. Earlier release evidence remains historical evidence; new input checks must be recorded explicitly.
