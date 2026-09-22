'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, PanelLeftClose, Bell, Search, ChevronDown, LogOut, Settings, Shield } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import { adminApi, type AdminNotification, type AdminProfile } from '@/lib/admin-api';

interface Props {
  onToggleSidebar: () => void;
  onMobileMenuOpen: () => void;
  sidebarCollapsed: boolean;
  activeSection: string;
}

const sectionLabels: Record<string, string> = {
  overview: 'Overview',
  users: 'Users',
  businesses: 'Businesses',
  verification: 'Verification',
  documents: 'Documents',
  listings: 'Listings',
  orders: 'Orders',
  pickups: 'Pickups',
  payments: 'Payments',
  disputes: 'Disputes',
  reports: 'Reports',
  'audit-logs': 'Audit Logs',
  settings: 'Settings',
};

export default function AdminTopbar({ onToggleSidebar, onMobileMenuOpen, sidebarCollapsed, activeSection }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications,setNotifications]=useState<AdminNotification[]>([]);
  const [adminProfile,setAdminProfile]=useState<AdminProfile|null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([adminApi.notifications(),adminApi.profile()]).then(([n,p])=>{setNotifications(n);setAdminProfile(p)}).catch(()=>{});
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-14 bg-card border-b border-border flex items-center gap-3 px-4 flex-shrink-0 z-30">
      <button
        onClick={onToggleSidebar}
        className="hidden lg:flex p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150"
      >
        <PanelLeftClose size={18} className={`transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
      </button>
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all duration-150"
      >
        <Menu size={18} />
      </button>

      <div className="hidden sm:flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Admin</span>
        <span className="text-border">/</span>
        <span className="font-semibold text-foreground">{sectionLabels[activeSection] || 'Overview'}</span>
      </div>

      <div className="flex-1 max-w-sm hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm text-muted-foreground cursor-pointer hover:border-ring transition-colors duration-150">
        <Search size={15} />
        <span>Search users, orders, disputes...</span>
        <span className="ml-auto text-xs bg-border px-1.5 py-0.5 rounded font-mono">⌘K</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 font-semibold">
          <Shield size={13} />
          Admin Mode
        </div>

        <ThemeToggle compact />

        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-card border border-border rounded-2xl shadow-card-lg z-50 overflow-hidden animate-fade-in-up">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-semibold text-foreground text-sm">Admin Alerts</span>
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 font-semibold">{unreadCount} new</span>
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors duration-100 cursor-pointer ${n.unread ? 'bg-amber-500/5' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />}
                      <div className={!n.unread ? 'pl-3.5' : ''}>
                        <p className="text-xs text-foreground leading-relaxed">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-border">
                <button className="text-xs text-primary font-semibold hover:underline w-full text-center">
                  View all alerts
                </button>
              </div>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-muted transition-all duration-150"
          >
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 font-bold text-xs">
              A
            </div>
            <span className="hidden sm:block text-sm font-medium text-foreground">{adminProfile?.name||'Admin'}</span>
            <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-card border border-border rounded-xl shadow-card-lg z-50 overflow-hidden animate-fade-in-up">
              <div className="px-4 py-3 border-b border-border">
                <div className="font-semibold text-foreground text-sm">{adminProfile?.name||'Admin User'}</div>
                <div className="text-xs text-muted-foreground">{adminProfile?.email||''}</div>
              </div>
              <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors duration-100">
                <Settings size={15} className="text-muted-foreground" />
                Settings
              </button>
              <div className="border-t border-border">
                <Link
                  href="/sign-up-login"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger-bg transition-colors duration-100"
                >
                  <LogOut size={15} />
                  Sign Out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
