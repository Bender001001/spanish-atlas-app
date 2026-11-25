/* ================= SHADOW BOOTH ================= */
let SHR=0.85,CURP=null;
function startShadow(){go("learn");shadowCard()}
function shadowCard(){recReset();const pool=PH.filter(p=>p[0]<=S.week);const p=pick(pool);CURP=p;
 $("#view").innerHTML='<h2 class="sect"><small>Cabina de sombra</small>Escucha. Imita. Iguala.</h2>'
 +'<div class="card" style="text-align:center;padding:26px 16px"><div class="fc-word es" style="margin-bottom:6px">'+esc(p[1])+'</div><p class="muted">'+esc(p[2])+'</p>'
 +'<div class="row" style="justify-content:center;margin-top:16px;flex-wrap:wrap"><button class="btn" onclick="speak('+JSON.stringify(p[1]).replace(/"/g,"&quot;")+',SHR)">♪ Escuchar</button><button class="btn ghost sm" onclick="SHR=Math.max(0.55,SHR-0.1);toast(\'Velocidad \'+SHR.toFixed(2))">− lento</button><button class="btn ghost sm" onclick="SHR=Math.min(1.3,SHR+0.1);toast(\'Velocidad \'+SHR.toFixed(2))">+ rápido</button></div>'
 +'<div id="rec-area">'+recArea()+'</div>'
 +'<p class="muted" style="margin-top:14px">Protocolo: escúchala 2 veces → dila en voz alta pegado al audio → repite hasta igualar ritmo y música de la frase. Después grábate e intenta igualar el audio original.</p>'
 +'<div class="grid2" style="margin-top:14px"><button class="btn ghost" onclick="shadowCard()">Otra frase</button><button class="btn" onclick="shadowDone()">Rep lograda ✓</button></div></div>';}
function shadowDone(){S.stats.shadow++;day().shadow++;addXP(8);toast("+8 XP · sombra registrada");questCheck();shadowCard()}
/* ================= SPEECH PRACTICE v2 (recording) ================= */
let REC={stream:null,recorder:null,chunks:[],url:null,recording:false};
function recSupported(){return !!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder)}
let NAVGEN=0; /* S13: bumped on every route change; timed flows capture it and no-op when stale */
function recReset(){NAVGEN++;QZ=null;CQ=null;BOSS=null;clearInterval(BOSST);if(REC.url)URL.revokeObjectURL(REC.url);if(REC.stream)REC.stream.getTracks().forEach(t=>t.stop());REC={stream:null,recorder:null,chunks:[],url:null,recording:false}}
function renderRecArea(){const el=$("#rec-area");if(el)el.innerHTML=recArea()}
function recArea(){
 if(!recSupported())return '<p class="muted" style="margin-top:14px">Grabación no disponible en este navegador (usa Chrome o Edge).</p>';
 if(REC.recording)return '<div class="row" style="justify-content:center;margin-top:14px"><button class="btn" style="background:var(--rojo)" onclick="recStop()">⏹ Detener grabación</button></div><p class="muted" style="text-align:center;margin-top:6px">Grabando… di la frase en voz alta.</p>';
 if(REC.url)return '<div class="grid2" style="margin-top:14px"><button class="btn ghost" onclick="recPlay()">▶ Escuchar mi grabación</button><button class="btn ghost" onclick="speak('+JSON.stringify(CURP[1]).replace(/"/g,"&quot;")+',SHR)">♪ Comparar con nativo</button></div><button class="btn sm ghost wide" style="margin-top:8px" onclick="recDiscard()">🗑 Descartar y grabar de nuevo</button>';
 return '<div class="row" style="justify-content:center;margin-top:14px"><button class="btn ghost" onclick="recStart()">🎙 Grabar mi voz</button></div>';
}
async function recStart(){
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  REC.stream=stream;REC.chunks=[];
  const mime=(window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported("audio/webm"))?"audio/webm":"";
  REC.recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);
  REC.recorder.ondataavailable=e=>{if(e.data&&e.data.size>0)REC.chunks.push(e.data)};
  REC.recorder.onstop=()=>{const blob=new Blob(REC.chunks,{type:(REC.recorder.mimeType||"audio/webm")});REC.url=URL.createObjectURL(blob);if(REC.stream)REC.stream.getTracks().forEach(t=>t.stop());REC.stream=null;REC.recording=false;renderRecArea()};
  REC.recorder.start();REC.recording=true;renderRecArea();
 }catch(e){toast("No se pudo acceder al micrófono. Revisa permisos (o abre la app desde HTTPS/localhost).")}
}
function recStop(){if(REC.recorder&&REC.recording)REC.recorder.stop()}
function recPlay(){if(REC.url){const a=new Audio(REC.url);a.play()}}
function recDiscard(){recReset();renderRecArea()}
/* ================= CONJUGATION TRAINER ================= */
function stripAccents(s){return String(s).normalize("NFD").replace(/[̀-ͯ]/g,"")}
function conjNorm(s){return stripAccents(s).trim().toLowerCase().replace(/\s+/g," ")}
function conjBuild(n){const items=[],used=new Set();
 function pushCombo(vi,ti,pi){const key=vi+"-"+ti+"-"+pi;if(used.has(key))return false;used.add(key);const v=CJ[vi];items.push({vi:vi,ti:ti,pi:pi,id:"cj"+vi+"_"+ti+"_"+pi,cue:pick(TENSE_CUES[ti]),ans:v[2+ti][pi]});return true}
 const weak=shuffle(Object.keys(S.miss).filter(k=>k.indexOf("cj")===0&&S.miss[k]>0));
 weak.slice(0,Math.min(3,n)).forEach(id=>{const m=id.match(/^cj(\d+)_(\d+)_(\d+)$/);if(m)pushCombo(+m[1],+m[2],+m[3])});
 let guard=0;while(items.length<n&&guard<500){guard++;pushCombo(Math.floor(Math.random()*CJ.length),Math.floor(Math.random()*4),Math.floor(Math.random()*6))}
 return shuffle(items)}
let CQ=null,CQOPTS=[];
function startConj(){go("learn");CQ={items:conjBuild(10),i:0,score:0};conjQ()}
function conjQ(){const z=CQ;if(!z)return;if(z.i>=z.items.length)return conjEnd();
 const it=z.items[z.i],v=CJ[it.vi];
 $("#view").innerHTML='<div class="q-meta"><span>CONJUGACIÓN</span><span>'+(z.i+1)+'/'+z.items.length+'</span></div>'
 +'<div class="card" style="text-align:center">'
 +'<div class="tag">'+esc(TENSE_NAMES[it.ti])+'</div>'
 +'<div class="q-word" style="margin:14px 0">'+esc(PERSONS[it.pi])+' + <span class="es">'+esc(v[0])+'</span> + '+esc(it.cue)+'</div>'
 +'<button class="speak-ico" aria-label="Escuchar" onclick="speak('+JSON.stringify(PERSONS[it.pi]+" "+v[0]+" "+it.cue).replace(/"/g,"&quot;")+')">♪</button>'
 +'<div style="margin-top:16px"><input type="text" id="cj-in" placeholder="escribe la forma conjugada…" autocomplete="off" autocapitalize="off" onkeydown="if(event.key===\'Enter\')conjSubmit()"></div>'
 +'<div class="grid2" style="margin-top:12px"><button class="btn ghost" onclick="conjOptions()">No sé, dame opciones</button><button class="btn" onclick="conjSubmit()">Confirmar</button></div>'
 +'</div>';}
function conjDistractors(it){const v=CJ[it.vi],ans=it.ans;let pool=[];
 for(let t=0;t<4;t++)for(let p=0;p<6;p++){const f=v[2+t][p];if(f!==ans&&pool.indexOf(f)<0)pool.push(f)}
 pool=shuffle(pool);let guard=0;
 while(pool.length<3&&guard<50){guard++;const ov=CJ[Math.floor(Math.random()*CJ.length)];const f=ov[2+it.ti][it.pi];if(f!==ans&&pool.indexOf(f)<0)pool.push(f)}
 return pool.slice(0,3)}
function conjOptions(){const z=CQ,it=z.items[z.i],v=CJ[it.vi];CQOPTS=shuffle([it.ans].concat(conjDistractors(it)));
 $("#view").innerHTML='<div class="q-meta"><span>CONJUGACIÓN</span><span>'+(z.i+1)+'/'+z.items.length+'</span></div>'
 +'<div class="tag">'+esc(TENSE_NAMES[it.ti])+'</div>'
 +'<div class="q-word" style="margin:14px 0">'+esc(PERSONS[it.pi])+' + <span class="es">'+esc(v[0])+'</span> + '+esc(it.cue)+'</div>'
 +CQOPTS.map((o,i)=>'<button class="opt" onclick="conjPick('+i+')">'+esc(o)+'</button>').join("")}
function conjPick(i){conjGrade(CQOPTS[i]===CQ.items[CQ.i].ans)}
function conjSubmit(){const el=$("#cj-in");conjGrade(conjNorm(el?el.value:"")===conjNorm(CQ.items[CQ.i].ans))}
function conjGrade(correct){const z=CQ,it=z.items[z.i];
 if(correct){z.score++;if(S.miss[it.id])S.miss[it.id]=Math.max(0,S.miss[it.id]-1)}
 else{S.miss[it.id]=(S.miss[it.id]||0)+1}
 $("#view").innerHTML='<div class="card" aria-live="polite" style="text-align:center;border-color:'+(correct?"var(--lima)":"var(--rojo)")+'"><div class="bigscore" style="color:'+(correct?"var(--lima)":"var(--rojo)")+'">'+(correct?"✓":"✗")+'</div><div class="q-word es">'+esc(it.ans)+'</div></div>';
 speak(it.ans);setTimeout(()=>{z.i++;conjQ()},1100)}
function conjEnd(){const z=CQ,total=z.items.length;S.stats.conj=(S.stats.conj||0)+total;day().conj=(day().conj||0)+1;addXP(z.score*4);questCheck();checkAch();
 $("#view").innerHTML='<div class="card" aria-live="polite" style="text-align:center;padding:30px 16px"><div class="bigscore">'+z.score+'/'+total+'</div><h3>Conjugación · ronda completa</h3><p class="muted">+'+z.score*4+' XP</p><button class="btn" style="margin-top:14px" onclick="renderLearn()">Volver</button></div>';
 if(z.score===total)buddy(pick(AN.win));else if(z.score<total*0.5)buddy(pick(AN.fail));
 renderHeader();save()}
/* ================= LISTENING LAB (dialogues) ================= */
let DLR=0.9,DLGQ=null;
function dlgUnlocked(){return DLG.map((d,i)=>({d:d,i:i})).filter(x=>x.d.wk<=S.week)}
function startListening(){go("learn");renderDlgList()}
function renderDlgList(){const items=dlgUnlocked();
 $("#view").innerHTML='<h2 class="sect"><small>Cabina de escucha</small>Diálogos de Óralelandia</h2>'
 +(items.length?items.map(x=>'<div class="card"><h3>'+esc(x.d.t)+' <span class="tag">sem '+x.d.wk+'</span>'+((S.dlgDone||[]).includes(x.i)?' <span class="tag" style="border-color:var(--lima);color:var(--lima)">✓ hecho</span>':"")+'</h3><p class="muted">'+esc(x.d.note)+'</p><button class="btn ghost wide" style="margin-top:8px" onclick="dlgPlay('+x.i+')">Escuchar diálogo</button></div>').join(""):'<p class="muted">Todavía no hay diálogos desbloqueados. Sigue avanzando de semana.</p>')}
function dlgPlay(i){DLGQ={i:i,li:0};dlgLine()}
function dlgVoiceFor(ch){if(ch===1&&VOICES.length>1){const alt=VOICES.find(v=>v!==bestVoice());if(alt)return alt}return bestVoice()}
function dlgSpeakLine(li){const d=DLG[DLGQ.i];const ln=d.lines[li];speak(ln[1],DLR,li%2===0?1:1.3,dlgVoiceFor(li%2))}
function dlgLine(){const z=DLGQ,d=DLG[z.i];
 if(z.li>=d.lines.length)return dlgMCQ();
 const ln=d.lines[z.li];
 $("#view").innerHTML='<div class="q-meta"><span>'+esc(d.t)+'</span><span>'+(z.li+1)+'/'+d.lines.length+'</span></div>'
 +'<div class="card" style="text-align:center">'
 +'<div class="tag">'+esc(ln[0])+'</div>'
 +'<div class="q-word es" style="margin:12px 0">'+esc(ln[1])+'</div>'
 +'<div class="muted">'+esc(ln[2])+'</div>'
 +'<div class="row" style="justify-content:center;margin-top:16px;flex-wrap:wrap"><button class="btn" onclick="dlgSpeakLine('+z.li+')">♪ Escuchar</button><button class="btn ghost sm" onclick="DLR=Math.max(0.55,DLR-0.1);toast(\'Velocidad \'+DLR.toFixed(2))">− lento</button><button class="btn ghost sm" onclick="DLR=Math.min(1.3,DLR+0.1);toast(\'Velocidad \'+DLR.toFixed(2))">+ rápido</button></div>'
 +'<div class="grid2" style="margin-top:14px"><button class="btn ghost" '+(z.li===0?"disabled":"")+' onclick="DLGQ.li--;dlgLine()">◀ Anterior</button><button class="btn" onclick="DLGQ.li++;dlgLine()">'+(z.li===d.lines.length-1?"Ir a las preguntas":"Siguiente ▶")+'</button></div>'
 +'</div>';
 dlgSpeakLine(z.li)}
function dlgMCQ(){const z=DLGQ,d=DLG[z.i];
 const items=d.mcqs.map((m,j)=>({q:m.q,opts:m.o,a:m.a,id:"dlg"+z.i+"_"+j}));
 quizRun(items,"Comprensión · "+d.t,(score,total)=>{S.stats.dlg=(S.stats.dlg||0)+1;day().dlg=(day().dlg||0)+1;S.dlgDone=S.dlgDone||[];if(!S.dlgDone.includes(z.i))S.dlgDone.push(z.i);addXP(score*6);buddy(score===total?pick(AN.win):pick(AN.fail));checkAch();save()},true)}
/* ================= STORY MODE (S6) ================= */
let STR=0.92,STQ=null;
function storyUnlocked(){return ST.map((s,i)=>({s:s,i:i})).filter(x=>x.s.wk<=S.week)}
function startStories(){go("learn");renderStoryList()}
function renderStoryList(){const items=storyUnlocked();const done=S.storyDone||[];
 let html='<h2 class="sect"><small>Story Mode · La campaña</small>Las crónicas de Óralelandia</h2>'
 +'<div class="marginalia">Anselmo narra la saga de Mateo, un viajero como tú: seis crónicas, una por fase. Escúchalas párrafo por párrafo y demuestra que entendiste.</div>';
 if(!items.length){html+='<p class="muted">Todavía no hay crónicas abiertas. Avanza de semana para desbloquear la primera (semana 4).</p>'}
 else{html+=items.map(x=>'<div class="card"><h3>'+esc(x.s.t)+' <span class="tag">fase '+(x.s.ph||"?")+' · sem '+x.s.wk+'</span>'+(done.includes(x.i)?' <span class="tag" style="border-color:var(--lima);color:var(--lima)">✓ leída</span>':"")+'</h3><p class="muted">'+esc(x.s.note)+'</p><button class="btn ghost wide" style="margin-top:8px" onclick="storyOpen('+x.i+')">Leer y escuchar</button></div>').join("")}
 const next=ST.map((s,i)=>({s:s,i:i})).find(x=>x.s.wk>S.week);
 if(next)html+='<div class="card" style="opacity:.5"><h3>??? <span class="tag">sem '+next.s.wk+'</span></h3><p class="muted">La siguiente crónica se abre en la semana '+next.s.wk+'. Sigue avanzando.</p></div>';
 $("#view").innerHTML=html}
function storyOpen(i){STQ={i:i,pi:0};storyIntro()}
function storyIntro(){const s=ST[STQ.i];
 $("#view").innerHTML='<div class="q-meta"><span>STORY MODE</span><span>fase '+(s.ph||"?")+' · sem '+s.wk+'</span></div>'
 +'<h2 class="sect" style="margin-top:2px">'+esc(s.t)+'</h2>'
 +'<div class="marginalia">'+esc(s.quest)+'</div>'
 +'<div class="card"><p class="muted">'+esc(s.note)+'</p><p class="muted" style="margin-top:8px">'+s.paras.length+' párrafos · '+s.mcqs.length+' preguntas de comprensión al final.</p><div class="grid2" style="margin-top:12px"><button class="btn ghost" onclick="renderStoryList()">◀ Volver</button><button class="btn" onclick="STQ.pi=0;storyPage()">Empezar la crónica</button></div></div>';
 buddy("A tale for you, escudero. Listen well — the questions await at the end.")}
function storySpeak(pi){const s=ST[STQ.i];speak(s.paras[pi],STR,1,bestVoice())}
function storyPage(){const z=STQ,s=ST[z.i];
 if(z.pi>=s.paras.length)return storyMCQ();
 $("#view").innerHTML='<div class="q-meta"><span>'+esc(s.t)+'</span><span>párrafo '+(z.pi+1)+'/'+s.paras.length+'</span></div>'
 +'<div class="card"><p class="story-para es">'+esc(s.paras[z.pi])+'</p>'
 +'<div class="row" style="justify-content:center;margin-top:14px;flex-wrap:wrap"><button class="btn" onclick="storySpeak('+z.pi+')">♪ Escuchar</button><button class="btn ghost sm" onclick="STR=Math.max(0.55,STR-0.1);toast(\'Velocidad \'+STR.toFixed(2))">− lento</button><button class="btn ghost sm" onclick="STR=Math.min(1.3,STR+0.1);toast(\'Velocidad \'+STR.toFixed(2))">+ rápido</button></div>'
 +'<div class="grid2" style="margin-top:14px"><button class="btn ghost" '+(z.pi===0?"disabled":"")+' onclick="STQ.pi--;storyPage()">◀ Anterior</button><button class="btn" onclick="STQ.pi++;storyPage()">'+(z.pi===s.paras.length-1?"Ir a las preguntas ▶":"Siguiente ▶")+'</button></div></div>';
 storySpeak(z.pi)}
function storyMCQ(){const z=STQ,s=ST[z.i];
 const items=s.mcqs.map((m,j)=>({q:m.q,opts:m.o,a:m.a,id:"st"+z.i+"_"+j}));
 quizRun(items,"Comprensión · "+s.t,function(score,total){S.stats.story=(S.stats.story||0)+1;day().story=(day().story||0)+1;S.storyDone=S.storyDone||[];if(!S.storyDone.includes(z.i))S.storyDone.push(z.i);addXP(score*8);buddy(score>=4?pick(AN.win):pick(AN.fail));checkAch();save()},true)}
