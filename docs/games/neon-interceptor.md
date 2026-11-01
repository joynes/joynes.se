# Neon Bastion och Manta Bastion

[Spela Bastion](https://neon-interceptor.joynez11.chatgpt.site/) · [Spela Manta](https://manta-interceptor.joynez11.chatgpt.site/) · [AI-spel på hemsidan](https://joynes.github.io/joynes.se/#games/ai/neon-interceptor)

Befintliga, aktivt utvecklade AI-spel från 2026. Båda fulla utgåvorna är bevarade och öppnas i egna flikar. De har inte ersatts med förenklade minispel. Hemsidans integration återanvänder deras redan publicerade version 0.3.15. Inga ändringar gjordes i spelens rena arbetskopior eller i deras driftsmiljöer.

## Rätt version och hela innehållet

Källrepo `joynes/neon-interceptor`. Bastion-checkouten använder grenen `feat/authoritative-multiplayer`, commit `e497f79e63f7ad402430a3db15a3e1fc2847aa49`. Manta-checkouten använder `deploy/manta-site`, commit `a5a6424e806a47530a8509ddac7803223c8f4ad3`. Skillnaden mellan träden är deras egna hosting-ID:n; spelkoden är gemensam. Båda committerna verifierades på GitHub och i de publika versionsrutorna.

Sites bekräftade lyckade publiceringar: Bastion version77, deployment `appgdep_6ae6f7254ed88191bbe4cc7352f4e02f`, och Manta version35, deployment `appgdep_6ae6f708708c819189bbd23036333bf2`. Versionsproveniens pekar på samma källcommits. Båda är redan offentliga; deras publik, miljövariabler och lagring ändrades inte. Någon ny spelrelease behövdes därför inte för kataloglänkarna.

De aktuella menyerna och koden har **20 Bastion-sektorer och 21 Manta-sektorer**, inklusive tidigare expansioner och Mantas bonussektor Sketch Patrol. Äldre projektdokumentation som nämner fem, tio eller elva sektorer beskriver tidigare versioner. Här verifierades den nuvarande fulla kartan och sista sektorn i vardera multiplayerutgåvan via vanliga lobbykontroller.

Hangar, skeppsval inklusive Pikachu, färg-/assetbibliotek, köp och uppgraderingar, separata kampanjframsteg, olika miljöer, originalmusik, bomber, bossar, räddning, sparfiler, paus, resultat/rekord/medaljer, svårighetsval och belöningsfri bossträning behålls. Valbara funktioner är påslagna som standard i 0.3.15 och sparade av/på-val respekteras. Varje webbplats har sin egen lokala sparning.

Bastions normala multiplayer använder `local-coop-v1`: piloten simulerar sin egen strid medan servern samordnar gemensamma fiender, skada, räddning och resultat. Manta använder serverns stridssimulering. Den befintliga Fly-servern svarar med version `local-coop-v1:2026-11-01.1` och stöder båda protokollen. Ingen serveromstart eller ändrad serverregel behövdes.

## Verifiering

- 30 klienttester och 117 servertester godkända. De omfattar bland annat kampanj-/bossregler, sektorer och resurser, träffar/bomber/sköldar, återupplivning, protokoll/livscykler, sparning och återställning, ljud samt avslut/städning.
- Projektets befintliga test av 0.3.15 kördes i både Chromium och WebKit för båda utgåvorna: standardreglage och sparade av-val, backup med förhandsgranskning/ångra, svårighetsgrad, paus/nedräkning/omstart, resultatskärm/rekord/medaljer och separat bossträning. Detta är instrumenterade funktionstester; deras framsteg räknas inte som vanlig spelning.
- Separat vanlig spelning direkt på båda publika webbplatserna i Chromium147 och WebKit26.6: rätt versionsruta, hela kartan, gratis Pikachu-val och bibehållet val efter omladdning, ljudmixer, tangentstyrning, relativ dragstyrning, riktig touch/cancel i Chromium, bombens riktiga cooldown och uppspelad sektormusik. Den faktiska renderade scenen fryser vid paus och fortsätter efter nedräkning. Porträttläge, återgång till liggande och städning/ljudbyte vid återgång till hangaren testades. Spelarpositioner, poäng eller liv skrevs aldrig in av dessa tester.
- Tre riktiga produktionsklienter för vardera multiplayerutgåvan, med riktiga biljetter och WebSocket-anslutningar. Matchmaking styrdes till ett nytt eget testrum för att inte ansluta till någon befintlig spelares väntrum. Fjärde platsen avvisas, sista sektorn kan startas, räddningsreglagen finns kvar, vanlig touch flyttar den egna figuren och båda medspelarna återger samma rörelse. Släpp håller positionen och normal bombaktivering ger cooldown. Egna klienter lämnar via vanliga kontroller. Inga fabricerade biljetter, ändrade världstillstånd eller produktionsomstarter användes.
- För varje utgåva matchar samtliga **439 icke-HTML-resursfiler** källornas SHA256. Alarmprovningssidans ursprungliga HTML är också oförändrad, med ett sammanhängande tillägg från hostingplattformen. [Full resurskontroll](neon-interceptor-assets.json) innehåller hashvärden och källproveniens. Befintliga lokala releasearkiv ersattes inte och användes inte som bevis på aktuell publicering.
- Meny, faktisk soloflygning, tre klienters multiplayer och porträttläge granskades visuellt. Automatiserade pekprofiler och WebKit är verifierade; detta är inte ett fysiskt iPad-test.

## Kör om kontrollerna

I spelrepot: `npm test` och `npm --prefix game-server test`.

I hemsiderepot: `npm run test:neon:browser`, `npm run test:neon:coop` och `npm run test:neon:links`. Playwright och dess Chromium/WebKit behöver finnas installerade. `CHROMIUM_PLAYWRIGHT_MODULE` och `WEBKIT_PLAYWRIGHT_MODULE` kan ange andra lokalt installerade Playwright-paket. `NEON_HEADLESS_SHELL=1` väljer Playwrights egen headless Chromium i stället för systemets Chrome, och `NEON_TEST_RESULTS` styr var testbilder sparas. PixiJS officiella init-hook används bara för att läsa den verkliga scenens positioner och grafik, utan att ändra spelets tillstånd.
