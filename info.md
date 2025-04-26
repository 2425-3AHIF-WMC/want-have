# MarktX Projekt Setup

## 🚀 Installation & Einrichtung

So startest du das Projekt lokal:

### 1. 📦 Voraussetzungen

Stelle sicher, dass Folgendes installiert ist:

- **Node.js** (Version 16 oder 18 empfohlen)
- **npm** (wird mit Node installiert)

Versionen prüfen:

```bash
node -v
npm -v
```

### 2. 🧱 Projekt klonen & Abhängigkeiten installieren

```bash
# Repository klonen
git clone https://github.com/2425-3AHIF-WMC/want-have.git

# In das Frontend-Verzeichnis wechseln
cd want-have/frontend

# Abhängigkeiten installieren
npm install

# In das Backend-Verzeichnis wechseln
cd want-have/backend

# Abhängigkeiten installieren
npm install
```

3. 🏁 Entwicklungsserver starten

```bash
npm start
```


| Paket     | Beschreibung                                                      |
|-----------|--------------------------------------------------------------------|
| **express** | Webserver für die API                                             |
| **cors**  | Erlaubt API-Zugriffe vom Frontend                                 |
| **dotenv** | Um Umgebungsvariablen zu nutzen                                   |
| **jsonwebtoken** | Token für Login-Authentifizierung                                  |
| **bcryptjs** | Sicheres Hashen von Passwörtern                                   |
| **pg**    | PostgreSQL-Datenbankanbindung                                      |
| **react** | JavaScript-Bibliothek zur Erstellung von UI-Komponenten                  |
| **axios** | Erlaubt API-Anfragen ans Backend                                  |
