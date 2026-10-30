import test from 'node:test';
import assert from 'node:assert/strict';
import {companyAnalyticsHtml} from '../app/_services/companyAnalyticsTemplate.mjs';
test('PDF includes all companies, zero matches and applied filters with escaped text',()=>{
  const row={rank:1,company:'<script>unsafe</script>',students:2,ongoing:1,finished:1,share:100,courses:['CS'],departments:['CCS']};
  const html=companyAnalyticsHtml({filters:{from:'2026-01-01',courseId:1},options:{departments:[],courses:[{id:1,course_name:'CS'}]},companies:Array.from({length:14},(_,i)=>({...row,company:i===13?'Final company':row.company})),zeroCompanies:[{...row,company:'Zero company',students:0}],stats:{distinctStudents:2,studentCompanyPairs:2,undatedRecords:0,unnamedRecords:0},generatedAt:'2026-10-31'});
  assert(html.includes('Final company'));assert(html.includes('Zero company'));assert(html.includes('2026-01-01'));assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));assert(html.includes('A4 landscape'));
});
