#!/usr/bin/env node
/* ÓRALE build: src/ -> ONE self-contained app/orale.html (inline CSS + JS, no external requests),
   so the shipped app still works when double-clicked from disk and fully offline.
     src/index.html      page shell with @STYLE and @SCRIPT comment placeholders
     src/style.css       all CSS
     src/js/NN-*.js      script sections, concatenated in filename order into ONE classic script
                         (shared global scope on purpose: inline onclick="..." handlers call these globals)
   esbuild (pinned in package.json / package-lock.json) transforms the CSS and JS; it does not minify,
   so the committed output stays readable and diffable. Output is always LF and deterministic.
   Recorded audio: app/audio/manifest.json maps normalized text -> file ("hola": "audio/hola.mp3").
   The build inlines it into the app as AUDIO_MAP (speak() plays the file, else speechSynthesis) and
   writes the same file paths into the service-worker precache list in app/sw.js.
   Usage: node tools/build.js           write app/orale.html and app/sw.js
          node tools/build.js --check   exit 1 if either is not what the sources produce */
const fs=require("fs"),path=require("path");
const esbuild=require("esbuild");
const ROOT=path.join(__dirname,"..");
const SRC=path.join(ROOT,"src");
const APP=path.join(ROOT,"app");
const rd=f=>fs.readFileSync(f,"utf8").split("\r\n").join("\n");
/* must match audioKey() in src/js/07-engine.js */
const audioKey=t=>String(t).trim().replace(/\s+/g," ").toLowerCase();

function audioMap(appDir,name){
  const f=path.join(appDir,"audio",name||"manifest.json");
  const map=fs.existsSync(f)?JSON.parse(rd(f)):{};
  Object.keys(map).forEach(k=>{
    if(!k||k!==audioKey(k))throw new Error('audio manifest key "'+k+'" must be trimmed, single-spaced, lower-case');
    if(!/^audio\/(slow\/)?[A-Za-z0-9._-]+\.(mp3|ogg|m4a|wav)$/.test(map[k]))throw new Error('audio manifest path for "'+k+'" must be audio/[slow/]<file>.mp3|ogg|m4a|wav, got '+map[k]);
    if(!fs.existsSync(path.join(appDir,map[k])))throw new Error("audio file missing: "+map[k]);
  });
  return map;
}

/* file -> "male"|"female", from audio/manifest-meta.json (sidecar written by tools/audio/assemble-audio.js).
   The manifests themselves are unchanged. speak() uses it so a dialogue speaker only gets a recording in their own voice. */
const VOICE_KIND={"es_MX-ald-medium":"male","es_MX-claude-high":"female"};
function audioVoice(appDir){
  const f=path.join(appDir,"audio","manifest-meta.json");if(!fs.existsSync(f))return {};
  const ent=JSON.parse(rd(f)).entries||{},m=audioMap(appDir),ms=audioMap(appDir,"manifest-slow.json"),out={};
  Object.keys(ent).forEach(k=>{const v=ent[k].voice,kind=VOICE_KIND[v];
    if(!kind)throw new Error('manifest-meta.json: unknown voice "'+v+'" for "'+k+'" (known: '+Object.keys(VOICE_KIND).join(", ")+")");
    [m[k],ms[k]].forEach(p=>{if(p)out[p]=kind})});
  Object.keys(m).concat(Object.keys(ms)).forEach(k=>{if(!(k in ent))throw new Error('manifest-meta.json has no voice for "'+k+'"')});
  return out}

function render(o){
  const appDir=(o&&o.appDir)||APP;
  const shell=rd(path.join(SRC,"index.html"));
  const css=esbuild.transformSync(rd(path.join(SRC,"style.css")),{loader:"css"}).code;
  const files=fs.readdirSync(path.join(SRC,"js")).filter(f=>f.endsWith(".js")).sort();
  const AUD="/*@AUDIO_MAP*/{}";
  let src='"use strict";\n'+files.map(f=>rd(path.join(SRC,"js",f))).join("");
  if(src.split(AUD).length!==2)throw new Error("AUDIO_MAP placeholder must appear exactly once in src/js");
  src=src.replace(AUD,()=>JSON.stringify(audioMap(appDir)));
  const SLOW="/*@AUDIO_SLOW_MAP*/{}";
  if(src.split(SLOW).length!==2)throw new Error("AUDIO_SLOW_MAP placeholder must appear exactly once in src/js");
  src=src.replace(SLOW,()=>JSON.stringify(audioMap(appDir,"manifest-slow.json")));
  const VOI="/*@AUDIO_VOICE*/{}";
  if(src.split(VOI).length!==2)throw new Error("AUDIO_VOICE placeholder must appear exactly once in src/js");
  src=src.replace(VOI,()=>JSON.stringify(audioVoice(appDir)));
  const js=esbuild.transformSync(src,{loader:"js",target:"es2020"}).code;
  for(const ph of ["/*@STYLE*/","/*@SCRIPT*/"])if(shell.split(ph).length!==2)throw new Error("placeholder "+ph+" must appear exactly once in src/index.html");
  return shell.replace("/*@STYLE*/",()=>css).replace("/*@SCRIPT*/",()=>js);
}

function renderSw(o){
  const appDir=(o&&o.appDir)||APP;
  const sw=rd(path.join(APP,"sw.js"));
  const a="/*audio:start*/",b="/*audio:end*/";
  const i=sw.indexOf(a),j=sw.indexOf(b);
  if(i<0||j<i)throw new Error("sw.js must contain the audio:start / audio:end markers");
  const list=[...new Set([...Object.values(audioMap(appDir)),...Object.values(audioMap(appDir,"manifest-slow.json"))])].sort().map(f=>'  "./'+f+'",\n').join("");
  return sw.slice(0,i+a.length)+"\n"+list+sw.slice(j);
}

module.exports={render,renderSw,audioKey};

if(require.main===module){
  const targets=[[path.join(APP,"orale.html"),render()],[path.join(APP,"sw.js"),renderSw()]];
  if(process.argv.includes("--check")){
    const stale=targets.filter(([f,out])=>(fs.existsSync(f)?rd(f):"")!==out).map(([f])=>path.relative(ROOT,f));
    if(stale.length){console.error("FAIL: stale build output ("+stale.join(", ")+") — run `node tools/build.js` and commit the result");process.exit(1)}
    console.log("PASS: app/orale.html and app/sw.js are up to date with src/ and app/audio/manifest.json");
  }else{
    targets.forEach(([f,out])=>fs.writeFileSync(f,out));
    console.log("built app/orale.html ("+targets[0][1].length+" bytes, "+fs.readdirSync(path.join(SRC,"js")).length+" js modules) + app/sw.js");
  }
}
