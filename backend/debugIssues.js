require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  // Must require ALL models first to avoid MissingSchemaError
  require('./models/User');
  require('./models/Resolution');
  const Issue = require('./models/Issue');

  const issues = await Issue.find({ status: 'resolved' })
    .populate('assignedTo', 'name')
    .select('title status assignedTo resolvedAt createdAt upvotes');

  console.log('\n=== ALL RESOLVED ISSUES ===');
  console.log('Total count:', issues.length);

  issues.forEach((issue, i) => {
    console.log(`\n[${i+1}] ${issue.title}`);
    console.log('    assignedTo:', issue.assignedTo ? issue.assignedTo.name : '❌ NULL/MISSING');
    console.log('    assignedTo_id:', issue.assignedTo?._id || '❌ NONE');
    console.log('    resolvedAt:', issue.resolvedAt || '❌ MISSING');
    console.log('    upvotes:', issue.upvotes);
  });

  process.exit(0);
}).catch(e => {
  console.log(e);
  process.exit(1);
});