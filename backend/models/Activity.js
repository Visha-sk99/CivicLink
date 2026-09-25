const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issue:      { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  actionType: { type: String, enum: ['CREATE_ISSUE', 'UPVOTE', 'DOWNVOTE'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);