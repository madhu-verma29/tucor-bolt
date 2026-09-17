'use client';

import React, { useState, useCallback } from 'react';
import { Search, SlidersHorizontal, MapPin, Droplets, Award, Package, X, ArrowUpDown, Zap } from 'lucide-react';
import { mockMarketListings, UCOMarketListing } from '@/lib/buyer-mock-data';

interface Filters {
  oilType: string[];
  grade: string[];
  minVolume: string;
  maxVolume: string;
  minPrice: string;
  maxPrice: string;
  region: string[];
  availability: string;
}

const OIL_TYPES = ['Palm', 'Sunflower', 'Mustard', 'Blended', 'Soybean'];
const GRADES = ['A', 'B', 'C'];
const REGIONS = ['West India', 'North India', 'South India', 'East India'];

const gradeColors: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  B: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  C: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
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

interface Props {
  onViewListing: (listing: UCOMarketListing) => void;
}

export default function UCOSearchSection({ onViewListing }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'volume_desc' | 'newest'>('newest');
  const [filters, setFilters] = useState<Filters>({
    oilType: [],
    grade: [],
    minVolume: '',
    maxVolume: '',
    minPrice: '',
    maxPrice: '',
    region: [],
    availability: '',
  });

  const toggleFilter = useCallback((key: 'oilType' | 'grade' | 'region', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  }, []);

  const clearFilters = () => {
    setFilters({ oilType: [], grade: [], minVolume: '', maxVolume: '', minPrice: '', maxPrice: '', region: [], availability: '' });
    setSearchQuery('');
  };

  const activeFilterCount =
    filters.oilType.length + filters.grade.length + filters.region.length +
    (filters.minVolume ? 1 : 0) + (filters.maxVolume ? 1 : 0) +
    (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0) +
    (filters.availability ? 1 : 0);

  const filtered = mockMarketListings
    .filter((l) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!l.oilType.toLowerCase().includes(q) && !l.city.toLowerCase().includes(q) && !l.state.toLowerCase().includes(q) && !l.id.toLowerCase().includes(q)) return false;
      }
      if (filters.oilType.length && !filters.oilType.includes(l.oilType)) return false;
      if (filters.grade.length && !filters.grade.includes(l.gradeLabel)) return false;
      if (filters.region.length && !filters.region.includes(l.region)) return false;
      if (filters.minVolume && l.volumeLiters < parseInt(filters.minVolume)) return false;
      if (filters.maxVolume && l.volumeLiters > parseInt(filters.maxVolume)) return false;
      if (filters.minPrice && l.pricePerLiter < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice && l.pricePerLiter > parseInt(filters.maxPrice)) return false;
      if (filters.availability && l.status !== filters.availability) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePerLiter - b.pricePerLiter;
      if (sortBy === 'price_desc') return b.pricePerLiter - a.pricePerLiter;
      if (sortBy === 'volume_desc') return b.volumeLiters - a.volumeLiters;
      return new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime();
    });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Source UCO</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse verified UCO listings — all transactions managed by TUCOR
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-xl border border-border">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          {mockMarketListings.filter((l) => l.status === 'Available').length} listings available
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border focus-within:border-ring transition-colors duration-150">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by oil type, city, state, or listing ID..."
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

        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="card p-5 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-foreground text-sm">Filter Listings</span>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-primary hover:underline font-medium">
                Clear all ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Oil Type */}
            <div>
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
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Quality Grade</div>
              <div className="flex gap-1.5">
                {GRADES.map((g) => (
                  <button
                    key={`filter-grade-${g}`}
                    onClick={() => toggleFilter('grade', g)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all duration-150 ${
                      filters.grade.includes(g)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted border-border text-foreground hover:border-ring'
                    }`}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Volume (Liters)</div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minVolume}
                  onChange={(e) => setFilters((p) => ({ ...p, minVolume: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-muted text-sm text-foreground outline-none focus:border-ring transition-colors"
                />
                <span className="text-muted-foreground text-xs">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxVolume}
                  onChange={(e) => setFilters((p) => ({ ...p, maxVolume: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-muted text-sm text-foreground outline-none focus:border-ring transition-colors"
                />
              </div>
            </div>

            {/* Region */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Region</div>
              <div className="flex flex-wrap gap-1.5">
                {REGIONS.map((r) => (
                  <button
                    key={`filter-region-${r}`}
                    onClick={() => toggleFilter('region', r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${
                      filters.region.includes(r)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted border-border text-foreground hover:border-ring'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
          {activeFilterCount > 0 || searchQuery ? ' (filtered)' : ''}
        </span>
      </div>

      {/* Listing grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-semibold text-foreground mb-1">No listings found</div>
          <div className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search query</div>
          <button onClick={clearFilters} className="btn-primary text-sm">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <ListingCard key={`listing-card-${listing.id}`} listing={listing} onView={onViewListing} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({ listing, onView }: { listing: UCOMarketListing; onView: (l: UCOMarketListing) => void }) {
  const totalValue = listing.volumeLiters * listing.pricePerLiter;

  return (
    <div className="card overflow-hidden hover:shadow-card-lg transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer" onClick={() => onView(listing)}>
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary to-emerald-400" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${oilTypeColors[listing.oilType]}`}>
              {listing.oilType}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${gradeColors[listing.gradeLabel]}`}>
              Grade {listing.gradeLabel}
            </span>
          </div>
          <span className={`${statusColors[listing.status]} text-xs flex-shrink-0`}>{listing.status}</span>
        </div>

        {/* Price + Volume */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-2xl font-extrabold text-foreground">
              ₹{listing.pricePerLiter}
              <span className="text-sm font-normal text-muted-foreground">/L</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Total value ≈ ₹{totalValue.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-foreground">{listing.volumeLiters.toLocaleString('en-IN')} L</div>
            <div className="text-xs text-muted-foreground">Min. {listing.minOrderLiters} L</div>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin size={12} className="flex-shrink-0 text-primary" />
            <span>{listing.city}, {listing.state}</span>
            <span className="text-border">·</span>
            <span>{listing.region}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Package size={12} className="flex-shrink-0 text-primary" />
            <span>{listing.collectionFrequency} collection</span>
            <span className="text-border">·</span>
            <span>From {listing.availableFrom}</span>
          </div>
        </div>

        {/* Quality indicators */}
        {listing.ffa && (
          <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-muted/50 mb-4">
            <div className="flex items-center gap-1.5">
              <Droplets size={11} className="text-primary" />
              <span className="text-xs text-muted-foreground">FFA</span>
              <span className="text-xs font-semibold text-foreground">{listing.ffa}</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <div className="flex items-center gap-1.5">
              <Award size={11} className="text-primary" />
              <span className="text-xs text-muted-foreground">Acid</span>
              <span className="text-xs font-semibold text-foreground">{listing.acidValue}</span>
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); onView(listing); }}
          className="w-full btn-primary text-sm py-2.5 group-hover:shadow-md transition-shadow duration-200"
        >
          View Details & Request
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-2.5 text-xs text-muted-foreground">
          <Zap size={10} className="text-primary" />
          <span>TUCOR Managed Transaction</span>
        </div>
      </div>
    </div>
  );
}
