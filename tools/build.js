#!/usr/bin/env node
/* ÓRALE build: src/ -> ONE self-contained app/orale.html (inline CSS + JS, no external requests),
   so the shipped app still works when double-clicked from disk and fully offline.
     src/index.html      page shell with @STYLE and @SCRIPT comment placeholders
     src/style.css       all CSS
     src/js/NN-*.js      script sections, concatenated in filename order into ONE classic script
                         (shared global scope on purpose: inline onclick="..." handlers call these globals)
   esbuild (pinned in package.json / package-lock.json) transforms the CSS and JS; it does not minify,
   so the committed output stays readable and diffable. Output is always LF and deterministic.
   Usage: node tools/build.js           write app/orale.html
          node tools/build.js --check   exit 1 if app/orale.html is not what the sources produce */
const fs=require("fs"),path=require("path");
const esbuild=require("esbuild");
const ROOT=path.join(__dirname,"..");
const SRC=path.join(ROOT,"src");
const OUT=path.join(ROOT,"app","orale.html");
const rd=f=>fs.readFileSync(f,"utf8").split("\r\n").join("\n");

function render(){
  const shell=rd(path.join(SRC,"index.html"));
  const css=esbuild.transformSync(rd(path.join(SRC,"style.css")),{loader:"css"}).code;
  const files=fs.readdirSync(path.join(SRC,"js")).filter(f=>f.endsWith(".js")).sort();
  const js=esbuild.transformSync('"use strict";\n'+files.map(f=>rd(path.join(SRC,"js",f))).join(""),{loader:"js",target:"es2020"}).code;
  for(const ph of ["/*@STYLE*/","/*@SCRIPT*/"])if(shell.split(ph).length!==2)throw new Error("placeholder "+ph+" must appear exactly once in src/index.html");
  return shell.replace("/*@STYLE*/",()=>css).replace("/*@SCRIPT*/",()=>js);
}

const out=render();
if(process.argv.includes("--check")){
  const cur=fs.existsSync(OUT)?rd(OUT):"";
  if(cur!==out){console.error("FAIL: app/orale.html is stale — run `node tools/build.js` and commit the result");process.exit(1)}
  console.log("PASS: app/orale.html is up to date with src/");
}else{
  fs.writeFileSync(OUT,out);
  console.log("built app/orale.html ("+out.length+" bytes, "+fs.readdirSync(path.join(SRC,"js")).length+" js modules)");
}
