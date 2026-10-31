"use client";
import AnalyticsDetails from './AnalyticsDetails';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import useExportPdf from '@/components/ui/useExportPdf';
import { format } from 'date-fns';
import { Building2,Users,FileText,CheckCircle,Clock,RefreshCw,Download,Printer } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { getAnalytics } from '@/lib/server-actions/analytics-actions';
import { analyticsCsv } from '@/lib/analytics-export.mjs';
import { Button } from '@/components/ui/button';
import DropdownFilter from '@/components/ui/DropdownFilter';
import PageTitle from '@/components/ui/PageTitle';
import HelpManual from '@/components/help-ui/HelpManual';
import DashboardStats from '@/components/dashboard-ui/DashboardStats';
import ErrorUI from '@/components/ui/ErrorUI';
import AnalyticsSkeleton from './AnalyticsSkeleton';
import AnalyticsCharts from './AnalyticsCharts';

const panel='min-w-0 space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5';
const control='h-10 w-full min-w-0 rounded-md border border-input bg-card px-3 text-xs';
function Select({label,value,onChange,rows}){return <DropdownFilter aria-label={label} placeholder={label} value={value||''} onValueChange={onChange} className={control} options={[{value:'',label},...rows]}/>;}
function CompanyTable({rows}){return <table className="w-full min-w-[680px] text-left text-xs"><thead><tr>{['Rank','Company','Distinct students','Ongoing','Finished','Share','Courses','Departments'].map(label=><th key={label} className="border-b border-border p-3">{label}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.key} className="border-b border-border"><td className="p-3">{row.rank||'—'}</td><td className="max-w-xs break-words p-3 font-medium">{row.company}</td><td className="p-3">{row.students}</td><td className="p-3">{row.ongoing}</td><td className="p-3">{row.finished}</td><td className="p-3">{(row.share||0).toFixed(1)}%</td><td className="max-w-xs p-3">{row.courses.join(', ')||'—'}</td><td className="p-3">{row.departments.join(', ')||'—'}</td></tr>)}</tbody></table>;}
const options=(rows,label)=>rows.map(row=>({value:String(row.id),label:row[label]||row.course_name||row.name}));
export default function AnalyticsDashboard({mode='companies'}){
  const {user}=useUser();return <Insights key={`${user.id}:${mode}`} user={user} mode={mode}/>;
}
function Insights({user,mode}){
  const registrar=mode==='registrar';
  const [draft,setDraft]=useState({}),[applied,setApplied]=useState({}),[page,setPage]=useState(1),[showZero,setShowZero]=useState(false);

  const title=registrar?'Registrar Dashboard':'Internship Company Analytics';
  const {isPending:pdfPending,handleExport:previewReport}=useExportPdf({endpoint:"/api/reports/company-analytics",params:applied,filename:"internship-company-analytics.pdf"});
  const query=useQuery({queryKey:['analytics',String(user.id),mode,applied],queryFn:async()=>{const result=await getAnalytics(mode,applied);if(!result.success)throw Object.assign(new Error(result.error),{status:result.status});return result;},retry:false,staleTime:2*60_000,refetchOnWindowFocus:false});
  if(query.isPending)return <AnalyticsSkeleton registrar={registrar} admin={user.role==='admin'}/>;
  if(query.isError&&(!query.data||[401,403].includes(query.error?.status)))return <div className="p-4"><ErrorUI compact error={query.error} reset={()=>query.refetch()}/><Button variant="outline" onClick={()=>{setDraft({});setApplied({});}}>Clear filters</Button></div>;
  const data=query.data;
  const snapshot=format(new Date(data.generatedAt),'MM/dd/yyyy h:mm a');
  const period=registrar?data.filters.academicYear:`${applied.academicYear?`AY ${applied.academicYear}`:'All academic years'} · ${applied.term||'All terms'} · Starts ${applied.from||'any date'} through ${applied.to||'any date'}`;
  const set=(key,value)=>{setDraft(previous=>({...previous,[key]:value,...(key==='departmentId'?{courseId:''}:{})}));};
  const sipp=(tab,status='')=>'/department_head/sipp-reports?'+new URLSearchParams({tab,year:registrar?data.filters.academicYear:applied.academicYear||'',...(status?{status}:{})});
  const rows=registrar?[]:(showZero?data.zeroCompanies:data.companies);
  const pages=Math.max(1,Math.ceil(rows.length/10)),current=Math.min(page,pages);
  const cards=registrar?[
    {label:'Annex C reports',value:data.stats.reports,icon:FileText,href:sipp('annex-c')},
    {label:'Annex C drafts',value:data.stats.drafts,icon:Clock,href:sipp('annex-c','draft')},
    {label:'Submitted Annex C',value:data.stats.submitted,icon:CheckCircle,href:sipp('annex-c','submitted')},
    {label:'Confirmed student interns',value:data.stats.confirmedStudents,icon:Users,href:sipp('annex-d')}
  ]:[{label:'Distinct students',value:data.stats.distinctStudents,icon:Users},{label:'Student/company pairs',value:data.stats.studentCompanyPairs,icon:FileText},{label:'Companies with placements',value:data.stats.companiesWithPlacements,icon:Building2},{label:'Known companies with zero matches',value:data.stats.zeroCompanies,icon:Building2}];
  function download(){const all=[...data.companies,...data.zeroCompanies];const text=analyticsCsv(['Period','Department filter','Course filter','Rank','Company','Distinct students','Ongoing','Finished','Courses','Departments'],all.map(row=>[period,departmentLabel,courseLabel,row.rank||'',row.company,row.students,row.ongoing,row.finished,row.courses.join('; '),row.departments.join('; ')]));const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='internship-company-analytics.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  const departmentLabel=user.role==='department_head'&&!registrar?'Your department':data.options.departments.find(row=>String(row.id)===String(applied.departmentId))?.name||'All departments';
  const courseLabel=data.options.courses.find(row=>String(row.id)===String(applied.courseId))?.course_name||'All courses';
  return <div className="min-w-0 space-y-5 p-4 sm:p-6 lg:p-8">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><PageTitle Icon={registrar?FileText:Building2} title={title} description={registrar?'Your authorized SIPP reporting overview.':'Confirmed placements, counted once per student and company.'} titleAction={<HelpManual guideId={registrar?'registrar-dashboard':'company-analytics'}/>}/><Button variant="outline" className="self-start" onClick={()=>query.refetch()} disabled={query.isFetching}><RefreshCw className="size-4"/>Refresh</Button></div>
    <form className={panel} onSubmit={event=>{event.preventDefault();setApplied({...draft});setPage(1);}}><div className={`grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 ${!registrar&&user.role==='admin'?'xl:grid-cols-4':'xl:grid-cols-3'}`}>
      {!registrar&&user.role==='admin'&&<Select label="Departments" value={draft.departmentId} onChange={value=>set('departmentId',value)} rows={options(data.options.departments,'code')}/>}
      {!registrar&&<Select label="Courses" value={draft.courseId} onChange={value=>set('courseId',value)} rows={options(data.options.courses.filter(row=>!draft.departmentId||String(row.department_id)===String(draft.departmentId)),'short_name')}/>}
      <Select label={registrar?'Current academic year':'All academic years'} value={draft.academicYear} onChange={value=>set('academicYear',value)} rows={data.options.academicYears.map(year=>({value:year,label:year}))}/>
      {!registrar&&<Select label="All terms" value={draft.term} onChange={value=>set('term',value)} rows={[{value:'1st',label:'First semester'},{value:'2nd',label:'Second semester'},{value:'summer',label:'Summer'}]}/>}
    </div>{!registrar&&<div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"><label className="min-w-0 text-xs">Internship starts from<input type="date" value={draft.from||''} onChange={event=>set('from',event.target.value)} className={control}/></label><label className="min-w-0 text-xs">Internship starts through<input type="date" min={draft.from||undefined} value={draft.to||''} onChange={event=>set('to',event.target.value)} className={control}/></label></div>}<div className="flex flex-wrap gap-2"><Button type="submit" disabled={query.isFetching}>Apply filters</Button><Button type="button" variant="outline" onClick={()=>{setDraft({});setApplied({});setPage(1);}}>Reset</Button></div></form>
    <p className="break-words text-xs text-muted-foreground">Displayed period: {period}{!registrar&&` · ${departmentLabel} · ${courseLabel}`} · Snapshot {snapshot}</p>
    {query.isError&&<ErrorUI compact error={query.error} reset={()=>query.refetch()}/>}
    {query.isFetching&&<p role="status" className="text-xs text-muted-foreground">Refreshing analytics…</p>}
    <DashboardStats stats={cards.map((row,i)=>({...row,accent:i===0?'bg-primary text-white':'bg-card border border-border',valueClass:i===0?'text-primary-foreground':'text-foreground',labelClass:i===0?'text-primary-foreground/80':'text-primary-emphasis'}))}/>
    {!registrar&&<><div className="grid min-w-0 gap-4 sm:grid-cols-2">{[['Most popular',data.most],['Least popular (at least one placement)',data.least]].map(([label,list])=><section key={label} className={panel}><h2 className="text-sm font-semibold">{label}</h2><p className="break-words text-sm">{list.length?list.slice(0,5).map(row=>`${row.company} (${row.students})`).join(', '):'No confirmed placements for these filters.'}{list.length>5?` and ${list.length-5} tied companies`:''}</p></section>)}</div><AnalyticsDetails title="How placements are counted"><p>Popularity counts distinct students per normalized company name across nondeleted ongoing/finished records. Pending/rejected records and manual alumni entries are not counted. Case/spacing variants and branches with the same name are combined; aliases remain separate. Status counts assign ongoing precedence when the same student has both statuses. {data.stats.undatedRecords} undated records included (only without date/academic-year filters); {data.stats.unnamedRecords} unnamed records excluded. Different-company pairs can exceed distinct students.</p></AnalyticsDetails></>}
    <AnalyticsCharts data={data} registrar={registrar}/>
    {registrar?<>
      <section className={panel}><h2 className="font-semibold">Annex D coverage by department and course</h2><p className="text-xs text-muted-foreground">Distinct confirmed students per course in this academic year. Current academic membership; no document verification or correction statuses are inferred.</p><div className="max-w-full overflow-x-auto"><table className="w-full min-w-[420px] text-left text-sm"><thead><tr><th className="p-2">Department</th><th className="p-2">Course</th><th className="p-2">Students</th></tr></thead><tbody>{data.distribution.map(row=><tr key={row.department+row.course}><td className="p-2">{row.department}</td><td className="p-2">{row.course}</td><td className="p-2">{row.students}</td></tr>)}</tbody></table></div>{!data.distribution.length&&<p className="text-sm text-muted-foreground">No confirmed students in this academic year.</p>}<Link className="text-sm text-primary-emphasis underline" href={sipp('annex-d')}>Review Annex D and export official reports</Link></section>
      <section className={panel}><h2 className="font-semibold">Recent Annex C reports</h2><p className="text-xs text-muted-foreground">Drafts are available to complete, not a verification queue.</p>{!data.recent.length?<p className="text-sm text-muted-foreground">No Annex C reports saved for this academic year.</p>:<ul className="divide-y divide-border">{data.recent.map(row=><li key={row.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="min-w-0 break-words">{row.degree_program} · {row.academic_year} · {row.status}</span><Link className="text-primary-emphasis underline" href={sipp('annex-c',row.status)}>Open reports</Link></li>)}</ul>}</section>
    </>:<section className={panel}><div className="flex flex-wrap gap-2"><Button variant={showZero?'outline':'default'} onClick={()=>{setShowZero(false);setPage(1);}}>Ranked companies</Button><Button variant={showZero?'default':'outline'} onClick={()=>{setShowZero(true);setPage(1);}}>Zero-placement companies ({data.zeroCompanies.length})</Button><Button variant="outline" onClick={download}><Download className="size-4"/>CSV report</Button><Button variant="outline" onClick={previewReport} disabled={pdfPending}><Printer className="size-4"/>{pdfPending?"Preparing PDF…":"Preview PDF"}</Button></div><h2 className="font-semibold">{showZero?'Known companies with no matching placements':'Detailed company report'}</h2><AnalyticsDetails title="About this report"><p>{showZero?'Directory comes from accessible confirmed placement history and manual alumni companies, across all dates. Zero means no matches for the selected filters, not an unfilled vacancy.':'All totals, rankings and chart shares use this same filtered report. Ongoing + finished equals each company’s distinct students.'}</p></AnalyticsDetails><div className="max-w-full overflow-x-auto"><CompanyTable rows={rows.slice((current-1)*10,current*10)}/></div>{!rows.length&&<p className="text-sm text-muted-foreground">No companies match this report.</p>}<div className="flex flex-wrap items-center justify-between gap-2 text-xs"><span>{rows.length} companies</span><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={current===1} onClick={()=>setPage(current-1)}>Previous</Button><span>{current}/{pages}</span><Button size="sm" variant="outline" disabled={current===pages} onClick={()=>setPage(current+1)}>Next</Button></div></div></section>}


  </div>;
}
