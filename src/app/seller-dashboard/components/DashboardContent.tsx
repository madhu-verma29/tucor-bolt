'use client';

import React from 'react';
import OverviewSection from './OverviewSection';
import ListingsSection from './ListingsSection';
import OrdersSection from './OrdersSection';
import PickupsSection from './PickupsSection';
import PaymentsSection from './PaymentsSection';
import SustainabilityDashboard from './SustainabilityDashboard';
import SellerAccountSection from './SellerAccountSection';
import RequestManagementSection from './RequestManagementSection';
import CreateListingSection from './CreateListingSection';
import SellerEarningsSection from './SellerEarningsSection';
import NotificationsSection from './NotificationsSection';
import DocumentsSection from './DocumentsSection';
import InvoicesSection from './InvoicesSection';
import ReportsSection from './ReportsSection';
import SettingsSection from './SettingsSection';

import BusinessProfileSection from './BusinessProfileSection';
import SellerVerificationSection from './SellerVerificationSection';

interface Props {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export default function DashboardContent({ activeSection, onNavigate }: Props) {
  const sectionMap: Record<string, React.ReactNode> = {
    overview: <OverviewSection onNavigate={onNavigate} />,
    listings: <ListingsSection />,
    'create-listing': <CreateListingSection onBack={() => onNavigate('listings')} />,
    orders: <OrdersSection />,
    requests: <RequestManagementSection />,
    pickups: <PickupsSection />,
    payments: <PaymentsSection />,
    earnings: <SellerEarningsSection />,
    sustainability: <SustainabilityDashboard />,
    account: <SellerAccountSection />,
    profile: <BusinessProfileSection />,
    verification: <SellerVerificationSection />,
    documents: <DocumentsSection />,
    invoices: <InvoicesSection />,
    notifications: <NotificationsSection />,
    reports: <ReportsSection />,
    settings: <SettingsSection />,
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-6">
      {sectionMap[activeSection] || <OverviewSection onNavigate={onNavigate} />}
    </div>
  );
}