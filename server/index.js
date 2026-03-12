// Kaia Dashboard API
// Serves data from kaia-trends.db for the React dashboard

import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const PORT = process.env.PORT || 3001;
const DB_PATH = '/home/scribble0563/.openclaw/workspace-kaia/kaia-trends.db';

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(DB_PATH);

// Helper for promises
const dbGet = (sql) => new Promise((resolve, reject) => {
  db.get(sql, (err, row) => err ? reject(err) : resolve(row));
});
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

// ============ STATS ============

app.get('/api/stats', async (req, res) => {
  try {
    const row = await dbGet(`
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
    `);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ TRENDS ============

app.get('/api/trends/top', async (req, res) => {
  const limit = parseInt(req.query.limit) || 15;
  try {
    const rows = await dbAll(`
      SELECT trend_name, category, signal_strength, platform, predicted_angle, source_url, content_written, hit_miss, date_discovered
      FROM trends 
      WHERE signal_strength IN ('hot', 'Hot', 'warm')
      ORDER BY 
        CASE signal_strength WHEN 'hot' THEN 1 WHEN 'Hot' THEN 1 WHEN 'warm' THEN 2 END,
        date_discovered DESC
      LIMIT ?
    `, [limit]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/trends/pending', async (req, res) => {
  const limit = parseInt(req.query.limit) || 15;
  try {
    const rows = await dbAll(`
      SELECT trend_name, category, signal_strength, platform, predicted_angle, date_discovered
      FROM trends 
      WHERE content_written = 0 AND signal_strength IN ('hot', 'Hot', 'warm')
      ORDER BY 
        CASE signal_strength WHEN 'hot' THEN 1 WHEN 'Hot' THEN 1 WHEN 'warm' THEN 2 END,
        date_discovered DESC
      LIMIT ?
    `, [limit]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/trends/recent-hits', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const rows = await dbAll(`
      SELECT trend_name, category, signal_strength, hit_miss, outcome_notes, date_outcome
      FROM trends 
      WHERE hit_miss = 'hit'
      ORDER BY date_outcome DESC
      LIMIT ?
    `, [limit]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/trends/by-category', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT category, count(*) as count, 
        SUM(CASE WHEN signal_strength IN ('hot', 'Hot') THEN 1 ELSE 0 END) as hot_count,
        SUM(CASE WHEN signal_strength = 'warm' THEN 1 ELSE 0 END) as warm_count,
        SUM(CASE WHEN content_written = 1 THEN 1 ELSE 0 END) as written
      FROM trends 
      GROUP BY category 
      ORDER BY count DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/trends/by-platform', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT platform, count(*) as count
      FROM trends 
      GROUP BY platform 
      ORDER BY count DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ COMPETITORS ============

app.get('/api/competitors/recent', async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  try {
    const rows = await dbAll(`
      SELECT competitor_name, signal_type, title, insight, created_at, url
      FROM competitors 
      ORDER BY created_at DESC
      LIMIT ?
    `, [limit]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/competitors/by-type', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT signal_type, count(*) as count
      FROM competitors 
      GROUP BY signal_type
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ MODELS (Tech Stack) ============

app.get('/api/models', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT * FROM models ORDER BY date_discovered DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ HEALTH ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🌊 Kaia Dashboard API running on port ${PORT}`);
});
