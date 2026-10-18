const express = require('express');
const router = express.Router();
const { getAnalytics, getLeaderboard } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAnalytics);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;