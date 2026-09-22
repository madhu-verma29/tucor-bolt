'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  Droplets,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Info,
  Save,
  Send,
  ChevronDown,
} from 'lucide-react';
import { sellerApi, type SellerListingInput, uploadSellerListingDocument } from '@/lib/seller-api';
import { toast } from 'sonner';

interface Props {
  listingId?: string; // if provided, we're in edit mode
  onBack: () => void;
}

interface FormData {
  oilType: string;
  grade: string;
  volumeLiters: string;
  pricePerLiter: string;
  collectionFrequency: string;
  availableFrom: string;
  availableTo: string;
  pickupDays: string[];
  pickupTimeSlot: string;
  location: string;
  storageType: string;
  notes: string;
}

interface UploadedDoc {
  id: string;
  name: string;
  size: string;
  type: string;
  status: 'uploading' | 'done' | 'error';
  file?: File;
  persisted?: boolean;
}

const OIL_TYPES = ['Palm', 'Sunflower', 'Mustard', 'Blended', 'Soybean'];
const GRADES = [
  { value: 'A', label: 'Grade A', desc: 'FFA < 3%, low moisture, filtered' },
  { value: 'B', label: 'Grade B', desc: 'FFA 3–7%, minor impurities' },
  { value: 'C', label: 'Grade C', desc: 'FFA > 7%, mixed or unfiltered' },
];
const FREQUENCIES = ['Weekly', 'Bi-weekly', 'Monthly'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = ['8:00 AM – 12:00 PM', '12:00 PM – 4:00 PM', '4:00 PM – 8:00 PM', 'Flexible'];
const STORAGE_TYPES = ['Sealed drums', 'IBC tanks', 'Open containers', 'Tanker truck', 'Other'];

const ACCEPTED_DOC_TYPES = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE_MB = 10;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CreateListingSection({ listingId, onBack }: Props) {
  const isEdit = Boolean(listingId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    oilType: '',
    grade: '',
    volumeLiters: '',
    pricePerLiter: '',
    collectionFrequency: 'Weekly',
    availableFrom: '',
    availableTo: '',
    pickupDays: [],
    pickupTimeSlot: 'Flexible',
    location: 'Andheri West, Mumbai',
    storageType: 'Sealed drums',
    notes: '',
  });

  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'saving' | 'submitting' | 'success'>('idle');
  const [dragOver, setDragOver] = useState(false);

  useEffect(()=>{if(!listingId)return;Promise.all([sellerApi.listing(listingId),sellerApi.listingDocuments(listingId)]).then(([l,d])=>{setForm({oilType:l.oilType,grade:l.gradeLabel,volumeLiters:String(l.volumeLiters),pricePerLiter:String(l.pricePerLiter),collectionFrequency:l.collectionFrequency,availableFrom:l.availableFrom||'',availableTo:l.availableTo||'',pickupDays:l.pickupDays||[],pickupTimeSlot:l.pickupTimeSlot||'Flexible',location:l.location,storageType:l.storageType||'Sealed drums',notes:l.notes||''});setDocs(d.map(x=>({id:x.id,name:x.name,size:formatBytes(x.sizeBytes),type:x.contentType,status:'done',persisted:true}))) }).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load listing'))},[listingId]);
  const payload=(status:'Draft'|'Pending Verification'):SellerListingInput=>({oilType:form.oilType,grade:form.grade,volumeLiters:Number(form.volumeLiters)||0,pricePerLiter:Number(form.pricePerLiter)||0,collectionFrequency:form.collectionFrequency,availableFrom:form.availableFrom||undefined,availableTo:form.availableTo||undefined,pickupDays:form.pickupDays,pickupTimeSlot:form.pickupTimeSlot,location:form.location,storageType:form.storageType,notes:form.notes,status});
  const persistDocuments=async(id:string)=>{for(const doc of docs.filter(d=>d.file&&!d.persisted)){await uploadSellerListingDocument(id,doc.file!)} };

  const set = (field: keyof FormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleDay = (day: string) => {
    const days = form.pickupDays.includes(day)
      ? form.pickupDays.filter((d) => d !== day)
      : [...form.pickupDays, day];
    set('pickupDays', days);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.oilType) newErrors.oilType = 'Select an oil type';
    if (!form.grade) newErrors.grade = 'Select a quality grade';
    if (!form.volumeLiters || isNaN(Number(form.volumeLiters)) || Number(form.volumeLiters) <= 0)
      newErrors.volumeLiters = 'Enter a valid volume (> 0 liters)';
    if (!form.pricePerLiter || isNaN(Number(form.pricePerLiter)) || Number(form.pricePerLiter) <= 0)
      newErrors.pricePerLiter = 'Enter a valid price per liter';
    if (!form.availableFrom) newErrors.availableFrom = 'Select availability start date';
    if (!form.location.trim()) newErrors.location = 'Enter pickup location';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    setSubmitStatus('saving');
    try{const saved=isEdit?await sellerApi.updateListing(listingId!,payload('Draft')):await sellerApi.createListing(payload('Draft'));await persistDocuments(saved.id);toast.success('Draft saved');onBack()}catch(e){toast.error(e instanceof Error?e.message:'Unable to save draft');setSubmitStatus('idle')}
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitStatus('submitting');
    try{const saved=isEdit?await sellerApi.updateListing(listingId!,payload('Pending Verification')):await sellerApi.createListing(payload('Pending Verification'));await persistDocuments(saved.id);setSubmitStatus('success')}catch(e){toast.error(e instanceof Error?e.message:'Unable to submit listing');setSubmitStatus('idle')}
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ACCEPTED_DOC_TYPES.includes(ext)) return;
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return;
      const doc: UploadedDoc = {
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: formatBytes(file.size),
        type: ext.replace('.', '').toUpperCase(),
        status: 'done',
        file,
      };
      setDocs((prev) => [...prev, doc]);
    });
  };

  const removeDoc = async (id: string) => {const doc=docs.find(d=>d.id===id);if(doc?.persisted&&listingId){try{await sellerApi.deleteListingDocument(listingId,id)}catch(e){toast.error(e instanceof Error?e.message:'Unable to remove document');return}}setDocs((prev) => prev.filter((d) => d.id !== id));};

  if (submitStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isEdit ? 'Listing Updated!' : 'Listing Submitted!'}
          </h2>
          <p className="text-muted-foreground max-w-sm">
            Your UCO listing has been submitted for TUCOR verification. You'll be notified once it's approved and goes live.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="btn-secondary">
            <ArrowLeft size={16} />
            Back to Listings
          </button>
          <button
            onClick={() => {
              setSubmitStatus('idle');
              setForm({
                oilType: '', grade: '', volumeLiters: '', pricePerLiter: '',
                collectionFrequency: 'Weekly', availableFrom: '', availableTo: '',
                pickupDays: [], pickupTimeSlot: 'Flexible',
                location: 'Andheri West, Mumbai', storageType: 'Sealed drums', notes: '',
              });
              setDocs([]);
            }}
            className="btn-primary"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Edit UCO Listing' : 'Create UCO Listing'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? `Editing listing ${listingId} — changes require re-verification`
              : 'Fill in the details below. Your listing will be reviewed by TUCOR before going live.'}
          </p>
        </div>
      </div>

      {/* Progress hint */}
      <div className="flex items-start gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
        <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Fields marked <span className="text-danger font-semibold">*</span> are required. You can save a draft anytime and submit when ready.
        </p>
      </div>

      {/* ── Section 1: Oil Details ── */}
      <div className="card p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Droplets size={15} className="text-primary" />
          </div>
          <h3 className="font-bold text-foreground">Oil Details</h3>
        </div>

        {/* Oil Type */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Oil Type <span className="text-danger">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {OIL_TYPES.map((type) => (
              <button
                key={`oil-${type}`}
                type="button"
                onClick={() => set('oilType', type)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                  form.oilType === type
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {errors.oilType && (
            <p className="text-xs text-danger flex items-center gap-1">
              <AlertCircle size={12} /> {errors.oilType}
            </p>
          )}
        </div>

        {/* Grade */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Quality Grade <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {GRADES.map((g) => (
              <button
                key={`grade-${g.value}`}
                type="button"
                onClick={() => set('grade', g.value)}
                className={`flex flex-col gap-1 p-3.5 rounded-xl border text-left transition-all duration-150 ${
                  form.grade === g.value
                    ? 'bg-primary/5 border-primary text-foreground'
                    : 'bg-muted/40 border-border hover:border-primary/30 text-muted-foreground'
                }`}
              >
                <span className={`text-sm font-bold ${form.grade === g.value ? 'text-primary' : ''}`}>
                  {g.label}
                </span>
                <span className="text-xs leading-relaxed">{g.desc}</span>
              </button>
            ))}
          </div>
          {errors.grade && (
            <p className="text-xs text-danger flex items-center gap-1">
              <AlertCircle size={12} /> {errors.grade}
            </p>
          )}
        </div>

        {/* Volume + Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">
              Available Volume (Liters) <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                placeholder="e.g. 500"
                value={form.volumeLiters}
                onChange={(e) => set('volumeLiters', e.target.value)}
                className={`input-field pr-12 ${errors.volumeLiters ? 'border-danger' : ''}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">
                L
              </span>
            </div>
            {errors.volumeLiters && (
              <p className="text-xs text-danger flex items-center gap-1">
                <AlertCircle size={12} /> {errors.volumeLiters}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">
              Asking Price (₹ / Liter) <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
                ₹
              </span>
              <input
                type="number"
                min="1"
                placeholder="e.g. 28"
                value={form.pricePerLiter}
                onChange={(e) => set('pricePerLiter', e.target.value)}
                className={`input-field pl-7 ${errors.pricePerLiter ? 'border-danger' : ''}`}
              />
            </div>
            {errors.pricePerLiter && (
              <p className="text-xs text-danger flex items-center gap-1">
                <AlertCircle size={12} /> {errors.pricePerLiter}
              </p>
            )}
            {form.volumeLiters && form.pricePerLiter && !errors.volumeLiters && !errors.pricePerLiter && (
              <p className="text-xs text-primary font-semibold">
                Estimated value: ₹{(Number(form.volumeLiters) * Number(form.pricePerLiter)).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        </div>

        {/* Storage type */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">Storage / Container Type</label>
          <div className="relative">
            <select
              value={form.storageType}
              onChange={(e) => set('storageType', e.target.value)}
              className="input-field appearance-none pr-9"
            >
              {STORAGE_TYPES.map((s) => (
                <option key={`storage-${s}`} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Section 2: Supply Schedule ── */}
      <div className="card p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-sm">📅</span>
          </div>
          <h3 className="font-bold text-foreground">Supply Schedule</h3>
        </div>

        {/* Collection Frequency */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">Collection Frequency</label>
          <div className="flex gap-2 flex-wrap">
            {FREQUENCIES.map((f) => (
              <button
                key={`freq-${f}`}
                type="button"
                onClick={() => set('collectionFrequency', f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                  form.collectionFrequency === f
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Availability window */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">
              Available From <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              value={form.availableFrom}
              onChange={(e) => set('availableFrom', e.target.value)}
              className={`input-field ${errors.availableFrom ? 'border-danger' : ''}`}
            />
            {errors.availableFrom && (
              <p className="text-xs text-danger flex items-center gap-1">
                <AlertCircle size={12} /> {errors.availableFrom}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">Available Until (optional)</label>
            <input
              type="date"
              value={form.availableTo}
              onChange={(e) => set('availableTo', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Preferred pickup days */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">Preferred Pickup Days</label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day) => (
              <button
                key={`day-${day}`}
                type="button"
                onClick={() => toggleDay(day)}
                className={`w-12 h-10 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                  form.pickupDays.includes(day)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Time slot */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">Preferred Pickup Time Slot</label>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={`slot-${slot}`}
                type="button"
                onClick={() => set('pickupTimeSlot', slot)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                  form.pickupTimeSlot === slot
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Pickup location */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Pickup Location / Address <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Andheri West, Mumbai — Gate 2, Warehouse B"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            className={`input-field ${errors.location ? 'border-danger' : ''}`}
          />
          {errors.location && (
            <p className="text-xs text-danger flex items-center gap-1">
              <AlertCircle size={12} /> {errors.location}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">Additional Notes (optional)</label>
          <textarea
            rows={3}
            placeholder="e.g. Oil is filtered and stored in sealed 200L drums. Forklift access available."
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            className="input-field resize-none"
          />
        </div>
      </div>

      {/* ── Section 3: Quality Documents ── */}
      <div className="card p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText size={15} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Quality Documents</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload lab test reports, FSSAI certificates, or quality analysis sheets. Accepted: PDF, JPG, PNG (max {MAX_FILE_SIZE_MB} MB each)
            </p>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-150 ${
            dragOver
              ? 'border-primary bg-primary/5' :'border-border hover:border-primary/40 hover:bg-muted/40'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
            <Upload size={22} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              {dragOver ? 'Drop files here' : 'Drag & drop files or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to {MAX_FILE_SIZE_MB} MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => processFiles(e.target.files)}
          />
        </div>

        {/* Uploaded files list */}
        {docs.length > 0 && (
          <div className="flex flex-col gap-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 px-4 py-3 bg-muted/40 rounded-xl border border-border"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={15} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.type} · {doc.size}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {doc.status === 'uploading' && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {doc.status === 'done' && (
                    <CheckCircle2 size={16} className="text-primary" />
                  )}
                  {doc.status === 'error' && (
                    <AlertCircle size={16} className="text-danger" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeDoc(doc.id)}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-danger transition-colors duration-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Action Bar ── */}
      <div className="flex items-center justify-between gap-4 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost"
        >
          <ArrowLeft size={16} />
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={submitStatus === 'saving'}
            className="btn-secondary"
          >
            {submitStatus === 'saving' ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitStatus === 'submitting'}
            className="btn-primary"
          >
            {submitStatus === 'submitting' ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {isEdit ? 'Update & Resubmit' : 'Submit for Verification'}
          </button>
        </div>
      </div>
    </div>
  );
}
