const Vote = require('../models/Vote');
const Issue = require('../models/Issue');

const castVote = async (req, res) => {
  try {
    const { voteType } = req.body;
    const issueId = req.params.issueId;
    const userId = req.user._id;

    console.log('Vote request:', { issueId, userId, voteType }); // debug line

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const existing = await Vote.findOne({ issue: issueId, user: userId });
    console.log('Existing vote:', existing); // debug line

    if (existing) {
      if (existing.voteType === voteType) {
        await Vote.findByIdAndDelete(existing._id);
        if (voteType === 'upvote') issue.upvotes = Math.max(0, issue.upvotes - 1);
        else issue.downvotes = Math.max(0, issue.downvotes - 1);
      } else {
        if (existing.voteType === 'upvote') {
          issue.upvotes = Math.max(0, issue.upvotes - 1);
          issue.downvotes += 1;
        } else {
          issue.downvotes = Math.max(0, issue.downvotes - 1);
          issue.upvotes += 1;
        }
        existing.voteType = voteType;
        await existing.save();
      }
    } else {
      await Vote.create({ issue: issueId, user: userId, voteType });
      if (voteType === 'upvote') issue.upvotes += 1;
      else issue.downvotes += 1;
    }

    await issue.save();
    res.json(issue);

  } catch (err) {
    console.error('VOTE ERROR FULL:', err); // this will show in backend terminal
    res.status(500).json({ message: err.message });
  }
};

module.exports = { castVote };