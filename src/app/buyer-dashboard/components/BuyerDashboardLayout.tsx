'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, clearSession, dashboardFor, getSession, saveSession } from '@/lib/auth-api';
import BuyerSidebar from './BuyerSidebar';
import BuyerTopbar from './BuyerTopbar';
import BuyerDashboardContent from './BuyerDashboardContent';

export default function BuyerDashboardLayout() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => { let active=true; (async()=>{ const session=getSession(); if(!session){router.replace('/sign-up-login');return;} if(session.role!=='BUYER'){router.replace(dashboardFor(session.role));return;} try{await authApi.me(session.accessToken); if(active)setAuthorized(true);}catch{try{const fresh=await authApi.refresh(session.refreshToken); saveSession(fresh,!!localStorage.getItem('tucor.auth')); if(fresh.role!=='BUYER'){router.replace(dashboardFor(fresh.role));return;} if(active)setAuthorized(true);}catch{clearSession();router.replace('/sign-up-login');}}})(); return()=>{active=false}; },[router]);

  if (!authorized) return null;

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
