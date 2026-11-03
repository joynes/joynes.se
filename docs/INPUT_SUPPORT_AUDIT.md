# Touch and physical-keyboard support

The requirement now covers both mobile touch and a physical keyboard attached to
any supported device, including a phone or tablet. Previous desktop-keyboard and
mobile-touch tests remain useful evidence; they do not by themselves verify a
keyboard attached to a mobile browser.

For each game, verify:

1. Start and navigate without a mouse using a physical keyboard.
2. Perform every gameplay action with touch, including simultaneous actions.
3. Repeat keyboard gameplay in a mobile browser context while touch is available.
4. Release one held input without releasing another. Cancel touch, change focus,
   pause and restart without leaving any input held.
5. Check portrait and landscape layouts and the published homepage launch path.

## Renewed game-by-game audit — 3 November 2026

Baseline and result commits are recorded in [game-repositories.json](../data/game-repositories.json). Frågespelet passed its full 154-question live regression and the added desktop/mobile keyboard, real touch, cancellation, independent contact release, focus, restart and orientation checks. No gameplay fix was needed. The Gemini and Codex maths games, Läs- och ordquiz and Memit also passed their complete gameplay regressions and added touch/mobile-keyboard checks. Ordhjälten has a locally verified Breakout repair awaiting publication and live verification. Other games remain pending in this renewed audit, regardless of their earlier release checks.

The new quiz checks verify real keyboard focus transfer while a button is held. Headless tabs emulate active focus, so opening another tab is not counted as an operating-system window-blur test.

## Current findings

- **Marble Tables:** keyboard-only native marble manipulation now passes in desktop
  and mobile browser contexts. Real touch end/cancel, gravity, independent key
  release, blur cleanup, toolbar keyboard navigation and fullscreen also pass
  locally and on the canonical public site. All 12 released assets match the
  tested version; the five native Unity build/configuration files are unchanged.
- **rall0054:** the local native-game prototype now passes keyboard movement in
  desktop and mobile contexts, touch movement for both human players, simultaneous
  input, independent lift/cancel, pause/resume, fullscreen and restarted gameplay.
  It is still unpublished; combat outcomes, map coverage and release checks remain.
- **v080 and rall008:** still incomplete web adaptations. They must pass the
  complete input checklist before being marked as published and verified.
- **Other published games:** retain their existing release evidence. The added
  mobile-browser physical-keyboard scenario still needs an explicit audit.

## Active game: rall0054

The Windows release contains 81 files, six Mappy maps, original graphics, WAV
sounds and XM music. The project references a C++ source directory which is not
present in the local archive, the inspected Drive folder or the release SFX ZIP.
The release is dated March 2002, rather than its later Drive copy date.

A local compatibility probe using the official Boxedwine 26R1 web runtime and
Wine 6 reaches the original intro and 640×480 main menu with the unchanged PE32
program and all 81 release files. This improves on the older runtime's black
screen. A reproducible GDI compatibility change now reaches native gameplay:
one graphics-request byte and the graphics configuration differ, while the
other 79 release files are byte-identical. Original release bytes remain
preserved in the ignored `drive-archive/rall-054/` cache.

The executable's actual bindings differ from the archived help: blue is the
arrow-key player; green uses letter keys. The corrected browser checks observe
those tanks in the native canvas and confirm both human tanks stay still without
input. This avoids mistaking AI movement for a successful control test.

These are Chromium desktop/mobile-context checks, not physical Android or Safari
verification. The game is not yet a published, fully verified release.

The investigation and original control bindings are recorded in
[the rall0054 compatibility notes](games/rall-054-compatibility.md).

The compatibility runtime and diagnostic artifacts are local experiments under
ignored `test-results/rall054-wine/`; they are not a published game.
