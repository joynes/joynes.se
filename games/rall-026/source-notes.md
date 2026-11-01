# Rall 0.026 — ASCII, december 1998

Original: [rall v026 - ascii.zip på Google Drive](https://drive.google.com/file/d/1cfHERaNYoya5ZZmlUe3ZzySeNkCug_aB/view). [Bevarat ZIP-arkiv](original/rall-v026-ascii.zip) · [SHA256 och proveniens](source-manifest.json).

Arkivet innehåller Johannes DOS-spel från 9–10 december **1998**: en DJGPP/go32-körfil, Readme, åtta grafik-/textfiler, nio WAV-filer och fyra MIDI-filer. Senare uppladdningsdatum är inte spelets ursprungsår. Denna release innehåller ingen C++-källkod. Alla 23 originalfiler finns oförändrade i `game.jsdos`; inga spelregler, spelpositioner eller binärinstruktioner har skrivits om.

Originalprogrammet körs i självhostad DOSBox/WebAssembly genom **emulators 8.5.2**. Dess egen bana, ASCII-färger, kollisioner, glas, tunnor, siktning, omladdning, röster, musik, menyer, tvåspelarläge och reaktiva datorfigur används. Readme beskriver textläget som 80×40, men den faktiska körningen här visar BIOS-läge 3, 80×25 med 16 pixlars teckenhöjd. Webbversionen återger det verkliga bildminnet utan att tvinga ett annat teckenläge.

Webbanpassningen med AI tillför svenska instruktioner, skärmknappar med flera fingrar, Q/E och mellanslag som alternativ för spelare 1, ljudknapp, paus, omstart och återhämtning efter hämtningsfel. Kategorin är **Retrospel · AI-remake**; datorfiguren från 1998 gör inte originalet till ett nytt AI-spel. Historiska registrerings-/adressmeddelanden hör till originalarkivet.

## DOS-kompatibilitet

Arkivet saknar DPMI-värd. Oförändrad **CWSDPMI release 5** medföljer och startas med `-p -x`. Dokumentation och motsvarande källarkiv finns i `vendor/cwsdpmi/`. `-x` är värdens dokumenterade kompatibilitetsläge för program som skapats med andra DPMI-värdar. Senare värdar och skydd av null-sidan gav minnesfel för detta original. DOS-programmet är inte patchat för att kringgå detta.

`dosbox.conf` anger normal CPU-kärna, 12000 cykler, 16 MB, Sound Blaster 16/AdLib och svensk DOS-teckenuppsättning. Motorns mixer använder `prebuffer=0`: dess portade push-mixer producerade annars cirka 12 procent för mycket ljud i stabil körning. Web Audio buffrar den verkliga monoströmmen vid motorns rapporterade 44100 Hz; ljudfiler eller tonhöjd ändras inte. Paus stoppar emuleringen och tömmer webbljudkön.

Originalmenyn upprepar nedhållna piltangenter mycket snabbt. Skärmknapparna skickar därför korta tryck. Redo-skärmen ritas före en blockerande originalröst; Fortsätt upprepar vanlig Enter tills originalet accepterar den. Inga spelvariabler ändras.

## Läsande observation

`native-text.mjs` lokaliserar starttexten i emulatorminnet och läser BIOS-data och textceller med vanliga `HEAPU8`-läsningar. Det ger textalternativ, gränssnittets aktuella skärm och kopierad diagnostik för tester. Ingen minnesskrivning eller SDK-minnesdump används. Spelregler, tidsförlopp, träffar och resultat avgörs uteslutande av originalet. En avgjord duell ger originalets röda dödsfigur, text med antal skott och återgång till menyn. Originalets egen resultatvisning bevaras.

## Motor, licenser och byggkällor

- [Officiell emulators 8.5.2-release](https://github.com/caiiiycuk/emulators/releases/tag/v8.5.2), GPL-2.0: `vendor/emulators/LICENSE`, komplett versionskällarkiv i `vendor/emulators/sources/emulators-v8.5.2.tar.gz`.
- Den använda DOSBox-undermodulen är commit `528578d5a6f76afd4d5ef4e722b5670826f1183a`; motsvarande källarkiv finns i samma `sources/`-mapp. Arkiven innehåller bygginstruktioner och källor; `SOURCE.txt` anger adresser och revisioner.
- libzip har BSD-licens, medföljer som `vendor/emulators/LICENSE_LIBZIP`.
- [CWSDPMI 5 binär](https://www.delorie.com/pub/djgpp/current/v2misc/csdpmi5b.zip) och [källor](https://www.delorie.com/pub/djgpp/current/v2misc/csdpmi5s.zip); originalets distributionsvillkor och rätt till källor/uppdateringar anges i `CWSDPMI.DOC` och `SOURCE.txt`. Binären distribueras oförändrad tillsammans med dokumentationen och källarkivet.
- [Officiellt motor-API](https://js-dos.com/emulators.html) · [Command Interface](https://js-dos.com/command-interface.html). Endast motorns API används, utan js-dos molnspelare eller extern spelserver.

`python3 scripts/build-rall-026.py` i hemsidans repo återskapar paketet deterministiskt från originalarkivet, värden och konfigurationen. `python3 scripts/test-rall-026.py` verifierar samtliga original- och stödfilers SHA256 och innehåll.
