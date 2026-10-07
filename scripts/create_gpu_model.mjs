import * as T from 'three';
import {bladeGeometry,hardwareBox,save} from './model_geometry.mjs';
const model=new T.Group();model.name='NEXRIG original dual fan GPU';
const mat=(name,color,metalness,roughness)=>new T.MeshStandardMaterial({name,color,metalness,roughness});
const metal=mat('Brushed aluminium',0x76808a,.85,.28),edge=mat('Machined silver trim',0xc1c7cf,.86,.2),plastic=mat('Graphite polymer',0x191d23,.18,.39),bladeMat=mat('Satin fan blades',0x292e35,.3,.35),pcb=mat('Printed circuit board',0x183a32,.15,.75),copper=mat('Copper heatpipes',0xb77443,.8,.3),gold=mat('Gold contacts',0xcba94d,.85,.25),dark=mat('Black connector plastic',0x080a0d,.05,.6),purple=mat('Purple accents',0x7454ed,.5,.28);
function mesh(g,m,x=0,y=0,z=0){const a=new T.Mesh(g,m);a.position.set(x,y,z);model.add(a);return a;}
function box(w,h,d,x,y,z,m){return mesh(hardwareBox(w,h,d),m,x,y,z);}
function cylinder(r,depth,x,y,z,m){const a=mesh(new T.CylinderGeometry(r,r,depth,48),m,x,y,z);a.rotation.x=Math.PI/2;return a;}
function ring(r,t,x,y,z,m){return mesh(new T.TorusGeometry(r,t,12,64),m,x,y,z);}
function extrude(shape,depth,m,z){const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.012,bevelThickness:.012,curveSegments:40});return mesh(g,m,0,0,z);}
function rounded(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
// A contoured shroud with actual circular openings, not circles painted on a box.
const shroud=new T.Shape();shroud.moveTo(-1.36,-.39);shroud.lineTo(-1.18,-.54);shroud.lineTo(-.3,-.54);shroud.lineTo(-.18,-.49);shroud.lineTo(.3,-.49);shroud.lineTo(.45,-.54);shroud.lineTo(1.18,-.54);shroud.lineTo(1.36,-.36);shroud.lineTo(1.36,.4);shroud.lineTo(1.18,.54);shroud.lineTo(.3,.54);shroud.lineTo(.18,.49);shroud.lineTo(-.3,.49);shroud.lineTo(-.45,.54);shroud.lineTo(-1.18,.54);shroud.lineTo(-1.36,.36);shroud.closePath();
for(const x of [-.65,.65]){const hole=new T.Path();hole.absarc(x,0,.448,0,Math.PI*2,true);shroud.holes.push(hole);}
extrude(shroud,.12,plastic,.18);
const trim=rounded(2.76,1.12,.13),inner=new T.Path();inner.absarc(-.65,0,.465,0,Math.PI*2,true);trim.holes.push(inner);const inner2=new T.Path();inner2.absarc(.65,0,.465,0,Math.PI*2,true);trim.holes.push(inner2);extrude(trim,.016,metal,.162);
for(const x of [-.65,.65]){
 ring(.448,.014,x,0,.314,edge);ring(.42,.009,x,0,.307,dark);

 const rotor=new T.Group();rotor.name='Fan rotor';rotor.userData.fanRotor=true;rotor.position.set(x,0,.286);model.add(rotor);const fanMaterial=bladeMat.clone();fanMaterial.side=T.DoubleSide;
 model.updateMatrixWorld(true);for(const hub of [cylinder(.108,.063,x,0,.315,plastic),ring(.087,.004,x,0,.35,edge),cylinder(.028,.005,x,0,.351,purple)]){rotor.attach(hub);}
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const mark=box(.025,.006,.003,x+Math.cos(a)*.063,Math.sin(a)*.063,.351,dark);mark.rotation.z=a;rotor.attach(mark);}
 for(let i=0;i<9;i++){const blade=new T.Mesh(bladeGeometry(.438),fanMaterial);rotor.add(blade);blade.rotation.z=i*Math.PI*2/9;}
 for(let i=0;i<4;i++){const angle=i*Math.PI/2;const support=box(.43,.025,.023,x+Math.cos(angle)*.23,Math.sin(angle)*.23,.209,dark);support.rotation.z=angle;}
}
// Segmented real heatsink, copper pipe bends and exposed circuit board.
box(2.52,.94,.035,0,0,-.115,pcb);
for(let i=0;i<96;i++)box(.013,.87,.23,-1.23+i*.026,0,.024,metal);
for(let i=0;i<4;i++){
 const y=-.32+i*.21;const curve=new T.CatmullRomCurve3([new T.Vector3(-1.27,y,-.07),new T.Vector3(-1.36,y,.01),new T.Vector3(-1.23,y,.14),new T.Vector3(1.2,y,.14),new T.Vector3(1.34,y,.02),new T.Vector3(1.25,y,-.07)]);mesh(new T.TubeGeometry(curve,48,.022,10,false),copper);
}
const back=rounded(2.55,.95,.05);for(let i=0;i<9;i++){const h=new T.Path();const x=.28+i*.104;h.moveTo(x,-.3);h.lineTo(x+.037,-.3);h.lineTo(x+.037,.3);h.lineTo(x,.3);h.closePath();back.holes.push(h);}extrude(back,.018,metal,-.172);
for(let i=0;i<12;i++){box(.032,.045,.006,-1.19+i*.074,-.485,-.117,gold);box(.032,.045,.006,-1.19+i*.074,-.485,-.14,gold);}
box(.93,.092,.018,-.78,-.505,-.126,pcb);for(let i=0;i<31;i++)box(.019,.068,.005,-1.22+i*.028,-.51,-.111,gold);
for(let i=0;i<26;i++){const x=-1.15+(i%13)*.178,y=i<13?-.42:.42;box(.055,.02,.025,x,y,-.09,dark);box(.009,.022,.027,x-.026,y,-.089,edge);box(.009,.022,.027,x+.026,y,-.089,edge);}
// Power socket, recessed pin apertures and latch.
box(.27,.11,.13,.85,.52,-.024,dark);for(let r=0;r<2;r++)for(let c=0;c<4;c++){box(.042,.008,.034,.75+c*.064,.58,-.07+r*.063,gold);}box(.12,.023,.03,.85,.59,.019,plastic);
// Stainless expansion bracket and recognisable HDMI / DisplayPort shells.
box(.036,1.15,.46,-1.405,0,.058,metal);box(.17,.045,.12,-1.47,.56,.1,edge);box(.07,.1,.11,-1.42,-.6,.1,edge);
for(let i=0;i<4;i++){
 const y=-.36+i*.22;box(.06,.151,.122,-1.447,y,.049,edge);box(.063,.104,.078,-1.484,y,.049,dark);box(.066,.052,.045,-1.486,y,.047,plastic);for(let j=0;j<5;j++)box(.004,.009,.008,-1.522,y-.025+j*.012,.073,gold);
}
for(let i=0;i<12;i++)box(.041,.055,.02,-1.427,-.47+i*.081,.235,dark);
// Screws with inset drive slots, side rails and accent inlays.
for(const x of [-1.23,0,1.23])for(const y of [-.45,.45]){cylinder(.029,.02,x,y,.323,edge);box(.029,.006,.003,x,y,.335,dark);box(.006,.029,.003,x,y,.335,dark);cylinder(.029,.016,x,y,-.18,edge);}
for(const y of [-.51,.51]){box(1.02,.026,.014,0,y,.318,edge);box(.27,.026,.016,-1.02,y,.317,purple);box(.27,.026,.016,1.02,y,.317,purple);}
// Faceted corner guards, inset vent cuts and side screw bosses.
for(const sign of [-1,1])for(const y of [-.45,.45]){const guard=new T.Shape();const x=sign*1.2;guard.moveTo(x-sign*.13,y);guard.lineTo(x+sign*.11,y);guard.lineTo(x+sign*.11,y-Math.sign(y)*.16);guard.lineTo(x-sign*.03,y-Math.sign(y)*.08);guard.closePath();extrude(guard,.012,dark,.3);}
for(let i=0;i<5;i++){const rib=box(.017,.16,.012,-.07+i*.034,0,.325,metal);rib.rotation.z=-.3;}
for(let side of [-1,1])for(let i=0;i<12;i++){box(.1,.025,.14,-.99+i*.18,side*.512,.069,dark);}
// No brand logos or claims about a real product.
await save(model,process.argv[2] || 'nexrig-dual-fan-gpu.glb');
