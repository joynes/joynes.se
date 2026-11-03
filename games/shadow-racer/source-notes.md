# ShadowRacer: sources and web adaptation

Johannes’s 2008 game belongs to Retro games. Both archived releases run their original ActionScript 3 / APE engine in self-hosted Ruffle. The original binaries and physics are preserved.

## Archived releases

Source folder: [ShadowRacerPrototype2](https://drive.google.com/drive/folders/1TT9grPo0r_9tHhVN6Lm97YAjC5JnzQh7).

| Release | Original bytes | SHA256 |
| --- | ---: | --- |
| 28 September 2008 | 20,341 | ca347f3481ee254d60ec3bd856821b6f6546f8567120872509659844622a4e3b |
| 5 October 2008 | 32,428 | 4bf85f616c53e2f11fef8c40458e032c2555cbf0a8951bcddcf1f5ca26d73c89 |

Both are unchanged under `original/`; October is the default. The nested release is byte-identical to September. The `history` folder contains Flex browser-history support.

The existing private `joynes/shadow-racer` repository preserves five available ActionScript source files under `original-source/`, with hashes. This is a partial source archive: Car, Surfaces, APEngine and two main classes. The main classes differ in their class/constructor names.

## Original game

The 650 × 350 scene, vector graphics, sprung car, wheels, rear-wheel drive, soft body, complete course, gravity, collisions, camera and timer remain. APE uses a 1/4 step and gravity (0,2). Native throttle is 0.3, reverse −0.1 and lean force 7. The sixth body collision ends a run; the native car passing x > 3400 finishes it.

The original has one course, no audio and unfinished ghost recording. The web host shows actual native time in seconds and stores finishes locally, separately by release. The abandoned leaderboard is redirected to an embedded English message; driver names and times are not sent to it.

## Browser controls

The concise English host replaces the visible native HUD. The native fields remain beneath a matching overlay. Driver names are user content.

The floating thumbpad combines throttle and lean; right-hand throttle/reverse buttons support a second finger. Every action stays inside the scene. One contact owns the pad; another cannot steal or release it. Buttons support touch and keyboard activation. Arrows/WASD retain separate physical-key ownership in desktop and mobile browsers.

The archived engine polls one key per native frame. Several held actions are routed across successive native frames using ordinary keyboard events. Opposing directions cancel. The host never writes native car position, force, collisions, timer, score or mode. Contact release/cancellation retains independent keyboard actions. Pause, restart, resize, fullscreen and focus loss clear input; stale hardware repeats and old contacts cannot reactivate movement.

Pause uses Ruffle suspend/resume and freezes the native timer. Fullscreen preserves scene proportions and keeps all controls inside the rendered view. Missing APIs use an expanded viewport with an exit and Escape. The homepage delegates fullscreen; joynes.se launches a direct window because its forwarding frame denies fullscreen.

## Observer and licenses

A guarded trace at the start of `run` reads native mode, car/body/wheel positions, collisions, timer, key and frame. Every original instruction remains; the other 337 methods are byte-identical. Inserted instructions only read, branch and trace. [The proof](native-observer-proof.json), `scripts/build-shadow-racer.py` and `scripts/test-shadow-racer.py` reproduce and verify both movies.

Ruffle 0.7.1 is fully vendored with both WASM variants, source maps and MIT/Apache licenses. The original APE [MIT license](LICENSE_APE) is preserved. First load is about 15 MB.

## Verification

Both releases require actual keyboard/native touch checks for all directions, combined native actions, independent release, mixed ownership, cancellation, stale input, second-finger actions, pause/time, fullscreen/rotation and fallback. A frame-timed full-race pilot uses ordinary DOM keyboard events and reads the native observer; separate input tests use trusted browser keyboard and native touch events to verify crashes, finishes, saved results, release switching and failed-load recovery. Native state is observed, never injected.

These are desktop and touch-enabled Chromium/Chrome checks. Physical devices and Safari require separate verification. Current results and exact release identities are recorded in the homepage inventory.
