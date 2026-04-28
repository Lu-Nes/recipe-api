# Recipe API

Fullstack-Rezept-App mit React-Frontend, Node.js-/Express-Backend, MongoDB-Datenbank, Authentifizierung, geschützten CRUD-Routen und Bild-Upload.

Diese README dokumentiert die wichtigsten Funktionen, technische Grundlagen und verfügbaren API-Endpunkte.

## Tech Stack

- Frontend: React
- Backend: Node.js, Express
- Datenbank: MongoDB
- Authentifizierung: HttpOnly JWT-Cookies
- Uploads: lokaler Upload-Ordner für Rezeptbilder

---

## 📌 Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Authentifizierung](#authentifizierung)
3. [User-Endpunkte](#user-endpunkte)
   - Register
   - Login
   - Profil
4. [Recipe-Endpunkte](#recipe-endpunkte)
   - Alle Rezepte
   - Rezept nach ID
   - Eigene Rezepte
   - Rezept erstellen
   - Rezept aktualisieren
   - Rezept löschen
   - Bild-Upload
5. [Fehlerfälle / Statuscodes](#fehlerfälle--statuscodes)
6. [Beispieldaten](#beispieldaten)

---

## 🧩 Überblick

Diese API ermöglicht das Registrieren von Nutzern, Einloggen mit Cookie‑basierten JWTs, das Erstellen und Verwalten von Rezepten und den Upload von Bildern.

- Authentifizierung erfolgt über **HttpOnly JWT Cookies**
- Alle Rezepte gehören einem bestimmten User (**Owner**)
- Nur der Owner darf sein Rezept **bearbeiten** oder **löschen**
- Bilder werden unter `/uploads` gespeichert

---

## 🔐 Authentifizierung

### Der Login setzt ein HttpOnly-Cookie:
- Name: **token**
- Secure: true
- HttpOnly: true
- Enthält: JWT mit User-ID
- Wird bei jedem weiteren Request automatisch gesendet

Ohne gültiges Cookie werden geschützte Routen mit **401 Unauthorized** blockiert.

---

## 👤 User-Endpunkte

### ➤ POST `/users/register`
Registriert einen neuen Benutzer.

**Body (JSON):**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "geheim123"
}
```

**Erfolgsantwort (201):**
```json
{
  "message": "Registrierung erfolgreich",
  "user": {
    "_id": "…",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

---

### ➤ POST `/users/login`
Loggt User ein und setzt das Cookie.

**Body:**
```json
{
  "email": "test@example.com",
  "password": "geheim123"
}
```

**Erfolgsantwort (200):**
```json
{ "message": "Login erfolgreich" }
```

Das Cookie erscheint in Postman unter *Cookies*.

---

### ➤ GET `/users/profile`  
Nur mit gültigem JWT-Cookie.

**Antwort:**
```json
{
  "message": "Profil geladen",
  "user": {
    "_id": "…",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

---

## 🍲 Recipe-Endpunkte

### ➤ GET `/recipes`
Liefert alle Rezepte **aller User** (für die spätere öffentliche Übersicht).

---

### ➤ GET `/recipes/:id`
Rezept nach ID abrufen.

**Fehlerfälle:**
- `404` → Rezept existiert nicht
- `500` → Ungültige ObjectId

---

### ➤ GET `/recipes/my-recipes`
Liefert **nur Rezepte des eingeloggten Users**.

**Antwort:**
```json
{
  "message": "Eigene Rezepte geladen",
  "count": 2,
  "recipes": [ … ]
}
```

---

### ➤ POST `/recipes`
Erstellt ein neues Rezept.

**Body:**
```json
{
  "title": "Mein Rezept",
  "description": "Tolle Beschreibung",
  "prepTime": 10,
  "cookTime": 20,
  "servings": 2,
  "difficulty": "easy",
  "ingredients": ["Zutat 1", "Zutat 2"],
  "steps": ["Schritt 1", "Schritt 2"]
}
```

**Antwort (201):**
```json
{
  "message": "Rezept erstellt",
  "recipe": { … }
}
```

---

### ➤ PUT `/recipes/:id`
Aktualisiert ein Rezept.

Nur der Owner darf editieren → Sonst `403 Forbidden`.

**Erfolg (200):**
```json
{
  "message": "Rezept wurde aktualisiert",
  "recipe": { … }
}
```

---

### ➤ DELETE `/recipes/:id`
Löscht ein Rezept.

Nur der Owner darf löschen.

**Erfolg (200):**
```json
{ "message": "Rezept wurde gelöscht" }
```

---

### ➤ POST `/recipes/:id/image`
Lädt ein Bild hoch.

**Form-Data (multipart/form-data):**
- Key: `image`
- Type: File
- Value: `bild.jpg`

**Erfolgsantwort:**
```json
{
  "message": "Rezeptbild wurde aktualisiert",
  "recipe": {
    "image": "/uploads/123456789-Bild.jpg",
    ...
  }
}
```

---

## ⚠️ Fehlerfälle & Statuscodes

| Statuscode | Bedeutung |
|-----------|-----------|
| **400** | Validierungsfehler (fehlende Felder, ungültige Werte) |
| **401** | Nicht eingeloggt / kein JWT-Cookie |
| **403** | Keine Berechtigung (User ist nicht Owner) |
| **404** | Nicht gefunden |
| **500** | Serverfehler (z. B. ungültige ObjectId) |

---

## 📄 Beispieldaten

### Rezept (komplett)

```json
{
  "title": "Spaghetti Carbonara",
  "description": "Klassisches italienisches Rezept.",
  "prepTime": 10,
  "cookTime": 15,
  "servings": 2,
  "difficulty": "medium",
  "ingredients": ["Spaghetti", "Eier", "Speck", "Parmesan"],
  "steps": [
    "Spaghetti kochen",
    "Speck anbraten",
    "Eier mit Käse mischen",
    "Alles vermengen"
  ]
}
```

---
