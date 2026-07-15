# Contributing

## Ziel

Dieses Projekt bevorzugt lesbaren, wartbaren und ruhig aufgebauten Code vor cleveren Kurzformen. Wenn eine Stelle beim ersten Lesen stolpern lässt, sollte sie vereinfacht werden.

## Grundprinzipien

- Struktur, Darstellung und Verhalten trennen.
- Daten, Konfiguration und Texte nicht im Rendering verstreuen.
- Wiederkehrende UI-Bausteine nicht duplizieren, sondern über Templates oder kleine Hilfsfunktionen aufbauen.
- Lesbarkeit ist wichtiger als Kürze.
- Fachlogik soll nachvollziehbar dokumentiert sein.

## HTML

- HTML enthält nur Struktur und semantisches Markup.
- Wiederverwendbare UI-Bausteine werden nach Möglichkeit als `<template>` angelegt.
- Keine großen HTML-Strings direkt in JavaScript zusammenbauen, wenn dieselbe Struktur über Templates oder DOM-APIs erstellt werden kann.
- Sichtbare Texte gehören nicht fest in die Logik, sondern in zentrale Text- oder Übersetzungsdateien.

## CSS

- Styles liegen in externen CSS-Dateien, nicht inline im HTML.
- CSS wird komponentenorientiert organisiert.
- Layout, Karten, Overlays, Visualisierungen und Hilfsklassen sollen logisch gruppiert bleiben.
- Inline-Styles nur dann verwenden, wenn dynamische Werte zur Laufzeit wirklich direkt gesetzt werden müssen.

## JavaScript

- Bevorzuge klare `if / else`-Blöcke statt kompakter, schwer lesbarer Einzeiler.
- Ternary-Ausdrücke sollen vermieden werden, besonders bei:
  - Statuslogik
  - Textaufbau
  - Klassenwahl
  - Attributsetzung
  - verschachtelten Entscheidungen
- Variablen und Funktionen sollen sprechende Namen haben.
- Kleine Hilfsfunktionen sind besser als mehrfach wiederholte Logikblöcke.
- Rendering-Code, Datenlogik und Berechnungslogik sollen soweit wie möglich getrennt sein.

## DOM-Aufbau

- Bevorzuge `createElement`, `textContent`, `appendChild` und `<template>`.
- `innerHTML` nur gezielt und sparsam verwenden.
- Wenn strukturierte DOM-Knoten möglich sind, diese einem String-Aufbau vorziehen.

## Texte und Übersetzungen

- Alle sichtbaren Texte werden zentral gepflegt.
- Übersetzungen gehören in dedizierte Sprachdateien.
- Dateien müssen in sauberem UTF-8 gespeichert sein.
- Mojibake und kaputte Umlaute sind Bugs und sollen direkt behoben werden.

## Daten und Konfiguration

- Konfigurationsdaten gehören in eigene Dateien.
- Astronomische Inhalte, Event-Daten, Feed-Quellen und ähnliche Datensammlungen sollen nicht hart im UI-Code verteilt werden.
- Rechenlogik und Inhaltsdaten sollen getrennt bleiben.

## Dokumentation im Code

- Komplexere Berechnungen erhalten kurze, fachlich hilfreiche Kommentare.
- Kommentare sollen erklären, warum etwas so gerechnet oder dargestellt wird.
- Kommentare sollen keine offensichtlichen Selbstverständlichkeiten wiederholen.

## README und Projektdoku

- Neue Kacheln, Datenquellen und größere Architekturänderungen werden im README nachgezogen.
- Quellen für Inhalte und Berechnungen sollen dokumentiert werden.
- Wenn ein Modell bewusst vereinfacht ist, sollte das offen benannt werden.

## Responsive und UI

- Karten und Controls sollen auf kleinen und großen Viewports stabil lesbar bleiben.
- Layout-Entscheidungen sollen bewusst getroffen werden, nicht zufällig aus dem DOM-Wachstum entstehen.
- Texte dürfen nicht überlappen oder abgeschnitten werden.

## Review-Maßstab

Bei Änderungen gilt:

- Würde jemand anderes diese Stelle nach zwei Wochen noch sofort verstehen?
- Ist die Logik klarer als die kürzeste mögliche Schreibweise?
- Sind Inhalte, Styles und Verhalten sauber getrennt?
- Ist die neue Struktur konsistent mit dem restlichen Projekt?

Wenn eine Änderung diese Fragen nicht gut beantwortet, sollte sie überarbeitet werden.
