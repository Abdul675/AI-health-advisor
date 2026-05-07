# 🏥 AI Healthcare Assistant

> **An enterprise-grade, full-stack AI-powered healthcare platform** that integrates large language models, retrieval-augmented generation, and intelligent automation to deliver accessible, accurate, and personalized healthcare services.

---

Built on a modern AI stack — Gemini, LangChain, RAG pipelines, and Qdrant — the AI Healthcare Assistant empowers users with conversational medical Q&A, intelligent doctor discovery, medical report analysis, personalized health planning, and symptom checking. Designed for scalability, production-readiness, and real-world clinical utility, the platform bridges the gap between cutting-edge AI and everyday healthcare access.

---

## 📋 Table of Contents

- [Features](#-features)
- [Authentication](#-authentication)
- [Project Structure](#-project-structure)
- [Modules](#-modules)
- [AI & LLM Pipeline](#-ai--llm-pipeline)
- [Technology Stack](#-technology-stack)
- [API Reference](#-api-reference)
- [Docker & Deployment](#-docker--deployment)
- [Installation Guide](#-installation-guide)
- [Environment Variables](#-environment-variables)
- [Future Enhancements](#-future-enhancements)
- [Conclusion](#-conclusion)

---

## ✨ Features

- **AI Medical Chatbot** — RAG-powered conversational assistant built on verified NHS healthcare knowledge, delivering context-aware medical Q&A with semantic precision
- **Doctor Discovery & Appointment Finder** — Intelligent filtering by specialty, availability, and fee range
- **Medical Report Explainer** — Upload medical images or PDFs; receive plain-language AI-generated explanations
- **Personalized Health Plan Generator** — AI health trainer delivering custom nutrition and exercise plans based on user profile and goals
- **Symptom Checker** — Conversational AI-driven symptom assessment with condition suggestions and healthcare guidance
- **Protected Routes** — All modules are gated behind user authentication; signup and login are required before access
- **Vector-Augmented Knowledge Retrieval** — Semantic search over healthcare embeddings via Qdrant Cloud
- **Dockerized Deployment** — Fully containerized architecture for reproducible production deployments

---

## 🔐 Authentication

The AI Healthcare Assistant enforces authentication across the entire platform. **All modules and features are inaccessible without a valid user session.**

Users must complete the following flow before accessing any functionality:

```
Landing Page  →  Sign Up (Create Account)  →  Log In  →  Dashboard  →  Modules
```

The frontend authentication layer is handled by the following components:

| File | Purpose |
|---|---|
| `Signup.js` | New user registration form and submission logic |
| `Login.js` | User login form, credential validation, and session initiation |
| `SplashScreen.js` | Initial loading screen displayed before auth state is resolved |
| `Dashboard.js` | Main hub rendered post-authentication; entry point to all modules |

> Session management and route protection are enforced on the frontend. Unauthenticated users are redirected to the login screen automatically.

---

## 📁 Project Structure

```
.
├── app/                          # Backend — FastAPI application & AI logic
│   ├── routers/                  # API route handlers (one file per module)
│   │   ├── __init__.py
│   │   ├── ai_chat.py            # POST /chat — RAG-powered medical Q&A
│   │   ├── doctor.py             # GET  /find-doctor — Doctor search & filtering
│   │   ├── explainer.py          # POST /explain — Medical report analysis
│   │   ├── health_plan.py        # POST /health-plan — Personalized health plans
│   │   └── symptoms.py           # POST /check-symptoms — Symptom checker
│   ├── __init__.py
│   ├── main.py                   # FastAPI app initialization & router registration
│   ├── config.py                 # Environment config — API keys, Qdrant settings
│   ├── chunking.py               # Text splitting & chunk preparation logic
│   ├── llm.py                    # LLM client initialization (Gemini)
│   ├── prompt.py                 # System prompts & LangChain prompt templates
│   ├── retriever.py              # MMR & semantic search retrieval logic
│   └── vectorstore.py            # Qdrant Cloud client connection & collection setup
│
├── cards/                        # UI component assets (frontend card elements)
├── chunks/                       # (Git-ignored) Local text chunk cache
├── data/                         # (Git-ignored) Raw PDF/image report uploads
├── myenv/                        # (Git-ignored) Local Python virtual environment
│
├── App.js                        # React root component & client-side routing
├── Dashboard.js                  # Post-auth dashboard — module navigation hub
├── Login.js                      # User login screen
├── Signup.js                     # User registration screen
├── SplashScreen.js               # Initial loading/splash screen
├── index.html                    # HTML entry point
├── style.css                     # Global stylesheet
│
├── .dockerignore                 # Docker build exclusions
├── .env                          # Environment secrets (Git-ignored)
├── .gitignore                    # Git exclusions
├── pyproject.toml                # UV project configuration
├── requirements.txt              # Python dependencies
└── uv.lock                       # UV dependency lockfile
```

---

## 🧩 Modules

> All modules are accessible exclusively after successful authentication via the Dashboard.

---

### 1. 🤖 AI Chat — `/chat`

The AI Chat module is the core conversational intelligence layer — a medically-aware chatbot powered by Gemini and a Retrieval-Augmented Generation (RAG) pipeline built on verified NHS healthcare data.

**How it works:**

NHS content is scraped, segmented into knowledge chunks (`chunking.py`), and embedded into a Qdrant vector collection (`vectorstore.py`). At query time, the user's input is semantically matched against stored embeddings via MMR retrieval (`retriever.py`), and the most relevant NHS knowledge chunks are injected into a LangChain prompt (`prompt.py`) before being passed to Gemini (`llm.py`) for response generation.

**Key characteristics:**
- Grounded responses anchored to NHS healthcare knowledge — minimizes hallucination
- MMR (Maximal Marginal Relevance) retrieval for diverse, non-redundant context chunks
- Structured system prompts enforce safe, medically appropriate response framing
- Context-aware across multi-turn conversations

---

### 2. 🩺 Doctor Finder — `/find-doctor`

The Doctor Finder enables users to search and filter healthcare professionals by specialty, session availability, and consultation fee range.

**Filters available:**

| Filter | Options |
|---|---|
| Specialty | Cardiology, Dermatology, General Practice, and more |
| Availability | Morning / Evening |
| Fee Range | User-defined min–max range |

Doctor records are served via the `/find-doctor` router (`doctor.py`). The backend applies the selected filters and returns matching doctor profiles for frontend rendering.

---

### 3. 📄 Medical Report Explainer — `/explain`

The Report Explainer allows users to upload medical documents — including blood test reports, radiology results, and clinical letters — and receive a structured, plain-language AI-generated explanation.

**How it works:**

The uploaded file (image or PDF) is processed through an OCR pipeline to extract raw medical text. The extracted content is then passed to Gemini via a specialized report analysis prompt, which produces an explanation covering key findings, abnormal values, and recommended next steps — written in language accessible to non-clinical users.

**Supported inputs:** Scanned images, photographed reports, PDF documents

> Explanations are informational. Users should consult a qualified healthcare professional for clinical interpretation.

---

### 4. 🥗 Health Plan Generator — `/health-plan`

The Health Plan Generator acts as an AI personal trainer and nutritionist, producing fully personalized weekly meal and exercise plans based on the user's submitted health profile.

**User inputs:**

| Field | Options |
|---|---|
| Primary Goal | Weight Loss / Muscle Gain / Fitness Improvement |
| Dietary Preference | Keto / Vegan / No Preference |
| Allergies / Exclusions | Free-text |
| Current Exercise Level | Sedentary / Light / Moderate / Active |
| Daily Time Available | Minutes per day |

The backend constructs a LangChain chain with a few-shot prompt template (`prompt.py`) that anchors Gemini's output to a consistent, clinically sensible health planning format. The generated plan includes a weekly meal schedule, daily exercise recommendations, calorie targets, and hydration guidance.

---

### 5. 🔍 Symptom Checker — `/check-symptoms`

The Symptom Checker provides a conversational interface for users to describe their symptoms and receive AI-driven guidance on potential conditions and appropriate next steps.

**How it works:**

User symptom descriptions are passed to Gemini via a structured symptom-analysis prompt. The model identifies patterns across symptom combinations, suggests potential associated conditions, and recommends whether the user should seek immediate, routine, or self-managed care.

> ⚠️ **Medical Disclaimer:** The Symptom Checker is for informational purposes only and is not a substitute for professional medical diagnosis, advice, or treatment. In an emergency, contact your local emergency services immediately.

---

## 🧠 AI & LLM Pipeline

### LangChain Orchestration

LangChain manages the assembly of all AI pipelines — wiring together prompt templates, the Gemini LLM client, retrieval steps, and output handling into clean, reusable chain abstractions. Each module (`ai_chat.py`, `explainer.py`, `health_plan.py`, `symptoms.py`) operates through its own dedicated chain.

### Retrieval-Augmented Generation (RAG)

The RAG pipeline underpins the AI Chat module. NHS healthcare content is chunked (`chunking.py`), embedded, and stored in Qdrant Cloud (`vectorstore.py`). At query time, `retriever.py` performs MMR-based semantic search to surface the most relevant, diverse knowledge chunks, which are injected into the prompt as grounded context before Gemini generates a response.

### Prompt Engineering

All system prompts and LangChain prompt templates are centralized in `prompt.py`. Each module has its own domain-specific prompt, carefully structured to produce safe, accurate, and appropriately scoped healthcare responses. The Health Plan Generator uses few-shot examples within the prompt to enforce output format consistency.

### Embedding & Vector Search

Text embeddings are generated during the knowledge ingestion phase and stored as dense vectors in Qdrant Cloud. Semantic similarity search uses cosine distance with HNSW indexing for fast, accurate retrieval. The collection name and connection parameters are configured via `config.py` and `.env`.

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), React |
| **Backend** | FastAPI (Python 3.11+), Uvicorn, Pydantic v2 |
| **AI / LLM** | Gemini (Google), LangChain, Few-Shot Prompting |
| **RAG & Retrieval** | LangChain Retrieval Chains, MMR Search |
| **Vector Database** | Qdrant Cloud |
| **OCR** | Tesseract OCR |
| **Deployment** | Docker, Docker Compose |
| **Package Management** | UV (`pyproject.toml`, `uv.lock`) |
| **Environment Config** | Python-dotenv |
| **API Protocol** | REST (JSON) |

---

## 🔌 API Reference

All routes are registered in `main.py` and handled by dedicated router files under `app/routers/`. Interactive API documentation is auto-generated by FastAPI and available at `/docs` when the server is running.

| Method | Endpoint | Router File | Description |
|---|---|---|---|
| `POST` | `/chat` | `ai_chat.py` | Submit a medical query to the RAG-powered chatbot |
| `GET` | `/find-doctor` | `doctor.py` | Search and filter doctors by specialty, availability, and fee |
| `POST` | `/explain` | `explainer.py` | Upload a medical report for OCR + AI explanation |
| `POST` | `/health-plan` | `health_plan.py` | Generate a personalized health and nutrition plan |
| `POST` | `/check-symptoms` | `symptoms.py` | Submit symptoms for AI-driven assessment |

---

## 🐳 Docker & Deployment

The AI Healthcare Assistant is fully containerized using Docker, enabling consistent and reproducible deployments across development, staging, and production environments.

### Running with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop all services
docker-compose down

# View backend logs
docker-compose logs -f app
```

### Production Readiness

- Secrets are injected at runtime via environment variables — no credentials are hardcoded in images
- `.dockerignore` excludes `myenv/`, `data/`, `chunks/`, and `.env` from the build context
- The FastAPI application is stateless and horizontally scalable behind a load balancer
- Cloud deployment-ready for AWS ECS, Google Cloud Run, Azure Container Apps, or self-hosted Kubernetes

---

## ⚙️ Installation Guide

### Prerequisites

- Python 3.11+
- [UV](https://github.com/astral-sh/uv) package manager (recommended) or `pip`
- Docker & Docker Compose
- Qdrant Cloud account (or local Qdrant instance)
- Openai api key
- Tesseract OCR installed on the host system

---

### 1. Clone the Repository

```bash
git clone https://github.com/Abdul675/AI-health-advisor.git
cd ai-healthcare-assistant
```

### 2. Install Python Dependencies

```bash
# Using UV (recommended)
uv sync

# Or using pip
pip install -r requirements.txt
```

### 3. Install Tesseract OCR

```bash
# Ubuntu / Debian
sudo apt-get install tesseract-ocr

# macOS (Homebrew)
brew install tesseract

# Windows — download the installer:
# https://github.com/UB-Mannheim/tesseract/wiki
```

### 4. Configure Environment Variables

```bash
cp .env.example .env
# Open .env and fill in your credentials
```

### 5. Set Up Qdrant

```bash
# Option A — Run Qdrant locally via Docker
docker run -p 6333:6333 qdrant/qdrant

# Option B — Use Qdrant Cloud
# Create a free cluster at https://cloud.qdrant.io
# Copy the cluster URL and API key into your .env file
```

### 6. Ingest NHS Knowledge Base

```bash
# Chunk, embed, and upsert NHS data into Qdrant
python app/vectorstore.py
```

### 7. Start the FastAPI Backend

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API available at: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

### 8. Open the Frontend

```bash
# Open index.html directly in your browser, or serve it locally:
python -m http.server 3000
# Then visit http://localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root. **Never commit this file to version control** — it is already listed in `.gitignore`.

```env
# ─────────────────────────────────────────────
# Gemini (Google AI) Configuration
# ─────────────────────────────────────────────
OPENAI_API_KEY=your-openai_api_key_here

# ─────────────────────────────────────────────
# Qdrant Cloud Configuration
# ─────────────────────────────────────────────
QDRANT_URL=https://your-cluster-url.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key-here
QDRANT_COLLECTION_NAME=nhs_knowledge

# ─────────────────────────────────────────────
# FastAPI Application
# ─────────────────────────────────────────────
APP_HOST=0.0.0.0
APP_PORT=8000
```

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | OPENAI_API_KEY API key for LLM inference |
| `QDRANT_URL` | ✅ | Qdrant Cloud cluster URL |
| `QDRANT_API_KEY` | ✅ | Qdrant Cloud authentication key |
| `QDRANT_COLLECTION_NAME` | ✅ | Name of the Qdrant collection storing NHS embeddings |
| `APP_HOST` | ⬜ | Host for Uvicorn server (default: `0.0.0.0`) |
| `APP_PORT` | ⬜ | Port for Uvicorn server (default: `8000`) |

---

## 🚀 Future Enhancements

| Enhancement | Description |
|---|---|
| 🎙️ **Voice Assistant** | Speech-to-text input and text-to-speech output for hands-free healthcare interaction |
| 📹 **Real-Time Telemedicine** | WebRTC-powered video consultation connecting patients with healthcare professionals |
| ⌚ **Wearable Device Integration** | Real-time health metrics ingestion from Apple Health, Google Fit, and Fitbit for dynamic monitoring |
| 🌍 **Multi-Language Support** | Multilingual healthcare assistance via LLM translation pipelines |
| 🧬 **Disease Risk Prediction** | ML-powered (XGBoost / Random Forest) diabetes and heart disease risk scoring modules |
| 🤖 **AI Agent Workflows** | Autonomous LangChain agents for multi-step research, appointment management, and follow-up |
| 📈 **Longitudinal Health Tracking** | Time-series user health data with trend visualization and proactive alerts |
| 🔐 **HIPAA / GDPR Compliance Layer** | Data governance, audit logging, and encryption at rest for regulatory compliance |

---

## 📝 Conclusion

The AI Healthcare Assistant brings together modern LLM capabilities, retrieval-augmented generation, and a clean full-stack architecture into a cohesive, production-ready healthcare platform. By combining Gemini's conversational intelligence, LangChain's orchestration layer, Qdrant's vector search, and a secure authentication-first user experience, the platform delivers intelligent, personalized healthcare guidance at scale.

From symptom checking to report analysis to personalized health planning, every feature is built around the goal of making high-quality healthcare information accessible — safely, accurately, and responsibly.

---

<div align="center">

**Built with 🤖 OPENAI · 🦜 LangChain · 🗄️ Qdrant · 🐍 FastAPI · 🐳 Docker**

</div>
