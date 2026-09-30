export type AuthRole = 'BUYER' | 'SELLER' | 'ADMIN';
export interface AuthTokens { accessToken:string; refreshToken:string; tokenType:string; expiresInSeconds:number; role:AuthRole; email:string; }
const API=(process.env.NEXT_PUBLIC_API_BASE_URL||'http://localhost:8080').replace(/\/$/,'');
async function request<T>(path:string,init:RequestInit={}):Promise<T>{const res=await fetch(API+path,{...init,headers:{'Content-Type':'application/json',...(init.headers||{})}});if(!res.ok){let message='Request failed';try{const b=await res.json();message=b.error||b.message||message;}catch{}throw new Error(message);}return res.status===204?undefined as T:res.json();}
export interface RegistrationPayload {email:string;password:string;role:AuthRole;businessName:string;businessType:string;gstNumber:string;registrationNumber?:string;address:string;city:string;state:string;pincode:string;estimatedVolumeMonthly?:string;fullName:string;phone:string;}
async function uploadRegistrationDocument(accessToken:string,documentType:string,file:File){const form=new FormData();form.append('documentType',documentType);form.append('file',file);const res=await fetch(API+'/api/auth/registration-documents',{method:'POST',headers:{Authorization:`Bearer ${accessToken}`},body:form});if(!res.ok){let message='Document upload failed';try{const b=await res.json();message=b.message||b.error||message;}catch{}throw new Error(message);}return res.json();}
export const authApi={register:(data:RegistrationPayload)=>request<AuthTokens>('/api/auth/register',{method:'POST',body:JSON.stringify(data)}),uploadRegistrationDocument,login:(email:string,password:string,rememberMe:boolean)=>request<AuthTokens>('/api/auth/login',{method:'POST',body:JSON.stringify({email,password,rememberMe})}),refresh:(refreshToken:string)=>request<AuthTokens>('/api/auth/refresh',{method:'POST',body:JSON.stringify({refreshToken})}),logout:(refreshToken:string)=>request<void>('/api/auth/logout',{method:'POST',body:JSON.stringify({refreshToken})}),forgotPassword:(email:string)=>request<{message:string}>('/api/auth/forgot-password',{method:'POST',body:JSON.stringify({email})}),resetPassword:(token:string,password:string)=>request<{message:string}>('/api/auth/reset-password',{method:'POST',body:JSON.stringify({token,password})}),verifyEmail:(token:string)=>request<{message:string}>('/api/auth/verify-email',{method:'POST',body:JSON.stringify({token})}),resendVerification:(email:string)=>request<{message:string}>('/api/auth/resend-verification',{method:'POST',body:JSON.stringify({email})}),me:(accessToken:string)=>request<{id:string;email:string;role:AuthRole;status:string;emailVerified:boolean}>('/api/auth/me',{headers:{Authorization:`Bearer ${accessToken}`}})};
export function saveSession(t:AuthTokens,remember:boolean){const store=remember?localStorage:sessionStorage;const other=remember?sessionStorage:localStorage;other.removeItem('tucor.auth');store.setItem('tucor.auth',JSON.stringify(t));}
export function clearSession(){localStorage.removeItem('tucor.auth');sessionStorage.removeItem('tucor.auth');}
export function getSession():AuthTokens|null{if(typeof window==='undefined')return null;const raw=sessionStorage.getItem('tucor.auth')||localStorage.getItem('tucor.auth');if(!raw)return null;try{return JSON.parse(raw)}catch{return null}}
export function dashboardFor(role:AuthRole){return role==='BUYER'?'/buyer-dashboard':role==='SELLER'?'/seller-dashboard':'/admin-dashboard';}

// Share refresh work across dashboard requests: refresh tokens can only be used once.
let refreshing: { token: string; promise: Promise<AuthTokens> } | null = null;
async function refreshSession(previous: AuthTokens): Promise<AuthTokens> {
  const current = getSession();
  if (!current) throw new Error('Session expired');
  if (current.refreshToken !== previous.refreshToken) return current;
  if (refreshing?.token === previous.refreshToken) return refreshing.promise;
  const remember = !!localStorage.getItem('tucor.auth');
  const promise = authApi.refresh(previous.refreshToken).then(tokens => {
    if (getSession()?.refreshToken !== previous.refreshToken) throw new Error('Session changed');
    saveSession(tokens, remember);
    return tokens;
  });
  refreshing = { token: previous.refreshToken, promise };
  try { return await promise; }
  finally { if (refreshing?.promise === promise) refreshing = null; }
}
export async function authorizedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  let session = getSession();
  if (!session) throw new Error('Not authenticated');
  const run = () => {
    const headers = new Headers(init.headers);
    if (!(init.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Bearer ${session!.accessToken}`);
    return fetch(API + path, { ...init, headers });
  };
  let response = await run();
  if (response.status === 401) {
    try { session = await refreshSession(session); }
    catch (error) { if (getSession()?.refreshToken === session.refreshToken) clearSession(); throw error; }
    response = await run();
    if (response.status === 401) { clearSession(); throw new Error('Session expired'); }
  }
  return response;
}
