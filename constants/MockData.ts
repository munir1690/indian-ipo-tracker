import { IPOListing } from '../types';

export const MOCK_IPOS: IPOListing[] = [
  {
    id: '1',
    companyName: 'TechCorp India Ltd',
    expectedListingDate: '2026-03-15T00:00:00Z',
    status: 'Upcoming',
    expertTake: { tag: 'Bull', remarks: 'Strong anchor book and reasonable valuation. Clear path to profitability.' },
    fundamentals: { issueSize: '₹1,500 Cr', priceBand: '₹450 - ₹475', subscriptionStatus: 'N/A', gmp: '+15%' }
  },
  {
    id: '2',
    companyName: 'GreenEnergy Solutions',
    expectedListingDate: '2026-03-05T00:00:00Z',
    status: 'Active',
    expertTake: { tag: 'Bear', remarks: 'Aggressively priced in a competitive sector with shrinking margins.' },
    fundamentals: { issueSize: '₹800 Cr', priceBand: '₹120 - ₹125', subscriptionStatus: '2.5x', gmp: '-5%' }
  },
  {
    id: '3',
    companyName: 'Fintech Bank',
    expectedListingDate: '2026-03-01T00:00:00Z',
    status: 'Listed',
    expertTake: { tag: 'Bull', remarks: 'Listed at a healthy premium. Hold for first earnings quarter.' },
    fundamentals: { issueSize: '₹3,200 Cr', priceBand: '₹200 - ₹210', subscriptionStatus: '45x', gmp: '+25%' }
  },
  {
    id: '4',
    companyName: 'AeroSpace Dynamics',
    expectedListingDate: '2026-03-18T00:00:00Z',
    status: 'Upcoming',
    expertTake: { tag: 'Bull', remarks: 'Niche sector monopoly with massive defense contracts pipeline.' },
    fundamentals: { issueSize: '₹2,100 Cr', priceBand: '₹850 - ₹890', subscriptionStatus: 'N/A', gmp: '+30%' }
  },
  {
    id: '5',
    companyName: 'HealthPlus Pharmacy',
    expectedListingDate: '2026-03-06T00:00:00Z',
    status: 'Active',
    expertTake: { tag: 'Neutral', remarks: 'Steady cash flows but growth is plateauing. Fairly valued.' },
    fundamentals: { issueSize: '₹950 Cr', priceBand: '₹340 - ₹355', subscriptionStatus: '1.2x', gmp: '+2%' }
  },
  {
    id: '6',
    companyName: 'Urban Logistics Co',
    expectedListingDate: '2026-02-20T00:00:00Z',
    status: 'Listed',
    expertTake: { tag: 'Bear', remarks: 'Poor post-listing performance due to rising fuel costs impacting EBITDA.' },
    fundamentals: { issueSize: '₹1,100 Cr', priceBand: '₹180 - ₹195', subscriptionStatus: '4.5x', gmp: '-8%' }
  },
  {
    id: '7',
    companyName: 'NextGen AI Technologies',
    expectedListingDate: '2026-03-25T00:00:00Z',
    status: 'Upcoming',
    expertTake: { tag: 'Bull', remarks: 'High growth SaaS model. Extremely high GMP indicates strong listing gains.' },
    fundamentals: { issueSize: '₹4,500 Cr', priceBand: '₹1100 - ₹1150', subscriptionStatus: 'N/A', gmp: '+45%' }
  },
  {
    id: '8',
    companyName: 'Pure Water Infra',
    expectedListingDate: '2026-03-07T00:00:00Z',
    status: 'Active',
    expertTake: { tag: 'Bull', remarks: 'Government push for water infrastructure provides strong tailwinds.' },
    fundamentals: { issueSize: '₹600 Cr', priceBand: '₹75 - ₹82', subscriptionStatus: '12x', gmp: '+18%' }
  },
  {
    id: '9',
    companyName: 'Bharat Auto Components',
    expectedListingDate: '2026-04-10T00:00:00Z',
    status: 'Upcoming',
    expertTake: { tag: 'Neutral', remarks: 'Dependent on EV transition speed. Valuation seems slightly stretched.' },
    fundamentals: { issueSize: '₹1,800 Cr', priceBand: '₹410 - ₹430', subscriptionStatus: 'N/A', gmp: '+5%' }
  },
  {
    id: '10',
    companyName: 'CloudSecure Networks',
    expectedListingDate: '2026-02-15T00:00:00Z',
    status: 'Listed',
    expertTake: { tag: 'Bull', remarks: 'Consistent quarter-on-quarter growth. Cybersecurity is a structural theme.' },
    fundamentals: { issueSize: '₹2,500 Cr', priceBand: '₹600 - ₹620', subscriptionStatus: '85x', gmp: '+60%' }
  },
  {
    id: '11',
    companyName: 'SmartHome Appliances',
    expectedListingDate: '2026-03-08T00:00:00Z',
    status: 'Active',
    expertTake: { tag: 'Bear', remarks: 'High inventory levels and fierce competition from global brands.' },
    fundamentals: { issueSize: '₹1,200 Cr', priceBand: '₹250 - ₹265', subscriptionStatus: '0.8x', gmp: '-2%' }
  },
  {
    id: '12',
    companyName: 'Quantum Computing Ltd',
    expectedListingDate: '2026-05-15T00:00:00Z',
    status: 'Upcoming',
    expertTake: { tag: 'Bull', remarks: 'First mover advantage in deep tech. Expect massive oversubscription.' },
    fundamentals: { issueSize: '₹5,000 Cr', priceBand: '₹2500 - ₹2600', subscriptionStatus: 'N/A', gmp: '+80%' }
  },
  {
    id: '13',
    companyName: 'AgriTech Solutions',
    expectedListingDate: '2026-03-12T00:00:00Z',
    status: 'Upcoming',
    expertTake: { tag: 'Neutral', remarks: 'Dependent on monsoons. Good long-term play but listing gains might be muted.' },
    fundamentals: { issueSize: '₹400 Cr', priceBand: '₹110 - ₹115', subscriptionStatus: 'N/A', gmp: '+3%' }
  },
  {
    id: '14',
    companyName: 'Cineplex Entertainment',
    expectedListingDate: '2026-02-10T00:00:00Z',
    status: 'Listed',
    expertTake: { tag: 'Bear', remarks: 'OTT platforms remain a significant threat to long term footfalls.' },
    fundamentals: { issueSize: '₹850 Cr', priceBand: '₹300 - ₹315', subscriptionStatus: '2.1x', gmp: '-10%' }
  },
  {
    id: '15',
    companyName: 'EduTech Masterclass',
    expectedListingDate: '2026-03-09T00:00:00Z',
    status: 'Active',
    expertTake: { tag: 'Neutral', remarks: 'Customer acquisition costs are high, but brand recall is strong.' },
    fundamentals: { issueSize: '₹3,000 Cr', priceBand: '₹750 - ₹780', subscriptionStatus: '3.5x', gmp: '+8%' }
  },
  {
    id: '16',
    companyName: 'MegaMarts Retail',
    expectedListingDate: '2026-04-22T00:00:00Z',
    status: 'Upcoming',
    expertTake: { tag: 'Bull', remarks: 'Aggressive store expansion plan and solid same-store sales growth.' },
    fundamentals: { issueSize: '₹4,200 Cr', priceBand: '₹500 - ₹525', subscriptionStatus: 'N/A', gmp: '+20%' }
  },
  {
    id: '17',
    companyName: 'Renewable Power Corp',
    expectedListingDate: '2026-01-25T00:00:00Z',
    status: 'Listed',
    expertTake: { tag: 'Bull', remarks: 'Delivering on expanding capacity. Strong dividend yield expected.' },
    fundamentals: { issueSize: '₹6,000 Cr', priceBand: '₹150 - ₹160', subscriptionStatus: '30x', gmp: '+35%' }
  },
  {
    id: '18',
    companyName: 'DataCenter Realty',
    expectedListingDate: '2026-03-30T00:00:00Z',
    status: 'Upcoming',
    expertTake: { tag: 'Bull', remarks: 'High demand for AI data centers makes this a prime real estate tech play.' },
    fundamentals: { issueSize: '₹2,800 Cr', priceBand: '₹880 - ₹910', subscriptionStatus: 'N/A', gmp: '+40%' }
  },
  {
    id: '19',
    companyName: 'MicroFinance Trust',
    expectedListingDate: '2026-03-11T00:00:00Z',
    status: 'Active',
    expertTake: { tag: 'Bear', remarks: 'Asset quality concerns in key geographies. Avoid.' },
    fundamentals: { issueSize: '₹700 Cr', priceBand: '₹220 - ₹235', subscriptionStatus: '0.9x', gmp: '-6%' }
  },
  {
    id: '20',
    companyName: 'PetCare India',
    expectedListingDate: '2026-04-05T00:00:00Z',
    status: 'Upcoming',
    expertTake: { tag: 'Neutral', remarks: 'Niche market with high margins, but overall addressable market is small.' },
    fundamentals: { issueSize: '₹350 Cr', priceBand: '₹180 - ₹190', subscriptionStatus: 'N/A', gmp: '+5%' }
  }
];
