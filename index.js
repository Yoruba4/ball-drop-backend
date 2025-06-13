const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb+srv://your-mongodb-uri'; // Replace with your own MongoDB URI
const SECRET = 'Dangutaga3540#'; // Same secret as frontend

app.use(cors());
app.use(express.json());

// MongoDB model
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  userId: String,
  username: String,
  totalScore: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Route: Submit Score
app.post('/submit-score', async (req, res) => {
  const { userId, username, score, token } = req.body;

  if (token !== SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!userId || typeof score !== 'number') {
    return res.status(400).json({ error: 'Missing userId or score' });
  }

  let user = await User.findOne({ userId });

  if (!user) {
    user = new User({ userId, username, totalScore: score });
  } else {
    user.totalScore += score;
  }

  await user.save();
  res.json({ success: true });
});

// Route: Leaderboard
app.get('/leaderboard', async (req, res) => {
  const top = await User.find().sort({ totalScore: -1 }).limit(10);
  res.json(top.map(user => ({
    username: user.username,
    score: user.totalScore
  })));
});

// Route: My Rank
app.get('/my-rank/:userId', async (req, res) => {
  const user = await User.findOne({ userId: req.params.userId });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const higherRanked = await User.countDocuments({ totalScore: { $gt: user.totalScore } });
  res.json({
    rank: higherRanked + 1,
    score: user.totalScore
  });
});

// Admin Route: View All Users
app.get('/admin/all-users', async (req, res) => {
  if (req.query.token !== SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const all = await User.find().sort({ totalScore: -1 });
  res.json(all);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




