const { calculateBadges } = require('../utils/badgeCalculator');
const User = require('../models/User');

// @route GET /api/badges/score/:authorityId
const getAuthorityScore = async (req, res) => {
  try {
    const result = await calculateBadges(req.params.authorityId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/badges/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const authorities = await User.find({ role: 'authority' })
      .select('name designation constituency reputationScore')
      .sort({ reputationScore: -1 })
      .limit(20);
    res.json(authorities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAuthorityScore, getLeaderboard };