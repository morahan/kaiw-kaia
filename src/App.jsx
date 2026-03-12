import { useState } from 'react';
import './App.css';

const agent = { name: 'kaia', emoji: '🌊', role: 'Trend', color: '' };

function App() {
  const [recent] = useState([
    { id: 1, text: 'Sample activity 1', status: 'done' },
    { id: 2, text: 'Sample activity 2', status: 'pending' },
  ]);

  return (
    <div className="dashboard">
      <header style={{ '--color': agent.color }}>
        <span className="emoji">{agent.emoji}</span>
        <div><h1>{agent.name}</h1><p>{agent.role}</p></div>
      </header>
      <div className="section">
        <h2>Recent Activity</h2>
        {recent.map(item => (
          <div key={item.id} className={`item ${item.status}`}>
            <span>{item.text}</span>
            <span className="badge">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default App;

