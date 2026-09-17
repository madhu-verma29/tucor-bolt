// BACKEND INTEGRATION: Replace all exports with API calls to Java/Spring Boot backend
// Base URL: process.env.NEXT_PUBLIC_API_BASE_URL

export interface UCOMarketListing {
  id: string;
  oilType: 'Palm' | 'Sunflower' | 'Mustard' | 'Blended' | 'Soybean';
  volumeLiters: number;
  gradeLabel: 'A' | 'B' | 'C';
  pricePerLiter: number;
  status: 'Available' | 'Limited' | 'Reserved';
  city: string;
  state: string;
  region: string;
  collectionFrequency: 'Weekly' | 'Bi-weekly' | 'Monthly';
  availableFrom: string;
  sellerRef: string; // anonymized
  qualityNotes?: string;
  moistureContent?: string;
  acidValue?: string;
  ffa?: string;
  iodineValue?: string;
  listingDate: string;
  minOrderLiters: number;
}

export interface BuyerOrder {
  id: string;
  listingId: string;
  oilType: string;
  volumeLiters: number;
  pricePerLiter: number;
  totalAmount: number;
  status:
    | 'Requested' |'Under Review' |'Matched' |'Confirmed' |'Pickup Scheduled' |'Picked Up' |'Delivered' |'Payment' |'Settled' |'Completed' |'Cancelled' |'Rejected' |'Disputed';
  createdAt: string;
  updatedAt: string;
  sellerRef: string; // anonymized
  pickupDate?: string;
  deliveryDate?: string;
  paymentDue?: string;
  city: string;
  gradeLabel: 'A' | 'B' | 'C';
  invoiceNumber?: string;
  notes?: string;
}

export interface BuyerPayment {
  id: string;
  orderId: string;
  amount: number;
  status: 'Pending' | 'Processing' | 'Settled' | 'Failed' | 'Disputed';
  dueDate: string;
  settledDate?: string;
  reference: string;
  invoiceNumber: string;
}

export const mockMarketListings: UCOMarketListing[] = [
  {
    id: 'LST-2026-0041',
    oilType: 'Palm',
    volumeLiters: 480,
    gradeLabel: 'A',
    pricePerLiter: 28,
    status: 'Available',
    city: 'Mumbai',
    state: 'Maharashtra',
    region: 'West India',
    collectionFrequency: 'Weekly',
    availableFrom: '2026-09-12',
    sellerRef: 'SEL-****-0041',
    qualityNotes: 'Filtered, stored in sealed drums. Consistent quality from cloud kitchen operations.',
    moistureContent: '< 0.1%',
    acidValue: '2.4 mg KOH/g',
    ffa: '1.2%',
    iodineValue: '52',
    listingDate: '2026-09-01',
    minOrderLiters: 100,
  },
  {
    id: 'LST-2026-0038',
    oilType: 'Sunflower',
    volumeLiters: 310,
    gradeLabel: 'A',
    pricePerLiter: 31,
    status: 'Limited',
    city: 'Pune',
    state: 'Maharashtra',
    region: 'West India',
    collectionFrequency: 'Bi-weekly',
    availableFrom: '2026-09-14',
    sellerRef: 'SEL-****-0038',
    qualityNotes: 'Premium grade sunflower UCO from hotel chain. Consistent supply.',
    moistureContent: '< 0.05%',
    acidValue: '1.8 mg KOH/g',
    ffa: '0.9%',
    iodineValue: '128',
    listingDate: '2026-09-02',
    minOrderLiters: 150,
  },
  {
    id: 'LST-2026-0033',
    oilType: 'Mustard',
    volumeLiters: 220,
    gradeLabel: 'B',
    pricePerLiter: 24,
    status: 'Available',
    city: 'Delhi',
    state: 'Delhi',
    region: 'North India',
    collectionFrequency: 'Weekly',
    availableFrom: '2026-09-10',
    sellerRef: 'SEL-****-0033',
    qualityNotes: 'Mustard UCO from restaurant chain. Good quality, suitable for biodiesel.',
    moistureContent: '< 0.2%',
    acidValue: '3.1 mg KOH/g',
    ffa: '1.6%',
    iodineValue: '98',
    listingDate: '2026-08-28',
    minOrderLiters: 100,
  },
  {
    id: 'LST-2026-0029',
    oilType: 'Blended',
    volumeLiters: 650,
    gradeLabel: 'B',
    pricePerLiter: 22,
    status: 'Available',
    city: 'Bengaluru',
    state: 'Karnataka',
    region: 'South India',
    collectionFrequency: 'Monthly',
    availableFrom: '2026-09-20',
    sellerRef: 'SEL-****-0029',
    qualityNotes: 'Blended UCO from multiple food service outlets. Bulk availability.',
    moistureContent: '< 0.3%',
    acidValue: '3.8 mg KOH/g',
    ffa: '1.9%',
    iodineValue: '74',
    listingDate: '2026-08-25',
    minOrderLiters: 200,
  },
  {
    id: 'LST-2026-0021',
    oilType: 'Soybean',
    volumeLiters: 390,
    gradeLabel: 'A',
    pricePerLiter: 33,
    status: 'Available',
    city: 'Hyderabad',
    state: 'Telangana',
    region: 'South India',
    collectionFrequency: 'Bi-weekly',
    availableFrom: '2026-09-16',
    sellerRef: 'SEL-****-0021',
    qualityNotes: 'Premium soybean UCO from QSR chain. Excellent for biodiesel feedstock.',
    moistureContent: '< 0.08%',
    acidValue: '2.0 mg KOH/g',
    ffa: '1.0%',
    iodineValue: '132',
    listingDate: '2026-09-07',
    minOrderLiters: 100,
  },
  {
    id: 'LST-2026-0018',
    oilType: 'Sunflower',
    volumeLiters: 270,
    gradeLabel: 'A',
    pricePerLiter: 30,
    status: 'Available',
    city: 'Chennai',
    state: 'Tamil Nadu',
    region: 'South India',
    collectionFrequency: 'Weekly',
    availableFrom: '2026-09-11',
    sellerRef: 'SEL-****-0018',
    qualityNotes: 'High-quality sunflower UCO from hotel group. Filtered and tested.',
    moistureContent: '< 0.06%',
    acidValue: '1.9 mg KOH/g',
    ffa: '0.95%',
    iodineValue: '125',
    listingDate: '2026-09-03',
    minOrderLiters: 100,
  },
  {
    id: 'LST-2026-0015',
    oilType: 'Palm',
    volumeLiters: 820,
    gradeLabel: 'B',
    pricePerLiter: 25,
    status: 'Available',
    city: 'Kolkata',
    state: 'West Bengal',
    region: 'East India',
    collectionFrequency: 'Monthly',
    availableFrom: '2026-09-25',
    sellerRef: 'SEL-****-0015',
    qualityNotes: 'Large volume palm UCO from industrial canteen network.',
    moistureContent: '< 0.25%',
    acidValue: '3.5 mg KOH/g',
    ffa: '1.75%',
    iodineValue: '55',
    listingDate: '2026-09-05',
    minOrderLiters: 300,
  },
  {
    id: 'LST-2026-0012',
    oilType: 'Mustard',
    volumeLiters: 160,
    gradeLabel: 'A',
    pricePerLiter: 27,
    status: 'Limited',
    city: 'Ahmedabad',
    state: 'Gujarat',
    region: 'West India',
    collectionFrequency: 'Bi-weekly',
    availableFrom: '2026-09-13',
    sellerRef: 'SEL-****-0012',
    qualityNotes: 'Premium mustard UCO from fine dining restaurant. Limited stock.',
    moistureContent: '< 0.1%',
    acidValue: '2.2 mg KOH/g',
    ffa: '1.1%',
    iodineValue: '102',
    listingDate: '2026-09-06',
    minOrderLiters: 80,
  },
];

export const mockBuyerOrders: BuyerOrder[] = [
  {
    id: 'ORD-2026-0201',
    listingId: 'LST-2026-0041',
    oilType: 'Palm',
    volumeLiters: 480,
    pricePerLiter: 28,
    totalAmount: 13440,
    status: 'Pickup Scheduled',
    createdAt: '2026-09-06',
    updatedAt: '2026-09-08',
    sellerRef: 'SEL-****-0041',
    pickupDate: '2026-09-12',
    paymentDue: '2026-09-19',
    city: 'Mumbai',
    gradeLabel: 'A',
    invoiceNumber: 'INV-2026-0201',
  },
  {
    id: 'ORD-2026-0195',
    listingId: 'LST-2026-0021',
    oilType: 'Soybean',
    volumeLiters: 390,
    pricePerLiter: 33,
    totalAmount: 12870,
    status: 'Confirmed',
    createdAt: '2026-09-04',
    updatedAt: '2026-09-07',
    sellerRef: 'SEL-****-0021',
    pickupDate: '2026-09-16',
    paymentDue: '2026-09-23',
    city: 'Hyderabad',
    gradeLabel: 'A',
  },
  {
    id: 'ORD-2026-0188',
    listingId: 'LST-2026-0033',
    oilType: 'Mustard',
    volumeLiters: 220,
    pricePerLiter: 24,
    totalAmount: 5280,
    status: 'Under Review',
    createdAt: '2026-09-08',
    updatedAt: '2026-09-08',
    sellerRef: 'SEL-****-0033',
    city: 'Delhi',
    gradeLabel: 'B',
    notes: 'Requested 220L — open to partial fulfillment of min 150L',
  },
  {
    id: 'ORD-2026-0174',
    listingId: 'LST-2026-0029',
    oilType: 'Blended',
    volumeLiters: 650,
    pricePerLiter: 22,
    totalAmount: 14300,
    status: 'Completed',
    createdAt: '2026-08-12',
    updatedAt: '2026-09-01',
    sellerRef: 'SEL-****-0029',
    pickupDate: '2026-08-20',
    deliveryDate: '2026-08-22',
    paymentDue: '2026-08-27',
    city: 'Bengaluru',
    gradeLabel: 'B',
    invoiceNumber: 'INV-2026-0174',
  },
  {
    id: 'ORD-2026-0162',
    listingId: 'LST-2026-0018',
    oilType: 'Sunflower',
    volumeLiters: 270,
    pricePerLiter: 30,
    totalAmount: 8100,
    status: 'Settled',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-20',
    sellerRef: 'SEL-****-0018',
    pickupDate: '2026-08-08',
    deliveryDate: '2026-08-10',
    paymentDue: '2026-08-17',
    city: 'Chennai',
    gradeLabel: 'A',
    invoiceNumber: 'INV-2026-0162',
  },
  {
    id: 'ORD-2026-0148',
    listingId: 'LST-2026-0038',
    oilType: 'Sunflower',
    volumeLiters: 310,
    pricePerLiter: 31,
    totalAmount: 9610,
    status: 'Completed',
    createdAt: '2026-07-15',
    updatedAt: '2026-08-05',
    sellerRef: 'SEL-****-0038',
    pickupDate: '2026-07-22',
    deliveryDate: '2026-07-24',
    paymentDue: '2026-07-31',
    city: 'Pune',
    gradeLabel: 'A',
    invoiceNumber: 'INV-2026-0148',
  },
  {
    id: 'ORD-2026-0131',
    listingId: 'LST-2026-0041',
    oilType: 'Palm',
    volumeLiters: 240,
    pricePerLiter: 28,
    totalAmount: 6720,
    status: 'Cancelled',
    createdAt: '2026-07-01',
    updatedAt: '2026-07-05',
    sellerRef: 'SEL-****-0041',
    city: 'Mumbai',
    gradeLabel: 'A',
    notes: 'Cancelled — logistics unavailable for the scheduled date',
  },
];

export const mockBuyerPayments: BuyerPayment[] = [
  {
    id: 'PAY-2026-0201',
    orderId: 'ORD-2026-0201',
    amount: 13440,
    status: 'Pending',
    dueDate: '2026-09-19',
    reference: 'TUCOR-REF-20101',
    invoiceNumber: 'INV-2026-0201',
  },
  {
    id: 'PAY-2026-0174',
    orderId: 'ORD-2026-0174',
    amount: 14300,
    status: 'Settled',
    dueDate: '2026-08-27',
    settledDate: '2026-08-26',
    reference: 'TUCOR-REF-17401',
    invoiceNumber: 'INV-2026-0174',
  },
  {
    id: 'PAY-2026-0162',
    orderId: 'ORD-2026-0162',
    amount: 8100,
    status: 'Settled',
    dueDate: '2026-08-17',
    settledDate: '2026-08-16',
    reference: 'TUCOR-REF-16201',
    invoiceNumber: 'INV-2026-0162',
  },
  {
    id: 'PAY-2026-0148',
    orderId: 'ORD-2026-0148',
    amount: 9610,
    status: 'Settled',
    dueDate: '2026-07-31',
    settledDate: '2026-07-30',
    reference: 'TUCOR-REF-14801',
    invoiceNumber: 'INV-2026-0148',
  },
];

export const buyerProfile = {
  id: 'BYR-2026-0099',
  businessName: 'BioFuel India Pvt. Ltd.',
  ownerName: 'Arjun Mehta',
  email: 'arjun@biofuelindia.com',
  phone: '+91 98765 43210',
  gstNumber: '27AABCB1234C1ZD',
  businessType: 'Biodiesel Manufacturer',
  address: 'Plot 14, MIDC Industrial Area, Taloja, Navi Mumbai – 410208',
  verificationStatus: 'Verified',
  verifiedAt: '2026-02-20',
  memberSince: '2025-10-15',
  totalUCOSourced: 8640,
  totalSpend: 224820,
  co2OffsetKg: 12096,
  ordersCompleted: 52,
};
