# Rall v030 Fighter

Arbete nummer 20. Retrospel från 1999, AI-anpassat för webben.

Original: Google Drive `1FGPeHw10MCgX4vUwJNITWSx8r84M4TZ8`.
Alla 173 releasefiler bevarade byteidentiskt. Ingen C++-källa ingår i releasen;
originalets DJGPP-program körs i självhostad emulators 8.5.2 / DOSBox Direct.
CWSDPMI 5 med `-p -x` och en 169-byte, källkodstillgänglig musadapter gör
originalets Allegro-miljö användbar. Läs [källanteckningarna](../../games/rall-030/source-notes.md)
och [filmanifestet](../../games/rall-030/source-manifest.json).

Åtta saknade MOD-spår kompletteras från Johannes eget musikarkiv. Tre är
närliggande versioner (Nudro4, Hentia4, Dzew2x), tydligt åtskilda från originalfilerna.
Originalets åtta MIDI och tretton WAV bevaras också.

## Lokala verifieringar

- `npm test`: befintliga regressionskontroller plus tre bevarandetester för v030.
- `npm run test:rall-030:browser`: verkliga webbläsarklick, originalbana och
  kort bana, rörelse/slag, riktig paus, återstart, filbackup och native banavslut.
- `npm run test:rall-030:mobile`: verklig touch i originalmenyerna, båda mänskliga
  profiler synliga i originalets HUD, samtidiga P1/P2-tryck, separat lyft och cancel.
- `npm run test:rall-030:editors`: ändrar namn i originalredigeraren, sparar
  CHARACT.CHA, verifierar filinnehåll oberoende i exporterad ZIP, importerar och
  läser tillbaka i originalredigeraren efter omstart; öppnar banredigeraren.
- `npm run test:rall-030:recovery`: verkliga 503 på app, emulatorladdare,
  spelpaket och WASM; ny dokumentladdning återställer spelbar originalmeny.
- `npm run test:rall-030:sound`: spelar återfunna MOD och ursprungliga MIDI via
  Sound Studio. Alla åtta MOD-spår och alla åtta MIDI-spår är verifierade med verkligt
  ljud från originalets spelare. Separat Allegro-profil väljer fungerande FM-MIDI;
  stoppa MOD-spelaren innan ljudtypen byts och ange IRQ 7 / DMA 1 före ReInstall.

Webbläsarproven kan köras med `GAME_BASE_URL`. På denna dator används cachelagrad
Playwright 1.59.1/Chromium 147 via `CHROMIUM_PLAYWRIGHT_MODULE` och
`RALL_HEADLESS_SHELL=1`. Ingen ny WebKit-verifiering görs gällande.

Skärmbilder och exporterade testbackuper ligger under ignorerade `test-results/`.
Hela originalbanans tretton motståndare finns i det oförändrade stage-arkivet;
proven innebär inte att hela kampanjen har genomspelats till sista bossen.

## Publicering

Speladress: https://joynes.github.io/joynes.se/games/rall-030/ .
Aktuell publiceringsstatus, commits och bevis från den riktiga adressen förs i
[data/games-inventory.json](../../data/games-inventory.json).
