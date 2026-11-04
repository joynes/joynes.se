# Godot Reading Game / Läs och placera

**Withdrawn on 4 November 2026 at the owner’s request. Do not republish. The hosted build and homepage listing have been removed; source remains preserved.**

Källa: privat repo `joynes/godot-reading-game`, commit `97a4f8aa5381032663f51395c62bf5fa4811ccf3`. December 2023–januari 2024, därför Retrospel / AI-remake. Webbversionen finns i `games/godot-reading/`.

Spelet är en liten prototyp, inte en färdig bank med läsuppgifter. Alla tre namngivna föremål, båda plattformarna, golvet och den enda aktiva relationen (ballongen till höger om raketen) är återskapade. Ursprunglig instruktionsetikett sade felaktigt ”dockan”; körbar kod avgör avsikten. Alla GitHub-commits granskade. Saknade `sheet2.png` och Sriracha-fonten hittades inte heller genom riktade Drive-sökningar.

Exakta källhashar finns i `games/godot-reading/provenance.json`. Spelarnas publika källanteckningar beskriver skillnaderna: egna SVG-bilder/systemfont, JavaScript-rektangelfysik i stället för Godot, synliga gränser, synlig återkoppling, omstart och komplett touch/tangentbord. Inga påhittade extra originalbanor eller genererade uppgifter. Ingen originalmusik finns att bevara.

## Lokal verifiering

- `npm test`: 26 godkända kontroller, inklusive tre regler-/fysiktester för detta spel.
- `npm run test:godot-reading:browser`: verkliga musdrag löser uppgiften på båda plattformarna och golvet. Fel sida, långt avstånd och luftplacering underkänns. Tredje objektet flyttas och faller till övre plattformen. Omstart, tangentbordslösning, Escape och Tab fungerar.
- Riktiga CDP-touchhändelser på 390×844 och 844×390 löser samma uppgift, även touch cancel. Täta föremål går att välja separat; återflyttning efter rätt svar tar bort rättmarkeringen.
- Simulerad 503 på core-modulen visar återhämtningsknapp, nytt försök startar ett spelbart spel.
- Skärmbilder `test-results/godot-reading-{desktop,mobile,landscape}.png` visuellt granskade. Testet läser bara synlig DOM och skickar vanliga inmatningshändelser; det injicerar inte speltillstånd.

Katalogkontroll passerade lokalt: startbart iframe från Retrospel, utelämnat från AI-spel. Tidigare inbäddade spel och AI-musik passerade navigationsregression. Publicering verifieras separat före klarmarkering i inventeringen.

## Publicering verifierad

https://joynes.github.io/joynes.se/games/godot-reading/

Kodcommit `6a2a118629c635838aa29c77e051a2c36f802486`, lyckad Pages-körning `41293921395`. Hela webbläsarsviten med katalogkontroll och tidigare spel/musik passerade också på liveadressen. Alla åtta spel-/katalog-/HTML-filer SHA256-verifierade från kanoniska publika URL:er. Inventeringen är klarmarkerad och kön går vidare till Bilspel ovanifrån.

## Renewed input audit — 3 November 2026

The web adapter now ignores repeated Space/Enter events when toggling an object. Landscape controls sit beside the complete scene. The homepage uses a shorter game frame on landscape phones and directs game Back links to the top-level list, avoiding a homepage nested inside a game. The original three objects, two shelves, floor, gravity and grounded/right-side success test remain unchanged.
