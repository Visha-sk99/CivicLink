require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Issue = require('./models/Issue');
  
  const result = await Issue.updateMany(
    { status: 'resolved', resolvedAt: { $exists: false } },
    { $set: { resolvedAt: new Date() } }
  );
  
  console.log('Fixed issues:', result.modifiedCount);
  process.exit(0);

}).catch(e => {
  console.log(e);
  process.exit(1);
});