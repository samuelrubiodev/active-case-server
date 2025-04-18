# 🕵️‍♂️ Active Case Server

This is the backend for Caso Abierto, a police‑investigation game built in Unity. It generates AI‑powered cases, stores them in PostgreSQL, generates representative images, and exposes a REST API for the game client.
Full project (Unity + this server): [CasoAbierto](https://github.com/samuelrubiodev/CasoAbierto)

---

## 🚀 What it does

- **Generate new cases** via OpenRouter
- **Persist cases** (players, evidence, timeline, characters) in PostgreSQL  
- **Generate case images** via Together AI and store the binary in the database  
- **Serve images** on demand as `image/png`  
- **Expose** API endpoints for Unity (or any HTTP client) to create and fetch data

---

## 📦 Technologies

- **Node.js** + **Express** for the HTTP server  
- **postgres** (npm package) for PostgreSQL queries  
- **OpenRouter** for AI text generation  
- **Together AI** for image generation  

---

## ⚙️ Installation

1. **Clone** this repo  
   ```bash
   git clone https://github.com/samuelrubiodev/active-case-server.git
   cd active‑case‑server
2. **Install dependencies**
   ```bash
   npm install
3. **Copy environment file**
   ```bash
   cp .env.example .env.local
4. **Edit** `.env.local` **with your keys and database URL**
   ```dotenv
    DATABASE_URL=postgres://user:pass@host:port/db
    DATABASE_URL= # For example: postgresql://postgres:password@localhost:5432/mydb
    OPENROUTER_API= # For get API key, visit https://openrouter.ai/settings/keys
    OPENROUTER_URL=https://openrouter.ai/api/v1
    OPENROUTER_MODEL=google/gemini-2.0-flash-001
    TOGETHER_API= # For get API key, visit https://together.xyz
    IMAGE_MODEL_FREE=black-forest-labs/FLUX.1-schnell-Free
5. **Start the server**
     ```bash
     npm run devStart
  The API will listen on port 3001 by default (configurable in src/server/server.js).

---

## API Endpoints

1. ### Case routes

| Method | Path | Description |
|--------|------|-------------| 
| POST   | `/case/new`| Generate a new AI case, persist it (without image and case data) and return `{caseID}` 
| POST   | `/case/:ID`| Fetch all data for case `ID` (player, evidence, timeline, characters, etc.)
| GET    | `/case/:ID/image` |  The image of case in binary (`image/png`)

2. ### Player routes

| Method | Path | Description |
|--------|------|-------------| 
| GET    | `/players/:playerID/case`| Get all cases for player `playerID` 
| GET   | `/players/new`| Create a new player (returns new ID)

## 🤝 Contributing

Feel free to open issues or pull requests — any improvements to schema validation, error‑handling, or performance optimizations are welcome!
