const mongoose = require('mongoose');

const resolutionSchema = new mongoose.Schema({
  issue:           { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  resolvedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  beforeImages:    [{ type: String }],
  afterImages:     [{ type: String }],
  contractorName:  { type: String },
  budgetAllocated: { type: Number },
  budgetSpent:     { type: Number },
  completionDate:  { type: Date },
  notes:           { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Resolution', resolutionSchema);