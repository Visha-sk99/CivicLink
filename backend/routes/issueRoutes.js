const express = require('express');
const router  = express.Router();

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// ⚠️ CHECK THIS LINE: it must point to YOUR multer + Cloudinary upload middleware
const upload = require('../middleware/upload');

const {
  getIssues,
  getIssueById,
  createIssue,
  takeCharge,
  updateStatus,
  resolveWithProof,
  addComment,
  deleteIssue,
} = require('../controllers/issueController');

const staffOnly = authorizeRoles('authority', 'admin');

// Public
router.get('/', getIssues);
router.get('/:id', getIssueById);

// Citizens (logged in)
router.post('/', protect, upload.any(), createIssue);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deleteIssue);

// Authority / admin only
router.put('/:id/take-charge', protect, staffOnly, takeCharge);
router.put('/:id/status', protect, staffOnly, updateStatus);
router.post('/:id/resolve', protect, staffOnly, upload.any(), resolveWithProof);

module.exports = router;