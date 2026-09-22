'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, PanelLeftClose, Bell, Search, Plus, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { sellerApi, type SellerProfile, type SellerNotification } from '@/lib/seller-api';


interface Props {
  onToggleSidebar: () => void;
  onMobileMenuOpen: () => void;
  sidebarCollapsed: boolean;
}

export default function DashboardTopbar({ onToggleSidebar, onMobileMenuOpen, sidebarCollapsed }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [profile,setProfile]=useState<SellerProfile|null>(null);
  const [notifications,setNotifications]=useState<(SellerNotification&{time:string;unread:boolean})[]>([]);
  useEffect(()=>{sellerApi.profile().then(setProfile).catch(()=>{});sellerApi.notifications().then(x=>setNotifications(x.slice(0,5).map(n=>({...n,time:new Date(n.createdAt).toLocaleString('en-IN'),unread:!n.read})))).catch(()=>{})},[]);

  useEffect(() => {
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
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="hidden lg:flex p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150"
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <PanelLeftClose size={18} className={`transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
      </button>
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all duration-150"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Seller</span>
        <span className="text-border">/</span>
        <span className="font-semibold text-foreground">Overview</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-sm hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm text-muted-foreground cursor-pointer hover:border-ring transition-colors duration-150">
        <Search size={15} />
        <span>Search orders, listings...</span>
        <span className="ml-auto text-xs bg-border px-1.5 py-0.5 rounded font-mono">⌘K</span>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Create listing CTA */}
        <button className="hidden sm:flex btn-primary py-2 text-xs gap-1.5">
          <Plus size={14} />
          New Listing
        </button>

        <ThemeToggle compact />

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-white text-xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-card border border-border rounded-2xl shadow-card-lg z-50 overflow-hidden animate-fade-in-up">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-semibold text-foreground text-sm">Notifications</span>
                <span className="badge-danger text-xs">{unreadCount} new</span>
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors duration-100 cursor-pointer ${
                      n.unread ? 'bg-secondary/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                      <div className={`${!n.unread ? 'pl-3.5' : ''}`}>
                        <p className="text-xs text-foreground leading-relaxed">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-border">
                <button className="text-xs text-primary font-semibold hover:underline w-full text-center">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-muted transition-all duration-150"
          >
            <div className="w-7 h-7 rounded-full gradient-card-green flex items-center justify-center text-white font-bold text-xs">
              {(profile?.primaryContact||'S').charAt(0)}
            </div>
            <span className="hidden sm:block text-sm font-medium text-foreground">{profile?.primaryContact?.split(' ')[0]||'Seller'}</span>
            <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-card border border-border rounded-xl shadow-card-lg z-50 overflow-hidden animate-fade-in-up">
              <div className="px-4 py-3 border-b border-border">
                <div className="font-semibold text-foreground text-sm">{profile?.primaryContact||'Seller'}</div>
                <div className="text-xs text-muted-foreground">{profile?.contactEmail||profile?.email||''}</div>
              </div>
              {[
                { icon: User, label: 'Business Profile' },
                { icon: Settings, label: 'Settings' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`profile-menu-${item.label}`}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors duration-100"
                  >
                    <Icon size={15} className="text-muted-foreground" />
                    {item.label}
                  </button>
                );
              })}
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
