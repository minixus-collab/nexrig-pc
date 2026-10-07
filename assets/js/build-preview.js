/* Original procedural motherboard model. No manufacturer model or dimensions claimed. */
import * as THREE from './vendor/three-0.160.1.module.min.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
export function mountPreview(host, form) {
 const en=document.documentElement.lang==='en',t=(fr,english)=>en?english:fr;
 host.innerHTML=`<p>${t('Glissez pour tourner votre PC ou une pièce. Boutons ou flèches pour tourner, +/− pour zoomer. Sélectionnez les composants pour les ajouter.','Drag to rotate your build or an individual part. Use buttons or arrow keys to rotate, +/− to zoom. Select components in the builder to add them.')}</p><div class="motherboard-stage" tabindex="0" role="group" aria-label="${t('PC et composants génériques en 3D','Generic PC and components in 3D')}"></div><div class="preview-controls"></div><p class="preview-view-status" role="status"></p><p class="preview-count" role="status"></p><ul class="preview-legend"></ul>`;
 const stage=host.querySelector('.motherboard-stage'),controls=host.querySelector('.preview-controls');
 let renderer;
 try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});} catch {throw Error('WebGL unavailable');}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(700,480);renderer.setClearColor(0x080a0e);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.domElement.setAttribute('aria-hidden','true');stage.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,700/480,.1,50),board=new THREE.Group();const root=new THREE.Group();scene.add(root);root.add(board);
 scene.add(new THREE.HemisphereLight(0xe4eaff,0x192231,1.35));
 const key=new THREE.DirectionalLight(0xffffff,2.8);key.position.set(-3,5,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:20});key.shadow.bias=-.0004;key.shadow.normalBias=.015;scene.add(key);
 const fill=new THREE.DirectionalLight(0x858dff,1.5);fill.position.set(4,-2,3);scene.add(fill);
 const rim=new THREE.DirectionalLight(0x82dfd0,1.5);rim.position.set(-4,-1,-3);scene.add(rim);const interiorLight=new THREE.PointLight(0xc4c2ff,1.5,4,2);interiorLight.position.set(-.35,1.05,.95);root.add(interiorLight);
 const mat=(color,metalness=.1,roughness=.65)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const pcb=mat(0x20252a,.2,.85),black=mat(0x111419,.2,.7),silver=mat(0xb6bcc4,.82,.3),darkMetal=mat(0x373e48,.75,.45),gold=mat(0xc8a46a,.72,.4),white=mat(0xd1d6df,.2,.7),purple=mat(0x7454dc,.4,.4);
 function box(w,h,d,x,y,z,material=black,parent=board){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 function cylinder(r,depth,x,y,z,material=silver,parent=board){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,depth,24),material);mesh.rotation.x=Math.PI/2;mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 function ring(radius,tube,x,y,z,material=gold){const mesh=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,8,28),material);mesh.position.set(x,y,z);board.add(mesh);return mesh;}
 function label(text,x,y,z,w=.45,h=.12,parent=board){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.font='bold 58px Arial';ctx.fillStyle='#d8dce2';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));mesh.position.set(x,y,z);parent.add(mesh);}
 box(2.44,3.05,.055,0,0,0,pcb);
 // Deterministic PCB traces and silkscreen rather than random textures.
 const textureCanvas=document.createElement('canvas');textureCanvas.width=1024;textureCanvas.height=1280;const ctx=textureCanvas.getContext('2d');ctx.fillStyle='#20252a';ctx.fillRect(0,0,1024,1280);ctx.strokeStyle='#3a4146';ctx.lineWidth=1.5;
 for(let i=0;i<115;i++){const x=35+(i*71)%920,y=35+(i*137)%1180;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+20,y);ctx.lineTo(x+55,y+35);ctx.lineTo(x+55,y+80);ctx.stroke();}
 ctx.strokeStyle='#697078';ctx.strokeRect(530,120,340,550);ctx.strokeRect(115,800,650,330);ctx.fillStyle='#a7adb7';ctx.font='18px Arial';for(let i=0;i<16;i++)ctx.fillText('R'+(101+i),50+(i*91)%840,60+(i*151)%1100);
 const texture=new THREE.CanvasTexture(textureCanvas);texture.colorSpace=THREE.SRGBColorSpace;const surface=new THREE.Mesh(new THREE.PlaneGeometry(2.44,3.05),new THREE.MeshStandardMaterial({map:texture,roughness:.86,metalness:.15}));surface.position.z=.03;board.add(surface);
 // Mounting holes, connector edges and rear I/O housing.
 for(const [x,y] of [[-1.09,1.4],[1.08,1.4],[-1.09,.15],[1.08,.15],[-1.09,-1.4],[1.08,-1.4],[.04,-1.4]]){cylinder(.043,.009,x,y,.037,black);ring(.053,.009,x,y,.041);}
 box(.33,1.32,.24,-1.045,.76,.16,darkMetal);box(.36,1.16,.02,-1.045,.8,.29,silver);label('NEXRIG',-1.04,.85,.304,.23,.08);
 for(let i=0;i<7;i++){box(.11,.12,.1,-1.23,1.26-i*.17,.14,silver);box(.025,.07,.068,-1.292,1.26-i*.17,.14,black);}
 // VRM heatsinks and visible fins, power stages and chokes.
 box(.83,.22,.2,-.45,1.24,.15,darkMetal);box(.018,.2,.2,-.45,1.24,.15,silver);
 for(let i=0;i<19;i++)box(.025,.2,.035,-.83+i*.043,1.24,.27,silver);
 box(.19,.88,.15,-.86,.54,.13,darkMetal);for(let i=0;i<17;i++)box(.16,.02,.03,-.86,.14+i*.048,.225,silver);
 for(let i=0;i<8;i++){box(.068,.072,.06,-.71+i*.102,1.02,.068,darkMetal);cylinder(.034,.07,-.71+i*.102,.92,.07);}
 for(let i=0;i<7;i++){box(.065,.07,.05,-.66,.81-i*.105,.066,darkMetal);cylinder(.028,.055,-.75,.81-i*.105,.065);}
 // CPU socket with contact field, retention frame, screws and lever.
 box(.66,.72,.045,-.2,.54,.066,black);box(.46,.48,.014,-.2,.54,.096,darkMetal);
 const pinGeometry=new THREE.BoxGeometry(.009,.009,.008),pins=new THREE.InstancedMesh(pinGeometry,gold,400),dummy=new THREE.Object3D();for(let r=0;r<20;r++)for(let c=0;c<20;c++){dummy.position.set(-.416+c*.0225,.326+r*.0225,.108);dummy.updateMatrix();pins.setMatrixAt(r*20+c,dummy.matrix);}board.add(pins);
 box(.055,.7,.022,-.51,.54,.108,silver);box(.055,.7,.022,.11,.54,.108,silver);box(.56,.045,.025,-.2,.885,.112,silver);box(.56,.045,.025,-.2,.195,.112,silver);
 for(const [x,y] of [[-.54,.92],[.14,.92],[-.54,.16],[.14,.16]]){cylinder(.036,.018,x,y,.05,darkMetal);ring(.026,.006,x,y,.066,silver);}
 box(.017,.72,.02,.18,.55,.11,silver);cylinder(.017,.025,.18,.93,.12,silver);label('CPU SOCKET',-.2,.04,.043,.43,.075);
 // Four detailed DIMM slots with contacts and latch ends.
 for(let slot=0;slot<4;slot++){const x=.43+slot*.135;box(.084,1.43,.09,x,.68,.082,slot%2?darkMetal:black);box(.014,1.31,.013,x,.68,.135,gold);for(const y of [-.074,1.434]){box(.09,.075,.115,x,y,.09,white);box(.043,.035,.025,x,y,.159,black);}}
 label('DDR MEMORY',.63,-.16,.043,.47,.075);
 // ATX power socket with pin apertures, CPU power sockets.
 box(.1,.59,.15,1.09,.49,.113,black);for(let r=0;r<12;r++)for(let c=0;c<2;c++)box(.018,.026,.006,1.065+c*.047,.235+r*.047,.192,darkMetal);
 box(.25,.09,.1,-.58,1.45,.082,black);for(let i=0;i<4;i++)box(.035,.025,.004,-.67+i*.055,1.45,.137,darkMetal);
 // Armoured PCIe slots and their release clips.
 for(const y of [-.45,-.94]){box(1.09,.105,.083,-.12,y,.08,silver);box(.95,.034,.009,-.12,y,.128,black);box(.035,.072,.055,.47,y,.107,white);for(let i=0;i<39;i++)box(.009,.018,.006,-.58+i*.024,y,.135,gold);}
 box(.35,.075,.055,-.53,-.71,.065,black);label('PCIe',-.85,-.45,.043,.19,.065);
 // M.2 shields and chipset heatsink with machined ridges.
 box(1.16,.21,.08,-.1,-.27,.08,darkMetal);box(1.12,.14,.012,-.1,-.27,.128,silver);for(const x of [-.63,.43])cylinder(.018,.012,x,-.27,.14,black);
 box(.82,.18,.07,-.24,-1.17,.08,darkMetal);box(.77,.13,.012,-.24,-1.17,.123,silver);
 box(.63,.66,.135,.66,-.86,.106,darkMetal);for(let i=0;i<13;i++)box(.025,.5,.025,.41+i*.039,-.86,.188,silver);label('NEXRIG',.66,-.66,.206,.42,.078);
 // CMOS battery, audio components, SATA sockets and headers.
 cylinder(.134,.035,-.9,-.74,.058,black);cylinder(.105,.019,-.9,-.74,.087,silver);ring(.113,.009,-.9,-.74,.096,darkMetal);
 for(let i=0;i<8;i++){cylinder(.028,.075,-1.06,-.38-i*.116,.07,gold);cylinder(.021,.005,-1.06,-.38-i*.116,.11,silver);}
 for(let i=0;i<4;i++){box(.095,.115,.095,1.1,-.54-i*.15,.092,black);box(.05,.07,.006,1.1,-.54-i*.15,.145,darkMetal);}
 for(let i=0;i<11;i++){box(.054,.09,.075,-.77+i*.14,-1.4,.072,black);box(.008,.056,.022,-.77+i*.14,-1.4,.122,gold);}
 const chips=[[-.88,-1.06,.16,.18],[.28,-1.26,.11,.11],[.19,-.7,.17,.16],[-.74,-.07,.14,.14],[.74,1.43,.22,.07]];for(const [x,y,w,h] of chips){box(w,h,.032,x,y,.051,black);for(let i=0;i<5;i++)box(.012,.01,.01,x-w/2-.012,y-h*.4+i*h*.2,.062,silver);}
 label('GENERIC ATX • ORIGINAL MODEL',-.19,-1.51,.042,.95,.055);
 // Back solder pads, standoffs and actual recessed USB / network ports.
 const backSurface=surface.clone();backSurface.rotation.y=Math.PI;backSurface.position.z=-.032;board.add(backSurface);
 for(let r=0;r<8;r++)for(let c=0;c<12;c++)cylinder(.01,.003,-.93+c*.16,-1.2+r*.31,-.038,gold);
 for(let i=0;i<4;i++){box(.17,.12,.06,-1.26,1.22-i*.22,.22,silver);box(.012,.083,.038,-1.352,1.22-i*.22,.22,black);for(let j=0;j<4;j++)box(.008,.009,.008,-1.36,1.19-i*.22+j*.02,.22,gold);}
 box(.19,.18,.08,-1.26,.28,.22,silver);box(.012,.13,.054,-1.364,.28,.22,black);
 // Angled VRM cover and machined accents.
 for(let i=0;i<5;i++){const stripe=box(.018,.23,.012,-1.11+i*.045,.85,.314,silver);stripe.rotation.z=-.32;}
 // Batch the board's many small details by material rather than issuing hundreds of draws.
 const boardBatches=new Map();for(const child of [...board.children]){if(!child.isMesh||child.isInstancedMesh)continue;child.updateMatrix();const geometry=child.geometry.clone().applyMatrix4(child.matrix);const expanded=geometry.index?geometry.toNonIndexed():geometry;const entry=boardBatches.get(child.material)||{geometry:[],nodes:[]};entry.geometry.push(expanded);entry.nodes.push(child);boardBatches.set(child.material,entry);}
 for(const [material,entry] of boardBatches){const geometry=mergeGeometries(entry.geometry);if(!geometry)continue;const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=!material.transparent;mesh.receiveShadow=!material.transparent;board.remove(...entry.nodes);board.add(mesh);const originals=new Set(entry.nodes.map(node=>node.geometry));originals.forEach(geometry=>geometry.dispose());}
 // Optional selected components; remain generic, independent of product dimensions.
 const installed=new THREE.Group();root.add(installed);const cpuGroup=new THREE.Group(),ramGroup=new THREE.Group(),ssdGroup=new THREE.Group();installed.add(cpuGroup,ramGroup,ssdGroup);
 box(.43,.45,.025,-.2,.54,.127,silver,cpuGroup);
 for(let i=0;i<2;i++){box(.026,1.22,.14,.43+i*.27,.68,.192,black,ramGroup);box(.035,1.17,.028,.43+i*.27,.68,.275,purple,ramGroup);}
 box(.57,.16,.025,-.1,-.28,.155,pcb,ssdGroup);for(let i=0;i<3;i++)box(.115,.09,.014,-.29+i*.18,-.28,.175,black,ssdGroup);
 const groups={motherboard:board,cpu:cpuGroup,ram:ramGroup,storage:ssdGroup};
 for(const cat of ['gpu','cooling','psu','case']){groups[cat]=new THREE.Group();root.add(groups[cat]);}
 function fan(parent,x,y,z,r){cylinder(r,.035,x,y,z,darkMetal,parent);cylinder(r*.22,.06,x,y,z+.04,black,parent);for(let i=0;i<9;i++){const angle=i*Math.PI*2/9;const blade=box(r*.55,r*.16,.018,x+Math.cos(angle)*r*.53,y+Math.sin(angle)*r*.53,z+.035,black,parent);blade.rotation.z=angle+.5;}const trim=new THREE.Mesh(new THREE.TorusGeometry(r*.92,.014,8,40),purple);trim.position.set(x,y,z+.06);parent.add(trim);}
 const gpu=groups.gpu;box(2.05,.75,.35,0,-.62,.58,darkMetal,gpu);box(2.14,.8,.04,0,-.62,.79,black,gpu);for(let i=0;i<3;i++)fan(gpu,-.67+i*.67,-.62,.84,.29);for(let i=0;i<38;i++)box(.025,.6,.19,-.96+i*.052,-.62,.56,silver,gpu);box(.08,.91,.4,-1.12,-.62,.6,silver,gpu);box(.7,.035,.09,0,-1.03,.52,gold,gpu);
 const cooler=groups.cooling;for(let i=0;i<20;i++)box(.68,.025,.53,-.2,.35+i*.031,.42,silver,cooler);for(let i=0;i<4;i++)cylinder(.035,.66,-.45+i*.16,.65,.43,gold,cooler);box(.72,.72,.08,-.2,.65,.74,black,cooler);fan(cooler,-.2,.65,.8,.32);
 const psu=groups.psu;box(1.2,.67,.84,-.3,-1.98,.38,darkMetal,psu);fan(psu,-.3,-1.98,.83,.28);for(let i=0;i<8;i++)box(.045,.4,.015,-.83+i*.065,-1.98,.815,black,psu);box(.15,.22,.05,.17,-1.98,.83,black,psu);
 const shell=groups.case;for(const x of [-1.38,1.38])for(const z of [-.2,1.12])box(.07,4.58,.07,x,-.35,z,silver,shell);for(const y of [1.94,-2.64])box(2.84,.08,1.4,0,y,.46,darkMetal,shell);box(.07,4.5,1.4,1.38,-.35,.46,black,shell);for(let i=0;i<3;i++){const front=new THREE.Group();front.rotation.y=Math.PI/2;front.position.set(1.44,1.1-i*1.16,.46);shell.add(front);fan(front,0,0,0,.46);}for(let i=0;i<18;i++)box(.015,4.2,.025,1.43,-.35,-.15+i*.073,darkMetal,shell);for(const x of [-1,1])box(.35,.12,.6,x,-2.74,.4,black,shell);
 const sata=new THREE.Group();groups.storage.add(sata);box(.69,.87,.09,.8,-1.89,.43,darkMetal,sata);box(.58,.6,.014,.8,-1.89,.49,silver,sata);
 const m2=ssdGroup.children.filter(child=>child!==sata);m2.forEach(mesh=>mesh.userData.storageType='m2');sata.userData.storageType='sata';
 const fallbackTemplates=new Map(Object.entries(groups).filter(([cat])=>cat!=='motherboard').map(([cat,group])=>[cat,group.children.map(child=>child.clone(true))]));
 const MODEL_VERSION='hardware-20261007-v2',modelCache=new Map(),attached=new Map();let loaderPromise;
 const variantFor=(cat,p)=>cat==='gpu'?'dual-fan-gpu':cat==='storage'?(p.form_factor==='M.2 2280'?'m2':p.drive_type==='HDD'?'hdd':'sata'):cat==='cooling'?(['aio','liquid'].includes(p.cooler_type)?'aio':'cooler'):cat;
 function loadModel(variant){if(modelCache.has(variant))return;const entry={state:'loading'};modelCache.set(variant,entry);
 loaderPromise ||= import('./vendor/GLTFLoader.js').then(({GLTFLoader})=>new GLTFLoader());
 loaderPromise.then(loader=>loader.loadAsync(new URL('../models/nexrig-'+variant+'.glb?v='+MODEL_VERSION,import.meta.url).href)).then(gltf=>{entry.state='ready';entry.model=gltf.scene;update();}).catch(()=>{entry.state='failed';loaderPromise=null;update();});}
 function attachModel(cat,variant,p){if(attached.get(cat)===variant)return;const entry=modelCache.get(variant);if(entry?.state!=='ready'){if(attached.has(cat)){groups[cat].clear();for(const child of fallbackTemplates.get(cat))groups[cat].add(child.clone(true));attached.delete(cat);}return;}
 const parent=groups[cat];parent.clear();const model=entry.model.clone(true);model.traverse(mesh=>{if(mesh.isMesh){mesh.castShadow=!mesh.material.transparent;mesh.receiveShadow=!mesh.material.transparent;}});parent.add(model);attached.set(cat,variant);
 if(cat==='cpu'){model.position.set(-.2,.54,.13);label('NEXRIG',-.2,.585,.171,.24,.045,parent);label('GENERIC CPU',-.2,.525,.171,.23,.024,parent);}
 if(cat==='gpu'){model.scale.setScalar(.78);model.position.set(-.03,-.62,.65);}
 if(cat==='ram'){model.position.set(.43,.68,.29);model.rotation.set(0,Math.PI/2,Math.PI/2);for(let i=1;i<4;i++){const stick=model.clone(true);stick.position.x=.43+i*.135;parent.add(stick);}}
 if(cat==='storage'){if(variant==='m2')model.position.set(-.1,-.28,.18);else model.position.set(.8,-1.98,.43);}
 if(cat==='cooling'){if(variant==='aio'){model.position.set(0,0,0);}else model.position.set(-.2,.54,.49);}
 if(cat==='psu'){model.position.set(-.3,-2.04,.42);label('MODULAR PSU',-.3,-2.04,.83,.63,.08,parent);}
 }

 const cables=new THREE.Group();root.add(cables);
 function cable(points,r=.014,color=0x232735){const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),28,r,8,false),mat(color,.15,.65));cables.add(mesh);return mesh;}
 const powerCables=[];for(let i=0;i<6;i++)powerCables.push(cable([[-.16+i*.031,-1.67,.45],[.22+i*.03,-1.5,.42],[1.17+i*.015,-1.2,.36],[1.22+i*.015,.16,.23],[1.08+i*.009,.37,.23]],.013,i%3?0x1b2029:0x675291));
 const gpuCables=[];for(let i=0;i<4;i++)gpuCables.push(cable([[.15+i*.025,-1.67,.49],[1.08+i*.016,-1.39,.78],[1.08+i*.016,-.78,.77],[.72+i*.016,-.63,.58]],.012));
 let pitch=-.17,yaw=-.55,distance=9,defaultDistance=9,drag=null,view='build',caseVisible=true,exploded=false,panelOpen=false;const viewCenter=new THREE.Vector3();
 const names={cpu:t('Processeur','CPU'),gpu:t('Carte graphique','Graphics card'),motherboard:t('Carte mère','Motherboard'),ram:'RAM',storage:t('Stockage','Storage'),cooling:t('Refroidissement','Cooler'),psu:t('Alimentation','Power supply'),case:t('Boîtier','Case')};
 const viewLabel=document.createElement('label');viewLabel.textContent=t('Vue 3D : ','3D view: ');const select=document.createElement('select');select.className='preview-part-select';select.setAttribute('aria-label',t('Pièce à inspecter','Part to inspect'));viewLabel.append(select);host.insertBefore(viewLabel,stage);
 for(const [cat,name] of Object.entries({build:t('PC complet','Complete build'),...names})){const option=document.createElement('option');option.value=cat;option.textContent=name;select.append(option);}
 select.addEventListener('change',()=>{view=select.value;distance=view==='build'?9:6.3;update();});
 function render(){root.rotation.set(pitch,yaw,0);root.position.copy(viewCenter).applyEuler(root.rotation).multiplyScalar(-1);camera.position.set(0,0,distance);camera.lookAt(0,0,0);renderer.render(scene,camera);stage.dataset.previewYaw=String(yaw);stage.dataset.previewZoom=String(distance);}
 function move(dx=0,dy=0,dz=0){yaw+=dx;pitch=Math.max(-1.25,Math.min(1.25,pitch+dy));distance=Math.max(.55,Math.min(16,distance+dz));render();}
 const actions=[['←',t('Tourner à gauche','Rotate left'),()=>move(-.16)],['→',t('Tourner à droite','Rotate right'),()=>move(.16)],['↑',t('Tourner vers le haut','Rotate up'),()=>move(0,-.12)],['↓',t('Tourner vers le bas','Rotate down'),()=>move(0,.12)],['+',t('Zoom avant','Zoom in'),()=>move(0,0,-.4)],['−',t('Zoom arrière','Zoom out'),()=>move(0,0,.4)],[t('Recentrer','Reset view'),t('Recentrer la vue','Reset view'),()=>{pitch=-.17;yaw=-.55;distance=defaultDistance;render();}]];
 for(const [text,label,action] of actions){const button=document.createElement('button');button.type='button';button.className='shop-button secondary';button.textContent=text;button.setAttribute('aria-label',label);button.addEventListener('click',action);controls.append(button);}
 function toggle(label,action){const button=document.createElement('button');button.type='button';button.className='shop-button secondary';button.textContent=label;button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>{action();update();});controls.append(button);return button;}
 const hideCase=toggle(t('Masquer le boîtier','Hide case'),()=>caseVisible=!caseVisible),explode=toggle(t('Vue éclatée','Exploded view'),()=>exploded=!exploded);
 const retryModels=document.createElement('button');retryModels.type='button';retryModels.className='shop-button secondary';retryModels.textContent=t('Réessayer les modèles','Retry models');retryModels.hidden=true;retryModels.addEventListener('click',()=>{for(const [key,entry] of modelCache)if(entry.state==='failed')modelCache.delete(key);update();});controls.append(retryModels);
 const sidePanel=toggle(t('Ouvrir le panneau latéral','Open side panel'),()=>panelOpen=!panelOpen);

 stage.addEventListener('keydown',event=>{const commands={ArrowLeft:()=>move(-.16),ArrowRight:()=>move(.16),ArrowUp:()=>move(0,-.12),ArrowDown:()=>move(0,.12),'+':()=>move(0,0,-.4),'=':()=>move(0,0,-.4),'-':()=>move(0,0,.4)};if(commands[event.key]){event.preventDefault();commands[event.key]();}});
 stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={x:event.clientX,y:event.clientY};stage.setPointerCapture(event.pointerId);stage.focus({preventScroll:true});});stage.addEventListener('pointermove',event=>{if(!drag)return;move((event.clientX-drag.x)*.009,-(event.clientY-drag.y)*.007);drag={x:event.clientX,y:event.clientY};});for(const type of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(type,()=>drag=null);
 const products=new Map(JSON.parse(document.getElementById('builder-products').textContent).map(p=>[p.id,p]));
 function update(){
 const selected={};for(const cat of Object.keys(groups))selected[cat]=products.get(form.elements[cat].value);
 if(view!=='build'&&!selected[view])view='build';select.value=view;
 const loading=[],failed=[];for(const [cat,p] of Object.entries(selected)){if(!p||cat==='motherboard')continue;const variant=variantFor(cat,p);loadModel(variant);const entry=modelCache.get(variant);stage.dataset[cat+'Model']=entry.state;stage.dataset[cat+'Variant']=variant;attachModel(cat,variant,p);if(entry.state==='loading')loading.push(names[cat]);if(entry.state==='failed')failed.push(names[cat]);}
 host.querySelector('.preview-view-status').textContent=failed.length?t('Modèles indisponibles (vue simplifiée) : ','Models unavailable (simplified view): ')+failed.join(', '):loading.length?t('Chargement des modèles : ','Loading models: ')+loading.join(', '):'';
 retryModels.hidden=!failed.length;sidePanel.disabled=view!=='build'&&view!=='case';sidePanel.setAttribute('aria-pressed',String(panelOpen));groups.case.traverse(mesh=>{if(mesh.material?.name==='Smoked side glass')mesh.visible=!panelOpen;});
 if(attached.has('gpu'))groups.gpu.children[0].rotation.x=view==='build'?Math.PI/2:0;
 if(attached.has('psu')){groups.psu.children[0].rotation.x=view==='build'?-Math.PI/2:0;groups.psu.children.slice(1).forEach(child=>child.visible=view==='build');}
 stage.dataset.ramModules=String(selected.ram?.modules||0);if(attached.has('ram')){groups.ram.children.forEach((module,i)=>{module.visible=i<Math.min(4,selected.ram?.modules||2);module.rotation.set(0,view==='build'?Math.PI/2:0,Math.PI/2);const count=Math.min(4,selected.ram?.modules||2);module.position.set(view==='build'?.43+i*(count>2?.135:.27):-(count-1)*.24+i*.48,.68,view==='build'?.29:.05);});}

 for(const option of select.options)option.disabled=option.value!=='build'&&!selected[option.value];
 const drive=selected.storage,isM2=drive?.form_factor==='M.2 2280';if(!attached.has('storage'))groups.storage.children.forEach(mesh=>mesh.visible=mesh.userData.storageType==='m2'?isM2:!isM2);
 root.rotation.set(0,0,0);root.position.set(0,0,0);
 let index=0;for(const [cat,group] of Object.entries(groups)){group.position.set(0,0,0);group.visible=!!selected[cat]&&(view==='build'||view===cat)&&(cat!=='case'||caseVisible||view==='case');if(exploded&&view==='build'&&cat!=='case'){group.position.x=(index%2?1:-1)*1.7;group.position.z=index*.24;index++;}}
 interiorLight.visible=(view==='build'||view==='case')&&!!selected.case;cables.visible=view==='build'&&!exploded;powerCables.forEach(mesh=>mesh.visible=!!selected.psu&&!!selected.motherboard);gpuCables.forEach(mesh=>mesh.visible=!!selected.psu&&!!selected.gpu);
 viewCenter.set(0,-.35,.35);if(view!=='build'){const bounds=new THREE.Box3();root.updateMatrixWorld(true);groups[view].traverseVisible(mesh=>{if(mesh.geometry){mesh.geometry.computeBoundingBox();bounds.union(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld));}});bounds.getCenter(viewCenter);const size=bounds.getSize(new THREE.Vector3());distance=Math.max(.65,Math.max(size.x/camera.aspect,size.y)*2.15+size.z*.7);}else if(exploded)distance=12;defaultDistance=distance;
 stage.dataset.installedParts=Object.keys(groups).filter(cat=>groups[cat].visible).join(',');stage.dataset.previewView=view;stage.dataset.exploded=String(exploded);
 hideCase.disabled=view!=='build';hideCase.setAttribute('aria-pressed',String(!caseVisible));explode.disabled=view!=='build';explode.setAttribute('aria-pressed',String(exploded));
 const list=host.querySelector('.preview-legend');list.replaceChildren();for(const [cat,p] of Object.entries(selected)){if(p){const li=document.createElement('li');li.textContent=names[cat]+' : '+p.name;list.append(li);}}
 host.querySelector('.preview-count').textContent=Object.values(selected).filter(Boolean).length?t('Pièces génériques : les références sont listées ci-dessous. Les formes, quantités, dimensions et emplacements sont illustratifs, sans validation de compatibilité.','Generic parts: selected references are listed below. Shapes, quantities, dimensions and placement are illustrative, without compatibility validation.'):t('Choisissez des pièces dans le configurateur pour les voir ici.','Choose components in the builder to see them here.');render();}
 const observer=new ResizeObserver(()=>{if(!stage.clientWidth||!stage.clientHeight)return;renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();update();});observer.observe(stage);
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();host.querySelector('.preview-view-status').textContent=t('La vue 3D a été interrompue. Rechargez la page ; le configurateur reste utilisable.','The 3D view was interrupted. Reload the page; the builder remains usable.');});
 form.addEventListener('change',update);form.addEventListener('reset',()=>requestAnimationFrame(update));update();
}
