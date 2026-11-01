# WorldForge

[Spela WorldForge](https://worldforge-self-test.joynez11.chatgpt.site/) · [AI-spel på hemsidan](https://joynes.github.io/joynes.se/#games/ai/worldforge)

Ett befintligt AI-spel från 2026: bygg och utforska en gemensam vattenpark med andra spelare. Den fulla Babylon.js-versionen återanvänds och öppnas i egen flik. Tangentbord, mus och mobilens liggande touchläge stöds. Byggkatalog, stilar, figurskapare, sparade karaktärer, trappor, stegar, pooler, sammanhängande rutschkanor, ljud och broar mellan byggområden finns kvar.

## Källversion och publicering

Privat källrepo `joynes/worldforge-self-test`, commit `9751aa60e7709732cf46feff2ca022014276d2a3`. Aktuell arbetskopia och GitHubs huvudgren har samma commit. Inga ändringar gjordes i spelets källkod, lagring, publik eller serverinställningar för denna katalogintegration.

Den redan publicerade Sites-versionen är 38, deployment `appgdep_6ab03eb025b08191aee23a9f6c2206f8`, med lyckad publicering och samma källcommit. Versionens arkiv har SHA256 `0b85e303bc45200904c06d8167141415a2478f9ebdce5412178118893cd29065`. Den befintliga godkända testrapportens källhash, `698d28efa57e9c317a483d7dae9619e8c22eb894066e16423ba834191c7a4f01`, räknades om utan att skriva en ny rapport och matchar exakt.

Den offentliga HTTPS-versionen använder avsiktligt spelets auktoritativa HTTP/D1-transport. Colyseus används i den lokala HTTP-miljön eller med explicit konfiguration. Katalogarbetet byter inte transport eller startar en ny spelserver. Spelets health-kontroll är en driftindikator; kontrollerna nedan provar även faktisk spelning och sparning.

## Verifiering

- 97 aktuella deterministiska regeltester passerar, bland annat rörelse, prediction, nätfördröjningar, kollisioner, byggvalidering, voxel- och rutschkanekopplingar, figurer, rendering och begränsad diagnostik.
- Samtliga 107 publika resursfiler och kompilerade klientfiler matchar SHA256 mot den aktuella arbetskopian. [Resurskontrollen](worldforge-assets.json) redovisar varje fil. Hostinggenererad sid-HTML ingår inte i påståendet om byteidentiska filer.
- Separat vanlig Chromium-spelning på den riktiga speladressen: två verkliga profiler på samma byggområde, Babylon-rendering, ogenomskinlig geometri och 14,5 meters kamera, gång, hopp/landning, medspelarens rörelse, native touch/cancel och levererade tresekunders fördröjningar av uppladdning respektive svar.
- Riktig 3D-figurförhandsvisning, omedelbar sparning synlig hos medspelaren, JSON-export och import via vanliga kontroller. En vanlig trätexturerad byggmodul placeras, sparas i D1 och finns kvar efter omladdning tillsammans med figuren. Annan testprofil får 403 vid borttagning. Den vanliga hackan tar därefter bort exakt testets eget block.
- Testerna registrerar enbart sina egna profil- och block-ID:n, använder ingen global återställning eller debugbehörighet och ändrar inga befintliga spelares byggen. Skärmbilder av dator och liggande mobil granskas. WebKit-stöd i testskriptet är valbart; den sista omkörningen kunde inte starta den lokala WebKit-processen efter datorns omstart och räknas inte som ett nytt godkänt WebKit-resultat. Detta är inte ett fysiskt iPad-test.

## Kör om

I spelrepot: `npm test`. Den befintliga fulla releasekontrollen är `npm run verify`.

I hemsiderepot: `npm run test:worldforge:browser`, `npm run test:worldforge:links` och `node scripts/verify-worldforge-assets.cjs /sökväg/till/worldforge-self-test`.

Playwright och dess webbläsare behövs. `CHROMIUM_PLAYWRIGHT_MODULE` / `WEBKIT_PLAYWRIGHT_MODULE` väljer annat installerat paket; `WORLDFORGE_HEADLESS_SHELL=1` väljer dess Chromium i stället för systemets Chrome. `WORLDFORGE_ENGINE=webkit` väljer WebKit. Egna testidentiteter och blockjournaler ligger under ignorerade `test-results/`; behåll dem vid omkörning så att testet kan städa en avbruten körnings egna block. Journalerna innehåller inga andra spelares uppgifter.
