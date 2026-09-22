'use client';

import React, { useEffect, useState } from 'react';
import { Search, Download, ScrollText, User, Building2, ShieldCheck, ShoppingCart, CreditCard, AlertTriangle, Settings } from 'lucide-react';
import { adminApi, type AdminAuditLog as AuditLog } from '@/lib/admin-api';
import { toast } from 'sonner';

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
  const [auditData,setAuditData]=useState<AuditLog[]>([]);
  useEffect(()=>{adminApi.auditLogs().then(setAuditData).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load audit logs'));},[]);

  const filtered = auditData.filter((log) => {
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
          <p className="text-sm text-muted-foreground mt-0.5">Complete platform activity trail · {auditData.length} recent entries</p>
        </div>
        <button onClick={()=>adminApi.exportAudit().catch(e=>toast.error(e instanceof Error?e.message:'Export failed'))} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground hover:bg-muted/80 transition-colors duration-150">
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Info Events', count: auditData.filter((l) => l.severity === 'Info').length, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Warnings', count: auditData.filter((l) => l.severity === 'Warning').length, color: 'text-amber-600', bg: 'bg-amber-500/10' },
          { label: 'Critical', count: auditData.filter((l) => l.severity === 'Critical').length, color: 'text-red-600', bg: 'bg-red-500/10' },
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
          <span className="text-xs text-muted-foreground">Showing {filtered.length} of {auditData.length} entries</span>
          <button className="text-xs text-primary font-semibold hover:underline">Load more</button>
        </div>
      </div>
    </div>
  );
}
