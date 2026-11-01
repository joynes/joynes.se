# Frågespelet

AI-remake av Johannes webbspel från 2023. Originalkälla: [joynes/web_quizzes](https://github.com/joynes/web_quizzes), commit `616543b83cb56b00d98c8c5bbfd04b175d1a0eef`. Alla 12 banor och 154 frågeposter har bevarats; frågor med fel eller otydlig avgränsning har rättats eller förtydligats.

## Webbversion 2.0.0

- Start, banbyte, omstart och nytt försök återställer hela spelomgången.
- Frågor och svar blandas med Fisher–Yates utan att originalbanken ändras.
- Rätt svar ger en poäng. Fel svar drar av en poäng, lägst noll, och samma fråga kan besvaras igen med ett annat alternativ.
- Efter rätt svar är frågan låst tills spelaren går vidare; dubbeltryck kan inte ge extra poäng.
- Rekord sparas per bana. Felaktig eller blockerad lokal lagring stoppar inte spelet.
- Återkoppling sker i spelet, utan blockerande alert-rutor. Knappar och långa svar fungerar på mobil och med tangentbord.

## Rättelser i frågebanken

Fel om meddelarfrihet, grundlagsprocessen, myndigheters självständighet, informationsfrihet, den statliga värdegrunden och fastighetsgränser har rättats. Frågor som felaktigt beskrev Sverige som en nattväktarstat, blandade allmänna domstolar med hela rättssystemet eller hade flera korrekta sekretessalternativ har avgränsats. Äldre ord som landsting har bytts till regioner. Frågorna om antal kommuner och regioner anger originalets år 2023.

Kontrollerade myndighetskällor för dessa rättelser, 2026-11-01:

- [Riksdagen: grundlagarna och beslutsordningen](https://www.riksdagen.se/sv/sa-fungerar-riksdagen/demokrati/sveriges-grundlagar-och-riksdagsordningen/).
- [Tryckfrihetsförordningen, särskilt reglerna om meddelarfrihet](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/tryckfrihetsforordning-1949105_sfs-1949-105/).
- [Regeringsformen](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/kungorelse-1974152-om-beslutad-ny-regeringsform_sfs-1974-152swedish/).
- [Regeringen: myndighetsstyrning och självständighet](https://www.regeringen.se/sa-styrs-sverige/myndigheter-och-bolag-med-statligt-agande/).
- [Statens servicecenter: de sex värdegrundsprinciperna](https://www.statenssc.se/om-statens-servicecenter/vardegrund).
- [Sveriges Domstolar: överklaga Lantmäteriets beslut](https://www.domstol.se/amnen/mark-och-miljo/fastighet/overklaga-lantmateriets-beslut/).
- [Advokatsamfundet: advokatrollen och tystnadsplikten](https://www.advokatsamfundet.se/Anlita-en-advokat/Vad-ar-en-advokat/).

Frågorna är korta övningsfrågor. Källhänvisningar i `questions.json` visar underlaget till de rättade posterna; övriga ursprungliga frågor har inte fått påhittade källhänvisningar.

## Kontroll

Installera testberoenden med `npm ci`. Starta förhandsvisningen med `npm run preview` och kör i en annan terminal `npm test`, `npm run test:quiz:browser` och `node scripts/test-games-navigation.cjs`. Webbläsartesterna använder installerad Google Chrome. `GAME_BASE_URL` kan peka på den publicerade speladressen vid kontroll av en utgåva; `HOMEPAGE_BASE_URL` används för katalogtestet.
