# Läs och placera — Godot Reading Game

AI-remake av ett retrospel. Johannes original skapades december 2023–januari 2024. En webbport gjord 2026 ändrar inte originalets kategori.

## Källa och omfattning

GitHub: `joynes/godot-reading-game`, commit `97a4f8aa5381032663f51395c62bf5fa4811ccf3`, 7 januari 2024. Källrepot är privat; länken kräver behörighet. Även tidigare commits har granskats. `root.gd`, `RigidBody2D.gd`, `Node2D.tscn`, `CharacterScene.tscn` och `project.godot` är underlaget.

Originalet är en liten Godot 3-prototyp: tre objekt (`baloon`, `rocket`, `gun`), gravitation, drag och släpp, två upphöjda plattformar, golv och yttre väggar. Det finns exakt en aktiv relationskontroll: ballongen till höger om raketen. Den skriver ursprungligen bara till konsolen. Det finns inga poäng, sparade framsteg, fler banor, ljud eller genererade uppgifter i den körbara koden. Anteckningarna nämner framtida uppgiftsgenerering; den presenteras inte här som färdig funktion.

## Bevarad mekanik

- Tre föremål skapas från samma namnlista och startkoordinater: x=0, 204.8, 409.6 och y=300 vid en spelplan på 1024×600.
- Kropparnas rektanglar har halvstorlek 8.40148×1.812 respektive 12.3609×1.906. De faller utan rotation, motsvarande originalets character-läge.
- Plattformarnas mittpunkter är (195,248) och (683,423), halvbredd 194.56 respektive 120.832, halv­höjd 13.6620138. Golvets överkant ligger vid y=569.1931406.
- Närhet till golv/plattform mäts med originalets större rektangulära Area2D, inte bara med en x-jämförelse.
- Högerkontrollen överlappar raketens AreaRight (offset 31,1.01) med ballongens områden, och båda måste samtidigt vara nära en yta. En ballong långt till höger eller uppe i luften godkänns inte.
- Drag gör tillfälligt föremålet manuellt styrt, begränsat till 100 scenenheter per rörelsehändelse. Släpp återställer gravitationen.

## Återställning och avsiktliga webbändringar

Ingen webbexport finns i GitHub. Originalet kan inte laddas oförändrat: `images/sheet2.png` och `other/Sriracha-Regular.ttf` saknas i samtliga GitHub-commits. Drive-sökningar efter Godot-/reading-mappar och exakt `sheet2.png` gav inga träffar. Webbporten använder därför egna SVG-bilder av ballong, raket och leksakspistol, samt systemtypsnitt. Bilderna är ersättningar, inte återfunna original.

Godot-motorn är ersatt av en liten JavaScript-simulering med rektangulära kroppskollisioner. Den bevarar scenmått, gravitation 98, dämpning 0.1, dragbegränsning och sensorgeometri, men är **inte en identisk Godot-fysiksimulering**. Gravitationsvärdet är Godot 3:s standard när projektet inte anger något eget: [Godot 3.5 ProjectSettings](https://docs.godotengine.org/en/3.5/classes/class_projectsettings.html). [RigidBody2D i Godot 3.5](https://docs.godotengine.org/en/3.5/classes/class_rigidbody2d.html) beskriver character-läget.

Scenen skalas proportionerligt på telefon. Föremål hålls inom den synliga spelplanen, så att drag inte kan gömma dem utanför skärmen. De stora, delvis roterade originalväggarna ersätts av dessa synliga gränser. Plattformar och golv följer originalets koordinater. Det är en dokumenterad gränsanpassning, inte en identisk export av originalscenen.

Webbversionen rättar instruktionens gamla ord ”dockan” till ballongen som koden faktiskt kontrollerar. Synlig rätt/fel-återkoppling, start, omstart och tangentbord tillkommer. Uppgiften fortsätter fungera efter rätt svar; flyttas ballongen bort visar spelet åter att placeringen behöver ändras. Inga nya banor eller poäng läggs till. Originalets ofullständiga touchhantering och gömda partiklar återanvänds inte. Överlappande tryckytor väljer föremålet närmast tryckets centrum. Pointer capture, touch cancel, fokusbyte och tangentbordssläpp fungerar i den nya inmatningen. Nätfel vid modulhämtning visar en knapp för omladdning.

## Testning

`node --test scripts/test-godot-reading.mjs` kontrollerar geometri, fall till samtliga tre ytor, båda objektens marknärhet, högerområdets räckvidd, luftplacering, kroppskontakt och drag/släpp.

`npm run test:godot-reading:browser` använder verkliga mus-, tangentbords- och touchhändelser. Det löser originaluppgiften på båda plattformarna och golvet, provar fel sida/långt avstånd/luften, flyttar det tredje föremålet, provar omstart, Escape, Tab, touch cancel och modulfel med återhämtning. Skärmbilder tas på dator och telefon i båda riktningarna. Testet skriver inte till spelvärlden.
