# Rall v054 editions

The homepage offers Original and AI Enhanced. All Remix editions are withdrawn; their source and assets remain private.

Original reconstructs the 2002 tank game in JavaScript using six archived maps, original collision data, graphics and audio. It does not execute the Windows binary. See the restoration notes beside the game.

AI Enhanced 1.1 keeps the same engine, six arena layouts, movement physics, weapons, finite siege ammunition and solo/duel progression. It removes disconnected decorative collision fragments smaller than 24 pixels, preserving continuous walls and substantial obstacles. Directional touch Drive, assisted Aim/fire and driving to leave siege address the owner’s control feedback. Physical keyboard profiles remain available on mobile. Solo uses a closer camera and whole-map radar; duels show the whole arena. Blender tank sprites and terrain, clearer obstacle edges, three ElevenLabs instrumental tracks and new cannon/siege/explosion effects improve presentation. Two short mode cues use local synthesis. Records are separate.

Local browser checks pass all six maps: six physical-keyboard full duels plus twelve native-touch drives and twelve full duels across portrait/landscape. Solo keyboard and touch checks cover real AI combat, next stage/two enemies, saved score, real defeat/replay and a Green duel win. Both browsers pass four input sizes, simultaneous controls, independent release/cancel, focus, restart and fullscreen. Parent-frame checks pass at three sizes per browser; fullscreen rotation releases stale touch while preserving keys. Twelve resource failures recover through Retry; music failure/retry and denied storage pass. Original regression passes eighteen full duels. Source and complete logs are committed in the existing private joynes/rall0054 repo before publication.

Version 1.0 exact collision/input/audio parity is historical evidence, not a claim for 1.1. Mobile contexts are emulated Chrome/Chromium; physical devices and Safari are not covered. Live verification is recorded in the publication inventory after deployment.
