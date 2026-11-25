#!/usr/bin/env node
/* Recorded-audio lookup test. speak(text) must play a recorded file when audio/manifest.json has one
   for that text, and otherwise fall back to speechSynthesis; the service worker must precache every
   recorded file. Uses SAMPLE files in tools/fixtures/audio-app/audio (no real audio is shipped yet):
   the app and sw.js are built from that fixture folder via tools/build.js, not from app/audio.
   Run: node tools/audio-test.js */
const fs=require("fs"),path=require("path"),assert=require("assert");
const build=require("./build.js");
const FIX=path.join(__dirname,"fixtures","audio-app");
const manifest=JSON.parse(fs.readFileSync(path.join(FIX,"audio","manifest.json"),"utf8"));
const html=build.render({appDir:FIX});
const m=html.match(/<script>([\s\S]*)<\/script>/);
if(!m){console.error("FAIL: no script block");process.exit(1)}
const els={};
function fake(){return{innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){},toggle(){}},dataset:{},addEventListener(){},appendChild(){},remove(){},click(){},querySelectorAll:()=>[]}}
global.document={addEventListener(){},querySelector:s=>els[s]||(els[s]=fake()),querySelectorAll:()=>[],getElementById:()=>null,createElement:()=>fake(),body:Object.assign(fake(),{dataset:{}}),visibilityState:"hidden"};
global.window=global;global.localStorage={_s:{},getItem(k){return this._s[k]||null},setItem(k,v){this._s[k]=v},removeItem(k){delete this._s[k]}};
const tts=[],audios=[];let playResult="ok";
global.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){tts.push(u.text)}};
global.SpeechSynthesisUtterance=function(t){this.text=t};
global.Audio=function(src){this.src=src;this.playbackRate=1;audios.push(this);this.pause=()=>{this.paused=true};
 this.play=()=>{this.played=true;return playResult==="ok"?Promise.resolve():Promise.reject(new Error("NotFoundError"))}};
global.setPlay=v=>{playResult=v};global.assert=assert;global.tts=tts;global.audios=audios;global.sleep=()=>new Promise(r=>process.nextTick(r));
global.navigator={};global.scrollTo=()=>{};global.setTimeout=(f)=>{f();return 0};global.setInterval=()=>0;global.clearTimeout=()=>{};
let code=m[1].replace('"use strict";','');code=code.slice(0,code.indexOf("/*! INIT"));
const tests=`(async()=>{
const reset=()=>{tts.length=0;audios.length=0;setPlay("ok")};
/* 1. recorded file wins, and no TTS is used */
reset();speak("hola");
assert.strictEqual(audios.length,1,"an Audio must be created for a text that has a recording");
assert.strictEqual(audios[0].src,"audio/hola.wav");assert.ok(audios[0].played,"recording must be played");assert.deepStrictEqual(tts,[],"TTS must not run when a recording plays");
/* 2. lookup ignores case/extra spaces; accents are significant */
reset();speak("  Buenos   DÍAS ");assert.strictEqual(audios.length,1);assert.strictEqual(audios[0].src,"audio/buenos-dias.wav");
reset();speak("buenos dias");assert.strictEqual(audios.length,0,"accent-less text is a different text");assert.deepStrictEqual(tts,["buenos dias"]);
/* 3. no recording -> speechSynthesis fallback */
reset();speak("¿Cómo te llamas?");assert.strictEqual(audios.length,0);assert.deepStrictEqual(tts,["¿Cómo te llamas?"]);
/* 4. a recording that fails to play falls back to TTS */
reset();setPlay("fail");speak("hola");await sleep();await sleep();
assert.deepStrictEqual(tts,["hola"],"play() rejection must fall back to TTS");
/* 5. an explicit voice override (voice preview) always uses TTS */
reset();speak("hola",null,null,{name:"x",lang:"es-MX"});assert.strictEqual(audios.length,0);assert.deepStrictEqual(tts,["hola"]);
/* 6. recorded playback honours the speed setting */
reset();speak("hola",0.6);assert.strictEqual(audios[0].playbackRate,0.6);
})()`;
(async()=>{
 await eval(code+";"+tests);
 /* 7. the service worker precaches every recorded file (run the real install handler) */
 const h={};let added=null;
 const self={location:{href:"http://localhost/sw.js?v=9"},addEventListener(ev,fn){h[ev]=fn},skipWaiting(){return Promise.resolve()},clients:{claim(){}}};
 const caches={open:()=>Promise.resolve({addAll(l){added=l;return Promise.resolve()}}),keys:()=>Promise.resolve([])};
 new Function("self","caches",build.renderSw({appDir:FIX}))(self,caches);
 let installed;h.install({waitUntil:p=>{installed=p}});await installed;
 assert.ok(added,"install handler must precache");
 Object.values(manifest).forEach(f=>{assert.ok(added.includes("./"+f),"sw CORE must list ./"+f);assert.ok(fs.existsSync(path.join(FIX,f)),"sample file "+f+" must exist")});
 ["./","./orale.html","./manifest.webmanifest","./icon.svg"].forEach(f=>assert.ok(added.includes(f),"shell entry kept: "+f));
 console.log("PASS: audio lookup (recording first, TTS fallback, SW precache of "+Object.keys(manifest).length+" sample files)");
})().catch(e=>{console.error("FAIL:",e.message);process.exit(1)});
