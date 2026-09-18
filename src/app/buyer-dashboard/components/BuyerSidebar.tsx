'use client';

import React, { useEffect, useState } from 'react';
import { buyerApi, BuyerProfile } from '@/lib/buyer-api';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  Home,
  Building2,
  ShieldCheck,
  FileText,
  Search,
  ShoppingCart,
  Truck,
  CreditCard,
  Receipt,
  Bell,
  BarChart3,
  Leaf,
  Settings,
  ChevronLeft,
  X,
  History,
  UserCircle,
  ListFilter,
  PlusCircle,
  ClipboardList,
  Banknote,
  Wallet,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  group: string;
}

const navItems: NavItem[] = [
  { id: 'home', icon: Home, label: 'Home', group: 'main' },
  { id: 'overview', icon: LayoutDashboard, label: 'Overview', group: 'main' },
  { id: 'account', icon: UserCircle, label: 'Buyer Account', group: 'main' },
  { id: 'profile', icon: Building2, label: 'Business Profile', group: 'main' },
  { id: 'verification', icon: ShieldCheck, label: 'Verification', group: 'main' },
  { id: 'documents', icon: FileText, label: 'Documents', group: 'main' },
  { id: 'listings', icon: ListFilter, label: 'Browse Listings', badge: 8, group: 'procurement' },
  { id: 'create-order', icon: PlusCircle, label: 'Create Order', group: 'procurement' },
  { id: 'search', icon: Search, label: 'Search UCO', group: 'procurement' },
  { id: 'orders', icon: ShoppingCart, label: 'Active Orders', badge: 3, group: 'procurement' },
  { id: 'my-orders', icon: ClipboardList, label: 'My Orders', group: 'procurement' },
  { id: 'history', icon: History, label: 'Purchase History', group: 'procurement' },
  { id: 'pickups', icon: Truck, label: 'Pickups', group: 'procurement' },
  { id: 'payment-method', icon: Banknote, label: 'Pay for Order', group: 'finance' },
  { id: 'payments', icon: CreditCard, label: 'Payments', group: 'finance' },
  { id: 'buyer-earnings', icon: Wallet, label: 'Earnings & Payouts', group: 'finance' },
  { id: 'invoices', icon: Receipt, label: 'Invoices', group: 'finance' },
  { id: 'notifications', icon: Bell, label: 'Notifications', badge: 4, group: 'finance' },
  { id: 'reports', icon: BarChart3, label: 'Reports', group: 'insights' },
  { id: 'sustainability', icon: Leaf, label: 'Sustainability', group: 'insights' },
  { id: 'settings', icon: Settings, label: 'Settings', group: 'system' },
];

const groupLabels: Record<string, string> = {
  main: 'Account',
  procurement: 'Procurement',
  finance: 'Finance',
  insights: 'Insights',
  system: 'System',
};

interface Props {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  activeSection: string;
  onNavigate: (id: string) => void;
}

export default function BuyerSidebar({ collapsed, mobileOpen, onMobileClose, activeSection, onNavigate }: Props) {
  const [profile,setProfile]=useState<BuyerProfile|null>(null);
  useEffect(()=>{buyerApi.profile().then(setProfile).catch(()=>{});},[]);
  const groups = [...new Set(navItems.map((n) => n.group))];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-2.5 px-4 py-4 border-b border-border flex-shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <AppLogo size={32} />
        {!collapsed && <span className="font-extrabold text-lg text-foreground">TUCOR</span>}
      </div>

      {!collapsed && (
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              A
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground truncate">{profile?.fullName || 'Buyer'}</div>
              <div className="text-xs text-muted-foreground truncate">{profile?.businessName || ''}</div>
            </div>
            <span className="badge-active text-xs flex-shrink-0">{profile?.status === 'ACTIVE' ? 'Verified' : 'Pending'}</span>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {groups.map((group) => {
          const items = navItems.filter((n) => n.group === group);
          return (
            <div key={`buyer-nav-group-${group}`} className="mb-4">
              {!collapsed && (
                <div className="px-3 py-1 text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1">
                  {groupLabels[group]}
                </div>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={`buyer-sidebar-nav-${item.id}`}
                    onClick={() => onNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 relative ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold' :'text-muted-foreground hover:bg-muted hover:text-foreground'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="text-sm flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border px-2 py-3 flex-shrink-0">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 text-sm ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Back to Home' : undefined}
        >
          <ChevronLeft size={18} className="flex-shrink-0" />
          {!collapsed && <span>Back to Home</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className={`hidden lg:flex flex-col bg-card border-r border-border flex-shrink-0 transition-sidebar overflow-hidden ${collapsed ? 'w-16' : 'w-60'}`}>
        {sidebarContent}
      </aside>
      <aside className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute top-4 right-4">
          <button onClick={onMobileClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors duration-150">
            <X size={18} />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
