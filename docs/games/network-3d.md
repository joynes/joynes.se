# 3D Network Game

[Spela](https://test-3d-network-game.fly.dev/) · [AI-spel på hemsidan](https://joynes.github.io/joynes.se/#games/ai/network-3d)

Privat original: `joynes/test-rig-gemini`, commit `e1106ae25e340f06f09a327351628451a0847694`, 2025. Kategori AI-spel enligt Johannes indelning efter originalets ålder. Den beständiga arbetskopian finns i syskonrepot `test-rig-gemini`. Källändringar är committade lokalt; den manuella Fly-publiceringen bygger den testade arbetskopian.

## Ursprung och bevarad funktion

Den kompletta originalfilen Walking.fbx är oförändrad: 53 385 824 byte, SHA256 `26c016966dfd51be80068b96ca2672820b22785dc8020b02abdbac0477ff0d6b`. En skinnad mesh med 74 340 hörnpunkter, 65 ben, ursprungliga material och gånganimation. Originalets sex modellval pekar alla på samma figur; det framgår i gränssnittet.

Spelarens skalning till 1,8 enheter, färgton, gångfart 2, sprintfart 5, mjuk acceleration, kamerans sfäriska tredjepersonsperspektiv, animationshastighet, himmel/dimma, grönt markplan, rutnät, 100 träd och 50 stenar behålls. Det är en fri utforsknings- och nätverksprototyp utan uppdrag, strider, poäng eller vinstskärm. Three.js 0.167.0 och js-yaml 4.1.0 med ursprungliga licenser och verifierade npm-integriteter ligger lokalt i webbbygget.

## Rättningar inför publicering

Tidigare skapade varje klient en egen slumpad skog, medan servern saknade kollisioner. Nu skickar servern samma 150 hinder till alla klienter. Prediction och server använder samma kollisionscirklar och små rörelsesteg, med faktisk utjämnad hastighet. Världen är fortsatt utan rörelsegräns, som originalet. Felaktiga, icke-ändliga, duplicerade och alltför snabba inputpaket begränsas med ordning, kögräns och servertid.

Originalfiguren hämtas bara en gång per sidladdning även när flera figurer och modellalias används. Progress, nytt försök efter hämtningsfel, oberoende figurmaterial och skydd mot sena laddningar efter att spelare lämnat har lagts till. Klienterna rensar gamla identiteter, inputs och snapshots vid återanslutning och behåller en klocktimer. En serveromstart ger en ny gemensam skog.

Tangentbord fungerar även på pekskärmsenheter. Canvas får musrörelser; två fingrar styr gång och kamera oberoende. Fokusbyte, Tab, meny och touch-cancel släpper styrningen. Kamerareglagen kan välja noll, vertikal blick begränsas korrekt och frametid/pixeltäthet begränsas efter bakgrundsvistelse. Alla ursprungliga inställningar finns kvar. Spara lagrar personliga webbläsarinställningar och hämtar YAML, i stället för att låta en besökare skriva över serverns gemensamma konfiguration. Blockerad lagring och misslyckad konfigurationshämtning har kompletta standardvärden.

## Tester och drift

- `npm test` i spelrepot: fyra godkända tester för exakta original-/biblioteksfiler, skogens innehåll, kollisioner även vid exakt centrum och hög fart, inputvalidering/ordning/tidsbudget samt städning efter spelare.
- `npm run test:browser`: tre riktiga Chrome-klienter, varav en med touch. Verkliga serverpaket och kopierad läsdiagnostik används; spelarpositioner skrivs aldrig in av testerna. Ursprunglig rigg, ändrad benpose under gång, faktiska fjärrfigurer, delad skog och rörelse verifieras.
- Vanlig tangentstyrning når ett riktigt träd och auktoritativa snapshots visar kontakt utan genomträngning. Musdrag, tangentrotation, Tab, två samtidiga tumkontroller och separat fingersläpp/cancel testas. Samtliga inställningar, oberoende färgtoner, YAML-hämtning och sparade värden efter omladdning verifieras.
- Återanslutningar behåller en modellhämtning per sidliv och en klocktimer. Gamla figurer försvinner. Den lokala servern stoppas och startas på riktigt; alla klienter återansluter till den nya världen. Livesviten startar inte om produktionen.
- FBX503 följs av riktigt nytt försök, full rigg och vanlig spelrörelse. Modul503, konfigurations503, blockerad lagring och WebSocket-avbrott/nytt försök verifieras. Återanslutningsknappen fungerar även när startkortet är öppet.
- Desktop1100×760, porträtt390×844 och landskap844×390 har granskats visuellt. Originalets screenshot_616.jpg visar ett modulfel och används inte som bevis på fungerande spel.

Samma livesvit är godkänd mot `https://test-3d-network-game.fly.dev/` med release `c902a88145a7baf8a14635b4c10f7035e6ec506a`. Alla 16 publika spel-/biblioteksfiler SHA256-matchar de lokalt testade filerna, inklusive hela FBX-filen. Serverns health anger version1.1.0 och samma release.

Fly-image `registry.fly.io/test-3d-network-game:deployment-01M6BFWP82JM37J5MRY22AWCKK`, manifest SHA256 `b9869fd8b90e20c3e637175f0a03aa59de147d159a431d6620480dbebf24ccfe`. Befintlig app, Stockholm, delad1CPU/256MB och automatisk vila behålls. Antalet instanser minskades från två till en: servervärlden finns i processminne och två servrar skulle skilja spelarna åt. Den befintliga instansen uppdaterades på plats och hälsokontrollen är godkänd. Inga beständiga volymer ändrades.

Node22.22.0 och låst npm-fil används. Drifthjälparen kräver committad källkod och en instans med `--ha=false`. GitHub-arbetsflödet har kompletterats med enhets- och webbläsartester före framtida publicering och en livekontroll efteråt. Inga genererade testbilder eller installerade beroenden har committats.
