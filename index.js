// server.js (corrected backend code with leaderboard, referral tracking, and admin route) const express = require('express'); const cors = require('cors'); const bodyParser = require('body-parser'); const app = express(); const port = process.env.PORT || 3000;

app.use(cors()); app.use(bodyParser.json());

// In-memory database let users = {};

const ADMIN_SECRET = 'Dangutaga3540#';

// Submit Score app.post('/submit-score', (req, res) => { const { userId, username, score, token, referrerId } = req.body; if (token !== ADMIN_SECRET) return res.status(403).send('Invalid token');

if (!users[userId]) { users[userId] = { userId, username, totalScore: 0, referrals: 0 }; // Add referral bonus if (referrerId && users[referrerId]) { users[referrerId].referrals += 1; users[referrerId].totalScore += 5; // referral bonus } }

users[userId].totalScore += score; res.sendStatus(200); });

// Leaderboard - top 10 players app.get('/leaderboard', (req, res) => { const top = Object.values(users) .sort((a, b) => b.totalScore - a.totalScore) .slice(0, 10); res.json(top); });

// My rank and total score app.get('/my-rank', (req, res) => { const { userId } = req.query; if (!userId || !users[userId]) return res.status(404).json({ error: 'User not found' });

const sorted = Object.values(users).sort((a, b) => b.totalScore - a.totalScore); const rank = sorted.findIndex((u) => u.userId === userId) + 1; res.json({ username: users[userId].username, totalScore: users[userId].totalScore, rank, referrals: users[userId].referrals, }); });

// Admin route to view all users and stats app.get('/admin/all-users', (req, res) => { const { token } = req.query; if (token !== ADMIN_SECRET) return res.status(403).send('Forbidden');

res.json(Object.values(users)); });

app.listen(port, () => console.log(Server running on port ${port}));


