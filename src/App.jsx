import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './App.css';

const agent = { name: 'Kaia', emoji: '🌊', role: 'Trend Hunter', color: '#06b6d4' };

const trendData = [
  { platform: 'Twitter', followers: 12400, growth: 12 },
  { platform: 'Reddit', members: 8200, growth: 8 },
  { platform: 'TikTok', views: 45000, growth: 25 },
  { platform: 'YouTube', subscribers: 3200, growth: 15 },
];

const weeklyData = [
  { day: 'Mon', mentions: 45 },
  { day: 'Tue', mentions: 62 },
  { day: 'Wed', mentions: 78 },
  { day: 'Thu', mentions: 55 },
  { day: 'Fri', mentions: 89 },
  { day: 'Sat', mentions: 120 },
  { day: 'Sun', mentions: 95 },
];

function App() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    // Simulated real-time trending data
    const interval = setInterval(() => {
      setTrending([
        { topic: '#FitnessApp', sentiment: 92, volume: 12500 },
        { topic: '#AIWorkout', sentiment: 88, volume: 8200 },
        { topic: '#HomeGym', sentiment: 85, volume: 6100 },
        { topic: '#NutritionTips', sentiment: 79, volume: 4800 },
      ]);
    }, 5000);
    setTrending([
      { topic: '#FitnessApp', sentiment: 92, volume: 12500 },
      { topic: '#AIWorkout', sentiment: 88, volume: 8200 },
      { topic: '#HomeGym', sentiment: 85, volume: 6100 },
      { topic: '#NutritionTips', sentiment: 79, volume: 4800 },
    ]);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <header style={{ '--color': agent.color }}>
        <span className="emoji">{agent.emoji}</span>
        <div>
          <h1>{agent.name}</h1>
          <p>{agent.role}</p>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat">
          <span>Total Reach</span>
          <strong>68.8K</strong>
          <span className="trend">↑ 18%</span>
        </div>
        <div className="stat">
          <span>Engagement Rate</span>
          <strong>4.2%</strong>
          <span className="trend">↑ 0.8%</span>
        </div>
        <div className="stat">
          <span>Active Campaigns</span>
          <strong>3</strong>
        </div>
        <div className="stat">
          <span>Trending Now</span>
          <strong>12</strong>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Weekly Mentions</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
              <Bar dataKey="mentions" fill={agent.color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Platform Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="platform" type="category" stroke="#666" width={60} />
              <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
              <Bar dataKey="followers" fill={agent.color} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section">
        <h2>🔥 Trending Now</h2>
        <div className="trending-list">
          {trending.map((t, i) => (
            <div key={i} className="trending-item">
              <span className="topic">{t.topic}</span>
              <span className="sentiment" style={{ color: t.sentiment > 85 ? '#22c55e' : '#f59e0b' }}>
                {t.sentiment}% sentiment
              </span>
              <span className="volume">{t.volume.toLocaleString()} vol</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
