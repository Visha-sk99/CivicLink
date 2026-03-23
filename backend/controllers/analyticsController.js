const Issue = require('../models/Issue');
const User  = require('../models/User');

// @route GET /api/analytics
const getAnalytics = async (req, res) => {
  try {
    const [total, resolved, inProgress, pending, citizens, authorities] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'resolved' }),
      Issue.countDocuments({ status: 'in_progress' }),
      Issue.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'citizen' }),
      User.countDocuments({ role: 'authority' }),
    ]);

    const byCategory = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const satisfactionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;

    res.json({ total, resolved, inProgress, pending, citizens, authorities, byCategory, satisfactionRate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAnalytics };