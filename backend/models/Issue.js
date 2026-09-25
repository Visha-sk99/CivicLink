const mongoose      = require('mongoose');
const CONSTITUENCIES = require('./User').CONSTITUENCIES;

const issueSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category:    { type: String, enum: ['pothole', 'water', 'garbage', 'electricity', 'other'], required: true },

  // Constituency-based location (dropdown)
    constituency: {
    type: String,
    default: null,
  },

  // GeoJSON for map
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
    address:     { type: String },
  },

  media:      [{ type: String }],
  status:     { type: String, enum: ['pending', 'in_progress', 'resolved'], default: 'pending' },
  raisedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  upvotes:    { type: Number, default: 0 },
  downvotes:  { type: Number, default: 0 },
  comments: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text:      { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  resolution:     { type: mongoose.Schema.Types.ObjectId, ref: 'Resolution' },
  resolvedImage:  { type: String },
  resolutionNote: { type: String },
  resolvedAt:     { type: Date },
  resolvedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  statusHistory: [{
    status:    { type: String },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
}, { timestamps: true });

issueSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Issue', issueSchema);