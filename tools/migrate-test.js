#!/usr/bin/env node
/* Schema-migration test: an orale_v1 save written BEFORE schema 1 (positional card ids such as
   v12 / p3, no S.schema) must load with every bit of progress intact under stable string ids.
   Run: node tools/migrate-test.js */
const fs=require("fs"),path=require("path"),assert=require("assert");
const html=fs.readFileSync(path.join(__dirname,"..","app","orale.html"),"utf8");
const fixtureText=fs.readFileSync(path.join(__dirname,"fixtures","orale_v1-legacy.json"),"utf8");
const m=html.match(/<script>([\s\S]*)<\/script>/);
if(!m){console.error("FAIL: no script block");process.exit(1)}
global.window=global;global.document={addEventListener(){},querySelector:()=>({addEventListener(){},innerHTML:"",style:{},classList:{add(){},toggle(){},remove(){}}}),querySelectorAll:()=>[],getElementById:()=>null,createElement:()=>({}),body:{dataset:{}},visibilityState:"hidden"};
global.localStorage={_s:{orale_v1:fixtureText},getItem(k){return this._s[k]||null},setItem(k,v){this._s[k]=v},removeItem(k){delete this._s[k]}};
global.speechSynthesis={getVoices:()=>[],cancel(){},speak(){}};global.SpeechSynthesisUtterance=function(){};
global.navigator={};global.scrollTo=()=>{};global.setTimeout=()=>0;global.setInterval=()=>0;global.clearTimeout=()=>{};
let code=m[1].replace('"use strict";','');code=code.slice(0,code.indexOf("/* ================= INIT"));
const tests=`
const old=JSON.parse(fixtureText);
assert.strictEqual(old.schema,undefined,"fixture must be old-format (no schema)");
assert.ok(Object.keys(old.cards).every(k=>/^(v|p|s|i|tr)\\d+$/.test(k)),"fixture cards must use positional ids");
/* 1. load() migrated the old save */
assert.strictEqual(S.schema,1);
assert.strictEqual(Object.keys(S.cards).length,Object.keys(old.cards).length,"no card lost or duplicated");
Object.keys(old.cards).forEach(k=>{
 const nid=sid(k);assert.notStrictEqual(nid,k,k+" must map to a stable id");
 assert.ok(!(k in S.cards),"legacy key "+k+" must be gone");
 assert.deepStrictEqual(S.cards[nid],old.cards[k],"SRS state of "+k+" ("+nid+") must be byte-identical");
 assert.ok(BYID[nid],nid+" must resolve to a real deck card");
});
/* spot checks that the mapping points at the same card the positional id did */
assert.strictEqual(BYID[sid("v12")].es,V[12][1]);assert.strictEqual(BYID[sid("p3")].es,PH[3][1]);
assert.strictEqual(BYID[sid("tr2")].es,TR[2][0]);assert.strictEqual(BYID[sid("i0")].es,ID[0][0]);assert.strictEqual(BYID[sid("s1")].es,SL[1][0]);
/* 2. miss + log remapped, non-deck keys untouched, everything else preserved */
assert.strictEqual(S.miss[sid("v12")],2);assert.strictEqual(S.miss[sid("p3")],1);
assert.strictEqual(S.miss.cj0_1_2,1);assert.strictEqual(S.miss.dlg0_1,1);assert.ok(!("v12" in S.miss));
assert.deepStrictEqual(S.log,old.log.map(r=>[r[0],sid(r[1]),r[2]]));
["xp","pesos","week","streak","bestStreak","lastActive","days","stats","weeksDone","ach","dlgDone","bossDone","bossBest","factIdx","created","name","tut"].forEach(k=>assert.deepStrictEqual(S[k],old[k],k+" must be preserved"));
/* 3. progress is still LIVE: the SRS sees these cards as reviewed, not new */
assert.ok(cState(sid("v12")).iv===21&&masteredCards().some(c=>c.id===sid("v12")),"mastered card must stay mastered");
assert.ok(!newCards().some(c=>c.id===sid("v12")),"reviewed card must not reappear as new");
/* 4. idempotent; new-format data passes through untouched */
const once=migrate(JSON.parse(fixtureText));assert.deepStrictEqual(migrate(JSON.parse(JSON.stringify(once))),once);
/* 5. paste/file import of an OLD-format export migrates too */
global.location={reload(){}};importText(fixtureText);
assert.strictEqual(S.schema,1);assert.deepStrictEqual(S.cards[sid("p3")],old.cards.p3);assert.ok(!("p3" in S.cards));
/* 6. stable ids are unique and cover the whole deck table */
assert.strictEqual(new Set(DECK.map(c=>c.id)).size,DECK.length,"deck ids must be unique");
assert.strictEqual(DECK.length,Object.keys(LEGACY_IDS).length,"every deck card needs a frozen LEGACY_IDS entry");
assert.ok(DECK.every(c=>!/^(v|p|s|i|tr)\\d+$/.test(c.id)),"no positional ids may remain in DECK");
console.log("PASS: migration (old-format fixture -> schema 1, "+Object.keys(old.cards).length+" cards, miss, log, import path)");
`;
try{eval(code+tests)}catch(e){console.error("FAIL:",e.message);process.exit(1)}
