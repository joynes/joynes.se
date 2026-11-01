# Hello Multiplayer Game

Privat original: `joynes/test-network-game`, commit `d7d6c33989481dce3e68364f8d438445f34d1e0c`, september 2025. Kategori AI-spel enligt Johannes åldersindelning. Den fulla arbetskopian finns kvar i syskonrepot test-network-game, med lokala commits. Repots AGENTS.md säger att Git-push inte görs som standard; källändringarna har därför committats lokalt och den manuella Fly-publiceringen bygger denna arbetskopia. Genererade byggfiler har inte lagts till i Git.

## Ursprung och bevarad funktion

En gemensam 800×450-spelplan med färgade emoji-figurer, hastighet 250 px/s och radie20. Servern håller den auktoritativa världen. Klienten använder prediction/reconciliation, buffrade snapshots, interpolation/extrapolation samt reglage för fördröjning och buffertstorlek. Originalets parametrar ?bot=1, ?auto=1 och ?autoplay=1 aktiverar slumpmässig autopilot. Inga poäng, lopp, skott, uppdrag eller beständiga konton finns i prototypen. De har inte ersatts med ett annat minispel.

## Webb- och driftändringar

Svenskt gränssnitt, anslutningsstatus/nytt försök, ny figur, tydligt Du på den lokala figuren, proportionerlig spelplan och mobiljoystick. Ursprungliga nätverksreglage finns kvar under en stängbar inställningsdel. Joysticken använder koordinater relativt canvas och håller reda på rätt finger. Fokusbyte, Tab, blur, cancel och återanslutning släpper rörelser. Frametid begränsas efter bakgrundsvistelse. Gamla pending inputs/snapshots/epochs rensas vid ny session och bara en klocktimer används.

Servern tar emot ändliga, ordnade och begränsade inputpaket och använder en kort tidsbudget utifrån sina egna ticks, så en kö med för mycket klienttid inte blir en teleport. Normala rörelseformler, maxfart och världsgränser är bevarade. Interpolationens klocka fortsätter mellan snapshots; bakåtextrapolation och extrapolation utanför världen rättade.

Node22.22.0/pnpm9.15.4 och låst beroendefil används. Dockerbygget avbryts vid fel. /health anger version1.1.0 och release-SHA. Ursprunglig Fly-app/URL, Stockholm och delad1CPU/256MB behålls. Servervärlden ligger bara i processens minne, därför används en Machine. Serveromstart ger nya figurer; klienterna återansluter. Inga persistenta volymer fanns eller ändrades.

## Testbevis

- `pnpm test`: full klient-/serverkompilering och tre tester för fart/normalisering/gränser, oberoende spelare, felaktiga/icke-ändliga/duplicerade inputs, ordning, kögräns och servertid.
- `pnpm lint`: klient och server godkända.
- `pnpm test:browser`: tre riktiga samtidiga klienter, varav en mobil. Serverns verkliga WebSocket-snapshots läses utan att skriva speltillstånd. Vanlig tangentstyrning flyttar spelaren och en annan klient återger den vid rätt position. Alla fyra gränser nås genom vanlig rörelse.
- Riktig Tab/fokus-släppning, inställningsreglage, touch med samtidig andra kontakt och separat fingersläpp/cancel, ny figur utan gammal identitet, en klocktimer efter återanslutningar, klientens WebSocket-fel/nytt försök och faktisk autopilotrörelse verifierade.
- En ägd lokal server stoppas och startas på riktigt; alla tre klienter återansluter med nya identiteter utan gamla figurer. Livesviten stoppar inte produktionsservern.
- Samma livesvit passerade på `https://test-network-game.fly.dev/` med förväntad release `09c53f8d3988bfa19d629d64f53a8a450b4d47e3`. Alla tre publika klientfiler SHA256-matchar det lokalt testade bygget. Releasekontroll, native WebSocket-data och rendering verifierar faktisk delad server, inte bara HTTP200.
- Desktop1280×1000, porträtt390×844 och landskap844×390 visuellt granskade. Du-etiketten rättades före slutverifiering så att den inte klipps vid nederkanten.

## Publicering

Image `registry.fly.io/test-network-game:deployment-01M6BBZHGFP7EW9YFJ2WDN72PN`, SHA256-manifest `15714d32c1105d57816a7407e5412c2faf3f0ea977d6d80fbbf719793d65ab3a`. Ursprunglig app hade två stoppade instanser utan volymer. Antalet sattes till en för att undvika separata världar. Första deployförsöket byggde imagen korrekt men mötte kapacitetsfel när Fly försökte skapa en ny instans i arn. Efter verifiering av den kvarvarande befintliga instansen rullades exakt samma byggda image ut på plats med lyckad lease/rolling update och DNS-verifiering. Direkt Machine-status startad/host ok och scale show count1 verifierades tillsammans med riktig spelbarhet. Regionen och VM-storleken ändrades inte.

Fly CLI:s nödvändiga officiella uppdatering krävde utrymme. Endast egna tillfälliga kloner, förhandsvisningskopior, analysmiljöer och installerade testberoenden rensades efter godkända tester. Källkod, låsfil, testat bygge och skärmbilder finns kvar. Livekontrollen använde hemsiderepots befintliga Playwright1.58.2.

Länkning och kontroll från hemsidans AI-spel återstår innan inventeringen klarmarkeras.
