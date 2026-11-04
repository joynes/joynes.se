# Rall v080 — Fighters

A browser restoration of Johannes’s archived Windows fighting game. The Drive folder is called v080; its readme identifies version 0.0081. The local archive and Drive release share 290 identical files, including the executable, game code and media. The original source and complete release remain in the existing private `joynes/rall-v080-fighter` repository.

Thirteen original C++ gameplay files compile to WebAssembly. Rule tables, collision boxes, animation, attacks, blocks, throws, knockdowns, AI, per-round introductions and solo progression run in the original engine. A browser adapter replaces Allegro graphics/configuration/fonts/audio, the front menu and developer console. A mismatched `extern slow_down` declaration is corrected to `bool`; original files remain unchanged. The [compile manifest](source-compile-manifest.json) records source and output hashes.

The host supplies a fixed 60 Hz clock, deterministic initial storage, time-based random seeding, pause/restart, local records, touch controls and fullscreen. It observes completed native matches before automatic replay. The original counter increments twice per round, so displayed wins are divided by two. Native defeated fighters can retain one energy point; native DEAD/WIN states determine victory. Solo play advances to stronger opponents after two round wins.

Blue uses arrows, I to throw, O/Space to punch and P to kick. Green uses Z/C, D/X, V, B and N. Moving backward blocks; double-tap a direction to run or dash. Touch offers the same directions and three attacks, including movement/crouch/jump combinations. W/Escape pauses, R restarts and S toggles sound.

The 194 original images become lossless PNGs with the original magenta color key. The 22 WAV effects/voices, font and complete original MP3 are unchanged. [Asset provenance](provenance.json) records all original and exported hashes. No Wine or Windows executable is shipped.

AI Enhanced remains a future separate edition with new Blender graphics and ElevenLabs sound/music; no untested enhanced choice is shown. Browser checks use real keys/native touch and a cloned native observer. Physical devices and Safari are not covered. See the [publication inventory](../../data/games-inventory.json) for current verification evidence.

If native fullscreen is denied, the same running game expands to the whole homepage through a checked same-origin frame message. The frame stays connected, preserving the match. Escape, the fullscreen button and Menu restore the page.

Compiler runtime notices: [Emscripten](vendor/EMSCRIPTEN_LICENSE.txt), [LLVM libc++](vendor/LIBCXX_LICENSE.txt), [musl](vendor/MUSL_COPYRIGHT.txt). The investigated Allegro TS library is not used or shipped.
