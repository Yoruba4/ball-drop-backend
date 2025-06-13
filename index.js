const express = require('express'); const bodyParser = require('body-parser'); const cors = require('cors'); const app = express(); const port = process.env.PORT || 3000;

app.use(cors()); app.use(bodyParser.json());

const SECRET = 'Dangutaga3540#';

const users = {};

function ensureUser(userId, username) { if (!users[userId]) { users[userId] = { username, totalScore: 0, invites: new Set(), }; } }

app.post('/submit-score', (req, res) => { const { userId, username, score, token, referrerId } = req.body; if (token !== SECRET) return res.status(403).json({ error: 'Invalid token' }); if (!userId || !username || typeof score !== 'number') { return res.status(400).json({ error: 'Missing fields' }); } ensureUser(userId, username); users[userId].username = username; users[userId].totalScore += score;

// handle referral tracking if (referrerId && referrerId !== userId) { ensureUser(referrerId, 'unknown'); users[referrerId].invites.add(userId); users[referrerId].totalScore += 2; // referral bonus }

return res.json({ success: true }); });

app.get('/leaderboard', (req, res) => { const leaderboard = Object.entries(users) .map(([userId, data]) => ({ userId, username: data.username, score: data.totalScore, })) .sort((a, b) => b.score - a.score) .slice(0, 10); res.json(leaderboard); });

app.get('/my-rank', (req, res) => { const { userId } = req.query; if (!userId || !users[userId]) { return res.status(404).json({ error: 'User not found' }); } const sorted = Object.entries(users) .map(([id, data]) => ({ userId: id, score: data.totalScore, })) .sort((a, b) => b.score - a.score); const rank = sorted.findIndex(u => u.userId === userId) + 1; res.json({ score: users[userId].totalScore, rank, invites: users[userId].invites.size, }); });

app.get('/admin/all-users', (req, res) => { const { token } = req.query; if (token !== SECRET) return res.status(403).json({ error: 'Forbidden' }); const data = Object.entries(users).map(([id, u]) => ({ userId: id, username: u.username, totalScore: u.totalScore, invites: Array.from(u.invites), })); res.json(data); });

app.listen(port, () => console.log(Server running on port ${port}));




