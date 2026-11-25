#!/usr/bin/env node
/* Data integrity linter for app/orale.html (S6-aware). Run: node tools/validate2.js */
const fs=require("fs"),path=require("path");
const html=fs.readFileSync(path.join(__dirname,"..","app","orale.html"),"utf8");
const m=html.match(/<script>([\s\S]*)<\/script>/);
if(!m){console.error("FAIL: no script block");process.exit(1)}
global.window=global;global.document={addEventListener(){},querySelector:()=>({addEventListener(){},innerHTML:"",style:{},classList:{add(){},toggle(){},remove(){}}}),querySelectorAll:()=>[],getElementById:()=>null,createElement:()=>({}),body:{dataset:{}},visibilityState:"hidden"};
global.localStorage={getItem:()=>null,setItem(){},removeItem(){}};global.speechSynthesis={getVoices:()=>[],cancel(){},speak(){}};global.SpeechSynthesisUtterance=function(){};
global.navigator={};global.scrollTo=()=>{};global.setTimeout=()=>0;global.setInterval=()=>0;global.clearTimeout=()=>{};
let code=m[1].replace('"use strict";','');
code=code.slice(0,code.indexOf("/*! INIT"));
const checks=`
const errs=[],warn=[],seen={};
V.forEach((r,i)=>{if(!(Array.isArray(r)&&r.length===4))errs.push("V["+i+"] bad shape");
 else{if(!((r[0]>=1&&r[0]<=26)||r[0]===99))errs.push("V["+i+"] week "+r[0]);
  if(typeof r[1]!=="string"||typeof r[2]!=="string")errs.push("V["+i+"] non-string");
  const k=r[1].toLowerCase();if(seen[k]!==undefined)errs.push('V dup es "'+r[1]+'" at '+seen[k]+" and "+i);seen[k]=i}});
PH.forEach((r,i)=>{if(!(r.length===4&&r[0]>=1&&r[0]<=26))errs.push("PH["+i+"] bad")});
SL.forEach((r,i)=>{if(r.length!==4)errs.push("SL["+i+"] needs [word,meaning,example,id]")});
ID.forEach((r,i)=>{if(r.length!==4)errs.push("ID["+i+"] needs [expr,literal,meaning,id]")});
TR.forEach((r,i)=>{if(!(Array.isArray(r)&&r.length===3))errs.push("TR["+i+"] bad shape");
 else if(typeof r[0]!=="string"||typeof r[1]!=="string")errs.push("TR["+i+"] non-string")});
FF.forEach((r,i)=>{if(r.length!==3)errs.push("FF["+i+"] needs 3 fields")});
GQ.forEach((g,i)=>{if(!(g.o&&g.o.length===4))errs.push("GQ["+i+"] needs 4 options");
 else if(!(g.a>=0&&g.a<4))errs.push("GQ["+i+"] bad answer index");
 if(!(g.w>=1&&g.w<=26))errs.push("GQ["+i+"] bad week")});
CJ.forEach((r,i)=>{if(r.length!==6)errs.push("CJ["+i+"] needs [verb,en,pres,pret,imp,fut]");
 else [2,3,4,5].forEach(ti=>{if(!(Array.isArray(r[ti])&&r[ti].length===6))errs.push("CJ["+i+"] tense slot "+ti+" needs 6 person forms")})});
if(CJ.length!==12)errs.push("CJ must have exactly 12 verbs");
// ---- S14 stable-id checks: ids live IN the data; LEGACY_IDS only serves old saves ----
{const src={v:V,p:PH,s:SL,i:ID,tr:TR},idx={v:3,p:3,s:3,i:3,tr:2};
 const all=[];Object.keys(src).forEach(k=>src[k].forEach((r,i)=>{const id=r[idx[k]];
  if(typeof id!=="string"||!/^[a-z]{2,4}\.[a-z0-9-]+(~[0-9]+)?$/.test(id))errs.push(k+"["+i+"] missing/invalid stable id "+JSON.stringify(id));else all.push(id)}));
 const seenId={};all.forEach(id=>{if(seenId[id])errs.push("duplicate card id "+id);seenId[id]=1});
 if(new Set(DECK.map(c=>c.id)).size!==DECK.length)errs.push("DECK ids not unique");
 if(DECK.some((c,n)=>c.id!==all[n]))errs.push("DECK ids must equal the data ids, in order");
 const want=[];Object.keys(src).forEach(k=>src[k].forEach((r,i)=>want.push([k+i,r[idx[k]]])));
 if(want.length!==968)errs.push("expected 968 legacy positions, found "+want.length);
 if(Object.keys(LEGACY_IDS).length!==968)errs.push("LEGACY_IDS must have 968 entries, has "+Object.keys(LEGACY_IDS).length);
 want.forEach(([pos,id])=>{if(LEGACY_IDS[pos]!==id)errs.push("LEGACY_IDS["+pos+"]="+LEGACY_IDS[pos]+" but data row has "+id)});
 if(new Set(Object.values(LEGACY_IDS)).size!==968)errs.push("LEGACY_IDS values must be unique")}
const dlgTitles={};
DLG.forEach((d,i)=>{if(!(d.wk>=1&&d.wk<=26))errs.push("DLG["+i+"] bad week "+d.wk);
 if(typeof d.t!=="string"||!d.t)errs.push("DLG["+i+"] missing title");
 else{if(dlgTitles[d.t]!==undefined)errs.push('DLG dup title "'+d.t+'" at '+dlgTitles[d.t]+" and "+i);dlgTitles[d.t]=i}
 if(!(Array.isArray(d.lines)&&d.lines.length>=4))errs.push("DLG["+i+"] needs at least 4 lines");
 else d.lines.forEach((ln,j)=>{if(!(Array.isArray(ln)&&ln.length===3))errs.push("DLG["+i+"] line "+j+" needs [speaker,es,en]")});
 if(!(Array.isArray(d.mcqs)&&d.mcqs.length===3))errs.push("DLG["+i+"] needs exactly 3 mcqs");
 else d.mcqs.forEach((m,j)=>{if(!(m.o&&m.o.length===4))errs.push("DLG["+i+"] mcq "+j+" needs 4 options");
  else if(!(m.a>=0&&m.a<4))errs.push("DLG["+i+"] mcq "+j+" bad answer index")})});
W.forEach((w,i)=>{if(w.n!==i+1)errs.push("W order broken at "+i);
 w.r.forEach(r=>{if(!/^https?:\\/\\//.test(r[1]))errs.push("W"+w.n+" bad url "+r[1])})});
if(W.length!==26)errs.push("W must have 26 weeks");
MED.channels.forEach(c=>{if(!/^https?:\\/\\//.test(c[1]))errs.push("MED channel bad url "+c[0])});
// ---- S6 Story Mode validation (structure + vocab coverage proof) ----
if(typeof ST==="undefined"||!Array.isArray(ST))errs.push("ST (Story Mode) missing");
else{
 if(ST.length!==6)errs.push("ST must have exactly 6 stories, has "+ST.length);
 var _ok="abcdefghijklmnopqrstuvwxyzáéíóúüñ";
 function _toks(s){s=String(s).toLowerCase();var out=[],cur="";for(var k=0;k<s.length;k++){var ch=s[k];if(_ok.indexOf(ch)>=0){cur+=ch}else{if(cur){out.push(cur);cur=""}}}if(cur)out.push(cur);return out}
 var _known={};
 function _add(t){if(t)_known[t]=1}
 function _morph(w){_add(w);var L=w[w.length-1];
  if(L==="o"){_add(w.slice(0,-1)+"a");_add(w+"s");_add(w.slice(0,-1)+"as")}
  else if(L==="a"){_add(w+"s")}
  else if("áéíóú".indexOf(L)>=0){_add(w+"s")}
  else if(L==="e"){_add(w+"s")}
  else{_add(w+"es");_add(w+"s")}}
 function _conj(inf){_add(inf);var base=inf;if(base.slice(-2)==="se"){base=base.slice(0,-2);_add(base)}var end=base.slice(-2),stem=base.slice(0,-2);
  if(end!=="ar"&&end!=="er"&&end!=="ir")return;
  _add(stem+(end==="ar"?"ando":"iendo"));_add(stem+(end==="ar"?"ado":"ido"));
  var A,P,I;
  if(end==="ar"){A=["o","as","a","amos","an"];P=["é","aste","ó","amos","aron"];I=["aba","abas","aba","ábamos","aban"]}
  else{A=["o","es","e","en",(end==="ir"?"imos":"emos")];P=["í","iste","ió","imos","ieron"];I=["ía","ías","ía","íamos","ían"]}
  A.concat(P).concat(I).forEach(function(x){_add(stem+x)})}
 function _entry(s){var one=_toks(s);one.forEach(_add);if(one.length===1){var w=one[0];var e2=w.slice(-2),e4=w.slice(-4);if(e2==="ar"||e2==="er"||e2==="ir"||e4==="arse"||e4==="erse"||e4==="irse")_conj(w);_morph(w)}}
 V.forEach(function(r){_entry(r[1])});PH.forEach(function(r){_entry(r[1])});SL.forEach(function(r){_entry(r[0])});ID.forEach(function(r){_entry(r[0])});
 CG.forEach(function(c){_add(c);_morph(c)});PERSONS.forEach(function(p){_toks(p).forEach(_add)});
 CJ.forEach(function(v){[2,3,4,5].forEach(function(ti){v[ti].forEach(function(f){_toks(f).forEach(_add)})})});
 var _names={mateo:1,lupita:1,"méxico":1,india:1,carmen:1,beto:1,diego:1,"sofía":1,ana:1,luis:1,"óralelandia":1};
 ST.forEach(function(s,i){
  if(!(s.wk>=1&&s.wk<=26))errs.push("ST["+i+"] bad week "+s.wk);
  if(typeof s.t!=="string"||!s.t)errs.push("ST["+i+"] missing title");
  if(typeof s.quest!=="string"||!s.quest)errs.push("ST["+i+"] missing quest framing");
  if(typeof s.note!=="string"||!s.note)errs.push("ST["+i+"] missing note");
  if(!(Array.isArray(s.paras)&&s.paras.length>=3))errs.push("ST["+i+"] needs at least 3 paragraphs");
  var body=(s.paras||[]).join(" ");
  var wc=body.trim().length?body.trim().split(" ").filter(function(x){return x}).length:0;
  if(!(wc>=250&&wc<=500))errs.push("ST["+i+"] word count "+wc+" outside 250-500");
  if(!(Array.isArray(s.mcqs)&&s.mcqs.length===5))errs.push("ST["+i+"] needs exactly 5 mcqs");
  else s.mcqs.forEach(function(mm,j){if(!(mm.o&&mm.o.length===4))errs.push("ST["+i+"] mcq "+j+" needs 4 options");else if(!(mm.a>=0&&mm.a<4))errs.push("ST["+i+"] mcq "+j+" bad answer index")});
  var tk=_toks(body),unc=0;tk.forEach(function(t){if(!_known[t]&&!_names[t])unc++});
  var cov=tk.length?(1-unc/tk.length):0;
  if(cov<0.85)errs.push("ST["+i+'] "'+s.t+'" vocab coverage '+(cov*100).toFixed(1)+"% < 85%");
  else console.log("Story "+(i+1)+' "'+s.t+'": '+wc+" words, coverage "+(cov*100).toFixed(1)+"%");
  if(s.ph!==i+1)warn.push("ST["+i+"] ph="+s.ph+" (expected phase "+(i+1)+")");
 });
}
// ---- S9 Boss Battles & Skill Tree validation ----
if(typeof BOSSES==="undefined"||!Array.isArray(BOSSES))errs.push("BOSSES missing");
else{if(BOSSES.length!==6)errs.push("BOSSES must have exactly 6 (one per phase), has "+BOSSES.length);
 BOSSES.forEach(function(b,i){if(b.ph!==i+1)errs.push("BOSSES["+i+"] ph "+b.ph+" (expected "+(i+1)+")");
  if(typeof b.name!=="string"||!b.name)errs.push("BOSSES["+i+"] missing name");
  if(typeof b.intro!=="string"||!b.intro)errs.push("BOSSES["+i+"] missing intro");
  if(typeof b.defeat!=="string"||!b.defeat)errs.push("BOSSES["+i+"] missing defeat line");
  if(!(Array.isArray(b.taunt)&&b.taunt.length>=1))errs.push("BOSSES["+i+"] needs taunt lines")});
 if(typeof skillTree!=="function")errs.push("skillTree() missing");
 else{var _sb=skillTree();if(_sb.length!==5)errs.push("skill tree must have 5 branches, has "+_sb.length);
  console.log("S9: bosses="+BOSSES.length+", skill branches="+_sb.length+" ("+_sb.map(function(x){return x.k}).join("/")+")")}}
console.log("Deck source rows — V:"+V.length+" PH:"+PH.length+" SL:"+SL.length+" ID:"+ID.length+" TR:"+TR.length+" FF:"+FF.length+" CG:"+CG.length+" FX:"+FX.length+" GQ:"+GQ.length+" CJ:"+CJ.length+" DLG:"+DLG.length+" ST:"+(typeof ST!=="undefined"?ST.length:0));
warn.forEach(w=>console.log("WARN:",w));
if(errs.length){errs.forEach(e=>console.error("ERROR:",e));console.error("FAIL: "+errs.length+" error(s)");process.exit(1)}
console.log("PASS: data validation");
`;
try{eval(code+checks)}catch(e){console.error("FAIL:",e.message);process.exit(1)}
