"use server";
import { getAccessToken } from './auth';
import { getApiBaseUrl } from '../api-base-url.mjs';
import { parseApiResponse } from '../api-response';
export async function getAnalytics(mode, filters={}) {
  if (!['companies','registrar'].includes(mode)) return {success:false,error:'Unknown dashboard.'};
  try {
    const token=await getAccessToken();
    if(!token)return {success:false,status:401,error:'Your session has expired.'};
    const query=new URLSearchParams(Object.entries(filters).filter(([,value])=>value!==''));
    const response=await fetch(`${getApiBaseUrl()}/${mode==='registrar'?'registrar/dashboard':'analytics/companies'}?${query}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store',signal:AbortSignal.timeout(25000)});
    return {...await parseApiResponse(response),status:response.status};
  }catch{return {success:false,error:'Could not reach analytics. Please retry.'};}
}
