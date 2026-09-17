'use client';

import React from 'react';
import AdminOverviewSection from './AdminOverviewSection';
import AdminUsersSection from './AdminUsersSection';
import AdminBusinessesSection from './AdminBusinessesSection';
import AdminVerificationSection from './AdminVerificationSection';
import AdminOrdersSection from './AdminOrdersSection';
import AdminDisputesSection from './AdminDisputesSection';
import AdminAuditLogsSection from './AdminAuditLogsSection';
import AdminListingsSection from './AdminListingsSection';
import AdminPickupsSection from './AdminPickupsSection';
import AdminPaymentsSection from './AdminPaymentsSection';
import AdminReportsSection from './AdminReportsSection';
import AdminSettingsSection from './AdminSettingsSection';

import AdminDocumentsSection from './AdminDocumentsSection';

interface Props {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export default function AdminContent({ activeSection, onNavigate }: Props) {
  const sectionMap: Record<string, React.ReactNode> = {
    overview: <AdminOverviewSection onNavigate={onNavigate} />,
    users: <AdminUsersSection />,
    businesses: <AdminBusinessesSection />,
    verification: <AdminVerificationSection />,
    orders: <AdminOrdersSection />,
    disputes: <AdminDisputesSection />,
    'audit-logs': <AdminAuditLogsSection />,
    documents: <AdminDocumentsSection />,
    listings: <AdminListingsSection />,
    pickups: <AdminPickupsSection />,
    payments: <AdminPaymentsSection />,
    reports: <AdminReportsSection />,
    settings: <AdminSettingsSection />,
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-6">
      {sectionMap[activeSection] || <AdminOverviewSection onNavigate={onNavigate} />}
    </div>
  );
}
