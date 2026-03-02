/* 
To run this script, you must have a Firebase Service Account key (JSON file).
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save it in your project root as "serviceAccountKey.json"
4. Run this script using node scripts/create-admin.js
*/

const admin = require('firebase-admin');
const path = require('path');

async function createAdmin() {
  try {
    // Attempt to load service account key
    let serviceAccount;
    try {
        serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));
    } catch (e) {
        console.error("❌ Error: Missing 'serviceAccountKey.json' in project root.");
        console.error("Please download it from Firebase Console (Project Settings > Service Accounts > Generate new private key).");
        process.exit(1);
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    const auth = admin.auth();
    const db = admin.firestore();

    const username = 'munir1690@example.com';
    const password = process.env.ADMIN_PASSWORD;
    
    if (!password) {
      console.error("❌ Error: ADMIN_PASSWORD environment variable is required.");
      console.error("Run it like: ADMIN_PASSWORD='my_secure_password' node scripts/create-admin.js");
      process.exit(1);
    }

    console.log(`Creating user ${username}...`);
    
    // Check if user already exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(username);
      console.log(`User already exists with UID: ${userRecord.uid}. Updating password...`);
      userRecord = await auth.updateUser(userRecord.uid, { password: password });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({
          email: username,
          password: password,
          emailVerified: true
        });
      } else {
        throw error;
      }
    }

    console.log(`User created/updated with UID: ${userRecord.uid}`);
    console.log('Setting admin role in Firestore...');
    
    await db.collection('users').doc(userRecord.uid).set({
        email: userRecord.email,
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log('\n✅ Admin Account successfully created!');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
