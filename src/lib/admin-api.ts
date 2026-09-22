import {authApi,clearSession,getSession,saveSession} from './auth-api';

const API=(process.env.NEXT_PUBLIC_API_BASE_URL||'http://localhost:8080').replace(/\/$/,'');

export interface AdminProfile{name:string;email:string;role:string}
export interface AdminSummary{users:number;businesses:number;verifications:number;documents:number;listings:number;orders:number;pickups:number;payments:number;disputes:number}
export interface AdminUser{id:string;name:string;email:string;phone:string;role:'Seller'|'Buyer';status:'Active'|'Pending'|'Suspended'|'Rejected';business:string;joinedAt:string;lastActive:string;verified:boolean}
export interface AdminBusiness{id:string;name:string;type:'Seller'|'Buyer';category:string;owner:string;email:string;location:string;status:'Approved'|'Pending'|'Rejected'|'Suspended';gst:string;fssai?:string;submittedAt:string;approvedAt?:string;monthlyVolume:string}
export interface AdminVerificationDocument{name:string;status:'Submitted'|'Verified'|'Rejected'|'Missing'}
export interface AdminVerification{id:string;businessName:string;type:'Seller'|'Buyer';owner:string;submittedAt:string;status:'Pending'|'Under Review'|'Approved'|'Rejected'|'More Info Required';documents:AdminVerificationDocument[];notes?:string;priority:'High'|'Normal'|'Low'}
export interface AdminDocument{id:string;businessName:string;businessType:'Seller'|'Buyer';owner:string;docType:string;fileName:string;fileSize:string;uploadedAt:string;expiresAt?:string;status:'Verified'|'Pending'|'Rejected'|'Expired'|'Under Review';verifiedBy?:string;verifiedAt?:string;rejectionReason?:string}
export interface AdminListing{id:string;oilType:string;volumeLiters:number;gradeLabel:string;pricePerLiter:number;status:'Active'|'Pending Verification'|'Flagged'|'Rejected'|'Expired';sellerRef:string;city:string;listedAt:string}
export interface AdminOrder{id:string;seller:string;buyer:string;oilType:string;volumeLiters:number;totalAmount:number;status:'Requested'|'Under Review'|'Matched'|'Confirmed'|'Pickup Scheduled'|'Picked Up'|'Delivered'|'Payment'|'Payment Pending'|'Settled'|'Completed'|'Cancelled'|'Rejected'|'Disputed';createdAt:string;updatedAt:string;location:string}
export interface AdminPickup{id:string;orderId:string;oilType:string;volumeLiters:number;scheduledDate:string;status:'Pending'|'Scheduled'|'Assigned'|'In Transit'|'Completed';agentName:string;vehicleNumber:string;sellerCity:string;sellerRef:string;buyerRef:string}
export interface AdminPayment{id:string;orderId:string;sellerRef:string;buyerRef:string;amount:number;platformFee:number;status:'Pending'|'Processing'|'Settled'|'Failed'|'Disputed';dueDate:string;settledDate?:string;reference:string}
export interface AdminDisputeTimeline{date:string;action:string;by:string}
export interface AdminDispute{id:string;orderId:string;raisedBy:string;raisedByRole:'Seller'|'Buyer';against:string;reason:string;description:string;status:'Open'|'Under Investigation'|'Resolved'|'Escalated'|'Closed';priority:'High'|'Medium'|'Low';amount:number;raisedAt:string;updatedAt:string;resolution?:string;timeline:AdminDisputeTimeline[]}
export interface AdminAuditLog{id:string;timestamp:string;actor:string;actorRole:'Admin'|'System'|'Seller'|'Buyer';action:string;module:'Users'|'Businesses'|'Verification'|'Orders'|'Payments'|'Disputes'|'Settings'|'System';target:string;targetId:string;ipAddress:string;severity:'Info'|'Warning'|'Critical';details:string}
export interface AdminNotification{id:string;message:string;time:string;unread:boolean}
export interface MonthVolume{month:string;collected:number;sourced:number}
export interface OrderStatusMetric{name:string;value:number;color:string}
export interface RevenueMetric{month:string;revenue:number;fees:number}
export interface AdminKpi{label:string;value:string;change:string;up:boolean;section:string}
export interface AdminActivity{id:string;type:string;text:string;time:string;dot:string}
export interface AdminOverview{kpis:AdminKpi[];platformVolume:MonthVolume[];orderStatus:OrderStatusMetric[];revenue:RevenueMetric[];recentActivity:AdminActivity[];updatedAt:string}
export interface AdminReports{platformVolume:MonthVolume[];revenue:RevenueMetric[];userGrowth:{month:string;sellers:number;buyers:number}[];oilTypes:{name:string;value:number;color:string}[];summary:{totalUcoRecovered:number;platformRevenue:number;activeBusinesses:number;co2OffsetKg:number}}
export interface AdminPlatformSettings{platformName:string;supportEmail:string;platformFeePercent:string;minOrderLiters:string;verificationDays:string;autoApproveThreshold:string}
export interface AdminNotificationSettings{emailNewRegistrations:boolean;emailDisputes:boolean;emailPaymentFailures:boolean;smsUrgentAlerts:boolean;dailyDigest:boolean}
export interface AdminSettings{platform:AdminPlatformSettings;notifications:AdminNotificationSettings}
export interface AdminAccess{id:string;name:string;email:string;role:string;status:string;avatar:string}

async function call<T>(path:string,init:RequestInit={}):Promise<T>{let session=getSession();if(!session)throw new Error('Not authenticated');const run=()=>fetch(API+path,{...init,headers:{...(init.body instanceof FormData?{}:{'Content-Type':'application/json'}),Authorization:`Bearer ${session!.accessToken}`,...(init.headers||{})}});let response=await run();if(response.status===401){try{session=await authApi.refresh(session.refreshToken);saveSession(session,!!localStorage.getItem('tucor.auth'));response=await run()}catch{clearSession();throw new Error('Session expired')}}if(!response.ok){let message='Request failed';try{const body=await response.json();message=body.error||body.message||message}catch{}throw new Error(message)}if(response.status===204)return undefined as T;const body=await response.text();return body?JSON.parse(body) as T:undefined as T}
async function download(path:string,fileName:string){let session=getSession();if(!session)throw new Error('Not authenticated');const response=await fetch(API+path,{headers:{Authorization:`Bearer ${session.accessToken}`}});if(!response.ok){let message='Download failed';try{const body=await response.json();message=body.error||body.message||message}catch{}throw new Error(message)}const url=URL.createObjectURL(await response.blob());const link=document.createElement('a');link.href=url;link.download=fileName;link.click();URL.revokeObjectURL(url)}
const action=(path:string,value:string,extra:Record<string,unknown>={})=>call<any>(path,{method:'PATCH',body:JSON.stringify({action:value,...extra})});

export const adminApi={
 profile:()=>call<AdminProfile>('/api/admin/profile'),summary:()=>call<AdminSummary>('/api/admin/summary'),notifications:()=>call<AdminNotification[]>('/api/admin/notifications'),
 users:()=>call<AdminUser[]>('/api/admin/users'),userAction:(id:string,value:string)=>action(`/api/admin/users/${id}`,value),
 businesses:()=>call<AdminBusiness[]>('/api/admin/businesses'),businessAction:(id:string,value:string)=>action(`/api/admin/businesses/${id}`,value),
 verifications:()=>call<AdminVerification[]>('/api/admin/verifications'),verificationAction:(id:string,value:string,reason?:string)=>action(`/api/admin/verifications/${id}`,value,{reason}),
 documents:()=>call<AdminDocument[]>('/api/admin/documents'),documentAction:(id:string,value:string,reason?:string)=>action(`/api/admin/documents/${id}`,value,{reason}),downloadDocument:(id:string,name:string)=>download(`/api/admin/documents/${id}/download`,name),
 listings:()=>call<AdminListing[]>('/api/admin/listings'),listingAction:(id:string,value:string,reason?:string)=>action(`/api/admin/listings/${id}`,value,{reason}),
 orders:()=>call<AdminOrder[]>('/api/admin/orders'),
 pickups:()=>call<AdminPickup[]>('/api/admin/pickups'),pickupAction:(id:string,value:string,extra:Record<string,unknown>={})=>action(`/api/admin/pickups/${id}`,value,extra),
 payments:()=>call<AdminPayment[]>('/api/admin/payments'),paymentAction:(id:string,value:string)=>action(`/api/admin/payments/${id}`,value),
 disputes:()=>call<AdminDispute[]>('/api/admin/disputes'),disputeAction:(id:string,value:string,reason?:string)=>action(`/api/admin/disputes/${id}`,value,{reason}),
 auditLogs:()=>call<AdminAuditLog[]>('/api/admin/audit-logs'),exportAudit:()=>download('/api/admin/audit-logs/export','admin-audit-logs.csv'),
 overview:()=>call<AdminOverview>('/api/admin/overview'),reports:()=>call<AdminReports>('/api/admin/reports'),downloadReport:(type:string)=>download(`/api/admin/reports/${type}/download`,`tucor-${type}-report.csv`),
 settings:()=>call<AdminSettings>('/api/admin/settings'),updatePlatform:(value:AdminPlatformSettings)=>call<AdminPlatformSettings>('/api/admin/settings/platform',{method:'PUT',body:JSON.stringify(value)}),updateNotifications:(value:AdminNotificationSettings)=>call<AdminNotificationSettings>('/api/admin/settings/notifications',{method:'PUT',body:JSON.stringify(value)}),changePassword:(currentPassword:string,newPassword:string)=>call<void>('/api/admin/settings/password',{method:'PUT',body:JSON.stringify({currentPassword,newPassword})}),
 admins:()=>call<AdminAccess[]>('/api/admin/admins'),inviteAdmin:(email:string,name:string)=>call<{email:string;temporaryPassword:string}>('/api/admin/admins/invite',{method:'POST',body:JSON.stringify({email,name,role:'Super Admin'})}),
};
