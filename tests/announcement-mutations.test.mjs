import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const {transformSync}=require('next/dist/compiled/babel/core');
const source=readFileSync(new URL('../lib/server-actions/announcements-actions.js',import.meta.url),'utf8');
function fixture(timeout){
  const calls=[],paths=[],limits=[];
  const mocks={'react':{cache:fn=>fn},'./auth':{getAccessToken:async()=> 'fixture'},'../api-base-url.mjs':{getApiBaseUrl:()=> 'http://fixture/api/v1'},'next/cache':{revalidatePath:path=>paths.push(path)},'../api-response':{parseApiResponse:async()=>({success:true})}};
  const {code}=transformSync(source,{filename:'announcements-actions.js',babelrc:false,configFile:false,presets:[[require('next/babel'),{'preset-env':{modules:'commonjs'}}]]});
  const mod={exports:{}};
  vm.runInNewContext(code,{module:mod,exports:mod.exports,console:{error(){}},AbortSignal:{timeout:ms=>{limits.push(ms);return AbortSignal.timeout(timeout?1:ms);}},fetch:async(url,options)=>{
    calls.push({url,options});
    if(!timeout)return {};
    await new Promise((resolve,reject)=>{const timer=setTimeout(resolve,100);options.signal.addEventListener('abort',()=>{clearTimeout(timer);reject(options.signal.reason);},{once:true});});
  },require:id=>Object.hasOwn(mocks,id)?mocks[id]:require(id)});
  return {actions:mod.exports,calls,paths,limits};
}
const writes=['createAnnouncement','updateAnnouncement','deleteAnnouncement','togglePinAnnouncement'];
function form(){const data=new FormData();data.set('id','fixture');data.set('announcementId','fixture');data.set('is_pinned','1');return data;}
test('all announcement writes bound requests, preserve explicit methods and revalidate only on success',async()=>{
  const f=fixture(false);
  for(const name of writes)assert.equal((await f.actions[name](form())).success,true);
  assert.deepEqual(f.calls.map(call=>call.options.method),['POST','PATCH','DELETE','PATCH']);
  assert.deepEqual(f.limits,[20000,20000,20000,20000]);
  assert(f.paths.includes('/announcements'));assert(f.paths.includes('/calendar'));assert(f.paths.includes('/notifications'));
});
test('stalled writes settle with refresh-before-retry guidance, without retrying or revalidating',async()=>{
  const f=fixture(true);
  for(const name of writes){const result=await f.actions[name](form());assert.equal(result.success,false);assert.match(result.error,/timed out.*Refresh announcements.*before trying again/);}
  assert.equal(f.calls.length,4);assert.equal(f.paths.length,0);
});
