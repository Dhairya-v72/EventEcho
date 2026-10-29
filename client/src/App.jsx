import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  BrainCircuit, 
  ShieldAlert, 
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Table,
  Layers,
  Compass,
  Check,
  HelpCircle,
  Database,
  ChevronRight
} from 'lucide-react';

// Dynamically point to relative /api on Vercel, or localhost:8000 in local dev
const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8000/api" : "/api");

export default function App() {
  const [activeTab, setActiveTab] = useState('event-study');
  
  // Data states
  const [kpis, setKpis] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ events: [], sectors: [], companies: [] });
  const [selectedEvent, setSelectedEvent] = useState("All");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [eventWindowSize, setEventWindowSize] = useState(1); // 1, 3, or 5 days
  
  const [caarPayload, setCaarPayload] = useState({ trajectory: [], pre_volatility_pct: 0, post_volatility_pct: 0, volatility_shift_pct: 0 });
  const [significanceSummary, setSignificanceSummary] = useState(null);
  const [significanceData, setSignificanceData] = useState([]);
  const [eventRecords, setEventRecords] = useState([]);
  const [comparisons, setComparisons] = useState({ by_company: [], by_sector: [], by_event: [] });
  const [oosValidation, setOosValidation] = useState(null);
  
  // NLP Headline state
  const [headlineInput, setHeadlineInput] = useState("Federal Reserve decides to cut benchmark interest rate by 50 basis points");
  const [nlpResult, setNlpResult] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  
  // Backtest simulation state
  const [costBps, setCostBps] = useState(10);
  const [holdingDays, setHoldingDays] = useState(3);
  const [backtestResult, setBacktestResult] = useState(null);
  const [isBacktesting, setIsBacktesting] = useState(false);

  // Initial Load
  useEffect(() => {
    fetchKPIs();
    fetchFilterOptions();
    fetchSignificance();
    fetchEventRecords("All", "All");
    fetchComparisons();
    runBacktestSimulation(10, 3);
  }, []);

  // Update CAAR, Significance Summary, and Out-of-Sample when filters change
  useEffect(() => {
    fetchCAAR(selectedEvent, selectedSector, eventWindowSize);
    fetchSignificanceSummary(selectedEvent, selectedSector, eventWindowSize);
    fetchOutOfSample(eventWindowSize);
  }, [selectedEvent, selectedSector, eventWindowSize]);

  const fetchKPIs = async () => {
    try {
      const res = await fetch(`${API_BASE}/kpis`);
      const data = await res.json();
      setKpis(data);
    } catch (err) {
      console.error("Failed to load KPIs", err);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      setFilterOptions({
        events: ["All", ...data.events],
        sectors: ["All", ...data.sectors],
        companies: ["All", ...data.companies]
      });
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const fetchEventRecords = async (comp = "All", ev = "All") => {
    try {
      const res = await fetch(`${API_BASE}/events?limit=30&company=${encodeURIComponent(comp)}&event=${encodeURIComponent(ev)}`);
      const data = await res.json();
      setEventRecords(data);
    } catch (err) {
      console.error("Failed to load event records", err);
    }
  };

  const fetchComparisons = async () => {
    try {
      const res = await fetch(`${API_BASE}/comparisons`);
      const data = await res.json();
      setComparisons(data);
    } catch (err) {
      console.error("Failed to load comparisons", err);
    }
  };

  const fetchCAAR = async (event, sector, windowSize) => {
    try {
      const res = await fetch(`${API_BASE}/caar?event=${encodeURIComponent(event)}&sector=${encodeURIComponent(sector)}&window=${windowSize}`);
      const data = await res.json();
      setCaarPayload(data);
    } catch (err) {
      console.error("Failed to load CAAR", err);
    }
  };

  const fetchSignificanceSummary = async (event, sector, windowSize) => {
    try {
      const res = await fetch(`${API_BASE}/significance-summary?event=${encodeURIComponent(event)}&sector=${encodeURIComponent(sector)}&window=${windowSize}`);
      const data = await res.json();
      setSignificanceSummary(data);
    } catch (err) {
      console.error("Failed to load significance summary", err);
    }
  };

  const fetchSignificance = async () => {
    try {
      const res = await fetch(`${API_BASE}/significance`);
      const data = await res.json();
      setSignificanceData(data);
    } catch (err) {
      console.error("Failed to load significance table", err);
    }
  };

  const fetchOutOfSample = async (windowSize) => {
    try {
      const res = await fetch(`${API_BASE}/out-of-sample?window=${windowSize}`);
      const data = await res.json();
      setOosValidation(data);
    } catch (err) {
      console.error("Failed to load out-of-sample validation", err);
    }
  };

  const handleClassifyHeadline = async (textToClassify) => {
    const text = textToClassify || headlineInput;
    if (!text.trim()) return;
    setIsClassifying(true);
    try {
      const res = await fetch(`${API_BASE}/classify-headline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline: text })
      });
      const data = await res.json();
      setNlpResult(data);
    } catch (err) {
      console.error("Classification error", err);
    } finally {
      setIsClassifying(false);
    }
  };

  const runBacktestSimulation = async (bps, days) => {
    setIsBacktesting(true);
    try {
      const res = await fetch(`${API_BASE}/backtest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_cost_bps: Number(bps), holding_days: Number(days) })
      });
      const data = await res.json();
      setBacktestResult(data);
    } catch (err) {
      console.error("Backtest error", err);
    } finally {
      setIsBacktesting(false);
    }
  };

  // SVG Chart rendering
  const renderCaarSvg = () => {
    const caarData = caarPayload.trajectory || [];
    if (!caarData || caarData.length === 0) return null;
    const width = 740;
    const height = 280;
    const padding = 55;

    const values = caarData.map(d => d.caar_pct);
    const minVal = Math.min(...values, -0.6);
    const maxVal = Math.max(...values, 0.6);
    const range = (maxVal - minVal) || 1;

    const getX = (index) => padding + (index / (caarData.length - 1)) * (width - 2 * padding);
    const getY = (val) => height - padding - ((val - minVal) / range) * (height - 2 * padding);

    const points = caarData.map((d, i) => `${getX(i)},${getY(d.caar_pct)}`).join(" ");
    const zeroY = getY(0);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-72 rounded-xl p-2" style={{ backgroundColor: '#0B1220' }}>
        <line x1={padding} y1={zeroY} x2={width - padding} y2={zeroY} stroke="#263247" strokeDasharray="4" strokeWidth="1.5" />
        <text x={padding - 46} y={zeroY + 4} fill="#94A3B8" fontSize="12" fontFamily="monospace">0.0%</text>

        {caarData.findIndex(d => d.tau === 0) !== -1 && (
          <>
            <line 
              x1={getX(caarData.findIndex(d => d.tau === 0))} 
              y1={padding - 10} 
              x2={getX(caarData.findIndex(d => d.tau === 0))} 
              y2={height - padding} 
              stroke="#3B82F6" 
              strokeDasharray="2" 
              strokeWidth="2" 
            />
            <text 
              x={getX(caarData.findIndex(d => d.tau === 0)) - 28} 
              y={padding - 15} 
              fill="#3B82F6" 
              fontSize="12" 
              fontWeight="bold"
            >
              Event Day (τ=0)
            </text>
          </>
        )}

        <polyline fill="none" stroke="#3B82F6" strokeWidth="3" points={points} />

        {caarData.map((d, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.caar_pct)} r="5" fill="#3B82F6" stroke="#080D19" strokeWidth="2" />
            <text x={getX(i) - 9} y={height - padding + 20} fill="#94A3B8" fontSize="12" fontFamily="monospace">
              {d.tau > 0 ? `+${d.tau}` : d.tau}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const navItems = [
    { id: 'event-study', label: '1. Event Study & Significance', icon: BarChart3 },
    { id: 'price-returns', label: '2. Prices & Return Decomp', icon: Table },
    { id: 'cross-comparison', label: '3. Cross Comparisons', icon: Layers },
    { id: 'out-of-sample', label: '4. Out-of-Sample Validation', icon: Compass },
    { id: 'nlp-classifier', label: '5. NLP Headline Classifier', icon: BrainCircuit, badge: 'ML' },
    { id: 'backtester', label: '6. Strategy Backtester', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen w-full min-w-0 flex flex-col md:flex-row font-sans text-sm" style={{ backgroundColor: '#080D19', color: '#F8FAFC' }}>
      
      {/* PROFESSIONAL LEFT SIDEBAR */}
      <aside 
        className="w-full md:w-80 md:shrink-0 flex flex-col border-b md:border-b-0 md:border-r md:sticky md:top-0 md:h-screen select-none z-30 text-sm"
        style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}
      >
        {/* Brand Header */}
        <div className="p-4 md:p-6 border-b" style={{ borderColor: '#263247' }}>
          <div className="flex items-center space-x-3.5">
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: '#3B82F6' }}
            >
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                EventEcho
                <span 
                  className="text-xs px-2 py-0.5 rounded font-mono font-medium border"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', borderColor: 'rgba(59, 130, 246, 0.3)' }}
                >
                  v1.0 Quant
                </span>
              </h1>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Market Reaction & Event Study</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex flex-row gap-2 overflow-x-auto px-3 py-2 md:flex-1 md:flex-col md:space-y-2 md:overflow-y-auto md:p-4">
          <div className="hidden md:block text-xs font-semibold uppercase tracking-wider px-3.5 py-2" style={{ color: '#94A3B8' }}>
            Quantitative Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-auto shrink-0 md:w-full flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3.5 text-sm font-semibold rounded-xl transition-all ${
                  isActive ? 'shadow-md text-white font-bold' : 'hover:bg-slate-800/40'
                }`}
                style={{
                  backgroundColor: isActive ? '#3B82F6' : 'transparent',
                  color: isActive ? '#F8FAFC' : '#94A3B8'
                }}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="w-5 h-5 shrink-0" style={{ color: isActive ? '#FFFFFF' : (item.badge ? '#A78BFA' : '#94A3B8') }} />
                  <span className="text-left whitespace-nowrap">{item.label}</span>
                </div>
                {item.badge ? (
                  <span 
                    className="text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider font-bold"
                    style={{ backgroundColor: 'rgba(167, 139, 250, 0.2)', color: '#A78BFA' }}
                  >
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-4 h-4 opacity-80" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Status Footer */}
        <div className="hidden md:block p-4 border-t" style={{ borderColor: '#263247' }}>
          <div className="p-3.5 rounded-xl border flex items-center gap-3.5" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#34D399' }}></div>
            <div>
              <p className="text-sm font-semibold text-white">Quant Engine Online</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>OLS Market Model Active</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-visible md:overflow-y-auto">
        
        {/* Top Header Bar */}
        <header 
          className="border-b px-4 py-4 sm:px-6 lg:px-8 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 backdrop-blur z-20"
          style={{ backgroundColor: 'rgba(8, 13, 25, 0.85)', borderColor: '#263247' }}
        >
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide break-words">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
            <p className="hidden xl:block text-xs mt-0.5" style={{ color: '#94A3B8' }}>
              Standardized Residual (Patell Z) • Cross-Sectional OLS Estimation • Transaction Friction Backtesting
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span 
              className="text-xs font-mono px-3.5 py-2 rounded-lg border flex items-center gap-2"
              style={{ backgroundColor: '#111B2E', borderColor: '#263247', color: '#94A3B8' }}
            >
              <Database className="w-4 h-4 text-blue-400" />
              <span>Dataset: <strong className="text-white">3,024 Records</strong></span>
            </span>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="w-full min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
          
          {/* TOP KPI METRICS STRIP */}
          {kpis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="border rounded-xl p-4.5 shadow-sm" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#94A3B8' }}>Total Events</span>
                <p className="text-2xl font-bold mt-1.5 text-white">{kpis.total_events.toLocaleString()}</p>
                <span className="text-xs mt-1.5 flex items-center gap-1 font-mono" style={{ color: '#34D399' }}>
                  <CheckCircle2 className="w-4 h-4" /> 100% Ingested
                </span>
              </div>

              <div className="border rounded-xl p-4.5 shadow-sm" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#94A3B8' }}>Clean Events</span>
                <p className="text-2xl font-bold mt-1.5" style={{ color: '#34D399' }}>{kpis.clean_events.toLocaleString()}</p>
                <span className="text-xs mt-1.5 font-mono" style={{ color: '#94A3B8' }}>Isolated</span>
              </div>

              <div className="border rounded-xl p-4.5 shadow-sm" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#94A3B8' }}>Confounded</span>
                <p className="text-2xl font-bold mt-1.5" style={{ color: '#F87171' }}>{kpis.confounded_events.toLocaleString()}</p>
                <span className="text-xs mt-1.5 flex items-center gap-1 font-mono" style={{ color: '#F87171' }}>
                  <ShieldAlert className="w-4 h-4" /> Same-Day Overlap
                </span>
              </div>

              <div className="border rounded-xl p-4.5 shadow-sm" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#94A3B8' }}>Coverage</span>
                <p className="text-2xl font-bold mt-1.5" style={{ color: '#3B82F6' }}>{kpis.total_companies} Co.</p>
                <span className="text-xs mt-1.5 font-mono" style={{ color: '#94A3B8' }}>{kpis.total_sectors} Sectors</span>
              </div>

              <div className="border rounded-xl p-4.5 shadow-sm" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#94A3B8' }}>Avg CAR [-1,+1]</span>
                <p className="text-2xl font-bold mt-1.5" style={{ color: kpis.avg_car_1_day >= 0 ? '#34D399' : '#F87171' }}>
                  {kpis.avg_car_1_day > 0 ? `+${kpis.avg_car_1_day}%` : `${kpis.avg_car_1_day}%`}
                </p>
                <span className="text-xs mt-1.5 font-mono" style={{ color: '#94A3B8' }}>3-Day Reaction</span>
              </div>

              <div className="border rounded-xl p-4.5 shadow-sm" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#94A3B8' }}>Avg CAR [-5,+5]</span>
                <p className="text-2xl font-bold mt-1.5" style={{ color: kpis.avg_car_5_day >= 0 ? '#34D399' : '#F87171' }}>
                  {kpis.avg_car_5_day > 0 ? `+${kpis.avg_car_5_day}%` : `${kpis.avg_car_5_day}%`}
                </p>
                <span className="text-xs mt-1.5 font-mono" style={{ color: '#94A3B8' }}>11-Day Drift</span>
              </div>
            </div>
          )}

          {/* TAB 1: QUANTITATIVE EVENT STUDY & SIGNIFICANCE */}
          {activeTab === 'event-study' && (
            <div className="space-y-6">
              
              {/* Filter Toolbar */}
              <div className="border p-5 rounded-xl flex flex-wrap items-center justify-between gap-4" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                <div className="flex flex-wrap items-center gap-5">
                  <div>
                    <label className="text-xs block mb-1.5 font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Event Category</label>
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className="border text-sm rounded-lg px-3.5 py-2 text-white focus:outline-none"
                      style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}
                    >
                      {filterOptions.events.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs block mb-1.5 font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Sector</label>
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="border text-sm rounded-lg px-3.5 py-2 text-white focus:outline-none"
                      style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}
                    >
                      {filterOptions.sectors.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs block mb-1.5 font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Event Window Horizon</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "[-1, +1] (3d)", size: 1 },
                        { label: "[-3, +3] (7d)", size: 3 },
                        { label: "[-5, +5] (11d)", size: 5 }
                      ].map(win => (
                        <button
                          key={win.size}
                          onClick={() => setEventWindowSize(win.size)}
                          className="text-xs px-3 py-2 rounded-lg border font-mono transition"
                          style={{
                            backgroundColor: eventWindowSize === win.size ? '#3B82F6' : '#0B1220',
                            borderColor: eventWindowSize === win.size ? '#3B82F6' : '#263247',
                            color: eventWindowSize === win.size ? '#F8FAFC' : '#94A3B8',
                            fontWeight: eventWindowSize === win.size ? 'bold' : 'normal'
                          }}
                        >
                          {win.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Volatility Dynamics */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border px-5 py-2.5 rounded-xl text-xs font-mono" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                  <div>
                    <span className="block" style={{ color: '#94A3B8' }}>Pre-Event Vol:</span>
                    <span className="text-white font-bold text-sm">{caarPayload.pre_volatility_pct}%</span>
                  </div>
                  <div>
                    <span className="block" style={{ color: '#94A3B8' }}>Post-Event Vol:</span>
                    <span className="text-white font-bold text-sm">{caarPayload.post_volatility_pct}%</span>
                  </div>
                  <div>
                    <span className="block" style={{ color: '#94A3B8' }}>Volatility Shift:</span>
                    <span className="font-bold text-sm" style={{ color: caarPayload.volatility_shift_pct >= 0 ? '#F87171' : '#34D399' }}>
                      {caarPayload.volatility_shift_pct > 0 ? `+${caarPayload.volatility_shift_pct}%` : `${caarPayload.volatility_shift_pct}%`}
                    </span>
                  </div>
                </div>
              </div>

              {/* STATISTICAL SIGNIFICANCE SUMMARY CARD (PRIORITY 1) */}
              {significanceSummary && (
                <div className="border rounded-xl p-6 shadow-lg" style={{ backgroundColor: '#111B2E', borderColor: 'rgba(59, 130, 246, 0.4)' }}>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b" style={{ borderColor: '#263247' }}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></span>
                      <h3 className="text-sm font-bold text-white tracking-wider uppercase font-mono">
                        Statistical Rigor & Hypothesis Testing • Window {significanceSummary.window_label}
                      </h3>
                    </div>
                    <span 
                      className="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-2 border"
                      style={{
                        backgroundColor: significanceSummary.is_significant ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                        color: significanceSummary.is_significant ? '#34D399' : '#F87171',
                        borderColor: significanceSummary.is_significant ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'
                      }}
                    >
                      {significanceSummary.is_significant ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      {significanceSummary.is_significant ? "Statistically Meaningful (p < 0.05)" : "Inconclusive / Random (p ≥ 0.05)"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    <div className="p-3.5 rounded-lg border" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                      <span className="text-xs uppercase tracking-wider font-mono block" style={{ color: '#94A3B8' }}>Estimated CAAR</span>
                      <p className="text-xl font-bold font-mono mt-1" style={{ color: significanceSummary.estimate_mean_car_pct >= 0 ? '#34D399' : '#F87171' }}>
                        {significanceSummary.estimate_mean_car_pct > 0 ? `+${significanceSummary.estimate_mean_car_pct}%` : `${significanceSummary.estimate_mean_car_pct}%`}
                      </p>
                      <span className="text-[11px]" style={{ color: '#94A3B8' }}>Point Estimate</span>
                    </div>

                    <div className="p-3.5 rounded-lg border" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                      <span className="text-xs uppercase tracking-wider font-mono block" style={{ color: '#94A3B8' }}>Standard Error</span>
                      <p className="text-xl font-bold font-mono mt-1 text-white">{significanceSummary.standard_error_pct}%</p>
                      <span className="text-[11px]" style={{ color: '#94A3B8' }}>SE = s / √N</span>
                    </div>

                    <div className="p-3.5 rounded-lg border" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                      <span className="text-xs uppercase tracking-wider font-mono block" style={{ color: '#94A3B8' }}>Test Statistic</span>
                      <p className="text-xl font-bold font-mono mt-1" style={{ color: '#3B82F6' }}>t = {significanceSummary.t_statistic}</p>
                      <span className="text-[11px]" style={{ color: '#94A3B8' }}>Patell Z: {significanceSummary.patell_z}</span>
                    </div>

                    <div className="p-3.5 rounded-lg border" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                      <span className="text-xs uppercase tracking-wider font-mono block" style={{ color: '#94A3B8' }}>p-Value</span>
                      <p className="text-xl font-bold font-mono mt-1" style={{ color: significanceSummary.p_value_t < 0.05 ? '#34D399' : '#F8FAFC' }}>
                        {significanceSummary.p_value_t}
                      </p>
                      <span className="text-[11px]" style={{ color: '#94A3B8' }}>Two-tailed</span>
                    </div>

                    <div className="p-3.5 rounded-lg border" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                      <span className="text-xs uppercase tracking-wider font-mono block" style={{ color: '#94A3B8' }}>95% Conf Interval</span>
                      <p className="text-base font-bold font-mono mt-1.5" style={{ color: '#A78BFA' }}>
                        [{significanceSummary.ci_95_lower}%, {significanceSummary.ci_95_upper}%]
                      </p>
                      <span className="text-[11px]" style={{ color: '#94A3B8' }}>Parameter bounds</span>
                    </div>

                    <div className="p-3.5 rounded-lg border" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                      <span className="text-xs uppercase tracking-wider font-mono block" style={{ color: '#94A3B8' }}>Events Used</span>
                      <p className="text-xl font-bold font-mono text-white mt-1">{significanceSummary.events_used.toLocaleString()}</p>
                      <span className="text-[11px]" style={{ color: '#94A3B8' }}>Sample size (N)</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3.5 rounded-lg border flex items-center gap-3 text-xs" style={{ backgroundColor: '#080D19', borderColor: '#263247' }}>
                    <HelpCircle className="w-5 h-5 shrink-0" style={{ color: '#3B82F6' }} />
                    <span style={{ color: '#F8FAFC' }}><strong>Statistical Conclusion:</strong> {significanceSummary.conclusion}</span>
                  </div>
                </div>
              )}

              {/* CAAR Chart Card */}
              <div className="border rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Cumulative Average Abnormal Return (CAAR)</h3>
                    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Abnormal return drift path relative to market benchmark across relative event time τ</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="flex items-center gap-1.5" style={{ color: '#3B82F6' }}>
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#3B82F6' }}></span> CAAR Trajectory (%)
                    </span>
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span> Event Day τ=0
                    </span>
                  </div>
                </div>

                {renderCaarSvg()}
              </div>

              {/* Multi-Event Statistical Significance Table */}
              <div className="border rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white">Statistical Significance & Patell Z-Score Table</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Parametric t-test vs Patell Standardized Residual Z-Score (Heteroskedasticity-Adjusted)</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b font-mono text-xs uppercase tracking-wider" style={{ borderColor: '#263247', color: '#94A3B8' }}>
                        <th className="py-3 px-3.5">Event Category</th>
                        <th className="py-3 px-3.5">Sample (N)</th>
                        <th className="py-3 px-3.5">Mean CAR</th>
                        <th className="py-3 px-3.5">Std Error</th>
                        <th className="py-3 px-3.5">95% CI</th>
                        <th className="py-3 px-3.5">t-Stat</th>
                        <th className="py-3 px-3.5">p-value (t)</th>
                        <th className="py-3 px-3.5">Patell Z</th>
                        <th className="py-3 px-3.5">Significance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-mono text-xs" style={{ borderColor: '#263247' }}>
                      {significanceData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20 transition">
                          <td className="py-3.5 px-3.5 font-sans font-medium text-white">{row.market_event}</td>
                          <td className="py-3.5 px-3.5" style={{ color: '#94A3B8' }}>{row.sample_size}</td>
                          <td className="py-3.5 px-3.5 font-bold" style={{ color: row.mean_car_pct >= 0 ? '#34D399' : '#F87171' }}>
                            {row.mean_car_pct > 0 ? `+${row.mean_car_pct}%` : `${row.mean_car_pct}%`}
                          </td>
                          <td className="py-3.5 px-3.5" style={{ color: '#94A3B8' }}>{row.se_pct}%</td>
                          <td className="py-3.5 px-3.5 text-xs" style={{ color: '#A78BFA' }}>{row.ci_95}</td>
                          <td className="py-3.5 px-3.5 text-white">{row.t_stat}</td>
                          <td className="py-3.5 px-3.5" style={{ color: row.p_value_t < 0.05 ? '#34D399' : '#94A3B8' }}>{row.p_value_t}</td>
                          <td className="py-3.5 px-3.5 font-bold" style={{ color: '#3B82F6' }}>{row.patell_z}</td>
                          <td className="py-3.5 px-3.5">
                            {row.is_significant ? (
                              <span 
                                className="px-2.5 py-1 rounded text-xs font-sans font-semibold border"
                                style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34D399', borderColor: 'rgba(52, 211, 153, 0.3)' }}
                              >
                                Significant
                              </span>
                            ) : (
                              <span className="text-xs font-sans" style={{ color: '#94A3B8' }}>Fail to Reject</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICES & RETURN DECOMPOSITION */}
          {activeTab === 'price-returns' && (
            <div className="border rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Historical Stock Prices & Return Decomposition</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Decomposition: Actual Return (Ri) = Expected Return E[R] + Abnormal Return (AR)</p>
                </div>

                <select
                  value={selectedCompany}
                  onChange={(e) => {
                    setSelectedCompany(e.target.value);
                    fetchEventRecords(e.target.value, selectedEvent);
                  }}
                  className="border text-xs rounded-lg px-3.5 py-2 text-white"
                  style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}
                >
                  {filterOptions.companies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b font-mono text-xs uppercase tracking-wider" style={{ borderColor: '#263247', color: '#94A3B8' }}>
                      <th className="py-3.5 px-3.5">Date</th>
                      <th className="py-3.5 px-3.5">Company</th>
                      <th className="py-3.5 px-3.5">Stock Price</th>
                      <th className="py-3.5 px-3.5">Benchmark (Rm)</th>
                      <th className="py-3.5 px-3.5">Actual (Ri)</th>
                      <th className="py-3.5 px-3.5">Expected E[R]</th>
                      <th className="py-3.5 px-3.5 font-bold" style={{ color: '#3B82F6' }}>Abnormal (AR)</th>
                      <th className="py-3.5 px-3.5">Pre/Post Vol</th>
                      <th className="py-3.5 px-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono text-xs" style={{ borderColor: '#263247' }}>
                    {eventRecords.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20 transition">
                        <td className="py-3.5 px-3.5" style={{ color: '#94A3B8' }}>{r.date}</td>
                        <td className="py-3.5 px-3.5 font-sans font-medium text-white">{r.company}</td>
                        <td className="py-3.5 px-3.5 font-bold text-amber-300">${r.stock_price}</td>
                        <td className="py-3.5 px-3.5" style={{ color: r.benchmark_return_pct >= 0 ? '#34D399' : '#F87171' }}>
                          {r.benchmark_return_pct > 0 ? `+${r.benchmark_return_pct}%` : `${r.benchmark_return_pct}%`}
                        </td>
                        <td className="py-3.5 px-3.5" style={{ color: r.actual_return_pct >= 0 ? '#34D399' : '#F87171' }}>
                          {r.actual_return_pct > 0 ? `+${r.actual_return_pct}%` : `${r.actual_return_pct}%`}
                        </td>
                        <td className="py-3.5 px-3.5" style={{ color: '#94A3B8' }}>{r.expected_return_pct}%</td>
                        <td className="py-3.5 px-3.5 font-bold" style={{ color: r.abnormal_return_pct >= 0 ? '#3B82F6' : '#F87171' }}>
                          {r.abnormal_return_pct > 0 ? `+${r.abnormal_return_pct}%` : `${r.abnormal_return_pct}%`}
                        </td>
                        <td className="py-3.5 px-3.5" style={{ color: '#94A3B8' }}>{r.pre_vol_pct}% / {r.post_vol_pct}%</td>
                        <td className="py-3.5 px-3.5">
                          {r.is_confounded ? (
                            <span className="text-xs font-sans" style={{ color: '#F87171' }}>Overlapping</span>
                          ) : (
                            <span className="text-xs font-sans" style={{ color: '#34D399' }}>Clean</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CROSS COMPARISONS */}
          {activeTab === 'cross-comparison' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                <h3 className="text-lg font-bold text-white mb-1">Market Reaction by Company / Stock</h3>
                <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Ranked by Mean 3-Day Cumulative Abnormal Return (CAR)</p>
                <div className="space-y-2.5">
                  {comparisons.by_company.map((co, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-lg border" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                      <div>
                        <span className="text-sm font-semibold text-white block">{co.Related_Company}</span>
                        <span className="text-xs" style={{ color: '#94A3B8' }}>{co.count} events • Vol Ratio: {co.vol_ratio}x</span>
                      </div>
                      <span className="text-sm font-mono font-bold" style={{ color: co.mean_car_pct >= 0 ? '#34D399' : '#F87171' }}>
                        {co.mean_car_pct > 0 ? `+${co.mean_car_pct}%` : `${co.mean_car_pct}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                <h3 className="text-lg font-bold text-white mb-1">Market Reaction by Sector</h3>
                <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Ranked by Sector-wide Mean CAR</p>
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {comparisons.by_sector.map((sec, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-lg border" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                      <div>
                        <span className="text-sm font-semibold text-white block">{sec.Sector}</span>
                        <span className="text-xs" style={{ color: '#94A3B8' }}>{sec.count} events</span>
                      </div>
                      <span className="text-sm font-mono font-bold" style={{ color: sec.mean_car_pct >= 0 ? '#34D399' : '#F87171' }}>
                        {sec.mean_car_pct > 0 ? `+${sec.mean_car_pct}%` : `${sec.mean_car_pct}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OUT-OF-SAMPLE VALIDATION (PRIORITY 3) */}
          {activeTab === 'out-of-sample' && oosValidation && (
            <div className="border rounded-xl p-6 shadow-sm space-y-6" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-400" />
                    Temporal Out-of-Sample Generalization & Robustness Testing
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                    Chronological split at <strong>{oosValidation.split_date}</strong>: In-Sample (70%) vs Out-of-Sample (30%)
                  </p>
                </div>
                <div className="text-xs font-mono px-3.5 py-2 rounded-lg border" style={{ backgroundColor: '#0B1220', borderColor: '#263247', color: '#3B82F6' }}>
                  Horizon: {oosValidation.window_evaluated}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* In-Sample Card */}
                <div className="p-5 rounded-xl border" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                  <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b" style={{ borderColor: '#263247' }}>
                    <span className="text-xs font-bold uppercase tracking-wider font-mono text-blue-400">In-Sample (Calibration)</span>
                    <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>70% Partition</span>
                  </div>
                  <div className="text-xs font-mono mb-4" style={{ color: '#94A3B8' }}>{oosValidation.in_sample.date_range}</div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-lg border" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                      <span className="text-xs" style={{ color: '#94A3B8' }}>Sample Size</span>
                      <p className="text-xl font-bold text-white font-mono mt-0.5">{oosValidation.in_sample.events_count}</p>
                    </div>
                    <div className="p-3.5 rounded-lg border" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                      <span className="text-xs" style={{ color: '#94A3B8' }}>Mean CAR</span>
                      <p className="text-xl font-bold font-mono mt-0.5" style={{ color: oosValidation.in_sample.mean_car_pct >= 0 ? '#34D399' : '#F87171' }}>
                        {oosValidation.in_sample.mean_car_pct > 0 ? `+${oosValidation.in_sample.mean_car_pct}%` : `${oosValidation.in_sample.mean_car_pct}%`}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-lg border" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                      <span className="text-xs" style={{ color: '#94A3B8' }}>t-Stat / p-Val</span>
                      <p className="text-base font-bold font-mono text-white mt-1">t = {oosValidation.in_sample.t_statistic}</p>
                      <span className="text-[11px]" style={{ color: '#94A3B8' }}>p = {oosValidation.in_sample.p_value}</span>
                    </div>
                    <div className="p-3.5 rounded-lg border" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                      <span className="text-xs" style={{ color: '#94A3B8' }}>Win Rate</span>
                      <p className="text-xl font-bold font-mono mt-0.5" style={{ color: '#3B82F6' }}>{oosValidation.in_sample.win_rate_pct}%</p>
                    </div>
                  </div>
                </div>

                {/* Out-of-Sample Card */}
                <div className="p-5 rounded-xl border" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                  <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b" style={{ borderColor: '#263247' }}>
                    <span className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: '#A78BFA' }}>Out-of-Sample (Forward Validation)</span>
                    <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>30% Partition</span>
                  </div>
                  <div className="text-xs font-mono mb-4" style={{ color: '#94A3B8' }}>{oosValidation.out_of_sample.date_range}</div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-lg border" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                      <span className="text-xs" style={{ color: '#94A3B8' }}>Sample Size</span>
                      <p className="text-xl font-bold text-white font-mono mt-0.5">{oosValidation.out_of_sample.events_count}</p>
                    </div>
                    <div className="p-3.5 rounded-lg border" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                      <span className="text-xs" style={{ color: '#94A3B8' }}>Mean CAR</span>
                      <p className="text-xl font-bold font-mono mt-0.5" style={{ color: oosValidation.out_of_sample.mean_car_pct >= 0 ? '#34D399' : '#F87171' }}>
                        {oosValidation.out_of_sample.mean_car_pct > 0 ? `+${oosValidation.out_of_sample.mean_car_pct}%` : `${oosValidation.out_of_sample.mean_car_pct}%`}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-lg border" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                      <span className="text-xs" style={{ color: '#94A3B8' }}>t-Stat / p-Val</span>
                      <p className="text-base font-bold font-mono text-white mt-1">t = {oosValidation.out_of_sample.t_statistic}</p>
                      <span className="text-[11px]" style={{ color: '#94A3B8' }}>p = {oosValidation.out_of_sample.p_value}</span>
                    </div>
                    <div className="p-3.5 rounded-lg border" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
                      <span className="text-xs" style={{ color: '#94A3B8' }}>Win Rate</span>
                      <p className="text-xl font-bold font-mono mt-0.5" style={{ color: '#3B82F6' }}>{oosValidation.out_of_sample.win_rate_pct}%</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Diagnostic Box */}
              <div className="p-5 rounded-xl border" style={{ backgroundColor: '#080D19', borderColor: '#263247' }}>
                <div className="flex items-start gap-3.5">
                  <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" style={{ color: '#F87171' }} />
                  <div>
                    <h4 className="text-base font-bold text-white mb-1.5">Honest Reporting & Generalization Assessment</h4>
                    <p className="text-xs leading-relaxed" style={{ color: '#F8FAFC' }}>
                      {oosValidation.honest_diagnostic}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs font-mono" style={{ color: '#94A3B8' }}>
                      <span>In-Sample CAR: <strong className="text-white">{oosValidation.in_sample.mean_car_pct}%</strong></span>
                      <span>→</span>
                      <span>Out-of-Sample CAR: <strong className="text-white">{oosValidation.out_of_sample.mean_car_pct}%</strong></span>
                      <span>•</span>
                      <span>Net Shift: <strong style={{ color: oosValidation.car_decay_pct >= 0 ? '#34D399' : '#F87171' }}>{oosValidation.car_decay_pct}%</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NLP CLASSIFIER */}
          {activeTab === 'nlp-classifier' && (
            <div className="border rounded-xl p-6 shadow-sm space-y-6" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
              <div>
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  Real-Time Financial Headline Classification
                </h3>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Scikit-Learn TF-IDF + LinearSVC Pipeline trained on historical financial news events</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: '#94A3B8' }}>Input Financial News Headline</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={headlineInput}
                      onChange={(e) => setHeadlineInput(e.target.value)}
                      placeholder="e.g. Technology conglomerate announces record quarterly earnings and $20B share buyback..."
                      className="flex-1 border rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none"
                      style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}
                    />
                    <button
                      onClick={() => handleClassifyHeadline()}
                      disabled={isClassifying}
                      className="text-white font-medium px-6 py-3.5 text-sm rounded-xl flex items-center gap-2 transition disabled:opacity-50"
                      style={{ backgroundColor: '#3B82F6' }}
                    >
                      {isClassifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      Classify
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs block mb-2" style={{ color: '#94A3B8' }}>Or test sample headlines:</span>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      "Federal Reserve cuts interest rates by 50 bps in surprise policy pivot",
                      "Semiconductor giant files for initial public offering valuing firm at $12B",
                      "Government imposes harsh tariffs on international automotive imports",
                      "Crude oil prices tumble sharply as global supply chains ease"
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setHeadlineInput(sample);
                          handleClassifyHeadline(sample);
                        }}
                        className="text-xs border px-3.5 py-2 rounded-lg transition"
                        style={{ backgroundColor: '#0B1220', borderColor: '#263247', color: '#F8FAFC' }}
                      >
                        "{sample}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {nlpResult && (
                <div className="border-t pt-6" style={{ borderColor: '#263247' }}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#94A3B8' }}>Inference Results & Historical Context</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="border p-4.5 rounded-xl" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                      <span className="text-xs uppercase font-mono" style={{ color: '#94A3B8' }}>Predicted Event</span>
                      <p className="text-lg font-bold mt-1" style={{ color: '#A78BFA' }}>{nlpResult.predicted_event}</p>
                    </div>

                    <div className="border p-4.5 rounded-xl" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                      <span className="text-xs uppercase font-mono" style={{ color: '#94A3B8' }}>Historical Frequency</span>
                      <p className="text-lg font-bold text-white mt-1">{nlpResult.historical_occurrences} Events</p>
                    </div>

                    <div className="border p-4.5 rounded-xl" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                      <span className="text-xs uppercase font-mono" style={{ color: '#94A3B8' }}>Expected Reaction (CAR)</span>
                      <p className="text-lg font-bold mt-1" style={{ color: nlpResult.expected_abnormal_reaction_pct >= 0 ? '#34D399' : '#F87171' }}>
                        {nlpResult.expected_abnormal_reaction_pct > 0 ? `+${nlpResult.expected_abnormal_reaction_pct}%` : `${nlpResult.expected_abnormal_reaction_pct}%`}
                      </p>
                    </div>

                    <div className="border p-4.5 rounded-xl" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                      <span className="text-xs uppercase font-mono" style={{ color: '#94A3B8' }}>Quant Recommendation</span>
                      <p className="text-lg font-bold text-amber-300 mt-1">{nlpResult.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: STRATEGY BACKTESTER */}
          {activeTab === 'backtester' && (
            <div className="border rounded-xl p-6 shadow-sm space-y-6" style={{ backgroundColor: '#111B2E', borderColor: '#263247' }}>
              <div>
                <h3 className="text-lg font-bold text-white">Event-Driven Strategy Backtester</h3>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Institutional Portfolio Simulation ($10,000 base capital, 2% risk allocation) with friction</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-5 rounded-xl" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold uppercase text-white">Transaction Costs & Slippage</label>
                    <span className="text-sm font-mono font-bold" style={{ color: '#3B82F6' }}>{costBps} bps</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={costBps}
                    onChange={(e) => {
                      setCostBps(e.target.value);
                      runBacktestSimulation(e.target.value, holdingDays);
                    }}
                    className="w-full accent-blue-500"
                  />
                  <span className="text-xs mt-1 block" style={{ color: '#94A3B8' }}>Round-trip fee + execution slippage</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold uppercase text-white">Holding Window</label>
                    <span className="text-sm font-mono font-bold" style={{ color: '#3B82F6' }}>
                      {holdingDays === 3 ? "Window [-1, +1] (3 Days)" : "Window [-5, +5] (11 Days)"}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setHoldingDays(3);
                        runBacktestSimulation(costBps, 3);
                      }}
                      className="flex-1 py-2.5 text-xs font-medium rounded-lg border transition"
                      style={{
                        backgroundColor: holdingDays === 3 ? '#3B82F6' : '#111B2E',
                        borderColor: holdingDays === 3 ? '#3B82F6' : '#263247',
                        color: holdingDays === 3 ? '#F8FAFC' : '#94A3B8'
                      }}
                    >
                      Short Reaction (3 Days)
                    </button>
                    <button
                      onClick={() => {
                        setHoldingDays(5);
                        runBacktestSimulation(costBps, 5);
                      }}
                      className="flex-1 py-2.5 text-xs font-medium rounded-lg border transition"
                      style={{
                        backgroundColor: holdingDays === 5 ? '#3B82F6' : '#111B2E',
                        borderColor: holdingDays === 5 ? '#3B82F6' : '#263247',
                        color: holdingDays === 5 ? '#F8FAFC' : '#94A3B8'
                      }}
                    >
                      Extended Drift (11 Days)
                    </button>
                  </div>
                </div>
              </div>

              {backtestResult && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="border p-4.5 rounded-xl" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                    <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>Total Trades</span>
                    <p className="text-2xl font-bold text-white mt-1">{backtestResult.total_trades}</p>
                  </div>

                  <div className="border p-4.5 rounded-xl" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                    <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>Win Rate</span>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#34D399' }}>{backtestResult.win_rate_pct}%</p>
                  </div>

                  <div className="border p-4.5 rounded-xl" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                    <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>Final Portfolio</span>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#3B82F6' }}>${backtestResult.final_portfolio_val?.toLocaleString()}</p>
                    <span className="text-xs" style={{ color: '#94A3B8' }}>$10,000 Base</span>
                  </div>

                  <div className="border p-4.5 rounded-xl" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                    <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>Return</span>
                    <p className="text-2xl font-bold mt-1" style={{ color: backtestResult.total_portfolio_return_pct >= 0 ? '#34D399' : '#F87171' }}>
                      {backtestResult.total_portfolio_return_pct > 0 ? `+${backtestResult.total_portfolio_return_pct}%` : `${backtestResult.total_portfolio_return_pct}%`}
                    </p>
                  </div>

                  <div className="border p-4.5 rounded-xl" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                    <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>Cost Drag</span>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#F87171' }}>-{backtestResult.cost_drag_per_trade_pct}%</p>
                  </div>

                  <div className="border p-4.5 rounded-xl" style={{ backgroundColor: '#0B1220', borderColor: '#263247' }}>
                    <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>Sharpe Ratio</span>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#A78BFA' }}>{backtestResult.sharpe_ratio}</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
