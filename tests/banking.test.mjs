import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../worker/index.js',import.meta.url),'utf8');
const {default:worker,testBalances}=await import('data:text/javascript;base64,'+Buffer.from(source+'\nexport const testBalances=()=>[...accounts.values()].map(a=>({id:a.id,balance:a.balance}));').toString('base64'));
const fixed = new Set(["session","ownership","notes","redirect"]);
const forged=(claims)=>'harbor_session='+btoa(JSON.stringify(claims));
const request=(path,body,cookie='')=>worker.fetch(new Request('http://127.0.0.1:4173'+path,{method:body?'POST':'GET',headers:{cookie,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})}));
const login=async()=>{const r=await request('/api/demo-login',{});assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0]};
test('legitimate login, own reads, notes and outbound payment remain functional',async()=>{
 const c=await login();assert.equal((await request('/',undefined,c)).status,200);
 assert.equal((await request('/api/accounts/1001',undefined,c)).status,200);
 assert.equal((await request('/api/transfers',{from:'1001',to:'1002',amount:10},c)).status,200);
 assert.equal((await request('/api/notes',{note:'Friday reminder'},c)).status,200);
 assert.ok((await(await request('/api/notes',undefined,c)).json()).notes.includes('Friday reminder'));
 assert.equal((await request('/api/transfers',{from:'1001',to:'1002',amount:-1},c)).status,400);
 assert.equal((await request('/api/accounts/1001')).status,401);
});
test('session integrity and privilege boundary',async()=>{
 const c=await login();assert.equal((await request('/api/admin/accounts',undefined,c)).status,403);
 for(const claims of [{username:'alice',role:'admin'},{username:'bob',role:'customer'}]) {
  assert.equal((await request('/api/accounts/1002',undefined,forged(claims))).status,fixed.has('session')?401:200);
 }
 assert.equal((await request('/api/admin/accounts',undefined,forged({username:'alice',role:'admin'}))).status,fixed.has('session')?401:200);
 if(fixed.has('session')) {
  assert.notEqual(c,await login());assert.equal((await request('/api/accounts/1001',undefined,'harbor_session=unknown')).status,401);
  const now=Date.now;try{Date.now=()=>now()+3600001;assert.equal((await request('/api/accounts/1001',undefined,c)).status,401)}finally{Date.now=now}
 }
});
test('account ownership: both disclosure and unauthorized debit',async()=>{
 const c=await login();const aliceBefore=(await(await request('/api/accounts/1001',undefined,c)).json()).balance;
 const bobBefore=testBalances().find(a=>a.id==='1002').balance;
 assert.equal((await request('/api/accounts/1002',undefined,c)).status,fixed.has('ownership')?403:200);
 for(const amount of [1000,0.25]) assert.equal((await request('/api/transfers',{from:'1002',to:'1001',amount},c)).status,fixed.has('ownership')?403:200);
 const aliceAfter=(await(await request('/api/accounts/1001',undefined,c)).json()).balance;
 if(fixed.has('ownership')){assert.equal(aliceAfter,aliceBefore);assert.equal(testBalances().find(a=>a.id==='1002').balance,bobBefore)}else assert.equal(aliceAfter,aliceBefore+1000.25);
 assert.equal((await request('/api/accounts/no-such-account',undefined,c)).status,404);
 assert.equal((await request('/api/transfers',{from:'1001',to:'1002',amount:1},c)).status,200);
});
test('note strings are preserved and renderer uses the selected safe or vulnerable sink',async()=>{
 const c=await login();for(const note of ['<img src=x onerror="document.body.dataset.labXss=1">','<svg onload="document.body.dataset.labXss=2"></svg>']) {
 assert.equal((await request('/api/notes',{note},c)).status,200);assert.ok((await(await request('/api/notes',undefined,c)).json()).notes.includes(note));}
 const home=await(await request('/')).text();if(fixed.has('notes')){assert.match(home,/p.textContent=n/);assert.doesNotMatch(home,/innerHTML=data.notes/)}else assert.match(home,/innerHTML=data.notes/);
});
test('continuation URL parser and external destinations',async()=>{
 const destinations=fixed.has('redirect')?['https://example.org','//example.org','https://127.0.0.1:4173@example.org','https:\\example.org','javascript:alert(1)','data:text/html,hi']:['https://example.org'];
 for(const dest of destinations) {
 const r=await request('/continue?next='+encodeURIComponent(dest));assert.equal(r.status,fixed.has('redirect')?400:302);}
 for(const dest of (fixed.has('redirect')?['/','/?view=overview','http://127.0.0.1:4173/']:['http://127.0.0.1:4173/']))assert.equal((await request('/continue?next='+encodeURIComponent(dest))).status,302);
 assert.equal((await request('/continue')).status,302);
});
test('diagnostics remain explicitly informational',async()=>{assert.equal((await request('/api/diagnostics')).status,200)});
