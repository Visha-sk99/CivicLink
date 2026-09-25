const Issue        = require('../models/Issue');
const Activity     = require('../models/Activity');
const User         = require('../models/User');
const Notification = require('../models/Notification');

// @route POST /api/issues
const createIssue = async (req, res) => {
  try {
    const { title, description, category, constituency, coordinates, address } = req.body;
    const mediaUrls = req.files ? req.files.map(f => f.path) : [];

    const issue = await Issue.create({
      title, description, category,
      constituency,
      location: {
        type:        'Point',
        coordinates: coordinates ? JSON.parse(coordinates) : [0, 0],
        address:     address || constituency,
      },
      media:    mediaUrls,
      raisedBy: req.user._id,
      statusHistory: [{ status: 'pending', updatedBy: req.user._id }],
    });

    // Track activity
    await Activity.create({ user: req.user._id, issue: issue._id, actionType: 'CREATE_ISSUE' });

    // Find authorities in same constituency and notify them
// Find authorities in same constituency and notify them
const matchingAuthorities = await User.find({
  role:         'authority',
  constituency: constituency,
}).select('_id name constituency');

console.log('Issue constituency:', constituency);
console.log('Matching authorities found:', matchingAuthorities.length, matchingAuthorities.map(a => a.name));

if (matchingAuthorities.length > 0) {
  const notifications = matchingAuthorities.map(auth => ({
    user:    auth._id,
    issue:   issue._id,
    message: `New issue reported in your area (${constituency}): "${title}"`,
    type:    'new_issue',
  }));
  await Notification.insertMany(notifications);
  console.log('Notifications created:', notifications.length);

  matchingAuthorities.forEach(auth => {
    req.io.to(`user_${auth._id}`).emit('new_notification', {
      message: `New issue in ${constituency}: "${title}"`,
      issueId: issue._id,
    });
    console.log('Socket emit to room:', `user_${auth._id}`);
  });
}
    if (matchingAuthorities.length > 0) {
      const notifications = matchingAuthorities.map(auth => ({
        user:    auth._id,
        issue:   issue._id,
        message: `New issue reported in your area (${constituency}): "${title}"`,
        type:    'new_issue',
      }));
      await Notification.insertMany(notifications);

      // Real-time notification via Socket.io
      matchingAuthorities.forEach(auth => {
        req.io.to(`user_${auth._id}`).emit('new_notification', {
          message: `New issue in ${constituency}: "${title}"`,
          issueId: issue._id,
        });
      });
    }

    req.io.emit('new_issue', issue);
    res.status(201).json(issue);
  } catch (err) {
    console.error('Create issue error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/issues
const getIssues = async (req, res) => {
  try {
    const { status, category, search, constituency } = req.query;
    const filter = {};
    if (status)       filter.status       = status;
    if (category)     filter.category     = category;
    if (search)       filter.title        = { $regex: search, $options: 'i' };
    if (constituency) filter.constituency = constituency;  // ← add this

    const issues = await Issue.find(filter)
      .populate('raisedBy',  'name avatar')
      .populate('assignedTo','name designation')
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/issues/:id
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('raisedBy',  'name avatar')
      .populate('assignedTo','name designation')
      .populate('resolvedBy','name designation')
      .populate('comments.user', 'name role designation')
      .populate('statusHistory.updatedBy', 'name role')
      .populate('resolution');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/issues/:id/take-charge
const takeCharge = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    issue.assignedTo = req.user._id;
    issue.status     = 'in_progress';
    issue.statusHistory.push({ status: 'in_progress', updatedBy: req.user._id });
    await issue.save();
    req.io.emit('issue_updated', issue);
    req.io.emit('leaderboard_refresh');
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/issues/:id/status  (non-resolve status changes)
const updateStatus = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status = req.body.status;

    if (req.body.status === 'resolved') {
      issue.resolvedAt = new Date();
    } else {
      issue.resolvedAt  = undefined;
      issue.resolvedImage = undefined;
    }

    issue.statusHistory.push({ status: req.body.status, updatedBy: req.user._id });
    await issue.save();
    req.io.emit('issue_updated', issue);
    req.io.emit('leaderboard_refresh');
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/issues/:id/resolve  ← NEW: resolve with image proof
const resolveWithProof = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // Only assigned authority or admin can resolve
    // If not assigned yet, auto-assign to this authority
    if (!issue.assignedTo) {
      issue.assignedTo = req.user._id;
    }

    // Only admin or assigned authority can resolve
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'authority'
    ) {
      return res.status(403).json({ message: 'Only authorities can resolve issues' });
    }
    // Image is required
    if (!req.file) {
      return res.status(400).json({ message: 'Resolution proof image is required' });
    }

    issue.status         = 'resolved';
    issue.resolvedImage  = req.file.path;     // Cloudinary URL
    issue.resolutionNote = req.body.note || '';
    issue.resolvedAt     = new Date();
    issue.resolvedBy     = req.user._id;
    issue.statusHistory.push({ status: 'resolved', updatedBy: req.user._id });

    await issue.save();
    req.io.emit('issue_updated', issue);
    req.io.emit('leaderboard_refresh');
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/issues/:id/comment
const addComment = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    issue.comments.push({ user: req.user._id, text: req.body.text });
    await issue.save();
    const updated = await Issue.findById(req.params.id)
      .populate('comments.user', 'name role designation');
    res.json(updated.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.error('Comment error:', err);
  }
};

module.exports = {
  createIssue, getIssues, getIssueById,
  takeCharge, updateStatus, resolveWithProof, addComment
};