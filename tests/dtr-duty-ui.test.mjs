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
function load(file,mocks,exportName='default'){const path=fileURLToPath(new URL('../'+file,import.meta.url));const {code}=transformSync(readFileSync(path,'utf8'),{filename:path,babelrc:false,configFile:false,presets:[[require('next/babel'),{'preset-env':{modules:'commonjs'},'preset-react':{runtime:'automatic'}}]]});const module={exports:{}};vm.runInNewContext(code,{module,exports:module.exports,require:id=>Object.hasOwn(mocks,id)?mocks[id]:require(id)});return module.exports[exportName];}
const Empty=()=>null;
const Modal=({trigger})=>React.createElement('button',null,trigger);
const shared={ '../ui/Modal':{__esModule:true,default:Modal},'@/contexts/UserContext':{useUser:()=>({user:{id:'student'}})},'@/lib/cache/duty-queries':{dutyOptions:()=>({})}};

test('absence explanation and head review use the shared form shell and success-only closing footer',()=>{
 const actions=[];
 const Field=({label,children})=>React.createElement('label',null,label,children);
 const Wrapper=({children})=>React.createElement('div',null,children);
 const mocks={...shared,
  '../ui/Modal':{__esModule:true,default:({variant,trigger,children})=>React.createElement('div',{'data-modal-variant':variant},trigger,children)},
  '../ui/ModalForm':{__esModule:true,default:{Root:({children})=>React.createElement('form',{'data-shared-form':true},children),Section:Wrapper,Row:Wrapper,Field,
   Input:props=>React.createElement('input',props),Textarea:props=>React.createElement('textarea',props),
   Actions:props=>{actions.push(props);return React.createElement('button',{type:'submit'},props.submitLabel);}}},
  '../ui/select':{Select:Wrapper,SelectContent:Wrapper,SelectItem:Wrapper,SelectTrigger:Wrapper,SelectValue:Wrapper},
  '../ui/modalFormStyles':{controlClass:'shared-control',modalFormSelectContentClass:'shared-options'},
  '@/lib/cache/duty-queries':{dutyKey:()=>[]},'@/lib/server-actions/duty-actions':{saveDuty:()=>{}},
  'next/navigation':{useRouter:()=>({refresh(){}})},'@tanstack/react-query':{useQueryClient:()=>({})},
 };
 const Details=load('components/dtr-ui/AbsenceDetails.js',mocks,'AbsenceDetails');
 for(const staff of [false,true]){
  const html=renderToStaticMarkup(React.createElement(Details,{staff,report:{id:1,shift_date:'2026-11-11',category:'worked',reason:'I missed clock in',review_status:'pending'}}));
  assert.match(html,/data-modal-variant="form"/);assert.match(html,/data-shared-form="true"/);
  assert.match(html,staff?/name="reviewNote"/:/name="reason"/);
  if(staff){assert.match(html,/name="actualIn"/);assert.match(html,/name="hours"/);}
 }
 assert.equal(actions.length,2);assert(actions.every(p=>p.closeOnSubmit===false && p.disableCancelWhilePending===true));
 for(const status of ['reviewed','corrected']){
  const html=renderToStaticMarkup(React.createElement(Details,{report:{id:2,shift_date:'2026-11-11',reason:null,review_status:status}}));
  assert.match(html,/View report/);assert(!html.includes('Add reason'));assert(!html.includes('Submit explanation'));
 }
});

test('absence rows share the DTR columns with zero hours, reason action and no delete action',()=>{
 const Table=load('components/dtr-ui/DtrTable.js',{
  './DtrDeleteForm':{__esModule:true,default:Empty},'../ui/Modal':{__esModule:true,default:Modal},
  './DtrPhotoButton':{__esModule:true,default:Empty},'next/link':{__esModule:true,default:Empty},
  './DtrReviewDetails':{__esModule:true,default:Empty},'./AbsenceDetails':{AbsenceDetails:()=>React.createElement('button',null,'View reason')},
 });
 const html=renderToStaticMarkup(React.createElement(Table,{allowDelete:true,dtrs:[
  {id:'absence-1',created_at:'2026-11-11',total_hours:0,status:'absent',absence_report:{id:1,review_status:'pending'}},
 ]}));
 assert.match(html,/0\.00/);assert.match(html,/View reason/);assert.match(html,/absent/);
 assert(!html.includes('Delete record'));assert(!html.includes('View in'));
});

test('student schedule panel keeps schedule controls but does not render another attendance table',()=>{
 const Panel=load('components/dtr-ui/DutySchedulePanel.js',{
  '../ui/ModalForm':{__esModule:true,default:{}},
  ...shared,'./AbsenceDetails':{useDutySave:()=>({}),AbsenceForm:Empty,AbsenceDetails:Empty},
  '../ui/button':{Button:Empty},'../ui/DropdownFilter':{__esModule:true,default:Empty},
  '../ui/skeleton':{Skeleton:Empty},'../help-ui/HelpManual':{__esModule:true,default:Empty},
  '@tanstack/react-query':{useQuery:()=>({data:{reports:[],schedules:[],now:'2026-11-11 08:00:00'}})},
 });
 const html=renderToStaticMarkup(React.createElement(Panel));
 assert.match(html,/Set \/ change schedule/);assert.match(html,/Report another date/);
 assert(!html.includes('Timing'));assert(!html.includes('Pictures'));assert.match(html,/Schedule history/);
});
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
