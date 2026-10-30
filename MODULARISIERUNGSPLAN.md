# Modularisierungsplan

Stand: 30.10.2026 · App-Version 1.48 · Ausgangspunkt: Version 1.21, Commit `9dcd34a`.

Status: **Abschnitte 0 bis 9 sind abgeschlossen. Die Kachel-, Modell-, Kalender-, Übersetzungs-, Fehler- und Layoutzuständigkeiten sind ausgelagert; `js/core/app.js` verbindet die Module und startet die App. Gesamtabnahme bestanden: 145 Tests, Build-/Encoding-Prüfung sowie 18 Chromium- und 18 WebKit-Browserfälle über Deutsch/Englisch/Französisch und 320/390/1280 Pixel.**

## Ziel und Grenzen

Die bestehende App soll leichter wartbar werden: Berechnungen, Kachelverhalten, globale Steuerung und Layout erhalten klare Zuständigkeiten. Aussehen, Bedienung, Rechenergebnisse und vorhandene Einstellungen bleiben bei der Auslagerung erhalten.

Wir arbeiten in kleinen, einzeln prüfbaren Abschnitten. Die erste Auslagerung in eine große externe Datei ist nur ein Zwischenschritt, nicht das fertige Ergebnis.

- Weiterhin Vanilla JavaScript und statische Dateien, ohne Framework, Bundler oder neuen Build-Zwang.
- Vorläufig die vorhandenen klassischen Scripts und `window.PLANETENUHR_*`-Schnittstellen beibehalten. Keine gleichzeitige Umstellung auf ES-Module oder neue Ordnerstruktur.
- Keine Änderungen an astronomischen Näherungen, Quellen, Kalenderinhalten, URL-Formaten oder Speicherformaten im Zuge einer reinen Auslagerung.
- Die Kalenderdarstellung bleibt wie vereinbart bestehen; ihre spätere interne Trennung erhält eigene Vergleichsprüfungen.
- Funktionen mit Zweck, Parametern und Rückgabe dokumentieren; klare `if / else`-Blöcke verwenden.
- Struktur bleibt in HTML-Templates, Darstellung in CSS, Inhalte in Konfigurations-/Sprachdateien. Templates können weiterhin zentral in `index.html` stehen; keine zusätzlichen HTML-Nachladevorgänge.
- Die lokal vorhandene, von Git ignorierte `AGENTS.md` bleibt erhalten.

## Geprüfter Ausgangsstand

- `index.html` umfasst rund 11.170 Zeilen. Ein großer ausführbarer Inline-Scriptblock enthält rund 9.994 Zeilen und 285 benannte Funktionsdeklarationen auf der obersten Einrückungsebene; zusätzliche Callbacks sind darin nicht mitgezählt.
- Bereits eigenständig: Horizont/Lichtreise, Tagesübersicht, Konjunktionsmodell, IDEFIX, Himmelswissen, Kompass, gemeinsame Himmelskörpergrafiken, Vergrößerung und Updateprüfung.
- Weiterhin eng verbunden: globale Zustände, Initialisierung, viele astronomische Helfer, Kachelrenderer, Kalender, Layout/Scrollanker, Hilfe, Netzabrufe und Zeitwerkzeuge.
- Neun Testdateien stehen unter `scripts/`. Mehrere lesen Funktionen noch direkt aus `index.html`, statt ein Modul über seine Schnittstelle zu prüfen.
- Besonders schützenswert sind die gerade korrigierte Mond-Datumskopplung, stabile Scrollpositionen und die Safari-Bedienung beim Öffnen der Grafikvergrößerung.

## Gewünschte Zuständigkeiten

| Bereich | Verantwortung | Darf nicht nebenbei übernehmen |
|---|---|---|
| Rechenmodelle | Explizite Eingaben wie Datum, Ort und Körperdaten in Ergebnisse umrechnen | DOM, Übersetzungen, Netzabrufe oder globale Auswahl lesen |
| Datum und Formatierung | Ortszeit, Tagesgrenzen, lokalisierte Anzeige und stabile Datumsschlüssel | Astronomische Rechenmodelle verändern |
| Kachel-Controller | Einmalig Ereignisse verdrahten und vorhandene Template-Knoten aktualisieren | Globale Datums-/Ortszustände eigenständig ändern |
| Globale Steuerung | Auswahl ändern, einen gemeinsamen Aktualisierungskontext erzeugen und Kacheln aufrufen | Einzelne Grafiken zeichnen oder Formeln duplizieren |
| Layout | Größen, Raster, Beobachter und Scrollstabilität verwalten | Kacheldaten oder Himmelspositionen berechnen |
| Datenzugriff | Kalenderdaten zusammenführen beziehungsweise vorhandene externe Daten laden | Ansichtsfilter mit dem vollständigen Datenbestand verwechseln |
| Initialisierung | Abhängigkeiten zusammenstecken und Timer einmalig starten | Fachlogik oder Kachel-Markup enthalten |

Ein Aktualisierungskontext enthält denselben ausgewählten Zeitpunkt, Ort, die Ortszeitzone und die Sprache für alle beteiligten Kacheln. Der laufende Sekundenzeiger der Uhr und die schematische Umlaufanimation bleiben getrennte Vorgänge. Die bisherige Bedeutung von `solarDayOffset` relativ zu `Date.now()` bleibt erhalten.

## Reihenfolge der Umsetzung

### 0. Vergleichsbasis sichern – abgeschlossen

**Umfang:** Bestehende Tests ausführen, Render-Einstiegspunkte und deren Abhängigkeiten erfassen. Einen reproduzierbaren Browser-Prüflauf im Repository ablegen; bisherige lokale Prüfskripte nur nach Prüfung ihrer Aktualität übernehmen.

Browserprüfungen mit Playwright, Chromium und WebKit als reine Entwicklungswerkzeuge vorsehen. Installation und benötigte Browser-Versionen dokumentieren; daraus entsteht keine neue Laufzeitabhängigkeit der App.

**Wichtige Referenzfälle:** 27.10.2026 nach 01.12.2026 und zurück, Berlin/Tokio, Sommer-/Winterzeit, deutsche/englische/französische Ausgabe sowie 320, 390 und 1280 Pixel Breite. Für Zeitvergleiche die Testuhr fixieren.

**Fertig, wenn:** Fehlerfreie Ausgangsergebnisse und Vergleichswerte dokumentiert sind. Vorhandene Fehler werden benannt und getrennt von der Auslagerung behandelt.

### 1. Hauptskript unverändert aus dem HTML herauslösen – abgeschlossen

**Ziel:** `js/core/app.js` als vorübergehender Träger des bisherigen Hauptblocks.

- Den Hauptblock an derselben Stelle nach den vorhandenen Abhängigkeiten als externes klassisches Script laden.
- Noch keine Funktionen umbenennen, Initialisierung umordnen, zusätzliche Kapselung einführen oder Timer ändern.
- Vorher die quelltextabhängigen Tests in `astronomy-explorer.test.js`, `conjunctions.test.js` und `typography.test.js` anpassen. Kurzfristig darf ein gemeinsamer Testhelfer den ausgelagerten Quelltext lesen; spätere Modelltests prüfen öffentliche Schnittstellen.
- Build-Dateiliste, Asset-Versionierung und Fehlermeldungsquellen berücksichtigen. HTML-spezifische Tests weiterhin gegen `index.html` laufen lassen.

**Fertig, wenn:** Das HTML enthält den großen Verhaltensblock nicht mehr; Bedienung und Ergebnisse entsprechen der Referenz. Ein bloßer Dateiumzug wird noch nicht als abgeschlossene Modularisierung gewertet.

### Nachweis für Abschnitte 0 und 1

Der ursprüngliche Hauptblock wurde ohne inhaltliche Änderung als klassisches Script nach `js/core/app.js` verschoben; der Vergleich mit dem Ausgangscommit berücksichtigt die Zeilenenden. Version und Asset-Abfragen stehen einheitlich auf 1.22. Die 70 bestehenden Tests und die Build-Prüfung laufen weiterhin.

`scripts/browser-baseline.cjs` vergleicht 18 festgehaltene Fälle mit `scripts/baselines/phase-01.json`: Chromium und WebKit, drei Sprachen und drei Bildschirmbreiten, bei fixierter Uhr. Er prüft unter anderem Datum, Ort, Mondanzeige, Kalenderfilter, Zeitumstellungen und die Grafikvergrößerung. Externe Netzaufrufe werden dabei blockiert. Referenzumgebung: Windows, Playwright 1.62.1, Chromium 151.0.7922.34 und WebKit 26.5. Eine Browserprüfung ersetzt keinen Test auf einem echten iPhone.

Für die Wiederholung wird Playwright als Entwicklungswerkzeug benötigt, zum Beispiel `npm install --no-save playwright@1.62.1` und `npx playwright install chromium webkit`. Anschließend `node scripts/browser-baseline.cjs --compare scripts/baselines/phase-01.json` ausführen. Die Referenz ist an die genannten Browser und Windows gebunden; andere Versionen oder Betriebssysteme können abweichende Formatierungen liefern. Alternativ lassen sich vorhandene Installationen über `PLANETENUHR_PLAYWRIGHT` und `PLANETENUHR_WEBKIT_EXECUTABLE` angeben.

### 2. Datums- und Formatierungshilfen trennen – abgeschlossen

**Vorgesehene Module:** `js/core/date-time.js` und `js/core/observation-format.js`; die endgültigen Namen werden bei der Umsetzung bestätigt.

**Startpunkte:** `datePartsInZone`, `formatDateStamp`, `formatDateKey`, Zeitzonen-Helfer, Kompassbezeichnungen und Finger-/Handbreiten-Vergleiche.

Die Sprachpakete und Texte bleiben zentral. Anzeigeformate bleiben von URL-/Vergleichsschlüsseln getrennt. Ort und Sprache werden übergeben, statt heimlich aus dem DOM gelesen.

**Fertig, wenn:** Ortsdatumsgrenzen, Zeitumstellung, lokalisierte Anzeigen, URL-Schlüssel und Winkelvergleiche unverändert sind.

**Umgesetzt:** `js/core/date-time.js` enthält Datumsschlüssel, lokalisierte Datumsanzeige, Stadt-Zeitzonenzuordnung und Offset-Helfer; `js/core/observation-format.js` enthält Kompass- und Winkelvergleiche. Die Module erhalten Datum, Zeitzone, Ort beziehungsweise Sprache ausdrücklich. Kurze Adapter in `js/core/app.js` erhalten die bisherigen Aufrufnamen und sollen bei der späteren Trennung der globalen Steuerung durch direkte Modulaufrufe ersetzt werden. Die bestehenden sprachabhängigen Formulierungen wurden unverändert übernommen. `scripts/date-observation.test.js` prüft die Modulschnittstellen, einschließlich Sommer-/Winterzeit und Schwellenwerten.

### 3. Rechenmodelle in kleinen Fachpaketen auslagern

**Reihenfolge:**

1. **Abgeschlossen:** Gemeinsame Zeit-/Winkel- und Koordinatenhelfer in `js/models/astronomy-coordinates.js`, darunter `julianDate`, `normalizeDeg`, `signedDeg`, `localSiderealAngleDegrees`, `horizontalCoordinates`, Ekliptikschiefe und Ekliptik-Umrechnung. `scripts/astronomy-coordinates.test.js` prüft Referenzwerte und geometrische Richtungen. Die vorläufigen Adapter in `js/core/app.js` werden bei der späteren Trennung der Verbraucher entfernt; das separate präzedierende Explorermodell bleibt bestehen.
2. **Abgeschlossen:** `js/data/planet-elements-config.js` enthält die unveränderten J2000-Bahnelemente; `js/models/planet-model.js` enthält `solveKepler`, `planetPosition`, `planetByKey`, heliozentrische Positionen und geozentrische Vektoren. Die Modelle benötigen ein ausdrücklich übergebenes Datum. Vorläufige Adapter in `js/core/app.js` erhalten die bisherigen Aufrufstellen und Standarddaten; sie werden mit den jeweiligen Verbrauchern getrennt. `scripts/baselines/planet-model.json` sichert 40 Positionspaare aus dem Stand vor dieser Auslagerung über fünf Zeitpunkte von 1800 bis 2050. Die Modultests prüfen diese Werte, Kepler-Residuen, unbekannte Körper und die Erdsicht.
3. **Abgeschlossen:** `js/models/moon-model.js` enthält `computeMoon`, `nextFullMoon`, synodische Periode und Referenz-Neumond. Beide Funktionen erwarten ausdrücklich ein Datum und verwenden keine DOM- oder globale Datumsauswahl. Adapter in `js/core/app.js` erhalten die Verbraucher bis zu deren späterer Trennung. `scripts/baselines/moon-model.json` hält 16 Phasen-/Vollmondpaare aus dem bisherigen Modell fest; `scripts/moon-model.test.js` prüft diese einschließlich Millisekunden, acht Phasen, Zeiten vor der Referenz und des Zykluswechsels am Vollmond.
4. **In zwei Einheiten abgeschlossen:** `js/models/solar-visibility-model.js` enthält Sonnenereignisse, Sonnenkoordinaten, saisonale Näherungen und schematische Nachtintervalle. `js/models/eclipse-model.js` enthält Mondknoten und Saisonzentren; `js/models/eclipse-location-model.js` enthält separat kuratierte Sichtbarkeitszuordnungen, Zeitprofile und Ortszeitumrechnung. Datum, Ort, Elongation und Konfigurationslisten werden ausdrücklich übergeben. Vorläufige Adapter bleiben bis zur Trennung ihrer Verbraucher bestehen. Die Vorschau-Zusammenstellung und lokalisierte Darstellung verbleiben in `js/core/app.js` für die späteren Controller-/Steuerungsschritte.

Vorhandene Funktionen in `js/models/astronomy-explorer-model.js` und `js/models/conjunction-model.js` weiterverwenden. Ähnlich benannte Näherungen erst fachlich vergleichen, bevor sie zusammengelegt werden: heliozentrische Längen, geozentrische Winkel und Horizontpositionen sind nicht austauschbar.

Übergangsweise dürfen kurze Adapter die bisherigen Aufrufnamen erhalten. Jeder Adapter bekommt einen konkreten Ablösepunkt; kein zweites dauerhaftes Rechenmodell daneben.

**Fertig, wenn:** Modelle ohne DOM ausführbar sind, Referenzwerte innerhalb der bisherigen numerischen Genauigkeit liefern und Formeln/Quellen weiterhin nachvollziehbar dokumentiert sind.

### 4. Globale Auswahl und Aktualisierung bündeln – abgeschlossen

**Umgesetzt:** `js/core/dashboard-context.js` besitzt Tagesoffset und Ortswahl und verarbeitet die bisherigen URL-Formate. `js/core/date-location-controls.js` besitzt Regler, Schritte, Heute, Gedrückthalten und Zeitraffer einschließlich ihrer Timer und einmaligen Verdrahtung. `js/core/dashboard-refresh.js` verteilt einen gemeinsamen Snapshot an die geordnete Registrierung in `createDashboardRefresh()`. Alte Datum-/Ortszugriffe sind während des Renderlaufs ebenfalls an diesen Snapshot gebunden.

- `selectedSolarDate`, `selectedLocation`, URL-Einlesen/-Schreiben und die Steuerung von Regler, Tages-/Monatsschritten, Heute und Zeitraffer klar zuordnen.
- `refreshDateDrivenTiles` erhält eine übersichtliche Liste der Kachel-Aufrufe mit demselben Kontext. Neue datumsabhängige Kacheln werden an genau dieser Stelle angeschlossen.
- Bei der Anmeldung festhalten, welche Kachel auf Datum, Ort, Sprache, Größenwechsel oder einen regelmäßigen Refresh reagiert. Kein allgemeiner Event-Bus und keine neue Zustandsbibliothek.
- Lokale Regler bleiben lokal: Horizont-Zeitversatz, IDEFIX-Missionszeit und Lichtreise übernehmen ihre bisherigen Zustands-/Resetregeln.
- Bestehende Timer bleiben einmalig: Sekunden-Uhr, halbstündliche Aktualisierung, Zeitraffer und Animationsschleifen nicht versehentlich vervielfachen.

**Fertig, wenn:** Der globale Wechsel auf 01.12.2026 aktualisiert sofort auch beide Mondanzeigen, Vollmonddatum und Richtung. Ort, URL-Auswahl und lokale Kachelsteuerungen behalten ihr Verhalten.

### 5. Zwei Pilot-Kacheln als Controller herauslösen – abgeschlossen

**Erst „Sonnensystem“, dann „Erde & Mond“**, jeweils als eigener prüfbarer Abschnitt.

- **Abgeschlossen:** `js/cards/solar-system.js` übernimmt `renderSolarSystem` und verwendet per injizierten Abhängigkeiten die vorhandene Radiuskonfiguration, Körpergrafiken und Beschriftungsanordnung. Die globale Registrierung übergibt den gemeinsamen Kontext unmittelbar. Resize-Aufrufe verwenden einen vorläufigen Adapter. Der Controller startet keine Timer und registriert keine Ereignisse.
- **Abgeschlossen:** `js/cards/earth-moon.js` übernimmt `renderMoon`, `renderEarthMoon`, lokale Richtungsanzeige und die Zuständigkeit für die schematische Animation; Fachberechnung und Körpergrafiken werden injiziert. Die globale Registrierung übergibt denselben Kontext direkt. Die frühere zusätzliche RAF-Anforderung bei jedem Resize konnte eine weitere dauerhafte Animationskette starten; der Controller garantiert jetzt einen einzigen ausstehenden Frame.
- Controller nach dem vorhandenen Muster `create(dependencies)` aufbauen; ihre Aktualisierung erhält den gemeinsamen Kontext.
- Ereignisse genau einmal verdrahten; vorhandene SVGs, Buttons und fokussierte Elemente bei Aktualisierungen erhalten.
- Start, `pageshow` und Resize der Mondanimation ausdrücklich auf zusätzliche RAF-Schleifen prüfen.

**Fertig, wenn:** Sonnensystem weiter ohne Mond und ohne Erdschatten erscheint, die Radien entzerrt bleiben, die Vergrößerung funktioniert und die Mondphase unabhängig von der schnellen Umlaufanimation dem gewählten Datum folgt.

### 6. Layout und gemeinsame Bedienung herauslösen – abgeschlossen

**In getrennten Abschnitten abgeschlossen:** Raster/Beobachter/Scrollanker in `js/core/dashboard-layout.js`, Kachelgrößen in `js/core/card-sizes.js`/`js/data/card-sizes-config.js`, Hilfe und Navigation in `js/core/card-help.js`/`js/core/card-navigation.js`. Das Modul besitzt sämtliche zugehörigen Zustände, beobachtet nur Desktop-Karten und initialisiert seine Listener/Beobachtung einmal. Bestehende Adapter und der `beforeOpen`-Aufruf bleiben erhalten.

**Startpunkte:** `scheduleMasonryLayout`, `updateMasonryLayout`, `withSuppressedMasonryObserver`, `captureViewportAnchor`, `releasePendingViewportRestoration`, Größensteuerung, `initCardHelp`, Kachelanker und Deep Links.

Der vorhandene `beforeOpen`-Adapter der Grafikvergrößerung bleibt erhalten. Größenbeobachtung bleibt auf Desktop beschränkt; mobile Karten behalten ihren normalen CSS-Fluss. Fehlerbehandlung bleibt auf die beiden bekannten ResizeObserver-Warnungen begrenzt.

**Fertig, wenn:** Datum-/Ortswechsel, Hilfe, lokale Buttons und Vergrößerung keine unerwünschten Scrollsprünge erzeugen. Auch schnelles Schließen/Öffnen, Escape, Tastaturfokus und Wechsel über 760 Pixel werden im Browser geprüft.

### 7. Übrige Fachbereiche nacheinander entflechten

Jede Tabellenzeile ist eine Arbeitsgruppe, keine gemeinsame Großänderung. Innerhalb einer Gruppe zunächst eine Kachel vollständig umstellen.

| Gruppe | Auszulagernde Verantwortung | Unbedingt bewahren |
|---|---|---|
| Begegnungen und Meteorströme – abgeschlossen | `js/cards/conjunctions.js` und `js/cards/meteor-streams.js` erhalten den gemeinsamen Kontext und die bisherigen Modelle/Datumshelfer; Initialisierung in `js/core/app.js`, keine neuen Timer oder Listener | Gleiche Punktgrößen, Winkelvergleiche, Meteor-Aktivitätsperioden und Maximum-Priorität |
| Sternbilder und Himmelsmechanik – abgeschlossen | `js/cards/constellation-month.js`, `js/cards/constellation-year.js`, `js/cards/seasons.js` und `js/cards/retrograde.js`/`js/models/retrograde-model.js` sowie `js/cards/inner-planets.js`/`js/models/inner-planets-model.js` abgeschlossen | Beschriftungen, Nord-/Südbezug, Datumskopplung und deklarierte Näherungen |
| Weitere Astronomiekacheln – abgeschlossen | Baryzentrum, Lagrange-Punkte (`js/cards/lagrange.js`/`js/models/lagrange-model.js`), Analemma (`js/cards/analemma.js`/`js/models/analemma-model.js`), Exoplaneten (`js/cards/exoplanets.js`/`js/models/exoplanets-model.js`), Satelliten (`js/cards/satellites.js`/`js/models/satellites-model.js`), Kleinkörper (`js/cards/small-bodies.js`/`js/models/small-bodies-model.js`) und Raumsonden (`js/cards/spacecraft.js`/`js/models/spacecraft-model.js`) | Jeweilige Konfiguration und Sondersteuerung; kein neues Sammelmodell für fachlich verschiedene Karten |
| Externe Daten – abgeschlossen | `js/services/aurora-data.js`/`js/cards/aurora-card.js` und `js/services/bsky-feed-data.js`/`js/cards/bsky-feed-card.js` trennen NOAA- und Bluesky-Abrufe von ihren Karten | NOAA-Quellen/Fallback, 20-Minuten-Cache, in-flight-Deduplizierung, Bluesky-Fehler-/Leer-/Tagesfallback; gleicher 30-Minuten-Refresh und keine Abrufe bei Datum-/Ortswechseln |
| Zeitwerkzeuge – entfernt | Die ungenutzte, mit `display:none` ausgeblendete Zeitwerkzeug-Kachel mit Uhr, Stoppuhr, Countdown, Sprachausgabe und Anzeigeeinstellungen wurde mitsamt ihren nur dafür verwendeten Texten, Styles, Listenern und dem Sekunden-Timer entfernt. | Die aktiven Datums-/Ortsregler und der halbstündliche Datenrefresh bleiben erhalten. |

### 8. Kalender zuletzt als eigenen Bereich trennen

Zuerst die vollständige Zusammenführung der Kalenderdaten in ein Modell verschieben, anschließend Filter/Auswahl und Darstellung in einen eigenen Controller.

`Heute faszinierend` erhält weiterhin den vollständigen Datenbestand, unabhängig von Kategorie, Ansichtsmodus oder „Vergangenes anzeigen“. Ereignisschlüssel, Sortierung, regionale Finsternisangaben und ICS-Ausgaben bleiben stabil.

**Fertig, wenn:** Listen-, Monats- und Zeitachsenansicht, Detailauswahl, Downloads und mobile Höhe dem Ausgangsstand entsprechen. Kalender-/ICS-Artefakte nur neu erzeugen, wenn die vorhandene Frischeprüfung dies verlangt.

**Umgesetzt:** `js/models/calendar-model.js` besitzt Sprachfallback, stabile Ereignisschlüssel, Sortierung, Kategorie-/Vergangenheitsfilter und Monatsgruppierung. `js/cards/calendar.js` besitzt Ansichts-/Filterzustand, Ereignisauswahl, einmalige Listener-Verdrahtung, Listen-/Monatsansichten, Detaildialog, Einzel- und Kategorie-ICS-Downloads. Templates und CSS bleiben unverändert.

### 9. Initialisierung und Dokumentation abschließen

- `js/core/app.js` enthält am Ende nur noch Abhängigkeiten, Initialisierung, Anmeldung der Controller und Start der zentral verwalteten Timer.
- Übergangsadapter und nicht mehr genutzte globale Variablen entfernen. Doppelte Adaptereinträge wie das derzeit zweimal übergebene `getAltitudeEstimate` beim Umstecken bereinigen.
- Kachelspezifisches CSS gegebenenfalls in eigenen kleinen Folgeschritten verschieben. Dabei Selektoren und wirksame Reihenfolge bewahren; Typografie-Tokens und Grundlayout bleiben gemeinsam.
- Verbleibende alte HTML-Strings nur innerhalb ihres jeweiligen Bereichs in Templates überführen; kein flächiges Umschreiben zusammen mit einem Modellumzug.
- `TECHNIK.md` auf die neue Zuständigkeit aktualisieren; veraltete Zeilennummern durch Funktions-/Modulnamen ersetzen. Berechnungsdokumentation und Hilfe nennen die tatsächlichen Modellquellen.
- Tests prüfen die öffentlichen Modell-/Controller-Verträge statt langfristig Funktionen anhand von Einrückung aus Quelldateien auszuschneiden.

**Fertig, wenn:** Kein großes Restmodul die bisherigen 285 Funktionen nur unter anderem Dateinamen bündelt. Jede verbleibende Funktion und jeder Timer hat eine nachvollziehbare Zuständigkeit; reine Modelle sind unabhängig vom DOM.

## Prüfungen und Abschluss je Abschnitt

1. Nur den vorgesehenen Bereich verschieben; fachliche Änderungen gesondert behandeln.
2. Betroffene Unit-/Vertragstests ausführen. Verfügbare Suiten: `test:explorer`, `test:daily`, `test:conjunctions`, `test:bodies`, `test:typography`, `test:idefix`, `test:knowledge`, `test:voyager` und `test:updates` über `npm run`.
3. `npm run validate:repo` und `git diff --check`; neue Dateien in der Build-Prüfung erfassen. Bei einer ausführbaren Auslieferung App-Metadatum, `version.json`, Paketversion und lokale Asset-Parameter gemeinsam aktualisieren. Dieser reine Plan verändert die Version nicht.
4. Betroffene Bedienungswege in Chromium und WebKit prüfen. Bei sichtbaren Änderungen auch Screenshots ansehen; konkrete Sollwerte und DOM-/Fokusidentität prüfen, nicht nur „keine Fehlermeldung“.
5. Bei einem reinen Modellumzug mindestens dessen Verbraucher prüfen; die vollständige Browsermatrix an den Schritten 1, 4, 6 und am Ende ausführen. Physisches iPhone-Verhalten und Produktion getrennt von WebKit-/lokalen Ergebnissen ausweisen.
6. Dokumentation und den Stand dieses Plans nachziehen. Zum nächsten Abschnitt erst wechseln, wenn die Änderungen klar abgegrenzt und die zugehörigen Prüfungen erfolgreich sind. Git-Commit und Push erfolgen nur nach entsprechendem Auftrag.

Zu jeder Etappe gehören insbesondere die für sie relevanten Fälle: Datum 01.12.2026 und Heute-Reset, Ortswechsel, Zeitumstellung, drei Sprachen, schmale/weite Ansicht, Resize über die mobile Grenze, Deep Links, stabile lokale Auswahl sowie Vergrößern/Schließen nach einem Datumswechsel. Netzabrufe dürfen durch reine UI-Aktualisierung nicht zusätzlich vervielfacht werden.

## Fortschritt

- [x] 0: Vergleichsbasis und reproduzierbare Browserprüfungen
- [x] 1: Hauptskript extern, Tests und Ladereihenfolge angepasst
- [x] 2: Datums- und Formatierungshilfen
- [x] 3: Rechenmodelle in einzelnen Fachpaketen
- [x] 4: Gemeinsamer Kontext und zentrale Aktualisierung
- [x] 5: Pilot-Controller Sonnensystem und Erde/Mond
- [x] 6: Raster/Scrollanker, Kachelgrößen, Hilfe und Navigation
- [x] 7: Astronomiekacheln und externe Daten modularisiert; ungenutzte versteckte Zeitwerkzeug-Kachel samt Sekunden-Timer entfernt
- [x] 8: Kalenderdatenmodell und kompletter Renderer/Controller in eigenen Modulen; Chromium-/WebKit-Abnahme bestanden
- [x] 9: Kleine Initialisierung, Übergänge entfernt, Gesamtabnahme

**Nachweis der beiden Einheiten:** `scripts/baselines/solar-eclipse-models.json` sichert 30 Sonnen-/Geometriefälle (fünf Orte und sechs Daten) sowie 260 Sichtbarkeitsklassen aus dem Stand vor der Auslagerung. Die Referenz verwendet für die erhaltenen lokalen Datumshelfer ausdrücklich `Europe/Berlin`. Die neuen Modultests prüfen diese Werte sowie Polarfälle, manuelle Vorrangregeln und Zeitprofile. Der Browserlauf prüft zusätzlich Sonnenlabels und Finsternisanzeigen am 12.08.2026, 12.01.2028 und 21.12.2026 in den bestehenden Sprach-/Breiten-/Engine-Fällen.

**Nachweis für die neuen Einheiten:** `scripts/dashboard-controls.test.js` prüft Kontextbindung und Wiederherstellung auch nach einem Fehler, URL-/Datumsauswahl, Grenzen, native Monatsüberläufe, einmalige Verdrahtung und Timerbesitz. Der Browserlauf prüft zusätzlich echte Tages-/Heute-Buttons, den Breitenwechsel über 760 Pixel, erhaltene Solar-Templates und SVGs, Fokus, die fehlende Mondgrafik und den ausgeblendeten Erdschatten.

**Nachweis der beiden neuen Einheiten:** `scripts/earth-moon-controller.test.js` prüft wiederholten Start, `pageshow`, Resize und die einzelne 12-Sekunden-Animationskette. Die bisherigen drei Layout-Quelltexttests wurden durch `scripts/dashboard-layout.test.js` an der tatsächlichen Modulschnittstelle ersetzt: Spans, Batch-Verhalten, einmalige Initialisierung, Desktop-/Mobile-Wechsel, deduplizierte Resize-Lieferungen und freigegebene Scrollkorrekturen. Ein zusätzlicher Regressionstest stellt sicher, dass eine erfolgreiche `scrollTop`-Korrektur nicht nochmals über `window.scrollBy` angewendet wird; die bisherige Doppelkorrektur wurde beim Browser-Scrolltest sichtbar und entfernt. Der Browserlauf prüft zusätzlich erhaltene Mondgrafik/Kompass, den Scrollanker bei einem Datumswechsel und wiederholtes Öffnen/Schließen der Vergrößerung.

**Nachweis der nächsten zwei Einheiten:** `scripts/card-sizes.test.js` prüft Standards, den bisherigen Speicherschlüssel, Einzel-/Gesamtänderungen, erneut geladene Einstellungen, ungültige Daten und gesperrten Speicher. `scripts/card-navigation-help.test.js` prüft stabile Anker, URLs ohne Neuladen, Auswahl/Fokus, Sprachtexte und nachträglich verfügbare beziehungsweise fehlschlagende KaTeX-Renderer. Die Hilfe-Struktur wurde von zusammengesetzten HTML-Blöcken auf kompakte HTML-Templates umgestellt; Rich-Text-Inhalte bleiben kuratiert. Der Browserlauf prüft zusätzlich Größenbuttons, mobile Ausblendung, wiederholte Initialisierung, Hilfe/Escape und Kachelnavigation bei unverändertem Datum und Ort.

**Nachweis der nächsten zwei Einheiten:** Vor der Auslagerung wurde mit `PLANETENUHR_ENCOUNTER_BASELINE=1` die vollständige Referenz `scripts/baselines/phase-07-encounters.json` aufgezeichnet. Sie erweitert die bisherigen 18 Browserfälle um Ereignisse, Positionen, Winkeltexte und Zusammenfassungen sowie Meteor-Bögen, beschriftete Leitlinien, Peakmarker und Radianten. Die bestehenden Modell-/Winkeltests prüfen weiterhin die reale Schnittstelle. Der Browserlauf sichert zusätzlich gleiche Punktradien und gerade Leitlinien mit `fill=none`. Konjunktionen bestanden nach der ersten Einheit zusätzlich den einzelnen mobilen Fall `chromium-de-390`.

**Nachweis für die beiden Sternbild-Einheiten:** `js/cards/constellation-month.js` besitzt Monatsauswahl, Sternkarte, Sternbeschriftung und Richtungshinweis; `js/cards/constellation-year.js` besitzt Jahresrad, vergrößerte Miniaturen, Beschriftungsbegrenzung und Datumsmarker. Beide erhalten den gemeinsamen Kontext direkt aus der Refresh-Registrierung; ungenutzte Aufrufadapter entfallen. Konstellationen und Sprachtexte verbleiben in ihren bestehenden Konfigurationsdateien, SVG- und HTML-Knoten werden aus Templates erzeugt. `scripts/constellation-cards.test.js` prüft Mittelpunkt, automatische und ausdrücklich vorgegebene Sternlabels sowie fehlende Kacheln. Die vor der Auslagerung aufgezeichnete Referenz `scripts/baselines/phase-07-constellations.json` ergänzt die 18 Fälle um exakte Hashwerte der beiden Grafiken, des Richtungshinweises und der Zusammenfassungen. Der Browserlauf prüft zusätzlich alle zwölf Monate, Miniaturanzahl, aktuelle Monatsmarkierung, Namensgrenzen, erhaltene Hilfebuttons und vorhandene Grafikvergrößerungen mit Escape/Fokus.

**Nachweis für Jahreszeiten und Retrograd-Phasen:** `js/cards/seasons.js` besitzt die unveränderte schematische Jahresbahn, Achsenansicht und Zusammenfassung. `js/models/retrograde-model.js` trennt tägliche Bewegung, Stationssuche, Längenentfaltung und Bahnabtastung vom DOM; `js/cards/retrograde.js` füllt die vorhandenen Zeilen und neue SVG-Templates. Beide Controller erhalten den gemeinsamen Kontext direkt und starten keine Timer oder Listener. Alte Render-/Modellfunktionen wurden aus `js/core/app.js` entfernt. Vor der Auslagerung wurden 25 vollständige Modellfälle in `scripts/baselines/retrograde-model.json` sowie exakte Grafik-/Text-Hashes in der 18-Fälle-Referenz `scripts/baselines/phase-07-mechanics.json` gesichert. `scripts/mechanics-cards.test.js` prüft diese Werte, Nullmeridian-Übergänge, Stations-/Leerfälle, unveränderte Eingabedaten, Saison-Schwellen und fehlende Kacheln. Der Browserlauf prüft zusätzlich wiederholtes Rendern, erhaltene Hilfebuttons, gültige eindeutige SVG-Pfeilreferenzen sowie Hilfe und sichtbare Grafikvergrößerungen mit Escape/Fokus.

**Nachweis für innere Planetenphasen und Baryzentrum:** `js/models/inner-planets-model.js` enthält die unveränderte planare Beleuchtungs-/Elongationsrechnung und Terminator-Geometrie; `js/cards/inner-planets.js` füllt Zeilen und SVG-Templates. `js/models/barycenter-model.js` enthält Massengewichtung, Sonnenversatz und 50-Jahres-Abtastung. Massenverhältnisse, Sonnenradius und Buttonzuordnung liegen in `js/data/barycenter-config.js`. `js/cards/barycenter.js` besitzt Vergleichsauswahl und einmalige Buttonverdrahtung; die Auswahl bleibt über globale Datumsschritte hinweg bestehen. Alte Zustände, Listener und Rechen-/Renderfunktionen wurden aus `js/core/app.js` entfernt. Die zuvor gesicherten zehn Phasenfälle und neun Baryzentrumfälle samt kompletten Spuren liegen in `scripts/baselines/planet-cards-models.json`; `scripts/planet-cards.test.js` prüft die echten Schnittstellen einschließlich Massennenner, Beitragsreihenfolge, Phasenbegrenzung, einmaliger Listener und fehlender Ziele. Die vollständige Browserreferenz `scripts/baselines/phase-07-planet-cards.json` enthält zusätzlich Grafiken/Texte für alle drei Einflussmodi an den bisherigen Referenzdaten. Echte Buttonklicks, Datumswechsel, erhaltene Moduswahl, Hilfe, sichtbare Vergrößerung und Fokus werden zusätzlich geprüft.

**Nachweis für Lagrange-Punkte und Analemma:** `js/models/lagrange-model.js` berechnet die bisherige schematische Sonne-Erde-Geometrie, `js/cards/lagrange.js` zeichnet sie aus SVG-Templates. `js/models/analemma-model.js` aggregiert die vorhandenen Sonnenformeln aus `js/models/solar-visibility-model.js` über ein ausgewähltes Kalenderjahr; `js/cards/analemma.js` erhält Datum, Ort und Sprache unmittelbar aus dem gemeinsamen Kontext. Bisherige Tages-/Sommerzeitkonventionen, Näherungen, Beschriftungen und Projektionen bleiben erhalten. Die fünf nur hier verwendeten Sonnenadapter und die beiden alten Renderer sind aus `js/core/app.js` entfernt. `scripts/baselines/solar-geometry-models.json` hält fünf Lagrange-Geometrien und neun vollständige Jahresläufe aus dem vorherigen Stand fest; die Referenz verwendet ausdrücklich `Europe/Berlin`. `scripts/solar-geometry-cards.test.js` prüft diese Werte, die Dreiecks-/Radialgeometrie, Schaltjahr, explizite Eingaben, unveränderte Parameter und fehlende Ziele. Die zuvor aufgezeichnete Browserreferenz `scripts/baselines/phase-07-solar-geometry.json` erweitert die 18 Fälle um beide Grafiken und Zusammenfassungen. Zusätzliche Browserprüfungen sichern explizite Orts-/Jahreswechsel, fünf Lagrange-Punkte, zwölf Monatsmarken, erhaltene Hilfebuttons sowie Hilfe und sichtbare Vergrößerung mit Escape/Fokus.

**Nachweis für Exoplaneten und Satelliten:** `js/models/exoplanets-model.js` enthält die bisherigen Kepler-Umlaufzeiten, die Normalisierung je System und schematische Phasen/Positionen; `js/cards/exoplanets.js` übernimmt die Mini-Karten und Zusammenfassung. `js/models/satellites-model.js` enthält die unveränderte Epochen-/Periodenrechnung samt projizierten Ellipsen und Rotation; `js/cards/satellites.js` übernimmt Grafik und Details einschließlich der vorhandenen Ersatzdarstellung. Deren Struktur und die Zusammenfassungsgruppe liegen jetzt ebenfalls in Templates. Daten verbleiben in `js/data/phenomena-config.js`; beide Controller erhalten den gemeinsamen Kontext und starten keine Timer, Listener oder Datenabrufe. Alte Renderer und Exoplaneten-Helfer sind aus `js/core/app.js` entfernt. Die zuvor gesicherte Modellreferenz `scripts/baselines/orbit-cards-models.json` enthält 96 Exoplaneten- und 20 Satellitenzustände. `scripts/orbit-cards.test.js` prüft diese über die echten Schnittstellen, Kepler-Skalierung, bisherige Grenzwertbehandlung, Periodizität, Epochenwechsel und fehlende Ziele. `scripts/baselines/phase-07-orbit-cards.json` ergänzt die 18 Browserfälle um beide Grafiken und Zusammenfassungen. Zusätzliche Prüfungen sichern Zeitwechsel, Markeranzahl, leere Konfiguration, die Satelliten-Ersatzdarstellung, erhaltene Bedienelemente sowie Hilfe und sichtbare Vergrößerung mit Escape/Fokus.

**Abnahme für Exoplaneten und Satelliten (29.10.2026):** 122 Tests und Build sind erfolgreich. Alle 18 lokalen Browser-Vergleichsfälle bestehen: neun Chromium- und neun WebKit-Fälle, jeweils Deutsch/Englisch/Französisch bei 320, 390 und 1280 Pixeln Breite. Damit ist diese Etappe vollständig geprüft.

**Nachweis für Kleinkörper und Raumsonden:** `js/models/small-bodies-model.js` hält Quadratwurzel-Skalierung, Kometenellipsen und Außenlabels DOM-frei; `js/cards/small-bodies.js` besitzt das SVG, die bestehenden Detail-Hit-Flächen und die bislang deaktivierten Zoomgesten. `js/models/spacecraft-model.js` kapselt logarithmische Distanz-, Bézier- und Labelgeometrie; `js/cards/spacecraft.js` rendert die unveränderte schematische Übersicht. Daten bleiben in den bestehenden Konfigurationsdateien. Beide statischen Kacheln sind nicht an den globalen Datums-/Ortskontext gebunden und erzeugen keine Timer oder Datenabrufe. `scripts/static-orbits.test.js` prüft 20 Kometenbahnen/Labels, zehn Raumsondenzustände, Grenzwerte, Winkel und fehlende Ziele gegen die Vorher-Referenz. `scripts/baselines/phase-07-static-orbits.json` vergleicht zusätzlich SVGs und Zusammenfassungen in 18 Chromium-/WebKit-Fällen über drei Sprachen und drei Breiten. App-Version: 1.42.

**Abnahme für Kleinkörper und Raumsonden (29.10.2026):** 128 Tests, Build und Browservergleich sind erfolgreich. Die vollständige Browsermatrix umfasst 18 lokale Fälle: Chromium und WebKit, jeweils Deutsch/Englisch/Französisch bei 320, 390 und 1280 Pixeln.

**Nachweis für Aurora und Bluesky:** `js/data/aurora-data-config.js` enthält NOAA-Endpunkte und Cachedauer; `js/services/aurora-data.js` übernimmt Tabellen-/Objekt-Normalisierung, letzte gültige Kp-Messung, 20-Minuten-Cache und geteilte laufende Anfragen. `js/cards/aurora-card.js` erhält den bisherigen Status, die deutschen Regionshinweise, Quellen-/Zeitzeilen und alle Sprachtexte. `js/services/bsky-feed-data.js` besitzt Author-Feed-URL, Bildpost-Extraktion, Sortierung und Auswahl des heutigen oder letzten Posts; `js/cards/bsky-feed-card.js` rendert Beiträge aus Templates und behält je Konto getrennte Fehler- und Leerzustände. Der gemeinsame Start und 30-Minuten-Intervall verbleiben in `refreshDynamicTiles()`; Datum- und Ortswechsel lösen keine zusätzlichen Anfragen aus. `scripts/external-data.test.js` prüft sechs Fälle zu Formatvarianten, Grenzwerten, Cache/Parallelaufrufen, Fallbackquellen, Bildauswahl und Accountfehlern. `scripts/baselines/phase-07-external-data.json` hält die Vorher-Ausgabe der beiden Karten in 18 Sprach-/Breiten-/Browserfällen mit deterministischen NOAA- und Bluesky-Antworten fest.

**Abnahme Aurora und Bluesky (29.10.2026):** 134 Tests und Build sind erfolgreich. Alle 18 Chromium-/WebKit-Vergleichsfälle bestehen in drei Sprachen und drei Breiten. Der Testserver bestätigt zusätzlich, dass Datum-/Ortswechsel keine weiteren NOAA- oder Bluesky-Abrufe auslösen. App-Version zum damaligen Abnahmezeitpunkt: 1.43.

**Kalenderabnahme (29.10.2026):** Die vollständige Referenz `scripts/baselines/phase-07-external-data.json` besteht unverändert in 18 Fällen: Chromium und WebKit, Deutsch/Englisch/Französisch sowie 320, 390 und 1280 Pixel. Erweiterte Interaktionen prüfen zusätzlich Kategorie-/Ansichtsfilter, „Vergangenes anzeigen“, Listen-Aufklappen, Details aus Liste und Monat, Einzel-ICS-Download, Schließen per Taste und mobile Höhe des aktiven Kalendermodus. Die 134 Repositorytests und der Build bestehen ebenfalls. Beim Browserlauf wurde eine verbliebene Abhängigkeit der Erde-Mond- und Sonnensystemkacheln auf die entfernte Zeitzonen-Auswahl gefunden und durch den Rückfall auf die lokale Browserzeitzone behoben.

**Abschnitt 9 abgeschlossen:** Die ungenutzten Weiterleitungsfunktionen für Datumssteuerung, Layout/Viewport, Kartengrößen, Kartennavigation, Hilfe und URL-Parser wurden aus `js/core/app.js` entfernt. Der globale Fehlerhandler liegt in `js/core/dashboard-errors.js`; `js/core/date-location-controls.js` besitzt Zustand und Bedienung des Datums-/Ortspopups, der mobilen Datumsleiste und des Ortswählers. Weiterleitungen auf Koordinaten-, Planeten-, Mond-, Sonnen- und Finsternismodelle sowie ungenutzte Render-/Namensadapter und Eclipse-/Kompass-Helfer wurden entfernt. Datumsschlüssel, Zeitzonenauflösung, Kalenderabstände, Sonnenlänge, heliozentrische Position, geozentrischer Vektor und Finsternisstatus verwenden direkt ihre Fachmodule. Die Astronomieübersicht wird über die Refresh-Registry gerendert. Die zuletzt verbliebene UI-Übersetzungseinrichtung wurde nach `js/core/dashboard-i18n.js` ausgelagert; `js/core/app.js` verbindet die Abhängigkeiten und startet die App. Dokumentation für verbleibende `js/core/app.js`-Hilfsfunktionen wurde ergänzt.

**Zusätzlicher Schritt:** Die Sonnenlicht-Kachel wurde nach `js/cards/sunlight-card.js` verschoben. Der Controller erhält Datum und Ort aus dem gemeinsamen Kontext, berechnet Sonnenaufgang/-untergang und Dämmerungssegmente und aktualisiert bestehende Markierungen samt zugänglichen Bereichslabels. `formatDuration` und Timeline-Helfer sind aus `js/core/app.js` entfernt. `scripts/sunlight-card.test.js` deckt Zeitpositionen, Dauer, Beschriftung und fehlende Polarereignisse ab; vollständige Abnahme folgt mit den verbleibenden Initialisierungs-/Renderblöcken.

**Zusätzlicher Schritt:** `js/cards/planet-visibility.js` übernimmt die Planeten-Sichtbarkeitsleiste und die Nachtfenster-Grafik. Beide Renderpfade erhalten Datum und Ort über denselben Dashboard-Kontext, rechnen mit dem bestehenden Sonnen-/Planetenmodell und klonen die vorhandenen Template-Zeilen. `scripts/planet-visibility.test.js` prüft die fünf Planeteneinträge, die Winkelklassen, Nachtfenster, Lokalisierung und fehlende Ziele.

**Zusätzlicher Schritt:** Der Nordhimmel-Renderer samt Punktrotation und Kuppelprojektion liegt nun in `js/cards/polaris-card.js`. Datum und Ort kommen direkt aus dem gemeinsamen Refresh-Kontext; Zeit- und Zusammenfassungsformatierung bleiben injiziert. Die zuvor ungenutzte Asterismus-Zeichenhilfe wurde nicht mit übertragen.


**Zusätzlicher Schritt:** `js/cards/eclipse-geometry.js` übernimmt die globale Sonne-Erde-Mond-Skizze samt lokalisiertem Sichtbarkeitsstatus und Erklärung. Datum und Ort kommen direkt aus dem Dashboard-Kontext; die Erde-Mond-Kachel ist nicht länger an den zusätzlichen Eclipse-Renderer gekoppelt. Der Renderer nutzt weiter dieselben Mond-/Knotenmodelle und Sichtbarkeitshelfer. `scripts/astronomy-explorer.test.js` prüft die Refresh-Anbindung; der Browserlauf kontrolliert SVG-Ansicht und Status an kuratierten Sonnen-/Mondfinsternis-Terminen. Die vollständige Vorher-/Nachher-Abnahme folgt mit der Gesamtabnahme.

**Zusätzlicher Schritt:** Die lokalen Durchreichfunktionen `selectedSolarDate()` und `selectedLocation()` wurden entfernt. `js/core/app.js` und die Browserprüfungen lesen Datum und Ort direkt aus `dashboardContext`; dieselben Accessors werden direkt an Raumsonde, Explorer und Highlight-Kachel übergeben. Die Refresh-Registry hält weiterhin einen gemeinsamen Snapshot für alle Verbraucher.

**Zusätzlicher größerer Schritt:** `js/cards/moon-nodes-card.js` übernimmt den Renderer „Mondknoten & Finsternis-Saison“, die lokale 10-Tage-Vorschau und die dazugehörigen Mondrichtungs-/Phasenhelfer. Der Renderer erhält Datum und Ort aus dem Refresh-Snapshot. Die Erde-Mond-Kachel bezieht ihre Mondrichtung jetzt aus derselben Controller-API. Übersetzungen, Ereignisdaten, Rechenmodelle und HTML-Templates bleiben in ihren bisherigen Dateien. `scripts/astronomy-explorer.test.js` prüft den Refresh-Aufruf mit dem gewählten Datum; der Browservergleich kontrolliert die SVG-Ausgabe und bestehenden Text-/Grafikreferenzen.

**Zusätzlicher Schritt:** Das animierte Jupitersystem wird von `js/cards/jupiter-card.js` aus `js/data/jupiter-moons-config.js` aufgebaut. Die zehn Orbitgrößen und Animationszeiten liegen als Daten vor; wiederholtes Rendern ersetzt nur die erzeugten Mond-Orbits, während Planet und Template bestehen bleiben. `index.html` enthält ein Orbit-Template, und CSS erhält die dynamischen Größen über Custom Properties. `scripts/jupiter-card.test.js` prüft Anzahl, Konfiguration, Wiederholbarkeit und fehlende Ziele; die Browserprüfung sichert Darstellung und tatsächliche CSS-Werte.

**Zusätzlicher Schritt:** `js/cards/planetary-systems-card.js` erzeugt die vier Mars-, Saturn-, Uranus- und Neptun-Systeme aus den Daten in `js/data/planetary-systems-config.js`. Planeten-/Mondnamen behalten ihre bestehenden Übersetzungsattribute; orbitale Maße und beschleunigte Umlaufzeiten werden als CSS Custom Properties gesetzt. Zwei HTML-Templates ersetzen die ausgedehnte Liste fest verdrahteter Elemente. Ein Modultest sichert vier Systeme, 24 Monde, Beispielwerte und wiederholtes Rendern; der mobile Browservergleich prüft auch die berechneten CSS-Werte.

**Gesamtabnahme am 30.10.2026:** `node --test scripts/*.test.js` besteht mit 145/145 Tests; `npm run validate:repo` besteht einschließlich Encoding- und Build-Prüfung; `git diff --check` ist sauber. Der vollständige Chromium-Vergleich bestand in neun Fällen (de/en/fr × 320/390/1280), und der vollständige WebKit-Vergleich bestand ebenfalls in neun Fällen. Ein erster paralleler WebKit-Lauf machte den Kalenderklick instabil; dieselben Fälle wurden anschließend einzeln sequenziell wiederholt und bestanden, einschließlich des isolierten Wiederholungslaufs für `webkit-en-320`. Der Browserprüflauf wurde mit bereits installierter Playwright-Laufzeit und WebKit 26.5 ausgeführt. Diese Prüfung belegt die Browsermatrix, nicht die native Darstellung auf einem echten iPhone.
