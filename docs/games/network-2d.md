# Hello Multiplayer Game

Private repository: `joynes/test-network-game`. The original dates from September 2025 and belongs to the AI games category. The current adaptation and its audit commits are preserved on `audit/2026-11-03-baseline` in that existing repository; the original local workspace and default branch remain available.

## Preserved game

An authoritative server shares one 800×450 arena between colourful emoji figures. Movement remains 250 pixels/s with a radius of 20. Client prediction/reconciliation, snapshot interpolation/extrapolation, network tuning and the original `?bot=1`, `?auto=1` and `?autoplay=1` parameters remain. There are no authored races, shooting, missions, persistent accounts or scores.

The server accepts finite, ordered and bounded inputs, limits queues and simulates no more than its own available time. The world exists in process memory, so the existing Fly app uses one Machine. A server restart creates new figures; clients reconnect automatically. No persistent volumes are added.

## Touch, keyboard and fullscreen

The English interface follows the existing AI-game touchpad pattern: a translucent floating thumb control inside the rendered arena, with compact New figure and Fullscreen controls at the opposite edge. There are no button rows below the board. A faint idle pad makes touch movement discoverable.

One contact owns the thumbpad. A second finger cannot steal it or release it. End, cancel, lost capture, focus loss, session restart and fullscreen changes clear movement. Keyboard aliases and independent axes remain usable on a touch-enabled phone or tablet. A reproduced stale-key-repeat defect is fixed: after cleanup, an old held key cannot resume movement until release and a fresh press.

The fullscreen control supports native browser fullscreen through both touch and keyboard. The original world aspect ratio remains intact with letterboxing as needed; the pad and buttons stay over the rendered scene. Browsers without the API get an expanded viewport with the same controls and an Escape exit. Physical phones and Safari still require device-specific verification.

## Verification and publication

The original and revised builds passed server movement, normalization, boundaries, independent players, invalid/duplicate inputs, input ordering, queue limits and server-time-budget tests. Client/server lint passed.

The full browser suite runs three real clients, including a mobile context. It reads actual WebSocket snapshots, checks authoritative movement and remote rendered pixels, reaches four boundaries through ordinary controls, verifies focus release, tuning, owning/secondary fingers, cancellation, new identities, one clock timer, WebSocket failure/retry, genuine autopilot movement and disconnect cleanup. The local suite stops and restarts only its owned server and verifies all clients recover. It never modifies player positions.

The expanded input suite covers keyboard-only desktop, touch-enabled portrait and landscape contexts; aliases and independent axes; focus/restart stale-repeat cleanup; two-finger ownership/cancel; restart with a contact held; native fullscreen entry/exit with touch and keyboard; device rotation while fullscreen; controls within the actual rendered board; and an unsupported-API fallback with Escape.

Version 1.1.1 is deployed from source commit `b0fa91de733e236b0441cb09d66529bc99020f98`. Both full gameplay and expanded input suites passed on the public Fly app, including native fullscreen, real touch and keyboard in mobile contexts. All three public client files match the tested build. The existing single Machine, Stockholm region and VM size are retained. The canonical homepage also passed desktop/mobile arena and autopilot launch checks with native fullscreen. All three integration files matched homepage commit `f907ce217f136b7d12e06935c3f87ffef9d72b79`; Pages run `41715530963` succeeded. Release hashes and results are recorded in [the inventory](../../data/games-inventory.json) and [repository map](../../data/game-repositories.json).

[Play](https://test-network-game.fly.dev/) · [Homepage entry](https://joynes.github.io/joynes.se/#games/ai/network-2d)
