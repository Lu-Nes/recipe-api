# AGENTS.md – Recipe-App

## Geltungsbereich

Diese Regeln gelten für das gesamte Repository `recipe-api` mit `backend/` und `frontend/`.
Spezifische Anweisungen eines klar abgegrenzten Arbeitspakets haben Vorrang, dürfen diese Leitplanken aber nicht stillschweigend aufheben.

## Projektziel

Die vorhandene Recipe-App wird technisch stabilisiert, visuell modernisiert und portfoliofähig veröffentlicht.
Die App wird nicht neu gebaut. Vorhandene Architektur, Routen, Komponenten, CRUD-Funktionen und Datenmodelle sollen möglichst erhalten bleiben.

## Technische Leitplanken

- React, Vite und React Router im Frontend beibehalten.
- Node, Express, MongoDB und Mongoose im Backend beibehalten.
- Keine TypeScript-Migration.
- Keine neuen Dependencies ohne ausdrückliche Freigabe.
- Keine ungefragten Features.
- Keine großen oder fachfremden Refactorings nebenbei.
- Backend nur ändern, wenn das aktuelle Arbeitspaket dies ausdrücklich verlangt.
- Keine Secrets oder echten `.env`-Werte ausgeben, ändern oder committen.
- Bestehende ESLint- und Formatierungsregeln respektieren.
- Deutsche UI-Texte und Fehlermeldungen beibehalten.
- Bezeichner im Code auf Englisch schreiben.
- Bestehenden Codestil erhalten; keine rein kosmetischen Änderungen außerhalb des Arbeitspakets.

## Verbindlicher Branch- und Git-Workflow

Vor jeder Dateiänderung muss LuNes zuerst selbst einen passenden Branch erstellen oder auf den bereits festgelegten Ziel-Branch wechseln.

- Keine Dateiänderungen direkt auf `main`.
- Codex wird niemals direkt auf `main` eingesetzt.
- Vor jedem Codex-Einsatz müssen Git-Status, Ausgangsbranch und Ziel-Branch geprüft sein.
- Codex darf erst arbeiten, nachdem LuNes den korrekten Ziel-Branch bestätigt hat.
- Jede zusammengehörige Änderung erfolgt in einem klar abgegrenzten Arbeitspaket auf einem passenden Branch.
- Nach erfolgreicher Prüfung führt LuNes Commit, Push, Pull Request und Merge selbst durch.
- Nach dem Merge wird lokal auf `main` gewechselt, der aktuelle Stand geholt und erst danach der nächste Branch erstellt.

Codex darf niemals:

- Branches erstellen oder wechseln,
- committen,
- pushen,
- mergen,
- Pull Requests erstellen oder bearbeiten,
- Git-Historie umschreiben.

Codex darf den Git-Status lesen. Bei `main`, einem unerwarteten Branch oder unbekannten Änderungen muss Codex stoppen und konkret darauf hinweisen. Sämtliche Git-Aktionen führt ausschließlich LuNes selbst aus.

## Arbeitsweise

Vor jeder Implementierung:

1. Relevante Dateien und bestehende Zusammenhänge lesen.
2. Kurz benennen, welche Dateien voraussichtlich geändert werden.
3. Den Umfang gegen das aktuelle Arbeitspaket prüfen.
4. Bei Widersprüchen oder fehlenden Voraussetzungen stoppen und diese konkret benennen.
5. Keine Änderungen beginnen, solange der korrekte Ziel-Branch nicht bestätigt ist.

Während der Implementierung:

- Nur Dateien ändern, die für das Arbeitspaket erforderlich sind.
- Vorhandene Komponenten und Logik bevorzugt weiterverwenden.
- Keine versteckten Folgeaufgaben ergänzen.
- Keine Platzhalter-APIs oder erfundenen Endpunkte einführen.
- Requests mit HttpOnly-Cookie weiterhin mit Credentials ausführen.
- Light- und Darkmode bei visuellen Änderungen gemeinsam berücksichtigen.
- Desktop und Smartphone bei Layoutänderungen gemeinsam berücksichtigen.
- Sichtbare Fokuszustände und semantische HTML-Strukturen erhalten oder verbessern.

## Gestaltung

Die verbindliche Stilrichtung ist ein modernes, ruhiges Food-Journal:

- bildbetont, aber nicht dekorativ überladen,
- warme neutrale Flächen statt schwerem Braun,
- Kräutergrün als primäre Markenfarbe,
- eine sparsame warme Akzentfarbe,
- klare Typografie und kompakte Abstände,
- moderne Karten mit konsistentem Bildbereich,
- Light- und Darkmode als gleichwertige Varianten,
- keine unnötigen Animationen,
- keine zusätzlichen Icon- oder UI-Bibliotheken ohne Freigabe.

## Prüfungen nach Änderungen

Soweit für das Arbeitspaket relevant:

- `npm run lint` im Frontend,
- `npm run build` im Frontend,
- vorhandene Backend-Prüfungen oder gezielte Endpunkt-Tests,
- Browserprüfung in Light- und Darkmode,
- Desktop- und Smartphone-Prüfung,
- Browser-Konsole und Netzwerkfehler prüfen.

Codex darf Fehler im bestehenden Projekt benennen, soll aber nur Fehler beheben, die durch das Arbeitspaket entstanden sind oder dessen Abschluss blockieren.

## Abschlussbericht

Nach jedem Arbeitspaket ausgeben:

1. kurze Zusammenfassung der umgesetzten Änderungen,
2. Liste aller geänderten Dateien,
3. ausgeführte Prüfungen mit Ergebnis,
4. noch offene Risiken oder manuelle Prüfungen,
5. keine Git-Befehle ausführen.
