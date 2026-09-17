import React from 'react';
import { ThemeProvider } from '@/lib/theme-provider';
import DashboardLayout from '@/app/seller-dashboard/components/DashboardLayout';

export default function SellerDashboardPage() {
  return (
    <ThemeProvider>
      <DashboardLayout />
    </ThemeProvider>
  );
}