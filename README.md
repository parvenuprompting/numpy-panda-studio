![Pandas Generator Intro](banner.png)

# Pandas Generator Studio 🐼

Een lokale standalone applicatie met een moderne React GUI en een krachtige Python Pandas backend voor deterministische, AI-ondersteunde dataverwerking.

## 🚀 Status: V2 Release (UX Transformation)

Dit project is getransformeerd naar **Pandas Studio 2.0**: Een volwaardige Data Studio ervaring.

### ✨ Nieuwe Features (V2)
- **Smart Grid**: Professionele spreadsheet-ervaring met `ag-grid`. Sorteren, filteren en resizen van kolommen.
- **Action Builder Sidebar**: Bouw complexe transformaties (Filter, Sort, Drop) via een visuele UI in plaats van code.
- **Visual Profiling**: Dashboard met datakwaliteit grafieken en statistieken per kolom.
- **3-Pane Layout**: Geoptimaliseerde interface voor maximale productiviteit.

### ✨ Core Features (V1)
- **Time Travel (Undo/Redo)**: Volledige sessie-geschiedenis. Maak fouten ongedaan en experimenteer vrij.
- **Code Export**: Genereer met één klik een volledig reproduceerbaar Python script (`pandas_script.py`) van je hele sessie.
- **Persistent Sessions**: Je werk wordt automatisch opgeslagen. Server restarts? Geen probleem, je sessie blijft bestaan.
- **Secure Loader**: Beveiligd tegen Local File Inclusion (LFI). Alleen bestanden binnen de projectmap mogen geladen worden.

### 🏗️ Architectuur & Kwaliteit
- **Backend**: FastAPI + Pandas Engine.
    - **Clean Architecture**: Strikte scheiding tussen `Actions` (logica), `Session` (state) en `API` (interface).
    - **Static Typing**: Volledig getypeerd met `mypy` en `Pydantic` schemas.
    - **Unit Tests**: Core logica (Code Generation, Session Logic) is getest met `pytest`.
- **Frontend**: React + Vite + TailwindCSS.
    - **State Management**: Robuuste implementatie met `Zustand`.
    - **Type Safety**: Strikte TypeScript interfaces (met `import type` optimalisaties).
    - **UI**: Modern "Glassmorphism" design.
- **DevOps**: Docker & Docker Compose setup aanwezig.

## Installatie & Setup

### Vereisten
- Node.js (v18+)
- Python (v3.9+)

### Snel Starten
1. **Repository Clone**
   ```bash
   git clone https://github.com/parvenuprompting/pandas-studio.git
   cd pandas-studio
   ```

2. **Backend Starten**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```
   *De API draait op `http://localhost:8000`.*

3. **Frontend Starten** (in een nieuwe terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Open de app op `http://localhost:5173` (of de poort die Vite aangeeft).*

## Gebruik
1. **Load Dataset**: Voer het absolute pad in naar een CSV bestand in je `backend/data` map (bijv. `backend/data/test.csv`).
2. **Experimenteer**: Klik op knoppen, voer acties uit (mockup voor drop/filter).
3. **Time Travel**: Gebruik de Undo/Redo knoppen in de toolbar om terug te gaan in de tijd.
4. **Export**: Klik op "Export Code" om je werk als Python script te downloaden.

## 🛡️ Security Note
Dit is een lokale applicatie. De `SecureLoader` beschermt tegen het lezen van systeembestanden (zoals `/etc/passwd`), maar staat wel toe om bestanden binnen de gehele projectmap te laden voor gebruiksgemak.

---
*Gebouwd voor de "Senior Code" Portfolio Challenge.*
