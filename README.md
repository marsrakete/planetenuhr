# Planetenuhr

Eine statische HTML-App mit Uhrzeit, Mondphase, Sonnen- und Planetendarstellungen sowie einem Himmelskalender. Die App laeuft ohne Build-Schritt direkt im Browser.

## Dateien

- `index.html` enthaelt Layout, CSS und die astronomische Logik.
- `translations.js` enthaelt alle UI-Texte und Uebersetzungen.
- `calendar-events.js` enthaelt die konfigurierten Himmelskalender-Ereignisse.
- `image_og.jpg` ist das Open-Graph-Vorschaubild.

## Funktionen

- Aktuelle Uhrzeit mit Zeitzonen-, Schrift- und Anzeigeoptionen
- Stoppuhr und Countdown
- Sonnensystem-Ansicht mit Tagesnavigation und Datums-Slider
- Jupiters Monde sowie ausgewaehlte Mondsysteme von Mars, Saturn, Uranus und Neptun
- Erde-und-Mond-Karte mit Mondphase, Beleuchtung, Zyklusfortschritt und naechstem Vollmond
- Tag-/Nachtlaenge fuer Berlin mit Sonnenaufgang, Sonnenuntergang und buergerlicher Daemmerung
- Blaue und Goldene Stunde fuer Berlin als Tageslicht-Leiste
- Sichtbarkeit heute fuer ausgewaehlte Planeten, grob fuer Berlin
- Himmelskalender als filterbare Timeline mit Finsternissen, Meteorstroemen, Jahreszeitenpunkten sowie Planeten-/Mondereignissen

## Bedienung

Die App kann direkt geoeffnet werden:

```text
index.html
```

Der Sonnensystem-Slider verschiebt das angezeigte Datum um bis zu 100 Jahre vor oder zurueck. Die Buttons `<` und `>` springen tageweise; beim Gedrueckthalten laufen sie langsam weiter. `Heute` setzt das Datum zurueck.

## Technische Beschreibung

### Mondphase

Die Mondphase wird ueber die mittlere synodische Periode berechnet:

- synodischer Monat: `29.530588861` Tage
- Referenz-Neumond: `2000-01-06 18:14 UTC`

Aus der Differenz zwischen aktuellem Datum und Referenz-Neumond wird der Zyklusfortschritt bestimmt. Daraus entstehen:

- Phasenname
- Beleuchtung in Prozent
- Fortschrittsbalken
- Mini-Leiste fuer Neumond, erstes Viertel, Vollmond und letztes Viertel
- naechster Vollmond als Naeherung zum naechsten Zykluswert `0.5`

Das ist eine gute visuelle Naeherung, aber keine hochpraezise Ephemeride.

### Sonnensystem

Die Planetenpositionen basieren auf vereinfachten heliozentrischen Bahnelementen nahe J2000:

- grosse Halbachse `a`
- Exzentrizitaet `e`
- Inklination `i`
- mittlere Laenge `L`
- Perihel-Longitude `p`
- aufsteigender Knoten `n`

Fuer das gewaehlte Datum wird die Julianische Tageszahl berechnet. Daraus folgt `T`, die Zeit in Julianischen Jahrhunderten seit J2000. Die Bahnelemente werden linear fortgeschrieben. Die Kepler-Gleichung wird iterativ geloest, anschliessend wird die Position in die Ekliptikebene projiziert.

Die Darstellung ist absichtlich komprimiert:

```text
Bildschirmradius = sqrt(Planetendistanz / Neptun-Distanz) * Maximalradius
```

Dadurch bleiben innere und aeussere Planeten gemeinsam sichtbar. Die Ansicht ist also nicht massstabsgetreu, sondern eine lesbare, heliozentrische Uebersicht.

### Sonnenaufgang, Sonnenuntergang und Daemmerung

Die Berlin-Lichtzeiten verwenden eine uebliche NOAA-nahe Naeherungsformel. Standort:

```text
Berlin: 52.52 N, 13.405 E
```

Berechnet werden:

- Sonnenaufgang/Sonnenuntergang bei Sonnenzenit `90.833°`
- buergerliche Daemmerung bei Sonnenzenit `96°`
- Goldene Stunde bei Sonnenhoehe `+6°`, also Sonnenzenit `84°`

Die Blaue Stunde wird als Zeitraum zwischen buergerlicher Daemmerung und Sonnenaufgang bzw. zwischen Sonnenuntergang und buergerlicher Daemmerung dargestellt. Die Goldene Stunde wird von Sonnenaufgang bis Sonnenhoehe `+6°` und abends von Sonnenhoehe `+6°` bis Sonnenuntergang dargestellt.

Die Zeiten werden in der Zeitzone `Europe/Berlin` formatiert.

### Sichtbarkeit heute

Die Karte `Sichtbarkeit heute` ist eine grobe Orientierung fuer Berlin. Sie berechnet fuer Merkur, Venus, Mars, Jupiter und Saturn den ekliptikalen Abstand zur Sonne:

```text
Elongation = Planet-Laenge - Sonnen-Laenge
```

Aus Vorzeichen und Betrag wird eine einfache Beobachtungskategorie abgeleitet:

- westliche Elongation: eher Morgenhimmel
- oestliche Elongation: eher Abendhimmel
- grosse Elongation bei aeusseren Planeten: Nacht
- geringe Elongation: schwierig

Die farbige Leiste zeigt nicht die echte Horizonthoehe, sondern ein vereinfachtes Zeitfenster. Sie ist als schnelle Orientierung gedacht, nicht als Beobachtungsplanung.

### Himmelskalender

Finsternisse, Meteorstroeme, Jahreszeitenpunkte und Planeten-/Mondereignisse sind feste Tabellen in `calendar-events.js`. Die App fuehrt sie zu einer chronologischen Timeline zusammen.

Die Ereignisse haben diese Struktur:

```js
{
  date: '2026-08-12',
  category: 'eclipse',
  title: 'Totale Sonnenfinsternis',
  visibility: 'Total in Island und Nordspanien; partiell in Europa',
  note: 'Beste europaeische Totalitaetszone: Island und Nordspanien/Balearen-Region.'
}
```

Unterstuetzte Kategorien:

- `eclipse`
- `meteor`
- `planet`
- `moon`
- `season`

Die Karte zeigt standardmaessig die naechsten sechs zukuenftigen Ereignisse. Filter und die Option `Vergangene anzeigen` steuern, welche Ereignisse sichtbar sind. Der Vorteil dieser Loesung: Die Daten sind einfach pflegbar und funktionieren offline. Der Nachteil: Neue Jahre muessen manuell ergaenzt werden.

#### Quellen fuer Kalender-Eintraege

Die aktuellen Eintraege in `calendar-events.js` wurden aus mehreren oeffentlichen Astronomie-Kalendern und Referenzen kuratiert. Sie sind nicht automatisch synchronisiert; bei Erweiterungen sollten die Daten erneut gegen diese Quellen geprueft werden.

- Finsternisse:
  - NASA Eclipse Web Site: https://eclipse.gsfc.nasa.gov/eclipse.html
  - NASA/GSFC Eclipse-Plots, verlinkt aus den jeweiligen Eclipse-Seiten
  - Uebersichtslisten zu Sonnen- und Mondfinsternissen fuer 2026/2027

- Meteorstroeme:
  - International Meteor Organization, Meteor Shower Calendar: https://www.imo.net/resources/calendar/
  - IMO-Kalender-PDFs fuer die jeweiligen Jahre
  - IAU Meteor Data Center als Hintergrundreferenz fuer Meteorstrom-Namen und etablierte Streams

- Jahreszeitenpunkte:
  - timeanddate.com, Seasons: https://www.timeanddate.com/calendar/seasons.html
  - UTC-Zeitpunkte fuer Aequinoktien und Solstitien, fuer die App auf Datumsereignisse reduziert

- Planetenereignisse, Konjunktionen, Oppositionen, Elongationen:
  - In-The-Sky.org, Calendar of Astronomical Events: https://in-the-sky.org/newscal.php
  - Weitere Jahresuebersichten fuer Planeten-Sichtbarkeit und Konjunktionen

- Mondnaehe/Mondferne und Supermond-Hinweise:
  - timeanddate.com Mondentfernungen und Mondphasen
  - In-The-Sky.org Monats-/Jahreskalender

Die Texte in der App sind bewusst beobachtungsorientiert formuliert. Sie fassen die Quellen zusammen und bewerten grob die Sichtbarkeit fuer Europa/Berlin, ersetzen aber keine detaillierte lokale Beobachtungsplanung.

### Uebersetzungen

Alle sichtbaren UI-Texte liegen in:

```text
translations.js
```

Die Ereignis-Inhalte liegen getrennt davon in:

```text
calendar-events.js
```

Unterstuetzt werden aktuell:

- Englisch `en`
- Deutsch `de`
- Franzoesisch `fr`

Die Sprache wird ueber `navigator.language` erkannt. Nicht unterstuetzte Sprachen fallen auf Englisch zurueck.

## Genauigkeit und Grenzen

Die App ist eine anschauliche Planetenuhr, keine professionelle Astronomie-Software. Insbesondere:

- Planetenpositionen sind angenaehert und fuer visuelle Darstellung komprimiert.
- Mondphasen basieren auf einer mittleren synodischen Periode.
- Sonnenzeiten sind fuer Berlin berechnet und naeherungsweise.
- Sichtbarkeit heute beruecksichtigt keine Horizonthoehe, Bewoelkung, lokale Abschattung oder atmosphaerische Extinktion.
- Kalenderereignisse muessen in `translations.js` gepflegt werden.

Fuer konkrete Beobachtungsplanung sollten zusaetzlich spezialisierte Ephemeriden oder Planetariumsprogramme verwendet werden.
