import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const canvas=document.querySelector("#world");
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
renderer.shadowMap.enabled=true;
renderer.outputColorSpace=THREE.SRGBColorSpace;

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,100);
scene.background=new THREE.Color("#e6ded1");
scene.fog=new THREE.Fog("#e6ded1",13,31);
camera.position.set(0,2.05,5.7);

scene.add(new THREE.HemisphereLight(0xffffff,0x746b61,2.35));
const sun=new THREE.DirectionalLight(0xfff5df,2.7);
sun.position.set(4,8,4);
sun.castShadow=true;
scene.add(sun);

const outside=new THREE.Group(),inside=new THREE.Group();
scene.add(outside,inside);
outside.visible=false;
inside.visible=true;

const M=(c,r=.65,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
function box(w,h,d,c,x,y,z,g=outside,mat=null){
  const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat||M(c));
  o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;
}
function floor(w,d,c,g=outside){
  const o=new THREE.Mesh(new THREE.PlaneGeometry(w,d),M(c,.9));
  o.rotation.x=-Math.PI/2;o.position.y=-.08;o.receiveShadow=true;g.add(o);return o;
}
function cyl(r,h,c,x,y,z,g=inside){
  const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,28),M(c,.72));
  o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;
}

/* Exterior remains available as a secondary view. */
floor(30,30,"#aaa69e",outside);
box(9.6,3.8,3.7,"#3c3b39",0,1.9,0,outside);
box(9.3,.24,.32,"#ffc72c",0,3.75,1.8,outside);
box(9,.2,.18,"#171716",0,3.55,1.9,outside);
const glass=new THREE.MeshPhysicalMaterial({color:"#80a2aa",transparent:true,opacity:.58,roughness:.1});
[-1.6,.2].forEach(x=>{const w=new THREE.Mesh(new THREE.BoxGeometry(1.65,1.75,.07),glass);w.position.set(x,1.55,1.9);outside.add(w)});
const door=box(1.55,2.6,.1,"#20201e",2.45,1.45,1.9,outside);door.userData.action="enter";
const dg=new THREE.Mesh(new THREE.BoxGeometry(1.18,2.25,.03),glass);dg.position.set(2.45,1.45,1.97);dg.userData.action="enter";outside.add(dg);
[-.33,.33].forEach(x=>{const a=new THREE.Mesh(new THREE.TorusGeometry(.43,.09,18,40,Math.PI),M("#ffc72c",.3,.1));a.rotation.z=Math.PI;a.position.set(x,3.1,2.08);outside.add(a)});
[-3.8,-1.8,.3,4].forEach((x,i)=>{const s=new THREE.Mesh(new THREE.SphereGeometry(.42,16,16),M("#536142"));s.position.set(x,.43,3.1+(i%2)*.3);outside.add(s)});

/* Interior: a walk-in restaurant room is the opening experience. */
floor(18,18,"#cfc5b7",inside);
box(13,5,.3,"#292826",0,2.5,-5.25,inside);
box(.3,5,10.4,"#d9d0c4",-6.35,2.5,-.1,inside);
box(.3,5,10.4,"#d9d0c4",6.35,2.5,-.1,inside);
box(13,.22,10.8,"#eee8de",0,4.75,0,inside);

/* Floor tile bands make movement read spatially. */
for(let z=-4.3;z<=4.2;z+=1.25) box(12.2,.012,.025,"#b5aa9d",0,-.065,z,inside);
for(let x=-5.6;x<=5.6;x+=1.25) box(.025,.012,9.3,"#b5aa9d",x,-.065,0,inside);

/* Back counter and glowing menu boards. */
box(9.4,1.05,1.05,"#67594c",0,.55,-4.25,inside);
box(9.4,.16,1.28,"#2a2926",0,1.1,-4.18,inside);
[-3.1,-1.03,1.03,3.1].forEach((x,i)=>{
  const board=new THREE.Mesh(new THREE.PlaneGeometry(1.78,1.08),new THREE.MeshStandardMaterial({
    color:i%2?"#f4ddaa":"#fff0c3",emissive:"#d9b96e",emissiveIntensity:.18,roughness:.35
  }));
  board.position.set(x,2.8,-5.08);inside.add(board);
  box(1.92,1.2,.08,"#171716",x,2.8,-5.13,inside);
  board.position.z=-5.08;
});

/* Ordering kiosks in the center aisle. */
[-2.25,0,2.25].forEach(x=>{
  box(1.35,2.45,.48,"#252523",x,1.37,-.75,inside);
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(.98,1.25),new THREE.MeshStandardMaterial({
    color:"#ffd44b",emissive:"#ffc72c",emissiveIntensity:.3,roughness:.28
  }));
  screen.position.set(x,1.72,-.495);screen.userData.action="kiosk";inside.add(screen);
  box(.78,.18,.09,"#d62828",x,.68,-.48,inside);
});

/* Dining tables and seating leave a clear central path to the kiosks. */
[[-4.2,1.9],[-4.2,-1.8],[4.2,1.9],[4.2,-1.8]].forEach(([x,z])=>{
  cyl(.72,.09,"#5f574f",x,.73,z);
  cyl(.1,.72,"#373431",x,.35,z);
  [[-.95,0],[.95,0],[0,-.95],[0,.95]].forEach(([dx,dz])=>{
    box(.56,.08,.56,"#a32b23",x+dx,.55,z+dz,inside);
    box(.12,.58,.12,"#3b3834",x+dx,.28,z+dz,inside);
  });
});

/* Side windows and plants. */
[-3.2,.2,3.1].forEach(z=>{
  const wl=new THREE.Mesh(new THREE.PlaneGeometry(2.15,1.5),glass);wl.rotation.y=Math.PI/2;wl.position.set(-6.18,2.35,z);inside.add(wl);
  const wr=wl.clone();wr.rotation.y=-Math.PI/2;wr.position.x=6.18;inside.add(wr);
});
[-5.55,5.55].forEach(x=>{
  cyl(.34,.52,"#675247",x,.25,3.5);
  const plant=new THREE.Mesh(new THREE.SphereGeometry(.56,18,14),M("#536142",.92));plant.scale.y=1.25;plant.position.set(x,.85,3.5);inside.add(plant);
});

/* Warm pendant lights. */
[-3,0,3].forEach(x=>{
  box(.035,1,.035,"#2b2926",x,4.25,.8,inside);
  const shade=new THREE.Mesh(new THREE.ConeGeometry(.38,.3,28,1,true),M("#292826",.45));shade.rotation.x=Math.PI;shade.position.set(x,3.72,.8);inside.add(shade);
  const light=new THREE.PointLight(0xffdf9b,4.2,5.5,2);light.position.set(x,3.55,.8);inside.add(light);
});

const exit=box(1.25,2.7,.12,"#52777d",-5.65,1.45,3.65,inside);exit.userData.action="exit";
box(1.5,.24,.16,"#ffc72c",-5.65,3.05,3.64,inside);

let mode="inside",move={x:0,z:0};
const target=new THREE.Vector3(),ray=new THREE.Raycaster(),pointer=new THREE.Vector2();

function setMode(next){
  mode=next;
  outside.visible=next==="outside";
  inside.visible=next==="inside";
  move={x:0,z:0};
  scene.background.set(next==="outside"?"#b9d2d5":"#e6ded1");
  scene.fog.color.copy(scene.background);

  const interior=next==="inside";
  document.body.dataset.mode=next;
  document.querySelector("#tag").textContent=interior?"RESTAURANT INTERIOR":"STOREFRONT";
  document.querySelector("#headline").textContent=interior?"You’re already inside.":"The storefront is still part of the journey.";
  document.querySelector("#subhead").textContent=interior
    ?"Walk the room, approach a yellow kiosk, and order without leaving the 3D experience."
    :"Tap the entrance to step back into the restaurant.";
  document.querySelector("#enter").classList.toggle("hidden",interior);
  document.querySelector("#order").classList.toggle("hidden",!interior);
  document.querySelector("#outside").classList.toggle("hidden",!interior);
  document.querySelector(".brand strong").textContent=interior?"Rancho Del Rio · 3D Restaurant":"Rancho Del Rio · Exterior";
  camera.position.set(0,interior?2.05:2.5,interior?5.7:8.7);
}

function nudge(x,z){
  if(mode==="inside"){
    move.x=THREE.MathUtils.clamp(move.x+x,-4.7,4.7);
    move.z=THREE.MathUtils.clamp(move.z+z,-3.2,2.35);
  }else{
    move.x=THREE.MathUtils.clamp(move.x+x,-3.8,3.8);
    move.z=THREE.MathUtils.clamp(move.z+z,-2.2,1.8);
  }
}

function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
addEventListener("resize",resize);resize();

(function loop(){
  target.set(move.x,mode==="outside"?2.5:2.05,(mode==="outside"?8.7:5.7)+move.z);
  camera.position.lerp(target,.1);
  camera.lookAt(mode==="outside"?0:move.x*.1,1.55,mode==="outside"?0:-2.5);
  renderer.render(scene,camera);
  requestAnimationFrame(loop);
})();

canvas.addEventListener("pointerdown",e=>{
  pointer.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);
  ray.setFromCamera(pointer,camera);
  const h=ray.intersectObjects(scene.children,true).find(x=>x.object.userData.action);
  if(!h)return;
  if(h.object.userData.action==="enter")setMode("inside");
  if(h.object.userData.action==="exit")setMode("outside");
  if(h.object.userData.action==="kiosk")openKiosk();
});

document.querySelector("#enter").onclick=()=>setMode("inside");
document.querySelector("#outside").onclick=()=>setMode("outside");
document.querySelector("#order").onclick=openKiosk;

document.querySelectorAll("[data-move]").forEach(b=>{
  b.onclick=()=>{
    const m=b.dataset.move;
    if(m==="up")nudge(0,-.45);
    if(m==="down")nudge(0,.45);
    if(m==="left")nudge(-.45,0);
    if(m==="right")nudge(.45,0);
    if(m==="reset")move={x:0,z:0};
  };
});

addEventListener("keydown",e=>{
  if(!document.querySelector("#kiosk").classList.contains("hidden"))return;
  const k=e.key.toLowerCase();
  if(k==="w"||e.key==="ArrowUp")nudge(0,-.35);
  if(k==="s"||e.key==="ArrowDown")nudge(0,.35);
  if(k==="a"||e.key==="ArrowLeft")nudge(-.35,0);
  if(k==="d"||e.key==="ArrowRight")nudge(.35,0);
});

const items=[
{id:"big",name:"Big Mac",cat:"Burgers",desc:"Two beef patties, sauce, lettuce, cheese, pickles and onions.",price:5.99,icon:"🍔"},
{id:"nug",name:"10 pc. McNuggets",cat:"Chicken",desc:"Crispy chicken nuggets with dipping sauce.",price:6.49,icon:"🍗"},
{id:"fries",name:"World Famous Fries",cat:"Sides",desc:"Golden crispy fries. Demo size: medium.",price:3.49,icon:"🍟"},
{id:"coffee",name:"McCafé Iced Coffee",cat:"Drinks",desc:"Cold coffee drink. Demo size: medium.",price:2.79,icon:"🥤"},
{id:"egg",name:"Egg McMuffin",cat:"Breakfast",desc:"Egg, Canadian bacon and cheese on an English muffin.",price:4.59,icon:"🥪"},
{id:"shake",name:"Vanilla Shake",cat:"Sweets",desc:"Creamy vanilla shake. Demo size: medium.",price:3.99,icon:"🥛"}
];

let active="All",cart={},pickup="Front Counter";
const cats=["All"].concat(Array.from(new Set(items.map(x=>x.cat))));

function renderCats(){
  document.querySelector("#cats").innerHTML=cats.map(c=>'<button class="'+(c===active?"active":"")+'" data-cat="'+c+'">'+c+"</button>").join("");
  document.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{active=b.dataset.cat;renderCats();renderMenu()});
}
function renderMenu(){
  const list=active==="All"?items:items.filter(x=>x.cat===active);
  document.querySelector("#menu").innerHTML=list.map(x=>{
    const q=cart[x.id]||0;
    return '<article class="card"><div class="food">'+x.icon+'</div><div><small>'+x.cat+'</small><h3>'+x.name+'</h3><p>'+x.desc+'</p></div><div class="card-bottom"><strong>$'+x.price.toFixed(2)+'</strong><div class="qty">'+(q?'<button data-minus="'+x.id+'">−</button><strong>'+q+'</strong>':"")+'<button data-plus="'+x.id+'">+</button></div></div></article>';
  }).join("");
  document.querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>{cart[b.dataset.plus]=(cart[b.dataset.plus]||0)+1;renderMenu();renderCart()});
  document.querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>{cart[b.dataset.minus]=Math.max(0,(cart[b.dataset.minus]||0)-1);renderMenu();renderCart()});
}
function count(){return Object.values(cart).reduce((a,b)=>a+b,0)}
function total(){return items.reduce((s,x)=>s+x.price*(cart[x.id]||0),0)}
function renderCart(){
  const c=count(),chosen=items.filter(x=>cart[x.id]);
  document.querySelector("#cartCount").textContent=c+" item"+(c===1?"":"s");
  document.querySelector("#cart").innerHTML=chosen.length
    ?chosen.map(x=>'<div class="cart-row"><span><strong>'+cart[x.id]+'×</strong> '+x.name+'</span><span>$'+(x.price*cart[x.id]).toFixed(2)+"</span></div>").join("")
    :'<p class="empty">Add an item to begin.</p>';
  document.querySelector("#total").textContent="$"+total().toFixed(2);
  document.querySelector("#complete").disabled=!c;
}
function openKiosk(){document.querySelector("#kiosk").classList.remove("hidden")}
document.querySelector("#close").onclick=()=>document.querySelector("#kiosk").classList.add("hidden");
document.querySelectorAll("[data-pickup]").forEach(b=>b.onclick=()=>{
  pickup=b.dataset.pickup;
  document.querySelectorAll("[data-pickup]").forEach(x=>{
    x.classList.toggle("active",x===b);
    x.querySelector("span").textContent=x===b?"✓":"";
  });
});
document.querySelector("#complete").onclick=()=>{
  document.querySelector(".kiosk-grid").classList.add("hidden");
  document.querySelector("#done").classList.remove("hidden");
  document.querySelector("#receipt").innerHTML="<span>Pickup method</span><strong>"+pickup+"</strong><span>Demo items</span><strong>"+count()+"</strong><span>Sample total</span><strong>$"+total().toFixed(2)+"</strong>";
};
document.querySelector("#restart").onclick=()=>{
  cart={};renderMenu();renderCart();
  document.querySelector("#done").classList.add("hidden");
  document.querySelector(".kiosk-grid").classList.remove("hidden");
};

setMode("inside");
renderCats();renderMenu();renderCart();