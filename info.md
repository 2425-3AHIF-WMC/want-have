# MarktX Projekt Setup

## 🚀 Backend starten (Node.js + Express.js)

### 📌 1. Frontend starten (React.js + TypeScript)
### 📌 2. Backend starten (Node.js + Express.js)

```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv jsonwebtoken bcryptjs pg

mkdir frontend
cd frontend
npx create-react-app . --template typescript
npm install react-router-dom axios

```
| Paket              | Beschreibung                                                      |
|--------------------|--------------------------------------------------------------------|
| **express**        | Webserver für die API                                             |
| **cors**           | Erlaubt API-Zugriffe vom Frontend                                 |
| **dotenv**         | Um Umgebungsvariablen zu nutzen                                   |
| **jsonwebtoken**   | Token für Login-Authentifizierung                                  |
| **bcryptjs**       | Sicheres Hashen von Passwörtern                                   |
| **pg**             | PostgreSQL-Datenbankanbindung                                      |
| **react-router-dom** | Ermöglicht Routing (Navigation zwischen Seiten)                  |
| **axios**          | Erlaubt API-Anfragen ans Backend                                  |
