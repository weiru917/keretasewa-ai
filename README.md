# KeretaSewa AI

> **Decision Intelligence Platform for SME Car Rental Operators**
> UMHackathon 2026 · Domain 2 · Team pakchoy

---

## 📹 Pitching Video

> **[▶ Watch our pitch here](https://drive.google.com/drive/folders/1iBM5Il7Er2_e8oFyCbbIHaH4ahaVfQfH?usp=drive_link)**

---

## What is KeretaSewa AI?

KeretaSewa AI is a web-based decision intelligence platform built for small and medium-sized car rental operators in Malaysia. Most SME operators manage their fleets using WhatsApp, Excel, and gut-feel pricing — tools that handle bookings but offer no analytical insight.

KeretaSewa AI sits on top of existing operations as a decision support layer. Operators upload their booking history, and the platform transforms that raw data into:

- **Real-time fleet analytics** — revenue, utilization %, idle days, weekday vs weekend demand
- **AI-powered recommendations** — 3 actionable suggestions per session with reasoning, confidence score, trade-off analysis, and priority level
- **Ask AI assistant** — natural language Q&A where operators ask business questions and receive structured answers grounded in their own fleet data
- **PDF report generation** — one-click export of the full dashboard and AI insights

The core metrics (revenue, utilization, idle days) are computed entirely from the operator's own data. The AI layer (OpenRouter API + Qwen3-32B) handles interpretation, recommendation, and conversational support. Removing the AI leaves the dashboard functional — removing the AI is what removes the intelligence.

---

## Key Features

| Feature | Description |
|---|---|
| CSV Upload | Upload booking history — new records append to existing data, duplicates skipped automatically |
| Manual Entry | Add, edit, or delete individual booking records directly in the platform |
| Dashboard | Monthly KPIs with a month picker for historical browsing |
| AI Recommendations | 3 context-aware recommendations with action, reasoning, impact, confidence, and trade-off |
| Ask AI | Natural language fleet Q&A with context injection per call |
| PDF Report | Full dashboard export including metrics, charts, and AI recommendations |
| Account Management | Firebase auth with profile editing, password change, and account deletion |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| State | Zustand |
| Charts | Recharts |
| Routing | react-router-dom |
| Backend | Node.js + Express |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| CSV Parsing | PapaParse |
| PDF Generation | html2canvas + jsPDF |
| AI Service | OpenRouter API (Qwen3-32B) |

---

## Team

| Member | Role |
|---|---|
| Cheong Yan Jie | AI Engineer — OpenRouter integration, prompt engineering, Node.js middleware, Ask AI, recommendation logic |
| Tan Wei Ru | Frontend & Database — React UI, dashboard, CSV upload, Firebase, PDF report, auth flow |

