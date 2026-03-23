const express = require('express');
const router = express.Router();
const { getAuthorityScore, getLeaderboard } = require('../controllers/badgeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/leaderboard',        protect, getLeaderboard);
router.get('/score/:authorityId', protect, getAuthorityScore);

module.exports = router;