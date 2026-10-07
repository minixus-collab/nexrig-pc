// Original generic hardware, authored for NEXRIG. Illustrative dimensions only.
import {T,M,box,cylinder,ring,plate,screw,wire,slot,rounded,fan,rgbRing,rgbBar,save} from './model_geometry.mjs';
import fs from 'node:fs';
const output=process.argv[2]||'.';fs.mkdirSync(output,{recursive:true});
const group=name=>{const g=new T.Group();g.name=name;return g;};
const emit=async(name,g)=>save(g,`${output}/nexrig-${name}.glb`);
// CPU: layered substrate, stepped nickel heatspreader, underside contact array.
const cpu=group('Original generic CPU');plate(cpu,.49,.51,.018,.012,0,0,-.026,M.pcb);plate(cpu,.44,.455,.022,.035,0,0,-.003,M.metal);plate(cpu,.365,.385,.012,.026,0,0,.023,M.silver);
for(let y=0;y<19;y++)for(let x=0;x<19;x++){if(x>5&&x<13&&y>5&&y<13)continue;cylinder(cpu,.0055,.002,-.216+x*.024,-.228+y*.025,-.03,M.gold,8);}
for(let i=0;i<12;i++){box(cpu,.012,.023,.012,-.135+i*.025,.23,-.006,M.black);box(cpu,.012,.023,.012,-.135+i*.025,-.23,-.006,M.black);}
for(let i=0;i<3;i++)box(cpu,.045,.025,.005,-.06+i*.06,0,-.035,M.metal);
// Subtle engraved lines, without pretending to be a branded chip.
for(let i=0;i<3;i++)box(cpu,.16-i*.025,.002,.001,0,-.08-i*.014,.038,M.metal);await emit('cpu',cpu);
// A memory module with real contact notches, IC packages, curved heatspreader and diffuser.
const ram=group('Original generic memory module');plate(ram,1.31,.285,.012,.006,0,0,-.012,M.pcb);
for(let side of [-1,1]){for(let i=0;i<8;i++){box(ram,.118,.115,.012,-.53+i*.15,-.004,side*.025,M.black);for(let j=0;j<4;j++){box(ram,.009,.014,.006,-.57+i*.15+j*.025,-.075,side*.025,M.silver);}}
 for(let i=0;i<53;i++){if(i===25||i===26)continue;box(ram,.013,.056,.002,-.621+i*.024,-.116,side*.014,M.gold);}
 plate(ram,1.22,.16,.015,.016,0,.04,side*.034,M.metal);for(let i=0;i<10;i++)box(ram,.028,.105,.004,-.52+i*.116,.042,side*.052,M.black);}
rgbBar(ram,1.19,.026,.06,0,.143,-.002);plate(ram,.49,.045,.002,.008,0,.05,.056,M.purple);for(const x of [-.61,.61])screw(ram,x,.092,.055,.01);await emit('ram',ram);
// M.2: exposed NAND, controller, keyed edge contacts and mounting screw notch.
const m2=group('Original generic M.2 SSD');plate(m2,.8,.22,.015,.01,0,0,-.01,M.pcb);for(let i=0;i<3;i++)box(m2,.16,.13,.023,-.18+i*.21,0,.012,M.black);box(m2,.11,.13,.02,-.32,0,.012,M.metal);
for(let i=0;i<15;i++){if(i===4||i===5)continue;box(m2,.042,.008,.002,-.379,-.095+i*.013,.01,M.gold);}ring(m2,.032,.009,.39,0,.006,M.gold);
for(let i=0;i<15;i++){box(m2,.012,.015,.012,-.3+i*.043,.094,.008,M.metal);box(m2,.012,.015,.012,-.3+i*.043,-.094,.008,M.metal);}await emit('m2',m2);
const sata=group('Original generic SATA SSD');plate(sata,.72,.9,.065,.028,0,0,-.032,M.black);plate(sata,.69,.87,.006,.025,0,0,.035,M.metal);plate(sata,.46,.36,.002,.018,0,.04,.042,M.black);plate(sata,.31,.025,.003,.008,0,.11,.045,M.purple);
for(const x of [-.28,.28])for(const y of [-.36,.36])screw(sata,x,y,.046,.018);for(let i=0;i<22;i++)box(sata,.019,.045,.004,-.26+i*.024,-.473,.008,M.gold);box(sata,.55,.055,.032,0,-.475,-.01,M.black);await emit('sata',sata);
const hdd=sata.clone();hdd.name='Original generic enclosed hard drive';plate(hdd,.63,.78,.034,.09,0,0,.048,M.silver);for(const x of [-.23,.23])for(const y of [-.29,.29])screw(hdd,x,y,.091,.024);ring(hdd,.2,.015,0,.09,.09,M.metal);plate(hdd,.19,.13,.002,.005,.08,-.22,.091,M.white);await emit('hdd',hdd);
// Tower cooler: stacked bevelled fins, heatpipe bends, mounting bars and open impeller.
const cooler=group('Original generic tower cooler');plate(cooler,.43,.39,.045,.04,0,0,-.32,M.copper);for(let i=0;i<27;i++)plate(cooler,.7,.02,.48,.007,0,-.32+i*.025,-.22,M.silver);
for(let i=0;i<4;i++){const x=-.22+i*.145;wire(cooler,[[x,-.28,-.3],[x-.05,-.39,-.23],[x-.09,-.3,-.08],[x-.09,.39,-.08],[x+.01,.42,-.08]],.026,M.copper);cylinder(cooler,.028,.025,x-.09,.38,-.08,M.silver);}
fan(cooler,0,0,.33,.365);for(const x of [-.37,.37])wire(cooler,[[x,-.28,.31],[x,-.31,.17],[x,-.3,-.14],[x,.3,-.14],[x,.31,.17],[x,.28,.31]],.009,M.metal);
box(cooler,.87,.045,.028,0,-.32,-.34,M.metal);for(const x of [-.39,.39])screw(cooler,x,-.32,-.316,.025);await emit('cooler',cooler);
// AIO variant: dual-fan radiator, fin channels, flexible tubes and pump block.
const aio=group('Original generic liquid cooler'),radiator=group('Radiator');aio.add(radiator);
plate(radiator,.94,1.96,.12,.05,0,0,-.15,M.black);for(let i=0;i<55;i++)box(radiator,.8,.012,.055,0,-.83+i*.031,-.01,M.metal);fan(radiator,0,-.49,.05,.43);fan(radiator,0,.49,.05,.43);radiator.scale.setScalar(.8);radiator.rotation.y=Math.PI/2;radiator.position.set(1.05,.44,.46);
const pump=group('Pump');pump.position.set(-.2,.54,.28);aio.add(pump);cylinder(pump,.24,.18,0,0,0,M.black);rgbRing(pump,.22,.022,0,0,.1);cylinder(pump,.15,.004,0,0,.101,M.metal);
for(let i=0;i<2;i++)wire(aio,[[-.07+i*.13,.66,.36],[.29+i*.09,1.12,.69],[.73+i*.075,1.16,.72],[1.0,.99,.35+i*.16]],.033,M.black);await emit('aio',aio);
// PSU: folded enclosure, open fan aperture and wire grille, rear socket/switch, modular sockets.
const psu=group('Original generic modular PSU');box(psu,1.26,.72,.84,0,0,-.05,M.black);const hole=new T.Path();hole.absarc(-.11,0,.294,0,Math.PI*2,true);plate(psu,1.29,.74,.016,.035,0,0,.38,M.metal,[hole]);fan(psu,-.11,0,.372,.293,{grille:true,frame:false,rgb:false});
for(const x of [-.58,.58])for(const y of [-.3,.3])screw(psu,x,y,.404,.018);
for(let i=0;i<7;i++)for(let j=0;j<4;j++){const socket=box(psu,.065,.04,.024,.37+i*.026,0,.423,M.black);socket.position.y=-.11+j*.072;}
// IEC recess and rocker on rear face, plus punched vents rather than drawn lines.
box(psu,.17,.23,.022,.38,.045,-.488,M.metal);box(psu,.125,.16,.026,.38,.045,-.503,M.black);box(psu,.11,.12,.025,.38,-.2,-.49,M.black);
for(let i=0;i<9;i++)for(let j=0;j<5;j++)cylinder(psu,.016,.01,-.52+i*.062,-.24+j*.12,-.48,M.metal,6);
for(let r=0;r<2;r++)for(let i=0;i<4;i++){box(psu,.17,.11,.025,-.4+i*.21,-.19+r*.27,-.484,M.metal);box(psu,.14,.08,.03,-.4+i*.21,-.19+r*.27,-.505,M.black);for(let j=0;j<3;j++)box(psu,.018,.026,.004,-.447+i*.21+j*.044,-.19+r*.27,-.523,M.gold);}
plate(psu,.64,.25,.002,.008,-.16,0,.392,M.black);await emit('psu',psu);
// Original mid tower: folded steel shell, glass panels and recessed front fascia.
// Wider side profile and deeper body keep the assembled hardware readable.
const pcCase=group('Original generic mid tower'),steel=M.casePanel.clone();steel.color.setHex(0x424a55);
const trim=M.metal.clone();trim.name='Case edge trim';trim.color.setHex(0x626b77);trim.roughness=.4;
const xCenter=.25,zCenter=.68,left=-1.42,right=1.92,top=1.80,bottom=-2.64;
// Sheet-metal roof and bottom, with actual elongated ventilation cutouts.
const roofHoles=[];for(let i=0;i<14;i++)roofHoles.push(slot(-.30,-.66+i*.094,1.72,.038));
for(const [y,holes] of [[top,roofHoles],[bottom,[]]]){const panel=plate(pcCase,3.55,1.90,.035,.055,xCenter,y,zCenter,steel,holes);panel.rotation.x=Math.PI/2;}
// Closed cable-side cover behind the motherboard, with a separate perimeter seam.
plate(pcCase,3.32,4.34,.035,.045,xCenter,-.40,-.275,steel);
for(const x of [left,right])box(pcCase,.10,4.39,.10,x,-.40,-.20,trim);
// Folded glass-side rails are broad enough to read as a real case frame.
for(const y of [1.73,-2.57])box(pcCase,3.45,.115,.10,xCenter,y,1.60,steel);
for(const x of [-1.39,1.89])box(pcCase,.105,4.28,.10,x,-.42,1.60,steel);
// Motherboard tray standoffs, cable-entry grommets and rear drive sled.
for(const [x,y] of [[-1.09,1.4],[1.08,1.4],[-1.09,-1.4],[1.08,-1.4]])cylinder(pcCase,.038,.16,x,y,-.13,M.gold);
for(const y of [.54,-.95]){plate(pcCase,.27,.57,.022,.065,1.18,y,-.195,M.black,[slot(0,0,.18,.48)]);for(let i=0;i<4;i++)box(pcCase,.15,.012,.012,1.18,y-.16+i*.11,-.164,M.black);}
plate(pcCase,.76,.99,.025,.04,.8,-1.99,-.18,M.metal);for(const x of [.48,1.12])for(const y of [-2.38,-1.6])screw(pcCase,x,y,-.148,.023);
// Solid PSU basement with a folded upper edge and small punched ventilation slots.
box(pcCase,3.20,.035,1.69,.20,-1.54,.66,steel);
const shroudVents=[];for(let i=0;i<14;i++)shroudVents.push(slot(-.99+i*.145,-.21,.062,.075));
plate(pcCase,3.25,.97,.025,.035,.23,-2.08,1.54,steel,shroudVents);
box(pcCase,3.24,.032,.048,.23,-1.58,1.55,trim);
// Recessed front intake fans sit behind a continuous fascia, not a wire cage.
for(let i=0;i<3;i++){const f=fan(pcCase,0,0,0,.56);f.rotation.y=Math.PI/2;f.position.set(1.84,.96-i*1.30,.70);}
const intakeHoles=[rounded(1.42,3.88,.07)];
for(const x of [-.817,.817])for(let i=0;i<25;i++)intakeHoles.push(slot(x,-1.80+i*.15,.070,.095));
const front=plate(pcCase,1.85,4.42,.070,.070,1.96,-.40,.70,steel,intakeHoles);front.rotation.y=Math.PI/2;
// Slim panel joints and side intake channels run along both edges of the fascia.
for(const z of [-.24,1.64])box(pcCase,.027,4.18,.035,1.965,-.40,z,M.black);
const accent=rgbBar(pcCase,3.92,.017,.021,2.041,-.40,1.476);accent.rotation.z=Math.PI/2;
// Rear wall has a fan opening, motherboard I/O aperture, expansion slots and PSU cutout.
const rearHoles=[slot(-.46,1.12,.30,1.34),slot(0,-1.75,1.22,.72)];
const exhaustHole=new T.Path();exhaustHole.absarc(.18,1.36,.47,0,Math.PI*2,true);rearHoles.push(exhaustHole);
for(let i=0;i<7;i++)rearHoles.push(slot(.15,-.02-i*.155,.88,.078));
const rear=plate(pcCase,1.82,4.35,.030,.035,-1.44,-.40,.69,steel,rearHoles);rear.rotation.y=-Math.PI/2;
const exhaust=fan(pcCase,0,0,0,.465,{rgb:false});exhaust.rotation.y=-Math.PI/2;exhaust.position.set(-1.36,.96,.87);
for(let i=0;i<7;i++){box(pcCase,.024,.022,.90,-1.474,-.36-i*.155,.84,trim);cylinder(pcCase,.021,.014,-1.47,-.36-i*.155,1.34,M.silver).rotation.y=Math.PI/2;}
// Four rounded supports with rubber contact pads, inset from the body edges.
for(const x of [-1.12,1.59])for(const z of [.03,1.28]){const foot=plate(pcCase,.34,.39,.14,.055,x,-2.70,z,steel);foot.rotation.x=Math.PI/2;box(pcCase,.29,.033,.34,x,-2.855,z-.02,M.black);}
// Top-front I/O: recessed USB sockets, audio jack and flush power switch.
for(const z of [.51,.78]){box(pcCase,.138,.014,.056,1.40,1.806,z,M.black);box(pcCase,.102,.009,.034,1.40,1.815,z,M.metal);box(pcCase,.080,.011,.020,1.40,1.821,z,M.black);}
cylinder(pcCase,.044,.014,1.40,1.810,1.10,trim).rotation.x=0;ring(pcCase,.034,.004,1.40,1.822,1.10,M.silver).rotation.x=Math.PI/2;
cylinder(pcCase,.019,.012,1.40,1.808,.97,M.black).rotation.x=0;
// The upper glass side panel fits inside the metal rails; the basement is steel.
const sideGlass=new T.MeshStandardMaterial({name:'Smoked side glass',color:0x758ba4,transparent:true,opacity:.13,roughness:.1,metalness:.1,depthWrite:false,side:T.DoubleSide});
const frontGlass=sideGlass.clone();frontGlass.name='Smoked front glass';
plate(pcCase,3.15,3.16,.008,.04,.25,.04,1.605,sideGlass);
const window=plate(pcCase,1.40,3.86,.008,.045,2.039,-.40,.70,frontGlass);window.rotation.y=Math.PI/2;
// Rubber glass seals, four low-profile fasteners and rear panel thumb screws.
for(const x of [-1.34,1.84])box(pcCase,.014,3.18,.016,x,.04,1.60,M.black);
for(const y of [-1.55,1.63])box(pcCase,3.18,.014,.016,.25,y,1.60,M.black);
for(const x of [-1.27,1.76])for(const y of [-1.46,1.54])screw(pcCase,x,y,1.624,.019);
for(const y of [1.45,-2.28]){cylinder(pcCase,.037,.033,-1.40,y,-.301,M.black);ring(pcCase,.028,.005,-1.40,y,-.320,trim);}
await emit('case',pcCase);
