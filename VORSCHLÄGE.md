# Vorschläge

Hier sammeln wir mögliche neue Inhalte und Verbesserungen für die Planetenuhr. Ein Eintrag ist zunächst eine Idee und noch keine Zusage zur Umsetzung.

## Voyager, Pioneer und New Horizons animieren

**Idee:** In der Kachel „Raumfahrtmissionen“ fasst der Reiter „Äußeres Sonnensystem“ fünf auswählbare Sonden zusammen. Jede Sonde erhält eine sonnenzentrierte Reiseansicht mit eigenem Zeitregler und Wiedergabe. Sprungpunkte führen zu planeten- oder zielzentrierten Nahansichten.

| Sonde | Geprüfte Nahansichten | Verfügbare sonnenzentrierte Bahn |
| --- | --- | --- |
| Voyager 1 | Jupiter, Saturn | September 1977 bis Ende 2099 |
| Voyager 2 | Jupiter, Saturn, Uranus, Neptun | August 1977 bis Ende 2099 |
| Pioneer 10 | Jupiter | März 1972 bis Anfang 2050 |
| Pioneer 11 | Jupiter, Saturn | April 1973 bis Anfang 2050 |
| New Horizons | Jupiter, Pluto, Arrokoth | Januar 2006 bis Ende 2049 |

**Darstellung:** Die Reiseübersicht und die Nahansichten verwenden unterschiedliche Maßstäbe, damit die Vorbeiflüge auch bei großen Sonnenabständen lesbar bleiben. Arrokoth kann eine vergrößerte zweilappige Silhouette mit Abstandsanzeige zum Mittelpunkt erhalten, analog zur Didymos-Ansicht. Ein möglicher Einstieg ist Voyager 2 mit seinen vier Planetenbegegnungen.

**Voyager:** Eine schräge 3D-Ansicht zeigt die Ekliptik und die Bahnen mit ihrer Höhe relativ zur Ebene. Nach Saturn und dem Titan-Vorbeiflug verläuft die Bahn von Voyager 1 nach Norden. Nach dem Vorbeiflug über Neptuns Nordpol auf dem Weg zu Triton verläuft die Bahn von Voyager 2 nach Süden. Die Hilfe der Kachel erklärt, wie die Ziele der Vorbeiflüge die Bahnrichtungen bestimmt haben. [NASA · Voyager-Planetenreise](https://science.nasa.gov/mission/voyager/planetary-voyage/) · [NASA/JPL · Neptune und Triton](https://www.jpl.nasa.gov/news/nasa-contacts-voyager-2-using-upgraded-deep-space-network-dish/)

**Daten und Genauigkeit:** Sonnen- und zielzentrierte 3D-Vektoren wurden für alle fünf Sonden bei NASA/JPL Horizons abgefragt. Die frühen Voyager-Bahnen sind näherungsweise rekonstruiert. Bei Pioneer eignen sich die älteren Bahnlösungen für historische Darstellungen mit entsprechend begrenzter Genauigkeit. Bei New Horizons liegen rekonstruierte Ausschnitte für Pluto und Arrokoth vor. Rekonstruktionen und Vorausberechnungen sollen in der Anzeige mit Quelle und Datenstand gekennzeichnet werden. [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/manual.html) · [New-Horizons-Bahnlösung](https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=-98&MAKE_EPHEM=NO&OBJ_DATA=YES)

**Status:** Voyager 1 und 2 sind umgesetzt. Pioneer 10, Pioneer 11 und New Horizons bleiben offen.

## Gezeiten verstehen

**Idee:** Eine kleine, statische Erklärgrafik zeigt den Unterschied zwischen Springtide und Nipptide. Sie veranschaulicht, wie Sonne und Mond zusammenwirken.

**Wichtige Grenze:** Die Grafik ist orts- und zeitunabhängig. Sie zeigt weder konkrete Hoch- und Niedrigwasserzeiten noch Wasserstände für die Orte der Planetenuhr. Küstenform, Meeresbecken und lokale Bedingungen werden nicht modelliert. Die Darstellung muss klar als schematisch gekennzeichnet sein und darf keine lokale Vorhersage suggerieren.

**Status:** Idee; noch nicht umgesetzt.

## Sternbild-Details aus der Jahresuhr

**Idee:** Ein Klick auf ein Sternbild in der Kachel „Jahresuhr der Sternbilder“ öffnet ein Popup mit einer Detailgrafik im Stil der Kachel „Sternbild des Monats“. Dazu kommt ein kurzer Hinweis „Wohin schauen“, der bei der Orientierung am Himmel hilft.

**Mögliche Inhalte:** Name des Sternbilds, wiederverwendbare Sternbildzeichnung mit markanten Sternnamen sowie eine verständliche Richtungs- und Saisonangabe.

**Umsetzung:** Der Hinweis „Wohin schauen“ zeigt saisonale Richtungs- und Höhenwerte für den Abendhimmel. Er wird nicht für den ausgewählten Ort oder Zeitpunkt berechnet.

**Status:** umgesetzt.

## Rechenweg der Planetenkonjunktionen

**Idee:** Die Kachel „Planetenkonjunktionen“ erhält zwei Reiter. Der bisherige Reiter „Konjunktionen“ mit Zeitachse und Zusammenfassung bleibt bestehen. Ein zweiter Reiter „Berechnung“ erklärt die Positions- und Winkelberechnung mit Formeln und Grafiken.

**Inhalt:** Die Erklärung beginnt bei den JPL-Näherungsbahnelementen und zeigt, wie die Kepler-Gleichung zu heliozentrischen Positionen führt. Danach folgen das Abziehen der Erdposition, die geozentrischen Richtungsvektoren und der daraus berechnete Winkelabstand. Eine schematische Erdperspektive veranschaulicht die beiden Blickrichtungen und den eingeschlossenen Winkel.

**Umfang:** Der Berechnungsreiter bezieht sich automatisch auf das aktuelle Zeitfenster und dessen Begegnungen. Er erhält keine zusätzliche Auswahl und kein Popup. Die Darstellung kennzeichnet die Grafik als schematisch, erklärt die Berücksichtigung des Breitenunterschieds und weist darauf hin, dass ein numerisches Minimum nicht zwingend eine Konjunktion im strengen astronomischen Sinn ist.

**Status:** umgesetzt.

## Extreme Objekte im All

Vier Einträge in **Himmelswissen** stellen extreme Himmelsobjekte und Phänomene vor:

- **Neutronensterne und Pulsare:** extrem kompakte Sternreste; bei Pulsaren machen Strahlen und schnelle Rotation den Leuchtturm-Effekt sichtbar.
- **Schwarze Löcher:** Ereignishorizont und Akkretionsscheibe erklären und deutlich machen, dass das Schwarze Loch selbst nicht als leuchtende Scheibe erscheint.
- **Supernovae:** das Ende massereicher Sterne und die Verteilung schwerer Elemente im All.
- **Gravitationswellen:** schematisch zeigen, wie verschmelzende kompakte Objekte Raum und Zeit erschüttern.

**Wichtige Grenze:** Die Darstellungen sind statische, schematische Erklärungen. Sie zeigen keine aktuellen Ereignisse oder individuellen Beobachtungsprognosen.

**Status:** umgesetzt in „Himmelswissen“.

## Milchstraße

**Idee:** Eine Erklär-Kachel zeigt schematisch die Milchstraße von außen: Spiralstruktur, galaktisches Zentrum und den ungefähren Ort der Sonne. Eine ergänzende Innenansicht erklärt, warum wir die Milchstraße von der Erde aus als helles Band am Himmel sehen.

**Teilthema:** „Wie groß ist die Milchstraße am Himmel?“ gehört in diese Kachel. Es kann den Blick von der Erde auf das Band und seine Ausdehnung am Himmel erklären, statt eine eigene Kachel zu werden.

**Interaktive Galaxienkarte:** Als Hintergrund dient ein NASA-Künstlerkonzept der Milchstraße. Anklickbare Markierungen führen zu kurzen Erklärungen über das galaktische Zentrum sowie frühere und aktualisierte Schätzungen der äußeren Spiralarme. Ein gemeinsamer Infobereich zeigt jeweils den gewählten Bereich; dieselben Themen müssen auch über gut erreichbare Schaltflächen und per Tastatur auswählbar sein. Der ungefähre Ort der Sonne in der Orion-Spur sollte erkennbar bleiben.

**Quellen- und Genauigkeitshinweis:** Das Bild ist eine künstlerische Rekonstruktion, keine Außenaufnahme unserer Galaxie. Die aktualisierte Messung betrifft zwei äußere Arme entlang einer untersuchten Sichtlinie und ist keine vollständige Neuvermessung der Milchstraße. NASA/Chandra ist direkt am Bild zu nennen und zu verlinken.

**Wichtige Grenze:** Die Grafik ist eine vereinfachte Orientierung und keine maßstabsgetreue Karte oder lokale Sichtbarkeitsvorhersage.

**Status:** umgesetzt.

## Unser Platz im All

**Idee:** Eine visuelle Zoomfolge ordnet Erde, Sonnensystem, Milchstraße und Lokale Gruppe räumlich ein. Sie ergänzt die detaillierte Milchstraßen-Kachel durch den größeren Überblick.

**Wichtige Grenze:** Die Größen- und Entfernungsskalen lassen sich nicht in einer einzigen durchgehend maßstabsgetreuen Grafik zeigen. Übergänge und Maßstabswechsel müssen deutlich gekennzeichnet sein.

**Status:** Idee; noch nicht umgesetzt.
