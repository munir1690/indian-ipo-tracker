const axios = require('axios');
const cheerio = require('cheerio');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } = require('firebase/firestore');

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

const TARGET_URL = 'https://groww.in/ipo';

// Sleep utility to respect target servers
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchDetailedData(searchId) {
  if (!searchId) return null;
  const url = `https://groww.in/ipo/${searchId}`;
  console.log(`     -> Crawling detailed route: ${url}`);
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    const nextDataStr = $('#__NEXT_DATA__').html();
    if (!nextDataStr) return null;
    
    const nextData = JSON.parse(nextDataStr);
    const ipoData = nextData.props?.pageProps?.ipoData || {};
    
    // Extract Subscription Rates
    const rates = ipoData.subscriptionRates || {};
    const subscriptionRates = {
        qib: rates.qibSubscriptionRate ? `${rates.qibSubscriptionRate.toFixed(2)}x` : '-',
        nii: rates.niiSubscriptionRate ? `${rates.niiSubscriptionRate.toFixed(2)}x` : '-',
        retail: rates.retailSubscriptionRate ? `${rates.retailSubscriptionRate.toFixed(2)}x` : '-',
        total: rates.totalSubscriptionRate ? `${rates.totalSubscriptionRate.toFixed(2)}x` : '-'
    };

    return {
      aboutCompany: ipoData.aboutCompany || '',
      pros: ipoData.pros || [],
      cons: ipoData.cons || [],
      subscriptionRates
    };

  } catch (err) {
    console.error(`     -> Error crawling details for ${searchId}:`, err.message);
    return null;
  }
}

function formatBaselineData(growwData, status) {
  let expectedListingDate = new Date().toISOString();
  if (growwData.bidStartTimestamp) {
    expectedListingDate = new Date(growwData.bidStartTimestamp).toISOString();
  } else if (growwData.listingDate) {
    expectedListingDate = new Date(growwData.listingDate).toISOString();
  }

  let minP = 0, maxP = 0;
  if (growwData.categories && growwData.categories.length > 0) {
    minP = growwData.categories[0].minPrice || 0;
    maxP = growwData.categories[0].maxPrice || 0;
  }

  return {
    companyName: growwData.companyName,
    searchId: growwData.searchId, // Extracted for deep crawling
    expectedListingDate,
    status,
    fundamentals: {
      issueSize: growwData.issueSize ? `₹${(growwData.issueSize / 10000000).toFixed(2)} Cr` : 'TBA',
      priceBand: minP && maxP ? `₹${minP} - ₹${maxP}` : 'TBA',
      subscriptionStatus: growwData.overallSubscription ? `${growwData.overallSubscription.toFixed(2)}x` : 'N/A',
      gmp: 'TBA'
    },
    expertTake: {
      tag: 'Neutral',
      remarks: 'Awaiting expert analysis post-DRHP review. Automated tracking initiated via Groww.'
    }
  };
}

async function scrapeGroww() {
  console.log(`📡 Fetching baseline data from: ${TARGET_URL}...`);
  try {
    const { data: html } = await axios.get(TARGET_URL);
    const $ = cheerio.load(html);
    const nextDataStr = $('#__NEXT_DATA__').html();
    
    if (!nextDataStr) {
      console.log('⚠️ Failed to find any data: __NEXT_DATA__ tag missing.');
      process.exit(0);
    }

    const nextData = JSON.parse(nextDataStr);
    const openDataList = nextData.props?.pageProps?.openDataList || [];
    const upcomingDataList = nextData.props?.pageProps?.upcomingDataList || [];
    const listedDataList = nextData.props?.pageProps?.listedDataList || [];

    let baselineListings = [];

    openDataList.forEach(ipo => baselineListings.push(formatBaselineData(ipo, 'Active')));
    upcomingDataList.forEach(ipo => baselineListings.push(formatBaselineData(ipo, 'Upcoming')));
    // For saving time during demonstrations we will only deep crawl Active and Upcoming, but you can enable Listed too
    listedDataList.slice(0, 5).forEach(ipo => baselineListings.push(formatBaselineData(ipo, 'Listed'))); 

    console.log(`✅ Extracted ${baselineListings.length} baseline IPOs. Initiating Deep Crawl for textual details...`);
    
    let enrichedListings = [];
    for (const base of baselineListings) {
        // Deep Crawl Phase
        const detailedPayload = await fetchDetailedData(base.searchId);
        
        // Remove searchId as it's not in our final Firestore typing
        delete base.searchId; 

        if (detailedPayload) {
            base.extendedDetails = detailedPayload;
        }

        enrichedListings.push(base);
        // Sleep 0.5 seconds to be polite to the target server
        await sleep(500); 
    }
    
    if (enrichedListings.length === 0) {
      console.log('⚠️ Failed to find any valid records inside the data streams.');
    } else {
      await saveToDatabase(enrichedListings);
    }
  } catch (error) {
    console.error('❌ Scraper failed:', error.message);
  }
}

async function saveToDatabase(listings) {
  console.log('💾 Resolving duplicates and updating Firestore directly...');
  const iposCollection = collection(db, 'ipos');

  let addedCount = 0;
  let updatedCount = 0;

  for (const listing of listings) {
    const q = query(iposCollection, where('companyName', '==', listing.companyName));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await addDoc(iposCollection, listing);
      addedCount++;
    } else {
      const existingDoc = snapshot.docs[0];
      
      // Update with extended details if they differ (or overwrite safely)
      const updatePayload = {
        status: listing.status,
        'fundamentals.subscriptionStatus': listing.fundamentals.subscriptionStatus,
        'fundamentals.priceBand': listing.fundamentals.priceBand
      };

      if (listing.extendedDetails) {
         updatePayload.extendedDetails = listing.extendedDetails;
      }

      await updateDoc(doc(db, 'ipos', existingDoc.id), updatePayload);
      updatedCount++;
    }
  }

  console.log(`🎉 Database Update Complete!`);
  console.log(`   - Brought total   : ${listings.length}`);
  console.log(`   - Newly added     : ${addedCount}`);
  console.log(`   - Duplicates fixed: ${updatedCount} (Updated successfully with Deep Details)`);
  
  process.exit(0);
}

scrapeGroww();
