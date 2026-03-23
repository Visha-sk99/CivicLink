const Issue = require('../models/Issue');

// @route POST /api/issues
const createIssue = async (req, res) => {
  try {
    const { title, description, category, coordinates, address } = req.body;
    const mediaUrls = req.files ? req.files.map(f => f.path) : [];

    const issue = await Issue.create({
      title, description, category,
      location: { type: 'Point', coordinates: JSON.parse(coordinates), address },
      media: mediaUrls,
      raisedBy: req.user._id,
    });
    req.io.emit('new_issue', issue);
    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/issues
const getIssues = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};
    if (status)   filter.status = status;
    if (category) filter.category = category;
    if (search)   filter.title = { $regex: search, $options: 'i' };

    const issues = await Issue.find(filter)
      .populate('raisedBy', 'name avatar')
      .populate('assignedTo', 'name designation')
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
      .populate('raisedBy', 'name avatar')
      .populate('assignedTo', 'name designation')
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
    issue.status = 'in_progress';
    await issue.save();
    req.io.emit('issue_updated', issue);
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/issues/:id/status
const updateStatus = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    issue.status = req.body.status;
    await issue.save();
    req.io.emit('issue_updated', issue);
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
    // Populate the comments with user data before returning
    const updated = await Issue.findById(req.params.id)
      .populate('comments.user', 'name');
    res.json(updated.comments);
  } catch (err) {
    console.error('Comment error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createIssue, getIssues, getIssueById, takeCharge, updateStatus, addComment };