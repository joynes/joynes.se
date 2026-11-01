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

| Ordning | Spel eller version | Status vid planstart | Uppgift |
| --- | --- | --- | --- |
| 1 | Frågespelet | Väntar | Webbspel; laga omstart, återkoppling och mobilvy. Rätta verifierade fel i frågebanken. |
| 2 | Milians Grimace Matte-spel — Gemini | Publicerat och verifierat | Bevara originalets spelregler; testa plus/minus, rätt/fel, omstart och mobil. |
| 3 | Milians Grimace Matte-spel — Codex | Publicerat och verifierat | Separat implementation av samma spelidé. Bevara som egen spelbar variant. |
| 4 | Läs- och ordquiz | Lokalt testat | Källkod i SDL/C++; befintligt webbbygge finns i quiz_game_online. Kontrollera filer, inmatning och mobilstöd. |
| 5 | Memit | Väntar | Övnings-, gissnings- och provlägen. Återställ saknade bibliotek och speldata före publicering. |
| 6 | Skoluppgifter / Ordhjälten | Väntar | Granska aktuell webbversion och publicerad adress; bevara alla befintliga spellägen. |
| 7 | Small Wonders / Inuti språkmodellen | Väntar | Källrepo och llmspel-play är samma projekt. Testa torn, spelbart kapitel, MicroGPT-demo och garden-vy. |
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
