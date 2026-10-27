# Planetenuhr

Planetenuhr ist ein statisches Astronomie-Dashboard als reine HTML-App. Die Anwendung läuft ohne Build-Schritt direkt im Browser und kombiniert Zeit, Sonnensystem, Mond, Sichtbarkeit, Kalender und mehrere erklärende Himmelskarten auf einer Seite.

## Weitere Dokumentation

- [TECHNIK.md](TECHNIK.md): Projektstruktur, Architektur, Code-Stil, Start, Build, Kalenderpflege und Konfiguration.
- [BERECHNUNGEN.md](BERECHNUNGEN.md): Formeln, Rechenmodelle, mathematische Erläuterungen und fachliche Quellen.

## Neue Astronomie-Kacheln

**Erde & Mond** zeigt eine Erdkugel mit vereinfachten Kontinenten und einen weißgrauen Mond mit dezenten Kratern. In der beschleunigten Umlaufskizze kommt das Sonnenlicht bei beiden Körpern von links; diese Draufsicht ist von der größeren, datumsabhängigen Mondphasenansicht darunter getrennt. Kontinente, Größen und Umlauf sind schematisch.

**Meteorströme** beschriftet die Aktivitätsbögen im Jahreskreis mit den Namen der Ströme. Farbige Verbindungslinien führen zu den jeweiligen Maximum-Markierungen; die Namen folgen der gewählten Sprache und bleiben auch auf kleinen Bildschirmen lesbar.

**Planeten über dem Horizont** zeigt die sieben anderen Planeten in einem Panorama von Norden über Osten, Süden und Westen zurück nach Norden. Negative Höhen liegen im schattierten Bereich unter dem Horizont. Alle Markierungen tragen direkt den lokalisierten Planetennamen, auch unter dem Horizont. Bei engen Gruppen werden die Namen versetzt, ohne Verbindungslinien; der ausgewählte Planet bleibt hervorgehoben. Der Zeitregler erkundet ±12 Stunden relativ zum ausgewählten Dashboard-Zeitpunkt und verändert nur diese Kachel. Datum und Uhrzeit werden in der Zeitzone des gewählten Ortes angezeigt. „Ausgewählte Zeit“ setzt den lokalen Versatz zurück.

Der Himmel über der Horizontlinie wird passend zu Tag, Morgen-/Abenddämmerung oder Nacht eingefärbt. Ein Zeitband zeigt den lokalen Kalendertag, die erkundete Uhrzeit sowie Sonnenauf- und -untergang. Auch Zeitumstellungen, Polartag und Polarnacht werden berücksichtigt. Bei Polarnacht kann dennoch Dämmerung vorkommen. Ein dunkler Hintergrund bedeutet dunklen Himmel, keine garantierte Sichtbarkeit bei jedem Wetter.

**Heute faszinierend** steht als erste Kachel über die gesamte Breite. Sie folgt Datum und Ort der globalen Steuerung und nennt das ausgewählte Datum ausdrücklich. Bis zu fünf Hinweise bündeln Kalenderereignisse, beobachtbare Planeten, enge Begegnungen, Meteorströme und die Mondphase. Seltene Ereignisse haben Vorrang; an ruhigen Tagen gibt es weniger Hinweise. Kleine SVG-Miniaturen machen die Themen erkennbar; die Mondminiatur folgt der Phase am ausgewählten Datum. Planeten-, Erd- und Mondgrafiken sind zentrale SVG-Komponenten. „Sonnensystem“ zeigt ausschließlich die acht Planeten, mit entzerrten schematischen Bahnabständen und datumsabhängigen Richtungen; „Erde & Mond“ und die Tagesübersicht verwenden zusätzlich den detaillierten Mond. Jeder Eintrag führt ohne Neuladen zur passenden Detailkachel. Alle Zeiten beziehen sich auf den gewählten Ort und den gesamten lokalen Kalendertag. Sonnenauf- und -untergang stehen darunter.

**Mit dem Licht durchs Sonnensystem** berechnet die einfache Lichtlaufzeit von der Sonne zur Position eines der acht Planeten oder zu Voyager 1 am ausgewählten Datum. Für Voyager 1 wird der Sonnenabstand anhand lokal gespeicherter NASA-Stützwerte linear angenähert; die Kachel kennzeichnet die Näherung. Sie gilt für fünf Jahre vor und nach dem Stützzeitpunkt. Der Regler beginnt bei 0 und lässt sich jederzeit manuell verschieben. Eine laufende Reise geht ab der gewählten Stelle in Echtzeit weiter; vor dem Start bestimmt der Regler die Startposition. „Lichtreise starten“ bewegt ihn in Echtzeit: Eine echte Sekunde entspricht einer Reisesekunde. Verzögerte Updates im Hintergrund werden nachgeholt. „Zurücksetzen“, ein anderes Ziel oder ein anderes Datum setzen die Reise auf 0 zurück.

Die Rechenmodelle, Konstanten und Näherungen stehen in [BERECHNUNGEN.md](BERECHNUNGEN.md).

**Himmelswissen** zeigt 31 kurze Eselsbrücken, Merksätze und Fakten über Planeten und Sterne. Beim Laden wird zufällig gemischt; „Nächster“ führt ohne automatische Wechsel durch alle Einträge. Fremdsprachige Originale bleiben als eigene Einträge erhalten und erhalten in den anderen App-Sprachen einen übersetzten Untertitel. Kleine Grafiken veranschaulichen jeden Eintrag, etwa durch Sternbildskizzen, Farbreihen und Größenvergleiche. Erklärungen, Quellen und regionale Hinweise stehen direkt dabei; Bildunterschriften erläutern die schematische Darstellung.

**IDEFIX auf dem Weg zu Phobos** zeigt Sonne, Erde, Mars und die Reise von MMX mit dem Rover als Pixelspur. Phobos ist separat vergrößert dargestellt. Regler und Tages-, Monats- und Jahresschritte erkunden den Missionsplan bis 2031. Die Markierung basiert auf einer JAXA/JPL-Bahnvorhersage bis Ende 2028, nicht auf Live-Telemetrie; spätere Zielmarkierungen sind als Planung gekennzeichnet. Der zuletzt bestätigte Missionsstand steht mit Prüfdatum und Links zu JAXA-Missionsnews, DLR, CNES und ESA daneben. IDEFIX verbleibt nach der geplanten Landung auf Phobos; die Probenkapsel soll zur Erde zurückkehren.

## Zentrale Bedienung

Die App startet mit Version **1.0**. Im Einstellungsmenü der Datumsleiste steht die laufende Version mit „Nach Updates suchen“. Die App prüft außerdem beim Start und bei Rückkehr zur Seite auf eine neue Version. Wenn eine andere Serverversion bereitsteht, erscheint im Einstellungsmenü direkt neben „Nach Updates suchen“ der Button „Jetzt aktualisieren“ mit einem Versionshinweis. Auf schmalen Displays darf er darunter umbrechen. Erst dieser Klick lädt die neue Version; Datum, Ort, Sprache und Kachel-Link bleiben erhalten. Eine fehlgeschlagene automatische Prüfung unterbricht die App nicht.

- Die Datums- und Ortssteuerung sitzt als Overlay oben auf der Seite.
- Das gewählte Datum steuert mehrere Kacheln gleichzeitig, unter anderem:
  - Sonnensystem
  - Kleinkörper
  - Mondknoten & Finsternis-Saison
  - Planetenkonjunktionen
  - Sternbild des Monats
  - Jahresuhr der Sternbilder
  - Jahreszeiten
  - Retrograd-Phasen
  - Merkur- und Venus-Phasen
  - Satelliten
  - Erde & Mond
  - Himmelskalender
- Die Ortsauswahl beeinflusst vor allem Licht-, Sichtbarkeits- und Nachtkarten.
- Viele Kacheln besitzen ein `?`-Popup mit kurzer Erklärung, Formeln und Quellenlinks.

## URL-Parameter

Die Seite unterstützt Deep-Links für Datum, Ort, Sprache und eine direkte Ziel-Kachel:

```text
?date=20260812&place=Madrid&lang=de&card=moon_nodes
```

- `date` akzeptiert `YYYYMMDD`, `YYYY-MM-DD` oder `YYYY.MM.DD`
- `place` akzeptiert den Städtenamen oder den internen Orts-Schlüssel
- `lang` unterstützt aktuell `de`, `en` und `fr`
- `card` springt direkt zu einer Kachel über ihren internen Schlüssel, zum Beispiel:
  - `solar_system`
  - `moon_nodes`
  - `sky_calendar`
  - `earth_moon`
  - `small_bodies`

## Kacheln im Überblick

### Zeit & Steuerung

- `Datum & Ort`\
  zentrale Datumsnavigation mit Slider, Sprungschritten und Stadtwahl
- `Aktuelle Zeit`\
  Uhrzeit, Datum, Stoppuhr, Countdown und Anzeigeeinstellungen

### Sonnensystem & Himmelsmechanik

- `Sonnensystem`\
  heliozentrische Übersicht der Planetenpositionen, radial komprimiert
- `Kleinkörper`\
  Kometenbahnen sowie schematischer Asteroiden- und Kuipergürtel
- `Raumsonden`\
  stilisierte heliozentrische Positionen wichtiger Missionen
- `Planetenkonjunktionen`\
  Zeitachse enger planetarer Begegnungen aus Erdperspektive (vollständiger Winkelabstand bis 4,5°; ±60 Tage)
- `Retrograd-Phasen`\
  scheinbare Bewegungsbahnen mit Schleife/S-Kurve, Stationen und Bewegungsrichtung
- `Merkur- & Venus-Phasen`\
  Beleuchtung, Elongation und Morgen-/Abenderscheinung
- `ISS & helle Satelliten`\
  schematische niedrige Erdorbits ausgewählter Raumfahrzeuge
- `Polarlicht-Chance Deutschland`\
  Live-Einschätzung für heute auf Basis externer Space-Weather-Daten

### Meteorströme, Sternbilder, Jahreslauf

- `Meteorströme`\
  Jahresring für Aktivitätsfenster wichtiger Ströme
- `Radianten`\
  scheinbare Ursprungsrichtungen aktiver oder kommender Meteorströme
- `Sternbild des Monats`\
  saisonal passendes Sternbild mit Linienfigur und Sternnamen
- `Jahresuhr der Sternbilder`\
  Monatskreis mit vergrößerten Sternbild-Minis und Jahresmarker
- `Jahreszeiten`\
  Draufsicht auf die Erdbahn plus Seitenansicht für Achsneigung und Sonnenstand

### Mond, Erde, Planetenmonde

- `Mondknoten & Finsternis-Saison`\
  erklärt Knotenlage, Saisonfenster und aktuelle Finsternis-Geometrie
- `Jupiters Monde`\
  schematische Darstellung ausgewählter Jupitermonde
- `Planetensysteme`\
  ausgewählte Monde von Mars, Saturn, Uranus und Neptun
- `Erde & Mond`\
  Mondphase, nächster Vollmond, Finsternis-Geometrie sowie Tageslichtdaten für den gewählten Ort

### Sichtbarkeit & Kalender

- `Sichtbarkeit heute`\
  grobe Planeten-Sichtbarkeit aus Elongation und Nachtfenster
- `Himmelskalender`\
  filterbare Ereignisliste für Finsternisse, Meteorströme, Mond-, Planeten- und Jahreszeiten-Ereignisse
- `Bluesky-Feed`\
  neuester Bildbeitrag konfigurierbarer Accounts; bei `file://` ausgeblendet

## Sprachen

Unterstützt werden aktuell:

- Englisch `en`
- Deutsch `de`
- Französisch `fr`

Die Sprache wird aus `navigator.language` abgeleitet. Nicht unterstützte Sprachen fallen auf Englisch zurück.

Bei Grafiken mit kleinen Beschriftungen öffnet **„Grafik vergrößern“** eine lesbare Detailansicht. Darin kannst du seitlich sowie nach oben und unten verschieben. Die Ansicht zeigt ein Standbild der aktuellen Grafik.

## Grenzen und Genauigkeit

Planetenuhr ist ein anschauliches Astronomie-Dashboard mit vereinfachten numerischen Modellen. Die Stärke der App liegt in der Verbindung aus Übersicht, Anschaulichkeit und sofort nutzbarer Himmelsmechanik auf einer Seite.

### Was die App näherungsweise zeigt

- relative Planetenstellungen im Sonnensystem
- geozentrische Effekte wie Elongation, Phasen und retrograde Schleifen
- Tageslicht- und Dämmerungszeiten für den gewählten Ort
- Mondphase, Mondknoten, Finsternis-Saisons und Jahreszeiten

### Was vereinfacht oder schematisch bleibt

- Kleinkörperbahnen, Raumsondenpfade und einige Mondsysteme sind stilisiert.
- Sichtbarkeits-Einschätzungen sind heuristisch und berücksichtigen Horizont, Atmosphäre und Wetter nicht vollständig.
- Die Horizontkarte zeigt geometrische Planetenpositionen; Tageslicht und Gelände können die Beobachtung verhindern.
- Die verwendeten JPL-Bahnelemente gelten für 1800–2050; außerhalb dieses Bereichs werden sie extrapoliert und mit einem Hinweis versehen.
- Die Lichtreise hält das Ziel an seiner berechneten Position fest; die Bewegung während des Lichtflugs wird nicht nachgeführt.
- Finsternis- und Kalenderdarstellungen dienen als kuratierte oder angenäherte Orientierung. Kalenderdaten müssen regelmäßig gepflegt werden.
- Satellitenpositionen werden nicht live aus TLEs berechnet. Die Polarlicht-Kachel ist eine kompakte Überblicksansicht.

### Für genaue Beobachtungsplanung

Für Teleskop-Ausrichtung oder exakte Ereigniszeiten sollten zusätzlich spezialisierte Ephemeriden und Quellen wie NASA / JPL (insbesondere JPL Horizons), IMCCE, In-The-Sky.org, timeanddate.com oder Planetariumsprogramme genutzt werden.

Die einzelnen Rechenwege und ihre Einschränkungen erläutert [BERECHNUNGEN.md](BERECHNUNGEN.md).

## Quellen fuer Himmelskalender und Finsternis-Logik

Dieser Abschnitt beschreibt den aktuellen Stand der Datenquellen fuer den Himmelskalender und fuer die Finsternis-Kacheln.

### Dateien und Aufgaben

- `calendar-events.js`\
  handgepflegte Basis-Eintraege, vor allem fuer 2026 und 2027
- `eclipse-calendar-config.js`\
  gemeinsame Finsternis-Datenbasis und lokalisierte Kalender-Erweiterung bis Dezember 2040
- `extended-calendar-config.js`\
  wiederkehrende Kalender-Ereignisse bis Dezember 2040 fuer Meteorstroeme, Mond, Planeten und Jahreszeiten
- `eclipse-visibility-config.js`\
  kuratierte Stadt-Zuordnungen fuer wichtige Finsternisse
- `locations-config.js`\
  Ortsliste fuer die ortsabhaengige Stufe-1-Logik

### Quellen fuer den Himmelskalender

- Finsternisse allgemein\
  NASA Eclipse Web Site\
  https://eclipse.gsfc.nasa.gov/eclipse.html

- Verwendete NASA-Tabellen fuer die Erweiterung bis 2040\
  Solar Eclipses 2021-2030\
  https://eclipse.gsfc.nasa.gov/SEdecade/SEdecade2021.html\
  Solar Eclipses 2031-2040\
  https://eclipse.gsfc.nasa.gov/SEdecade/SEdecade2031.html\
  Lunar Eclipses 2021-2030\
  https://eclipse.gsfc.nasa.gov/LEdecade/LEdecade2021.html\
  Lunar Eclipses 2031-2040\
  https://eclipse.gsfc.nasa.gov/LEdecade/LEdecade2031.html

- Meteorstroeme\
  International Meteor Organization\
  https://www.imo.net/resources/calendar/

- Jahreszeitenpunkte\
  timeanddate.com\
  https://www.timeanddate.com/calendar/seasons.html

- Planetenereignisse, Konjunktionen, Oppositionen, Elongationen\
  In-The-Sky.org\
  https://in-the-sky.org/newscal.php

- Mondnähe, Mondferne, Supermond-Hinweise\
  timeanddate.com\
  https://www.timeanddate.com/

Die App-Texte fassen diese Quellen beobachtungsorientiert zusammen und bewerten grob für Europa beziehungsweise Deutschland.

### Wie der Himmelskalender daraus aufgebaut wird

Der Himmelskalender besteht aus zwei Schichten:

1. `calendar-events.js` mit kuratierten Einzelereignissen
2. generatorbasierten Erweiterungen aus `eclipse-calendar-config.js` und `extended-calendar-config.js`

Ab dem Zeitraum 2028 bis 2040 werden insbesondere diese wiederkehrenden Kategorien generatorbasiert gepflegt:

- `eclipse`
- `meteor`
- `planet`
- `moon`
- `season`

Dabei gilt:

- Finsternisse werden aus den NASA-decade-tables uebernommen und lokalisiert.
- Meteorstroeme werden aus `phenomena-config.js` pro Jahr zum Peak-Datum erzeugt.
- Jahreszeiten werden als wiederkehrende Kalendertermine gepflegt.
- Erde im `Perihel` und `Aphel` werden als wiederkehrende Planeten-Termine gepflegt.
- Mondtermine fuer `Perigaeum` und `Apogaeum` werden als repraesentative Quartalstermine aus einem angenaeherten anomalistischen Zyklus erzeugt.

### Quellen und Logik fuer die Finsternis-Kacheln

Die App verwendet fuer Finsternisse zwei unterschiedliche Ebenen:

- `didaktische Geometrie` in den Kacheln `Mondknoten & Finsternis-Saison` und `Finsternis-Geometrie`
- `kalender- und ortsbezogene Ereignislogik` fuer Datum und Standort

#### 1. Didaktische Finsternis-Geometrie

Diese Kacheln nutzen keine vollstaendige NASA- oder JPL-Ephemeride, sondern erklaerende Naeherungen aus den internen Berechnungen in `index.html`:

- synodischer Monat fuer die Mondphase
- drakonitischer Monat fuer Knotennaehe
- angenaeherter Finsternis-Saison-Zyklus von rund `173.31 d`

Diese Logik erklaert:

- warum Finsternisse nur nahe Mondknoten moeglich sind
- warum sie saisonal gehaeuft auftreten
- ob am gewaehlten Datum eher Sonnen- oder Mondfinsternis-Geometrie vorliegt

#### 2. Ortsabhaengige Finsternis-Logik Stufe 1

Die ortsabhaengige Logik ist bewusst einfach gehalten und noch keine exakte lokale Sichtbarkeitsrechnung.

Quellenbasis:

- kuratierte Stadt-Zuordnungen in `eclipse-visibility-config.js`
- NASA-Sichtbarkeitsregionen aus den decade tables in `eclipse-calendar-config.js`

Vorgehen:

1. Wenn fuer ein Finsternisdatum eine Stadt direkt hinterlegt ist, nutzt die App diese kuratierte Aussage.
2. Wenn keine Stadt direkt hinterlegt ist, prueft die App grobe Weltregionen wie `Europe`, `Asia`, `Africa`, `Americas`, `Australia`, `Pacific` oder `Mid East`.
3. Daraus entsteht eine vereinfachte Aussage wie `total sichtbar`, `partiell sichtbar`, `nur Halbschatten` oder `nicht sichtbar`.

Wichtig:

- Diese Stufe 1 beruecksichtigt keine exakten lokalen Kontaktzeiten.
- Sie berechnet keine Bedeckungsgrade, keine Mondhoehe und keine Zentralstreifen-Geometrie pro Ort.
- Die Kachel bleibt deshalb als `globale Skizze plus grobe Ortsaussage` dokumentiert.

Die zentrale Pflege- und Prüfliste liegt in `calendar-sources.json`. Den Ablauf und die Prüfkommandos beschreibt [TECHNIK.md](TECHNIK.md#empfohlener-kalender-ablauf).

## Kontakt

E-Mail: millux@marsrakete.de
bsky: https://bsky.app/profile/marsrakete.de
