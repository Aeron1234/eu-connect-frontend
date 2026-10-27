import test from 'node:test';
import assert from 'node:assert/strict';
import {readRotations,retryRotationRead,rotationAccessLost} from '../lib/rotation-read.mjs';
test('rotation reads are cancellable private GETs and preserve internship status',async()=>{
 let call;const data={success:true,status:'ongoing',rotations:[]};
 const result=await readRotations('record',{},async(url,options)=>{call={url,options};return Response.json(data);});
 assert.equal(result.status,'ongoing');assert.equal(call.url,'/api/internship-records/record/rotations');assert.equal(call.options.method,'GET');assert.equal(call.options.cache,'no-store');assert.equal(call.options.credentials,'same-origin');assert.ok(call.options.signal);
});
test('temporary failures retry once and authorization/not-found failures do not retry',async()=>{
 for(const status of [401,403,404,429,500,502,503,504]) {
  await assert.rejects(readRotations('r',{},async()=>Response.json({error:'Denied'},{status})),e=>e.status===status);
 }
 for(const status of [0,408,500,502,503,504]) {assert.ok(retryRotationRead(0,{status}));assert.ok(!retryRotationRead(1,{status}));}
 for(const status of [400,401,403,404,409,429]) assert.ok(!retryRotationRead(0,{status}));
 for(const status of [401,403,404]) assert.ok(rotationAccessLost({status}));assert.ok(!rotationAccessLost({status:503}));
});
test('malformed payloads and network failures cannot become empty successful timelines',async()=>{
 await assert.rejects(readRotations('r',{},async()=>{throw Error('offline');}),e=>e.status===0);
 await assert.rejects(readRotations('r',{},async()=>new Response('<html>error</html>')),e=>e.status===502);
 await assert.rejects(readRotations('r',{},async()=>Response.json({success:true})),e=>e.status===502);
 const controller=new AbortController();controller.abort(new DOMException('Cancelled','AbortError'));
 await assert.rejects(readRotations('r',{signal:controller.signal},async()=>{throw controller.signal.reason;}),e=>e.name==='AbortError');
});

// Execute the hook contract with isolated query results to verify private-cache handling.
test('hook keeps transient cached data but masks data after access loss', async()=>{
 const {createRequire}=await import('node:module');const {readFileSync}=await import('node:fs');const vm=await import('node:vm');
 const require=createRequire(import.meta.url);const {transformSync}=require('next/dist/compiled/babel/core');
 const source=readFileSync(new URL('../lib/hooks/useInternshipRotations.js',import.meta.url),'utf8');
 const {code}=transformSync(source,{babelrc:false,configFile:false,plugins:[require('next/dist/compiled/babel/plugin-transform-modules-commonjs')]});
 let query,options;const mod={exports:{}};
 vm.runInNewContext(code,{module:mod,exports:mod.exports,require(id){
  if(id==='@tanstack/react-query')return {useQuery(value){options=value;return query;}};
  if(id==='@/contexts/UserContext')return {useUser:()=>({user:{id:'viewer'}})};
  return {readRotations,retryRotationRead,rotationAccessLost};
 }});
 const data={enabled:true,rotations:[]};query={data,isError:true,error:{status:503}};
 assert.equal(mod.exports.default('record').data,data);assert.equal(options.retry,retryRotationRead);assert.equal(options.enabled,true);
 for(const status of [401,403,404]){query={data,isError:true,error:{status}};assert.equal(mod.exports.default('record').data,undefined);}
 mod.exports.default(null);assert.equal(options.enabled,false);
});
