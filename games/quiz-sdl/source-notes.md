# Läs- och ordquiz

AI-remake av Johannes SDL/C++-spel från 2023. Källa: [joynes/quiz_game](https://github.com/joynes/quiz_game), commit `fd14bf5c57febc4b17e8e2cfa4bd464787d026cc`. Ett äldre Emscripten-bygge finns i [quiz_game_online](https://github.com/joynes/quiz_game_online), commit `59e8e29fb46b0b8c099022a9f5c149817754a775`.

## Bevarat från originalet

Alla tre banor med 5, 12 och 18 ord. Orden blandas vid banstart. Varje ord visar fyra olika bildalternativ från samma bana. Rätt svar ger ett mynt; fel svar drar av ett mynt med noll som lägsta värde och låter spelaren försöka igen. Bokstäverna är individuellt klickbara och spelar sina ursprungliga ljud.

Bilder, bokstavsgrafik, myntbild och WAV-ljud är kopierade från originalrepots `res/image` och `res/sound`. Även ursprungliga oanvända nivåbilder finns kvar. Webbporten skapar inga nya bilder och ändrar inte dessa tillgångar. Den svarta spelplanen och lila bakgrunden följer originalet.

## Webbport och rättningar

Originalets 1366×1024-rendering och muskoordinater är ersatta av responsiva HTML-kontroller som fungerar med touch och tangentbord. Spelreglerna körs i JavaScript; inget Emscripten-installationssteg eller plugin behövs.

Originalets kod använder `{`, `|`, `}` för å, ä och ö. Dessa översätts till svenska tecken i ordlistan och rätt index för de 29 bokstävernas bilder och ljud. Originalets felstavning ”käx” är rättad till ”kex”, med samma kakbild.

Originalet återgick till första ordet via modulo och nådde aldrig sin avsedda gratulation. Nu visas ett tydligt resultat efter en hel bana och spelaren kan starta om. Banvalet är åtkomligt även under spel. Rätt svar låser alternativen fram till Nästa ord. Banbyte och omspel återställer mynten för den nya omgången. Spelet har ingen lagring, liksom originalet.

Ljud kan stängas av och återaktiveras. Ljudfel visas utan att stoppa spelet. Ett nytt ljud stoppar det föregående. Fel vid laddning av ordlistan har en fungerande Försök igen-knapp. Bilder har textalternativ och bokstavsknappar har beskrivande namn.

## Testbevis

- `npm test`: alla 35 ord och tillgångar, bokstavsindex, fyra unika bildval, genomspelning av tre banor, myntregeln, dubbla svar och omspel, plus befintliga spel-/musiktester.
- `npm run test:reading:browser`: alla 35 ord genom synliga kontroller, samtliga visade bilder avkodade, riktiga playing-händelser från bokstavs- och belöningsljud, mynt, fel/rätt, banbyte, omspel, ljudknapp, tangentbord, mobil touch och återhämtning efter HTTP 503.
- Desktop 1440×1000 och mobil 360×740 kontrollerade visuellt. Sidan får rulla vertikalt; inga svar klipps bort på små skärmar.
