const axios = require('axios');
const cheerio = require('cheerio');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where } = require('firebase/firestore');

// Initialize Firebase using the same config from your app
const firebaseConfig = {
  apiKey: "REDACTED_API_KEY",
  authDomain: "armys-alpha-ipo.firebaseapp.com",
  projectId: "armys-alpha-ipo",
  storageBucket: "armys-alpha-ipo.firebasestorage.app",
  messagingSenderId: "REDACTED_SENDER_ID",
  appId: "1:REDACTED_SENDER_ID:web:1006debbfb7a841a3921ee",
  measurementId: "REDACTED_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Example configuration for the scraper
// Replace the URL with your target IPO data website
const TARGET_URL = 'https://example.com/ipo-list';

async function scrapeIPOs() {
  console.log(`📡 Fetching data from: ${TARGET_URL}...`);
  try {
    // 1. Fetch the HTML
    const response = await axios.get(TARGET_URL);
    const html = response.data;
    
    // 2. Load into Cheerio for parsing
    const $ = cheerio.load(html);
    
    const scrapedListings = [];

    // 3. Extract logic (This is highly dependent on the target website's structure)
    // IMPORTANT: Change the selectors (like '.ipo-table tbody tr') to match your target website!
    $('.ipo-table tbody tr').each((index, element) => {
      // Example row parsing
      const companyName = $(element).find('.company-name').text().trim();
      const rawDate = $(element).find('.listing-date').text().trim(); // e.g., "15 Mar 2026"
      const issueSize = $(element).find('.issue-size').text().trim() || 'TBA';
      const priceBand = $(element).find('.price-band').text().trim() || 'TBA';
      const subscription = $(element).find('.subscription').text().trim() || 'N/A';
      const gmp = $(element).find('.gmp').text().trim() || '-';

      if (companyName) {
        // You'll likely need to parse/format the date string to a proper ISO string
        let expectedListingDate = new Date().toISOString(); 
        try {
           const parsedDate = new Date(rawDate);
           if (!isNaN(parsedDate.getTime())) {
             expectedListingDate = parsedDate.toISOString();
           }
        } catch(e) {}

        const newListing = {
          companyName,
          expectedListingDate: expectedListingDate,
          status: 'Upcoming', // You could infer this from the date
          fundamentals: {
            issueSize,
            priceBand,
            subscriptionStatus: subscription,
            gmp
          },
          expertTake: {
            tag: 'Neutral', // Default placeholder
            remarks: 'Awaiting expert analysis post-DRHP review.'
          }
        };

        scrapedListings.push(newListing);
      }
    });

    console.log(`✅ Extracted ${scrapedListings.length} IPO records.`);
    
    // 4. Update the Firestore Database
    if (scrapedListings.length > 0) {
      await saveToDatabase(scrapedListings);
    } else {
      console.log('⚠️ No records found. Please check your Cheerio CSS selectors!');
    }

  } catch (error) {
    console.error('❌ Scraper failed:', error.message);
  }
}

async function saveToDatabase(listings) {
  console.log('💾 Saving to Firestore directly...');
  const iposCollection = collection(db, 'ipos');

  let addedCount = 0;
  let skippedCount = 0;

  for (const listing of listings) {
    // Basic duplication check (Check if an IPO with the exact same name already exists)
    const q = query(iposCollection, where('companyName', '==', listing.companyName));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Record doesn't exist, safely add it
      await addDoc(iposCollection, listing);
      addedCount++;
    } else {
      // Record already exists
      skippedCount++;
    }
  }

  console.log(`🎉 Database Update Complete!`);
  console.log(`   - Added: ${addedCount}`);
  console.log(`   - Skipped (Duplicates): ${skippedCount}`);
  
  process.exit(0); // Ensure the script exits cleanly
}

// Execute the Web Scraper
scrapeIPOs();
