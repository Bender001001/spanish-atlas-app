#!/usr/bin/env node
/* Real-file check for app/audio/ (the fixture test in audio-test.js does not cover these files):
   every .mp3/.ogg/.m4a/.wav under app/audio must decode (ffprobe can read it) and have a duration > 0,
   and every file named in manifest.json / manifest-slow.json must be one of them.
   ffprobe not on PATH -> prints a clear SKIP message and exits 0 (set REQUIRE_FFPROBE=1 to make that a failure).
   Run: node tools/audio-files-test.js */
const fs=require("fs"),path=require("path"),cp=require("child_process");
const DIR=path.join(__dirname,"..","app","audio");
const AUDIO=/\.(mp3|ogg|m4a|wav)$/i;
const files=[];(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(AUDIO.test(e.name))files.push(p)}})(DIR);
const probe=cp.spawnSync("ffprobe",["-version"],{encoding:"utf8"});
if(probe.error||probe.status!==0){
 const msg="ffprobe not found on PATH: "+files.length+" files in app/audio NOT decoded (install ffmpeg to run this check)";
 if(process.env.REQUIRE_FFPROBE){console.error("FAIL: "+msg);process.exit(1)}
 console.log("SKIP: "+msg);process.exit(0)}
const bad=[];
for(const f of files){
 const r=cp.spawnSync("ffprobe",["-v","error","-show_entries","format=duration","-of","csv=p=0",f],{encoding:"utf8"});
 const d=parseFloat((r.stdout||"").trim());const rel=path.relative(DIR,f).split(path.sep).join("/");
 if(r.status!==0||(r.stderr||"").trim())bad.push(rel+": does not decode ("+((r.stderr||"").trim().split("\n")[0]||"ffprobe exit "+r.status)+")");
 else if(!(d>0))bad.push(rel+": duration is "+(isNaN(d)?"unknown":d));
}
const have=new Set(files.map(f=>"audio/"+path.relative(DIR,f).split(path.sep).join("/")));
for(const m of ["manifest.json","manifest-slow.json"]){const p=path.join(DIR,m);if(!fs.existsSync(p))continue;
 for(const [k,v] of Object.entries(JSON.parse(fs.readFileSync(p,"utf8"))))if(!have.has(v))bad.push(m+': "'+k+'" -> '+v+" is not a file in app/audio")}
if(bad.length){console.error("FAIL: "+bad.length+" problem(s) in app/audio:\n  "+bad.join("\n  "));process.exit(1)}
console.log("PASS: "+files.length+" audio files in app/audio decode with duration > 0 (ffprobe)");
