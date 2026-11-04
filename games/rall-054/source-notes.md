# Rall v054 — Tanks

A browser restoration of Johannes’s **Rall4Win 0.54**, released 23 March 2002. The preserved Windows archive contains 81 files and six Mappy maps. Its original graphics, maps, WAV effects and tracker songs supply this edition. [Asset provenance](provenance.json) records source and export hashes.

This is reconstructed JavaScript gameplay, not an identical execution of the Windows program. Tank movement, terrain collision, enemy AI, input and round management are new browser code. The native archive and available project files remain in the existing private `joynes/rall0054` repository. The exact C++ sources referenced by the old project are incomplete; related later sources and native browser observations informed the restoration.

Solo survival adds an enemy each stage, up to fifteen. Start with three lives and three siege shots; clearing a stage adds a siege shot, with an extra life every fourth stage. Duels end at three points. Both modes use the six original maps, safe spawn positions, and normal or siege fire. Siege shots cross cover; the new landing marker helps with touch aiming. Map selection, safe six-map cycling, pause, fullscreen and local records are browser additions. The old stage-six lookup selected a music filename; this port always selects a map.

Blue uses arrows, I/O, P/Space and U. Green uses D/X/Z/C, B/N, V and M. W/Escape pauses; R restarts; S toggles sound. Touch pads and aim/fire/siege controls stay inside the game view. A physical keyboard also works in mobile browser contexts.

PNG exports preserve the archived 16-bit appearance. PCM WAV effects are unchanged. Complete tracker songs were rendered offline using OpenMPT and normalized to streaming MP3; decoder and export metadata are in the provenance file. No Wine, Boxedwine, FMOD or audio decoder executable is shipped with the playable port.

The separate native GDI prototype remains an unpublished compatibility investigation. The separate AI Enhanced edition, Beacon Siege, adds three new 3D capture-and-extraction missions, Blender graphics, destructible cover, shields and ElevenLabs audio. It has its own controls and records. Choose Original to play the restored game.
