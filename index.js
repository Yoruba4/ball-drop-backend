const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = "mongodb+srv://nevergive:Olawale4@balldropdb.wfvqcps.mongodb.net/?retryWrites=true&w=majority&appName=BallDropDb";
const BACKEND_SECRET = 'Dangutaga3540#';

app.use(cors());
app.use(express.json());

// MongoDB User Schema
const userSchema = new mongoose.Schema({
  userId: String,
  username: String,
  totalScore: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Submit Score
app.post('/submit-score', async (req, res) => {
  const { userId, username, score, token } = req.body;
  if (token !== BACKEND_SECRET) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  if (!userId || !username || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  let user = await User.findOne({ userId });
  if (user) {
    user.totalScore += score;
  } else {
    user = new User({ userId, username, totalScore: score });
  }
  await user.save();
  res.json({ message: 'Score submitted' });
});

// Get Global Leaderboard
app.get('/leaderboard', async (req, res) => {
  const topUsers = await User.find({})
    .sort({ totalScore: -1 })
    .limit(10)
    .select('username totalScore -_id');
  res.json(topUsers.map(u => ({
    username: u.username,
    score: u.totalScore
  })));
});

// Get My Rank
app.get('/my-rank/:userId', async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOne({ userId });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const higherUsers = await User.countDocuments({ totalScore: { $gt: user.totalScore } });

  res.json({
    username: user.username,
    totalScore: user.totalScore,
    rank: higherUsers + 1
  });
});

// Admin route to view all users
app.get('/admin/all-users', async (req, res) => {
  const token = req.headers['authorization'];
  if (token !== BACKEND_SECRET) return res.status(403).json({ error: 'Unauthorized' });

  const users = await User.find({}).sort({ totalScore: -1 });
  res.json(users);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




