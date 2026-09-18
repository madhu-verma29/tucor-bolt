'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, Droplets, Package, X, ArrowUpDown, ShieldCheck, ChevronDown, ChevronUp, Calendar, TrendingDown, LayoutGrid, List, RefreshCw, Info, Bookmark,  } from 'lucide-react';
import type { UCOMarketListing } from '@/lib/buyer-api';
import { buyerApi } from '@/lib/buyer-api';

interface Filters {
  oilType: string[];
  grade: string[];
  minVolume: string;
  maxVolume: string;
  minPrice: string;
  maxPrice: string;
  region: string[];
  availability: string;
  collectionFrequency: string;
}

const OIL_TYPES = ['Palm', 'Sunflower', 'Mustard', 'Blended', 'Soybean'];
const GRADES = ['A', 'B', 'C'];
const REGIONS = ['West India', 'North India', 'South India', 'East India'];
const FREQUENCIES = ['Weekly', 'Bi-weekly', 'Monthly'];
const AVAILABILITY_OPTIONS = ['Available', 'Limited', 'Reserved'];

const gradeColors: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  B: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  C: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const gradeDescriptions: Record<string, string> = {
  A: 'Premium — FFA < 1.5%, moisture < 0.1%',
  B: 'Standard — FFA < 2%, moisture < 0.3%',
  C: 'Basic — FFA < 3%, moisture < 0.5%',
};

const statusColors: Record<string, string> = {
  Available: 'badge-active',
  Limited: 'badge-pending',
  Reserved: 'badge-muted',
};

const oilTypeColors: Record<string, string> = {
  Palm: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Sunflower: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Mustard: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
  Blended: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Soybean: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

const regionIcons: Record<string, string> = {
  'West India': '🌅',
  'North India': '🏔️',
  'South India': '🌴',
  'East India': '🌊',
};

interface ListingCardProps {
  listing: UCOMarketListing;
  viewMode: 'grid' | 'list';
  onViewListing: (listing: UCOMarketListing) => void;
  saved: boolean;
  onToggleSaved: (listing: UCOMarketListing) => void;
}

function ListingCard({ listing, viewMode, onViewListing, saved, onToggleSaved }: ListingCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className="card p-4 hover:border-primary/40 transition-all duration-200 group">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Oil type badge */}
          <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${oilTypeColors[listing.oilType]}`}>
            {listing.oilType}
          </div>

          {/* Grade */}
          <div className={`px-2 py-0.5 rounded-md text-xs font-bold flex-shrink-0 ${gradeColors[listing.gradeLabel]}`}>
            Grade {listing.gradeLabel}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground min-w-0">
            <MapPin size={13} className="flex-shrink-0" />
            <span className="truncate">{listing.city}, {listing.state}</span>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-1 text-sm text-foreground font-medium flex-shrink-0">
            <Package size={13} className="text-muted-foreground" />
            {listing.volumeLiters.toLocaleString()} L
          </div>

          {/* Price */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-lg font-bold text-foreground">₹{listing.pricePerLiter}</span>
            <span className="text-xs text-muted-foreground">/L</span>
          </div>

          {/* Status */}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors[listing.status]}`}>
            {listing.status}
          </span>

          {/* Verified badge */}
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <ShieldCheck size={13} />
            <span>Verified</span>
          </div>

          {/* Frequency */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
            <RefreshCw size={12} />
            {listing.collectionFrequency}
          </div>

          {/* Listing ID */}
          <span className="text-xs text-muted-foreground font-mono flex-shrink-0">{listing.id}</span>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <button onClick={() => onToggleSaved(listing)} className="btn-secondary text-xs px-3 py-1.5" title={saved ? "Remove saved listing" : "Save listing"}><Bookmark size={13} className={saved ? "fill-current" : ""}/></button>
            <button
              onClick={() => onViewListing(listing)}
              className="btn-primary text-xs px-3 py-1.5"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 hover:border-primary/40 transition-all duration-200 flex flex-col gap-4 group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${oilTypeColors[listing.oilType]}`}>
              {listing.oilType} UCO
            </span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${gradeColors[listing.gradeLabel]}`}>
              Grade {listing.gradeLabel}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={13} className="flex-shrink-0" />
            <span>{listing.city}, {listing.state}</span>
            <span className="ml-1 text-xs">{regionIcons[listing.region]}</span>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusColors[listing.status]}`}>
          {listing.status}
        </span>
      </div>

      {/* Price + Volume */}
      <div className="flex items-end justify-between gap-3 py-3 border-y border-border">
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">Price per Liter</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">₹{listing.pricePerLiter}</span>
            <span className="text-xs text-muted-foreground">/L</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Total value: ₹{(listing.pricePerLiter * listing.volumeLiters).toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-0.5">Available Volume</div>
          <div className="text-xl font-bold text-foreground">{listing.volumeLiters.toLocaleString()} L</div>
          <div className="text-xs text-muted-foreground mt-0.5">Min order: {listing.minOrderLiters} L</div>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <RefreshCw size={12} />
          <span>{listing.collectionFrequency}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>From {listing.availableFrom}</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck size={12} />
          <span>Verified Seller</span>
        </div>
        <span className="font-mono text-xs ml-auto">{listing.id}</span>
      </div>

      {/* Quality specs (expandable) */}
      {listing.ffa && (
        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <Info size={12} />
            Quality Specs
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {expanded && (
            <div className="mt-2.5 grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-xl border border-border text-xs">
              {listing.ffa && (
                <div>
                  <span className="text-muted-foreground">FFA</span>
                  <div className="font-semibold text-foreground">{listing.ffa}</div>
                </div>
              )}
              {listing.moistureContent && (
                <div>
                  <span className="text-muted-foreground">Moisture</span>
                  <div className="font-semibold text-foreground">{listing.moistureContent}</div>
                </div>
              )}
              {listing.acidValue && (
                <div>
                  <span className="text-muted-foreground">Acid Value</span>
                  <div className="font-semibold text-foreground">{listing.acidValue}</div>
                </div>
              )}
              {listing.iodineValue && (
                <div>
                  <span className="text-muted-foreground">Iodine Value</span>
                  <div className="font-semibold text-foreground">{listing.iodineValue}</div>
                </div>
              )}
              {listing.qualityNotes && (
                <div className="col-span-2 mt-1 pt-2 border-t border-border text-muted-foreground italic">
                  {listing.qualityNotes}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-2"><button onClick={() => onToggleSaved(listing)} className="btn-secondary px-3" title={saved ? "Remove saved listing" : "Save listing"}><Bookmark size={15} className={saved ? "fill-current" : ""}/></button><button
        onClick={() => onViewListing(listing)}
        className="btn-primary w-full text-sm py-2.5 mt-auto"
      >
        View Full Details & Request
      </button></div>
    </div>
  );
}

interface Props {
  onViewListing: (listing: UCOMarketListing) => void;
}

export default function BuyerListingsSection({ onViewListing }: Props) {
  const [marketListings,setMarketListings]=useState<UCOMarketListing[]>([]); const [savedIds,setSavedIds]=useState<string[]>([]);
  useEffect(()=>{Promise.all([buyerApi.listings(),buyerApi.savedListings()]).then(([l,s])=>{setMarketListings(l);setSavedIds(s)}).catch(()=>setMarketListings([]));},[]); const toggleSaved=async(l:UCOMarketListing)=>{if(savedIds.includes(l.id)){await buyerApi.unsaveListing(l.id);setSavedIds(x=>x.filter(id=>id!==l.id))}else{await buyerApi.saveListing(l.id);setSavedIds(x=>[...x,l.id])}};
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'volume_desc' | 'newest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<Filters>({
    oilType: [],
    grade: [],
    minVolume: '',
    maxVolume: '',
    minPrice: '',
    maxPrice: '',
    region: [],
    availability: '',
    collectionFrequency: '',
  });

  const toggleFilter = useCallback((key: 'oilType' | 'grade' | 'region', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  }, []);

  const clearFilters = () => {
    setFilters({
      oilType: [],
      grade: [],
      minVolume: '',
      maxVolume: '',
      minPrice: '',
      maxPrice: '',
      region: [],
      availability: '',
      collectionFrequency: '',
    });
    setSearchQuery('');
  };

  const activeFilterCount = useMemo(() =>
    filters.oilType.length +
    filters.grade.length +
    filters.region.length +
    (filters.minVolume ? 1 : 0) +
    (filters.maxVolume ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.availability ? 1 : 0) +
    (filters.collectionFrequency ? 1 : 0),
    [filters]
  );

  const filtered = useMemo(() =>
    marketListings
      .filter((l) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (
            !l.oilType.toLowerCase().includes(q) &&
            !l.city.toLowerCase().includes(q) &&
            !l.state.toLowerCase().includes(q) &&
            !l.id.toLowerCase().includes(q) &&
            !l.region.toLowerCase().includes(q)
          ) return false;
        }
        if (filters.oilType.length && !filters.oilType.includes(l.oilType)) return false;
        if (filters.grade.length && !filters.grade.includes(l.gradeLabel)) return false;
        if (filters.region.length && !filters.region.includes(l.region)) return false;
        if (filters.minVolume && l.volumeLiters < parseInt(filters.minVolume)) return false;
        if (filters.maxVolume && l.volumeLiters > parseInt(filters.maxVolume)) return false;
        if (filters.minPrice && l.pricePerLiter < parseInt(filters.minPrice)) return false;
        if (filters.maxPrice && l.pricePerLiter > parseInt(filters.maxPrice)) return false;
        if (filters.availability && l.status !== filters.availability) return false;
        if (filters.collectionFrequency && l.collectionFrequency !== filters.collectionFrequency) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.pricePerLiter - b.pricePerLiter;
        if (sortBy === 'price_desc') return b.pricePerLiter - a.pricePerLiter;
        if (sortBy === 'volume_desc') return b.volumeLiters - a.volumeLiters;
        return new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime();
      }),
    [searchQuery, filters, sortBy]
  );

  const availableCount = marketListings.filter((l) => l.status === 'Available').length;
  const avgPrice = Math.round(marketListings.reduce((s, l) => s + l.pricePerLiter, 0) / marketListings.length);
  const totalVolume = marketListings.reduce((s, l) => s + l.volumeLiters, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Verified UCO Listings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse seller-verified used cooking oil offerings — all transactions managed by TUCOR
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-xl border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            {availableCount} available now
          </div>
        </div>
      </div>

      {/* Market summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Package size={16} className="text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Listings</div>
            <div className="text-lg font-bold text-foreground">{marketListings.length}</div>
          </div>
        </div>
        <div className="card p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <TrendingDown size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Avg. Price</div>
            <div className="text-lg font-bold text-foreground">₹{avgPrice}/L</div>
          </div>
        </div>
        <div className="card p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Droplets size={16} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Volume</div>
            <div className="text-lg font-bold text-foreground">{(totalVolume / 1000).toFixed(1)}K L</div>
          </div>
        </div>
      </div>

      {/* Search + controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border focus-within:border-ring transition-colors duration-150">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by oil type, city, state, region, or listing ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
              filtersOpen || activeFilterCount > 0
                ? 'bg-primary/10 border-primary text-primary' :'bg-card border-border text-foreground hover:bg-muted'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none flex items-center gap-2 px-4 py-2.5 pr-8 rounded-xl border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="volume_desc">Volume: Largest First</option>
            </select>
            <ArrowUpDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          <div className="flex rounded-xl border border-border overflow-hidden bg-card">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2.5 transition-colors duration-150 ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2.5 transition-colors duration-150 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              title="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-foreground text-sm">Filter Listings</span>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-primary hover:underline font-medium">
                Clear all ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            {/* Oil Type */}
            <div className="xl:col-span-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Oil Type</div>
              <div className="flex flex-wrap gap-1.5">
                {OIL_TYPES.map((type) => (
                  <button
                    key={`filter-oil-${type}`}
                    onClick={() => toggleFilter('oilType', type)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${
                      filters.oilType.includes(type)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted border-border text-foreground hover:border-ring'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade */}
            <div className="xl:col-span-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Quality Grade</div>
              <div className="flex flex-col gap-1.5">
                {GRADES.map((g) => (
                  <button
                    key={`filter-grade-${g}`}
                    onClick={() => toggleFilter('grade', g)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border transition-all duration-150 text-left ${
                      filters.grade.includes(g)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted border-border text-foreground hover:border-ring'
                    }`}
                  >
                    <span className="font-bold">Grade {g}</span>
                    <span className={`text-xs opacity-70 ${filters.grade.includes(g) ? '' : 'text-muted-foreground'}`}>
                      {g === 'A' ? 'Premium' : g === 'B' ? 'Standard' : 'Basic'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="xl:col-span-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Price Range (₹/L)</div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-muted text-sm text-foreground outline-none focus:border-ring transition-colors"
                />
                <span className="text-muted-foreground text-xs flex-shrink-0">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-muted text-sm text-foreground outline-none focus:border-ring transition-colors"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                <span>₹20/L</span>
                <span>₹35/L</span>
              </div>
            </div>

            {/* Volume Range */}
            <div className="xl:col-span-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Volume (Liters)</div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minVolume}
                  onChange={(e) => setFilters((p) => ({ ...p, minVolume: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-muted text-sm text-foreground outline-none focus:border-ring transition-colors"
                />
                <span className="text-muted-foreground text-xs flex-shrink-0">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxVolume}
                  onChange={(e) => setFilters((p) => ({ ...p, maxVolume: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-muted text-sm text-foreground outline-none focus:border-ring transition-colors"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                <span>100 L</span>
                <span>1000+ L</span>
              </div>
            </div>

            {/* Region / Location */}
            <div className="xl:col-span-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Location</div>
              <div className="flex flex-col gap-1.5">
                {REGIONS.map((r) => (
                  <button
                    key={`filter-region-${r}`}
                    onClick={() => toggleFilter('region', r)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-all duration-150 text-left ${
                      filters.region.includes(r)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted border-border text-foreground hover:border-ring'
                    }`}
                  >
                    <span>{regionIcons[r]}</span>
                    <span className="font-medium">{r}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Availability + Frequency */}
            <div className="xl:col-span-1 flex flex-col gap-4">
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Availability</div>
                <div className="flex flex-col gap-1.5">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <button
                      key={`filter-avail-${opt}`}
                      onClick={() => setFilters((p) => ({ ...p, availability: p.availability === opt ? '' : opt }))}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-all duration-150 text-left ${
                        filters.availability === opt
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted border-border text-foreground hover:border-ring'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${opt === 'Available' ? 'bg-emerald-500' : opt === 'Limited' ? 'bg-amber-500' : 'bg-muted-foreground'}`} />
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Collection</div>
                <div className="flex flex-col gap-1.5">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={`filter-freq-${f}`}
                      onClick={() => setFilters((p) => ({ ...p, collectionFrequency: p.collectionFrequency === f ? '' : f }))}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-all duration-150 text-left ${
                        filters.collectionFrequency === f
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted border-border text-foreground hover:border-ring'
                      }`}
                    >
                      <RefreshCw size={11} className="flex-shrink-0" />
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {filters.oilType.map((t) => (
            <button
              key={`chip-oil-${t}`}
              onClick={() => toggleFilter('oilType', t)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {t} <X size={10} />
            </button>
          ))}
          {filters.grade.map((g) => (
            <button
              key={`chip-grade-${g}`}
              onClick={() => toggleFilter('grade', g)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              Grade {g} <X size={10} />
            </button>
          ))}
          {filters.region.map((r) => (
            <button
              key={`chip-region-${r}`}
              onClick={() => toggleFilter('region', r)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {r} <X size={10} />
            </button>
          ))}
          {filters.availability && (
            <button
              onClick={() => setFilters((p) => ({ ...p, availability: '' }))}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {filters.availability} <X size={10} />
            </button>
          )}
          {filters.collectionFrequency && (
            <button
              onClick={() => setFilters((p) => ({ ...p, collectionFrequency: '' }))}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {filters.collectionFrequency} <X size={10} />
            </button>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <button
              onClick={() => setFilters((p) => ({ ...p, minPrice: '', maxPrice: '' }))}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              ₹{filters.minPrice || '0'}–{filters.maxPrice || '∞'}/L <X size={10} />
            </button>
          )}
          {(filters.minVolume || filters.maxVolume) && (
            <button
              onClick={() => setFilters((p) => ({ ...p, minVolume: '', maxVolume: '' }))}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {filters.minVolume || '0'}–{filters.maxVolume || '∞'} L <X size={10} />
            </button>
          )}
        </div>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {marketListings.length} listings
        </span>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck size={13} className="text-emerald-500" />
          All sellers TUCOR-verified
        </div>
      </div>

      {/* Listings grid/list */}
      {filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Search size={24} className="text-muted-foreground" />
          </div>
          <div className="text-foreground font-semibold">No listings match your filters</div>
          <div className="text-sm text-muted-foreground max-w-xs">
            Try adjusting your search criteria or clearing some filters to see more results.
          </div>
          <button onClick={clearFilters} className="btn-secondary text-sm mt-1">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'flex flex-col gap-3'}>
          {filtered.map((listing) => (
            <ListingCard
              key={`listing-card-${listing.id}`}
              listing={listing}
              viewMode={viewMode}
              onViewListing={onViewListing}
            />
          ))}
        </div>
      )}

      {/* TUCOR trust footer */}
      <div className="card p-4 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30 flex items-start gap-3">
        <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">TUCOR Verified Marketplace</div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
            Every seller on this platform has been identity-verified and quality-assessed by TUCOR. Seller identities are protected until transaction confirmation. All logistics, payments, and quality checks are managed by TUCOR.
          </div>
        </div>
      </div>
    </div>
  );
}
