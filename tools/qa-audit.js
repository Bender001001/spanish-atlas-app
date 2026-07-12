#!/usr/bin/env node
const fs=require("fs"),path=require("path");
const html=fs.readFileSync(path.join(__dirname,"..","app","orale.html"),"utf8");
const m=html.match(/<script>([\s\S]*)<\/script>/);
const els={};function fake(){return{innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){},toggle(){}},dataset:{},addEventListener(){},appendChild(){},remove(){},click(){},href:"",querySelectorAll:()=>[],getContext:()=>new Proxy({},{get:()=>()=>{}}),offsetWidth:300,value:"1"}}
global.document={addEventListener(){},querySelector:s=>els[s]||(els[s]=fake()),querySelectorAll:()=>[fake(),fake(),fake(),fake(),fake()],getElementById:()=>fake(),createElement:()=>fake(),body:Object.assign(fake(),{dataset:{}}),visibilityState:"visible"};
global.window=global;global.localStorage={_s:{},getItem(k){return this._s[k]||null},setItem(k,v){this._s[k]=v},removeItem(k){delete this._s[k]}};
global.speechSynthesis={getVoices:()=>[],cancel(){},speak(){}};global.SpeechSynthesisUtterance=function(){};
global.navigator={};global.scrollTo=()=>{};global.confirm=()=>true;global.prompt=()=>null;
global.setTimeout=()=>0;global.setInterval=()=>0;global.clearTimeout=()=>{};
const body=fs.readFileSync(path.join(__dirname,"qa-audit-body.js"),"utf8");
eval(m[1].replace('"use strict";','')+"\n"+body);
console.log("\n--- external links ---");
[...new Set((html.match(/https?:\/\/[^\s"'<>\\]+/g)||[]))].forEach(l=>console.log(l));
