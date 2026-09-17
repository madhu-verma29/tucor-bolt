'use client';

import React, { useState } from 'react';
import { Upload, CheckCircle2, Clock, AlertCircle, Download, Trash2, Plus, Shield } from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


interface Document {
  id: string;
  name: string;
  type: 'FSSAI License' | 'GST Certificate' | 'Address Proof' | 'Bank Details' | 'PAN Card' | 'Trade License';
  status: 'Verified' | 'Pending' | 'Rejected' | 'Expired';
  uploadedAt: string;
  expiresAt?: string;
  fileSize: string;
  required: boolean;
}

const mockDocuments: Document[] = [
  { id: 'doc1', name: 'FSSAI_License_2026.pdf', type: 'FSSAI License', status: 'Verified', uploadedAt: '2026-03-10', expiresAt: '2027-03-09', fileSize: '1.2 MB', required: true },
  { id: 'doc2', name: 'GST_Certificate_27AABCS.pdf', type: 'GST Certificate', status: 'Verified', uploadedAt: '2026-03-10', fileSize: '0.8 MB', required: true },
  { id: 'doc3', name: 'Address_Proof_Andheri.pdf', type: 'Address Proof', status: 'Verified', uploadedAt: '2026-03-12', fileSize: '2.1 MB', required: true },
  { id: 'doc4', name: 'Bank_Details_HDFC.pdf', type: 'Bank Details', status: 'Verified', uploadedAt: '2026-03-12', fileSize: '0.5 MB', required: true },
  { id: 'doc5', name: 'PAN_Card_AABCS1429B.pdf', type: 'PAN Card', status: 'Pending', uploadedAt: '2026-09-05', fileSize: '0.3 MB', required: true },
  { id: 'doc6', name: 'Trade_License_Mumbai.pdf', type: 'Trade License', status: 'Rejected', uploadedAt: '2026-08-20', fileSize: '1.5 MB', required: false },
];

const statusConfig = {
  Verified: { className: 'badge-active', icon: CheckCircle2, color: 'text-success' },
  Pending: { className: 'badge-pending', icon: Clock, color: 'text-warning' },
  Rejected: { className: 'badge-danger', icon: AlertCircle, color: 'text-danger' },
  Expired: { className: 'badge-danger', icon: AlertCircle, color: 'text-danger' },
};

const docTypeIcons: Record<Document['type'], string> = {
  'FSSAI License': '🏥',
  'GST Certificate': '📋',
  'Address Proof': '🏠',
  'Bank Details': '🏦',
  'PAN Card': '🪪',
  'Trade License': '📜',
};

export default function DocumentsSection() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  const verified = documents.filter((d) => d.status === 'Verified').length;
  const pending = documents.filter((d) => d.status === 'Pending').length;
  const rejected = documents.filter((d) => d.status === 'Rejected').length;

  const handleUpload = (type: Document['type']) => {
    toast.success(`${type} upload initiated. Select a PDF file to continue.`);
  };

  const handleDownload = (doc: Document) => {
    toast.success(`Downloading ${doc.name}...`);
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    toast.success('Document removed');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your compliance documents and business certificates
          </p>
        </div>
        <button
          onClick={() => toast.info('Select document type to upload')}
          className="btn-primary py-2 text-xs gap-1.5"
        >
          <Plus size={13} />
          Upload Document
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Verified', value: verified, color: 'text-success', bg: 'bg-success-bg', icon: CheckCircle2 },
          { label: 'Pending Review', value: pending, color: 'text-warning', bg: 'bg-warning-bg', icon: Clock },
          { label: 'Action Required', value: rejected, color: 'text-danger', bg: 'bg-danger-bg', icon: AlertCircle },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={`doc-stat-${stat.label}`} className="card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className={stat.color} />
              </div>
              <div>
                <div className={`text-xl font-bold font-mono-data ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verification badge */}
      {verified === documents.length && (
        <div className="card p-4 flex items-center gap-3 border-success/30 bg-success-bg/50">
          <Shield size={18} className="text-success flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-success">All documents verified</p>
            <p className="text-xs text-muted-foreground">Your account is fully compliant with TUCOR requirements</p>
          </div>
        </div>
      )}

      {/* Documents list */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground text-base">Uploaded Documents</h3>
        </div>
        <div className="divide-y divide-border">
          {documents.map((doc) => {
            const cfg = statusConfig[doc.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={`doc-${doc.id}`} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl flex-shrink-0">
                  {docTypeIcons[doc.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                    {doc.required && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">Required</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">{doc.type}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{doc.fileSize}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">Uploaded {doc.uploadedAt}</span>
                    {doc.expiresAt && (
                      <>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">Expires {doc.expiresAt}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`${cfg.className} text-xs flex items-center gap-1`}>
                    <StatusIcon size={11} />
                    {doc.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors duration-150"
                      title="Download"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg hover:bg-danger-bg text-muted-foreground hover:text-danger transition-colors duration-150"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload new document */}
      <div className="card p-6">
        <h3 className="font-bold text-foreground text-base mb-4">Upload New Document</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(['FSSAI License', 'GST Certificate', 'Address Proof', 'Bank Details', 'PAN Card', 'Trade License'] as Document['type'][]).map((type) => (
            <button
              key={`upload-${type}`}
              onClick={() => handleUpload(type)}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-150 text-left"
            >
              <span className="text-lg">{docTypeIcons[type]}</span>
              <div>
                <p className="text-xs font-semibold text-foreground">{type}</p>
                <p className="text-xs text-muted-foreground">PDF, max 5MB</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
