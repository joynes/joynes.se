# Small Wonders / Inuti språkmodellen

Nyare AI-spel med tre separata spelvägar. Publiceringsrepo: [joynes/llmspel-play](https://github.com/joynes/llmspel-play). Utvecklingsrepot förblir privat; hemsidan länkar till det publika webbbygget.

- [LLM-tornet](https://joynes.github.io/llmspel-play/): en spelbar introduktion i nio stationer, med separata resor genom generering respektive tiden före träning. Visar text, token-ID:n, numeriska beskrivningar, informationsvägar, nästa textbit, kontext, arkitektur, träningsmål, jämförelse, bakåtpåverkan och uppdatering.
- [Namnverkstaden](https://joynes.github.io/llmspel-play/?demo): ge en planta ett namn. Prova en tom maskin, visa exempel, jämför hur ett extra exempel ändrar sannolikheter och sätt ett genererat namn på skylten.
- [Det äldre matematikäventyret](https://joynes.github.io/llmspel-play/?garden): gå mellan strand, trädgård och bibliotek, samtala med Euclid, lös fem mät-/felförsök och använd upptäckterna vid tidsporten. Äventyret är på engelska; de senare vägarna är på svenska.

Spelknapparna på hemsidan öppnar egna flikar så att appen behåller sitt avsedda hela spelfönster. De tre vägarna har separata sparningar. Några senare kapitel visas som förhandsvisningar. De är inte ytterligare spelbara lektioner. Tornet är en pedagogisk illustration; namnverkstaden räknar verkliga teckenövergångar men tränar inte neurala vikter eller kör en färdig transformer.

## Versionsidentitet

- Spelkällans commit: `c13d5ac7c0b652e247746ba8312c5c42a9dc8bb8`.
- Verifieringskod och dokumentation i källrepot: `e6b665abd359f072607c5c74c8463aa44a9c793b`.
- Befintligt publikt bygge: `5d3c30caf93a756fc86e8bd00459b9a4886ee753`.
- GitHub Pages-körning för bygget: `40133289033`, lyckad.
- Samtliga 109 filer från ett nytt produktionsbygge matchar publiceringsrepot och den riktiga speladressen byte för byte. Även den kanoniska adressen utan cacheparameter serverar rätt HTML.
- SHA256 för det sorterade manifestet av filnamn och filhashar: `94c8bfb0dee4b2ba352de8fc290132ec47b8fee5d384c1f2c49f7a81d89dd9b2`.

Spelbygget behövde inte ändras eller dupliceras i hemsidans repo. Den befintliga publiceringen återanvänds. Källrepot har fått testkonfiguration för produktionsförhandsvisning/publik basväg och relativa testnavigeringar. Det ändrar inte spelkod eller genererade spelfiler.

## Testbevis 2026-11-01

`npm run build -- --base=/llmspel-play/` passerade TypeScript och Vite.

Hela den aktuella sviten, **33 tester**, passerade först mot produktionsförhandsvisningen och sedan mot `https://joynes.github.io/llmspel-play/`. Det är separata nya helkörningar. Äldre verifieringsloggar används inte som dagens testresultat.

Kontrollerna omfattar hela tornresan i nio stationer, hela namnuppdraget och det kompletta äldre äventyret genom fem experiment och portens slutfråga. Fel försök, hjälp, checkpoint, omspel, namnskyltens bevarande, laddning/sparning, nekad lagring, valfri musik, pek-/tangentbordsstyrning, joystickens släpp/cancel, kollisionsfria vägar och parallax kontrolleras. Automatiska tillgänglighetskontroller kompletterar speltesterna.

Varje lektion/uppdragsfas kontrolleras i 360×640, 390×844, 844×390 och 1280×800. Dessa är Chrome-emuleringar, inte tester på fysisk telefon.

Reproduktion i källprojektet:

```sh
npm run build -- --base=/llmspel-play/
npm run preview -- --host 127.0.0.1 --port 0 --base=/llmspel-play/
# Använd adressen som servern skriver ut:
PLAYWRIGHT_BASE_URL=http://127.0.0.1:PORT/llmspel-play/ npx playwright test --workers=2 --reporter=list
PLAYWRIGHT_BASE_URL=https://joynes.github.io/llmspel-play/ npx playwright test --workers=2 --reporter=list
```

Hemsidans integration kontrolleras med `node scripts/test-small-wonders-navigation.cjs`: rätt AI-kategori, tre verkliga spelknappar i egna flikar, spelbar första tornstation, hela namnuppdraget och det äldre äventyrets inventarium i mobil- och datorstorlek. Hemsidans CRT-animationer använder webbläsarens inställning för minskad rörelse under det automatiserade navigationstestet, samma som de övriga navigationskontrollerna.
