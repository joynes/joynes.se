# Original and AI Enhanced editions

After the current gameplay, touch, fullscreen and language fixes, create an AI Enhanced edition of each adapted older game, one game at a time. At launch, offer **Original** and **AI Enhanced**. Original means the restored web edition; the enhanced edition gets new gameplay ideas, graphics, sound and music.

Keep both editions in the existing game repository, with separate assets, save data and test evidence. Show the enhanced choice only once that edition is playable and verified. Keep the excluded police-car and bus demos excluded.

## First wave

| Game | Enhanced direction |
| --- | --- |
| SDL Space | A space courier with short missions, cargo, shields and asteroid hazards. |
| ShadowRacer | New obstacle routes, a ghost challenge and changing environments. |
| Marble Tables | A marble workshop with gates, goals and physics puzzles. |
| Read and Place | Small 3D worlds with object-placement reading challenges. |
| Word Quiz | Illustrated word trails and short exploration challenges. |
| Quiz Game | A topic expedition with branching routes and collectibles. |
| Memit | Original creatures, memory challenges and collection progress. |
| Rall v026 | Rooftop duels with new arenas, gadgets and cover. |
| Rall v030 | A new 2.5D arena fighter with training and challenge modes. |
| Top-down Driving | Checkpoint courses, time trials and drifting challenges. |
| Rall v054 | Isometric tank arenas, capture beacons, breakable cover and siege challenges, with new Blender models and ElevenLabs audio. |

Add the unfinished older Rall games after their original web editions are playable and verified. Each concept above is a starting point; finish a coherent game, not a visual demo.

## Graphics and audio

Use installed Blender 5.2.2 LTS for new models, scenes, animations and web exports. Save reproducible asset-building scripts and source `.blend` files in the private game repository; publish optimized game assets.

Use the available `elevenlabs-api`, `music` and `sound-effects` skills. The connected ElevenLabs flow tool supports music and sound effects; prefer it, with the API skill available when finer parameters or exports require it. Configuration is available; keys must remain outside source, logs and browser code. Generate assets for the current game only. Record prompts, provider/model, generation metadata and asset hashes, then verify the saved files and actual browser playback.

## Release checklist

- Short English interface and a clear Original / AI Enhanced choice.
- New gameplay goals, progression, win/loss and restart where appropriate.
- Touch controls inside the scene, physical keyboard support on desktop and mobile, and fullscreen.
- Actual browser gameplay tests for both editions, simultaneous input, cancellation, focus loss and restart.
- Separate game commits, tested publication and live release verification before moving on.

## First implementation

Top-down Driving is first: its original mechanics, touch, keyboard and fullscreen have passed local and live verification, and its existing source repository is private. Build a new time-trial game with Blender courses/car graphics and ElevenLabs audio. Keep every other enhanced edition queued until its own original checks and enhanced gameplay tests pass.

Night Circuit is the first release candidate: three Blender courses, a new car, ElevenLabs soundtrack/motor/chime, checkpoints, boost, medals, unlocks and a persistent best-lap ghost. Local gameplay, failure recovery, input, fullscreen and edition-switch checks pass. Night Circuit is now published and verified: complete gameplay/input/fullscreen and original-edition regressions passed on the public site. Both edition choices work through joynes.se and the direct homepage in all three tested viewports. All 25 release files match SHA256; Pages 41735297215 succeeded. Other editions remain queued, not published. ShadowRacer’s original audit passed locally and live. Ridge Courier is published and verified: a new 3D parcel-delivery game with three Blender worlds, wind, gaps, boost and ElevenLabs audio. Complete local/live routes, audio, recovery, touch/keyboard, fullscreen, edition switching and all 49 runtime/integration hashes passed (Pages 41747999054). Other enhanced editions remain queued.

Rall v054’s original browser restoration is now published and verified on all six maps, with solo progression and local duels. Its AI Enhanced tank concept remains queued while the unfinished rall008 restoration are completed. No enhanced tank launch choice is shown yet.

Rall v080’s original C++ browser restoration is published and verified. Its queued AI Enhanced concept is Signal Duels: new Blender robot fighters, stance challenges, timing-based guards and short rooftop tournaments with ElevenLabs sound and music. It will have an Original / AI Enhanced launch choice after separate gameplay verification. Rall008 is being restored from its distinct 2006 source; its enhanced direction remains queued.

Rall008’s original local browser restoration is now published and verified, including full 500-point duels, practice, all six characters and live touch/keyboard/fullscreen/navigation. Its AI Enhanced shipboard concept is queued. The next enhanced edition is Rall v054: new Blender tank arenas, capture beacons, breakable cover and ElevenLabs sound/music, while preserving the verified Original launch choice.

Beacon Siege, Rall054’s AI Enhanced edition, is the third release candidate. Its three Blender capture/extraction missions, ElevenLabs audio, keyboard/touch combat, win/loss/replay, recovery and Original regressions pass locally. Homepage version switching passes; live enhanced verification is pending. Original and enhanced saves remain separate.
