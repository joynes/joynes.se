# Plan för spel på joynes.se

Målet är att alla identifierade spel och relevanta spelversioner från Johannes GitHub och Google Drive ska fungera på webben, vara testade och publicerade. Arbetet görs **ett spel i taget**. Ingen post blir klar av enbart ett lyckat bygge eller ett HTTP-svar.

## Inventering och källor

Den maskinläsbara kön finns i [games-inventory.json](../data/games-inventory.json), med källänkar, versionsrelationer, testbevis och publiceringsadresser. Listan omfattar både webbspel, prototyper och äldre spelutgåvor. Oklara versionsrelationer utreds utan att någon variant tappas bort. Ytterligare verifierade spel läggs till i kön.

Jaro och Grodan-mapparnas texter/grafik och fotoalbumet 10 -20 - rall är inte spelprogram. Kvarvarande kandidater, bland annat picture_puzzle och lightbot, ska kontrolleras innan de klassificeras. Ett tomt projekt får inte redovisas som ett färdigt spel.

## Kategorier

- **Retrospel:** äldre spel som görs om till webb med AI. Den publicerade versionen märks **AI-remake av retrospel**.
- **AI-spel:** de nyare spelen från ungefär de senaste två åren, enligt Johannes instruktion.
- Ny publicering eller ny port ändrar inte ett gammalt originals kategori. Båda kategorierna använder AI; skillnaden är spelets ursprung.

## Arbetsgång per spel

1. Läs originalets källor, dokumentation, regler, banor och tillgångar. Dokumentera vad som ska bevaras och vilken version som används.
2. Återanvänd fungerande webbkod. Exportera eller porta native-/Flash-spel med samma kärnmekanik. En allmän demo med rätt titel räcker inte.
3. Gör spelet användbart på både dator och telefon/surfplatta, med begriplig start, instruktioner, omstart och felåterhämtning. Bevara ljud, grafik, poäng, banor och multiplayer där de ingår.
4. Kör meningsfulla regeltester samt riktiga webbläsartester: start, spelrörelse/svar, rätt/fel eller vinst/förlust, omstart, banbyte, tangentbord och touch. Kontrollera visuellt på mobil och dator. Multiplayer kräver riktiga samtidiga klienter och server.
5. Rätta upptäckta problem och kör relevanta tester igen. Spara testresultat och skärmbilder utanför den publika spelkatalogen.
6. Gör en spelspecifik commit. Publicera bara den testade versionen. För statiska spel används befintliga GitHub Pages på joynes.se; befintliga separata speltjänster behåller rätt hosting/server när sådan krävs.
7. Verifiera den publicerade versionens identitet och spelbarhet, länka från hemsidans Games och anteckna URL/commits/testbevis i inventeringen. Gör en statuscommit.
8. Gå vidare till nästa spel först när föregående spel är verifierat eller har en konkret dokumenterad blockering som inte går att lösa nu.

## Kö

| Ordning | Spel eller version | Status | Uppgift |
| --- | --- | --- | --- |
| 1 | Frågespelet | Publicerat och verifierat | Webbspel; laga omstart, återkoppling och mobilvy. Rätta verifierade fel i frågebanken. |
| 2 | Milians Grimace Matte-spel — Gemini | Publicerat och verifierat | Bevara originalets spelregler; testa plus/minus, rätt/fel, omstart och mobil. |
| 3 | Milians Grimace Matte-spel — Codex | Publicerat och verifierat | Separat implementation av samma spelidé. Bevara som egen spelbar variant. |
| 4 | Läs- och ordquiz | Publicerat och verifierat | Källkod i SDL/C++; befintligt webbbygge finns i quiz_game_online. Kontrollera filer, inmatning och mobilstöd. |
| 5 | Memit | Publicerat och verifierat | Övnings-, gissnings- och provlägen. Återställ saknade bibliotek och speldata före publicering. |
| 6 | Skoluppgifter / Ordhjälten | Publicerat och verifierat | Granska aktuell webbversion och publicerad adress; bevara alla befintliga spellägen. |
| 7 | Small Wonders / Inuti språkmodellen | Publicerat och verifierat | Källrepo och llmspel-play är samma projekt. Testa torn, spelbart kapitel, MicroGPT-demo och garden-vy. |
| 8 | Marble Tables | Väntar | Unity-källa och marble-web-test är samma projekt. Verifiera webbbygget och styrningen. |
| 9 | Simple Driving Game | Väntar | Unity-källa. Identifiera spelmekanik, tillgångar och webbexport; testa körning på tangentbord och touch. |
| 10 | Bus Test Game | Väntar | Befintligt Unity WebGL-bygge. Utred relationen till SimpleDrivingGame utan att anta att de är samma. |
| 11 | Godot Reading Game | Väntar | Ofullständig Godot-prototyp med objekt och lägesrelationer. Återskapa saknade delar och gör webbversion. |
| 12 | Bilspel ovanifrån | Väntar | Godot-projekt. Bevara bilfysik och styrning i webbversion. |
| 13 | SDL Space / hinderbana | Väntar | simple_game_using_sdl2_wasm har spelare, hinder, kollision och poäng. Grafikdemona är inte separata spel. |
| 14 | Hello Multiplayer Game | Väntar | Canvas/Socket.IO. Testa riktiga samtidiga klienter och server, inte bara en statisk sida. |
| 15 | Three.js Network Game | Väntar | 3D/Socket.IO-prototyp. Testa spelare, anslutning, rörelse och touch med riktig server. |
| 16 | Neon Interceptor | Väntar | Befintligt aktivt spelprojekt. Granska rätt checkout och instruktioner; bevara kampanj, bossar, butik och multiplayer. |
| 17 | WorldForge | Väntar | Befintligt 3D-multiplayerspel. Testa byggande, uthållig lagring, avatarer och riktiga samtidiga klienter. |
| 18 | ShadowRacer | Väntar | ActionScript/Flash-källa och SWF i Drive. Granska spelmekanik och återanvänd originalmaterial i webbversion. |
| 19 | Rall v026 — ASCII | Väntar | Drive-release som ZIP. Inspektera original och återskapa spelets faktiska regler. |
| 20 | Rall v030 — Fighter | Väntar | Drive-release som ZIP. Inspektera före val av portningsmetod. |
| 21 | Rall v054 / rall0054 — Tank | Väntar | Originalbeskrivningen anger stridsvagnsduell. Bevara originalkartor, grafik, styrning och eventuella spelarlägen. |
| 22 | Rall006 — Tank | Väntar | Befintlig remake behöver full kontroll mot originalets lag, rundor, kartor, normal/siege och powerups. |
| 23 | Rall v066 — Tank2 | Väntar | Drive-release. Jämför med rall006; slå bara ihop poster om faktisk versionsrelation verifieras. |
| 24 | Rall v073 — Party | Väntar | Drive-release och party-källmapp. Inspektera och porta originalets spellägen. |
| 25 | Rall v080 — Fighter | Väntar | Lokalt originalarkiv med C++-källa och Drive-release. Läs regler, grafik och ljud före portning. |
| 26 | Rall008 | Väntar | Originalarkiv med Allegro/FMOD/Zoidcom. Utred spelregler och multiplayer; anta inte att det är identiskt med v080/v082. |
| 27 | Rall v082 — Fighter Multi | Väntar | Drive-release som MSI. Jämför med rall008; multiplayer måste verifieras före sammanslagning. |

## Publiceringskrav

- `published_verified` kräver passerade lokala funktions- och webbläsartester, publicerad testad commit och kontroll på den riktiga adressen.
- Befintligt publicerade spel ska verifieras; de räknas inte automatiskt som klara.
- Äldre releasefiler får laddas ned för analys men ska inte köras okontrollerat. Källarkiven bevaras och versionernas egenskaper jämförs.
- Testskript får känna till intern state för att välja rätt handling, men måste utlösa verkliga kontroller, fånga fel och verifiera beteendet. Att endast forcera ett slutläge är inte ett speltest.
- Arbetslogg och inventering ska skilja på påbörjat, lokalt testat, publicerat och verifierat.

## Arbetslogg

### 2026-11-01

- Kontrollerat aktuellt huvudrepo och identifierat källor på GitHub och Drive.
- Verifierat att flera tidigare spelmärkta arkiv är texter, konst eller fotografier.
- Startat första spelet: Frågespelet (web_quizzes). Originalets omstart återställer inte gränssnittet, banbyte återställer inte spelomgången, och frågebanken innehåller sakfel som behöver rättas före publicering. Alla 12 banor ska bevaras.

- Första spelets webbversion är lokalt verifierad: 12 banor, 154 frågor, omstart, rekord, mobil/tangentbord, nätverksåterhämtning och fungerande katalog/iframe. Publicering och kontroll på riktig adress återstår.

- **Frågespelet är publicerat och verifierat:** https://joynes.github.io/joynes.se/games/web-quizzes/ . Spelcommit och publicerad version: `7babf4a60f3c3aff1e3443456a38586758b72316`. Alla 12 banor/154 frågor kördes även på den riktiga adressen, inklusive mobiltryck, omstart, lagring och återhämtning. Katalogen och spelbar iframe verifierades också där. Filerna jämfördes byte för byte med lokalt testad kod.
- Nästa spel i kön är Milians Grimace Matte-spel, Gemini-varianten. Övriga spel är fortfarande inte klarmarkerade.

- **Grimace Gemini lokalt testat:** båda räknesätten, separat progression, skydd mot dubbla poäng, lagring/återhämtning, tangentbord och mobil. Lila originalutseende bevarat. Nästa fråga har en knapp så att återkopplingen kan läsas i egen takt. Katalogen visar spelet under AI-spel. Publicering och kontroll på riktig adress återstår.

- **Grimace Gemini publicerat och verifierat:** https://joynes.github.io/joynes.se/games/grimace-gemini/ . Spelcommit `e933196f98954c74c9917bb83d9f3374aeacdbc8`, Pages-körning `41277943873`. Båda räknesätten, mobil, tangentbord, lagring och hemsidans spelbara inbäddning testades på den riktiga adressen efter lyckad publicering. Spelfiler och katalog jämfördes byte för byte. Ett första kontrollförsök innan utrullningen var klar nådde ännu inte spelet; efter avslutad utrullning passerade hela sviten. Nästa spel är Codex-varianten.

- **Grimace Codex lokalt testat:** originalets tio plus- och tio minusfrågor bevarade, båda slutresultaten spelade genom riktiga kontroller, omspel och direkt återupptagning efter omladdning verifierade. Mobil, tangentbord, lagring och inbäddning passerade. Separat AI-spel eftersom dess fasta banor skiljer sig från Gemini-varianten. Publicering återstår.

- **Grimace Codex publicerat och verifierat:** https://joynes.github.io/joynes.se/games/grimace-codex/ . Spelcommit `6a7a0e937f22c3b42d58eceb47da1c70c2fc1334`, Pages-körning `41278151400`. Alla tjugo frågor, båda slutresultaten, omspel, lagring, mobil och tangentbord passerade på riktig adress. Sex filer jämfördes byte för byte. Navigationstestet väntar nu på att iframe-modulerna är färdigladdade innan första knapptryckningen; kontrollen av alla tre spel och musik passerade därefter. Nästa spel är SDL-baserat läs- och ordquiz.

- **Läs- och ordquiz lokalt testat:** portat SDL/C++-reglerna till responsiv webb med originalbilder och bokstavsljud. Alla 35 ord/tre banor, riktiga ljuduppspelningar, bildavkodning, mynt, omspel, mobil/tangentbord och nätverksåterhämtning passerade. Slutresultat visas där originalets modulo hindrade avslut. Stavningen käx rättad till kex. Publicering återstår.

- **Läs- och ordquiz publicerat och verifierat:** https://joynes.github.io/joynes.se/games/quiz-sdl/ . Spelcommit `bd39e6cfd3a42d621f70d77955115f0438f0f6cd`, Pages-körning `41278461087`. Alla 35 ord i tre banor, bilder, ljud, mynt, omspel, mobil/tangentbord och återhämtning testade på riktig adress. Hemsidans fyra spelbara inbäddningar passerade. Alla 112 kod-, data-, media- och katalogfiler verifierades byte för byte; inventeringen innehåller manifestets kontrollsumma. Nästa spel är Memit.

- **Memit lokalt testat:** alla fyra ursprungliga lägen bevarade, inklusive negativ poäng och Levenshtein-delpoäng. GitHub saknar data/bilder; Drive-arbetskopians arabiska datafiler är tomma och Git-historiken samma initiala commit. Därför uttryckligen återställd Dota-uppsättning med 127 officiella Valve-namn/porträtt, inte ett påstående om identisk historisk roster. Alla 127 övningskort/provfrågor, tio bild- och skrivfrågor, bildavkodning, poäng, omspel, mobil/tangentbord, nätverksfel och inbäddning passerade. Publicering återstår.

- **Memit publicerat och verifierat:** https://joynes.github.io/joynes.se/games/memit/ . Spelcommit `1c8d61f006fbac85eda189c45f786df21b3156f5`, Pages-körning `41278930286`. Alla fyra lägen fullständigt spelade även publikt: 127 övningskort, tio bildfrågor, tio skrivfrågor och 127 provfrågor, inklusive poäng, omspel, mobil/tangentbord och nätverksåterhämtning. Alla 133 spelfiler/bilder/katalogfiler byte-verifierade. Browser-testet väntar på färdig asynkron dataladdning innan första innehållskontrollen. Återställningens databegränsningar framgår av både spelet och källanteckningarna. Nästa spel är Skoluppgifter / Ordhjälten.

- **Skoluppgifter / Ordhjälten lokalt testat:** hela 2026-appen bevarad med 44 ordbanor/192 frågor, 135 mattebanor/810 svar, 54 lästexter/174 frågor, 19 korsord/127 ord och alla 15 Breakout-layouter. Samtliga lärbanor spelade genom synliga kontroller med normal upplåsning. Breakout har full faktisk paddelstyrd vinst på bana 1 samt förlust/omspel; separata kontrollerade motortester täcker 15 layouter, boss och 49 bonuseffekter. Rättat dubbelpoäng, fördröjda omstarter efter menybyte, nivå-3-intervall och omöjliga upplåsningskrav över appens 252 lärbanor. Sparning/offline begränsad till appen; full export/import och mobil/tangentbord verifierade. Ursprungliga fem musikspår, typsnitt och ikoner byte-bevarade. Publicering återstår.

- Under slutgranskningen av Skoluppgifter hittades en belöningsruta som kunde bli kvar vid menybyte. Rättat städningen och verifierat genom belöningslänk, menybyte och omladdning utan dubbel belöning. Den publika helsviten för första kandidaten avbröts innan klarmarkering; slutversionen verifieras på nytt.

- **Skoluppgifter / Ordhjälten publicerat och verifierat:** https://joynes.github.io/joynes.se/games/hardword/ . Slutversion `311927ceff5e9097a64fd0615393c853139279b4`, Pages-körning `41281184548`. Hela helsviten passerade på den riktiga adressen: samtliga lärbanor/ordflätor med normal upplåsning, sparöverföring/butik/föräldrapanel, mobil, lagringsfel, belöningslänkar, förlust/omstart, kontrollerade motortester för 15 Breakout-layouter/boss/49 effekter, faktisk paddelstyrd vinst på bana 1, Game Over/omspel och offline. Alla 16 spelfiler/tillgångar/katalogfiler byte-verifierade; även den kanoniska adressen utan cacheparameter serverar exakt slutversion. Nästa spel är Small Wonders / Inuti språkmodellen.

- **Small Wonders spelbygge verifierat:** aktuell källrevision `c13d5ac` ger exakt samma 109 filer som befintliga publika `llmspel-play`, commit `5d3c30c`. Hela nuvarande 33-testsviten passerade både lokalt mot produktionsbygget och på riktig speladress. Privat testkonfiguration/verifiering committad som `e6b665a`; källkod och lokala dokument förblir privata. Hemsidan får tre fullfönsterlänkar (torn, namnverkstad, äldre matteäventyr) med tydlig gräns mot förhandsvisningar. Mobil/dator-integrationen, befintliga spel/musik och visualisering kontrollerade. Hemsidans publicering och slutkontroll återstår.

- **Small Wonders publicerat och verifierat från hemsidan:** https://joynes.github.io/llmspel-play/ med tre tydliga spelvägar. Hemsidescommit `9411200bb9ced634eb6a72ab728af8e7a54a1b3d`, Pages-körning `41283165519`. Hela spelets 33 tester passerade redan på riktig adress och alla 109 filer är byte-verifierade. Därefter verifierades de publicerade hemsidesknapparna genom verklig spelstart, första tornstationen, hela namnuppdraget och äldre äventyrets inventarium på mobil/dator; äldre spel och musikregression passerade också. Hemsidans HTML/katalog och kanoniska rotadress motsvarar testad kod. Nästa spel är Marble Tables.

- **Marble Tables lokalt testat:** bevarat 2022 års riktiga Unity-WebGL-motor och 3D-bana. Ny AI-bearbetad svensk webbvärd med start/laddning/fel/nytt försök/omstart/helskärm och bibehållet kameraformat på mobil. Renderade kulor har flyttats genom verklig mus och touch, hållits stilla och släppts under originalets gravitation. Omstart, helskärm och nätverksåterhämtning passerade. Källrevisionen är två dagar senare än det bevarade originalbygget; ingen falsk uppgift om ny Unity-kompilering. Publicering återstår.

- **Marble Tables publicerat och verifierat:** https://joynes.github.io/joynes.se/games/marble-tables/ . Spelcommit `2d3ff421e0f2da60703a53ac6e6490fa352e1473`, Pages-körning `41284460478`. Hela mus-/touchsviten, verklig hållning/släpp/gravitation, mobilformat, omstart/helskärm, hemsidans Retro-länk och återhämtning från både WASM- och laddarskriptfel passerade på riktig adress. Alla tio spel/katalog/HTML-filer byte-verifierade. Tidigare spel och musik passerade regression. Nästa spel är Simple Driving Game.

- **Simple Driving Game undersökt:** senare källrevision `3f606f1` och äldre `unity_bus`-bygge `3f18cf9` delar 140 identiska explicita objekttransformationer i stadsbanan. Äldre bygget kör buss; senare källan väljer annan polisbilmodell och har felaktig tom byggscen. Varianterna är inte identiska och ska hållas identifierbara. Originalets buss har faktiskt körts med mus; fulla uppdraget, polisporten och publicering återstår. Detaljer och reproducerbar jämförelse i `docs/games/simple-driving.md`.

- **Simple Driving Game / Polisbil lokalt testat:** källans riktiga CarPolice-kaross, fyra hjul och textur återställda i den gemensamma native-motorn. Alla tio körparametrar matchar senare källan; 6 476 originalobjekt/alla tolv ljud bevarade. Rättat omöjligt 20-mål till scenens tre faktiska portar, fel spelläge, nullreferens i miljöbatchning och otillåten huskollider. Alla tre portar, riktig vinst/omspel genom riktiga mus-/tangentbords-/touchkontroller, paus, fokus/cancel, mobil/landskap/helskärm och fyra laddningsfel med fungerande nytt försök passerade. Svensk AI-webbvärd; originalets WASM/framework/loader är oförändrade. Publicering återstår.

- **Simple Driving Game / Polisbil publicerat och verifierat:** https://joynes.github.io/joynes.se/games/simple-driving/ . Spelcommit `fcf01304dba49a6864346d3e43f4b4cb74f115f3`, Pages-körning `41288939136`. Fulla treportsuppdraget med riktig vinst/omspel kördes publikt både med mus/tangentbord och touch. Flerfingerstyrning, fokus/släpp, native paus/återupptagning, omstart, stående/liggande helskärm med knappar/utgång och fyra laddningsfel med verklig körning efter nytt försök passerade. Alla elva spel/katalog/HTML-filer byte-verifierade. Tidigare spel och AI-musik passerade regression. Nästa spel är den separat bevarade äldre bussvarianten, unity_bus.

- **Bus Test Game / Buss lokalt testat:** äldre bussmodeller, förare, hjul och alla tolv ljud bevarade; 6 482 originalobjekt bytebevarade och bara elva dokumenterade mål-/originalfels-/HUD-rättningar. Egen datafil med gemensam oförändrad motor/webbvärd. Hela treportsuppdraget, riktig vinst/omspel på mus/tangentbord och touch, paus/släpp/omstart, fyra laddningsfel med körbart nytt försök samt stående/liggande helskärm med kontroller passerade. Testförarens tidiga genväg kunde träffa en ursprunglig parkerad bil eller huset; den slutliga rutten använder normal gas/broms runt hindren. Spelets hinder är kvar. Reproduktion fungerar från det offentliga originalrepot. Publicering återstår.

- **Bussens publicering inväntas:** kodcommit `0b229fe109e6e88ee984300991512851216ed5fc` är pushad och bygget passerade. Pages avvisade första deployförsöket som låst av föregående `fcf0130`, trots att den tidigare utrullningens aktuella Pages-API/status visar lyckad. Bara misslyckade jobb i körning `41290922621` startades om. Körningen är nu verifierat köad; livekontroll återstår och busspelet är fortfarande inte klarmarkerat. Fortsätt kontrollera samma körning innan några nya publiceringsförsök.

- **Pages-statusfel verifierat och ny byggbegäran skickad:** gamla omkörningen `41290922621` rapporterar köad/noll jobb i GET, men GitHub vägrar cancel med ”workflow run ... completed”. Även föregående `fcf0130` är verifierat färdig och kan inte avbrytas. Detta är motsägelsefull backend-status, inte en vanlig observerad timeout. Ett nytt Pages-bygge av oförändrad testad commit `0b229fe` begärdes via Pages build-API:t; den nya körningen är `41292196144`. Följ den nya körningen och gör hela livekontrollen när utrullningen lyckats.

- **Bus Test Game / Buss publicerat och verifierat:** https://joynes.github.io/joynes.se/games/unity-bus/ . Kodcommit `0b229fe109e6e88ee984300991512851216ed5fc`; nytt Pages-bygge `41292196144` lyckades efter verifierat motsägelsefull status för den gamla omkörningen. Ingen hosting-/källinställning ändrades. Hela mus-/touchuppdraget, faktisk vinst/omspel, alla fyra nätverksfel med körbart nytt försök och stående/liggande helskärm med native paus/utgång passerade på riktig adress. Alla elva egna/gemensamma spel-/katalog-/HTML-filer byteverifierade och tidigare spel/musik passerade regression. Lokalt diskutrymmesfel löstes genom egna tillfälliga kopior före den godkända livehelkörningen. Nästa spel är Godot-läsprototypen.
