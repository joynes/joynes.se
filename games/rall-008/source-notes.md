# Rall008 · Original restoration

The 2006 game is distinct from v080 / 0.0081. This edition compiles its original C++ combat, articulated character animation, physics, collision, bot decisions, scoring, respawns and cruiser scene to WebAssembly. It keeps the original photo characters, 128 image exports, 26 WAVs and four complete MP3 tracks.

Choose any of six original characters. Practice keeps respawning the player and bot; the original rules count bot defeats as kills rather than points. Local duels end at 500 points, including points for successful guards. Both players can use touch controls or a physical keyboard. The ship follows Blue’s camera. Pause, restart and fullscreen controls stay inside the scene.

The browser adapter replaces Windows graphics/audio and the Zoidcom transport with one local authoritative world. Online networking and the native animation editor are not included. This is a local browser adaptation, not execution of the Windows executable. Two unused ship illustrations referenced in the original source are absent from both archives; the deck and water are present.

Compatibility edits affect build copies only: include separators, Allegro `fixed` qualification, an extra class qualifier, a const draw-order comparator, an editor iterator sentinel, and omission of unused legacy editor methods. The client sound dispatcher runs against the same local world. Original files remain unchanged in the private archive. [Corresponding source and build scripts](source.zip) are provided under the original [GPL-2.0-or-later](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html) terms. [Asset hashes](provenance.json) · [Compiled source hashes](source-compile-manifest.json).

The Drive archive matches all 375 local relative names and sizes. The executable and eight selected source/header/data/image files also match byte for byte. The full archive has not been independently hashed against Drive.

Browser verification covers full 500-point wins for both players and real bot/player defeats and respawns on desktop, portrait and landscape; all six character choices; guard/throw interaction; touch, both keyboard profiles, cancellation, mixed input, lost focus, restart, audio and fullscreen. Tests use actual browser controls and a read-only native observer. Mobile contexts are emulated; no physical-device or Safari claim is made. AI Enhanced is a separate queued edition.
