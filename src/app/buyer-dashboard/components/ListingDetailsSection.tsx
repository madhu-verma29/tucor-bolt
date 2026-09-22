'use client';

import React, { useState } from 'react';
import { ArrowLeft, MapPin, Package, Award, Calendar, Truck, Shield, CheckCircle2, AlertCircle, Zap, Info } from 'lucide-react';
import { buyerApi, type UCOMarketListing } from '@/lib/buyer-api';
import Icon from '@/components/ui/AppIcon';
import RequestConfirmationModal from './RequestConfirmationModal';
import { toast } from 'sonner';


interface Props {
  listing: UCOMarketListing;
  onBack: () => void;
  onRequestSuccess: () => void;
}

const gradeDescriptions: Record<string, string> = {
  A: 'Premium quality — low FFA, minimal moisture, suitable for high-yield biodiesel production',
  B: 'Standard quality — moderate FFA, suitable for most biodiesel and industrial applications',
  C: 'Basic quality — higher FFA content, suitable for lower-grade industrial use',
};

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

export default function ListingDetailsSection({ listing, onBack, onRequestSuccess }: Props) {
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestedVolume, setRequestedVolume] = useState(listing.volumeLiters.toString());
  const [useCase, setUseCase] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [volumeError, setVolumeError] = useState('');
  const [orderId, setOrderId] = useState('');

  const totalEstimate = parseInt(requestedVolume || '0') * listing.pricePerLiter;

  const validateVolume = (val: string) => {
    const v = parseInt(val);
    if (!val || isNaN(v)) { setVolumeError('Please enter a valid volume'); return false; }
    if (v < listing.minOrderLiters) { setVolumeError(`Minimum order is ${listing.minOrderLiters} L`); return false; }
    if (v > listing.volumeLiters) { setVolumeError(`Maximum available is ${listing.volumeLiters} L`); return false; }
    setVolumeError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateVolume(requestedVolume)) throw new Error('Enter a valid order volume');
    try {
      const profile = await buyerApi.profile();
      const deliveryAddress = [profile.address, profile.city, profile.state, profile.pincode].filter(Boolean).join(', ');
      if (!deliveryAddress) throw new Error('Add a delivery address to your buyer profile before ordering');
      const orderNotes = [useCase ? `Intended use: ${useCase}` : '', notes].filter(Boolean).join('\n');
      const created = await buyerApi.createOrder({listingId:listing.id,volumeLiters:Number(requestedVolume),deliveryAddress,notes:orderNotes||undefined});
      setOrderId(created.id);
      setRequestModalOpen(false);
      setSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create order');
      throw error;
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-success" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Request Submitted!</h2>
          <p className="text-muted-foreground max-w-md">
            Your procurement request for <strong>{requestedVolume} L</strong> of <strong>{listing.oilType} UCO</strong> has been received.
            TUCOR will review and match you with the seller within 24–48 hours.
          </p>
        </div>
        <div className="card p-5 max-w-sm w-full text-left">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Request Summary</div>
          {[
            { label: 'Order ID', value: orderId },
            { label: 'Listing ID', value: listing.id },
            { label: 'Oil Type', value: `${listing.oilType} — Grade ${listing.gradeLabel}` },
            { label: 'Volume Requested', value: `${requestedVolume} L` },
            { label: 'Estimated Value', value: `₹${totalEstimate.toLocaleString('en-IN')}` },
            { label: 'Location', value: `${listing.city}, ${listing.state}` },
            { label: 'Status', value: 'Under TUCOR Review' },
          ].map((item) => (
            <div key={`req-summary-${item.label}`} className="flex justify-between py-1.5 border-b border-border last:border-0">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-xs font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onRequestSuccess} className="btn-primary">View Active Orders</button>
          <button onClick={onBack} className="btn-secondary">Back to Search</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back nav */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 w-fit"
      >
        <ArrowLeft size={16} />
        Back to Search
      </button>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-lg text-sm font-semibold ${oilTypeColors[listing.oilType]}`}>{listing.oilType} Oil</span>
            <span className={`px-2.5 py-1 rounded-lg text-sm font-bold ${gradeColors[listing.gradeLabel]}`}>Grade {listing.gradeLabel}</span>
            <span className="badge-active">Available</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{listing.oilType} UCO — {listing.volumeLiters} L</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <MapPin size={14} className="text-primary" />
            <span>{listing.city}, {listing.state} · {listing.region}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-foreground">₹{listing.pricePerLiter}<span className="text-base font-normal text-muted-foreground">/L</span></div>
          <div className="text-sm text-muted-foreground">Total ≈ ₹{(listing.volumeLiters * listing.pricePerLiter).toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main details */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Key specs */}
          <div className="card p-5">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Listing Details</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: Package, label: 'Volume Available', value: `${listing.volumeLiters} L` },
                { icon: Package, label: 'Min. Order', value: `${listing.minOrderLiters} L` },
                { icon: Calendar, label: 'Available From', value: listing.availableFrom },
                { icon: Truck, label: 'Collection', value: listing.collectionFrequency },
                { icon: MapPin, label: 'Location', value: listing.city },
                { icon: Award, label: 'Listing ID', value: listing.id },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={`spec-${item.label}`} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon size={12} className="text-primary" />
                      {item.label}
                    </div>
                    <div className="font-mono-data text-sm font-semibold text-foreground">{item.value}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quality analysis */}
          <div className="card p-5">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Quality Analysis</div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border mb-4">
              <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${gradeColors[listing.gradeLabel]}`}>Grade {listing.gradeLabel}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{gradeDescriptions[listing.gradeLabel]}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Moisture Content', value: listing.moistureContent || 'N/A' },
                { label: 'Acid Value', value: listing.acidValue || 'N/A' },
                { label: 'Free Fatty Acid', value: listing.ffa || 'N/A' },
                { label: 'Iodine Value', value: listing.iodineValue ? `${listing.iodineValue} g/100g` : 'N/A' },
              ].map((q) => (
                <div key={`quality-${q.label}`} className="p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">{q.label}</div>
                  <div className="font-mono-data text-sm font-bold text-foreground">{q.value}</div>
                </div>
              ))}
            </div>
            {listing.qualityNotes && (
              <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                <Info size={12} className="flex-shrink-0 mt-0.5 text-primary" />
                <span>{listing.qualityNotes}</span>
              </div>
            )}
          </div>

          {/* TUCOR process */}
          <div className="card p-5">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">How TUCOR Manages This Transaction</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { step: '01', title: 'Request Submitted', desc: 'TUCOR receives and reviews your procurement request' },
                { step: '02', title: 'Matching & Confirmation', desc: 'TUCOR matches you with the verified seller and confirms terms' },
                { step: '03', title: 'Pickup Scheduled', desc: 'TUCOR coordinates pickup logistics from seller location' },
                { step: '04', title: 'Delivery & Settlement', desc: 'UCO delivered to you; payment settled through TUCOR' },
              ].map((s) => (
                <div key={`process-${s.step}`} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{s.step}</div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Request panel */}
        <div className="flex flex-col gap-4">
          <div className="card p-5 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-primary" />
              <span className="font-semibold text-foreground text-sm">Request Through TUCOR</span>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Volume Required (Liters)
                </label>
                <input
                  type="number"
                  value={requestedVolume}
                  onChange={(e) => { setRequestedVolume(e.target.value); validateVolume(e.target.value); }}
                  min={listing.minOrderLiters}
                  max={listing.volumeLiters}
                  className={`w-full px-3 py-2.5 rounded-xl border bg-muted text-foreground text-sm outline-none transition-colors ${volumeError ? 'border-danger' : 'border-border focus:border-ring'}`}
                />
                {volumeError ? (
                  <p className="text-xs text-danger mt-1 flex items-center gap-1"><AlertCircle size={11} />{volumeError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Min {listing.minOrderLiters} L · Max {listing.volumeLiters} L</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Intended Use
                </label>
                <select
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-foreground text-sm outline-none focus:border-ring transition-colors"
                >
                  <option value="">Select use case</option>
                  <option value="biodiesel">Biodiesel Production</option>
                  <option value="industrial">Industrial Processing</option>
                  <option value="animal_feed">Animal Feed Supplement</option>
                  <option value="soap">Soap / Oleochemical</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requirements, preferred pickup dates, etc."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-foreground text-sm outline-none focus:border-ring transition-colors resize-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Estimate */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-border mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Volume</span>
                <span className="font-semibold text-foreground">{requestedVolume || 0} L</span>
              </div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-semibold text-foreground">₹{listing.pricePerLiter}/L</span>
              </div>
              <div className="border-t border-border pt-1.5 flex justify-between text-sm">
                <span className="font-semibold text-foreground">Estimated Total</span>
                <span className="font-extrabold text-primary">₹{totalEstimate.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">* Final price confirmed by TUCOR after matching</p>
            </div>

            <button
              onClick={() => setRequestModalOpen(true)}
              disabled={!!volumeError || !requestedVolume}
              className="w-full btn-primary py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap size={15} className="inline mr-1.5" />
              Request Through TUCOR
            </button>

            <div className="mt-3 flex flex-col gap-1.5">
              {['Seller identity kept confidential', 'TUCOR manages all logistics', 'Secure payment settlement'].map((t) => (
                <div key={`trust-${t}`} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 size={11} className="text-success flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {requestModalOpen && (
        <RequestConfirmationModal
          listing={listing}
          requestedVolume={parseInt(requestedVolume || '0')}
          useCase={useCase}
          notes={notes}
          onClose={() => setRequestModalOpen(false)}
          onConfirm={handleSubmit}
        />
      )}
    </div>
  );
}
