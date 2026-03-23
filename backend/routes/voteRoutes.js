const express = require('express');
const router = express.Router();
const { castVote } = require('../controllers/voteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:issueId', protect, castVote);

module.exports = router;