# Marble Tables

A 2022 retro physics playground with a web interface adapted using AI. Coloured
marbles spawn automatically, bounce against five obstacles, and can be picked up
and dropped. There are no scores, levels or victory conditions. The original
list retains at most 30 marbles and removes those below the scene.

## Preserved original

- Unity source: `joynes/marble_tables`, commit
  `b7994d00c0d740d2d7738028daf5c6528c110372`, 2022-10-10, Unity 2021.3.6f1,
  product version 1.0.2.
- Reused [original web build](https://github.com/joynes/marble-web-test), commit
  `4d139e8a9ba9b5ebe265dd5cb7301da2b4b3578d`, 2022-10-08.
- The four `Build/` files and `StreamingAssets/` configuration remain unchanged.
  The original Unity scene, materials, camera, native dragging and physics run
  in that engine.
- Source and build revisions differ by two days. This is not a claim that the
  later source revision was rebuilt reproducibly. No Unity editor is installed.

The wrapper provides explicit start, loading progress, retry, restart, fullscreen
and responsive layout while preserving the native 960×600 aspect ratio. Restart
loads a fresh document to release the old engine and input state. The homepage
opens the game in its own tab.

## Keyboard and touch update

The interface and instructions are now in English. The keyboard cursor converts
ordinary keyboard actions into mouse events consumed by the unchanged Unity
runtime. It does not write native objects, transforms or physics state.

- Arrow keys move the crosshair; Shift gives fine control.
- Hold Space or Enter to grab and drag a marble. Releasing the last grab key drops it.
- Escape releases; Home centres the crosshair.
- Tab reaches HTML controls even while Unity is running. Keyboard activation of
  buttons, links and help remains available despite Unity's global key capture.
- Blur and page hiding release held controls. A touch or mouse interaction takes
  over from the keyboard cursor. Fullscreen and resize keep the crosshair aligned
  with the actual canvas, including letterboxing.

## Verification

`npm run test:marble:keyboard` starts the game without a mouse and locates real
rendered marbles using image analysis. Actual keyboard events move the cursor,
grab a marble, hold it elsewhere, and release it. The test observes the marble
fall under native gravity. It repeats in desktop and mobile browser contexts,
then checks independent key release, blur cleanup, Tab navigation and fullscreen
alignment. No game state is injected.

`npm run test:marble:browser` covers real mouse and CDP touch dragging, release
and gravity, aspect ratio, restart, fullscreen, homepage launch, category filters
and recovery after blocked WASM and loader requests. The touch-cancellation mode
also verifies a native marble falls after an actual CDP `touchCancel`.

Current local checks passed at desktop 1280×850 and mobile 390×844. The new checks
use Playwright 1.59.1 with Chromium 147 and software WebGL. These are browser
emulation tests, not claims of physical Android/Safari device verification.
Artifacts are under ignored `test-results/marble-*` directories.

## Publication history

The original wrapper was published and verified on 2026-11-01, game commit
`2d3ff421e0f2da60703a53ac6e6490fa352e1473`, successful Pages run `41284460478`.
The 2026-11-02 input update and its canonical release evidence are recorded in
[data/games-inventory.json](../../data/games-inventory.json).

[Play Marble Tables](https://joynes.github.io/joynes.se/games/marble-tables/).

## Input audit — 3 November 2026

Native marble dragging, holding, release under gravity, touch cancellation, keyboard grab/movement, independent key release, actual canvas focus cleanup, restart, fullscreen and loader recovery passed on the public game. The added landscape check reproduced a clipped scene on a short phone viewport. The repaired web layout places controls beside the scene, keeping the complete native view visible. Native physics, camera coordinates and the five Unity build/configuration files are unchanged.

The landscape repair passed native touch/cancellation and attached-keyboard drag/drop checks in a mobile Chromium context before publication. These checks do not claim physical device or operating-system window-focus verification. Use `MARBLE_LANDSCAPE=1` with the browser/keyboard scripts for the added orientation case.
