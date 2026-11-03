# Top-down Driving

An AI game under Johannes’s age categories: the original dates from December 2024, within two years of the November 2026 web adaptation. The Original edition is a free-driving prototype with no races, scoring or unlocks. A separate AI Enhanced edition adds a new game.

## Original

Private repository `joynes/car_topview_game`, commit `5450575feeb6d6b42c48e7d2708ea3863da424c8` (24 December 2024). All nine original commits were inspected. The latest `car.gd`, `main.gd`, `node_2d.tscn` and `project.godot` define this adaptation; earlier debugging sliders and an older steering model are excluded.

`car.png` and `engine.wav` are unchanged originals; SHA256 hashes are in `provenance.json`. The 256×256 transparent car is drawn centered at half scale, with its original local 270° rotation. The engine is mono PCM24 at 48 kHz, looped from beginning to end. Godot 4.3’s WAV import enum value 2 means Forward: see the [versioned importer](https://github.com/godotengine/godot/blob/4.3/editor/import/resource_importer_wav.cpp) and [audio import documentation](https://docs.godotengine.org/en/4.3/tutorials/assets_pipeline/importing_audio_samples.html).

## Preserved motion

- The 1024×600 green area has four gray walls, each 20 pixels thick. The car starts at (512,300), rotation 0, speed 0, visually facing left.
- Forward applies −400 units/s² along the car’s local x axis; reverse applies +400.
- Steering rotates at 3 radians/s, even while stationary.
- Each step separates longitudinal and sideways velocity. Friction moves these components toward zero at 200 and 400 units/s² respectively, then recombines them. The sideways factor of 2 produces the original drift.
- Maximum speed is 800 units/s. Opposing controls cancel acceleration; friction continues.
- The rotating collision rectangle is 30×50. The larger image can visually overlap a wall after the collision body has stopped, as in the original image geometry.
- Engine playback rate scales linearly from 0.5 at rest to 3 at maximum speed.

## Web adaptation

This runs JavaScript with fixed 1/60-second steps. It transfers the original motion formulas; it is not a native Godot 4.3 export. Wall contacts use the rotating rectangle’s extents and sliding against axis-aligned walls, rather than an identical implementation of Godot’s `move_and_slide`.

The original wall graphics use top-left positions while their collision rectangles are centered at those positions without a half-size offset. The adaptation aligns collision bodies with the four visible walls. It adds no new obstacles, races or victory conditions.

Start activates browser audio at 50% gain. Reset, pause, WASD, the floating thumbpad, simultaneous acceleration and steering, focus cleanup, fullscreen and sound controls are browser additions. Pause silences audio and releases all controls; normal release allows friction to slow the car. The speed display uses scene pixels/s. Image, audio and module failures offer Retry.

Each physical key retains its own input. One contact owns the floating thumbpad: drag up/down for acceleration/reverse and left/right for steering. A diagonal drag combines the axes. Extra fingers cannot steal the movement contact; they can independently use the in-game actions. Releasing or canceling a contact retains held keyboard inputs. Reset, pause, lost focus, resize and fullscreen changes discard held inputs; stale hardware repeats cannot reactivate them before release and a fresh press. Movement from a contact started before Reset is ignored.

The thumbpad, sound, pause, reset and fullscreen controls sit inside the game view. There is no control row below the board. Game actions handle pointer-down directly because a second touch does not reliably synthesize a browser click. Duplicate mouse/touch clicks are suppressed while native keyboard activation remains available. Fullscreen uses pointer-up, which supplies browser user activation, and also works for a second finger. The shared host helper is `assets/game-view.mjs`. It cleans up input once per fullscreen state change, avoiding duplicate cleanup from the API promise and browser event.

Native fullscreen preserves the 1024×600 scene proportions and keeps all controls over the rendered scene. The homepage iframe permits native fullscreen too. Browsers without the API get an expanded viewport with a visible exit control and Escape support. Start remains disabled until the input module is ready. The interface is in English.

## Verification

`node --test scripts/test-car-topview.mjs` checks acceleration, friction, reverse symmetry, stationary steering, sideways friction, maximum speed, engine pitch, four walls and original media hashes.

`npm run test:car-topview:browser` checks real rendered pixels, forward/reverse/stopping, steering, four walls, pause/reset, the decoded audio loop and its pitch/gain, thumbpad acceleration and steering together, independent secondary-contact release/cancellation, both phone orientations, and image/audio/core-module/shared-host failure recovery followed by driving.

`npm run test:car-topview:input` adds keyboard-only play in desktop, touch-enabled portrait and landscape contexts; overlapping keyboard aliases; mixed keyboard/touch ownership; stale repeat protection after reset/pause/focus; all touch directions; mixed keyboard/touch ownership; second-finger sound/pause/resume/reset/fullscreen actions; touch restart; real frame-window focus loss and resume; controls entirely inside the scene; native standalone and embedded fullscreen through touch/keyboard; in-fullscreen rotation; the missing-API fallback and Escape; and returning from the embedded game to the homepage. Tests observe rendered coordinates, control classes and Web Audio objects, without changing game state. These are Chromium browser checks, not physical-device or Safari certification.

## AI Enhanced: Night Circuit

The launch screen also offers a separate new time-trial game. Three Blender-rendered courses, a new car model, ordered gates, boost charged by cornering, medals, unlocks and a saved personal-best ghost extend the driving idea. Its arcade driving rules are new; the Original edition retains the restored physics and media. Music, motor and checkpoint sounds were generated with ElevenLabs. Asset prompts, model/generation IDs and hashes are recorded in [enhanced provenance](enhanced/provenance.json). Blender scenes, reproducible export scripts and the generated source audio are preserved in the existing private game repository.

The enhanced edition uses its own assets and `joynes:night-circuit:v1` records. Touch, keyboard, second-finger actions, focus/restart cleanup and fullscreen are verified separately for both editions.
