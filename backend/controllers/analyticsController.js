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
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $addFields: { category: '$_id' } },
    ]);

    const satisfactionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;

    res.json({
      total, resolved, inProgress, pending,
      citizens, authorities, byCategory, satisfactionRate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/analytics/leaderboard?limit=10
// Authorities only.
// score = 20 per resolved + 5 per in-progress + 1 per citizen upvote on issues they handle
const getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const rows = await User.aggregate([
      { $match: { role: 'authority' } },

      // every issue this authority handles (assignedTo, else resolvedBy)
      {
        $lookup: {
          from: Issue.collection.name,
          let: { uid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: [{ $ifNull: ['$assignedTo', '$resolvedBy'] }, '$$uid'] },
              },
            },
            { $project: { status: 1, upvotes: 1, createdAt: 1, resolvedAt: 1 } },
          ],
          as: 'handled',
        },
      },

      {
        $addFields: {
          assigned: { $size: '$handled' },
          resolved: {
            $size: { $filter: { input: '$handled', as: 'i', cond: { $eq: ['$$i.status', 'resolved'] } } },
          },
          inProgress: {
            $size: { $filter: { input: '$handled', as: 'i', cond: { $eq: ['$$i.status', 'in_progress'] } } },
          },
          pending: {
            $size: { $filter: { input: '$handled', as: 'i', cond: { $eq: ['$$i.status', 'pending'] } } },
          },
          upvotes: { $sum: '$handled.upvotes' },
          // average hours from reported -> resolved
          avgHours: {
            $avg: {
              $map: {
                input: {
                  $filter: {
                    input: '$handled',
                    as: 'i',
                    cond: {
                      $and: [
                        { $eq: ['$$i.status', 'resolved'] },
                        { $eq: [{ $type: '$$i.resolvedAt' }, 'date'] },
                      ],
                    },
                  },
                },
                as: 'i',
                in: { $divide: [{ $subtract: ['$$i.resolvedAt', '$$i.createdAt'] }, 3600000] },
              },
            },
          },
        },
      },

      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ['$resolved', 20] },
              { $multiply: ['$inProgress', 5] },
              '$upvotes',
            ],
          },
        },
      },

      { $sort: { score: -1, resolved: -1, name: 1 } },
      { $limit: limit },

      {
        $project: {
          _id: 0,
          userId: { $toString: '$_id' },
          name: 1,
          username: 1,
          designation: 1,
          constituency: 1,
          assigned: 1,
          resolved: 1,
          inProgress: 1,
          pending: 1,
          upvotes: 1,
          score: 1,
          avgHours: { $round: ['$avgHours', 1] },
        },
      },
    ]);

    res.json(rows.map((r, i) => ({ ...r, rank: i + 1 })));
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAnalytics, getLeaderboard };