'use client';

import React, { useState } from 'react';
import BuyerSidebar from './BuyerSidebar';
import BuyerTopbar from './BuyerTopbar';
import BuyerDashboardContent from './BuyerDashboardContent';

export default function BuyerDashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <BuyerSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <BuyerTopbar
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          onMobileMenuOpen={() => setMobileSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onNavigate={setActiveSection}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <BuyerDashboardContent activeSection={activeSection} onNavigate={setActiveSection} />
        </main>
      </div>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
}
