# Rall v026 — ASCII

[Spela Rall v026](https://joynes.github.io/joynes.se/games/rall-026/) · [Retrospel på hemsidan](https://joynes.github.io/joynes.se/#games/retro/rall-026)

**Retrospel · AI-remake av original från december 1998.** Originalets DOS-/DJGPP-program körs i självhostad DOSBox/WebAssembly. Alla 23 originalfiler — körfil, åtta grafik-/textfiler, Readme, nio WAV-filer och fyra MIDI-filer — är bytebevarade. Arkivet innehåller inte C++-källkod. Ingen ny, förenklad duellmotor ersätter originalets spelregler.

Duellen har samma tak, skyddande tunnor, förstörbart glas, siktning, omladdning, reaktiva datorfigur, tvåspelarläge på samma skärm, röster, MIDI-musik och historiska menyer. Webbversionen tillför svenska instruktioner, touch med flera fingrar, alternativa Q/E-/mellanslagstangenter för spelare 1, riktig emulatorpaus, omstart och återhämtning efter nätfel. Liggande touchvy placerar spelarnas kontroller på varsin sida om den centrerade spelplanen. Originalets snabbt upprepande meny får korta tryck från skärmknapparna.

## Proveniens och kompatibilitet

[Källredovisning, licenser och bygginstruktioner](../../games/rall-026/source-notes.md) · [Original-/runtimeproveniens och filhashar](../../games/rall-026/source-manifest.json) · [Alla publicerade spelfilers SHA256](rall-026-assets.json).

Oförändrad CWSDPMI5 med `-p -x` gör denna äldre DJGPP-utgåva körbar; nyare DPMI-/null-sideskydd gav fel. Värdens dokumentation och källarkiv medföljer. DOSBox-konfigurationen använder 12000 cykler, 16 MB, SB16/AdLib och svensk teckenuppsättning. `prebuffer=0` rättar push-mixerns för höga produktionshastighet; originalets faktiska monoljud spelas vid 44100 Hz utan ändrad tonhöjd. GPL-motorns och dess DOSBox-undermoduls motsvarande källarkiv samt libzip-licens medföljer.

Gränssnittet läser kopior av originalets BIOS-/textminne med rena typed-array-läsningar. Varken spelregler, positioner, kollisionsflaggor, timer eller resultat skrivs av gränssnittet/testerna. SDK:s fulla minnesdump används inte. Native-programmets egen avslutsflagga läses eftersom motorns ordinarie onExit-händelse bara levereras för ett API-begärt avslut. Originalets egen röda dödsfigur och resultattext med antal skott avgör duellens slut.

## Kontroller

- **Spelare 1:** pilar flyttar, Q/E eller semikolon/apostrof siktar, mellanslag eller backslash skjuter/laddar om.
- **Spelare 2:** Z/C vänster/höger, D/X upp/ned, B/N siktar, V skjuter/laddar om.
- **Menyer:** pilar och Enter; titelskärmen använder mellanslag. Skärmknapparna skickar dessa originaltangenter. P och Pausa fryser hela emulatorn; Esc skickas till originalet.
- Ljud och musik kommer från originalet. Originalets inställningsmeny och dess ljudundermeny finns kvar; webbljudknappen kan tysta allt utan att ändra DOS-spelets ljudklocka.

## Verifiering

- 32 tidigare Node-tester och fyra Python-tester: tidigare spel/musik, ShadowRacer samt exakt bevarande av samtliga Rall-filer och kompatibilitetsfiler.
- Riktig Chromium-körning av originalets startskärmar, huvudmeny, Controls, Contents och båda nivåerna av inställningsmenyer. Varje menyknapp ändrar exakt ett verkligt markerat val, även när originalet slumpat en annan menyfärg.
- Två spelare med oberoende rörelse via riktiga tangenttryck; faktisk siktändring. Riktig förstöring av glas och en inriktad motspelare som överlever bakom en oförstörd tunna.
- **Båda duellutfallen:** spelarna flyttas med vanliga tangenter till en fri skottlinje och skjuter med Space respektive V. Originalets röda dödsfigur, resultat och återgång till menyn observeras. Inga spelpositioner, skador eller slutlägen forceras.
- Datorfiguren reagerar på spelare 1 i enspelarläget. Paus fryser verkliga BIOS-ticks och bildrutor, tömmer ljudkön och släpper hållna tangenter. Omstart och originalets Quit följt av ny start fungerar.
- Faktiska icke-noll-ljudsamples, avkodad ljudtopp och korrekt ljudmängd mot väggtid utan tappade block i stabil uppspelning.
- Riktig CDP-tvåfinger-touch styr båda spelarna samtidigt. När ett finger lyfts fortsätter det andra; touchCancel släpper båda. 844×390, 667×375 och 390×844 granskas; inga sidledsöverflöden eller knappar utanför den lilla liggande spelvyn.
- Fyra verkliga HTTP503-fel för gränssnittsmodul, motorladdare, spelpaket och WASM följda av en knapptryckning till spelbar ny dokumentladdning. Inga oväntade JavaScript-fel eller externa HTTP-anrop.
- Den inbäddade hemsidesversionen spelas med riktig rörelse på mobil-/datorstorlek; inkludering bland Retrospel och uteslutning från AI-spel kontrolleras. Chromium används; detta är ingen uppgift om ny testning på fysisk iPad eller WebKit.

## Kör om

`npm run test:rall-026:preservation`, `npm run test:rall-026:browser`, `npm run test:rall-026:links`.

`GAME_BASE_URL` väljer speladress, `HOMEPAGE_BASE_URL` hemsida, `RALL_TEST_RESULTS` utmatning. `CHROMIUM_PLAYWRIGHT_MODULE` väljer installerat Playwright; `RALL_HEADLESS_SHELL=1` använder dess Chromium i stället för systemets Chrome. `RALL_TEST_FOCUS=cover` kör bara skydds-/glastestet; `RALL_TEST_FOCUS=mobile` kör touch, rotation och felåterhämtning.
