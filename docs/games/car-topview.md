# Top-down Driving

**All Remix editions were withdrawn on 4 November 2026 at the owner’s request. Original remains available. Rall054 AI Enhanced is under revision after user reports of sticking and difficult controls; ShadowRacer’s faithful enhanced edition is in development.**

Choose **Original** or **Remix** when the game opens.

The original is Johannes’s Godot 4.3 free-driving prototype from December 2024, preserved as a JavaScript port. Its car PNG, engine WAV and motion formulas are unchanged. The original has no races or scores. The wall collision alignment repair and exact source/media hashes are documented in [source notes](../../games/car-topview/source-notes.md).

## Remix: Night Circuit

A new arcade time-trial game with three distinct courses: Port Lights, Switchback and Garden Sprint. Pass eight gates in order and finish before the time limit. Clean cornering recharges boost. Gold, Silver and Bronze medals, sequential course unlocks, personal records and a saved best-lap ghost provide replay goals. Leaving the road slows the car; prolonged off-road driving recovers it with a three-second penalty.

All courses and the new car were modelled and rendered in Blender 5.2.2 LTS. Optimized JPEG courses, a transparent PNG car and ElevenLabs-generated music, motor and checkpoint sounds total about 860 KB. Reproducible Blender/export scripts, four `.blend` scenes, all twelve original audio takes, prompts, generation IDs and hashes are committed in the existing private `joynes/car_topview_game` repository. The public [provenance manifest](../../games/car-topview/enhanced/provenance.json) identifies the exported assets.

Arrows/WASD drive; Space boosts, P/Escape pauses, R restarts and M toggles sound. A floating thumbpad combines acceleration and steering; a second finger operates boost and the overlaid actions. Both editions support physical keyboards in touch-enabled mobile browsers. All controls stay inside the scene. Fullscreen uses the native API, with an expanded-view fallback and Escape exit. The two editions use separate assets and enhanced save data.

## Verification

The original’s complete image/audio/physics/boundary/recovery suite and desktop/mobile keyboard/touch/fullscreen checks remain required. Its original core, PNG and WAV hashes must remain unchanged.

The enhanced browser suites drive all three courses through real keyboard and native touch events, earn medals, unlock courses, reload saved records/ghosts, verify generated audio output, exercise all eleven asset/module failures and retry into actual driving. Additional checks cover keyboard aliases/independent axes, simultaneous boost, mixed keyboard/touch ownership, cancellation, stale held keys/contacts after restart, real iframe-window blur/resume, in-scene controls, native standalone/iframe fullscreen, both orientations, rotation, immediate keyboard control after fullscreen, fallback/Escape, timeout loss and replay.

These are actual Chromium and Chrome browser-interface checks in desktop and touch-enabled mobile contexts; physical phones/tablets and Safari are not covered. The enhanced edition is a release candidate until the public deployment and file hashes are verified in [the inventory](../../data/games-inventory.json).

[Open editions](https://joynes.github.io/joynes.se/games/car-topview/)

Faithful AI Enhanced is queued separately. The homepage now exposes Original / Remix directly; new gameplay is explicitly labeled Remix.

The direct homepage Original / Remix choices are verified on release 6a98ed689890ff3cfcb3fbf2c122fb154e3dcdc4, Pages 41842371865. Both browsers pass actual driving and full-parent fallback fullscreen/cleanup in desktop and mobile contexts; all 26 runtime/integration hashes match. This updates launch/presentation; game rules are unchanged.
