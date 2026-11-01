# ShadowRacer

[Spela ShadowRacer](https://joynes.github.io/joynes.se/games/shadow-racer/) · [Retrospel på hemsidan](https://joynes.github.io/joynes.se/#games/retro/shadow-racer)

AI-remake av Johannes retrospel från **2008**, med två fulla arkiverade originalutgåvor: 28 september och 5 oktober. Båda kör fortfarande sin ursprungliga ActionScript-/APE-motor i den självhostade Ruffle 0.7.1. Bilen, den fjädrande fysiken, hela banan, kraschregeln, kameran, timern och målet över x > 3400 är bevarade. Ingen enklare bilsimulation eller ny kampanj ersätter originalet.

Webbversionen ger svenska instruktioner/resultat, tangentbord/WASD, touch med två fingrar, paus som fryser även den riktiga timern, omstart, utgåvebyte och separata lokala rekord. Äldre topplisteanrop skrivs om till inbäddad information; inga externa HTTP-anrop görs och förarnamn/tider skickas aldrig till den övergivna servern. Om lagring är blockerad fungerar själva spelningen ändå. Första starten hämtar cirka 15 MB spelmotor; spelet innehåller ursprungligen inget ljud och ingen aktiv spöruppspelning.

## Bevarande och proveniens

[Full källredovisning](../../games/shadow-racer/source-notes.md) · [Original- och motorproveniens](../../games/shadow-racer/source-manifest.json) · [Bevarandebevis](../../games/shadow-racer/native-observer-proof.json) · [Alla 23 spelfilers SHA256](shadow-racer-assets.json).

Originalens två SWF-filer är arkiverade byteidentiskt. Webbens körfiler tillför endast en läsande trace i huvudklassens bildruteslinga. Alla ursprungliga instruktioner är kvar och övriga 337 metoder är byteidentiska. Ett separat test av tillåtna opcode-instruktioner bekräftar att tillägget enbart kan läsa, förgrena sig och anropa trace, utan att skriva speldata. Det ger en verklig observation av bil, timer, tangent, kollisioner och spelläge som webbgränssnittet använder för resultat och rekord.

Den extra SWF-kopian i den nästlade release-mappen verifierades som identisk med septemberfilen. Flex-mappens `history` innehåller webbhistorikmallar, inte fler spelversioner. De senare klassfilerna `ShadowRacerPrototype2_.as` och `ShadowRacerPrototype3.as` skiljer sig bara i klass-/konstruktörsnamn; uppladdning år 2020 eller en senare namnändring ändrar inte originalets kategori.

## Godkända kontroller före publicering

- 32 tidigare Node-tester och två nya Python-tester: båda originalhasharna, reproducerbara körfiler, bevarad motor och strikt läsande mätpunkt. Tidigare spel- och AI-musiknavigering passerar.
- Båda originalen körda i Chromium med verklig start, backning/framåtkörning, rå native-tangentåterkoppling, verklig krasch, nytt försök, paus/resume och utgåvebyte. Native-position, bildrutenummer och timer står stilla vid paus, och pausad väggtid läggs inte på efter återgång.
- **Hela banan till verklig målgång för båda utgåvorna**, utan krasch eller genväg, med originalets kollisions- och målregler aktiva. Helbanepiloten läser bara verkligt native-tillstånd och skickar vanliga DOM-tangenthändelser genom gränssnittets normala tangenthanterare. Separata kontroller använder riktiga webbläsartangenter. Inga positioner, tider, poäng, kollisionsflaggor eller spellägen skrivs av testet.
- Riktig måltid avläst från originaltimern, synlig resultatruta, separat lokalt rekord och samma rekord efter omladdning. Utgåvebyte tar bort motorn och visar rätt versions rekord.
- Native CDP-multitouch i 844×390: gas, lutning med andra fingret, återgång till kvarvarande gasfinger och touchCancel som verkligen släpper originalets tangent. Porträtt 390×844 och återgång till liggande fungerar och granskas visuellt.
- Verkliga 503-fel för gränssnittsmodul, Ruffle-laddare, SWF och WASM, följt av nytt försök som spelar den riktiga motorn. Motorfel behöver en ny dokumentladdning eftersom Ruffle kan behålla ett misslyckat WASM-löfte; knappen gör det automatiskt och behåller version/förarnamn där webbläsaren tillåter det. Blockerad lagring hindrar inte körning.
- Dator-/mobilinbäddningen från hemsidan startar den riktiga motorn och går att styra; Retro-/AI-filtrering stämmer. WebKit/fysisk iPad är inte en ny godkänd testmiljö här.

## Kör om

`npm run test:shadow:preservation`, `npm run test:shadow:browser` och `npm run test:shadow:links`. För enbart felåterhämtning: `SHADOW_TEST_FOCUS=recovery npm run test:shadow:browser`.

`GAME_BASE_URL` väljer speladress; `HOMEPAGE_BASE_URL` väljer hemsida. `SHADOW_TEST_RESULTS` väljer testutmatning. `CHROMIUM_PLAYWRIGHT_MODULE` kan ange ett annat installerat Playwright-paket och `SHADOW_HEADLESS_SHELL=1` väljer dess Chromium i stället för systemets Chrome. `python3 scripts/build-shadow-racer.py` återskapar körfilerna från de bevarade originalen.
