# Rall v054 editions

The homepage picker exposes **Original**, **AI Enhanced** and **Remix** directly.

Original is the verified JavaScript restoration of the 2002 tank game, preserving six original maps, collision masks, graphics and audio. It reconstructs gameplay rather than executing the Windows binary; see [restoration notes](../../games/rall-054/source-notes.md).

AI Enhanced is a faithful restoration. It loads exactly the same app and core modules, controls, six map layouts/collision masks, physics, aiming, siege ammunition, solo progression and duel scoring. Seven newly modeled top-down Blender sprites, smooth scaling and subtle shadows improve presentation. Original music and sound effects preserve the game's identity. Records are separate. Browser comparisons under identical inputs produce identical game states on all six maps while the rendered graphics differ.

Local checks pass 18 full six-map duels, solo progression/loss/replay and Green wins, four touch/keyboard input sizes per browser, both parent/fullscreen suites, 24 critical failed-resource retries, eight additional visible-art/style retries, denied storage and failed/retried music. The Original's 18-duel regression also passes. Homepage direct selection passes four sizes per browser and forwarded fixtures, including real keyboard/touch movement, firing, fullscreen, Back and reload. Final live verification is pending. Mobile contexts are emulated Chromium/Chrome; physical devices and Safari are not covered.

Remix is Beacon Siege: new Blender arenas, capture/extraction missions, destructible cover, shields and ElevenLabs music/effects. Its complete nine-mission browser campaign and other live release checks were verified on homepage commit 7a86c42de7aed09601f51f935c872201f537d6ac, Pages 41788531534. Its game rules remain unchanged by the edition-label correction.
