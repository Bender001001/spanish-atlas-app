#!/usr/bin/env node
/* Copy generated recordings into app/audio/ and write the manifests. MACHINE-GENERATED, UNVERIFIED audio.
   node tools/audio/assemble-audio.js --normal <dir from generate-audio.py> --fallback <dir from generate-audio.py --force-voice es_MX-claude-high>
   Rules (same as the shipped set):
   - male line not in weak-lines.json            -> ald file from --normal
   - male PHRASE line in weak-lines.json         -> claude-high file from --fallback  (fallbackVoice:true)
   - male dialogue/listening line in weak-lines  -> no file (device TTS), listed under ttsOnly
   - female line                                 -> claude-high file from --normal (flagged ones still ship)
   - a text that appears in more than one row    -> held out, BOTH rows (no duplicate handling decided yet)
   Writes app/audio/manifest.json, manifest-slow.json (what the build reads) and manifest-meta.json (sidecar). */
const fs=require("fs"),path=require("path");
const arg=n=>{const i=process.argv.indexOf("--"+n);return i>0?process.argv[i+1]:null};
const normalDir=arg("normal"),fbDir=arg("fallback");
if(!normalDir||!fbDir){console.error("usage: node tools/audio/assemble-audio.js --normal <dir> --fallback <dir>");process.exit(2)}
const HERE=__dirname,APP=path.join(HERE,"..","..","app","audio");
const key=t=>t.trim().replace(/\s+/g," ").toLowerCase(); /* must match audioKey() in src/js/07-engine.js */
function parse(s){const rows=[];let r=[],f="",q=false;for(let i=0;i<s.length;i++){const c=s[i];if(q){if(c=='"'){if(s[i+1]=='"'){f+='"';i++}else q=false}else f+=c}else if(c=='"')q=true;else if(c==","){r.push(f);f=""}else if(c=="\n"){r.push(f.replace(/\r$/,""));rows.push(r);r=[];f=""}else f+=c}if(f||r.length){r.push(f);rows.push(r)}return rows}
const P=parse(fs.readFileSync(path.join(HERE,"audio_script.csv"),"utf8").replace(/^﻿/,""));const h=P.shift();
const rows=P.filter(r=>r.length>=4).map(r=>{const o=Object.fromEntries(h.map((k,i)=>[k,r[i]]));o.stem=o.file.slice(0,-4);return o});
const flagged=new Set(JSON.parse(fs.readFileSync(path.join(HERE,"weak-lines.json"),"utf8")).map(k=>k.split(":")[0]));
const g={};rows.forEach(r=>(g[key(r.text)]=g[key(r.text)]||[]).push(r));
const heldOut=new Set();Object.values(g).forEach(v=>{if(v.length>1)v.forEach(r=>heldOut.add(r.stem))});
const M={},MS={},meta={},ttsOnly=[],held=[];
fs.mkdirSync(path.join(APP,"slow"),{recursive:true});
for(const r of rows){
 const k=key(r.text);
 if(heldOut.has(r.stem)){held.push({file:r.file,text:r.text,voice:r.voice});continue}
 const weak=r.voice=="male_mx"&&flagged.has(r.stem);
 let src,voice,fallback=false;
 if(weak&&r.kind=="phrase"){src=fbDir;voice="es_MX-claude-high";fallback=true}
 else if(weak){ttsOnly.push({file:r.file,text:r.text,kind:r.kind,reason:"ald line failed the Whisper screen; dialogue/listening line left to device TTS"});continue}
 else{src=normalDir;voice=r.voice=="male_mx"?"es_MX-ald-medium":"es_MX-claude-high"}
 fs.copyFileSync(path.join(src,r.file),path.join(APP,r.file));fs.copyFileSync(path.join(src,"slow",r.file),path.join(APP,"slow",r.file));
 M[k]="audio/"+r.file;MS[k]="audio/slow/"+r.file;
 meta[k]={file:r.file,kind:r.kind,voice,fallbackVoice:fallback,whisperFlagged:flagged.has(r.stem),verified:false};
}
const sort=o=>Object.fromEntries(Object.keys(o).sort().map(k=>[k,o[k]]));
fs.writeFileSync(path.join(APP,"manifest.json"),JSON.stringify(sort(M),null,1)+"\n");
fs.writeFileSync(path.join(APP,"manifest-slow.json"),JSON.stringify(sort(MS),null,1)+"\n");
fs.writeFileSync(path.join(APP,"manifest-meta.json"),JSON.stringify({status:"MACHINE-GENERATED (Piper TTS) and UNVERIFIED: no human has listened to these files. Not read by the app or the build.",voices:{male_mx:"es_MX-ald-medium",female_mx:"es_MX-claude-high",fallback:"es_MX-claude-high (male phrase lines that failed the Whisper screen with ald)"},slowLengthScale:"x1.25",entries:sort(meta),ttsOnly,heldOutDuplicates:held},null,1)+"\n");
console.log({shipped:Object.keys(M).length,fallback:Object.values(meta).filter(m=>m.fallbackVoice).length,ttsOnly:ttsOnly.length,heldOut:held.length});
