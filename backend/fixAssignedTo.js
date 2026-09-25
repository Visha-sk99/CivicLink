require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  require('./models/User');
  require('./models/Resolution');
  const Issue = require('./models/Issue');
  const User  = require('./models/User');

  // Show all authorities so you can pick the right one
  const authorities = await User.find({ role: 'authority' })
    .select('name designation constituency');

  console.log('\n=== AUTHORITIES ===');
  authorities.forEach((a, i) => {
    console.log(`[${i+1}] ${a.name} (${a.designation}) - ID: ${a._id}`);
  });

  // Show unassigned resolved issues
  const unassigned = await Issue.find({
    status:     'resolved',
    assignedTo: { $exists: false }
  }).select('title upvotes');

  console.log('\n=== UNASSIGNED RESOLVED ISSUES ===');
  console.log('Count:', unassigned.length);
  unassigned.forEach((i, idx) => {
    console.log(`[${idx+1}] ID: ${i._id} | Title: ${i.title} | Upvotes: ${i.upvotes}`);
  });

  process.exit(0);
}).catch(e => { console.log(e); process.exit(1); });