# Simple Driving Game — Polisbil

AI-remake av retrospel från 2023. Polisbilen kör genom den ursprungliga 3D-staden och samlar alla tre verkliga checkpoint-portar. Originalets Unity-motor, bilfysik, miljö, ljud, pausmeny och vinst/omspel är kvar. Den äldre bussversionen hålls separat i arbetskön.

## Källor och versionsgräns

- Senare Unity-källa: privat `joynes/SimpleDrivingGame`, commit `3f606f1b872fd051db28ebca1f10a9600b6293fb`, 2023-02-12. Unity 2021.3.6f1; DriverURP 0.1.0.
- Gemensamt äldre [native-webbbygge](https://github.com/joynes/unity_bus): `3f18cf90f94f996dd1c414d58cb6cd8f23f481d6`, 2023-01-24. Samma Unity-version; webbmallens produktnamn My project, version 5.0.1.
- **140 explicit namngivna objekt** i den senare källans MainScene har exakt samma position, rotation och skala i det äldre byggets `level1`, tolerans 0,0001. Det omfattar bland annat stadens gator och hinder. Det är bevis för en gemensam bana, inte identiska käll-/binärversioner.
- Alla tio bilparametrar från källans BaseKartClassic → KartClassic_Player → MainScene matchar motorns verkliga data: toppfart 20, acceleration 7, backfart 10, backacceleration 3, accelerationskurva 0,5, broms 16, frirullningsmotstånd 5, grepp 0,97, styrning 4 och extra gravitation 1. Kapselns skala är också samma: 0,92045 / 0,92045 / 2,4569092.

Den senare källans TypeOfVehicle aktiverar ovillkorligt polisbil och stänger av bussen. Det återskapas i scenens tillgångar. Den ursprungliga bussmodellen byts bara på det körda fordonet; parkerade fordon lämnas kvar. Källans CarPolice-kaross och fyra WP1-hjul konverteras från CarPack.FBX, med ursprunglig 512×512 CarPolice-textur. Samtliga **402 trianglar** bevaras. FBX-delarnas pivoter normaliseras till prefabens avsedda kaross-/hjulcentrum, prefabens lokala delar bakas samman och källans fordonsplacering/skala används. Förarfiguren och de äldre kart-hjulens grafik stängs av enligt polisvariantens avsikt; fysiska hjulkollidrar är aktiva.

Ingen Unity-editor eller lokal licens finns installerad i de vanliga mapparna. Detta är därför en dokumenterad rekonstruktion i det gemensamma äldre motorbygget, inte ett påstående om ett identiskt nykompilerat bygge från februarikällan. Källans bygginställningar pekar dessutom bara på en tom SampleScene; den spelbara MainScene/IntroMenu/WinScene/LoseScene återanvänds från det fungerande motorbygget.

## Originalfel och webbgränssnitt

- Originalet anger 20 checkpoints men innehåller tre PickupObject-portar. Portarnas serialiserade spelläge matchar inte målets. Alla tre portar återställs till samma läge som uppdraget och målet använder `mustCollectAllPickups`. Ingen port tas bort, flyttas eller ersätts. Den separata LapObject-markören bevaras. Detta är en rättning av ett omöjligt mallkrav till banans faktiska innehåll.
- Miljöns MeshCombiner har en nullreferens i sin lista och kastar NullReferenceException vid start. Bara den saknade referensen tas bort; alla fem verkliga miljögrupper behålls.
- Ett rörligt hus har en otillåten icke-konvex MeshCollider ihop med dynamisk Rigidbody. Kollidern görs konvex så att husets ursprungliga dynamik och kollisioner fungerar.
- Den sju punkter stora räknaren är svårläst, särskilt på telefon och framför ljusa moln. Dess ankrade HUD-grupp förstoras och flyttas så att ikonen ryms. Bakgrunderna får hög kontrast. 3D-kameran behåller 960×600-formatet.
- Svensk webbvärd med start/laddning, helskärm, omstart, hjälp, tangentbord och riktiga flerfingerknappar. Piltangenter/WASD och touchknappar skickar vanlig musinput till den ursprungliga motorn. Broms/back och analog styrning på själva canvasen bevaras. Fokusbyte/cancel/släpp släpper hållna knappar. P och webbknappen skickar den ursprungliga paustangenten. Verklig Tab får flytta fokus mellan HTML-kontroller.
- Unity 2021:s standardladdare kan lämna sin startpromise oavslutad när `.data` eller framework-skriptet inte hämtas. Webbvärden hämtar dessa först med kontrollerad felhantering och tillfälliga blobadresser som frigörs efter start. Originalets WASM, framework och loader är bytebevarade. Fel/nytt försök omfattar alla fyra laddningsfiler.

Det finns ingen sparad progression eller tidsgräns i den aktiva banan. WinScene och omspel nås genom de tre portarna. LoseScene ligger kvar som originaltillgång men den avstängda tidsgränsen ger ingen normal förlustväg; den påstås inte vara genomspelad. Originalets motor-menyer är på engelska.

## Reproduktion och bevarande

Analysmiljön använder [UnityPy](https://github.com/K0lb3/UnityPy) 1.25.4, PyYAML 6.0.3 och Pillow. Modellkonvertering använder befintlig Blender 4.2.17 LTS. Råkällans FBX/PSD eller privata källrepo publiceras inte; endast spelets färdiga tillgångar och webb-/konverteringskod följer med.

```sh
python scripts/compare-driving-scenes.py SOURCE/Assets/Karting/Scenes/MainScene.unity NATIVE/Build/cartWeb2.data
/Applications/Blender-4.2.app/Contents/MacOS/Blender --background --python scripts/export-driving-police.py -- SOURCE/Assets/Urban\ American\ Assets/Props/Vehicles/Source/CarPack.FBX /tmp/police-meshes.json
python scripts/build-driving-assets.py SOURCE NATIVE/Build/cartWeb2.data games/simple-driving/Build/cartWeb2.data --meshes /tmp/police-meshes.json
python scripts/verify-driving-assets.py NATIVE/Build/cartWeb2.data games/simple-driving/Build/cartWeb2.data games/simple-driving/Build/cartWeb2.provenance.json --source-repo SOURCE
npm run test:driving:browser
```

Konverteringen vägrar annan native-indata än den fixerade originalhashen. Två separata konverteringar gav identiska datafiler. Proveniensfilen innehåller källcommit, filhashar, pivotnormalisering och varje redigerat/nytillkommet objekt. Den oberoende kontrollen jämför alla objekt mot originalet: **6 476 oförändrade originalobjekt, 17 redigerade och tre nya polisobjekt**. Alla tolv AudioClip-objekt och externa ljudresurser är bytebevarade. Inga originalobjekt tas bort. Motorfilerna loader/framework/WASM jämförs också med originalet före publicering.

## Browser-verifiering

`test-driving-browser.cjs` använder installerad Chrome och Playwright. Riktiga tangenter/mus/CDP-touch driver motorn. En read-only observatör hittar den faktiska Unity/PhysX-positionen efter en verklig gasning och läser position/riktning för att guida testföraren. **Ingen WASM-minnescell, fordonsposition, poäng, port eller scen skrivs/injiceras.** Vinst och räknare kontrolleras i faktiskt renderade bilder med macOS Vision OCR; ett utelämnat tunt snedstreck normaliseras i räknarrader. Testet kräver fortfarande rätt antal och hela vinstskärmen.

Kontrollerna täcker hela uppdraget med alla tre portar, vinst och omspel på dator samt touch; två fingrar för gas/styrning; cancel, fokusbyte och verklig inbromsning; fryst fysik i paus; P för återupptagning; HTML-Tab; omstart och ny instans av motorn; bildformat/helskärm med körknappar, paus och synlig utgång; rätt Retro-länk i egen flik och frånvaro under AI-spel. Negativa fall blockerar loader, WASM, data och framework var för sig och kräver lyckat nytt försök samt faktisk körning. Motorn avslutas med officiella Quit före testkontextens stängning. 1280×1000 och 390×844 med touch/retina granskas visuellt. Dessa är Chrome-emuleringar, inte fysisk Safari-/Android-verifiering.

## Lokal slutkontroll 2026-11-01

Hela browser-sviten passerade efter korrigerad laddningsåterhämtning och helskärmskontroller. Dator och touch körde båda alla tre portar, visade riktig vinstskärm och återställde alla portar genom Play Again. Samtliga fyra blockerade laddningsfiler återhämtade sig till faktisk körning. Den separata kontrollen i stående/liggande helskärm passerade inklusive native paus och synlig utgång. Båda layouterna granskades visuellt. Inga JavaScript- eller Unity-fel loggades i positiva körningar.

Alla tre kopierade motorfiler jämfördes byte för byte mot originalbygget. Den oberoende tillgångs-/fysikkontrollen passerade. Hemsidans 23 enhetstester och tidigare spel-/musiknavigation passerade. Publicering och riktig speladress verifieras separat innan klarmarkering.
