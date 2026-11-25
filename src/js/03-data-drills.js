/* ================= DATA: FALSE FRIENDS [es, looks like, actually means] ================= */
const FF=[
["embarazada","embarrassed","pregnant"],["éxito","exit","success"],["ropa","rope","clothes"],["sopa","soap","soup"],
["carpeta","carpet","folder"],["actualmente","actually","currently"],["realizar","to realize","to carry out"],["asistir","to assist","to attend"],
["atender","to attend","to serve / look after"],["librería","library","bookstore (library = biblioteca)"],["fábrica","fabric","factory"],["sensible","sensible","sensitive"],
["molestar","to molest","to bother / annoy"],["pretender","to pretend","to intend / to woo"],["recordar","to record","to remember"],["soportar","to support","to tolerate / endure"],
["largo","large","long"],["lectura","lecture","reading"],["suceso","success","event / incident"],["colegio","college","school (K-12)"],
["compromiso","compromise","commitment / engagement"],["contestar","to contest","to answer"],["decepción","deception","disappointment"],["delito","delight","crime"],
["introducir","to introduce (people)","to insert (people = presentar)"],["pariente","parent","relative"],["sano","sane","healthy"],["tuna","tuna fish","prickly pear (tuna fish = atún)"],
["vaso","vase","drinking glass"],["campo","camp","field / countryside"],["billón","billion","trillion (billion = mil millones)"],["once","once","eleven"],
["pie","pie","foot"],["red","red","net / network"],["sin","sin","without"],["pan","pan","bread"],
["taller","taller","workshop / repair shop"],["mole","mole (animal)","the legendary Mexican sauce"],["dice","dice","he/she says"],["arena","arena","sand"]
];
/* ================= DATA: COGNATES (free vocabulary) ================= */
const CG=["actor","animal","hospital","hotel","idea","chocolate","doctor","color","final","natural","popular","radio","taxi","tropical","banana","cereal","crisis","drama","error","familiar","festival","gas","general","horrible","metal","motor","musical","normal","original","panorama","plan","plaza","simple","terror","total","verbal","virus","criminal","digital","festival","tequila"];
/* ================= DATA: FUN FACTS ================= */
const FX=[
"Spanish is phonetic: once you know the letter sounds, you can pronounce any word you read. English cannot say the same (cough, though, through...).",
"The upside-down ¿ and ¡ are early warnings — they tell you to set your intonation before the sentence starts. Genuinely useful when reading aloud.",
"'Ahorita' can mean now, in ten minutes, or never. Mexicans navigate this with pure context. You will too.",
"Mexicans answer the phone with '¿Bueno?' — a leftover from early telephone days, when operators asked if the line was good.",
"Spanish has two verbs for 'to know': saber (facts, skills) and conocer (people, places). English merged them; Spanish kept the receipts.",
"The letter W barely exists in Spanish — only in loanwords like whisky, web y waffle.",
"Mexico is the largest Spanish-speaking country on Earth — more speakers than Spain, Colombia or Argentina.",
"Nahuatl (the Aztec language) gave the world: chocolate, tomate, aguacate, coyote, chicle and chile. You already speak some Nahuatl.",
"'Esposas' means both 'wives' and 'handcuffs'. Spanish speakers find this equally funny.",
"Days, months and languages are NOT capitalized in Spanish: lunes, enero, español.",
"Answering '¿Mande?' instead of '¿Qué?' is uniquely Mexican — it descends from colonial '¿qué manda usted?' (what do you command?).",
"Mexico uses 'ustedes' for all of you-plural. The 'vosotros' form is Spain-only — that's an entire conjugation you get to skip.",
"The ñ was born as medieval scribes' shorthand: 'anno' (year) written with one n and a tilde became 'año'.",
"Spanish speakers HAVE hunger, thirst, fear and years: tengo hambre, tengo 36 años. You don't feel 36 — you own 36.",
"Double negatives are grammatically correct: 'No vi nada' (I didn't see nothing) is perfect Spanish.",
"'Desvelado' — a single word for 'tired because you stayed up too late'. English needs a whole sentence.",
"'Sobremesa' is the lingering table conversation after a meal ends. The word exists because the tradition is sacred.",
"Order carefully: in Mexico a 'torta' is a sandwich, in Spain it's a cake, in Argentina it's a slap.",
"One R vs two changes everything: pero (but) / perro (dog), caro (expensive) / carro (car). Roll responsibly.",
"'Estrenar' — to wear or use something for the very first time. No English equivalent exists.",
"Mexican Spanish puts diminutives on everything, even adverbs: ahorita, lueguito, tantito. It softens the whole language.",
"'Tocayo' — the word for a person who shares your first name. English never bothered to invent one."
];
/* ================= DATA: GRAMMAR QUIZ [week, q, options, answerIdx] ================= */
const GQ=[
{w:2,q:"___ ingeniero de la India.",o:["Soy","Estoy","Es","Está"],a:0},
{w:2,q:"___ muy cansado hoy.",o:["Soy","Estoy","Eres","Ser"],a:1},
{w:3,q:"Son ___ tres de la tarde.",o:["los","las","la","el"],a:1},
{w:4,q:"¿___ cuesta la camisa?",o:["Cómo","Cuál","Cuánto","Quién"],a:2},
{w:5,q:"Mañana ___ a trabajar temprano.",o:["voy","va","vas","ir"],a:0},
{w:5,q:"___ 36 años.",o:["Soy","Estoy","Tengo","Hago"],a:2},
{w:5,q:"No ___ ir hoy, estoy ocupado.",o:["puedes","puedo","poder","pueden"],a:1},
{w:6,q:"Me ___ mucho los tacos.",o:["gusta","gustan","gusto","gustar"],a:1},
{w:7,q:"La casa es ___.",o:["blanco","blancos","blanca","blanc"],a:2},
{w:8,q:"___ levanto a las seis todos los días.",o:["Yo","Me","Mi","Se"],a:1},
{w:9,q:"___ un banco cerca de aquí.",o:["Está","Es","Hay","Tiene"],a:2},
{w:10,q:"Esta camisa es más barata ___ esa.",o:["de","como","que","por"],a:2},
{w:11,q:"Ayer ___ al mercado con mi esposa.",o:["voy","fui","iba","va"],a:1},
{w:12,q:"Cuando ___ niño, jugaba fútbol.",o:["fui","era","soy","estaba"],a:1},
{w:13,q:"Me ___ mucho la espalda.",o:["duele","duelen","dolor","doler"],a:0},
{w:14,q:"Creo ___ tienes razón.",o:["de","qué","que","si"],a:2},
{w:15,q:"Hace mucho ___ hoy en Houston.",o:["caliente","calor","caluroso","cálido"],a:1},
{w:16,q:"¿Compraste el libro? — Sí, ___ compré ayer.",o:["le","la","lo","se"],a:2},
{w:17,q:"___ cinco años viviendo en Texas.",o:["Tengo","Llevo","Hago","Estoy"],a:1},
{w:18,q:"Me dijo ___ no podía venir.",o:["qué","de que","que","como"],a:2},
{w:19,q:"___ está lloviendo, vamos a salir.",o:["Porque","Aunque","Como","Según"],a:1},
{w:21,q:"Espero que ___ bien, amigo.",o:["estás","eres","estés","seas"],a:2},
{w:23,q:"¿Me lo repites más ___, por favor?",o:["despacio","rápido","fuerte","tarde"],a:0},
{w:24,q:"Si ___ más dinero, viajaría a México.",o:["tengo","tuve","tenía","tuviera"],a:3}
];
/* ================= DATA: CONJUGATION [verb, en, pres[6], pret[6], imp[6], irA-future[6]] ================= */
/* persons order (Latin-American, no vosotros): yo · tú · él/ella/usted · nosotros · ustedes · ellos/ellas */
const PERSONS=["yo","tú","él/ella/usted","nosotros","ustedes","ellos/ellas"];
const TENSE_NAMES=["Presente","Pretérito","Imperfecto","Ir + a + infinitivo"];
const TENSE_CUES=[
["hoy","siempre","normalmente","los lunes","cada día"],
["ayer","anoche","la semana pasada","el año pasado","hace un rato"],
["de niño","antes","en aquellos tiempos","cuando vivía en México","todos los veranos"],
["mañana","el próximo mes","pronto","la próxima semana","este fin de semana"]];
const CJ=[
["ser","to be",["soy","eres","es","somos","son","son"],["fui","fuiste","fue","fuimos","fueron","fueron"],["era","eras","era","éramos","eran","eran"],["voy a ser","vas a ser","va a ser","vamos a ser","van a ser","van a ser"]],
["estar","to be (state/location)",["estoy","estás","está","estamos","están","están"],["estuve","estuviste","estuvo","estuvimos","estuvieron","estuvieron"],["estaba","estabas","estaba","estábamos","estaban","estaban"],["voy a estar","vas a estar","va a estar","vamos a estar","van a estar","van a estar"]],
["tener","to have",["tengo","tienes","tiene","tenemos","tienen","tienen"],["tuve","tuviste","tuvo","tuvimos","tuvieron","tuvieron"],["tenía","tenías","tenía","teníamos","tenían","tenían"],["voy a tener","vas a tener","va a tener","vamos a tener","van a tener","van a tener"]],
["ir","to go",["voy","vas","va","vamos","van","van"],["fui","fuiste","fue","fuimos","fueron","fueron"],["iba","ibas","iba","íbamos","iban","iban"],["voy a ir","vas a ir","va a ir","vamos a ir","van a ir","van a ir"]],
["querer","to want",["quiero","quieres","quiere","queremos","quieren","quieren"],["quise","quisiste","quiso","quisimos","quisieron","quisieron"],["quería","querías","quería","queríamos","querían","querían"],["voy a querer","vas a querer","va a querer","vamos a querer","van a querer","van a querer"]],
["poder","to be able / can",["puedo","puedes","puede","podemos","pueden","pueden"],["pude","pudiste","pudo","pudimos","pudieron","pudieron"],["podía","podías","podía","podíamos","podían","podían"],["voy a poder","vas a poder","va a poder","vamos a poder","van a poder","van a poder"]],
["hacer","to do / make",["hago","haces","hace","hacemos","hacen","hacen"],["hice","hiciste","hizo","hicimos","hicieron","hicieron"],["hacía","hacías","hacía","hacíamos","hacían","hacían"],["voy a hacer","vas a hacer","va a hacer","vamos a hacer","van a hacer","van a hacer"]],
["decir","to say / tell",["digo","dices","dice","decimos","dicen","dicen"],["dije","dijiste","dijo","dijimos","dijeron","dijeron"],["decía","decías","decía","decíamos","decían","decían"],["voy a decir","vas a decir","va a decir","vamos a decir","van a decir","van a decir"]],
["saber","to know (facts)",["sé","sabes","sabe","sabemos","saben","saben"],["supe","supiste","supo","supimos","supieron","supieron"],["sabía","sabías","sabía","sabíamos","sabían","sabían"],["voy a saber","vas a saber","va a saber","vamos a saber","van a saber","van a saber"]],
["poner","to put",["pongo","pones","pone","ponemos","ponen","ponen"],["puse","pusiste","puso","pusimos","pusieron","pusieron"],["ponía","ponías","ponía","poníamos","ponían","ponían"],["voy a poner","vas a poner","va a poner","vamos a poner","van a poner","van a poner"]],
["venir","to come",["vengo","vienes","viene","venimos","vienen","vienen"],["vine","viniste","vino","vinimos","vinieron","vinieron"],["venía","venías","venía","veníamos","venían","venían"],["voy a venir","vas a venir","va a venir","vamos a venir","van a venir","van a venir"]],
["dar","to give",["doy","das","da","damos","dan","dan"],["di","diste","dio","dimos","dieron","dieron"],["daba","dabas","daba","dábamos","daban","daban"],["voy a dar","vas a dar","va a dar","vamos a dar","van a dar","van a dar"]]
];
