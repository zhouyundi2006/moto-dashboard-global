// @ts-nocheck — legacy renderer body moved verbatim from index.html during the TypeScript migration.
// Data boundaries are typed in types.ts; a strict per-module pass is the next step.

import type { Dashboard, Brand, Model, Specs } from "./types";

declare global {
  interface Window {
    MOTO_DATA?: Dashboard;
    MOTO_SPECS?: Specs;
    STATS_API?: string;
  }
}

const DATA = window.MOTO_DATA;
if (!DATA || !DATA.brands) {
  document.addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<div style="margin:16px;padding:16px 18px;border:1px solid #63302a;background:#2a1413;color:#ffb1a5;font:14px/1.7 -apple-system,sans-serif;border-radius:10px">' +
        "data/dashboard.js did not load, so the page cannot render. Check that the file exists and reload.</div>",
    );
  });
  throw new Error("MOTO_DATA missing");
}


var SCOPE_OUTSIDE=false;
try{SCOPE_OUTSIDE=new URLSearchParams(location.search).get("scope")==="exchina"}catch(e){}
var D: Dashboard = DATA;
if(SCOPE_OUTSIDE){
  D.brands = DATA.brands.filter(function(b){return b.category!=="Chinese"});
  if(DATA.statsOutsideChina) D.stats = DATA.statsOutsideChina;
  if(DATA.marketOutsideChina) D.market = DATA.marketOutsideChina;
}
var LOGO: Record<string, string> = {};
D.brands.forEach(function (b) { if (b.logo && b.logo.file) LOGO[b.id] = b.logo.file; });
var CATS = ["Japanese","European","American","Asian other","Chinese"];
var CAT_KEY = {"Japanese":"dom","European":"jv","American":"imp","Asian other":"asia","Chinese":"cn"};
var CAT_COLOR = {"Japanese":"var(--dom)","European":"var(--jv)","American":"var(--imp)","Asian other":"var(--asia)","Chinese":"var(--cn)"};
var BUCKETS = ["200-399cc","400-699cc","700-999cc","1000cc+"];
var BUCKET_COLOR = ["#FF4A1F","#FFB224","#2FD6A3","#4D9FFF"];
var TYPE_COLOR = {"Cruiser":"#FF4A1F","Naked":"#4D9FFF","ADV":"#2FD6A3","Adventure":"#2FD6A3","Sport":"#FF5C5C","Scooter":"#FFB224","Retro":"#B78CFF","Touring":"#59C2E6","Off-road":"#8BD450","Sidecar":"#F2789F","Reverse trike":"#C9A26B","Other":"#9AA5B5"};
var $ = function(id){return document.getElementById(id)};
var esc = function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var pad = function(n){return n<10?"0"+n:String(n)};
var brandById = {}; D.brands.forEach(function(b){brandById[b.id]=b});
var store = {
  get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
var state = {q:"",cat:"All",bucket:"",type:"",price:"",officialOnly:false,sort:"default",view:"brands",favs:store.get("moto-favs",[]),az:"",cmp:[]};
/* 筛选状态写进 query string（不用 hash，避免和 #market 这类锚点打架），链接可直接分享 */
var urlParams=null;
try{urlParams=new URLSearchParams(location.search)}catch(e){}
var isFav = function(id){return state.favs.indexOf(id)>=0};

/* SECTION: theme */
var theme = store.get("moto-theme", null) || (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light":"dark");
function applyTheme(t){document.documentElement.dataset.theme=t;$("themeBtn").textContent=t==="dark"?"☾":"☀";store.set("moto-theme",t)}
applyTheme(theme);
$("themeBtn").addEventListener("click",function(){applyTheme(document.documentElement.dataset.theme==="dark"?"light":"dark")});

/* SECTION: toast */
var toastTimer=null;
function toast(msg){var t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.classList.remove("show")},1800)}

/* SECTION: tooltip —— 一个信息层管所有 data-tip 元素（矩阵格 / 榜上品牌 / 条形图 / 类别图块） */
var tipEl=null,tipTimer=null;
function tipShow(html,x,y){
  if(!tipEl)tipEl=$("tip");
  tipEl.innerHTML=html;tipEl.classList.add("show");tipEl.setAttribute("aria-hidden","false");
  try{tipMove(x,y)}catch(e){}
}
function tipMove(x,y){
  if(!tipEl)return;
  var w=tipEl.offsetWidth,h=tipEl.offsetHeight;
  var left=Math.min(x+14,innerWidth-w-10),top=y+16;
  if(top+h>innerHeight-8)top=y-h-14;
  tipEl.style.left=Math.max(8,left)+"px";tipEl.style.top=Math.max(8,top)+"px";
}
function tipHide(){if(tipEl)tipEl.classList.remove("show")}
document.addEventListener("mouseover",function(e){
  var el=e.target.closest?e.target.closest("[data-tip]"):null;
  if(!el)return;
  clearTimeout(tipTimer);
  tipTimer=setTimeout(function(){tipShow(el.dataset.tip,e.clientX,e.clientY)},60);
});
document.addEventListener("mousemove",function(e){
  if(!tipEl||!tipEl.classList.contains("show"))return;
  if(!(e.target.closest&&e.target.closest("[data-tip]"))){tipHide();return}
  tipMove(e.clientX,e.clientY);
});
document.addEventListener("mouseout",function(e){
  var el=e.target.closest?e.target.closest("[data-tip]"):null;
  if(el&&!(e.relatedTarget&&el.contains(e.relatedTarget))){clearTimeout(tipTimer);tipHide()}
});
window.addEventListener("scroll",tipHide,{passive:true});

/* SECTION: logo helper */
function fillLogo(box,b,fbClass){
  box.innerHTML="";
  var url=LOGO[b.id];
  if(url){
    var img=document.createElement("img");
    img.loading="lazy";img.alt=b.name+" Logo";img.src=url;
    img.addEventListener("error",function(){box.innerHTML="";var d=document.createElement("div");d.className=fbClass;d.textContent=b.nameEn||b.name;box.appendChild(d)});
    box.appendChild(img);
  }else{
    var d=document.createElement("div");d.className=fbClass;d.textContent=b.nameEn||b.name;box.appendChild(d);
  }
  box.classList.toggle("dark",!!b.logoDark);
}

/* SECTION: hero */
var s=D.stats, mk=D.market;
$("heroDate").textContent=D.meta.updated;
$("heroBrands").textContent=s.brandCount;
$("heroModels").textContent=s.modelCount;
var hl=$("heroLogos");if(hl)hl.textContent=s.logoCount;
var rt=$("rankTotal");if(rt)rt.textContent=s.modelCount;
var scEl=$("scatter");if(scEl)scEl.parentElement.style.display="none";
$("heroSub").textContent=D.meta.scope+" · every model sourced";
$("tYear").textContent=mk.year;
$("marketYear").textContent=mk.year;
$("footDate").textContent=D.meta.updated;
var heroKpis=[
{label:"Brands covered",val:s.brandCount,unit:"",note:D.brands.some(function(b){return b.category==="Chinese"})?"Japanese / European / American / Asian other / Chinese":"Japanese / European / American / Asian other"},
  {label:"Models listed",val:s.modelCount,unit:"",note:"\u2265200cc · official line-ups"},
  {label:"Models above 1000cc",val:(s.byBucket["1000cc+"]||0),unit:"",note:"the top of the displacement range",hot:true},
  {label:"Adventure models",val:(s.byType["ADV"]||0),unit:"",note:"ADV body type · largest slice after cruisers",hot:true}
];
$("heroKpis").innerHTML=heroKpis.map(function(k){
  return '<div class="kpi'+(k.hot?" hot":"")+'"><div class="k-label">'+esc(k.label)+'</div><div class="k-val num">'+esc(k.val)+'<small>'+esc(k.unit)+'</small></div><div class="k-note">'+esc(k.note)+'</div></div>';
}).join("");

/* SECTION: market */
$("marketCards").innerHTML=mk.items.map(function(it){
  return '<div class="panel mcard"><div class="m-label">'+esc(it.label)+'</div><div class="m-val num">'+esc(it.value)+'<small>'+esc(it.unit)+'</small>'+(it.delta?'<span class="m-delta">'+esc(it.delta)+'</span>':'')+'</div><div class="m-note">'+esc(it.note)+'</div></div>';
}).join("");
function leadRows(arr){return arr.map(function(x,i){return '<div class="lead-row"><span class="lead-rank num">'+(i+1)+'</span><span>'+esc(x)+'</span></div>'}).join("")}
$("leaders250").innerHTML=leadRows(mk.leaders250);
$("leaders500").innerHTML=leadRows(mk.leaders500);
$("marketSrc").textContent="Source: "+mk.leadersSource+"；"+mk.source;

/* 月度产销趋势：数据来自 data/market_monthly.js（scripts/fetch_monthly.py 抓商会月度稿生成） */
(function buildTrend(){
  var M=window.MOTO_MONTHLY,panel=$("trendPanel");
  if(!M||!M.series||!M.series.length){if(panel)panel.style.display="none";return}
  var rows=M.series;
  var max=Math.max.apply(null,rows.map(function(r){return Math.max(r.prod,r.sales)}))||1;
  max=Math.ceil(max*1.18);
  var W=760,H=230,padL=34,padR=8,padT=22,padB=26;
  var iw=W-padL-padR,ih=H-padT-padB;
  var step=iw/rows.length,barW=Math.min(20,step*0.3);
  var y=function(v){return padT+ih-(v/max)*ih};
  var grid=[];
  for(var g=0;g<=max;g+=Math.max(2,Math.ceil(max/5))){
    grid.push('<line class="gx" x1="'+padL+'" x2="'+(W-padR)+'" y1="'+y(g)+'" y2="'+y(g)+'"/>'+
      '<text class="lbl" x="'+(padL-6)+'" y="'+(y(g)+3)+'" text-anchor="end">'+g+'</text>');
  }
  var marks=rows.map(function(r,i){
    var cx=padL+step*(i+0.5);
    var xg=cx-barW-2,xs=cx+2;
 var tip='<div class=\'th\'>2026 · M'+parseInt(r.month.slice(5))+'</div>'+
      '<div class=\'trow\'><span>Output</span><span>'+r.prod.toFixed(2)+' 万辆</span></div>'+
      '<div class=\'trow\'><span>Sales</span><span>'+r.sales.toFixed(2)+' 万辆</span></div>'+
 '<div class=\'trow\'><span>YoY</span><span>output '+(r.yoyProd>0?"+":"")+r.yoyProd.toFixed(2)+'% · sales '+(r.yoySales>0?"+":"")+r.yoySales.toFixed(2)+'%</span></div>';
    return '<g data-tip="'+esc(tip)+'">'+
      '<rect class="hit" x="'+(cx-step/2)+'" y="'+padT+'" width="'+step+'" height="'+ih+'" fill="transparent"/>'+
      '<rect class="bar-g" x="'+xg+'" y="'+y(r.prod)+'" width="'+barW+'" height="'+Math.max(1,(r.prod/max)*ih)+'"/>'+
      '<rect class="bar-s" x="'+xs+'" y="'+y(r.sales)+'" width="'+barW+'" height="'+Math.max(1,(r.sales/max)*ih)+'"/>'+
      (i===rows.length-1?'<text class="vl" x="'+cx+'" y="'+(y(r.sales)-5)+'" text-anchor="middle">'+r.sales.toFixed(2)+'</text>':'')+
'<text class="lbl" x="'+cx+'" y="'+(H-8)+'" text-anchor="middle">M'+(parseInt(r.month.slice(5)))+'</text>'+
      '</g>';
  }).join("");
  $("trendChart").innerHTML='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="2026 · M1–M'+rows.length+' · 250cc+ output &amp; sales">'+
    grid.join("")+marks+'<line class="ax" x1="'+padL+'" x2="'+(W-padR)+'" y1="'+(padT+ih)+'" y2="'+(padT+ih)+'"/>'+
    '<line class="ax" x1="'+padL+'" x2="'+padL+'" y1="'+padT+'" y2="'+(padT+ih)+'"/></svg>'+
    '<div class="trend-note"><span><i style="background:#4D9FFF"></i>Output</span><span><i style="background:#FF4A1F"></i>Sales</span>'+
    '<span style="color:var(--faint)">Unit: 10k units · hover for YoY</span></div>';
  var first=rows[0],last=rows[rows.length-1];
  var sumP=rows.reduce(function(a,r){return a+r.prod},0),sumS=rows.reduce(function(a,r){return a+r.sales},0);
  var peak=rows.slice().sort(function(a,b){return b.sales-a.sales})[0];
  $("trendSub").textContent="Scope: combustion motorcycles above 250ml (250ml excluded) ·"+first.month+" — "+last.month+" ("+rows.length+" months, published monthly by the chamber)";
  /* 与 2025 全年官方口径（95.23 万辆）比完成度：商会 2025 年 5/6 月两篇原稿数字重复，月度序列不跨年拼接，只在这里给年度参照 */
  var annual2025=parseFloat(String((mk.items[0]||{}).value||"").replace(/[^\d.]/g,""));
  var ratio=annual2025>0?(sumS/annual2025*100):null;
  $("trendKpis").innerHTML='<div class="tk"><b>'+sumS.toFixed(2)+'</b><span>Cumulative sales (10k)</span></div>'+
'<div class="tk"><b>'+last.sales.toFixed(2)+'</b><span>M'+parseInt(last.month.slice(5))+' monthly sales · YoY <span class="'+(last.yoySales>0?"pos":"neg")+'">'+(last.yoySales>0?"+":"")+last.yoySales.toFixed(2)+'%</span></span></div>'+
'<div class="tk"><b>M'+parseInt(peak.month.slice(5))+'</b><span>Peak month: '+(peak.sales*10000).toLocaleString('en-US')+' units</span></div>'+
(ratio?'<div class="tk"><b>'+ratio.toFixed(1)+'%</b><span>of the FY2025 total of '+(annual2025*10000).toLocaleString('en-US')+' units</span></div>':'');
$("trendSrc").textContent="Source: China Chamber of Motorcycle Commerce, Monthly Motorcycle Industry Report ("+first.month+"–"+last.month+"), each figure links to one original release; scraped by scripts/fetch_monthly.py on"+M.lastFetched+"。"+
    (annual2025?'FY2025 250cc+ sales'+annual2025.toFixed(2)+' 0k units (chamber annual basis, +25.87% YoY). The May/June 2025 monthly releases repeat figures and contradict each other month-on-month, so the monthly series covers 2026 only and the annual comparison sits top right.':'');
})();

/* SECTION: charts */
function bars(elId,obj,order,colors,kind){
  var max=Math.max.apply(null,Object.keys(obj).map(function(k){return obj[k]}).concat([1]));
  var keys=order||Object.keys(obj).sort(function(a,b){return obj[b]-obj[a]});
  $(elId).innerHTML=keys.filter(function(k){return obj[k]!=null}).map(function(k){
    var v=obj[k]||0,c=(colors&&(colors[k]||colors[keys.indexOf(k)]))||"var(--accent)";
    if(Array.isArray(colors))c=colors[keys.indexOf(k)]||"var(--accent)";
    return '<div class="bar-row" role="button" tabindex="0" data-kind="'+kind+'" data-key="'+esc(k)+'" title="Filter: '+esc(k)+'"><div class="bl">'+esc(k)+'</div><div class="bar-track"><div class="bar-fill" data-w="'+(v/max*100).toFixed(1)+'" style="background:'+c+'"></div></div><div class="bv num">'+v+'</div></div>';
  }).join("");
}
bars("chartBucket",s.byBucket,BUCKETS,BUCKET_COLOR,"bucket");
bars("chartType",s.byType,null,TYPE_COLOR,"type");
bars("chartCat",s.byCategoryModels,CATS.filter(function(c){return (s.byCategoryModels[c]||0)>0}),CAT_COLOR,"cat");
$("chartTotal").textContent=s.modelCount;

function animateBars(root){
  (root||document).querySelectorAll(".bar-fill").forEach(function(f){
    requestAnimationFrame(function(){requestAnimationFrame(function(){f.style.width=f.dataset.w+"%"})});
  });
}
document.addEventListener("click",function(e){
  var row=e.target.closest(".bar-row");if(!row)return;
  var kind=row.dataset.kind,key=row.dataset.key;
  if(kind==="bucket"){state.bucket=key;state.officialOnly=true}
  else if(kind==="type"){state.type=key;state.officialOnly=true}
  else if(kind==="cat"){state.cat=key;state.officialOnly=true}
  syncControls();render();
  $("explorer").scrollIntoView({behavior:"smooth"});
  toast("Filtered by "+key);
});
document.addEventListener("keydown",function(e){
  if(e.key==="Enter"&&e.target.classList&&e.target.classList.contains("bar-row"))e.target.click();
});

/* SECTION: garage */
function garageCard(b){
  var el=document.createElement("div");
  el.className="g-card"+(isFav(b.id)?" faved":"");
  el.tabIndex=0;el.setAttribute("role","button");el.dataset.id=b.id;
  el.innerHTML='<button class="g-fav" aria-label="Save brand">'+(isFav(b.id)?"★":"☆")+'</button><div class="g-logo"></div><div class="g-name"></div><div class="g-meta"><span class="dot" style="background:'+CAT_COLOR[b.category]+'"></span><span class="g-cnt"></span></div>';
  el.querySelector(".g-name").textContent=b.name;
  el.querySelector(".g-cnt").textContent=b.modelCount+" models on sale";
  fillLogo(el.querySelector(".g-logo"),b,"g-fb");
  el.querySelector(".g-fav").addEventListener("click",function(e){e.stopPropagation();toggleFav(b.id)});
  el.addEventListener("click",function(){openDrawer(b.id)});
  el.addEventListener("keydown",function(e){if(e.key==="Enter")openDrawer(b.id)});
  return el;
}
var AZ_LETTERS="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
function azLetter(b){
  var c=(b.nameEn||"").toUpperCase().charAt(0);
  return /[A-Z]/.test(c)?c:"#";
}
function renderGarage(){
  var grid=$("garageGrid");grid.innerHTML="";
  var frag=document.createDocumentFragment();
  D.brands.filter(function(b){return !state.az||azLetter(b)===state.az}).forEach(function(b){frag.appendChild(garageCard(b))});
  grid.appendChild(frag);
}
function renderAz(){
  var counts={};
  D.brands.forEach(function(b){var l=azLetter(b);counts[l]=(counts[l]||0)+1});
  var keys=Object.keys(counts).sort();
var html='<span class="az-lab">By English name</span><button class="az'+(state.az?"":" on")+'" data-az="" type="button">All '+D.brands.length+'</button>'+
    keys.map(function(l){
return '<button class="az'+(state.az===l?" on":"")+'" data-az="'+l+'" type="button" title="'+counts[l]+' brands starting with '+l+'">'+l+'</button>';
    }).join("");
  $("azRow").innerHTML=html;
}
$("azRow").addEventListener("click",function(e){
  var b=e.target.closest("[data-az]");if(!b)return;
  state.az=(b.dataset.az===state.az)?"":b.dataset.az;
  renderAz();renderGarage();
  if(state.az)toast("Showing"+state.az+" brands starting with");
});
renderAz();renderGarage();

/* SECTION: favorites */
function toggleFav(id){
  var i=state.favs.indexOf(id);
  if(i>=0){state.favs.splice(i,1);toast("Removed: "+brandById[id].name)}
  else{state.favs.push(id);toast("Saved: "+brandById[id].name)}
  store.set("moto-favs",state.favs);
  refreshFavUI();
  if(state.cat==="Saved")render();
}
function refreshFavUI(){
  document.querySelectorAll(".g-card").forEach(function(c){
    var on=isFav(c.dataset.id);c.classList.toggle("faved",on);
    c.querySelector(".g-fav").textContent=on?"★":"☆";
  });
  document.querySelectorAll(".b-card").forEach(function(c){
    var on=isFav(c.dataset.id);c.classList.toggle("faved",on);
    var f=c.querySelector(".b-fav");if(f)f.textContent=on?"★":"☆";
  });
  var df=$("dFav");
  if(df&&df.dataset.id){var on=isFav(df.dataset.id);df.classList.toggle("on",on);df.textContent=on?"★ Saved":"☆ Save brand"}
  var favChip=document.querySelector('.chip-tab[data-cat="Saved"]');
  if(favChip)favChip.textContent="★ Saved"+state.favs.length;
}
$("favNavBtn").addEventListener("click",function(){
  state.cat="Saved";syncControls();render();
  $("explorer").scrollIntoView({behavior:"smooth"});
});

/* SECTION: explorer filters */
var bucketSel=$("fBucket"),typeSel=$("fType");
bucketSel.innerHTML='<option value="">All displacements</option>'+Object.keys(s.byBucket||{}).filter(function(k){return (s.byBucket[k]||0)>0}).map(function(b){return '<option value="'+esc(b)+'">'+esc(b)+'（'+(s.byBucket[b]||0)+'）</option>'}).join("");
typeSel.innerHTML='<option value="">All body types</option>'+Object.keys(s.byType||{}).sort(function(a,b){return s.byType[b]-s.byType[a]}).map(function(t){return '<option value="'+esc(t)+'">'+esc(t)+'（'+s.byType[t]+'）</option>'}).join("");

/* 价格档位：priceMin/priceMax 已归一为「元」，按区间交集判定；未公布单列 */
var PRICE_RANGES=[
  {k:"lt1",label:"Under ¥10k",lo:0,hi:10000},
  {k:"1-2",label:"¥10k–20k",lo:10000,hi:20000},
  {k:"2-3",label:"¥20k–30k",lo:20000,hi:30000},
  {k:"3-5",label:"¥30k–50k",lo:30000,hi:50000},
  {k:"gte5",label:"¥50k+",lo:50000,hi:Infinity},
  {k:"none",label:"Price not published"}
];
var RANGE_BY_KEY={};PRICE_RANGES.forEach(function(r){RANGE_BY_KEY[r.k]=r});

/* 从 query string 恢复筛选状态；取值不在白名单里就忽略，避免分享到脏链接后整页空白 */
(function applyUrlState(){
  if(!urlParams)return;
  var cats=["All","Saved","Japanese","European","American","Asian other"];
  if(urlParams.get("q"))state.q=urlParams.get("q").slice(0,60);
  if(cats.indexOf(urlParams.get("cat"))>=0)state.cat=urlParams.get("cat");
  var t=urlParams.get("type");
  if(t&&Object.keys(s.byType||{}).indexOf(t)>=0)state.type=t;
  var b=urlParams.get("bucket");
  if(b&&Object.prototype.hasOwnProperty.call(s.byBucket||{},b))state.bucket=b;
  var pr=urlParams.get("price");if(pr&&RANGE_BY_KEY[pr])state.price=pr;
  var sorts=["default","count","price-asc","price-desc","cc-asc","cc-desc","name"];
  if(sorts.indexOf(urlParams.get("sort"))>=0)state.sort=urlParams.get("sort");
  if(urlParams.get("view")==="models")state.view="models";
  if(urlParams.get("official")==="1")state.officialOnly=true;
})();
function inPrice(m,r){
  /* 按起售价（priceMin）落档：跨档车型不重复计数，六档相加正好等于总型号数 */
  if(!r)return true;
  if(r.k==="none")return !m.price;
  if(!m.price||m.priceMin==null)return false;
  if(r.hi===Infinity)return m.priceMin>=r.lo;
  return m.priceMin>=r.lo&&m.priceMin<r.hi;
}
var priceCounts={},allModels=[];
D.brands.forEach(function(b){b.models.forEach(function(m){allModels.push(m)})});
PRICE_RANGES.forEach(function(r){priceCounts[r.k]=allModels.filter(function(m){return inPrice(m,r)}).length});
var priceChips=$("priceChips");
priceChips.innerHTML='<span class="ch-lbl">Price</span>'+
  '<button class="chip-tab" data-price="" type="button">All<span class="cnt">'+allModels.length+'</span></button>'+
  PRICE_RANGES.map(function(r){return '<button class="chip-tab" data-price="'+r.k+'" type="button">'+esc(r.label)+'<span class="cnt">'+priceCounts[r.k]+'</span></button>'}).join("");
priceChips.addEventListener("click",function(e){
  var b=e.target.closest("[data-price]");if(!b)return;
  state.price=(b.dataset.price===state.price)?"":b.dataset.price;
  syncControls();render();
});

var chipDefs=[{k:"All",cls:""},{k:"Japanese",cls:"cat-dom"},{k:"European",cls:"cat-jv"},{k:"American",cls:"cat-imp"},{k:"Asian other",cls:"cat-asia"},{k:"Chinese",cls:"cat-cn"},{k:"Saved",cls:"cat-fav"}];
$("catChips").innerHTML=chipDefs.map(function(c){
  var n=c.k==="All"?s.brandCount:(c.k==="Saved"?state.favs.length:(s.byCategory[c.k]||0));
  var label=c.k==="Saved"?"★ Saved"+n:esc(c.k)+" "+n;
  return '<button class="chip-tab '+c.cls+'" data-cat="'+esc(c.k)+'" type="button">'+label+'</button>';
}).join("");
$("catChips").addEventListener("click",function(e){
  var t=e.target.closest(".chip-tab");if(!t)return;
  state.cat=t.dataset.cat;syncControls();render();
});
function syncControls(){
  $("q").value=state.q;bucketSel.value=state.bucket;typeSel.value=state.type;$("fSort").value=state.sort;
  priceChips.querySelectorAll("[data-price]").forEach(function(x){x.classList.toggle("on",(x.dataset.price||"")===state.price)});
  $("catChips").querySelectorAll(".chip-tab").forEach(function(x){x.classList.toggle("on",x.dataset.cat===state.cat)});
  $("viewBrands").classList.toggle("on",state.view==="brands");
  $("viewModels").classList.toggle("on",state.view==="models");
}
var qTimer=null;
$("q").addEventListener("input",function(e){clearTimeout(qTimer);var v=e.target.value;qTimer=setTimeout(function(){state.q=v;render()},120)});
bucketSel.addEventListener("change",function(e){state.bucket=e.target.value;render()});
typeSel.addEventListener("change",function(e){state.type=e.target.value;render()});
$("fSort").addEventListener("change",function(e){state.sort=e.target.value;render()});
$("viewBrands").addEventListener("click",function(){state.view="brands";syncControls();render()});
$("viewModels").addEventListener("click",function(){state.view="models";syncControls();render()});
$("fToggle").addEventListener("click",function(){document.querySelector(".explorer-bar").classList.toggle("f-open");syncFilterToggle()});
$("resetBtn").addEventListener("click",function(){
  state.q="";state.cat="All";state.bucket="";state.type="";state.price="";state.officialOnly=false;state.sort="default";
  syncControls();render();toast("All filters reset");
});

/* SECTION: scope switch —— 全球（含中国出口品牌）/ 仅中国以外两个口径，纯 query 参数切换，刷新后所有统计跟随 */
(function(){
  var btn=$("scopeBtn");if(!btn)return;
  btn.textContent=SCOPE_OUTSIDE?"Scope: outside China only · switch to worldwide":"Scope: worldwide incl. Chinese export brands · switch to outside China";
  btn.addEventListener("click",function(){
    var p=new URLSearchParams(location.search);
    if(SCOPE_OUTSIDE)p.delete("scope");else p.set("scope","exchina");
    location.search=p.toString();
  });
})();

/* SECTION: rank & matrix —— 类别 TOP3 / 价格带 TOP5 / 类别×价格 矩阵，全部按统计口径（424 款）聚合 */
var OFFICIAL_BRANDS=D.brands.filter(function(b){return b.marketStatus!=="parallel"});
var TYPES_ORDER=Object.keys(s.byType||{}).sort(function(a,b){return (s.byType[b]||0)-(s.byType[a]||0)});
var BANDS=PRICE_RANGES.filter(function(r){return r.k!=="none"});
function rankOf(pred,n){
  var out=[];
  OFFICIAL_BRANDS.forEach(function(b){
    var c=b.models.filter(pred).length;
    if(c)out.push({id:b.id,name:b.name,n:c});
  });
  out.sort(function(x,y){return y.n-x.n||x.name.localeCompare(y.name,"zh")});
  return out.slice(0,n);
}
function fmtWan(v){return (v/10000).toFixed(2)+" 0k"}
function rkButtons(list,kind,key){
  if(!list.length)return '<span style="font-size:11px;color:var(--faint)">—</span>';
  return list.map(function(x,i){
    /* 悬浮信息层：这个品牌在该类别/价格档里到底有哪几款、什么价 */
    var b=brandById[x.id],models=b?b.models.filter(function(m){
      return kind==="type"?m.type===key:inPrice(m,RANGE_BY_KEY[key]);
    }):[];
    var prices=models.map(function(m){return m.priceMin}).filter(function(n){return n!=null});
    var lo=prices.length?Math.min.apply(null,prices):null;
    var hi=prices.length?Math.max.apply(null,prices):null;
    var priceTxt=prices.length?(lo===hi?fmtWan(lo):fmtWan(lo)+"–"+fmtWan(hi)):"Price not published";
    var names=models.slice(0,3).map(function(m){return m.name+(m.cc?" "+m.cc+"cc":"")}).join("、");
    var tip='<div class=\'th\'>'+esc(x.name)+' · '+esc(key)+'</div>'+
'<div class=\'tb\'><b>'+x.n+'</b> models · from '+esc(priceTxt)+'</div>'+
(models.length>3?'<div class=\'tb\'>'+esc(names)+' and more</div>':'<div class=\'tb\'>'+esc(names)+'</div>')+
      '<div class=\'tb\' style=\'color:var(--faint)\'>Click to filter</div>';
    return '<button class="rk p'+(i+1)+'" data-kind="'+kind+'" data-key="'+esc(key)+'" type="button" data-tip="'+esc(tip)+'">'+
      '<span class="no">'+(i+1)+'</span><span class="rk-name">'+esc(x.name)+'</span><span class="cnt">'+x.n+'</span></button>';
  }).join("");
}
(function buildRank(){
  var tEl=$("rankType"),pEl=$("rankPrice");
  if(tEl)tEl.innerHTML=TYPES_ORDER.map(function(t){
    return '<div class="rk-row"><div class="rk-key">'+esc(t)+'</div><div class="rk-list">'+
      rkButtons(rankOf(function(m){return m.type===t},3),"type",t)+'</div></div>';
  }).join("");
  if(pEl)pEl.innerHTML=BANDS.map(function(r){
    return '<div class="rk-row"><div class="rk-key">'+esc(r.label)+'</div><div class="rk-list">'+
      rkButtons(rankOf(function(m){return inPrice(m,r)},5),"price",r.k)+'</div></div>';
  }).join("");
})();
/* 类别图块导航：11 个车身类别铺成网格，点一下直接筛到型号浏览器 */
/* 类别图块导航：11 个车身类别铺成网格，点一下直接筛到型号浏览器 */
(function buildTypeNav(){
  var el=$("typeNav");if(!el)return;
  el.innerHTML=TYPES_ORDER.map(function(t){
    var c=(s.byType||{})[t]||0;
    return '<button class="tn" data-tn="'+esc(t)+'" type="button" style="--tc:'+(TYPE_COLOR[t]||"#8892A4")+'" data-tip="<div class=\'th\'>'+esc(t)+'</div><div class=\'tb\'><b>'+c+'</b> models on sale</div>">'+
      '<span class="ic">'+esc(t.slice(0,1))+'</span><span class="tx"><span class="tt">'+esc(t)+'</span><span class="tc">'+c+' models</span></span></button>';
  }).join("");
  el.addEventListener("click",function(e){
    var b=e.target.closest("[data-tn]");if(!b)return;
    var t=b.dataset.tn;
    if(state.type===t){state.type=""}else{state.type=t}
    state.officialOnly=true;syncControls();render();
    el.querySelectorAll(".tn").forEach(function(x){x.classList.toggle("on",x.dataset.tn===state.type)});
    $("explorer").scrollIntoView({behavior:"smooth"});
    toast(state.type?"Filtered by "+t:"Body-type filter cleared");
  });
})();

document.addEventListener("click",function(e){
  var b=e.target.closest(".rk");if(!b)return;
  if(b.dataset.kind==="type")state.type=b.dataset.key;
  else if(b.dataset.kind==="price")state.price=b.dataset.key;
  state.officialOnly=true;syncControls();render();
  $("explorer").scrollIntoView({behavior:"smooth"});
  toast("Filtered by "+(b.dataset.kind==="type"?b.dataset.key:((RANGE_BY_KEY[b.dataset.key]||{}).label||"")));
});
/* 通用交叉透视：任意两维组合，行列合计 + 点格子筛选，数据全部按统计口径（424 款）聚合 */
(function buildPivot(){
  var el=$("matrix"),tabs=$("mxTabs");if(!el)return;
  var BUCKET_ORDER=Object.keys(s.byBucket||{}).sort(function(a,b){return a.localeCompare(b,"en",{numeric:true})});
  function priceKeyOf(m){
    for(var i=0;i<PRICE_RANGES.length;i++)if(inPrice(m,PRICE_RANGES[i]))return PRICE_RANGES[i].k;
    return PRICE_RANGES[PRICE_RANGES.length-1].k;
  }
  var DIMS={
    type:{label:"Body type",values:TYPES_ORDER,
      get:function(m){return m.type},
      set:function(v){state.type=v;state.officialOnly=true},
      desc:function(v){return v}},
    price:{label:"Price band",values:PRICE_RANGES.map(function(r){return r.k}),
      get:priceKeyOf,
      set:function(v){state.price=v;state.officialOnly=true},
      desc:function(v){return (RANGE_BY_KEY[v]||{}).label||v}},
    bucket:{label:"Displacement",values:BUCKET_ORDER,
      get:function(m){return m.bucket},
      set:function(v){state.bucket=v},
      desc:function(v){return v}}
  };
  var PAIRS={"type-bucket":["type","bucket"]};
  var cur="type-bucket";

  function draw(key){
    var pair=PAIRS[key]||PAIRS["type-bucket"],R= DIMS[pair[0]],C=DIMS[pair[1]];
    var data={},brands={},colSum={},rowSum={},maxC=1;
    R.values.forEach(function(rv){data[rv]={};brands[rv]={};rowSum[rv]=0});
    C.values.forEach(function(cv){colSum[cv]=0});
    OFFICIAL_BRANDS.forEach(function(b){
      b.models.forEach(function(m){
        var rv=R.get(m),cv=C.get(m);
        if(!rv||!cv||!data[rv]||colSum[cv]===undefined)return;
        data[rv][cv]=(data[rv][cv]||0)+1;
        rowSum[rv]++;colSum[cv]++;
        if(!brands[rv][cv])brands[rv][cv]=[];
        brands[rv][cv].push(b.name);
        if(data[rv][cv]>maxC)maxC=data[rv][cv];
      });
    });
    /* 同品牌在一个格子里可能有多款车，去重后算品牌数、按款数排前 3 */
    function topsOf(list){
      if(!list)return [];
      var cnt={};list.forEach(function(n){cnt[n]=(cnt[n]||0)+1});
      return Object.keys(cnt).map(function(n){return {name:n,n:cnt[n]}})
        .sort(function(x,y){return y.n-x.n||x.name.localeCompare(y.name,"zh")});
    }
    var grand=R.values.reduce(function(a,v){return a+rowSum[v]},0);
    var head='<tr><th class="rowh">'+esc(R.label)+'＼'+esc(C.label)+'</th>'+
      C.values.map(function(cv){return '<th>'+esc(C.desc(cv))+'</th>'}).join("")+'<th class="rt">Total</th></tr>';
    var body=R.values.map(function(rv){
      var tot=rowSum[rv];
var rowTip='<div class=\'th\'>'+esc(R.desc(rv))+' · all '+esc(C.label)+'</div><div class=\'tb\'><b>'+tot+'</b> models · '+(tot/s.modelCount*100).toFixed(1)+'% of catalogue</div><div class=\'tb\' style=\'color:var(--faint)\'>Click to see only '+esc(R.label)+'</div>';
      var cells=C.values.map(function(cv){
        var c=data[rv][cv]||0;
        if(!c)return '<td class="z">·</td>';
        var a=(0.10+0.36*(c/maxC)).toFixed(2);
        var tops=topsOf(brands[rv][cv]);
        var tip='<div class=\'th\'>'+esc(R.desc(rv))+' · '+esc(C.desc(cv))+'</div>'+
'<div class=\'tb\'><b>'+c+'</b> models · '+tops.length+' brands</div>'+
          tops.slice(0,3).map(function(x){return '<div class=\'trow\'><span>'+esc(x.name)+'</span><span>'+x.n+' models</span></div>'}).join("")+
          (R.values.length*C.values.length?'<div class=\'tb\' style=\'color:var(--faint);margin-top:4px\'>Click to apply this combination</div>':'');
        return '<td data-r="'+esc(rv)+'" data-c="'+esc(cv)+'" style="background:rgba(255,74,31,'+a+')" data-tip="'+esc(tip)+'">'+c+'</td>';
      }).join("");
      return '<tr><th class="rowh">'+esc(R.desc(rv))+'</th>'+cells+'<th class="rt" data-rt="'+esc(rv)+'" data-tip="'+esc(rowTip)+'">'+tot+'</th></tr>';
    }).join("");
    var foot='<tr class="tot"><th class="rowh">Total</th>'+
      C.values.map(function(cv){
        var c=colSum[cv];
var tip='<div class=\'th\'>'+esc(C.desc(cv))+'</div><div class=\'tb\'><b>'+c+'</b> models'+(c?' · '+(c/s.modelCount*100).toFixed(1)+'% of catalogue':'')+'</div><div class=\'tb\' style=\'color:var(--faint)\'>Click to see only '+esc(C.label)+'</div>';
        return '<td class="tot" data-ct="'+esc(cv)+'" data-tip="'+esc(tip)+'">'+(c||"·")+'</td>';
      }).join("")+
'<th class="tot" data-all="1" data-tip="'+esc('<div class=\'th\'>Catalogue total</div><div class=\'tb\'><b>'+grand+'</b> models · '+R.values.length+' '+R.label+' × '+C.values.length+' '+C.label+'</div><div class=\'tb\' style=\'color:var(--faint)\'>Click to clear filters</div>')+'">'+grand+'</th></tr>';
    el.innerHTML='<div class="mx-wrap"><table class="mx">'+head+body+foot+'</table></div>'+
'<div class="mx-legend">Across '+s.modelCount+' models on sale, excluding '+s.parallelModelCount+' parallel imports; row total = models in that '+R.label+', last row = models in each '+C.label+', bottom right = full catalogue '+s.modelCount+'. Hover to see which brands fill the cell; click a cell → '+R.label+' + '+C.label+', a row total → only '+R.label+', a column total → only '+C.label+'.</div>';
  }

  if(tabs){
    tabs.addEventListener("click",function(e){
      var b=e.target.closest("[data-mx]");if(!b)return;
      cur=b.dataset.mx;
      tabs.querySelectorAll("[data-mx]").forEach(function(x){x.classList.toggle("on",x.dataset.mx===cur)});
      draw(cur);
    });
  }
  el.addEventListener("click",function(e){
    var all=e.target.closest("[data-all]");
    if(all){
      state.type="";state.price="";state.bucket="";state.officialOnly=true;
      syncControls();render();$("explorer").scrollIntoView({behavior:"smooth"});
      toast("Body type, price and displacement cleared");return;
    }
    var cell=e.target.closest("td[data-r]");
    if(cell){
      var pair=PAIRS[cur],R=DIMS[pair[0]],C=DIMS[pair[1]];
      R.set(cell.dataset.r);C.set(cell.dataset.c);
      syncControls();render();$("explorer").scrollIntoView({behavior:"smooth"});
      toast("Filtered by "+R.desc(cell.dataset.r)+" · "+C.desc(cell.dataset.c));return;
    }
    var rt=e.target.closest("th.rt[data-rt]");
    if(rt){
      var pair2=PAIRS[cur],R2=DIMS[pair2[0]];
      R2.set(rt.dataset.rt);
      syncControls();render();$("explorer").scrollIntoView({behavior:"smooth"});
      toast("Filtered by "+R2.desc(rt.dataset.rt)+" filter (all "+DIMS[PAIRS[cur][1]].label+")");return;
    }
    var ct=e.target.closest("td.tot[data-ct]");
    if(ct){
      var pair3=PAIRS[cur],C3=DIMS[pair3[1]];
      C3.set(ct.dataset.ct);
      syncControls();render();$("explorer").scrollIntoView({behavior:"smooth"});
      toast("Filtered by "+C3.desc(ct.dataset.ct)+" filter (all "+DIMS[PAIRS[cur][0]].label+")");
    }
  });
  draw("type-price");
})();

/* SECTION: scatter —— 品牌定位图：横轴最便宜车型起售价、纵轴最大排量、气泡大小=型号数
   价格横跨 1–17 万、排量 250–2458cc，线性轴会挤成两坨，所以两轴都走对数刻度 */
(function buildScatter(){
  var el=$("scatter");if(!el)return;
  var CAT_C={"Japanese":"#FF4A1F","European":"#4D9FFF","American":"#B78CFF","Asian other":"#2FD6A3"};
  var pts=[];
  OFFICIAL_BRANDS.forEach(function(b){
    var ps=[],ccs=[];
    b.models.forEach(function(m){
      if(m.priceMin!=null)ps.push(m.priceMin);
      if(m.cc!=null)ccs.push(m.cc);
    });
    if(!ps.length||!ccs.length)return;
    var lo=Math.min.apply(null,ps),hi=Math.max.apply(null,ps);
    pts.push({b:b,lp:lo/10000,hp:hi/10000,cc:Math.max.apply(null,ccs),
      ccLo:Math.min.apply(null,ccs),n:b.models.length});
  });
  if(!pts.length){el.innerHTML='<div class="cs">No brand can be positioned</div>';return}
  var W=780,H=400,padL=48,padR=18,padT=14,padB=40;
  var XMIN=0.6,XMAX=20,YMIN=250,YMAX=2600;
  var iw=W-padL-padR,ih=H-padT-padB;
  var LX=function(v){return Math.log(Math.max(v,XMIN)/XMIN)/Math.log(XMAX/XMIN)};
  var LY=function(v){return Math.log(Math.max(v,YMIN)/YMIN)/Math.log(YMAX/YMIN)};
  var X=function(v){return padL+LX(v)*iw};
  var Y=function(v){return padT+ih-LY(v)*ih};
  var g=[];
  [1,2,3,5,10,20].forEach(function(t){
    g.push('<line class="gx" x1="'+X(t)+'" x2="'+X(t)+'" y1="'+padT+'" y2="'+(padT+ih)+'"/>'+
'<text class="lbl" x="'+X(t)+'" y="'+(H-22)+'" text-anchor="middle">'+t+' ×10k</text>');
  });
  [250,500,1000,2000].forEach(function(t){
    g.push('<line class="gx" x1="'+padL+'" x2="'+(W-padR)+'" y1="'+Y(t)+'" y2="'+Y(t)+'"/>'+
      '<text class="lbl" x="'+(padL-9)+'" y="'+(Y(t)+3)+'" text-anchor="end">'+t+'</text>');
  });
  /* 标签避让：气泡本身也算障碍物，按型号数从多到少逐个找不压其它气泡/文字的落点 */
  var boxes=[];
  pts.forEach(function(p){
    var r=4+Math.sqrt(p.n)*2.5;
    boxes.push({id:p.b.id,x:X(p.lp)-r,y:Y(p.cc)-r,w:r*2,h:r*2});
  });
  function fits(b){
    for(var i=0;i<boxes.length;i++){
      var o=boxes[i];
      if(b.x<o.x+o.w&&b.x+b.w>o.x&&b.y<o.y+o.h&&b.y+b.h>o.y)return false;
    }
    return true;
  }
  var labelFor={};
  pts.slice().sort(function(a,b){return b.n-a.n}).forEach(function(p){
    if(p.n<12)return;
    var r=4+Math.sqrt(p.n)*2.5,cx=X(p.lp),cy=Y(p.cc);
    var w=p.b.name.length*9.4,h=11;
    var cands=[
      [cx+r+4,cy-r+3,"start"],[cx-r-4,cy-r+3,"end"],
      [cx+r+4,cy+r+9,"start"],[cx-r-4,cy+r+9,"end"],
      [cx,cy-r-7,"middle"],[cx,cy+r+16,"middle"],
      [cx+r+4,cy+3,"start"],[cx-r-4,cy+3,"end"]
    ];
    for(var i=0;i<cands.length;i++){
      var tx=cands[i][0],ty=cands[i][1],anc=cands[i][2];
      var bx=anc==="end"?tx-w:(anc==="middle"?tx-w/2:tx);
      var cand={id:p.b.id,x:bx,y:ty-h+2,w:w,h:h};
      if(fits(cand)){
        boxes.push(cand);
        labelFor[p.b.id]={x:tx.toFixed(1),y:ty.toFixed(1),anchor:anc};
        break;
      }
    }
  });
  var dots=pts.map(function(p){
    var r=4+Math.sqrt(p.n)*2.5;
    var cx=X(p.lp),cy=Y(p.cc);
    var clip=p.cc>YMAX?'(at the top edge)':'';
    var tip='<div class=\'th\'>'+esc(p.b.name)+' · '+esc(p.b.subCategory||p.b.category)+'</div>'+
'<div class=\'tb\'><b>'+p.n+'</b> models on sale · displacement '+p.ccLo+'–'+p.cc+'cc'+clip+'</div>'+
'<div class=\'trow\'><span>Entry price range</span><span>'+(p.lp*10).toFixed(0)+'k–'+(p.hp*10).toFixed(0)+'k CNY</span></div>'+
      '<div class=\'tb\' style=\'color:var(--faint)\'>Click for details</div>';
    var c=CAT_C[p.b.category]||"#8892A4";
    return '<g class="dot" data-bd="'+esc(p.b.id)+'" data-tip="'+esc(tip)+'">'+
      '<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="'+r.toFixed(1)+'" fill="'+c+'" fill-opacity=".7" stroke="'+c+'" stroke-opacity=".95" stroke-width="1"/>'+
      (labelFor[p.b.id]?'<text class="nm" x="'+labelFor[p.b.id].x+'" y="'+labelFor[p.b.id].y+'" text-anchor="'+labelFor[p.b.id].anchor+'">'+esc(p.b.name)+'</text>':'')+
      '</g>';
  }).join("");
  el.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Brand positioning chart">'+g.join("")+
    dots+'<line class="ax" x1="'+padL+'" x2="'+(W-padR)+'" y1="'+(padT+ih)+'" y2="'+(padT+ih)+'"/>'+
    '<line class="ax" x1="'+padL+'" x2="'+padL+'" y1="'+padT+'" y2="'+(padT+ih)+'"/></svg>'+
'<div class="trend-note"><span style="color:var(--faint)">Both axes are logarithmic (price 0.6–20 ×10k CNY, displacement 250–2600cc); otherwise brands in the 1–3 ×10k / 250–800cc corner would pile up. X is the entry price of the brand\'s cheapest model, Y its largest displacement, bubble size = models on sale. '+pts.length+' brands positioned (the other '+(OFFICIAL_BRANDS.length-pts.length)+' have no published entry price and are omitted).</span></div>';
  el.addEventListener("click",function(e){
    var g2=e.target.closest("[data-bd]");if(!g2)return;
    openDrawer(g2.dataset.bd);
  });
})();

/* SECTION: budget —— 预算横评 */
(function budget(){
  var minEl=$("bdMin"),maxEl=$("bdMax"),listEl=$("bdList"),sumEl=$("bdSummary");
  if(!minEl||!listEl)return;
  var PRESETS=[{lo:0,hi:1,label:"Under ¥10k"},{lo:2,hi:3,label:"¥20k–30k"},{lo:3,hi:5,label:"¥30k–50k"},{lo:5,hi:8,label:"¥50k–80k"},{lo:8,hi:0,label:"¥80k+"}];
  $("bdPresets").innerHTML=PRESETS.map(function(p){
    return '<button class="chip-tab" type="button" data-lo="'+p.lo+'" data-hi="'+p.hi+'">'+esc(p.label)+'</button>';
  }).join("");
  function rows(){
    var lo=parseFloat(minEl.value);if(isNaN(lo))lo=0;
    var hi=parseFloat(maxEl.value);if(isNaN(hi)||(!hi&&lo))hi=lo;
    if(hi&&hi<lo){var t=lo;lo=hi;hi=t}
    var out=[];
    D.brands.forEach(function(b){
      b.models.forEach(function(m,i){
        if(m.priceMin==null)return;
        var pm=m.priceMin/10000;
        if(pm<lo)return;
        if(hi&&pm>hi)return;
        out.push({b:b,m:m,mi:i,pm:pm});
      });
    });
    out.sort(function(a,b){return (b.m.cc||0)-(a.m.cc||0)||a.pm-b.pm});
    return {lo:lo,hi:hi,items:out};
  }
  var expanded=false;
  function draw(){
    var r=rows();
    var rangeTxt=(r.hi?r.lo+"–"+r.hi:"≥"+r.lo)+" 0k CNY";
    if(!r.items.length){
      sumEl.innerHTML='Budget'+esc(rangeTxt)+' has no models — try another range.';
listEl.innerHTML='<div class="cs">Example ranges: 1–2 ×10k / 2–3 ×10k / 3–5 ×10k / 5–8 ×10k / 8 ×10k+</div>';
      return;
    }
    var top=r.items[0];
 sumEl.innerHTML='Budget <b>'+esc(rangeTxt)+'</b>: <b>'+r.items.length+'</b> models on sale, '+
 'Largest displacement: <b>'+esc(top.b.name)+' '+esc(top.m.name)+'</b> ('+(top.m.cc||"—")+'cc / '+top.pm.toFixed(2)+' ×10k CNY), '+
      'Average displacement'+Math.round(r.items.reduce(function(a,x){return a+(x.m.cc||0)},0)/r.items.length)+'cc。';
    var LIMIT=expanded?r.items.length:Math.min(24,r.items.length);
    var shown=r.items.slice(0,LIMIT);
listEl.innerHTML='<div class="bd-table"><table><thead><tr><th>#</th><th>Brand · model</th><th>Displacement</th><th>Body type</th><th>List price</th><th>Source</th><th>Compare</th></tr></thead><tbody>'+
      shown.map(function(x,i){
        var k=cmpKey(x.b.id,x.mi);
        return '<tr'+(i===0?' class="best"':'')+'><td>'+(i+1)+'</td>'+
          '<td>'+(x.b.marketStatus==="parallel"?'<span class="tag">Parallel import</span> ':'')+'<b>'+esc(x.b.name)+'</b> '+esc(x.m.name)+'</td>'+
          '<td class="cc">'+(x.m.cc||"—")+'cc</td><td>'+esc(x.m.type||"—")+'</td>'+
          '<td>'+(esc(x.m.price||"—"))+'</td>'+
'<td style="font-size:10.5px"><a href="'+esc(x.m.source||"#")+'" target="_blank" rel="noopener">Source</a></td>'+
          '<td><button class="add'+(cmpHas(k)?" on":"")+'" type="button" data-bd-cmp="'+esc(k)+'">'+(cmpHas(k)?"✓ Added":"+ Compare")+'</button></td></tr>';
      }).join("")+'</tbody></table></div>'+
(r.items.length>LIMIT?'<button class="bd-more" type="button" id="bdMore">Show '+(r.items.length-LIMIT)+' more</button>':(expanded&&r.items.length>24?'<button class="bd-more" type="button" id="bdMore">Collapse</button>':''));
  }
  minEl.addEventListener("input",draw);
  maxEl.addEventListener("input",draw);
  $("bdPresets").addEventListener("click",function(e){
    var b=e.target.closest("[data-lo]");if(!b)return;
    minEl.value=b.dataset.lo;maxEl.value=b.dataset.hi;draw();
  });
  listEl.addEventListener("click",function(e){
    var more=e.target.closest("#bdMore");
    if(more){expanded=!expanded;draw();if(!expanded)$("budget").scrollIntoView({behavior:"smooth"});return}
    var b=e.target.closest("[data-bd-cmp]");if(!b)return;
    toggleCmp(b.dataset.bdCmp);
    draw();
  });
  $("bdCmp").addEventListener("click",function(){
    var r=rows();
    if(!r.items.length){toast("No models in this range");return}
    var added=0;
    r.items.slice(0,3).forEach(function(x){
      var k=cmpKey(x.b.id,x.mi);
      if(!cmpHas(k)&&state.cmp.length<3){state.cmp.push({b:x.b.id,m:x.mi});added++}
    });
    syncCmpBoxes();renderCmpBar();draw();
    if(added)toast("Added the largest-displacement"+added+" models in this band");
  });
  draw();
})();

/* SECTION: matching —— 空格分隔多关键词 AND：命中品牌词的用于选品牌，剩余的继续过滤型号 */
function tokenize(q){return String(q||"").trim().toLowerCase().split(/\s+/).filter(Boolean)}
function matchBrand(b,t){return [b.name,b.nameEn,b.company,b.group,b.subCategory||""].join(" ").toLowerCase().indexOf(t)>=0}
function matchModel(m,t){return (m.name+" "+(m.type||"")).toLowerCase().indexOf(t)>=0}
function brandPass(b){
  if(state.cat==="Saved")return isFav(b.id);
  if(state.cat!=="All"&&b.category!==state.cat)return false;
  return true;
}
function modelsOf(b,rest){
  return b.models.filter(function(m){
    if(state.bucket&&m.bucket!==state.bucket)return false;
    if(state.type&&m.type!==state.type)return false;
    if(state.price&&!inPrice(m,RANGE_BY_KEY[state.price]))return false;
    for(var i=0;i<rest.length;i++){if(!matchModel(m,rest[i]))return false}
    return true;
  });
}
function hl(text,q){
  var t=String(text==null?"":text);
  if(!q)return esc(t);
  var idx=t.toLowerCase().indexOf(q);
  if(idx<0)return esc(t);
  return esc(t.slice(0,idx))+"<mark>"+esc(t.slice(idx,idx+q.length))+"</mark>"+esc(t.slice(idx+q.length));
}
function hlAll(text,toks){
  var t=String(text==null?"":text);
  if(!toks||!toks.length)return esc(t);
  var low=t.toLowerCase(),hits=[];
  toks.forEach(function(q){
    var from=0,i;
    while((i=low.indexOf(q,from))>=0){hits.push([i,i+q.length]);from=i+q.length}
  });
  if(!hits.length)return esc(t);
  hits.sort(function(a,b){return a[0]-b[0]||b[1]-a[1]});
  var merged=[hits[0]];
  for(var k=1;k<hits.length;k++){
    var cur=merged[merged.length-1],z=hits[k];
    if(z[0]<=cur[1])cur[1]=Math.max(cur[1],z[1]);else merged.push(z);
  }
  var out="",pos=0;
  merged.forEach(function(m){out+=esc(t.slice(pos,m[0]))+"<mark>"+esc(t.slice(m[0],m[1]))+"</mark>";pos=m[1]});
  return out+esc(t.slice(pos));
}
function priceVal(m){return m.priceMin!=null?m.priceMin:null}

/* SECTION: render */
function computeItems(){
  var toks=tokenize(state.q);
  var hasFilter=!!state.bucket||!!state.type||!!state.price;
  var items=[];
  D.brands.forEach(function(b){
    if(state.officialOnly&&b.marketStatus==="parallel")return;
    if(!brandPass(b))return;
    var rest=[];toks.forEach(function(t){if(!matchBrand(b,t))rest.push(t)});
    var models=modelsOf(b,rest);
    /* 有词没被品牌吃下 → 必须落到型号上；词全被品牌吃下 → 只受下拉筛选约束 */
    if(rest.length&&models.length===0)return;
    if(!rest.length&&hasFilter&&models.length===0)return;
    items.push({b:b,models:models});
  });
  return {toks:toks,items:items,shownModels:items.reduce(function(a,x){return a+x.models.length},0)};
}
/* 移动端筛选折叠：默认收起，只留搜索 + 结果行；点开才展开排量/类别/价格并吸顶 */
function syncFilterToggle(){
  var bar=document.querySelector(".explorer-bar"),tg=$("fToggle");
  if(!bar||!tg)return;
  var n=0;
  if(state.bucket)n++;
  if(state.type)n++;
  if(state.price)n++;
  if(state.cat!=="All")n++;
  if(state.officialOnly)n++;
  $("fSum").textContent=n?n+" filters active":"All";
  tg.setAttribute("aria-expanded",bar.classList.contains("f-open")?"true":"false");
}
function render(){
  var r=computeItems(),toks=r.toks,items=r.items,shownModels=r.shownModels;
  var hasFilter=!!state.bucket||!!state.type||!!state.price;
  if(state.view==="brands"){
    if(state.sort==="count")items.sort(function(a,b){return b.models.length-a.models.length});
    else if(state.sort==="name")items.sort(function(a,b){return a.b.name.localeCompare(b.b.name,"zh")});
    else if(state.sort==="price-asc"||state.sort==="price-desc"){
      var dir=state.sort==="price-asc"?1:-1;
      var minP=function(x){var v=x.models.map(priceVal).filter(function(n){return n!=null});return v.length?Math.min.apply(null,v):Infinity};
      items.sort(function(a,b){return dir*(minP(a)-minP(b))});
    }else if(state.sort==="cc-asc"||state.sort==="cc-desc"){
      var dir2=state.sort==="cc-asc"?1:-1;
      var maxC=function(x){var v=x.models.map(function(m){return m.cc}).filter(function(n){return n!=null});return v.length?Math.max.apply(null,v):-1};
      items.sort(function(a,b){return dir2*(maxC(a)-maxC(b))});
    }
    renderBrands(items,toks);
  }else{
    renderModels(items,toks);
  }
  var filtered=!!(toks.length||hasFilter||state.cat!=="All"||state.officialOnly);
  var par=state.officialOnly?0:(s.parallelModelCount||0);
$("resultLine").innerHTML='Showing <b>'+items.length+'</b> brands · <b>'+shownModels+'</b> models'+
(par?' <span style="color:var(--faint)">('+par+' parallel imports excluded from totals)</span>':'')+
(filtered?' <span style="color:var(--faint)">('+s.brandCount+' brands / '+(s.modelCountAll||s.modelCount)+' models in total)</span>':'');
  renderActiveTags(toks);
  writeUrlState();
  syncFilterToggle();
}
/* 当前筛选写回地址栏（replaceState 不新增历史记录，锚点保留） */
function writeUrlState(){
  try{
    var sp=new URLSearchParams();
    if(state.q)sp.set("q",state.q);
    if(state.cat!=="All")sp.set("cat",state.cat);
    if(state.bucket)sp.set("bucket",state.bucket);
    if(state.type)sp.set("type",state.type);
    if(state.price)sp.set("price",state.price);
    if(state.sort!=="default")sp.set("sort",state.sort);
    if(state.view!=="brands")sp.set("view","models");
    if(state.officialOnly)sp.set("official","1");
    var qs=sp.toString();
    var next=location.pathname+(qs?"?"+qs:"")+location.hash;
    if(next!==location.pathname+location.search+location.hash)history.replaceState(null,"",next);
  }catch(e){}
}
/* 当前筛选结果导出 CSV：带上品牌、型号、排量、类别、指导价与来源，Excel 直接可读（带 BOM） */
function exportCsv(){
  var r=computeItems(),rows=[["Brand","English name","Model","Displacement (cc)","Displacement","Body type","List price","From (CNY)","Price band","Channel","Source"]];
  r.items.forEach(function(x){
    var b=x.b;
    x.models.forEach(function(m){
      var band="";PRICE_RANGES.forEach(function(pr){if(inPrice(m,pr))band=pr.label});
      rows.push([b.name,b.nameEn||"",m.name,m.cc!=null?m.cc:"",m.bucket||"",m.type||"",m.price||"",m.priceMin!=null?m.priceMin:"",band,b.marketStatus==="parallel"?"Parallel import":"Official channel",m.source||""]);
    });
  });
  var q=function(v){v=String(v==null?"":v);return '"'+v.replace(/"/g,'""')+'"'};
  var text="\ufeff"+rows.map(function(row){return row.map(q).join(",")}).join("\r\n");
  var parts=[];
  if(state.cat!=="All")parts.push(state.cat);
  if(state.type)parts.push(state.type);
  if(state.price)parts.push((RANGE_BY_KEY[state.price]||{}).label||state.price);
  if(state.bucket)parts.push(state.bucket);
  if(state.q.trim())parts.push("Search"+state.q.trim());
  var name="moto-200cc-global-"+(parts.length?parts.join("-"):"All")+"-"+new Date().toISOString().slice(0,10).replace(/-/g,"")+".csv";
  var blob=new Blob([text],{type:"text/csv;charset=utf-8"});
  var a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=name;
  document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},600);
  toast("Exported"+r.shownModels+" models to CSV");
}
$("csvBtn").addEventListener("click",exportCsv);
function renderActiveTags(toks){
  var tags=[];
  if(toks.length)tags.push({k:"q",label:"Search: "+state.q.trim()});
  if(state.cat!=="All")tags.push({k:"cat",label:state.cat==="Saved"?"★ Saved":state.cat});
  if(state.bucket)tags.push({k:"bucket",label:state.bucket});
  if(state.type)tags.push({k:"type",label:state.type});
  if(state.price)tags.push({k:"price",label:(RANGE_BY_KEY[state.price]||{}).label||state.price});
  if(state.officialOnly)tags.push({k:"officialOnly",label:"Headline scope only (parallel imports excluded)"});
  $("activeTags").innerHTML=tags.map(function(t){return '<span class="a-tag">'+esc(t.label)+'<button data-clear="'+t.k+'" aria-label="Remove filter">✕</button></span>'}).join("");
}
$("activeTags").addEventListener("click",function(e){
  var btn=e.target.closest("[data-clear]");if(!btn)return;
  var k=btn.dataset.clear;
  if(k==="q")state.q="";else if(k==="cat")state.cat="All";else if(k==="bucket")state.bucket="";
  else if(k==="type")state.type="";else if(k==="price")state.price="";
  else if(k==="officialOnly")state.officialOnly=false;
  syncControls();render();
});
/* 空结果时给"What each filter would return if relaxed"，用现有数据实时算，不给假建议 */
function countWith(patch){
  var old={};Object.keys(patch).forEach(function(k){old[k]=state[k];state[k]=patch[k]});
  var r=computeItems();
  Object.keys(patch).forEach(function(k){state[k]=old[k]});
  return {brands:r.items.length,models:r.shownModels};
}
function emptyCard(kind,unit){
  var acts=[];
  if(state.q)acts.push({k:"q",label:"Clear search: "+state.q.trim()});
  if(state.price)acts.push({k:"price",label:"Drop price band: "+((RANGE_BY_KEY[state.price]||{}).label||"")});
  if(state.type)acts.push({k:"type",label:"Drop body type: "+state.type});
  if(state.bucket)acts.push({k:"bucket",label:"Drop displacement: "+state.bucket});
  if(state.officialOnly)acts.push({k:"officialOnly",label:"Include parallel imports"});
  var patches={q:{q:""},price:{price:""},type:{type:""},bucket:{bucket:""},officialOnly:{officialOnly:false}};
  var btns=acts.map(function(a){
    var n=countWith(patches[a.k]);
    if(!n.brands)return "";
 return '<button class="s-btn" data-act="'+a.k+'" type="button">'+esc(a.label)+' → '+n.brands+' brands · '+n.models+' '+unit+'</button>';
  }).join("");
 return '<div class="panel empty"><div class="e-ico">⌕</div><b>No matching '+kind+'</b>'+
    '<div style="font-size:12px;margin-top:8px">Relax any one filter to see results:</div>'+
    '<div class="sug">'+btns+'<button class="s-btn" data-act="reset" type="button">Reset all filters</button></div></div>';
}
document.addEventListener("click",function(e){
  var b=e.target.closest("[data-act]");if(!b)return;
  var k=b.dataset.act;
  if(k==="reset"){state.q="";state.cat="All";state.bucket="";state.type="";state.price="";state.officialOnly=false;state.sort="default"}
  else if(k==="q")state.q="";
  else if(k==="price")state.price="";
  else if(k==="type")state.type="";
  else if(k==="bucket")state.bucket="";
  else if(k==="officialOnly")state.officialOnly=false;
  syncControls();render();
});
function renderBrands(items,toks){
  var body=$("explorerBody");
  if(!items.length){body.innerHTML=emptyCard("Brand","Model");return}
  body.innerHTML='<div class="brand-list">'+items.map(function(x){
    var b=x.b;
    return '<div class="b-card'+(isFav(b.id)?" faved":"")+'" tabindex="0" role="button" data-id="'+esc(b.id)+'" style="--cat-c:'+CAT_COLOR[b.category]+'">'+
      '<button class="b-fav" aria-label="Save brand">'+(isFav(b.id)?"★":"☆")+'</button>'+
      '<div class="b-logo"></div><div class="b-info"><div class="b-name"><strong>'+hlAll(b.name,toks)+'</strong><span class="en">'+esc(b.nameEn)+'</span></div>'+
      '<div class="b-company">'+esc(b.company||"—")+'</div><div class="b-tags"><span class="tag cat">'+esc(b.subCategory||b.category)+'</span>'+
      (b.marketStatus==="parallel"?'<span class="tag">Parallel import · excluded from totals</span>':'')+
      (b.models.length?'':'<span class="tag">No 200cc+ on sale</span>')+
(b.uncertain.length?'<span class="tag">'+b.uncertain.length+' doubtful entries excluded</span>':'')+
'</div></div><div class="b-count"><b class="num">'+x.models.length+'</b><span>/ '+b.modelCount+' models</span></div></div>';
  }).join("")+'</div>';
  body.querySelectorAll(".b-card").forEach(function(card){
    var b=brandById[card.dataset.id];
    fillLogo(card.querySelector(".b-logo"),b,"g-fb");
    card.querySelector(".b-fav").addEventListener("click",function(e){e.stopPropagation();toggleFav(b.id)});
    card.addEventListener("click",function(){openDrawer(b.id)});
    card.addEventListener("keydown",function(e){if(e.key==="Enter")openDrawer(b.id)});
  });
}
function renderModels(items,toks){
  var body=$("explorerBody");
  var rows=[];
  items.forEach(function(x){x.models.forEach(function(m){rows.push({b:x.b,m:m,mi:x.b.models.indexOf(m)})})});
  if(state.sort==="price-asc")rows.sort(function(a,b){var x=priceVal(a.m),y=priceVal(b.m);return (x==null?Infinity:x)-(y==null?Infinity:y)});
  else if(state.sort==="price-desc")rows.sort(function(a,b){var x=priceVal(a.m),y=priceVal(b.m);return (y==null?-1:y)-(x==null?-1:x)});
  else if(state.sort==="cc-asc")rows.sort(function(a,b){return (a.m.cc||0)-(b.m.cc||0)});
  else if(state.sort==="cc-desc")rows.sort(function(a,b){return (b.m.cc||0)-(a.m.cc||0)});
  else if(state.sort==="name")rows.sort(function(a,b){return a.m.name.localeCompare(b.m.name,"zh")});
  else if(state.sort==="count"){
    var cnt={};items.forEach(function(x){cnt[x.b.id]=x.models.length});
    rows.sort(function(a,b){return cnt[b.b.id]-cnt[a.b.id]});
  }
  if(!rows.length){body.innerHTML=emptyCard("Model","Model");return}
body.innerHTML='<div class="table-scroll"><table class="models"><thead><tr><th class="c-cmp" aria-label="Add to compare"></th><th class="c-brand">Brand</th><th>Model</th><th>Displacement</th><th>Body type</th><th>Official list price</th><th>Source</th></tr></thead><tbody>'+
    rows.map(function(r){
      var m=r.m,b=r.b,k=b.id+"/"+r.mi;
      return '<tr><td class="c-cmp"><button class="cmp-box'+(cmpHas(k)?" on":"")+'" data-cmp="'+esc(k)+'" type="button" aria-pressed="'+(cmpHas(k)?"true":"false")+'" title="Add to compare">'+(cmpHas(k)?"✓":"+")+'</button></td>'+
        '<td class="c-brand"><span class="t-brand" data-id="'+esc(b.id)+'"><span class="dot" style="background:'+CAT_COLOR[b.category]+'"></span>'+esc(b.name)+'</span></td>'+
        '<td class="t-name act" role="button" tabindex="0" data-bid="'+esc(b.id)+'" data-mi="'+r.mi+'">'+hlAll(m.name,toks)+'</td>'+
        '<td class="t-cc num">'+(m.cc!=null?m.cc+'<small> cc</small>':'—')+'</td>'+
        '<td>'+esc(m.type)+'</td>'+
        '<td class="t-price num'+(m.price?'':' na')+'">'+(m.price?esc(m.price):'—')+'</td>'+
        '<td>'+(m.source?'<a class="t-src" href="'+esc(m.source)+'" target="_blank" rel="noopener" title="View source">↗</a>':'<span style="color:var(--faint)">·</span>')+'</td></tr>';
    }).join("")+'</tbody></table></div>';
  body.querySelectorAll(".t-brand").forEach(function(el){el.addEventListener("click",function(){openDrawer(el.dataset.id)})});
  body.querySelectorAll(".t-name[data-bid]").forEach(function(el){
    el.addEventListener("click",function(){openModelSpec(el.dataset.bid,+el.dataset.mi)});
    el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openModelSpec(el.dataset.bid,+el.dataset.mi)}});
  });
}

/* SECTION: compare —— 型号对比：勾 2–3 款并排看参数，最优值标绿 */
function cmpKey(bid,mi){return bid+"/"+mi}
function cmpHas(k){
  for(var i=0;i<state.cmp.length;i++)if(cmpKey(state.cmp[i].b,state.cmp[i].m)===k)return true;
  return false;
}
function cmpItems(){
  return state.cmp.map(function(c){
    var b=brandById[c.b];
    return {b:b,m:(b&&b.models[c.m])||null,mi:c.m};
  }).filter(function(x){return x.b&&x.m});
}
function renderCmpBar(){
  var items=cmpItems(),bar=$("cmpBar");
  $("cmpList").innerHTML=items.map(function(x){
    return '<span class="cmp-chip"><span>'+esc(x.b.name)+' '+esc(x.m.name)+'</span>'+
      '<button data-cmpx="'+esc(cmpKey(x.b.id,x.mi))+'" type="button" aria-label="Remove">✕</button></span>';
  }).join("");
  document.body.classList.toggle("cmp-on",items.length>0);
  $("cmpGo").disabled=items.length<2;
  $("cmpGo").textContent=items.length<2?"Select"+(2-items.length)+" models":"Start comparison ("+items.length+")";
  bar.classList.toggle("show",items.length>0);
}
function syncCmpBoxes(){
  document.querySelectorAll("[data-cmp]").forEach(function(el){
    var on=cmpHas(el.dataset.cmp);
    el.classList.toggle("on",on);el.textContent=on?"✓":"+";el.setAttribute("aria-pressed",on?"true":"false");
  });
}
function toggleCmp(k){
  var items=state.cmp;
  var hit=-1,i;
  for(i=0;i<items.length;i++)if(cmpKey(items[i].b,items[i].m)===k){hit=i;break}
  if(hit>=0){items.splice(hit,1)}
  else{
    if(items.length>=3){toast("Compare up to 3 models");return}
    items.push({b:k.split("/")[0],m:+k.split("/")[1]});
  }
  syncCmpBoxes();renderCmpBar();
  if(items.length===1)toast("Added — pick one more to compare side by side");
}
document.addEventListener("click",function(e){
  var box=e.target.closest("[data-cmp]");
  if(box){toggleCmp(box.dataset.cmp);return}
  var rm=e.target.closest("[data-cmpx]");
  if(rm){
    e.preventDefault();
    var k=rm.dataset.cmpx,arr=state.cmp,i;
    for(i=0;i<arr.length;i++)if(cmpKey(arr[i].b,arr[i].m)===k)break;
    if(i<arr.length)arr.splice(i,1);
    syncCmpBoxes();renderCmpBar();
    if($("cmpModal").classList.contains("show")){
      if(arr.length>=2)openCompare();else closeCompare();
    }
  }
});
$("cmpClear").addEventListener("click",function(){
  state.cmp=[];syncCmpBoxes();renderCmpBar();
});
/* 价格档位：与筛选用的六档同一套边界，避免「筛选说 1–2 万、对比说 2–3 万」 */
function bandOf(m){
  var v=priceVal(m);if(v==null)return "Price not published";
  for(var i=0;i<PRICE_RANGES.length;i++){
    var r=PRICE_RANGES[i];if(r.k==="none")continue;
    if(v>=r.lo&&(r.hi===Infinity||v<r.hi))return r.label;
  }
  return "Price not published";
}
/* SECTION: specs —— 机型技术参数：四组明细 + 最优值高亮 + 缺项显示「—」 */
var SPEC_GROUPS=[
  {g:"Engine / drivetrain",rows:[
    {k:"kw",l:"Max power",u:"kW",best:"max",sub:"kwRpm",subPre:"@"},
    {k:"nm",l:"Max torque",u:"N·m",best:"max",sub:"nmRpm",subPre:"@"},
    {k:"pw",l:"Power-to-weight",u:"kW/100kg",best:"max",digits:2,calc:function(s){return (s.kw&&s.weight)?(s.kw/s.weight*100):null}},
    {k:"cyl",l:"Cylinders"},{k:"cmp",l:"Compression ratio"},{k:"cool",l:"Cooling"},
    {k:"gear",l:"Transmission"},{k:"clutch",l:"Clutch"},{k:"drive",l:"Final drive"}
  ]},
  {g:"Dimensions / weight",rows:[
    {k:"lwh",l:"L × W × H",u:"mm"},
    {k:"seat",l:"Seat height",u:"mm"},
    {k:"wb",l:"Wheelbase",u:"mm"},
    {k:"tank",l:"Fuel tank",u:"L",best:"max"},
    {k:"weight",l:"Kerb weight",u:"kg",best:"min"},
    {k:"clearance",l:"Ground clearance",u:"mm"},
    {k:"frame",l:"Frame"}
  ]},
  {g:"Chassis / brakes",rows:[
    {k:"suspF",l:"Front suspension"},{k:"suspR",l:"Rear suspension"},
    {k:"brkF",l:"Front brake"},{k:"brkR",l:"Rear brake"},
    {k:"tireF",l:"Front tyre"},{k:"tireR",l:"Rear tyre"}
  ]},
  {g:"Electronics / features",rows:[
    {k:"abs",l:"ABS"},{k:"tcs",l:"Traction control"},{k:"qs",l:"Quickshifter"},
    {k:"cruise",l:"Cruise control"},{k:"tpms",l:"Tyre-pressure monitoring"},
    {k:"keyless",l:"Keyless start"},{k:"dash",l:"Instrument"}
  ]}
];
function specOf(bname,mname){
  var S=window.MOTO_SPECS;
  if(!S||!S.models)return null;
  return S.models[bname+"|"+mname]||null;
}
function specVal(s,row){
  if(!s)return null;
  if(row.calc){var v=row.calc(s);return (v==null||isNaN(v))?null:v}
  var v=s[row.k];
  if(v===undefined||v===null||v==="—"||v==="-")return null;
  return v;
}
function specCell(s,row,bestVal,tieCount){
  var v=specVal(s,row);
  if(v==null)return '<td class="spec na">—</td>';
  var isBest=bestVal!=null&&row.best&&v===bestVal&&tieCount===1;
  var txt=typeof v==="number"
    ? (row.digits!=null?v.toFixed(row.digits):v)+(row.u?' '+row.u:'')
    : esc(String(v))+(row.u?' '+row.u:'');
  var sub="";
  if(row.sub&&s[row.sub]!=null)sub='<span class="spec-sub">'+row.subPre+s[row.sub]+' rpm</span>';
  return '<td class="spec'+(isBest?" best":"")+'">'+txt+sub+(isBest?'<span class="best-tag">Best</span>':'')+'</td>';
}
function compareSpecHTML(items){
  var specs=items.map(function(x){return specOf(x.b.name,x.m.name)});
  var have=specs.filter(function(s){return s}).length;
  var html="";
  if(!have){
    html='<tr class="grp"><td colspan="'+(items.length+1)+'">Technical specs · not collected yet (filled in batches; see the data-quality panel)</td></tr>';
    return html;
  }
  html+='<tr class="grp"><td colspan="'+(items.length+1)+'">Spec scope</td></tr>';
  html+='<tr><td class="rowh">Version</td>'+specs.map(function(s){
    if(!s)return '<td class="spec na">—</td>';
    var v=s.variant||"Version not stated";
 var p=(s.price!=null&&s.price!=="")?'<span class="spec-sub">List price for this version: ¥'+esc(String(s.price))+'</span>':'';
    return '<td class="spec">'+esc(v)+p+'</td>';
  }).join("")+'</tr>';
  SPEC_GROUPS.forEach(function(grp){
    html+='<tr class="grp"><td colspan="'+(items.length+1)+'">'+grp.g+'</td></tr>';
    grp.rows.forEach(function(row){
      var vals=specs.map(function(s){return specVal(s,row)});
      var nums=vals.filter(function(v){return typeof v==="number"});
      var bestVal=null;
      if(nums.length>1&&row.best){
        bestVal=row.best==="max"?Math.max.apply(null,nums):Math.min.apply(null,nums);
        if(nums.filter(function(n){return n===bestVal}).length!==1)bestVal=null;
      }
      html+='<tr><td class="rowh">'+esc(row.l)+'</td>'+
        specs.map(function(s){return specCell(s,row,bestVal,1)}).join("")+'</tr>';
    });
  });
  return html;
}
function renderSpecBar(items){
  var bar=$("cmpSpecBar");if(!bar)return;
  var specs=items.map(function(x){return specOf(x.b.name,x.m.name)});
  var have=specs.filter(function(s){return s}).length;
  var S=window.MOTO_SPECS;
  var totalModels=(S&&S.meta&&S.meta.totalModels)||0;
  var covered=S&&S.models?Object.keys(S.models).length:0;
bar.innerHTML='<span><i class="dot"></i>This comparison: <b>'+have+'/'+items.length+'</b> models with specs</span>'+
    '<span>Site-wide spec coverage<b>'+covered+'/'+totalModels+'</b> models</span>'+
(have?'<span>Source: '+(S&&S.meta?esc(S.meta.source):"Model database")+' · per-model spec pages</span>':'<span>Specs for these models are not collected yet — see the scope notes</span>');
}
function openCompare(){
  var items=cmpItems();  if(items.length<2){toast("Pick at least 2 models");return}
  var prices=items.map(function(x){return priceVal(x.m)}).filter(function(n){return n!=null});
  var minP=prices.length?Math.min.apply(null,prices):null;
  var modal=$("cmpModal");
  if(!modal.classList.contains("show"))modal.classList.add("show");
  document.body.style.overflow="hidden";
  var nameRow='<tr><th class="rowh">Model</th>'+items.map(function(x){
    return '<th><span class="cn">'+esc(x.m.name)+'</span><span class="csub">'+esc(x.b.name)+' · '+esc(x.m.type||"")+'</span></th>';
  }).join("")+'</tr>';
  var rPrice='<tr><td class="rowh">Official list price</td>'+items.map(function(x){
    var v=priceVal(x.m);
    var lowest=v!=null&&v===minP;
    var uniq=lowest&&items.filter(function(y){return priceVal(y.m)===v}).length===1;
    return '<td class="'+(lowest?"best":"")+'">'+
      (v!=null?'<span style="color:var(--amber);font-weight:800;font-variant-numeric:tabular-nums">'+esc(x.m.price)+'</span>':'<span style="color:var(--faint)">Not published</span>')+
      (uniq?'<span class="best-tag">Lowest price</span>':'')+'</td>';
  }).join("")+'</tr>';
  var rFrom='<tr><td class="rowh">Price type</td>'+items.map(function(x){
    return '<td>'+(x.m.priceFrom?'From price (base trim)':'Official list price')+'</td>';
  }).join("")+'</tr>';
  var ccVals=items.map(function(x){return x.m.cc}).filter(function(n){return n!=null});
  var maxC=ccVals.length?Math.max.apply(null,ccVals):null;
var rCc='<tr><td class="rowh">Displacement</td>'+items.map(function(x){
    var v=x.m.cc;
    var uniq=v!=null&&v===maxC&&items.filter(function(y){return y.m.cc===v}).length===1;
    return '<td class="'+(uniq?"best":"")+'">'+(v!=null?'<span style="font-variant-numeric:tabular-nums">'+v+'</span> cc':'—')+
      (uniq?'<span class="best-tag">Largest</span>':'')+'</td>';
  }).join("")+'</tr>';
  var rType='<tr><td class="rowh">Body type</td>'+items.map(function(x){return '<td>'+esc(x.m.type||"—")+'</td>'}).join("")+'</tr>';
  var rBand='<tr><td class="rowh">Price band</td>'+items.map(function(x){return '<td>'+esc(bandOf(x.m))+'</td>'}).join("")+'</tr>';
  var rChan='<tr><td class="rowh">Channel</td>'+items.map(function(x){
    return '<td>'+(x.b.marketStatus==="parallel"?'Parallel import · excluded from totals':'Official channel')+'</td>';
  }).join("")+'</tr>';
  var rCat='<tr><td class="rowh">Brand segment</td>'+items.map(function(x){
    return '<td>'+esc(x.b.subCategory||x.b.category)+
      (x.b.company?'<span class="csub">'+esc(x.b.company)+'</span>':'')+'</td>';
  }).join("")+'</tr>';
  var rSrc='<tr><td class="rowh">Source</td>'+items.map(function(x){
    var s=specOf(x.b.name,x.m.name);
    var sp=s&&s.src?'<a class="more" href="'+esc(s.src)+'" target="_blank" rel="noopener">Specs ↗</a>':'';
    return '<td>'+(x.m.source?'<a class="more" href="'+esc(x.m.source)+'" target="_blank" rel="noopener">Source ↗</a>':'<span style="color:var(--faint)">·</span>')+
      (sp?' · '+sp:'')+
      ' · <a class="more" href="brand/'+esc(x.b.id)+'.html">Brand page ↗</a>'+
      ' · <a class="more" href="#" data-cmpx="'+esc(cmpKey(x.b.id,x.mi))+'">Remove</a></td>';
  }).join("")+'</tr>';
  renderSpecBar(items);
  $("cmpBody").innerHTML='<table class="cmp"><thead>'+nameRow+'</thead><tbody>'+
    rPrice+rFrom+rCc+rType+compareSpecHTML(items)+rBand+rChan+rCat+rSrc+'</tbody></table>';
}
function closeCompare(){var m=$("cmpModal");m.classList.remove("show");document.body.style.overflow=""}
$("cmpGo").addEventListener("click",openCompare);

/* 单款车型参数弹层：从品牌抽屉 / 型号浏览器点车型直接看全表 */
function modelSpecHTML(b,m,s){
  var html='<table class="cmp"><tbody>';
  html+='<tr class="grp"><td colspan="2">Model</td></tr>';
  html+='<tr><td class="rowh">Brand / model</td><td class="spec">'+esc(b.name)+' · '+esc(m.name)+
    '<span class="spec-sub">'+esc(m.type||"—")+' · '+(m.cc!=null?m.cc+' cc':'Displacement not stated')+'</span></td></tr>';
  html+='<tr><td class="rowh">Official list price</td><td class="spec">'+
(m.price?esc(m.price)+'<span class="spec-sub">'+(m.priceFrom?'From price (base trim)':'Official list price')+'</span>':'<span style="color:var(--faint)">Not published</span>')+'</td></tr>';
  if(s){
    html+='<tr class="grp"><td colspan="2">Spec scope</td></tr>';
    var p=(s.price!=null&&s.price!=="")?'<span class="spec-sub">List price for this version: ¥'+esc(String(s.price))+'</span>':'';
    html+='<tr><td class="rowh">Version</td><td class="spec">'+esc(s.variant||"Version not stated")+p+'</td></tr>';
    SPEC_GROUPS.forEach(function(grp){
      html+='<tr class="grp"><td colspan="2">'+esc(grp.g)+'</td></tr>';
      grp.rows.forEach(function(row){
        html+='<tr><td class="rowh">'+esc(row.l)+'</td>'+specCell(s,row,null,1)+'</tr>';
      });
    });
  }else{
    var S=window.MOTO_SPECS,total=(S&&S.meta&&S.meta.totalModels)||0,cov=S&&S.models?Object.keys(S.models).length:0;
html+='<tr class="grp"><td colspan="2">Technical specs</td></tr>';
html+='<tr><td class="rowh">Coverage</td><td class="spec na">Specs not collected yet (site coverage '+cov+'/'+total+
' models, added in batches). Use "Add to compare" for headline data, or open the source link for the factory spec page.</td></tr>';
  }
  html+='</tbody></table>';
  return html;
}
var mmLastFocus=null;
function openModelSpec(bid,mi){
  var b=brandById[bid];if(!b)return;
  var m=b.models[mi];if(!m)return;
  mmLastFocus=document.activeElement;
  var s=specOf(b.name,m.name),S=window.MOTO_SPECS;
  var cov=S&&S.models?Object.keys(S.models).length:0,total=(S&&S.meta&&S.meta.totalModels)||0;
  $("mmTitle").textContent=b.name+" · "+m.name;
  $("mmBar").innerHTML=(s?'<span><i class="dot"></i>Spec version: <b>'+esc(s.variant||"Not stated")+'</b></span>':'<span><i class="dot"></i>Specs not collected yet</span>')+
    '<span>Site-wide spec coverage<b>'+cov+'/'+total+'</b> models</span>'+
foot.push('<a class="more" href="#" id="mmAdd" data-cmp="'+esc(cmpKey(b.id,mi))+'">'+(cmpHas(cmpKey(b.id,mi))?'✓ In comparison':'+ Add to compare')+'</a>');
  $("mmBody").innerHTML=modelSpecHTML(b,m,s);
  var foot=[];
  if(s&&s.src)foot.push('<a class="more" href="'+esc(s.src)+'" target="_blank" rel="noopener">58moto spec page ↗</a>');
  if(m.source)foot.push('<a class="more" href="'+esc(m.source)+'" target="_blank" rel="noopener">Source ↗</a>');
  foot.push('<a class="more" href="brand/'+esc(b.id)+'.html">Brand page ↗</a>');
'<span>Source: '+esc((S&&S.meta&&S.meta.source)||"Model database")+'</span>';
  $("mmFoot").innerHTML=foot.join(' · ');
  $("mmAdd").addEventListener("click",function(e){
    e.preventDefault();
    var k=this.dataset.cmp;
    if(!cmpHas(k)){if(state.cmp.length>=3){toast("Up to 3 models");return}
      state.cmp.push({b:b.id,m:mi});renderCmpBar();this.textContent="✓ In comparison";toast("Added: "+b.name+" "+m.name)}
  });
  $("modelModal").classList.add("show");
  document.body.style.overflow="hidden";
  $("mmClose").focus();
}
function closeModelSpec(){ $("modelModal").classList.remove("show"); document.body.style.overflow=""; if(mmLastFocus&&mmLastFocus.focus)mmLastFocus.focus(); }
$("mmClose").addEventListener("click",closeModelSpec);
$("mmScrim").addEventListener("click",closeModelSpec);

$("cmpClose").addEventListener("click",closeCompare);
$("cmpScrim").addEventListener("click",closeCompare);
document.addEventListener("keydown",function(e){if(e.key!=="Escape")return;if($("modelModal").classList.contains("show")){closeModelSpec();return}if($("cmpModal").classList.contains("show"))closeCompare()});

/* SECTION: drawer */
function uncRow(u){
  /* 数据里存疑条目有两种形态：{name,cc,type,price,reason,source} 和整段说明字符串 */
  if(typeof u==="string")return '<details class="d-unc"><summary>Scope note</summary><div class="u-body"><div class="u-reason">'+esc(u)+'</div></div></details>';
  return '<details class="d-unc"><summary>'+esc(u.name)+(u.cc!=null?' · '+u.cc+'cc':'')+'</summary><div class="u-body">'+
    (u.type?'<span class="tag">'+esc(u.type)+'</span> ':'')+
(u.price?'<div>Reference price: '+esc(u.price)+'</div>':'')+
    (u.reason?'<div class="u-reason">'+esc(u.reason)+'</div>':'')+
    (u.source?'<div><a href="'+esc(u.source)+'" target="_blank" rel="noopener" style="color:var(--blue)">Source ↗</a></div>':'')+
    '</div></details>';
}
var lastFocus=null;
function openDrawer(id){
  var b=brandById[id];if(!b)return;
  lastFocus=document.activeElement;
  $("dName").textContent=b.name;$("dNameEn").textContent=b.nameEn;$("dCompany").textContent=b.company||"—";
  fillLogo($("dLogo"),b,"g-fb");
  $("dBadges").innerHTML='<span class="tag cat" style="--cat-c:'+CAT_COLOR[b.category]+'">'+esc(b.category)+'</span>'+
    ((b.subCategory&&b.subCategory!==b.category)?'<span class="tag">'+esc(b.subCategory)+'</span>':(b.group?'<span class="tag">'+esc(b.group)+'</span>':''))+
    (b.marketStatus==="parallel"?'<span class="tag">Parallel import · excluded from totals</span>':'')+
(b.logo.file?'':'')+
    (b.logo.note?'<span class="tag" title="'+esc(b.logo.note)+'">Logo note ⓘ</span>':'');
  var links="";
  if(b.website)links+='<a href="'+esc(b.website)+'" target="_blank" rel="noopener">Brand site ↗</a>';
  links+='<a href="brand/'+esc(b.id)+'.html">Full brand page ↗</a>';
  if(b.logo.source)links+='<a href="'+esc(b.logo.source)+'" target="_blank" rel="noopener">Logo source ↗</a>';
  links+='<button class="d-fav'+(isFav(b.id)?" on":"")+'" id="dFav" data-id="'+esc(b.id)+'">'+(isFav(b.id)?"★ Saved":"☆ Save brand")+'</button>';
  $("dLinks").innerHTML=links;
  $("dFav").addEventListener("click",function(){toggleFav(b.id)});
  var prices=b.models.map(priceVal).filter(function(n){return n!=null});
  var ccs=b.models.map(function(m){return m.cc}).filter(function(n){return n!=null});
  var priceTxt=prices.length?(Math.min.apply(null,prices)===Math.max.apply(null,prices)?Math.min.apply(null,prices)+" CNY":Math.min.apply(null,prices)+"–"+Math.max.apply(null,prices)+" CNY"):"—";
  var ccTxt=ccs.length?Math.min.apply(null,ccs)+"–"+Math.max.apply(null,ccs)+" cc":"—";
  $("dStats").innerHTML='<div class="d-stat"><b class="num">'+b.modelCount+'</b><span>Models on sale</span></div>'+
'<div class="d-stat"><b class="num" style="font-size:13px;line-height:2">'+esc(ccTxt)+'</b><span>Displacement</span></div>'+
'<div class="d-stat"><b class="num" style="font-size:13px;line-height:2">'+esc(priceTxt)+'</b><span>List price</span></div>'+
'<div class="d-stat"><b class="num">'+b.uncertain.length+'</b><span>Doubtful, excluded</span></div>';
var html='<div class="d-sec-title">Models · '+b.modelCount+'</div>';
  if(b.models.length){
    html+=b.models.map(function(m,i){
      var hasSpec=!!specOf(b.name,m.name);
      return '<div class="d-model act" role="button" tabindex="0" data-bid="'+esc(b.id)+'" data-mi="'+i+'"><div class="dm-name">'+pad(i+1)+' · '+esc(m.name)+'</div>'+
        '<div class="dm-price num'+(m.price?'':' na')+'">'+(m.price?esc(m.price):'—')+'</div>'+
'<div class="dm-meta"><span class="tag">'+esc(m.type)+'</span><span>'+(m.cc!=null?m.cc+' cc':'Displacement not stated')+'</span>'+
'<span class="dm-more">'+(hasSpec?'Specs →':'Specs pending')+'</span>'+
        (m.source?'<a class="dm-src" href="'+esc(m.source)+'" target="_blank" rel="noopener">Source ↗</a>':'')+'</div></div>';
    }).join("");
  }else{
    html+='<div class="d-note">'+esc(b.note||"Checked against the official site and model databases: no 200cc+ model currently meets the scope.")+'</div>';
  }
  if(b.note&&b.models.length)html+='<details class="d-unc"><summary>Data basis · notes</summary><div class="u-body d-note">'+esc(b.note)+'</div></details>';
  if(b.uncertain.length){
html+='<div class="d-sec-title">Doubtful entries · excluded ('+b.uncertain.length+')</div>';
    html+=b.uncertain.map(uncRow).join("");
  }
  $("dBody").innerHTML=html;
  $("dBody").scrollTop=0;
  $("dBody").querySelectorAll(".d-model").forEach(function(el){
    el.addEventListener("click",function(e){if(e.target.closest("a"))return;openModelSpec(el.dataset.bid,+el.dataset.mi)});
    el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openModelSpec(el.dataset.bid,+el.dataset.mi)}});
  });
  $("scrim").classList.add("show");$("drawer").classList.add("show");
  document.body.style.overflow="hidden";
  $("drawerClose").focus();
}
function closeDrawer(){
  $("scrim").classList.remove("show");$("drawer").classList.remove("show");
  document.body.style.overflow="";
  if(lastFocus&&lastFocus.focus)lastFocus.focus();
}
$("drawerClose").addEventListener("click",closeDrawer);
$("scrim").addEventListener("click",closeDrawer);
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&$("drawer").classList.contains("show"))closeDrawer()});

/* SECTION: footer */
$("garageDesc").textContent=s.brandCount+" brands · click a card for details · ☆ save locally";
$("principles").innerHTML=D.meta.principles.map(function(x){return "<li>"+esc(x)+"</li>"}).join("");
$("sources").textContent=D.meta.sources.join("；");
$("integrity").textContent="Covering "+s.brandCount+" brands and "+s.modelCount+" models of 200cc+, each linked to the manufacturer's own line-up. No China-based manufacturer is included, and no cross-market price is invented; brand marks are shown for identification only and remain the property of their owners.";
$("missingLogos").textContent=D.brands.filter(function(b){return !b.logo.file}).map(function(b){return b.name}).join("、")||"None";
/* 数据质量体检：把「哪些地方有缺口」直接摆出来，比藏着更可信 */
(function qualityReport(){
  var el=$("qualityGrid");if(!el)return;
  var all=D.brands.reduce(function(a,b){return a.concat(b.models)},[]);
  var noPrice=all.filter(function(m){return !m.price}).length;
  var noSource=all.filter(function(m){return !m.source}).length;
  var unc=0,uncBrands=0;
  D.brands.forEach(function(b){
    var u=b.uncertain||[];
    if(u.length){uncBrands++;unc+=u.length}
  });
  var logoOk=D.brands.filter(function(b){return b.logo&&b.logo.file}).length;
  var parBrands=D.brands.filter(function(b){return b.marketStatus==="parallel"}).length;
  var srcRate=all.length?((all.length-noSource)/all.length*100):100;
  var items=[
    {v:noPrice,l:"No price list in this edition",x:"List prices differ by market; no cross-market price is invented, so price sorting and price bands stay out of scope",warn:true},
    {v:unc,l:"Doubtful entries excluded",x:"Models or specs with conflicting or single-source evidence are noted in the brand drawer and brand page",warn:unc>0},
    {v:srcRate.toFixed(1)+"%",l:"Model source coverage",x:noSource?("Still "+noSource+" models without a source link"):"Every model links back to its origin",warn:noSource>0},
    {v:logoOk+"/"+D.brands.length,l:"Official logo coverage",x:"Official brand marks, shown for identification only"}
    
    
  ];
  el.innerHTML=items.map(function(it){
    return '<div class="q-item'+(it.warn?" warn":"")+'"><div class="qv">'+esc(String(it.v))+'<small></small></div><div class="ql">'+esc(it.l)+'</div><div class="qx">'+esc(it.x)+'</div></div>';
  }).join("");
  $("qualityNote").textContent="These numbers cover everything incomplete: models without a price"+noPrice+" models, "+unc+" doubtful entries, and "+s.parallelModelCount+" parallel imports — each traced to a source. Gaps are shown, never filled.";
})();
var empties=D.brands.filter(function(b){return b.modelCount===0}).map(function(b){return b.name});
$("emptyBrands").textContent=empties.length?empties.join("、")+"("+empties.length+" , each explained in the details)":"None";

/* SECTION: nav state & reveal & top */
var secIds=Array.prototype.map.call(document.querySelectorAll("#navLinks a"),function(a){return a.dataset.sec});
function updateNav(){
  var pos=window.scrollY+90,current="";
  secIds.forEach(function(id){var el=$(id);if(el&&el.getBoundingClientRect().top+window.scrollY<=pos)current=id});
  document.querySelectorAll(".nav-links a").forEach(function(a){a.classList.toggle("on",a.dataset.sec===current)});
  $("toTop").classList.toggle("show",window.scrollY>600);
}
window.addEventListener("scroll",updateNav,{passive:true});
$("toTop").addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"})});
if("IntersectionObserver" in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target);
    if(en.target.querySelector(".bar-fill"))animateBars(en.target)}})},{threshold:.12});
  document.querySelectorAll(".reveal").forEach(function(el){io.observe(el)});
}else{
  document.querySelectorAll(".reveal").forEach(function(el){el.classList.add("in")});
  animateBars(document);
}
syncControls();render();refreshFavUI();updateNav();
