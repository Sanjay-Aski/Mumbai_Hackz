# 🛡️ FinSphere - AI-Powered Financial Wellness Platform

<div align="center">

![FinSphere Logo](https://img.shields.io/badge/FinSphere-Financial%20Wellness-blue?style=for-the-badge&logo=shield)
![Version](https://img.shields.io/badge/Version-3.0-green?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/Mumbai%20NESCO-24hr%20Hackathon-orange?style=for-the-badge)

**Intelligent Purchase Interception • Biometric Stress Detection • AI-Powered Financial Coaching**

[Features](#-features) • [Architecture](#-architecture) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-documentation)

</div>

---

## 📖 Overview

**FinSphere** is a comprehensive financial wellness platform that combines real-time biometric analysis, AI-powered purchase interception, and personalized financial coaching to help users make better spending decisions. Built during the 24-hour Hackathon at Mumbai NESCO.

### 🎯 Problem Statement

Modern consumers face:
- **Impulse buying** driven by stress, emotions, and manipulative marketing
- **Lack of real-time financial awareness** during purchase decisions
- **No connection** between physical/mental state and spending behavior
- **Overwhelming financial advice** that isn't personalized

### 💡 Our Solution

FinSphere provides:
- **Browser Extension** that intercepts purchases on 75+ e-commerce sites
- **AI Analysis** using local Ollama LLM for privacy-first recommendations
- **Biometric Integration** tracking stress, heart rate, and HRV
- **Smart Dashboard** with real-time financial health visualization
- **Personalized AI Coach** for financial guidance

---

## ✨ Features

### 🛒 Universal Purchase Interception
- **75+ E-commerce Sites Supported**: Amazon, Flipkart, Myntra, Swiggy, Zomato, Nykaa, and more
- **Smart Button Detection**: Intercepts Buy Now, Add to Cart, and Checkout buttons
- **Real-time Price Extraction**: Automatically detects product prices
- **AI-Powered Analysis**: Evaluates each purchase against your financial profile

### 🤖 AI Financial Analysis (Ollama Integration)
- **Local LLM Processing**: Uses `gpt-oss:20b-cloud` model for privacy
- **Personalized Recommendations**: Based on spending history and biometrics
- **Risk Assessment**: Low/Medium/High purchase risk classification
- **Smart Suggestions**: Alternative actions and savings recommendations

### 💓 Biometric Wellness Tracking
- **Heart Rate Monitoring**: Real-time BPM tracking
- **HRV Analysis**: Heart Rate Variability for stress detection
- **Stress Level Assessment**: 1-10 scale with trend analysis
- **Sleep Quality Correlation**: Links rest quality to spending behavior

### 📊 Financial Dashboard
- **Spending Analytics**: Category-wise expense breakdown
- **Budget Tracking**: Monthly budget vs actual spending
- **Savings Runway**: Emergency fund duration calculator
- **Trend Visualization**: Interactive charts and graphs

### 🎓 AI Financial Coach
- **Personalized Chat**: Context-aware financial guidance
- **Goal Setting**: Track and achieve financial milestones
- **Spending Insights**: Pattern recognition and alerts
- **Investment Suggestions**: Based on risk profile and market conditions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FinSphere Platform                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │  Chrome Extension │◄──►│  Backend (FastAPI)│◄──►│  Ollama LLM     │  │
│  │  (Manifest V3)    │    │  Port: 8000       │    │  Port: 11434    │  │
│  └────────┬─────────┘    └────────┬─────────┘    └──────────────────┘  │
│           │                       │                                      │
│           │                       ▼                                      │
│           │              ┌──────────────────┐                           │
│           │              │  PostgreSQL DB   │                           │
│           │              │  + Vector Store  │                           │
│           │              └──────────────────┘                           │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js Frontend (Port: 3000)                  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │Dashboard │ │Biometrics│ │AI Coach  │ │ Income   │ │ Graph  │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 📁 Project Structure

```
Mumbai_Hackz2/
├── 📂 finsphere-frontend/          # Next.js 14 Frontend Application
│   ├── app/                        # App Router pages
│   │   ├── page.tsx               # Main dashboard
│   │   ├── biometrics/            # Biometric monitoring
│   │   ├── coach/                 # AI financial coach
│   │   ├── income/                # Income tracking
│   │   ├── graph/                 # Financial visualizations
│   │   ├── login/                 # Authentication
│   │   └── register/              # User registration
│   ├── components/                 # React components
│   │   ├── dashboard/             # Dashboard widgets
│   │   ├── biometrics/            # Health monitoring UI
│   │   ├── coach/                 # Chat interface
│   │   └── ui/                    # Shadcn/UI components
│   └── contexts/                   # React contexts
│
├── 📂 finsphere-backend/           # FastAPI Backend Server
│   ├── main.py                    # Application entry point
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py            # Authentication endpoints
│   │   │   └── endpoints.py       # API routes
│   │   ├── core/
│   │   │   ├── config.py          # Configuration settings
│   │   │   ├── database.py        # Database connections
│   │   │   └── prompts.py         # AI prompt templates
│   │   ├── models/
│   │   │   ├── database.py        # SQLAlchemy models
│   │   │   └── schemas.py         # Pydantic schemas
│   │   └── services/
│   │       ├── analyzer.py        # Spending analysis
│   │       ├── auth_service.py    # Auth logic
│   │       ├── ollama_service.py  # LLM integration
│   │       ├── rag_service.py     # RAG implementation
│   │       └── vector_db.py       # Vector database
│   └── requirements.txt           # Python dependencies
│
├── 📂 finsphere-extension/         # Chrome Browser Extension
│   ├── manifest.json              # Extension manifest (V3)
│   ├── background.js              # Service worker
│   ├── enhanced-content.js        # Content script
│   ├── popup.html                 # Extension popup
│   ├── popup.js                   # Popup logic
│   └── styles.css                 # Extension styles
│
├── 📂 dataset/                     # Sample data & scripts
│   ├── comprehensive_user_dataset.json
│   ├── user_profiles.json
│   ├── populate_databases.py
│   └── generate_comprehensive_data.py
│
├── 📂 ml/                          # Machine Learning Models
│   ├── emotion_detection/         # Stress detection
│   └── spending_prediction/       # Spending forecasts
│
└── 📂 infra/                       # Infrastructure
    └── docker/                    # Docker configurations
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** v18+ and pnpm
- **Python** 3.10+
- **Ollama** with `gpt-oss:20b-cloud` model
- **PostgreSQL** (optional, for persistence)
- **Chrome/Edge** browser

### Step 1: Clone Repository

```bash
git clone https://github.com/Sanjay-Aski/Mumbai_Hackz.git
cd Mumbai_Hackz
```

### Step 2: Setup Backend

```bash
cd finsphere-backend

# Create virtual environment
python -m venv env
.\env\Scripts\activate  # Windows
# source env/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start backend server
python main.py
```

Backend runs on: `http://localhost:8000`

### Step 3: Setup Frontend

```bash
cd finsphere-frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Frontend runs on: `http://localhost:3000`

### Step 4: Setup Ollama (AI Engine)

```bash
# Install Ollama from https://ollama.ai

# Pull the required model
ollama pull gpt-oss:20b-cloud

# Start Ollama server (runs automatically on install)
ollama serve
```

Ollama API: `http://localhost:11434`

### Step 5: Install Browser Extension

1. Open Chrome/Edge and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `finsphere-extension` folder
5. Pin the FinSphere extension to your toolbar

---

## 📱 Usage

### Dashboard

Access the main dashboard at `http://localhost:3000`:

- **Financial Overview**: Real-time spending metrics
- **Stress Indicator**: Current biometric status
- **Recent Activity**: Latest transactions and interventions
- **Quick Actions**: Navigate to different modules

### Browser Extension

1. **Visit any e-commerce site** (Amazon, Flipkart, etc.)
2. **Click Buy Now/Add to Cart** on any product
3. **AI Analysis Popup** appears with:
   - Risk assessment (Low/Medium/High)
   - Purchase amount and product details
   - AI-powered recommendation
   - Proceed or Cancel options

### AI Coach

Navigate to `/coach` for personalized financial guidance:

```
You: "Should I buy the new iPhone for ₹80,000?"

FinSphere AI: "Based on your financial profile:
- This represents 160% of your monthly savings
- Your stress level is currently elevated (7/10)
- You have 3 similar purchases this month

Recommendation: Wait 7 days. If you still want it, consider:
1. Trading in your current device
2. Using EMI options
3. Waiting for upcoming sales"
```

### Biometrics

Connect wearable devices or manually input:

- Heart rate (BPM)
- Heart Rate Variability (ms)
- Sleep quality (hours)
- Stress level (1-10)

---

## 🔌 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Key Endpoints

#### User & Authentication
```http
POST /auth/register          # Create new user
POST /auth/login             # User login
GET  /user/{id}/profile      # Get user profile
```

#### Financial Data
```http
GET  /realtime/dashboard/{user_id}    # Dashboard metrics
GET  /user/{id}/recent-activity       # Recent transactions
POST /ingest/transaction              # Record transaction
```

#### AI Analysis
```http
POST /intervention/analyze            # Analyze purchase
POST /intervention/response           # Record user decision
GET  /historical/biometrics/{user_id} # Biometric history
```

#### Coach
```http
POST /coach/chat                      # Send message to AI coach
GET  /coach/history/{user_id}         # Chat history
```
<!-- 
### Sample Request

```bash
curl -X POST http://localhost:8000/api/v1/intervention/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "amount": 15000,
    "product": "Wireless Headphones",
    "site": "amazon",
    "category": "electronics"
  }'
```

### Sample Response

```json
{
  "shouldIntervene": true,
  "riskLevel": "medium",
  "eligibility": "🟡 Proceed with Caution",
  "reasons": [
    "Moderate expense: ₹15,000",
    "3 purchases already made today"
  ],
  "recommendations": [
    "Wait 24 hours before making this purchase",
    "Compare prices on other platforms"
  ],
  "aiPowered": true,
  "aiModel": "gpt-oss:20b-cloud"
}
```

--- -->

## 🛡️ Supported E-commerce Sites

| Category | Sites |
|----------|-------|
| **General** | Amazon, Flipkart, Snapdeal, ShopClues, Tata CLiQ |
| **Fashion** | Myntra, Ajio, Koovs, LimeRoad, Jabong |
| **Food** | Swiggy, Zomato, Uber Eats, Dominos, Pizza Hut |
| **Beauty** | Nykaa, Purplle, BeautyBebo |
| **Electronics** | Croma, Vijay Sales, Reliance Digital |
| **Furniture** | Pepperfry, Urban Ladder |
| **Grocery** | BigBasket, Grofers, Blinkit, Zepto, JioMart |
| **Travel** | MakeMyTrip, Goibibo, Yatra, Cleartrip |
| **Pharmacy** | Netmeds, PharmEasy, 1mg, Apollo |

---

## 🧠 AI Models

### Ollama Integration

FinSphere uses local LLM for privacy-first AI analysis:
<!-- 
```javascript
const AI_CONFIG = {
  model: 'gpt-oss:20b-cloud',
  maxTokens: 500,
  temperature: 0.3,
  timeout: 30000
};
``` -->

### Analysis Prompt

The AI evaluates purchases based on:
- **Product details**: Name, price, category
- **User context**: Daily purchases, weekly spending, budget
- **Time factors**: Time of day, day of week
- **Behavioral signals**: Quick decisions, stress indicators

---

## 🔒 Privacy & Security

- **Local AI Processing**: All AI analysis runs locally via Ollama
- **No Auth Required**: Extension works without login for privacy
- **Minimal Data Collection**: Only essential metrics stored
- **User Control**: Full control over data and interventions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Shadcn/UI |
| **Backend** | FastAPI, Python 3.10+, SQLAlchemy, Pydantic |
| **AI/ML** | Ollama, LangChain, Vector Embeddings |
| **Extension** | Chrome Manifest V3, JavaScript |
| **Database** | PostgreSQL, ChromaDB (vectors) |
| **Charts** | Recharts, D3.js |

---

## 👥 Team

Built with ❤️

[Sanjay Aski](https://github.com/Sanjay-Aski/)

[Bikas Paul](https://github.com/Bikas981)

[Yash Mahajan](https://github.com/Yash-Mahajan-28)

 during Mumbai NESCO 24-hour Hackathon

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Mumbai NESCO Hackathon** for the opportunity
- **Ollama** for local LLM capabilities
- **Shadcn/UI** for beautiful components
- All open-source contributors

---

<div align="center">

**[⬆ Back to Top](#️-finsphere---ai-powered-financial-wellness-platform)**

Made with 💙 for better financial wellness

</div>
