/* Charan's Study Bot v5 — All bugs fixed + improvements */
const {useState,useEffect,useRef,useCallback}=React;
const API_URL="/api/chat";
const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const EXAM_DATES={GATE:new Date("2027-02-01"),UPSC:new Date("2026-05-24")};
const QUOTES=[
  {text:"Success is the sum of small efforts repeated day in and day out.",author:"Robert Collier"},
  {text:"The expert in anything was once a beginner.",author:"Helen Hayes"},
  {text:"It always seems impossible until it's done.",author:"Nelson Mandela"},
  {text:"Hard work beats talent when talent doesn't work hard.",author:"Tim Notke"},
  {text:"GATE and UPSC together? That's not ambition — that's legend.",author:"Your Study Bot"},
  {text:"One day or day one. You decide.",author:"Unknown"},
  {text:"Discipline is choosing between what you want now and what you want most.",author:"Unknown"},
  {text:"Don't watch the clock; do what it does. Keep going.",author:"Sam Levenson"},
  {text:"Your future self is watching you right now through your memories.",author:"Unknown"},
];
const ALL_BADGES=[
  {id:"b1",icon:"🔥",label:"First Flame",desc:"Complete all study tasks in a day",cond:s=>s.streak>=1},
  {id:"b2",icon:"⚡",label:"7-Day Streak",desc:"7 consecutive days",cond:s=>s.streak>=7},
  {id:"b3",icon:"💎",label:"14-Day Diamond",desc:"14 consecutive days",cond:s=>s.streak>=14},
  {id:"b4",icon:"👑",label:"30-Day Legend",desc:"30 consecutive days",cond:s=>s.streak>=30},
  // FIX: badges use allTime counters — never lost when correcting counts
  {id:"b5",icon:"💻",label:"DSA Starter",desc:"Solve 10 problems",cond:s=>s.atDsa>=10},
  {id:"b6",icon:"🧠",label:"DSA Warrior",desc:"Solve 50 problems",cond:s=>s.atDsa>=50},
  {id:"b7",icon:"🏆",label:"DSA Master",desc:"Solve 100 problems",cond:s=>s.atDsa>=100},
  {id:"b8",icon:"📖",label:"Polity Starter",desc:"Watch 10 lectures",cond:s=>s.atUpsc>=10},
  {id:"b9",icon:"🇮🇳",label:"Polity Scholar",desc:"Watch 30 lectures",cond:s=>s.atUpsc>=30},
  {id:"b10",icon:"🎯",label:"Polity Master",desc:"Watch 60 lectures",cond:s=>s.atUpsc>=60},
  {id:"b11",icon:"📚",label:"GATE Focused",desc:"7 days of GATE study",cond:s=>s.gateDays>=7},
  {id:"b12",icon:"🏖️",label:"Well Deserved",desc:"Take a holiday — rest is part of the plan!",cond:s=>s.holidays>=1},
];
const DS={
  Monday:[
    {id:"mo1",time:"6:00–7:30 AM",task:"Badminton",cat:"routine",icon:"🏸"},
    {id:"mo2",time:"7:30–9:00 AM",task:"Get Ready + Breakfast",cat:"routine",icon:"🧴"},
    {id:"mo3",time:"9:00–10:00 AM",task:"Cloud Computing Class",cat:"college",icon:"📡"},
    {id:"mo4",time:"10:00–11:00 AM",task:"IoT Class",cat:"college",icon:"🌐"},
    {id:"mo5",time:"11:00–12:00 PM",task:"Revise GATE + UPSC",cat:"study",icon:"📝"},
    {id:"mo6",time:"12:00–1:45 PM",task:"GATE Study – Data Structures",cat:"gate",icon:"📚"},
    {id:"mo7",time:"1:45–3:00 PM",task:"CC Tutorial",cat:"college",icon:"📡"},
    {id:"mo8",time:"3:00–6:00 PM",task:"Striver DSA – 4 Problems",cat:"dsa",icon:"💻"},
    {id:"mo9",time:"6:00–8:30 PM",task:"UPSC Polity – Evening",cat:"upsc",icon:"🇮🇳"},
    {id:"mo10",time:"8:30–9:00 PM",task:"Dinner",cat:"routine",icon:"🍽️"},
    {id:"mo11",time:"9:00–11:30 PM",task:"UPSC Polity – Night",cat:"upsc",icon:"🇮🇳"},
  ],
  Tuesday:[
    {id:"tu1",time:"6:00–7:30 AM",task:"Badminton",cat:"routine",icon:"🏸"},
    {id:"tu2",time:"7:30–9:00 AM",task:"Get Ready + Breakfast",cat:"routine",icon:"🧴"},
    {id:"tu3",time:"9:00–10:00 AM",task:"Cloud Computing Class",cat:"college",icon:"📡"},
    {id:"tu4",time:"10:00–11:00 AM",task:"Data Mining Class",cat:"college",icon:"🗄️"},
    {id:"tu5",time:"11:00–12:00 PM",task:"Formal Methods Class",cat:"college",icon:"📐"},
    {id:"tu6",time:"12:00–1:00 PM",task:"Lunch",cat:"routine",icon:"🍽️"},
    {id:"tu7",time:"1:00–3:00 PM",task:"Revise GATE + UPSC",cat:"study",icon:"📝"},
    {id:"tu8",time:"3:00–4:00 PM",task:"Data Mining Tutorial",cat:"college",icon:"🗄️"},
    {id:"tu9",time:"4:00–5:00 PM",task:"Formal Methods Tutorial",cat:"college",icon:"📐"},
    {id:"tu10",time:"5:00–6:00 PM",task:"Striver DSA – 4 Problems",cat:"dsa",icon:"💻"},
    {id:"tu11",time:"6:00–8:30 PM",task:"UPSC Polity – Evening",cat:"upsc",icon:"🇮🇳"},
    {id:"tu12",time:"8:30–9:00 PM",task:"Dinner",cat:"routine",icon:"🍽️"},
    {id:"tu13",time:"9:00–11:30 PM",task:"UPSC Polity – Night",cat:"upsc",icon:"🇮🇳"},
  ],
  Wednesday:[
    {id:"we1",time:"6:00–7:30 AM",task:"Badminton",cat:"routine",icon:"🏸"},
    {id:"we2",time:"7:30–9:00 AM",task:"Get Ready + Breakfast",cat:"routine",icon:"🧴"},
    {id:"we3",time:"10:00–11:00 AM",task:"IoT Class",cat:"college",icon:"🌐"},
    {id:"we4",time:"11:00–12:00 PM",task:"Data Mining Tutorial",cat:"college",icon:"🗄️"},
    {id:"we5",time:"12:00–1:00 PM",task:"Formal Methods Class",cat:"college",icon:"📐"},
    {id:"we6",time:"2:00–3:00 PM",task:"Revise GATE + UPSC",cat:"study",icon:"📝"},
    {id:"we7",time:"3:00–4:00 PM",task:"IoT Tutorial",cat:"college",icon:"🌐"},
    {id:"we8",time:"4:00–6:00 PM",task:"Striver DSA – 4 Problems",cat:"dsa",icon:"💻"},
    {id:"we9",time:"6:00–8:30 PM",task:"UPSC Polity – Evening",cat:"upsc",icon:"🇮🇳"},
    {id:"we10",time:"8:30–9:00 PM",task:"Dinner",cat:"routine",icon:"🍽️"},
    {id:"we11",time:"9:00–11:30 PM",task:"UPSC Polity – Night",cat:"upsc",icon:"🇮🇳"},
  ],
  Thursday:[
    {id:"th1",time:"6:00–7:30 AM",task:"Badminton",cat:"routine",icon:"🏸"},
    {id:"th2",time:"7:30–9:00 AM",task:"Get Ready + Breakfast",cat:"routine",icon:"🧴"},
    {id:"th3",time:"9:00–10:00 AM",task:"Cloud Computing Class",cat:"college",icon:"📡"},
    {id:"th4",time:"10:00–11:00 AM",task:"Data Mining Class",cat:"college",icon:"🗄️"},
    {id:"th5",time:"11:00–12:00 PM",task:"IoT Class",cat:"college",icon:"🌐"},
    {id:"th6",time:"12:00–2:00 PM",task:"Revise GATE + GATE Study (2 hrs)",cat:"gate",icon:"📚"},
    {id:"th7",time:"3:00–6:00 PM",task:"Striver DSA – 4 Problems",cat:"dsa",icon:"💻"},
    {id:"th8",time:"6:00–8:30 PM",task:"UPSC Polity – Evening",cat:"upsc",icon:"🇮🇳"},
    {id:"th9",time:"8:30–9:00 PM",task:"Dinner",cat:"routine",icon:"🍽️"},
    {id:"th10",time:"9:00–11:30 PM",task:"UPSC Polity – Night",cat:"upsc",icon:"🇮🇳"},
  ],
  Friday:[
    {id:"fr1",time:"6:00–7:30 AM",task:"Badminton",cat:"routine",icon:"🏸"},
    {id:"fr2",time:"7:30–9:00 AM",task:"Get Ready + Breakfast",cat:"routine",icon:"🧴"},
    {id:"fr3",time:"10:00–11:00 AM",task:"Data Mining Class",cat:"college",icon:"🗄️"},
    {id:"fr4",time:"11:00–12:00 PM",task:"Revise GATE + UPSC",cat:"study",icon:"📝"},
    {id:"fr5",time:"12:00–1:00 PM",task:"Formal Methods Class",cat:"college",icon:"📐"},
    {id:"fr6",time:"2:00–4:00 PM",task:"GATE Study (2 hrs)",cat:"gate",icon:"📚"},
    {id:"fr7",time:"4:00–6:00 PM",task:"Striver DSA – 4 Problems",cat:"dsa",icon:"💻"},
    {id:"fr8",time:"6:00–8:30 PM",task:"UPSC Polity – Evening",cat:"upsc",icon:"🇮🇳"},
    {id:"fr9",time:"8:30–9:00 PM",task:"Dinner",cat:"routine",icon:"🍽️"},
    {id:"fr10",time:"9:00–11:30 PM",task:"UPSC Polity – Night",cat:"upsc",icon:"🇮🇳"},
  ],
  Saturday:[
    {id:"sa1",time:"6:00–7:30 AM",task:"Badminton",cat:"routine",icon:"🏸"},
    {id:"sa2",time:"7:30–9:00 AM",task:"Get Ready + Breakfast",cat:"routine",icon:"🧴"},
    {id:"sa3",time:"9:00–10:30 AM",task:"Weekly Revision + Planning",cat:"study",icon:"📊"},
    {id:"sa4",time:"10:30 AM–1:30 PM",task:"GATE Study (3 hrs)",cat:"gate",icon:"📚"},
    {id:"sa5",time:"1:30–2:00 PM",task:"Lunch",cat:"routine",icon:"🍽️"},
    {id:"sa6",time:"2:00–4:00 PM",task:"Striver DSA – 4 Problems",cat:"dsa",icon:"💻"},
    {id:"sa7",time:"4:00–6:30 PM",task:"UPSC Polity – Evening",cat:"upsc",icon:"🇮🇳"},
    {id:"sa8",time:"8:30–9:00 PM",task:"Dinner",cat:"routine",icon:"🍽️"},
    {id:"sa9",time:"9:00–11:30 PM",task:"UPSC Polity – Night",cat:"upsc",icon:"🇮🇳"},
  ],
  Sunday:[
    {id:"su1",time:"6:00–7:30 AM",task:"Badminton",cat:"routine",icon:"🏸"},
    {id:"su2",time:"7:30–9:00 AM",task:"Get Ready + Breakfast",cat:"routine",icon:"🧴"},
    {id:"su3",time:"9:00–10:30 AM",task:"Weekly Revision + Planning",cat:"study",icon:"📊"},
    {id:"su4",time:"10:30 AM–1:30 PM",task:"GATE Study (3 hrs)",cat:"gate",icon:"📚"},
    {id:"su5",time:"1:30–2:00 PM",task:"Lunch",cat:"routine",icon:"🍽️"},
    {id:"su6",time:"2:00–4:00 PM",task:"Striver DSA – 4 Problems",cat:"dsa",icon:"💻"},
    {id:"su7",time:"4:00–6:30 PM",task:"UPSC Polity – Evening",cat:"upsc",icon:"🇮🇳"},
    {id:"su8",time:"8:30–9:00 PM",task:"Dinner",cat:"routine",icon:"🍽️"},
    {id:"su9",time:"9:00–11:30 PM",task:"UPSC Polity – Night",cat:"upsc",icon:"🇮🇳"},
  ],
};
const DG=[
  {id:"mg1",text:"Complete GATE Data Structures (GoClasses) by 18th April",cat:"gate"},
  {id:"mg2",text:"Start GATE Algorithms after 18th April",cat:"gate"},
  {id:"mg3",text:"Complete Binary Search on Striver DSA Sheet",cat:"dsa"},
  {id:"mg4",text:"Complete Strings on Striver DSA Sheet",cat:"dsa"},
  {id:"mg5",text:"Watch 60/180 UPSC Polity lectures by April 30",cat:"upsc"},
];
const DT={gate:"3 hrs/day",dsa:"4 problems/day",upsc:"5 hrs/day"};
const CAT={
  routine:{bg:"#0f172a",border:"#1e293b",accent:"#475569",label:"Routine"},
  college:{bg:"#0c1a2e",border:"#1e3a5f",accent:"#3b82f6",label:"College"},
  gate:{bg:"#0a1f0a",border:"#1a3a1a",accent:"#22c55e",label:"GATE"},
  dsa:{bg:"#160d2e",border:"#2d1b4e",accent:"#a855f7",label:"DSA"},
  upsc:{bg:"#1f0d0d",border:"#3b1f1f",accent:"#f97316",label:"UPSC"},
  study:{bg:"#0a1a22",border:"#1e2d3b",accent:"#06b6d4",label:"Study"},
};
const ls={
  get:(k,d)=>{try{const v=localStorage.getItem(k);return v!==null?JSON.parse(v):d;}catch{return d;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
  del:(k)=>{try{localStorage.removeItem(k);}catch{}},
};
const ts=()=>new Date().toISOString().split("T")[0];
const gdd=n=>{const t=new Date(),d=new Date(t);d.setDate(t.getDate()+DAYS.indexOf(n)-t.getDay());return d;};
const fs=d=>d.toLocaleDateString("en-IN",{day:"numeric",month:"short"});
const ff=d=>d.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const fdl=s=>new Date(s+"T12:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
const du=d=>Math.ceil((d-new Date())/(864e5));
const gi=()=>"id_"+Date.now()+"_"+Math.random().toString(36).slice(2,6);
const recentDates=(n=7)=>{const a=[];for(let i=1;i<=n;i++){const d=new Date();d.setDate(d.getDate()-i);a.push(d.toISOString().split("T")[0]);}return a;};

function Ring({pct,size=80,stroke=6,color="#22c55e",label,sub}){
  const r=(size-stroke*2)/2,c=2*Math.PI*r,d=(pct/100)*c;
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:3}},
    React.createElement("div",{style:{position:"relative",width:size,height:size}},
      React.createElement("svg",{width:size,height:size,style:{transform:"rotate(-90deg)",position:"absolute"}},
        React.createElement("circle",{cx:size/2,cy:size/2,r,fill:"none",stroke:"#1e293b",strokeWidth:stroke}),
        React.createElement("circle",{cx:size/2,cy:size/2,r,fill:"none",stroke:color,strokeWidth:stroke,strokeDasharray:`${d} ${c}`,strokeLinecap:"round",style:{transition:"stroke-dasharray 0.7s ease"}})
      ),
      React.createElement("div",{style:{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}},
        React.createElement("span",{style:{fontSize:size>70?16:12,fontWeight:700,color,fontFamily:"'JetBrains Mono',monospace"}},pct+"%"),
        sub&&React.createElement("span",{style:{fontSize:9,color:"#475569",marginTop:1}},sub)
      )
    ),
    label&&React.createElement("span",{style:{fontSize:10,color:"#64748b",fontWeight:600}},label)
  );
}

function Countdown({label,date,color,icon}){
  const days=du(date),m=Math.floor(days/30),r=days%30;
  return React.createElement("div",{style:{flex:1,background:"#0a1628",border:`1px solid ${color}22`,borderRadius:12,padding:"12px",overflow:"hidden",position:"relative"}},
    React.createElement("div",{style:{position:"absolute",top:-8,right:-8,fontSize:44,opacity:0.06}},icon),
    React.createElement("div",{style:{fontSize:9,color:"#334155",letterSpacing:1,textTransform:"uppercase",marginBottom:4}},label),
    React.createElement("div",{style:{display:"flex",alignItems:"baseline",gap:3}},
      React.createElement("span",{style:{fontSize:28,fontWeight:700,color,fontFamily:"'JetBrains Mono',monospace",lineHeight:1}},days),
      React.createElement("span",{style:{fontSize:11,color:"#475569"}}," days")
    ),
    React.createElement("div",{style:{fontSize:10,color:"#334155",marginTop:3}},m>0?`${m}m ${r}d left`:date.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})),
    React.createElement("div",{style:{marginTop:6,height:2,background:"#1e293b",borderRadius:1}},
      React.createElement("div",{style:{height:"100%",width:`${Math.min(100,Math.max(2,100-days/365*100))}%`,background:color,borderRadius:1}})
    )
  );
}

function StreakBar({streak}){
  const color=streak>=30?"#fbbf24":streak>=14?"#f97316":streak>=7?"#fb923c":"#ef4444";
  const next=streak<7?7:streak<14?14:streak<30?30:null;
  const msg=streak===0?"Start your streak today!":next?`${next-streak} more days to ${next===7?"⚡":next===14?"💎":"👑"} badge`:"You're a legend 👑";
  return React.createElement("div",{style:{background:"linear-gradient(135deg,#150800,#0a0400)",border:`1px solid ${color}33`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:12}},
    React.createElement("span",{className:streak>0?"flame":"",style:{fontSize:30}},streak>0?"🔥":"💤"),
    React.createElement("div",{style:{flex:1}},
      React.createElement("div",{style:{display:"flex",alignItems:"baseline",gap:6}},
        React.createElement("span",{style:{fontSize:24,fontWeight:700,color,fontFamily:"'JetBrains Mono',monospace"}},streak),
        React.createElement("span",{style:{fontSize:11,color:"#6b3a00"}}," day streak")
      ),
      React.createElement("div",{style:{fontSize:10,color:"#6b3a00",marginTop:1}},msg)
    ),
    React.createElement("div",{style:{textAlign:"right"}},
      React.createElement("div",{style:{fontSize:9,color:"#6b3a00"}},"Best"),
      React.createElement("div",{style:{fontSize:16,fontWeight:700,color,fontFamily:"'JetBrains Mono',monospace"}},ls.get("best_streak",0))
    )
  );
}

function Counter({label,count,allTime,color,bg,border,onInc,onDec,onSet,target,unit}){
  const [editing,setEditing]=useState(false);
  const [val,setVal]=useState(String(count));
  const pct=Math.min(100,Math.round((count/(target||60))*100));
  return React.createElement("div",{style:{padding:14,background:bg,borderRadius:14,border:`1px solid ${border}`}},
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}},
      React.createElement("div",null,
        React.createElement("div",{style:{fontSize:13,fontWeight:700,color}},label),
        React.createElement("div",{style:{fontSize:10,color:"#475569",marginTop:2}},`All-time: ${allTime} ${unit} (badges never lost)`)
      ),
      React.createElement("div",{style:{display:"flex",alignItems:"baseline",gap:4}},
        React.createElement("span",{style:{fontSize:28,fontWeight:700,color,fontFamily:"'JetBrains Mono',monospace"}},count),
        target&&React.createElement("span",{style:{fontSize:13,color:"#475569"}},`/${target}`)
      )
    ),
    React.createElement("div",{style:{height:6,background:"#1e293b",borderRadius:3,overflow:"hidden",marginBottom:12}},
      React.createElement("div",{style:{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${color},${color}cc)`,borderRadius:3,transition:"width 0.5s"}})
    ),
    React.createElement("div",{style:{display:"flex",gap:6,alignItems:"center"}},
      React.createElement("button",{onClick:onInc,style:{flex:2,padding:"8px",background:color+"22",border:`1px solid ${color}44`,borderRadius:8,color,fontSize:13,fontWeight:700,cursor:"pointer"}},"+1"),
      React.createElement("button",{onClick:onDec,disabled:count<=0,style:{flex:1,padding:"8px",background:"transparent",border:"1px solid #1e293b",borderRadius:8,color:"#475569",fontSize:13,cursor:count>0?"pointer":"not-allowed",opacity:count>0?1:0.4}},"−1"),
      editing
        ? React.createElement("div",{style:{flex:2,display:"flex",gap:4}},
            React.createElement("input",{value:val,onChange:e=>setVal(e.target.value),type:"number",min:"0",style:{flex:1,padding:"6px 8px",background:"#0a1628",border:`1px solid ${color}`,borderRadius:8,color:"#e2e8f0",fontSize:12,width:60}}),
            React.createElement("button",{onClick:()=>{const n=parseInt(val);if(!isNaN(n)&&n>=0)onSet(n);setEditing(false);},style:{padding:"6px 10px",background:color,border:"none",borderRadius:8,color:"#000",fontSize:12,fontWeight:700,cursor:"pointer"}},"✓")
          )
        : React.createElement("button",{onClick:()=>{setVal(String(count));setEditing(true);},style:{flex:2,padding:"8px",background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#64748b",fontSize:11,cursor:"pointer"}},"Set exact #")
    )
  );
}

function HistoryDay({dateKey,getSchedForDate,getDoneForDate,holidays,onMarkHoliday,onUnmarkHoliday}){
  const [exp,setExp]=useState(false);
  const isHol=holidays.includes(dateKey);
  const sched=getSchedForDate(dateKey).filter(t=>["gate","dsa","upsc","study"].includes(t.cat));
  const dd=getDoneForDate(dateKey);
  const done=sched.filter(t=>dd[t.id]);
  const pend=sched.filter(t=>!dd[t.id]);
  const pct=isHol?100:sched.length?Math.round(done.length/sched.length*100):0;
  const barColor=isHol?"#f97316":pct===100?"#22c55e":pct>50?"#a855f7":"#334155";
  return React.createElement("div",{style:{marginBottom:8,background:"#0a1628",borderRadius:12,border:`1px solid ${isHol?"#f9731422":pct===100?"#22c55e22":"#1e293b"}`,overflow:"hidden"}},
    React.createElement("div",{onClick:()=>setExp(!exp),style:{padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10}},
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"#e2e8f0"}},fdl(dateKey)),
        React.createElement("div",{style:{fontSize:10,color:"#334155",marginTop:2}},isHol?"🏖️ Holiday":sched.length===0?"No tasks recorded":pct===100?`✅ All ${sched.length} tasks done!`:`${done.length}/${sched.length} tasks done`)
      ),
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
        React.createElement("div",{style:{width:50,height:4,background:"#1e293b",borderRadius:2,overflow:"hidden"}},
          React.createElement("div",{style:{height:"100%",width:`${pct}%`,background:barColor,borderRadius:2}})
        ),
        React.createElement("span",{style:{fontSize:12,fontWeight:700,color:barColor,fontFamily:"'JetBrains Mono',monospace"}},isHol?"🏖️":`${pct}%`),
        React.createElement("span",{style:{fontSize:10,color:"#334155"}},exp?"▲":"▼")
      )
    ),
    exp&&React.createElement("div",{style:{padding:"0 14px 12px"}},
      done.length>0&&React.createElement("div",{style:{marginBottom:8}},
        React.createElement("div",{style:{fontSize:10,color:"#22c55e",marginBottom:4,letterSpacing:1}},"✅ COMPLETED"),
        done.map(t=>React.createElement("div",{key:t.id,style:{fontSize:12,color:"#4ade80",padding:"2px 0"}},`• ${t.task}`))
      ),
      pend.length>0&&React.createElement("div",null,
        React.createElement("div",{style:{fontSize:10,color:"#f97316",marginBottom:4,letterSpacing:1}},"⏳ PENDING"),
        pend.map(t=>React.createElement("div",{key:t.id,style:{fontSize:12,color:"#fed7aa",padding:"2px 0"}},`• ${t.task}`))
      ),
      done.length===0&&pend.length===0&&!isHol&&React.createElement("div",{style:{fontSize:12,color:"#334155"}},"No study tasks recorded for this day"),
      React.createElement("div",{style:{marginTop:10,display:"flex",gap:8}},
        isHol
          ? React.createElement("button",{onClick:()=>onUnmarkHoliday(dateKey),style:{padding:"6px 12px",background:"transparent",border:"1px solid #f9731444",borderRadius:8,color:"#f97316",fontSize:11,cursor:"pointer"}},"Remove holiday")
          : React.createElement("button",{onClick:()=>onMarkHoliday(dateKey),style:{padding:"6px 12px",background:"#1f0d0d",border:"1px solid #f9731422",borderRadius:8,color:"#7c3a00",fontSize:11,cursor:"pointer"}},"🏖️ Mark as holiday")
      )
    )
  );
}

function App(){
  const today=new Date();
  const todayName=DAYS[today.getDay()];
  const tKey=ts();

  const [tab,setTab]=useState("tasks");
  const [activeDay,setActiveDay]=useState(todayName);
  const [sched,setSched]=useState(()=>ls.get("sched_v5",DS));
  const [goals,setGoals]=useState(()=>ls.get("goals_v5",DG));
  const [targets,setTargets]=useState(()=>ls.get("targets_v5",DT));
  const [wplan,setWplan]=useState(()=>ls.get("wplan_v5",""));
  // FIX: holidays stored as array of date strings
  const [hols,setHols]=useState(()=>ls.get("hols_v5",[]));
  const [done,setDone]=useState(()=>ls.get("done_"+tKey,{}));
  // FIX: carried only loads if today is not a holiday
  const [carried,setCarried]=useState(()=>ls.get("hols_v5",[]).includes(ts())?[]:ls.get("carried_"+tKey,[]));
  // FIX: separate current count (editable) from allTime (badges, never decreases)
  const [upsc,setUpsc]=useState(()=>ls.get("upsc_v5",0));
  const [atUpsc,setAtUpsc]=useState(()=>ls.get("at_upsc_v5",0));
  const [dsa,setDsa]=useState(()=>ls.get("dsa_v5",0));
  const [atDsa,setAtDsa]=useState(()=>ls.get("at_dsa_v5",0));
  const [streak,setStreak]=useState(()=>ls.get("streak_v5",0));
  const [gateDays,setGateDays]=useState(()=>ls.get("gate_days_v5",0));
  const [holsTaken,setHolsTaken]=useState(()=>ls.get("hols_taken_v5",0));
  const [msgs,setMsgs]=useState([]);
  const [inp,setInp]=useState("");
  const [loading,setLoading]=useState(false);
  const [toast,setToast]=useState(null);
  const [badge,setBadge]=useState(null);
  const [genning,setGenning]=useState(false);
  const [holConfirm,setHolConfirm]=useState(false);
  const [quote]=useState(()=>QUOTES[Math.floor(Math.random()*QUOTES.length)]);
  const chatEnd=useRef(null);

  useEffect(()=>ls.set("sched_v5",sched),[sched]);
  useEffect(()=>ls.set("goals_v5",goals),[goals]);
  useEffect(()=>ls.set("targets_v5",targets),[targets]);
  useEffect(()=>ls.set("wplan_v5",wplan),[wplan]);
  useEffect(()=>ls.set("hols_v5",hols),[hols]);
  useEffect(()=>ls.set("done_"+tKey,done),[done,tKey]);
  useEffect(()=>ls.set("upsc_v5",upsc),[upsc]);
  useEffect(()=>ls.set("at_upsc_v5",atUpsc),[atUpsc]);
  useEffect(()=>ls.set("dsa_v5",dsa),[dsa]);
  useEffect(()=>ls.set("at_dsa_v5",atDsa),[atDsa]);
  useEffect(()=>ls.set("streak_v5",streak),[streak]);
  useEffect(()=>ls.set("gate_days_v5",gateDays),[gateDays]);
  useEffect(()=>ls.set("hols_taken_v5",holsTaken),[holsTaken]);
  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  // FIX: streak — skip holidays
  useEffect(()=>{
    const last=ls.get("last_active_v5","");
    const yest=new Date(today);yest.setDate(today.getDate()-1);
    const yKey=yest.toISOString().split("T")[0];
    const h=ls.get("hols_v5",[]);
    if(last&&last!==tKey&&last!==yKey&&!h.includes(yKey)){setStreak(0);ls.set("streak_v5",0);}
  },[]);

  // Badge check using allTime counters
  const bStats={streak,atDsa,atUpsc,gateDays,holidays:holsTaken};
  const earned=ALL_BADGES.filter(b=>b.cond(bStats));
  useEffect(()=>{
    const prev=ls.get("earned_v5",[]);
    const fresh=earned.filter(b=>!prev.includes(b.id));
    if(fresh.length){setBadge(fresh[0]);ls.set("earned_v5",earned.map(b=>b.id));setTimeout(()=>setBadge(null),4000);}
  },[streak,atDsa,atUpsc,gateDays,holsTaken]);

  // Greeting
  useEffect(()=>{
    const gk="greet_v5_"+tKey;
    const isHol=hols.includes(tKey);
    if(!ls.get(gk,false)){
      setMsgs([{r:"bot",t:isHol
        ?`🏖️ Rest day today, Charan!\n\nEnjoy your holiday — you've earned it.\n⏰ ${du(EXAM_DATES.UPSC)} days to UPSC Prelims.\nYour streak is safe!\n\nCome back tomorrow refreshed! 💪`
        :`🌅 Good morning Charan!\n\n${ff(today)}\n\n🔥 Streak: ${streak} days\n📖 UPSC: ${upsc}/60 | 💻 DSA: ${dsa}\n⏰ ${du(EXAM_DATES.UPSC)} days to UPSC Prelims!\n\nTargets: GATE ${targets.gate} | DSA ${targets.dsa} | UPSC ${targets.upsc}\n\nTry:\n• "Add yoga at 5 AM daily"\n• "Change GATE to 4 hrs"\n• "Mark today as holiday"\n• "Night summary"\n\nLet's crush it! 💪`
      }]);
      ls.set(gk,true);
    }else{
      setMsgs([{r:"bot",t:`👋 Hey Charan! 🔥 ${streak} day streak | 📖 ${upsc}/60 | 💻 ${dsa}\n\nWhat's up?`}]);
    }
  },[]);

  const showT=m=>{setToast(m);setTimeout(()=>setToast(null),2500);};
  const isHolToday=hols.includes(tKey);

  // Counter handlers
  const uI=()=>{setUpsc(p=>p+1);setAtUpsc(p=>p+1);showT("📖 UPSC lecture logged!");};
  const uD=()=>{setUpsc(p=>Math.max(0,p-1));showT("📖 UPSC adjusted (all-time unchanged)");};
  const uS=n=>{setUpsc(n);setAtUpsc(p=>Math.max(p,n));showT(`📖 UPSC set to ${n}`);};
  const dI=()=>{setDsa(p=>p+1);setAtDsa(p=>p+1);showT("💻 DSA problem logged!");};
  const dD=()=>{setDsa(p=>Math.max(0,p-1));showT("💻 DSA adjusted (all-time unchanged)");};
  const dS=n=>{setDsa(n);setAtDsa(p=>Math.max(p,n));showT(`💻 DSA set to ${n}`);};

  // Holiday
  const markHol=(dk)=>{
    if(!hols.includes(dk)){
      const u=[...hols,dk];setHols(u);ls.set("hols_v5",u);
      ls.del("carried_"+dk);
      if(dk===tKey){setCarried([]);}
      setHolsTaken(p=>p+1);
      if(dk===tKey)ls.set("last_active_v5",tKey);
      showT("🏖️ Holiday marked — streak protected!");
    }
  };
  const unmarkHol=(dk)=>{setHols(p=>p.filter(d=>d!==dk));showT("📅 Holiday removed");};

  // Schedule helpers
  const getS=useCallback(day=>{
    const dd=gdd(day),dk=dd.toISOString().split("T")[0];
    if(hols.includes(dk))return[];
    const base=sched[day]||[];
    const c=day===todayName?carried.map(t=>({...t,carried:true})):[];
    return [...c,...base];
  },[sched,carried,todayName,hols]);

  const getSForDate=useCallback(dk=>{
    const d=new Date(dk+"T12:00:00"),dn=DAYS[d.getDay()];
    if(hols.includes(dk))return[];
    return sched[dn]||[];
  },[sched,hols]);

  const getDoneForDate=useCallback(dk=>dk===tKey?done:ls.get("done_"+dk,{}),[done,tKey]);

  const getP=useCallback(day=>{
    const tasks=getS(day).filter(t=>["gate","dsa","upsc","study"].includes(t.cat));
    const dk=gdd(day).toISOString().split("T")[0];
    const d=getDoneForDate(dk);
    const n=tasks.filter(t=>d[t.id]).length;
    return{done:n,total:tasks.length,pct:tasks.length?Math.round(n/tasks.length*100):0};
  },[getS,getDoneForDate]);

  const toggle=id=>{
    const nd={...done,[id]:!done[id]};setDone(nd);
    const tasks=getS(todayName).filter(t=>["gate","dsa","upsc","study"].includes(t.cat));
    if(tasks.every(t=>nd[t.id])){
      const ns=streak+1;setStreak(ns);
      if(ns>ls.get("best_streak",0))ls.set("best_streak",ns);
      ls.set("last_active_v5",tKey);
      showT(`🔥 All done! Streak: ${ns} days!`);
    }else showT(done[id]?"Unmarked":"✅ Done!");
  };

  const applyActs=useCallback(acts=>{
    if(!Array.isArray(acts))return;
    acts.forEach(a=>{
      switch(a.type){
        case "add_task":{const t={id:gi(),time:a.time||"",task:a.task,cat:a.cat||"study",icon:a.icon||"➕"};setSched(p=>({...p,[a.day||todayName]:[...(p[a.day||todayName]||[]),t]}));showT(`✅ Added "${a.task}" to ${a.day||"today"}`);break;}
        case "remove_task":setSched(p=>({...p,[a.day||todayName]:(p[a.day||todayName]||[]).filter(t=>!t.task.toLowerCase().includes(a.keyword.toLowerCase()))}));showT(`🗑️ Removed`);break;
        case "edit_task":setSched(p=>({...p,[a.day||todayName]:(p[a.day||todayName]||[]).map(t=>t.task.toLowerCase().includes(a.keyword.toLowerCase())?{...t,...(a.newTime&&{time:a.newTime}),...(a.newTask&&{task:a.newTask})}:t)}));showT(`✏️ Updated`);break;
        case "replace_day":setSched(p=>({...p,[a.day||todayName]:(a.tasks||[]).map(t=>({id:gi(),time:t.time||"",task:t.task,cat:t.cat||"study",icon:t.icon||"📌"}))}));showT(`📅 ${a.day||"Today"} updated!`);break;
        case "add_goal":setGoals(p=>[...p,{id:gi(),text:a.text,cat:a.cat||"study"}]);showT("🎯 Goal added!");break;
        case "remove_goal":setGoals(p=>p.filter(g=>!g.text.toLowerCase().includes(a.keyword.toLowerCase())));showT("🗑️ Goal removed");break;
        case "replace_goals":setGoals((a.goals||[]).map(g=>({id:gi(),text:g.text||g,cat:g.cat||"study"})));showT("🎯 Goals updated!");break;
        case "update_targets":setTargets(p=>({...p,...a.targets}));showT("📊 Targets updated!");break;
        case "set_weekly_plan":setWplan(a.plan);setTab("planner");showT("🗓️ Plan updated!");break;
        case "mark_holiday":markHol(a.date||tKey);break;
        case "carry_forward":{
          const pend=getS(todayName).filter(t=>["gate","dsa","upsc","study"].includes(t.cat)&&!done[t.id]);
          if(pend.length){const tmrw=new Date(today);tmrw.setDate(today.getDate()+1);const tk=tmrw.toISOString().split("T")[0];if(!hols.includes(tk)){ls.set("carried_"+tk,pend.map(t=>({...t,id:t.id+"_co",task:"↩ "+t.task})));showT(`📋 ${pend.length} tasks carried forward`);}else showT("Tomorrow is a holiday — not carried");}else showT("No pending tasks!");break;
        }
        case "log_upsc":uI();break;
        case "log_dsa":dI();break;
        default:break;
      }
    });
  },[getS,done,todayName,today,tKey,hols]);

  const sendMsg=async txt=>{
    if(!txt.trim()||loading)return;
    const ut=txt.trim();setInp("");
    setMsgs(p=>[...p,{r:"user",t:ut}]);setLoading(true);
    const pg=getP(todayName),sc=getS(todayName);
    const dt=sc.filter(t=>done[t.id]).map(t=>t.task);
    const pt=sc.filter(t=>["gate","dsa","upsc","study"].includes(t.cat)&&!done[t.id]).map(t=>t.task);
    const sys=`You are Charan's personal AI study assistant. You can DYNAMICALLY CHANGE everything.

TODAY: ${todayName}, ${ff(today)} ${isHolToday?"[HOLIDAY]":""}
Progress: ${pg.done}/${pg.total} (${pg.pct}%)
Completed: ${dt.join(", ")||"None"} | Pending: ${pt.join(", ")||"All done!"}
Streak: ${streak} | UPSC: ${upsc}/60 | DSA: ${dsa}
Days to GATE: ${du(EXAM_DATES.GATE)} | Days to UPSC: ${du(EXAM_DATES.UPSC)}
Targets: ${JSON.stringify(targets)} | Goals: ${goals.map(g=>g.text).join(" | ")}

ACTIONS (after response in <<<ACTIONS>>>...<<<END>>>):
{"type":"add_task","day":"Monday","time":"5 AM","task":"Yoga","cat":"routine","icon":"🧘"}
{"type":"remove_task","day":"Monday","keyword":"Yoga"}
{"type":"edit_task","day":"Monday","keyword":"DSA","newTime":"7 PM","newTask":"Striver DSA - 6 Problems"}
{"type":"replace_day","day":"Monday","tasks":[{"time":"6 AM","task":"Badminton","cat":"routine","icon":"🏸"}]}
{"type":"add_goal","text":"Complete OS by May","cat":"gate"}
{"type":"remove_goal","keyword":"Binary Search"}
{"type":"replace_goals","goals":[{"text":"New goal","cat":"gate"}]}
{"type":"update_targets","targets":{"gate":"4 hrs/day","dsa":"5 problems/day"}}
{"type":"set_weekly_plan","plan":"Monday: Focus on..."}
{"type":"mark_holiday","date":"${tKey}"}
{"type":"carry_forward"}
{"type":"log_upsc","count":1}
{"type":"log_dsa","count":1}

Be concise (3-4 lines), warm, practical. Only include <<<ACTIONS>>> when changes needed.`;
    try{
      const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system:sys,max_tokens:2000,messages:[...msgs.slice(-8).map(m=>({role:m.r==="bot"?"assistant":"user",content:m.t})),{role:"user",content:ut}]})});
      if(!res.ok)throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data=await res.json();if(data.error)throw new Error(data.error);
      let rep=data.content?.[0]?.text||"No response.";
      const am=rep.match(/<<<ACTIONS>>>([\s\S]*?)<<<END>>>/);
      if(am){try{applyActs(JSON.parse(am[1].trim()));}catch(e){console.warn(e);}rep=rep.replace(/<<<ACTIONS>>>[\s\S]*?<<<END>>>/,"").trim();}
      if(ut.toLowerCase().includes("night summary")||ut.toLowerCase().includes("carry forward")){applyActs([{type:"carry_forward"}]);ls.set("last_active_v5",tKey);}
      setMsgs(p=>[...p,{r:"bot",t:rep}]);
    }catch(e){setMsgs(p=>[...p,{r:"bot",t:`❌ ${e.message}\n\nCheck Vercel → Settings → Environment Variables → GROQ_API_KEY is set, then redeploy.`}]);}
    setLoading(false);
  };

  const genPlan=async()=>{
    setGenning(true);setTab("planner");
    const pend=getS(todayName).filter(t=>["gate","dsa","upsc","study"].includes(t.cat)&&!done[t.id]).map(t=>t.task);
    try{
      const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({max_tokens:1500,messages:[{role:"user",content:`Smart weekly plan for Charan — IIT Roorkee, GATE CS 2027 + UPSC Prelims May 2026.
Streak: ${streak} | UPSC: ${upsc}/60 | DSA: ${dsa} | Days to GATE: ${du(EXAM_DATES.GATE)} | Days to UPSC: ${du(EXAM_DATES.UPSC)}
Goals: ${goals.map(g=>g.text).join(" | ")} | Pending today: ${pend.join(", ")||"None"}
Targets: GATE ${targets.gate} | DSA ${targets.dsa} | UPSC ${targets.upsc}
College: Mon/Thu(CC+IoT+DM) Tue(CC+DM+FM) Wed(IoT+DM+FM) Fri(DM+FM) Sat/Sun free
Write specific day-by-day Mon-Sun plan with topics, chapters, problem sets. Emojis. Motivating.`}]})});
      const data=await res.json();setWplan(data.content?.[0]?.text||"Could not generate.");
    }catch(e){setWplan("Error: "+e.message);}
    setGenning(false);
  };

  const tdP=getP(todayName),aP=getP(activeDay);
  const upscPct=Math.round((upsc/60)*100),dsaPct=Math.min(100,Math.round((dsa/100)*100));
  const rd=recentDates(7);

  const S=React.createElement,h=(v,p,...c)=>S(v,p,...c);

  return h("div",{style:{minHeight:"100vh",background:"#050810",color:"#e2e8f0",fontFamily:"'Space Grotesk',sans-serif",display:"flex",flexDirection:"column",maxWidth:520,margin:"0 auto"}},

    // Badge
    badge&&h("div",{className:"badge-pop",style:{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#1a1a00,#2a1500)",border:"1px solid #fbbf2466",borderRadius:16,padding:"12px 20px",zIndex:300,textAlign:"center",boxShadow:"0 8px 32px #000000aa"}},
      h("div",{style:{fontSize:30}},badge.icon),
      h("div",{style:{fontSize:13,fontWeight:700,color:"#fbbf24",marginTop:3}},"Badge Unlocked!"),
      h("div",{style:{fontSize:11,color:"#92400e"}},badge.label)
    ),

    // Toast
    toast&&h("div",{className:"slide-down",style:{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"#0a1f0a",border:"1px solid #22c55e44",color:"#4ade80",padding:"8px 20px",borderRadius:20,fontSize:13,fontWeight:600,zIndex:200,whiteSpace:"nowrap"}},toast),

    // Holiday confirm
    holConfirm&&h("div",{style:{position:"fixed",inset:0,background:"#000000cc",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}},
      h("div",{style:{background:"#0a1628",border:"1px solid #1e3050",borderRadius:16,padding:24,maxWidth:320,width:"100%"}},
        h("div",{style:{fontSize:30,marginBottom:10,textAlign:"center"}},"🏖️"),
        h("div",{style:{fontSize:15,fontWeight:700,color:"#f1f5f9",marginBottom:8,textAlign:"center"}},"Mark Today as Holiday?"),
        h("div",{style:{fontSize:12,color:"#475569",lineHeight:1.6,marginBottom:20,textAlign:"center"}},"Pending tasks won't carry forward.\nYour streak will be protected.\nYou deserve the rest!"),
        h("div",{style:{display:"flex",gap:10}},
          h("button",{onClick:()=>{markHol(tKey);setHolConfirm(false);},style:{flex:1,padding:"11px",background:"#f97316",border:"none",borderRadius:10,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}},"Yes, Holiday! 🏖️"),
          h("button",{onClick:()=>setHolConfirm(false),style:{flex:1,padding:"11px",background:"#1e293b",border:"none",borderRadius:10,color:"#94a3b8",fontSize:13,cursor:"pointer"}},"Cancel")
        )
      )
    ),

    // Header
    h("div",{style:{padding:"14px 16px 12px",background:"linear-gradient(180deg,#0d1424,#050810)",borderBottom:"1px solid #0f1e38"}},
      h("div",{style:{background:"#0a1628",border:"1px solid #1e3050",borderRadius:10,padding:"8px 12px",marginBottom:12}},
        h("div",{style:{fontSize:11,color:"#60a5fa",fontStyle:"italic",lineHeight:1.5}},`"${quote.text}"`),
        h("div",{style:{fontSize:10,color:"#1e3050",marginTop:2}},`— ${quote.author}`)
      ),
      h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}},
        h("div",null,
          h("div",{style:{fontSize:9,color:"#1e3050",letterSpacing:3,textTransform:"uppercase"}},"Study Command Center v5"),
          h("div",{style:{fontSize:20,fontWeight:700,color:"#f1f5f9",marginTop:2}},`Hey Charan 👋 ${isHolToday?"🏖️":""}`),
          h("div",{style:{fontSize:11,color:"#1e3050",marginTop:2}},ff(today))
        ),
        h(Ring,{pct:isHolToday?100:tdP.pct,size:64,stroke:5,color:isHolToday?"#f97316":"#22c55e",sub:isHolToday?"holiday":"today"})
      ),
      h(StreakBar,{streak}),
      h("div",{style:{display:"flex",gap:6,marginTop:10}},
        [{l:"UPSC",v:`${upsc}/60`,c:"#f97316",p:upscPct},{l:"DSA",v:`${dsa}`,c:"#a855f7",p:dsaPct},{l:"Tasks",v:isHolToday?"🏖️":`${tdP.done}/${tdP.total}`,c:"#22c55e",p:isHolToday?100:tdP.pct}].map(s=>
          h("div",{key:s.l,style:{flex:1,background:"#0a1628",border:"1px solid #1e293b",borderRadius:10,padding:"7px 8px"}},
            h("div",{style:{fontSize:12,fontWeight:700,color:s.c,fontFamily:"'JetBrains Mono',monospace"}},s.v),
            h("div",{style:{height:2,background:"#1e293b",borderRadius:1,margin:"3px 0 2px"}},h("div",{style:{height:"100%",width:`${s.p}%`,background:s.c,borderRadius:1,transition:"width 0.5s"}})),
            h("div",{style:{fontSize:9,color:"#334155"}},s.l)
          )
        )
      )
    ),

    // Day selector
    h("div",{style:{display:"flex",overflowX:"auto",padding:"8px 10px",gap:5,borderBottom:"1px solid #0f1e38"}},
      DAYS.map(d=>{
        const dd=gdd(d),isT=d===todayName,isA=d===activeDay,dk=dd.toISOString().split("T")[0],isH=hols.includes(dk),p=getP(d);
        return h("button",{key:d,onClick:()=>setActiveDay(d),style:{padding:"5px 8px",borderRadius:9,border:"1px solid",borderColor:isA?"#22c55e":isT?"#1e3050":isH?"#f9731444":"#0f1e38",background:isA?"#0a2a0a":isT?"#0a1628":isH?"#1f0d0d22":"transparent",color:isA?"#22c55e":isT?"#60a5fa":isH?"#f97316":"#334155",cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:1,minWidth:44,transition:"all 0.2s"}},
          h("span",{style:{fontWeight:700,fontSize:10}},isH?"🏖️":d.slice(0,3),isT?" •":""),
          h("span",{style:{fontSize:9,opacity:0.7}},fs(dd)),
          h("div",{style:{width:20,height:2,background:"#1e293b",borderRadius:1,marginTop:1}},h("div",{style:{height:"100%",width:`${isH?100:p.pct}%`,background:isH?"#f97316":isA?"#22c55e":"#1e3050",borderRadius:1}}))
        );
      })
    ),

    // Tabs
    h("div",{style:{display:"flex",borderBottom:"1px solid #0f1e38",overflowX:"auto"}},
      [["tasks","📋","Tasks"],["chat","💬","Chat"],["history","📆","History"],["dashboard","📊","Stats"],["badges","🏆","Badges"],["planner","🗓️","Planner"],["goals","🎯","Goals"]].map(([v,ic,lb])=>
        h("button",{key:v,onClick:()=>setTab(v),style:{flex:1,padding:"8px 2px",background:"transparent",border:"none",borderBottom:`2px solid ${tab===v?"#22c55e":"transparent"}`,color:tab===v?"#22c55e":"#334155",fontSize:9,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",letterSpacing:0.5,whiteSpace:"nowrap",transition:"all 0.2s"}},`${ic} ${lb}`)
      )
    ),

    // Content
    h("div",{style:{flex:1,overflow:"auto",padding:"12px 14px"}},

      // TASKS
      tab==="tasks"&&h("div",{className:"fade-in"},
        h("div",{style:{display:"flex",gap:8,marginBottom:12}},h(Countdown,{label:"GATE 2027",date:EXAM_DATES.GATE,color:"#22c55e",icon:"📚"}),h(Countdown,{label:"UPSC Prelims",date:EXAM_DATES.UPSC,color:"#f97316",icon:"🇮🇳"})),

        // Holiday banner
        isHolToday
          ? h("div",{style:{marginBottom:12,padding:12,background:"linear-gradient(135deg,#1f0d00,#0a0500)",borderRadius:12,border:"1px solid #f9731444",display:"flex",alignItems:"center",justifyContent:"space-between"}},
              h("div",null,h("div",{style:{fontSize:14,fontWeight:700,color:"#f97316"}},"🏖️ Today is a Holiday!"),h("div",{style:{fontSize:11,color:"#7c3a00",marginTop:2}},"Rest well. Streak is protected.")),
              h("button",{onClick:()=>unmarkHol(tKey),style:{padding:"6px 12px",background:"transparent",border:"1px solid #f9731444",borderRadius:8,color:"#f97316",fontSize:11,cursor:"pointer"}},"Remove")
            )
          : h("button",{onClick:()=>setHolConfirm(true),style:{width:"100%",marginBottom:12,padding:"10px",background:"linear-gradient(135deg,#1f0d00,#0a0500)",border:"1px solid #f9731422",borderRadius:10,color:"#7c3a00",fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}},
              "🏖️ Mark today as holiday (streak stays safe, no carry-forward)"
            ),

        // Quick counters
        !isHolToday&&h("div",{style:{display:"flex",gap:8,marginBottom:12}},
          h("button",{onClick:uI,style:{flex:1,padding:"9px",background:"#1f0d0d",border:"1px solid #3b1f1f",borderRadius:10,color:"#f97316",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}},`+ UPSC Lecture`,h("br"),h("span",{style:{fontSize:10,opacity:0.6}},`${upsc}/60`)),
          h("button",{onClick:dI,style:{flex:1,padding:"9px",background:"#160d2e",border:"1px solid #2d1b4e",borderRadius:10,color:"#a855f7",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}},`+ DSA Problem`,h("br"),h("span",{style:{fontSize:10,opacity:0.6}},`${dsa} total`))
        ),

        // Carried
        carried.length>0&&activeDay===todayName&&!isHolToday&&h("div",{style:{marginBottom:10,padding:10,background:"#1a0d00",borderRadius:10,border:"1px solid #f9731644"}},
          h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}},
            h("div",{style:{fontSize:10,color:"#f97316",textTransform:"uppercase",letterSpacing:1}},"↩ Carried from yesterday"),
            h("button",{onClick:()=>{setCarried([]);ls.del("carried_"+tKey);showT("Cleared!");},style:{fontSize:10,color:"#7f1d1d",background:"transparent",border:"none",cursor:"pointer"}},"Clear")
          ),
          carried.map(t=>h("div",{key:t.id,style:{fontSize:12,color:"#fed7aa",padding:"1px 0"}},`• ${t.task}`))
        ),

        isHolToday
          ? h("div",{style:{textAlign:"center",padding:"40px 20px",color:"#7c3a00"}},h("div",{style:{fontSize:48,marginBottom:12}},"🏖️"),h("div",{style:{fontSize:16,fontWeight:700,color:"#f97316"}},"Enjoy your rest!"),h("div",{style:{fontSize:13,marginTop:8}},"No tasks today. Come back tomorrow."))
          : getS(activeDay).length===0
            ? h("div",{style:{textAlign:"center",padding:"40px 20px",color:"#1e3050"}},h("div",{style:{fontSize:32,marginBottom:8}},"📭"),h("div",{style:{fontSize:13}},`No tasks for ${activeDay}. Tell the chat to add some!`))
            : getS(activeDay).map((item,i)=>{
                const cat=CAT[item.cat]||CAT.study,isDone=!!done[item.id],isStudy=["gate","dsa","upsc","study"].includes(item.cat);
                return h("div",{key:item.id,onClick:()=>isStudy&&activeDay===todayName&&toggle(item.id),style:{display:"flex",alignItems:"center",gap:10,padding:"10px 11px",marginBottom:5,background:isDone?"#0a1f0a":cat.bg,borderRadius:11,border:`1px solid ${isDone?"#22c55e33":cat.border}`,cursor:isStudy&&activeDay===todayName?"pointer":"default",opacity:isDone?0.6:1,transition:"all 0.2s",animation:`fadeIn 0.25s ease ${i*0.02}s both`}},
                  h("span",{style:{fontSize:15,flexShrink:0}},item.icon||"📌"),
                  h("div",{style:{flex:1,minWidth:0}},
                    h("div",{style:{fontSize:13,fontWeight:600,color:isDone?"#4ade80":"#e2e8f0",textDecoration:isDone?"line-through":"none"}},item.task),
                    h("div",{style:{fontSize:10,color:"#334155",marginTop:1,fontFamily:"'JetBrains Mono',monospace"}},item.time)
                  ),
                  h("div",{style:{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}},
                    h("span",{style:{fontSize:9,padding:"2px 6px",borderRadius:6,background:cat.accent+"22",color:cat.accent}},cat.label),
                    isStudy&&h("div",{style:{width:15,height:15,borderRadius:"50%",border:`2px solid ${isDone?"#22c55e":cat.accent+"55"}`,background:isDone?"#22c55e":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#000",fontWeight:700}},isDone&&"✓")
                  )
                );
              }),

        !isHolToday&&h("button",{onClick:()=>{setTab("chat");sendMsg("Generate my night summary and carry forward any pending tasks");},style:{width:"100%",marginTop:10,padding:"12px",background:"linear-gradient(135deg,#0d1f2d,#080c14)",border:"1px solid #1e3050",borderRadius:12,color:"#60a5fa",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}},"🌙 Night Summary & Carry Forward")
      ),

      // CHAT
      tab==="chat"&&h("div",{className:"fade-in",style:{display:"flex",flexDirection:"column",height:"calc(100vh - 400px)",minHeight:260}},
        h("div",{style:{background:"#0a1628",border:"1px solid #1e3050",borderRadius:10,padding:"8px 10px",marginBottom:10,fontSize:11,color:"#334155",lineHeight:1.7}},
          "💡 ",h("span",{style:{color:"#60a5fa"}},"Try:")," \"Add yoga 5 AM\" • \"Change GATE to 4 hrs\" • \"Mark holiday\" • \"Night summary\" • \"Generate weekly plan\""
        ),
        h("div",{style:{flex:1,overflow:"auto",display:"flex",flexDirection:"column",gap:8,paddingBottom:6}},
          msgs.map((m,i)=>h("div",{key:i,style:{display:"flex",justifyContent:m.r==="user"?"flex-end":"flex-start",alignItems:"flex-end",gap:6}},
            m.r==="bot"&&h("div",{style:{width:24,height:24,borderRadius:"50%",background:"#0a2a0a",border:"1px solid #22c55e22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}},"🤖"),
            h("div",{style:{maxWidth:"82%",padding:"9px 12px",borderRadius:m.r==="user"?"14px 14px 3px 14px":"3px 14px 14px 14px",background:m.r==="user"?"#0a2a0a":"#0a1628",border:`1px solid ${m.r==="user"?"#22c55e22":"#1e3050"}`,fontSize:13,lineHeight:1.7,color:"#e2e8f0",whiteSpace:"pre-wrap"}},m.t)
          )),
          loading&&h("div",{style:{display:"flex",alignItems:"flex-end",gap:6}},
            h("div",{style:{width:24,height:24,borderRadius:"50%",background:"#0a2a0a",border:"1px solid #22c55e22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}},"🤖"),
            h("div",{style:{padding:"9px 13px",background:"#0a1628",borderRadius:"3px 14px 14px 14px",border:"1px solid #1e3050"}},
              h("div",{style:{display:"flex",gap:4}},[0,1,2].map(i=>h("div",{key:i,style:{width:5,height:5,borderRadius:"50%",background:"#334155",animation:`pulse 1.4s ease ${i*0.2}s infinite`}})))
            )
          ),
          h("div",{ref:chatEnd})
        ),
        h("div",{style:{display:"flex",gap:6,marginTop:8}},
          h("input",{value:inp,onChange:e=>setInp(e.target.value),onKeyDown:e=>e.key==="Enter"&&sendMsg(inp),placeholder:"Change schedule, add tasks, update goals...",style:{flex:1,padding:"10px 13px",background:"#0a1628",border:"1px solid #1e3050",borderRadius:20,color:"#e2e8f0",fontSize:13}}),
          h("button",{onClick:()=>sendMsg(inp),disabled:loading,style:{padding:"10px 16px",background:"#22c55e",border:"none",borderRadius:20,color:"#000",fontSize:14,fontWeight:700,cursor:"pointer"}},"→")
        ),
        h("div",{style:{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}},
          ["Done with DSA ✅","Completed UPSC ✅","Mark today holiday 🏖️","Night summary 🌙","Generate weekly plan"].map(q=>
            h("button",{key:q,onClick:()=>sendMsg(q),style:{padding:"4px 9px",background:"#0a1628",border:"1px solid #1e3050",borderRadius:10,color:"#334155",fontSize:11,cursor:"pointer",fontFamily:"inherit"}},q)
          )
        )
      ),

      // HISTORY (new)
      tab==="history"&&h("div",{className:"fade-in"},
        h("div",{style:{fontSize:10,color:"#334155",letterSpacing:1,textTransform:"uppercase",marginBottom:14}},"Past 7 Days — Tap to expand"),
        rd.map(dk=>h(HistoryDay,{key:dk,dateKey:dk,getSchedForDate:getSForDate,getDoneForDate,holidays:hols,onMarkHoliday:markHol,onUnmarkHoliday:unmarkHol}))
      ),

      // DASHBOARD
      tab==="dashboard"&&h("div",{className:"fade-in"},
        h("div",{style:{display:"flex",gap:8,marginBottom:14}},h(Countdown,{label:"GATE 2027",date:EXAM_DATES.GATE,color:"#22c55e",icon:"📚"}),h(Countdown,{label:"UPSC Prelims",date:EXAM_DATES.UPSC,color:"#f97316",icon:"🇮🇳"})),
        h("div",{style:{display:"flex",justifyContent:"space-around",padding:16,background:"#0a1628",borderRadius:14,border:"1px solid #1e293b",marginBottom:14}},
          h(Ring,{pct:upscPct,size:76,color:"#f97316",label:"UPSC",sub:`${upsc}/60`}),
          h(Ring,{pct:isHolToday?100:tdP.pct,size:76,color:isHolToday?"#f97316":"#22c55e",label:"Today",sub:isHolToday?"holiday":`${tdP.done}/${tdP.total}`}),
          h(Ring,{pct:dsaPct,size:76,color:"#a855f7",label:"DSA",sub:`${dsa}/100`})
        ),
        h("div",{style:{background:"#0a1628",borderRadius:14,border:"1px solid #1e293b",padding:14,marginBottom:14}},
          h("div",{style:{fontSize:10,color:"#334155",letterSpacing:1,textTransform:"uppercase",marginBottom:10}},"This Week"),
          DAYS.slice(1).concat(DAYS[0]).map(d=>{
            const p=getP(d),isT=d===todayName,dk=gdd(d).toISOString().split("T")[0],isH=hols.includes(dk);
            return h("div",{key:d,style:{display:"flex",alignItems:"center",gap:10,marginBottom:7}},
              h("div",{style:{width:28,fontSize:11,color:isT?"#22c55e":isH?"#f97316":"#334155",fontWeight:isT?700:400}},isH?"🏖️":d.slice(0,3)),
              h("div",{style:{flex:1,height:5,background:"#0f172a",borderRadius:3,overflow:"hidden"}},h("div",{style:{height:"100%",width:`${isH?100:p.pct}%`,background:isH?"#f97316":isT?"#22c55e":p.pct===100?"#06b6d4":"#1e3050",borderRadius:3,transition:"width 0.5s"}})),
              h("div",{style:{width:32,fontSize:11,color:isH?"#f97316":"#334155",textAlign:"right",fontFamily:"'JetBrains Mono',monospace"}},isH?"🏖️":`${p.pct}%`)
            );
          })
        ),
        h("div",{style:{background:"#0a1628",borderRadius:14,border:"1px solid #1e293b",padding:14}},
          h("div",{style:{fontSize:10,color:"#334155",letterSpacing:1,textTransform:"uppercase",marginBottom:10}},"Daily Targets"),
          [{l:"GATE",v:targets.gate,c:"#22c55e",ic:"📚"},{l:"Striver DSA",v:targets.dsa,c:"#a855f7",ic:"💻"},{l:"UPSC Polity",v:targets.upsc,c:"#f97316",ic:"🇮🇳"}].map(t=>
            h("div",{key:t.l,style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #0f172a"}},
              h("div",{style:{display:"flex",alignItems:"center",gap:8}},h("span",null,t.ic),h("span",{style:{fontSize:13,color:"#64748b"}},t.l)),
              h("span",{style:{fontSize:13,color:t.c,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}},t.v)
            )
          )
        )
      ),

      // BADGES
      tab==="badges"&&h("div",{className:"fade-in"},
        h("div",{style:{marginBottom:14}},h(StreakBar,{streak})),
        h("div",{style:{fontSize:10,color:"#334155",letterSpacing:1,textTransform:"uppercase",marginBottom:10}},`Earned (${earned.length}/${ALL_BADGES.length})`),
        h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}},
          earned.length===0
            ? h("div",{style:{gridColumn:"1/-1",textAlign:"center",padding:"30px",color:"#1e3050"}},h("div",{style:{fontSize:28,marginBottom:6}},"🏆"),h("div",{style:{fontSize:13}},"Complete tasks to earn badges!"))
            : earned.map(b=>h("div",{key:b.id,style:{background:"linear-gradient(135deg,#1a1a00,#2a1500)",border:"1px solid #fbbf2444",borderRadius:12,padding:"12px",textAlign:"center"}},h("div",{style:{fontSize:28,marginBottom:4}},b.icon),h("div",{style:{fontSize:12,fontWeight:700,color:"#fbbf24"}},b.label),h("div",{style:{fontSize:10,color:"#78350f",marginTop:2}},b.desc)))
        ),
        h("div",{style:{fontSize:10,color:"#334155",letterSpacing:1,textTransform:"uppercase",marginBottom:10}},"Locked"),
        h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}},
          ALL_BADGES.filter(b=>!earned.find(e=>e.id===b.id)).map(b=>h("div",{key:b.id,style:{background:"#0a1628",border:"1px solid #1e293b",borderRadius:12,padding:"12px",textAlign:"center",opacity:0.4}},h("div",{style:{fontSize:28,marginBottom:4,filter:"grayscale(1)"}},b.icon),h("div",{style:{fontSize:12,fontWeight:700,color:"#475569"}},b.label),h("div",{style:{fontSize:10,color:"#1e293b",marginTop:2}},b.desc)))
        )
      ),

      // PLANNER
      tab==="planner"&&h("div",{className:"fade-in"},
        h("div",{style:{background:"#0a1628",border:"1px solid #1e3050",borderRadius:14,padding:14,marginBottom:12}},
          h("div",{style:{fontSize:13,color:"#60a5fa",fontWeight:600,marginBottom:6}},"🧠 AI Weekly Planner"),
          h("div",{style:{fontSize:12,color:"#334155",lineHeight:1.7,marginBottom:12}},"Personalized Mon–Sun plan based on your progress, exam countdown, and missed tasks."),
          h("button",{onClick:genPlan,disabled:genning,style:{width:"100%",padding:"12px",background:genning?"#0a1628":"linear-gradient(135deg,#0a2a0a,#152a15)",border:"1px solid #22c55e44",borderRadius:10,color:genning?"#334155":"#22c55e",fontSize:13,fontWeight:600,cursor:genning?"not-allowed":"pointer",fontFamily:"inherit"}},genning?"⏳ Generating...":"🗓️ Generate This Week's Plan")
        ),
        wplan
          ? h("div",{style:{background:"#0a1628",border:"1px solid #1e3050",borderRadius:14,padding:14}},h("div",{style:{fontSize:10,color:"#334155",letterSpacing:1,textTransform:"uppercase",marginBottom:10}},"Your Plan"),h("div",{style:{fontSize:13,color:"#94a3b8",lineHeight:1.9,whiteSpace:"pre-wrap"}},wplan))
          : h("div",{style:{textAlign:"center",padding:"40px 20px",color:"#1e3050"}},h("div",{style:{fontSize:40,marginBottom:10}},"🗓️"),h("div",{style:{fontSize:13}},"No plan yet. Generate one above!"))
      ),

      // GOALS
      tab==="goals"&&h("div",{className:"fade-in"},
        h("div",{style:{fontSize:10,color:"#334155",letterSpacing:1,textTransform:"uppercase",marginBottom:12}},"Monthly Goals"),
        goals.map((g,i)=>{
          const cat=CAT[g.cat]||CAT.study;
          return h("div",{key:g.id,style:{padding:"12px 14px",marginBottom:8,background:cat.bg,borderRadius:12,border:`1px solid ${cat.border}`,animation:`fadeIn 0.3s ease ${i*0.06}s both`}},
            h("div",{style:{display:"flex",alignItems:"flex-start",gap:8}},
              h("div",{style:{width:8,height:8,borderRadius:"50%",background:cat.accent,flexShrink:0,marginTop:4}}),
              h("div",{style:{fontSize:13,color:"#e2e8f0",lineHeight:1.5}},g.text)
            ),
            h("div",{style:{marginTop:6}},h("span",{style:{fontSize:9,padding:"2px 7px",borderRadius:6,background:cat.accent+"22",color:cat.accent}},cat.label))
          );
        }),
        h("div",{style:{marginTop:12,padding:12,background:"#0a1628",borderRadius:12,border:"1px solid #1e3050"}},
          h("div",{style:{fontSize:12,color:"#60a5fa",marginBottom:6,fontWeight:600}},"💬 Change goals via chat"),
          h("div",{style:{fontSize:11,color:"#334155",lineHeight:1.8}},'"Add goal: Complete OS by May 5"',h("br"),'"Remove the Binary Search goal"',h("br"),'"Replace all goals with new ones"')
        ),
        h("div",{style:{marginTop:14}},
          h("div",{style:{fontSize:10,color:"#334155",letterSpacing:1,textTransform:"uppercase",marginBottom:10}},"Counters — Adjust Freely"),
          h(Counter,{label:"🇮🇳 UPSC Lectures",count:upsc,allTime:atUpsc,color:"#f97316",bg:"#1f0d0d",border:"#3b1f1f",onInc:uI,onDec:uD,onSet:uS,target:60,unit:"lectures"}),
          h("div",{style:{marginTop:10}}),
          h(Counter,{label:"💻 DSA Problems",count:dsa,allTime:atDsa,color:"#a855f7",bg:"#160d2e",border:"#2d1b4e",onInc:dI,onDec:dD,onSet:dS,target:100,unit:"problems"})
        )
      )
    )
  );
}

ReactDOM.render(React.createElement(App),document.getElementById("root"));
