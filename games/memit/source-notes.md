# Memit

AI-remake av Johannes minnes- och namnspel från 2013. Källkod: [joynes/memit](https://github.com/joynes/memit), commit `0374025ade4f22aff6b1af45cf0cdf96c4ea5b22`.

## Återställningens omfattning

GitHub-repot har endast HTML, CSS och JavaScript. De refererade biblioteken, `dota_names/data.js`, `dota_names/strings.js` och porträtten saknas. Den enda committen innehåller inte dessa filer.

[Drive-arkivet memit](https://drive.google.com/drive/folders/132I5hcv_54GvCpR1gem7aeGRxo4DfizT) har en senare arbetskopia, bibliotek och en `arabic`-mapp. Både `arabic/data.js` och `arabic/strings.js` är tomma (0 byte), och arbetskopian har tillfälliga testvärden. Arkivets Git-referens pekar på samma initiala commit som GitHub. Sökning efter ytterligare Memit- och Dota-mappar gav inget återställbart frågepaket. Arabisk övningsdata har därför inte hittats och redovisas inte som en fungerande bana.

Det går inte att verifiera exakt vilka hjältar eller porträtt den ursprungliga Dota-uppsättningen innehöll. Webbversionen använder därför uttryckligen en **återställd uppsättning**, inte ett påstående om ett identiskt historiskt bildpaket. Alla fyra ursprungliga spellägen och deras poängregler finns kvar.

## Återställd Dota-uppsättning

127 hjältar hämtade 2026-11-01 från [Valves officiella namnlista](https://www.dota2.com/datafeed/herolist?language=english). Namnens fält `name_english_loc` används. Porträtten kommer från Valves bildserver, med URL och SHA256 för varje bild i `dota-heroes.json`. [Officiell hjälteöversikt](https://www.dota2.com/heroes). Dota 2 och hjältebilderna tillhör Valve; Memit är Johannes fristående övningsspel.

Bilderna ligger lokalt, så spelaren behöver ingen anslutning till Valve under spelet. Inga konton, spårning eller externa bibliotek behövs. JSON-filen dokumenterar datum, namn, bildfil, original-URL och kontrollsumma.

## Spellägen och regler

- **Öva / Practice:** gå igenom hela bildpaketet i slumpad ordning med namn synliga. Ingen poängräkning.
- **Gissa / Guess:** tio olika namn, sex olika bilder per fråga från de valda tio hjältarna. Rätt svar ger +1, fel svar −1 och ett nytt försök på samma fråga. Poängen kan vara negativ.
- **Ta 10 / Take 10:** tio olika bilder. Skriv varje hjältes namn.
- **Prov / Exam:** skriv namnet på samtliga 127 hjältar.

I skrivlägen ger rätt svar +1. Fel svar visar rätt namn, kräver att spelaren skriver det igen och drar av `1 − likhetsdelpoäng`. Likhetsdelpoäng är `1 − Levenshtein-avstånd / korrekt namnlängd`, men värden under 0,5 blir 0. Exempel: `Abce` för `Abcd` ger 0,75 i delpoäng, alltså −0,25, innan rätt omskrivning ger +1. Den ovanliga ursprungliga regeln är bevarad. Tomma svar stoppas. Skillnader i skiftläge och mellanslag ignoreras; originalets hantering av bara första mellanslaget är rättad.

Ett redan valt fel bildalternativ inaktiveras för den frågan så att samma kända felsvar inte straffas flera gånger av dubbeltryck. Rätt svar låser frågan fram till Nästa-knappen. Start av nytt läge eller omspel ger ny blandning och nollställd omgång. Slutresultatet visar poäng och antal felsvar; full pott kräver inga felsvar. Ingen sparning fanns i originalet och omgångar lagras inte här heller.

## Rättningar och gränssnitt

Originalets bildgissning tog bort för många alternativ med `splice`, vilket kunde ge saknade bilder. Nu finns alltid sex unika alternativ inklusive rätt svar. Slumpblandningen använder Fisher–Yates utan att ändra grunddata. Slutresultat och omspel ersätter blockerande alert-dialoger. Senaste frågan kan inte poängräknas flera gånger eller orsaka ett indexfel.

Den svarta originalstilen bevaras med responsiv layout, stora touchknappar, tangentbordsstöd, fokusmarkering och statusmeddelanden. Speldata laddas som JSON i stället för dynamisk körning av kod från URL-parametern `app`. Fel vid dataladdning har en fungerande Försök igen-knapp. Text från speldata och svar sätts som text, aldrig som HTML.

## Verifiering

- `npm test`: samtliga 127 bilders SHA256, unika namn/ID:n, alla fyra lägen, fullständiga genomspelningar, negativ poäng, likhetsdelpoäng, fel/rätt och dubbeltryck. Även befintliga spel-/musiktester körs.
- `npm run test:memit:browser`: 127 övningskort och bildavkodningar, tio sexbildsfrågor, tio skrivfrågor, hela provets 127 frågor, poäng, fel/likhet, låsning, omspel, menybyte, tangentbord, mobil touch och återhämtning efter HTTP 503. Handlingarna sker genom synliga kontroller.
- Dator 1440×1000 och mobil 360×740 granskade visuellt.
