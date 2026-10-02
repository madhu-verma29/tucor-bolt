'use client';

import React, { useState, useEffect } from 'react';
import {useRouter} from 'next/navigation';
import {getSession,dashboardFor} from '@/lib/auth-api';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import AdminContent from './AdminContent';

export default function AdminDashboardLayout() {
  const router=useRouter();const [authorized,setAuthorized]=useState(false);useEffect(()=>{const session=getSession();if(!session)router.replace('/sign-up-login');else if(session.role!=='ADMIN')router.replace(dashboardFor(session.role));else setAuthorized(true)},[router]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  if(!authorized)return null;
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          onMobileMenuOpen={() => setMobileSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          activeSection={activeSection}
          onNavigate={setActiveSection}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <AdminContent activeSection={activeSection} onNavigate={setActiveSection} />
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
