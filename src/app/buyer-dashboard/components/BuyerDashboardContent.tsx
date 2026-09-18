'use client';

import React, { useState } from 'react';
import BuyerOverviewSection from './BuyerOverviewSection';
import UCOSearchSection from './UCOSearchSection';
import ListingDetailsSection from './ListingDetailsSection';
import ActiveOrdersSection from './ActiveOrdersSection';
import PurchaseHistorySection from './PurchaseHistorySection';
import BuyerAccountSection from './BuyerAccountSection';
import BuyerListingsSection from './BuyerListingsSection';
import BuyerHomeSection from './BuyerHomeSection';
import type { UCOMarketListing } from '@/lib/buyer-api';
import BuyerOrderCreationSection from './BuyerOrderCreationSection';
import BuyerOrdersTrackingSection from './BuyerOrdersTrackingSection';
import PaymentConfirmationSection from './PaymentConfirmationSection';
import PaymentMethodSection from './PaymentMethodSection';
import BuyerEarningsSection from './BuyerEarningsSection';
import BuyerBusinessProfileSection from './BuyerBusinessProfileSection';
import BuyerPickupsSection from './BuyerPickupsSection';
import BuyerSustainabilitySection from './BuyerSustainabilitySection';
import BuyerSettingsSection from './BuyerSettingsSection';
import NotificationsSection from '@/app/seller-dashboard/components/NotificationsSection';
import BuyerDocumentsSection from './BuyerDocumentsSection';
import InvoicesSection from '@/app/seller-dashboard/components/InvoicesSection';
import ReportsSection from '@/app/seller-dashboard/components/ReportsSection';

import BuyerVerificationSection from './BuyerVerificationSection';

interface Props {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export default function BuyerDashboardContent({ activeSection, onNavigate }: Props) {
  const [selectedListing, setSelectedListing] = useState<UCOMarketListing | null>(null);

  const handleViewListing = (listing: UCOMarketListing) => {
    setSelectedListing(listing);
    onNavigate('listing-details');
  };

  const handleBackToSearch = () => {
    setSelectedListing(null);
    onNavigate('search');
  };

  const handleRequestSuccess = () => {
    setSelectedListing(null);
    onNavigate('orders');
  };

  const sectionMap: Record<string, React.ReactNode> = {
    home: <BuyerHomeSection onNavigate={onNavigate} />,
    overview: <BuyerOverviewSection onNavigate={onNavigate} />,
    listings: <BuyerListingsSection onViewListing={handleViewListing} />,
    search: <UCOSearchSection onViewListing={handleViewListing} />,
    'listing-details': selectedListing ? (
      <ListingDetailsSection
        listing={selectedListing}
        onBack={handleBackToSearch}
        onRequestSuccess={handleRequestSuccess}
      />
    ) : (
      <UCOSearchSection onViewListing={handleViewListing} />
    ),
    orders: <ActiveOrdersSection />,
    'my-orders': <BuyerOrdersTrackingSection />,
    history: <PurchaseHistorySection />,
    account: <BuyerAccountSection />,
    profile: <BuyerBusinessProfileSection />,
    verification: <BuyerVerificationSection />,
    documents: <BuyerDocumentsSection />,
    pickups: <BuyerPickupsSection />,
    payments: <PaymentMethodSection onNavigate={onNavigate} />,
    invoices: <InvoicesSection />,
    notifications: <NotificationsSection />,
    reports: <ReportsSection />,
    sustainability: <BuyerSustainabilitySection />,
    settings: <BuyerSettingsSection />,
    'create-order': <BuyerOrderCreationSection onNavigate={onNavigate} />,
    'payment-method': <PaymentMethodSection onNavigate={onNavigate} />,
    'payment-confirmation': <PaymentConfirmationSection onNavigate={onNavigate} />,
    'buyer-earnings': <BuyerEarningsSection />,
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-6">
      {sectionMap[activeSection] || <BuyerOverviewSection onNavigate={onNavigate} />}
    </div>
  );
}
