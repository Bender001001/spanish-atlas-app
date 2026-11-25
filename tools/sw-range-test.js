#!/usr/bin/env node
/* Service-worker HTTP Range test. Runs the REAL app/sw.js fetch handler against a fake cache and checks
   that Range requests for cached audio get correct 206 / 416 answers sliced from the cached file.
   Run: node tools/sw-range-test.js */
const fs=require("fs"),path=require("path"),assert=require("assert");
const APP=path.join(__dirname,"..","app");
const FILES={mp3:"sample/sample.mp3",m4a:"sample/sample.m4a"};
const MIME={mp3:"audio/mpeg",m4a:"audio/mp4"};

function boot(store,netHits){
  const h={};
  const self={location:{href:"http://localhost/sw.js?v=t",origin:"http://localhost"},origin:"http://localhost",addEventListener(ev,fn){h[ev]=fn},skipWaiting(){return Promise.resolve()},clients:{claim(){}}};
  const key=r=>typeof r==="string"?r:r.url;
  const caches={
    open:()=>Promise.resolve({put(r,res){store.set(key(r),res);return Promise.resolve()},addAll(){return Promise.resolve()}}),
    match:r=>Promise.resolve(store.has(key(r))?store.get(key(r)).clone():undefined),
    keys:()=>Promise.resolve([])};
  const fetch=u=>{netHits.push(key(u));const f=Object.entries(FILES).find(([,p])=>key(u).endsWith("/"+p));
    return Promise.resolve(f?new Response(fs.readFileSync(path.join(APP,f[1])),{status:200,headers:{"Content-Type":"application/octet-stream"}}):new Response("nope",{status:404}))};
  new Function("self","caches","fetch",fs.readFileSync(path.join(APP,"sw.js"),"utf8"))(self,caches,fetch);
  return async(url,range)=>{
    const headers=range?{Range:range}:{};
    const req=new Request(url,{headers});let p;
    h.fetch({request:req,respondWith:x=>{p=x}});
    assert.ok(p,"SW must respond to "+url+(range?" ("+range+")":""));
    return p;
  };
}

(async()=>{
  const store=new Map(),net=[];
  const get=boot(store,net);
  for(const [ext,rel] of Object.entries(FILES)){
    const url="http://localhost/"+rel,bytes=fs.readFileSync(path.join(APP,rel)),len=bytes.length;
    assert.ok(len>1000,rel+" sample must exist");
    const slice=async(range,s,e)=>{
      const r=await get(url,range);
      assert.strictEqual(r.status,206,range+" -> 206");
      assert.strictEqual(r.headers.get("Content-Range"),"bytes "+s+"-"+e+"/"+len,range+" Content-Range");
      assert.strictEqual(r.headers.get("Content-Length"),String(e-s+1));
      assert.strictEqual(r.headers.get("Content-Type"),MIME[ext],"Content-Type for "+rel);
      assert.strictEqual(r.headers.get("Accept-Ranges"),"bytes");
      assert.ok(Buffer.from(await r.arrayBuffer()).equals(bytes.subarray(s,e+1)),range+" body bytes");
    };
    /* first request is uncached: whole file is fetched once and stored */
    await slice("bytes=0-1",0,1);
    assert.ok(store.has(url),"file stored in cache after first Range request");
    const hits=net.length;
    await slice("bytes=0-",0,len-1);                 // iOS opening probe
    await slice("bytes=100-199",100,199);
    await slice("bytes="+(len-10)+"-",len-10,len-1);  // open-ended tail
    await slice("bytes=-50",len-50,len-1);            // suffix
    await slice("bytes=5-999999999",5,len-1);         // end past EOF is clamped
    assert.strictEqual(net.length,hits,"served from cache — no further network fetches");
    for(const bad of ["bytes="+len+"-","bytes=500-100"]){
      const r=await get(url,bad);
      assert.strictEqual(r.status,416,bad+" -> 416");
      assert.strictEqual(r.headers.get("Content-Range"),"bytes */"+len);
    }
    const multi=await get(url,"bytes=0-1,10-11");
    assert.strictEqual(multi.status,200,"multi-range -> whole file");
    /* no Range header -> unchanged cache-first path returns the stored 200 */
    const plain=await get(url);assert.strictEqual(plain.status,200);assert.strictEqual((await plain.arrayBuffer()).byteLength,len);
  }
  /* a Range request for something that is not there passes the 404 through */
  const miss=await get("http://localhost/sample/none.mp3","bytes=0-9");assert.strictEqual(miss.status,404);
  console.log("PASS: sw.js Range (206 slices, Content-Range/Type, 416, multi-range, cache reuse) for MP3 + M4A");
})().catch(e=>{console.error("FAIL:",e.message);process.exit(1)});
