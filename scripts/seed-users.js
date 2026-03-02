const admin = require('firebase-admin');
const path = require('path');

// To use this, you need your serviceAccountKey.json in the project root.
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const auth = admin.auth();
const db = admin.firestore();

const dummyUsers = [
  {
    email: 'admin@test.com',
    password: 'AdminPassword123!',
    role: 'admin'
  },
  {
    email: 'user@test.com',
    password: 'UserPassword123!',
    role: 'user'
  }
];

async function seedUsers() {
  for (const userData of dummyUsers) {
    try {
      console.log(`Processing ${userData.email}...`);
      
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(userData.email);
        console.log(` - User exists (UID: ${userRecord.uid}). Updating...`);
        await auth.updateUser(userRecord.uid, { password: userData.password });
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          userRecord = await auth.createUser({
            email: userData.email,
            password: userData.password,
            emailVerified: true
          });
          console.log(` - Created new user (UID: ${userRecord.uid})`);
        } else {
          throw err;
        }
      }

      // Sync to Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email: userRecord.email,
        role: userData.role,
        savedIPOs: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(` ✅ Successfully provisioned ${userData.role}: ${userData.email}`);
    } catch (error) {
      console.error(` ❌ Error processing ${userData.email}:`, error.message);
    }
  }
  process.exit();
}

seedUsers();
