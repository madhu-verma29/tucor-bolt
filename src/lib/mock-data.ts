// BACKEND INTEGRATION: Replace all exports with API calls to Java/Spring Boot backend
// Base URL: process.env.NEXT_PUBLIC_API_BASE_URL

export interface UCOListing {
  id: string;
  oilType: 'Palm' | 'Sunflower' | 'Mustard' | 'Blended' | 'Soybean';
  volumeLiters: number;
  gradeLabel: 'A' | 'B' | 'C';
  pricePerLiter: number;
  status: 'Draft' | 'Pending Verification' | 'Active' | 'Matched' | 'Completed' | 'Expired';
  location: string;
  createdAt: string;
  updatedAt: string;
  collectionFrequency: 'Weekly' | 'Bi-weekly' | 'Monthly';
  notes?: string;
}

export interface Order {
  id: string;
  listingId: string;
  oilType: string;
  volumeLiters: number;
  totalAmount: number;
  status:
    | 'Requested' |'Under Review' |'Matched' |'Confirmed' |'Pickup Scheduled' |'Picked Up' |'Delivered' |'Payment' |'Settled' |'Completed' |'Cancelled' |'Rejected' |'Disputed';
  createdAt: string;
  updatedAt: string;
  buyerRef: string; // anonymized
  pickupDate?: string;
  paymentDue?: string;
}

export interface Pickup {
  id: string;
  orderId: string;
  scheduledDate: string;
  status: 'Pending' | 'Scheduled' | 'Assigned' | 'In Transit' | 'Picked Up' | 'Completed';
  agentName: string;
  vehicleNumber: string;
  volumeConfirmed?: number;
  notes?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: 'Pending' | 'Processing' | 'Settled' | 'Failed' | 'Disputed';
  dueDate: string;
  settledDate?: string;
  reference: string;
  invoiceNumber: string;
}

export interface SustainabilityMetric {
  month: string;
  ucoCollectedLiters: number;
  co2OffsetKg: number;
  collectionsCount: number;
}

export const mockListings: UCOListing[] = [
  {
    id: 'LST-2026-0041',
    oilType: 'Palm',
    volumeLiters: 480,
    gradeLabel: 'A',
    pricePerLiter: 28,
    status: 'Active',
    location: 'Andheri West, Mumbai',
    createdAt: '2026-08-15',
    updatedAt: '2026-09-01',
    collectionFrequency: 'Weekly',
    notes: 'Filtered, stored in sealed drums',
  },
  {
    id: 'LST-2026-0038',
    oilType: 'Sunflower',
    volumeLiters: 310,
    gradeLabel: 'A',
    pricePerLiter: 31,
    status: 'Matched',
    location: 'Andheri West, Mumbai',
    createdAt: '2026-08-02',
    updatedAt: '2026-09-05',
    collectionFrequency: 'Bi-weekly',
  },
  {
    id: 'LST-2026-0033',
    oilType: 'Mustard',
    volumeLiters: 220,
    gradeLabel: 'B',
    pricePerLiter: 24,
    status: 'Active',
    location: 'Andheri West, Mumbai',
    createdAt: '2026-07-20',
    updatedAt: '2026-08-28',
    collectionFrequency: 'Weekly',
  },
  {
    id: 'LST-2026-0029',
    oilType: 'Blended',
    volumeLiters: 650,
    gradeLabel: 'B',
    pricePerLiter: 22,
    status: 'Completed',
    location: 'Andheri West, Mumbai',
    createdAt: '2026-07-01',
    updatedAt: '2026-08-10',
    collectionFrequency: 'Monthly',
  },
  {
    id: 'LST-2026-0025',
    oilType: 'Palm',
    volumeLiters: 180,
    gradeLabel: 'C',
    pricePerLiter: 18,
    status: 'Expired',
    location: 'Andheri West, Mumbai',
    createdAt: '2026-06-10',
    updatedAt: '2026-07-10',
    collectionFrequency: 'Weekly',
    notes: 'Listing expired — renew to activate',
  },
  {
    id: 'LST-2026-0021',
    oilType: 'Soybean',
    volumeLiters: 390,
    gradeLabel: 'A',
    pricePerLiter: 33,
    status: 'Pending Verification',
    location: 'Andheri West, Mumbai',
    createdAt: '2026-09-07',
    updatedAt: '2026-09-07',
    collectionFrequency: 'Bi-weekly',
    notes: 'Awaiting TUCOR quality verification',
  },
  {
    id: 'LST-2026-0018',
    oilType: 'Sunflower',
    volumeLiters: 270,
    gradeLabel: 'A',
    pricePerLiter: 30,
    status: 'Active',
    location: 'Andheri West, Mumbai',
    createdAt: '2026-09-03',
    updatedAt: '2026-09-08',
    collectionFrequency: 'Weekly',
  },
  {
    id: 'LST-2026-0014',
    oilType: 'Mustard',
    volumeLiters: 145,
    gradeLabel: 'B',
    pricePerLiter: 25,
    status: 'Draft',
    location: 'Andheri West, Mumbai',
    createdAt: '2026-09-08',
    updatedAt: '2026-09-08',
    collectionFrequency: 'Monthly',
    notes: 'Draft — complete details to publish',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-2026-0187',
    listingId: 'LST-2026-0038',
    oilType: 'Sunflower',
    volumeLiters: 310,
    totalAmount: 9610,
    status: 'Pickup Scheduled',
    createdAt: '2026-09-05',
    updatedAt: '2026-09-08',
    buyerRef: 'BYR-****-7821',
    pickupDate: '2026-09-12',
    paymentDue: '2026-09-19',
  },
  {
    id: 'ORD-2026-0174',
    listingId: 'LST-2026-0029',
    oilType: 'Blended',
    volumeLiters: 650,
    totalAmount: 14300,
    status: 'Settled',
    createdAt: '2026-08-12',
    updatedAt: '2026-09-01',
    buyerRef: 'BYR-****-4432',
    pickupDate: '2026-08-20',
    paymentDue: '2026-08-27',
  },
  {
    id: 'ORD-2026-0162',
    listingId: 'LST-2026-0041',
    oilType: 'Palm',
    volumeLiters: 240,
    totalAmount: 6720,
    status: 'Confirmed',
    createdAt: '2026-09-01',
    updatedAt: '2026-09-07',
    buyerRef: 'BYR-****-9015',
    pickupDate: '2026-09-15',
    paymentDue: '2026-09-22',
  },
  {
    id: 'ORD-2026-0149',
    listingId: 'LST-2026-0033',
    oilType: 'Mustard',
    volumeLiters: 220,
    totalAmount: 5280,
    status: 'Under Review',
    createdAt: '2026-09-08',
    updatedAt: '2026-09-08',
    buyerRef: 'BYR-****-3307',
  },
  {
    id: 'ORD-2026-0138',
    listingId: 'LST-2026-0029',
    oilType: 'Blended',
    volumeLiters: 200,
    totalAmount: 4400,
    status: 'Completed',
    createdAt: '2026-07-15',
    updatedAt: '2026-08-05',
    buyerRef: 'BYR-****-6618',
    pickupDate: '2026-07-22',
  },
];

export const mockPickups: Pickup[] = [
  {
    id: 'PKP-2026-0094',
    orderId: 'ORD-2026-0187',
    scheduledDate: '2026-09-12',
    status: 'Scheduled',
    agentName: 'Rajan Mehta',
    vehicleNumber: 'MH-04-CX-7721',
    notes: 'Arrive between 9 AM – 11 AM',
  },
  {
    id: 'PKP-2026-0089',
    orderId: 'ORD-2026-0162',
    scheduledDate: '2026-09-15',
    status: 'Assigned',
    agentName: 'Suresh Pillai',
    vehicleNumber: 'MH-01-BK-4490',
  },
  {
    id: 'PKP-2026-0081',
    orderId: 'ORD-2026-0174',
    scheduledDate: '2026-08-20',
    status: 'Completed',
    agentName: 'Anil Sharma',
    vehicleNumber: 'MH-02-GH-3312',
    volumeConfirmed: 648,
    notes: 'Minor spillage — 2L variance noted',
  },
];

export const mockPayments: Payment[] = [
  {
    id: 'PAY-2026-0071',
    orderId: 'ORD-2026-0187',
    amount: 9610,
    status: 'Pending',
    dueDate: '2026-09-19',
    reference: 'TUCOR-REF-78210',
    invoiceNumber: 'INV-2026-0071',
  },
  {
    id: 'PAY-2026-0065',
    orderId: 'ORD-2026-0162',
    amount: 6720,
    status: 'Processing',
    dueDate: '2026-09-22',
    reference: 'TUCOR-REF-90151',
    invoiceNumber: 'INV-2026-0065',
  },
  {
    id: 'PAY-2026-0058',
    orderId: 'ORD-2026-0174',
    amount: 14300,
    status: 'Settled',
    dueDate: '2026-08-27',
    settledDate: '2026-08-26',
    reference: 'TUCOR-REF-44320',
    invoiceNumber: 'INV-2026-0058',
  },
  {
    id: 'PAY-2026-0047',
    orderId: 'ORD-2026-0138',
    amount: 4400,
    status: 'Settled',
    dueDate: '2026-08-05',
    settledDate: '2026-08-04',
    reference: 'TUCOR-REF-66180',
    invoiceNumber: 'INV-2026-0047',
  },
];

export const mockSustainabilityTimeline: SustainabilityMetric[] = [
  { month: 'Oct', ucoCollectedLiters: 680, co2OffsetKg: 952, collectionsCount: 4 },
  { month: 'Nov', ucoCollectedLiters: 820, co2OffsetKg: 1148, collectionsCount: 5 },
  { month: 'Dec', ucoCollectedLiters: 590, co2OffsetKg: 826, collectionsCount: 3 },
  { month: 'Jan', ucoCollectedLiters: 1050, co2OffsetKg: 1470, collectionsCount: 6 },
  { month: 'Feb', ucoCollectedLiters: 940, co2OffsetKg: 1316, collectionsCount: 5 },
  { month: 'Mar', ucoCollectedLiters: 1180, co2OffsetKg: 1652, collectionsCount: 7 },
  { month: 'Apr', ucoCollectedLiters: 870, co2OffsetKg: 1218, collectionsCount: 5 },
  { month: 'May', ucoCollectedLiters: 1340, co2OffsetKg: 1876, collectionsCount: 8 },
  { month: 'Jun', ucoCollectedLiters: 1120, co2OffsetKg: 1568, collectionsCount: 6 },
  { month: 'Jul', ucoCollectedLiters: 980, co2OffsetKg: 1372, collectionsCount: 6 },
  { month: 'Aug', ucoCollectedLiters: 1480, co2OffsetKg: 2072, collectionsCount: 9 },
  { month: 'Sep', ucoCollectedLiters: 648, co2OffsetKg: 907, collectionsCount: 3 },
];

export const mockOilTypeBreakdown = [
  { oilType: 'Palm', liters: 2840, color: 'var(--chart-1)' },
  { oilType: 'Sunflower', liters: 2190, color: 'var(--chart-2)' },
  { oilType: 'Mustard', liters: 1430, color: 'var(--chart-3)' },
  { oilType: 'Blended', liters: 1850, color: 'var(--chart-4)' },
  { oilType: 'Soybean', liters: 340, color: 'var(--chart-5)' },
];

export const sellerProfile = {
  id: 'SEL-2026-0041',
  businessName: 'Spice Route Cloud Kitchens Pvt. Ltd.',
  ownerName: 'Priya Nambiar',
  email: 'priya@spiceroute.in',
  phone: '+91 98204 51733',
  gstNumber: '27AABCS1429B1ZB',
  fssaiNumber: 'FSS-MH-2024-08812',
  businessType: 'Cloud Kitchen',
  address: 'Unit 4B, Andheri Industrial Estate, Andheri West, Mumbai – 400053',
  verificationStatus: 'Verified',
  verifiedAt: '2026-03-14',
  memberSince: '2025-11-20',
  totalUCOCollected: 10650,
  totalEarnings: 278400,
  co2OffsetKg: 14910,
  collectionsCompleted: 67,
};