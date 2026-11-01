# Bilspel ovanifrån

AI-spel enligt Johannes åldersindelning: originalet är från december 2024, inom de senaste två åren vid webbportningen i november 2026. Det är en prototyp för fri körning, inte ett lopp med poäng eller banupplåsning.

## Original

Privat GitHub-repo `joynes/car_topview_game`, commit `5450575feeb6d6b42c48e7d2708ea3863da424c8` (24 december 2024). Samtliga nio commits granskade. Senaste versionens `car.gd`, `main.gd`, `node_2d.tscn` och `project.godot` är underlag. Tidigare debugreglage och den äldre cykelmodellen för styrning ingår inte i den senaste koden och blandas därför inte in här.

`car.png` och `engine.wav` är oförändrade originalfiler; SHA256 finns i `provenance.json`. Bilden är 256×256 med transparens och ritas centrerad i skala 0.5 med lokal rotation 270°, precis som i källan. Motorljudet är mono PCM24 i 48 kHz. Källans WAV-import anger framåtriktad loop från början till slut. Godots [importkod för version 4.3](https://github.com/godotengine/godot/blob/4.3/editor/import/resource_importer_wav.cpp) anger enumordningen Detect, Disabled, Forward, Ping-Pong, Backward; värdet 2 är därför Forward. [Godots ljudimportdokumentation](https://docs.godotengine.org/en/4.3/tutorials/assets_pipeline/importing_audio_samples.html) beskriver looparna.

## Rörelse som bevarats

- 1024×600 grön yta, fyra grå 20-pixelsväggar. Bilen börjar i (512,300), rotation 0 och hastighet 0.
- Upp/framåt ger -400 enheter/s² längs bilens lokala x-axel; ned/back ger +400. Bilen pekar därför åt vänster från start med originalbildens rotation.
- Vänster/höger vrider bilen med 3 radianer/s även stillastående.
- Hastigheten delas upp i längd- och sidled varje steg. Friktionen flyttar längdkomponenten 200 enheter/s² mot noll och sidkomponenten 400 mot noll (driftfaktor 2), sedan kombineras komponenterna igen.
- Maxfarten är 800 enheter/s. När båda riktningsknapparna hålls inne tar de ut varandra, men vanlig friktion fortsätter.
- Bilens kollisionsrektangel är 30×50 och roterar med bilkroppen. Bildens separata 270°-vridning och större bildmått är originalets; den målade bilen kan därför överlappa en vägg visuellt trots att kroppen stannat.
- Motorljudets uppspelningshastighet följer samma linjära samband som originalet: 0.5 vid stillastående, 3 vid maxfart.

## Webbändringar

Godot 4.3-motorn körs inte i den här versionen. De fria rörelseformlerna är direkt överförda till JavaScript med fasta steg på 1/60 sekund. Väggkontakten återskapas med den roterade rektangelns utsträckning och glidning längs axelräta väggar; det är inte en identisk export av Godots `move_and_slide`.

Originalets vägggrafik ritas från en övre vänsterpunkt, medan dess kollisionsrektangel centreras på samma punkt utan halvstorleksförskjutning. Kollisionsytorna täcker därför inte de synliga väggarna. Webbporten låter samtliga fyra synliga väggar stoppa bilens kropp. Inga nya hinder, lopp eller vinster läggs till.

Start, omstart, paus, WASD, mus-/touchknappar med samtidig gas och styrning, fokus-/avbrottshantering och ljud av/på är webbgränssnitt. Startknappen aktiverar webbläsarens ljud. Grundvolymen är 50 procent. Paus tystar ljudet och släpper alla intryckta kontroller. Friktionen fortsätter efter vanliga knappsläpp. Laddningsfel för bild, ljud eller kod kan återhämtas med nytt försök. Hastighetsmätaren visar scenpixlar/s, inte en påhittad km/h-skala.

## Verifiering

`node --test scripts/test-car-topview.mjs` kontrollerar accelerations-/friktionsförlopp, symmetrisk back, stillastående styrning, sidfriktion, maxfart, ljudton, samtliga väggar och originalfilerna.

`npm run test:car-topview:browser` kör verkliga tangent-, mus-/touchhändelser. Det kontrollerar bildpixlar, fram/back/stopp, styrning, fyra väggkontakter, paus/omstart, ljudets verkliga avkodade loopbuffer och hastighetsberoende ton, samtidig touch med separat fingersläpp, touch cancel, mobil i båda riktningarna samt återhämtning efter bild-/ljud-/modulfel. Testet läser bara återgivna koordinater och Web Audio-objekt; det ändrar inte bilens tillstånd.
