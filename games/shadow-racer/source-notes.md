# ShadowRacer — källor och webbversion

Original från 2008, alltså **Retrospel · AI-remake** enligt hemsidans indelning. Webbgränssnittet är gjort med AI. Spelets ActionScript-/APE-motor körs fortfarande som ActionScript i Ruffle; det är ingen förenklad JavaScript-ersättning för bilen eller banan.

## Båda originalutgåvorna

Källmapp: [ShadowRacerPrototype2 på Google Drive](https://drive.google.com/drive/folders/1TT9grPo0r_9tHhVN6Lm97YAjC5JnzQh7).

| Utgåva | Drive-fil | Byte | SHA256 för arkiverat original |
| --- | --- | ---: | --- |
| 28 september 2008 | `1qddu16lVULMHOZZj8u4Eg14MQhvnGZL_` | 20341 | `ca347f3481ee254d60ec3bd856821b6f6546f8567120872509659844622a4e3b` |
| 5 oktober 2008, senare debugbygge | `13aBmuP42Lz5JKDKzJjwTRRV1P35LGqJq` | 32428 | `4bf85f616c53e2f11fef8c40458e032c2555cbf0a8951bcddcf1f5ca26d73c89` |

Båda finns oförändrade under `original/` och är valbara i webbgränssnittet. Det senare bygget är standard. Den extra kopian i `bin-debug/bin-release`, Drive-fil `1L4EEn7CWEmZkL1pTIPHa00xCvTOEawWK`, är byteidentisk med septemberutgåvan och räknas inte som en tredje spelversion. Mappen `history` är Flex-mallens webbläsarhistorikfiler, inte fler banor eller spelutgåvor.

Även `Car.as`, `Surfaces.as`, `APEngine.as`, projektinställningarna och huvudklasserna lästes. Den senare huvudklassen `ShadowRacerPrototype3.as` har samma innehåll som `ShadowRacerPrototype2_.as` förutom klass- och konstruktörsnamnet. En senare fil-/uppladdningsdag gör därför inte spelet till ett nytt AI-spel. Originalkällorna finns i den privata, ignorerade Drive-kopian; inga privata uppladdningslänkar behövs för att spela.

## Vad som bevaras

Originalets 650 × 350-scen, vektorformer, fjädrande bil, två hjul, bakhjulsdrift, mjuka karossdelar, hela hinderbanan, gravitation, kollisioner och kamera följer den ursprungliga motorn. Ursprungskoden använder ett fysiksteg på 1/4, gravitationskraft `(0,2)` och en scenfrekvens på 55 bildrutor per sekund. Gas är `0.3`, backning `-0.1` och lutningens kraft `7` i originalets enheter. Fler än fem karosskollisioner avslutar försöket, och bilens ursprungliga x-position över 3400 ger målgång. Ingen bana eller kollisionsregel hoppades över för testerna.

Det finns en hinderbana, inte en ny kampanj med påhittade poäng eller uppdrag. Spöruppspelning finns som ofärdig kod men inspelningen är avstängd i originalet. Den funktionen marknadsförs därför inte. Originalet använder inga ljudresurser.

## Webbgränssnitt och läsande mätpunkt

Touch, WASD, säker tangent-/touch-release, paus, omstart, utgåvebyte, felruta/nytt försök och svenska resultat läggs runt originalet. Två fingrar kan hålla gas och lutning; den kvarvarande knappen återtas när det andra fingret släpps. Ursprungliga piltangentshändelser skickas till spelets egen tangenthanterare, inklusive dess normala Enter-start. Bilen flyttas aldrig direkt av webbgränssnittet.

En läsande `trace` läggs i början av huvudklassens `run`-metod. Den avläser verkligt spelläge, positioner, kollisionsantal, timer, tangentinmatning och bildrutenummer. Webbgränssnittet skriver aldrig tillbaka dessa värden. Alla befintliga instruktioner i metoden är bevarade och de övriga **337 metoderna är byteidentiska**. Den extra kodens instruktioner får enligt testet bara läsa, förgrena sig och anropa `trace`; den kan inte skriva speldata. [Bevarandebeviset](native-observer-proof.json) visar båda original- och runtimehasharna. Byggskript: `scripts/build-shadow-racer.py`; kontroll: `python3 scripts/test-shadow-racer.py` i hemsiderepot.

Den ursprungliga timersträngen placerar decimaltecknet fel efter längre tider. Webbgränssnittet visar den verkliga timer-räknaren i hundradelar som sekunder. Paus använder Ruffles suspend/resume och fryser även originaltimern; pausad tid läggs inte på loppet efter återgång.

Den övergivna PHP-topplistan ersätts av lokala rekord, separat per utgåva. Äldre nätadresser skrivs om till en inbäddad informationssträng. Ruffles nätåtkomst är begränsad och sidans `connect-src` tillåter bara den egna webbplatsen och inbäddade data. Testet kräver noll externa HTTP-anrop. Inga namn eller tider skickas till den gamla servern. Blockerad lokal lagring ska inte hindra spelning.

## Motor och licenser

Ruffle **0.7.1**, officiellt självhostat webbpaket från 7 oktober 2026, är vendorerat komplett under `vendor/ruffle/`, inklusive båda WASM-varianterna och MIT-/Apache-licenserna. Inget CDN eller senaste-version-anrop krävs vid spelstart. Första starten hämtar cirka 15 MB. Canvas-renderaren används för originalets enkla vektorgrafik och hårfina linjer; spelmotorn och fysiken är desamma.

- [Officiell Ruffle-release](https://github.com/ruffle-rs/ruffle/releases/tag/v0.7.1)
- [Ruffles självhostning](https://github.com/ruffle-rs/ruffle/tree/v0.7.1/web/packages/selfhosted)
- [Player API, inklusive suspend/resume och traceObserver](https://ruffle.rs/js-docs/master/interfaces/Player.PlayerV1.html)
- [Laddningsalternativ för en inläst SWF](https://ruffle.rs/js-docs/master/interfaces/Config.DataLoadOptions.html)
- [APE:s MIT-licens, Alec Cove 2006–2007](LICENSE_APE), bevarad från originalets `APEngine.as`.

Webbläsartestet finns i `scripts/test-shadow-racer-browser.cjs`. Det kör båda kompletta originalen till riktig målgång genom vanliga tangentkontroller, kontrollerar krasch/omspel, riktig timer/paus, rekord efter omladdning, utgåvebyte, native multi-touch och laddningsfel/nytt försök. Helbanepiloten läser native-tillstånd och skickar DOM-tangenthändelser genom vanliga kontroller; separata kontroller använder riktiga webbläsartangenter och native CDP-touch. Inga positioner, poäng, lägen eller kollisionsflaggor injiceras. Chromium och automatiserad touch är testmiljön, inte ett fysiskt iPad-/Safari-test.
