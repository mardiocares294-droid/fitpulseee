'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const TYPES=['Walking','Running','Cycling','Swimming','Dancing','Yoga','Pilates','Hiking','Strength training','Jump rope','Sports','Stretching','Other'];
const DEF={goals:{steps:8000,mins:30,weekly:150,freq:4},profile:{name:'Friend',units:'km',theme:'dark',types:['Walking'],notify:false,pic:''},acts:[],chat:[]};
let S;try{S=Object.assign({},DEF,JSON.parse(localStorage.getItem('pulse')||'{}'))}catch(e){S=structuredClone(DEF)}
const save=()=>{try{localStorage.setItem('pulse',JSON.stringify(S))}catch(e){toast('Could not save: storage is full or blocked.',1)}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iso=d=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const today=()=>iso(new Date()),daysAgo=n=>{const d=new Date();d.setDate(d.getDate()-n);return iso(d)};
const sum=(a,k)=>a.reduce((t,x)=>t+(+x[k]||0),0);
const km=v=>S.profile.units==='mi'?(v*.621).toFixed(1)+' mi':(+v).toFixed(1)+' km';
function toast(m,err){const t=document.createElement('div');t.className='toast'+(err?' err':'');t.textContent=m;$('#toasts').append(t);setTimeout(()=>t.remove(),3200)}
function ring(p,label,val){const pc=Math.min(100,Math.round(p)),c=2*Math.PI*40;return`<div class="ring"><svg viewBox="0 0 100 100" role="img" aria-label="${esc(label)} ${pc}%"><circle class="bg" cx="50" cy="50" r="40"/><circle class="fg" cx="50" cy="50" r="40" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-pc/100)}"/></svg><b>${pc}%</b>${esc(label)}<br><small>${esc(val)}</small></div>`}
function bars(data){const m=Math.max(1,...data.map(d=>d.v));return data.length?`<div class="bars">${data.map(d=>`<div style="height:${Math.max(2,d.v/m*100)}%" title="${esc(d.l)}: ${d.v}"><span>${esc(d.l)}</span></div>`).join('')}</div>`:'<p class="empty">No data yet.</p>'}
const byDay=n=>Array.from({length:n},(_,i)=>{const d=daysAgo(n-1-i),a=S.acts.filter(x=>x.date===d);return{d,l:d.slice(5),mins:sum(a,'dur'),steps:sum(a,'steps'),n:a.length}});
// navigation
function nav(p){$$('.page').forEach(e=>e.classList.toggle('on',e.id===p));$$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.page===p));$('#side').classList.remove('open');history.replaceState(null,'','#'+p);render();scrollTo(0,0)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)nav(b.dataset.page);const i=e.target.closest('[data-info]');if(i)info(esc(i.dataset.info))});
$('#menuBtn').onclick=()=>$('#side').classList.toggle('open');
function info(h){$('#infoBody').innerHTML=h;$('#infoDlg').showModal()}$('#infoClose').onclick=()=>$('#infoDlg').close();
function theme(t){S.profile.theme=t;document.documentElement.dataset.theme=t;save()}
$('#themeBtn').onclick=()=>{theme(S.profile.theme==='dark'?'light':'dark');toast('Theme changed.')};
// workouts data
const W=[
['Beginner','10-Minute Starter Walk','An easy brisk walk to build the habit.','Easy',10,'Shoes','Walk at a pace where you can talk. Add 2 minutes each week.','Walk slowly or break into two 5-minute walks.','Walking',10],
['Beginner','Gentle Full-Body Basics','Simple moves to wake up your body.','Easy',15,'None','Do 10 bodyweight squats, 10 wall push-ups, 20s march in place. Rest 1 min. Repeat twice.','Use a chair for support.','Strength training',15],
['Cardio','Interval Jog','Alternate easy jogging and walking.','Medium',25,'Shoes','Jog 1 min, walk 2 min, repeat 8 times.','Walk the whole time at a brisk pace.','Running',25],
['Cardio','Jump Rope Burst','Short bursts for heart health.','Hard',12,'Jump rope','Jump 30s, rest 30s, repeat 10 times.','Step side to side without a rope.','Jump rope',12],
['Strength','Resistance Band Routine','Build strength with a band.','Medium',20,'Resistance band','3 sets of 10: rows, presses, squats. Rest 60s.','Use lighter tension or fewer sets.','Strength training',20],
['Strength','Bodyweight Strength','Squats, lunges, planks.','Medium',20,'None','3 rounds: 12 squats, 8 lunges each leg, 20s plank.','Do plank on knees.','Strength training',20],
['Flexibility','Full-Body Stretch','Loosen up tight areas.','Easy',12,'Mat','Hold each stretch 30s: neck, shoulders, hamstrings, hips, calves.','Stretch gently; never force.','Stretching',12],
['Yoga','Evening Wind-Down Yoga','Slow flow for relaxation.','Easy',20,'Mat','Cat-cow, child pose, gentle twist, forward fold, 3 min breathing.','Stay in child pose if tired.','Yoga',20],
['Low-impact','Easy Cycling Spin','Joint-friendly cardio.','Easy',30,'Bike','Ride steadily at conversational effort.','Ride 15 minutes only.','Cycling',30],
['Home','Living Room Dance Party','Fun cardio at home.','Medium',15,'None','Put on 4 songs and move freely.','Dance seated or slower.','Dancing',15]];
let wcat='All';
function renderWorkouts(){const cats=['All',...new Set(W.map(w=>w[0]))];$('#wCats').innerHTML=cats.map(c=>`<button class="chip ${c===wcat?'on':''}" data-c="${c}">${c}</button>`).join('');
 $('#wList').innerHTML=W.map((w,i)=>[w,i]).filter(([w])=>wcat==='All'||w[0]===wcat).map(([w,i])=>`<div class="card glass"><small>${w[0]} · ${w[3]} · ${w[4]} min · ${w[5]}</small><h3>${w[1]}</h3><p>${w[2]}</p><details><summary>Instructions</summary><p>${w[6]}</p><p><b>Easier option:</b> ${w[7]}</p><p><small>Rest if you feel pain, dizziness or unusual fatigue.</small></p></details><button class="btn" data-w="${i}">Start Workout</button></div>`).join('');
 $('#featured').innerHTML=[0,4,7].map(i=>`<div class="card glass"><h3>${W[i][1]}</h3><p>${W[i][2]}</p><button class="ghost" data-page="workouts">See library</button></div>`).join('')}
$('#wCats').onclick=e=>{if(e.target.dataset.c){wcat=e.target.dataset.c;renderWorkouts()}};
$('#wList').onclick=e=>{const i=e.target.dataset.w;if(i==null)return;const w=W[i];openForm({type:w[8],dur:w[9],date:today(),notes:'Workout: '+w[1]});toast('Do the workout, then save it to log it.')};
// tracker
const f=$('#actForm');let editId=null;
$('#fType').innerHTML='<option value="">All types</option>'+TYPES.map(t=>`<option>${t}</option>`).join('');
f.type.innerHTML=TYPES.map(t=>`<option>${t}</option>`).join('');
function openForm(a={}){editId=a.id||null;$('#dlgTitle').textContent=editId?'Edit activity':'Add activity';f.reset();f.date.value=a.date||today();['type','dur','dist','steps','cal','notes'].forEach(k=>{if(a[k]!=null)f[k].value=a[k]});$$('.u').forEach(u=>u.textContent=S.profile.units);$('#actDlg').showModal()}
$('#addBtn').onclick=()=>openForm();$('#dlgCancel').onclick=()=>$('#actDlg').close();
f.onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(f));
 if(!(+v.dur>0)){return toast('Enter a duration above 0.',1)}if(!v.date||v.date>today()){return toast('Pick today or an earlier date.',1)}
 let dist=+v.dist||0;if(S.profile.units==='mi')dist=+(dist/.621).toFixed(2);
 const a={id:editId||Date.now()+''+Math.random().toString(36).slice(2,5),type:v.type,date:v.date,dur:+v.dur,dist,steps:+v.steps||0,cal:+v.cal||0,notes:v.notes.trim()};
 if(editId)S.acts=S.acts.map(x=>x.id===editId?a:x);else S.acts.push(a);save();$('#actDlg').close();toast(editId?'Activity updated.':'Activity saved.');render()};
['fSearch','fType','fDate'].forEach(i=>$('#'+i).oninput=renderTracker);
$('#fClear').onclick=()=>{$('#fSearch').value='';$('#fType').value='';$('#fDate').value='';renderTracker()};
const row=a=>`<div class="item"><div><b>${esc(a.type)}</b> · ${a.date}<br><small>${a.dur} min${a.dist?' · '+km(a.dist):''}${a.steps?' · '+a.steps+' steps':''}</small></div><div><button data-v="${a.id}">Details</button><button data-e="${a.id}">Edit</button><button data-d="${a.id}">Delete</button></div></div>`;
function renderTracker(){const q=$('#fSearch').value.toLowerCase(),t=$('#fType').value,d=$('#fDate').value;
 const l=[...S.acts].filter(a=>(!t||a.type===t)&&(!d||a.date===d)&&(!q||(a.type+' '+a.notes).toLowerCase().includes(q))).sort((a,b)=>b.date.localeCompare(a.date));
 $('#actList').innerHTML=l.length?l.map(row).join(''):`<div class="empty card glass">${S.acts.length?'No activities match your filters.':'No activities yet. Add your first one, or try sample data.'}<br><br><button class="btn" id="sample">${S.acts.length?'Clear filters':'Load sample data'}</button></div>`;
 const s=$('#sample');if(s)s.onclick=()=>S.acts.length?$('#fClear').click():loadSample()}
function loadSample(){const T=['Walking','Running','Yoga','Cycling','Strength training','Stretching'];for(let i=0;i<14;i++){if(i%3===2)continue;const t=T[i%6],d=20+i*3%25;S.acts.push({id:'s'+i,type:t,date:daysAgo(i),dur:d+10,dist:['Walking','Running','Cycling'].includes(t)?+(d/8).toFixed(1):0,steps:t==='Walking'?4000+i*200:t==='Running'?3500:0,cal:d*5,notes:'Sample entry'})}save();toast('Sample data loaded.');render()}
$('#actList').onclick=e=>{const b=e.target.closest('button');if(!b)return;const g=id=>S.acts.find(a=>a.id===id);
 if(b.dataset.e)openForm(Object.assign({},g(b.dataset.e),{dist:S.profile.units==='mi'?+(g(b.dataset.e).dist*.621).toFixed(2):g(b.dataset.e).dist}));
 if(b.dataset.d&&confirm('Delete this activity? This cannot be undone.')){S.acts=S.acts.filter(a=>a.id!==b.dataset.d);save();toast('Activity deleted.');render()}
 if(b.dataset.v){const a=g(b.dataset.v);info(`<h2>${esc(a.type)}</h2><p>${a.date}<br>Duration: ${a.dur} min<br>Distance: ${km(a.dist)}<br>Steps: ${a.steps}<br>Calories: ${a.cal||'not set'}</p><p>${esc(a.notes)||'<i>No notes</i>'}</p>`)}};
// dashboard
const QUOTES=['Small steps count. Show up today.','Rest is part of training.','Consistency beats intensity.','Move in a way you enjoy.','Progress, not perfection.'];
function renderDash(){const t=S.acts.filter(a=>a.date===today()),g=S.goals;$('#dName').textContent=S.profile.name;$('#motivation').textContent=QUOTES[new Date().getDate()%QUOTES.length];
 $('#stats').innerHTML=[['Steps today',sum(t,'steps')],['Active minutes',sum(t,'dur')],['Workouts today',t.length],['Distance',km(sum(t,'dist'))]].map(s=>`<div class="card glass stat"><b>${s[1]}</b>${s[0]}</div>`).join('');
 $('#dRings').innerHTML=ring(sum(t,'steps')/g.steps*100,'Steps',sum(t,'steps')+'/'+g.steps)+ring(sum(t,'dur')/g.mins*100,'Minutes',sum(t,'dur')+'/'+g.mins);
 $('#dWeek').innerHTML=bars(byDay(7).map(d=>({l:d.l,v:d.mins})));
 const r=[...S.acts].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);$('#dRecent').innerHTML=r.length?r.map(row).join('').replace(/<div><button.*?<\/div><\/div>/g,'</div>'):'<p class="empty">No workouts yet. Log one in the tracker.</p>'}
// goals
function weekStats(){const w=byDay(7);return{mins:sum(w,'mins'),n:sum(w,'n')}}
function renderGoals(){const g=S.goals,t=S.acts.filter(a=>a.date===today()),w=weekStats();for(const k in g)$('#goalForm')[k].value=g[k];
 $('#goalRings').innerHTML=ring(sum(t,'steps')/g.steps*100,'Daily steps',sum(t,'steps')+'/'+g.steps)+ring(sum(t,'dur')/g.mins*100,'Daily minutes',sum(t,'dur')+'/'+g.mins)+ring(w.mins/g.weekly*100,'Weekly minutes',w.mins+'/'+g.weekly)+ring(w.n/g.freq*100,'Workouts / week',w.n+'/'+g.freq)}
$('#goalForm').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);for(const k in S.goals)S.goals[k]=Math.max(0,+fd.get(k)||0);if(!S.goals.steps||!S.goals.mins)return toast('Steps and minutes goals must be above 0.',1);save();toast('Goals saved.');render()};
$('#goalReset').onclick=()=>{S.goals={...DEF.goals};save();toast('Goals reset.');render()};
// progress
function renderProgress(){const n=+$('#period').value,d=byDay(n),wk=[];for(let i=0;i<d.length;i+=7){const c=d.slice(i,i+7);wk.push({l:c[0].l,v:sum(c,'n')})}
 $('#cMin').innerHTML=bars(d.map(x=>({l:x.l,v:x.mins})));$('#cSteps').innerHTML=bars(d.map(x=>({l:x.l,v:x.steps})));$('#cFreq').innerHTML=bars(wk);
 const g=S.goals,days=d.filter(x=>x.mins>=g.mins).length,pct=Math.round(days/n*100);$('#cGoal').innerHTML=`<p>You hit your daily minutes goal on <b>${days}</b> of ${n} days.</p><div class="bar"><i style="width:${pct}%"></i></div><small>${pct}%</small>`}
$('#period').onchange=renderProgress;
const dl=(name,txt,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)};
$('#expJson').onclick=()=>{S.acts.length?dl('pulse-activities.json',JSON.stringify(S.acts,null,2),'application/json'):toast('Nothing to export yet.',1)};
$('#expCsv').onclick=()=>{if(!S.acts.length)return toast('Nothing to export yet.',1);const h=['date','type','dur','dist','steps','cal','notes'];dl('pulse-activities.csv',[h.join(',')].concat(S.acts.map(a=>h.map(k=>'"'+String(a[k]).replace(/"/g,'""')+'"').join(','))).join('\n'),'text/csv')};
$('#impJson').onchange=e=>{const r=new FileReader();r.onload=()=>{try{const a=JSON.parse(r.result);if(!Array.isArray(a))throw 0;const ok=a.filter(x=>x&&TYPES.includes(x.type)&&/^\d{4}-\d\d-\d\d$/.test(x.date)&&+x.dur>0).map(x=>({id:'i'+Math.random().toString(36).slice(2),type:x.type,date:x.date,dur:+x.dur,dist:+x.dist||0,steps:+x.steps||0,cal:+x.cal||0,notes:String(x.notes||'').slice(0,300)}));S.acts.push(...ok);save();toast(ok.length+' activities imported.');render()}catch(_){toast('Invalid file. Use a PULSE JSON export.',1)}};r.readAsText(e.target.files[0]);e.target.value=''};
// profile
$('#prefTypes').innerHTML=TYPES.map(t=>`<label class="check"><input type="checkbox" name="pt" value="${t}"> ${t}</label>`).join('');
function renderProfile(){const p=S.profile,pf=$('#profForm');pf.name.value=p.name;pf.units.value=p.units;pf.theme.value=p.theme;pf.notify.checked=p.notify;$$('[name=pt]').forEach(c=>c.checked=p.types.includes(c.value));$('#avatar').src=p.pic||'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><rect width="72" height="72" fill="#2e7d32"/><circle cx="36" cy="28" r="12" fill="#b6f23a"/><rect x="14" y="46" width="44" height="30" rx="16" fill="#b6f23a"/></svg>')}
$('#pic').onchange=e=>{const fl=e.target.files[0];if(!fl)return;if(fl.size>1e6)return toast('Image must be under 1 MB.',1);const r=new FileReader();r.onload=()=>{S.profile.pic=r.result;save();renderProfile();toast('Picture updated.')};r.readAsDataURL(fl)};
$('#profForm').onsubmit=e=>{e.preventDefault();const f=e.target,n=f.name.value.trim();if(!n)return toast('Enter a display name.',1);Object.assign(S.profile,{name:n,units:f.units.value,notify:f.notify.checked,types:$$('[name=pt]:checked').map(c=>c.value)});theme(f.theme.value);toast('Settings saved.');render()};
$('#clearAll').onclick=()=>{if(confirm('Delete ALL activity history? This cannot be undone.')){S.acts=[];save();toast('Activity history cleared.');render()}};
// chat (demo assistant)
const SUG=['How active was I this week?','What did I record today?','Suggest a beginner-friendly activity','Show my workout history','Help me set a weekly goal','Log 30 min walking'];
function reply(q){const s=q.toLowerCase(),w=weekStats(),t=S.acts.filter(a=>a.date===today());
 if(/(hurt|pain|injur|diagnos|medic|disease|chest|dizz|diet|lose weight|calorie deficit|starv)/.test(s))return"I can't give medical advice or diet plans. If you feel pain, dizziness or anything worrying, stop and talk to a doctor or other health professional. I'm happy to suggest gentle activity or rest ideas.";
 let m=s.match(/log (\d+)\s*(?:min\w*)?\s*(?:of )?([a-z ]+)/);if(m){const ty=TYPES.find(x=>m[2].trim().startsWith(x.toLowerCase().split(' ')[0]));if(ty&&+m[1]>0&&+m[1]<1440){S.acts.push({id:Date.now()+'c',type:ty,date:today(),dur:+m[1],dist:0,steps:0,cal:0,notes:'Logged via PULSE GUIDE'});save();render();return`Done. I logged ${m[1]} min of ${ty} for today.`}return'I could not match that activity. Try "log 30 min walking".'}
 if(/week|how active/.test(s))return w.n?`This week: ${w.n} workouts and ${w.mins} active minutes (goal ${S.goals.weekly}). ${w.mins>=S.goals.weekly?'You reached your goal. Nice, remember to rest too.':'Keep going at a comfortable pace.'}`:'No activity recorded in the last 7 days. A 10-minute walk is a good place to start.';
 if(/today|record/.test(s))return t.length?'Today: '+t.map(a=>a.type+' '+a.dur+' min').join(', ')+'.':'Nothing recorded today yet.';
 if(/history|workouts?$/.test(s)){const r=[...S.acts].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);return r.length?r.map(a=>`${a.date}: ${a.type}, ${a.dur} min`).join('\n'):'No history yet.'}
 if(/minute/.test(s))return`${sum(S.acts,'dur')} active minutes in total; ${sum(t,'dur')} today.`;
 if(/goal/.test(s))return`Your goals: ${S.goals.steps} steps and ${S.goals.mins} min daily, ${S.goals.weekly} min and ${S.goals.freq} workouts weekly. A sustainable weekly goal for beginners is about 90–150 minutes. Change goals on the Goals page.`;
 if(/beginner|suggest|recommend/.test(s)){const b=W.filter(x=>x[0]==='Beginner'||x[3]==='Easy');const x=b[Math.floor(Math.random()*b.length)];return`Try "${x[1]}" (${x[4]} min). ${x[2]} Easier option: ${x[7]}`}
 if(/rest|recover|sore/.test(s))return'Rest days help your body adapt. Sleep well, drink water, and try gentle stretching or an easy walk. Skip workouts if you feel unwell.';
 if(/where|navigate|how do i|page/.test(s))return'Use the sidebar: Dashboard for stats, Activity Tracker to add entries, Goals, Workouts, Progress for charts and export, Profile for settings.';
 return'I\'m a demo assistant with built-in answers, so I may miss that one. Try asking about your week, goals, today\'s activities, rest, or a beginner activity.'}
function renderChat(){$('#msgs').innerHTML=S.chat.map(m=>`<div class="m ${m.r}">${esc(m.t)}</div>`).join('')||`<div class="m a">Hi! I'm PULSE GUIDE, a demo assistant (not a live AI). Ask me about your activity, goals, or beginner ideas.</div>`;$('#msgs').scrollTop=1e9}
$('#sugg').innerHTML=SUG.map(s=>`<button class="chip" type="button">${s}</button>`).join('');
function ask(q){q=q.trim();if(!q)return;S.chat.push({r:'u',t:q});renderChat();const ty=document.createElement('div');ty.className='m a';ty.textContent='Typing…';$('#msgs').append(ty);
 setTimeout(()=>{S.chat.push({r:'a',t:reply(q)});save();renderChat()},600)}
$('#sugg').onclick=e=>{if(e.target.matches('.chip'))ask(e.target.textContent)};
$('#chatForm').onsubmit=e=>{e.preventDefault();ask($('#chatIn').value);$('#chatIn').value=''};
$('#chatClear').onclick=()=>{S.chat=[];save();renderChat()};
$('#chatBtn').onclick=()=>{const c=$('#chat');c.hidden=!c.hidden;if(!c.hidden)$('#chatIn').focus()};$('#chatClose').onclick=()=>$('#chat').hidden=true;
// init
function render(){renderWorkouts();renderDash();renderTracker();renderGoals();renderProgress();renderProfile();renderChat()}
document.documentElement.dataset.theme=S.profile.theme;
nav(['home','dashboard','tracker','goals','workouts','progress','profile'].includes(location.hash.slice(1))?location.hash.slice(1):'home');
if(S.profile.notify&&!S.acts.some(a=>a.date===today()))setTimeout(()=>toast('Reminder: a short walk counts today.'),1500);
