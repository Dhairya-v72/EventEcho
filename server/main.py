import os
import sys
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add project root to sys.path so we can import from src
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from src.event_study_engine import EventStudyEngine

app = FastAPI(
    title="EventEcho Quantitative API",
    description="Quantitative Event Study, Patell Z-Score, and Financial NLP Backend",
    version="1.0.0"
)

# CORS configuration explicitly allowing your Vercel deployment
origins = [
    "https://event-echo-chi.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = EventStudyEngine()


class HeadlineRequest(BaseModel):
    headline: str


class BacktestRequest(BaseModel):
    transaction_cost_bps: float = 10.0
    holding_days: int = 3


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "EventEcho Quantitative Engine API",
        "frontend": "https://event-echo-chi.vercel.app",
        "endpoints": [
            "/api/kpis",
            "/api/categories",
            "/api/events",
            "/api/caar",
            "/api/comparisons",
            "/api/significance-summary",
            "/api/significance",
            "/api/out-of-sample",
            "/api/classify-headline",
            "/api/backtest"
        ]
    }


@app.get("/api/kpis")
def get_kpis():
    return engine.get_summary_metrics()


@app.get("/api/categories")
def get_categories():
    return engine.get_filter_options()


@app.get("/api/events")
def get_events(
    limit: int = Query(50, description="Max records to return"),
    company: str = Query("All", description="Company filter"),
    event: str = Query("All", description="Event category filter")
):
    return engine.get_event_records(limit=limit, company=company, event=event)


@app.get("/api/comparisons")
def get_comparisons():
    return engine.get_comparison_metrics()


@app.get("/api/caar")
def get_caar(
    event: str = Query("All", description="Event category filter"),
    sector: str = Query("All", description="Sector filter"),
    window: int = Query(5, description="Event window length in days (e.g. 1, 3, 5)")
):
    return engine.get_caar_trajectory(event_filter=event, sector_filter=sector, window_size=window)


@app.get("/api/significance-summary")
def get_significance_summary(
    event: str = Query("All", description="Event category filter"),
    sector: str = Query("All", description="Sector filter"),
    window: int = Query(1, description="Event window length (1, 3, or 5)")
):
    return engine.get_significance_summary(event_filter=event, sector_filter=sector, window_size=window)


@app.get("/api/significance")
def get_significance():
    return engine.get_significance_table()


@app.get("/api/out-of-sample")
def get_out_of_sample(
    window: int = Query(1, description="Event window length (1, 3, or 5)")
):
    return engine.get_out_of_sample_validation(window_size=window)


@app.post("/api/classify-headline")
def classify_headline(payload: HeadlineRequest):
    return engine.classify_headline(payload.headline)


@app.post("/api/backtest")
def run_backtest(payload: BacktestRequest):
    return engine.backtest_strategy(
        transaction_cost_bps=payload.transaction_cost_bps,
        holding_days=payload.holding_days
    )


if __name__ == "__main__":
    import uvicorn
    # Render assigns dynamic port via $PORT
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server.main:app", host="0.0.0.0", port=port, reload=False)
