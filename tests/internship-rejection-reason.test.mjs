import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";



const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
function load(file, mocks) {
  const { code } = transformSync(readFileSync(new URL("../" + file, import.meta.url), "utf8"), { filename: file, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]] });
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, require(id) {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    return require(id);
  } });
  return mod.exports;
}


const empty = () => null;
const box = ({children}) => React.createElement('div',null,children);
const mocks = {
  './CompanyRotations': empty,
  '@/lib/server-actions/internship-records-actions': {},
  '@/lib/helpers': {}, '../ui/DeleteForm':empty, '../ui/Modal':empty,
};
test('student rejected card shows the full escaped reason, other statuses omit it',()=>{
  const Card=load('components/internship-records-ui/StudentInternshipRecordList.js',mocks).default;
  const record={id:'record',company_name:'Company',status:'rejected',date_started:'2026-10-01',rejection_reason:'Correct <dates> & hours.\nProvide complete details.'};
  const html=renderToStaticMarkup(React.createElement(Card,{userInternshipData:[record]}));
  assert.match(html,/Reason for rejection/);assert.match(html,/Correct &lt;dates&gt; &amp; hours/);assert.match(html,/Provide complete details/);
  for(const status of ['pending','ongoing','finished']) assert.doesNotMatch(renderToStaticMarkup(React.createElement(Card,{userInternshipData:[{...record,status}]})),/Reason for rejection/);
});
test('rejection confirmation includes required accessible bounded input, normal dialogs do not',()=>{
  const Dialog=load('components/ui/ConfirmDialog.js',{
    '@/components/ui/dialog': {Dialog:box,DialogFooter:box},
    './ConfirmationContent':{__esModule:true,default:box},
    '@/components/ui/button':{Button:box},'@/components/ui/spinner':{Spinner:empty},
  }).default;
  const props={open:true,title:'Reject?',onConfirm:()=>{},onOpenChange:()=>{}};
  const html=renderToStaticMarkup(React.createElement(Dialog,{...props,reasonRequired:true}));
  assert.match(html,/<textarea[^>]*required=""[^>]*maxLength="1000"/);assert.match(html,/Reason for rejection/);assert.match(html,/<label for=/);
  assert.doesNotMatch(renderToStaticMarkup(React.createElement(Dialog,props)),/<textarea/);
});
