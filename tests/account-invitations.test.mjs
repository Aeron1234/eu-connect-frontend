import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const require=createRequire(import.meta.url);
const { transformSync }=require('next/dist/compiled/babel/core');
function load(file,mocks={},globals={}) {
  const url=new URL('../'+file,import.meta.url);
  const {code}=transformSync(readFileSync(url,'utf8'),{filename:url.pathname,babelrc:false,configFile:false,presets:[[require('next/babel'),{'preset-env':{modules:'commonjs'},'preset-react':{runtime:'automatic'}}]]});
  const mod={exports:{}};vm.runInNewContext(code,{module:mod,exports:mod.exports,console,AbortSignal,process:{env:{NODE_ENV:'test'}},...globals,require(id){return Object.hasOwn(mocks,id)?mocks[id]:require(id);}});return mod.exports;
}
function authHarness({ payload=null, reply={success:true}, status=200 }={}) {
  const writes=[],calls=[];
  const store={get:name=>name==='access_token'?{value:'access'}:undefined,set:(...args)=>writes.push(['set',...args]),delete:name=>writes.push(['delete',name])};
  const auth=load('lib/server-actions/auth.js',{
    '../api-base-url.mjs':{getApiBaseUrl:()=> 'https://backend.example/api/v1'},
    'next/headers':{cookies:async()=>store},react:{cache:fn=>fn},
    './auth-shared':{ACCESS_COOKIE:'access_token',REFRESH_COOKIE:'refresh_token',verifyAccessToken:()=>payload,refreshTokens:async()=>assert.fail('no refresh for setup session'),payloadToUser:p=>({id:p.sub})},
    'next/navigation':{redirect:path=>{throw Object.assign(new Error('redirect'),{path});}},
  },{fetch:async(url,options)=>{calls.push({url,options});return Response.json(reply,{status});}});
  return {auth,writes,calls};
}

test('invitation password setup posts the token without an authenticated session and clears cookies only after success',async()=>{
  const {auth,writes,calls}=authHarness();
  const data=new FormData();data.set('token','a'.repeat(64));data.set('newPassword','TEST-password');data.set('confirmPassword','TEST-password');
  await assert.rejects(auth.setPassword(data),error=>error.path==='/login?signin=1');
  assert(calls[0].url.endsWith('/auth/account-setup'));assert.equal(calls[0].options.method,'POST');
  assert.equal('Authorization' in calls[0].options.headers,false);
  assert.equal(JSON.parse(calls[0].options.body).token,'a'.repeat(64));assert.equal(writes.length,2);
  const failed=authHarness({reply:{error:'Expired link'},status:400});
  assert.equal((await failed.auth.setPassword(data)).error,'Expired link');assert.equal(failed.writes.length,0);
});

test('password-setup sessions are excluded from ordinary session and bearer-token helpers',async()=>{
  const {auth}=authHarness({payload:{sub:'user',purpose:'password_setup'}});
  assert.equal(await auth.getUserSession(),null);assert.equal(await auth.getAccessToken(),null);
  const normal=authHarness({payload:{sub:'user'}});assert.equal((await normal.auth.getUserSession()).user.id,'user');assert.equal(await normal.auth.getAccessToken(),'access');
});

test('legacy temporary login stores no refresh token and directs only to password setup',async()=>{
  const {auth,writes}=authHarness({reply:{accessToken:'setup-only',refreshToken:null,mustChangePassword:true}});
  const form=new FormData();form.set('username','user');form.set('password','legacy-code');
  await assert.rejects(auth.login(form),error=>error.path==='/set-password');
  assert(writes.some(x=>x[0]==='set'&&x[1]==='access_token'));
  assert(!writes.some(x=>x[0]==='set'&&x[1]==='refresh_token'));
  assert(writes.some(x=>x[0]==='delete'&&x[1]==='refresh_token'));
});

test('the page proxy redirects setup-only sessions away from private pages while emailed setup links remain public',async()=>{
  const proxy=load('proxy.js',{
    'next/server':{NextResponse:{next:()=>({kind:'next'}),redirect:url=>({kind:'redirect',url,cookies:{delete(){}}})}},
    '@/lib/server-actions/auth-shared':{ACCESS_COOKIE:'access_token',REFRESH_COOKIE:'refresh_token',verifyAccessToken:()=>({sub:'user',purpose:'password_setup'})},
  },{URL,console:{log(){}}}).proxy;
  const request=pathname=>({nextUrl:{pathname},url:'https://frontend.example'+pathname,cookies:{get:()=>({value:'setup'})}});
  assert.equal((await proxy(request('/student'))).url.pathname,'/set-password');
  assert.equal((await proxy(request('/set-password'))).kind,'next');
});

test('account creation no longer collects a password and preserves the committed creation when invitation delivery fails',async()=>{
  const jobs=[],states=[];let created=0;
  const hooks={useState:value=>[value,v=>states.push(v)],useTransition:()=>[false,fn=>jobs.push(fn())]};
  const Hook=load('components/account-ui/useCreateAccountForm.js',{
    react:hooks,'@/lib/helpers':{toastAndAction:async()=>({success:true,accountId:'new',invitation_sent:false,message:'Account created; delivery unconfirmed.'})},
    '@/lib/server-actions/account-actions':{},
  }).default;
  const form=Hook({roles:[],courses:[],departments:[],onCreated:()=>created++});
  assert.equal('password' in form.credentialsProps.accountForm,false);
  form.handleAction(new FormData());await Promise.all(jobs);assert.equal(created,1);assert(states.some(x=>x?.accountId==='new'&&x.invitation_sent===false));
  const Fields=load('components/account-ui/AccountCredentialsFields.js',{'./accountFormStyles':{}}).default;
  const html=renderToStaticMarkup(React.createElement(Fields,{accountForm:{username:'user'},setAccountForm(){},isPending:false}));
  assert(!html.includes('name="password"'));assert(html.includes('name="username"'));assert(html.includes('setup link'));
});
