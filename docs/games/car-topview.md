# Bilspel ovanifrån

Privat original `joynes/car_topview_game`, commit `5450575feeb6d6b42c48e7d2708ea3863da424c8`. Nio commits granskade; senaste fungerande Godot 4.3-prototypen från december 2024 används. Kategori AI-spel enligt Johannes gräns ungefär två år bakåt.

En grön 1024×600-yta, fyra väggar och fri bilkörning. Ingen bana, poäng eller multiplayer har utelämnats: sådant finns inte i senaste originalet. Äldre commits innehåller en annan bilmodell/debugreglage; de är historik, inte dolda lägen i senaste spelet.

PNG och PCM24/WAV är oförändrade, verifierade med SHA256. Fysikformlerna är direkt portade (acceleration 400, friktion 200, driftfaktor 2, svänghastighet 3, maxfart 800). JavaScript-kollisionen är en dokumenterad rekonstruktion, inte en identisk Godot-export. Ursprunglig kollisionsrektangel 30×50, separat spritevridning 270° och bildskala 0.5 är kvar. Väggarnas kollisionsytor har justerats till deras grafik; originalet saknade halvstorleksförskjutning och lät bilen lämna spelplanen genom luckor.

Start, paus, omstart, motorljud av/på, WASD och samtidiga touchknappar tillkommer. Tonhöjd 0.5–3 och framåtloop enligt WAV-importen bevaras. Se publika `games/car-topview/source-notes.md` och `provenance.json` för exakta tillgångs-/källhashar och ändringar.

## Lokal testning

`npm test`: 30 tester godkända, inklusive fyra fysik-/mediakontroller.

Webbläsartestet verifierar riktiga bildpixlar och vanlig tangentbordsstyrning fram/back/stopp, styrning i stillastående och rörelse, alla fyra väggarna, paus/släpp/omstart, faktiskt avkodad ljudbuffer med loop och hastighetsberoende ton samt gain för ljud av/på och paus. Riktiga samtidiga touchhändelser verifierar gas plus styrning och separat fingersläpp/cancel. Bild, ljud och kod kan svara 503; nytt försök måste följas av faktisk körning.

En första felaktig reverse-assert jämförde med positionen före utrullning; korrigerad att jämföra från det verkliga stoppet. Touch-testets första fingersläpp listade fel kontakt: Chromium-loggen visade att styrfingret släpptes, medan gasfingret korrekt var kvar. Testet rättades att släppa avsedd kontakt. Ingen rörelse-/friktionsändring krävdes.

Desktop 1280×1000 och porträtt 390×844 visuellt granskade. Kompakt liggande vy 844×390 håller plan och kontroller synliga samtidigt; både gränser och riktig touchkörning passerade och skärmbilden granskades. Testet läser renderade koordinater och ljudobjekt, skriver inte till bilens tillstånd.

Katalogkontroll passerade lokalt: spelbar iframe under AI-spel, utelämnad från Retrospel. Tidigare spel och AI-musik passerade navigationsregression. Publicering och liveverifiering återstår.
