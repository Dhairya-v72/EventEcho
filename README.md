# EventEcho: Quantitative Event Study & Financial Machine Learning Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-3B82F6?style=for-the-badge&logo=vercel&logoColor=white)](https://event-echo-chi.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://eventecho-r0ia.onrender.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

> **Live Application**: [https://event-echo-chi.vercel.app/](https://event-echo-chi.vercel.app/)  
> **API Documentation**: [https://eventecho-r0ia.onrender.com/docs](https://eventecho-r0ia.onrender.com/docs)

---

## 📌 Project Overview

**EventEcho** is an institutional-grade quantitative finance and machine learning platform designed to measure how equities react to corporate announcements, central bank decisions, economic releases, and geopolitical shocks relative to broader market benchmarks.

The platform eliminates causal assumptions by applying econometric market models ($R_{it} = \alpha_i + \beta_i R_{mt} + \varepsilon_{it}$), calculating daily **Abnormal Returns ($AR$)** and **Cumulative Average Abnormal Returns ($CAAR$)**, running statistical significance tests (**Student's $t$-test** and the **Patell $Z$-score** for cross-sectional heteroskedasticity), isolating **confounding/overlapping events**, classifying news headlines with an NLP pipeline, and validating trading hypotheses with **institutional transaction costs and slippage**.

---

## 🚀 Key Features

### 1. Quantitative Event Study & CAAR Trajectories
- **Market Model OLS Calibration**: Estimates alpha ($\alpha_i$) and systematic beta ($\beta_i$) relative to benchmark indices.
- **Dynamic Event Horizons**: Interactively toggle between alternative event windows:
  - Immediate Reaction: $[-1, +1]$ (3 days)
  - Standard Window: $[-3, +3]$ (7 days)
  - Extended Drift: $[-5, +5]$ (11 days)
- **Pre vs. Post Volatility Shift**: Quantifies changes in market volatility before and after news announcements.

### 2. Statistical Significance & Rigor (Priority 1)
- Reports **CAAR Point Estimate**, **Standard Error ($\text{SE} = s / \sqrt{N}$)**, **$t$-statistic**, and two-tailed **$p$-values**.
- **Patell Standardized Residual Test ($Z$)**: Normalizes abnormal returns by stock-specific residual variance to prevent high-volatility equities from biasing aggregate tests.
- **95% Confidence Intervals**: $[CI_{\text{lower}}, CI_{\text{upper}}]$ for estimated abnormal returns.
- **Formal Hypothesis Verdicts**: Distinguishes statistically meaningful reactions from random market noise ($p < 0.05$).

### 3. Historical Prices & Return Decomposition
- Inspects reconstructed daily stock prices, benchmark index returns ($R_{mt}$), actual returns ($R_{it}$), normal expected returns ($\mathbb{E}[R_{it}]$), and isolated abnormal returns ($AR_{it}$).
- Confounding event detection: Flags clustered/same-day overlapping corporate announcements.

### 4. Cross-Sectional Comparisons
- Side-by-side comparative rankings of average CAR across **Individual Stocks**, **Business Sectors**, and **Event Categories**.

### 5. Out-of-Sample Generalization & Honest Reporting (Priority 3)
- Strict chronological split at the 70% threshold (In-Sample Calibration vs. Out-of-Sample Forward Validation).
- Evaluates whether event-driven anomalies persist across different market regimes.
- Computes pattern decay rates and transparently reports when post-event drift weakens.

### 6. NLP Headline Classifier
- Real-time text classification pipeline (**TF-IDF + LinearSVC**) trained on historical financial news headlines.
- Predicts event categories and links them to historical abnormal reaction profiles and trading bias recommendations (Bullish / Bearish / Neutral).

### 7. Event-Driven Strategy Backtester
- Simulates long/short execution with adjustable **transaction costs & slippage (0 to 30 bps)**.
- Compares holding periods (3 days vs. 11 days).
- Computes **Net Portfolio Equity ($10,000 base capital)**, Win Rate, Annualized Sharpe Ratio, Max Drawdown, and Cost Drag.

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | **React 19** | Modern functional components with React Hooks |
| **Build Tool** | **Vite 8** | High-performance bundling and HMR |
| **Styling** | **Tailwind CSS v4** | Custom Midnight Navy institutional dark palette |
| **Icons** | **Lucide React** | Clean quantitative and financial vector icons |
| **Backend API** | **FastAPI** | High-performance asynchronous Python REST framework |
| **ASGI Server** | **Uvicorn** | Production-ready ASGI server |
| **Machine Learning**| **Scikit-Learn** | TF-IDF Vectorization, LinearSVC, Stratified K-Fold |
| **Data Processing** | **Pandas & NumPy** | Vectorized matrix operations and time-series slicing |
| **Statistics** | **SciPy (stats)** | Student $t$-distributions, Patell $Z$-score, Confidence Intervals |
| **Model Persistence**| **Joblib** | Serialized ML pipelines (`.joblib`) |
| **Frontend Host** | **Vercel** | Edge Network deployment with custom routing |
| **Backend Host** | **Render** | Cloud web service hosting FastAPI |

---

## 📂 Project Directory Structure

```text
EventEcho/
├── notebooks/                              # Jupyter Research & Methodology Notebooks
│   ├── 01_data_cleaning_and_feature_engineering.ipynb
│   ├── 02_market_model_and_event_study.ipynb
│   ├── 03_nlp_event_classification.ipynb
│   └── 04_trading_strategy_and_backtesting.ipynb
├── src/                                    # Reusable Quantitative Engine
│   ├── __init__.py
│   └── event_study_engine.py               # OLS calibration, Patell Z, OOS tests, Backtester
├── server/                                 # FastAPI Application
│   ├── __init__.py
│   └── main.py                             # API endpoints with Vercel CORS configuration
├── client/                                 # React Frontend (Vite)
│   ├── src/
│   │   ├── App.jsx                         # Main dashboard & responsive sidebar
│   │   ├── index.css                       # Design tokens & Tailwind imports
│   │   └── main.jsx                        # React root entrypoint
│   ├── package.json
│   ├── vercel.json                         # Client-side SPA routing rules
│   └── vite.config.js
├── data/                                   # Datasets & Processed Outputs
│   ├── financial_news_events.csv           # Raw source dataset (3,024 events)
│   ├── eventecho_master_dataset.csv        # Enriched features & returns
│   ├── event_study_results.csv             # AR, CAR windows, and SAR scores
│   └── backtest_summary.csv                # In-sample vs Out-of-sample summary
├── models/                                 # Serialized Machine Learning Artifacts
│   └── event_classifier_pipeline.joblib    # Trained TF-IDF + LinearSVC Pipeline
├── render.yaml                             # Render Infrastructure-as-Code Blueprint
├── vercel.json                             # Root Vercel configuration
├── requirements.txt                        # Backend dependencies
└── README.md
```

---

## 🔬 Mathematical Formulations

### 1. Market Model (OLS)
$$\mathbb{E}[R_{it}] = \hat{\alpha}_i + \hat{\beta}_i R_{mt}$$
$$\hat{\beta}_i = \frac{\text{Cov}(R_i, R_m)}{\text{Var}(R_m)}, \quad \hat{\alpha}_i = \bar{R}_i - \hat{\beta}_i \bar{R}_m$$

### 2. Daily Abnormal Return ($AR$)
$$AR_{it} = R_{it} - \mathbb{E}[R_{it}]$$

### 3. Cumulative Abnormal Return ($CAR$)
$$CAR_i(\tau_1, \tau_2) = \sum_{t=\tau_1}^{\tau_2} AR_{it}$$

### 4. Cumulative Average Abnormal Return ($CAAR$)
$$CAAR(\tau_1, \tau_2) = \frac{1}{N} \sum_{i=1}^N CAR_i(\tau_1, \tau_2)$$

### 5. Patell Standardized Residual Test ($Z$)
$$SAR_{it} = \frac{AR_{it}}{\hat{\sigma}_{\varepsilon i}}, \quad Z = \frac{1}{\sqrt{N}} \sum_{i=1}^N SAR_{it} \sim \mathcal{N}(0, 1)$$

---

## 🎨 UI Color System

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

## 💻 Local Development Setup

### 1. Backend Setup (FastAPI)
```powershell
# Clone the repository
git clone https://github.com/your-username/EventEcho.git
cd EventEcho

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn server.main:app --port 8000 --reload
```
Interactive Swagger docs: `http://localhost:8000/docs`.

### 2. Frontend Setup (React Vite)
Open a new terminal window:
```powershell
cd client

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173`.

---

## 🌐 Deployments

- **Frontend**: Deployed on [Vercel](https://event-echo-chi.vercel.app/)
- **Backend**: Deployed on [Render](https://eventecho-r0ia.onrender.com)
- **CORS Allowed**: Fully configured between Vercel and Render

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
