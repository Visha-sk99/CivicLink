const mongoose     = require('mongoose');
const Issue        = require('../models/Issue');
const Activity     = require('../models/Activity');
const User         = require('../models/User');
const Notification = require('../models/Notification');

const VALID_STATUSES = ['pending', 'in_progress', 'resolved'];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Re-fetch with names populated so live socket cards still show author/assignee
const loadPopulated = (id) =>
  Issue.findById(id)
    .populate('raisedBy', 'name username avatar')
    .populate('assignedTo', 'name username designation')
    .populate('resolvedBy', 'name designation');

const broadcastUpdate = async (req, issueId) => {
  const populated = await loadPopulated(issueId);
  req.io.emit('issue_updated', populated);
  req.io.emit('leaderboard_refresh');
  return populated;
};

// @route POST /api/issues
const createIssue = async (req, res) => {
  try {
    const { title, description, category, constituency, coordinates, address } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const mediaUrls = (req.files || []).map((f) => f.path);

    let coords = [0, 0];
    if (coordinates) {
      try {
        const parsed = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
        if (Array.isArray(parsed) && parsed.length === 2) coords = parsed.map(Number);
      } catch {
        /* keep default [0, 0] */
      }
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      constituency,
      location: {
        type: 'Point',
        coordinates: coords,
        address: address || constituency,
      },
      media: mediaUrls,
      raisedBy: req.user._id,
      statusHistory: [{ status: 'pending', updatedBy: req.user._id }],
    });

    await Activity.create({ user: req.user._id, issue: issue._id, actionType: 'CREATE_ISSUE' });

    // Notify authorities of the same constituency (once)
    if (constituency) {
      const authorities = await User.find({ role: 'authority', constituency }).select('_id');

      if (authorities.length > 0) {
        await Notification.insertMany(
          authorities.map((a) => ({
            user: a._id,
            issue: issue._id,
            message: `New issue reported in your area (${constituency}): "${title}"`,
            type: 'new_issue',
          }))
        );

        authorities.forEach((a) => {
          req.io.to(`user_${a._id}`).emit('new_notification', {
            message: `New issue in ${constituency}: "${title}"`,
            issueId: issue._id,
          });
        });
      }
    }

    const populated = await loadPopulated(issue._id);
    req.io.emit('new_issue', populated);
    req.io.emit('leaderboard_refresh');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Create issue error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/issues?status=&category=&search=&raisedBy=&constituency=&assignedTo=&page=&limit=
const getIssues = async (req, res) => {
  try {
    const { status, category, search, raisedBy, constituency, assignedTo } = req.query;
    const page  = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (constituency) filter.constituency = constituency;
    if (raisedBy && mongoose.isValidObjectId(raisedBy)) filter.raisedBy = raisedBy;
    if (assignedTo && mongoose.isValidObjectId(assignedTo)) filter.assignedTo = assignedTo;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { title: rx },
        { description: rx },
        { 'location.address': rx },
        { constituency: rx },
      ];
    }

    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 }) // newest first
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('raisedBy', 'name username avatar')
      .populate('assignedTo', 'name username designation')
      .populate('resolvedBy', 'name designation');

    res.json(issues);
  } catch (err) {
    console.error('Get issues error:', err);
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
};

// @route GET /api/issues/:id
const getIssueById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    const issue = await Issue.findById(req.params.id)
      .populate('raisedBy', 'name username avatar')
      .populate('assignedTo', 'name designation')
      .populate('resolvedBy', 'name designation')
      .populate('comments.user', 'name role designation')
      .populate('statusHistory.updatedBy', 'name role')
      .populate('resolution');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/issues/:id/take-charge   (authority / admin)
const takeCharge = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.assignedTo = req.user._id;
    issue.status = 'in_progress';
    issue.statusHistory.push({ status: 'in_progress', updatedBy: req.user._id });
    await issue.save();

    res.json(await broadcastUpdate(req, issue._id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/issues/:id/status   (authority / admin)
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status = status;
    if (status === 'resolved') {
      issue.resolvedAt = new Date();
    } else {
      issue.resolvedAt = undefined;
      issue.resolvedImage = undefined;
    }

    issue.statusHistory.push({ status, updatedBy: req.user._id });
    await issue.save();

    res.json(await broadcastUpdate(req, issue._id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/issues/:id/resolve   (authority / admin, proof image required)
const resolveWithProof = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'authority') {
      return res.status(403).json({ message: 'Only authorities can resolve issues' });
    }

    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ message: 'Resolution proof image is required' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    if (!issue.assignedTo) issue.assignedTo = req.user._id; // auto-assign

    issue.status = 'resolved';
    issue.resolvedImage = file.path; // Cloudinary URL
    issue.resolutionNote = req.body.note || '';
    issue.resolvedAt = new Date();
    issue.resolvedBy = req.user._id;
    issue.statusHistory.push({ status: 'resolved', updatedBy: req.user._id });
    await issue.save();

    res.json(await broadcastUpdate(req, issue._id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/issues/:id/comment
const addComment = async (req, res) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Comment cannot be empty' });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.comments.push({ user: req.user._id, text });
    await issue.save();

    const updated = await Issue.findById(req.params.id)
      .populate('comments.user', 'name role designation');
    res.json(updated.comments);
  } catch (err) {
    console.error('Comment error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/issues/:id   (owner or admin)
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const isOwner = issue.raisedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own issues' });
    }

    await issue.deleteOne();
    await Promise.all([
      Activity.deleteMany({ issue: issue._id }),
      Notification.deleteMany({ issue: issue._id }),
    ]);

    req.io.emit('issue_deleted', { _id: issue._id });
    req.io.emit('leaderboard_refresh');
    res.json({ message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  takeCharge,
  updateStatus,
  resolveWithProof,
  addComment,
  deleteIssue,
};