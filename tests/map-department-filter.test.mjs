import test from 'node:test';
import assert from 'node:assert/strict';
import { filterMapSites } from '../components/map-ui/mapFilters.mjs';
import { groupSitesByCity, recommendVisitCities } from '../components/map-ui/mapVisitPlanning.mjs';
const sites=[{id:'mixed',company:'Hotel',region_id:1,city_name:'Manila',province_name:'Metro Manila',lat:14,lng:121,interns:[{id:'a',studentId:'a',departmentId:1,name:'Ana',course:'Hospitality',courseShortName:'BSHM'},{id:'b',studentId:'b',departmentId:2,name:'Ben',course:'Computing',courseShortName:'BSCS'}]}, {id:'other',company:'Office',region_id:2,city_name:'Cebu',province_name:'Cebu',lat:10,lng:123,interns:[{id:'c',studentId:'c',departmentId:2,name:'Cara',course:'Computing'}]}];
test('department filter keeps matching interns at shared sites and updates city/recommendation counts',()=>{
 const filtered=filterMapSites(sites,{departmentId:'1'});assert.equal(filtered.length,1);assert.deepEqual(filtered[0].interns.map(i=>i.id),['a']);assert.equal(groupSitesByCity(filtered)[0].studentCount,1);assert.equal(recommendVisitCities(filtered,{lat:14,lng:121})[0].studentCount,1);assert.equal(sites[0].interns.length,2);
});
test('department combines with region and search; clearing preserves existing filters',()=>{
 assert.deepEqual(filterMapSites(sites,{departmentId:'1',query:'Ben'}),[]);
 assert.equal(filterMapSites(sites,{departmentId:'2',regionId:'1',query:'BSCS'})[0].interns[0].id,'b');
 assert.equal(filterMapSites(sites,{query:'hotel',regionId:1})[0].interns.length,2);
 assert.equal(filterMapSites(sites,{departmentId:'2',regionId:2})[0].id,'other');
 assert.deepEqual(filterMapSites(sites,{departmentId:'999'}),[]);
 assert.deepEqual(filterMapSites(sites),sites);
});
