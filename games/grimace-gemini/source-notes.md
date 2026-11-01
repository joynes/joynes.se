# Milians Grimace Matte-spel – Gemini-versionen

Källa: [joynes/test-gemini-math-game](https://github.com/joynes/test-gemini-math-game), commit `f3b4d568066075a11cf7d2c43afae108a75a6b03`.

Det här är ett nyare AI-spel. Plus och minus har varsin sparad progression. Samma talintervall och ökande svårighetsgrad som i originalet används; subtraktion ger positiva svar. Varje fråga har fyra olika svar. Fel svar ger ett nytt försök utan avdrag. Spelet fortsätter utan sista bana.

Den lila figuren, färgerna och glada studsen följer originalet. Ingen extern bild, font eller tjänst behövs. Figuren är ritad med CSS.

## Webbversionens ändringar

- Ett korrekt svar kan bara räknas en gång.
- Nästa fråga startas med en tydlig knapp i stället för en halvsekunds timer. Spelaren får tid att läsa återkopplingen; inga gamla timers kan störa byte av räknesätt.
- Framsteg läses från originalets `grimaceMathScores`. Trasiga värden ignoreras; blockerad lagring stoppar inte spelet. En text visar om sparning misslyckas.
- Till menyn fungerar utan att radera framstegen. Den tidigare Avsluta-knappen på själva menyn saknade funktion och har ersatts av en länk till hemsidans AI-spel.
- Svaren blandas utan en slumpmässig sorteringsjämförelse eller en potentiellt oändlig slinga.
- Mobil layout, tangentbord, fokusmarkering, statusmeddelanden och minskad rörelse stöds.

## Verifiering

`npm test`: aritmetik och fyra unika svar över båda räknesätten och fem svårighetsnivåer; poängräkning, upprepade svar, byte av räknesätt, korrupt och blockerad lagring. Även befintliga musik- och frågespelstester körs.

`npm run test:grimace:browser`: synliga kontroller för plus/minus, fel och rätt svar, 13 klarade frågor, nästa fråga, menybyte, omladdning, tangentbord, mobil och blockerad/korrupt lagring. Skärmbilder inspekterade i 1440×1000 och 360×740.

`node scripts/test-games-navigation.cjs`: rätt spelkategori, detaljrutt och spelbar inbäddning, befintligt retrospel och musikläge.
