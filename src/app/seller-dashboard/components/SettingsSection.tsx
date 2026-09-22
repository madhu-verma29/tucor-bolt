'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Settings, Bell, Shield, CreditCard, User, Eye, EyeOff, Save, Smartphone, Mail, CheckCircle2, Undo2, X, AlertCircle } from 'lucide-react';
import { sellerApi, type SellerBankAccount } from '@/lib/seller-api';
import Icon from '@/components/ui/AppIcon';


type Tab = 'account' | 'notifications' | 'security' | 'bank';

interface SaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
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

export default function SettingsSection() {
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [showPassword, setShowPassword] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const initialAccountForm = {
    ownerName: '',
    email: '',
    phone: '',
  };
  const [accountForm, setAccountForm] = useState(initialAccountForm);
  const [savedAccountForm, setSavedAccountForm] = useState(initialAccountForm);
  const [accountDirty, setAccountDirty] = useState(false);

  const initialNotifSettings = {
    emailPayments: true,
    emailPickups: true,
    emailOrders: true,
    smsPickups: true,
    smsPayments: false,
    appAll: true,
  };
  const [notifSettings, setNotifSettings] = useState(initialNotifSettings);
  const [savedNotifSettings, setSavedNotifSettings] = useState(initialNotifSettings);

  const [passwordFields, setPasswordFields] = useState({ current: '', newPwd: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [gstNumber,setGstNumber]=useState('');
  const [bank,setBank]=useState<SellerBankAccount|null>(null);
  useEffect(()=>{Promise.all([sellerApi.settingsAccount(),sellerApi.notificationSettings(),sellerApi.bankAccount()]).then(([a,n,b])=>{const account={ownerName:a.fullName||'',email:a.email||'',phone:a.phone||''};setAccountForm(account);setSavedAccountForm(account);setGstNumber(a.gstNumber||'');setNotifSettings(n);setSavedNotifSettings(n);setBank(b)}).catch(()=>{})},[]);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'bank', label: 'Bank Details', icon: CreditCard },
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

  const handleAccountSave = async () => {
    setSectionSaveState('account', { status: 'saving' });
    const prevForm = { ...savedAccountForm };
    try {
      await sellerApi.updateSettingsAccount({fullName:accountForm.ownerName,email:accountForm.email,phone:accountForm.phone});
      setSavedAccountForm({ ...accountForm });
      setAccountDirty(false);
      setSectionSaveState('account', { status: 'saved' });
      addToast({
        type: 'success',
        message: 'Account information saved.',
        undoAction: async () => {
          await sellerApi.updateSettingsAccount({fullName:prevForm.ownerName,email:prevForm.email,phone:prevForm.phone});
          setAccountForm(prevForm);
          setSavedAccountForm(prevForm);
          setAccountDirty(false);
          setSectionSaveState('account', { status: 'idle' });
          addToast({ type: 'info', message: 'Account changes undone.' });
        },
      });
      setTimeout(() => setSectionSaveState('account', { status: 'idle' }), 3000);
    } catch(e) {setSectionSaveState('account',{status:'error'});addToast({type:'error',message:e instanceof Error?e.message:'Unable to save account information'})}
  };

  const handleAccountCancel = () => {
    setAccountForm({ ...savedAccountForm });
    setAccountDirty(false);
    addToast({ type: 'info', message: 'Changes discarded.' });
  };

  const handleNotifSave = async () => {
    setSectionSaveState('notif', { status: 'saving' });
    const prevNotif = { ...savedNotifSettings };
    try {
      await sellerApi.updateNotificationSettings(notifSettings);
      setSavedNotifSettings({ ...notifSettings });
      setSectionSaveState('notif', { status: 'saved' });
      addToast({
        type: 'success',
        message: 'Notification preferences saved.',
        undoAction: async () => {
          await sellerApi.updateNotificationSettings(prevNotif);
          setNotifSettings(prevNotif);
          setSavedNotifSettings(prevNotif);
          setSectionSaveState('notif', { status: 'idle' });
          addToast({ type: 'info', message: 'Notification changes undone.' });
        },
      });
      setTimeout(() => setSectionSaveState('notif', { status: 'idle' }), 3000);
    } catch(e) {setSectionSaveState('notif',{status:'error'});addToast({type:'error',message:e instanceof Error?e.message:'Unable to save notification preferences'})}
  };

  const handlePasswordUpdate = async () => {
    setPasswordError('');
    if (!passwordFields.current) { setPasswordError('Current password is required.'); return; }
    if (passwordFields.newPwd.length < 8) { setPasswordError('New password must be at least 8 characters.'); return; }
    if (passwordFields.newPwd !== passwordFields.confirm) { setPasswordError('Passwords do not match.'); return; }
    setSectionSaveState('password', { status: 'saving' });
    try {
      await sellerApi.changePassword({currentPassword:passwordFields.current,newPassword:passwordFields.newPwd});
      setPasswordFields({ current: '', newPwd: '', confirm: '' });
      setSectionSaveState('password', { status: 'saved' });
      addToast({ type: 'success', message: 'Password updated successfully.' });
      setTimeout(() => setSectionSaveState('password', { status: 'idle' }), 3000);
    } catch(e) {setSectionSaveState('password',{status:'error'});setPasswordError(e instanceof Error?e.message:'Unable to update password')}
  };

  const SaveButton = ({ sectionKey, label, onClick, icon: Icon }: { sectionKey: string; label: string; onClick: () => void; icon: React.ElementType }) => {
    const state = saveState[sectionKey];
    const isSaving = state?.status === 'saving';
    const isSaved = state?.status === 'saved';
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
          <Icon size={14} />
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
              key={`settings-tab-${tab.id}`}
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
              { label: 'Owner Name', key: 'ownerName', type: 'text' },
              { label: 'Email Address', key: 'email', type: 'email' },
              { label: 'Phone Number', key: 'phone', type: 'tel' },
            ].map((field) => (
              <div key={`acc-field-${field.key}`}>
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
                value={gstNumber}
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
              { key: 'emailPayments', label: 'Payment settlements', desc: 'Get notified when payments are processed' },
              { key: 'emailPickups', label: 'Pickup reminders', desc: 'Receive pickup schedule confirmations' },
              { key: 'emailOrders', label: 'Order updates', desc: 'New buyer requests and order status changes' },
            ]},
            { section: 'SMS Notifications', icon: Smartphone, items: [
              { key: 'smsPickups', label: 'Pickup day reminders', desc: 'SMS on the day of scheduled pickup' },
              { key: 'smsPayments', label: 'Payment alerts', desc: 'SMS when payment is credited' },
            ]},
            { section: 'In-App Notifications', icon: Bell, items: [
              { key: 'appAll', label: 'All platform notifications', desc: 'Receive all TUCOR platform alerts in-app' },
            ]},
          ].map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={`notif-group-${group.section}`}>
                <div className="flex items-center gap-2 mb-3">
                  <GroupIcon size={15} className="text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">{group.section}</h4>
                </div>
                <div className="flex flex-col gap-3">
                  {group.items.map((item) => (
                    <div key={`notif-item-${item.key}`} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
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
              <div key={`pwd-field-${i}`}>
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
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
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
                  <p className="text-xs text-muted-foreground">Verify login with OTP on +91 98204 51733</p>
                </div>
              </div>
              <span className="badge-active text-xs flex items-center gap-1">
                <CheckCircle2 size={11} />
                Enabled
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bank details tab */}
      {activeTab === 'bank' && (
        <div className="card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-base">Bank Account Details</h3>
            <span className="badge-active text-xs flex items-center gap-1">
              <CheckCircle2 size={11} />
              Verified
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Account Holder Name', value: bank?.accountHolder||'' },
              { label: 'Bank Name', value: bank?.bankName||'' },
              { label: 'Account Number', value: bank?.accountNumber?`••••••••${bank.accountNumber.slice(-4)}`:'' },
              { label: 'IFSC Code', value: bank?.ifsc||'' },
              { label: 'Account Type', value: bank?.accountType||'' },
              { label: 'Branch', value: bank?.branch||'' },
            ].map((field) => (
              <div key={`bank-field-${field.label}`}>
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
            <p className="text-xs text-info font-medium">To update bank details, please contact TUCOR support at support@tucor.in</p>
          </div>
        </div>
      )}
    </div>
  );
}
