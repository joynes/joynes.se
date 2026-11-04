# ShadowRacer

[Play](https://joynes.github.io/joynes.se/games/shadow-racer/) · [Homepage](https://joynes.github.io/joynes.se/#games/retro/shadow-racer)

Johannes’s 2008 Flash game, with the complete September and October releases. Both keep their original ActionScript / APE physics, car, course, camera, collision rule, timer and finish. Preservation tests verify the original files and read-only observer.

The English host provides an in-scene thumbpad, throttle/reverse, pause, restart, release selection and fullscreen. Several held actions are routed across native input frames; touch and keyboard retain independent ownership. Native timer pause, stale key/contact cleanup and fullscreen fallback are tested separately.

The original has no audio or working ghost playback. Its abandoned leaderboard uses an embedded message; finished times are saved locally per release. Available ActionScript files and web assets are preserved in the existing private game repository.

[Detailed sources and preservation proof](../../games/shadow-racer/source-notes.md)

The original gameplay, touch, keyboard, fullscreen and English-interface audit passed locally and live. Remix adds **Ridge Courier**: three new Blender route worlds, parcel deliveries, boost, wind, gap jumps and checkpoint repairs, with ElevenLabs audio. Choose **Original** or **Remix** at launch. Local records and assets are separate.

Ridge Courier is published and verified: all three routes, touch and keyboard, audio, recovery, fullscreen and edition switching passed on the live website. Browser automation covers Chromium and installed Chrome in desktop, phone portrait and phone landscape contexts; physical devices and Safari are not covered. [Inventory](../../data/games-inventory.json).

Faithful AI Enhanced is queued separately. The homepage now exposes Original / Remix directly; new gameplay is explicitly labeled Remix.
