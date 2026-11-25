/* ================= VIEW: PANEL ================= */
function renderPanel(){const d=day();const due=dueCards().length,nw=newCards().length,mast=masteredCards().length,known=knownCards().length;
 const hrs=Object.values(S.days).reduce((a,x)=>a+x.min,0)/60;
 const greetH=new Date().getHours();const g=greetH<12?"Buenos días":greetH<19?"Buenas tardes":"Buenas noches";
 let q=quests();
 let html='<div class="hero-greet">'+g+', <b>'+esc(S.name)+'</b>.</div><p class="muted">Semana '+S.week+' de 26 · '+(due?due+" tarjetas te esperan.":"Todo al día. Qué raro. Qué sospechoso.")+'</p>';
 html+='<div class="statgrid"><div class="stat"><div class="n">'+known+'</div><div class="l">palabras vistas</div></div><div class="stat"><div class="n">'+mast+'</div><div class="l">dominadas</div></div><div class="stat"><div class="n">'+hrs.toFixed(1)+'h</div><div class="l">total invertido</div></div></div>';
 html+='<div class="card"><h3>Misiones de hoy</h3>'+q.map(x=>'<div class="quest'+(x.done?" done":"")+'"><div class="chk">'+(x.done?"✓":"")+'</div><div class="qt">'+x.t+' <span class="muted">('+x.p+')</span></div><div class="qxp">+'+x.xp+'</div></div>').join("")+'<p class="muted" style="margin-top:8px">Completa las cuatro y abre el cofre del día.</p></div>';
 html+='<div class="grid2"><button class="btn wide" onclick="startReview()">Repasar ('+due+')</button><button class="btn ghost wide" onclick="startNew()">Aprender nuevas ('+Math.min(nw,15)+')</button></div>';
 html+='<div class="card" style="margin-top:12px"><h3>Últimos 14 días (minutos)</h3><canvas class="chart" id="ch-days"></canvas></div>';
 html+='<div class="card"><h3>Análisis</h3><p class="muted">Retención de 90 días, pronóstico de carga, mapa de dominio semanal y tu fecha estimada para la meta de 170 horas.</p><button class="btn ghost wide" style="margin-top:10px" onclick="ADEMO=null;renderAnalytics()">Ver análisis completo</button></div>';
 html+='<div class="card"><h3>Dominio por categoría</h3>'+catBars()+'</div>';
 const weak=Object.entries(S.miss).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,5);
 html+='<div class="card"><h3>Zonas débiles</h3>'+(weak.length?weak.map(w=>{const c=BYID[w[0]];return c?'<div class="spread" style="padding:6px 0;border-bottom:1px solid var(--line)"><span class="es">'+esc(c.es)+'</span><span class="muted">'+esc(c.en)+' · fallada '+w[1]+'x</span></div>':""}).join("")+'<button class="btn sm ghost" style="margin-top:10px" onclick="startRepair()">Reparar ahora</button>':'<p class="muted">Sin fallas registradas. Anselmo está impresionado, y eso es difícil.</p>')+'</div>';
 const un=S.ach.length;html+='<div class="card"><h3>Logros ('+un+'/'+ACH.length+')</h3>'+ACH.map(a=>'<span class="chip" style="'+(S.ach.includes(a[0])?"border-color:var(--mari);color:var(--mari)":"opacity:.4")+'" title="'+esc(a[2])+'">'+esc(a[1])+'</span>').join("")+'</div>';
 $("#view").innerHTML=html;drawDays();questCheck()}
function catBars(){const cats={};unlocked().forEach(c=>{cats[c.cat]=cats[c.cat]||[0,0];cats[c.cat][1]++;const st=S.cards[c.id];if(st&&st.iv>=7)cats[c.cat][0]++});
 return Object.entries(cats).map(([k,v])=>{const pc=v[1]?Math.round(v[0]/v[1]*100):0;return '<div class="bar-row"><div class="bl"><span>'+k+'</span><b>'+pc+'%</b></div><div class="bar"><i style="width:'+pc+'%"></i></div></div>'}).join("")}
function drawDays(){const cv=$("#ch-days");if(!cv)return;const ctx=cv.getContext("2d");const W2=cv.width=cv.offsetWidth*2,H2=cv.height=260;
 const days=[];for(let i=13;i>=0;i--){const d=new Date(Date.now()-i*864e5);const k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");days.push([k.slice(8),(S.days[k]||{min:0}).min])}
 const max=Math.max(60,...days.map(d=>d[1]));const bw=W2/14;
 ctx.strokeStyle="rgba(139,148,166,.35)";ctx.setLineDash([6,6]);ctx.beginPath();const ty=H2-30-(60/max)*(H2-50);ctx.moveTo(0,ty);ctx.lineTo(W2,ty);ctx.stroke();ctx.setLineDash([]);
 days.forEach((d,i)=>{const h=(d[1]/max)*(H2-50);ctx.fillStyle=d[1]>=60?"#f2a33c":"#3e8fb0";ctx.beginPath();ctx.roundRect(i*bw+bw*0.2,H2-30-h,bw*0.6,Math.max(h,3),6);ctx.fill();ctx.fillStyle="#8b94a6";ctx.font="20px monospace";ctx.textAlign="center";ctx.fillText(d[0],i*bw+bw/2,H2-8)})}
/* ================= VIEW: ANALYTICS v2 ================= */
let ADEMO=null;
function AS(){return ADEMO||S}
function dayKey(back){const d=new Date(Date.now()-back*864e5);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function analyticsDemo(){ADEMO=ADEMO?null:seedDemoState();renderAnalytics();toast(ADEMO?"Datos de demostración — nada se guarda":"De vuelta a tus datos reales")}
function seedDemoState(){const d=fresh();d.week=14;let rnd=42;const rand=()=>{rnd=(rnd*1103515245+12345)%2147483648;return rnd/2147483648};
 const e0=eday();
 for(let i=89;i>=0;i--){if(rand()<0.82){const rev=8+Math.floor(rand()*22);d.days[dayKey(i)]={min:25+Math.floor(rand()*50),rev:rev,game:1,shadow:1,nw:5,chest:false,conj:1,dlg:0};
  for(let r=0;r<rev;r++){const ok=rand()<(0.62+(89-i)/89*0.25);d.log.push([e0-i,V[Math.floor(rand()*300)][3],ok?(rand()<0.5?2:3):(rand()<0.6?1:0)])}}}
 DECK.slice(0,420).forEach(c=>{if(rand()<0.8){const iv=[1,2,4,8,15,25,40][Math.floor(rand()*7)];d.cards[c.id]={e:2.5,iv:iv,reps:3,lapses:0,due:Date.now()+(Math.floor(rand()*15)-2)*864e5}}});
 return d}
function hoursProjection(st){const tot=Object.values(st.days).reduce((a,x)=>a+x.min,0);let recent=0;for(let i=0;i<28;i++)recent+=(st.days[dayKey(i)]||{min:0}).min;
 const pace=Math.round(recent/28);const remain=Math.max(0,170*60-tot);
 if(remain<=0)return{pace:pace,eta:"¡Hecha!",note:"Meta de 170 horas alcanzada. La siguiente parada son las 350 horas (B2 sólido) — mismo motor, misma hora diaria."};
 if(pace<1)return{pace:0,eta:"—",note:"Sin actividad en los últimos 28 días, no hay ritmo que proyectar. Un repaso hoy reinicia la máquina."};
 const days=Math.ceil(remain/pace);const eta=new Date(Date.now()+days*864e5);let fmt;try{fmt=eta.toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}catch(e){fmt=eta.toISOString().slice(0,10)}
 return{pace:pace,eta:fmt,note:"A tu ritmo de los últimos 28 días ("+pace+" min/día) faltan ~"+days+" días para las 170 horas. A la hora diaria del plan llegarías en "+Math.ceil(remain/60)+" días."}}
function weekHeatmap(st){const per={};DECK.forEach(c=>{per[c.wk]=per[c.wk]||[0,0];per[c.wk][1]++;const cs=st.cards[c.id];if(cs&&cs.iv>=7)per[c.wk][0]++});
 let cells="";for(let w=1;w<=26;w++){const p=per[w]||[0,0];const pct=p[1]?p[0]/p[1]:0;const locked=w>st.week;
  const bg=pct===0?"var(--ink3)":pct<0.25?"#3e8fb055":pct<0.5?"#3e8fb0aa":pct<0.75?"#f2a33c99":"#8fbf4dcc";
  cells+='<div class="cell'+(locked?" lk":"")+'" style="background:'+bg+'" title="Semana '+w+(locked?" (cerrada)":"")+' · '+p[0]+'/'+p[1]+' tarjetas con intervalo ≥7 días"><b>'+w+'</b>'+Math.round(pct*100)+'%</div>'}
 return '<div class="hm">'+cells+'</div>'}
function buildReviewCSV(st){const G=["otra_vez","dificil","bien","facil"];let csv="fecha,tarjeta_id,espanol,ingles,calificacion\n";
 (st.log||[]).forEach(r=>{const c=BYID[r[1]];csv+=edayISO(r[0])+","+r[1]+",\""+String(c?c.es:"?").replace(/"/g,'""')+"\",\""+String(c?c.en:"?").replace(/"/g,'""')+"\","+(G[r[2]]||r[2])+"\n"});return csv}
function exportReviewCSV(){const st=AS();if(!(st.log||[]).length)return toast("La bitácora está vacía — empieza a repasar");
 const blob=new Blob(["﻿"+buildReviewCSV(st)],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download="orale-repasos-"+today()+".csv";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast("CSV exportado: "+st.log.length+" repasos")}
function renderAnalytics(){const st=AS();const hrs=Object.values(st.days).reduce((a,x)=>a+x.min,0)/60;const proj=hoursProjection(st);
 let html='<h2 class="sect"><small>Panel · Análisis</small>La sala de mapas</h2>';
 html+='<div class="grid2" style="margin-bottom:12px"><button class="btn sm ghost" onclick="ADEMO=null;go(\'panel\')">← Volver al panel</button><button class="btn sm ghost" onclick="analyticsDemo()">'+(ADEMO?"Ver mis datos":"Demo con datos de prueba")+'</button></div>';
 if(ADEMO)html+='<p class="muted" style="margin-bottom:10px"><b>Modo demostración:</b> 90 días de datos generados para probar las gráficas. Nada se guarda.</p>';
 html+='<div class="statgrid"><div class="stat"><div class="n">'+hrs.toFixed(1)+'h</div><div class="l">de 170h meta</div></div><div class="stat"><div class="n">'+proj.pace+'</div><div class="l">min/día (28d)</div></div><div class="stat"><div class="n" style="font-size:.95rem;line-height:2">'+esc(proj.eta)+'</div><div class="l">meta estimada</div></div></div>';
 html+='<div class="card"><h3>Camino a las 170 horas</h3><div class="bar" style="height:10px"><i style="width:'+Math.min(100,hrs/170*100).toFixed(1)+'%"></i></div><p class="muted" style="margin-top:8px">'+esc(proj.note)+'</p></div>';
 html+='<div class="card"><h3>Retención · 90 días</h3><p class="muted">% de repasos acertados por día (todo lo que no fue "Otra vez"). La línea punteada es la referencia sana: 85%.</p><canvas class="chart" id="ch-ret" style="height:150px"></canvas></div>';
 html+='<div class="card"><h3>Carga de repasos · próximos 14 días</h3><p class="muted">Tarjetas que vencen cada día si no repasas antes. La barra roja es lo ya pendiente hoy.</p><canvas class="chart" id="ch-due" style="height:150px"></canvas></div>';
 html+='<div class="card"><h3>Dominio por semana</h3><p class="muted">Porcentaje de tarjetas de cada semana con intervalo ≥7 días (memoria estable).</p>'+weekHeatmap(st)+'<div class="legend"><span><i style="background:var(--ink3)"></i>sin ver</span><span><i style="background:#3e8fb055"></i>&lt;25%</span><span><i style="background:#3e8fb0aa"></i>&lt;50%</span><span><i style="background:#f2a33c99"></i>&lt;75%</span><span><i style="background:#8fbf4dcc"></i>≥75%</span></div></div>';
 html+='<div class="card"><h3>Bitácora de repasos</h3><p class="muted">'+(st.log||[]).length+' repasos registrados (se conservan los últimos ~2000). Exporta el historial como CSV para hoja de cálculo o Anki.</p><button class="btn ghost wide" style="margin-top:10px" onclick="exportReviewCSV()" '+((st.log||[]).length?"":"disabled")+'>Descargar CSV</button></div>';
 $("#view").innerHTML=html;drawRetention(st);drawDueLoad(st)}
function drawRetention(st){const cv=$("#ch-ret");if(!cv||!cv.getContext)return;const ctx=cv.getContext("2d");const W2=cv.width=cv.offsetWidth*2,H2=cv.height=300;
 const e0=eday();const agg={};(st.log||[]).forEach(r=>{if(r[0]>e0-90){const k=e0-r[0];agg[k]=agg[k]||[0,0];agg[k][1]++;if(r[2]>0)agg[k][0]++}});
 const pts=[];for(let i=89;i>=0;i--){if(agg[i])pts.push([89-i,agg[i][0]/agg[i][1]])}
 if(!pts.length){ctx.fillStyle="#8b94a6";ctx.font="22px monospace";ctx.textAlign="center";ctx.fillText("Aún no hay repasos en la bitácora — empieza hoy.",W2/2,H2/2);return}
 const x=i=>10+i/89*(W2-20),y=p=>H2-26+((-p)*(H2-52));
 ctx.strokeStyle="rgba(139,148,166,.35)";ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(0,y(0.85));ctx.lineTo(W2,y(0.85));ctx.stroke();ctx.setLineDash([]);
 ctx.strokeStyle="#3e8fb0";ctx.lineWidth=3;ctx.beginPath();pts.forEach((p,ix)=>{ix?ctx.lineTo(x(p[0]),y(p[1])):ctx.moveTo(x(p[0]),y(p[1]))});ctx.stroke();
 ctx.fillStyle="#f2a33c";pts.forEach(p=>{ctx.beginPath();ctx.arc(x(p[0]),y(p[1]),4,0,7);ctx.fill()});
 ctx.fillStyle="#8b94a6";ctx.font="20px monospace";ctx.textAlign="left";ctx.fillText("hace 90 días",10,H2-6);ctx.textAlign="right";ctx.fillText("hoy",W2-10,H2-6);
 const last=pts[pts.length-1];ctx.fillStyle="#e9e4d8";ctx.fillText(Math.round(last[1]*100)+"%",W2-10,Math.max(20,y(last[1])-12))}
function drawDueLoad(st){const cv=$("#ch-due");if(!cv||!cv.getContext)return;const ctx=cv.getContext("2d");const W2=cv.width=cv.offsetWidth*2,H2=cv.height=300;
 const now=Date.now();const buckets=new Array(14).fill(0);
 Object.entries(st.cards).forEach(([id,c])=>{const card=BYID[id];if(!card||card.wk>st.week)return;const dd=Math.floor((c.due-now)/864e5);if(dd<0)buckets[0]++;else if(dd<14)buckets[dd]++});
 const max=Math.max(5,...buckets);const bw=W2/14;
 buckets.forEach((v,i)=>{const h=v/max*(H2-64);ctx.fillStyle=i===0?"#e05252":"#3e8fb0";ctx.beginPath();ctx.roundRect(i*bw+bw*0.2,H2-30-h,bw*0.6,Math.max(h,3),6);ctx.fill();
  ctx.fillStyle="#8b94a6";ctx.font="20px monospace";ctx.textAlign="center";ctx.fillText(i===0?"hoy":"+"+i,i*bw+bw/2,H2-8);
  if(v){ctx.fillStyle="#e9e4d8";ctx.fillText(v,i*bw+bw/2,H2-38-h)}})}
/* ================= VIEW: LEARN (SRS) ================= */
function renderLearn(){const due=dueCards().length,nw=Math.min(newCards().length,15);
 $("#view").innerHTML='<h2 class="sect"><small>Estudiar</small>El taller de memoria</h2>'
 +'<div class="card"><h3>Repaso (SRS)</h3><p class="muted">El sistema decide qué estás a punto de olvidar y te lo pone enfrente. Cada tarjeta tiene audio: escúchala, dila en voz alta, luego voltéala.</p><button class="btn wide" style="margin-top:10px" onclick="startReview()" '+(due?"":"disabled")+'>Repasar '+due+' pendientes</button></div>'
 +'<div class="card"><h3>Tarjetas nuevas</h3><p class="muted">Máximo 15 nuevas por día — la retención manda, no el ego. Desbloqueadas hasta la semana '+S.week+'.</p><button class="btn ghost wide" style="margin-top:10px" onclick="startNew()" '+(nw?"":"disabled")+'>Aprender '+nw+' nuevas</button></div>'
 +'<div class="card"><h3>Reparación</h3><p class="muted">Drill dirigido a tus fallas más repetidas. Aquí es donde se gana la fluidez de verdad.</p><button class="btn ghost wide" style="margin-top:10px" onclick="startRepair()">Reparar zonas débiles</button></div>'
 +'<div class="card"><h3>Cabina de sombra</h3><p class="muted">El método Pimsleur en casa: escucha la frase, imítala en voz alta al instante, iguala el ritmo. Es el ejercicio con mayor retorno por minuto de toda la app.</p><button class="btn ghost wide" style="margin-top:10px" onclick="startShadow()">Entrar a la cabina</button></div>'
 +'<div class="card"><h3>Conjugación</h3><p class="muted">12 verbos clave, cuatro tiempos, seis personas. Verás algo como <i>yo + tener + ayer</i>: dilo en voz alta, luego escribe la forma o elige entre opciones.</p><button class="btn ghost wide" style="margin-top:10px" onclick="startConj()">Practicar conjugación</button></div>'
 +'<div class="card"><h3>Diálogos</h3><p class="muted">Minidiálogos de dos voces con preguntas de comprensión. Escucha línea por línea a tu ritmo, luego responde.</p><button class="btn ghost wide" style="margin-top:10px" onclick="startListening()">Entrar a la cabina de escucha</button></div>'
 +'<div class="card"><h3>Historias</h3><p class="muted">Story Mode: seis cronicas graduadas, una por fase, narradas para ti. Escucha parrafo por parrafo y responde 5 preguntas. Es la capa de campana de tu aventura.</p><button class="btn ghost wide" style="margin-top:10px" onclick="startStories()">Entrar a Story Mode</button></div>';}
let Q=[],QI=0,QMODE="rev";
function startReview(){go("learn");Q=shuffle(dueCards());QMODE="rev";QI=0;if(!Q.length)return toast("Nada pendiente. Vuelve más tarde.");showCard()}
function startNew(){go("learn");const d=day();const room=Math.max(0,15-d.nw);Q=shuffle(newCards()).slice(0,room);QMODE="new";QI=0;if(!Q.length)return toast("Límite diario de nuevas alcanzado.");showCard()}
function showCard(){if(QI>=Q.length){$("#view").innerHTML='<div class="card" aria-live="polite" style="text-align:center;padding:34px 16px"><div class="bigscore">✓</div><h3>Sesión terminada</h3><p class="muted">'+Q.length+' tarjetas procesadas. La memoria a largo plazo se construye así: poco, seguido, para siempre.</p><button class="btn" style="margin-top:14px" onclick="renderLearn()">Volver</button></div>';if(Math.random()<0.5)buddy(pick(AN.win));renderHeader();return}
 const c=Q[QI];if(QMODE==="new"&&!S.cards[c.id])day().nw++;
 $("#view").innerHTML='<div class="q-meta"><span>'+(QI+1)+' / '+Q.length+'</span><span>'+esc(c.cat)+' · sem '+c.wk+'</span></div>'
 +'<div class="fc-stage"><div class="fc" id="fc" onclick="this.classList.toggle(\'flip\')"><div class="fc-face"><div class="fc-word es">'+esc(c.es)+'</div>'+(c.ex?'<div class="fc-sub">'+esc(c.ex)+'</div>':"")+'<button class="speak-ico" aria-label="Escuchar" onclick="event.stopPropagation();speak(BYID[\''+c.id+'\'].es)">♪</button><div class="fc-hint">di la respuesta en voz alta · toca para voltear</div></div><div class="fc-face back"><div class="fc-word">'+esc(c.en)+'</div><div class="fc-sub es">'+esc(c.es)+'</div></div></div></div>'
 +'<div class="srs-btns"><button class="b0" onclick="ans(0)">Otra vez<small>&lt;10 min</small></button><button class="b1" onclick="ans(1)">Difícil<small>~1 día</small></button><button class="b2" onclick="ans(2)">Bien<small>'+ivPreview(c.id,2)+'</small></button><button class="b3" onclick="ans(3)">Fácil<small>'+ivPreview(c.id,3)+'</small></button></div>';
 speak(c.es)}
function ivPreview(id,g){const st=S.cards[id];if(!st||st.iv===0)return g===2?"2 días":"4 días";const iv=g===2?Math.round(st.iv*st.e):Math.round(st.iv*st.e*1.35);return iv+" días"}
function ans(g){const c=Q[QI];grade(c.id,g);if(g===0){Q.splice(Math.min(QI+3,Q.length),0,c)}QI++;showCard()}
function startRepair(){go("learn");const weak=Object.entries(S.miss).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,10).map(x=>BYID[x[0]]).filter(Boolean);
 if(!weak.length)return toast("No hay zonas débiles. Increíble.");
 quizRun(shuffle(weak).map(c=>mcq(c)),"Reparación",(score,total)=>{addXP(score*4);buddy(score===total?pick(AN.win):pick(AN.fail))},true)}
