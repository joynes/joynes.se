# Top-down Driving

An AI game under Johannes’s age categories: the original dates from December 2024, within two years of the November 2026 web adaptation. This is a free-driving prototype with no races, scoring or unlocks.

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

Start activates browser audio at 50% gain. Reset, pause, WASD, mouse/touch buttons, simultaneous acceleration and steering, focus cleanup and sound controls are browser additions. Pause silences audio and releases all controls; normal release allows friction to slow the car. The speed display uses scene pixels/s. Image, audio and module failures offer Retry.

Each physical key and touch contact owns its input independently. Releasing or canceling one contact retains other inputs. Reset, pause and lost focus discard held inputs; stale hardware key repeats cannot reactivate them before release and a fresh press. Touch movement from a contact started before Reset is also ignored. The browser interface is in English.

## Verification

`node --test scripts/test-car-topview.mjs` checks acceleration, friction, reverse symmetry, stationary steering, sideways friction, maximum speed, engine pitch, four walls and original media hashes.

`npm run test:car-topview:browser` checks real rendered pixels, forward/reverse/stopping, steering, four walls, pause/reset, the decoded audio loop and its pitch/gain, simultaneous touch and independent release/cancellation, both phone orientations, and image/audio/module failure recovery followed by driving.

`npm run test:car-topview:input` adds keyboard-only play in desktop, touch-enabled portrait and landscape contexts; overlapping keyboard aliases; mixed keyboard/touch ownership; stale repeat protection after reset/pause/focus; touch restart; real frame-window focus loss and resume; visible landscape controls; and returning from the embedded game to the homepage. Tests observe rendered coordinates, control classes and Web Audio objects, without changing game state. These are Chromium browser checks, not physical-device or Safari certification.
