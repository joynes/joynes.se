# Bus Test Game — Buss

AI-remake av retrospel från januari 2023. Den äldre bussversionen publiceras separat från den senare polisvarianten. Originalets bussmodell, förare, hjulgrafik, stad, bilfysik, kameror, ljud och spelmenyer är bevarade.

## Ursprung och bevarande

- Ursprungligt [joynes/unity_bus](https://github.com/joynes/unity_bus), commit `3f18cf90f94f996dd1c414d58cb6cd8f23f481d6`, 2023-01-24. Unity 2021.3.6f1, produkt My project 5.0.1.
- Den senare SimpleDrivingGame-källan delar 140 identiska explicita objekttransformationer i stadsbanan men väljer en annan polisbil. Se [polisversionens dokumentation](simple-driving.md) för jämförelsen. Bussversionen använder det äldre byggets egna tillgångar.
- Den oberoende kontrollen bevisar **6 482 oförändrade originalobjekt, 11 dokumenterade ändringar och noll tillagda objekt**. Alla ursprungliga GameObject-/Transform-objekt, modeller, renderare, material, texturer, animationer, kameror, Rigidbody-/hjulkollidrar, bilens physics/input-komponenter och alla tolv ljudklipp är bytebevarade. Externa ljudresurser matchar också.
- Två konverteringar gav exakt samma datafil. Den andra byggdes enbart från det publika originalrepot. Proveniensfilen innehåller källcommit, indata-/utdatahashar och varje ändrat objekt.

De elva ändringarna rättar samma verifierade originalfel som i den gemensamma banan: tre verkliga PickupObject-portar får samma spelläge som målet och uppdraget samlar alla tre i stället för det omöjliga mallkravet 20. En saknad MeshCombiner-referens tas bort medan fem verkliga miljögrupper behålls. Det dynamiska husets MeshCollider blir konvex. HUD-gruppen förstoras/placeras inom bilden och dess fyra bakgrundsbilder får hög kontrast. Det dynamiska huset ligger utanför de fem grupper som batchas. Originalets dynamik behålls.

Den aktiva banan har ingen tidsgräns. Vinst och Play Again nås genom de tre portarna. Originalets oanvända LoseScene ligger kvar, utan påstående om en genomspelad förlustväg. Unitys ursprungliga startbild och engelska motormenyer behålls.

## Gemensam webbvärd

Bussversionens egen HTML, datafil och proveniens ligger i `games/unity-bus/`. Den använder den publicerade gemensamma webbvärden i `games/simple-driving/`: `app.js`, `styles.css`, originalets tre oförändrade engine-filer och StreamingAssets-konfiguration. Därmed hämtar varje spel sin egen scen/data medan samma motor och gränssnitt används. Motoradressen följer skriptets adress; dataadressen följer den öppnade spelsidan.

Webbvärden ger svensk hjälp, gas/broms/back, piltangenter/WASD, flerfingerknappar, native paus, Tab-navigation, omstart, laddningsfel/nytt försök och helskärm. Även stående/liggande helskärm har körknappar, paus och synlig utgång. Kamerans 960×600-format bevaras. Data och framework hämtas med kontrollerad felhantering före Unity-start och tillfälliga blobadresser frigörs efter start. Mer om lösningen i polisversionens dokumentation.

Ändringar i de gemensamma engine-/app-/CSS-filerna ska kontrolleras för båda varianterna. Scenernas datafiler är separata.

## Reproduktion

Använd separat Python-miljö med UnityPy 1.25.4, PyYAML 6.0.3 och Pillow. `NATIVE` nedan är en checkout av den fixerade offentliga originalrevisionen. Blender eller privat C#-källa behövs inte för busskonverteringen.

```sh
python scripts/build-driving-assets.py NATIVE NATIVE/Build/cartWeb2.data games/unity-bus/Build/cartWeb2.data --vehicle bus
python scripts/verify-driving-assets.py NATIVE/Build/cartWeb2.data games/unity-bus/Build/cartWeb2.data games/unity-bus/Build/cartWeb2.provenance.json
npm run test:bus:browser
```

Testerna använder installerad Chrome, Playwright och macOS Vision/Swift för avläsning av faktiskt renderad vinst/räknare. Den read-only observatören läser bilens verkliga position efter kalibrering med vanlig gasning. Testföraren använder normal mus, tangenter och CDP-touch. Den kör söder om de ursprungliga parkerade bilarna/huset och reglerar kurvfarten med spelets riktiga broms. Det fullständiga vinstkravet gäller även efter dessa mellanpunkter.

## Lokal verifiering 2026-11-01

Hela `npm run test:bus:browser` passerade: samtliga tre portar, verklig vinst och omspel på dator och touch; tangentbord, flerfingerstyrning/cancel, fokusbyte och fysisk inbromsning, fryst fysik i paus/återupptagning, Tab, omstart, Retro-detalj/länk i egen flik, frånvaro under AI, samt fyra separata laddningsfel (loader/WASM/data/framework) med lyckat nytt försök och faktisk körning. Den separata helskärmskontrollen passerade i 390×844 och 844×390 med alla knappar, native paus och utgång. Vy- och vinstbilder granskades visuellt. Detta är Chrome-emulering, inte fysisk Safari-/Android-verifiering; äldre Unity har begränsat officiellt mobilstöd.

Tillgångskontrollen ovan, hemsidans 23 enhetstester och tidigare spel-/musiknavigation passerade. Publicering och livekontroll återstår.
