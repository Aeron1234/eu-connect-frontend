import { getAccessToken } from '@/lib/server-actions/auth';
import { getApiBaseUrl } from '@/lib/api-base-url.mjs';
import { runPdfJob } from '@/app/_services/pdfBrowser';
import { pdfErrorResponse } from '@/app/_services/pdfResponse.mjs';
import { companyAnalyticsHtml } from '@/app/_services/companyAnalyticsTemplate.mjs';

export const runtime='nodejs';
export const maxDuration=60;
export async function GET(request) {
  const token=await getAccessToken();
  if(!token)return Response.json({error:'Not signed in.'},{status:401,headers:{'Cache-Control':'private, no-store'}});
  const input=new URL(request.url).searchParams,query=new URLSearchParams();
  for(const key of ['departmentId','courseId','academicYear','term','from','to'])if(input.get(key))query.set(key,input.get(key));
  try {
    const pdf=await runPdfJob(async({signal,renderPdf})=>{
      // Re-read through the authoritative scoped API; never accept client report rows.
      const response=await fetch(`${getApiBaseUrl()}/analytics/companies?${query}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store',signal});
      if(!response.ok)throw Object.assign(new Error(response.status===403?'Not authorized to export company analytics.':'Could not load this report. Check the filters and retry.'),{status:response.status});
      return renderPdf(companyAnalyticsHtml(await response.json()),{landscape:true,preferCSSPageSize:true});
    });
    return new Response(pdf,{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="internship-company-analytics.pdf"','Cache-Control':'private, no-store'}});
  }catch(error){return pdfErrorResponse(error,'Could not generate company analytics PDF.');}
}
