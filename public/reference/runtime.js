
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(pointer:fine)').matches;
/* ================= BACKGROUND: scroll-driven 3D point structure (Three.js) ================= */
(function(){
const cv=$('#bg'),nogl=()=>{cv.hidden=true;document.body.classList.add('nogl')};
if(!window.THREE)return nogl();
let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:false,alpha:true,powerPreference:'high-performance'})}catch(e){return nogl()}
const mob=innerWidth<760,N=mob?2600:6000,rnd=Math.random,V=(x,y,z)=>new THREE.Vector3(x,y,z);
R.setPixelRatio(Math.min(devicePixelRatio||1,mob?1.5:2));
const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(35,1,.1,100);cam.position.z=14;
const kc=t=>V((2+Math.cos(3*t))*Math.cos(2*t),(2+Math.cos(3*t))*Math.sin(2*t),Math.sin(3*t));
/* five structures the page morphs through as you scroll */
const SH=[
()=>{const a=new Float32Array(N*3);for(let i=0;i<N;i++){const t=i/N*6.2832,p0=kc(t),T=kc(t+.01).sub(p0).normalize(),A=Math.abs(T.z)<.9?V(0,0,1):V(1,0,0),n=new THREE.Vector3().crossVectors(T,A).normalize(),b=new THREE.Vector3().crossVectors(T,n),v=rnd()*6.2832,r=.34*Math.sqrt(rnd()),p=p0.addScaledVector(n,Math.cos(v)*r).addScaledVector(b,Math.sin(v)*r).multiplyScalar(.8);a.set([p.x,p.y,p.z],i*3)}return a},
()=>{const a=new Float32Array(N*3),g=Math.ceil(Math.cbrt(N)),gz=Math.ceil(N/(g*g));for(let i=0;i<N;i++){const x=i%g,y=(i/g|0)%g,z=i/(g*g)|0,X=(x/(g-1)-.5)*4.4,Y=(y/(g-1)-.5)*4.4,Z=(z/Math.max(1,gz-1)-.5)*4.4,an=Y*.55,c=Math.cos(an),s=Math.sin(an);a.set([X*c-Z*s,Y,X*s+Z*c],i*3)}return a},
()=>{const a=new Float32Array(N*3),j=()=>(rnd()-.5)*.09;for(let i=0;i<N;i++){const k=i%10;let u=rnd(),x,z;if(k>=8)u=Math.round(u*22)/22;const y=(u-.5)*5.4,an=u*13.8,r=1.15;if(k<4){x=Math.cos(an)*r;z=Math.sin(an)*r}else if(k<8){x=Math.cos(an+Math.PI)*r;z=Math.sin(an+Math.PI)*r}else{const w=rnd()*2-1;x=Math.cos(an)*r*w;z=Math.sin(an)*r*w}a.set([x+j(),y+j(),z+j()],i*3)}return a},
()=>{const a=new Float32Array(N*3),g=Math.ceil(Math.sqrt(N));for(let i=0;i<N;i++){const x=((i%g)/(g-1)-.5)*5.4,z=((i/g|0)/(g-1)-.5)*5.4;a.set([x,.55*Math.sin(x*1.5)*Math.cos(z*1.5)+.25*Math.sin(z*2.4),z],i*3)}return a},
()=>{const a=new Float32Array(N*3);for(let i=0;i<N;i++){const u=Math.pow(rnd(),.6),an=u*9+(i%3)*2.0944+rnd()*.35,r=u*2.8;a.set([Math.cos(an)*r,(rnd()-.5)*.25*(1-u*.6),Math.sin(an)*r],i*3)}return a}];
const pos=SH.map(f=>f()),aR=new Float32Array(N),aRed=new Float32Array(N);for(let i=0;i<N;i++){aR[i]=rnd();aRed[i]=rnd()<.13?1:0}
const A=new THREE.BufferAttribute(pos[0].slice(),3),B=new THREE.BufferAttribute(pos[1].slice(),3),geo=new THREE.BufferGeometry();
geo.setAttribute('position',A);geo.setAttribute('aB',B);geo.setAttribute('aR',new THREE.BufferAttribute(aR,1));geo.setAttribute('aRed',new THREE.BufferAttribute(aRed,1));
const U={uM:{value:0},uT:{value:0},uAp:{value:0},uVel:{value:0},uScan:{value:0},uPx:{value:R.getPixelRatio()*(mob?.9:1)},uLight:{value:0},uOp:{value:1}};
const mat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,
vertexShader:`attribute vec3 aB;attribute float aR;attribute float aRed;uniform float uM,uT,uAp,uVel,uScan,uPx,uLight;varying float vRed,vG;
void main(){float k=smoothstep(aR*.45,.55+aR*.45,uM);vec3 p=mix(position,aB,k);
p+=vec3(sin(uT*.6+aR*40.),cos(uT*.5+aR*31.),sin(uT*.7+aR*17.))*.03;
p.y+=sin(p.x*2.+uT)*uVel*.35;
p*=smoothstep(0.,1.,clamp(uAp*1.5-aR*.5,0.,1.));
float g=1.-smoothstep(0.,.4,abs(p.y-uScan));vRed=aRed;vG=g;
vec4 mv=modelViewMatrix*vec4(p,1.);
gl_PointSize=(2.+aRed*1.8+g*2.4)*(1.+aRed*uLight*.35)*uPx*(14./(-mv.z));gl_Position=projectionMatrix*mv;}`,
fragmentShader:`uniform float uLight,uOp;varying float vRed,vG;
void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;float a=1.-smoothstep(.15,.5,d);
vec3 base=mix(vec3(.84,.86,.9),vec3(.09,.1,.13),uLight);
float hot=max(vRed,vG*.9),lightRed=hot*uLight;
vec3 red=mix(vec3(.9,.17,.29),vec3(1.,.025,.12),uLight);
vec3 col=mix(base,red,hot);
float shine=1.-smoothstep(0.,.18,d);
col=mix(col,vec3(1.,.58,.64),shine*lightRed*.45);
float glow=exp(-d*d*15.)*lightRed*.45;
gl_FragColor=vec4(col,min(1.,a*uOp*(.6+vG*.4)+glow*uOp));}`});
const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;sc.add(pts);
let secs=[],docMax=1,hh=1,hw=1,S0=1,desk=true,idx=-1,sp=0,lastY=scrollY,vs=0,tx=0,ty=0,px=0,py=0,vis=true;
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
function measure(){docMax=Math.max(1,document.documentElement.scrollHeight-innerHeight);secs=$$('main>section').map(s=>({t:s.offsetTop,b:s.offsetTop+s.offsetHeight,l:/\blt2?\b/.test(s.className)?1:s.id==='contact'?.5:0,h:s.classList.contains('hero')}))}
function place(){R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();hh=Math.tan(.3054)*14;hw=hh*cam.aspect;desk=innerWidth>860;
S0=(desk?Math.min(hh*.8,hw*.5):Math.min(hh*.4,hw*.62))/2.8;U.uPx.value=R.getPixelRatio()*(mob?.9:1);measure();frame(9,true)}
function frame(t,still){
 const sy=scrollY,pT=still?0:cl(sy/docMax);sp+=(pT-sp)*(still?1:.08);
 const s=sp*(SH.length-1),i0=Math.min(SH.length-2,Math.floor(s)),f=s-i0;
 if(i0!==idx){idx=i0;A.array.set(pos[i0]);B.array.set(pos[i0+1]);A.needsUpdate=B.needsUpdate=true}
 U.uM.value=cl((f-.25)/.5);U.uM.value=U.uM.value*U.uM.value*(3-2*U.uM.value);

 const y=sy+innerHeight*.5,sec=secs.find(q=>y>=q.t&&y<q.b)||secs[0]||{l:0,h:1};
 U.uLight.value+=((sec&&sec.l||0)-U.uLight.value)*.07;U.uOp.value+=((sec&&sec.h?1:sec&&sec.l===1?.9:1)-U.uOp.value)*.07;

 const dy=sy-lastY;lastY=sy;vs+=(cl(Math.abs(dy)/45)-vs)*.1;px+=(tx-px)*.05;py+=(ty-py)*.05;
 const e=still?1:cl(t/1.8),sh=cl(sy/innerHeight);
 U.uAp.value=e;U.uT.value=still?0:t;U.uVel.value=still?0:vs;U.uScan.value=Math.sin(t*.45)*24;
 const k=still?1:1-.2*cl(sp*4);pts.scale.setScalar(S0*k);
 pts.position.x=desk?hw*.44*Math.cos(sp*9.4248):0;
 pts.position.y=(desk?0:-hh*.16*(1-sh))+(still?0:Math.sin(sp*12.57)*hh*.1);
 pts.rotation.y=(still?.6:t*.08)+sy*.0015+px*.5;pts.rotation.x=.28+py*.3+(still?0:Math.sin(sy*.001)*.2);
 R.render(sc,cam)}
let t0=null;function loop(n){requestAnimationFrame(loop);if(!vis)return;if(t0===null)t0=n;frame((n-t0)/1000)}
place();addEventListener('resize',place);addEventListener('load',measure);
if(!rm){requestAnimationFrame(loop);document.addEventListener('visibilitychange',()=>{vis=!document.hidden});
if(fine)addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*2;ty=(e.clientY/innerHeight-.5)*2})}
})();
/* ================= mockups ================= */
const M=c=>`<div class="mk">${c}</div>`,TT='<span class="t"></span>';
const PV={
web:()=>M(`<div class="bar"><i></i><i></i><i></i></div><div class="bd"><span class="t sh"></span><h4>Built to convert.</h4><span class="t sh" style="width:70%"></span><b class="bt">Get a quote</b><div class="tl"><div><em class="cnt">128</em>visits</div><div><em class="cnt">14</em>enquiries</div></div></div>`),
mob:()=>M(`<div class="ph"><s></s>${'<div class="row"><i></i><span class="t"></span><b></b></div>'.repeat(4)}</div>`),
dash:()=>M(`<div class="bar"><i></i><i></i><i></i></div><div class="g3"><div>Orders<em class="cnt">128</em></div><div>Pending<em class="cnt">14</em></div><div>Low stock<em class="cnt">6</em></div></div><div class="bars"><i style="--h:40%"></i><i style="--h:60%"></i><i style="--h:45%"></i><i style="--h:85%"></i><i style="--h:100%"></i><i style="--h:70%"></i></div>`),
wf:()=>M(`<div class="fw"><span class="nd">Request</span><i class="cn"><b></b></i><span class="nd r">AI sorts</span><i class="cn"><b></b></i><span class="nd">Team approves</span></div><div class="fwl">DRAFT REPLY READY / HUMAN IN THE LOOP</div>`),
store:()=>M(`<div class="bar"><i></i><i></i><i></i></div><div class="g3"><div class="pr2"><u></u>Linen shirt<em>₹2,499</em></div><div class="pr2"><u></u>Tote bag<em>₹1,299</em></div><div class="pr2"><u></u>Notebook<em>₹499</em></div></div><div class="ct"><span>Cart</span><b class="cnt">3</b></div>`),
brand:()=>M(`<div class="br"><div class="lg">B</div><div class="aa">Aa</div><div class="sw"><i style="background:#E52B4A"></i><i style="background:#363940"></i><i style="background:#F0F0EE"></i></div><div class="mono" style="color:var(--mu)">Visual identity</div></div>`),
grow:()=>M(`<div class="ch"><svg viewBox="0 0 300 110"><polyline class="pl" points="0,95 50,86 100,66 150,70 200,42 250,28 300,10"/></svg></div><div class="tl" style="padding:0 14px 14px"><div>Visits<em class="cnt">1200</em></div><div>Enquiries<em class="cnt">48</em></div></div>`)};
/* ================= services ================= */
const S=[["Web development","Fast, credible sites and web apps that turn visitors into enquiries.",["Custom websites","Next.js and React","Full-stack web applications"],"web"],
["Mobile apps","Apps your customers keep on their phone, connected to your back office.",["Android and iOS","React Native applications"],"mob"],
["Software engineering","Back ends and internal systems that fit how your business actually runs.",["Java / Spring Boot","Node.js","Business software","SaaS platforms","Admin dashboards","Inventory systems","CRM and internal tools"],"dash"],
["AI and automation","Less manual work, with people kept in the loop on what matters.",["AI integration","AI-powered applications","LLM-based tools","Workflow automation"],"wf"],
["E-commerce","Stores and shopping apps with everything needed to sell and fulfil.",["E-commerce websites and apps","Payment gateway integration"],"store"],
["Design and brand","Interfaces and identities that look credible and feel clear.",["UI/UX design","Brand identity","Motion graphics","Social media creatives","Product visuals","AI-assisted promotional videos"],"brand"],
["Growth and support","Getting found, staying fast and keeping everything running.",["SEO","Digital marketing","Maintenance and deployment"],"grow"]];
const CAP=['Web development','Mobile apps','Software engineering','AI and automation','E-commerce','Design and brand','Growth and support'];
let cur=0;const sr=$('#sr'),pvp=$('#pvp');
sr.innerHTML=S.map((s,i)=>`<div class="sr${i?'':' on'}"><button class="sh2" aria-expanded="${!i}" aria-controls="b${i}"><span>0${i+1}</span><h3>${s[0]}</h3></button><div class="sb" id="b${i}"><div><p>${s[1]}</p><ul>${s[2].map(x=>`<li>${x}</li>`).join('')}</ul><a class="btn k" href="#contact" data-svc="${CAP[i]}">Discuss this</a></div></div></div>`).join('');
function pick(i){if(i===cur&&pvp.innerHTML)return;cur=i;$$('.sr').forEach((r,j)=>{r.classList.toggle('on',j==i);r.querySelector('button').setAttribute('aria-expanded',j==i)});pvp.innerHTML=`<div class="cap mono"><span>0${i+1} / ${S[i][0]}</span><b>Demo UI</b></div>${PV[S[i][3]]()}<p class="mono" style="color:var(--mu)">Animated concept preview</p>`;tick()}
sr.addEventListener('click',e=>{const b=e.target.closest('.sh2');if(b)pick($$('.sh2').indexOf(b))});
sr.addEventListener('pointerover',e=>{if(!fine)return;const b=e.target.closest('.sh2');if(b)pick($$('.sh2').indexOf(b))});
sr.addEventListener('focusin',e=>{const b=e.target.closest('.sh2');if(b)pick($$('.sh2').indexOf(b))});
$('#ssel').innerHTML='<option value="">Choose a service</option>'+CAP.map(x=>`<option>${x}</option>`).join('')+'<option>Not sure yet</option>';
document.addEventListener('click',e=>{const a=e.target.closest('[data-svc]');if(a&&a.dataset.svc)$('#ssel').value=a.dataset.svc});
pvp.innerHTML='';pick(0);
/* ================= showcase ================= */
const T=[["Websites","web"],["Mobile apps","mob"],["Dashboards","dash"],["E-commerce","store"],["AI tools","wf"]],tb=$('#tabs'),lay=$('#lay');
tb.innerHTML=T.map((t,i)=>`<button role="tab" id="t${i}" aria-selected="${!i}" aria-controls="lay">${t[0]}</button>`).join('');
function showT(i){[...tb.children].forEach((b,j)=>b.setAttribute('aria-selected',j==i));lay.setAttribute('aria-labelledby','t'+i);lay.innerHTML=PV[T[i][1]]();tick()}
tb.onclick=e=>{const b=e.target.closest('button');if(b)showT([...tb.children].indexOf(b))};showT(0);
if(fine&&!rm)$('#stg').addEventListener('pointermove',e=>{const r=e.currentTarget.getBoundingClientRect();lay.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*14+'deg');lay.style.setProperty('--rx',-((e.clientY-r.top)/r.height-.5)*10+'deg')});
function tick(){}
if(!rm)setInterval(()=>$$('.cnt').forEach(e=>{e.textContent=(+e.textContent+(Math.random()<.6?1:0))}),1700);
/* portfolio tilt */
if(fine&&!rm)$$('.pj').forEach(c=>c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*12+'deg');c.style.setProperty('--rx',-((e.clientY-r.top)/r.height-.5)*8+'deg')}));
/* ================= AI network (2D canvas) ================= */
(function(){const c=$('#net'),x=c.getContext('2d'),L=[3,5,5,3];let W,H,nodes=[],edges=[],P=[],mx=-1,my=-1,run=true;
function build(){const d=Math.min(devicePixelRatio||1,2),r=c.getBoundingClientRect();W=r.width;H=r.height;c.width=W*d;c.height=H*d;x.setTransform(d,0,0,d,0,0);nodes=[];L.forEach((n,i)=>{for(let j=0;j<n;j++)nodes.push({l:i,x:W*(.1+.8*i/(L.length-1)),y:H*(.14+.72*(j+.5)/n),g:0})});
edges=[];nodes.forEach((a,i)=>nodes.forEach((b,j)=>{if(b.l===a.l+1)edges.push([i,j])}));P=Array.from({length:46},()=>({e:Math.random()*edges.length|0,p:Math.random(),v:.004+Math.random()*.006}));draw()}
function draw(){x.clearRect(0,0,W,H);let hv=-1;nodes.forEach((n,i)=>{if(Math.hypot(n.x-mx,n.y-my)<26)hv=i});
edges.forEach(([a,b])=>{const A=nodes[a],B=nodes[b],hot=hv===a||hv===b;x.strokeStyle=hot?'rgba(229,43,74,.7)':'rgba(166,169,175,.16)';x.lineWidth=hot?1.4:1;x.beginPath();x.moveTo(A.x,A.y);x.lineTo(B.x,B.y);x.stroke()});
P.forEach(p=>{const[a,b]=edges[p.e],A=nodes[a],B=nodes[b];if(!rm)p.p+=p.v;if(p.p>=1){B.g=1;p.p=0;p.e=Math.random()*edges.length|0}const q=rm?.5:p.p;x.fillStyle='#FF4864';x.beginPath();x.arc(A.x+(B.x-A.x)*q,A.y+(B.y-A.y)*q,2.4,0,7);x.fill()});
nodes.forEach((n,i)=>{n.g*=.94;x.fillStyle='#1C1E22';x.strokeStyle=i===hv||n.g>.1?'#E52B4A':'#6b6f78';x.lineWidth=1.5;x.beginPath();x.arc(n.x,n.y,i===hv?10:8,0,7);x.fill();x.stroke();if(n.g>.05){x.fillStyle=`rgba(229,43,74,${n.g*.7})`;x.beginPath();x.arc(n.x,n.y,5+n.g*6,0,7);x.fill()}})}
(function loop(){requestAnimationFrame(loop);if(run&&!rm)draw()})();
new IntersectionObserver(e=>{run=e[0].isIntersecting}).observe(c);addEventListener('resize',build);build();
c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top});c.addEventListener('pointerleave',()=>{mx=my=-1})})();
/* ================= faq ================= */
const F=[["How much does a custom website cost?","It depends on pages, features and integrations, so every project is quoted individually. Share your brief and we’ll reply with a clear estimate."],["Do you develop Android and iOS apps?","Yes, including cross-platform apps built with React Native, connected to an admin panel or your existing systems."],["Can you build custom software for my business?","Yes: internal tools, CRMs, inventory systems, dashboards and the Java / Spring Boot or Node.js back ends behind them."],["Can AI be integrated into existing systems?","Often, yes. We integrate existing AI models and services into your workflows, and we’ll say plainly if it isn’t a good fit."],["Do you build e-commerce websites and apps?","Yes: catalogues, checkout, payment gateway integration, inventory, orders and admin dashboards."],["How long does a project take?","A focused website can take a few weeks. Apps and software take longer. We agree a timeline after discovery."],["Do you help with deployment and maintenance?","Yes. We support deployment and can agree ongoing maintenance, with the scope defined before we start."],["How do we start?","Send the form or message us on WhatsApp. We’ll reply with a short note and a link to book a call."]];
$('#fq').innerHTML=F.map(f=>`<details name="faq"><summary>${f[0]}<span class="pl" aria-hidden="true">+</span></summary><p>${f[1]}</p></details>`).join('');
/* ================= nav, reveal, progress, magnetic ================= */
const mb=$('#mb'),nv=$('#nv'),hd=$('#hd'),pg=$('#pg');
mb.onclick=()=>{const o=nv.classList.toggle('o');mb.setAttribute('aria-expanded',o);mb.textContent=o?'Close':'Menu';document.body.style.overflow=o?'hidden':''};
nv.onclick=e=>{if(e.target.closest('a')&&nv.classList.contains('o'))mb.click()};
addEventListener('keydown',e=>{if(e.key==='Escape'&&nv.classList.contains('o')){mb.click();mb.focus()}});
addEventListener('scroll',()=>{hd.classList.toggle('s',scrollY>30);pg.style.transform=`scaleX(${scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)})`},{passive:true});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('v');io.unobserve(e.target)}}),{threshold:.2});$$('.rv,.sl,#stp').forEach(el=>io.observe(el));
if(fine&&!rm)$$('.btn').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.18}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')});
