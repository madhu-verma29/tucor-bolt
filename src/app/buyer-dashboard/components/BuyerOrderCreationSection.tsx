'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  MapPin,
  Package,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Droplets,
  ArrowRight,
  Info,
  Truck,
  ReceiptText,
  AlertCircle,
  X,
} from 'lucide-react';
import type { UCOMarketListing } from '@/lib/buyer-api';
import { buyerApi } from '@/lib/buyer-api';

const PLATFORM_FEE_RATE = 0.015; // 1.5%
const GST_RATE = 0.18; // 18%
const TRANSPORT_RATE_PER_LITER = 1.2; // ₹1.2/L

const gradeColors: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  B: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  C: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const oilTypeColors: Record<string, string> = {
  Palm: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Sunflower: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Mustard: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
  Blended: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Soybean: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

const statusColors: Record<string, string> = {
  Available: 'badge-active',
  Limited: 'badge-pending',
  Reserved: 'badge-muted',
};

interface Props {
  onNavigate: (id: string) => void;
}

type Step = 'select-listing' | 'order-details' | 'review-confirm';

export default function BuyerOrderCreationSection({ onNavigate }: Props) {
  const [marketListings,setMarketListings]=useState<UCOMarketListing[]>([]);
  const [deliveryLocations,setDeliveryLocations]=useState<{id:string;label:string;address:string;state:string}[]>([{id:'loc-4',label:'Custom Address',address:'',state:''}]); useEffect(()=>{Promise.all([buyerApi.listings(),buyerApi.profile()]).then(([ls,p])=>{setMarketListings(ls);const addr=[p.address,p.city,p.state,p.pincode].filter(Boolean).join(', ');setDeliveryLocations([{id:'registered',label:p.businessName||'Registered Business Address',address:addr,state:p.state||''},{id:'loc-4',label:'Custom Address',address:'',state:''}]);setSelectedLocationId('registered')}).catch(()=>setMarketListings([]));},[]);
  const [step, setStep] = useState<Step>('select-listing');
  const [search, setSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState<UCOMarketListing | null>(null);
  const [volumeInput, setVolumeInput] = useState('');
  const [volumeError, setVolumeError] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('registered');
  const [customAddress, setCustomAddress] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customState, setCustomState] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderId,setOrderId] = useState('');

  const availableListings = useMemo(() => {
    return marketListings.filter((l) => l.status !== 'Reserved');
  }, []);

  const filteredListings = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return availableListings;
    return availableListings.filter(
      (l) =>
        l.oilType.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.gradeLabel.toLowerCase().includes(q)
    );
  }, [availableListings, search]);

  const volume = parseInt(volumeInput || '0');
  const selectedLocation = deliveryLocations.find((l) => l.id === selectedLocationId);

  const costs = useMemo(() => {
    if (!selectedListing || !volume) return null;
    const oilCost = volume * selectedListing.pricePerLiter;
    const transport = Math.round(volume * TRANSPORT_RATE_PER_LITER);
    const platformFee = Math.round(oilCost * PLATFORM_FEE_RATE);
    const subtotal = oilCost + transport + platformFee;
    const gst = Math.round(subtotal * GST_RATE);
    const total = subtotal + gst;
    return { oilCost, transport, platformFee, subtotal, gst, total };
  }, [selectedListing, volume]);

  const validateVolume = (val: string) => {
    const v = parseInt(val);
    if (!val || isNaN(v) || v <= 0) { setVolumeError('Please enter a valid volume'); return false; }
    if (selectedListing && v < selectedListing.minOrderLiters) {
      setVolumeError(`Minimum order is ${selectedListing.minOrderLiters} L`);
      return false;
    }
    if (selectedListing && v > selectedListing.volumeLiters) {
      setVolumeError(`Maximum available is ${selectedListing.volumeLiters} L`);
      return false;
    }
    setVolumeError('');
    return true;
  };

  const handleSelectListing = (listing: UCOMarketListing) => {
    setSelectedListing(listing);
    setVolumeInput(listing.minOrderLiters.toString());
    setVolumeError('');
    setStep('order-details');
  };

  const handleProceedToReview = () => {
    if (!validateVolume(volumeInput)) return;
    if (selectedLocationId === 'loc-4' && !customAddress.trim()) {
      return;
    }
    setStep('review-confirm');
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    try { if(!selectedListing||!costs)return; const created=await buyerApi.createOrder({listingId:selectedListing.id,volumeLiters:volume,deliveryAddress,notes:orderNotes||undefined}); setOrderId(created.id); setSubmitted(true); } finally { setSubmitting(false); }
  };

  const deliveryAddress =
    selectedLocationId === 'loc-4'
      ? `${customAddress}, ${customCity}, ${customState}`
      : `${selectedLocation?.label} — ${selectedLocation?.address}`;

  // ─── Step indicators ───────────────────────────────────────────────────────
  const steps: { id: Step; label: string }[] = [
    { id: 'select-listing', label: 'Select Listing' },
    { id: 'order-details', label: 'Volume & Delivery' },
    { id: 'review-confirm', label: 'Review & Confirm' },
  ];

  const stepIndex = steps.findIndex((s) => s.id === step);

  // ─── Success screen ────────────────────────────────────────────────────────
  if (submitted && selectedListing && costs) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-success" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Order Created!</h2>
          <p className="text-muted-foreground max-w-md">
            Your order for <strong>{volume} L</strong> of <strong>{selectedListing.oilType} UCO (Grade {selectedListing.gradeLabel})</strong> has been placed.
            TUCOR will review and confirm within 24–48 hours.
          </p>
        </div>
        <div className="card p-5 max-w-sm w-full text-left">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Order Summary</div>
          {[
            { label: 'Order ID', value: orderId },
            { label: 'Listing', value: selectedListing.id },
            { label: 'Oil Type', value: `${selectedListing.oilType} — Grade ${selectedListing.gradeLabel}` },
            { label: 'Volume', value: `${volume} L` },
            { label: 'Total Amount', value: `₹${costs.total.toLocaleString('en-IN')}` },
            { label: 'Delivery To', value: selectedLocation?.id === 'loc-4' ? customCity : selectedLocation?.label ?? '' },
            { label: 'Status', value: 'Under TUCOR Review' },
          ].map((item) => (
            <div key={`order-success-${item.label}`} className="flex justify-between py-1.5 border-b border-border last:border-0">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-xs font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={() => onNavigate('orders')} className="btn-primary">View Active Orders</button>
          <button onClick={() => onNavigate('listings')} className="btn-secondary">Browse More Listings</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Create Order</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Select a listing, specify volume and delivery, then confirm your order.</p>
        </div>
      </div>

      {/* Step progress */}
      <div className="card p-4">
        <div className="flex items-center gap-0">
          {steps.map((s, i) => (
            <React.Fragment key={`step-indicator-${s.id}`}>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    i < stepIndex
                      ? 'bg-success text-white'
                      : i === stepIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i < stepIndex ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    i === stepIndex ? 'text-foreground' : i < stepIndex ? 'text-success' : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-300 ${i < stepIndex ? 'bg-success' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── STEP 1: Select Listing ── */}
      {step === 'select-listing' && (
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by oil type, city, grade, or listing ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} available
          </div>

          {/* Listing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredListings.map((listing) => (
              <div
                key={`order-listing-${listing.id}`}
                className="card p-4 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => handleSelectListing(listing)}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${oilTypeColors[listing.oilType]}`}>
                      {listing.oilType}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${gradeColors[listing.gradeLabel]}`}>
                      Grade {listing.gradeLabel}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[listing.status]}`}>
                    {listing.status}
                  </span>
                </div>

                {/* Price + volume */}
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <div className="text-2xl font-extrabold text-foreground">₹{listing.pricePerLiter}<span className="text-sm font-normal text-muted-foreground">/L</span></div>
                    <div className="text-xs text-muted-foreground mt-0.5">Min order: {listing.minOrderLiters} L</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-foreground">{listing.volumeLiters.toLocaleString('en-IN')} L</div>
                    <div className="text-xs text-muted-foreground">available</div>
                  </div>
                </div>

                {/* Location + frequency */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><MapPin size={12} />{listing.city}, {listing.state}</span>
                  <span className="flex items-center gap-1"><Truck size={12} />{listing.collectionFrequency}</span>
                </div>

                {/* Listing ID + CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground font-mono">{listing.id}</span>
                  <button className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all duration-150">
                    Select <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="card p-10 text-center">
              <div className="text-3xl mb-3">🔍</div>
              <div className="text-sm font-semibold text-foreground mb-1">No listings found</div>
              <div className="text-xs text-muted-foreground">Try adjusting your search query</div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Volume & Delivery ── */}
      {step === 'order-details' && selectedListing && (
        <div className="flex flex-col gap-5 max-w-2xl">
          {/* Selected listing summary */}
          <div className="card p-4 border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${oilTypeColors[selectedListing.oilType]}`}>
                  {selectedListing.oilType}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${gradeColors[selectedListing.gradeLabel]}`}>
                  Grade {selectedListing.gradeLabel}
                </span>
                <span className="text-sm font-bold text-foreground">₹{selectedListing.pricePerLiter}/L</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin size={12} />
                {selectedListing.city}, {selectedListing.state}
                <span className="text-muted-foreground/40">·</span>
                <Package size={12} />
                {selectedListing.volumeLiters} L available
              </div>
            </div>
            <button
              onClick={() => setStep('select-listing')}
              className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
            >
              <ChevronLeft size={12} /> Change listing
            </button>
          </div>

          {/* Volume input */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Droplets size={16} className="text-primary" /> Volume Required
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Volume (Liters) <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={selectedListing.minOrderLiters}
                    max={selectedListing.volumeLiters}
                    value={volumeInput}
                    onChange={(e) => {
                      setVolumeInput(e.target.value);
                      if (volumeError) validateVolume(e.target.value);
                    }}
                    onBlur={(e) => validateVolume(e.target.value)}
                    placeholder={`Min ${selectedListing.minOrderLiters} L`}
                    className={`input-field w-full pr-10 ${volumeError ? 'border-destructive' : ''}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">L</span>
                </div>
                {volumeError && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive">
                    <AlertCircle size={12} /> {volumeError}
                  </div>
                )}
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                  <Info size={11} />
                  Range: {selectedListing.minOrderLiters} L – {selectedListing.volumeLiters} L
                </div>
              </div>

              {/* Quick volume presets */}
              <div className="flex flex-wrap gap-2">
                {[selectedListing.minOrderLiters, Math.round(selectedListing.volumeLiters * 0.5), selectedListing.volumeLiters].map((preset) => (
                  <button
                    key={`vol-preset-${preset}`}
                    onClick={() => { setVolumeInput(preset.toString()); setVolumeError(''); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                      parseInt(volumeInput) === preset
                        ? 'border-primary bg-primary/10 text-primary' :'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {preset} L
                  </button>
                ))}
              </div>

              {/* Live estimate */}
              {volume > 0 && !volumeError && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                  <span className="text-xs text-muted-foreground">Estimated oil cost</span>
                  <span className="text-sm font-bold text-foreground">
                    ₹{(volume * selectedListing.pricePerLiter).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery location */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-primary" /> Delivery Location
            </h3>
            <div className="flex flex-col gap-2">
              {deliveryLocations.map((loc) => (
                <label
                  key={`delivery-loc-${loc.id}`}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                    selectedLocationId === loc.id
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery-location"
                    value={loc.id}
                    checked={selectedLocationId === loc.id}
                    onChange={() => setSelectedLocationId(loc.id)}
                    className="mt-0.5 accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{loc.label}</div>
                    {loc.address && (
                      <div className="text-xs text-muted-foreground mt-0.5">{loc.address}</div>
                    )}
                    {loc.id === 'loc-4' && (
                      <div className="text-xs text-muted-foreground mt-0.5">Enter a custom delivery address below</div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* Custom address fields */}
            {selectedLocationId === 'loc-4' && (
              <div className="mt-4 flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                    Street Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="Plot / Survey No., Area, Landmark"
                    className="input-field w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">City</label>
                    <input
                      type="text"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      placeholder="City"
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">State</label>
                    <input
                      type="text"
                      value={customState}
                      onChange={(e) => setCustomState(e.target.value)}
                      placeholder="State"
                      className="input-field w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Additional Notes <span className="text-xs font-normal text-muted-foreground">(optional)</span></h3>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Any special instructions, preferred pickup window, or quality requirements…"
              rows={3}
              className="input-field w-full resize-none"
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={() => setStep('select-listing')} className="btn-secondary flex items-center gap-2">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleProceedToReview}
              disabled={!volumeInput || !!volumeError}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Review Order <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Review & Confirm ── */}
      {step === 'review-confirm' && selectedListing && costs && (
        <div className="flex flex-col gap-5 max-w-2xl">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <ReceiptText size={18} className="text-primary" />
              <h3 className="text-sm font-bold text-foreground">Order Summary</h3>
            </div>

            {/* Listing info */}
            <div className="flex flex-col gap-1 pb-4 border-b border-border mb-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Listing Details</div>
              {[
                { label: 'Listing ID', value: selectedListing.id },
                { label: 'Oil Type', value: `${selectedListing.oilType} UCO` },
                { label: 'Grade', value: `Grade ${selectedListing.gradeLabel}` },
                { label: 'Seller Ref', value: selectedListing.sellerRef },
                { label: 'Source Location', value: `${selectedListing.city}, ${selectedListing.state}` },
                { label: 'Available From', value: selectedListing.availableFrom },
              ].map((row) => (
                <div key={`review-listing-${row.label}`} className="flex justify-between py-1.5">
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <span className="text-xs font-semibold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Order details */}
            <div className="flex flex-col gap-1 pb-4 border-b border-border mb-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Order Details</div>
              {[
                { label: 'Volume Ordered', value: `${volume.toLocaleString('en-IN')} L` },
                { label: 'Delivery Location', value: selectedLocationId === 'loc-4' ? `${customAddress}, ${customCity}` : selectedLocation?.label ?? '' },
                { label: 'Delivery Address', value: selectedLocationId === 'loc-4' ? `${customCity}, ${customState}` : selectedLocation?.address ?? '' },
              ].map((row) => (
                <div key={`review-order-${row.label}`} className="flex justify-between py-1.5">
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <span className="text-xs font-semibold text-foreground text-right max-w-[55%]">{row.value}</span>
                </div>
              ))}
              {orderNotes && (
                <div className="flex justify-between py-1.5">
                  <span className="text-xs text-muted-foreground">Notes</span>
                  <span className="text-xs font-semibold text-foreground text-right max-w-[55%]">{orderNotes}</span>
                </div>
              )}
            </div>

            {/* Itemized cost breakdown */}
            <div className="flex flex-col gap-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cost Breakdown</div>
              {[
                { label: `Oil Cost (${volume} L × ₹${selectedListing.pricePerLiter}/L)`, value: costs.oilCost, muted: false },
                { label: `Transport & Handling (₹${TRANSPORT_RATE_PER_LITER}/L)`, value: costs.transport, muted: false },
                { label: `Platform Fee (${(PLATFORM_FEE_RATE * 100).toFixed(1)}%)`, value: costs.platformFee, muted: false },
                { label: 'Subtotal', value: costs.subtotal, muted: true },
                { label: `GST (${(GST_RATE * 100).toFixed(0)}%)`, value: costs.gst, muted: false },
              ].map((row) => (
                <div
                  key={`cost-row-${row.label}`}
                  className={`flex justify-between py-1.5 ${row.muted ? 'border-t border-border mt-1 pt-2' : ''}`}
                >
                  <span className={`text-xs ${row.muted ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{row.label}</span>
                  <span className={`text-xs font-semibold ${row.muted ? 'text-foreground' : 'text-foreground'}`}>
                    ₹{row.value.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-between items-center py-3 mt-2 border-t-2 border-primary/30 bg-primary/5 rounded-xl px-3">
                <span className="text-sm font-bold text-foreground">Total Payable</span>
                <span className="text-lg font-extrabold text-primary">₹{costs.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Trust note */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
            <ShieldCheck size={18} className="text-success flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">TUCOR Verified Transaction.</span> Payment is only released to the seller after successful delivery confirmation. Your order is protected under TUCOR's buyer assurance policy.
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={() => setStep('order-details')} className="btn-secondary flex items-center gap-2">
              <ChevronLeft size={16} /> Edit Order
            </button>
            <button
              onClick={handleConfirmOrder}
              disabled={submitting}
              className="btn-primary flex items-center gap-2 min-w-[160px] justify-center disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                  Placing Order…
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Confirm Order
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
