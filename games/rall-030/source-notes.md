# Rall v030 Fighter: bevarande och webbanpassning

Status: under lokal verifiering. Spelet är ännu inte tillagt i den publika spelkatalogen.

## Ursprung

Johannes releasearkiv `rall v030 - fighter.zip`, Google Drive
`1FGPeHw10MCgX4vUwJNITWSx8r84M4TZ8`, innehåller 173 filer. Filernas datum är
mars–maj 1999, senast spelprogrammet 1999-05-25. Drives kopieringsdatum 2005
är inte spelets tillkomstår. Klassificering: **Retrospel · AI-remake**.
AI används här för webbanpassningen, inte som påstående om originalets upphov.

Originalets DJGPP-program körs oförändrat. Originalets Word-manual och skolarbete
beskriver Allegro 3.1 och JGMOD. Grafik, animationer, datorstyrda motståndare,
stridsregler, figurer, banor, ljudeffekter och redigerare kommer från originalet.
Alla originalfiler, inklusive dokument, MIDI och konfiguration, ingår byteidentiskt
i `game.jsdos`. Nedladdningsbart originalarkiv finns i `original/`.
`source-manifest.json` innehåller SHA-256 per fil.

## Ursprungliga banor och figurer

`STAGE.STA` har nio bakgrundssegment och tretton möten med datorstyrda figurer;
den sista figuren använder `com_har.cha` (Boss, 200 energi).
`sta_def.sta` har ett bakgrundssegment och en datorstyrd motståndare.
`Small.sta` är också bevarad, men innehåller en tom motståndarpost och är
inte en rekommenderad snabbstart.

`cha_def.cha` och `cha_def2.cha` är originalets två mänskliga kontrollprofiler.
Originaldialogens föreslagna `CHARACT.CHA` saknas i releasearkivet;
webbens snabbstart väljer därför den befintliga filen `CHA_DEF.CHA`
genom originalets fildialog. Två mänskliga figurer kan slå varandra.

## Återfunnen musik

Releasearkivet har en tom `music/mod/`-mapp, trots att programmet efterfrågar
åtta MOD-filer. Spåren har återfunnits i Johannes separata musikarkiv på Drive,
mapp `1_VKtPCsh092TOrcTqMoOKeBTl_ymyQEL`. Metadata och ursprungliga namn finns
i `recovered-music/sources.json`; hashvärden och sökvägsalias finns i manifestet.

Druno, Sectop, Bacols, Sdrugzl och Drakz har samma basnamn som de saknade filerna.
Det bevisar inte att de är identiska med exakt de filer som användes 1999.
För tre saknade namn används uttryckligen närliggande arkivversioner:

| Återfunnen fil | Originalprogrammets sökväg |
|---|---|
| nudro4.xm | music/mod/Nudro.xm |
| hentia4.xm | music/mod/Hentia.xm |
| dzew2x.xm | music/mod/Dzew2.xm |

Dessa filer är kompletteringar, inte ändringar av de 173 originalfilerna.
Musiken är Johannes arkivmusik och är inte AI-genererad. Spelets JGMOD spelar
XM-filerna; inga externa strömningstjänster eller nykomponerade ersättningar används.

## DOS-kompatibilitet

Självhostad emulators 8.5.2 / DOSBox Direct med 32 MB, normal CPU-kärna,
25 000 cykler, Sound Blaster 16, AdLib och mixer prebuffer=0.
Oförändrad CWSDPMI release 5 körs med `-p -x`; binär, källkod och dokument
finns under `vendor/cwsdpmi/`. Emulatorns licenser och källarkiv ligger också
under `vendor/`. Konfigurationen finns i `dosbox.conf`.

### Musbryggan

Allegros gamla mickey-drivrutin förväntar sig ackumulerade SI/DI-räknare i
INT 33-muscallbacken. Webbemulatorn lämnar händelsedeltan, vilket annars gör
att pekaren hoppar tillbaka vid knapptryckning. En 169-byte DOS-resident adapter,
`vendor/mouse-compat/ALMOUSE.COM`, ackumulerar dessa deltan och nollställer vid
originalets INT33-reset/anrop 000B. Positioner, knappflaggor och speldata ändras
inte. Källkod finns bredvid binären; bygg med:

```
nasm -f bin vendor/mouse-compat/almouse.asm -o vendor/mouse-compat/ALMOUSE.COM
```

Webben läser originalets visade pekarbild med hotspot (1,1), och skickar
normala relativa musrörelser till emulatorn. Snabbstart skickar vanliga
menyklick och tangenttryckningar. Energi/poäng/nivå avläses från originalets
visade typsnitt. Ingen spelposition, energi, nivå eller vinst skrivs från webben.

## Reproducerbar paketering

Från repots rot: `python3 scripts/build-rall-030.py`.
Byggaren bevarar även tomma kataloger och verifierar samtliga originalfiler.

### Originalets Sound Studio-fält

Dialogen fyller initialt både IRQ och DMA med portsträngen `0x220`. Att
återinstallera ljudet med dessa värden gav korrupt grafik i emuleringen.
Med vanlig inmatning av IRQ **7** och DMA **1**, följt av MIDI-val och
ReInstall, behålls fungerande grafik och muspekare. Webbinstruktionerna
beskriver detta; originalets binär eller konfigurationsfil ändras inte.

### Statusavläsning

Originalet kan lämna en gammal sista siffra kvar när en statusräknare blir
kortare (exempelvis 100 till 75 ser ut som 750). Webben visar därför inga
egna numeriska kopior av dessa fält. QA:s `hud` är en läsning av visade
pixlar, inte ett påstående om det interna talet i spelminnet.
