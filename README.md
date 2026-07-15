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

## Code-Stil

- Lesbarkeit geht vor Verdichtung.
- Bei mehrstufiger UI- oder Geometrie-Logik werden klare `if / else if / else`-Blöcke bevorzugt.
- Verschachtelte Ternaries sind nur für wirklich triviale Ein-Zeilen-Zuweisungen gedacht.
- Kleine Konfigurations- oder Platzierungsregeln sollen so geschrieben sein, dass sie später ohne Rätselraten angepasst werden können.

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

#### Code-Stellen zur Kleinkörper-Kachel

- `index.html:4949`  
  `renderSmallBodies()` rendert Gürtel, Kometenbahnen, Labels, Hit-Flächen und Detailanzeige.
- `index.html:5007`  
  Hier werden Asteroiden- und Kuipergürtel als breite Ringe aus `small-bodies-config.js` aufgebaut.
- `index.html:5036`  
  Hier werden die einzelnen Kometenellipsen aus Perihel, Aphel und Winkel parametrisiert.

#### Wie die Formel hier funktioniert

Die Kleinkörper-Kachel ist keine Ephemeridenansicht für den aktuellen Tag, sondern eine schematische Bahnübersicht.

Für jeden Kometen werden aus der Konfiguration verwendet:

- `q` = Perihelabstand
- `Q` = Aphelabstand
- `angle` = Rotationswinkel der Ellipse für die Darstellung

Aus `q` und `Q` wird in der Anzeige eine Ellipse konstruiert:

- die kleine Sonnennähe kommt von `q`
- die große Sonnenferne kommt von `Q`
- die Ellipse wird anschließend visuell rotiert

In der Implementierung geschieht das vereinfacht so:

`rx ≈ (r(q) + r(Q)) / 2`

`cx ≈ center + (r(q) - r(Q)) / 2`

Dabei ist `r(...)` bereits eine stark komprimierte Bildschirm-Abbildung der Distanz in AU. Die Kachel zeigt also keine numerisch exakte Bahndynamik, sondern eine gut lesbare Form der Bahnexzentrizität und Größenordnung.

#### Mathematischer Appendix

##### Warum sind die Bahnen nicht maßstäblich?

Zwischen sonnennahen Kometen und sehr weit reichenden Bahnen liegen enorme Distanzunterschiede. Würde man diese linear zeichnen, verschwänden die inneren Bahnen fast im Sonnenpunkt.

Darum benutzt die Kachel eine komprimierte Radiusfunktion. Die Aussage ist:

- `näher an der Sonne` bleibt näher
- `weiter draußen` bleibt weiter draußen
- aber die Skala wird stark zusammengedrückt

##### Was bedeuten Perihel und Aphel?

- `Perihel` = sonnennächster Punkt einer Bahn
- `Aphel` = sonnenfernster Punkt einer Bahn

Diese beiden Werte reichen hier aus, um die Bahnform anschaulich zu stilisieren.

##### Warum gibt es extra Hit-Flächen?

Viele Bahnen sind absichtlich fein gezeichnet. Damit man sie trotzdem auf Mobilgeräten treffen kann, legt die App unsichtbare breitere Hit-Areas über die Ellipsen und Gürtel. Die Anzeige bleibt also schlank, die Interaktion aber deutlich großzügiger.

#### Raumsonden

Die Raumsonden-Kachel zeigt keine exakten Ephemeridenbahnen, sondern eine stilisierte Draufsicht heliiozentrischer Distanzen mit gebogenen Flugpfaden.

#### Code-Stellen zur Raumsonden-Kachel

- `index.html:5795`  
  `renderSpacecraft()` rendert Ringmarken, Flugpfade, Marker und Labels.
- `phenomena-config.js:28`  
  Die angezeigten Missionen, Farben, Winkel und Distanzen kommen aus der Konfiguration.

#### Wie die Formel hier funktioniert

Jede Sonde besitzt in der Konfiguration im Wesentlichen:

- `distanceAu` = angenäherte heliiozentrische Distanz
- `angle` = Winkelposition in der Draufsicht
- `color` = visuelle Kennzeichnung

Die Distanz wird nicht linear, sondern logarithmisch auf den Kartenradius abgebildet:

`screenRadius = log10(1 + distanceAu) / log10(1 + maxAu) * maxRadius`

Dadurch bleiben sowohl innere Missionen wie Parker Solar Probe als auch sehr weit entfernte Sonden wie Voyager in derselben Kachel sichtbar.

Die gezeichneten Flugpfade sind kubische Bézier-Kurven vom Sonnenzentrum zum Marker. Sie sind stilisierte Richtungsbahnen, keine rekonstruierten Missions-Trajektorien.

#### Mathematischer Appendix

##### Warum logarithmische Distanz?

Zwischen `0.1 AU` und `150+ AU` liegen mehrere Größenordnungen. Eine lineare Darstellung würde:

- innere Missionen fast im Sonnenpunkt verstecken
- äußere Missionen weit außerhalb sinnvoller Kartengrößen schieben

Die logarithmische Abbildung erhält die Reihenfolge und Größenordnung, macht aber den Innenraum viel lesbarer.

##### Was ist hier bewusst vereinfacht?

Nicht dargestellt werden:

- echte 3D-Bahnneigungen
- Swing-bys und planetennahe Schleifen
- exakte Zeitentwicklung entlang der Mission
- historische Bahnabschnitte

Die Kachel ist als anschauliche Distanz- und Richtungsübersicht gedacht.

### Sichtbarkeit und Nachtfenster

Die Sichtbarkeitskarten nutzen vereinfachte astronomische Größen:

```text
Elongation = λPlanet - λSonne
```

Für die Nachtkarte wird aus Elongation näherungsweise eine Transitzeit und daraus ein Sichtfenster zwischen Abend- und Morgendämmerung abgeleitet.

#### Code-Stellen zur Sichtbarkeits-Berechnung

- `index.html:4660`  
  `bodyEclipticLongitude(key, date)` liefert die ekliptische Länge des gewählten Körpers.
- `index.html:4708`  
  `solarElongationForKey(key, date)` berechnet die Elongation relativ zur Sonne.
- `index.html:4061`  
  `renderNightVisibility(date)` baut die zeitliche Nachtansicht pro Planet.
- `index.html:4788`  
  `renderVisibility(date)` rendert die kompakte Tages-/Abend-/Morgen-Einschätzung.

#### Wie die Formel hier funktioniert

Die Sichtbarkeit ist bewusst eine grobe astronomische Näherung, keine echte Horizont-Simulation mit Höhe, Azimut, Refraktion und Extinktion.

Zentral ist die Elongation:

`elongation = lambda_planet - lambda_sun`

Die kompakte Kachel `Sichtbarkeit heute` liest diese Elongation so:

- kleine Elongation: schwierig sichtbar
- positive Elongation: eher abends sichtbar
- negative Elongation: eher morgens sichtbar
- große Elongation bei äußeren Planeten: weite Teile der Nacht sichtbar

Die Nachtkachel schätzt daraus zusätzlich eine Transitlage auf der 24h-Uhr:

`transitHour ≈ 12 + elongation / 15`

Hintergrund: `15°` Himmelswinkel entsprechen ungefähr `1` Stunde Himmelsrotation.

Danach wird stark vereinfacht angenommen:

- Aufgang etwa `6 h` vor dem Transit
- Untergang etwa `6 h` nach dem Transit

also:

`riseHour ≈ transitHour - 6`

`setHour ≈ transitHour + 6`

Anschließend wird zwischen Abend- und Morgendämmerung in kleinen Zeitschritten geprüft, ob der Planet in diesem Modell „über dem Horizont“ wäre. Daraus entstehen die Balkensegmente und der angenäherte beste Beobachtungszeitpunkt.

#### Mathematischer Appendix

##### Was ist Elongation?

Die Elongation ist der Winkelabstand eines Himmelskörpers von der Sonne am Himmel.

- große positive Elongation: meist guter Abendhimmel-Kandidat
- große negative Elongation: meist guter Morgenhimmel-Kandidat
- sehr kleine Elongation: nahe der Sonne, deshalb schwer sichtbar

##### Worin unterscheiden sich die beiden Sichtbarkeits-Kacheln?

- `Sichtbarkeit heute` ist eine schnelle qualitative Lesart der Elongation.
- `Sichtbarkeit über die Nacht` verteilt dieselbe Grundidee auf das Nachtfenster zwischen Dämmerungsende und Morgendämmerung.

Die zweite Kachel ist also zeitlicher aufgelöst, aber immer noch eine Näherung.

##### Was wird bewusst nicht gerechnet?

Nicht berücksichtigt werden unter anderem:

- exakte Horizonthöhe des Beobachters
- atmosphärische Refraktion
- lokale Hindernisse
- Helligkeitsgrenzen des Planeten
- präzise Rektaszension/Deklination und echte Auf-/Untergangszeiten

Die Sichtbarkeitskarten sind daher als anschauliche Orientierung gedacht, nicht als exakter Beobachtungsplaner.

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

#### Code-Stellen zur Mondknoten-/Finsternis-Berechnung

- `index.html:4777`  
  `eclipseSeasonInfo(date)` berechnet Phase, Aktivität und nächstes Zentrum der angenäherten Finsternis-Saison.
- `index.html:6000`  
  `moonNodeDistance(date)` berechnet die genäherte Distanz des Mondes zum nächsten Knoten im drakonitischen Monat.
- `index.html:3265`  
  `renderMoonNodes(date)` kombiniert Saisonfenster, Knotennähe und Mondphase zur erklärenden Mondknoten-Kachel.
- `index.html:6019`  
  `renderEclipseGeometry(date)` baut die kleinere Geometrie-Anzeige in `Erde & Mond` aus Knotennähe und Phase auf.

#### Wie die Formel hier funktioniert

Die Kachel verbindet zwei voneinander getrennte Ideen:

1. `Knotennähe des Mondes`  
   Finsternisse sind nur möglich, wenn der Mond beim Neu- oder Vollmond nahe der Ekliptik-Knoten steht.

2. `Finsternis-Saison der Sonne`  
   Die Sonne muss sich zugleich in der Nähe derselben Knotenlinie befinden. Darum häufen sich Finsternisse in Saisonfenstern statt gleichmäßig über das Jahr.

Für die Knotennähe wird ein drakonitischer Monat verwendet:

`P_drac ≈ 27.2122 d`

Aus einem bekannten Knotendurchgang wird eine drakonitische Phase `f` gebildet. Da es zwei Mondknoten gibt, zählt immer der nähere der beiden:

`d_node = min(f, |f - 0.5|, 1 - f) * P_drac`

Damit ergibt sich eine genäherte Distanz des Mondes zum nächsten Knoten in Tagen.

Für die Finsternis-Saison wird ein wiederkehrender Saisonzyklus benutzt:

`P_season ≈ 173.31 d`

Die Distanz zum nächsten Saisonzentrum ist:

`d_season = min(s, P_season - s)`

wobei `s` die aktuelle Phase im Saisonzyklus ist. Aktiv wird die Saison in der App innerhalb eines halben Fensters von ungefähr:

`±17.5 d`

Die eigentliche Aussage der Kachel entsteht erst aus der Kombination mit der Mondphase:

- `Neumond + Knotennähe` begünstigt Sonnenfinsternisse
- `Vollmond + Knotennähe` begünstigt Mondfinsternisse

Darum kann die Kachel auch zeigen: Saison aktiv, aber heute trotzdem keine Finsternis-Geometrie.

#### Mathematischer Appendix

##### Was ist ein Mondknoten?

Die Mondbahn ist um etwa `5.1°` gegen die Ekliptik geneigt. Die zwei Schnittpunkte zwischen Mondbahn und Ekliptik heißen Mondknoten.

Nur wenn der Mond bei Neu- oder Vollmond nahe einem solchen Schnittpunkt steht, liegen Sonne, Erde und Mond räumlich nahe genug in einer Ebene für eine Finsternis.

##### Warum gibt es zwei Zyklen?

- Der `drakonitische Monat` beschreibt, wann der Mond wieder denselben Knoten erreicht.
- Der `synodische Monat` beschreibt die Wiederkehr der Mondphasen.
- Der `Finsternis-Saison-Zyklus` beschreibt, wann die Sonne wieder nahe genug an der Knotenlinie steht.

Weil diese Zyklen nicht gleich lang sind, passt nicht jeder Neu- oder Vollmond automatisch zu einer Finsternis.

##### Was zeigt die Grafik?

- Die Saisonleiste oben zeigt das aktuelle Fenster im angenäherten `173.31`-Tage-Rhythmus.
- Die Draufsicht zeigt die Linie Sonne-Erde-Mond relativ zur Knotenlage.
- Die Seitenansicht zeigt, ob der Mond oberhalb, unterhalb oder nahe der Ekliptikebene verläuft.

Die Grafik ist bewusst didaktisch und nicht maßstabsgetreu.

### Jahreszeiten

Die Jahreszeiten-Kachel zeigt den Jahreslauf in zwei gekoppelten Ansichten:

- Draufsicht auf die Erdbahn
- schräge Nebenansicht für Achsneigung und Sonnenstand

Die Kachel ist absichtlich anschaulich und verwendet eine glatte Jahresnäherung statt einer hochpräzisen Sonnenephemeride.

#### Code-Stellen zur Jahreszeiten-Berechnung

- `index.html:5627`  
  `seasonNameForFraction(fraction)` ordnet den Jahresfortschritt grob einer Jahreszeit zu.
- `index.html:5635`  
  `renderSeasonAxis(date)` berechnet Jahresfortschritt, Sonnen-Deklination und rendert die Orbit- und Nebenansicht.

#### Wie die Formel hier funktioniert

Zuerst wird das Datum auf eine Position im Jahr abgebildet:

`fraction = (dayOfYear - 1) / daysInYear`

Diese Zahl zwischen `0` und `1` legt fest, wo die Erde auf dem Jahreskreis gezeichnet wird.

Für die jahreszeitliche Sonnenneigung benutzt die Kachel eine einfache sinusförmige Näherung der Sonnen-Deklination:

`delta ≈ 23.44° * sin(2π * (N - 80) / daysInYear)`

mit:

- `delta` als angenäherte Sonnen-Deklination
- `N` als Tag des Jahres
- `23.44°` als Achsneigung der Erde

Das Vorzeichen von `delta` entscheidet, ob die Sonne relativ zur Erdachse stärker zur Nord- oder Südhalbkugel geneigt dargestellt wird.

#### Mathematischer Appendix

##### Warum entstehen Sommer und Winter?

Nicht der Abstand zur Sonne erzeugt die Jahreszeiten, sondern die geneigte Erdachse. Je nachdem, welche Halbkugel im Jahreslauf stärker zur Sonne zeigt:

- steigt oder fällt die Sonnenhöhe
- werden die Tage länger oder kürzer

Darum kann dieselbe Erde auf verschiedenen Positionen der Umlaufbahn sehr unterschiedliche Beleuchtungsverhältnisse zeigen.

##### Was bedeutet der Jahresfortschritt?

Der in der Kachel angezeigte Prozentwert ist einfach der Anteil des abgelaufenen Kalenderjahres seit dem `01.01.`:

`yearProgress = fraction * 100`

Er ist also kein astronomischer Winkel für die Präzession oder ähnliches, sondern eine gut lesbare Einordnung des gewählten Datums im Jahreslauf.

##### Warum zwei Ansichten?

- Die Draufsicht eignet sich gut für die Position der Erde im Kalenderjahr.
- Die schräge Nebenansicht zeigt die saisonale Beleuchtungsrichtung verständlicher als eine reine Draufsicht.

Beide Ansichten sind an dasselbe Datum gekoppelt, damit der Jahresstand und die Achs-/Sonnenlage zusammen lesbar bleiben.

### Retrograd-Phasen

Die Retrograd-Kachel benutzt eine geozentrische Bahn aus zwei Koordinaten:

- geozentrische Länge
- geozentrische Breite

Damit entstehen sichtbare Schleifen oder S-Kurven statt einer bloßen Einachsen-Zeitlinie. Gelbe Punkte markieren die Stationen, der blaue Punkt die aktuelle Position im dargestellten Pfadfenster.

#### Code-Stellen zur Retrograd-Berechnung

- `index.html:3777`  
  `retrogradePathSvg(key, date)` erzeugt die kleine Schleifen-/S-Kurven-Grafik aus geozentrischer Länge und Breite.
- `index.html:3817`  
  `renderRetrogradePhases(date)` rendert die Kachel mit Badge, Pfad, Stationspunkten und aktuellem Marker.
- `index.html:4677`  
  `geocentricVector(key, date)` berechnet den Vektor Planet minus Erde und damit die scheinbare Blickrichtung von der Erde aus.
- `index.html:4686`  
  `geocentricLongitude(key, date)` leitet daraus die scheinbare geozentrische Länge ab.
- `index.html:4693`  
  `geocentricLatitude(key, date)` ergänzt die geozentrische Breite für die sichtbare Schleife.
- `index.html:4728`  
  `apparentDailyMotion(key, date)` bestimmt die angenäherte tägliche scheinbare Bewegung.
- `index.html:4734`  
  `findNearestStationDate(key, date)` sucht den nächsten Vorzeichenwechsel der täglichen Bewegung, also eine Station.
- `index.html:4852`  
  `planetPosition(planet, date)` liefert die heliozentrische Grundposition aus den Bahnelementen.

#### Wie die Formel hier funktioniert

Die Kachel berechnet nicht direkt eine „Retrograd-Formel“ als Einzeiler, sondern in drei Schritten:

1. Aus den Bahnelementen wird zunächst die heliozentrische Position des Planeten berechnet.  
   Vereinfacht: Aus großer Halbachse `a`, Exzentrizität `e`, Inklination `i`, mittlerer Länge `L`, Perihellänge `p` und Knotenlänge `n` entsteht über Kepler-Gleichung und Koordinatentransformation die Position `(x, y, z)`.

2. Danach wird auf die Sicht von der Erde umgerechnet.  
   Dafür gilt:

   `r_geo = r_planet - r_earth`

   Also schlicht: geozentrischer Vektor = Planetenvektor minus Erdvektor.

3. Aus diesem Vektor wird die scheinbare Richtung am Himmel abgeleitet.  
   Die geozentrische Länge ist:

   `lambda_geo = atan2(y_geo, x_geo)`

   Die geozentrische Breite ist:

   `beta_geo = atan2(z_geo, sqrt(x_geo^2 + y_geo^2))`

Ob ein Planet gerade retrograd ist, wird dann über die tägliche Änderung der geozentrischen Länge angenähert:

`motion(date) ≈ signed(lambda_geo(date + 1 d) - lambda_geo(date - 1 d)) / 2`

Wenn diese scheinbare Tagesbewegung negativ wird, läuft der Planet in der Kachel als retrograd. Wenn das Vorzeichen von positiv nach negativ oder zurück wechselt, liegt eine Station vor.

Die kleine Schleife in der Kachel entsteht, weil nicht nur die Länge `lambda_geo`, sondern auch die Breite `beta_geo` über ein Zeitfenster von etwa `±90` Tagen abgetastet und als 2D-Pfad gezeichnet wird. Dadurch sieht man die typische Schleife oder S-Kurve statt nur einer simplen Vor-/Rückwärts-Skala.

#### Mathematischer Appendix

##### Heliozentrisch vs. geozentrisch

- `heliozentrisch` bedeutet: Koordinaten relativ zur Sonne
- `geozentrisch` bedeutet: Koordinaten relativ zur Erde

Für die Retrograd-Kachel ist genau dieser Wechsel entscheidend: Ein Planet bewegt sich physikalisch weiterhin prograd um die Sonne, kann aber aus der sich ebenfalls bewegenden Erde heraus zeitweise rückläufig erscheinen.

Die Umrechnung ist hier direkt als Vektordifferenz umgesetzt:

`r_geo = r_planet - r_earth`

Dabei sind `r_planet` und `r_earth` heliozentrische Positionsvektoren, `r_geo` ist der scheinbare Richtungsvektor von der Erde zum Planeten.

##### Kepler-Gleichung und Bahnposition

Die Funktion `planetPosition(...)` berechnet zunächst aus den Bahnelementen eine heliozentrische Position.

Verwendet werden insbesondere:

- `a` große Halbachse
- `e` Exzentrizität
- `i` Inklination
- `L` mittlere Länge
- `p` Länge des Perihels
- `n` Länge des aufsteigenden Knotens

Die mittlere Anomalie ist:

`M = L - p`

Dann wird die Kepler-Gleichung numerisch gelöst:

`M = E - e * sin(E)`

mit:

- `M` mittlere Anomalie
- `E` exzentrische Anomalie

Aus `E` ergeben sich in der Bahnebene die kartesischen Koordinaten:

`x_p = a * (cos(E) - e)`

`y_p = a * sqrt(1 - e^2) * sin(E)`

Danach wird aus der Bahnebene in das ekliptische 3D-System rotiert. So entstehen die heliozentrischen Koordinaten `(x, y, z)`.

##### Warum hier `atan2(...)` benutzt wird

Für Winkel aus kartesischen Koordinaten ist `atan2(y, x)` robuster als ein einfaches `atan(y / x)`, weil:

- alle vier Quadranten korrekt unterschieden werden
- kein Vorzeichen verloren geht
- auch Fälle nahe `x = 0` stabiler bleiben

Darum wird die scheinbare geozentrische Länge so bestimmt:

`lambda_geo = atan2(y_geo, x_geo)`

Und die geozentrische Breite so:

`beta_geo = atan2(z_geo, sqrt(x_geo^2 + y_geo^2))`

##### Wann ein Planet als retrograd gilt

Die App verwendet eine endliche Differenz über einen Tag nach vorne und hinten:

`motion(date) ≈ signed(lambda_geo(date + 1 d) - lambda_geo(date - 1 d)) / 2`

Interpretation:

- `motion > 0` bedeutet direkte scheinbare Bewegung
- `motion < 0` bedeutet retrograde scheinbare Bewegung
- Vorzeichenwechsel markieren Stationsnähe

Das ist bewusst eine gut lesbare numerische Näherung und keine hochpräzise Ephemeridenrechnung.

##### Warum die Schleifenform sichtbar wird

Würde nur die geozentrische Länge `lambda_geo` gegen die Zeit aufgetragen, sähe man nur Vorwärts- und Rückwärtslaufen auf einer Linie.

Die Kachel nimmt stattdessen:

- `lambda_geo` als horizontale Achse
- `beta_geo` als vertikale Achse

und sampelt ein Zeitfenster von ungefähr `±90` Tagen. Dadurch erscheint die bekannte Schleife oder S-Kurve, die bei äußerem bzw. innerem Planeten unterschiedlich ausfallen kann.

### Merkur- und Venus-Phasen

Die Kachel zeigt für die beiden inneren Planeten die beleuchtete Phase, Elongation und grobe Morgen-/Abenderscheinung für das gewählte Datum.

#### Code-Stellen zur Phasen-Berechnung

- `index.html:3842`  
  `phaseDiscSvg(illumination, evening, color)` erzeugt die stilisierte Phasenscheibe.
- `index.html:3858`  
  `renderInnerPlanetPhases(date)` rendert die Karten für Merkur und Venus.
- `index.html:4716`  
  `planetIlluminationData(key, date)` berechnet Beleuchtung, Phasenwinkel, Elongation, Morgen-/Abendstatus und Distanz.

#### Wie die Formel hier funktioniert

Zunächst werden heliozentrische Positionen von Erde und Planet bestimmt. Daraus entstehen:

- die geozentrische Richtung zum Planeten
- die Sonne-Planet-Erde-Geometrie

Für den Phasenwinkel wird das Skalarprodukt zwischen Sonnenrichtung und Erdrichtung am Planeten benutzt. In der Implementierung wird dafür eine Kosinus-Beziehung verwendet:

`cos(phaseAngle) = (r_body · r_geo) / (|r_body| * |r_geo|)`

Daraus folgt der Phasenwinkel:

`phaseAngle = arccos(cosPhase)`

Die beleuchtete Fraktion wird dann genähert mit:

`illumination = (1 + cosPhase) / 2`

Die Elongation entscheidet zusätzlich, ob die Erscheinung eher morgens oder abends liegt:

- `elongation > 0` → Abendhimmel
- `elongation < 0` → Morgenhimmel

#### Mathematischer Appendix

##### Warum zeigen nur Merkur und Venus starke Phasen?

Merkur und Venus laufen innerhalb der Erdbahn. Dadurch sehen wir sie ähnlich wie den Mond mal stärker, mal schwächer beleuchtet, je nach Winkel zur Sonne.

Äußere Planeten zeigen aus irdischer Sicht ebenfalls Phasen, aber viel schwächer. Für eine kompakte anschauliche Kachel sind deshalb Merkur und Venus die sinnvollsten Kandidaten.

##### Warum ist Venus manchmal schmale Sichel und trotzdem auffällig hell?

Die sichtbare Phase kann klein sein, während Venus gleichzeitig relativ erdnah ist. Große scheinbare Scheibe und hohe Reflexion können deshalb trotz schmaler Sichel eine starke Helligkeit ergeben. Die Kachel zeigt davon die Geometrie, nicht die exakte scheinbare Magnitude.

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

## Grenzen und Näherungen der App

Planetenuhr ist bewusst ein `Astronomie-Dashboard` und keine vollwertige Ephemeriden- oder Planetariumssoftware. Viele Kacheln nutzen echte geometrische Grundideen, aber vereinfachte numerische Modelle, damit die Darstellung schnell, lokal und ohne externe Rechenbibliotheken im Browser funktioniert.

### Was in der App gut angenähert wird

- relative Planetenstellungen im Sonnensystem
- geozentrische Effekte wie Elongation, Phasen und retrograde Schleifen
- Tageslicht- und Dämmerungszeiten für den gewählten Ort
- didaktische Zusammenhänge wie Mondknoten, Finsternis-Saisons und Jahreszeiten

### Was bewusst schematisch bleibt

- Kleinkörperbahnen, Raumsondenpfade und einige Mondsysteme
- Sichtbarkeits-Einschätzungen ohne vollständige Horizont- und Atmosphärenrechnung
- Finsternis- und Kalenderdarstellungen als kuratierte oder angenäherte Orientierung
- Satelliten- und Polarlicht-Karten als kompakte Überblicksansichten statt Spezialtracker

### Was die App nicht ersetzen soll

Für hochpräzise Beobachtungsplanung, Teleskop-Ausrichtung oder exakte Ereigniszeiten sind spezialisierte Quellen besser geeignet, zum Beispiel:

- NASA / JPL
- IMCCE
- In-The-Sky.org
- timeanddate.com
- planetariumartige Software mit vollständigen Ephemeriden

Die Stärke der App liegt also in der Verbindung aus Übersicht, Anschaulichkeit und sofort nutzbarer Himmelsmechanik auf einer einzigen Seite.

## Architektur und Render-Zyklus

Die App ist als einzelne statische HTML-Datei aufgebaut. Struktur, Styling, Interaktion und Berechnungen leben überwiegend in `index.html`, während Inhalte und Texte in separate Konfigurationsdateien ausgelagert sind.

### Zentrale Zustände

Die wichtigsten globalen Zustände sind:

- `solarDayOffset`  
  verschiebt das gewählte Datum relativ zu `Date.now()`
- `selectedLocationKey`  
  bestimmt die aktuell gewählte Stadt
- Sprachzustand über `lang` und `translations.js`

Die zentrale Datumsfunktion ist:

- `index.html:4570`  
  `selectedSolarDate()`

Die zentrale Ortsfunktion ist:

- `index.html:4574`  
  `selectedLocation()`

### Datums- und Ortsfluss

Das Overlay `Datum & Ort` verändert nicht direkt jede Kachel einzeln. Stattdessen aktualisiert es den globalen Zustand und stößt danach einen gemeinsamen Refresh an.

Wichtige Stellen:

- `index.html:4248`  
  `refreshDateDrivenTilesWithAnchor()` aktualisiert datumsabhängige Kacheln und versucht die Scroll-Position stabil zu halten.
- `index.html:4596`  
  `refreshDateDrivenTiles()` rendert alle datumsgekoppelten Astro-Kacheln neu.
- `index.html:6332`  
  Beim Ortswechsel wird ebenfalls `refreshDateDrivenTilesWithAnchor()` ausgelöst.

Damit hängen unter anderem diese Kacheln direkt am gewählten Datum:

- Sonnensystem
- Mondknoten & Finsternis-Saison
- Planetenkonjunktionen
- Meteorströme
- Sternbild des Monats
- Jahresuhr der Sternbilder
- Jahreszeiten
- Retrograd-Phasen
- Merkur- & Venus-Phasen
- Tag/Nacht und Sichtbarkeit
- Finsternis-Geometrie

### Render-Organisation

Die Seite ist funktional in einzelne Renderer zerlegt. Fast jede größere Kachel besitzt eine eigene Renderfunktion, zum Beispiel:

- `renderSolarSystem(...)`
- `renderMoonNodes(...)`
- `renderConjunctionTimeline(...)`
- `renderSeasonAxis(...)`
- `renderRetrogradePhases(...)`
- `renderInnerPlanetPhases(...)`
- `renderVisibility(...)`
- `renderNightVisibility(...)`
- `renderSmallBodies()`
- `renderSpacecraft()`

Das ist bewusst kein Komponenten-Framework, sondern eine leicht lesbare „one file app“ mit klaren Render-Einstiegspunkten.

### Konfiguration vs. Berechnung

Die App trennt sichtbare Inhalte von Berechnungslogik:

- `translations.js`  
  UI-Texte
- `card-help-config.js`  
  Inhalte der `?`-Popups
- `calendar-events.js`  
  kuratierte Ereignisse
- `phenomena-config.js`  
  Meteorströme, Raumsonden, Sternbilder und weitere Phänomene
- `small-bodies-config.js`  
  Kometen und Gürtel
- `bsky-feed-config.js`  
  Bluesky-Feed-Konten

Die mathematische und grafische Verarbeitung bleibt dagegen in `index.html`.

### Dynamische Aktualisierung

Nicht alles hängt nur am manuellen Datumswechsel. Es gibt zusätzlich laufende oder periodische Updates:

- `index.html:6373`  
  `setInterval(updateTime, 1000)` für die Uhr
- `index.html:6377`  
  `refreshDynamicTiles()`
- `index.html:6378`  
  halbstündlicher Refresh für zeitabhängige Kacheln

So bleiben aktuelle Elemente wie Uhrzeit, Tageslicht, Kalenderbezüge oder Feed-Inhalte nicht auf dem Stand des Seitenladens stehen.

### Layout und Reflow

Nach vielen Render-Vorgängen wird das Kartenlayout erneut organisiert:

- `index.html:4221`  
  `scheduleMasonryLayout(...)`

Diese Funktion wird nach zahlreichen Kachel-Updates erneut aufgerufen, damit unterschiedlich hohe Karten im Grid sinnvoll neu einsortiert werden.

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
