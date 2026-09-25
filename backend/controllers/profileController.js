const User     = require('../models/User');
const Issue    = require('../models/Issue');
const Activity = require('../models/Activity');

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const isAuthority = user.role === 'authority' || user.role === 'admin';

    // Issues posted by this user
    const postedIssues = await Issue.find({ raisedBy: req.user._id })
      .sort({ createdAt: -1 })
      .select('title status upvotes downvotes category createdAt');

    // For authorities — also get issues they RESOLVED
    const resolvedIssues = isAuthority
      ? await Issue.find({ assignedTo: req.user._id, status: 'resolved' })
          .sort({ resolvedAt: -1 })
          .select('title status upvotes downvotes category createdAt resolvedAt')
      : [];

    // All assigned issues for authority
    const assignedIssues = isAuthority
      ? await Issue.find({ assignedTo: req.user._id })
          .sort({ createdAt: -1 })
          .select('title status upvotes downvotes category createdAt resolvedAt')
      : [];

    // Activities
    const activities = await Activity.find({ user: req.user._id })
      .populate('issue', 'title category status')
      .sort({ createdAt: -1 })
      .limit(50);

    // Stats
    const stats = {
      totalIssues:    postedIssues.length,
      resolved:       isAuthority
        ? resolvedIssues.length          // for authority = issues they resolved
        : postedIssues.filter(i => i.status === 'resolved').length,
      totalAssigned:  assignedIssues.length,
      totalUpvotes:   activities.filter(a => a.actionType === 'UPVOTE').length,
      totalDownvotes: activities.filter(a => a.actionType === 'DOWNVOTE').length,
    };

    res.json({
      user,
      postedIssues,
      resolvedIssues,
      assignedIssues,
      activities,
      stats,
      isAuthority,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isAuthority = user.role === 'authority';

    const postedIssues = await Issue.find({ raisedBy: req.params.userId })
      .sort({ createdAt: -1 })
      .select('title status upvotes downvotes category createdAt');

    const resolvedIssues = isAuthority
      ? await Issue.find({ assignedTo: req.params.userId, status: 'resolved' })
          .sort({ resolvedAt: -1 })
          .select('title status upvotes downvotes category createdAt resolvedAt')
      : [];

    const stats = {
      totalIssues: postedIssues.length,
      resolved:    resolvedIssues.length,
    };

    res.json({ user, postedIssues, resolvedIssues, stats, isAuthority });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyActivity = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.filter) filter.actionType = req.query.filter;

    const activities = await Activity.find(filter)
      .populate('issue', 'title category status')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyProfile, getProfile, getMyActivity };