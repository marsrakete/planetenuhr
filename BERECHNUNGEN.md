# Berechnungen der Planetenuhr

Diese Datei enthält die technische Beschreibung der Rechenmodelle und Formeln. [Zur Übersicht im README](README.md) · [Zu Architektur und Entwicklung](TECHNIK.md)

Eine allgemein verständliche Einordnung steht im README unter [Grenzen und Genauigkeit](README.md#grenzen-und-genauigkeit).

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

- `index.html:4949`\
  `renderSmallBodies()` rendert Gürtel, Kometenbahnen, Labels, Hit-Flächen und Detailanzeige.
- `index.html:5007`\
  Hier werden Asteroiden- und Kuipergürtel als breite Ringe aus `small-bodies-config.js` aufgebaut.
- `index.html:5036`\
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

- `index.html:5795`\
  `renderSpacecraft()` rendert Ringmarken, Flugpfade, Marker und Labels.
- `phenomena-config.js:28`\
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

- `index.html:4660`\
  `bodyEclipticLongitude(key, date)` liefert die ekliptische Länge des gewählten Körpers.
- `index.html:4708`\
  `solarElongationForKey(key, date)` berechnet die Elongation relativ zur Sonne.
- `index.html:4061`\
  `renderNightVisibility(date)` baut die zeitliche Nachtansicht pro Planet.
- `index.html:4788`\
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

- `index.html:4777`\
  `eclipseSeasonInfo(date)` berechnet Phase, Aktivität und nächstes Zentrum der angenäherten Finsternis-Saison.
- `index.html:6000`\
  `moonNodeDistance(date)` berechnet die genäherte Distanz des Mondes zum nächsten Knoten im drakonitischen Monat.
- `index.html:3265`\
  `renderMoonNodes(date)` kombiniert Saisonfenster, Knotennähe und Mondphase zur erklärenden Mondknoten-Kachel.
- `index.html:6019`\
  `renderEclipseGeometry(date)` baut die kleinere Geometrie-Anzeige in `Erde & Mond` aus Knotennähe und Phase auf.

#### Wie die Formel hier funktioniert

Die Kachel verbindet zwei voneinander getrennte Ideen:

1. `Knotennähe des Mondes`\
   Finsternisse sind nur möglich, wenn der Mond beim Neu- oder Vollmond nahe der Ekliptik-Knoten steht.

2. `Finsternis-Saison der Sonne`\
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

- `index.html:5627`\
  `seasonNameForFraction(fraction)` ordnet den Jahresfortschritt grob einer Jahreszeit zu.
- `index.html:5635`\
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

- `index.html:3777`\
  `retrogradePathSvg(key, date)` erzeugt die kleine Schleifen-/S-Kurven-Grafik aus geozentrischer Länge und Breite.
- `index.html:3817`\
  `renderRetrogradePhases(date)` rendert die Kachel mit Badge, Pfad, Stationspunkten und aktuellem Marker.
- `index.html:4677`\
  `geocentricVector(key, date)` berechnet den Vektor Planet minus Erde und damit die scheinbare Blickrichtung von der Erde aus.
- `index.html:4686`\
  `geocentricLongitude(key, date)` leitet daraus die scheinbare geozentrische Länge ab.
- `index.html:4693`\
  `geocentricLatitude(key, date)` ergänzt die geozentrische Breite für die sichtbare Schleife.
- `index.html:4728`\
  `apparentDailyMotion(key, date)` bestimmt die angenäherte tägliche scheinbare Bewegung.
- `index.html:4734`\
  `findNearestStationDate(key, date)` sucht den nächsten Vorzeichenwechsel der täglichen Bewegung, also eine Station.
- `index.html:4852`\
  `planetPosition(planet, date)` liefert die heliozentrische Grundposition aus den Bahnelementen.

#### Wie die Formel hier funktioniert

Die Kachel berechnet nicht direkt eine „Retrograd-Formel“ als Einzeiler, sondern in drei Schritten:

1. Aus den Bahnelementen wird zunächst die heliozentrische Position des Planeten berechnet.\
   Vereinfacht: Aus großer Halbachse `a`, Exzentrizität `e`, Inklination `i`, mittlerer Länge `L`, Perihellänge `p` und Knotenlänge `n` entsteht über Kepler-Gleichung und Koordinatentransformation die Position `(x, y, z)`.

2. Danach wird auf die Sicht von der Erde umgerechnet.\
   Dafür gilt:

   `r_geo = r_planet - r_earth`

   Also schlicht: geozentrischer Vektor = Planetenvektor minus Erdvektor.

3. Aus diesem Vektor wird die scheinbare Richtung am Himmel abgeleitet.\
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

- `index.html:3842`\
  `phaseDiscSvg(illumination, evening, color)` erzeugt die stilisierte Phasenscheibe.
- `index.html:3858`\
  `renderInnerPlanetPhases(date)` rendert die Karten für Merkur und Venus.
- `index.html:4716`\
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

## Planeten über dem Horizont und Lichtreise

Der Himmel über der Horizontlinie wird passend zu Tag, Morgen-/Abenddämmerung oder Nacht eingefärbt. Ein kompaktes Zeitband zeigt den tatsächlichen lokalen Kalendertag, einen Zeiger für die erkundete Uhrzeit sowie Sonnenauf- und -untergang. Bürgerliche, nautische und astronomische Dämmerung werden anhand der Sonnenhöhe bei −6°, −12° und −18° unterschieden; Auf- und Untergang verwenden konventionell −0,8333° für das Sonnenzentrum. Die Sonnenhöhe folgt demselben Koordinatenmodell wie die Planeten. Ein dunkler Hintergrund bedeutet dunklen Himmel, keine garantierte Sichtbarkeit bei jedem Wetter.

Die Tagesgrenzen werden in der IANA-Zeitzone des Ortes bestimmt und berücksichtigen auch Tage mit 23 oder 25 Stunden. Polartag und Polarnacht zeigen keine erfundenen Auf-/Untergangszeiten; bei Polarnacht kann dennoch Dämmerung vorkommen.

Definitionen: [US Naval Observatory: Aufgang, Untergang und Dämmerung](https://aa.usno.navy.mil/faq/RST_defs).

Die Horizontrechnung wandelt geozentrische J2000-Vektoren zunächst in Äquatorkoordinaten um, präzediert sie mit IAU-1976-Winkeln auf das Datum und verwendet die vorhandene lokale Sternzeit-/Horizonttransformation. Atmosphärische Brechung, Nutation, Aberration und Lichtzeitkorrektur der beobachteten Planetenpositionen sind nicht enthalten. Die Darstellung zeigt geometrische Positionen, keine garantierte Beobachtbarkeit. Wetter, Gelände und Tageslicht bleiben entscheidend. Die verwendeten JPL-Bahnelemente gelten für 1800–2050; außerhalb dieses Bereichs erscheint ein Hinweis auf die Extrapolation.

### Lichtlaufzeit und Fortschritt

Die Lichtreise verwendet 149.597.870,7 km pro AE und 299.792,458 km/s. Sie misst den Abstand zur Planetenposition am ausgewählten Zeitpunkt; die Planetenbewegung während des Lichtflugs wird nicht nachgeführt.

Sonnenabstand und Lichtlaufzeit verwenden die vorhandenen Kepler-Bahnen, nicht bloß mittlere Bahnradien.

Fortschritt: p = min(1, p₀ + Δt / t), mit gewähltem Startanteil p₀, tatsächlich verstrichener Zeit Δt und Lichtlaufzeit t = r / c.

Der Fortschritt wird beim manuellen Verschieben neu angesetzt. Während der Reise läuft die Zeit im Verhältnis 1:1; verzögerte Aktualisierungen im Hintergrund werden anhand der tatsächlich verstrichenen Zeit nachgeholt.

Quellen: [JPL-Bahnelemente](https://ssd.jpl.nasa.gov/planets/approx_pos.html), [JPL-Konstanten](https://ssd.jpl.nasa.gov/astro_par.html), [IAU-1976-Präzessionswinkel / ERFA](https://github.com/liberfa/erfa/blob/master/src/prec76.c).

## IDEFIX und MMX: Positionsanzeige und Missionsplan

Die Reise verwendet geometrische heliozentrische Vektoren der JAXA-Vorstartplanung aus [JPL Horizons](https://ssd-api.jpl.nasa.gov/doc/horizons.html), Objekt −239, nicht eine selbst konstruierte Transferellipse. Der gespeicherte Stand ist eine Vorhersage vom 7. Oktober 2026 und keine Live-Telemetrie.

### Interpolation innerhalb der Datenabdeckung

Gespeicherte Reihen enthalten UTC-Zeitstempel und die drei Positionskomponenten X, Y, Z in AE im Rahmen „Ecliptic of J2000.0 / ICRF“. Zwischen benachbarten Zeitpunkten t₀ und t₁ gilt:

`u = (t − t₀) / (t₁ − t₀)`

`r(t) = (1 − u) r₀ + u r₁`

r₀ und r₁ sind Vektoren; dieselbe Gewichtung wird für X, Y und Z verwendet. Außerhalb der gespeicherten Zeiten wird keine Position berechnet. Die lineare Interpolation und zeitliche Abtastung sind für die heliozentrische Übersicht gedacht, nicht für Navigation, lokale Marsorbits oder eine genaue Lage gegenüber Phobos. Der Datensatz beginnt erst nach dem Start; diese Lücke wird nicht durch einen erfundenen Weg aufgefüllt.

### Projektion und Pixelspur

`xSVG = 310 + 94 X`

`ySVG = 180 − 94 Y`

Die Konstanten definieren Sonnenmittelpunkt und AE-Maßstab im SVG. Die Ansicht zeigt die Ekliptikebene von oben; Z wird nicht dargestellt. Für Sonne, Erde und Mars werden die vorhandenen JPL-Kepler-Näherungen der App verwendet; die gerenderte MMX-Bahn stammt separat aus Horizons. Beide verwenden heliocentrische J2000-Ekliptikkoordinaten, aber nicht dieselbe numerische Genauigkeit. Körper und Markierungen sind zur Lesbarkeit vergrößert.

Jeder zeitlich bereits erreichte gespeicherte Vektor erzeugt einen kleinen Pixel. Die gestrichelte Linie zeigt die gesamte gespeicherte Planbahn. Die aktuelle Markierung folgt dem interpolierten Vektor, auch wenn dieser zum heutigen Zeitpunkt nur eine Vorhersage ist.

### Phobos im vergrößerten Detail

Nach dem [NASA Mars Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html?level=1) beträgt die mittlere siderische Umlaufzeit von Phobos etwa T = 0,31891 Tage, rund 7 Stunden und 39 Minuten. Für die Skizze gilt:

`φ = 2π frac((t − t₀) / T)`

`x = 100 + 60 cos(φ); y = 92 − 60 sin(φ)`

t und t₀ werden in derselben Zeiteinheit eingesetzt. frac bezeichnet den auf [0, 1) normalisierten gebrochenen Anteil. t₀ = J2000 ist ein frei gewählter grafischer Phasenursprung. Kreisbahn, Orientierung, Abstände und Körpergrößen sind schematisch: Es wird keine reale Phobos-Länge oder Landestelle behauptet.

### Belegte Ereignisse und zukünftige Phasen

Die bestätigte Startmeldung wird mit eigenem Prüfdatum aus der [CNES-Chronik](https://cnes.fr/en/projects/mmx) dargestellt. Die JAXA-Startzeit entspricht dem 19. Oktober 2026, 19:41:03 UTC, beziehungsweise dem 20. Oktober in Japan. [ESA](https://www.esa.int/Science_Exploration/Space_Science/Mars_moon_lander_set_to_launch_on_19_October) und [DLR](https://www.dlr.de/de/aktuelles/nachrichten/2026/auf-zu-den-marsmonden-mission-mmx-und-rover-idefix-bereit-zum-start) beschreiben Marsankunft 2027 und Roverabsetzen Ende 2028/Anfang 2029 als Planung.

Die Tagesgrenzen der Zeitleistenabschnitte und Sprungdaten sind illustrative Einordnungen, keine offiziell bestätigten Manövertermine. Nach Ende der Horizons-Abdeckung markiert ein hohles Symbol lediglich den geplanten Zielbereich bei Phobos. Ob Landung und Betrieb tatsächlich erfolgen, muss durch neue Meldungen bestätigt werden. IDEFIX soll auf Phobos verbleiben; die für 2031 geplante Rückkehr betrifft das Probenmaterial.


## Himmelswissen: statische Lehrgrafiken

Die SVG-Szenen in `sky-knowledge-graphics-config.js` verwenden feste Zeichenkoordinaten (360 × 158). Es werden dafür keine Ephemeriden oder tagesabhängigen Himmelspositionen berechnet. Beschriftungen und sichtbare Bildunterschriften erläutern Aussage und Vereinfachung in Deutsch, Englisch und Französisch.

- Planeten- und Mondfolgen geben die Reihenfolge wieder, keine maßstäblichen Entfernungen. Die galileischen Monde stehen nach wachsendem Bahnradius; ihre momentane Stellung wird nicht berechnet.
- Beim Jupiter-Erde-Vergleich gilt für die gezeichneten Kreisradien `44 / 4 = 11`, also auch für die Durchmesser ungefähr 11 : 1. Der Abstand ist frei gewählt. Der Vergleich Beteigeuze/Sonne und der Vergleich Weißer Zwerg/Erde sind ausdrücklich schematisch; daraus darf kein genauer Radius abgelesen werden.
- Die Venus-Balken verwenden für beide Rotations- bzw. Umlaufzeiten `Breite = Erdentage × 1 SVG-Einheit`: 243 und 225 Tage. Die Rotation ist siderisch, kein Sonnentag. Beim Temperaturvergleich gilt `Breite = Temperatur in °C × 0,6`, Ausgangspunkt 0 °C. Merkurs Tagesmaximum von etwa 430 °C wird mit etwa 467 °C an der Venusoberfläche verglichen; es sind keine zwei Mitteltemperaturen. Quellen: [NASA Merkur](https://science.nasa.gov/mercury/facts/) und [NASA Venus](https://science.nasa.gov/venus/venus-facts/).
- Die Uranusachse zeigt etwa 98° gegenüber der Senkrechten zur Bahnebene. Der Winkelbogen beginnt an dieser Senkrechten. Die Lage im Orbit ist frei gewählt. Die Saturn-Skizze vergleicht symbolische Massepunkte bei gleichem Volumen; Punktzahlen sind keine Messwerte oder Teilchenzahlen.
- Spektralklassen O–B–A–F–G–K–M und Blau/Rot zeigen die Reihenfolge der Oberflächentemperaturen. Farben sind illustrative Annäherungen; Gesamtleuchtkraft und weitere Spektralklassen werden daraus nicht abgeleitet.
- Mondbilder und p/d-Hilfslinien beziehen sich auf die im Eintrag erläuterten nördlichen Breiten. Sie stellen keine aktuelle Mondphase oder tatsächliche Orientierung am gewählten Ort dar.
- Sternbildlinien und der Bogen zu Arktur/Spica sind vereinfachte Merkskizzen, keine maßstäblichen Sternkarten oder Helligkeitsskalen. IAU-Karten sind bei Sirius, Regulus und Beteigeuze verlinkt. Polaris steht im Bild leicht neben dem Zentrum der symbolischen Sternspuren, da der Stern nur nahe am Himmelsnordpol liegt.
- Lichtjahr, Proxima-Lichtweg und Sonnenlicht zeigen die jeweils im Eintrag genannten gerundeten Größen, keine räumlichen Maßstäbe. Die Sonnen-Zeitleiste endet beim heutigen Alter von rund 4,6 Milliarden Jahren und behauptet keine gesamte Lebensdauer. Die Fusion zeigt lediglich den stark vereinfachten Nettoschritt von vier Wasserstoffkernen zu einem Heliumkern mit Energiefreisetzung; Zwischenreaktionen und weitere Teilchen sind ausgelassen.
