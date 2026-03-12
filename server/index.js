// Kaia Dashboard API
// Serves data from kaia-trends.db for the React dashboard

import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dbPath = process.env.DB_PATH || '/home/scribble0563/.openclaw/workspace-kaia/kaia-trends.db';
const db = new sqlite3.Database(dbPath);

// Get overview stats
app.get('/api/stats', (req, res) => {
  db.get(`
    SELECT 
      (SELECT count(*) FROM trends) as total_trends,
      (SELECT count(*) FROM trends WHERE signal_strength IN ('hot', 'Hot')) as hot_trends,
      (SELECT count(*) FROM trends WHERE signal_strength = 'warm') as warm_trends,
      (SELECT count(*) FROM trends WHERE content_written = 1) as content_written,
      (SELECT count(*) FROM trends WHERE hit_miss = 'hit') as hits,
      (SELECT count(*) FROM trends WHERE hit_miss = 'miss') as misses,
      (SELECT count(*) FROM trends WHERE hit_miss = 'pending' OR hit_miss IS NULL OR hit_miss = '') as pending,
      (SELECT count(*) FROM competitors) as competitors,
      (SELECT count(*) FROM raw_signals) as raw_signals
  `, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Get top trends by signal strength
app.get('/api/trends/top', (req, res) => {
  const limit = req.query.limit || 10;
  db.all(`
    SELECT trend_name, category, signal_strength, platform, predicted_angle, source_url, content_written, hit_miss
    FROM trends 
    WHERE signal_strength IN ('hot', 'Hot', 'warm')
    ORDER BY 
      CASE signal_strength WHEN 'hot' THEN 1 WHEN 'Hot' THEN 1 WHEN 'warm' THEN 2 END,
      date_discovered DESC
    LIMIT ?
  `, [limit], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get pending trends (not yet content-written)
app.get('/api/trends/pending', (req, res) => {
  const limit = req.query.limit || 10;
  db.all(`
    SELECT trend_name, category, signal_strength, platform, predicted_angle
    FROM trends 
    WHERE content_written = 0 AND signal_strength IN ('hot', 'Hot', 'warm')
    ORDER BY 
      CASE signal_strength WHEN 'hot' THEN 1 WHEN 'Hot' THEN 1 WHEN 'warm' THEN 2 END,
      date_discovered DESC
    LIMIT ?
  `, [limit], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get recent competitor intel
app.get('/api/competitors/recent', (req, res) => {
  const limit = req.query.limit || 5;
  db.all(`
    SELECT competitor_name, signal_type, title, insight, created_at
    FROM competitors 
    ORDER BY created_at DESC
    LIMIT ?
  `, [limit], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get WIP items (active work in progress)
app.get('/api/wip', (req, res) => {
  db.all(`
    SELECT trend_name, category, signal_strength, predicted_angle
    FROM trends 
    WHERE content_written = 0 
    ORDER BY 
      CASE signal_strength WHEN 'hot' THEN 1 WHEN 'Hot' THEN 1 WHEN 'warm' THEN 2 END
    LIMIT 20
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Kaia Dashboard API running on port ${PORT}`);
});
