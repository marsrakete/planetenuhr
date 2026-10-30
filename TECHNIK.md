# Technik der Planetenuhr

Diese Datei beschreibt Aufbau, Entwicklung und Pflege der App. [Zur Übersicht im README](README.md) · [Zu den Berechnungen](BERECHNUNGEN.md)

Der [Modularisierungsplan](MODULARISIERUNGSPLAN.md) hält die abgeschlossene Trennung von Rechenmodellen, Steuerung, Kacheln und Layout sowie deren Prüfungen fest.

## Projektstruktur

- `js/data/mnemonics-config.js`: 31 geprüfte Inhalte mit stabilen IDs, Kategorien, Originalsprache, deutschen/englischen/französischen Texten und Quellen; Stand 19. Oktober 2026.
- `js/cards/sky-knowledge.js`, `css/cards/sky-knowledge.css`: Controller und Darstellung der Kachel „Himmelswissen“.
- `js/data/sky-knowledge-graphics-config.js`, `js/shared/sky-knowledge-graphics.js`: lokalisierte Bildunterschriften und deklarative SVG-Szenen sowie deren Template-Renderer.


- `js/shared/diagram-details.js`, `css/shared/diagram-details.css`: lesbare, statische SVG-Detailansichten für Kacheln mit kleinen Diagrammbeschriftungen.

- `index.html`, `css/base/styles.css`
  Seitenstruktur und Vorlagen beziehungsweise Darstellung
- `css/base/`
  Globale Grund- und Layoutstile
- `css/cards/`
  Kachelspezifische Stile
- `css/shared/`
  Wiederverwendbare UI- und Grafikstile
- `js/core/`
  App-Initialisierung, globale Steuerung, Datum/Ort, Layout, Hilfe und gemeinsame UI-Abläufe
- `js/data/`
  Übersetzungen sowie statische Konfigurationen, Ephemeriden und Kalenderdaten
- `js/cards/`
  Controller und Darstellung der einzelnen Kacheln
- `js/models/`
  Astronomische Berechnungen und Datenmodelle, getrennt von der DOM-Darstellung
- `js/shared/`
  Wiederverwendbare Grafiken, Diagramm- und Darstellungshelfer
- `js/services/`
  Datenzugriff für externe Dienste
- `index.html`
  Lädt die klassischen Skripte in Abhängigkeitsreihenfolge; die Ordnerstruktur ändert die Ladefolge nicht.
- `js/core/app.js`
  Verbindet die Module, richtet gemeinsame Hilfsfunktionen ein und startet die App
- `js/core/dashboard-context.js`, `js/core/dashboard-refresh.js`
  Ein Eigentümer für Tagesoffset und Stadt, ein Snapshot je globalem Renderlauf und eine geordnete Liste der datumsabhängigen Verbraucher
- `js/core/date-location-controls.js`
  Globale Datums-/Orts-/Uhrzeitbedienung mit einmaliger Verdrahtung, Tages- und Uhrzeitregler sowie gegenseitig ausschließenden Zeitraffern
- `js/cards/exoplanets.js`, `js/models/exoplanets-model.js`
  Exoplaneten-Vergleich mit getrennten Kepler-/Phasenberechnungen und je System normierten Mini-Karten
- `js/cards/satellites.js`, `js/models/satellites-model.js`
  Satellitenkarte mit getrennten schematischen Epochen-/Ellipsenberechnungen und vorlagenbasierter Zusammenfassung
- `js/cards/small-bodies.js`, `js/models/small-bodies-model.js`
  Kleinkörperkarte mit DOM-freier Distanz-/Ellipsengeometrie und lokaler Detailanzeige; Daten bleiben in `js/data/small-bodies-config.js`
- `js/cards/spacecraft.js`, `js/models/spacecraft-model.js`
  Raumsondenkarte mit DOM-freier logarithmischer Distanz- und Labelgeometrie; Missionsdaten bleiben in `js/data/phenomena-config.js`
- `js/data/aurora-data-config.js`, `js/services/aurora-data.js`, `js/cards/aurora-card.js`
  NOAA-Endpunkte und Cachezeit konfiguriert; Kp-Zugriff und lokalisierte Aurora-Anzeige getrennt
- `js/services/bsky-feed-data.js`, `js/cards/bsky-feed-card.js`
  Öffentliche Bluesky-Feeds, Bildauswahl und Tages-Fallback getrennt vom Karten-Rendering
- `js/cards/lagrange.js`, `js/models/lagrange-model.js`
  Lagrange-Controller und reine schematische Sonne-Erde-Geometrie
- `js/cards/analemma.js`, `js/models/analemma-model.js`
  Analemma-Controller mit explizitem Datum/Ort und reine Jahresaggregation der vorhandenen Sonnenformeln
- `js/cards/inner-planets.js`, `js/models/inner-planets-model.js`
  Controller und reines Modell der Merkur-/Venus-Phasen, Terminator aus einem SVG-Template
- `js/cards/barycenter.js`, `js/models/barycenter-model.js`, `js/data/barycenter-config.js`
  Baryzentrum mit eigener Vergleichsauswahl und einmaligen Buttonlistenern; Berechnung und Massen-/Radiusdaten getrennt
- `js/cards/seasons.js`, `js/cards/retrograde.js`, `js/models/retrograde-model.js`
  Jahreszeiten- und Retrograd-Controller mit gemeinsamem Datumskontext; Retrograd-Berechnung als eigenständiges DOM-freies Modell
- `js/cards/constellation-month.js`, `js/cards/constellation-year.js`
  Eigenständige Controller für Monatssternkarte mit Richtungshinweis und Jahresuhr mit Monatsminiaturen; verwenden den gemeinsamen Kontext und die bestehenden Sternbilddaten
- `js/cards/milky-way.js`, `js/models/milky-way-sky-model.js`
  Galaxienkarte und zeit-/ortsabhängige Himmelskuppel; das Rechenmodell bleibt DOM-frei und wird bei globalen Änderungen sowie minütlich aktualisiert
- `js/cards/conjunctions.js`, `js/cards/meteor-streams.js`
  Eigenständige Controller für Begegnungszeitachse und Meteor-Jahreskreis/Radianten; verwenden den gemeinsamen Datumskontext und die bisherigen Modelle, Daten und Beschriftungshelfer
- `js/data/card-sizes-config.js`, `js/core/card-sizes.js`
  Unveränderte Größenstufen und Standards, bisheriger Speicherschlüssel sowie einmalige Einzel-/Gesamtsteuerung der Kachelgrößen
- `js/core/card-help.js`, `js/core/card-navigation.js`
  Vorlagenbasierte Hilfe mit nachladbarer Formeldarstellung sowie Kachelanker, Deep Links und Fokusnavigation
- `js/cards/earth-moon.js`
  Datumsgebundene Mondansichten und lokaler Kompass sowie eine getrennte schematische Umlaufanimation mit genau einem ausstehenden Animationsframe
- `js/core/dashboard-layout.js`
  Ein Eigentümer für Rastermessung, Desktop-Größenbeobachtung, gebündelte Layoutläufe und Scrollanker; Initialisierung erfolgt einmal
- `js/cards/solar-system.js`
  Sonnensystem-Controller mit injizierten Modellen und Grafiken; aktualisiert vorhandene Templates aus dem gemeinsamen Kontext
- `js/models/solar-visibility-model.js`
  Sonnenereignisse, Sonnenkoordinaten, saisonale Näherungen und schematische nächtliche Sichtbarkeit; Datum, Ort und Elongation werden ausdrücklich übergeben
- `js/models/eclipse-model.js`, `js/models/eclipse-location-model.js`
  Getrennte Näherungen für Mondknoten/Saisons und Zuordnung kuratierter Sichtbarkeit, regionaler Zeitprofile und Ortszeiten; Sprache und Vorschau-Darstellung verbleiben bei den Aufrufern
- `js/models/moon-model.js`
  DOM-freie mittlere Mondphase und nächster Vollmond mit gemeinsamen Modellkonstanten; beide Mondanzeigen erhalten denselben ausgewählten Zeitpunkt aus dem Dashboard-Kontext
- `js/data/planet-elements-config.js`, `js/models/planet-model.js`
  Unveränderte J2000-Bahnelemente und DOM-freie Kepler-, Sonnen- und Erdvektoren; das Modell benötigt Koordinatenhelfer und Elementkonfiguration vor seiner Initialisierung
- `js/models/astronomy-coordinates.js`
  DOM-freie gemeinsame Julian-Datum-, Winkel-, Sternzeit- und Koordinatentransformationen
- `js/core/date-time.js`, `js/core/observation-format.js`
  Wiederverwendbare Datum-, Zeitzonen-, Kompass- und Winkelhilfen mit ausdrücklich übergebener Sprache und Zeitzone
- `js/cards/astronomy-explorer.js`, `css/cards/astronomy-explorer.css`
  Horizontpanorama und interaktive Lichtreise; verwenden die gemeinsamen Datums-, Orts- und Kachelgrößen-Einstellungen
- `js/data/astronomy-explorer-config.js`, `js/models/astronomy-explorer-model.js`
  Physikalische Konstanten, Planetenlisten, Umrechnung von J2000 in mittlere Äquatorkoordinaten des Datums sowie Lichtlaufzeiten
- `js/data/translations.js`\
  UI-Texte in Englisch, Deutsch und Französisch
- `js/data/card-help-config.js`\
  Inhalte für die `?`-Popups jeder Kachel
- `js/data/calendar-events.js`\
  kuratierte Himmelskalender-Ereignisse
- `js/models/calendar-model.js`\
  Sprachwahl, Ereignisschlüssel, chronologische Sortierung, Kategorie-/Vergangenheitsfilter und Gruppierung für die Monatsansicht; das Modell kennt weder DOM noch Anzeigezustand
- `js/cards/calendar.js`\
  Kalenderzustand, Filter-/Ansichtswechsel, Monats- und Listenansicht, Detaildialog, ICS-Downloads und einmalige Listener-Verdrahtung; Daten-, Datum-, Übersetzungs- und Template-Helfer werden beim Erstellen injiziert
- `js/data/eclipse-calendar-config.js`, `js/data/extended-calendar-config.js`\
  automatisch ergänzte Finsternis- und wiederkehrende Kalenderereignisse
- `calendar-sources.json`\
  zentrale Quellenliste für den Himmelskalender mit Prüfintervallen und Abdeckungszielen
- `js/data/phenomena-config.js`\
  Konfiguration für Meteorströme, Sternbilder, Raumsonden und weitere Phänomene
- `js/data/small-bodies-config.js`\
  Kleinkörper, Kometen und Gürtel für die entsprechende Kachel
- `js/data/bsky-feed-config.js`\
  konfigurierbare Bluesky-Accounts für die Bild-Feed-Kachel
- `scripts/generate-ics.js`\
  erzeugt ICS-Dateien aus dem zusammengeführten Himmelskalender
- `scripts/check-calendar-sources.js`\
  prüft Quellenliste, Pflegefälligkeiten, Kalenderabdeckung und optional die Erreichbarkeit der Quellen-URLs
- `ics/`\
  automatisch erzeugte Kalenderdateien pro Sprache und Kategorie
- `image_og.jpg`, `favicon.svg`\
  Social Preview und Favicon

## Architektur und Render-Zyklus

Die statische App verwendet `index.html` für Struktur und Templates, externe Stylesheets für die Darstellung und klassisch geladene JavaScript-Dateien unter `js/`. Die Ordner teilen die Zuständigkeiten nach Core, Kacheln, Modellen, Daten, gemeinsamen UI-Helfern und externen Datenservices. `index.html` ist die maßgebliche Ladefolge; Änderungen an Pfaden müssen deshalb dort, im Build und in Tests synchronisiert werden. `js/core/app.js` verdrahtet die Komponenten.

### Zentrale Zustände

Die wichtigsten globalen Zustände sind:

- `dashboardContext.getDayOffset()`\
  liest den zentral verwalteten Tagesoffset relativ zu `Date.now()`
- `dashboardContext.getTimeOfDayMinutes()`\
  liest die ausgewählte Uhrzeit in der Ortszeitzone; `setTimeOfDayMinutes()` setzt sie, `advanceTimeByMinutes()` führt den gemeinsamen Zeitpunkt fort
- `dashboardContext.getLocationKey()`\
  liest den zentral verwalteten Schlüssel der gewählten Stadt
- Sprachzustand über `lang` und `js/data/translations.js`

`dashboardContext.getDate()` und `dashboardContext.getLocation()` lesen die ausgewählte Zeit und den ausgewählten Ort. `getDayOffset()` und `getLocationKey()` stellen die stabilen Steuerungswerte bereit.

### Datums- und Ortsfluss

Das Overlay `Datum & Ort` verändert nicht direkt jede Kachel einzeln. Stattdessen aktualisiert es den globalen Zustand und stößt danach einen gemeinsamen Refresh an.

Wichtige Stellen:

- `js/core/app.js`\
  `refreshDateDrivenTiles(reason)` delegiert an die geordnete Registrierung in `createDashboardRefresh()`.
- `js/core/app.js`\
  Verbindet die Steuerung mit der geordneten Refresh-Registrierung.

`js/core/dashboard-context.js` bildet pro globalem Aktualisierungslauf einen Snapshot aus Zeitpunkt, Ort, Ortszeitzone und Sprache. Alle registrierten Renderer erhalten denselben Snapshot. Tagesoffset und ausgewählte Ortsuhrzeit werden gemeinsam in den globalen Zeitpunkt aufgelöst. Der Uhrzeit-Zeitraffer schreitet mit einer Stunde pro Sekunde fort und erhöht beim Ortsmitternacht-Wechsel den Tagesoffset. Tag- und Uhrzeit-Zeitraffer laufen nie parallel; Start des einen stoppt den anderen. `js/core/dashboard-refresh.js` startet keine Timer. Die halbstündliche Aktualisierung bleibt in der Initialisierung; Zeitraffer und Gedrückthalten gehören dem Datumscontroller. Seine `wire()`-Methode verdrahtet die Elemente einmal.

Die Registrierung vermerkt globale Trigger `date`, `location`, `refresh` und `size`. Sprache wird beim URL-Start festgelegt; lokale Viewport-Beobachter bleiben bei ihren Kachel-Controllern. Die Controller erzeugen keine globalen Timer. Lokale Kachelregler und Speicherformate bleiben erhalten.

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
- `seasonsController.render(context)` aus `js/cards/seasons.js`
- `retrogradeController.render(context)` aus `js/cards/retrograde.js`
- `innerPlanetsController.render(context)` aus `js/cards/inner-planets.js`
- `lagrangeController.render(context)` aus `js/cards/lagrange.js`
- `analemmaController.render(context)` aus `js/cards/analemma.js`
- `renderVisibility(...)`
- `renderNightVisibility(...)`
- `renderSmallBodies()`
- `exoplanetsController.render(context)` aus `js/cards/exoplanets.js`
- `satellitesController.render(context)` aus `js/cards/satellites.js`
- `renderSpacecraft()`

Die App verwendet weiterhin Vanilla JavaScript. `js/core/app.js` setzt die eigenständigen Kachel-Controller und Rechenmodelle zusammen; die zentrale Refresh-Registrierung übergibt ihnen denselben Auswahlkontext. Die einzelnen Kachel-Renderer liegen in `js/cards/`, reine Berechnungen in `js/models/`.

### Konfiguration vs. Berechnung

Die App trennt sichtbare Inhalte von Berechnungslogik:

- `js/data/translations.js`\
  UI-Texte
- `js/data/card-help-config.js`\
  Inhalte der `?`-Popups
- `js/data/calendar-events.js`\
  kuratierte Ereignisse
- `js/data/phenomena-config.js`\
  Meteorströme, Raumsonden, Sternbilder und weitere Phänomene
- `js/data/small-bodies-config.js`\
  Kometen und Gürtel
- `js/data/bsky-feed-config.js`\
  Bluesky-Feed-Konten

Mathematische Verarbeitung liegt in `js/models/`, kachelspezifische Darstellung in `js/cards/`; gemeinsam verwendete Visualisierungen liegen in `js/shared/`.

### Dynamische Aktualisierung

Nicht alles hängt nur am manuellen Datumswechsel. Es gibt zusätzlich laufende oder periodische Updates:

- `js/core/app.js`\
  `refreshDynamicTiles()`
- `js/services/aurora-data.js` und `js/services/bsky-feed-data.js`\
  Externe Abrufe und Datenaufbereitung; ein Wechsel von Datum oder Ort startet diese Abrufe nicht erneut.
- `js/cards/aurora-card.js` und `js/cards/bsky-feed-card.js`\
  Status, Übersetzungen und Inhalte der beiden Karten; aktualisieren nur ihre vorhandenen Kartenelemente.
- `js/core/app.js`\
  halbstündlicher Refresh für zeitabhängige Kacheln

So bleiben Tageslicht, Kalenderbezüge und Feed-Inhalte nicht auf dem Stand des Seitenladens stehen. Die frühere, unsichtbare Zeitwerkzeug-Kachel wurde entfernt; es gibt keinen Sekunden-Timer für sie.

### Layout und Reflow

Nach vielen Render-Vorgängen wird das Kartenlayout erneut organisiert:

- `js/core/app.js`\
  `scheduleMasonryLayout(...)`

Diese Funktion wird nach zahlreichen Kachel-Updates erneut aufgerufen, damit unterschiedlich hohe Karten im Grid sinnvoll neu einsortiert werden.

Die Kachel-Größenbeobachtung ist nur oberhalb von 760 Pixeln aktiv. In der mobilen Ansicht fließen die Karten über CSS untereinander; beim Wechsel dorthin wird der `ResizeObserver` getrennt und beim Wechsel zurück wieder verbunden. Unveränderte Größenmeldungen lösen keinen neuen Layoutdurchlauf aus; tatsächliche Änderungen werden über `requestAnimationFrame` gebündelt. Im Observer-Callback werden keine Layout-Attribute verändert. Die beiden exakten Browsermeldungen `ResizeObserver loop completed with undelivered notifications.` und `ResizeObserver loop limit exceeded` bleiben Konsolenwarnungen ohne blockierenden Dialog. Andere JavaScript-Fehler behalten ihre bisherige Anzeige. Regressionen deckt `npm run test:explorer` ab; WebKit- und Chromium-Browserprüfungen ergänzen die Tests.

### Lokale Aktualisierung der Astronomie-Kacheln

Auch die eigenen SVG-Größenbeobachter in `js/cards/astronomy-explorer.js` und `js/cards/idefix.js` führen Zeichenänderungen erst im nächsten `requestAnimationFrame` aus. Mehrere Meldungen werden gebündelt. Insbesondere IDEFIX ändert `viewBox`, Schriftgröße und Beschriftungsposition nur bei tatsächlich veränderter Breite. Dadurch ändern die SVGs während einer ResizeObserver-Auslieferung nicht ihre eigenen Abmessungen.

Lokale Auswahlen behalten ihre Buttons, Regler und SVG-Markierungen im DOM. Die Planetenauswahl ändert nur Hervorhebung, Beschriftung und Detailtext; der Lichtreise-Regler verwendet bereits berechnete Reisedaten. Nur bei Zeit-, Datums- oder Ortsänderungen werden die betreffenden Positionen neu berechnet. Höhenänderungen einer Kachel werden lokal übernommen. Auch bei einer vollständigen Rasterberechnung bleiben die bisherigen Höhenbelegungen während der Messung bestehen, damit die Seite nicht vorübergehend zusammenfällt und die Scrollposition verliert.

Das Horizontpanorama beschriftet alle sieben Planeten direkt mit ihren lokalisierten Namen. `labelPosition` misst die tatsächlichen SVG-Textgrenzen und sucht zuerst oberhalb, dann unterhalb des Punktes nach Platz. Weitere vertikale Abstände werden nur bei Kollisionen mit Namen oder Planetenpunkten genutzt. Namen bleiben innerhalb der Grafik und werden bei Platzmangel nicht ausgeblendet. Es werden keine Verbindungslinien gezeichnet; die Auswahl erhält bei der Platzvergabe Vorrang.

Die Jahresuhr der Sternbilder behält ihre ViewBox von 760 × 760 Einheiten. Ihre zwölf Miniaturen werden aus SVG-Templates aufgebaut und mit `scale(2)` einschließlich Sternpunkten und Verbindungslinien auf den doppelten Durchmesser (128 Einheiten) gebracht. Die Mittelpunkte liegen auf Radius 270, der Monatsring auf Radius 176; so passen die Miniaturen mit Abstand nebeneinander und außerhalb der Monatsringe. Lange Sternbildnamen werden anhand ihrer tatsächlichen SVG-Textgrenzen innerhalb des Bildrands gehalten.

Die Tagessegmente werden pro Ort, Zeitzone und lokalem Datum zwischengespeichert. Beim Erkunden innerhalb desselben Tages bleiben Zeitband, SVG-Markierungen und Bedienelemente bestehen; nur Lichtzustand, Zeiger und Positionen werden aktualisiert.

## Einheitliche Typografie und SVG-Details

`js/shared/meteor-labels.js` ergänzt den Meteor-Jahreskreis um außen liegende SVG-Callouts aus `meteorStreamLabelTemplate`. Der Ringradius beträgt 100 statt 150 Einheiten bei unveränderter ViewBox (420 × 420), damit die Mitte frei und Platz für Namen bleibt. Beschriftungen folgen der Winkelposition ihres Maximums; Nachbarn werden getrennt und Monatsbeschriftungen ausgespart. Lange zusammengesetzte Namen können an Leerzeichen oder Bindestrichen umbrechen. Gerade, ausdrücklich ungefüllte Linien übernehmen die Farben aus `js/data/phenomena-config.js`. Die Namen stehen in `js/data/translations.js`. Die Schriftgröße berücksichtigt die tatsächliche SVG-Skalierung und bleibt bei mindestens 12 CSS-Pixeln. Größenänderungen durch Viewport oder Kachelwahl werden nach einer Breitenprüfung im nächsten Animationsframe berücksichtigt; die Größe des SVG selbst wird dabei nicht verändert.

`js/shared/celestial-bodies.js` stellt über `PLANETENUHR_BODY_VISUALS.create(bodyKey, options)`, `mount(host, bodyKey, options)` und `update(svg, options)` gemeinsame SVG-Grafiken für alle acht Planeten und den Mond bereit. `js/data/celestial-bodies-config.js` ordnet die Schlüssel ihren HTML-Templates zu; `css/shared/celestial-bodies.css` enthält die gemeinsamen Oberflächen. Erde und Mond stammen aus den vorhandenen Templates `earthGlobeTemplate` und `moonGlobeTemplate`. Jede Instanz erhält eigene IDs samt angepassten Gradienten- und Clip-Referenzen. `js/shared/earth-moon-visuals.js` ist nur noch der Kacheladapter; `css/shared/earth-moon-visuals.css` enthält deren Layout. Datumsänderungen aktualisieren die vorhandenen Schattenpfade. Das vorhandene Mondmodell und die beschleunigte Umlaufanimation bleiben erhalten. Die größere Phasenansicht und die Draufsicht sind sichtbar und in der Hilfe getrennt erklärt.

Bedienflächen verwenden `--control-height`: mindestens 36px am Desktop und 44px bis 760px Breite. Wiederkehrende Auswahlgruppen nutzen `--control-gap` (8px). Die ?-Hilfe behält ihr kleines Symbol innerhalb einer 44px großen Trefferfläche. Kalenderfilter und Ansichtswechsel melden ihre Auswahl zusätzlich zur Farbmarkierung über `aria-pressed`; Tastaturfokus bleibt sichtbar. Bis 360px Breite stehen Datum/Ort und Datumsbuttons in zwei Zeilen, damit weder Text noch Trefferflächen eingeengt werden.

Sichtbare numerische Datumsangaben folgen mit `Intl.DateTimeFormat` der gewählten App-Sprache (Deutsch, Englisch oder Französisch). Die globale Datums- und Uhrzeitsteuerung sowie ortsabhängige Himmelsansichten verwenden die Zeitzone des ausgewählten Standorts; IDEFIX verwendet weiterhin Browserzeit. URL-Parameter (`YYYYMMDD` und `HHmm`) und interne Datumsschlüssel (`YYYY-MM-DD`) bleiben sprachunabhängig; dafür wird ausschließlich `formatDateKey` verwendet.

Die Schriftstufen stehen zentral in `css/base/styles.css` als CSS-Variablen. Komponenten verwenden diese Variablen statt eigener Zwischenwerte:

| Rolle | Variable | Größe bei 16px Wurzelschrift |
| --- | --- | --- |
| Kacheltitel | `--font-card-title` | 20px, bis 768px Viewport 18px |
| Zwischenüberschriften und Formulareingaben | `--font-subheading` | 16px |
| Lesetext | `--font-body` | 15px |
| Buttons | `--font-control` | 14px |
| Hinweise und Quellen | `--font-note` | 13px |
| Kompakte Beschriftungen | `--font-small` | 12px |
| Minimum in SVG-Detailansichten | `--font-diagram` | 12 CSS-Pixel |

Arial mit Sans-Serif-Fallback gilt auch für Formularelemente. Dekorative Uhrschriften, mathematische Formeln, große Messwerte und reine Werkzeug-Icons behalten ihre jeweiligen Aufgaben. Formulareingaben bleiben bei 16px; die globale Button-Stufe ist davon getrennt. Mobile und Desktop-Kacheln teilen dieselben Rollen. Zeilenhöhen folgen ebenfalls zentralen Rollen: `--line-heading` (1,25), `--line-body` (1,5), `--line-control` (1,35) und `--line-note` (1,45). Das gilt auch für dynamisch nachgeladene Bluesky-Beiträge, Finsternishinweise und Formel-Erläuterungen; mathematische Ausdrücke behalten ihre eigene Darstellung. Die erste Mondphasenbeschriftung wird linksbündig innerhalb der Zeitleiste gehalten, damit längere Übersetzungen nicht aus der Kachel ragen.

`js/shared/diagram-details.js` misst Textgrößen einschließlich der SVG-Transformationsmatrix. Enthält eine Kachel Beschriftungen unter 11,5 CSS-Pixeln, erhält sie einen lokalisierten „Grafik vergrößern“-Button aus einem HTML-Template. So bleibt die bestehende Übersicht kompakt. Ein natives `dialog` zeigt statische Kopien der aktuellen Grafiken; die Ansicht lässt sich per Tastatur oder Touch in beide Richtungen verschieben. SVG-Geometrie und astronomische Daten werden dafür nicht verändert. Die Vergrößerung berücksichtigt auch verschachtelte Transformationen und hält sichtbare Beschriftungen bei mindestens `--font-diagram`. Farben, Schriften und SVG-Paint-Referenzen werden aus dem aktuellen Zustand übernommen; IDs werden pro Kopie umbenannt, damit Farbverläufe und Filter nicht auf die Originalgrafik zurückgreifen. Beim Schließen werden die Kopien entfernt; die Kacheln behalten ihre Steuerelemente und ihren Zustand.

Neue Inhalte und Größenänderungen werden über einen gebündelten Mutation-/Resize-Durchlauf berücksichtigt. Die Detailansicht selbst wird nicht beobachtet. Die zusätzlichen Texte stehen in `js/data/translations.js`. Prüfung: `npm run test:typography` ergänzt die bestehenden Tests; Browserprüfungen kontrollieren tatsächliche Schriftgrößen, SVG-Skalierung, überlaufende Texte sowie Fokus und Scrollposition.

## Versionsprüfung und Releases

Die laufende App-Version steht fest im HTML-Metadatum `planetenuhr-version` (Start: `1.0`). `version.json` enthält den Serverstand als `{ "version": "1.0" }`. `js/core/app-updates.js` lädt diese Datei mit `cache: "no-store"`, einem zusätzlichen Zeitparameter und acht Sekunden Timeout. Es werden weder Service Worker noch IndexedDB oder weitere persistente Speicher angelegt.

Die Prüfung läuft beim Start, bei Fokus-/Sichtbarkeitswechsel und bei Rückkehr aus dem Back/Forward-Cache; automatische Wiederholungen werden auf einmal pro drei Minuten begrenzt. Bei wiederhergestellter Netzwerkverbindung und beim manuellen Prüfen kann sofort erneut geprüft werden. Automatische Fehler bleiben still, manuelle Fehler werden im Einstellungsmenü erklärt. Update-Status und beide Buttons stehen gemeinsam im Einstellungsmenü und werden aus einem Template erstellt und bei Statusänderungen beibehalten. Die Aktionszeile erlaubt auf schmalen Displays einen Umbruch.

„Jetzt aktualisieren“ navigiert ausdrücklich zu einer frischen HTML-Adresse mit temporären Update-Parametern; nach dem Laden werden diese entfernt. Die bestehenden Datums-, Orts-, Sprach- und Kachelparameter sowie der URL-Hash bleiben erhalten. Alle lokalen CSS- und JavaScript-Dateien sind mit `?v=<Version>` eingebunden, damit eine neue Version neue Asset-Adressen hat. Das gilt auch für die Update-Steuerung selbst. Externe Bibliotheken behalten ihre eigenen Versionsadressen.

Für ein Release müssen `version.json`, das HTML-Metadatum und alle lokalen CSS-/JS-Versionsparameter gemeinsam erhöht werden. `scripts/check-version.js` wird im Build ausgeführt und lehnt abweichende Angaben ab. App-Dateien und HTML müssen zusammen veröffentlicht werden; bei nicht atomarem Upload kommt `version.json` zuletzt. `npm run test:updates` prüft Vergleich, Fehlerfälle, Drosselung und Update-URLs. Der Versionsvergleich erkennt abweichende Releases, einschließlich bewusster Rücknahmen; es gibt keinen erzwungenen automatischen Reload.

## Code-Stil

- Lesbarkeit geht vor Verdichtung.
- Bei mehrstufiger UI- oder Geometrie-Logik werden klare `if / else if / else`-Blöcke bevorzugt.
- Keine Ternaries; stattdessen klare `if / else`-Blöcke.
- Kleine Konfigurations- oder Platzierungsregeln sollen so geschrieben sein, dass sie später ohne Rätselraten angepasst werden können.

## Start

Die App kann direkt geöffnet werden:

```text
index.html
```

Alternativ kann lokal ein einfacher PowerShell-Server genutzt werden:

```text
start-server.ps1
```

Das Script lauscht standardmäßig auf `http://localhost:5020/` für lokalen Zugriff am Rechner. Für Zugriff im Heimnetz kann es ausdrücklich mit `./start-server.ps1 -ListenAddress "+"` gestartet werden; dann bedient es auch `http://<LAN-IP>:5020/`. Mit `-Port` kann ein anderer Port gewählt werden. Nach einer Scriptänderung muss der laufende Server neu gestartet werden.

Für die optionale Bindung an alle Rechneradressen (`+`) benötigt Windows eine zusätzliche HTTP-URL-Berechtigung. Diese wird für den lokalen Standardstart nicht benötigt. Eine dauerhafte URL-Reservierung ist eine eigene Systemeinstellung und wird vom Script nicht automatisch angelegt. Falls gewünscht, kann sie einmalig in einer PowerShell mit Administratorrechten für das eigene Benutzerkonto eingerichtet werden:

```powershell
netsh http add urlacl url=http://+:5020/ user="$env:USERDOMAIN\$env:USERNAME" listen=yes delegate=no
```

Anschließend kann das Script ohne Administratorrechte laufen. Andere Geräte müssen den Rechner über das Netzwerk erreichen können; ein Test vom selben Rechner prüft die HTTP-Bindung, nicht eine mögliche eingehende Firewall-Sperre. Der Server lehnt versteckte Metadaten und Pfade außerhalb des Projektordners ab. Startfehler brechen das Script ab.

## Build und Encoding-Schutz

Auch wenn die App statisch ist, gibt es jetzt einen regulären Build-Prüfschritt:

```text
npm run validate:repo
```

Vor jedem Build wird automatisch geprüft, ob verdächtige UTF-8- oder Mojibake-Artefakte im Repository enthalten sind.
Der Build erzeugt die ICS-Dateien nicht automatisch, sondern prüft nur noch, ob die vorhandenen Dateien im Ordner `ics/` vollständig und aktuell sind.

## Empfohlener Kalender-Ablauf

Die Kalenderpflege ist bewusst in drei getrennte Schritte aufgeteilt:

1. `review:calendar-sources`\
   Prüft, ob die gepflegten Quellen und Reichweitenziele noch plausibel aktuell sind.
2. Config-Dateien anpassen\
   Nur wenn sich daraus echte Änderungen ergeben, werden `js/data/calendar-events.js`, `js/data/eclipse-calendar-config.js`, `js/data/extended-calendar-config.js` oder verwandte Kalender-Configs gepflegt.
3. `generate:calendar-artifacts`\
   Erzeugt danach die abgeleiteten ICS-Dateien neu.
4. `validate:repo`\
   Prüft abschließend, dass Encoding, statische Dateien und ICS-Artefakte konsistent sind.

Kurz gesagt:

```text
Quellen prüfen -> Config pflegen -> ICS neu erzeugen -> Repository validieren
```

Zusätzlich stehen diese Kommandos bereit:

```text
npm run check:encoding
npm run check:calendar-sources
npm run check:ics
npm run repair:encoding
npm run build:ics
npm run review:calendar-sources
npm run review:calendar-sources:strict
npm run generate:calendar-artifacts
npm run validate:calendar-artifacts
npm run refresh:calendar-artifacts
npm run validate:repo
```

- `check:encoding` bricht mit Fehler ab, wenn verdächtige Encoding-Artefakte gefunden werden.
- `check:calendar-sources` listet die Himmelskalender-Quellen, berechnet nächste Prüftermine und kontrolliert die Kalenderabdeckung bis Ende 2040.
- `check:ics` prüft, ob die erzeugten ICS-Dateien vorhanden sind und inhaltlich zum aktuellen Kalenderstand passen.
- `repair:encoding` führt die bekannte Mojibake-Reparatur auf Textdateien im Repository aus.
- `build:ics` lädt dieselben Kalenderquellen wie die App und schreibt die ICS-Dateien für `de`, `en` und `fr` sowie je Kategorie und als Gesamtkalender bewusst neu.
- `review:calendar-sources` ist die lesbare Alias-Bezeichnung für die Quellenprüfung.
- `review:calendar-sources:strict` prüft zusätzlich Link-Erreichbarkeit und eignet sich für GitHub Actions.
- `generate:calendar-artifacts` ist die lesbare Alias-Bezeichnung für die bewusste Neuerzeugung der ICS-Dateien.
- `validate:calendar-artifacts` prüft nur die generierten ICS-Artefakte.
- `refresh:calendar-artifacts` erzeugt ICS-Dateien neu und validiert sie direkt danach.
- `validate:repo` ist die lesbare Alias-Bezeichnung für den vollständigen Repository-Buildcheck.

Der gleiche Prüfschritt läuft außerdem automatisch in GitHub Actions bei Push und Pull Request, damit defekte Zeichen nicht unbemerkt online gehen.
Zusätzlich läuft wöchentlich der Workflow `.github/workflows/calendar-source-review.yml`, der die Quellenpflege des Himmelskalenders überwacht.

Wenn Kalender-Configs geändert wurden und die ICS-Dateien dadurch veraltet sind, meldet `npm run validate:repo` das explizit und fordert zur Neuerzeugung der Kalender-Artefakte auf.

### Rechenprüfungen

Rechenprüfungen: `npm run test:explorer`. Die statische Projektvalidierung ersetzt keine Browser- oder Geräteprüfung.

## Quellenpflege des Himmelskalenders

Die regelmäßige Quellenprüfung ist jetzt im Projekt selbst hinterlegt:

- `calendar-sources.json` definiert
  - die verwendeten Kalenderquellen,
  - welche Dateien sie speisen,
  - zu welchen Kategorien sie gehören,
  - wann sie zuletzt geprüft wurden,
  - und in welchem Intervall sie erneut geprüft werden sollen.
- `scripts/check-calendar-sources.js` prüft
  - ob die Quellenliste vollständig ist,
  - ob einzelne Quellen zur manuellen Nachprüfung fällig sind,
  - ob der zusammengeführte Kalender je Sprache und Kategorie weiterhin bis 2040 reicht,
  - und optional, ob die Quellen-URLs weiterhin erreichbar sind.
  - einzelne Quellen dürfen dabei bewusst akzeptierte Antwortcodes wie `403` definieren, wenn eine Seite in CI Bot-Schutz verwendet, aber als Quelle weiterhin gültig ist.
- `.github/workflows/calendar-source-review.yml` startet diese Prüfung automatisch jeden Montag.

Für einen lokalen Lauf:

```text
npm run check:calendar-sources
```

Für den strengen CI-Lauf mit URL-Prüfung:

```text
npm run check:calendar-sources:strict
```

## Wichtige Konfigurationsdateien

### `js/data/calendar-events.js`

Enthält die kuratierte Ereignisliste für den Himmelskalender. Aktuell gepflegt für 2026 bis Januar 2028.

Kategorien:

- `eclipse`
- `meteor`
- `planet`
- `moon`
- `season`

### `js/data/phenomena-config.js`

Enthält strukturierte Daten für:

- Meteorströme
- monatliche Sternbilder
- Raumsonden
- retrograd darzustellende Planeten
- innere Planetenphasen
- Satelliten

### `js/data/small-bodies-config.js`

Enthält Kometen und weitere Kleinkörper für die Bahn-Darstellung.

### `js/data/bsky-feed-config.js`

Enthält eine Liste von Bluesky-Accounts:

```js
{
  handle: "dlr-next.bsky.social",
  profileUrl: "https://bsky.app/profile/dlr-next.bsky.social",
  label: "DLR-next"
}
```

Für jeden Eintrag zeigt die App den neuesten Bildpost; wenn heute noch kein Bildpost existiert, wird optional der letzte Bildpost gezeigt.

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

## Himmelswissen pflegen

Die Einträge in `js/data/mnemonics-config.js` haben `id`, `kind` (`mnemonic`, `planet`, `star`), `texts.de/en/fr` und `sources`. Jeder Sprachtext enthält `title` und `explanation`, bei Bedarf `subtitle` und `note`. Sprüche führen zusätzlich `original.language` und `original.text`; `ownWording` kennzeichnet eigene Formulierungen. Fremdsprachige Originale bilden eigenständige Einträge und erhalten in den anderen Sprachen Untertitel.

Beim Laden mischt Fisher–Yates alle IDs. Erst nach einer vollständigen Runde wird erneut gemischt; ein unmittelbarer Wiederholer über die Rundengrenze wird vermieden. Erneute Textaktualisierungen behalten Eintrag und Reihenfolge bei. Der Controller verwendet HTML-Templates und behält Artikel und Button im DOM. Änderungen aktualisieren nur diese Kachel im Masonry-Layout. Es gibt keine Timer und keine Kopplung an Datum oder Ort.

Quellen belegen bei eigenen Formulierungen den Sachinhalt. Die französische p/d-Formulierung fasst eine belegte Methode zusammen; sie ist kein historisch belegtes wörtliches Zitat. Einschränkungen gehören in die sichtbaren `note`-Texte und nicht nur in die ?-Hilfe.

Die 31 Einträge verweisen über ihre IDs in `js/data/sky-knowledge-graphics-config.js` auf 29 statische Lehrgrafiken. Wiederverwendete Motive (Planetenfolge, Sternfarben) teilen eine Szene. Jede Szene enthält lokalisierte `caption`-Texte und eine Liste von SVG-Primitiven mit Geometrie und gegebenenfalls lokalisiertem `text`. Sichtbare Texte gehören in diese Konfiguration. Der Renderer klont ausschließlich die SVG-Templates aus `index.html` und setzt Attribute sowie `textContent`; Artikel, Figur und Steuerelemente bleiben erhalten. Bei unveränderter Szene und Sprache bleibt auch das SVG erhalten. Die Grafik hat einen zugänglichen Namen und eine sichtbare Bildunterschrift; Farbe ist nie der einzige Bedeutungsträger.

Die Bilder zeigen keine aktuellen Himmelspositionen. Maßstäbe, verwendete Zahlen und Grenzen sind in `BERECHNUNGEN.md` erläutert. Zusätzliche Sternbildquellen stehen direkt bei den entsprechenden Einträgen.

Prüfung: `npm run test:knowledge` kontrolliert den Inhaltsvertrag, Quellen, Sprachabdeckung und Mischrunden. Browserprüfungen sind zusätzlich für Layout, Fokus und Scrollposition nötig.

## IDEFIX-Kachel und Bahndaten

- `js/data/idefix-config.js`: kuratierte Meilensteine, Zeitregler-Schritte, Status-Prüfdatum und Quellen. Landefenster und Sprungtage sind zeitliche Einordnungen des Missionsplans, keine bestätigten Tagesdaten.
- `js/data/idefix-ephemeris.js`: lokal gespeicherte JAXA-Vorstartplanung aus JPL Horizons für MMX (−239), einschließlich Abfrage-URLs, Referenzrahmen, UTC-Zeitskala, Abruf- und Revisionsdatum.
- `js/models/idefix-model.js`: Interpolation ohne Extrapolation, Klassifikation der Planungsphasen, UTC-Kalenderschritte und schematischer Phobos-Umlauf.
- `js/cards/idefix.js`, `css/cards/idefix.css`: Darstellung und Interaktion; wiederholte Strukturen stammen aus HTML-Templates.
- `scripts/update-idefix-ephemeris.js`: bewusster Abruf der öffentlichen Horizons-Vektoren über Node.js.

Die eingebundene Lösung `20261019_20281231_MMX_V0.2` wurde am 7. Oktober 2026 revidiert. 825 Positionen reichen von 19. Oktober 2026, 21:00 UTC, bis 30. Dezember 2028, 21:00 UTC. Die erste Woche verwendet Sechs-Stunden-Schritte, danach Tageswerte. Die Daten werden im Browser nicht aus fremden APIs nachgeladen und funktionieren daher auch ohne CORS-Zugriff oder Netzverbindung nach vollständigem Laden der statischen Dateien.

Bewusst aktualisieren:

```text
node scripts/update-idefix-ephemeris.js
npm run test:idefix
npm run validate:repo
```

Das Skript prüft API-Version, Ziel, Referenzrahmen und die erwartete Planungs-Lösung vor dem Schreiben. Bei geänderter Bahn-Lösung ist eine inhaltliche Prüfung und Anpassung erforderlich. Startmeldung, Status-Prüfdatum, Planungsfenster, Quellen und Hilfetexte werden separat redaktionell gepflegt; ein Bahndatenabruf bestätigt keine Missionsereignisse.

Die Kachel trennt belegte Meldung und Datumsansicht: „Zuletzt bestätigt“ ist ein datierter Stand, während die Phasen der Zeitleiste Planungsangaben bleiben. Nach 14 Tagen erscheint ein Hinweis auf den älteren Meldungsstand. Neue Nachrichten werden direkt im JAXA-Blog verlinkt. Nach Ende der Bahnabdeckung wird nur ein hohler Zielbereich am Mars/Phobos gezeigt; keine erfundene Flugbahn wird fortgesetzt. Die Skizze des Phobos-Umlaufs besitzt keine beobachtete Nullphase.

Ein Minutentakt aktualisiert das gemeinsame Basisdatum. Lokale Erkundungszeit bleibt fest; ein Dashboard-Datumssprung von mehr als zwölf Stunden setzt sie zurück. Alle Bedienelemente, Pixel und SVG-Gruppen bleiben im DOM, das Masonry-Layout wird nur für die Kachel aktualisiert.

### Voyager 1 als Lichtreiseziel

`js/data/voyager-data.js` enthält zwei validierte Sonnenabstände aus NASA Eyes, UTC-Stützzeiten, Einheiten, Abrufdatum und Quellen-URLs. `scripts/update-voyager-data.js` erneuert sie bewusst nach Prüfung von Reihenfolge, Tagesintervall und plausibler radialer Geschwindigkeit; bei Fehlern bleibt der vorherige Stand erhalten. `js/models/astronomy-explorer-model.js` berechnet daraus eine lineare Abstandsnäherung und `r / c`. Außerhalb von ±5 Jahren um den jüngsten Stützzeitpunkt liefert das Modell `null`; die vorhandenen Regler und Buttons bleiben im DOM und zeigen eine nicht verfügbare Reise. Es gibt keinen zusätzlichen Netzabruf zur Laufzeit. Formeln, Grenzen und der NASA-Meilenstein ab der Erde stehen in `BERECHNUNGEN.md` und in der dreisprachigen ?-Hilfe.

### Konjunktionsmodell

js/models/conjunction-model.js trennt die geozentrische Winkeldistanz und Minimumsuche vom Rendering. `computeConjunctionEvents` übergibt die vorhandene `geocentricVector`-Berechnung. Alle Paare teilen tägliche Stützvektoren; die Verfeinerung verwendet den Goldenen Schnitt. `conjunctionTickTemplate` und `conjunctionEventTemplate` definieren SVG-Struktur und Datumsmarken in `index.html`. Die drei Sprachfassungen erklären die Erdperspektive und den Unterschied zwischen engster Begegnung und gleicher Länge. `npm run test:conjunctions` prüft insbesondere Mars/Jupiter 2026, Breitenabstand, Fenstergrenzen und die gemeinsame Nutzung von Stichproben.

### Tagesübersicht „Heute faszinierend“

- js/data/daily-highlights-config.js: Prioritäten, Maximalzahl, Themenlimits, Zukunftsfenster, Beobachtungsschwellen und Cache-Grenze.
- js/models/daily-highlights-model.js: deterministische Auswahl, Kalender-Differenzen über Zeitzonen/DST hinweg, jahresübergreifende Meteoraktivität und Zusammenführung doppelter Hinweise.
- js/cards/daily-highlights.js: Adapter zu vorhandenen Berechnungen, Tages-Snapshots, lokalisierte Ausgabe und stabile Template-Knoten.
- css/cards/daily-highlights.css: erste, immer volle Rasterzeile mit responsiver Hinweisliste. Die Übersicht nimmt nicht an der Kachelgrößenwahl teil.
- js/shared/daily-highlight-graphics.js und css/shared/daily-highlight-graphics.css: dekorative 36-Pixel-Miniaturen neben den Titeln, mit eigener Szenenauswahl und SVG-Templates im HTML. Planetenmerkmale, Begegnungen, Meteorströme, Finsternisse, Jahreszeiten und Polartag/-nacht sind schematisch; Größen, Abstände und Achsen sind keine maßstäblichen Beobachtungsbilder. Die Mondminiatur verwendet die vorhandene Phasen-Geometrie aus js/shared/celestial-bodies.js für das ausgewählte Datum. Finsternisarten stammen aus js/data/eclipse-phase-config.js; unbekannte Ereignisse erhalten ein neutrales Himmelsmotiv. Grafiken enthalten keine Texte und sind für Screenreader ausgeblendet. Bei unverändertem Motiv bleiben die SVG-Knoten erhalten.

Richtungsangaben bei Planeten verwenden die eigenständige Komponente aus `js/shared/direction-compass.js`, `css/shared/direction-compass.css` und dem HTML-Template `directionCompassTemplate`. Sie kennt weder Kacheln noch Übersetzungen. Norden liegt oben; der Pfeil dreht sich im Uhrzeigersinn um den berechneten Azimut. Die lokalisierte Himmelsrichtung bleibt als Text erhalten, die ergänzende Grafik ist für Screenreader ausgeblendet. Kompass und Textknoten bleiben bei Aktualisierungen bestehen.

Wiederverwendung: `const icon = PLANETENUHR_COMPASS.create(azimuthDeg)` erzeugt ein unabhängiges SVG, das neben einer ausgeschriebenen Richtung in einen beliebigen Container eingefügt werden kann. `PLANETENUHR_COMPASS.setAzimuth(icon, azimuthDeg)` aktualisiert den vorhandenen Pfeil und gibt bei gültigen Winkeln `true` zurück. Winkel werden auf 0 bis unter 360 Grad normalisiert; ungültige Werte blenden das Symbol aus und liefern `false`. Ein späterer gültiger Winkel blendet es wieder ein. Die Größe beträgt standardmäßig 26 Pixel und lässt sich je Container über die CSS-Variable `--direction-compass-size` ändern. Die Komponente benötigt das gemeinsame Template und ihre CSS-Datei; sie führt keine Berechnungen von Himmelspositionen durch.

refreshDateDrivenTiles und applyI18n aktualisieren den Controller. Ein begrenzter Cache speichert Tagesdaten nach lokalem Datum, Ort und Sprache; keine neuen Netzaufrufe oder persistenten Speicher. Die Inhalte stammen direkt aus calendarEvents, Meteorkonfiguration, computeMoon, dem geozentrischen Konjunktionsmodell und den Horizont-/Sonnenfunktionen. Kalenderfilter und lokale Zeitregler anderer Kacheln verändern die Übersicht nicht. Linkziele verwenden die vorhandenen Kachelanker, bewahren globale Auswahl und URL-Parameter und erhalten den Tastaturfokus. Auswahlregeln und Quellengrenzen erklärt die dreisprachige ?-Hilfe.

Die gemeinsamen Grafiken werden auch in „Heute faszinierend“ und „Sonnensystem“ verwendet. `options.phase` steuert die synodische Mondphase, `options.shadowAngle` dreht den Erdschatten in Grad (Standard: Licht von links). Im Sonnensystem blendet eine auf diese Kachel begrenzte CSS-Regel die Nachtseite der Erde aus; der Mond wird dort nicht dargestellt. Die anderen Kacheln behalten ihre Beleuchtung. Planetenmarker sind zur Lesbarkeit vergrößert und nicht maßstäblich. `js/shared/solar-system-labels.js` verschiebt kollidierende Beschriftungen und verbindet sie bei Bedarf mit geraden Linien, ohne Bahnpositionen zu verändern. SVGs und Beschriftungen bleiben bei Datums- und Sprachwechseln erhalten.

`js/data/solar-system-config.js` legt die festen schematischen Bahnradien als Anteil der Scheibenbreite fest: Merkur 0,115, Venus 0,18, Erde 0,245, Mars 0,31, Jupiter 0,35, Saturn 0,39, Uranus 0,425 und Neptun 0,46. Ring und Planet verwenden denselben Radius; die bisherigen entfernungsabhängigen Wurzelradien entfallen. Die inneren Planeten bekommen mehr Platz, die äußeren Ringe reichen weiter an den Rand. Die berechneten heliozentrischen Winkel bleiben erhalten.

Meteorhinweise in der Tagesübersicht: bekannte Kalender-Maxima werden mit konfigurierten Strömen zusammengeführt und als datiert gekennzeichnet. Jährliche Maxima bleiben ausdrücklich Näherungen. Ein aktiver Strom reserviert einen der höchstens fünf Plätze; das Themenlimit bleibt eins. Mondlicht verändert die Auswahl nicht mehr, sondern ergänzt ab 70 % Beleuchtung eine Einschränkung. Die Texte unterscheiden Aktivität vor dem Maximum, bevorstehendes Maximum, Maximum am gewählten Tag und abklingende Aktivität. Der Tages-Badge bezieht sich während der Aktivitätsperiode auf den ausgewählten Tag; das Datum des Maximums steht gesondert im Hinweis.

Die Kachel „Sonnensystem“ bietet unabhängig von der Schriftgröße immer „Grafik vergrößern“. js/shared/diagram-details.js erstellt dafür eine statische HTML-Kopie einschließlich der verschachtelten Planeten-SVGs im gemeinsamen Dialog. Positionen und berechnete CSS-Stile werden beim Öffnen eingefroren; IDs und Farbverlaufsreferenzen erhalten wie bei SVG-Detailansichten ein eigenes Präfix. Der Kreis wird um Faktor 1,25 bis 2 vergrößert, mit einer Zielgröße von 900 Pixeln und einem Faktorlimit von 2. Die scrollbare Bühne stammt aus diagramSolarStageTemplate. Die Originalkachel und ihre Datums-/Auswahlzustände bleiben erhalten.

Die gemeinsamen Vergrößerungsbuttons verhindern den nativen Fokus-Scroll beim Pointerdown. Der optionale beforeOpen-Adapter gibt außerdem die noch gespeicherte Scrollankerung eines Datumswechsels frei, bevor sie den Button während des Klicks verschieben kann. Beim Schließen erhält der auslösende Button den Fokus mit preventScroll zurück. Ein verspätetes close-Ereignis leert keine inzwischen erneut geöffnete Ansicht.

„Erde & Mond“ verwendet für die lokale Mondrichtung ebenfalls PLANETENUHR_COMPASS. Der 26-Pixel-Kompass wird einmalig im Host moonLocalCompass erzeugt und bei Datum-/Ortswechseln nur über setAzimuth aktualisiert. Die ausgeschriebene Richtung und Höhe bleiben erhalten; fehlt eine gültige Position, blendet die gemeinsame Komponente das Symbol aus.

refreshDateDrivenTiles aktualisiert renderMoon(date) und renderEarthMoon(date) ausdrücklich mit demselben ausgewählten Zeitpunkt wie die übrigen Kacheln. Dadurch folgen beobachtete Mondphase, Phasentext, nächster Vollmond und lokaler Kompass sofort dem globalen Regler sowie Orts- und Datumswechseln. Der halb-stündliche Refresh und Größenwechsel nutzen denselben Pfad, ohne zusätzliche doppelte Mond-Renderaufrufe. Die beschleunigte Umlaufanimation bleibt eine unabhängige schematische Ansicht.

### Controller für Erde und Mond und Layout

`js/cards/earth-moon.js` erhält den gemeinsamen Kontext direkt aus der globalen Registrierung. Phasen-SVG, Fortschrittsbalken, Vollmonddatum, Beschriftung und Kompass behalten ihre vorhandenen DOM-Knoten. Die zugrunde liegenden Modelle und Richtungsberechnungen werden als Abhängigkeiten übergeben. Die separate 12-Sekunden-Umlaufskizze wird ausschließlich durch diesen Controller animiert. `start()`, `pageshow` und Resize teilen einen einzigen ausstehenden RAF-Callback; Resize startet keine weitere dauerhafte Animationskette.

`js/core/dashboard-layout.js` besitzt Raster-, Beobachter- und Scrollankerregeln. Der Controller startet die Beobachtung erst mit der einmaligen Initialisierung; auf Geräten bis 760 Pixel bleibt sie abgeschaltet. Eine erfolgreiche Korrektur über den Scrollcontainer wird nicht nochmals über das Fenster angewendet; der Fenster-Fallback korrigiert nur eine danach verbleibende Abweichung. Die Vergrößerung erhält `releasePendingViewportRestoration` als Abhängigkeit und ruft es vor dem Öffnen auf. Kachelgrößen, Hilfe und Navigation besitzen eigene Controller in `js/core/`.

### Kachelgrößen, Hilfe und Navigation

`js/core/card-sizes.js` besitzt die Größenüberschreibungen und Listener. Konfiguration und Standards liegen in `js/data/card-sizes-config.js`; der Speicherschlüssel bleibt `planetenuhr-card-sizes-v1`. Initialisierung verändert weder gespeicherte Datenformate noch CSS-Regeln für mobile Geräte. Ungültige Inhalte und vom Browser gesperrter Speicher werden abgefangen. Größenänderungen verwenden weiterhin die Scroll-/Batch-Adapter des Layout-Controllers und den gemeinsamen Refreshgrund `size`.

`js/core/card-help.js` klont die `cardHelp*Template`-Vorlagen in `index.html`. Wiederholte Initialisierung erzeugt keine zusätzlichen Popups oder Dokumentlistener. Formelausdrücke und kuratierte Textfelder dürfen kontrolliertes Rich-HTML enthalten; die wiederkehrende Struktur entsteht aus Vorlagen. Die zusätzliche Mondknoten-Erklärung steht zentral als `markerNote` in den drei Sprachpaketen von `js/data/card-help-config.js`. `window.renderPlanetenuhrHelpMath` bleibt als Adapter für die verspätet geladene KaTeX-Bibliothek erhalten; ohne Bibliothek bleibt die ursprüngliche Darstellung lesbar. Die Tests simulieren die spätere Bibliotheksverfügbarkeit, prüfen jedoch keinen Live-CDN-Abruf.

`js/core/card-navigation.js` besitzt den angeforderten Kachelschlüssel. Stabile ids, vorhandene URL-Parameter, Datum/Ort/Sprache und der bisherige Hash bleiben erhalten. Ein Kachellink setzt Fokus mit `preventScroll`, aktualisiert die URL ohne Navigation und scrollt zur Zielkachel. Initiale Datums-/Ortsparameter verarbeitet weiterhin der globale Auswahlkontext.

### Begegnungs- und Meteor-Controller

`js/cards/conjunctions.js` erhält Ereignisse aus dem vorhandenen `computeConjunctionEvents`-Adapter zum geozentrischen Modell. Fenster (±60 Tage), Grenze (4,5°), Punktgröße (6 SVG-Einheiten), abwechselnde Beschriftungshöhen und Finger-/Handvergleiche bleiben erhalten. Die Winkel-/Paarformatierung wird auch für bestehende Verbraucher über Adapter bereitgestellt.

`js/cards/meteor-streams.js` erhält die unveränderten Ströme aus `js/data/phenomena-config.js`, den ausgewählten Kontext und die bisherigen Datums-/Geometriehelfer. Der Jahreskreis behält Radius, Aktivitätsfenster, nächste Maxima und schematische Radianten. Der bestehende `js/shared/meteor-labels.js`-Renderer ordnet die Namen und geraden, ungefüllten Verbindungslinien weiterhin an; es wird kein zweiter Resize-Beobachter eingeführt. Beide neuen Controller starten keine Timer oder Listener. Gemeinsame SVG-Primitiven und die Radiant-Struktur werden aus `astroChart-*` beziehungsweise `meteorRadiantsTemplate` geklont.

Für den erweiterten Vergleich dient `scripts/baselines/phase-07-encounters.json`: gesetzt mit `PLANETENUHR_ENCOUNTER_BASELINE=1` sichert der Browserlauf zusätzlich Begegnungspositionen, Abstände, Beschriftungen und Meteor-Bögen/-Namen/-Linien/-Radianten. Vergleich: `node scripts/browser-baseline.cjs --compare scripts/baselines/phase-07-encounters.json` mit derselben Umgebungsvariable. Ein einzelner vorhandener Fall kann zusätzlich über `PLANETENUHR_BASELINE_CASE`, etwa `chromium-de-390`, gewählt werden; Referenzen werden ausschließlich für die vollständige Matrix aufgezeichnet. Browser/OS-Voraussetzungen entsprechen der bisherigen Referenz.

### Sternbild-Controller

`js/cards/constellation-month.js` wählt das konfigurierte Monatssternbild aus `js/data/phenomena-config.js`, zeichnet die schematische Sternkarte samt Sternnamen und gibt den vorhandenen Richtungshinweis mit Finger-/Handbreiten aus. Mittelpunkt und automatische beziehungsweise konfigurierte Labelpositionen gehören ebenfalls zu diesem Controller. `js/cards/constellation-year.js` zeichnet das Jahresrad mit den bereits vergrößerten Miniaturen, begrenzt Namensbeschriftungen anhand der tatsächlichen SVG-Glyphen und markiert ausgewählten Monat und Jahrestag. Beide erhalten Datum und Sprache aus dem gemeinsamen Refresh-Kontext. Die vorhandenen Texte und Näherungen bleiben unverändert. Die Controller starten keine Timer oder Listener; Initialisierung und Abhängigkeiten stehen in `js/core/app.js`. Ungenutzte alte Renderadapter wurden entfernt. Gemeinsame SVG-Primitiven werden aus `astroChart-*`, HTML-Knoten aus `constellationDivTemplate` und die vorhandenen Miniaturen/Zusammenfassungen aus ihren bisherigen Vorlagen geklont.

`scripts/constellation-cards.test.js` prüft die realen Hilfsschnittstellen, Labelüberschreibungen und fehlende Ziele. Für den erweiterten Browservergleich `PLANETENUHR_ENCOUNTER_BASELINE=1` und `PLANETENUHR_CONSTELLATION_BASELINE=1` setzen und `node scripts/browser-baseline.cjs --compare scripts/baselines/phase-07-constellations.json` ausführen. Die Referenz enthält exakte Grafik-/Text-Hashes vor der Auslagerung über dieselben 18 Browser-/Sprach-/Breitenfälle. Zusätzlich werden alle zwölf Monatsauswahlen, Namensgrenzen, aktuelle Markierungen sowie Hilfe und vorhandene Vergrößerungen mit Escape und Fokus geprüft.

### Jahreszeiten und Retrograd-Phasen

`js/cards/seasons.js` übernimmt den schematischen Jahreslauf, die Achsen-/Sonnenwinkelansicht, Monatsmarken und Zusammenfassung. Bisherige Saison-Schwellen, Sinusnäherung, lokaler Jahrestag und Nordbezug bleiben erhalten. Die Definitionsstruktur für Farbverlauf und Schatten liegt in `seasonDefinitionsTemplate`, weitere SVG-Knoten werden aus den gemeinsamen `astroChart-*`-Vorlagen geklont.

`js/models/retrograde-model.js` erhält geozentrische Längen-/Breitenfunktionen und den vorhandenen Winkelhelfer. `apparentDailyMotion(key,date)` verwendet unverändert die zentrierte Differenz über zwei Tage. `findNearestStationDate(key,date,maxDays)` sucht im bisherigen Standardfenster von ±220 Tagen nach Vorzeichenwechseln; die Stationszeit bleibt eine Halbtagsschätzung. `samplePath(key,date)` tastet ±90 Tage in Zweitagesschritten ab und liefert die bisherigen 91 Kurvenpunkte einschließlich Stations-/Aktuellmarkern. Längenübergänge werden als kumulierte vorzeichenbehaftete Schritte entfaltet. Das Modell liest weder DOM noch globale Auswahl und startet keine Timer.

`js/cards/retrograde.js` erhält dieses Modell, Planetenliste und Formatierungsadapter. Badge, Bewegungsbalken, Stationsdatum und SVG-Ausgabe bleiben erhalten; Pfade und Marker entstehen jetzt aus `retrogradePathTemplate`, `retrogradeStationTemplate` und `retrogradeCurrentTemplate` statt aus HTML-Strings. Beide Controller sind direkt an den gemeinsamen Refresh-Kontext angeschlossen. Ungenutzte Render-/Modelladapter wurden entfernt.

Die 25 Referenzfälle in `scripts/baselines/retrograde-model.json` stammen aus dem Stand vor der Auslagerung. `scripts/mechanics-cards.test.js` prüft die tatsächlichen Modulschnittstellen samt Nullmeridian, Stationswechsel und bestehenden Saison-Schwellen. Für den Browservergleich zusätzlich zu den bisherigen Referenzschaltern `PLANETENUHR_MECHANICS_BASELINE=1` setzen und `node scripts/browser-baseline.cjs --compare scripts/baselines/phase-07-mechanics.json` ausführen. Diese Referenz enthält alle bisherigen Inhalte sowie die exakten Jahreszeiten-/Retrograd-Grafiken und Texte; Hilfe, vorhandene Vergrößerung und erhaltene Bedienelemente werden ebenfalls geprüft.

### Innere Planetenphasen und Baryzentrum

`js/models/inner-planets-model.js` übernimmt die bestehende planare Beleuchtungsrechnung und Elongationszuordnung. Positionen und Elongation werden als explizite Datumsfunktionen übergeben. `phaseDiscPath(illumination,evening)` liefert den bisherigen Zweibogen-Terminator mit Begrenzung auf 0–100 Prozent. `js/cards/inner-planets.js` füllt die vorhandenen Karten und `planetPhaseDiscTemplate`; die SVG-Ausgabe wird nicht mehr als HTML-String zusammengesetzt.

`js/data/barycenter-config.js` enthält die ursprünglichen acht Massenverhältnisse, den Sonnenradius in AU sowie die drei Button-/Moduszuordnungen. `js/models/barycenter-model.js` berechnet den massengewichteten Mittelpunkt relativ zur Sonne, den negierten Sonnenversatz und die bisherige Spur von ±9125 Tagen in 30-Tage-Schritten. Der Einflussmodus wird ausdrücklich übergeben; das Modell liest kein DOM und keinen globalen Auswahlzustand.

`js/cards/barycenter.js` besitzt Modus und Listener. `init()` verdrahtet die vorhandenen Buttons einmal, `setMode(mode)` zeichnet nur diese Kachel mit einem frischen globalen Snapshot und fordert wie bisher das Layout an. Ein globaler Datumswechsel erhält die lokale Moduswahl. Die Refresh-Registrierung übergibt beiden Controllern den gemeinsamen Kontext; vorherige Zustände, Listener und Modell-/Renderadapter sind aus `js/core/app.js` entfernt. Weitere Timer oder Speicherformate entstehen nicht.

`scripts/planet-cards.test.js` vergleicht zehn Phasenwerte und neun Baryzentrumfälle mit allen vollständigen Spuren aus dem vorherigen Stand und prüft unabhängig davon Massengewichtung, Beitragsreihenfolge, Terminatorgrenzen sowie einmalige Listener. Für den erweiterten Browservergleich zusätzlich zu den bisherigen Schaltern `PLANETENUHR_PLANET_CARDS_BASELINE=1` setzen und `node scripts/browser-baseline.cjs --compare scripts/baselines/phase-07-planet-cards.json` ausführen. Die 18-Fälle-Referenz enthält dieselben Sprach-/Breiten-/Browserfälle und zusätzlich alle drei Baryzentrum-Modi. Der Lauf prüft auch echte Modusklicks, Datumskopplung, Hilfe und vorhandene Vergrößerungen mit Escape/Fokus.

### Lagrange-Punkte und Analemma

`js/models/lagrange-model.js` erhält die vorhandene Sonnenlänge und Polarprojektion. `calculateScene(date)` liefert Erdphase, fünf schematische Lagrange-Punkte und die bisherigen Zeichenkoordinaten. Dies ist weiterhin eine Orientierungsskizze mit vergrößerten L1-/L2-Abständen, keine numerische Lösung des Dreikörperproblems. `js/cards/lagrange.js` klont die vorhandenen gemeinsamen SVG-Primitiven und ergänzt dieselben Labels und Erläuterungen.

`js/models/analemma-model.js` erhält die unveränderten Funktionen aus `js/models/solar-visibility-model.js` sowie die bisherigen Kalenderhelfer. `sampleYear(date,location)` liefert 365 beziehungsweise 366 Tageswerte, Grenzen und den ausgewählten Tag. Datum und Ort werden ausdrücklich übergeben. Die vorhandene browserlokale Tages-/Sommerzeitkonvention wird bei dieser Auslagerung beibehalten. `js/cards/analemma.js` übernimmt Projektion, Monatsmarkierungen, Minuteformatierung und Zusammenfassung und liest den Ort direkt aus dem gemeinsamen Kontext. Fünf ehemalige Sonnenadapter in `js/core/app.js` sind dadurch entfallen. Beide Controller starten keine Timer oder Listener.

Die Modellreferenz `scripts/baselines/solar-geometry-models.json` enthält fünf bisherige Lagrange-Szenen und neun vollständige Analemma-Jahresläufe für Berlin, Tokio und Sydney einschließlich Sommerzeitdatum und Schaltjahr. `scripts/solar-geometry-cards.test.js` prüft diese sowie geometrische Beziehungen und die Jahresaggregation. Für den erweiterten Browservergleich zusätzlich zu den bisherigen Schaltern `PLANETENUHR_SOLAR_GEOMETRY_BASELINE=1` setzen und `node scripts/browser-baseline.cjs --compare scripts/baselines/phase-07-solar-geometry.json` ausführen. Der Lauf vergleicht beide Grafiken und Texte exakt und prüft Orts-/Jahreseingaben, erhaltene Bedienelemente sowie Hilfe und sichtbare Vergrößerungen.

### Exoplaneten und Satelliten

`js/models/exoplanets-model.js` erhält die vorhandenen Julian-Date- und Winkelhelfer. `exoplanetPeriodDays(orbitAu,starMassSun)` berechnet die bisherige Kepler-Näherung; `planetState(system,planet,date,systemIndex,planetIndex)` liefert Perioden, dekorative Phasen und auf das jeweilige System normierte Zeichenpositionen. Bestehende Ersatzwerte bei ungültiger Halbachse, Sternmasse und äußerer Bahn bleiben erhalten. `js/cards/exoplanets.js` füllt die vorhandenen `exoplanetSystemTemplate`-Karten und klont SVG-Primitiven aus den gemeinsamen Vorlagen.

`js/models/satellites-model.js` berechnet mit `orbitState(satellite,index,date,layout)` die bisherigen elliptischen Bahnen, Epochenphasen und um den konfigurierten RAAN-Winkel gedrehten Positionen. Es verwendet die konfigurierten mittleren Perioden, keine Live-TLE-Daten. `js/cards/satellites.js` füllt Grafik und Detailvorlagen. `satelliteSummaryGridTemplate` und `satelliteSummaryFallbackTemplate` bilden nun auch die Gruppen- und Ersatzstruktur ab; Namen und Detailtexte werden als Text gesetzt. Die Ersatzdarstellung bei fehlender regulärer Detailvorlage bleibt erhalten.

Systeme und Satellitendaten bleiben in `js/data/phenomena-config.js`. Die Controller erhalten das gemeinsame Datum und starten keine Timer, Listener oder zusätzlichen Netzabrufe. Die vorherigen Exoplaneten-Helfer und beide Renderer sind aus `js/core/app.js` entfernt.

`scripts/orbit-cards.test.js` vergleicht 96 Exoplaneten- und 20 Satellitenzustände aus dem vorherigen Stand und prüft Periodizität, Kepler-Skalierung, Phasen vor der Epoche und fehlende Ziele. Für den erweiterten Browservergleich zusätzlich zu den bisherigen Schaltern `PLANETENUHR_ORBIT_CARDS_BASELINE=1` setzen und `node scripts/browser-baseline.cjs --compare scripts/baselines/phase-07-orbit-cards.json` ausführen. Grafiken und Zusammenfassungen werden exakt verglichen; leere Konfigurationen, Ersatzdarstellung, Zeitwechsel, Hilfe und sichtbare Vergrößerung werden ebenfalls geprüft.
