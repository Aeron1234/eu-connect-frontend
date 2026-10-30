import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {JSDOM} from 'jsdom';
import {analyticsCsv} from '../lib/analytics-export.mjs';
const require=createRequire(import.meta.url),{transformSync}=require('next/dist/compiled/babel/core');
function load(file,mocks){const url=new URL('../'+file,import.meta.url);const {code}=transformSync(readFileSync(url,'utf8'),{filename:url.pathname,babelrc:false,configFile:false,presets:[[require('next/babel'),{'preset-env':{modules:'commonjs'},'preset-react':{runtime:'automatic'}}]]});const mod={exports:{}};vm.runInNewContext(code,{URLSearchParams,module:mod,exports:mod.exports,require:id=>Object.hasOwn(mocks,id)?mocks[id]:require(id)});return mod.exports;}
const Empty=()=>null;
function render(mode,data,error){
  const Stats=load('components/dashboard-ui/DashboardStats.js',{'next/link':{__esModule:true,default:props=>React.createElement('a',props)}}).default;
  const Dashboard=load('components/analytics-ui/AnalyticsDashboard.js',{
    '@/contexts/UserContext':{useUser:()=>({user:{id:'viewer',role:mode==='registrar'?'department_head':'admin',department_code:mode==='registrar'?'REG':null}})},
    '@tanstack/react-query':{useQuery:()=>({data,isPending:false,isError:!!error,error,isFetching:false,refetch(){}})},
    'react-to-print':{useReactToPrint:()=>()=>{}},
    'next/link':{__esModule:true,default:props=>React.createElement('a',props)},
    '@/lib/server-actions/analytics-actions':{},'@/lib/analytics-export.mjs':{analyticsCsv},
    '@/components/ui/button':{Button:({children,...props})=>React.createElement('button',Object.fromEntries(Object.entries(props).filter(([key])=>!['variant','size'].includes(key))),children)},
    '@/components/ui/DropdownFilter':{__esModule:true,default:Empty},
    '@/components/ui/PageTitle':{__esModule:true,default:({title})=>React.createElement('h1',null,title)},
    '@/components/help-ui/HelpManual':{__esModule:true,default:Empty},
    '@/components/dashboard-ui/DashboardStats':{__esModule:true,default:Stats},
    '@/components/ui/ErrorUI':{__esModule:true,default:({error})=>React.createElement('p',{role:'alert'},error.message)},
    './AnalyticsDetails':{__esModule:true,default:Empty},'./AnalyticsSkeleton':{__esModule:true,default:Empty},'./AnalyticsCharts':{__esModule:true,default:Empty}
  }).default;
  return new JSDOM(renderToStaticMarkup(React.createElement(Dashboard,{mode})));
}
const options={departments:[],courses:[],academicYears:['2026-2027']};
test('Registrar cards preserve report tab/year/status and expose no company popularity controls',()=>{
  const dom=render('registrar',{stats:{reports:2,drafts:1,submitted:1,confirmedStudents:3},options,filters:{academicYear:'2026-2027'},generatedAt:'2026-10-31T00:00:00Z',distribution:[],recent:[],trends:[]});
  try{
    const links=[...dom.window.document.querySelectorAll('a')].map(a=>a.getAttribute('href'));
    assert(links.some(link=>link.includes('tab=annex-c')&&link.includes('status=draft')&&link.includes('year=2026-2027')));
    assert(links.some(link=>link.includes('tab=annex-d')&&link.includes('year=2026-2027')));
    assert(!dom.window.document.body.textContent.includes('Most popular'));assert(!dom.window.document.body.textContent.includes('CSV report'));
    assert(dom.window.document.querySelector('section.grid').className.includes('grid-cols-1'));
  }finally{dom.window.close();}
});
test('empty company report is explicit, exports remain available and forbidden data is masked',()=>{
  const data={stats:{distinctStudents:0,studentCompanyPairs:0,companiesWithPlacements:0,zeroCompanies:0,undatedRecords:0,unnamedRecords:0},options,filters:{},companies:[],zeroCompanies:[],most:[],least:[],trends:[],generatedAt:'2026-10-31T00:00:00Z'};
  const dom=render('companies',data);
  try{assert.match(dom.window.document.body.textContent,/No confirmed placements/);assert.match(dom.window.document.body.textContent,/CSV report/);assert(dom.window.document.querySelector('table').parentElement.className.includes('overflow-x-auto'));}finally{dom.window.close();}
  const denied=render('companies',data,Object.assign(new Error('Access denied'),{status:403}));
  try{assert(denied.window.document.querySelector('[role="alert"]'));assert.equal(denied.window.document.querySelector('table'),null);}finally{denied.window.close();}
});
test('CSV preserves full rows/quotes/Unicode and prevents spreadsheet formula execution',()=>{
  const csv=analyticsCsv(['Company','Students'],[['=HYPERLINK("x")',2],['Café, Manila',1],['@SUM(A1)',0]]);
  assert(csv.startsWith('\ufeff'));assert(csv.includes('"\'=HYPERLINK(""x"")"'));assert(csv.includes('"Café, Manila","1"'));assert(csv.includes('"\'@SUM(A1)"'));
});
