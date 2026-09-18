'use client';

import { buyerApi } from '@/lib/buyer-api';
import React, { useEffect, useState, useRef } from 'react';
import { Bell, Shield, User, Eye, EyeOff, Save, Smartphone, Mail, CheckCircle2, CreditCard, Undo2, X, AlertCircle } from 'lucide-react';

type Tab = 'account' | 'notifications' | 'security' | 'payment';

interface SaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
}

interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
  undoAction?: () => void;
}

function InlineToast({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto transition-all duration-300 ${
            t.type === 'success' ? 'bg-success text-white' : t.type === 'error' ? 'bg-destructive text-white' : 'bg-foreground text-background'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 size={15} />}
          {t.type === 'error' && <AlertCircle size={15} />}
          <span>{t.message}</span>
          {t.undoAction && (
            <button
              onClick={() => { t.undoAction!(); onDismiss(t.id); }}
              className="flex items-center gap-1 ml-1 underline underline-offset-2 opacity-90 hover:opacity-100"
            >
              <Undo2 size={13} />
              Undo
            </button>
          )}
          <button onClick={() => onDismiss(t.id)} className="ml-1 opacity-70 hover:opacity-100">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function BuyerSettingsSection() {
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [showPassword, setShowPassword] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const initialAccountForm = {
    ownerName: '', email: '', phone: '', gstNumber: '', businessName: '', bankName: '', bankAccount: '', ifsc: '', accountType: '',
  };
  const [accountForm, setAccountForm] = useState(initialAccountForm);
  const [savedAccountForm, setSavedAccountForm] = useState(initialAccountForm);
  const [accountDirty, setAccountDirty] = useState(false);

  const initialNotifSettings = {
    emailOrders: true,
    emailPickups: true,
    emailPayments: true,
    smsPickups: true,
    smsPayments: false,
    appAll: true,
  };
  const [notifSettings, setNotifSettings] = useState(initialNotifSettings);
  const [savedNotifSettings, setSavedNotifSettings] = useState(initialNotifSettings);

  const [passwordFields, setPasswordFields] = useState({ current: '', newPwd: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  useEffect(()=>{Promise.all([buyerApi.settingsAccount(),buyerApi.notificationSettings(),buyerApi.bankAccounts()]).then(([a,n,b])=>{const primary=b.find((x:any)=>x.primary)||b[0];const f={ownerName:a.fullName||'',email:a.email||'',phone:a.phone||'',gstNumber:a.gstNumber||'',businessName:a.businessName||'',bankName:primary?.bankName||'',bankAccount:primary?.accountNumber||'',ifsc:primary?.ifsc||'',accountType:primary?.accountType||''};setAccountForm(f);setSavedAccountForm(f);setNotifSettings(n);setSavedNotifSettings(n)}).catch(()=>{})},[]);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'payment', label: 'Payment', icon: CreditCard },
  ];

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    toastTimers.current[id] = setTimeout(() => dismissToast(id), 4000);
  };

  const dismissToast = (id: string) => {
    clearTimeout(toastTimers.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setSectionSaveState = (key: string, state: SaveState) => {
    setSaveState((prev) => ({ ...prev, [key]: state }));
  };

  const handleAccountSave = async () => {setSectionSaveState('account',{status:'saving'});try{await buyerApi.updateSettingsAccount({fullName:accountForm.ownerName,phone:accountForm.phone.replace(/\D/g,'').slice(-10)});setSavedAccountForm({...accountForm});setAccountDirty(false);setSectionSaveState('account',{status:'saved'});addToast({type:'success',message:'Account information saved.'})}catch(e){setSectionSaveState('account',{status:'error'});addToast({type:'error',message:e instanceof Error?e.message:'Save failed'})}};

  const handleAccountCancel = () => {
    setAccountForm({ ...savedAccountForm });
    setAccountDirty(false);
    addToast({ type: 'info', message: 'Changes discarded.' });
  };

  const handleNotifSave = async () => {setSectionSaveState('notif',{status:'saving'});try{const n=await buyerApi.updateNotificationSettings(notifSettings);setNotifSettings(n);setSavedNotifSettings(n);setSectionSaveState('notif',{status:'saved'});addToast({type:'success',message:'Notification preferences saved.'})}catch(e){setSectionSaveState('notif',{status:'error'});addToast({type:'error',message:e instanceof Error?e.message:'Save failed'})}};

  const handlePasswordUpdate = async () => {setPasswordError('');if(!passwordFields.current){setPasswordError('Current password is required.');return}if(passwordFields.newPwd.length<8){setPasswordError('New password must be at least 8 characters.');return}if(passwordFields.newPwd!==passwordFields.confirm){setPasswordError('Passwords do not match.');return}setSectionSaveState('password',{status:'saving'});try{await buyerApi.changePassword({currentPassword:passwordFields.current,newPassword:passwordFields.newPwd});setPasswordFields({current:'',newPwd:'',confirm:''});setSectionSaveState('password',{status:'saved'});addToast({type:'success',message:'Password updated successfully.'})}catch(e){setSectionSaveState('password',{status:'error'});setPasswordError(e instanceof Error?e.message:'Password update failed')}};

  const SaveButton = ({ sectionKey, label, onClick, icon: BtnIcon }: { sectionKey: string; label: string; onClick: () => void; icon: React.ElementType }) => {
    const state = saveState[sectionKey];
    const isSaving = state?.status === 'saving';
    const isSaved = state?.status === 'saved';
    const IconComponent = BtnIcon as React.ElementType;
    return (
      <button
        onClick={onClick}
        disabled={isSaving}
        className={`btn-primary py-2 text-sm gap-2 transition-all duration-200 ${isSaved ? 'bg-success border-success' : ''}`}
      >
        {isSaving ? (
          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : isSaved ? (
          <CheckCircle2 size={14} />
        ) : (
          <IconComponent size={14} />
        )}
        {isSaving ? 'Saving…' : isSaved ? 'Saved!' : label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <InlineToast toasts={toasts} onDismiss={dismissToast} />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account preferences, notifications, and security
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-xl w-fit flex-wrap">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={`buyer-settings-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TabIcon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Account tab */}
      {activeTab === 'account' && (
        <div className="card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-base">Account Information</h3>
            {accountDirty && (
              <span className="text-xs text-warning font-medium flex items-center gap-1">
                <AlertCircle size={12} />
                Unsaved changes
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Contact Name', key: 'ownerName', type: 'text' },
              { label: 'Email Address', key: 'email', type: 'email' },
              { label: 'Phone Number', key: 'phone', type: 'tel' },
            ].map((field) => (
              <div key={`buyer-acc-field-${field.key}`}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  value={accountForm[field.key as keyof typeof accountForm]}
                  onChange={(e) => {
                    setAccountForm((prev) => ({ ...prev, [field.key]: e.target.value }));
                    setAccountDirty(true);
                  }}
                  className="w-full px-3.5 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-150"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">GST Number</label>
              <input
                type="text"
                value={accountForm.gstNumber || ''}
                disabled
                className="w-full px-3.5 py-2.5 text-sm bg-muted/50 border border-border rounded-xl text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">Contact support to update GST details</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <SaveButton sectionKey="account" label="Save Changes" onClick={handleAccountSave} icon={Save} />
            <button
              onClick={handleAccountCancel}
              disabled={!accountDirty}
              className="btn-secondary py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === 'notifications' && (
        <div className="card p-6 flex flex-col gap-5">
          <h3 className="font-bold text-foreground text-base">Notification Preferences</h3>
          {[
            { section: 'Email Notifications', icon: Mail, items: [
              { key: 'emailOrders', label: 'Order status updates', desc: 'Confirmations, matches, and status changes' },
              { key: 'emailPickups', label: 'Pickup confirmations', desc: 'Scheduled pickup details and reminders' },
              { key: 'emailPayments', label: 'Payment receipts', desc: 'Invoice and payment confirmation emails' },
            ]},
            { section: 'SMS Notifications', icon: Smartphone, items: [
              { key: 'smsPickups', label: 'Pickup day alerts', desc: 'SMS reminder on pickup day' },
              { key: 'smsPayments', label: 'Payment alerts', desc: 'SMS when payment is processed' },
            ]},
            { section: 'In-App', icon: Bell, items: [
              { key: 'appAll', label: 'All platform notifications', desc: 'Receive all TUCOR alerts in-app' },
            ]},
          ].map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={`buyer-notif-group-${group.section}`}>
                <div className="flex items-center gap-2 mb-3">
                  <GroupIcon size={15} className="text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">{group.section}</h4>
                </div>
                <div className="flex flex-col gap-3">
                  {group.items.map((item) => (
                    <div key={`buyer-notif-item-${item.key}`} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifSettings((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                          notifSettings[item.key as keyof typeof notifSettings] ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                          notifSettings[item.key as keyof typeof notifSettings] ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-3 pt-1">
            <SaveButton sectionKey="notif" label="Save Preferences" onClick={handleNotifSave} icon={Save} />
            <button
              onClick={() => {
                setNotifSettings({ ...savedNotifSettings });
                addToast({ type: 'info', message: 'Notification changes discarded.' });
              }}
              className="btn-secondary py-2 text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div className="flex flex-col gap-4">
          <div className="card p-6 flex flex-col gap-4">
            <h3 className="font-bold text-foreground text-base">Change Password</h3>
            {[
              { label: 'Current Password', key: 'current' },
              { label: 'New Password', key: 'newPwd' },
              { label: 'Confirm New Password', key: 'confirm' },
            ].map((field, i) => (
              <div key={`buyer-pwd-field-${i}`}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{field.label}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordFields[field.key as keyof typeof passwordFields]}
                    onChange={(e) => setPasswordFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className={`w-full px-3.5 py-2.5 pr-10 text-sm bg-muted border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-150 ${
                      passwordError ? 'border-destructive/50' : 'border-border'
                    }`}
                  />
                  {i === 0 && (
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {passwordError && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle size={13} className="text-destructive flex-shrink-0" />
                <p className="text-xs text-destructive font-medium">{passwordError}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <SaveButton sectionKey="password" label="Update Password" onClick={handlePasswordUpdate} icon={Shield} />
              <button
                onClick={() => { setPasswordFields({ current: '', newPwd: '', confirm: '' }); setPasswordError(''); }}
                className="btn-secondary py-2 text-sm"
              >
                Clear
              </button>
            </div>
            {saveState['password']?.status === 'saved' && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20">
                <CheckCircle2 size={14} className="text-success" />
                <p className="text-xs text-success font-semibold">Password updated successfully. Please use your new password on next login.</p>
              </div>
            )}
          </div>
          <div className="card p-6">
            <h3 className="font-bold text-foreground text-base mb-4">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <Smartphone size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">SMS Authentication</p>
                  <p className="text-xs text-muted-foreground">SMS authentication is not enabled until an OTP provider is configured</p>
                </div>
              </div>
              <span className="badge-muted text-xs">Not configured</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment tab */}
      {activeTab === 'payment' && (
        <div className="card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-base">Payment Preferences</h3>
            <span className="badge-muted text-xs">Linked account</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Company Name', value: accountForm.businessName || '—' },
              { label: 'Bank Name', value: accountForm.bankName || '—' },
              { label: 'Account Number', value: accountForm.bankAccount || '—' },
              { label: 'IFSC Code', value: accountForm.ifsc || '—' },
              { label: 'Account Type', value: accountForm.accountType || '—' },
              { label: 'Default Payment', value: accountForm.bankName ? 'Linked bank account' : 'Not configured' },
            ].map((field) => (
              <div key={`buyer-pay-field-${field.label}`}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{field.label}</label>
                <input
                  type="text"
                  value={field.value}
                  disabled
                  className="w-full px-3.5 py-2.5 text-sm bg-muted/50 border border-border rounded-xl text-foreground cursor-not-allowed"
                />
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-info-bg border border-info/20">
            <p className="text-xs text-info font-medium">To update payment details, please contact TUCOR support at support@tucor.in</p>
          </div>
        </div>
      )}
    </div>
  );
}
