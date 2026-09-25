const CivicVote = require('../models/Vote');
const Issue    = require('../models/Issue');
const Activity = require('../models/Activity');

const castVote = async (req, res) => {
  try {
    const { voteType } = req.body;
    const issueId = req.params.issueId;
    const userId  = req.user._id;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const existing = await CivicVote.findOne({ issue: issueId, user: userId });

    if (existing) {
      // SAME VOTE → REMOVE (TOGGLE OFF)
      if (existing.voteType === voteType) {
        await CivicVote.findByIdAndDelete(existing._id);

        if (voteType === 'upvote') {
          issue.upvotes = Math.max(0, issue.upvotes - 1);
        } else {
          issue.downvotes = Math.max(0, issue.downvotes - 1);
        }

        // ❌ Remove activity
        await Activity.findOneAndDelete({
          user: userId,
          issue: issueId,
          actionType: voteType.toUpperCase(),
        });

      } else {
        // 🔁 SWITCH VOTE
        if (existing.voteType === 'upvote') {
          issue.upvotes   = Math.max(0, issue.upvotes - 1);
          issue.downvotes += 1;
        } else {
          issue.downvotes = Math.max(0, issue.downvotes - 1);
          issue.upvotes   += 1;
        }

        existing.voteType = voteType;
        await existing.save();

        // 🔄 Update activity
        await Activity.findOneAndUpdate(
          {
            user: userId,
            issue: issueId,
            actionType: { $in: ['UPVOTE', 'DOWNVOTE'] },
          },
          {
            actionType: voteType.toUpperCase(),
          },
          { upsert: true }
        );
      }

    } else {
      // 🆕 CREATE NEW VOTE
      await CivicVote.create({
        issue: issueId,
        user: userId,
        voteType,
      });

      if (voteType === 'upvote') {
        issue.upvotes += 1;
      } else {
        issue.downvotes += 1;
      }

      // 🆕 Track activity
      await Activity.create({
        user: userId,
        issue: issueId,
        actionType: voteType.toUpperCase(),
      });
    }

    await issue.save();

    res.json(issue);

  } catch (err) {
    console.error('VOTE ERROR FULL:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { castVote };