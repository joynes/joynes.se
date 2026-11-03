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

Add the unfinished older Rall games after their original web editions are playable and verified. Each concept above is a starting point; finish a coherent game, not a visual demo.

## Graphics and audio

Use installed Blender 5.2.2 LTS for new models, scenes, animations and web exports. Save reproducible asset-building scripts and source `.blend` files in the private game repository; publish optimized game assets.

Use the available `elevenlabs-api`, `music` and `sound-effects` skills. The connected plugin does not expose music/effect generation, so use the ElevenLabs API for those assets. Configuration is available; keys must remain outside source, logs and browser code. Generate assets for the current game only. Record prompts, provider/model, generation metadata and asset hashes, then verify the saved files and actual browser playback.

## Release checklist

- Short English interface and a clear Original / AI Enhanced choice.
- New gameplay goals, progression, win/loss and restart where appropriate.
- Touch controls inside the scene, physical keyboard support on desktop and mobile, and fullscreen.
- Actual browser gameplay tests for both editions, simultaneous input, cancellation, focus loss and restart.
- Separate game commits, tested publication and live release verification before moving on.
