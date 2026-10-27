import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url),root=fileURLToPath(new URL('../',import.meta.url));
const {transformSync}=require('next/dist/compiled/babel/core');
const e=React.createElement,empty=()=>null;
function loader(mocks={}) {
 const cache=new Map();
 function load(file){
  const path=resolve(root,file);if(cache.has(path))return cache.get(path).exports;
  const {code}=transformSync(readFileSync(path,'utf8'),{filename:path,babelrc:false,configFile:false,presets:[[require('next/babel'),{'preset-env':{modules:'commonjs'},'preset-react':{runtime:'automatic'}}]]});
  const mod={exports:{}};cache.set(path,mod);
  vm.runInNewContext(code,{module:mod,exports:mod.exports,require(id){
   if(Object.hasOwn(mocks,id))return mocks[id];
   if(id==='@/components/ui/skeleton')return {Skeleton:props=>e('div',{'data-skeleton':true,...props})};
   if(id.startsWith('@/'))return load(id.slice(2)+'.js');
   if(id.startsWith('.'))return load(resolve(dirname(path),id+'.js'));
   return require(id);
  }});return mod.exports;
 }return load;
}
const html=(Component,props={})=>renderToStaticMarkup(e(Component,props));
test('calendar route and uncached month have matching skeletons, background refresh retains calendar',()=>{
 const load=loader({'./CalendarMonthNavigation':()=>e('div',null,'Month controls'),'./CalendarKindFilters':empty,'./CalendarMonthGrid':()=>e('div',null,'Loaded calendar')});
 assert.match(html(load('app/calendar/loading.js').default),/Loading calendar page/);
 const Month=load('components/calendar-ui/CalendarMonthView.js').default;
 const initial=html(Month,{dates:Array.from({length:42}),loading:true,initialLoading:true});
 assert.match(initial,/Loading calendar days/);assert.match(initial,/Month controls/);assert.doesNotMatch(initial,/Loaded calendar/);
 const refresh=html(Month,{dates:[],loading:true,initialLoading:false});assert.match(refresh,/Loaded calendar/);assert.doesNotMatch(refresh,/Loading calendar days/);
});
test('rotation transition selects a rotation skeleton and never falls through to documents',()=>{
 const load=loader({'./SetDtrLocationSkeleton':empty,'./EvaluationListSkeleton':empty,'./RecordsDocumentsSkeleton':()=>e('div',null,'Wrong document skeleton'),'./RecordsOverviewSkeleton':empty,'./DtrRecordsSkeleton':empty,'./NarrativesSkeleton':empty,'./RecordsSummaryReportSkeleton':empty});
 const result=html(load('components/skeletons/RecordsTabContentSkeleton.js').default,{tab:'rotations'});
 assert.match(result,/Loading company rotations/);assert.doesNotMatch(result,/Wrong document skeleton/);
});
test('internship filters show skeletons even with old rows, background failures retain rows',()=>{
 let pending=true;const query={data:{},isError:false};
 const load=loader({'./useInternshipPosts':()=>({coursesQuery:{},postsQuery:query,internshipPosts:[{id:'old'}],isPending:pending}), './InternshipPostsFilters':()=>e('div',null,'Filters'),'./InternshipPostsList':()=>e('div',null,'Loaded listing'),'../skeletons/InternshipPostsListSkeleton':()=>e('div',null,'Listing skeleton'),'@/components/ui/ErrorUI':()=>e('div',null,'Retry error')});
 const Posts=load('components/internship-posts-ui/InternshipPosts.js').default;
 const initial=html(Posts);assert.match(initial,/Filters/);assert.match(initial,/Listing skeleton/);assert.doesNotMatch(initial,/Loaded listing/);
 pending=false;query.isError=true;const refresh=html(Posts);assert.match(refresh,/Loaded listing/);assert.match(refresh,/Retry error/);assert.doesNotMatch(refresh,/Listing skeleton/);
});
test('editable Leaflet chunk provides a bounded loading callback',()=>{
 let options;const load=loader({'next/dynamic':(read,opts)=>{options=opts;return opts.loading;}});
 const Map=load('components/map-ui/MapFormContainer.js').default;const result=html(Map,{mapStyle:{height:'320px'}});
 assert.equal(options.ssr,false);assert.match(result,/Loading location map/);assert.match(result,/height:320px/);
});
test('narrative assignment loading remains required and submits no placeholder IDs',()=>{
 const load=loader({'@/lib/hooks/useInternshipRotations':()=>({isPending:true}), '@/lib/internship-rotations.mjs':{rotationSnapshots:()=>[],suggestedRotations:()=>[]}, './NarrativeRotations':empty});
 const result=html(load('components/weekly-narratives-ui/NarrativeRotationPicker.js').default,{internshipId:'record'});
 assert.match(result,/Loading company assignments/);assert.match(result,/data-skeleton/);assert.match(result,/required=""/);assert.doesNotMatch(result,/name="rotation_ids"|type="checkbox"/);
});
test('evaluation eligibility skeleton keeps the real form hidden',()=>{
 let query={isPending:true};const load=loader({'@tanstack/react-query':{useQuery:()=>query},'@/contexts/UserContext':{useUser:()=>({user:{id:'student'}})},'@/lib/server-actions/evaluations-actions':{},'@/components/ui/ErrorUI':()=>e('div',null,'Error, retry')});
 const Guard=load('components/evaluations-ui/EvaluationPostingGuard.js').default;
 let result=html(Guard,{children:e('form',null,'Actual evaluation')});assert.match(result,/Checking evaluation availability/);assert.match(result,/data-skeleton/);assert.doesNotMatch(result,/Actual evaluation/);
 query={isError:true};result=html(Guard,{children:'Actual evaluation'});assert.match(result,/Error, retry/);assert.doesNotMatch(result,/Actual evaluation|data-skeleton/);
});
test('discussion and intern-selection skeletons have no interactive placeholder controls',()=>{
 const load=loader();for(const [file,label] of [['FeedbackThreadSkeleton','Loading discussion'],['SelectionRowsSkeleton','Loading your interns']]) {
  const result=html(load('components/skeletons/'+file+'.js').default,{label,search:true});assert.match(result,new RegExp(label));assert.match(result,/data-skeleton/);assert.doesNotMatch(result,/<input|<button|<textarea/);
 }
});
