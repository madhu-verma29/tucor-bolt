'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Truck, CreditCard, ShieldCheck, AlertTriangle, Info, X, CheckCheck, Filter, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { sellerApi } from '@/lib/seller-api';


interface Notification {
  id: string;
  type: 'payment' | 'pickup' | 'order' | 'verification' | 'alert' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  useEffect(()=>{sellerApi.notifications().then(items=>setNotifications(items.map(n=>({...n,time:new Date(n.createdAt).toLocaleString('en-IN')})))).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load notifications'))},[]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const markAllRead = async () => {
    try{await sellerApi.markAllNotificationsRead();setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));toast.success('All notifications marked as read')}catch(e){toast.error(e instanceof Error?e.message:'Unable to update notifications')}
  };

  const markRead = async (id: string) => {
    const item=notifications.find(n=>n.id===id);if(!item||item.read)return;try{await sellerApi.markNotificationRead(id);setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))}catch{}
  };

  const dismiss = async (id: string) => {
    try{await sellerApi.dismissNotification(id);setNotifications((prev) => prev.filter((n) => n.id !== id));toast.success('Notification dismissed')}catch(e){toast.error(e instanceof Error?e.message:'Unable to dismiss notification')}
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
