# Stellarium-Illustrationen: Prüfung aller 49 Sternbilder

Prüfdatum: 18.11.2026. Reine Datenprüfung; keine Illustrationen in die Anwendung eingebunden.

## Quellen und Umfang

- [Stellarium Modern, festgeschriebener Stand](https://github.com/Stellarium/stellarium/blob/daace2add6a1bf886e8ee1934f51e9c69f818d18/skycultures/modern/index.json)
- [HYG v4.1, festgeschriebener Stand](https://github.com/astronexus/HYG-Database/blob/3bf37f4b2d5460e1278286320d1d62fab9b493c1/hyg/CURRENT/hygdata_v41.csv)
- [Stellarium-Ausrichtung und additive Bildmischung](https://github.com/Stellarium/stellarium/blob/daace2add6a1bf886e8ee1934f51e9c69f818d18/src/core/modules/ConstellationMgr.cpp)
- Lokaler Abgleich: Sichtbarkeitsliste, gemeinsame Figuren, HIP-Reihenfolge und Beschreibungs-Abkürzungen.
- Alle zugeordneten PNGs vollständig dekodiert; Maße, Dateihash, Alpha und Eckpixel geprüft. Alle Anker im HYG-Katalog aufgelöst und auf gültige, nicht kollineare Bildpositionen geprüft.

## Ergebnis

- 47/49 Einträge besitzen eine PNG-Illustration mit drei gültigen Ankern.
- Ohne eigene Modern-Illustration: Kopf der Schlange, Schwanz der Schlange. Beide gehören zum gemeinsamen Eintrag Serpens; dieser enthält kein Bild.
- PNGs mit Alphakanal: 0. Schwarzer Bildhintergrund wird in Stellarium additiv eingeblendet. Ein normales SVG-<image> mit reduzierter Deckkraft würde den Hintergrund weiterhin abdunkeln.
- 12 Figuren benötigen zusammen 14 zusätzliche Ankersterne außerhalb ihrer bisherigen Linienfigur. Alle sind in HYG v4.1 vorhanden.
- Abweichungen bei Rekonstruktion der vorhandenen Sternpositionen über 0,015 Diagrammeinheiten: 0 (Einheiten beziehen sich auf 0–100, siehe Tabelle).

- Die Jungfrau verwendet wie im Bestand dokumentiert das feste Zentrum RA 199°, Dec 0°; die übrigen Figuren den Mittelwert ihrer Sternrichtungen. Mit dieser Ausnahme stimmen alle 49 rekonstruierten Projektionen innerhalb der Rundungstoleranz mit dem Bestand überein.
- Bildflächen, die den Horizont der gnomonischen Projektion schneiden: 0.
- Vollständige PNG-Rechtecke außerhalb des bisherigen 0–100-Ausschnitts: 41. Das betrifft auch schwarze Bildränder; es beweist nicht, dass dort sichtbare Motivteile liegen. Beim Import Bildmaske und Ausschnitt gemeinsam prüfen.

## Vollständiger Abgleich

| Sternbild | Bild / Pixel | HIP-Anker (* = zusätzlich) | Projektionsabweichung, maximal |
| --- | --- | --- | --- |
| Adler (Aql) | aquila.png · 512×512 | 97649, 93244, 93805 | 0.0050 |
| Andromeda (And) | andromeda.png · 512×512 | 3881, 3092, 9640 | 0.0044 |
| Becher (Crt) | crater.png · 256×256 | 58188, 55282, 54682 | 0.0042 |
| Delphin (Del) | delphinus.png · 256×256 | 102532, 102805*, 101421 | 0.0044 |
| Drache (Dra) | draco.png · 512×512 | 56211, 85670, 97433 | 0.0047 |
| Dreieck (Tri) | triangulum.png · 128×128 | 10064, 10559*, 8796 | 0.0048 |
| Einhorn (Mon) | monoceros.png · 512×512 | 39863, 31978, 29651 | 0.0049 |
| Eridanus (Eri) | eridanus.png · 512×512 | 22109, 13701, 7588 | 0.0050 |
| Fische (Psc) | pisces.png · 512×512 | 4889, 9487, 114971 | 0.0049 |
| Fuhrmann (Aur) | auriga.png · 512×512 | 28380, 24608, 23015 | 0.0040 |
| Giraffe (Cam) | camelopardalis.png · 256×256 | 25110, 22783, 16228 | 0.0045 |
| Großer Bär (UMa) | ursa-major.png · 512×512 | 67301, 41704, 50372 | 0.0048 |
| Großer Hund (CMa) | canis-major.png · 512×512 | 35904, 33160, 30122 | 0.0041 |
| Haar der Berenike (Com) | coma-berenices.png · 256×256 | 64241, 64394, 60742 | 0.0045 |
| Hase (Lep) | lepus.png · 256×256 | 28910, 24244, 23685 | 0.0050 |
| Herkules (Her) | hercules.png · 512×512 | 80170, 79992, 88794 | 0.0049 |
| Jagdhunde (CVn) | canes-venatici.png · 256×256 | 63901*, 61317, 61309* | 0.0011 |
| Jungfrau (Vir) | virgo.png · 512×512 | 72220, 57380, 65474 | 0.0048 |
| Kassiopeia (Cas) | cassiopeia.png · 512×512 | 8886, 3179, 746 | 0.0045 |
| Kepheus (Cep) | cepheus.png · 512×512 | 116727, 106032, 109492 | 0.0044 |
| Kleiner Bär (UMi) | ursa-minor.png · 256×256 | 11767, 59504*, 79822 | 0.0044 |
| Kleiner Hund (CMi) | canis-minor.png · 256×256 | 37921*, 37279, 36188 | 0.0017 |
| Krebs (Cnc) | cancer.png · 256×256 | 44066, 40526, 40843 | 0.0025 |
| Leier (Lyr) | lyra.png · 256×256 | 92791, 91262, 92420 | 0.0040 |
| Löwe (Leo) | leo.png · 512×512 | 57632, 49669, 47908 | 0.0049 |
| Luchs (Lyn) | lynx.png · 512×512 | 44248, 36145, 30060 | 0.0049 |
| Nördliche Krone (CrB) | corona-borealis.png · 256×256 | 78493, 76952, 76127 | 0.0047 |
| Orion (Ori) | orion.png · 512×512 | 27913, 27366, 22449 | 0.0048 |
| Pegasus (Peg) | pegasus.png · 512×512 | 107315, 109410*, 1067 | 0.0047 |
| Perseus (Per) | perseus.png · 512×512 | 18532, 15863, 13254 | 0.0046 |
| Pfeil (Sge) | sagitta.png · 256×256 | 98920, 96757, 96837 | 0.0047 |
| Rabe (Crv) | corvus.png · 256×256 | 60965, 61359, 59316 | 0.0034 |
| Rinderhirte (Boo) | bootes.png · 512×512 | 72105, 71075, 67927 | 0.0048 |
| Schild (Sct) | scutum.png · 256×256 | 92175, 90595, 92814 | 0.0027 |
| Kopf der Schlange (Ser) | Kein eigenes Bild | — | 0.0044 |
| Schwanz der Schlange (Ser) | Kein eigenes Bild | — | 0.0048 |
| Schlangenträger (Oph) | ophiuchus.png · 512×512 | 92946*, 77233*, 85755 | 0.0048 |
| Schütze (Sgr) | sagittarius.png · 512×512 | 95168, 95294, 87072 | 0.0050 |
| Schwan (Cyg) | cygnus.png · 512×512 | 107310, 94779, 95947 | 0.0050 |
| Skorpion (Sco) | scorpius.png · 512×512 | 78820, 85927, 82729* | 0.0050 |
| Steinbock (Cap) | capricornus.png · 512×512 | 107556, 100064, 102978 | 0.0046 |
| Stier (Tau) | taurus.png · 512×512 | 26451, 15900, 17999* | 0.0042 |
| Südlicher Fisch (PsA) | piscis-austrinus.png · 256×256 | 113246, 107608, 111954 | 0.0049 |
| Waage (Lib) | libra.png · 256×256 | 74785, 77853, 73714 | 0.0047 |
| Walfisch (Cet) | cetus.png · 512×512 | 14143*, 12770, 1562 | 0.0049 |
| Wassermann (Aqr) | aquarius.png · 512×512 | 115438, 109074, 102618 | 0.0047 |
| Wasserschlange (Hya) | hydra.png · 512×512 | 64962, 55434*, 43813 | 0.0049 |
| Widder (Ari) | aries.png · 256×256 | 13209, 13914*, 8832 | 0.0043 |
| Zwillinge (Gem) | gemini.png · 256×256 | 37740, 32362, 28734 | 0.0047 |

## Konsequenzen für eine spätere Einbindung

1. Originale Bildgröße und die drei HIP-/Pixel-Anker übernehmen. Die JSON-Begleitdatei enthält dazu Katalogkoordinaten und berechnete Positionen in der rekonstruierten Projektion.
2. Projektionszentrum, Maßstab und Verschiebung je Figur ausdrücklich speichern. Die Rekonstruktion muss zuerst mit der vorhandenen Grafik übereinstimmen; auffällige Einträge vor einem Import klären.
3. Bildpunkte über die drei J2000-Sternrichtungen auf die Himmelsfläche abbilden und danach mit derselben gnomonischen Projektion wie die Sterne darstellen. Nur affine Anpassung an drei bereits projizierte Punkte wäre eine Näherung; für die korrekte Abbildung eine projektive Transformation bzw. ein Texturgitter verwenden.
4. Die PNGs über einer dunklen Himmelsschicht additiv oder nach passend geprüfter Aufbereitung einblenden. Screen ist eine mögliche optische Annäherung, aber nicht identisch mit Stellariums additiver Mischung. Sterne, Linien und Beschriftungen darüber rendern.
5. Den Ausschnitt gemeinsam für Bild und Sterne bestimmen: Die Illustration kann über die auf Sterne zugeschnittene Fläche hinausreichen. Schlangenkopf/-schwanz benötigen eine gesonderte Bildquelle oder bleiben ohne Underlay.
6. Sichtprüfung der tatsächlichen Überlagerung und Lizenz-/Künstlernachweise gehören zur späteren Einbindung. Diese Datenprüfung ist kein Nachweis einer bereits visuell getesteten Integration.

## Reproduzieren

Das Skript `scripts/audit-stellarium-illustrations.cjs` liest einen lokalen Download-Cache. Benötigt werden `index.json`, die GitHub-Commitantworten `commit.json` und `hyg-commit.json` (jeweils ein Array mit dem verwendeten Commit), `hygdata_v41.csv` und die PNGs unter ihrem unveränderten Dateinamen. Die Dateien müssen aus den oben festgeschriebenen Revisionen stammen. Sharp wird über die normale Node-Auflösung oder `PLANETENUHR_SHARP` geladen.

Aufruf: `node scripts/audit-stellarium-illustrations.cjs <Cache-Verzeichnis>`. Die JSON-Datei enthält die vollständigen Einzelbefunde einschließlich SHA-256, Pixelankern, Sternkoordinaten und Projektionsparametern.
