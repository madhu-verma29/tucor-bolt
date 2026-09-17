'use client';

import React, { useState } from 'react';
import { CheckCircle2, Truck, CreditCard, ShieldCheck, AlertTriangle, Info, X, CheckCheck, Filter, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


interface Notification {
  id: string;
  type: 'payment' | 'pickup' | 'order' | 'verification' | 'alert' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: 'n1', type: 'payment', title: 'Payment Settled', message: 'Payment of ₹14,300 for order ORD-2026-0174 has been settled to your bank account.', time: '2 hours ago', read: false },
  { id: 'n2', type: 'pickup', title: 'Pickup Scheduled', message: 'Agent Rajan Mehta will collect 310L of Sunflower UCO on Sep 12, 2026 between 9–11 AM.', time: '5 hours ago', read: false },
  { id: 'n3', type: 'order', title: 'New Buyer Request', message: 'A buyer has requested 220L of Mustard UCO from listing LST-2026-0033. Review and respond.', time: '1 day ago', read: false },
  { id: 'n4', type: 'verification', title: 'Listing Verified', message: 'Listing LST-2026-0021 (Soybean, 390L) has passed quality verification and is now Active.', time: '2 days ago', read: true },
  { id: 'n5', type: 'alert', title: 'Listing Expiring Soon', message: 'Listing LST-2026-0025 (Palm, 180L) expired. Renew it to attract buyers.', time: '3 days ago', read: true },
  { id: 'n6', type: 'payment', title: 'Payment Processing', message: 'Payment of ₹6,720 for order ORD-2026-0162 is being processed. Expected by Sep 22.', time: '4 days ago', read: true },
  { id: 'n7', type: 'system', title: 'Platform Update', message: 'TUCOR has updated its UCO quality grading standards. Review the new guidelines in your documents.', time: '5 days ago', read: true },
  { id: 'n8', type: 'order', title: 'Order Confirmed', message: 'Order ORD-2026-0162 (Palm, 240L) has been confirmed by buyer BYR-****-9015.', time: '6 days ago', read: true },
  { id: 'n9', type: 'pickup', title: 'Pickup Completed', message: 'Pickup PKP-2026-0081 completed. 648L of Blended UCO collected. Volume confirmed.', time: '1 week ago', read: true },
  { id: 'n10', type: 'system', title: 'Monthly Report Ready', message: 'Your August 2026 collection report is ready. Download it from the Reports section.', time: '2 weeks ago', read: true },
];

const typeConfig = {
  payment: { icon: CreditCard, color: 'text-success', bg: 'bg-success-bg' },
  pickup: { icon: Truck, color: 'text-info', bg: 'bg-info-bg' },
  order: { icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10' },
  verification: { icon: ShieldCheck, color: 'text-success', bg: 'bg-success-bg' },
  alert: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning-bg' },
  system: { icon: Info, color: 'text-muted-foreground', bg: 'bg-muted' },
};

type FilterType = 'all' | 'unread' | Notification['type'];

export default function NotificationsSection() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<FilterType>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification dismissed');
  };

  const filterTabs: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: `Unread (${unreadCount})` },
    { id: 'payment', label: 'Payments' },
    { id: 'pickup', label: 'Pickups' },
    { id: 'order', label: 'Orders' },
    { id: 'alert', label: 'Alerts' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Alerts, reminders, and platform updates
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary py-2 text-xs gap-1.5">
            <CheckCheck size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={`notif-filter-${tab.id}`}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              filter === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="card p-16 flex flex-col items-center justify-center text-center gap-3">
            <Inbox size={40} className="text-muted-foreground/40" />
            <div>
              <p className="font-semibold text-foreground">No notifications</p>
              <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          </div>
        ) : (
          filtered.map((notif) => {
            const cfg = typeConfig[notif.type];
            const Icon = cfg.icon;
            return (
              <div
                key={`notif-${notif.id}`}
                className={`card p-4 flex items-start gap-4 transition-all duration-150 ${
                  !notif.read ? 'border-primary/30 bg-primary/5' : ''
                }`}
                onClick={() => markRead(notif.id)}
              >
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon size={16} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${!notif.read ? 'text-foreground' : 'text-foreground/80'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{notif.time}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                        className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors duration-150"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
