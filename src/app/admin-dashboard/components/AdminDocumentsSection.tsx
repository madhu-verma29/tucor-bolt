'use client';

import React, { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, FileText, AlertCircle, Download, Eye, RefreshCw, Plus,  } from 'lucide-react';
import { adminApi, type AdminDocument as BusinessDocument } from '@/lib/admin-api';
import { toast } from 'sonner';

const statusConfig: Record<string, { cls: string; icon: React.ReactNode }> = {
  Verified: { cls: 'badge-active', icon: <CheckCircle size={12} /> },
  Pending: { cls: 'badge-pending', icon: <Clock size={12} /> },
  Rejected: { cls: 'badge-danger', icon: <XCircle size={12} /> },
  Expired: { cls: 'badge-danger', icon: <AlertCircle size={12} /> },
  'Under Review': { cls: 'badge-info', icon: <RefreshCw size={12} /> },
};

export default function AdminDocumentsSection() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState<BusinessDocument | null>(null);
  const [documentData,setDocumentData]=useState<BusinessDocument[]>([]);
  useEffect(()=>{adminApi.documents().then(setDocumentData).catch(e=>toast.error(e instanceof Error?e.message:'Unable to load documents'));},[]);
  const updateDocument=async(id:string,action:'verify'|'reject')=>{try{const updated=await adminApi.documentAction(id,action,action==='reject'?'Rejected by administrator':undefined);setDocumentData(items=>items.map(d=>d.id===id?updated:d));if(selectedDoc?.id===id)setSelectedDoc(updated);toast.success(action==='verify'?'Document verified':'Document rejected');}catch(e){toast.error(e instanceof Error?e.message:'Unable to update document');}};
  const downloadDocument=async(doc:BusinessDocument)=>{try{await adminApi.downloadDocument(doc.id,doc.fileName);}catch(e){toast.error(e instanceof Error?e.message:'Unable to download document');}};

  const statuses = ['All', 'Pending', 'Under Review', 'Verified', 'Rejected', 'Expired'];
  const types = ['All', 'Seller', 'Buyer'];

  const filtered = documentData.filter((d) => {
    const matchSearch = d.businessName.toLowerCase().includes(search.toLowerCase()) ||
      d.owner.toLowerCase().includes(search.toLowerCase()) ||
      d.docType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchType = typeFilter === 'All' || d.businessType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    total: documentData.length,
    pending: documentData.filter((d) => d.status === 'Pending' || d.status === 'Under Review').length,
    verified: documentData.filter((d) => d.status === 'Verified').length,
    action: documentData.filter((d) => d.status === 'Rejected' || d.status === 'Expired').length,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and manage all uploaded business documents, FSSAI licenses, GST certificates, and compliance files
          </p>
        </div>
        <button onClick={()=>toast.info('Document requests are sent from the selected verification workflow')} className="btn-primary py-2 text-xs gap-1.5">
          <Plus size={13} />
          Request Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: stats.total, color: 'text-foreground', bg: 'bg-muted', icon: FileText },
          { label: 'Awaiting Review', value: stats.pending, color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
          { label: 'Verified', value: stats.verified, color: 'text-success', bg: 'bg-success/10', icon: CheckCircle },
          { label: 'Action Required', value: stats.action, color: 'text-danger', bg: 'bg-danger/10', icon: AlertCircle },
        ].map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div key={`admin-doc-stat-${stat.label}`} className="card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <StatIcon size={16} className={stat.color} />
              </div>
              <div>
                <div className={`text-xl font-bold font-mono-data ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by business, owner, or document type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={`admin-doc-filter-${s}`}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {types.map((t) => (
            <button
              key={`admin-doc-type-${t}`}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                typeFilter === t ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Documents table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Business</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Document</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Uploaded</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Expires</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const cfg = statusConfig[doc.status];
                return (
                  <tr key={`admin-doc-row-${doc.id}`} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          doc.businessType === 'Seller' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                        }`}>
                          {doc.businessName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-xs">{doc.businessName}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className={`text-xs px-1 py-0.5 rounded font-medium ${
                              doc.businessType === 'Seller' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                            }`}>{doc.businessType}</span>
                            {doc.owner}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-muted-foreground flex-shrink-0" />
                        <div>
                          <div className="font-medium text-foreground text-xs">{doc.docType}</div>
                          <div className="text-xs text-muted-foreground">{doc.fileSize}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{doc.uploadedAt}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{doc.expiresAt ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`${cfg.cls} inline-flex items-center gap-1 text-xs`}>{cfg.icon}{doc.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View"
                        >
                          <Eye size={13} />
                        </button>
                        <button onClick={() => downloadDocument(doc)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Download"
                        >
                          <Download size={13} />
                        </button>
                        {(doc.status === 'Pending' || doc.status === 'Under Review') && (
                          <>
                            <button onClick={() => updateDocument(doc.id,'verify')} className="px-2 py-1 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors text-xs font-medium">
                              Verify
                            </button>
                            <button onClick={() => updateDocument(doc.id,'reject')} className="px-2 py-1 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors text-xs font-medium">
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">No documents match your filters</div>
          )}
        </div>
      </div>

      {/* Document detail modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDoc(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-foreground">{selectedDoc.docType}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedDoc.businessName} · {selectedDoc.owner}</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
                <XCircle size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><div className="text-xs text-muted-foreground mb-0.5">File Name</div><div className="font-medium text-foreground text-xs">{selectedDoc.fileName}</div></div>
              <div><div className="text-xs text-muted-foreground mb-0.5">File Size</div><div className="font-medium text-foreground">{selectedDoc.fileSize}</div></div>
              <div><div className="text-xs text-muted-foreground mb-0.5">Uploaded</div><div className="font-medium text-foreground">{selectedDoc.uploadedAt}</div></div>
              {selectedDoc.expiresAt && <div><div className="text-xs text-muted-foreground mb-0.5">Expires</div><div className="font-medium text-foreground">{selectedDoc.expiresAt}</div></div>}
              {selectedDoc.verifiedBy && <div><div className="text-xs text-muted-foreground mb-0.5">Verified By</div><div className="font-medium text-foreground">{selectedDoc.verifiedBy}</div></div>}
              {selectedDoc.verifiedAt && <div><div className="text-xs text-muted-foreground mb-0.5">Verified On</div><div className="font-medium text-foreground">{selectedDoc.verifiedAt}</div></div>}
            </div>
            {selectedDoc.rejectionReason && (
              <div className="p-3 rounded-xl bg-danger/8 border border-danger/20 mb-4">
                <div className="text-xs font-semibold text-danger mb-1">Rejection Reason</div>
                <div className="text-xs text-danger/80">{selectedDoc.rejectionReason}</div>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => downloadDocument(selectedDoc)} className="btn-ghost py-2 px-4 text-xs gap-1.5"><Download size={13} />Download</button>
              {(selectedDoc.status === 'Pending' || selectedDoc.status === 'Under Review') && (
                <>
                  <button onClick={() => updateDocument(selectedDoc.id,'verify')} className="py-2 px-4 rounded-xl bg-success/10 text-success hover:bg-success/20 transition-colors text-xs font-semibold gap-1.5 flex items-center">
                    <CheckCircle size={13} />Verify
                  </button>
                  <button onClick={() => updateDocument(selectedDoc.id,'reject')} className="py-2 px-4 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-colors text-xs font-semibold gap-1.5 flex items-center">
                    <XCircle size={13} />Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
