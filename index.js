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

app.get('/leaderboard', (req, res) => {
  const scores = loadScores();
  const top = scores.sort((a, b) => b.score - a.score).slice(0, 10);
  res.json(top);
});

app.post('/submit-score', (req, res) => {
  const { userId, username, score, token } = req.body;
  if (token !== secret) return res.status(403).send('Unauthorized');

  const scores = loadScores();
  scores.push({ userId, username, score, time: Date.now() });
  saveScores(scores);
  res.sendStatus(200);
});

app.post('/purchase', (req, res) => {
  const { userId, amount, item } = req.body;
  if (amount < 10) return res.status(400).send('Not enough Stars');
  // Here you would verify Stars via Telegram API
  console.log(`User ${userId} purchased ${item} with ${amount} Stars.`);
  res.send({ success: true });
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
