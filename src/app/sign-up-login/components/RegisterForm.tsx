'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Check, Upload, ChevronRight, ChevronLeft, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/auth-api';

type Role = 'Seller' | 'Buyer';

interface RegisterData {
  businessName: string;
  businessType: string;
  gstNumber: string;
  fssaiNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  estimatedVolumeMonthly: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

const STEPS = ['Role', 'Business', 'Account', 'Verify'];

const sellerBusinessTypes = ['Restaurant', 'Hotel', 'Cloud Kitchen', 'Canteen / Cafeteria', 'Catering Company', 'Food Processing Unit', 'Other'];
const buyerBusinessTypes = ['Biodiesel Manufacturer', 'UCO Aggregator', 'Oleochemical Plant', 'Animal Feed Processor', 'Export Refiner', 'Renewable Energy Company', 'Other'];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-danger', 'bg-warning', 'bg-accent', 'bg-success'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`strength-bar-${i}`}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-border'}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{score > 0 ? labels[score] : 'Enter password'}</span>
        <div className="flex gap-2">
          {checks.map((c) => (
            <span
              key={`pw-check-${c.label}`}
              className={`text-xs ${c.pass ? 'text-success' : 'text-muted-foreground'}`}
              title={c.label}
            >
              {c.pass ? '✓' : '·'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RegisterForm({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [documentFiles, setDocumentFiles] = useState<Record<string, File>>({});

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterData>();

  const password = watch('password', '');

  const handleNext = async () => {
    const fieldMap: Record<number, (keyof RegisterData)[]> = {
      1: ['businessName', 'businessType', 'gstNumber', 'address', 'city', 'state', 'pincode'],
      2: ['fullName', 'email', 'phone', 'password', 'confirmPassword'],
    };
    if (step === 1 || step === 2) {
      const valid = await trigger(fieldMap[step]);
      if (!valid) return;
    }
    if (step === 0 && !role) {
      toast.error('Please select your role to continue');
      return;
    }
    setStep((s) => s + 1);
  };

  const handleDocUpload = (docName: string, file?: File) => {
    if (!file) return;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) { toast.error('Only PDF, JPG and PNG files are allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Maximum file size is 5MB'); return; }
    setDocumentFiles((prev) => ({ ...prev, [docName]: file }));
    if (!uploadedDocs.includes(docName)) setUploadedDocs((prev) => [...prev, docName]);
    toast.success(`${docName} selected successfully`);
  };

  const onSubmit = async (data: RegisterData) => {
    if (!data.agreeTerms) {
      toast.error('Please accept the Terms of Service to continue');
      return;
    }
    if (!role) {
      toast.error('Please select your role to continue');
      return;
    }
    setLoading(true);
    try {
      const requiredDocs = ['GST Certificate', role === 'Seller' ? 'FSSAI License' : 'Business Registration', 'Address Proof (Utility Bill / Lease)'];
      if (requiredDocs.some((name) => !documentFiles[name])) { toast.error('Please upload all required documents'); return; }
      const registration = await authApi.register({
        email: data.email, password: data.password, role: role === 'Buyer' ? 'BUYER' : 'SELLER',
        businessName: data.businessName, businessType: data.businessType, gstNumber: data.gstNumber,
        registrationNumber: data.fssaiNumber || undefined, address: data.address, city: data.city,
        state: data.state, pincode: data.pincode, estimatedVolumeMonthly: data.estimatedVolumeMonthly || undefined,
        fullName: data.fullName, phone: data.phone
      });
      const docTypes: Record<string,string> = {
        'GST Certificate':'GST', 'FSSAI License':'FSSAI_OR_REGISTRATION', 'Business Registration':'FSSAI_OR_REGISTRATION',
        'Address Proof (Utility Bill / Lease)':'ADDRESS_PROOF', 'Cancelled Cheque / Bank Statement':'BANK_PROOF'
      };
      await Promise.all(Object.entries(documentFiles).map(([name,file]) => authApi.uploadRegistrationDocument(registration.accessToken, docTypes[name], file)));
      setSubmitted(true);
      toast.success('Registration submitted successfully. You can now sign in.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-5">
          <Check size={28} className="text-success" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Registration Submitted!</h3>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          Your business account is under review. TUCOR verifies all accounts within 24–48 hours. Check your email for updates.
        </p>
        <div className="card p-4 mb-6 text-left">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">What happens next?</div>
          {['Email verification link sent', 'Document review (24–48 hrs)', 'Account activation notification', 'First listing / search enabled'].map((step, i) => (
            <div key={`next-step-${i}`} className="flex items-center gap-2 text-sm text-foreground py-1.5 border-b border-border last:border-0">
              <span className="w-5 h-5 rounded-full bg-secondary text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              {step}
            </div>
          ))}
        </div>
        <button onClick={onLogin} className="btn-primary w-full justify-center">
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <h2 className="text-2xl font-bold text-foreground mb-1">Create Your Account</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Already registered?{' '}
        <button onClick={onLogin} className="text-primary font-semibold hover:underline">
          Sign in
        </button>
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <React.Fragment key={`reg-step-${label}`}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  i < step
                    ? 'bg-success text-white'
                    : i === step
                    ? 'bg-primary text-white' :'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${i === step ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-1 transition-colors duration-200 ${i < step ? 'bg-success' : 'bg-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Role Selection */}
      {step === 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground mb-2">I want to join TUCOR as a...</p>
          {(['Seller', 'Buyer'] as Role[]).map((r) => (
            <button
              key={`role-${r}`}
              onClick={() => setRole(r)}
              className={`card p-5 text-left transition-all duration-200 hover:shadow-card-hover ${
                role === r ? 'ring-2 ring-primary shadow-card-hover' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{r === 'Seller' ? '🍳' : '🏭'}</div>
                <div>
                  <div className="font-bold text-foreground mb-1">{r === 'Seller' ? 'UCO Seller' : 'UCO Buyer'}</div>
                  <div className="text-sm text-muted-foreground">
                    {r === 'Seller' ?'Restaurant, hotel, cloud kitchen, or canteen with used cooking oil to sell.' :'Biodiesel manufacturer, recycler, or aggregator sourcing UCO feedstock.'}
                  </div>
                  {role === r && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(r === 'Seller'
                        ? ['Earn from waste oil', 'Scheduled pickups', 'FSSAI-compliant disposal']
                        : ['Verified UCO supply', 'Quality graded A/B/C', 'Full traceability']
                      ).map((tag) => (
                        <span key={`role-tag-${tag}`} className="badge-active text-xs">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                {role === r && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check size={13} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
          <button onClick={handleNext} className="btn-primary w-full justify-center mt-2">
            Continue <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Step 1: Business Details */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="label-text">Business Name</label>
            <input
              type="text"
              className={`input-field ${errors.businessName ? 'border-danger' : ''}`}
              placeholder="Spice Route Cloud Kitchens Pvt. Ltd."
              {...register('businessName', { required: 'Business name is required' })}
            />
            {errors.businessName && <p className="error-text">{errors.businessName.message}</p>}
          </div>

          <div>
            <label className="label-text">Business Type</label>
            <select
              className={`input-field ${errors.businessType ? 'border-danger' : ''}`}
              {...register('businessType', { required: 'Business type is required' })}
            >
              <option value="">Select business type</option>
              {(role === 'Seller' ? sellerBusinessTypes : buyerBusinessTypes).map((type) => (
                <option key={`biz-type-${type}`} value={type}>{type}</option>
              ))}
            </select>
            {errors.businessType && <p className="error-text">{errors.businessType.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">GST Number</label>
              <input
                type="text"
                className={`input-field font-mono text-sm ${errors.gstNumber ? 'border-danger' : ''}`}
                placeholder="27AABCS1429B1ZB"
                {...register('gstNumber', {
                  required: 'GST number is required',
                  pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invalid GST format' },
                })}
              />
              {errors.gstNumber && <p className="error-text">{errors.gstNumber.message}</p>}
            </div>
            <div>
              <label className="label-text">
                {role === 'Seller' ? 'FSSAI Number' : 'Business Reg. No.'}
              </label>
              <input
                type="text"
                className="input-field font-mono text-sm"
                placeholder={role === 'Seller' ? 'FSS-MH-2024-08812' : 'CIN / Reg. No.'}
                {...register('fssaiNumber')}
              />
            </div>
          </div>

          <div>
            <label className="label-text">Business Address</label>
            <input
              type="text"
              className={`input-field ${errors.address ? 'border-danger' : ''}`}
              placeholder="Unit 4B, Andheri Industrial Estate"
              {...register('address', { required: 'Address is required' })}
            />
            {errors.address && <p className="error-text">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label-text">City</label>
              <input
                type="text"
                className={`input-field ${errors.city ? 'border-danger' : ''}`}
                placeholder="Mumbai"
                {...register('city', { required: 'City required' })}
              />
              {errors.city && <p className="error-text">{errors.city.message}</p>}
            </div>
            <div>
              <label className="label-text">State</label>
              <input
                type="text"
                className={`input-field ${errors.state ? 'border-danger' : ''}`}
                placeholder="Maharashtra"
                {...register('state', { required: 'State required' })}
              />
              {errors.state && <p className="error-text">{errors.state.message}</p>}
            </div>
            <div>
              <label className="label-text">Pincode</label>
              <input
                type="text"
                className={`input-field ${errors.pincode ? 'border-danger' : ''}`}
                placeholder="400053"
                {...register('pincode', {
                  required: 'Pincode required',
                  pattern: { value: /^[1-9][0-9]{5}$/, message: 'Invalid pincode' },
                })}
              />
              {errors.pincode && <p className="error-text">{errors.pincode.message}</p>}
            </div>
          </div>

          {role === 'Seller' && (
            <div>
              <label className="label-text">Estimated Monthly UCO Volume (Liters)</label>
              <p className="helper-text">Approximate volume helps TUCOR match you with suitable buyers.</p>
              <select className="input-field mt-1" {...register('estimatedVolumeMonthly')}>
                <option value="">Select range</option>
                {['50–100 L', '100–300 L', '300–600 L', '600–1000 L', '1000+ L'].map((v) => (
                  <option key={`vol-${v}`} value={v}>{v}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1 justify-center">
              <ChevronLeft size={16} /> Back
            </button>
            <button type="button" onClick={handleNext} className="btn-primary flex-1 justify-center">
              Continue <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Account Credentials */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label-text">Full Name</label>
              <input
                type="text"
                className={`input-field ${errors.fullName ? 'border-danger' : ''}`}
                placeholder="Priya Nambiar"
                {...register('fullName', { required: 'Full name is required' })}
              />
              {errors.fullName && <p className="error-text">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="label-text">Email Address</label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'border-danger' : ''}`}
                placeholder="priya@business.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                })}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label-text">Phone Number</label>
              <input
                type="tel"
                className={`input-field ${errors.phone ? 'border-danger' : ''}`}
                placeholder="+91 98200 00000"
                {...register('phone', {
                  required: 'Phone is required',
                  pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit mobile' },
                })}
              />
              {errors.phone && <p className="error-text">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="label-text">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`input-field pr-12 ${errors.password ? 'border-danger' : ''}`}
                placeholder="Create a strong password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
            <PasswordStrength password={password} />
          </div>

          <div>
            <label className="label-text">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                className={`input-field pr-12 ${errors.confirmPassword ? 'border-danger' : ''}`}
                placeholder="Repeat your password"
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: (val) => val === password || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">
              <ChevronLeft size={16} /> Back
            </button>
            <button type="button" onClick={handleNext} className="btn-primary flex-1 justify-center">
              Continue <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Verification & Documents */}
      {step === 3 && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="card p-4 bg-secondary/50">
            <div className="flex items-center gap-2 mb-2">
              <Leaf size={16} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Document Submission</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload your business documents for verification. TUCOR reviews all documents within 24–48 hours. Accepted formats: PDF, JPG, PNG (max 5MB each).
            </p>
          </div>

          {/* Document upload slots */}
          {[
            { id: 'doc-gst', label: 'GST Certificate', required: true },
            { id: 'doc-fssai', label: role === 'Seller' ? 'FSSAI License' : 'Business Registration', required: true },
            { id: 'doc-address', label: 'Address Proof (Utility Bill / Lease)', required: true },
            { id: 'doc-bank', label: 'Cancelled Cheque / Bank Statement', required: false },
          ].map((doc) => {
            const uploaded = uploadedDocs.includes(doc.label);
            return (
              <div key={doc.id}>
                <label className="label-text">
                  {doc.label}
                  {doc.required && <span className="text-danger ml-1">*</span>}
                </label>
                <input id={`file-${doc.id}`} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="hidden" onChange={(e) => handleDocUpload(doc.label, e.target.files?.[0])} />
                <button
                  type="button"
                  onClick={() => document.getElementById(`file-${doc.id}`)?.click()}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed transition-all duration-200 ${
                    uploaded
                      ? 'border-success bg-success-bg' :'border-border hover:border-primary hover:bg-secondary/30'
                  }`}
                >
                  {uploaded ? (
                    <>
                      <Check size={18} className="text-success" />
                      <span className="text-sm font-medium text-success">{doc.label} — Uploaded</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload {doc.label}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}

          {/* Terms */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="agreeTerms"
              className="w-4 h-4 mt-0.5 rounded accent-primary flex-shrink-0"
              {...register('agreeTerms', { required: true })}
            />
            <label htmlFor="agreeTerms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
              I agree to TUCOR's{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>,{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>, and{' '}
              <a href="#" className="text-primary hover:underline">Seller Agreement</a>.
              I confirm all submitted information is accurate.
            </label>
          </div>
          {errors.agreeTerms && <p className="error-text -mt-3">You must accept the terms to continue</p>}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center">
              <ChevronLeft size={16} /> Back
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Registration'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
