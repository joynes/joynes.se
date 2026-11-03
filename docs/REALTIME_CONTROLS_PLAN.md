# Real-time touch controls and fullscreen

Every real-time game must support all gameplay actions through touchscreen input and a physical keyboard, including a keyboard attached to a phone or tablet. Touch controls belong inside the game view; no control rows should sit below the board. Use the existing AI games as the reference: a translucent floating thumbpad or direct dragging for movement, with action buttons over the opposite edge. Preserve the original game mechanics. Keep website and game-interface labels, descriptions and help concise and in English.

Provide an in-game fullscreen control usable by touch and keyboard. Keep the original scene proportions, use the complete available viewport and keep touch controls over the visible game. Test entry, exit and orientation changes. When the browser lacks the Fullscreen API, provide an expanded game view with a visible exit control.

Work on one game at a time: checkpoint its source, implement, verify actual gameplay through browser inputs, commit, publish and repeat the checks on the public release. Verify independent key/contact release, simultaneous gameplay actions, cancellation, focus loss and restart. A menu or successful build alone is insufficient.

## Current queue

1. Hello Multiplayer is complete: full local/live gameplay and input suites, in-game thumbpad, native fullscreen, rotation and homepage integration passed.
2. Top-down Driving is complete: all touch directions, an in-game floating thumbpad and overlaid actions, second-finger controls, standalone/iframe native fullscreen and rotation passed locally and live.
3. SDL Space is complete: native gameplay, all drag directions, second-finger actions, rotation, audio, held-contact restart and iframe fullscreen passed locally and live. Car and SDL also pass direct-window launch/fullscreen through joynes.se.
4. Check the remaining real-time releases individually: Ordhjälten/Breakout, Small Wonders (three routes), Marble Tables, Läs och placera, 3D Network Game, Neon Bastion and Manta, WorldForge, ShadowRacer, Rall v026 and Rall v030. Their earlier results remain valid for the tested scope; the additional fullscreen/control-placement requirements still need verification.
5. Hello Multiplayer’s second-finger restart/fullscreen defect is fixed in 1.1.2 and verified locally/live. Recheck secondary-finger activation on each remaining game.
6. Finish the unpublished native Rall adaptations without treating archive links as playable releases. Each must satisfy the same requirements before publication.

Per-game state and source/result commits are tracked in [game-repositories.json](../data/game-repositories.json). The wider publication queue remains in [GAME_PUBLICATION_PLAN.md](GAME_PUBLICATION_PLAN.md).
