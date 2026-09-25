const express = require('express');
const router  = express.Router();
const { getMyProfile, getProfile, getMyActivity } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me',          protect, getMyProfile);
router.get('/my-activity', protect, getMyActivity);
router.get('/:userId',     protect, getProfile);

module.exports = router;