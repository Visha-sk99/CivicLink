const Issue = require('../models/Issue');
const User  = require('../models/User');

const calculateBadges = async (authorityId) => {
  const resolved = await Issue.find({ assignedTo: authorityId, status: 'resolved' });
  const pending30 = await Issue.find({
    assignedTo: authorityId,
    status: 'pending',
    createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });

  let score = 0;
  score += resolved.length * 10;
  score -= pending30.length * 5;

  const totalUpvotes   = resolved.reduce((sum, i) => sum + i.upvotes, 0);
  const totalDownvotes = resolved.reduce((sum, i) => sum + i.downvotes, 0);
  const totalVotes     = totalUpvotes + totalDownvotes;
  const satisfactionRate = totalVotes > 0 ? (totalUpvotes / totalVotes) * 100 : 0;

  if (satisfactionRate >= 80) score += 20;

  await User.findByIdAndUpdate(authorityId, { reputationScore: Math.max(0, score) });
  return { score, resolved: resolved.length, pending30: pending30.length, satisfactionRate };
};

module.exports = { calculateBadges };