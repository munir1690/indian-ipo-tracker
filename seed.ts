import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { MOCK_IPOS } from './constants/MockData';

const PULSE_UPDATES = [
  {
    id: '1',
    title: 'SEBI Guidelines impact on upcoming Tech IPOs',
    date: '2026-02-28T10:00:00Z',
    content: 'The new SEBI guidelines emphasize stricter disclosure norms around use of proceeds. We expect a slight delay in the DRHP filings for mid-tier tech firms as they restructure their offering models. Overall, this brings more transparency and is a huge positive for retail investors looking to invest in SaaS companies.'
  },
  {
    id: '2',
    title: 'GreenEnergy Solutions: Avoid or Subscribe?',
    date: '2026-02-25T14:30:00Z',
    content: 'With GreenEnergy Solutions hitting the market tomorrow, the grey market premium has dipped into the negative. A close look at their shrinking margins vs peers suggests the valuation is stretched. Alpha recommendation: **Avoid** for listing gains, only consider for a 5+ year horizon.',
    relatedIpoId: '2'
  },
  {
    id: '3',
    title: 'Blockbuster Listing expected for Fintech Bank',
    date: '2026-02-20T09:15:00Z',
    content: 'The 45x oversubscription shows immense institutional confidence. Expect at least a 25% pop on listing day. If you bagged an allotment, hold for the first earnings quarter as net interest margins are expected to expand.',
    relatedIpoId: '3'
  },
  {
    id: '4',
    title: 'Data Center thematic shows extreme momentum',
    date: '2026-02-18T16:45:00Z',
    content: 'Following the global AI craze, anything remotely connected to Data Centers is seeing huge gray market premiums. We are monitoring DataCenter Realty closely. Even at high valuation multiples, the structural uptrend is too strong to ignore.',
    relatedIpoId: '18'
  }
];

export async function seedFirestore() {
  console.log('Starting Firestore seed...');

  try {
    // 3. Clear existing Pulse
    const pulseSnapshot = await getDocs(collection(db, 'pulse'));
    console.log(`Clearing ${pulseSnapshot.size} existing Pulse updates...`);
    for (const d of pulseSnapshot.docs) {
      await deleteDoc(doc(db, 'pulse', d.id));
    }

    // 4. Add Pulse
    console.log('Adding Pulse updates...');
    for (const post of PULSE_UPDATES) {
      await addDoc(collection(db, 'pulse'), post);
    }

    console.log('Firestore seed complete! 🎉');
  } catch (error) {
    console.error('Error seeding Firestore:', error);
  }
}
