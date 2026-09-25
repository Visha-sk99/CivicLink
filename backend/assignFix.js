require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  require('./models/User');
  require('./models/Resolution');
  const Issue = require('./models/Issue');

  // Aatharva's ID from the output
  const AATHARVA_ID = '69c262e2ee4e36740e4f6539';

  // All 4 unassigned resolved issue IDs from the output
  const UNASSIGNED_IDS = [
    '69c182f1bee9de7372379e06', // garbage - 3 upvotes
    '69c2cd61ca27cd88daa43e3c', // garbage - 3 upvotes
    '69c2cfa7ca27cd88daa44226', // blackout - 4 upvotes
    '69c2d3adca27cd88daa44430', // massive - 0 upvotes
  ];

  const result = await Issue.updateMany(
    { _id: { $in: UNASSIGNED_IDS } },
    {
      $set: {
        assignedTo: new mongoose.Types.ObjectId(AATHARVA_ID),
        resolvedAt: new Date(), // ensure resolvedAt is set
      }
    }
  );

  console.log('✅ Fixed issues:', result.modifiedCount);

  // Verify
  const verify = await Issue.find({ _id: { $in: UNASSIGNED_IDS } })
    .select('title assignedTo resolvedAt');
  verify.forEach(i => {
    console.log(`✓ ${i.title} → assignedTo: ${i.assignedTo}`);
  });

  process.exit(0);
}).catch(e => { console.log(e); process.exit(1); });