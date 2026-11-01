# Skoluppgifter / Ordhjälten

Nyare AI-spel. Original: [joynes/hardword](https://github.com/joynes/hardword), commit `445d73d1c9e43593d4a5c4f6843790de2d611e13` från 2026-06-19. Den här publiceringen bevarar hela appen: HTML, data, figurer, bakgrunder, ljudmotor, fem musikspår, typsnitt, ikoner, butik, ryggsäck, sparöverföring och föräldrapanel.

## Innehåll

- Ordhjälten: 44 banor på sex nivåer, med 192 ordfrågor.
- Matte: addition, subtraktion, multiplikation och uppställning med fem nivåer vardera, samt klocka med sju nivåer. Varje nivå har fem banor och varje bana sex frågor: 135 banor, 810 svar per genomspelning.
- Läsning: fyra nivåer med sju texter vardera, 84 frågor.
- Inlandsisen: tre nivåer med 26 texter och 90 frågor.
- Korsord: 19 ordflätor, 127 ord och lika många korsande bokstäver som i originalet.
- Breakout: alla 15 banlayouter, bossar, goda och dåliga bonuseffekter, tre bollar, combo, mynt och gems.

Åldersval 6/7/8 och normal upplåsning är bevarade. Ordhjältens nuvarande originalversion använder berättelsematerialet som ordfrågor och hoppar över separata berättelsesidor; det beteendet är bevarat.

## Anpassning till hemsidan

Alla appfiler använder relativa sökvägar i `games/hardword/`. Manifest och service worker har samma avgränsning. Offlinecachen heter `joynes-hardword-v1` och tar endast bort äldre cacher med appens egen prefix. Första installationen laddar inte om en pågående omgång; vid senare uppdatering finns originalets uppdateringsknapp kvar. Vid ändring av cachelagda hjälpfiler måste cacheversionen höjas.

Sparningen använder prefix `joynes.hardword.`. Den kan därför inte skriva över andra spels nycklar. Om lagring är blockerad eller full fortsätter appen med en minneskopia och visar att framstegen bara finns kvar medan sidan är öppen. Trasiga sparformer och ogiltiga tal hanteras före användning.

Spardatakoder använder ursprungliga nyckelnamn för överföring från andra installationer. Exporten inkluderar nu även Ordhjältens framsteg, alla 15 Breakout-flaggor, korsord och använda belöningskoder. Ogiltiga eller främmande importnycklar avvisas innan någon ändring görs. Föräldrapanelen behåller originalets lokala myntbokföring.

## Rättningar

- Uppställning kan inte ge flera stjärnor för samma rätta svar. Läsfrågor och övriga svar kan inte räknas två gånger.
- Fördröjd återkoppling och förlust/omstart kan inte ändra en ny fråga eller öppna ett spel igen efter att spelaren gått till menyn.
- Banval i Ordhjälten väljer en berättelse från den öppnade nivån i stället för en tidigare, dold bana.
- Nivå 3 i addition, subtraktion och uppställning använder tal inom de svårighetsintervall som redan angavs i gränssnittet. Sista multiplikationsnivån använder en ensiffrig multiplikator enligt sin beskrivning.
- Originalets sista Breakout-banor krävde upp till 545 klarade uppgifter, men appen innehåller totalt 252 unika lärbanor. Kraven skalas nu proportionellt till det verkliga innehållet, med sista nivån vid 250. Kravet på föregående Breakout-vinst är kvar. Högsta avatarens upplåsningskrav begränsas på samma sätt till tillgängliga 252 banor.
- Föråldrade antal i menytexterna är rättade.
- Tangentbord kan aktivera klickbara kort och korsordsfält. Breakout stöder piltangenter och mellanslag samt originalets mus/touch.
- På mobil täcker myntvisaren inte sifferknapparna. Även femsiffriga summor får plats. Breakout-canvas skalas inom skärmen. Omarkerad text har läsbar ljus färg.
- Musikshuffle känner igen föregående spår även med de nya relativa sökvägarna.

Musik, typsnitt och ikoner är byte-identiska med originalet. SHA256 finns i `original-assets.json`.

## Verifiering

- `npm test`: namnrymd, lagringsfel, originaltillgångarnas hash, manifest/sökvägar, JS-syntax och befintliga spel-/musikregressioner.
- `node scripts/test-hardword-browser.cjs`: alla 192 ordfrågor, 810 mattesvar, 174 läs-/istidsfrågor och 127 korsordsord genom synliga kontroller. Normal åldersstyrning och nivåupplåsning används, utan debug. 252 lärbanor blir faktiskt intjänade över de fyra testsessionerna.
- `node scripts/test-hardword-support.cjs`: ytterligare 2 484 genererade matematik-/klockfrågor kontrolleras mot aritmetik och SVG-visarnas riktning. Alla korsordsord och läsalternativ valideras. De intjänade sparfilerna överförs genom appens gränssnitt. Köp, aktiv avatar, föräldrapanel, korrupt/blockerad lagring, touch, breda tal och musikshuffle provas.
- `node scripts/test-hardword-recovery.cjs`: fel svar, tre-felsgräns, omstart och gamla timers efter meny-/banbyte.
- `node scripts/test-hardword-breakout.cjs`: komplett vinst på första banan med en automatiserad spelare som endast skickar paddel-/startinput. Bollpositioner, block, liv och resultat ändras inte av spelaren. Därefter verkliga missar, Game Over, omspel och stoppad spelloop vid menybyte.
- `node scripts/test-hardword-physics.cjs`: separata, kontrollerade motortester för instansiering/kollision på alla 15 layouter, bossens träffar och 49 bonuseffekter. Dessa enhetsscenarier använder arrangerade bollpositioner och redovisas inte som fullständigt spelade banor.
- `node scripts/test-hardword-offline.cjs`: rätt SW-scope, inga omladdningar vid första installationen, spelbar ordfråga offline och orörda syskondata.

Hela webbläsarsviten körs med `npm run test:school:browser`. Skärmbilder för dator, mobil, femsiffrig uppställning och Breakout granskas visuellt. Den automatiska Breakout-spelaren kan behöva försöka igen om slumpade negativa bonusar gör att den förlorar; spelets regler ändras inte för testerna.
