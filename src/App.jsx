import { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [stats, setStats] = useState(null);
  const [topTrends, setTopTrends] = useState([]);
  const [pendingTrends, setPendingTrends] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, trendsRes, pendingRes, compsRes] = await Promise.all([
        fetch(`${API_BASE}/stats`),
        fetch(`${API_BASE}/trends/top?limit=10`),
        fetch(`${API_BASE}/trends/pending?limit=10`),
        fetch(`${API_BASE}/competitors/recent?limit=5`)
      ]);

      setStats(await statsRes.json());
      setTopTrends(await trendsRes.json());
      setPendingTrends(await pendingRes.json());
      setCompetitors(await compsRes.json());
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading">🌊 Loading Kaia's dashboard...</div>;
  }

  const hitRate = stats?.hits + stats?.misses > 0 
    ? Math.round((stats.hits / (stats.hits + stats.misses)) * 100) 
    : 0;

  return (
    <div className="dashboard">
      <header className="header">
        <h1>🌊 Kaia Dashboard</h1>
        <p className="subtitle">Trend Hunter Status • Last updated: {lastUpdated}</p>
      </header>

      <section className="stats-grid">
        <div className="stat-card hot">
          <div className="stat-value">{stats?.hot_trends || 0}</div>
          <div className="stat-label">🔥 Hot Trends</div>
        </div>
        <div className="stat-card warm">
          <div className="stat-value">{stats?.warm_trends || 0}</div>
          <div className="stat-label">🌡️ Warm Trends</div>
        </div>
        <div className="stat-card content">
          <div className="stat-value">{stats?.content_written || 0}</div>
          <div className="stat-label">✍️ Articles Written</div>
        </div>
        <div className="stat-card hit-rate">
          <div className="stat-value">{hitRate}%</div>
          <div className="stat-label">🎯 Hit Rate</div>
        </div>
      </section>

      <div className="main-grid">
        <section className="card">
          <h2>🔥 Top Active Trends</h2>
          <ul className="trend-list">
            {topTrends.map((trend, i) => (
              <li key={i} className={`trend-item ${trend.signal_strength?.toLowerCase()}`}>
                <span className="trend-name">{trend.trend_name}</span>
                <span className="trend-category">{trend.category}</span>
                {trend.content_written ? (
                  <span className="badge done">✓ Done</span>
                ) : (
                  <span className="badge wip">WIP</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>⚡ Pending Work (WIP)</h2>
          <ul className="trend-list">
            {pendingTrends.length === 0 ? (
              <li className="empty-state">All caught up! 🎉</li>
            ) : (
              pendingTrends.map((trend, i) => (
                <li key={i} className={`trend-item ${trend.signal_strength?.toLowerCase()}`}>
                  <span className="trend-name">{trend.trend_name}</span>
                  <span className="trend-category">{trend.category}</span>
                  <span className="badge pending">{trend.signal_strength}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="card">
          <h2>🏢 Competitor Intel</h2>
          <ul className="comp-list">
            {competitors.map((comp, i) => (
              <li key={i} className="comp-item">
                <span className={`signal-type ${comp.signal_type}`}>{comp.signal_type}</span>
                <span className="comp-name">{comp.competitor_name}</span>
                <p className="comp-title">{comp.title}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card metrics">
          <h2>📊 Pipeline Metrics</h2>
          <div className="metric-row">
            <span>Total Trends Tracked:</span>
            <strong>{stats?.total_trends || 0}</strong>
          </div>
          <div className="metric-row">
            <span>Confirmed Hits:</span>
            <strong className="hit">{stats?.hits || 0}</strong>
          </div>
          <div className="metric-row">
            <span>Pending Validation:</span>
            <strong className="pending">{stats?.pending || 0}</strong>
          </div>
          <div className="metric-row">
            <span>Competitor Signals:</span>
            <strong>{stats?.competitors || 0}</strong>
          </div>
          <div className="metric-row">
            <span>Raw Signals:</span>
            <strong>{stats?.raw_signals || 0}</strong>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${(stats?.content_written / stats?.total_trends) * 100}%`}}
            />
          </div>
          <p className="progress-label">{Math.round((stats?.content_written / stats?.total_trends) * 100)}% content coverage</p>
        </section>
      </div>
    </div>
  );
}

export default App;
