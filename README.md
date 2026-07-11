# Planetenuhr

Planetenuhr ist ein statisches Astronomie-Dashboard als reine HTML-App. Die Anwendung läuft ohne Build-Schritt direkt im Browser und kombiniert Zeit, Sonnensystem, Mond, Sichtbarkeit, Kalender und mehrere erklärende Himmelskarten auf einer Seite.

## Projektstruktur

- `index.html`  
  Layout, CSS, Interaktion und astronomische Berechnungen
- `translations.js`  
  UI-Texte in Englisch, Deutsch und Französisch
- `card-help-config.js`  
  Inhalte für die `?`-Popups jeder Kachel
- `calendar-events.js`  
  kuratierte Himmelskalender-Ereignisse
- `phenomena-config.js`  
  Konfiguration für Meteorströme, Sternbilder, Raumsonden und weitere Phänomene
- `small-bodies-config.js`  
  Kleinkörper, Kometen und Gürtel für die entsprechende Kachel
- `bsky-feed-config.js`  
  konfigurierbare Bluesky-Accounts für die Bild-Feed-Kachel
- `image_og.jpg`, `favicon.svg`  
  Social Preview und Favicon

## Start

Die App kann direkt geöffnet werden:

```text
index.html
```

Alternativ kann lokal ein einfacher Server genutzt werden:

```text
start-server.ps1
```

## Zentrale Bedienung

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

## Kacheln im Überblick

### Zeit & Steuerung

- `Datum & Ort`  
  zentrale Datumsnavigation mit Slider, Sprungschritten und Stadtwahl
- `Aktuelle Zeit`  
  Uhrzeit, Datum, Stoppuhr, Countdown und Anzeigeeinstellungen

### Sonnensystem & Himmelsmechanik

- `Sonnensystem`  
  heliozentrische Übersicht der Planetenpositionen, radial komprimiert
- `Kleinkörper`  
  Kometenbahnen sowie schematischer Asteroiden- und Kuipergürtel
- `Raumsonden`  
  stilisierte heliozentrische Positionen wichtiger Missionen
- `Planetenkonjunktionen`  
  Zeitachse enger planetarer Begegnungen im Datumsfenster
- `Retrograd-Phasen`  
  scheinbare Bewegungsbahnen mit Schleife/S-Kurve, Stationen und Bewegungsrichtung
- `Merkur- & Venus-Phasen`  
  Beleuchtung, Elongation und Morgen-/Abenderscheinung
- `ISS & helle Satelliten`  
  schematische niedrige Erdorbits ausgewählter Raumfahrzeuge
- `Polarlicht-Chance Deutschland`  
  Live-Einschätzung für heute auf Basis externer Space-Weather-Daten

### Meteorströme, Sternbilder, Jahreslauf

- `Meteorströme`  
  Jahresring für Aktivitätsfenster wichtiger Ströme
- `Radianten`  
  scheinbare Ursprungsrichtungen aktiver oder kommender Meteorströme
- `Sternbild des Monats`  
  saisonal passendes Sternbild mit Linienfigur und Sternnamen
- `Jahresuhr der Sternbilder`  
  Monatskreis mit Sternbild-Minis und Jahresmarker
- `Jahreszeiten`  
  Draufsicht auf die Erdbahn plus Seitenansicht für Achsneigung und Sonnenstand

### Mond, Erde, Planetenmonde

- `Mondknoten & Finsternis-Saison`  
  erklärt Knotenlage, Saisonfenster und aktuelle Finsternis-Geometrie
- `Jupiters Monde`  
  schematische Darstellung ausgewählter Jupitermonde
- `Planetensysteme`  
  ausgewählte Monde von Mars, Saturn, Uranus und Neptun
- `Erde & Mond`  
  Mondphase, nächster Vollmond, Finsternis-Geometrie sowie Tageslichtdaten für den gewählten Ort

### Sichtbarkeit & Kalender

- `Sichtbarkeit heute`  
  grobe Planeten-Sichtbarkeit aus Elongation und Nachtfenster
- `Himmelskalender`  
  filterbare Ereignisliste für Finsternisse, Meteorströme, Mond-, Planeten- und Jahreszeiten-Ereignisse
- `Bluesky-Feed`  
  neuester Bildbeitrag konfigurierbarer Accounts; bei `file://` ausgeblendet

## Wichtige Konfigurationsdateien

### `calendar-events.js`

Enthält die kuratierte Ereignisliste für den Himmelskalender. Aktuell gepflegt für 2026 bis Januar 2028.

Kategorien:

- `eclipse`
- `meteor`
- `planet`
- `moon`
- `season`

### `phenomena-config.js`

Enthält strukturierte Daten für:

- Meteorströme
- monatliche Sternbilder
- Raumsonden
- retrograd darzustellende Planeten
- innere Planetenphasen
- Satelliten

### `small-bodies-config.js`

Enthält Kometen und weitere Kleinkörper für die Bahn-Darstellung.

### `bsky-feed-config.js`

Enthält eine Liste von Bluesky-Accounts:

```js
{
  handle: "dlr-next.bsky.social",
  profileUrl: "https://bsky.app/profile/dlr-next.bsky.social",
  label: "DLR-next"
}
```

Für jeden Eintrag zeigt die App den neuesten Bildpost; wenn heute noch kein Bildpost existiert, wird optional der letzte Bildpost gezeigt.

## Technische Beschreibung

### Datumsgekoppelte Aktualisierung

Die App hält ein zentrales Datum als Tagesoffset relativ zu `Date.now()`. Mehrere Kacheln lesen dieses Datum über dieselbe Funktion, damit die gesamte Darstellung konsistent springt.

### Mondphase

Die Mondphase basiert auf einer mittleren synodischen Periode:

- synodischer Monat: `29.530588861` Tage
- Referenz-Neumond: `2000-01-06 18:14 UTC`

Daraus werden berechnet:

- Phasenname
- Beleuchtung
- Zyklusfortschritt
- nächster Vollmond als Näherung

### Planetenpositionen

Die Planetenpositionen basieren auf vereinfachten heliozentrischen Bahnelementen nahe J2000:

- große Halbachse `a`
- Exzentrizität `e`
- Inklination `i`
- mittlere Länge `L`
- Perihel-Longitude `p`
- aufsteigender Knoten `n`

Für das gewählte Datum wird `T` als Anzahl julianischer Jahrhunderte seit J2000 berechnet. Die Elemente werden linear fortgeschrieben, die Kepler-Gleichung iterativ gelöst und daraus die Position in der Ekliptik bestimmt.

### Sonnensystem-Darstellung

Die Planetenabstände werden für die Anzeige komprimiert:

```text
Bildschirmradius = sqrt(Distanz / Neptun-Distanz) * Maximalradius
```

Das ist bewusst nicht maßstabsgetreu, sondern auf gemeinsame Sichtbarkeit aller Planeten optimiert.

### Kleinkörper und Raumsonden

Kleinkörper- und Raumsondenkarten sind schematische Übersichten. Die Bahnen werden bewusst stilisiert oder stark komprimiert, damit unterschiedliche Distanzskalen in einer einzigen Kachel lesbar bleiben.

### Sichtbarkeit und Nachtfenster

Die Sichtbarkeitskarten nutzen vereinfachte astronomische Größen:

```text
Elongation = λPlanet - λSonne
```

Für die Nachtkarte wird aus Elongation näherungsweise eine Transitzeit und daraus ein Sichtfenster zwischen Abend- und Morgendämmerung abgeleitet.

### Sonnenaufgang, Sonnenuntergang, Dämmerung

Die Lichtzeiten verwenden eine NOAA-nahe Näherung über den gewählten Ort:

- Sonnenaufgang / Sonnenuntergang bei `90.833°`
- bürgerliche Dämmerung bei `96°`
- Goldene Stunde angenähert über Sonnenhöhe `+6°`

Die Formatierung erfolgt in `Europe/Berlin`, die Ortswahl beeinflusst die astronomischen Zeiten, aber nicht die Zeitzone.

### Mondknoten und Finsternis-Saison

Die Kachel kombiniert zwei Näherungen:

- drakonitischer Monat für Knotennähe
- wiederkehrender Saisonzyklus von etwa `173.31` Tagen

Wichtig: Diese Kachel ist didaktisch. Sie erklärt, warum Finsternisse saisonal gehäuft auftreten, ersetzt aber keine exakte Finsternis-Ephemeride.

### Retrograd-Phasen

Die Retrograd-Kachel benutzt eine geozentrische Bahn aus zwei Koordinaten:

- geozentrische Länge
- geozentrische Breite

Damit entstehen sichtbare Schleifen oder S-Kurven statt einer bloßen Einachsen-Zeitlinie. Gelbe Punkte markieren die Stationen, der blaue Punkt die aktuelle Position im dargestellten Pfadfenster.

### Satelliten und Polarlicht

- Die Satellitenkarte ist schematisch und kein TLE-Live-Tracker.
- Die Polarlicht-Kachel verwendet Live-Space-Weather-Daten für heute und ist bewusst nicht an das gewählte Datum gekoppelt.

## Himmelskalender: Quellen

Die Einträge in `calendar-events.js` sind manuell kuratiert und nicht automatisch synchronisiert.

- Finsternisse  
  NASA Eclipse Web Site  
  https://eclipse.gsfc.nasa.gov/eclipse.html

- Meteorströme  
  International Meteor Organization  
  https://www.imo.net/resources/calendar/

- Jahreszeitenpunkte  
  timeanddate.com  
  https://www.timeanddate.com/calendar/seasons.html

- Planetenereignisse, Konjunktionen, Oppositionen, Elongationen  
  In-The-Sky.org  
  https://in-the-sky.org/newscal.php

- Mondnähe, Mondferne, Supermond-Hinweise  
  timeanddate.com  
  https://www.timeanddate.com/

Die App-Texte fassen diese Quellen beobachtungsorientiert zusammen und bewerten grob für Europa beziehungsweise Deutschland.

## Open Graph und Social Preview

Die Seite besitzt Meta-Tags für:

- `title`
- `description`
- `og:title`
- `og:description`
- `og:site_name`
- `og:image`
- `twitter:card`

Das Vorschaubild liegt in:

```text
image_og.jpg
```

## Sprachen

Unterstützt werden aktuell:

- Englisch `en`
- Deutsch `de`
- Französisch `fr`

Die Sprache wird aus `navigator.language` abgeleitet. Nicht unterstützte Sprachen fallen auf Englisch zurück.

## Grenzen und Genauigkeit

Planetenuhr ist ein anschauliches Dashboard, keine präzise Astronomie- oder Planetariumssoftware.

Insbesondere:

- Planetenpositionen sind vereinfacht
- Mondphase und Finsternis-Saison arbeiten mit Näherungen
- Sichtbarkeitskarten sind heuristisch
- Kleinkörper- und Sondenbahnen sind stilisiert
- Satellitenpositionen sind nicht live aus TLEs berechnet
- Kalenderdaten müssen manuell gepflegt werden

Für exakte Beobachtungsplanung sollten zusätzlich spezialisierte Ephemeriden, JPL Horizons oder Planetariumsprogramme genutzt werden.

## Kontakt

E-Mail: millux@marsrakete.de
bsky: https://bsky.app/profile/marsrakete.de