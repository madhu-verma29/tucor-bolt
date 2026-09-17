'use client';

import React, { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, UserCheck, UserX, Mail, Phone } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Seller' | 'Buyer';
  status: 'Active' | 'Pending' | 'Suspended' | 'Rejected';
  business: string;
  joinedAt: string;
  lastActive: string;
  verified: boolean;
}

const mockUsers: User[] = [
  { id: 'USR-001', name: 'Priya Nambiar', email: 'priya@spiceroute.in', phone: '+91 98201 34567', role: 'Seller', status: 'Active', business: 'Spice Route Kitchens', joinedAt: '2026-03-12', lastActive: '2026-09-10', verified: true },
  { id: 'USR-002', name: 'Arjun Mehta', email: 'arjun@biofuelindia.com', phone: '+91 97301 22456', role: 'Buyer', status: 'Active', business: 'BioFuel India Ltd.', joinedAt: '2026-02-08', lastActive: '2026-09-09', verified: true },
  { id: 'USR-003', name: 'Kavitha Reddy', email: 'kavitha@cloudkitchen.co', phone: '+91 96401 11345', role: 'Seller', status: 'Pending', business: 'CloudKitchen Co.', joinedAt: '2026-09-05', lastActive: '2026-09-05', verified: false },
  { id: 'USR-004', name: 'Rahul Sharma', email: 'rahul@greenenergy.in', phone: '+91 95501 00234', role: 'Buyer', status: 'Pending', business: 'Green Energy Solutions', joinedAt: '2026-09-07', lastActive: '2026-09-07', verified: false },
  { id: 'USR-005', name: 'Deepa Krishnan', email: 'deepa@hotelgrand.com', phone: '+91 94601 99123', role: 'Seller', status: 'Active', business: 'Hotel Grand Palace', joinedAt: '2026-04-20', lastActive: '2026-09-08', verified: true },
  { id: 'USR-006', name: 'Vikram Patel', email: 'vikram@recycletech.in', phone: '+91 93701 88012', role: 'Buyer', status: 'Suspended', business: 'RecycleTech Industries', joinedAt: '2026-01-15', lastActive: '2026-08-01', verified: true },
  { id: 'USR-007', name: 'Ananya Singh', email: 'ananya@cafebliss.com', phone: '+91 92801 77901', role: 'Seller', status: 'Pending', business: 'Cafe Bliss', joinedAt: '2026-09-08', lastActive: '2026-09-08', verified: false },
  { id: 'USR-008', name: 'Suresh Kumar', email: 'suresh@biodiesel.co', phone: '+91 91901 66890', role: 'Buyer', status: 'Active', business: 'Biodiesel Corp', joinedAt: '2026-05-10', lastActive: '2026-09-10', verified: true },
];

const statusColors: Record<string, string> = {
  Active: 'bg-green-500/15 text-green-600 border-green-500/30',
  Pending: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  Suspended: 'bg-red-500/15 text-red-600 border-red-500/30',
  Rejected: 'bg-muted text-muted-foreground border-border',
};

const roleColors: Record<string, string> = {
  Seller: 'bg-primary/10 text-primary border-primary/30',
  Buyer: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
};

export default function AdminUsersSection() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.business.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'All' || u.role === filterRole;
    const matchStatus = filterStatus === 'All' || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const handleApprove = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: 'Active', verified: true } : u));
    if (selectedUser?.id === id) setSelectedUser((prev) => prev ? { ...prev, status: 'Active', verified: true } : null);
  };

  const handleReject = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: 'Rejected' } : u));
    if (selectedUser?.id === id) setSelectedUser((prev) => prev ? { ...prev, status: 'Rejected' } : null);
  };

  const pendingCount = users.filter((u) => u.status === 'Pending').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} total users · {pendingCount} pending approval</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 font-semibold">
            <UserCheck size={13} />
            {pendingCount} awaiting approval
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm flex-1 min-w-48">
          <Search size={15} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search users, email, business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-foreground placeholder:text-muted-foreground outline-none w-full text-sm"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground outline-none cursor-pointer"
        >
          <option value="All">All Roles</option>
          <option value="Seller">Seller</option>
          <option value="Buyer">Buyer</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground outline-none cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Users Table */}
        <div className={`${selectedUser ? 'lg:col-span-2' : 'lg:col-span-3'} card overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100 cursor-pointer ${selectedUser?.id === user.id ? 'bg-primary/5' : ''}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                            {user.name}
                            {user.verified && <CheckCircle size={12} className="text-green-500" />}
                          </div>
                          <div className="text-xs text-muted-foreground">{user.business}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${roleColors[user.role]}`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${statusColors[user.status]}`}>{user.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{user.joinedAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {user.status === 'Pending' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApprove(user.id); }}
                              className="p-1.5 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors duration-100"
                              title="Approve"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleReject(user.id); }}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors duration-100"
                              title="Reject"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors duration-100"
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No users match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Panel */}
        {selectedUser && (
          <div className="card p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-foreground">{selectedUser.name}</div>
                <div className="text-xs text-muted-foreground">{selectedUser.id}</div>
                <span className={`text-xs px-2 py-0.5 rounded-md border font-medium mt-1 inline-block ${statusColors[selectedUser.status]}`}>{selectedUser.status}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={13} />
                <span className="text-foreground text-xs">{selectedUser.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={13} />
                <span className="text-foreground text-xs">{selectedUser.phone}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Role', value: selectedUser.role },
                { label: 'Business', value: selectedUser.business },
                { label: 'Joined', value: selectedUser.joinedAt },
                { label: 'Last Active', value: selectedUser.lastActive },
                { label: 'Verified', value: selectedUser.verified ? 'Yes ✓' : 'No' },
              ].map((item) => (
                <div key={`detail-${item.label}`} className="bg-muted rounded-xl p-2.5">
                  <div className="text-muted-foreground">{item.label}</div>
                  <div className="font-semibold text-foreground mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>
            {selectedUser.status === 'Pending' && (
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => handleApprove(selectedUser.id)}
                  className="w-full btn-primary py-2 text-sm gap-2"
                >
                  <UserCheck size={15} />
                  Approve User
                </button>
                <button
                  onClick={() => handleReject(selectedUser.id)}
                  className="w-full px-4 py-2 rounded-xl bg-red-500/10 text-red-600 border border-red-500/30 text-sm font-semibold hover:bg-red-500/20 transition-colors duration-150 flex items-center justify-center gap-2"
                >
                  <UserX size={15} />
                  Reject
                </button>
              </div>
            )}
            {selectedUser.status === 'Active' && (
              <button className="w-full px-4 py-2 rounded-xl bg-red-500/10 text-red-600 border border-red-500/30 text-sm font-semibold hover:bg-red-500/20 transition-colors duration-150">
                Suspend Account
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
