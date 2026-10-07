/* Original procedural motherboard model. No manufacturer model or dimensions claimed. */
import * as THREE from './vendor/three-0.160.1.module.min.js';
export function mountPreview(host, form) {
 const en=document.documentElement.lang==='en',t=(fr,english)=>en?english:fr;
 host.innerHTML=`<p>${t('Glissez pour tourner la carte mère. Boutons ou flèches pour tourner, +/− pour zoomer. Le modèle de base est visible même sans sélection.','Drag to rotate the motherboard. Use buttons or arrow keys to rotate, +/− to zoom. The reference model is visible even without a selection.')}</p><div class="motherboard-stage" tabindex="0" role="group" aria-label="${t('Carte mère générique en 3D','Generic motherboard in 3D')}"></div><div class="preview-controls"></div><p class="preview-view-status" role="status"></p><p class="preview-count" role="status"></p><ul class="preview-legend"></ul>`;
 const stage=host.querySelector('.motherboard-stage'),controls=host.querySelector('.preview-controls');
 let renderer;
 try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});} catch {throw Error('WebGL unavailable');}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(700,480);renderer.setClearColor(0x080a0e);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 renderer.domElement.setAttribute('aria-hidden','true');stage.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,700/480,.1,50),board=new THREE.Group();scene.add(board);
 scene.add(new THREE.HemisphereLight(0xe4eaff,0x192231,2.3));
 const key=new THREE.DirectionalLight(0xffffff,3.8);key.position.set(-3,5,6);scene.add(key);
 const fill=new THREE.DirectionalLight(0x858dff,1.5);fill.position.set(4,-2,3);scene.add(fill);
 const rim=new THREE.DirectionalLight(0x82dfd0,1.5);rim.position.set(-4,-1,-3);scene.add(rim);
 const mat=(color,metalness=.1,roughness=.65)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const pcb=mat(0x20252a,.2,.85),black=mat(0x111419,.2,.7),silver=mat(0xb6bcc4,.82,.3),darkMetal=mat(0x373e48,.75,.45),gold=mat(0xc8a46a,.72,.4),white=mat(0xd1d6df,.2,.7),purple=mat(0x7454dc,.4,.4);
 function box(w,h,d,x,y,z,material=black,parent=board){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 function cylinder(r,depth,x,y,z,material=silver,parent=board){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,depth,24),material);mesh.rotation.x=Math.PI/2;mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 function ring(radius,tube,x,y,z,material=gold){const mesh=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,8,28),material);mesh.position.set(x,y,z);board.add(mesh);return mesh;}
 function label(text,x,y,z,w=.45,h=.12){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.font='bold 58px Arial';ctx.fillStyle='#d8dce2';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));mesh.position.set(x,y,z);board.add(mesh);}
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
 // Optional selected components; remain generic, independent of product dimensions.
 const installed=new THREE.Group();board.add(installed);const cpuGroup=new THREE.Group(),ramGroup=new THREE.Group(),ssdGroup=new THREE.Group();installed.add(cpuGroup,ramGroup,ssdGroup);
 box(.43,.45,.025,-.2,.54,.127,silver,cpuGroup);
 for(let i=0;i<2;i++){box(.026,1.22,.14,.43+i*.27,.68,.192,black,ramGroup);box(.035,1.17,.028,.43+i*.27,.68,.275,purple,ramGroup);}
 box(.57,.16,.025,-.1,-.28,.155,pcb,ssdGroup);for(let i=0;i<3;i++)box(.115,.09,.014,-.29+i*.18,-.28,.175,black,ssdGroup);
 let pitch=-.13,yaw=-.3,distance=6.3,drag=null,showInstalled=false;
 function render(){board.rotation.set(pitch,yaw,0);camera.position.set(0,0,distance);camera.lookAt(0,0,0);renderer.render(scene,camera);stage.dataset.previewYaw=String(yaw);stage.dataset.previewZoom=String(distance);}
 function move(dx=0,dy=0,dz=0){yaw+=dx;pitch=Math.max(-1.25,Math.min(1.25,pitch+dy));distance=Math.max(4.1,Math.min(9,distance+dz));render();}
 const actions=[['←',t('Tourner à gauche','Rotate left'),()=>move(-.16)],['→',t('Tourner à droite','Rotate right'),()=>move(.16)],['↑',t('Tourner vers le haut','Rotate up'),()=>move(0,-.12)],['↓',t('Tourner vers le bas','Rotate down'),()=>move(0,.12)],['+',t('Zoom avant','Zoom in'),()=>move(0,0,-.4)],['−',t('Zoom arrière','Zoom out'),()=>move(0,0,.4)],[t('Recentrer','Reset view'),t('Recentrer la vue','Reset view'),()=>{pitch=-.13;yaw=-.3;distance=6.3;render();}]];
 for(const [text,label,action] of actions){const button=document.createElement('button');button.type='button';button.className='shop-button secondary';button.textContent=text;button.setAttribute('aria-label',label);button.addEventListener('click',action);controls.append(button);}
 const overlay=document.createElement('button');overlay.type='button';overlay.className='shop-button secondary';overlay.textContent=t('Afficher CPU / RAM / SSD sélectionnés','Show selected CPU / RAM / SSD');overlay.setAttribute('aria-pressed','false');overlay.addEventListener('click',()=>{showInstalled=!showInstalled;overlay.setAttribute('aria-pressed',String(showInstalled));update();});controls.append(overlay);
 stage.addEventListener('keydown',event=>{const commands={ArrowLeft:()=>move(-.16),ArrowRight:()=>move(.16),ArrowUp:()=>move(0,-.12),ArrowDown:()=>move(0,.12),'+':()=>move(0,0,-.4),'=':()=>move(0,0,-.4),'-':()=>move(0,0,.4)};if(commands[event.key]){event.preventDefault();commands[event.key]();}});
 stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={x:event.clientX,y:event.clientY};stage.setPointerCapture(event.pointerId);stage.focus({preventScroll:true});});stage.addEventListener('pointermove',event=>{if(!drag)return;move((event.clientX-drag.x)*.009,-(event.clientY-drag.y)*.007);drag={x:event.clientX,y:event.clientY};});for(const type of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(type,()=>drag=null);
 const products=new Map(JSON.parse(document.getElementById('builder-products').textContent).map(p=>[p.id,p]));
 function update(){cpuGroup.visible=showInstalled&&products.get(form.elements.cpu.value)?.category==='cpu';ramGroup.visible=showInstalled&&products.get(form.elements.ram.value)?.category==='ram';const drive=products.get(form.elements.storage.value);ssdGroup.visible=showInstalled&&drive?.form_factor==='M.2 2280';stage.dataset.installedParts=[cpuGroup.visible?'cpu':'',ramGroup.visible?'ram':'',ssdGroup.visible?'storage':''].filter(Boolean).join(',');
 const labels={motherboard:t('Carte mère sélectionnée','Selected motherboard'),cpu:t('CPU sélectionné','Selected CPU'),ram:t('RAM sélectionnée','Selected RAM'),storage:t('Stockage sélectionné','Selected storage')};const list=host.querySelector('.preview-legend');list.replaceChildren();for(const [cat,label] of Object.entries(labels)){const p=products.get(form.elements[cat].value);if(p){const li=document.createElement('li');li.textContent=label+' : '+p.name;list.append(li);}}
 host.querySelector('.preview-count').textContent=t('Modèle générique détaillé. GPU, boîtier, alimentation et refroidisseur ne sont pas modélisés dans cette vue. Les pièces affichées ne changent pas de forme selon la référence choisie.','Detailed generic model. GPU, case, PSU and cooler are not modeled in this view. Displayed parts do not change shape to match the selected product reference.');render();}
 const observer=new ResizeObserver(()=>{if(!stage.clientWidth||!stage.clientHeight)return;renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();render();});observer.observe(stage);
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();host.querySelector('.preview-view-status').textContent=t('La vue 3D a été interrompue. Rechargez la page ; le configurateur reste utilisable.','The 3D view was interrupted. Reload the page; the builder remains usable.');});
 form.addEventListener('change',update);form.addEventListener('reset',()=>requestAnimationFrame(update));update();
}
