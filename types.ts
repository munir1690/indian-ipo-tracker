export interface IPOListing {
  id: string;
  companyName: string;
  logoUrl?: string;
  expectedListingDate: string;
  status: 'Upcoming' | 'Active' | 'Listed';
  fundamentals: {
    issueSize: string;
    priceBand: string;
    subscriptionStatus: string;
    gmp: string;
  };
  expertTake: {
    tag: 'Bull' | 'Bear' | 'Neutral';
    remarks: string;
  };
  extendedDetails?: {
    aboutCompany?: string;
    pros?: string[];
    cons?: string[];
    subscriptionRates?: {
      qib?: string;
      nii?: string;
      retail?: string;
      total?: string;
    };
  };
}

export interface MarketUpdate {
  id: string;
  title: string;
  date: string; // ISO string
  content: string; // Markdown formatted text
  relatedIpoId?: string; // Optional property linking a pulse post to a specific IPO
}
