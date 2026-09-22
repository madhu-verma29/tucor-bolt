import {authApi,clearSession,getSession,saveSession} from './auth-api';

const API=(process.env.NEXT_PUBLIC_API_BASE_URL||'http://localhost:8080').replace(/\/$/,'');

export interface SellerProfile {id:string;email:string;status:string;businessName:string;tradeName:string;businessType:string;category:string;gstNumber:string;fssaiNumber:string;pan:string;cin:string;yearEstablished:string;website:string;addressLine1:string;addressLine2:string;city:string;state:string;pincode:string;country:string;gstState:string;primaryContact:string;designation:string;phone:string;altPhone:string;altEmail:string;contactEmail:string;kitchenType:string;seatingCapacity:string;avgDailyCovers:string;operatingDays:string;operatingHours:string;cuisineTypes:string;avgMonthlyUco:string;storageCapacity:string;collectionFrequency:string;preferredPickupDay:string;pickupContact:string;pickupPhone:string;pickupAvailability:string;memberSince:string}
export type SellerProfileUpdate=Partial<Omit<SellerProfile,'id'|'email'|'status'|'gstNumber'|'memberSince'>>;
export interface SellerBankAccount{accountHolder:string;accountNumber:string;bankName:string;branch:string;ifsc:string;accountType:string;upiId:string;verified:boolean;verifiedAt:string}
export interface SellerDocument{id:string;name:string;type:string;status:string;sizeBytes:number;uploadedAt:string;expiresAt:string;rejectionReason:string}
export interface SellerSettingsAccount{fullName:string;email:string;phone:string;gstNumber:string;businessName:string}
export interface SellerNotificationSettings{emailOrders:boolean;emailPickups:boolean;emailPayments:boolean;smsPickups:boolean;smsPayments:boolean;appAll:boolean}
export interface SellerPreferences{twoFactor:boolean;loginAlerts:boolean;autoInvoice:boolean;weeklyReport:boolean}

const text=(value:unknown)=>typeof value==='string'?value:'';
function normalizeProfile(p:Partial<Record<keyof SellerProfile,unknown>>):SellerProfile{return {id:text(p.id),email:text(p.email),status:text(p.status),businessName:text(p.businessName),tradeName:text(p.tradeName),businessType:text(p.businessType),category:text(p.category),gstNumber:text(p.gstNumber),fssaiNumber:text(p.fssaiNumber),pan:text(p.pan),cin:text(p.cin),yearEstablished:text(p.yearEstablished),website:text(p.website),addressLine1:text(p.addressLine1),addressLine2:text(p.addressLine2),city:text(p.city),state:text(p.state),pincode:text(p.pincode),country:text(p.country)||'India',gstState:text(p.gstState),primaryContact:text(p.primaryContact),designation:text(p.designation),phone:text(p.phone),altPhone:text(p.altPhone),altEmail:text(p.altEmail),contactEmail:text(p.contactEmail),kitchenType:text(p.kitchenType),seatingCapacity:text(p.seatingCapacity),avgDailyCovers:text(p.avgDailyCovers),operatingDays:text(p.operatingDays),operatingHours:text(p.operatingHours),cuisineTypes:text(p.cuisineTypes),avgMonthlyUco:text(p.avgMonthlyUco),storageCapacity:text(p.storageCapacity),collectionFrequency:text(p.collectionFrequency),preferredPickupDay:text(p.preferredPickupDay),pickupContact:text(p.pickupContact),pickupPhone:text(p.pickupPhone),pickupAvailability:text(p.pickupAvailability),memberSince:text(p.memberSince)}}
function normalizeBank(p:Partial<Record<keyof SellerBankAccount,unknown>>):SellerBankAccount{return {accountHolder:text(p.accountHolder),accountNumber:text(p.accountNumber),bankName:text(p.bankName),branch:text(p.branch),ifsc:text(p.ifsc),accountType:text(p.accountType),upiId:text(p.upiId),verified:p.verified===true,verifiedAt:text(p.verifiedAt)}}

async function call<T>(path:string,init:RequestInit={}):Promise<T>{let session=getSession();if(!session)throw new Error('Not authenticated');const run=()=>fetch(API+path,{...init,headers:{...(init.body instanceof FormData?{}:{'Content-Type':'application/json'}),Authorization:`Bearer ${session!.accessToken}`,...(init.headers||{})}});let response=await run();if(response.status===401){try{session=await authApi.refresh(session.refreshToken);saveSession(session,!!localStorage.getItem('tucor.auth'));response=await run()}catch{clearSession();throw new Error('Session expired')}}if(!response.ok){let message='Request failed';try{const body=await response.json();message=body.error||body.message||message}catch{}throw new Error(message)}return response.status===204?undefined as T:response.json()}

export const sellerApi={
 profile:()=>call<Partial<Record<keyof SellerProfile,unknown>>>('/api/seller/profile').then(normalizeProfile),
 updateProfile:(p:SellerProfileUpdate)=>call<Partial<Record<keyof SellerProfile,unknown>>>('/api/seller/profile',{method:'PATCH',body:JSON.stringify(p)}).then(normalizeProfile),
 bankAccount:()=>call<Partial<Record<keyof SellerBankAccount,unknown>>>('/api/seller/bank-account').then(normalizeBank),
 updateBankAccount:(p:Omit<SellerBankAccount,'verified'|'verifiedAt'>)=>call<Partial<Record<keyof SellerBankAccount,unknown>>>('/api/seller/bank-account',{method:'PUT',body:JSON.stringify(p)}).then(normalizeBank),
 documents:()=>call<SellerDocument[]>('/api/seller/documents'),
 deleteDocument:(id:string)=>call<void>(`/api/seller/documents/${id}`,{method:'DELETE'}),
 settingsAccount:()=>call<SellerSettingsAccount>('/api/seller/settings/account'),
 updateSettingsAccount:(p:{fullName:string;email:string;phone:string})=>call<SellerSettingsAccount>('/api/seller/settings/account',{method:'PUT',body:JSON.stringify(p)}),
 notificationSettings:()=>call<SellerNotificationSettings>('/api/seller/settings/notifications'),
 updateNotificationSettings:(p:SellerNotificationSettings)=>call<SellerNotificationSettings>('/api/seller/settings/notifications',{method:'PUT',body:JSON.stringify(p)}),
 preferences:()=>call<SellerPreferences>('/api/seller/settings/preferences'),
 updatePreferences:(p:SellerPreferences)=>call<SellerPreferences>('/api/seller/settings/preferences',{method:'PUT',body:JSON.stringify(p)}),
 changePassword:(p:{currentPassword:string;newPassword:string})=>call<void>('/api/seller/settings/password',{method:'PUT',body:JSON.stringify(p)}),
};

export function uploadSellerDocument(documentType:string,file:File){const data=new FormData();data.append('documentType',documentType);data.append('file',file);return call<SellerDocument>('/api/seller/documents',{method:'POST',body:data})}
export async function downloadSellerDocument(id:string,name:string){const session=getSession();if(!session)throw new Error('Not authenticated');const response=await fetch(`${API}/api/seller/documents/${id}/download`,{headers:{Authorization:`Bearer ${session.accessToken}`}});if(!response.ok)throw new Error('Document download failed');const url=URL.createObjectURL(await response.blob());const link=document.createElement('a');link.href=url;link.download=name;link.click();URL.revokeObjectURL(url)}
