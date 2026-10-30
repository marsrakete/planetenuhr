# Berechnungen der Planetenuhr

Diese Datei enthält die technische Beschreibung der Rechenmodelle und Formeln. [Zur Übersicht im README](README.md) · [Zu Architektur und Entwicklung](TECHNIK.md)

Eine allgemein verständliche Einordnung steht im README unter [Grenzen und Genauigkeit](README.md#grenzen-und-genauigkeit).

## Technische Beschreibung

### Datumsgekoppelte Aktualisierung

`js/core/dashboard-context.js` hält das zentrale Datum als Tagesoffset relativ zu `Date.now()`. Ohne manuelle Uhrzeitauswahl läuft die Uhrzeit weiter; nach einer Auswahl wird die gewählte Ortsuhrzeit auf das lokale Datum im Zeitzonenmodell des Beobachtungsorts gesetzt. Der Uhrzeit-Zeitraffer addiert je Schritt eine reale Stunde und trägt beim Wechsel des lokalen Kalendertags den Tagesoffset weiter. `js/core/dashboard-refresh.js` verteilt je globalem Aktualisierungslauf denselben Zeitpunkt, Ort, Ortszeitzone und Sprache. Auch die bisherigen Zugriffsfunktionen lesen während des Laufs denselben Snapshot. Die Monatssteuerung behält das native `setMonth`-Überlaufverhalten und die bestehenden Reglergrenzen.

### Mondphase

`js/models/moon-model.js` enthält die gemeinsame Berechnung für `computeMoon(date)` und `nextFullMoon(fromDate)`. Beide erhalten einen ausdrücklichen Zeitpunkt. Die bisherigen Aufrufnamen in `js/core/app.js` sind vorläufige Adapter; beide Mondanzeigen und die Tagesübersicht verwenden weiterhin dasselbe Modell.

Die Mondphase basiert auf einer mittleren synodischen Periode:

- synodischer Monat: `29.530588861` Tage
- Referenz-Neumond: `2000-01-06 18:14 UTC`

Daraus werden berechnet:

- Phasenname
- Beleuchtung
- Zyklusfortschritt
- nächster Vollmond als Näherung

Die seit dem Referenz-Neumond verstrichenen UTC-Tage werden mit positivem Modulo auf einen Zyklus abgebildet: `Alter = ((Tage % Periode) + Periode) % Periode`, `f = Alter / Periode`. Wie bisher wird die Phase sekundengenau ausgewertet; vorhandene Millisekunden werden dabei verworfen. Die Beleuchtung ist `rund(100 · (1 − cos(2πf)) / 2)`. Phasennamen werden anhand dieser gerundeten Beleuchtung und der zunehmenden beziehungsweise abnehmenden Zyklushälfte gewählt.

Für den nächsten Vollmond gilt `Δf = 0,5 − f`; bei `Δf ≤ 0` wird ein ganzer Zyklus addiert. Das Ergebnis ist `Ausgangszeitpunkt + Δf · Periode · 86400000 ms`. Der Ausgangszeitpunkt selbst behält seine Millisekunden. Dieses Rundungsverhalten und die Wahl des folgenden Zyklus bleiben bei der Auslagerung unverändert. Die mittlere Periode liefert eine Näherung, keine genaue astronomische Vollmond-Ephemeride.

Die SVG-Mondphase in `js/shared/celestial-bodies.js` verwendet dieselbe Phasenfraktion `f`. Die Lichtgrenze auf der projizierten Kugel ist eine Halbellipse mit horizontaler Halbachse `R · |cos(2πf)|` und vertikaler Halbachse `R`. Ihr Vorzeichen und die zunehmende bzw. abnehmende Phase bestimmen die Bogenrichtung; bei den Vierteln wird die Lichtgrenze eine Gerade. So entspricht die helle Fläche dem Anteil `(1 − cos(2πf)) / 2`. Die dunkle Fläche wird als komplementäre Lichtregion für `f + 0,5` gezeichnet.

Zunehmende Phasen sind rechts beleuchtet, abnehmende links (schematische Ansicht für nördliche Breiten, keine ortsabhängige Drehung oder Libration). Die Phase entsteht durch den Blick auf die sonnenbeschienene Mondhälfte, nicht durch Erdschatten. Finsternisabschattungen werden hier nicht simuliert.

Der Controller `js/cards/earth-moon.js` verwendet für beide datumsgebundenen Mondansichten denselben globalen Kontext. Die Animation besitzt davon unabhängig eine einzige RAF-Kette; wiederholtes `pageshow` oder Resize vervielfacht sie nicht.

Die obere Umlaufgrafik ist eine andere Perspektive: eine stark beschleunigte, schräg projizierte Draufsicht mit festem Sonnenlicht von links. Erde und Mond besitzen dort eine helle linke und dunkle rechte Seite. Der Umlauf zeigt keine datumsgenaue Mondposition. Die vereinfachten Kontinente drehen sich nicht mit der tatsächlichen Erdrotation; das Erde-Mond-Größen- und Abstandsverhältnis ist nicht maßstäblich.

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

Der Controller `js/cards/solar-system.js` verwendet den gemeinsamen Aktualisierungskontext und das bestehende Planetenmodell. Er aktualisiert die vorhandenen Orbit-, Marker- und Beschriftungs-Templates; Geometrie und SVG-Grafiken bleiben erhalten. Die Bahnradien werden als feste Layoutwerte aus `js/data/solar-system-config.js` gewählt. Damit sind die inneren Planeten stärker voneinander getrennt; die äußeren Ringe nutzen die verfügbare Kreisfläche.

```text
Bildschirmradius = Scheibenbreite * radiusFractions[Planet]
Richtung = atan2(y_heliozentrisch, x_heliozentrisch)
```

Nur die Richtungen werden aus den datumsabhängigen Kepler-Positionen übernommen. Die Radien stellen weder Entfernungen noch Exzentrizitäten dar. Ring und Planetenmarker verwenden jeweils denselben Radius.

### Kleinkörper und Raumsonden

Kleinkörper- und Raumsondenkarten sind schematische Übersichten. Die Bahnen werden bewusst stilisiert oder stark komprimiert, damit unterschiedliche Distanzskalen in einer einzigen Kachel lesbar bleiben.

#### Code-Stellen zur Kleinkörper-Kachel

- `js/cards/small-bodies.js`\
  `PLANETENUHR_SMALL_BODIES_CARD` rendert Gürtel, Kometenbahnen, Labels, Hit-Flächen und Detailanzeige.
- `js/models/small-bodies-model.js`\
  `PLANETENUHR_SMALL_BODIES_MODEL` enthält Distanzkompression sowie Ellipsen- und Labelgeometrie.
- `js/data/small-bodies-config.js`\
  Liefert Gürtel- und Kometendaten.

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

- `js/cards/spacecraft.js`\
  `PLANETENUHR_SPACECRAFT_CARD` rendert Ringmarken, Flugpfade, Marker und Labels.
- `js/models/spacecraft-model.js`\
  `PLANETENUHR_SPACECRAFT_MODEL` berechnet Distanzskalierung, Kurvenpunkte und Labelplatzierung.
- `js/data/phenomena-config.js`\
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

- `js/core/app.js`\
  `bodyEclipticLongitude(key, date)` liefert die ekliptische Länge des gewählten Körpers.
- `js/core/app.js`\
  `solarElongationForKey(key, date)` berechnet die Elongation relativ zur Sonne.
- `js/core/app.js`\
  `renderNightVisibility(date)` baut die zeitliche Nachtansicht pro Planet.
- `js/core/app.js`\
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

Die Lichtzeiten verwenden in `js/models/solar-visibility-model.js` dieselbe NOAA-nahe Näherung über den gewählten Ort wie zuvor im Hauptskript:

- Sonnenaufgang / Sonnenuntergang bei `90.833°`
- bürgerliche Dämmerung bei `96°`
- Goldene Stunde angenähert über Sonnenhöhe `+6°`

Die Formatierung erfolgt in `Europe/Berlin`, die Ortswahl beeinflusst die astronomischen Zeiten, aber nicht die Zeitzone.

Das Modul trennt diese kompakte Ereignisrechnung und die bisherigen saisonalen Sinus-/Zeitgleichungsnäherungen von den geometrischen Sonnenkoordinaten. Die schematische Nachtsichtbarkeit erhält die bereits berechnete Elongation ausdrücklich; sie tastet wie bisher in 20-Minuten-Schritten ab. Der eigenständige Horizont-Explorer behält seine geometrische Sonnenhöhe und seine IANA-Tagesgrenzen. Die verschiedenen Rechenwege, ihre bisherigen lokalen Datumskonventionen und ihre Genauigkeitsgrenzen wurden bei der Auslagerung bewusst erhalten.

### Mondknoten und Finsternis-Saison

`js/models/eclipse-model.js` enthält die geometrischen Zyklen. `js/models/eclipse-location-model.js` enthält getrennt davon die Zuordnung von Datumsschlüsseln, Regionen und kuratierten Ortsprofilen. Die Modelle berechnen keine exakten lokalen Finsterniskontakte. Manuelle Stadtangaben haben wie bisher Vorrang vor einer groben Regionszuordnung aus dem gemeinsamen Kalender.

Die Kachel kombiniert zwei Näherungen:

- drakonitischer Monat für Knotennähe
- wiederkehrender Saisonzyklus von etwa `173.31` Tagen

Wichtig: Diese Kachel ist didaktisch. Sie erklärt, warum Finsternisse saisonal gehäuft auftreten, ersetzt aber keine exakte Finsternis-Ephemeride.

#### Code-Stellen zur Mondknoten-/Finsternis-Berechnung

- `js/models/eclipse-model.js`\
  `eclipseSeasonInfo(date)` berechnet Phase, Aktivität und nächstes Zentrum der angenäherten Finsternis-Saison.
- `js/models/eclipse-model.js`\
  `moonNodeDistance(date)` berechnet die genäherte Distanz des Mondes zum nächsten Knoten im drakonitischen Monat.
- `js/core/app.js`\
  `renderMoonNodes(date)` kombiniert Saisonfenster, Knotennähe und Mondphase zur erklärenden Mondknoten-Kachel.
- `js/core/app.js`\
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

- `js/cards/seasons.js`\
  `seasonNameForFraction(fraction)` ordnet den Jahresfortschritt grob einer Jahreszeit zu.
- `js/cards/seasons.js`\
  `render(context)` berechnet Jahresfortschritt, Sonnen-Deklination und rendert die Orbit- und Nebenansicht.

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

- `js/models/retrograde-model.js`\
  `samplePath(key, date)` liefert die Plotdaten der kleinen Schleifen-/S-Kurve aus geozentrischer Länge und Breite.
- `js/cards/retrograde.js`\
  `render(context)` rendert die Kachel mit Badge, Pfad, Stationspunkten und aktuellem Marker.
- `js/core/app.js`\
  `geocentricVector(key, date)` berechnet den Vektor Planet minus Erde und damit die scheinbare Blickrichtung von der Erde aus.
- `js/core/app.js`\
  `geocentricLongitude(key, date)` leitet daraus die scheinbare geozentrische Länge ab.
- `js/core/app.js`\
  `geocentricLatitude(key, date)` ergänzt die geozentrische Breite für die sichtbare Schleife.
- `js/models/retrograde-model.js`\
  `apparentDailyMotion(key, date)` bestimmt die angenäherte tägliche scheinbare Bewegung.
- `js/models/retrograde-model.js`\
  `findNearestStationDate(key, date)` sucht den nächsten Vorzeichenwechsel der täglichen Bewegung, also eine Station.
- `js/models/planet-model.js`\
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

Die Funktion `planetPosition(...)` in `js/models/planet-model.js` berechnet aus den unverändert nach `js/data/planet-elements-config.js` ausgelagerten Bahnelementen eine heliozentrische Position. Die Elementpaare enthalten jeweils den J2000-Wert und die Änderung pro Julianischem Jahrhundert; Distanzen sind in AE und Winkel in Grad angegeben. Die Kepler-Gleichung wird wie bisher mit acht Newton-Schritten gelöst. Das Modell erhält ein ausdrückliches Datum; die globale Datumsauswahl übernehmen vorläufige Adapter in `js/core/app.js`.

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

- `js/models/inner-planets-model.js` und `js/cards/inner-planets.js`\
  `phaseDiscPath(illumination, evening)` liefert den Terminator; `renderDisc(illumination, evening, color)` füllt das SVG-Template der stilisierten Phasenscheibe.
- `js/cards/inner-planets.js`\
  `render(context)` rendert die Karten für Merkur und Venus.
- `js/models/inner-planets-model.js`\
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

## Planetenkonjunktionen: engste Begegnungen aus Erdperspektive

Die Kachel sucht für Merkur, Venus, Mars, Jupiter und Saturn den kleinsten räumlichen Winkelabstand am Himmel aus Sicht der Erde. Die vorhandenen [JPL-Näherungsbahnen](https://ssd.jpl.nasa.gov/planets/approx_pos.html) liefern heliozentrische Positionen. Zunächst wird die Erdposition abgezogen: **r_A = R_A − R_E**, **r_B = R_B − R_E**. Erst diese geozentrischen Richtungsvektoren entsprechen derselben Beobachtungsperspektive wie die Horizontkachel.

Der vollständige Winkelabstand ist **Δ = arccos(clamp((r_A · r_B) / (|r_A| |r_B|), −1, 1))**. Das Skalarprodukt enthält x, y und z und damit auch den Breitenunterschied. Die Begrenzung schützt vor Gleitkommawerten knapp außerhalb des Definitionsbereichs. Ein gemeinsamer Wechsel des Koordinatensystems, etwa die Präzession zur Epoche des Datums, verändert diesen Winkel nicht.

Der Controller `js/cards/conjunctions.js` zeichnet die Ereignisse; das unveränderte Rechenmodell bleibt in `js/models/conjunction-model.js`. Dort lokalisieren tägliche Stichproben lokale Minima. Eine Suche mit dem Goldenen Schnitt verfeinert die Kandidaten zwischen den Nachbartagen auf ein Suchintervall unter einer Minute. Das ist numerische Verfeinerung, keine Zusage minutengenauer Ephemeriden. Die Kachel zeigt nur Minima bis 4,5° innerhalb von ±60 verstrichenen Tagen. Stützvektoren werden zwischen Planetenpaaren geteilt, um wiederholte Bahnberechnungen zu vermeiden.

Gemeint sind **engste Begegnungen**, nicht zwingend Konjunktionen im strengen Sinn gleicher ekliptischer Länge oder Rektaszension. Die Entfernungen sind geometrisch, ohne Lichtzeitkorrektur, Aberration und lokale Parallaxe. Auch ungünstig zur Sonne stehende oder unter dem Horizont liegende Begegnungen können erscheinen; die Zeitachse ist kein Sichtbarkeitsfilter. Datumsmarken und Ereignisse werden auf derselben echten Zeitachse platziert. Die Zusammenfassung nennt das nächste zukünftige Minimum.

Alle Ereignispunkte haben denselben Radius; die Größe codiert keinen Winkelabstand. Der Abstand steht als lokalisierte Gradzahl mit dem gemeinsamen Finger-/Daumen-/Handvergleich aus altitudeThumbEstimate direkt am Ereignis und in der Zusammenfassung. Unter 1° lautet die Ergänzung „weniger als 1 Fingerbreit“. Die Vergleiche gelten bei ausgestrecktem Arm und sind grobe Anschauungswerte.

Kontrollfall: Am 26. Oktober 2026 beträgt der Mars-Jupiter-Abstand im Modell rund 7,9°. Die engste Begegnung um den 16. November wird mit rund 1,2° gefunden. Ein bloßer Längenvergleich würde den verbleibenden Breitenabstand unterschlagen.

## Planeten über dem Horizont und Lichtreise

Der Himmel über der Horizontlinie wird passend zu Tag, Morgen-/Abenddämmerung oder Nacht eingefärbt. Ein kompaktes Zeitband zeigt den tatsächlichen lokalen Kalendertag, einen Zeiger für die erkundete Uhrzeit sowie Sonnenauf- und -untergang. Bürgerliche, nautische und astronomische Dämmerung werden anhand der Sonnenhöhe bei −6°, −12° und −18° unterschieden; Auf- und Untergang verwenden konventionell −0,8333° für das Sonnenzentrum. Die Sonnenhöhe folgt demselben Koordinatenmodell wie die Planeten. Ein dunkler Hintergrund bedeutet dunklen Himmel, keine garantierte Sichtbarkeit bei jedem Wetter.

Die Tagesgrenzen werden in der IANA-Zeitzone des Ortes bestimmt und berücksichtigen auch Tage mit 23 oder 25 Stunden. Polartag und Polarnacht zeigen keine erfundenen Auf-/Untergangszeiten; bei Polarnacht kann dennoch Dämmerung vorkommen.

Definitionen: [US Naval Observatory: Aufgang, Untergang und Dämmerung](https://aa.usno.navy.mil/faq/RST_defs).

Die Horizontrechnung wandelt geozentrische J2000-Vektoren zunächst in Äquatorkoordinaten um, präzediert sie mit IAU-1976-Winkeln auf das Datum und verwendet die vorhandene lokale Sternzeit-/Horizonttransformation. Atmosphärische Brechung, Nutation, Aberration und Lichtzeitkorrektur der beobachteten Planetenpositionen sind nicht enthalten. Die Darstellung zeigt geometrische Positionen, keine garantierte Beobachtbarkeit. Wetter, Gelände und Tageslicht bleiben entscheidend. Die verwendeten JPL-Bahnelemente gelten für 1800–2050; außerhalb dieses Bereichs erscheint ein Hinweis auf die Extrapolation.

### Gemeinsame Zeit- und Koordinatenhelfer

Die in `js/models/astronomy-coordinates.js` ausgelagerten Formeln bleiben gegenüber dem bisherigen Hauptskript unverändert. Das Julianische Datum ist `JD = Unixzeit in Millisekunden / 86400000 + 2440587,5`; für J2000, 1. Januar 2000 um 12 Uhr UTC, ergibt sich 2451545,0. Mit `T = (JD − 2451545,0) / 36525` wird die mittlere Ekliptikschiefe als `ε = 23,439291° − 0,0130042° · T` angenähert. Die mittlere Sternzeit verwendet den bisherigen Polynomansatz in `localSiderealAngleDegrees`; die östliche geografische Länge wird addiert.

Aus Rektaszension und lokaler Sternzeit ergibt sich der Stundenwinkel. Breite, Stundenwinkel und Deklination liefern über sphärische Trigonometrie Höhe und Azimut; der Azimut zählt von Norden über Osten. Die Ekliptik-Umrechnung in diesem Modul ist die bestehende vereinfachte Umrechnung mit mittlerer Schiefe. Das separate Modell `js/models/astronomy-explorer-model.js` präzediert hingegen J2000-Vektoren auf das Datum; die beiden Berechnungswege bleiben bewusst getrennt.

### Milchstraßenband am Himmel

`js/models/milky-way-sky-model.js` tastet die galaktische Ebene bei `b = 0°` in 0,5°-Schritten der galaktischen Länge `l` ab. Die ICRS-Richtungen werden aus der Gaia-DR3-Transformation gewonnen. Für einen Punkt der Ebene gilt `r_Gal = (cos l, sin l, 0)` und `r_ICRS = A_G · r_Gal`; verwendet werden die ersten beiden Spalten der in der [ESA-Gaia-Dokumentation zur Koordinatentransformation](https://gea.esac.esa.int/archive/documentation/GDR3/Data_processing/chap_cu3ast/sec_cu3ast_intro/ssec_cu3ast_intro_tansforms.html) angegebenen inversen Rotationsmatrix. Die festen Sternkoordinaten werden mit den IAU-1976-Winkeln auf das mittlere Äquatorsystem des gewählten Datums präzediert.

Aus Rektaszension `α` und Deklination `δ` folgen für den Ort und Zeitpunkt der Kachel der lokale Stundenwinkel und die geometrische Höhe:

`H = GMST + λ − α`

`sin h = sin φ · sin δ + cos φ · cos δ · cos H`

Hier sind `λ` die östliche geografische Länge und `φ` die geografische Breite. Die Höhe und der Azimut werden mit `js/models/astronomy-coordinates.js` berechnet; das Modell entspricht der üblichen [USNO-Horizonttransformation](https://aa.usno.navy.mil/faq/alt_az). Die Grafik bildet den Himmel als runde Kuppel ab: der Außenkreis ist der Horizont (`h = 0°`), die Mitte der Zenit (`h = 90°`), und die Himmelsrichtungen liegen am Rand. Gezeichnet werden nur Punkte mit `h ≥ 0°`. Für die Polardarstellung mit Azimut `A` gilt `r = R · (90° − h) / 90°`, `x = cx + r · sin A` und `y = cy − r · cos A`. Im SVG sind `R = 128`, `cx = 260` und `cy = 180`.

Die Sonnenhöhe wird mit derselben Horizonttransformation aus der vorhandenen Sonnenkoordinate der App bestimmt. Oberhalb von `−0,8333°` wird Tageslicht angenommen, zwischen `−0,8333°` und `−18°` Dämmerung, darunter astronomische Nacht. Das steuert Hintergrund und Helligkeit des Bands, nicht seine geometrische Position. Mondlicht, Wolken, Gelände, atmosphärische Refraktion und die ungleichmäßige Helligkeit der Milchstraße werden nicht simuliert. Daher ist die Grafik eine zeit- und ortsabhängige Orientierungshilfe, keine fotografische Vorhersage der Sichtbarkeit.

### Lichtlaufzeit und Fortschritt

Die Lichtreise verwendet 149.597.870,7 km pro AE und 299.792,458 km/s. Sie misst den Abstand zur Planetenposition am ausgewählten Zeitpunkt; die Planetenbewegung während des Lichtflugs wird nicht nachgeführt.

Sonnenabstand und Lichtlaufzeit der Planeten verwenden die vorhandenen Kepler-Bahnen, nicht bloß mittlere Bahnradien.

Für Voyager 1 nutzt `voyagerLightTravel(date)` zwei Sonnenabstände aus [NASA Eyes](https://eyes.nasa.gov/assets/dynamic/dynamo/sc_voyager_1/now.json), lokal in `js/data/voyager-data.js` mit UTC-Stützzeiten und Abrufdatum gespeichert. Das ist die Datenquelle des [offiziellen NASA-Entfernungszählers](https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/). Näherung: **r(t) = r₀ + (r₁ − r₀) × (t − t₀)/(t₁ − t₀)**, danach **t_Licht = r(t) / c**. Die Differenz der Sonnenabstände bestimmt die radiale Entfernungsänderung; die Raumgeschwindigkeit wird nicht mit der Radialgeschwindigkeit gleichgesetzt.

Zwischen den Stützzeitpunkten wird interpoliert, außerhalb linear fortgeschrieben. Die App begrenzt dies auf ±5 Julianische Jahre um den jüngsten Stützzeitpunkt. Das ist eine bewusst begrenzte Näherung ohne zugesicherte Ephemeridengenauigkeit, keine vollständige Flugbahn und keine Live-Telemetrie. Außerhalb dieses Bereichs zeigt die Kachel keine erfundene Entfernung und deaktiviert die Lichtreise. Daten können mit `node scripts/update-voyager-data.js` bewusst erneuert werden; der Browser fragt NASA nicht automatisch ab.

Die Reise startet auch für Voyager 1 an der Sonne. Der [NASA-Meilenstein am 18. November 2026](https://science.nasa.gov/mission/voyager/voyager-1/voyager-1-what-is-a-light-day/) gilt dagegen für einen Lichttag Abstand zur Erde (25.902.068.356,2 km). Voyager 1 ist das erste menschengemachte Objekt an dieser Marke; für Voyager 2 nennt NASA November 2035. Der Unterschied zwischen Sonnen- und Erdabstand beträgt höchstens ungefähr eine AE, entsprechend etwa acht Minuten Lichtlaufzeit. Es wird deshalb weder eine konstante 24-Stunden-Reise noch das Datum der Erd-Marke als Sonnen-Marke verwendet.

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

Die SVG-Szenen in `js/data/sky-knowledge-graphics-config.js` verwenden feste Zeichenkoordinaten (360 × 158). Es werden dafür keine Ephemeriden oder tagesabhängigen Himmelspositionen berechnet. Beschriftungen und sichtbare Bildunterschriften erläutern Aussage und Vereinfachung in Deutsch, Englisch und Französisch.

- Planeten- und Mondfolgen geben die Reihenfolge wieder, keine maßstäblichen Entfernungen. Die galileischen Monde stehen nach wachsendem Bahnradius; ihre momentane Stellung wird nicht berechnet.
- Beim Jupiter-Erde-Vergleich gilt für die gezeichneten Kreisradien `44 / 4 = 11`, also auch für die Durchmesser ungefähr 11 : 1. Der Abstand ist frei gewählt. Der Vergleich Beteigeuze/Sonne und der Vergleich Weißer Zwerg/Erde sind ausdrücklich schematisch; daraus darf kein genauer Radius abgelesen werden.
- Die Venus-Balken verwenden für beide Rotations- bzw. Umlaufzeiten `Breite = Erdentage × 1 SVG-Einheit`: 243 und 225 Tage. Die Rotation ist siderisch, kein Sonnentag. Beim Temperaturvergleich gilt `Breite = Temperatur in °C × 0,6`, Ausgangspunkt 0 °C. Merkurs Tagesmaximum von etwa 430 °C wird mit etwa 467 °C an der Venusoberfläche verglichen; es sind keine zwei Mitteltemperaturen. Quellen: [NASA Merkur](https://science.nasa.gov/mercury/facts/) und [NASA Venus](https://science.nasa.gov/venus/venus-facts/).
- Die Uranusachse zeigt etwa 98° gegenüber der Senkrechten zur Bahnebene. Der Winkelbogen beginnt an dieser Senkrechten. Die Lage im Orbit ist frei gewählt. Die Saturn-Skizze vergleicht symbolische Massepunkte bei gleichem Volumen; Punktzahlen sind keine Messwerte oder Teilchenzahlen.
- Spektralklassen O–B–A–F–G–K–M und Blau/Rot zeigen die Reihenfolge der Oberflächentemperaturen. Farben sind illustrative Annäherungen; Gesamtleuchtkraft und weitere Spektralklassen werden daraus nicht abgeleitet.
- Mondbilder und p/d-Hilfslinien beziehen sich auf die im Eintrag erläuterten nördlichen Breiten. Sie stellen keine aktuelle Mondphase oder tatsächliche Orientierung am gewählten Ort dar.
- Sternbildlinien und der Bogen zu Arktur/Spica sind vereinfachte Merkskizzen, keine maßstäblichen Sternkarten oder Helligkeitsskalen. IAU-Karten sind bei Sirius, Regulus und Beteigeuze verlinkt. Polaris steht im Bild leicht neben dem Zentrum der symbolischen Sternspuren, da der Stern nur nahe am Himmelsnordpol liegt.
- Lichtjahr, Proxima-Lichtweg und Sonnenlicht zeigen die jeweils im Eintrag genannten gerundeten Größen, keine räumlichen Maßstäbe. Die Sonnen-Zeitleiste endet beim heutigen Alter von rund 4,6 Milliarden Jahren und behauptet keine gesamte Lebensdauer. Die Fusion zeigt lediglich den stark vereinfachten Nettoschritt von vier Wasserstoffkernen zu einem Heliumkern mit Energiefreisetzung; Zwischenreaktionen und weitere Teilchen sind ausgelassen.

## Tagesübersicht: Auswahl und Beobachtungstipps

Die Übersicht verwendet bestehende astronomische Modelle. Der lokale Kalendertag kommt aus localDayBounds mit der IANA-Zone des gewählten Ortes und kann bei Zeitumstellungen 23 oder 25 Stunden dauern. Die Tagesmitte liefert das Referenzdatum für Mondphase und Begegnungssuche; sie ist kein neuer astronomischer Ereigniszeitpunkt. Kalendereinträge ohne Uhrzeit bleiben ihrem konfigurierten Datum zugeordnet. Relative Tagesabstände werden aus YYYY-MM-DD-Schlüsseln in UTC berechnet, nicht durch Division lokaler Mitternachtsabstände durch 24 Stunden.

Für Planetentipps werden die geozentrischen J2000-Vektoren wie in der Horizontkachel präzediert und in Höhen/Azimute umgerechnet. Die Sonne muss höchstens −6°, der Planet mindestens 10° hoch stehen. Stichproben alle 20 Minuten suchen die höchste geeignete Position des lokalen Tages; mindestens zwei geeignete Stichproben sind erforderlich. Ausgewählte Zeit und Winkel sind Näherungen. Der Winkel erhält den vorhandenen Finger-/Handvergleich. Wetter, Gelände und tatsächliche Helligkeitserkennbarkeit werden nicht modelliert.

Das korrigierte Konjunktionsmodell liefert engste Begegnungen bis 30 Tage voraus. Meteoraktivität folgt den konfigurierten MM-DD-Fenstern, einschließlich Jahreswechsel. Jährliche Maxima sind Richtdaten; datierte Kalendereinträge haben im Umkreis von zwei Tagen Vorrang. Bei mindestens 70 % Mondbeleuchtung ergänzt die Übersicht einen Hinweis auf störendes Mondlicht, ohne einen aktiven Strom auszublenden oder eine aktuelle Mondhöhe/Radiantensichtbarkeit zu behaupten. Aktivitätsanfang und -ende sind inklusive. Mindestens ein Platz ist für den bestbewerteten aktiven Strom reserviert; bei mehreren aktiven Strömen entscheidet die Nähe zum Maximum. Am Maximum gilt die höchste Meteorpriorität. Datierte Kalender-Maxima werden in den Stream-Hinweis integriert, sodass keine doppelten Einträge entstehen. Hinweise rund um Neu-/Vollmond gelten bei höchstens 0,035 Phasenzyklen Abstand und heißen deshalb ausdrücklich „rund um“ die Phase.

Die Auswahl nutzt die Gewichte und Themengrenzen in daily-highlights-config.js. Sie ist deterministisch und zeigt höchstens fünf Hinweise ohne künstliche Mindestzahl. Kalenderereignisse enthalten die vorhandenen Regionalangaben; bei Finsternissen wird die vorhandene örtliche Einordnung ergänzt. Datierte Planetenereignisse und passende berechnete Minima im Abstand von höchstens zwei Tagen werden zu einem Hinweis zusammengeführt, wobei das Datum des engsten Abstands ausdrücklich erhalten bleibt. Außerhalb des Planetenmodells 1800–2050 werden Planetenempfehlungen und Begegnungsprognosen nicht ausgewählt.

Im Sonnensystem wird die schematische Nachtseite der gemeinsamen Erdgrafik ausgeblendet. Für die Richtung gilt `β = atan2(y, x) · 180 / π`; `x` und `y` sind die bereits berechneten heliozentrischen Ekliptik-Koordinaten der Erde. Die Kontinente dienen der Illustration, nicht der Bestimmung des Subsolarpunkts. Der Mond wird im Sonnensystem nicht angezeigt. Die schematische Position ist `x_Bild = Mitte + Breite · r_Konfiguration · cos(β)` und `y_Bild = Mitte + Breite · r_Konfiguration · sin(β)`. Die festen Radien aus `js/data/solar-system-config.js` entzerren die inneren Planeten; sie kodieren keine Entfernungen.

### Meteor-Jahreskreis und Radianten

`js/cards/meteor-streams.js` enthält die bisherige Kalenderkreis- und Radiantendarstellung als eigenen Controller. Start, Ende und Maximum werden mit denselben lokalen Jahrestag-Helfern auf den Jahreskreis abgebildet. Aktivitätsfenster schließen beide Grenzen ein und dürfen den Jahreswechsel überqueren. Der nächste jährliche Gipfel wird anhand des bisherigen Tagesabstands gewählt. Die Kreisposition ist ein Kalenderdatum, keine Himmelsrichtung; die Radianten daneben bleiben schematische Richtungsangaben aus der Konfiguration. Eine aktiv markierte Periode ist keine Vorhersage beobachtbarer Meteorenzahlen. Die separate Auswahl und Maximum-Priorität in „Heute faszinierend“ bleiben im bereits getrennten Tagesübersichtsmodell. Die Auslagerung verändert diese Regeln oder ihre Genauigkeitsgrenzen nicht.

### Baryzentrum des Sonnensystems

`js/models/barycenter-model.js` erhält die J2000-Positionen aus `js/models/planet-model.js` und die bisherigen ungefähren Massenverhältnisse aus `js/data/barycenter-config.js`. Die Sonnenmasse ist dabei die Einheit 1. Für die im Vergleichsmodus ausgewählten Planeten mit Massenverhältnis μᵢ und heliozentrischem Ortsvektor rᵢ gilt:

`r_B = Σ(μᵢ · rᵢ) / (1 + Σ μᵢ)`

`solarBarycenter(date,mode)` berechnet diesen Vektor relativ zum Sonnenmittelpunkt in drei Dimensionen. `sunOffsetFromBarycenter(date,mode)` negiert ihn: Im Bezugssystem des Baryzentrums befindet sich der Sonnenmittelpunkt bei `−r_B`. Die dreidimensionale Länge wird in der Zusammenfassung durch den bisherigen Sonnenradius `0.00465047 AU` geteilt; die Grafik zeigt die x-/y-Draufsicht.

Die Modi berücksichtigen Jupiter, Jupiter und Saturn oder alle acht Planeten. Auch der Nenner enthält jeweils nur die ausgewählten Planeten plus die Sonne. Die Rangfolge der Hauptverursacher verwendet wie bisher `μᵢ · |rᵢ|`; sie ist keine Prozentaufteilung des resultierenden, teilweise gegenseitig aufgehobenen Vektors.

`barycenterTrail(date,9125,30,mode)` berechnet die Sonnenversatz-Spur über jeweils 9125 Tage vor und nach dem gewählten Zeitpunkt in 30-Tage-Schritten. Das sind 609 Stützpunkte über ungefähr 50 Jahre. `js/cards/barycenter.js` zeichnet diese Punkte, den Sonnenradius und das feste Baryzentrum. Der gemeinsame Zeitpunkt wird global vorgegeben, der Einflussmodus bleibt lokal.

Die Näherung nutzt dieselben vereinfachten Bahnelemente und konstanten Massenverhältnisse wie zuvor. Sie enthält keine gegenseitigen gravitativen Störungen, Monde oder relativistischen Korrekturen und ist eine didaktische Darstellung, keine präzise Ephemeride.

### Lagrange-Punkte: schematische Sonne-Erde-Geometrie

`js/models/lagrange-model.js` enthält `calculateScene(date)`. Die Erdposition dreht sich wie bisher mit der vorhandenen Sonnenlänge: `f = (λ_Sonne / 360° + 0.5) mod 1`. Auf einem Kreis mit Radius 128 Zeicheneinheiten werden Erde und die beiden um ±60° versetzten Punkte L4/L5 platziert. Sonne, Erde und L4 beziehungsweise L5 bilden damit gleichseitige Dreiecke. L3 liegt der Erde gegenüber.

L1 und L2 liegen auf der Sonne-Erde-Richtung jeweils 18 Zeicheneinheiten vor und hinter der Erde. Dieser Abstand ist zum Erkennen vergrößert; er ist keine aus den Massen errechnete Position. `js/cards/lagrange.js` ergänzt die bisherigen Marker, JWST-Skizze und Erläuterungen. Es handelt sich weiterhin um eine didaktische Geometrie, nicht um eine integrierte Dreikörperbahn.

### Analemma: Jahresabtastung vorhandener Sonnenformeln

`js/models/analemma-model.js` enthält `sampleYear(date,location)`. Für jeden Kalendertag des gewählten Jahres werden Zeitversatz und Sonnenhöhe mit den bereits vorhandenen Näherungen aus `js/models/solar-visibility-model.js` berechnet. Das Jahr besitzt 365 oder 366 Stützwerte; die bisherige lokale Tageszählung bleibt unverändert. `js/cards/analemma.js` zeichnet Zeitversatz auf der horizontalen und Sonnenhöhe auf der vertikalen Achse und hebt den ausgewählten Tag hervor.

Für den bisherigen lokalen Tagesindex n und die Jahreslänge N gilt:

`δ ≈ 23.44° · sin(2π · (n − 80) / N)`

`B = 2π · (n − 81) / 364`

`E ≈ 9.87 · sin(2B) − 7.53 · cos(B) − 1.5 · sin(B)`

E ist die verwendete Zeitgleichungsnäherung in Minuten. Aus geografischer Länge λ wird der bisherige vereinfachte Standardmeridian `λ₀ = round(λ / 15°) · 15°` gebildet. Der horizontale Anzeigewert ist `Δt = E + 4 · (λ − λ₀)` in Minuten. Das Modell ersetzt damit keine genaue gesetzliche Zeitzonen-/Sommerzeitumrechnung des Beobachtungsorts.

Mit geografischer Breite φ und dem Stundenwinkel `H = Δt / 4` in Grad berechnet die vorhandene Höhenfunktion:

`h = asin(sin φ · sin δ + cos φ · cos δ · cos H)`

Die Winkelfunktionen verwenden im Code Bogenmaß; die Ausgabe erfolgt in Grad. Die Auslagerung verändert weder diese Formeln noch ihre bisherigen Näherungen.

### Exoplaneten: Kepler-Näherung und eigene Systemmaßstäbe

`js/models/exoplanets-model.js` enthält die unveränderte Periodennäherung `T = 365.25 · sqrt(a³ / M)` in Tagen, mit Halbachse a in AU und Sternmasse M in Sonnenmassen. Ungültige beziehungsweise nicht positive Werte verwenden wie bisher `a = 0.01` und `M = 1`. Für die schematische Phase gilt:

`θ = normalizeDeg((JD − 2451545) / T · 360° + 31° · Systemindex + 57° · Planetenindex)`

Die Indexanteile verteilen die Marker für eine lesbare Darstellung. Sie sind keine gemessenen Bahnphasen. Die Zeichnung verwendet je System den bisherigen Radius `r = 16 + (a / a_max) · (78 − 16)` und den Mittelpunkt `(110,110)`. Eine ungültige äußere Referenzbahn verwendet wie bisher `a_max = 1`. `js/cards/exoplanets.js` zeichnet daraus Kreise, Marker und Namen. Verschiedene Systemfelder besitzen eigene Maßstäbe; die Darstellung ist keine präzise Exoplaneten-Ephemeride.

### Satelliten: mittlere Perioden und schematische Ellipsen

`js/models/satellites-model.js` verwendet die konfigurierten Epochen, mittleren Umlaufzeiten P in Minuten und Startphasen p₀ aus `js/data/phenomena-config.js`. Mit der Zeitdifferenz Δt in Minuten gilt `p = ((p₀ + Δt / P) mod 1 + 1) mod 1` und `θ = 2πp`. Die doppelte Modulo-Normalisierung erhält auch vor der Epoche eine Phase von 0 bis unter 1.

Die Ellipsenradien sind weiterhin Zeichnungswerte. Bei Standardlayout gilt `r = 34 + 28 + 18 · Index`, `r_x = min(165,r)` und `r_y = max(20, |r · max(0.2,cos i)|)` mit konfigurierter Inklination i. Die Höhe in Kilometern wird in den Details ausgegeben; sie bestimmt hier nicht den Zeichenradius. Der Ellipsenpunkt `(r_x cos θ, r_y sin θ)` wird mit dem konfigurierten RAAN-Winkel gedreht und auf den Mittelpunkt `(210,210)` verschoben.

`js/cards/satellites.js` zeichnet diese Punkte und die bisherigen Details. Die Positionen sind schematische mittlere Umläufe, keine aus aktuellen TLE-Daten propagierten Bahnen und keine Vorhersage sichtbarer Überflüge. Die Auslagerung verändert weder Konfiguration noch Formeln.
