/* ================= DATA: BUDDY (Profesor Anselmo) ================= */
const AN={
greet:["¡Salve! Another day conquering the tongue of Cervantes... well, of Cantinflas, in our case.","Ah, you return. The codex was gathering dust. Ink is cheap; discipline is dear.","Buenos días, escudero. The words will not memorize themselves — believe me, I have asked them politely.","I once knew a man who studied only when motivated. He remains on week one to this day. En fin... ¡a trabajar!","¡Órale! You came back. My faith in humanity rises by approximately three percent."],
win:["¡Excelente! Had I a trumpet, I would sound it. Alas, I have only this scroll.","Correct! Somewhere in Mexico City, a taquero smiles and knows not why.","¡Así se hace! Your tongue grows sharper than my quill.","Magnífico. I shall record this triumph in the annals. The annals are a sticky note, but still."],
fail:["Incorrect — but fear not. Even the great scribes blotted their pages. Then they practiced.","Ay... no. But a wrong answer remembered burns brighter than a right one guessed.","Hmm. The word escaped you. Words do that. Hunt it down in the repair drills.","Wrong, but boldly wrong. I respect it. Once more."],
streak:["A streak! Consistency — rarer than a unicorn and twice as useful.","Your racha grows. Compound interest of the mind, amigo mío."],
test:["A test approaches. Breathe. You know more than you think — and I have seen what you think.","Examination time. Remember: hesitation is fine; silence is the only true error."],
nudge:["Psst. Five minutes of review now spares an hour of regret later. Old scribe's arithmetic.","The cards grow restless in their deck. They miss you. I do not — but they do."],
level:["¡Nivel superado! Your title improves. Your responsibilities, tragically, also.","A new rank! I shall polish your name in the ledger accordingly."]
};
const RANKS=["Peregrino","Aprendiz","Escudero","Callejero","Charlador","Cuate","Compadre","Cronista","Trovador","Erudito","Maestro","Leyenda del Barrio"];
const LV=[0,150,400,800,1400,2200,3200,4500,6000,8000,10500,13500];
const ACH=[
["r1","Primeras Palabras","Complete your first review",s=>s.stats.reviews>=1],
["r50","Cincuenta Cartas","50 reviews completed",s=>s.stats.reviews>=50],
["r300","Biblioteca Viva","300 reviews completed",s=>s.stats.reviews>=300],
["r1000","El Archivista","1000 reviews completed",s=>s.stats.reviews>=1000],
["s7","Semana de Hierro","7-day streak",s=>s.bestStreak>=7],
["s30","Mes de Acero","30-day streak",s=>s.bestStreak>=30],
["g1","Gladiador","Win your first arena game",s=>s.stats.games>=1],
["g25","Campeón de la Arena","25 arena games played",s=>s.stats.games>=25],
["t1","Primera Prueba","Pass your first weekly test",s=>s.weeksDone.length>=1],
["t13","Media Campaña","Pass 13 weekly tests",s=>s.weeksDone.length>=13],
["t26","El Examen Final","All 26 weeks conquered",s=>s.weeksDone.length>=26],
["sh10","Voz de Bronce","10 shadowing sessions",s=>s.stats.shadow>=10],
["l6","Cuate Oficial","Reach level 6",s=>lvlOf(s.xp)>=6],
["l12","Leyenda","Reach level 12",s=>lvlOf(s.xp)>=12],
["cj1","Verbo Domado","Complete your first conjugation round",s=>(s.stats.conj||0)>=1],
["cj200","Políglota Verbal","200 conjugations drilled",s=>(s.stats.conj||0)>=200],
["dlg1","Oído de Barrio","Complete your first dialogue",s=>(s.stats.dlg||0)>=1],
["dlg20","Maestro del Oído","20 dialogues completed",s=>(s.stats.dlg||0)>=20],
["st1","Primera Crónica","Complete your first Story Mode chapter",s=>(s.stats.story||0)>=1],
["st6","Cronista de Óralelandia","Read all 6 Story Mode chapters",s=>(s.storyDone||[]).length>=6],
["b1","Domador de Sonidos","Defeat the Phase 1 boss (El Trabalenguas)",s=>(s.bossDone||[]).includes(1)],
["b2","Amo de la Rutina","Defeat the Phase 2 boss (El Tragón)",s=>(s.bossDone||[]).includes(2)],
["b3","Rey de la Calle","Defeat the Phase 3 boss (El Chofer Fantasma)",s=>(s.bossDone||[]).includes(3)],
["b4","Voz de la Plaza","Defeat the Phase 4 boss (La Comadre)",s=>(s.bossDone||[]).includes(4)],
["b5","Señor del Albur","Defeat the Phase 5 boss (El Rey del Albur)",s=>(s.bossDone||[]).includes(5)],
["b6","Leyenda de Óralelandia","Defeat the final boss (La Duda)",s=>(s.bossDone||[]).includes(6)]
];
