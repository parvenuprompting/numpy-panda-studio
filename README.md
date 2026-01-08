# Pandas Generator Studio

Een lokale standalone applicatie met een moderne React GUI en een krachtige Python Pandas backend voor deterministische, AI-ondersteunde dataverwerking.

## Features
- **Lokaal & Privé**: Geen cloud, data blijft op je machine.
- **Glassmorphism UI**: Moderne, responsieve interface gebouwd met React en TailwindCSS.
- **Pandas Engine**: Betrouwbare dataverwerking via Python backend.
- **AI Action Specs**: Bereid voor op AI-gestuurde data manipulaties via controleerbare JSON specs.

## Installatie & Setup

### Vereisten
- Node.js (v18+)
- Python (v3.9+)

### Backend Starten
1. Navigeer naar de backend map:
   ```bash
   cd backend
   ```
2. Installeer dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start de server:
   ```bash
   python main.py
   ```
   De API draait op `http://localhost:8000`.

### Frontend Starten
1. Navigeer naar de frontend map:
   ```bash
   cd frontend
   ```
2. Installeer dependencies:
   ```bash
   npm install
   ```
3. Start de development server:
   ```bash
   npm run dev
   ```
   Open de app op `http://localhost:5173`.

## Architectuur
- **Frontend**: React, Vite, TailwindCSS (v4), Framer Motion, Zustand.
- **Backend**: FastAPI, Pandas, Pydantic.
- **Communicatie**: REST API (JSON).

## Status Update (Senior level features)
- ✅ **Time Travel (Undo/Redo)**: Volledig werkende sessie-geschiedenis in backend & frontend.
- ✅ **Code Export**: Genereer direct Python code van je acties.
- ✅ **Architectuur & Rigor**: Strict typing (Mypy), Pydantic schemas, Unit tests voor core engine.
- ✅ **Containerisatie**: Docker & Docker Compose setup voor lokale dev omgeving.
- ✅ Project structuur opgezet.
- ✅ Backend engine core (loader, profiler) geïmplementeerd.
- ✅ Frontend UI basis (layout, glassmorphism) geïmplementeerd met Zustand.
- ✅ Build systeem werkend.
