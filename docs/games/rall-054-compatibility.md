# rall0054 compatibility investigation

Status: original gameplay reached in a local GDI prototype; no web release has
been published.

## Preserved release

The release identifies itself as Rall4Win 0.54, dated March 23, 2002. Its journal
ends on March 22. The original self-extracting ZIP contains 81 files, including
the Win32 executable, Allegro and FMOD DLLs, six Mappy maps, graphics, WAV sounds
and XM music. All are preserved in the local source archive.

The Visual C++ project references C++ files absent from the inspected local
repository, Drive folder and release archive. The later rall006 repository has
related source, but it is not established as the exact source for this release.

## Browser results

- The older Wine/Boxedwine prototype reached a black graphics surface after a
  generated-log directory problem was bypassed. It did not establish gameplay.
- The official Boxedwine **26R1.0 SingleThreaded** web SDK with its bundled
  **Wine 6** root reaches the original intro and main menu. This uses the
  **unchanged executable** and all 81 original release files.
- In this SDK the application archive mounts under `C:\files`, not `D:`.
  Keep the archive's `rall/` prefix and launch `rall.exe` from that folder.
  Set the emulated resolution to `640x480`.
- Startup takes approximately 30 seconds in the tested desktop Chromium
  environment. A short timeout can mistake the startup screen for a failure.
- Native menu images were detected using read-only canvas pixels compared with
  samples from the original BMP files. Browser mouse and keyboard events were
  delivered through the normal runtime interface.
- DirectDraw left stale menu graphics and partial map rectangles on the canvas.
  Waiting two minutes did not resolve that rendering problem.
- **GDI windowed rendering reaches actual native gameplay.** The change replaces
  the graphics request's `push 1` (autodetect fullscreen) with `push 0` (autodetect)
  at executable file offset `0xb789` and selects `GDIB` in the graphics config.
  This is a **one-byte executable compatibility patch**, not an unchanged binary.
  All 79 other release files remain byte-identical in the reproducible probe.
- Native tank movement, firing, siege controls and the game's F5 screenshot
  command have now been exercised through browser input. The native screenshot
  is a 640×480 BMP written by the original program. Complete combat outcomes,
  two-player matches and all six maps still need release checks.
- Use an 800×600 emulated desktop so the native 640×480 window is fully visible.
  The prototype finds the original menu pixels and crops to the game's client
  area, excluding the emulated window frame.
- Wine 11, multithreading and pointer settings were investigated locally. A
  separate timer-rate patch was slower and is **not** included in the GDI probe.
  The original timing code and timer configuration remain unchanged.

Experiments and screenshots are under the ignored
`test-results/rall054-wine/official/` directory. They are not website assets.
No runtime binary or executable patch from these experiments is deployed.
The English prototype interface source is under `scripts/rall054-probe-ui/`;
it is copied into the ignored probe output rather than added to the game catalog.

To recreate an unmodified probe, supply the downloaded official SDK and original
release to the repository script:

```sh
python3 scripts/prepare-rall054-probe.py \
  test-results/rall054-wine/official/Boxedwine26R1Web.zip \
  drive-archive/rall-054/original-release.exe
python3 -m http.server 8798 --bind 127.0.0.1 \
  --directory test-results/rall054-repro
```

Open `http://127.0.0.1:8798/boxedwine.html?app=rall&p=rall.exe&auto=false&sound=true&resolution=640x480`.
The default script verifies all 81 staged files against their original bytes
and writes a SHA-256 preservation ledger. To stage the GDI gameplay prototype,
use a fresh output directory and add `--gdi`, then open `controls/` on the local
server. The ledger records original and runtime hashes and identifies the two
changed files. This recreates a diagnostic setup, not a passing release.

Run the real-browser input check with:

```sh
RALL054_PROBE_URL=http://127.0.0.1:8798/controls/ \
  node scripts/test-rall054-prototype.cjs
```

The check observes native tank pixels after keyboard and real CDP touch input;
the wrapper's button state alone is insufficient to pass movement checks.

## Input checkpoint, November 3, 2026

The corrected checks pass native blue-player keyboard movement in desktop and
mobile Chromium contexts. The mobile sequence also passes real touch movement,
both human profiles, three simultaneous touch inputs, independent lift/cancel,
keyboard focus cleanup, native pause/resume, fullscreen and gameplay after a
fresh restart. Two-human idle checks exclude AI movement as input evidence.
Evidence is under `test-results/rall054-current-input-check/`; the passing log is
`/tmp/rall054-current-input-check.log` in the current workspace session.

The host gives virtual keydown events 100 ms for Wine's focus transition to
settle. Brief action presses have a 250 ms minimum pulse; cancellation, blur and
restart cancel queued input immediately. Toolbar pointer interaction preserves
game focus. Old-session callbacks cannot release a new session's controls.

Two SDK JavaScript display-size imports support a fixed virtual host display,
so SDL does not stretch the Windows desktop to a phone's screen dimensions.
The host scales the resulting 640×480 game view. The probe also selects the SDK's
memory-only filesystem setting for fresh sessions. The WebAssembly binary and
Wine filesystem are unchanged from the official SDK.

These are browser-emulation checks. Physical Android/Safari verification and
the remaining release gate below are still pending. The threaded runtime did
not finish startup in the local experiment and is not selected.

## Runtime controls and a misleading archived help screen

The release's help image swaps the tank colours. The executable assigns the
arrow-key profile to the **blue** tank and the letter-key profile to the
**green** tank. The related legacy C++ code agrees with those call sites.
The initial single-player colour-based movement check accidentally observed an
AI tank; that result is invalid as input evidence. The corrected check tracks
the blue player and checks the second profile in a fresh two-human session.

| Action | Blue tank / player 1 | Green tank / player 2 |
| --- | --- | --- |
| Drive forward / backward | Up / Down | D / X |
| Turn left / right | Left / Right | Z / C |
| Rotate gun right / left | O / I | N / B |
| Fire | P | V |
| Toggle siege mode | U | M |

W pauses; Tab opens the console; F5 takes a native screenshot. In siege mode,
direction controls adjust aim and power. Touch controls must expose all these
gameplay actions and support holding movement while aiming or firing.

The original journal documents a bug when switching from single player to two
players: the computer opponent can remain active. A future wrapper should start
a fresh native session when switching modes unless a tested source fix becomes
available.

## Release gate

Verify actual single-player and two-player rounds, six maps, firing, siege
ammunition, damage, round transitions and audio. Then verify touch and physical
keyboard in desktop and mobile browser contexts, independent input release,
touch cancellation, lost focus, pause, restart and resource-failure recovery.
Prepare the runtime's required licensing and corresponding source information
before shipping it. Publish only after gameplay and input checks pass.

Runtime reference: [official Boxedwine 26R1.0 release](https://github.com/danoon2/Boxedwine/releases/tag/26R1.0).

## Browser restoration decision — 4 November 2026

The native prototype reached real combat and audio, but mixed short-input/round tests were not reliable enough for publication. An isolated original x86 lookup also confirmed that stage six selects a music filename. Its archive and evidence are preserved privately. The playable restoration now reconstructs gameplay in JavaScript using the original six maps, graphics, effects and full tracker songs. It does not ship Wine/Boxedwine or claim identical Windows physics. See the [current restoration](rall-054.md); the runtime-specific release gate above applies to the unpublished native investigation.
