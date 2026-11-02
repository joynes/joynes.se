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

## Current findings

- **Marble Tables:** keyboard-only native marble manipulation now passes in desktop
  and mobile browser contexts. Real touch end/cancel, gravity, independent key
  release, blur cleanup, toolbar keyboard navigation and fullscreen also pass
  locally. Latest canonical release evidence is recorded in the inventory.
- **rall0054, v080 and rall008:** still incomplete web adaptations. They must pass
  the complete input checklist before being marked as published and verified.
- **Other published games:** retain their existing release evidence. The added
  mobile-browser physical-keyboard scenario still needs an explicit audit.

## Active game: rall0054

The Windows release contains 81 files, six Mappy maps, original graphics, WAV
sounds and XM music. The project references a C++ source directory which is not
present in the local archive, the inspected Drive folder or the release SFX ZIP.
The release is dated March 2002, rather than its later Drive copy date.

A local Boxedwine/Wine compatibility probe launches the unchanged PE32 program.
Dropping pre-existing generated log files from the runtime staging area resolves
its directory-creation error. The probe reaches 640×480 graphics but currently
shows a black screen. This is not a passing gameplay result. Original release
bytes remain preserved in the ignored `drive-archive/rall-054/` cache.

The compatibility runtime and diagnostic artifacts are local experiments under
ignored `test-results/rall054-wine/`; they are not a published game.
