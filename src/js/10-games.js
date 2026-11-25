/* ================= QUIZ CORE ================= */
function mcq(c,dir){dir=dir||(Math.random()<0.5?"e2n":"n2e");const wrong=shuffle(DECK.filter(x=>x.id!==c.id&&x.cat===c.cat)).slice(0,3);
 const q=dir==="e2n"?c.es:c.en;const right=dir==="e2n"?c.en:c.es;
 const opts=shuffle([right,...wrong.map(w=>dir==="e2n"?w.en:w.es)]);
 return{q:q,say:dir==="e2n"?c.es:null,opts:opts,a:opts.indexOf(right),id:c.id,es:c.es}}
function listenQ(c){const wrong=shuffle(DECK.filter(x=>x.id!==c.id)).slice(0,3);const opts=shuffle([c.en,...wrong.map(w=>w.en)]);
 return{q:"♪ (escucha)",say:c.es,listen:true,opts:opts,a:opts.indexOf(c.en),id:c.id,es:c.es}}
let QZ=null;
function quizRun(items,title,onEnd,trackRepair){QZ={items:items,i:0,score:0,title:title,onEnd:onEnd,rep:trackRepair};quizQ()}
function quizQ(){const z=QZ;if(!z)return;if(z.i>=z.items.length){const pct=Math.round(z.score/z.items.length*100);
 $("#view").innerHTML='<div class="card" aria-live="polite" style="text-align:center;padding:30px 16px"><div class="bigscore">'+z.score+'/'+z.items.length+'</div><h3>'+esc(z.title)+' · '+pct+'%</h3><button class="btn" style="margin-top:14px" onclick="go(VIEW)">Continuar</button></div>';
 z.onEnd(z.score,z.items.length);renderHeader();save();return}
 const it=z.items[z.i];
 $("#view").innerHTML='<div class="q-meta"><span>'+esc(z.title)+'</span><span>'+(z.i+1)+'/'+z.items.length+'</span></div>'
 +'<div class="q-word es">'+esc(it.q)+(it.say?' <button class="speak-ico" aria-label="Escuchar" onclick="speak(QZ.items[QZ.i].say)">♪</button>':"")+'</div>'
 +it.opts.map((o,i)=>'<button class="opt" onclick="quizAns('+i+',this)">'+esc(o)+'</button>').join("");
 if(it.listen)speak(it.say)}
function quizAns(i,el){const z=QZ;if(!z)return;const it=z.items[z.i];const btns=document.querySelectorAll(".opt");btns.forEach(b=>b.onclick=null);
 if(i===it.a){el.classList.add("right");z.score++;if(z.rep&&it.id&&S.miss[it.id])S.miss[it.id]=Math.max(0,S.miss[it.id]-1)}
 else{el.classList.add("wrong");btns[it.a].classList.add("right");if(it.id)S.miss[it.id]=(S.miss[it.id]||0)+1}
 setTimeout(()=>{z.i++;quizQ()},900)}
/* ================= VIEW: ARENA ================= */
function renderArena(){$("#view").innerHTML='<h2 class="sect"><small>Arena</small>Cinco minutos, una pelea</h2><p class="muted" style="margin-bottom:12px">Para los días sin tiempo: cada juego dura 2-4 minutos y cuenta para la misión diaria.</p>'
 +'<div class="card"><h3>⚔ Jefes de Fase</h3><p class="muted">Al final de cada fase te espera un guardián: examen mixto, a contrarreloj y con barra de vida. Derrótalo con 80% o más para ganar su insignia.</p><button class="btn wide" style="margin-top:10px" onclick="renderBossList()">Ver los seis jefes</button></div>'
 +'<div class="card"><h3>❧ Árbol de Habilidades</h3><p class="muted">Tus cinco ramas de poder — Vocabulario, Oído, Voz, Gramática y Callejero — suben solas con todo lo que practicas.</p><button class="btn ghost wide" style="margin-top:10px" onclick="renderSkillTree()">Ver mi árbol</button></div>'
 +'<div class="grid2">'
 +gt("Rayo","45 segundos, traducciones a máxima velocidad. Puro reflejo.","+2 XP por acierto","gameRayo()")
 +gt("Oído","Escucha la palabra, elige el significado. Entrena el radar.","+4 XP por acierto","gameOido()")
 +gt("Trampa","Falsos amigos: palabras que parecen inglés y te traicionan.","+4 XP por acierto","gameTrampa()")
 +gt("Constructor","Arma la frase mexicana con las piezas en orden.","+10 XP por frase","gameBuild()")
 +gt("¿Amigo o Traidor?","¿Cognado gratis o falso amigo? Decide en un segundo.","+3 XP por acierto","gameCog()")
 +gt("Asalto de Memoria","5 tarjetas viejas al azar. ¿Siguen contigo?","+5 XP por acierto","memoryRaid(true)")
 +'</div>';}
function gt(t,d,x,fn){return '<div class="game-tile" onclick="'+fn+'"><div class="gt">'+t+'</div><div class="gd">'+d+'</div><div class="gx">'+x+'</div></div>'}
function gameDone(name,score,total,xpPer){S.stats.games++;day().game++;addXP(score*xpPer);questCheck();checkAch()}
function gameRayo(){const pool=shuffle(knownCards().length>=10?knownCards():unlocked()).slice(0,40);let i=0,score=0,t=45,tm=null;const gen=NAVGEN;
 function tick(){if(gen!==NAVGEN)return;t--;const b=$("#tbar");if(b)b.style.width=(t/45*100)+"%";if(t<=0)end();else tm=setTimeout(tick,1000)}
 function q(){if(gen!==NAVGEN)return;if(i>=pool.length)return end();const c=pool[i];const item=mcq(c);
  $("#view").innerHTML='<div class="q-meta"><span>RAYO</span><span>'+score+' pts</span></div><div class="timerbar"><i id="tbar" style="width:'+(t/45*100)+'%"></i></div><div class="q-word es">'+esc(item.q)+'</div>'+item.opts.map((o,j)=>'<button class="opt" onclick="window.__rayo('+j+','+item.a+')">'+esc(o)+'</button>').join("")}
 window.__rayo=(j,a)=>{if(gen!==NAVGEN)return;if(j===a)score++;else{const c=pool[i];S.miss[c.id]=(S.miss[c.id]||0)+1}i++;q()};
 function end(){clearTimeout(tm);window.__rayo=null;$("#view").innerHTML='<div class="card" aria-live="polite" style="text-align:center;padding:30px"><div class="bigscore">'+score+'</div><h3>Rayo terminado</h3><p class="muted">+'+score*2+' XP</p><button class="btn" style="margin-top:12px" onclick="renderArena()">Volver</button></div>';gameDone("rayo",score,i,2)}
 q();tm=setTimeout(tick,1000)}
function gameOido(){const pool=shuffle(unlocked()).slice(0,8);quizRun(pool.map(c=>listenQ(c)),"Oído",(s,t)=>gameDone("oido",s,t,4),true)}
function gameTrampa(){const pool=shuffle(FF).slice(0,8);const items=pool.map(f=>{const wrong=shuffle(FF.filter(x=>x!==f)).slice(0,2).map(x=>x[2]);const opts=shuffle([f[2],f[1],...wrong.slice(0,2)]);return{q:f[0],opts:opts,a:opts.indexOf(f[2])}});
 quizRun(items,"Trampa · ¿qué significa de verdad?",(s,t)=>gameDone("trampa",s,t,4))}
function gameCog(){const items=shuffle([...shuffle(CG).slice(0,6).map(w=>({w:w,cog:true})),...shuffle(FF).slice(0,6).map(f=>({w:f[0],cog:false,real:f[2]}))]);let i=0,score=0;
 function q(){if(i>=items.length){$("#view").innerHTML='<div class="card" aria-live="polite" style="text-align:center;padding:30px"><div class="bigscore">'+score+'/12</div><h3>¿Amigo o Traidor?</h3><button class="btn" style="margin-top:12px" onclick="renderArena()">Volver</button></div>';gameDone("cog",score,12,3);return}
  const it=items[i];$("#view").innerHTML='<div class="q-meta"><span>¿AMIGO O TRAIDOR?</span><span>'+(i+1)+'/12 · '+score+' pts</span></div><div class="q-word es">'+esc(it.w)+'</div><p class="muted" style="text-align:center;margin-bottom:14px">¿Significa lo mismo que en inglés?</p><div class="grid2"><button class="btn" onclick="window.__cog(true)">Amigo (igual)</button><button class="btn ghost" onclick="window.__cog(false)">Traidor (falso)</button></div>';}
 window.__cog=(g)=>{const it=items[i];if(g===it.cog){score++;toast(it.cog?"Sí: gratis.":"Traidor: significa "+it.real)}else{toast(it.cog?"Era amigo: significa lo mismo.":"¡Traición! Significa: "+it.real)}i++;q()};q()}
function gameBuild(){const pool=shuffle(PH.filter(p=>p[0]<=S.week&&p[1].split(" ").length>=4)).slice(0,5);let i=0,score=0,out=[];const gen=NAVGEN;
 function q(){if(gen!==NAVGEN)return;if(i>=pool.length){window.__bt=null;$("#view").innerHTML='<div class="card" aria-live="polite" style="text-align:center;padding:30px"><div class="bigscore">'+score+'/5</div><h3>Constructor</h3><button class="btn" style="margin-top:12px" onclick="renderArena()">Volver</button></div>';gameDone("build",score,5,10);return}
  out=[];const p=pool[i];const words=p[1].replace(/[¿¡]/g,"").split(" ");const tiles=shuffle(words.map((w,j)=>({w:w,j:j})));
  /* window callbacks below are gen-guarded via the closure check in q() (S13) */
  window.__bt=(k)=>{const t=tiles[k];if(t.used)return;t.used=true;out.push(t.w);draw(tiles,p)};
  window.__bres=()=>{tiles.forEach(t=>t.used=false);out=[];draw(tiles,p)};
  window.__bok=()=>{const target=p[1].replace(/[¿¡]/g,"");const ok=out.join(" ")===target;if(ok){score++;speak(p[1]);toast("¡Exacto!")}else toast("Era: "+p[1]);i++;setTimeout(q,ok?700:1600)};
  function draw(tiles,p){$("#view").innerHTML='<div class="q-meta"><span>CONSTRUCTOR</span><span>'+(i+1)+'/5</span></div><p class="muted" style="text-align:center">'+esc(p[2])+'</p><div class="build-out">'+out.map(w=>'<span class="tile">'+esc(w)+'</span>').join("")+'</div><div class="tiles">'+tiles.map((t,k)=>'<button class="tile" '+(t.used?"disabled":"")+' onclick="window.__bt('+k+')">'+esc(t.w)+'</button>').join("")+'</div><div class="grid2"><button class="btn ghost" onclick="window.__bres()">Reiniciar</button><button class="btn" onclick="window.__bok()">Confirmar</button></div>';}
  draw(tiles,p)}
 q()}
function memoryRaid(manual){const m=masteredCards();if(m.length<5){if(manual)toast("Aún no tienes 5 tarjetas dominadas.");return}
 const pool=shuffle(m).slice(0,5);buddy("¡Asalto de memoria! Veamos qué sobrevivió al olvido...");
 quizRun(pool.map(c=>mcq(c)),"Asalto de Memoria",(s,t)=>{addXP(s*5);if(s<t){pool.forEach(c=>{const st=S.cards[c.id];if(st){st.iv=Math.max(3,Math.round(st.iv/2));st.due=Date.now()+st.iv*864e5}});save()}},true)}
/* ================= WEEKLY TEST ================= */
function weekTest(n){buddy(pick(AN.test));const wk=DECK.filter(c=>c.wk===n);const vocabQ=shuffle(wk).slice(0,8).map(c=>mcq(c));
 const lisQ=shuffle(wk).slice(0,2).map(c=>listenQ(c));
 const gq=shuffle(GQ.filter(g=>g.w<=n&&g.w>n-6)).slice(0,2).map(g=>({q:g.q,opts:g.o,a:g.a}));
 quizRun(shuffle([...vocabQ,...lisQ,...gq]),"Examen · Semana "+n,(s,t)=>{const pct=s/t;
  if(pct>=0.75){if(!S.weeksDone.includes(n))S.weeksDone.push(n);S.week=Math.max(S.week,Math.min(26,n+1));S.stats.tests++;addXP(80);addPesos(30);toast("Semana "+n+" superada · +80 XP");buddy(pick(AN.win)+" La semana "+(n+1<=26?n+1+" te espera.":"final... ha llegado."))}
  else{buddy(pick(AN.fail)+" Repara tus zonas débiles y vuelve al examen.")}
  save()},true)}
/* ================= BOSS BATTLES & SKILL TREE (S9) ================= */
const BOSSWK=[4,8,13,18,22,26];
const BOSSES=[
 {ph:1,name:"El Trabalenguas",sub:"Guardián de los Sonidos y las Frases de Auxilio",
  intro:"The Guardian of Sounds bars the gate. His armor is five pure vowels — pierce it with clean pronunciation, escudero.",
  taunt:["¡Ja! A vowel slips from your grasp.","Your tongue trembles... press on!","Not bad for a peregrino."],
  defeat:"The Guardian dissolves into five clean vowels: a, e, i, o, u. Phase 1 is yours."},
 {ph:2,name:"El Tragón",sub:"Devorador de Rutinas y Taquerías",
  intro:"El Tragón has eaten every verb in the kitchen. Feed him the right conjugation or be the next dish.",
  taunt:["¡Más rápido, o te como!","Mmm, a mistake — delicious.","You cook with words. I respect that."],
  defeat:"El Tragón pushes away his plate, defeated and full. Phase 2 conquered."},
 {ph:3,name:"El Chofer Fantasma",sub:"Espectro de las Calles y del Pretérito",
  intro:"The Ghost Driver knows every street and every yesterday. Navigate his past tense or stay lost forever.",
  taunt:["¡Dabas vuelta donde no era!","The past does not forgive easily.","You found the corner. Barely."],
  defeat:"The Ghost Driver tips his hat and fades into the traffic. Phase 3 is behind you."},
 {ph:4,name:"La Comadre",sub:"Reina de las Opiniones y el Chisme",
  intro:"La Comadre has an opinion about everything, especially your Spanish. Out-argue her — with feeling.",
  taunt:["¡Ay, no estoy de acuerdo!","La neta, esa estuvo débil.","Hmph. You have a point."],
  defeat:"La Comadre nods, impressed, and spreads word that you can hold a conversation. Phase 4 done."},
 {ph:5,name:"El Rey del Albur",sub:"Monarca de la Jerga y el Doble Sentido",
  intro:"The King of Albures speaks in traps and punchlines. Read the street or become the joke, güey.",
  taunt:["¡No manches, casi!","Órale, that one you got.","¿Cómo crees? Try again."],
  defeat:"The King of Albures laughs and calls you cuate. Phase 5 — you speak like the barrio now."},
 {ph:6,name:"La Duda",sub:"El Jefe Final — tu propia voz interior",
  intro:"The last boss is La Duda: your own doubt, wearing your face. Everything you learned answers here. ¡Vámonos!",
  taunt:["\"You'll never sound native\" — she whispers.","Silence her with an answer.","She flickers. Keep going."],
  defeat:"La Duda vanishes. In her place, a mirror: you, speaking Spanish. Óralelandia is conquered, Leyenda."}
];
let BOSS=null,BOSST=null;
function bossUnlocked(ph){return S.week>=BOSSWK[ph-1]}
function startBossArena(){renderBossList()}
function renderBossList(){var html='<h2 class="sect"><small>Jefes de Fase</small>Seis batallas, seis insignias</h2>'
 +'<div class="marginalia">Anselmo: cada fase termina con un guardián. Examen mixto, a contrarreloj, con barra de vida. Vence con 80% o más para arrancarle su insignia.</div>';
 html+=BOSSES.map(function(b){var un=bossUnlocked(b.ph);var done=(S.bossDone||[]).includes(b.ph);var best=(S.bossBest||{})[b.ph];
  return '<div class="card"'+(un?"":' style="opacity:.55"')+'><h3>⚔ '+esc(b.name)+' <span class="tag">fase '+b.ph+'</span>'+(done?' <span class="tag" style="border-color:var(--lima);color:var(--lima)">✓ vencido</span>':"")+'</h3><p class="muted">'+esc(b.sub)+'</p>'+(un?'<button class="btn '+(done?"ghost ":"")+'wide" style="margin-top:8px" onclick="startBoss('+b.ph+')">'+(done?"Repetir batalla":"Pelear")+'</button>'+(best?'<p class="muted" style="margin-top:6px;font-size:.75rem">Mejor: '+best+'/10</p>':""):'<p class="muted" style="margin-top:6px">Sellado hasta la semana '+BOSSWK[b.ph-1]+'.</p>')+'</div>';
 }).join("");
 $("#view").innerHTML=html}
function bossConj(wkMax){var vi=Math.floor(Math.random()*CJ.length);var tenses=[0];if(wkMax>=5)tenses.push(3);if(wkMax>=11){tenses.push(1);tenses.push(2)}var ti=pick(tenses);var pi=Math.floor(Math.random()*6);var v=CJ[vi];var ans=v[2+ti][pi];
 var pool=[];for(var t=0;t<4;t++)for(var p=0;p<6;p++){var f=v[2+t][p];if(f!==ans&&pool.indexOf(f)<0)pool.push(f)}pool=shuffle(pool).slice(0,3);var opts=shuffle([ans].concat(pool));
 return{q:PERSONS[pi]+" + "+v[0]+" + "+pick(TENSE_CUES[ti]),opts:opts,a:opts.indexOf(ans),skill:"Gramática"}}
function buildBossItems(ph){var wkMax=BOSSWK[ph-1];var pool=DECK.filter(function(c){return c.wk<=wkMax});var items=[];
 shuffle(pool).slice(0,4).forEach(function(c){items.push(Object.assign(mcq(c),{skill:"Vocabulario"}))});
 shuffle(pool).slice(0,2).forEach(function(c){items.push(Object.assign(listenQ(c),{skill:"Oído"}))});
 shuffle(GQ.filter(function(g){return g.w<=wkMax})).slice(0,2).forEach(function(g){items.push({q:g.q,opts:g.o,a:g.a,skill:"Gramática"})});
 if(wkMax>=5){for(var n=0;n<2;n++)items.push(bossConj(wkMax))}
 shuffle(FF).slice(0,1).forEach(function(f){var opts=shuffle([f[2],f[1]].concat(shuffle(FF.filter(function(x){return x!==f})).slice(0,2).map(function(x){return x[2]}))).slice(0,4);if(opts.indexOf(f[2])<0)opts[0]=f[2];items.push({q:'¿Qué significa de verdad "'+f[0]+'"?',opts:opts,a:opts.indexOf(f[2]),skill:"Callejero"})});
 if(wkMax>=19){shuffle(SL).slice(0,1).forEach(function(s){var opts=shuffle([s[1]].concat(shuffle(SL.filter(function(x){return x!==s})).slice(0,3).map(function(x){return x[1]})));items.push({q:'En México, "'+s[0].split(" / ")[0]+'" quiere decir...',opts:opts,a:opts.indexOf(s[1]),skill:"Callejero"})})}
 items=shuffle(items).slice(0,10);
 while(items.length<10){items.push(Object.assign(mcq(pick(pool)),{skill:"Vocabulario"}))}
 return items}
function bossBars(z){var b=BOSSES[z.ph-1];
 return '<div class="bar-row"><div class="bl"><span>Tú</span><b>'+z.php+'</b></div><div class="bar"><i style="width:'+z.php+'%;background:var(--lima)"></i></div></div>'
 +'<div class="bar-row"><div class="bl"><span>'+esc(b.name)+'</span><b>'+z.bhp+'</b></div><div class="bar"><i style="width:'+z.bhp+'%;background:var(--rojo)"></i></div></div>'}
function startBoss(ph){if(!bossUnlocked(ph))return toast("Este jefe aún está sellado.");var b=BOSSES[ph-1];BOSS={ph:ph,items:buildBossItems(ph),i:0,score:0,php:100,bhp:100,tmax:15,t:15};buddy("⚔ "+b.intro);bossQ()}
function bossTick(){if(!BOSS)return;BOSS.t--;var bar=$("#btbar");if(bar)bar.style.width=(BOSS.t/BOSS.tmax*100)+"%";if(BOSS.t<=0){clearInterval(BOSST);bossHit(-1)}}
function bossQ(){var z=BOSS;if(!z)return;if(z.i>=z.items.length||z.bhp<=0||z.php<=0)return bossEnd();
 var it=z.items[z.i],b=BOSSES[z.ph-1];z.t=z.tmax;clearInterval(BOSST);
 $("#view").innerHTML='<div class="q-meta"><span>JEFE · '+esc(b.name)+'</span><span>'+(z.i+1)+'/'+z.items.length+' · '+z.score+' aciertos</span></div>'
 +bossBars(z)
 +'<div class="timerbar" style="margin-top:10px"><i id="btbar" style="width:100%"></i></div>'
 +'<div class="tag">'+esc(it.skill||"reto")+'</div>'
 +'<div class="q-word es">'+esc(it.q)+(it.say?' <button class="speak-ico" aria-label="Escuchar" onclick="speak(BOSS.items[BOSS.i].say)">♪</button>':"")+'</div>'
 +it.opts.map(function(o,j){return '<button class="opt" onclick="window.__boss('+j+')">'+esc(o)+'</button>'}).join("");
 if(it.listen)speak(it.say);BOSST=setInterval(bossTick,1000)}
window.__boss=function(j){bossHit(j)};
function bossHit(j){var z=BOSS;if(!z)return;clearInterval(BOSST);var it=z.items[z.i],b=BOSSES[z.ph-1];
 var btns=document.querySelectorAll(".opt");btns.forEach(function(x){x.onclick=null});
 if(j===it.a){z.score++;z.bhp=Math.max(0,z.bhp-13);if(it.id&&S.miss[it.id])S.miss[it.id]=Math.max(0,S.miss[it.id]-1);if(j>=0&&btns[j])btns[j].classList.add("right");if(Math.random()<0.5)buddy(pick(b.taunt))}
 else{z.php=Math.max(0,z.php-34);if(it.id)S.miss[it.id]=(S.miss[it.id]||0)+1;if(j>=0&&btns[j])btns[j].classList.add("wrong");if(btns[it.a])btns[it.a].classList.add("right");buddy(pick(b.taunt))}
 z.i++;setTimeout(bossQ,750)}
function bossEnd(){var z=BOSS;if(!z)return;clearInterval(BOSST);var b=BOSSES[z.ph-1],total=z.items.length,pct=z.score/total,win=pct>=0.8;
 if(win){S.bossDone=S.bossDone||[];if(!S.bossDone.includes(z.ph))S.bossDone.push(z.ph);S.bossBest=S.bossBest||{};S.bossBest[z.ph]=Math.max(S.bossBest[z.ph]||0,z.score);addXP(z.score*10+40);addPesos(50);buddy("⚔ "+b.defeat);checkAch()}
 else buddy(pick(AN.fail)+" El jefe sigue en pie. Repara tus zonas débiles y vuelve.");
 $("#view").innerHTML='<div class="card" aria-live="polite" style="text-align:center;padding:26px 16px;border-color:'+(win?"var(--lima)":"var(--rojo)")+'"><div class="bigscore" style="color:'+(win?"var(--lima)":"var(--rojo)")+'">'+(win?"¡VICTORIA!":"DERROTA")+'</div><h3>'+esc(b.name)+'</h3><p class="muted">'+z.score+'/'+total+' aciertos · '+Math.round(pct*100)+'%'+(win?" · insignia obtenida":" · necesitas 80%")+'</p>'+bossBars(z)+'<div class="grid2" style="margin-top:14px"><button class="btn ghost" onclick="renderBossList()">Jefes</button><button class="btn" onclick="startBoss('+z.ph+')">Otra vez</button></div></div>';
 renderHeader();save();BOSS=null}
function knownSlang(){return knownCards().filter(function(c){return c.cat==="Jerga"||c.cat==="Dichos"}).length}
function skillTree(){var mast=masteredCards().length;
 var branches=[
  {k:"Vocabulario",g:"◆",v:mast,u:"palabras dominadas",th:[0,10,40,100,200,350]},
  {k:"Oído",g:"♪",v:(S.stats.dlg||0)+(S.stats.story||0),u:"diálogos + historias",th:[0,1,4,10,18,26]},
  {k:"Voz",g:"◎",v:(S.stats.shadow||0),u:"reps de sombra",th:[0,5,20,50,100,180]},
  {k:"Gramática",g:"✎",v:(S.stats.conj||0),u:"conjugaciones",th:[0,10,50,120,250,400]},
  {k:"Callejero",g:"⚑",v:knownSlang(),u:"jerga y dichos",th:[0,3,10,20,35,50]}
 ];
 branches.forEach(function(b){var lv=0;for(var i=0;i<b.th.length;i++){if(b.v>=b.th[i])lv=i}b.lv=Math.min(lv,5);b.nextAt=b.th[Math.min(b.lv+1,5)]});
 return branches}
function renderSkillTree(){var br=skillTree();var totalLv=br.reduce(function(a,b){return a+b.lv},0);
 var html='<h2 class="sect"><small>Árbol de Habilidades</small>Tus cinco ramas de poder</h2>'
 +'<div class="card"><div class="spread"><span class="muted">Poder total del héroe</span><b style="font-family:var(--ff-mono);color:var(--mari);font-size:1.1rem">'+totalLv+'/25</b></div></div>'
 +'<div class="sktree">'+br.map(function(b){var nodes="";for(var i=1;i<=5;i++)nodes+='<span class="node'+(i<=b.lv?" on":"")+'"></span>';
   return '<div class="branch"><div class="br-h"><span class="br-ico">'+b.g+'</span><span class="br-name">'+b.k+'</span><span class="br-lv">nivel '+b.lv+'/5</span></div><div class="nodes">'+nodes+'</div><div class="br-sub muted">'+b.v+' '+b.u+(b.lv<5?' · próximo nivel a '+b.nextAt:' · ¡rama máxima!')+'</div></div>'}).join("")+'</div>'
 +'<div class="marginalia" style="margin-top:12px">Anselmo: no se sube de nivel estudiando el árbol, sino regando sus raíces — repasa, escucha, habla, conjuga y callejea.</div>'
 +'<button class="btn ghost wide" style="margin-top:12px" onclick="renderArena()">Volver a la Arena</button>';
 $("#view").innerHTML=html}
