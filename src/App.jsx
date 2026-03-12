import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/react';
import './App.css';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [stats, setStats] = useState(null);
  const [topTrends, setTopTrends] = useState([]);
  const [pendingTrends, setPendingTrends] = useState([]);
  const [recentHits, setRecentHits] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    try {
      const [statsRes, trendsRes, pendingRes, hitsRes, compsRes, catsRes, platsRes] = await Promise.all([
        fetch(`${API_BASE}/stats`),
        fetch(`${API_BASE}/trends/top?limit=15`),
        fetch(`${API_BASE}/trends/pending?limit=15`),
        fetch(`${API_BASE}/trends/recent-hits?limit=8`),
        fetch(`${API_BASE}/competitors/recent?limit=8`),
        fetch(`${API_BASE}/trends/by-category`),
        fetch(`${API_BASE}/trends/by-platform`)
      ]);

      setStats(await statsRes.json());
      setTopTrends(await trendsRes.json());
      setPendingTrends(await pendingRes.json());
      setRecentHits(await hitsRes.json());
      setCompetitors(await compsRes.json());
      setCategories(await catsRes.json());
      setPlatforms(await platsRes.json());
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="wave-container">
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
        <p>🌊 Riding the data wave...</p>
      </div>
    );
  }

  const hitRate = stats?.hits + stats?.misses > 0 
    ? Math.round((stats.hits / (stats.hits + stats.misses)) * 100) 
    : 0;

  const contentCoverage = stats?.total_trends > 0 
    ? Math.round((stats.content_written / stats.total_trends) * 100) 
    : 0;

  const maxCat = Math.max(...categories.map(c => c.count), 1);
  const maxPlat = Math.max(...platforms.map(p => p.count), 1);

  return (
    <SignedIn>
    <div className="dashboard">
      <div className="ocean-bg">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
        <div className="bubble bubble-4"></div>
        <div className="bubble bubble-5"></div>
      </div>

      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="wave-emoji">🌊</span>
            <div className="logo-text">
              <h1>Kaia</h1>
              <span className="tagline">Trend Hunter</span>
            </div>
          </div>
          <div className="header-stats">
            <UserButton afterSignOutUrl="/" />
            <div className="live-indicator">
              <span className="pulse"></span>
              LIVE
            </div>
            <span className="last-updated">Updated: {lastUpdated}</span>
          </div>
        </div>
        <nav className="nav-tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            📊 Overview
          </button>
          <button className={`tab ${activeTab === 'trends' ? 'active' : ''}`} onClick={() => setActiveTab('trends')}>
            🔥 Trends
          </button>
          <button className={`tab ${activeTab === 'wip' ? 'active' : ''}`} onClick={() => setActiveTab('wip')}>
            ⚡ WIP
          </button>
          <button className={`tab ${activeTab === 'hits' ? 'active' : ''}`} onClick={() => setActiveTab('hits')}>
            🎯 Hits
          </button>
          <button className={`tab ${activeTab === 'intel' ? 'active' : ''}`} onClick={() => setActiveTab('intel')}>
            🏢 Intel
          </button>
          <button className={`tab ${activeTab === 'breakdown' ? 'active' : ''}`} onClick={() => setActiveTab('breakdown')}>
            📈 Breakdown
          </button>
        </nav>
      </header>

      {activeTab === 'overview' && (
        <main className="main-content">
          <section className="stats-grid">
            <div className="stat-card hot-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{stats?.hot_trends || 0}</div>
              <div className="stat-label">Hot Trends</div>
              <div className="stat-bar"><div className="stat-bar-fill hot" style={{width: `${(stats?.hot_trends/800)*100}%`}}></div></div>
            </div>
            <div className="stat-card warm-card">
              <div className="stat-icon">🌡️</div>
              <div className="stat-value">{stats?.warm_trends || 0}</div>
              <div className="stat-label">Warm Trends</div>
              <div className="stat-bar"><div className="stat-bar-fill warm" style={{width: `${(stats?.warm_trends/800)*100}%`}}></div></div>
            </div>
            <div className="stat-card content-card">
              <div className="stat-icon">✍️</div>
              <div className="stat-value">{stats?.content_written || 0}</div>
              <div className="stat-label">Articles Written</div>
              <div className="stat-bar"><div className="stat-bar-fill content" style={{width: `${contentCoverage}%`}}></div></div>
            </div>
            <div className="stat-card hit-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{hitRate}%</div>
              <div className="stat-label">Hit Rate</div>
              <div className="stat-bar"><div className="stat-bar-fill hit" style={{width: `${hitRate}%`}}></div></div>
            </div>
          </section>

          <section className="pipeline-section">
            <h2>📈 Pipeline Pulse</h2>
            <div className="pipeline-grid">
              <div className="pipeline-card"><div className="pipeline-number">{stats?.total_trends || 0}</div><div className="pipeline-label">Total Tracked</div></div>
              <div className="pipeline-card success"><div className="pipeline-number">{stats?.hits || 0}</div><div className="pipeline-label">Confirmed Hits</div></div>
              <div className="pipeline-card pending"><div className="pipeline-number">{stats?.pending || 0}</div><div className="pipeline-label">Pending</div></div>
              <div className="pipeline-card"><div className="pipeline-number">{stats?.competitors || 0}</div><div className="pipeline-label">Competitor Signals</div></div>
              <div className="pipeline-card"><div className="pipeline-number">{stats?.raw_signals || 0}</div><div className="pipeline-label">Raw Signals</div></div>
            </div>
          </section>

          <section className="quick-section">
            <div className="trend-preview">
              <h3>🔥 Hot Right Now</h3>
              <div className="trend-tags">
                {topTrends.slice(0, 8).map((trend, i) => (
                  <span key={i} className={`trend-tag ${trend.signal_strength?.toLowerCase()}`}>{trend.trend_name}</span>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {activeTab === 'trends' && (
        <main className="main-content">
          <section className="trends-section">
            <h2>🔥 All Hot Trends</h2>
            <div className="trends-grid">
              {topTrends.map((trend, i) => (
                <div key={i} className={`trend-card ${trend.signal_strength?.toLowerCase()}`}>
                  <div className="trend-header">
                    <span className="trend-name">{trend.trend_name}</span>
                    <span className={`signal-badge ${trend.signal_strength?.toLowerCase()}`}>{trend.signal_strength}</span>
                  </div>
                  <div className="trend-meta">
                    <span className="category">{trend.category}</span>
                    <span className="platform">{trend.platform}</span>
                  </div>
                  {trend.predicted_angle && <p className="trend-angle">{trend.predicted_angle}</p>}
                  <div className="trend-footer">
                    {trend.content_written ? <span className="status done">✓ Published</span> : <span className="status pending">○ Unpublished</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {activeTab === 'wip' && (
        <main className="main-content">
          <section className="wip-section">
            <h2>⚡ Work In Progress</h2>
            {pendingTrends.length === 0 ? (
              <div className="empty-state"><span className="empty-emoji">🎉</span><p>All caught up! Nothing pending.</p></div>
            ) : (
              <div className="wip-list">
                {pendingTrends.map((trend, i) => (
                  <div key={i} className="wip-card">
                    <div className="wip-priority"><span className={`priority-dot ${trend.signal_strength?.toLowerCase()}`}></span></div>
                    <div className="wip-content">
                      <span className="wip-name">{trend.trend_name}</span>
                      <span className="wip-category">{trend.category}</span>
                    </div>
                    <div className="wip-action"><span className={`action-badge ${trend.signal_strength?.toLowerCase()}`}>{trend.signal_strength}</span></div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {activeTab === 'hits' && (
        <main className="main-content">
          <section className="hits-section">
            <h2>🎯 Confirmed Hits</h2>
            {recentHits.length === 0 ? (
              <div className="empty-state"><span className="empty-emoji">🎯</span><p>No hits recorded yet.</p></div>
            ) : (
              <div className="hits-grid">
                {recentHits.map((hit, i) => (
                  <div key={i} className="hit-card">
                    <div className="hit-badge">🎯 HIT</div>
                    <span className="hit-name">{hit.trend_name}</span>
                    <span className="hit-category">{hit.category}</span>
                    {hit.outcome_notes && <p className="hit-notes">{hit.outcome_notes}</p>}
                    {hit.date_outcome && <span className="hit-date">{hit.date_outcome}</span>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {activeTab === 'intel' && (
        <main className="main-content">
          <section className="intel-section">
            <h2>🏢 Competitor Intel</h2>
            <div className="intel-grid">
              {competitors.map((comp, i) => (
                <div key={i} className="intel-card">
                  <div className="intel-header">
                    <span className="signal-type">{comp.signal_type === 'hot' ? '🔥' : comp.signal_type === 'gap' ? '🎯' : '📌'}</span>
                    <span className="competitor-name">{comp.competitor_name}</span>
                  </div>
                  <p className="intel-title">{comp.title}</p>
                  {comp.insight && <p className="intel-insight">{comp.insight}</p>}
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {activeTab === 'breakdown' && (
        <main className="main-content">
          <section className="breakdown-section">
            <h2>📈 Trends by Category</h2>
            <div className="breakdown-grid">
              {categories.map((cat, i) => (
                <div key={i} className="breakdown-card">
                  <div className="breakdown-header">
                    <span className="breakdown-name">{cat.category}</span>
                    <span className="breakdown-count">{cat.count}</span>
                  </div>
                  <div className="breakdown-bar">
                    <div className="breakdown-fill" style={{width: `${(cat.count/maxCat)*100}%`}}></div>
                  </div>
                  <div className="breakdown-meta">
                    <span className="hot-count">🔥 {cat.hot_count}</span>
                    <span className="warm-count">🌡️ {cat.warm_count}</span>
                    <span className="written-count">✍️ {cat.written}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="breakdown-section">
            <h2>📡 Trends by Platform</h2>
            <div className="platform-grid">
              {platforms.map((plat, i) => (
                <div key={i} className="platform-card">
                  <span className="platform-name">{plat.platform}</span>
                  <div className="platform-bar">
                    <div className="platform-fill" style={{width: `${(plat.count/maxPlat)*100}%`}}></div>
                  </div>
                  <span className="platform-count">{plat.count}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      <footer className="footer">
        <p>🌊 Kaia Dashboard v2.1 — Riding the trend wave</p>
      </footer>
    </div>
    </SignedIn>
  );
}

export default App;
