import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BellRing,
  Check,
  ChevronRight,
  CircleAlert,
  CloudSnow,
  ExternalLink,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Snowflake,
  Thermometer,
  Wind,
  X,
} from "lucide-react";

type Status = "open" | "delay" | "closed" | "unknown";
type Risk = "low" | "watch" | "high";
type FilterValue = "all" | Status;
type RiskFilter = "all" | Risk;

type District = {
  id: string;
  name: string;
  shortName: string;
  region: string;
  x: number;
  y: number;
  status: Status;
  officialUrl: string;
  sourceLabel: string;
  lastChecked: string;
};

type WeatherSnapshot = {
  temperature: number;
  condition: string;
  wind: string;
  snow: number;
  timing: string;
  updatedAt: string;
  sourceUrl: string;
  isLive: boolean;
};

const MAP_ASSET = "/manus-storage/Map_of_Montgomery_County_Pennsylvania_School_Districts_1a3dcbd0.png";
const NWS_POINTS_URL = "https://api.weather.gov/points/40.228,-75.286";
const FALLBACK_WEATHER: WeatherSnapshot = {
  temperature: 34,
  condition: "Forecast unavailable",
  wind: "—",
  snow: 0,
  timing: "Waiting for the next forecast",
  updatedAt: "Fallback data · refresh to retry",
  sourceUrl: NWS_POINTS_URL,
  isLive: false,
};

const districts: District[] = [
  { id: "upper-perk", name: "Upper Perkiomen", shortName: "UP", region: "Northwest", x: 25, y: 17, status: "unknown", officialUrl: "https://www.upsd.org/", sourceLabel: "Upper Perkiomen School District", lastChecked: "Not checked yet" },
  { id: "boyertown", name: "Boyertown Area", shortName: "BA", region: "West", x: 9, y: 29, status: "unknown", officialUrl: "https://www.boyertownasd.org/", sourceLabel: "Boyertown Area School District", lastChecked: "Not checked yet" },
  { id: "pottstown", name: "Pottstown", shortName: "PO", region: "West", x: 8, y: 56, status: "unknown", officialUrl: "https://www.pottstownschools.org/", sourceLabel: "Pottstown School District", lastChecked: "Not checked yet" },
  { id: "pottsgrove", name: "Pottsgrove", shortName: "PG", region: "West", x: 17, y: 48, status: "unknown", officialUrl: "https://www.pottsgrove.org/", sourceLabel: "Pottsgrove School District", lastChecked: "Not checked yet" },
  { id: "spring-ford", name: "Spring-Ford Area", shortName: "SF", region: "Southwest", x: 29, y: 67, status: "unknown", officialUrl: "https://www.spring-ford.net/", sourceLabel: "Spring-Ford Area School District", lastChecked: "Not checked yet" },
  { id: "souderton", name: "Souderton Area", shortName: "SA", region: "North", x: 39, y: 23, status: "unknown", officialUrl: "https://www.soudertonsd.org/students-families/school-closings-delays", sourceLabel: "Souderton closings & delays", lastChecked: "Not checked yet" },
  { id: "perkiomen-valley", name: "Perkiomen Valley", shortName: "PV", region: "Central West", x: 37, y: 34, status: "unknown", officialUrl: "https://www.pvsd.org/", sourceLabel: "Perkiomen Valley School District", lastChecked: "Not checked yet" },
  { id: "north-penn", name: "North Penn", shortName: "NP", region: "North Central", x: 52, y: 29, status: "unknown", officialUrl: "https://www.npenn.org/for_families/school_delays_and_closings", sourceLabel: "North Penn delays & closings", lastChecked: "Not checked yet" },
  { id: "methacton", name: "Methacton", shortName: "ME", region: "Central", x: 40, y: 49, status: "unknown", officialUrl: "https://www.methacton.org/", sourceLabel: "Methacton School District", lastChecked: "Not checked yet" },
  { id: "norristown", name: "Norristown Area", shortName: "NO", region: "Central", x: 47, y: 56, status: "unknown", officialUrl: "https://www.nasd.k12.pa.us/", sourceLabel: "Norristown Area School District", lastChecked: "Not checked yet" },
  { id: "upper-merion", name: "Upper Merion Area", shortName: "UM", region: "Southeast", x: 52, y: 69, status: "unknown", officialUrl: "https://www.umasd.org/", sourceLabel: "Upper Merion Area School District", lastChecked: "Not checked yet" },
  { id: "upper-dublin", name: "Upper Dublin", shortName: "UD", region: "East Central", x: 61, y: 41, status: "unknown", officialUrl: "https://www.udsd.org/", sourceLabel: "Upper Dublin School District", lastChecked: "Not checked yet" },
  { id: "wissahickon", name: "Wissahickon", shortName: "WI", region: "East Central", x: 67, y: 51, status: "unknown", officialUrl: "https://www.wsdweb.org/", sourceLabel: "Wissahickon School District", lastChecked: "Not checked yet" },
  { id: "colonial", name: "Colonial", shortName: "CO", region: "Southeast", x: 62, y: 74, status: "unknown", officialUrl: "https://www.colonialsd.org/", sourceLabel: "Colonial School District", lastChecked: "Not checked yet" },
  { id: "springfield", name: "Springfield Township", shortName: "ST", region: "East", x: 73, y: 67, status: "unknown", officialUrl: "https://www.sdst.org/", sourceLabel: "Springfield Township School District", lastChecked: "Not checked yet" },
  { id: "upper-moreland", name: "Upper Moreland", shortName: "MO", region: "East", x: 77, y: 49, status: "unknown", officialUrl: "https://www.umpsd.org/", sourceLabel: "Upper Moreland School District", lastChecked: "Not checked yet" },
  { id: "hatboro-horsham", name: "Hatboro-Horsham", shortName: "HH", region: "East", x: 81, y: 35, status: "unknown", officialUrl: "https://www.h-h.org/", sourceLabel: "Hatboro-Horsham School District", lastChecked: "Not checked yet" },
  { id: "lower-moreland", name: "Lower Moreland", shortName: "LM", region: "East", x: 86, y: 53, status: "unknown", officialUrl: "https://www.lmtsd.org/", sourceLabel: "Lower Moreland School District", lastChecked: "Not checked yet" },
  { id: "abington", name: "Abington", shortName: "AB", region: "East", x: 87, y: 67, status: "unknown", officialUrl: "https://www.abingtonsd.org/", sourceLabel: "Abington School District", lastChecked: "Not checked yet" },
  { id: "jenkintown", name: "Jenkintown", shortName: "JE", region: "East", x: 79, y: 72, status: "unknown", officialUrl: "https://www.jenkintowndrakes.org/", sourceLabel: "Jenkintown School District", lastChecked: "Not checked yet" },
  { id: "cheltenham", name: "Cheltenham", shortName: "CH", region: "East", x: 70, y: 78, status: "unknown", officialUrl: "https://www.cheltenham.org/", sourceLabel: "Cheltenham School District", lastChecked: "Not checked yet" },
  { id: "lower-merion", name: "Lower Merion", shortName: "LME", region: "Southeast", x: 56, y: 86, status: "unknown", officialUrl: "https://www.lmsd.org/", sourceLabel: "Lower Merion School District", lastChecked: "Not checked yet" },
  { id: "upper-perkiomen-2", name: "Upper Perkiomen SD (pt.)", shortName: "UP2", region: "Northwest", x: 21, y: 9, status: "unknown", officialUrl: "https://www.upsd.org/", sourceLabel: "Upper Perkiomen School District", lastChecked: "Not checked yet" },
];

function titleCaseForecast(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function formatUpdatedTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

function riskFromSnow(snow: number): Risk {
  if (snow >= 3) return "high";
  if (snow >= 1) return "watch";
  return "low";
}

function statusLabel(status: Status) {
  if (status === "delay") return "2-hour delay";
  if (status === "closed") return "Closed";
  if (status === "open") return "Open";
  return "Not announced";
}

function statusClass(status: Status) {
  return `status-badge status-${status}`;
}

function riskLabel(risk: Risk) {
  if (risk === "high") return "High risk";
  if (risk === "watch") return "Watch";
  return "Low risk";
}

function riskClass(risk: Risk) {
  return `risk-chip risk-${risk}`;
}

async function loadWeather(): Promise<WeatherSnapshot> {
  const pointsResponse = await fetch(NWS_POINTS_URL, { headers: { Accept: "application/geo+json" } });
  if (!pointsResponse.ok) throw new Error("NWS points request failed");
  const points = await pointsResponse.json();
  const forecastUrl = points.properties?.forecastHourly;
  if (!forecastUrl) throw new Error("NWS forecast URL missing");

  const forecastResponse = await fetch(forecastUrl, { headers: { Accept: "application/geo+json" } });
  if (!forecastResponse.ok) throw new Error("NWS hourly request failed");
  const forecast = await forecastResponse.json();
  const periods = forecast.properties?.periods ?? [];
  const first = periods[0];
  const nextTwelve = periods.slice(0, 12);
  if (!first) throw new Error("NWS forecast is empty");

  const snowMentions = nextTwelve.filter((period: { shortForecast?: string }) => /snow|flurr|wintry|sleet/i.test(period.shortForecast ?? ""));
  const highestPrecip = Math.max(0, ...nextTwelve.map((period: { probabilityOfPrecipitation?: { value?: number } }) => period.probabilityOfPrecipitation?.value ?? 0));
  const snow = snowMentions.length === 0 ? 0 : snowMentions.length >= 4 ? (highestPrecip >= 70 ? 2.2 : 1.2) : 0.4;
  const timing = snowMentions.length > 0 ? `${snowMentions[0].name} · next ${snowMentions.length * 2}h signal` : "No snow signal in the next 12 hours";

  return {
    temperature: first.temperature,
    condition: titleCaseForecast(first.shortForecast ?? "Forecast available"),
    wind: `${first.windSpeed ?? "—"} ${first.windDirection ?? ""}`.trim(),
    snow,
    timing,
    updatedAt: `Live NWS · checked ${formatUpdatedTime()}`,
    sourceUrl: NWS_POINTS_URL,
    isLive: true,
  };
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherSnapshot>(FALLBACK_WEATHER);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [selectedId, setSelectedId] = useState("souderton");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  const refreshWeather = async () => {
    setWeatherLoading(true);
    setWeatherError(false);
    try {
      setWeather(await loadWeather());
    } catch {
      setWeather(FALLBACK_WEATHER);
      setWeatherError(true);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    void refreshWeather();
  }, []);

  const risk = riskFromSnow(weather.snow);
  const selected = districts.find((district) => district.id === selectedId) ?? districts[0];
  const filteredDistricts = useMemo(() => districts.filter((district) => {
    const matchesSearch = district.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || district.status === statusFilter;
    const matchesRisk = riskFilter === "all" || riskFromSnow(weather.snow) === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  }), [riskFilter, search, statusFilter, weather.snow]);

  const openCount = districts.filter((district) => district.status === "open").length;
  const delayCount = districts.filter((district) => district.status === "delay").length;
  const closedCount = districts.filter((district) => district.status === "closed").length;
  const unknownCount = districts.length - openCount - delayCount - closedCount;
  const todayLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

  return (
    <main className="snowwatch-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="SnowWatch home">
          <span className="brand-mark"><Snowflake size={17} strokeWidth={2.3} /></span>
          <span><strong>SnowWatch</strong><small>Montgomery County, PA</small></span>
        </a>
        <div className="topbar-meta">
          <span className="live-dot" />
          <span>{weatherLoading ? "Updating forecast" : weather.isLive ? "Live weather feed" : "Forecast fallback"}</span>
          <button className="icon-button" aria-label="Refresh forecast" onClick={() => void refreshWeather()} disabled={weatherLoading}>
            <RefreshCw size={16} className={weatherLoading ? "spin" : ""} />
          </button>
        </div>
      </header>

      <section className="intro-row">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" /> {todayLabel} · winter operations desk</p>
          <h1>Will the morning commute<br /><em>change tomorrow?</em></h1>
          <p className="lede">One calm view of Montgomery County school weather, official notices, and the forecast signal behind them.</p>
        </div>
        <div className="trust-note">
          <ShieldCheck size={18} />
          <div><strong>Source-first by design</strong><span>Forecast risk is never presented as a closure decision.</span></div>
        </div>
      </section>

      <section className="signal-strip" aria-label="Current snow signal">
        <div className="signal-main">
          <div className="signal-icon"><CloudSnow size={27} /></div>
          <div><span className="micro-label">Regional signal · central Montgomery</span><strong>{weather.snow > 0 ? "Winter weather may affect travel" : "No active snow signal"}</strong><span className="signal-sub">{weather.timing}</span></div>
        </div>
        <div className="signal-metrics">
          <div><span className="micro-label">Estimated snow</span><strong>{weather.snow.toFixed(1)}<small> in</small></strong></div>
          <div><span className="micro-label">Temperature</span><strong>{weather.temperature}<small>°F</small></strong></div>
          <div><span className="micro-label">Forecast risk</span><strong className={riskClass(risk)}>{riskLabel(risk)}</strong></div>
        </div>
        <div className="signal-source"><span className="source-pip" />{weather.updatedAt}<a href={weather.sourceUrl} target="_blank" rel="noreferrer">NWS source <ArrowUpRight size={13} /></a></div>
      </section>

      {weatherError && <div className="fallback-banner"><CircleAlert size={16} /> Live weather is temporarily unavailable. Showing a safe fallback; official district pages remain the authority.</div>}

      <section className="workspace">
        <div className="map-column">
          <div className="section-heading"><div><p className="eyebrow">County operating picture</p><h2>District map</h2></div><span className="count-pill">{filteredDistricts.length} of {districts.length} districts</span></div>
          <div className="map-card">
            <div className="map-toolbar"><div className="map-toolbar-title"><MapPin size={16} /><span>Montgomery County school districts</span></div><div className="map-actions"><button className={`text-button ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(!showFilters)}><Filter size={15} /> Filter</button><span className="map-date">last checked {formatUpdatedTime()}</span></div></div>
            <div className="map-stage">
              <img src={MAP_ASSET} alt="Montgomery County school district map" />
              <div className="map-wash" />
              {filteredDistricts.map((district) => <button key={district.id} className={`map-marker ${district.id === selectedId ? "selected" : ""} ${riskClass(risk)}`} style={{ left: `${district.x}%`, top: `${district.y}%` }} onClick={() => setSelectedId(district.id)} aria-label={`Select ${district.name}`}><span>{district.shortName}</span>{district.id === selectedId && <b>{district.name}</b>}</button>)}
              <div className="map-caption"><span className="map-legend-dot" /> Click a district to inspect its source and forecast context</div>
            </div>
            <div className="map-legend"><div className="legend-group"><span className="legend-title">Official status</span><span><i className="legend-square status-unknown" />Not announced</span><span><i className="legend-square status-open" />Open</span><span><i className="legend-square status-delay" />2-hour delay</span><span><i className="legend-square status-closed" />Closed</span></div><div className="legend-group"><span className="legend-title">Forecast risk</span><span><i className="legend-dot risk-low" />Low</span><span><i className="legend-dot risk-watch" />Watch</span><span><i className="legend-dot risk-high" />High</span></div></div>
          </div>
        </div>

        <aside className="intel-column">
          <div className="section-heading"><div><p className="eyebrow">Selected district</p><h2>Live intelligence</h2></div><span className="tiny-status"><span className="live-dot" /> live</span></div>
          <div className="detail-card">
            <div className="detail-top"><div className="district-seal">{selected.shortName}</div><div><span className="micro-label">{selected.region} region</span><h3>{selected.name}</h3></div><a className="round-link" href={selected.officialUrl} target="_blank" rel="noreferrer" aria-label={`Open ${selected.name} official source`}><ExternalLink size={15} /></a></div>
            <div className="status-callout"><div><span className="micro-label">Official operating status</span><strong className={statusClass(selected.status)}><span className="status-dot" />{statusLabel(selected.status)}</strong></div><span className="unconfirmed"><BellRing size={13} /> source not confirmed</span></div>
            <div className="detail-grid"><div><span className="micro-label">Local forecast</span><strong>{weather.condition}</strong></div><div><span className="micro-label">Snow estimate</span><strong>{weather.snow.toFixed(1)} in</strong></div><div><span className="micro-label">Wind</span><strong>{weather.wind}</strong></div><div><span className="micro-label">Source check</span><strong>{selected.lastChecked}</strong></div></div>
            <a className="source-link" href={selected.officialUrl} target="_blank" rel="noreferrer"><span><ShieldCheck size={15} /><b>View official notice page</b><small>{selected.sourceLabel}</small></span><ChevronRight size={17} /></a>
            <p className="detail-disclaimer">This district is currently <strong>not announced</strong> in the SnowWatch source registry. Check the official page before making plans.</p>
          </div>
          <div className="quick-stats"><div><span className="stat-number">{unknownCount}</span><span>not announced</span></div><div><span className="stat-number">{delayCount}</span><span>delays</span></div><div><span className="stat-number">{closedCount}</span><span>closed</span></div><div><span className="stat-number">{openCount}</span><span>open</span></div></div>
          <div className="weather-note"><Thermometer size={18} /><div><strong>What changes the risk?</strong><span>Snow accumulation, timing before the first bell, and road conditions are the main signals to watch.</span></div></div>
        </aside>
      </section>

      <section className="district-ledger">
        <div className="ledger-heading"><div><p className="eyebrow">Source registry</p><h2>District status ledger</h2></div><div className="ledger-tools"><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search districts" aria-label="Search districts" />{search && <button onClick={() => setSearch("")} aria-label="Clear district search"><X size={14} /></button>}</label><button className={`filter-toggle ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(!showFilters)}><Filter size={15} /> Filters</button></div></div>
        {showFilters && <div className="filter-panel"><div><span className="micro-label">Official status</span><div className="filter-pills">{(["all", "unknown", "open", "delay", "closed"] as FilterValue[]).map((value) => <button key={value} className={statusFilter === value ? "chosen" : ""} onClick={() => setStatusFilter(value)}>{value === "all" ? "All" : statusLabel(value)}</button>)}</div></div><div><span className="micro-label">Forecast risk</span><div className="filter-pills">{(["all", "low", "watch", "high"] as RiskFilter[]).map((value) => <button key={value} className={riskFilter === value ? "chosen" : ""} onClick={() => setRiskFilter(value)}>{value === "all" ? "All" : riskLabel(value)}</button>)}</div></div></div>}
        <div className="ledger-list">{filteredDistricts.map((district) => <button key={district.id} className={`ledger-row ${district.id === selectedId ? "selected" : ""}`} onClick={() => setSelectedId(district.id)}><span className="ledger-accent" /><span className="ledger-district"><b>{district.name}</b><small>{district.region} · official source linked</small></span><span className={statusClass(district.status)}><span className="status-dot" />{statusLabel(district.status)}</span><span className={riskClass(risk)}>{riskLabel(risk)}</span><span className="ledger-weather"><CloudSnow size={15} />{weather.snow.toFixed(1)} in</span><ChevronRight size={16} className="row-chevron" /></button>)}{filteredDistricts.length === 0 && <div className="empty-state">No districts match those filters. <button onClick={() => { setSearch(""); setStatusFilter("all"); setRiskFilter("all"); }}>Reset view</button></div>}</div>
      </section>

      <section className="sources-section"><div><p className="eyebrow">Keep checking the source</p><h2>Where the signal comes from</h2><p className="sources-copy">SnowWatch brings the forecast into one view, but district decisions still come from district communications. The source cards below make that boundary visible.</p></div><div className="source-cards"><a className="source-card" href={NWS_POINTS_URL} target="_blank" rel="noreferrer"><span className="source-icon blue"><Wind size={17} /></span><span><b>National Weather Service</b><small>Live regional forecast · weather risk only</small></span><ArrowUpRight size={15} /></a><a className="source-card" href="https://www.soudertonsd.org/students-families/school-closings-delays" target="_blank" rel="noreferrer"><span className="source-icon amber"><ShieldCheck size={17} /></span><span><b>Souderton example source</b><small>Official closings & delays page</small></span><ArrowUpRight size={15} /></a></div></section>

      <footer className="footer"><span>SnowWatch / Montgomery County, PA</span><span>Forecast risk is informational. Official district pages are the authority.</span><span>Built for winter mornings.</span></footer>
    </main>
  );
}
