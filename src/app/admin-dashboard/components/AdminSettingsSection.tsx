'use client';

import React, { useState, useRef } from 'react';
import { Bell, Shield, User, Eye, EyeOff, Save, Smartphone, Mail, AlertTriangle, Database, Globe, Lock, Users, CheckCircle2, Undo2, X, AlertCircle } from 'lucide-react';

type Tab = 'platform' | 'notifications' | 'security' | 'access';

interface SaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
}

interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
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
            t.type === 'success' ? 'bg-success text-white'
            : t.type === 'error' ? 'bg-destructive text-white'
            : t.type === 'warning'? 'bg-warning text-white' :'bg-foreground text-background'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 size={15} />}
          {t.type === 'error' && <AlertCircle size={15} />}
          {t.type === 'warning' && <AlertTriangle size={15} />}
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

// Confirmation modal for critical platform changes
function ConfirmModal({ open, onConfirm, onCancel, title, message }: {
  open: boolean; onConfirm: () => void; onCancel: () => void; title: string; message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-warning/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-warning" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary py-2 text-sm px-4">Cancel</button>
          <button onClick={onConfirm} className="btn-primary py-2 text-sm px-4 bg-warning border-warning hover:bg-warning/90">
            Confirm Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettingsSection() {
  const [activeTab, setActiveTab] = useState<Tab>('platform');
  const [showKey, setShowKey] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const initialPlatformSettings = {
    platformName: 'TUCOR',
    supportEmail: 'support@tucor.in',
    platformFeePercent: '5',
    minOrderLiters: '50',
    verificationDays: '3',
    autoApproveThreshold: '500',
  };
  const [platformSettings, setPlatformSettings] = useState(initialPlatformSettings);
  const [savedPlatformSettings, setSavedPlatformSettings] = useState(initialPlatformSettings);
  const [platformDirty, setPlatformDirty] = useState(false);

  const initialNotifSettings = {
    emailNewRegistrations: true,
    emailDisputes: true,
    emailPaymentFailures: true,
    smsUrgentAlerts: true,
    dailyDigest: false,
  };
  const [notifSettings, setNotifSettings] = useState(initialNotifSettings);
  const [savedNotifSettings, setSavedNotifSettings] = useState(initialNotifSettings);

  const [passwordFields, setPasswordFields] = useState({ current: '', newPwd: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'platform', label: 'Platform', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'access', label: 'Admin Access', icon: Users },
  ];

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    toastTimers.current[id] = setTimeout(() => dismissToast(id), 4500);
  };

  const dismissToast = (id: string) => {
    clearTimeout(toastTimers.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setSectionSaveState = (key: string, state: SaveState) => {
    setSaveState((prev) => ({ ...prev, [key]: state }));
  };

  const executePlatformSave = () => {
    setSectionSaveState('platform', { status: 'saving' });
    const prevSettings = { ...savedPlatformSettings };
    setTimeout(() => {
      setSavedPlatformSettings({ ...platformSettings });
      setPlatformDirty(false);
      setSectionSaveState('platform', { status: 'saved' });
      addToast({
        type: 'success',
        message: 'Platform configuration saved.',
        undoAction: () => {
          setPlatformSettings(prevSettings);
          setSavedPlatformSettings(prevSettings);
          setPlatformDirty(false);
          setSectionSaveState('platform', { status: 'idle' });
          addToast({ type: 'info', message: 'Platform changes undone.' });
        },
      });
      setTimeout(() => setSectionSaveState('platform', { status: 'idle' }), 3000);
    }, 700);
  };

  const handlePlatformSave = () => {
    setConfirmOpen(true);
  };

  const handlePlatformCancel = () => {
    setPlatformSettings({ ...savedPlatformSettings });
    setPlatformDirty(false);
    addToast({ type: 'info', message: 'Platform changes discarded.' });
  };

  const handleNotifSave = () => {
    setSectionSaveState('notif', { status: 'saving' });
    const prevNotif = { ...savedNotifSettings };
    setTimeout(() => {
      setSavedNotifSettings({ ...notifSettings });
      setSectionSaveState('notif', { status: 'saved' });
      addToast({
        type: 'success',
        message: 'Notification preferences saved.',
        undoAction: () => {
          setNotifSettings(prevNotif);
          setSavedNotifSettings(prevNotif);
          setSectionSaveState('notif', { status: 'idle' });
          addToast({ type: 'info', message: 'Notification changes undone.' });
        },
      });
      setTimeout(() => setSectionSaveState('notif', { status: 'idle' }), 3000);
    }, 600);
  };

  const handlePasswordUpdate = () => {
    setPasswordError('');
    if (!passwordFields.current) { setPasswordError('Current password is required.'); return; }
    if (passwordFields.newPwd.length < 8) { setPasswordError('New password must be at least 8 characters.'); return; }
    if (passwordFields.newPwd !== passwordFields.confirm) { setPasswordError('Passwords do not match.'); return; }
    setSectionSaveState('password', { status: 'saving' });
    setTimeout(() => {
      setPasswordFields({ current: '', newPwd: '', confirm: '' });
      setSectionSaveState('password', { status: 'saved' });
      addToast({ type: 'success', message: 'Admin password updated successfully.' });
      setTimeout(() => setSectionSaveState('password', { status: 'idle' }), 3000);
    }, 700);
  };

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
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Platform Changes"
        message="Changes to platform fee and thresholds will affect all future transactions. This action cannot be automatically undone."
        onConfirm={() => { setConfirmOpen(false); executePlatformSave(); }}
        onCancel={() => setConfirmOpen(false)}
      />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Admin Console · Platform configuration and access controls</p>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-xl w-fit flex-wrap">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={`admin-settings-tab-${tab.id}`}
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

      {/* Platform tab */}
      {activeTab === 'platform' && (
        <div className="card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-base">Platform Configuration</h3>
            {platformDirty && (
              <span className="text-xs text-warning font-medium flex items-center gap-1">
                <AlertCircle size={12} />
                Unsaved changes
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Platform Name', key: 'platformName' },
              { label: 'Support Email', key: 'supportEmail' },
              { label: 'Platform Fee (%)', key: 'platformFeePercent' },
              { label: 'Minimum Order (Liters)', key: 'minOrderLiters' },
              { label: 'Verification SLA (Days)', key: 'verificationDays' },
              { label: 'Auto-Approve Threshold (L)', key: 'autoApproveThreshold' },
            ].map((field) => (
              <div key={`platform-field-${field.key}`}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{field.label}</label>
                <input
                  type="text"
                  value={platformSettings[field.key as keyof typeof platformSettings]}
                  onChange={(e) => {
                    setPlatformSettings((prev) => ({ ...prev, [field.key]: e.target.value }));
                    setPlatformDirty(true);
                  }}
                  className="w-full px-3.5 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-150"
                />
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-warning-bg border border-warning/20 flex items-start gap-2">
            <AlertTriangle size={15} className="text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-warning font-medium">Changes to platform fee and thresholds will affect all future transactions. A confirmation dialog will appear before saving.</p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <SaveButton sectionKey="platform" label="Save Configuration" onClick={handlePlatformSave} icon={Save} />
            <button
              onClick={handlePlatformCancel}
              disabled={!platformDirty}
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
          <h3 className="font-bold text-foreground text-base">Admin Notification Preferences</h3>
          {[
            { section: 'Email Alerts', icon: Mail, items: [
              { key: 'emailNewRegistrations', label: 'New business registrations', desc: 'Alert when new sellers/buyers register' },
              { key: 'emailDisputes', label: 'Dispute escalations', desc: 'Alert when disputes are escalated' },
              { key: 'emailPaymentFailures', label: 'Payment failures', desc: 'Alert on failed or disputed payments' },
            ]},
            { section: 'SMS Alerts', icon: Smartphone, items: [
              { key: 'smsUrgentAlerts', label: 'Urgent platform alerts', desc: 'Critical system issues via SMS' },
            ]},
            { section: 'Reports', icon: Database, items: [
              { key: 'dailyDigest', label: 'Daily platform digest', desc: 'Receive daily summary of platform activity' },
            ]},
          ].map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={`admin-notif-group-${group.section}`}>
                <div className="flex items-center gap-2 mb-3">
                  <GroupIcon size={15} className="text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">{group.section}</h4>
                </div>
                <div className="flex flex-col gap-3">
                  {group.items.map((item) => (
                    <div key={`admin-notif-item-${item.key}`} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
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
            <h3 className="font-bold text-foreground text-base">Admin Password</h3>
            {[
              { label: 'Current Password', key: 'current' },
              { label: 'New Password', key: 'newPwd' },
              { label: 'Confirm New Password', key: 'confirm' },
            ].map((field, i) => (
              <div key={`admin-pwd-${i}`}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{field.label}</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordFields[field.key as keyof typeof passwordFields]}
                    onChange={(e) => setPasswordFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className={`w-full px-3.5 py-2.5 pr-10 text-sm bg-muted border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-150 ${
                      passwordError ? 'border-destructive/50' : 'border-border'
                    }`}
                  />
                  {i === 0 && (
                    <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
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
              <SaveButton sectionKey="password" label="Update Password" onClick={handlePasswordUpdate} icon={Lock} />
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
                <p className="text-xs text-success font-semibold">Admin password updated. All active sessions will require re-authentication.</p>
              </div>
            )}
          </div>
          <div className="card p-6">
            <h3 className="font-bold text-foreground text-base mb-4">Session & Access</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Session Timeout', value: '30 minutes', status: 'Configured' },
                { label: 'IP Allowlist', value: 'Disabled', status: 'Off' },
                { label: 'Two-Factor Auth', value: 'SMS OTP enabled', status: 'Active' },
                { label: 'Audit Logging', value: 'All admin actions logged', status: 'Active' },
              ].map((item) => (
                <div key={`sec-item-${item.label}`} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.value}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${item.status === 'Active' || item.status === 'Configured' ? 'bg-success-bg text-success' : 'bg-muted text-muted-foreground'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Access tab */}
      {activeTab === 'access' && (
        <div className="card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-base">Admin Users</h3>
            <button
              onClick={() => addToast({ type: 'info', message: 'Invite link sent to admin email.' })}
              className="btn-primary py-2 text-xs gap-1.5"
            >
              <User size={13} />
              Invite Admin
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { name: 'Admin User', email: 'admin@tucor.in', role: 'Super Admin', status: 'Active', avatar: 'A' },
              { name: 'Rahul Verma', email: 'rahul@tucor.in', role: 'Operations Admin', status: 'Active', avatar: 'R' },
              { name: 'Sneha Kapoor', email: 'sneha@tucor.in', role: 'Finance Admin', status: 'Active', avatar: 'S' },
            ].map((admin) => (
              <div key={`admin-user-${admin.email}`} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 font-bold text-sm flex-shrink-0">
                  {admin.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{admin.name}</p>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 font-medium border border-amber-500/30">{admin.role}</span>
                  <span className="badge-active text-xs">{admin.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
