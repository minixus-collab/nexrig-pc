/* Original CSS 3D geometry. Generic representations; no product dimensions inferred. */
export function mountPreview(host, form) {
  const en=document.documentElement.lang==='en',t=(fr,english)=>en?english:fr;
  const products=new Map(JSON.parse(document.getElementById('builder-products').textContent).map(p=>[p.id,p]));
  const labels={case:t('Boîtier','Case'),motherboard:t('Carte mère','Motherboard'),cpu:t('Processeur','Processor'),ram:t('RAM','RAM'),gpu:t('Carte graphique','Graphics card'),storage:t('Stockage','Storage'),psu:t('Alimentation','Power supply'),cooling:t('Refroidissement CPU','CPU cooling')};
  host.innerHTML=`<p>${t('Glissez pour tourner. Utilisez les boutons pour tourner et zoomer, ou les flèches et +/− lorsque la vue est sélectionnée.','Drag to rotate. Use the buttons to rotate and zoom, or arrow keys and +/− when the view is focused.')}</p><div class="preview-stage" tabindex="0" role="group" aria-label="${t('Vue 3D générique de la configuration','Generic 3D view of your build')}"><div class="preview-model" aria-hidden="true"></div></div><div class="preview-controls"></div><p class="preview-count" role="status"></p><ul class="preview-legend"></ul>`;
  const stage=host.querySelector('.preview-stage'),model=host.querySelector('.preview-model'),controls=host.querySelector('.preview-controls');
  const definitions={case:[200,300,160,0,0,0],motherboard:[145,200,6,-10,-20,-66],cpu:[36,36,8,-18,-65,-57],ram:[18,95,12,48,-55,-52],gpu:[155,30,100,-10,40,-2],storage:[42,62,8,-62,75,-57],psu:[145,45,120,-10,120,0],cooling:[65,65,65,-18,-65,-17]};
  const shapes=new Map();
  for(const [cat,[w,h,d,x,y,z]] of Object.entries(definitions)){
    const box=document.createElement('div');box.className=`preview-box preview-${cat}`;box.dataset.previewPart=cat;
    Object.entries({'--w':w+'px','--h':h+'px','--d':d+'px','--x':x+'px','--y':y+'px','--z':z+'px'}).forEach(([key,value])=>box.style.setProperty(key,value));
    for(const face of ['front','back','left','right','top','bottom']){const el=document.createElement('div');el.className=`preview-face preview-${face}`;if(face==='front'&&cat!=='case')el.textContent=cat==='motherboard'?'PCB':cat==='cooling'?'FAN':cat.toUpperCase();box.append(el);}
    model.append(box);shapes.set(cat,box);
  }
  let pitch=-12,yaw=-32,zoom=1,drag=null;
  function paint(){model.style.transform=`scale(${zoom}) rotateX(${pitch}deg) rotateY(${yaw}deg)`;}
  function move(dx=0,dy=0,dz=0){yaw+=dx;pitch=Math.max(-65,Math.min(65,pitch+dy));zoom=Math.max(.65,Math.min(1.35,zoom+dz));paint();}
  const actions=[['←',t('Tourner à gauche','Rotate left'),()=>move(-20)],['→',t('Tourner à droite','Rotate right'),()=>move(20)],['↑',t('Tourner vers le haut','Rotate up'),()=>move(0,-15)],['↓',t('Tourner vers le bas','Rotate down'),()=>move(0,15)],['+',t('Zoom avant','Zoom in'),()=>move(0,0,.1)],['−',t('Zoom arrière','Zoom out'),()=>move(0,0,-.1)],[t('Recentrer','Reset view'),t('Recentrer la vue','Reset view'),()=>{pitch=-12;yaw=-32;zoom=1;paint();}]];
  for(const [text,label,action] of actions){const button=document.createElement('button');button.type='button';button.className='shop-button secondary';button.textContent=text;button.setAttribute('aria-label',label);button.addEventListener('click',action);controls.append(button);}
  stage.addEventListener('keydown',event=>{const commands={ArrowLeft:()=>move(-20),ArrowRight:()=>move(20),ArrowUp:()=>move(0,-15),ArrowDown:()=>move(0,15),'+':()=>move(0,0,.1),'=':()=>move(0,0,.1),'-':()=>move(0,0,-.1)};if(commands[event.key]){event.preventDefault();commands[event.key]();}});
  stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={x:event.clientX,y:event.clientY};stage.setPointerCapture(event.pointerId);stage.focus({preventScroll:true});});
  stage.addEventListener('pointermove',event=>{if(!drag)return;move((event.clientX-drag.x)*.5,-(event.clientY-drag.y)*.4);drag={x:event.clientX,y:event.clientY};});
  const stop=()=>{drag=null;};stage.addEventListener('pointerup',stop);stage.addEventListener('pointercancel',stop);stage.addEventListener('lostpointercapture',stop);
  function update(){const list=host.querySelector('.preview-legend');list.replaceChildren();let count=0;
    for(const [cat,box] of shapes){const p=products.get(form.elements[cat].value);const shown=p?.category===cat;box.hidden=!shown;if(shown){count++;const li=document.createElement('li');li.textContent=labels[cat]+' : '+p.name;list.append(li);}}
    host.querySelector('.preview-count').textContent=`${count} / 8 `+t('pièces représentées','parts represented');
  }
  form.addEventListener('change',update);form.addEventListener('reset',()=>requestAnimationFrame(update));paint();update();
}
