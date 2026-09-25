const express = require('express');
const router  = express.Router();
const {
  createIssue, getIssues, getIssueById,
  takeCharge, updateStatus, resolveWithProof, addComment
} = require('../controllers/issueController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/',    protect, getIssues);
router.post('/',   protect, authorizeRoles('citizen'), upload.array('media', 5), createIssue);
router.get('/:id', protect, getIssueById);

router.put('/:id/take-charge', protect, authorizeRoles('authority', 'admin'), takeCharge);
router.put('/:id/status',      protect, authorizeRoles('authority', 'admin'), updateStatus);

// NEW — resolve with proof image
router.post('/:id/resolve', protect, authorizeRoles('authority', 'admin'), upload.single('resolvedImage'), resolveWithProof);

router.post('/:id/comment', protect, addComment);

module.exports = router;