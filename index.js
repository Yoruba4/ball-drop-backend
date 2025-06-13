const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const scoresFile = 'scores.json';
const secret = process.env.BACKEND_SECRET;

function loadScores() {
  if (!fs.existsSync(scoresFile)) return [];
  return JSON.parse(fs.readFileSync(scoresFile));
}

function saveScores(scores) {
  fs.writeFileSync(scoresFile, JSON.stringify(scores, null, 2));
}

// 🏆 Submit Score (only saves if it's higher)
app.post('/submit-score', (req, res) => {
  const { userId, username, score, token } = req.body;
  if (token !== secret) return res.status(403).send('Unauthorized');

  const scores = loadScores();
  const existing = scores.find(entry => entry.userId === userId);

  if (existing) {
    if (score > existing.score) {
      existing.score = score;
      existing.time = Date.now();
    }
  } else {
    scores.push({ userId, username, score, time: Date.now() });
  }

  saveScores(scores);
  res.sendStatus(200);
});

// 🔝 Leaderboard
app.get('/leaderboard', (req, res) => {
  const scores = loadScores();
  const top = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  res.json(top);
});

// 📊 My Rank Endpoint
app.get('/my-rank', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).send('userId required');

  const scores = loadScores();
  const sorted = scores.sort((a, b) => b.score - a.score);
  const index = sorted.findIndex(entry => entry.userId === userId);

  if (index === -1) {
    return res.json({ score: 0, rank: null });
  }

  res.json({ score: sorted[index].score, rank: index + 1 });
});

// 💳 Purchase (Stars placeholder)
app.post('/purchase', (req, res) => {
  const { userId, amount, item } = req.body;
  if (amount < 10) return res.status(400).send('Not enough Stars');
  console.log(`User ${userId} purchased ${item} with ${amount} Stars.`);
  res.send({ success: true });
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
