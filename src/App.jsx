import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, get, onValue, remove } from "firebase/database";

// ── FIREBASE ──────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCM09kDCrUzzHMh7roibcT6__YslHeaT_M",
  authDomain: "gainz-app-ede1c.firebaseapp.com",
  projectId: "gainz-app-ede1c",
  storageBucket: "gainz-app-ede1c.firebasestorage.app",
  messagingSenderId: "1071859283654",
  appId: "1:1071859283654:web:c5272227b8d54bcde7c9c7",
  databaseURL: "https://gainz-app-ede1c-default-rtdb.europe-west1.firebasedatabase.app"
};
const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = getDatabase(fbApp);
const provider = new GoogleAuthProvider();

function dbRef(uid, path) { return ref(db, `users/${uid}/${path}`); }

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
`;

const C = {
  bg:"#fdf6f0", cream:"#fff9f5", card:"#ffffff",
  border:"#f0e4d8", border2:"#e8d5c4",
  accent:"#e8829a", accentDim:"#e8829a18",
  peach:"#f4a57a", peachDim:"#f4a57a18",
  sage:"#8db89a", sageDim:"#8db89a18",
  text:"#3d2e28", sub:"#9a7e74", muted:"#c4a99e", warm:"#f7ede4",
};

const MEAL_DB_DEFAULT = [
  { id:"f01", cat:"Frühstück", icon:"🍓", name:"Magerquark-Bowl mit Beeren", detail:"300g Magerquark + 100g TK-Beeren + 50g Haferflocken + Honig" },
  { id:"f02", cat:"Frühstück", icon:"🥭", name:"Overnight Oats mit Mango", detail:"60g Haferflocken + 200g Magerquark + 100g TK-Mango + Vanille" },
  { id:"f03", cat:"Frühstück", icon:"🍓", name:"Quark-Beeren-Bowl", detail:"250g Magerquark + 80g TK-Beeren + 40g Haferflocken + Nussmus" },
  { id:"f04", cat:"Frühstück", icon:"🥭", name:"Mango-Quark mit Haferflocken", detail:"300g Magerquark + 100g TK-Mango + 50g Haferflocken" },
  { id:"f05", cat:"Frühstück", icon:"🍓", name:"Beeren-Haferflocken-Quark", detail:"250g Magerquark + 60g Haferflocken + 120g TK-Beeren + Banane" },
  { id:"f06", cat:"Frühstück", icon:"🥭", name:"Mango-Beeren-Bowl", detail:"300g Magerquark + 80g TK-Mango + 50g TK-Beeren + 40g Haferflocken + Honig" },
  { id:"f07", cat:"Frühstück", icon:"🍓", name:"Großes Quark-Frühstück", detail:"300g Magerquark + 100g TK-Beeren + 50g Haferflocken + Banane" },
  { id:"f08", cat:"Frühstück", icon:"🫙", name:"Sauerkraut-Porridge", detail:"Haferflocken mit Sauerkraut — dein Spezial-Frühstück" },
  { id:"f09", cat:"Frühstück", icon:"🥭", name:"Vanillequark mit TK-Mango", detail:"Magerquark mit Vanille + TK-Mango aufgetaut" },
  { id:"s01", cat:"Snack", icon:"🥒", name:"Rohkost-Teller mit Frischkäse-Dip", detail:"Möhren, Gurke, Kohlrabi + 100g körniger Frischkäse + 2 Brezeln" },
  { id:"s02", cat:"Snack", icon:"🍫", name:"Proteinriegel + Obst", detail:"1 Proteinriegel + 1 Banane + Handvoll Beeren" },
  { id:"s03", cat:"Snack", icon:"🥒", name:"Harzer Käse auf Brezel & Rohkost", detail:"3 Scheiben Harzer Käse + 2 Brezeln + Kohlrabi & Möhren" },
  { id:"s04", cat:"Snack", icon:"🍫", name:"Proteinriegel + Rohkost", detail:"1 Proteinriegel + Möhren, Gurke, Kohlrabi" },
  { id:"s05", cat:"Snack", icon:"🧀", name:"Frischkäse & Rohkost", detail:"150g körniger Frischkäse + Möhren, Radieschen, Gurke + 1 Brezel" },
  { id:"s06", cat:"Snack", icon:"🥒", name:"Rohkost-Platte mit Mozzarella", detail:"125g Mozzarella + Möhren, Gurke, Kohlrabi, Radieschen + Essiggurken" },
  { id:"s07", cat:"Snack", icon:"🦐", name:"Garnelen & Rohkost", detail:"100g Garnelen, Möhren, Gurke, Radieschen, Zitrone, Brezel" },
  { id:"s08", cat:"Snack", icon:"🍌", name:"Vanillequark mit Banane", detail:"Magerquark mit Vanille + Banane in Scheiben" },
  { id:"s09", cat:"Snack", icon:"🍯", name:"Quark mit Honig & Nussmus", detail:"Magerquark + 1 TL Honig + 1 EL Nussmus" },
  { id:"s10", cat:"Snack", icon:"🍓", name:"TK-Beeren mit Quark", detail:"TK-Beeren aufgetaut + Magerquark" },
  { id:"s11", cat:"Snack", icon:"🥕", name:"Kohlrabi-Sticks mit Frischkäse-Dip", detail:"Kohlrabi in Sticks + körniger Frischkäse als Dip" },
  { id:"s12", cat:"Snack", icon:"🥨", name:"Brezeln mit Harzer Käse", detail:"2 Brezeln + 2–3 Scheiben Harzer Käse" },
  { id:"s13", cat:"Snack", icon:"🥕", name:"Möhren mit körnigem Frischkäse", detail:"Möhren roh + körniger Frischkäse zum Dippen" },
  { id:"s14", cat:"Snack", icon:"🍫", name:"Banane + Proteinriegel", detail:"1 Banane + 1 Proteinriegel" },
  { id:"s15", cat:"Snack", icon:"🧀", name:"Essiggurken + Mozzarella", detail:"Essiggurken + Mozzarella-Kugeln" },
  { id:"s16", cat:"Snack", icon:"🍦", name:"Sojajoghurt mit Vanille", detail:"Sojajoghurt pur + etwas Vanille" },
  { id:"m01", cat:"Mittagessen", icon:"🍝", name:"Kalte Nudeln mit Sojajoghurt", detail:"150g Nudeln kalt, 150g Sojajoghurt, 100g Kichererbsen, Essiggurken, Dill" },
  { id:"m02", cat:"Mittagessen", icon:"🥚", name:"Eier-Rohkost-Bowl", detail:"3 hart gekochte Eier, Möhren, Gurke, Radieschen, Frischkäse, Brezel" },
  { id:"m03", cat:"Mittagessen", icon:"🍝", name:"Kichererbsen-Salat kalt", detail:"200g Kichererbsen, Frischkäse, Gurke, Essiggurken, Dill, Zitrone" },
  { id:"m04", cat:"Mittagessen", icon:"🥚", name:"Eier & Mozzarella mit Tomaten", detail:"3 Eier, 125g Mozzarella, Tomaten, Basilikum, Essiggurken, Brezel" },
  { id:"m05", cat:"Mittagessen", icon:"🍝", name:"Kalte Nudeln mit Garnelen", detail:"150g Nudeln kalt, 100g Garnelen, Sojajoghurt, Gurke, Essiggurken" },
  { id:"m06", cat:"Mittagessen", icon:"🥚", name:"Eier-Kichererbsen-Bowl", detail:"3 Eier, 150g Kichererbsen, Frischkäse, Gurke, Zitrone, Dill" },
  { id:"m07", cat:"Mittagessen", icon:"🍚", name:"Reis-Meal", detail:"Dein Reismittagessen" },
  { id:"a01", cat:"Abendessen", icon:"🧀", name:"Putenbrust mit Harzer Käse", detail:"100g Putenbrust, 2 Scheiben Harzer Käse, Radieschen, Gurke, Brezel" },
  { id:"a02", cat:"Abendessen", icon:"🦐", name:"Garnelen mit Mozzarella", detail:"120g Garnelen, 125g Mozzarella, Gurke, Essiggurken, Zitronensaft" },
  { id:"a03", cat:"Abendessen", icon:"🍗", name:"Putenbrust-Wrap kalt", detail:"120g Putenbrust, Vollkorn-Wrap, Magerquark, Salat, Gurke, Tomate" },
  { id:"a04", cat:"Abendessen", icon:"🦐", name:"Garnelen-Kichererbsen-Bowl", detail:"100g Garnelen, 100g Kichererbsen, Gurke, Frischkäse, Zitrone, Dill" },
  { id:"a05", cat:"Abendessen", icon:"🍗", name:"Putenbrust & Harzer Käse-Teller", detail:"100g Putenbrust, 2 Scheiben Harzer Käse, Tomate, Gurke, Essiggurken, Brezel" },
  { id:"a06", cat:"Abendessen", icon:"🍫", name:"Proteinriegel + Quark-Snack", detail:"1 Proteinriegel + 150g Magerquark mit TK-Beeren + Brezel" },
  { id:"a07", cat:"Abendessen", icon:"🍝", name:"Kalte Nudeln mit Kichererbsen", detail:"130g Nudeln kalt, 100g Kichererbsen, Sojajoghurt, Essiggurken, Dill" },
  { id:"a08", cat:"Abendessen", icon:"🧀", name:"Käse-Aufschnitt-Teller", detail:"100g Putenbrust, 125g Mozzarella, 2 Harzer Käse, Essiggurken, Rohkost, Brezeln" },
];

const MEAL_CATS = ["Frühstück","Snack","Mittagessen","Abendessen"];
const MEAL_CAT_ICONS = { "Frühstück":"🌸", "Snack":"🍑", "Mittagessen":"🌿", "Abendessen":"🌙" };

const DEFAULT_EXERCISES = [
  { id:"e01", muscle:"Booty", name:"Hip Thrust", tip:"Bauch anspannen, Becken oben halten" },
  { id:"e02", muscle:"Booty", name:"Romanian Deadlift", tip:"Rücken gerade, Hüfte nach hinten schieben" },
  { id:"e03", muscle:"Booty", name:"Glute Kickbacks (Kabel)", tip:"Hüfte stabil, oben anspannen" },
  { id:"e04", muscle:"Booty", name:"Abduktoren (Maschine)", tip:"Langsam zurück für mehr Reiz" },
  { id:"e05", muscle:"Booty", name:"Ausfallschritte", tip:"Knie berührt fast den Boden" },
  { id:"e06", muscle:"Beine", name:"Kniebeuge", tip:"Knie über Zehen, Rücken gerade" },
  { id:"e07", muscle:"Beine", name:"Beinpresse", tip:"Füße schulterbreit, nicht durchstrecken" },
  { id:"e08", muscle:"Beine", name:"Beinbeuger (Maschine)", tip:"Langsam ablassen für mehr Reiz" },
  { id:"e09", muscle:"Beine", name:"Beinstrecker (Maschine)", tip:"Oben kurz halten" },
  { id:"e10", muscle:"Rücken", name:"Latzug", tip:"Schulterblätter zusammenziehen" },
  { id:"e11", muscle:"Rücken", name:"Rudern (Kabelzug)", tip:"Ellbogen nah am Körper" },
  { id:"e12", muscle:"Rücken", name:"Kurzhantel-Rudern", tip:"Rücken parallel zum Boden" },
  { id:"e13", muscle:"Rücken", name:"Hyperextensions", tip:"Nicht überstrecken" },
  { id:"e14", muscle:"Brust", name:"Bankdrücken", tip:"Schulterblätter zusammen" },
  { id:"e15", muscle:"Brust", name:"Schrägbankdrücken", tip:"Obere Brust betonen" },
  { id:"e16", muscle:"Brust", name:"Butterfly (Maschine)", tip:"Langsam öffnen, nicht reißen" },
  { id:"e17", muscle:"Schultern", name:"Schulterdrücken (KH)", tip:"Nicht ins Hohlkreuz fallen" },
  { id:"e18", muscle:"Schultern", name:"Seitheben", tip:"Arme leicht gebeugt, kontrolliert" },
  { id:"e19", muscle:"Schultern", name:"Face Pulls", tip:"Hintere Schulter stärken" },
  { id:"e20", muscle:"Arme", name:"Bizepscurl (KH)", tip:"Ellbogen bleibt am Körper" },
  { id:"e21", muscle:"Arme", name:"Trizepsdrücken (Kabel)", tip:"Ellbogen eng halten" },
  { id:"e22", muscle:"Arme", name:"Hammercurl", tip:"Daumen zeigt nach oben" },
  { id:"e23", muscle:"Bauch", name:"Crunches", tip:"Nacken nicht ziehen" },
  { id:"e24", muscle:"Bauch", name:"Plank", tip:"Hüfte nicht hängen lassen" },
  { id:"e25", muscle:"Bauch", name:"Beinheben", tip:"Lendenwirbel bleibt am Boden" },
  { id:"e26", muscle:"Bauch", name:"Russian Twists", tip:"Füße leicht anheben" },
];

const DEFAULT_WORKOUTS = [
  { id:"w01", name:"Booty & Beine 🍑", muscles:"Booty · Beine", exIds:["e01","e02","e03","e04","e05","e08"], custom:false },
  { id:"w02", name:"Rücken & Bizeps 💪", muscles:"Rücken · Arme", exIds:["e10","e11","e12","e13","e20","e22"], custom:false },
  { id:"w03", name:"Brust & Trizeps 🏋️", muscles:"Brust · Arme", exIds:["e14","e15","e16","e21"], custom:false },
  { id:"w04", name:"Schultern & Bauch 🙆", muscles:"Schultern · Bauch", exIds:["e17","e18","e19","e23","e24","e25","e26"], custom:false },
];

const MUSCLES = ["Booty","Beine","Rücken","Brust","Schultern","Arme","Bauch"];

function todayKey(){ return new Date().toISOString().split("T")[0]; }
function fmtDate(iso){ return new Date(iso+"T12:00:00").toLocaleDateString("de-DE",{weekday:"short",day:"2-digit",month:"short"}); }
function fmtDateShort(iso){ return new Date(iso+"T12:00:00").toLocaleDateString("de-DE",{day:"2-digit",month:"short"}); }
function fmtTime(iso){ return new Date(iso).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}); }

function calcStreak(foodLog) {
  const today = todayKey();
  let streak=0, d=new Date();
  while(true){
    const key=d.toISOString().split("T")[0];
    if((foodLog[key]||[]).length>0){ streak++; d.setDate(d.getDate()-1); }
    else { if(key===today){d.setDate(d.getDate()-1);continue;} break; }
    if(streak>365) break;
  }
  return streak;
}
function getTopMeals(foodLog,n=5){
  const counts={};
  Object.values(foodLog).flat().forEach(e=>{ counts[e.mealName]=(counts[e.mealName]||0)+1; });
  return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,n);
}
function getCalendarDays(foodLog){
  const days=[],today=new Date();
  for(let i=27;i>=0;i--){
    const d=new Date(today); d.setDate(d.getDate()-i);
    const key=d.toISOString().split("T")[0];
    days.push({key,count:(foodLog[key]||[]).length,isToday:i===0});
  }
  return days;
}

// ── COMPONENTS ────────────────────────────────────────────────────────────────
const Pill = ({children,active,color,onClick}) => (
  <button onClick={onClick} style={{
    flexShrink:0,padding:"6px 14px",
    background:active?(color||C.accent):C.warm,
    color:active?"#fff":C.sub,
    border:`1.5px solid ${active?(color||C.accent):C.border}`,
    borderRadius:20,fontFamily:"'DM Sans',sans-serif",
    fontWeight:500,fontSize:12,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap",
  }}>{children}</button>
);
const Card = ({children,style={}}) => (
  <div style={{background:C.card,border:`1.5px solid ${C.border}`,borderRadius:16,
    padding:"14px 16px",marginBottom:10,boxShadow:"0 2px 12px #e8829a08",...style}}>
    {children}
  </div>
);
const SectionLabel = ({children,style={}}) => (
  <div style={{fontFamily:"'Fraunces',serif",fontSize:11,color:C.muted,
    letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12,...style}}>
    {children}
  </div>
);
const CheckBtn = ({done,onClick,color}) => (
  <button onClick={onClick} style={{
    width:32,height:32,borderRadius:10,flexShrink:0,
    background:done?(color||C.accent):"transparent",
    border:`2px solid ${done?(color||C.accent):C.border2}`,
    color:done?"#fff":C.muted,display:"flex",alignItems:"center",
    justifyContent:"center",cursor:"pointer",transition:"all 0.2s",padding:0,
  }}>
    {done&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
  </button>
);
const Inp = ({style={},...props}) => (
  <input style={{background:C.warm,border:`1.5px solid ${C.border}`,borderRadius:10,
    padding:"9px 12px",color:C.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,
    outline:"none",boxSizing:"border-box",width:"100%",...style}} {...props}/>
);
const Btn = ({children,onClick,variant="primary",style={}}) => {
  const v={
    primary:{background:C.accent,color:"#fff",border:"none"},
    soft:{background:C.accentDim,color:C.accent,border:`1.5px solid ${C.accent}44`},
    ghost:{background:"transparent",color:C.muted,border:`1.5px solid ${C.border}`},
    sage:{background:C.sage,color:"#fff",border:"none"},
  };
  return <button onClick={onClick} style={{...v[variant],borderRadius:12,padding:"10px 16px",
    fontFamily:"'DM Sans',sans-serif",fontWeight:500,fontSize:13,cursor:"pointer",
    transition:"all 0.15s",...style}}>{children}</button>;
};

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [page, setPage] = useState("home");
  const [weightLog, setWeightLog] = useState([]);
  const [wInput, setWInput] = useState("");
  const [mealDb, setMealDb] = useState(MEAL_DB_DEFAULT);
  const [foodLog, setFoodLog] = useState({});
  const [exercises, setExercises] = useState(DEFAULT_EXERCISES);
  const [workouts, setWorkouts] = useState(DEFAULT_WORKOUTS);
  const [wLog, setWLog] = useState({});
  const [inspo, setInspo] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionNote, setSessionNote] = useState("");

  const [pickCat, setPickCat] = useState("Frühstück");
  const [pickMeal, setPickMeal] = useState(null);
  const [logNote, setLogNote] = useState("");
  const [logTime, setLogTime] = useState(new Date().toTimeString().slice(0,5));
  const [newMeal, setNewMeal] = useState({cat:"Frühstück",icon:"🍽️",name:"",detail:""});
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [essenTab, setEssenTab] = useState("loggen");
  const [expandedDay, setExpandedDay] = useState(null);
  const [workoutTab, setWorkoutTab] = useState("plans");
  const [newInspo, setNewInspo] = useState({name:"",quote:""});
  const [showAddInspo, setShowAddInspo] = useState(false);

  // Custom workout builder
  const [showCreateWorkout, setShowCreateWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({name:"",exIds:[]});
  const [filterMuscle, setFilterMuscle] = useState("Alle");

  const [toast, setToast] = useState(null);

  function showToast(msg){setToast(msg);setTimeout(()=>setToast(null),2400);}

  // ── AUTH ──
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, u=>{
      setUser(u);
      setAuthLoading(false);
      if(u) loadAllData(u.uid);
    });
    return unsub;
  },[]);

  async function loginWithGoogle(){
    try{ await signInWithPopup(auth,provider); }
    catch(e){ showToast("Login fehlgeschlagen"); }
  }
  async function logout(){
    await signOut(auth);
    setWeightLog([]); setFoodLog({}); setWLog({});
    setInspo([]); setMealDb(MEAL_DB_DEFAULT);
    setExercises(DEFAULT_EXERCISES); setWorkouts(DEFAULT_WORKOUTS);
  }

  // ── LOAD ALL ──
  async function loadAllData(uid){
    setSyncing(true);
    try{
      const snap = await get(ref(db,`users/${uid}`));
      if(snap.exists()){
        const d=snap.val();
        if(d.weightLog) setWeightLog(Object.values(d.weightLog));
        if(d.foodLog) setFoodLog(d.foodLog);
        if(d.wLog) setWLog(d.wLog);
        if(d.inspo) setInspo(Object.values(d.inspo));
        if(d.mealDb) setMealDb(Object.values(d.mealDb));
        if(d.exercises) setExercises(Object.values(d.exercises));
        if(d.workouts) setWorkouts(Object.values(d.workouts));
        if(d.activeSession){ setActiveSession(d.activeSession); setWorkoutTab("session"); }
      }
    }catch(e){console.error(e);}
    setSyncing(false);
  }

  // ── SYNC HELPERS ──
  function syncWeightLog(data, uid=user?.uid){ if(uid) set(dbRef(uid,"weightLog"), Object.fromEntries(data.map(e=>[e.date,e]))); }
  function syncFoodLog(data, uid=user?.uid){ if(uid) set(dbRef(uid,"foodLog"), data); }
  function syncWLog(data, uid=user?.uid){ if(uid) set(dbRef(uid,"wLog"), data); }
  function syncInspo(data, uid=user?.uid){ if(uid) set(dbRef(uid,"inspo"), Object.fromEntries(data.map(e=>[e.id,e]))); }
  function syncMealDb(data, uid=user?.uid){ if(uid) set(dbRef(uid,"mealDb"), Object.fromEntries(data.map(e=>[e.id,e]))); }
  function syncExercises(data, uid=user?.uid){ if(uid) set(dbRef(uid,"exercises"), Object.fromEntries(data.map(e=>[e.id,e]))); }
  function syncWorkouts(data, uid=user?.uid){ if(uid) set(dbRef(uid,"workouts"), Object.fromEntries(data.map(e=>[e.id,e]))); }
  function syncSession(data, uid=user?.uid){ if(uid){ if(data) set(dbRef(uid,"activeSession"),data); else remove(dbRef(uid,"activeSession")); } }

  // ── WEIGHT ──
  function addWeight(){
    const v=parseFloat(wInput.replace(",","."));
    if(isNaN(v)||v<30||v>300) return;
    const today=todayKey();
    const next=[...weightLog.filter(e=>e.date!==today),{date:today,weight:v}].sort((a,b)=>a.date.localeCompare(b.date));
    setWeightLog(next); syncWeightLog(next); setWInput(""); showToast("✓ Gewicht gespeichert!");
  }

  // ── FOOD ──
  function logMeal(){
    if(!pickMeal) return;
    const base=new Date();
    if(logTime){const[h,m]=logTime.split(":").map(Number);base.setHours(h,m,0,0);}
    const entry={id:Date.now(),mealId:pickMeal.id,mealName:pickMeal.name,mealIcon:pickMeal.icon,cat:pickMeal.cat,note:logNote.trim(),ts:base.toISOString()};
    const key=todayKey();
    const next={...foodLog,[key]:[...(foodLog[key]||[]),entry]};
    setFoodLog(next); syncFoodLog(next);
    setPickMeal(null);setLogNote("");setLogTime(new Date().toTimeString().slice(0,5));
    showToast("🌸 Mahlzeit geloggt!");
  }
  function addMealToDb(){
    if(!newMeal.name.trim()) return;
    const next=[...mealDb,{...newMeal,id:"u_"+Date.now()}];
    setMealDb(next); syncMealDb(next);
    setNewMeal({cat:"Frühstück",icon:"🍽️",name:"",detail:""});
    setShowAddMeal(false); showToast("✓ Mahlzeit hinzugefügt!");
  }
  function deleteFoodEntry(dateKey,id){
    const next={...foodLog,[dateKey]:(foodLog[dateKey]||[]).filter(x=>x.id!==id)};
    setFoodLog(next); syncFoodLog(next);
  }

  // ── WORKOUT ──
  function startWorkout(w){
    const sets={};
    w.exIds.forEach(id=>{sets[id]=[{reps:"",weight:"",done:false}];});
    const session={workoutId:w.id,sets,startTs:new Date().toISOString()};
    setActiveSession(session); setSessionNote(""); setWorkoutTab("session");
    syncSession(session);
  }
  function addSet(exId){
    const next={...activeSession,sets:{...activeSession.sets,[exId]:[...activeSession.sets[exId],{reps:"",weight:"",done:false}]}};
    setActiveSession(next); syncSession(next);
  }
  function removeSet(exId,i){
    const sets={...activeSession.sets}; sets[exId]=sets[exId].filter((_,j)=>j!==i);
    const next={...activeSession,sets}; setActiveSession(next); syncSession(next);
  }
  function updateSet(exId,i,field,val){
    const sets={...activeSession.sets}; sets[exId]=sets[exId].map((s,j)=>j===i?{...s,[field]:val}:s);
    const next={...activeSession,sets}; setActiveSession(next); syncSession(next);
  }
  function toggleSet(exId,i){
    const sets={...activeSession.sets}; sets[exId]=sets[exId].map((s,j)=>j===i?{...s,done:!s.done}:s);
    const next={...activeSession,sets}; setActiveSession(next); syncSession(next);
  }
  function finishWorkout(){
    const w=workouts.find(x=>x.id===activeSession.workoutId);
    const entry={id:Date.now(),workoutId:activeSession.workoutId,workoutName:w?.name||"Training",
      sets:activeSession.sets,note:sessionNote.trim(),startTs:activeSession.startTs,endTs:new Date().toISOString()};
    const key=todayKey();
    const next={...wLog,[key]:[...(wLog[key]||[]),entry]};
    setWLog(next); syncWLog(next);
    setActiveSession(null); syncSession(null);
    setSessionNote(""); setWorkoutTab("plans");
    showToast("🔥 Training abgeschlossen — du bist stark!");
  }

  // ── CUSTOM WORKOUT ──
  function saveCustomWorkout(){
    if(!newWorkout.name.trim()||newWorkout.exIds.length===0) return;
    const muscleGroups=[...new Set(newWorkout.exIds.map(id=>exercises.find(e=>e.id===id)?.muscle||"").filter(Boolean))];
    const w={id:"cw_"+Date.now(),name:newWorkout.name,muscles:muscleGroups.join(" · "),exIds:newWorkout.exIds,custom:true};
    const next=[...workouts,w]; setWorkouts(next); syncWorkouts(next);
    setNewWorkout({name:"",exIds:[]}); setShowCreateWorkout(false);
    showToast("✓ Workout gespeichert!");
  }
  function deleteWorkout(id){
    const next=workouts.filter(w=>w.id!==id); setWorkouts(next); syncWorkouts(next);
  }

  // ── INSPO ──
  function addInspoEntry(){
    if(!newInspo.name.trim()) return;
    const next=[...inspo,{id:Date.now(),...newInspo}];
    setInspo(next); syncInspo(next);
    setNewInspo({name:"",quote:""}); setShowAddInspo(false); showToast("✨ Vorbild gespeichert!");
  }
  function deleteInspo(id){
    const next=inspo.filter(i=>i.id!==id); setInspo(next); syncInspo(next);
  }

  // ── DERIVED ──
  const sortedW=[...weightLog].sort((a,b)=>a.date.localeCompare(b.date));
  const latestW=sortedW[sortedW.length-1];
  const firstW=sortedW[0];
  const totalGain=latestW&&firstW?(latestW.weight-firstW.weight).toFixed(1):null;
  const todayFood=foodLog[todayKey()]||[];
  const todayWorkout=wLog[todayKey()]||[];
  const streak=calcStreak(foodLog);
  const topMeals=getTopMeals(foodLog);
  const calDays=getCalendarDays(foodLog);
  const verlaufDays=Object.keys(foodLog).filter(k=>(foodLog[k]||[]).length>0).sort((a,b)=>b.localeCompare(a)).slice(0,30);
  const totalLoggedDays=Object.keys(foodLog).filter(k=>(foodLog[k]||[]).length>0).length;

  const chartW=320,chartH=100,padL=36,padR=12,padT=12,padB=28;
  const iW=chartW-padL-padR,iH=chartH-padT-padB;
  const ws=sortedW.map(e=>e.weight);
  const minW=ws.length?Math.min(...ws)-0.5:60,maxW=ws.length?Math.max(...ws)+0.5:80,rng=maxW-minW||1;
  const toX=i=>padL+(i/Math.max(sortedW.length-1,1))*iW;
  const toY=w=>padT+iH-((w-minW)/rng)*iH;
  const pts=sortedW.map((e,i)=>`${toX(i)},${toY(e.weight)}`).join(" ");

  const currentWorkout=activeSession?workouts.find(w=>w.id===activeSession.workoutId):null;
  const filteredExercises=filterMuscle==="Alle"?exercises:exercises.filter(e=>e.muscle===filterMuscle);

  const NAV=[
    {id:"home",label:"Home",icon:"🌸"},
    {id:"essen",label:"Essen",icon:"🍑"},
    {id:"workout",label:"Workout",icon:"💪"},
    {id:"gewicht",label:"Gewicht",icon:"📈"},
    {id:"inspo",label:"Inspo",icon:"✨"},
  ];

  // ── LOGIN SCREEN ──
  if(authLoading) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:32,color:C.accent,fontStyle:"italic",marginBottom:8}}>Gainz</div>
        <div style={{fontSize:12,color:C.muted}}>laden…</div>
      </div>
    </div>
  );

  if(!user) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",padding:24}}>
      <style>{fontStyle}</style>
      <div style={{textAlign:"center",maxWidth:320}}>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:42,color:C.accent,fontStyle:"italic",marginBottom:8}}>Gainz</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:40,letterSpacing:"0.05em"}}>dein persönlicher begleiter 🌸</div>
        <div style={{background:C.card,border:`1.5px solid ${C.border}`,borderRadius:20,padding:28,boxShadow:"0 8px 32px #e8829a12"}}>
          <div style={{fontSize:40,marginBottom:16}}>🌸</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:18,color:C.text,marginBottom:8}}>Willkommen zurück</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:24,lineHeight:1.6}}>Melde dich an um deine Daten auf allen Geräten zu synchronisieren.</div>
          <button onClick={loginWithGoogle} style={{
            width:"100%",background:"#fff",border:`1.5px solid ${C.border}`,
            borderRadius:12,padding:"12px 16px",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,color:C.text,
            boxShadow:"0 2px 8px #00000010",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Mit Google anmelden
          </button>
        </div>
      </div>
    </div>
  );

  // ── MAIN APP ──
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans','Helvetica Neue',sans-serif",paddingBottom:80}}>
      <style>{fontStyle}</style>

      {toast&&(
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",
          background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:12,
          padding:"10px 20px",fontSize:13,color:C.text,zIndex:999,
          boxShadow:"0 8px 32px #e8829a22",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{background:C.cream,borderBottom:`1.5px solid ${C.border}`,padding:"16px 18px 14px"}}>
        <div style={{maxWidth:440,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:24,color:C.accent,fontStyle:"italic",lineHeight:1}}>Gainz</div>
            <div style={{fontSize:10,color:C.muted,marginTop:1}}>Hallo, {user.displayName?.split(" ")[0]} 🌸</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {syncing&&<div style={{fontSize:10,color:C.muted}}>⟳ sync</div>}
            <button onClick={logout} style={{background:"none",border:`1px solid ${C.border}`,
              borderRadius:8,padding:"5px 10px",fontSize:11,color:C.muted,cursor:"pointer",
              fontFamily:"inherit"}}>Abmelden</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:440,margin:"0 auto",padding:"16px 14px"}}>

        {/* ── HOME ── */}
        {page==="home"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
              {[
                {label:"Gewicht",value:latestW?`${latestW.weight} kg`:"—",sub:totalGain!==null?`${parseFloat(totalGain)>=0?"+":""}${totalGain} kg`:"noch nichts",color:C.accent},
                {label:"Heute gegessen",value:`${todayFood.length}`,sub:"Mahlzeiten",color:C.peach},
                {label:"Trainings",value:`${Object.keys(wLog).length}`,sub:"Tage",color:C.sage},
              ].map(s=>(
                <div key={s.label} style={{background:C.card,border:`1.5px solid ${C.border}`,borderRadius:14,padding:"12px 10px",textAlign:"center",boxShadow:"0 2px 8px #e8829a06"}}>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:20,color:s.color,fontWeight:600}}>{s.value}</div>
                  <div style={{fontSize:9,color:C.muted,marginTop:2,letterSpacing:"0.1em",textTransform:"uppercase"}}>{s.label}</div>
                  <div style={{fontSize:10,color:C.sub,marginTop:1}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {activeSession&&(
              <Card style={{background:"linear-gradient(135deg,#fff5f0,#fdf0f5)",border:`1.5px solid ${C.peach}44`,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:24}}>⏱️</div>
                    <div>
                      <div style={{fontFamily:"'Fraunces',serif",fontSize:14,color:C.peach}}>Session läuft noch!</div>
                      <div style={{fontSize:11,color:C.sub,marginTop:2}}>{currentWorkout?.name}</div>
                    </div>
                  </div>
                  <Btn onClick={()=>{setPage("workout");setWorkoutTab("session");}} variant="soft"
                    style={{padding:"6px 12px",fontSize:11,background:C.peachDim,color:C.peach,border:`1.5px solid ${C.peach}44`}}>
                    Weiter →
                  </Btn>
                </div>
              </Card>
            )}

            {streak>0&&(
              <Card style={{background:"linear-gradient(135deg,#fff5f0,#fdf0f5)",border:`1.5px solid ${C.peach}33`,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:32}}>🔥</div>
                  <div>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:18,color:C.peach,fontWeight:600}}>{streak} {streak===1?"Tag":"Tage"} in Folge</div>
                    <div style={{fontSize:11,color:C.sub,marginTop:2}}>du loggst regelmäßig — weiter so!</div>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:15,color:C.text}}>Heute gegessen</div>
                <Btn onClick={()=>setPage("essen")} variant="soft" style={{padding:"5px 12px",fontSize:11}}>+ loggen</Btn>
              </div>
              {todayFood.length===0
                ?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"10px 0"}}>Noch nichts geloggt 🌸</div>
                :todayFood.map(e=>(
                  <div key={e.id} style={{display:"flex",gap:8,alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${C.border}22`}}>
                    <span style={{fontSize:16}}>{e.mealIcon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,color:C.text}}>{e.mealName}</div>
                      <div style={{fontSize:10,color:C.muted}}>{fmtTime(e.ts)}</div>
                    </div>
                  </div>
                ))
              }
            </Card>

            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:15,color:C.text}}>Heute trainiert</div>
                <Btn onClick={()=>setPage("workout")} variant="soft" style={{padding:"5px 12px",fontSize:11}}>öffnen</Btn>
              </div>
              {todayWorkout.length===0
                ?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"10px 0"}}>Noch kein Training heute 💪</div>
                :todayWorkout.map(e=>(<div key={e.id} style={{fontSize:12,color:C.text,padding:"4px 0"}}>✓ {e.workoutName}</div>))
              }
            </Card>

            {inspo.length>0&&(
              <Card style={{background:"linear-gradient(135deg,#fff5f7,#fdf0f8)",border:`1.5px solid ${C.accent}22`}}>
                <div style={{fontSize:10,color:C.accent,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8,fontFamily:"'Fraunces',serif"}}>✨ Dein Vorbild</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:14,color:C.accent,marginBottom:6}}>{inspo[Math.floor(Math.random()*inspo.length)].name}</div>
                {inspo[0].quote&&<div style={{fontSize:12,color:C.sub,fontStyle:"italic",lineHeight:1.6}}>„{inspo[0].quote}"</div>}
              </Card>
            )}
          </>
        )}

        {/* ── ESSEN ── */}
        {page==="essen"&&(
          <>
            <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:2}}>
              {[["loggen","Loggen"],["verlauf","Verlauf"],["stats","Stats"]].map(([k,l])=>(
                <Pill key={k} active={essenTab===k} onClick={()=>setEssenTab(k)}>{l}</Pill>
              ))}
            </div>

            {essenTab==="loggen"&&(
              <>
                <SectionLabel>Was hast du gegessen?</SectionLabel>
                <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
                  {MEAL_CATS.map(cat=>(
                    <Pill key={cat} active={pickCat===cat} onClick={()=>{setPickCat(cat);setPickMeal(null);}}>
                      {MEAL_CAT_ICONS[cat]} {cat}
                    </Pill>
                  ))}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
                  {mealDb.filter(m=>m.cat===pickCat).map(meal=>{
                    const sel=pickMeal?.id===meal.id;
                    return(
                      <button key={meal.id} onClick={()=>setPickMeal(sel?null:meal)} style={{
                        background:sel?"linear-gradient(135deg,#fff0f4,#fdf5f8)":C.card,
                        border:`1.5px solid ${sel?C.accent:C.border}`,borderRadius:14,
                        padding:"12px 14px",cursor:"pointer",textAlign:"left",transition:"all 0.15s",
                        boxShadow:sel?`0 2px 12px ${C.accent}22`:"none",
                      }}>
                        <div style={{display:"flex",gap:10,alignItems:"center"}}>
                          <span style={{fontSize:22,flexShrink:0}}>{meal.icon}</span>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13,fontWeight:500,color:sel?C.accent:C.text}}>{meal.name}</div>
                            {meal.detail&&<div style={{fontSize:11,color:C.muted,marginTop:2,lineHeight:1.5}}>{meal.detail}</div>}
                          </div>
                          {sel&&<span style={{color:C.accent,fontSize:16}}>✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {pickMeal&&(
                  <Card style={{border:`1.5px solid ${C.accent}33`,background:"#fff8fa"}}>
                    <div style={{fontSize:13,fontWeight:500,color:C.accent,marginBottom:10}}>{pickMeal.icon} {pickMeal.name}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <div>
                        <div style={{fontSize:10,color:C.muted,marginBottom:4,letterSpacing:"0.08em"}}>UHRZEIT</div>
                        <input type="time" value={logTime} onChange={e=>setLogTime(e.target.value)}
                          style={{background:C.warm,border:`1.5px solid ${C.border}`,borderRadius:10,
                            padding:"8px 10px",color:C.text,fontFamily:"inherit",fontSize:13,
                            outline:"none",width:"100%",boxSizing:"border-box"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:10,color:C.muted,marginBottom:4,letterSpacing:"0.08em"}}>NOTIZ</div>
                        <Inp placeholder="wie war's?" value={logNote} onChange={e=>setLogNote(e.target.value)}/>
                      </div>
                    </div>
                    <Btn onClick={logMeal} style={{width:"100%"}}>Einloggen 🌸</Btn>
                  </Card>
                )}
                {todayFood.length>0&&(
                  <>
                    <SectionLabel style={{marginTop:8}}>Heute geloggt</SectionLabel>
                    {[...todayFood].reverse().map(e=>(
                      <div key={e.id} style={{display:"flex",gap:10,alignItems:"center",background:C.card,border:`1.5px solid ${C.sageDim}`,borderRadius:12,padding:"10px 12px",marginBottom:7}}>
                        <span style={{fontSize:18}}>{e.mealIcon}</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:500,color:C.sage}}>{e.mealName}</div>
                          {e.note&&<div style={{fontSize:11,color:C.muted}}>📝 {e.note}</div>}
                          <div style={{fontSize:10,color:C.muted,marginTop:2}}>{fmtTime(e.ts)}</div>
                        </div>
                        <button onClick={()=>deleteFoodEntry(todayKey(),e.id)}
                          style={{background:"none",border:"none",cursor:"pointer",color:C.muted,padding:4,fontSize:16}}>×</button>
                      </div>
                    ))}
                  </>
                )}
                <div style={{marginTop:8}}>
                  <Btn onClick={()=>setShowAddMeal(v=>!v)} variant="ghost" style={{width:"100%",marginBottom:8}}>+ eigene Mahlzeit hinzufügen</Btn>
                  {showAddMeal&&(
                    <Card style={{border:`1.5px solid ${C.peach}44`}}>
                      <div style={{display:"grid",gridTemplateColumns:"50px 1fr",gap:8,marginBottom:8}}>
                        <Inp placeholder="🍽️" value={newMeal.icon} onChange={e=>setNewMeal(p=>({...p,icon:e.target.value}))} style={{textAlign:"center",fontSize:20,padding:"8px"}}/>
                        <Inp placeholder="Name" value={newMeal.name} onChange={e=>setNewMeal(p=>({...p,name:e.target.value}))}/>
                      </div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                        {MEAL_CATS.map(cat=>(<Pill key={cat} active={newMeal.cat===cat} color={C.peach} onClick={()=>setNewMeal(p=>({...p,cat}))}>{cat}</Pill>))}
                      </div>
                      <Inp placeholder="Zutaten (optional)" value={newMeal.detail} onChange={e=>setNewMeal(p=>({...p,detail:e.target.value}))} style={{marginBottom:8}}/>
                      <Btn onClick={addMealToDb} style={{width:"100%",background:C.peach}}>Speichern</Btn>
                    </Card>
                  )}
                </div>
              </>
            )}

            {essenTab==="verlauf"&&(
              <>
                <Card>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:13,color:C.text,marginBottom:12}}>Letzte 4 Wochen</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
                    {["Mo","Di","Mi","Do","Fr","Sa","So"].map(d=>(<div key={d} style={{fontSize:8,color:C.muted,textAlign:"center",marginBottom:2}}>{d}</div>))}
                    {calDays.map(d=>(
                      <div key={d.key} title={fmtDateShort(d.key)} style={{aspectRatio:"1",borderRadius:6,
                        background:d.count>0?C.accent:C.warm,
                        border:d.isToday?`2px solid ${C.accent}`:`1px solid ${C.border}`,
                        opacity:d.count>0?1:0.5}}/>
                    ))}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
                    <div style={{width:10,height:10,borderRadius:3,background:C.accent}}/><span style={{fontSize:10,color:C.muted}}>geloggt</span>
                    <div style={{width:10,height:10,borderRadius:3,background:C.warm,border:`1px solid ${C.border}`}}/><span style={{fontSize:10,color:C.muted}}>nicht geloggt</span>
                  </div>
                </Card>
                <SectionLabel>Tage im Detail</SectionLabel>
                {verlaufDays.length===0&&<div style={{textAlign:"center",color:C.muted,padding:"30px 0",fontSize:13}}>Noch nichts geloggt 🌸</div>}
                {verlaufDays.map(dateKey=>{
                  const entries=foodLog[dateKey]||[];
                  const isToday=dateKey===todayKey();
                  const isExpanded=expandedDay===dateKey;
                  return(
                    <div key={dateKey} style={{marginBottom:8}}>
                      <button onClick={()=>setExpandedDay(isExpanded?null:dateKey)} style={{
                        width:"100%",background:C.card,border:`1.5px solid ${isToday?C.accent+"44":C.border}`,
                        borderRadius:12,padding:"12px 14px",cursor:"pointer",
                        textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",
                      }}>
                        <div>
                          <div style={{fontFamily:"'Fraunces',serif",fontSize:13,color:isToday?C.accent:C.text}}>{isToday?"Heute":fmtDate(dateKey)}</div>
                          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{entries.length} Mahlzeit{entries.length!==1?"en":""}{" · "}{entries.map(e=>e.mealIcon).join(" ")}</div>
                        </div>
                        <span style={{fontSize:14,color:C.muted}}>{isExpanded?"▲":"▼"}</span>
                      </button>
                      {isExpanded&&(
                        <div style={{background:C.warm,borderRadius:"0 0 12px 12px",border:`1.5px solid ${C.border}`,borderTop:"none",padding:"8px 14px 12px"}}>
                          {entries.map(e=>(
                            <div key={e.id} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 0",borderBottom:`1px solid ${C.border}44`}}>
                              <span style={{fontSize:18,flexShrink:0}}>{e.mealIcon}</span>
                              <div style={{flex:1}}>
                                <div style={{fontSize:12,fontWeight:500,color:C.text}}>{e.mealName}</div>
                                {e.note&&<div style={{fontSize:11,color:C.sub,marginTop:1}}>📝 {e.note}</div>}
                                <div style={{fontSize:10,color:C.muted,marginTop:1}}>{fmtTime(e.ts)}</div>
                              </div>
                              <div style={{fontSize:10,color:C.muted,background:C.card,borderRadius:6,padding:"2px 6px",border:`1px solid ${C.border}`,flexShrink:0}}>{e.cat}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {essenTab==="stats"&&(
              <>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                  <Card style={{textAlign:"center",marginBottom:0}}>
                    <div style={{fontSize:28}}>🔥</div>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:22,color:C.peach,fontWeight:600}}>{streak}</div>
                    <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em"}}>TAGE STREAK</div>
                  </Card>
                  <Card style={{textAlign:"center",marginBottom:0}}>
                    <div style={{fontSize:28}}>📅</div>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:22,color:C.accent,fontWeight:600}}>{totalLoggedDays}</div>
                    <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em"}}>TAGE GELOGGT</div>
                  </Card>
                </div>
                <Card>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:14,color:C.text,marginBottom:12}}>🏆 Deine Lieblingsmahlzeiten</div>
                  {topMeals.length===0&&<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"10px 0"}}>Noch keine Daten 🌸</div>}
                  {topMeals.map(([name,count])=>{
                    const meal=mealDb.find(m=>m.name===name);
                    const maxCount=topMeals[0]?.[1]||1;
                    return(
                      <div key={name} style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <span style={{fontSize:16}}>{meal?.icon||"🍽️"}</span>
                            <span style={{fontSize:12,color:C.text}}>{name}</span>
                          </div>
                          <span style={{fontSize:11,color:C.muted}}>{count}×</span>
                        </div>
                        <div style={{height:5,background:C.warm,borderRadius:4,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${(count/maxCount)*100}%`,background:`linear-gradient(90deg,${C.accent},${C.peach})`,borderRadius:4}}/>
                        </div>
                      </div>
                    );
                  })}
                </Card>
                <Card>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:14,color:C.text,marginBottom:12}}>📊 Nach Kategorie</div>
                  {MEAL_CATS.map(cat=>{
                    const count=Object.values(foodLog).flat().filter(e=>e.cat===cat).length;
                    const total=Object.values(foodLog).flat().length||1;
                    return(
                      <div key={cat} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                        <span style={{fontSize:14,width:20}}>{MEAL_CAT_ICONS[cat]}</span>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                            <span style={{fontSize:11,color:C.text}}>{cat}</span>
                            <span style={{fontSize:11,color:C.muted}}>{count}×</span>
                          </div>
                          <div style={{height:5,background:C.warm,borderRadius:4,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${(count/total)*100}%`,background:C.sage,borderRadius:4}}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </Card>
              </>
            )}
          </>
        )}

        {/* ── WORKOUT ── */}
        {page==="workout"&&(
          <>
            <div style={{display:"flex",gap:6,marginBottom:16}}>
              {[["plans","Pläne"],["session","Session"],["verlauf","Verlauf"]].map(([k,l])=>(
                <Pill key={k} active={workoutTab===k} onClick={()=>setWorkoutTab(k)}>{l}</Pill>
              ))}
            </div>

            {workoutTab==="plans"&&(
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <SectionLabel style={{marginBottom:0}}>Deine Pläne</SectionLabel>
                  <Btn onClick={()=>setShowCreateWorkout(v=>!v)} variant="soft" style={{padding:"6px 12px",fontSize:11}}>
                    + Eigener Plan
                  </Btn>
                </div>

                {/* Create custom workout */}
                {showCreateWorkout&&(
                  <Card style={{border:`1.5px solid ${C.accent}44`,marginBottom:14}}>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:14,color:C.text,marginBottom:12}}>Neuer Workout-Plan</div>
                    <Inp placeholder="Name z.B. Pull Day 💪" value={newWorkout.name}
                      onChange={e=>setNewWorkout(p=>({...p,name:e.target.value}))} style={{marginBottom:10}}/>
                    <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",marginBottom:8}}>ÜBUNGEN WÄHLEN</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                      {["Alle",...MUSCLES].map(m=>(
                        <Pill key={m} active={filterMuscle===m} color={C.peach} onClick={()=>setFilterMuscle(m)} >{m}</Pill>
                      ))}
                    </div>
                    <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
                      {filteredExercises.map(ex=>{
                        const sel=newWorkout.exIds.includes(ex.id);
                        return(
                          <button key={ex.id} onClick={()=>setNewWorkout(p=>({...p,exIds:sel?p.exIds.filter(id=>id!==ex.id):[...p.exIds,ex.id]}))}
                            style={{background:sel?C.accentDim:C.warm,border:`1.5px solid ${sel?C.accent:C.border}`,
                              borderRadius:8,padding:"8px 12px",cursor:"pointer",textAlign:"left",
                              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div>
                              <div style={{fontSize:12,color:sel?C.accent:C.text,fontWeight:500}}>{ex.name}</div>
                              <div style={{fontSize:10,color:C.muted}}>{ex.muscle}</div>
                            </div>
                            {sel&&<span style={{color:C.accent}}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    {newWorkout.exIds.length>0&&(
                      <div style={{fontSize:11,color:C.muted,marginBottom:10}}>
                        {newWorkout.exIds.length} Übung{newWorkout.exIds.length!==1?"en":""} ausgewählt
                      </div>
                    )}
                    <div style={{display:"flex",gap:8}}>
                      <Btn onClick={saveCustomWorkout} style={{flex:1}}>Speichern</Btn>
                      <Btn onClick={()=>setShowCreateWorkout(false)} variant="ghost" style={{flex:1}}>Abbrechen</Btn>
                    </div>
                  </Card>
                )}

                {workouts.map(w=>{
                  const doneTodayCount=(wLog[todayKey()]||[]).filter(e=>e.workoutId===w.id).length;
                  return(
                    <Card key={w.id} style={doneTodayCount?{border:`1.5px solid ${C.sage}55`,background:C.sageDim}:{}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:"'Fraunces',serif",fontSize:16,color:doneTodayCount?C.sage:C.text}}>{w.name}</div>
                          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{w.muscles} · {w.exIds.length} Übungen</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          {doneTodayCount>0&&<span style={{fontSize:18,color:C.sage}}>✓</span>}
                          {w.custom&&(
                            <button onClick={()=>deleteWorkout(w.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:16,padding:2}}>×</button>
                          )}
                        </div>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
                        {w.exIds.map(id=>{
                          const ex=exercises.find(e=>e.id===id);
                          return ex?(<span key={id} style={{fontSize:10,color:C.sub,background:C.warm,borderRadius:6,padding:"3px 8px",border:`1px solid ${C.border}`}}>{ex.name}</span>):null;
                        })}
                      </div>
                      <Btn onClick={()=>startWorkout(w)} style={{width:"100%",background:doneTodayCount?C.sage:C.accent}}>
                        {doneTodayCount?"Nochmal trainieren":"Training starten →"}
                      </Btn>
                    </Card>
                  );
                })}
              </>
            )}

            {workoutTab==="session"&&(
              <>
                {!activeSession
                  ?<div style={{textAlign:"center",color:C.muted,padding:"40px 0",fontSize:13}}>Kein aktives Training — starte einen Plan! 💪</div>
                  :<>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <div style={{fontFamily:"'Fraunces',serif",fontSize:16,color:C.accent}}>{currentWorkout?.name}</div>
                      <div style={{fontSize:10,color:C.peach,letterSpacing:"0.1em"}}>● LÄUFT</div>
                    </div>
                    {currentWorkout?.exIds.map(exId=>{
                      const ex=exercises.find(e=>e.id===exId); if(!ex) return null;
                      const sets=activeSession.sets[exId]||[];
                      const allDone=sets.length>0&&sets.every(s=>s.done);
                      return(
                        <Card key={exId} style={allDone?{border:`1.5px solid ${C.sage}55`,background:C.sageDim}:{}}>
                          <div style={{marginBottom:10}}>
                            <div style={{fontSize:13,fontWeight:500,color:allDone?C.sage:C.text}}>{ex.name}</div>
                            <div style={{fontSize:10,color:C.muted,marginTop:2}}>{ex.tip}</div>
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"22px 1fr 1fr 36px 28px",gap:5,alignItems:"center",marginBottom:8}}>
                            <div style={{fontSize:9,color:C.muted}}>#</div>
                            <div style={{fontSize:9,color:C.muted}}>KG</div>
                            <div style={{fontSize:9,color:C.muted}}>WDHL</div>
                            <div/><div/>
                            {sets.map((s,i)=>(
                              <>
                                <div key={"n"+i} style={{fontSize:11,color:C.muted,textAlign:"center"}}>{i+1}</div>
                                <input key={"w"+i} type="number" placeholder="—" value={s.weight}
                                  onChange={e=>updateSet(exId,i,"weight",e.target.value)}
                                  style={{background:C.warm,border:`1.5px solid ${C.border}`,borderRadius:8,
                                    padding:"7px 6px",color:C.text,fontFamily:"inherit",fontSize:12,
                                    outline:"none",textAlign:"center",width:"100%",boxSizing:"border-box"}}/>
                                <input key={"r"+i} type="number" placeholder="—" value={s.reps}
                                  onChange={e=>updateSet(exId,i,"reps",e.target.value)}
                                  style={{background:C.warm,border:`1.5px solid ${C.border}`,borderRadius:8,
                                    padding:"7px 6px",color:C.text,fontFamily:"inherit",fontSize:12,
                                    outline:"none",textAlign:"center",width:"100%",boxSizing:"border-box"}}/>
                                <CheckBtn key={"c"+i} done={s.done} onClick={()=>toggleSet(exId,i)} color={C.sage}/>
                                <button key={"del"+i} onClick={()=>removeSet(exId,i)} style={{
                                  background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:16,padding:"2px",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                              </>
                            ))}
                          </div>
                          <button onClick={()=>addSet(exId)} style={{background:"transparent",border:`1.5px dashed ${C.border2}`,borderRadius:8,padding:"6px",width:"100%",color:C.muted,fontFamily:"inherit",fontSize:11,cursor:"pointer"}}>
                            + Satz hinzufügen
                          </button>
                        </Card>
                      );
                    })}
                    <Inp placeholder="Notiz zum Training (optional)" value={sessionNote} onChange={e=>setSessionNote(e.target.value)} style={{marginBottom:10,marginTop:4}}/>
                    <Btn onClick={finishWorkout} style={{width:"100%",background:C.sage,marginBottom:8}}>Training abschließen ✓</Btn>
                    <Btn onClick={()=>{setActiveSession(null);syncSession(null);setWorkoutTab("plans");}} variant="ghost" style={{width:"100%"}}>Abbrechen</Btn>
                  </>
                }
              </>
            )}

            {workoutTab==="verlauf"&&(
              <>
                <SectionLabel>Trainings-Verlauf</SectionLabel>
                {Object.keys(wLog).filter(k=>wLog[k]?.length>0).sort((a,b)=>b.localeCompare(a)).slice(0,14).map(dateKey=>{
                  const entries=wLog[dateKey]||[];
                  const isToday=dateKey===todayKey();
                  return(
                    <div key={dateKey} style={{marginBottom:14}}>
                      <div style={{fontSize:11,color:isToday?C.accent:C.muted,fontFamily:"'Fraunces',serif",marginBottom:8}}>
                        {isToday?"Heute":fmtDate(dateKey)}
                      </div>
                      {entries.map(e=>{
                        const dur=Math.round((new Date(e.endTs)-new Date(e.startTs))/60000);
                        const totalSets=Object.values(e.sets).reduce((a,s)=>a+s.filter(x=>x.done).length,0);
                        return(
                          <Card key={e.id}>
                            <div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:4}}>{e.workoutName}</div>
                            <div style={{fontSize:11,color:C.muted}}>{dur} min · {totalSets} Sätze abgeschlossen</div>
                            {e.note&&<div style={{fontSize:11,color:C.sub,marginTop:6,fontStyle:"italic"}}>„{e.note}"</div>}
                          </Card>
                        );
                      })}
                    </div>
                  );
                })}
                {Object.keys(wLog).length===0&&<div style={{textAlign:"center",color:C.muted,padding:"40px 0",fontSize:13}}>Noch kein Training — leg los! 💪</div>}
              </>
            )}
          </>
        )}

        {/* ── GEWICHT ── */}
        {page==="gewicht"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
              {[
                {label:"Aktuell",value:latestW?`${latestW.weight} kg`:"—",color:C.accent},
                {label:"Gesamt",value:totalGain!==null?`${parseFloat(totalGain)>=0?"+":""}${totalGain} kg`:"—",color:C.peach},
                {label:"Einträge",value:sortedW.length,color:C.sage},
              ].map(s=>(
                <div key={s.label} style={{background:C.card,border:`1.5px solid ${C.border}`,borderRadius:14,padding:"12px 10px",textAlign:"center"}}>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:20,color:s.color,fontWeight:600}}>{s.value}</div>
                  <div style={{fontSize:9,color:C.muted,marginTop:2,letterSpacing:"0.1em",textTransform:"uppercase"}}>{s.label}</div>
                </div>
              ))}
            </div>
            <Card>
              <div style={{fontSize:11,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10,fontFamily:"'Fraunces',serif"}}>Heute eintragen</div>
              <div style={{display:"flex",gap:8}}>
                <Inp type="number" placeholder="kg" value={wInput} onChange={e=>setWInput(e.target.value)} style={{fontSize:18,fontFamily:"'Fraunces',serif",fontWeight:400}}/>
                <Btn onClick={addWeight} style={{flexShrink:0,padding:"9px 18px"}}>Speichern</Btn>
              </div>
            </Card>
            {sortedW.length>1&&(
              <Card>
                <div style={{fontSize:11,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10,fontFamily:"'Fraunces',serif"}}>Verlauf</div>
                <svg width={chartW} height={chartH} style={{display:"block",margin:"0 auto",overflow:"visible"}}>
                  {[0,0.5,1].map(t=>{const y=padT+iH*(1-t);return<line key={t} x1={padL} y1={y} x2={padL+iW} y2={y} stroke={C.border} strokeWidth={1}/>;} )}
                  <defs><linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.accent} stopOpacity="0.15"/><stop offset="100%" stopColor={C.accent} stopOpacity="0"/></linearGradient></defs>
                  <polygon points={`${toX(0)},${padT+iH} ${pts} ${toX(sortedW.length-1)},${padT+iH}`} fill="url(#wgrad)"/>
                  <polyline points={pts} fill="none" stroke={C.accent} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
                  {sortedW.map((e,i)=>(<circle key={e.date} cx={toX(i)} cy={toY(e.weight)} r={4} fill={C.accent} stroke="#fff" strokeWidth={2}/>))}
                </svg>
              </Card>
            )}
            <SectionLabel>Alle Einträge</SectionLabel>
            {sortedW.length===0&&<div style={{textAlign:"center",color:C.muted,padding:"20px 0",fontSize:13}}>Noch keine Einträge</div>}
            {[...sortedW].reverse().map(e=>(
              <div key={e.date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"11px 14px",marginBottom:7}}>
                <div style={{fontSize:11,color:C.muted}}>{fmtDateShort(e.date)}</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:18,color:C.accent,fontWeight:600}}>{e.weight} kg</div>
                <button onClick={()=>{const next=weightLog.filter(x=>x.date!==e.date);setWeightLog(next);syncWeightLog(next);}}
                  style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:16,padding:4}}>×</button>
              </div>
            ))}
          </>
        )}

        {/* ── INSPO ── */}
        {page==="inspo"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <SectionLabel>Deine Vorbilder</SectionLabel>
              <Btn onClick={()=>setShowAddInspo(v=>!v)} variant="soft" style={{padding:"6px 14px",fontSize:11}}>+ hinzufügen</Btn>
            </div>
            {showAddInspo&&(
              <Card style={{border:`1.5px solid ${C.accent}44`,background:"#fff8fa",marginBottom:14}}>
                <Inp placeholder="Name" value={newInspo.name} onChange={e=>setNewInspo(p=>({...p,name:e.target.value}))} style={{marginBottom:8}}/>
                <textarea value={newInspo.quote} onChange={e=>setNewInspo(p=>({...p,quote:e.target.value}))}
                  placeholder="Zitat oder was sie in dir auslöst…" rows={3}
                  style={{background:C.warm,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"9px 12px",color:C.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none",resize:"none",width:"100%",boxSizing:"border-box",marginBottom:10}}/>
                <Btn onClick={addInspoEntry} style={{width:"100%"}}>Speichern</Btn>
              </Card>
            )}
            {inspo.length===0&&!showAddInspo&&(
              <div style={{textAlign:"center",color:C.muted,padding:"40px 0",fontSize:13,lineHeight:2}}>Füge Vorbilder hinzu die dich antreiben ✨</div>
            )}
            {inspo.map(p=>(
              <div key={p.id} style={{background:"linear-gradient(135deg,#fff5f8,#fdf0f8)",border:`1.5px solid ${C.accent}22`,borderRadius:16,padding:"18px 16px",marginBottom:10,boxShadow:`0 4px 20px ${C.accent}0a`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:17,color:C.accent,fontStyle:"italic",marginBottom:8}}>✦ {p.name}</div>
                    {p.quote&&(<div style={{fontSize:13,color:C.sub,lineHeight:1.7,borderLeft:`2px solid ${C.accent}44`,paddingLeft:12,fontStyle:"italic"}}>„{p.quote}"</div>)}
                  </div>
                  <button onClick={()=>deleteInspo(p.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,padding:4,fontSize:16}}>×</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.cream,borderTop:`1.5px solid ${C.border}`,display:"flex",boxShadow:"0 -4px 20px #e8829a0a"}}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setPage(n.id)} style={{
            flex:1,padding:"10px 4px 12px",background:"transparent",border:"none",
            color:page===n.id?C.accent:C.muted,cursor:"pointer",
            borderTop:page===n.id?`2px solid ${C.accent}`:"2px solid transparent",
            transition:"all 0.15s",
          }}>
            <div style={{fontSize:18,marginBottom:2}}>{n.icon}</div>
            <div style={{fontSize:9,fontFamily:"'DM Sans',sans-serif",fontWeight:500,letterSpacing:"0.05em"}}>{n.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
