# Technik der Planetenuhr

Diese Datei beschreibt Aufbau, Entwicklung und Pflege der App. [Zur Übersicht im README](README.md) · [Zu den Berechnungen](BERECHNUNGEN.md)

## Projektstruktur

- `mnemonics-config.js`: 31 geprüfte Inhalte mit stabilen IDs, Kategorien, Originalsprache, deutschen/englischen/französischen Texten und Quellen; Stand 19. Oktober 2026.
- `sky-knowledge.js`, `sky-knowledge.css`: Controller und Darstellung der Kachel „Himmelswissen“.
- `sky-knowledge-graphics-config.js`, `sky-knowledge-graphics.js`: lokalisierte Bildunterschriften und deklarative SVG-Szenen sowie deren Template-Renderer.


- `diagram-details.js`, `diagram-details.css`: lesbare, statische SVG-Detailansichten für Kacheln mit kleinen Diagrammbeschriftungen.

- `index.html`, `styles.css`
  Seitenstruktur, Vorlagen, Darstellung, Interaktion und bestehende astronomische Berechnungen
- `astronomy-explorer.js`, `astronomy-explorer.css`
  Horizontpanorama und interaktive Lichtreise; verwenden die gemeinsamen Datums-, Orts- und Kachelgrößen-Einstellungen
- `astronomy-explorer-config.js`, `astronomy-explorer-model.js`
  Physikalische Konstanten, Planetenlisten, Umrechnung von J2000 in mittlere Äquatorkoordinaten des Datums sowie Lichtlaufzeiten
- `translations.js`\
  UI-Texte in Englisch, Deutsch und Französisch
- `card-help-config.js`\
  Inhalte für die `?`-Popups jeder Kachel
- `calendar-events.js`\
  kuratierte Himmelskalender-Ereignisse
- `eclipse-calendar-config.js`, `extended-calendar-config.js`\
  automatisch ergänzte Finsternis- und wiederkehrende Kalenderereignisse
- `calendar-sources.json`\
  zentrale Quellenliste für den Himmelskalender mit Prüfintervallen und Abdeckungszielen
- `phenomena-config.js`\
  Konfiguration für Meteorströme, Sternbilder, Raumsonden und weitere Phänomene
- `small-bodies-config.js`\
  Kleinkörper, Kometen und Gürtel für die entsprechende Kachel
- `bsky-feed-config.js`\
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

Die App ist als einzelne statische HTML-Datei aufgebaut. Struktur, Styling, Interaktion und Berechnungen leben überwiegend in `index.html`, während Inhalte und Texte in separate Konfigurationsdateien ausgelagert sind.

### Zentrale Zustände

Die wichtigsten globalen Zustände sind:

- `solarDayOffset`\
  verschiebt das gewählte Datum relativ zu `Date.now()`
- `selectedLocationKey`\
  bestimmt die aktuell gewählte Stadt
- Sprachzustand über `lang` und `translations.js`

Die zentrale Datumsfunktion ist:

- `index.html:4570`\
  `selectedSolarDate()`

Die zentrale Ortsfunktion ist:

- `index.html:4574`\
  `selectedLocation()`

### Datums- und Ortsfluss

Das Overlay `Datum & Ort` verändert nicht direkt jede Kachel einzeln. Stattdessen aktualisiert es den globalen Zustand und stößt danach einen gemeinsamen Refresh an.

Wichtige Stellen:

- `index.html:4248`\
  `refreshDateDrivenTilesWithAnchor()` aktualisiert datumsabhängige Kacheln und versucht die Scroll-Position stabil zu halten.
- `index.html:4596`\
  `refreshDateDrivenTiles()` rendert alle datumsgekoppelten Astro-Kacheln neu.
- `index.html:6332`\
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

- `translations.js`\
  UI-Texte
- `card-help-config.js`\
  Inhalte der `?`-Popups
- `calendar-events.js`\
  kuratierte Ereignisse
- `phenomena-config.js`\
  Meteorströme, Raumsonden, Sternbilder und weitere Phänomene
- `small-bodies-config.js`\
  Kometen und Gürtel
- `bsky-feed-config.js`\
  Bluesky-Feed-Konten

Die mathematische und grafische Verarbeitung liegt überwiegend in `index.html`; die neuen Astronomie-Kacheln verwenden zusätzlich `astronomy-explorer.js` und `astronomy-explorer-model.js`.

### Dynamische Aktualisierung

Nicht alles hängt nur am manuellen Datumswechsel. Es gibt zusätzlich laufende oder periodische Updates:

- `index.html:6373`\
  `setInterval(updateTime, 1000)` für die Uhr
- `index.html:6377`\
  `refreshDynamicTiles()`
- `index.html:6378`\
  halbstündlicher Refresh für zeitabhängige Kacheln

So bleiben aktuelle Elemente wie Uhrzeit, Tageslicht, Kalenderbezüge oder Feed-Inhalte nicht auf dem Stand des Seitenladens stehen.

### Layout und Reflow

Nach vielen Render-Vorgängen wird das Kartenlayout erneut organisiert:

- `index.html:4221`\
  `scheduleMasonryLayout(...)`

Diese Funktion wird nach zahlreichen Kachel-Updates erneut aufgerufen, damit unterschiedlich hohe Karten im Grid sinnvoll neu einsortiert werden.

Die Kachel-Größenbeobachtung ist nur oberhalb von 760 Pixeln aktiv. In der mobilen Ansicht fließen die Karten über CSS untereinander; beim Wechsel dorthin wird der `ResizeObserver` getrennt und beim Wechsel zurück wieder verbunden. Unveränderte Größenmeldungen lösen keinen neuen Layoutdurchlauf aus; tatsächliche Änderungen werden über `requestAnimationFrame` gebündelt. Im Observer-Callback werden keine Layout-Attribute verändert. Die beiden exakten Browsermeldungen `ResizeObserver loop completed with undelivered notifications.` und `ResizeObserver loop limit exceeded` bleiben Konsolenwarnungen ohne blockierenden Dialog. Andere JavaScript-Fehler behalten ihre bisherige Anzeige. Regressionen deckt `npm run test:explorer` ab; WebKit- und Chromium-Browserprüfungen ergänzen die Tests.

### Lokale Aktualisierung der Astronomie-Kacheln

Auch die eigenen SVG-Größenbeobachter in `astronomy-explorer.js` und `idefix.js` führen Zeichenänderungen erst im nächsten `requestAnimationFrame` aus. Mehrere Meldungen werden gebündelt. Insbesondere IDEFIX ändert `viewBox`, Schriftgröße und Beschriftungsposition nur bei tatsächlich veränderter Breite. Dadurch ändern die SVGs während einer ResizeObserver-Auslieferung nicht ihre eigenen Abmessungen.

Lokale Auswahlen behalten ihre Buttons, Regler und SVG-Markierungen im DOM. Die Planetenauswahl ändert nur Hervorhebung, Beschriftung und Detailtext; der Lichtreise-Regler verwendet bereits berechnete Reisedaten. Nur bei Zeit-, Datums- oder Ortsänderungen werden die betreffenden Positionen neu berechnet. Höhenänderungen einer Kachel werden lokal übernommen. Auch bei einer vollständigen Rasterberechnung bleiben die bisherigen Höhenbelegungen während der Messung bestehen, damit die Seite nicht vorübergehend zusammenfällt und die Scrollposition verliert.

Die Tagessegmente werden pro Ort, Zeitzone und lokalem Datum zwischengespeichert. Beim Erkunden innerhalb desselben Tages bleiben Zeitband, SVG-Markierungen und Bedienelemente bestehen; nur Lichtzustand, Zeiger und Positionen werden aktualisiert.

## Einheitliche Typografie und SVG-Details

Die Schriftstufen stehen zentral in `styles.css` als CSS-Variablen. Komponenten verwenden diese Variablen statt eigener Zwischenwerte:

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

`diagram-details.js` misst Textgrößen einschließlich der SVG-Transformationsmatrix. Enthält eine Kachel Beschriftungen unter 11,5 CSS-Pixeln, erhält sie einen lokalisierten „Grafik vergrößern“-Button aus einem HTML-Template. So bleibt die bestehende Übersicht kompakt. Ein natives `dialog` zeigt statische Kopien der aktuellen Grafiken; die Ansicht lässt sich per Tastatur oder Touch in beide Richtungen verschieben. SVG-Geometrie und astronomische Daten werden dafür nicht verändert. Die Vergrößerung berücksichtigt auch verschachtelte Transformationen und hält sichtbare Beschriftungen bei mindestens `--font-diagram`. Farben, Schriften und SVG-Paint-Referenzen werden aus dem aktuellen Zustand übernommen; IDs werden pro Kopie umbenannt, damit Farbverläufe und Filter nicht auf die Originalgrafik zurückgreifen. Beim Schließen werden die Kopien entfernt; die Kacheln behalten ihre Steuerelemente und ihren Zustand.

Neue Inhalte und Größenänderungen werden über einen gebündelten Mutation-/Resize-Durchlauf berücksichtigt. Die Detailansicht selbst wird nicht beobachtet. Die zusätzlichen Texte stehen in `translations.js`. Prüfung: `npm run test:typography` ergänzt die bestehenden Tests; Browserprüfungen kontrollieren tatsächliche Schriftgrößen, SVG-Skalierung, überlaufende Texte sowie Fokus und Scrollposition.

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

Alternativ kann lokal ein einfacher Server genutzt werden:

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
   Nur wenn sich daraus echte Änderungen ergeben, werden `calendar-events.js`, `eclipse-calendar-config.js`, `extended-calendar-config.js` oder verwandte Kalender-Configs gepflegt.
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

Die Einträge in `mnemonics-config.js` haben `id`, `kind` (`mnemonic`, `planet`, `star`), `texts.de/en/fr` und `sources`. Jeder Sprachtext enthält `title` und `explanation`, bei Bedarf `subtitle` und `note`. Sprüche führen zusätzlich `original.language` und `original.text`; `ownWording` kennzeichnet eigene Formulierungen. Fremdsprachige Originale bilden eigenständige Einträge und erhalten in den anderen Sprachen Untertitel.

Beim Laden mischt Fisher–Yates alle IDs. Erst nach einer vollständigen Runde wird erneut gemischt; ein unmittelbarer Wiederholer über die Rundengrenze wird vermieden. Erneute Textaktualisierungen behalten Eintrag und Reihenfolge bei. Der Controller verwendet HTML-Templates und behält Artikel und Button im DOM. Änderungen aktualisieren nur diese Kachel im Masonry-Layout. Es gibt keine Timer und keine Kopplung an Datum oder Ort.

Quellen belegen bei eigenen Formulierungen den Sachinhalt. Die französische p/d-Formulierung fasst eine belegte Methode zusammen; sie ist kein historisch belegtes wörtliches Zitat. Einschränkungen gehören in die sichtbaren `note`-Texte und nicht nur in die ?-Hilfe.

Die 31 Einträge verweisen über ihre IDs in `sky-knowledge-graphics-config.js` auf 29 statische Lehrgrafiken. Wiederverwendete Motive (Planetenfolge, Sternfarben) teilen eine Szene. Jede Szene enthält lokalisierte `caption`-Texte und eine Liste von SVG-Primitiven mit Geometrie und gegebenenfalls lokalisiertem `text`. Sichtbare Texte gehören in diese Konfiguration. Der Renderer klont ausschließlich die SVG-Templates aus `index.html` und setzt Attribute sowie `textContent`; Artikel, Figur und Steuerelemente bleiben erhalten. Bei unveränderter Szene und Sprache bleibt auch das SVG erhalten. Die Grafik hat einen zugänglichen Namen und eine sichtbare Bildunterschrift; Farbe ist nie der einzige Bedeutungsträger.

Die Bilder zeigen keine aktuellen Himmelspositionen. Maßstäbe, verwendete Zahlen und Grenzen sind in `BERECHNUNGEN.md` erläutert. Zusätzliche Sternbildquellen stehen direkt bei den entsprechenden Einträgen.

Prüfung: `npm run test:knowledge` kontrolliert den Inhaltsvertrag, Quellen, Sprachabdeckung und Mischrunden. Browserprüfungen sind zusätzlich für Layout, Fokus und Scrollposition nötig.

## IDEFIX-Kachel und Bahndaten

- `idefix-config.js`: kuratierte Meilensteine, Zeitregler-Schritte, Status-Prüfdatum und Quellen. Landefenster und Sprungtage sind zeitliche Einordnungen des Missionsplans, keine bestätigten Tagesdaten.
- `idefix-ephemeris.js`: lokal gespeicherte JAXA-Vorstartplanung aus JPL Horizons für MMX (−239), einschließlich Abfrage-URLs, Referenzrahmen, UTC-Zeitskala, Abruf- und Revisionsdatum.
- `idefix-model.js`: Interpolation ohne Extrapolation, Klassifikation der Planungsphasen, UTC-Kalenderschritte und schematischer Phobos-Umlauf.
- `idefix.js`, `idefix.css`: Darstellung und Interaktion; wiederholte Strukturen stammen aus HTML-Templates.
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
