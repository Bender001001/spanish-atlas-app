#!/usr/bin/env node
/* Headless runtime smoke test for app/orale.html (S6-aware). Run: node tools/smoke2.js */
const fs=require("fs"),path=require("path");
const APP=path.join(__dirname,"..","app","orale.html");
const html=fs.readFileSync(APP,"utf8");
const m=html.match(/<script>([\s\S]*)<\/script>/);
if(!m){console.error("FAIL: no <script> block found");process.exit(1)}
const els={};
function fake(){return{innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){},toggle(){}},dataset:{},addEventListener(){},appendChild(){},remove(){},click(){},href:"",querySelectorAll:()=>[],getContext:()=>new Proxy({},{get:()=>()=>{}}),offsetWidth:300,value:"1"}}
global.document={addEventListener(){},querySelector:s=>els[s]||(els[s]=fake()),querySelectorAll:()=>[fake(),fake(),fake(),fake(),fake()],getElementById:()=>fake(),createElement:()=>fake(),body:Object.assign(fake(),{dataset:{}}),visibilityState:"visible"};
global.window=global;global.localStorage={_s:{},getItem(k){return this._s[k]||null},setItem(k,v){this._s[k]=v},removeItem(k){delete this._s[k]}};
global.speechSynthesis={getVoices:()=>[],cancel(){},speak(){}};global.SpeechSynthesisUtterance=function(){};
global.navigator={};global.scrollTo=()=>{};global.confirm=()=>true;global.prompt=()=>null;
global.setTimeout=()=>0;global.setInterval=()=>0;global.clearTimeout=()=>{};
const tests=`
console.log("deck:",DECK.length,"V:"+V.length,"PH:"+PH.length,"SL:"+SL.length,"ID:"+ID.length,"FF:"+FF.length,"FX:"+FX.length,"GQ:"+GQ.length,"CJ:"+CJ.length,"DLG:"+DLG.length,"ST:"+ST.length,"W:"+W.length,"v"+APP_VERSION);
grade("v0",2);grade("v1",0);grade("v0",3);
if(S.xp<=0)throw new Error("XP not accruing");
S.week=26;if(unlocked().length!==DECK.length)throw new Error("unlock frontier broken");
const q1=mcq(DECK[5]);if(!(q1.opts.length===4&&q1.a>=0))throw new Error("mcq broken");
const l1=listenQ(DECK[10]);if(!(l1.opts.length===4&&l1.a>=0))throw new Error("listenQ broken");
renderPanel();renderLearn();renderArena();renderCodex();
renderLearn();if(document.querySelector("#view").innerHTML.indexOf("startStories")<0)throw new Error("Historias entry missing from Estudiar menu");
["jerga","dichos","trampas","gratis","datos","media"].forEach(t=>{CTAB=t;renderCantina()});
startReview();startNew();startShadow();shadowDone();startRepair();
weekTest(1);quizAns(QZ.items[0].a,{classList:{add(){}}});
gameOido();gameTrampa();gameCog();__cog(true);gameBuild();__bt(0);__bres();__bok();gameRayo();__rayo(0,0);
if(CJ.length!==12)throw new Error("CJ must have 12 verbs");
if(quests().length!==4)throw new Error("quests should have 4 daily missions");
startConj();conjSubmit();conjOptions();conjPick(0);
CQ.i=CQ.items.length;conjQ();
if(!(S.stats.conj>=10))throw new Error("conjugation stats not tracked");
if(DLG.length!==20)throw new Error("DLG must have 20 dialogues (8 Fable + 12 S5b batch)");
S.week=1;if(dlgUnlocked().length<1)throw new Error("week-1 dialogue should be unlocked");
S.week=26;const dl=dlgUnlocked();if(dl.length!==DLG.length)throw new Error("dialogue unlock frontier broken");
startListening();dlgPlay(0);dlgSpeakLine(0);DLGQ.li=DLG[0].lines.length;dlgLine();
QZ.i=QZ.items.length;quizQ();
if(!(S.stats.dlg>=1))throw new Error("dialogue stats not tracked");
if(!(S.dlgDone||[]).includes(0))throw new Error("dlgDone not tracked");
/* --- S6 Story Mode --- */
if(ST.length!==6)throw new Error("ST must have exactly 6 stories");
S.week=3;if(storyUnlocked().length!==0)throw new Error("no story should be unlocked before week 4");
S.week=4;if(storyUnlocked().length<1)throw new Error("story 1 should unlock at week 4");
S.week=26;if(storyUnlocked().length!==ST.length)throw new Error("story unlock frontier broken");
startStories();
if(document.querySelector("#view").innerHTML.indexOf("crónicas")<0&&document.querySelector("#view").innerHTML.indexOf("cr")<0)throw new Error("story list did not render");
storyOpen(0);storyIntro();STQ.pi=0;storyPage();storySpeak(0);
STQ.pi=1;storyPage();
STQ.pi=ST[0].paras.length;storyPage();
if(!(QZ&&QZ.items.length===5))throw new Error("story comprehension check must have 5 questions");
quizAns(QZ.items[0].a,{classList:{add(){}}});
QZ.i=QZ.items.length;quizQ();
if(!(S.stats.story>=1))throw new Error("story stats not tracked");
if(!(S.storyDone||[]).includes(0))throw new Error("storyDone not tracked");
storyOpen(5);storyIntro();STQ.pi=ST[5].paras.length;storyPage();QZ.i=QZ.items.length;quizQ();
if((S.storyDone||[]).indexOf(5)<0)throw new Error("second story not tracked");
if(recSupported())throw new Error("recSupported should be false with no mediaDevices stub (matches the real file:// fallback path)");
recReset();recDiscard();startShadow();
global.MediaRecorder=function(stream,opts){this.mimeType=(opts&&opts.mimeType)||"";this.start=()=>{};this.stop=function(){if(this.onstop)this.onstop()}};
MediaRecorder.isTypeSupported=()=>true;
URL.createObjectURL=()=>"blob:mock";URL.revokeObjectURL=()=>{};
global.Audio=function(u){this.src=u;this.play=()=>{}};
navigator.mediaDevices={getUserMedia:()=>Promise.resolve({getTracks:()=>[{stop(){}}]})};
if(!recSupported())throw new Error("recSupported should detect the mocked MediaRecorder");
shadowCard();recStart();recDiscard();recReset();
memoryRaid(true);openChest();
/* --- S8 Analytics v2 --- */
if(!Array.isArray(S.log)||S.log.length<3)throw new Error("review log not recording (expected >=3 entries from earlier grades)");
if(!S.log.every(r=>Array.isArray(r)&&r.length===3&&typeof r[0]==="number"))throw new Error("review log entry shape broken");
renderAnalytics();
if(!weekHeatmap(S).includes('class="hm"'))throw new Error("week heatmap broken");
if((weekHeatmap(S).match(/class="cell/g)||[]).length!==26)throw new Error("heatmap must have 26 week cells");
const pj=hoursProjection(S);if(typeof pj.note!=="string"||typeof pj.eta!=="string")throw new Error("hours projection broken");
const csv=buildReviewCSV(S).trim().split("\\n");
if(csv[0]!=="fecha,tarjeta_id,espanol,ingles,calificacion")throw new Error("CSV header broken");
if(csv.length!==S.log.length+1)throw new Error("CSV row count mismatch");
if(!/^\\d{4}-\\d{2}-\\d{2},v\\d+,/.test(csv[1]))throw new Error("CSV row format broken");
exportReviewCSV();
analyticsDemo();if(!ADEMO)throw new Error("demo data path did not activate");
if(!(ADEMO.log.length>200&&Object.keys(ADEMO.cards).length>100))throw new Error("demo seed too small to exercise charts");
renderAnalytics();drawRetention(ADEMO);drawDueLoad(ADEMO);
analyticsDemo();if(ADEMO)throw new Error("demo toggle-off broken");
if(S.log.length>4500)throw new Error("log prune not applied");
openTutorial();TUTI=TUT.length-1;tutPage();tutDone();
if(!S.tut)throw new Error("tutorial flag not set");
/* --- backup/persistence (fork) --- */
if(persistStorage()!==false)throw new Error("persistStorage must be a silent no-op without navigator.storage");
var _pc=0;navigator.storage={persist:()=>{_pc++;return Promise.resolve(true)}};
if(persistStorage()!==true||_pc!==1)throw new Error("persistStorage must call navigator.storage.persist()");
var _dl=null;URL.createObjectURL=function(b){_dl=b;return "blob:mock"};exportData();
if(!_dl||_dl.type!=="application/json")throw new Error("exportData must build a JSON Blob download");
var _loc=global.location;global.location={reload(){global.__reloaded=1}};var _before=S.xp;importText(JSON.stringify({xp:777}));
if(S.xp!==777||!global.__reloaded)throw new Error("importText (paste/file shared path) must load exported JSON");
global.__reloaded=0;importText("not json");if(global.__reloaded)throw new Error("importText must reject invalid data");global.location=_loc;S.xp=_before;
/* --- S9 Boss Battles & Skill Tree --- */
if(BOSSES.length!==6)throw new Error("boss roster must be 6 (one per phase)");
renderArena();var _av=document.querySelector("#view").innerHTML;if(_av.indexOf("renderBossList")<0||_av.indexOf("renderSkillTree")<0)throw new Error("Arena missing boss/skill-tree launchers");
if(skillTree().length!==5)throw new Error("skill tree must have 5 branches");
renderSkillTree();
S.week=3;if(bossUnlocked(1))throw new Error("boss 1 should be locked before week 4");
S.week=4;if(!bossUnlocked(1))throw new Error("boss 1 should unlock at week 4");
S.week=26;if(!bossUnlocked(6))throw new Error("boss 6 should unlock at week 26");
renderBossList();
startBoss(1);
if(!(BOSS&&BOSS.items.length===10))throw new Error("boss fight must build 10 mixed-skill items");
if(!BOSS.items.every(function(it){return it.opts&&it.opts.length>=2&&it.a>=0}))throw new Error("boss items malformed");
var _g=0;while(BOSS&&BOSS.i<BOSS.items.length&&_g<40){_g++;bossHit(BOSS.items[BOSS.i].a)}
bossEnd();
if(!(S.bossDone||[]).includes(1))throw new Error("boss victory (>=80%) not recorded in bossDone");
if(!S.ach.includes("b1"))throw new Error("phase-1 boss badge (b1) not awarded on victory");
startBoss(2);bossHit(-1);bossHit(-1);bossHit(-1);bossEnd();
if((S.bossDone||[]).includes(2))throw new Error("a lost boss must not be marked defeated");
/* --- S10 PWA --- */
if(typeof pwaInit!=="function")throw new Error("pwaInit missing");
if(pwaInit()!==false)throw new Error("pwaInit must be a silent no-op without serviceWorker support (the file:// double-click path)");
navigator.serviceWorker={register:u=>{global.__swURL=u;return Promise.resolve()}};
global.location={protocol:"https:"};
if(pwaInit()!==true)throw new Error("pwaInit should register on https with serviceWorker support");
if(!/sw\\.js\\?v=/.test(__swURL||""))throw new Error("service worker must be registered version-aware (sw.js?v=APP_VERSION)");
if(!(__swURL||"").includes(APP_VERSION))throw new Error("registered sw version must match APP_VERSION");
global.location={protocol:"file:"};
if(pwaInit()!==false)throw new Error("pwaInit must refuse to register on file://");
console.log("PASS: smoke test (all views, games, SRS, test, story mode, boss battles, skill tree, tutorial, chest, raid, pwa guard)");
`;
/* --- S10 PWA sibling files (node-side static checks) --- */
try{
 const mf=JSON.parse(fs.readFileSync(path.join(__dirname,"..","app","manifest.webmanifest"),"utf8"));
 if(mf.start_url!=="./orale.html"||mf.display!=="standalone")throw new Error("manifest start_url/display wrong");
 if(!Array.isArray(mf.icons)||!mf.icons.length||!mf.icons.every(i=>i.src==="icon.svg"))throw new Error("manifest icons wrong");
 const sw=fs.readFileSync(path.join(__dirname,"..","app","sw.js"),"utf8");
 new Function(sw); // syntax check only — never executed here
 if(!sw.includes('searchParams.get("v")')||!sw.includes('"orale-v"'))throw new Error("sw.js cache is not version-aware");
 if(!sw.includes("caches.delete"))throw new Error("sw.js must retire old version caches on activate");
 const icon=fs.readFileSync(path.join(__dirname,"..","app","icon.svg"),"utf8");
 if(!icon.includes("<svg")||!icon.includes("viewBox"))throw new Error("icon.svg malformed");
 if(!html.includes('rel="manifest"')||!html.includes('name="theme-color"'))throw new Error("orale.html missing manifest/theme-color head links");
 console.log("PASS: pwa static checks (manifest, sw.js, icon.svg, head links)");
}catch(e){console.error("FAIL:",e.message);process.exit(1)}
try{eval(m[1].replace('"use strict";','')+tests)}catch(e){console.error("FAIL:",e.message);process.exit(1)}
