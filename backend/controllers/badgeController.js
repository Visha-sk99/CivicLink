const mongoose = require('mongoose');
const User     = require('../models/User');
const Issue    = require('../models/Issue');
const { getBadge } = require('../utils/badgeCalculator');

const getLeaderboard = async (req, res) => {
  try {
    // Step 1 — Aggregate resolved issues per authority
    // NOTE: resolvedAt is optional — fallback to updatedAt if missing
    const aggregated = await Issue.aggregate([
      {
        $match: {
          status:     'resolved',
          assignedTo: { $exists: true, $ne: null },
        }
      },
      {
        $group: {
          _id:           '$assignedTo',
          totalResolved: { $sum: 1 },
          avgResolutionMs: {
            $avg: {
              $subtract: [
                // Use resolvedAt if exists, else use updatedAt as fallback
                { $ifNull: ['$resolvedAt', '$updatedAt'] },
                '$createdAt'
              ]
            }
          },
          totalUpvotes: { $sum: '$upvotes' },
        }
      },
      {
        $sort: {
          avgResolutionMs: 1,
          totalResolved:  -1,
          totalUpvotes:   -1,
        }
      }
    ]);

    console.log('Aggregation result:', JSON.stringify(aggregated, null, 2));

    // Step 2 — Get all authority users
    const authorities = await User.find({ role: 'authority' })
      .select('name designation constituency');

    // Step 3 — Merge stats with user info
    const leaderboard = authorities.map(auth => {
      const stats = aggregated.find(
        a => a._id.toString() === auth._id.toString()
      );

      const totalResolved   = stats?.totalResolved   || 0;
      const totalUpvotes    = stats?.totalUpvotes    || 0;
      const avgResolutionMs = stats?.avgResolutionMs || null;

      // Convert ms → days
      const avgDays = avgResolutionMs !== null
        ? parseFloat((avgResolutionMs / (1000 * 60 * 60 * 24)).toFixed(2))
        : null;

      // Score calculation
      let score = totalResolved * 10 + totalUpvotes * 2;
      if (avgDays !== null && avgDays <= 0.125) score += 30;
      if (avgDays !== null && avgDays < 1)      score += 15;
      if (avgDays !== null && avgDays > 5)      score -= 10;
      score = Math.max(0, score);

      // Update score in DB
      User.findByIdAndUpdate(auth._id, { reputationScore: score }).exec();

      const badge = getBadge(totalResolved, avgDays);

      return {
        _id:               auth._id,
        name:              auth.name,
        designation:       auth.designation,
        constituency:      auth.constituency,
        totalResolved,
        totalUpvotes,
        avgResolutionTime: avgDays,
        avgResolutionMs,
        reputationScore:   score,
        badge,
      };
    });

    // Step 4 — Sort: active first by speed, inactive to bottom
    const sorted = leaderboard.sort((a, b) => {
      if (a.totalResolved === 0 && b.totalResolved === 0) return 0;
      if (a.totalResolved === 0) return 1;
      if (b.totalResolved === 0) return -1;
      if (a.avgResolutionMs !== null && b.avgResolutionMs !== null) {
        if (a.avgResolutionMs !== b.avgResolutionMs) {
          return a.avgResolutionMs - b.avgResolutionMs;
        }
      }
      if (a.avgResolutionMs === null) return 1;
      if (b.avgResolutionMs === null) return -1;
      if (b.totalResolved !== a.totalResolved) return b.totalResolved - a.totalResolved;
      return b.totalUpvotes - a.totalUpvotes;
    });

    res.json(sorted);

  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ message: err.message });
  }
};

const getAuthorityScore = async (req, res) => {
  try {
    const result = await Issue.aggregate([
      {
        $match: {
          assignedTo: new mongoose.Types.ObjectId(req.params.authorityId),
          status:     'resolved',
        }
      },
      {
        $group: {
          _id:             null,
          totalResolved:   { $sum: 1 },
          avgResolutionMs: {
            $avg: {
              $subtract: [
                { $ifNull: ['$resolvedAt', '$updatedAt'] },
                '$createdAt'
              ]
            }
          },
          totalUpvotes: { $sum: '$upvotes' },
        }
      }
    ]);

    const stats         = result[0] || {};
    const totalResolved = stats.totalResolved || 0;
    const avgDays       = stats.avgResolutionMs
      ? parseFloat((stats.avgResolutionMs / (1000 * 60 * 60 * 24)).toFixed(2))
      : null;
    const badge = getBadge(totalResolved, avgDays);

    res.json({ totalResolved, avgResolutionTime: avgDays, badge });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getLeaderboard, getAuthorityScore };