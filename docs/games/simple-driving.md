# Simple Driving Game — pågående portning

Inte publicerat eller klarmarkerat. Nästa spel efter verifierat Marble Tables.

## Återfunna versioner

- Unity-källan [joynes/SimpleDrivingGame](https://github.com/joynes/SimpleDrivingGame), commit `3f606f1b872fd051db28ebca1f10a9600b6293fb`, 2023-02-12. Unity 2021.3.6f1; produktnamn DriverURP, version 0.1.0.
- Äldre körbart webbbygge [joynes/unity_bus](https://github.com/joynes/unity_bus), commit `3f18cf90f94f996dd1c414d58cb6cd8f23f481d6`, 2023-01-24. Samma Unity-version, webbmallens produktnamn My project, version 5.0.1. Filer `Build/cartWeb2.*`.

Relationen har kontrollerats i data, inte bara i reponamnen: 140 namngivna, explicit serialiserade objekt i källans `Assets/Karting/Scenes/MainScene.unity` har motsvarande objekt med exakt samma position, rotation och skala i webbbyggets `level1` (tolerans 0,0001). Där ingår stadens gatunät och hinder. Det visar en gemensam bana, inte identiska käll-/binärversioner. Prefab-instansers hela geometri och beteendekod ingår inte i denna jämförelse.

Reproduktion med [UnityPy](https://github.com/K0lb3/UnityPy) 1.25.4 och PyYAML 6.0.3 i separat analysmiljö:

```sh
python scripts/compare-driving-scenes.py /path/to/SimpleDrivingGame/Assets/Karting/Scenes/MainScene.unity /path/to/unity_bus/Build/cartWeb2.data
```

## Skillnader som ska bevaras

Webbbygget startar i en meny med Controls/Play, och kör sedan en buss i staden. Faktisk acceleration och förflyttning har observerats genom riktiga muskontroller. Det finns en pausmeny och HUD med målet 20 checkpoints. Hela uppdraget är ännu inte verifierat.

Källans senare `TypeOfVehicle.cs` aktiverar ovillkorligt polisbil och stänger av buss. Fordonsinställningens läsning följs av detta ovillkorliga val; det finns ingen fungerande fordonsväljare att lova. Polisbilen använder en annan modell från `Urban American Assets/Props/Vehicles/Source/CarPack.FBX` (CarPolice, fyra WP1-hjul), inte den äldre parkerade polisbilens modell. Modellfilen går att läsa med befintlig Blender 4.2.17 LTS. Den ska inte ersättas med fel polisbil enbart för att båda har samma fordonsnamn.

Källans styrning ligger i `KeyboardInput.cs`: nedhållen mus/touch ger gas; sidavståndet från skärmens mitt ger kontinuerlig styrning. Pekarens nedersta 15 procent ger broms/back. Vanliga tangentbordsaxlar är bortkommenterade. En tangentbordsanpassning behöver därför faktiskt styra motorn, inte bara visa knappar.

Källans `EditorBuildSettings.asset` aktiverar endast en tom SampleScene. Den avsedda stadens MainScene, IntroMenu och Win/Lose finns i projektet men måste återställas i en fungerande webbversion. Ingen Unity-editor eller lokal Unity-licens hittades i de vanliga installationsmapparna. Att återanvända motor och konvertera tillgångar utreds innan en full ny fysikport övervägs.

## Återstående kontroller

- Säkerställ polisvariantens ursprungliga modell, material, placering och körfysik; håll bussversionen identifierbar.
- Utred uppdragets 20 checkpoints mot scenens faktiska pickup-/lapobjekt och åtgärda eventuella omöjliga krav med tydlig dokumentation.
- Lägg till svenskt webbgränssnitt, tangentbords- och touchstyrning, paus, omstart och laddningsåterhämtning.
- Testa hela spelbara uppdraget samt alternativa slut/omspel om de faktiskt är nåbara, därefter publicering och live-/bytekontroll.
