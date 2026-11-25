/* ================= PWA (S10) ================= */
function pwaInit(){/* Register the service worker ONLY when it can actually work: needs browser support
 and an http(s) origin. Double-clicked from disk (file://) this is a silent no-op — the
 single-file offline path stays exactly as it always was. */
 if(!("serviceWorker" in navigator))return false;
 if(typeof location==="undefined"||(location.protocol!=="https:"&&location.protocol!=="http:"))return false;
 navigator.serviceWorker.register("sw.js?v="+APP_VERSION).catch(()=>{});return true}
/*! INIT */
setInterval(()=>{if(document.visibilityState==="visible"){day().min+=0.5;save()}},30000);
document.addEventListener("keydown",e=>{var fc=document.getElementById("fc");if(!fc)return;if(e.key===" "||e.code==="Space"){e.preventDefault();fc.classList.toggle("flip")}else if(e.key>="1"&&e.key<="4"){ans(+e.key-1)}});
pwaInit();persistStorage();
document.querySelector("#btn-help").addEventListener("click",openTutorial);
renderHeader();go("panel");
if(!S.tut){setTimeout(openTutorial,500)}else{setTimeout(()=>{buddy(pick(AN.greet))},900);}
if(Math.random()<0.3)setTimeout(()=>memoryRaid(false),4000);
