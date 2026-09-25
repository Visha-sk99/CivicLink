const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const CONSTITUENCIES = ['vasai', 'virar', 'nalasopara', 'miraroad', 'bhayander'];

const userSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  email:           { type: String, required: true, unique: true, lowercase: true },
  password:        { type: String, required: true, minlength: 6 },
  role:            { type: String, enum: ['citizen', 'authority', 'admin'], default: 'citizen' },
  constituency:    { type: String, default: null },
  designation:     { type: String, default: '' },
  reputationScore: { type: Number, default: 0 },
  badges:          [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  avatar:          { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  bcrypt.hash(this.password, 12, (err, hash) => {
    if (err) {
      next(err);
      return;
    }
    this.password = hash;
    next();
  });
});

userSchema.methods.matchPassword = function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
module.exports.CONSTITUENCIES = CONSTITUENCIES;