# EventEcho: Quantitative Event Study & Market Reaction Analysis Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An institutional-grade quantitative finance platform that measures how individual equities react to corporate, macroeconomic, and geopolitical news events relative to broad market benchmarks. EventEcho combines econometric market models, standardized residual testing, natural language processing (NLP), and friction-adjusted strategy backtesting into an interactive terminal dashboard.

---

## 📌 Executive Summary & The Problem

Corporate earnings announcements, interest rate decisions, policy shifts, and supply chain disruptions trigger market volatility. However, a stock's movement around an announcement often reflects broad market sentiment or random drift. Analysts require a rigorous statistical framework to:
1. Isolate **Abnormal Performance** against a market benchmark ($R_{it} = \alpha_i + \beta_i R_{mt} + \varepsilon_{it}$).
2. Test whether observed reactions are **statistically meaningful** rather than random noise (Student $t$-test & **Patell $Z$-score**).
3. Detect and account for **confounding events** (overlapping announcements for the same company).
4. Evaluate whether historical patterns generalize to unseen events and survive real-world **transaction costs and slippage**.

---

## 🏗️ Architecture & Project Structure

```text
EventEcho/
├── notebooks/                              # Step-by-Step Quantitative Research
│   ├── 01_data_cleaning_and_feature_engineering.ipynb
│   ├── 02_market_model_and_event_study.ipynb
│   ├── 03_nlp_event_classification.ipynb
│   └── 04_trading_strategy_and_backtesting.ipynb
├── src/                                    # Reusable Quantitative Core Engine
│   └── event_study_engine.py               # Econometric models, Patell Z, OOS tests, Backtester
├── server/                                 # FastAPI REST Backend
│   └── main.py                             # API route definitions & CORS handlers
├── api/                                    # Vercel Serverless Entrypoint
│   └── index.py                            # Exposes FastAPI app for serverless deployment
├── client/                                 # React (Vite + Tailwind CSS) Dashboard
│   ├── src/
│   │   ├── App.jsx                         # Professional Left-Sidebar Terminal UI
│   │   ├── index.css                       # Midnight Navy palette design system
│   │   └── main.jsx
│   └── package.json
├── data/                                   # Historical callsets & generated outputs
│   ├── financial_news_events.csv           # Raw source dataset (3,024 records)
│   ├── eventecho_master_dataset.csv        # Synthesized stock returns & confounding flags
│   ├── event_study_results.csv             # AR, CAR [-1,+1], [-3,+3], [-5,+5] calculations
│   └── backtest_summary.csv                # In-sample vs Out-of-sample performance metrics
├── models/                                 # Serialized Machine Learning Artifacts
│   └── event_classifier_pipeline.joblib    # TF-IDF + LinearSVC Pipeline
├── vercel.json                             # Unified Serverless & SPA deployment configuration
├── requirements.txt                        # Backend dependencies
└── README.md
```

---

## 📊 Quantitative Methodology

### 1. Market Model Calibration (OLS)
For each company $i$, normal expected returns are estimated over the pre-event window:
$$\mathbb{E}[R_{it}] = \hat{\alpha}_i + \hat{\beta}_i R_{mt}$$
where $R_{mt}$ represents the broad market benchmark return, $\hat{\beta}_i$ measures systematic risk exposure, and $\hat{\alpha}_i$ captures baseline drift.

### 2. Abnormal Returns ($AR$) & Cumulative Abnormal Returns ($CAR$)
Daily abnormal returns isolate the event shock:
$$AR_{it} = R_{it} - \mathbb{E}[R_{it}]$$
Cumulative abnormal returns aggregate performance across specified event horizons $\tau \in [\tau_1, \tau_2]$:
$$CAR_i(\tau_1, \tau_2) = \sum_{t=\tau_1}^{\tau_2} AR_{it}$$

### 3. Statistical Testing: Student's $t$-test & Patell $Z$-Score
To prevent cross-sectional heteroskedasticity from distorting aggregate tests, the platform calculates both:
- **Cross-Sectional $t$-test**:
  $$t = \frac{\overline{CAR}}{\text{SE}(CAR)} = \frac{\overline{CAR}}{s / \sqrt{N}}$$
- **Patell Standardized Residual Test ($Z$)**:
  $$SAR_{it} = \frac{AR_{it}}{\hat{\sigma}_{\varepsilon i}}, \quad Z = \frac{1}{\sqrt{N}} \sum_{i=1}^N SAR_{it}$$
Both test statistics are reported alongside 2-tailed $p$-values and 95% Confidence Intervals.

### 4. Confounding Event Isolation
Events with overlapping corporate announcements within the same observation window are flagged (`Is_Confounded = True`), preventing contaminated events from biasing pure event studies.

### 5. Out-of-Sample Generalization & Honest Reporting
The dataset is chronologically split at the 70% threshold into:
- **In-Sample Period (First 70%)**: Hypothesis generation & parameter calibration.
- **Out-of-Sample Period (Final 30%)**: Forward validation on unseen market regimes.
The platform computes pattern decay rates and provides transparent diagnostic reports if anomaly magnitude weakens.

---

## 🧠 NLP Financial News Classifier

The platform incorporates an integrated text categorization pipeline:
- **Preprocessing**: Financial regex cleaning (removing noise while preserving acronyms like Fed, GDP, IPO).
- **Representation**: N-gram TF-IDF Vectorization (unigrams + bigrams) with sublinear term-frequency scaling.
- **Classifier**: High-margin **Linear Support Vector Classifier (LinearSVC)** evaluated with Stratified 5-Fold Cross Validation.
- **Inference**: Given any raw financial headline, the system predicts the event category and matches historical abnormal reaction profiles in real time.

---

## 💻 Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone & Set Up Backend
```powershell
git clone https://github.com/your-username/EventEcho.git
cd EventEcho

# Install Python requirements
pip install -r requirements.txt

# Start FastAPI backend
python -m uvicorn server.main:app --port 8000 --reload
```
API Documentation will be live at `http://localhost:8000/docs`.

### 2. Set Up Frontend
Open a second terminal window:
```powershell
cd client

# Install frontend dependencies
npm install

# Start Vite React development server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🚀 Deployment on Vercel

The repository includes a ready-to-deploy [`vercel.json`](./vercel.json) that automatically configures:
- **FastAPI Backend** as a Python Serverless Function (`api/index.py`).
- **React Frontend** as a static Single Page Application.

### Quick Deploy:
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `EventEcho` repository.
4. Leave all default build settings as detected and click **Deploy**.

---

## 🎨 UI & Terminal Color System

| UI Component | Role | Hex Code |
| :--- | :--- | :--- |
| **Main Background** | Midnight Navy | `#080D19` |
| **Sidebar** | Deep Navy | `#0B1220` |
| **Cards & Panels** | Slate Navy | `#111B2E` |
| **Borders** | Muted Slate | `#263247` |
| **Primary Actions** | Electric Blue | `#3B82F6` |
| **Positive Returns** | Emerald | `#34D399` |
| **Negative Returns** | Coral Red | `#F87171` |
| **Main Typography** | Off-White | `#F8FAFC` |
| **Secondary Typography**| Slate Gray | `#94A3B8` |
| **ML / AI Highlights** | Violet | `#A78BFA` |

---

## 📜 License
This project is open-source and licensed under the MIT License.

