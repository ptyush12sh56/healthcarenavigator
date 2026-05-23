# 🏥 AI Healthcare Navigator & Cost Estimator

> Find the best hospital for any medical condition in India — with AI-powered cost estimates, procedure mapping, and ranked recommendations.

---

## ✨ What It Does

Type a query like **"Best hospital for angioplasty under 3 lakh in Nagpur"** and the system:

1. Extracts the condition, city, and budget from natural language (via GPT-3.5)
2. Maps condition → procedure → specialist using curated medical data
3. Estimates the treatment cost range from a procedures dataset
4. Filters and ranks hospitals by rating, speciality, and budget fit
5. Returns an AI-generated plain-English summary with hospital cards

---

## 🗂 Project Structure

```
ai-healthcare-navigator/
├── frontend/                  ← React + Vite + TailwindCSS
│   ├── src/
│   │   ├── App.jsx            ← Page state machine (search ↔ results)
│   │   ├── pages/
│   │   │   ├── SearchPage.jsx ← Hero + NL search input
│   │   │   └── ResultsPage.jsx← Condition summary + hospital grid
│   │   ├── components/
│   │   │   └── HospitalCard.jsx
│   │   └── services/
│   │       └── api.js         ← POST /query wrapper
│   ├── package.json
│   └── vite.config.js
│
└── backend/                   ← Python FastAPI
    ├── main.py                ← App entry + CORS + lifespan preload
    ├── routers/
    │   └── query.py           ← POST /query orchestrator
    ├── services/
    │   ├── intent_parser.py   ← LLM intent extraction (+ regex fallback)
    │   ├── condition_mapper.py← condition → procedure → specialist
    │   ├── cost_estimator.py  ← cost range lookup
    │   ├── hospital_filter.py ← filter + rank from CSV
    │   └── response_synthesizer.py ← LLM plain-English summary
    ├── models/
    │   └── query_schema.py    ← Pydantic request/response models
    ├── utils/
    │   ├── csv_loader.py      ← Cached CSV loading
    │   └── prompt_templates.py← All LLM prompts in one place
    ├── data/
    │   ├── hospitals_dataset.csv        (40 hospitals, 10 cities)
    │   ├── procedures_dataset.csv       (15 procedures + costs)
    │   └── condition_mapping_dataset.csv(15 conditions → procedures)
    └── requirements.txt
```

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend

# Copy and fill in your OpenAI key
cp .env.example .env
# Edit .env → set OPENAI_API_KEY=sk-...

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend   # (or the root if package.json is there)

npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔌 API Reference

### `POST /query`

**Request:**
```json
{ "query": "Best hospital for angioplasty under 3 lakh in Nagpur" }
```

**Response:**
```json
{
  "condition": "Coronary Artery Disease",
  "procedure": "Angioplasty",
  "specialist": "Interventional Cardiologist",
  "estimated_cost_min": 80000,
  "estimated_cost_max": 400000,
  "estimated_cost_label": "₹80K – ₹4.0 Lakh",
  "budget_feasible": true,
  "ai_summary": "Based on your query...",
  "hospitals": [
    {
      "id": "H001",
      "name": "Orange City Hospital",
      "city": "Nagpur",
      "rating": 4.7,
      "cost": 220000,
      "category": "Private",
      "accreditation": "NABH",
      "speciality": "Cardiology",
      ...
    }
  ],
  "total_found": 5
}
```

### `GET /health`
Returns `{ "status": "ok" }`

---

## 🤖 AI Pipeline

```
User Query (NL)
      │
      ▼
intent_parser.py  ──► GPT-3.5 extracts: condition, city, budget, procedure
      │                (regex fallback if no API key)
      ▼
condition_mapper.py ► CSV lookup: condition → procedure → specialist
      │
      ▼
cost_estimator.py ──► CSV lookup: procedure → (cost_min, cost_max)
      │
      ▼
hospital_filter.py ──► Pandas: filter by city + speciality + budget → ranked list
      │
      ▼
response_synthesizer.py ► GPT-3.5 generates plain-English summary
      │
      ▼
FinalResponse JSON  ──► React UI renders cards
```

---

## 📊 Datasets

| File | Rows | Key Columns |
|------|------|-------------|
| `hospitals_dataset.csv` | 40 | name, city, rating, category, cost per procedure, specialities |
| `procedures_dataset.csv` | 15 | procedure_name, aliases, cost_min_inr, cost_max_inr, specialist |
| `condition_mapping_dataset.csv` | 15 | condition_name, aliases, procedure_id, specialist, urgency |

Cities covered: Nagpur, Mumbai, Pune, Hyderabad, Delhi, Bengaluru, Chennai, Kolkata, Lucknow, Indore, Ahmedabad, Gurugram

---

## 🔧 Works Without OpenAI Key

The system has a full **regex + keyword fallback** in `intent_parser.py` and a **template fallback** in `response_synthesizer.py`. You can run and demo the entire app without an API key — the AI summary will use the template instead of GPT.

---

## 🏗 Built With

- **Frontend:** React 18, Vite, TailwindCSS, DM Sans + Playfair Display
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, Pandas, Uvicorn
- **AI:** OpenAI GPT-3.5-turbo (with regex fallback)
- **Data:** Custom curated Indian hospital & procedure datasets

---

## 📝 License

MIT — built for hackathon demo purposes. Medical cost data is indicative only.
