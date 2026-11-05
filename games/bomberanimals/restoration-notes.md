# BomberAnimals browser audit · 2026-11-05

Source checkpoint: d655bfa6c1ed7f3d8842db90d5ee6929543c599a. Original shared native source is compiled to WebAssembly; no replacement JavaScript game rules.

Passed `scripts/test-browser.cjs` in installed Chrome at 1280×900, 390×844, 844×390 and 320×740. Actual browser keyboard controls moved both cats simultaneously; independent release completed the current native hop and stopped further hops. Native Chrome touch events moved both players, independent finger lift retained the other input, and cancellation cleared touch ownership. Pause froze native frame count. A browser window-blur event cleared held controls and paused; headless testing does not prove physical operating-system focus transitions. Resume, restart, original decoded effects, mute and fullscreen entry/exit with viewport rotation passed. A keyboard was exercised in every touch-enabled viewport; no physical handset was used.

Solo arrow movement, spawned bombs, actual survival damage, native game over, the return to menu and Play again passed without game-state injection. Read-only native state established gameplay beyond menu visibility. Mobile screenshot inspected for playfield and overlaid controls.

Passed `scripts/test-recovery.cjs`: aborted runtime script, WebAssembly, graphics package and sound file each exposed Retry; removing the failure and retrying started the native game. A missing graphics package initially hung the Emscripten loader; the host now fetches it explicitly and reports failure. Restart blocks a still-held key until release. Fullscreen and viewport rotation retain a held physical-keyboard input. Real WebGL context loss exposes Retry and reloads successfully.

WebKit was not installed for the current Playwright version; it was not counted as a pass. Headless Chrome and emulated mobile sizes are the verified scope.

Public verification: Pages deployment 42079603272 (homepage commit 934c1dcc055b094c7acd8bdfdd93ebda529f33d0) succeeded. `scripts/test-bomberanimals-home.cjs` passed on both the canonical Pages homepage iframe and joynes.se's forwarding frame at all four viewport sizes. The forwarding page's Play link opens the direct game, then native co-op keyboard movement, actual touch/cancel and fullscreen work. The test waits for the game loader and both native players before judging movement. Both routes were tested with the real browser clock.
