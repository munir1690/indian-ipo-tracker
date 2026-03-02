const admin = require('firebase-admin');
const path = require('path');

const emailToPromote = process.argv[2];

if (!emailToPromote) {
  console.error('❌ Error: Please provide an email address.');
  console.log('Usage: node scripts/promote-user.js user@example.com');
  process.exit(1);
}

async function promoteUser() {
  try {
    let serviceAccount;
    try {
      serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));
    } catch (e) {
      console.error("❌ Error: Missing 'serviceAccountKey.json' in project root.");
      process.exit(1);
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    const auth = admin.auth();
    const db = admin.firestore();

    console.log(`Searching for user with email: ${emailToPromote}...`);
    const userRecord = await auth.getUserByEmail(emailToPromote);
    
    console.log(`Found user: ${userRecord.displayName || userRecord.email} (UID: ${userRecord.uid})`);
    
    await db.collection('users').doc(userRecord.uid).update({
      role: 'admin'
    });

    console.log(`\n✅ Successfully promoted ${emailToPromote} to Admin!`);
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Error: No user found with email ${emailToPromote}`);
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

promoteUser();
