'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Filter, ChevronUp, ChevronDown, Edit2, Trash2, Eye, Droplets, AlertTriangle,  } from 'lucide-react';
import { sellerApi, type SellerListing as UCOListing } from '@/lib/seller-api';
import { toast } from 'sonner';
import CreateListingSection from './CreateListingSection';

type SortKey = keyof Pick<UCOListing, 'id' | 'oilType' | 'volumeLiters' | 'gradeLabel' | 'pricePerLiter' | 'status' | 'createdAt'>;

function getStatusBadge(status: UCOListing['status']) {
  const map: Record<UCOListing['status'], string> = {
    Draft: 'badge-muted',
    'Pending Verification': 'badge-pending',
    Active: 'badge-active',
    Matched: 'badge-info',
    Completed: 'badge-muted',
    Expired: 'badge-danger',
  };
  return map[status] || 'badge-muted';
}

function getGradeBadge(grade: UCOListing['gradeLabel']) {
  const map = { A: 'badge-active', B: 'badge-pending', C: 'badge-danger' };
  return map[grade];
}

export default function ListingsSection() {
  const [listings,setListings]=useState<UCOListing[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editListingId, setEditListingId] = useState<string | undefined>(undefined);
  const perPage = 6;

  const statusOptions = ['All', 'Active', 'Matched', 'Pending Verification', 'Draft', 'Completed', 'Expired'];

  const filtered = useMemo(() => {
    let items = [...listings];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (l) => l.id.toLowerCase().includes(q) || l.oilType.toLowerCase().includes(q) || l.location.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') items = items.filter((l) => l.status === statusFilter);
    items.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return items;
  }, [listings, search, statusFilter, sortKey, sortDir]);

  const load=()=>sellerApi.listings().then(setListings).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load listings'));
  useEffect(()=>{load()},[]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length) setSelectedIds([]);
    else setSelectedIds(paginated.map((l) => l.id));
  };

  const handleDelete = async (id: string) => {
    try{await sellerApi.deleteListing(id);setListings(prev=>prev.filter(x=>x.id!==id));setDeleteConfirmId(null);toast.success(`Listing ${id} deleted`)}catch(e){toast.error(e instanceof Error?e.message:'Unable to delete listing')}
  };

  if (view === 'create' || view === 'edit') {
    return (
      <CreateListingSection
        listingId={view === 'edit' ? editListingId : undefined}
        onBack={() => { setView('list'); setEditListingId(undefined); load(); }}
      />
    );
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronUp size={12} className="text-border" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />;
  };

  const columns: { key: SortKey; label: string; width?: string }[] = [
    { key: 'id', label: 'Listing ID', width: 'w-32' },
    { key: 'oilType', label: 'Oil Type', width: 'w-28' },
    { key: 'volumeLiters', label: 'Volume (L)', width: 'w-24' },
    { key: 'gradeLabel', label: 'Grade', width: 'w-20' },
    { key: 'pricePerLiter', label: '₹/Liter', width: 'w-20' },
    { key: 'status', label: 'Status', width: 'w-40' },
    { key: 'createdAt', label: 'Created', width: 'w-28' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">UCO Listings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} listing{filtered.length !== 1 ? 's' : ''} · {listings.filter((l) => l.status === 'Active').length} active
          </p>
        </div>
        <button className="btn-primary" onClick={() => setView('create')}>
          <Plus size={16} />
          New Listing
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={15} className="text-muted-foreground" />
          {statusOptions.map((s) => (
            <button
              key={`filter-${s}`}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-border'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 rounded-xl border border-primary/20 animate-fade-in-up">
          <span className="text-sm font-semibold text-primary">{selectedIds.length} selected</span>
          <div className="flex-1" />
          <button
            onClick={() => toast.error('Bulk delete requires confirmation')}
            className="btn-danger py-1.5 text-xs"
          >
            Delete Selected
          </button>
          <button onClick={() => setSelectedIds([])} className="btn-ghost py-1.5 text-xs">
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-primary"
                    checked={selectedIds.length === paginated.length && paginated.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={`col-${col.key}`}
                    className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-100 ${col.width || ''}`}
                    onClick={() => toggleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      <SortIcon k={col.key} />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-24">
                  Frequency
                </th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((listing) => (
                <tr
                  key={`listing-row-${listing.id}`}
                  className={`hover:bg-muted/40 transition-colors duration-100 group ${
                    selectedIds.includes(listing.id) ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-primary"
                      checked={selectedIds.includes(listing.id)}
                      onChange={() => toggleSelect(listing.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono-data text-xs font-semibold text-foreground">{listing.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Droplets size={13} className="text-primary" />
                      <span className="text-sm text-foreground">{listing.oilType}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono-data text-sm text-foreground">{listing.volumeLiters.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={getGradeBadge(listing.gradeLabel)}>
                      Grade {listing.gradeLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono-data text-sm font-semibold text-foreground">₹{listing.pricePerLiter}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={getStatusBadge(listing.status)}>{listing.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">{listing.createdAt}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">{listing.collectionFrequency}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button title="View listing" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-100">
                        <Eye size={14} />
                      </button>
                      <button title="Edit listing" onClick={() => { setEditListingId(listing.id); setView('edit'); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-100">
                        <Edit2 size={14} />
                      </button>
                      <button
                        title="Delete listing — this cannot be undone"
                        onClick={() => setDeleteConfirmId(listing.id)}
                        className="p-1.5 rounded-lg hover:bg-danger-bg text-muted-foreground hover:text-danger transition-colors duration-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginated.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Droplets size={32} className="text-muted-foreground" />
              <div className="font-semibold text-foreground">No UCO listings found</div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                {search || statusFilter !== 'All' ?'Try adjusting your search or filters.' :'Create your first UCO listing to start receiving orders from verified buyers.'}
              </p>
              {!search && statusFilter === 'All' && (
                <button className="btn-primary mt-1" onClick={() => setView('create')}>
                  <Plus size={15} />
                  Create First Listing
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} listings
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-100"
              >
                <ChevronUp size={14} className="rotate-[-90deg]" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={`page-btn-${p}`}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors duration-100 ${
                    page === p ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-100"
              >
                <ChevronDown size={14} className="rotate-[-90deg]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-card-lg animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-danger-bg flex items-center justify-center mb-4">
              <AlertTriangle size={22} className="text-danger" />
            </div>
            <h3 className="font-bold text-foreground text-lg mb-2">Delete Listing?</h3>
            <p className="text-sm text-muted-foreground mb-2">
              You are about to delete listing{' '}
              <span className="font-mono-data font-semibold text-foreground">{deleteConfirmId}</span>.
            </p>
            <p className="text-sm text-danger mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="btn-danger flex-1 justify-center">
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
