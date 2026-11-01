# Milians Grimace Matte-spel – Codex-versionen

Källa: [joynes/test-codex-math-game](https://github.com/joynes/test-codex-math-game), commit `07bf4ed2be5b219de95dc5a647f3d832f23b5e44`.

Ett nyare AI-spel med tio fasta additionsfrågor och tio fasta subtraktionsfrågor. Alla originalfrågor, svarsalternativ och deras ordning finns kvar i `questions.mjs`. Den här varianten avslutas efter tio frågor per räknesätt. Gemini-varianten är ett separat spel med slumpade frågor och obegränsad progression.

## Bevarat och rättat

Lila bakgrund, gul svarsfärg och den runda figuren med vita ögon följer originalet. Figuren ritas med CSS och vinkar vid rätt svar. Inga externa tillgångar behövs. Startmeny, separat progression, återupptagning och tackskärm är bevarade.

Ett korrekt svar låser knapparna och kan bara räknas en gång. Nästa fråga har en egen knapp så att återkopplingen kan läsas i egen takt; inga gamla timers kan störa menybyte. Ett korrekt svar sparas direkt även om spelaren laddar om innan nästa fråga visas. Fel svar tillåter nytt försök. Efter avslutad bana går det att börja om från första frågan utan att radera det andra räknesättets framsteg.

Originalets `plusIndex` och `minusIndex` används för lagring. Ogiltiga eller utanförliggande index återställs säkert till noll. Blockerad lagring visar ett meddelande men hindrar inte spel. Gränssnittet har mobil layout, tangentbordsstöd, tydlig fokusmarkering, upplästa statusmeddelanden och stöd för minskad rörelse.

## Verifiering

- `npm test`: samtliga tjugo frågors aritmetik och alternativ, hela båda banorna, fel/rätt, dubbla svar, omspel, separata framsteg och trasig/blockerad lagring. Även befintliga spel- och musiktester körs.
- `npm run test:grimace-codex:browser`: samtliga tjugo frågor genom riktiga kontroller, båda slutresultaten, omspel, omladdning direkt efter rätt svar, meny, avsluta/återgå, tangentbord, touch och lagringsfel.
- `node scripts/test-games-navigation.cjs`: spelbara inbäddningar och rätt kategorier på hemsidan.
- Skärmbilder i 1440×1000 och 360×740 granskade visuellt.
