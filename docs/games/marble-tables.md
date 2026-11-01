# Marble Tables

Retrospel från 2022 med AI-bearbetat webbgränssnitt. Öppen fysikleksak utan poäng, nivåer eller segerkrav. Färgade kulor faller automatiskt, studsar mot fem hinder och kan dras och släppas med mus eller touch. Högst 30 kulor hålls i originalets lista; kulor under banan tas bort.

## Bevarat original

- Unity-källa: `joynes/marble_tables`, commit `b7994d00c0d740d2d7738028daf5c6528c110372`, 2022-10-10, Unity 2021.3.6f1, produktversion 1.0.2.
- Återanvänt [ursprungligt webbbygge](https://github.com/joynes/marble-web-test), commit `4d139e8a9ba9b5ebe265dd5cb7301da2b4b3578d`, 2022-10-08, produktversion 1.0.2.
- Fyra filer i `Build/` och konfigurationen i `StreamingAssets/` är bytebevarade. Bana, material, kamera, fysik och verkliga Unity-mus-/touchkontroller körs i originalmotorn.
- Källrevision och webbbygge skiljer två dagar. Detta är inte ett påstående om ett reproducerat, nykompilerat Unity-bygge från den senare källan. Ingen Unity-editor finns installerad här.

AI-bearbetningen omfattar ett nytt svenskt gränssnitt: explicit start, laddningsförlopp, fel/nytt försök, omstart, helskärm, instruktioner och mobilanpassning. Kamerans 960×600-format bevaras när spelytan skalas, även i helskärm. Omstart laddar om dokumentet och frigör den gamla motorn innan nästa start. Spelet öppnas i egen flik från hemsidan.

Teknikreferenser: Unitys [WebGL-mallar](https://docs.unity3d.com/2021.3/Documentation/Manual/webgl-templates.html) och [WebGL-inmatning](https://docs.unity3d.com/2021.3/Documentation/Manual/webgl-input.html). Unity-versionens officiella mobilsupport är begränsad; testerna nedan är Chrome-emulering, inte fysisk Safari-/Android-verifiering.

## Verifiering

`npm run test:marble:browser` kör den riktiga WebGL-motorn i installerad Chrome med Playwright. Ingen spelstatus injiceras. Bildanalys via Python/Pillow lokaliserar verkliga renderade kulor, därefter används riktiga mus- respektive CDP-touchhändelser. Testet ser kulan flytta till en tom plats, stanna medan den hålls och falla efter släpp. Det kontrollerar även bildformat, omstart med ny motorstart, helskärm och fel/återhämtning efter blockerad WASM-hämtning. Slumpmässiga kulfärger kräver ibland väntan på en synlig varm/lila kula.

- Dator 1280×850 och touch 390×844: passerade lokalt.
- Båda vyerna granskade visuellt. Hela banan syns, inga kontroller överlappar.
- `test-results/marble-*-page.png`: granskningsbilder (ignorerade av Git).

Livekontroll och byteverifiering dokumenteras efter publicering i inventeringen.
