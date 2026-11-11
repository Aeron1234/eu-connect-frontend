import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {getNotificationTargetPath} from '../lib/notification-routes.js';
const require=createRequire(import.meta.url);
const {transformSync}=require('next/dist/compiled/babel/core');
function load(file,mocks){const path=fileURLToPath(new URL('../'+file,import.meta.url));const {code}=transformSync(readFileSync(path,'utf8'),{filename:path,babelrc:false,configFile:false,presets:[[require('next/babel'),{'preset-env':{modules:'commonjs'},'preset-react':{runtime:'automatic'}}]]});const module={exports:{}};vm.runInNewContext(code,{module,exports:module.exports,require:id=>Object.hasOwn(mocks,id)?mocks[id]:require(id)});return module.exports.default;}
const Empty=()=>null;
const Modal=({trigger})=>React.createElement('button',null,trigger);
const shared={ '../ui/Modal':{__esModule:true,default:Modal},'@/contexts/UserContext':{useUser:()=>({user:{id:'student'}})},'@/lib/cache/duty-queries':{dutyOptions:()=>({})}};
test('new duty notices use allowed dashboard and Attendance destinations only',()=>{
 for(const type of ['dtr_absence','dtr_duty_schedule']){
 for(const link of ['/student','/department_head/attendance?section=absences','/department_head/attendance?section=schedules'])assert.equal(getNotificationTargetPath({type,link}),link);
 for(const link of ['https://other.test','/admin','javascript:alert(1)',undefined])assert.equal(getNotificationTargetPath({type,link}),'/notifications');
 }
});
test('Clock in stays hidden without an allowed schedule but Clock out remains available for an open shift',()=>{
 const Button=load('components/dtr-ui/DtrButton.js',{...shared,'./DtrForm':{__esModule:true,default:Empty},'@/lib/cache/dtr-queries':{dtrKeys:{}},'@/lib/cache/dashboard-overview-queries':{dashboardOverviewKeys:{}},'@tanstack/react-query':{useQuery:()=>({data:{access:{open:false,message:'Set your duty schedule'}}}),useQueryClient:()=>({})}});
 const internshipData={status:'ongoing',id:'ir',accumulated_hours:0,total_hours:300};
 const off=renderToStaticMarkup(React.createElement(Button,{internshipData,status:'CLOCKED_OUT',record:null}));assert.match(off,/Set your duty schedule/);assert(!off.includes('>Clock in<'));
 const on=renderToStaticMarkup(React.createElement(Button,{internshipData,status:'CLOCKED_IN',record:{clock_in:'2026-11-11T08:00:00+08:00',clock_out:null}}));assert.match(on,/Clock out/);
});
test('Report absence is hidden after attendance/report exists or while a shift is open',()=>{
 for(const [canReport,hasOpenShift,shown] of [[true,false,true],[false,false,false],[true,true,false]]){
 const Button=load('components/dtr-ui/ReportAbsenceButton.js',{...shared,'./AbsenceDetails':{AbsenceForm:Empty},'@tanstack/react-query':{useQuery:()=>({data:{canReport,duty:{shift_date:'2026-11-11'}}})}});
 const html=renderToStaticMarkup(React.createElement(Button,{hasOpenShift}));assert.equal(html.includes('Report absence'),shown);
 }
});
