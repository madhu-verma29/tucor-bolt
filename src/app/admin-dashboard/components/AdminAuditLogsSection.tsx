'use client';

import React, { useState } from 'react';
import { Search, Download, ScrollText, User, Building2, ShieldCheck, ShoppingCart, CreditCard, AlertTriangle, Settings } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: 'Admin' | 'System' | 'Seller' | 'Buyer';
  action: string;
  module: 'Users' | 'Businesses' | 'Verification' | 'Orders' | 'Payments' | 'Disputes' | 'Settings' | 'System';
  target: string;
  targetId: string;
  ipAddress: string;
  severity: 'Info' | 'Warning' | 'Critical';
  details: string;
}

const mockAuditLogs: AuditLog[] = [
  { id: 'LOG-2026-0891', timestamp: '2026-09-10 06:14:22', actor: 'Admin User', actorRole: 'Admin', action: 'Business Approved', module: 'Businesses', target: 'EcoRecycle Corp', targetId: 'BIZ-007', ipAddress: '103.21.45.12', severity: 'Info', details: 'Business verification approved after document review' },
  { id: 'LOG-2026-0890', timestamp: '2026-09-10 05:58:11', actor: 'Admin User', actorRole: 'Admin', action: 'Dispute Escalated', module: 'Disputes', target: 'DSP-2026-0012', targetId: 'DSP-2026-0012', ipAddress: '103.21.45.12', severity: 'Warning', details: 'Dispute escalated to senior review — quality dispute unresolved' },
  { id: 'LOG-2026-0889', timestamp: '2026-09-10 05:32:44', actor: 'System', actorRole: 'System', action: 'Batch Settlement Processed', module: 'Payments', target: 'Settlement Batch #48', targetId: 'BATCH-048', ipAddress: '10.0.0.1', severity: 'Info', details: '₹4,20,000 settled across 12 orders' },
  { id: 'LOG-2026-0888', timestamp: '2026-09-10 04:45:09', actor: 'Admin User', actorRole: 'Admin', action: 'User Suspended', module: 'Users', target: 'Vikram Patel', targetId: 'USR-006', ipAddress: '103.21.45.12', severity: 'Critical', details: 'Account suspended due to repeated policy violations' },
  { id: 'LOG-2026-0887', timestamp: '2026-09-10 03:22:31', actor: 'System', actorRole: 'System', action: 'Order Auto-Matched', module: 'Orders', target: 'ORD-2026-0201', targetId: 'ORD-2026-0201', ipAddress: '10.0.0.1', severity: 'Info', details: 'Order matched by TUCOR algorithm — seller and buyer criteria met' },
  { id: 'LOG-2026-0886', timestamp: '2026-09-09 22:18:55', actor: 'Priya Nambiar', actorRole: 'Seller', action: 'Listing Created', module: 'Orders', target: 'LST-2026-0089', targetId: 'LST-2026-0089', ipAddress: '49.32.11.88', severity: 'Info', details: 'New UCO listing created — 480L Palm Grade A' },
  { id: 'LOG-2026-0885', timestamp: '2026-09-09 20:44:17', actor: 'Admin User', actorRole: 'Admin', action: 'Verification Rejected', module: 'Verification', target: 'Sunrise Restaurants', targetId: 'VRF-2026-0036', ipAddress: '103.21.45.12', severity: 'Warning', details: 'FSSAI license expired — verification rejected, resubmission requested' },
  { id: 'LOG-2026-0884', timestamp: '2026-09-09 18:30:02', actor: 'Arjun Mehta', actorRole: 'Buyer', action: 'Order Requested', module: 'Orders', target: 'ORD-2026-0200', targetId: 'ORD-2026-0200', ipAddress: '122.45.67.89', severity: 'Info', details: 'Buyer requested 310L Sunflower UCO through TUCOR' },
  { id: 'LOG-2026-0883', timestamp: '2026-09-09 16:12:44', actor: 'System', actorRole: 'System', action: 'Verification Reminder Sent', module: 'System', target: 'CloudKitchen Co.', targetId: 'BIZ-003', ipAddress: '10.0.0.1', severity: 'Info', details: 'Automated reminder sent for pending verification documents' },
  { id: 'LOG-2026-0882', timestamp: '2026-09-09 14:05:33', actor: 'Admin User', actorRole: 'Admin', action: 'Settings Updated', module: 'Settings', target: 'Platform Config', targetId: 'CONFIG-001', ipAddress: '103.21.45.12', severity: 'Warning', details: 'Verification threshold updated from 3 to 4 documents required' },
  { id: 'LOG-2026-0881', timestamp: '2026-09-09 11:48:19', actor: 'System', actorRole: 'System', action: 'Dispute Auto-Flagged', module: 'Disputes', target: 'ORD-2026-0198', targetId: 'ORD-2026-0198', ipAddress: '10.0.0.1', severity: 'Warning', details: 'Order flagged for quality dispute — seller raised concern' },
  { id: 'LOG-2026-0880', timestamp: '2026-09-09 09:22:07', actor: 'Admin User', actorRole: 'Admin', action: 'User Approved', module: 'Users', target: 'Deepa Krishnan', targetId: 'USR-005', ipAddress: '103.21.45.12', severity: 'Info', details: 'New seller account approved after KYC verification' },
];

const moduleIcons: Record<string, React.ElementType> = {
  Users: User,
  Businesses: Building2,
  Verification: ShieldCheck,
  Orders: ShoppingCart,
  Payments: CreditCard,
  Disputes: AlertTriangle,
  Settings: Settings,
  System: ScrollText,
};

const severityColors: Record<string, string> = {
  Info: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  Warning: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  Critical: 'bg-red-500/10 text-red-600 border-red-500/30',
};

const actorRoleColors: Record<string, string> = {
  Admin: 'text-amber-600',
  System: 'text-blue-500',
  Seller: 'text-primary',
  Buyer: 'text-indigo-500',
};

export default function AdminAuditLogsSection() {
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');

  const filtered = mockAuditLogs.filter((log) => {
    const matchSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.targetId.toLowerCase().includes(search.toLowerCase());
    const matchModule = filterModule === 'All' || log.module === filterModule;
    const matchSeverity = filterSeverity === 'All' || log.severity === filterSeverity;
    return matchSearch && matchModule && matchSeverity;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Complete platform activity trail · {mockAuditLogs.length} recent entries</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground hover:bg-muted/80 transition-colors duration-150">
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Info Events', count: mockAuditLogs.filter((l) => l.severity === 'Info').length, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Warnings', count: mockAuditLogs.filter((l) => l.severity === 'Warning').length, color: 'text-amber-600', bg: 'bg-amber-500/10' },
          { label: 'Critical', count: mockAuditLogs.filter((l) => l.severity === 'Critical').length, color: 'text-red-600', bg: 'bg-red-500/10' },
        ].map((stat) => (
          <div key={stat.label} className={`card p-4 ${stat.bg}`}>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm flex-1 min-w-48">
          <Search size={15} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search action, actor, target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-foreground placeholder:text-muted-foreground outline-none w-full text-sm"
          />
        </div>
        <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)} className="px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground outline-none cursor-pointer">
          <option value="All">All Modules</option>
          {['Users', 'Businesses', 'Verification', 'Orders', 'Payments', 'Disputes', 'Settings', 'System'].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground outline-none cursor-pointer">
          <option value="All">All Severity</option>
          <option value="Info">Info</option>
          <option value="Warning">Warning</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Module</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Target</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Severity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const ModuleIcon = moduleIcons[log.module] || ScrollText;
                return (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors duration-100 group">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-foreground">{log.timestamp.split(' ')[1]}</div>
                      <div className="text-xs text-muted-foreground">{log.timestamp.split(' ')[0]}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-xs font-semibold ${actorRoleColors[log.actorRole]}`}>{log.actor}</div>
                      <div className="text-xs text-muted-foreground">{log.actorRole}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-foreground">{log.action}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 max-w-48 truncate hidden lg:block">{log.details}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ModuleIcon size={12} />
                        {log.module}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="text-xs text-foreground">{log.target}</div>
                      <div className="font-mono text-xs text-muted-foreground">{log.targetId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${severityColors[log.severity]}`}>{log.severity}</span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No audit logs match your filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Showing {filtered.length} of {mockAuditLogs.length} entries</span>
          <button className="text-xs text-primary font-semibold hover:underline">Load more</button>
        </div>
      </div>
    </div>
  );
}
