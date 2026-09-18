(()=>{
const $=id=>document.getElementById(id);
const PER=4, GOAL=12, KEY='upr-first-year-best';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const APP_LINK='https://t.me/Brus_home_bot?startapp'; // ссылка из BotFather вида https://t.me/<бот>/<приложение>
const TG=window.Telegram&&window.Telegram.WebApp;
const inTg=!!(TG&&TG.initData);
const tgv=v=>inTg&&typeof TG.isVersionAtLeast==='function'&&TG.isVersionAtLeast(v);
const haptic=(type,kind)=>{try{if(tgv('6.1'))type==='impact'?TG.HapticFeedback.impactOccurred(kind):TG.HapticFeedback.notificationOccurred(kind)}catch(e){}};
function tgInit(){
 if(!inTg)return;
 try{
  TG.ready();TG.expand();
  if(tgv('6.1')){TG.setHeaderColor('#F6F5F4');TG.setBackgroundColor('#F6F5F4')}
  if(tgv('7.10'))TG.setBottomBarColor('#F6F5F4');
  if(tgv('7.7'))TG.disableVerticalSwipes();
  if(tgv('6.1'))TG.BackButton.onClick(()=>{
   const leave=()=>{S=null;show('start');showBest()};
   if($('game').hidden)return leave();
   tgv('6.2')?TG.showConfirm('Выйти из партии? Прогресс не сохранится.',ok=>{if(ok)leave()}):leave();
  });
 }catch(e){}
}
const svg=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const METERS=[
 {k:'m',name:'Прибыль',desc:'бюджет, тариф и дебиторка',icon:svg('<path d="M8 20V4h5.5a4 4 0 0 1 0 8H6M6 16h8"/>')},
 {k:'p',name:'Жители',desc:'лояльность и чат дома',icon:svg('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M16.5 14c2.5.2 4.5 2.4 4.5 5"/>')},
 {k:'s',name:'Стандарты',desc:'регламенты, приёмка, проверки',icon:svg('<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 3h6v3H9zM9 13.5l2 2 4-4"/>')},
 {k:'b',name:'Стройка',desc:'отношения с застройщиком',icon:svg('<path d="M4 21h9M8 21V4M4 7h16M8 4 4 7M17 7v4M15 11h4v3h-4z"/>')}
];
const MONTHS=['Декабрь','Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь'];
const season=i=>i<=3?'winter':i<=5?'spring':i<=8?'summer':'autumn';
const ENDINGS={
 m0:['Касса пуста','Подрядчики выставили претензии, зарплату платить нечем. Акционеры назначили нового директора.'],
 m1:['Вас переголосовали на ОСС','Прибыль рекордная, но жители посчитали, на чём вы сэкономили, и выбрали другую управляющую компанию.'],
 p0:['Бунт в чате дома','Инициативная группа собрала подписи и дошла до управы и прокуратуры. Проверки идут третий месяц.'],
 p1:['Жители испекли вам торт','Вы сказали «да» на каждую просьбу. Торт был вкусный, а смета на следующий год — нет.'],
 s0:['Предписание жилинспекции','Журналы пустые, паспорта лифтов не подписаны, пожарные проходы заставлены. Лицензия под угрозой.'],
 s1:['Регламент ради регламента','Любая заявка теперь проходит пять согласований. Сантехник ждёт подписи, пока течёт стояк.'],
 b0:['Холодная война со стройкой','Гарантийный отдел перестал отвечать на ваши письма. Замечания копятся, а виноватой жители считают УК.'],
 b1:['Дом ушёл на конкурс','Вы подписывали всё как есть. Жители не простили недоделок, собрание провалилось, и управа объявила конкурс.'],
 win:['Первый год закрыт','Двенадцать месяцев, и ни одна шкала не сорвалась. Можно принимать вторую очередь.']
};
const STYLES={
 m:['Директор-экономист','Считает каждый рубль сметы'],
 p:['Директор-дипломат','Сначала жители, потом всё остальное'],
 s:['Директор-регламент','Живёт по стандарту и требует того же от других'],
 b:['Директор-переговорщик','Умеет договориться со стройкой'],
 all:['Директор-канатоходец','Держит все четыре шкалы в равновесии']
};
const BY=Object.fromEntries(CARDS.map(c=>[c.id,c]));
const plural=(n,a,b,c)=>{const t=n%100,u=n%10;return t>10&&t<20?c:u===1?a:u>=2&&u<=4?b:c};
let S=null, busy=false, toastT=0;

function toast(t){const el=$('toast');el.textContent=t;el.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('on'),2600)}
function show(name){['start','game','end'].forEach(s=>$(s).hidden=s!==name);window.scrollTo(0,0);try{if(tgv('6.1'))name==='start'?TG.BackButton.hide():TG.BackButton.show()}catch(e){}}
let cloudBest=0;
function readBest(){let b=cloudBest;try{b=Math.max(b,+localStorage.getItem(KEY)||0)}catch(e){}return b}
function saveBest(n){if(n<=readBest())return;cloudBest=n;try{localStorage.setItem(KEY,n)}catch(e){}try{if(tgv('6.9'))TG.CloudStorage.setItem(KEY,String(n))}catch(e){}}
function loadCloudBest(){try{if(tgv('6.9'))TG.CloudStorage.getItem(KEY,(err,v)=>{if(!err&&v){cloudBest=Math.max(cloudBest,+v||0);showBest()}})}catch(e){}}
function loadRecent(){try{return JSON.parse(localStorage.getItem(KEY+'-recent')||'[]')}catch(e){return []}}
function saveRecent(ids){try{localStorage.setItem(KEY+'-recent',JSON.stringify(ids))}catch(e){}}
function showBest(){const b=readBest();$('best').textContent=b?`Ваш рекорд: ${b} ${plural(b,'месяц','месяца','месяцев')} из 12`:''}

function renderRules(){
 $('rules').innerHTML=METERS.map(m=>`<li>${m.icon}<div><b>${m.name}</b><span>${m.desc}</span></div></li>`).join('');
}
function buildMeters(){
 $('meters').innerHTML=METERS.map(m=>`<div class="meter" id="mt-${m.k}" role="img"><i class="dot" id="dot-${m.k}"></i>${m.icon}<div class="track"><div class="fill" id="fill-${m.k}"></div></div><span class="meter-name">${m.name}</span></div>`).join('');
}
function renderMeters(){
 METERS.forEach(m=>{const v=S.v[m.k];$('fill-'+m.k).style.width=v+'%';const el=$('mt-'+m.k);el.classList.toggle('warn',v<=20||v>=80);el.setAttribute('aria-label',`${m.name}: ${v} из 100`)});
}

function pick(){
 if(S.turn<OPENING.length)return BY[OPENING[S.turn]];
 const qi=S.queue.findIndex(q=>q.at<=S.turn);
 if(qi>=0)return BY[S.queue.splice(qi,1)[0].id];
 const se=season(Math.floor(S.turn/PER));
 const ok=c=>!c.fixed&&!c.follow&&(!c.season||c.season.includes(se));
 let pool=CARDS.filter(c=>ok(c)&&!S.used.has(c.id));
 if(!pool.length)pool=CARDS.filter(c=>ok(c)&&c.id!==S.last);
 const w=pool.map(c=>(c.season?3:1)*(S.recent.has(c.id)?.3:1)), total=w.reduce((a,b)=>a+b,0);
 let r=Math.random()*total;
 for(let i=0;i<pool.length;i++){r-=w[i];if(r<0)return pool[i]}
 return pool[0];
}

function lean(dx){
 const c=S&&S.card;if(!c)return;
 const a=Math.min(1,Math.abs(dx)/90), side=dx<0?'L':'R', le=$('lean');
 if(le){le.classList.toggle('right',dx<0);$('leanText').textContent=c[side].t;$('leanText').style.opacity=a}
 METERS.forEach(m=>{const v=c[side].fx[m.k], on=a>.3&&!!v, d=$('dot-'+m.k);d.classList.toggle('on',on);d.classList.toggle('big',on&&Math.abs(v)>10)});
 $('cl').classList.toggle('hot',dx<-30);$('cr').classList.toggle('hot',dx>30);
}

function bindDrag(el){
 let x0=0,dx=0,down=false;
 el.addEventListener('pointerdown',e=>{if(busy)return;down=true;x0=e.clientX;dx=0;el.classList.remove('back','enter');el.setPointerCapture(e.pointerId)});
 el.addEventListener('pointermove',e=>{if(!down)return;dx=e.clientX-x0;el.style.transform=`translateX(${dx}px) rotate(${dx/16}deg)`;lean(dx)});
 const up=()=>{if(!down)return;down=false;if(Math.abs(dx)>90)choose(dx<0?'L':'R');else{el.classList.add('back');el.style.transform='';lean(0)}};
 el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
}

function renderCard(c){
 const res=/Жител|Мама|Инициатив/.test(c.who);
 $('stage').innerHTML=`<article class="card enter" id="card">
  <div class="lean" id="lean"><span id="leanText"></span></div>
  <span class="tag">${c.tag}</span>
  <div class="who"><div class="avatar${res?' res':''}" aria-hidden="true">${c.who[0]}</div><div><b>${c.who}</b><span>${c.role}</span></div></div>
  <p class="say">${c.text}</p></article>`;
 bindDrag($('card'));
 const mi=Math.floor(S.turn/PER);
 $('month').innerHTML=`<b>${MONTHS[mi%12]}</b> · месяц ${mi+1} из ${GOAL}`;
 $('turn').textContent=`решение ${S.turn+1}`;
 $('cl').innerHTML=`<small>← влево</small>${c.L.t}`;
 $('cr').innerHTML=`<small>вправо →</small>${c.R.t}`;
}

function next(){S.card=pick();renderCard(S.card)}

function choose(side){
 if(busy||!S||!S.card)return;busy=true;lean(0);haptic('impact','light');
 const el=$('card');el.classList.remove('back','enter');el.classList.add('fly');
 el.style.transform=`translateX(${side==='L'?-140:140}%) rotate(${side==='L'?-24:24}deg)`;el.style.opacity='0';
 setTimeout(()=>{busy=false;apply(side)},reduce?0:280);
}

function apply(side){
 const c=S.card, ch=c[side];
 for(const k in ch.fx){S.v[k]=Math.max(0,Math.min(100,S.v[k]+ch.fx[k]));if(ch.fx[k]>0)S.fav[k]+=ch.fx[k]}
 if(ch.cake)S.cake++;if(ch.jam)S.jam++;
 if(ch.next&&!S.used.has(ch.next)&&!S.queue.some(q=>q.id===ch.next))S.queue.push({id:ch.next,at:S.turn+2+Math.floor(Math.random()*3)});
 S.used.add(c.id);S.last=c.id;S.turn++;S.card=null;
 renderMeters();if(ch.msg)toast(ch.msg);
 const dead=METERS.find(m=>S.v[m.k]<=0||S.v[m.k]>=100);
 if(dead){busy=true;$('stage').innerHTML='';return setTimeout(()=>{busy=false;end(dead.k+(S.v[dead.k]<=0?'0':'1'))},700)}
 if(S.turn>=GOAL*PER){busy=true;$('stage').innerHTML='';return setTimeout(()=>{busy=false;end('win')},500)}
 next();
}

function styleOf(){
 const vals=METERS.map(m=>S.fav[m.k]), total=vals.reduce((a,b)=>a+b,0);
 if(!total)return STYLES.all;
 const max=Math.max(...vals), min=Math.min(...vals);
 if((max-min)/total<.12)return STYLES.all;
 return STYLES[METERS[vals.indexOf(max)].k];
}

function end(key){
 const [title,text]=ENDINGS[key], mi=Math.floor((S.turn-1)/PER), n=key==='win'?GOAL:Math.min(GOAL,mi+1);
 const st=styleOf();
 S.result={n,title,style:st[0]};
 $('endEyebrow').textContent=key==='win'?'Итог · 12 месяцев из 12':`Итог · ${MONTHS[mi%12].toLowerCase()}, месяц ${n}`;
 $('endTitle').textContent=title;$('endText').textContent=text;
 $('endStyle').textContent=st[0];$('endStyleNote').textContent=st[1];
 const stats=[`${n} ${plural(n,'месяц','месяца','месяцев')} из 12`,`${S.turn} ${plural(S.turn,'решение','решения','решений')}`];
 if(S.cake)stats.push(`${S.cake} ${plural(S.cake,'торт','торта','тортов')} от жителей`);
 if(S.jam)stats.push(`${S.jam} ${plural(S.jam,'банка','банки','банок')} варенья`);
 $('endStats').innerHTML=stats.map(s=>`<span class="stat">${s}</span>`).join('');
 saveRecent([...S.used]);saveBest(n);haptic('notify',key==='win'?'success':'error');show('end');
}

async function share(){
 if(!S||!S.result)return;
 const r=S.result, url=APP_LINK||(/^https?:/.test(location.href)?location.href.split('#')[0]:'');
 const text=`«Управляющий. Первый год»: ${r.n} ${plural(r.n,'месяц','месяца','месяцев')} из 12, мой стиль — ${r.style.toLowerCase()}. Финал: «${r.title}». Сможете дольше?`;
 if(inTg&&url){try{TG.openTelegramLink('https://t.me/share/url?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(text));return}catch(e){}}
 try{if(navigator.share){await navigator.share(url?{title:'Управляющий. Первый год',text,url}:{title:'Управляющий. Первый год',text});return}}catch(e){if(e&&e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(url?`${text} ${url}`:text);toast('Результат скопирован — вставьте в чат')}catch(e){toast(text)}
}

function start(){
 S={v:{m:50,p:50,s:50,b:50},fav:{m:0,p:0,s:0,b:0},turn:0,used:new Set(),queue:[],cake:0,jam:0,last:null,card:null,result:null,recent:new Set(loadRecent())};
 busy=false;buildMeters();renderMeters();show('game');next();
}

$('play').addEventListener('click',start);
$('again').addEventListener('click',start);
$('share').addEventListener('click',share);
$('cl').addEventListener('click',()=>choose('L'));
$('cr').addEventListener('click',()=>choose('R'));
[['cl',-60],['cr',60]].forEach(([id,dx])=>{
 $(id).addEventListener('mouseenter',()=>{if(!busy&&S&&S.card){lean(dx);const el=$('card');if(el){el.classList.add('back');el.style.transform=`rotate(${dx/20}deg)`}}});
 $(id).addEventListener('mouseleave',()=>{if(S&&S.card){lean(0);const el=$('card');if(el)el.style.transform=''}});
});
document.addEventListener('keydown',e=>{
 if($('game').hidden||busy)return;
 if(e.key==='ArrowLeft'){e.preventDefault();choose('L')}
 if(e.key==='ArrowRight'){e.preventDefault();choose('R')}
});
tgInit();renderRules();showBest();loadCloudBest();
})();
