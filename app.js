import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const canvas=document.querySelector("#world"),renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,100);
scene.background=new THREE.Color("#b9d2d5");scene.fog=new THREE.Fog("#b9d2d5",12,32);camera.position.set(0,2.5,8.7);
scene.add(new THREE.HemisphereLight(0xffffff,0x676057,2.2));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(5,9,6);sun.castShadow=true;scene.add(sun);
const outside=new THREE.Group(),inside=new THREE.Group();scene.add(outside,inside);inside.visible=false;
const M=(c,r=.65,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
function box(w,h,d,c,x,y,z,g){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;(g||outside).add(o);return o}
function floor(w,d,c,g){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,d),M(c,.9));o.rotation.x=-Math.PI/2;o.position.y=-.08;o.receiveShadow=true;(g||outside).add(o);return o}

floor(30,30,"#aaa69e");box(9.6,3.8,3.7,"#3c3b39",0,1.9,0);box(9.3,.24,.32,"#ffc72c",0,3.75,1.8);box(9,.2,.18,"#171716",0,3.55,1.9);
const glass=new THREE.MeshPhysicalMaterial({color:"#80a2aa",transparent:true,opacity:.65,roughness:.12});
[-1.6,.2].forEach(function(x){const w=new THREE.Mesh(new THREE.BoxGeometry(1.65,1.75,.07),glass);w.position.set(x,1.55,1.9);outside.add(w)});
const door=box(1.55,2.6,.1,"#20201e",2.45,1.45,1.9);door.userData.action="enter";
const dg=new THREE.Mesh(new THREE.BoxGeometry(1.18,2.25,.03),glass);dg.position.set(2.45,1.45,1.97);dg.userData.action="enter";outside.add(dg);
[-.33,.33].forEach(function(x){const a=new THREE.Mesh(new THREE.TorusGeometry(.43,.09,18,40,Math.PI),M("#ffc72c",.3,.1));a.rotation.z=Math.PI;a.position.set(x,3.1,2.08);outside.add(a)});
[-3.8,-1.8,.3,4].forEach(function(x,i){const s=new THREE.Mesh(new THREE.SphereGeometry(.42,16,16),M("#536142"));s.position.set(x,.43,3.1+(i%2)*.3);outside.add(s)});

floor(18,18,"#d5cab9",inside);box(13,5,.35,"#282725",0,2.5,-5.2,inside);box(13,.22,11,"#e9e1d5",0,4.65,0,inside);
[-2.6,0,2.6].forEach(function(x){box(2.2,1.25,.08,"#171716",x,1.6,-4.95,inside)});
box(2.3,1,.8,"#5a5047",0,.6,-3.8,inside);
[-2.1,0,2.1].forEach(function(x){box(1.25,2.3,.46,"#242422",x,1.35,-.7,inside);const s=new THREE.Mesh(new THREE.PlaneGeometry(.92,1.15),new THREE.MeshStandardMaterial({color:"#f3c332",emissive:"#ffc72c",emissiveIntensity:.18}));s.position.set(x,1.69,-.455);s.userData.action="kiosk";inside.add(s);box(.72,.18,.08,"#d62828",x,.69,-.44,inside)});
const exit=box(1.2,2.7,.12,"#52777d",-5.7,1.45,3.1,inside);exit.userData.action="exit";

let mode="outside",move={x:0,z:0};const target=new THREE.Vector3(),ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
function setMode(next){mode=next;outside.visible=next==="outside";inside.visible=next==="inside";move={x:0,z:0};scene.background.set(next==="outside"?"#b9d2d5":"#e6ded1");scene.fog.color.copy(scene.background);document.querySelector("#tag").textContent=next==="outside"?"STOREFRONT":"RESTAURANT INTERIOR";document.querySelector("#headline").textContent=next==="outside"?"Don’t open a menu. Enter the restaurant.":"Walk up to a kiosk and order inside the experience.";document.querySelector("#subhead").textContent=next==="outside"?"A proof-of-concept for replacing a flat restaurant webpage with an explorable storefront and in-room ordering kiosk.":"Tap a yellow kiosk screen or use the ordering button. Move with the pad, arrow keys, or WASD.";document.querySelector("#enter").classList.toggle("hidden",next!=="outside");document.querySelector("#order").classList.toggle("hidden",next!=="inside");document.querySelector("#outside").classList.toggle("hidden",next!=="inside")}
function nudge(x,z){move.x=THREE.MathUtils.clamp(move.x+x,-3.8,3.8);move.z=THREE.MathUtils.clamp(move.z+z,-2.2,1.8)}
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener("resize",resize);resize();
(function loop(){target.set(move.x,mode==="outside"?2.5:2.25,(mode==="outside"?8.7:5.2)+move.z);camera.position.lerp(target,.08);camera.lookAt(mode==="outside"?0:move.x*.14,1.6,mode==="outside"?0:-2.2);renderer.render(scene,camera);requestAnimationFrame(loop)})();
canvas.addEventListener("pointerdown",function(e){pointer.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(pointer,camera);const h=ray.intersectObjects(scene.children,true).find(function(x){return x.object.userData.action});if(!h)return;if(h.object.userData.action==="enter")setMode("inside");if(h.object.userData.action==="exit")setMode("outside");if(h.object.userData.action==="kiosk")openKiosk()});
document.querySelector("#enter").onclick=function(){setMode("inside")};document.querySelector("#outside").onclick=function(){setMode("outside")};document.querySelector("#order").onclick=openKiosk;
document.querySelectorAll("[data-move]").forEach(function(b){b.onclick=function(){const m=b.dataset.move;if(m==="up")nudge(0,-.4);if(m==="down")nudge(0,.4);if(m==="left")nudge(-.4,0);if(m==="right")nudge(.4,0);if(m==="reset")move={x:0,z:0}}});
addEventListener("keydown",function(e){if(!document.querySelector("#kiosk").classList.contains("hidden"))return;const k=e.key.toLowerCase();if(k==="w"||e.key==="ArrowUp")nudge(0,-.35);if(k==="s"||e.key==="ArrowDown")nudge(0,.35);if(k==="a"||e.key==="ArrowLeft")nudge(-.35,0);if(k==="d"||e.key==="ArrowRight")nudge(.35,0)});

const items=[
{id:"big",name:"Big Mac",cat:"Burgers",desc:"Two beef patties, sauce, lettuce, cheese, pickles and onions.",price:5.99,icon:"🍔"},
{id:"nug",name:"10 pc. McNuggets",cat:"Chicken",desc:"Crispy chicken nuggets with dipping sauce.",price:6.49,icon:"🍗"},
{id:"fries",name:"World Famous Fries",cat:"Sides",desc:"Golden crispy fries. Demo size: medium.",price:3.49,icon:"🍟"},
{id:"coffee",name:"McCafé Iced Coffee",cat:"Drinks",desc:"Cold coffee drink. Demo size: medium.",price:2.79,icon:"🥤"},
{id:"egg",name:"Egg McMuffin",cat:"Breakfast",desc:"Egg, Canadian bacon and cheese on an English muffin.",price:4.59,icon:"🥪"},
{id:"shake",name:"Vanilla Shake",cat:"Sweets",desc:"Creamy vanilla shake. Demo size: medium.",price:3.99,icon:"🥛"}];
let active="All",cart={},pickup="Front Counter";const cats=["All"].concat(Array.from(new Set(items.map(function(x){return x.cat}))));
function renderCats(){document.querySelector("#cats").innerHTML=cats.map(function(c){return '<button class="'+(c===active?"active":"")+'" data-cat="'+c+'">'+c+"</button>"}).join("");document.querySelectorAll("[data-cat]").forEach(function(b){b.onclick=function(){active=b.dataset.cat;renderCats();renderMenu()}})}
function renderMenu(){const list=active==="All"?items:items.filter(function(x){return x.cat===active});document.querySelector("#menu").innerHTML=list.map(function(x){const q=cart[x.id]||0;return '<article class="card"><div class="food">'+x.icon+'</div><div><small>'+x.cat+'</small><h3>'+x.name+'</h3><p>'+x.desc+'</p></div><div class="card-bottom"><strong>$'+x.price.toFixed(2)+'</strong><div class="qty">'+(q?'<button data-minus="'+x.id+'">−</button><strong>'+q+'</strong>':"")+'<button data-plus="'+x.id+'">+</button></div></div></article>'}).join("");document.querySelectorAll("[data-plus]").forEach(function(b){b.onclick=function(){cart[b.dataset.plus]=(cart[b.dataset.plus]||0)+1;renderMenu();renderCart()}});document.querySelectorAll("[data-minus]").forEach(function(b){b.onclick=function(){cart[b.dataset.minus]=Math.max(0,(cart[b.dataset.minus]||0)-1);renderMenu();renderCart()}})}
function count(){return Object.values(cart).reduce(function(a,b){return a+b},0)}function total(){return items.reduce(function(s,x){return s+x.price*(cart[x.id]||0)},0)}
function renderCart(){const c=count(),chosen=items.filter(function(x){return cart[x.id]});document.querySelector("#cartCount").textContent=c+" item"+(c===1?"":"s");document.querySelector("#cart").innerHTML=chosen.length?chosen.map(function(x){return '<div class="cart-row"><span><strong>'+cart[x.id]+'×</strong> '+x.name+'</span><span>$'+(x.price*cart[x.id]).toFixed(2)+"</span></div>"}).join(""):'<p class="empty">Add an item to begin.</p>';document.querySelector("#total").textContent="$"+total().toFixed(2);document.querySelector("#complete").disabled=!c}
function openKiosk(){document.querySelector("#kiosk").classList.remove("hidden")}
document.querySelector("#close").onclick=function(){document.querySelector("#kiosk").classList.add("hidden")};
document.querySelectorAll("[data-pickup]").forEach(function(b){b.onclick=function(){pickup=b.dataset.pickup;document.querySelectorAll("[data-pickup]").forEach(function(x){x.classList.toggle("active",x===b);x.querySelector("span").textContent=x===b?"✓":""})}});
document.querySelector("#complete").onclick=function(){document.querySelector(".kiosk-grid").classList.add("hidden");document.querySelector("#done").classList.remove("hidden");document.querySelector("#receipt").innerHTML="<span>Pickup method</span><strong>"+pickup+"</strong><span>Demo items</span><strong>"+count()+"</strong><span>Sample total</span><strong>$"+total().toFixed(2)+"</strong>"};
document.querySelector("#restart").onclick=function(){cart={};renderMenu();renderCart();document.querySelector("#done").classList.add("hidden");document.querySelector(".kiosk-grid").classList.remove("hidden")};
renderCats();renderMenu();renderCart();