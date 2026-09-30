const {test}=require('node:test');
const assert=require('node:assert/strict');
const ts=require('typescript');
const fs=require('node:fs');
const vm=require('node:vm');
function app(fetch){
 const storage=()=>{const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)}};
 const ctx={exports:{},process:{env:{}},window:{},localStorage:storage(),sessionStorage:storage(),fetch,Headers,FormData};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/auth-api.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,ctx);
 ctx.exports.saveSession({accessToken:'old',refreshToken:'refresh-old',role:'SELLER'},true);return ctx;
}
test('concurrent API failures rotate the refresh token once and retry both requests',async()=>{
 let refreshes=0;
 const ctx=app(async(url,init)=>{if(url.endsWith('/refresh')){refreshes++;await new Promise(r=>setTimeout(r,10));return Response.json({accessToken:'new',refreshToken:'refresh-new',role:'SELLER'})}return new Response('',{status:init.headers.get('Authorization')==='Bearer new'?200:401})});
 const responses=await Promise.all([ctx.exports.authorizedFetch('/one'),ctx.exports.authorizedFetch('/two')]);
 assert.equal(refreshes,1);assert.ok(responses.every(r=>r.status===200));assert.equal(ctx.exports.getSession().refreshToken,'refresh-new');
});
test('a late refresh cannot recreate a signed-out session',async()=>{
 let release;let started;const ready=new Promise(r=>started=r);
 const ctx=app(async(url)=>{if(url.endsWith('/refresh')){started();await new Promise(r=>release=r);return Response.json({accessToken:'new',refreshToken:'refresh-new'})}return new Response('',{status:401})});
 const request=ctx.exports.authorizedFetch('/one');await ready;ctx.exports.clearSession();release();await assert.rejects(request);assert.equal(ctx.exports.getSession(),null);
});
test('persistent 401 clears session after one retry',async()=>{
 const ctx=app(async(url)=>url.endsWith('/refresh')?Response.json({accessToken:'new',refreshToken:'refresh-new'}):new Response('',{status:401}));
 await assert.rejects(ctx.exports.authorizedFetch('/download'),/Session expired/);assert.equal(ctx.exports.getSession(),null);
});
