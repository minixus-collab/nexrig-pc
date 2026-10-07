/* Component selector: catalogue prices, limited checks, shared demo cart. */
(()=>{
 'use strict';
 const form=document.getElementById('pc-selector');if(!form)return;
 const en=document.documentElement.lang==='en', cats=['cpu','gpu','motherboard','ram','storage','cooling','psu','case'];
 const products=new Map(JSON.parse(document.getElementById('builder-products').textContent).map(p=>[p.id,p]));
 const text=(fr,english)=>en?english:fr, key='nexrig.demo-build.v1';
 const money=n=>new Intl.NumberFormat(en?'en-MA':'fr-MA',{style:'currency',currency:'MAD',maximumFractionDigits:0}).format(n);
 const add=document.getElementById('build-add'), status=document.getElementById('build-status');
 function selection(){return Object.fromEntries(cats.map(cat=>[cat,products.get(form.elements[cat].value)]));}
 function checks(s){const errors=[], notes=[];
  if(s.cpu&&s.motherboard){if(s.cpu.socket!==s.motherboard.socket)errors.push(text('Socket CPU et carte mère incompatible.','CPU and motherboard sockets do not match.'));else notes.push(text('Socket CPU/carte mère correspondant ; BIOS à vérifier.','CPU/motherboard sockets match; check BIOS support.'));}
  if(s.ram&&s.motherboard){if(s.ram.memory_generation!==s.motherboard.memory_generation)errors.push(text('Type de RAM incompatible avec la carte mère.','RAM type does not match the motherboard.'));else notes.push(text('Type de RAM correspondant à la carte mère.','RAM type matches the motherboard.'));}
  if(s.cpu&&s.ram&&!s.cpu.ram.includes(s.ram.memory_generation))errors.push(text('Type de RAM non pris en charge par ce CPU.','RAM type is not supported by this CPU.'));
  return {errors,notes};
 }
 function update(save=true){const s=selection(), chosen=Object.values(s).filter(Boolean), result=checks(s);
  document.getElementById('build-total').textContent=money(chosen.reduce((sum,p)=>sum+p.demo_price_mad,0));
  document.getElementById('build-progress').textContent=`${chosen.length} / 8 `+text('composants sélectionnés','components selected');
  const list=document.getElementById('build-checks');list.replaceChildren();[...result.errors,...result.notes].forEach((message,i)=>{const li=document.createElement('li');li.textContent=message;li.className=i<result.errors.length?'build-error':'build-note';list.append(li);});
  cats.forEach(cat=>{const detail=document.querySelector(`[data-build-detail="${cat}"]`);detail.replaceChildren();if(s[cat]){const a=document.createElement('a');a.href=`/nexrig-pc/${en?'en/products':'produits'}/${s[cat].id}/`;a.textContent=text('Voir les caractéristiques','View specifications');detail.append(a);}});
  add.disabled=chosen.length!==8||result.errors.length>0||document.documentElement.dataset.cartReady!=='true';
  status.textContent=result.errors.length?text('Corrigez les incompatibilités avant l’ajout.','Resolve the mismatches before adding.'):chosen.length===8?text('Vérifiez aussi les points non contrôlés avant tout achat réel.','Also verify the unchecked specifications before any real purchase.'):text('Sélectionnez les huit composants pour ajouter la configuration.','Select all eight components to add the configuration.');
  if(save)try{localStorage.setItem(key,JSON.stringify(Object.fromEntries(cats.map(cat=>[cat,s[cat]?.id||'']))));}catch{status.textContent+=' '+text('La sélection ne sera pas conservée par ce navigateur.','This browser will not save the selection.');}
 }
 try{const saved=JSON.parse(localStorage.getItem(key)||'{}');cats.forEach(cat=>{if(products.get(saved?.[cat])?.category===cat)form.elements[cat].value=saved[cat];});}catch{}
 form.addEventListener('change',()=>update());form.addEventListener('reset',()=>requestAnimationFrame(()=>update()));
 form.addEventListener('submit',event=>{event.preventDefault();update();if(add.disabled)return;document.dispatchEvent(new CustomEvent('nexrig:add-build',{detail:{ids:cats.map(cat=>selection()[cat].id)}}));});
 document.addEventListener('nexrig:cart-ready',()=>update(false));document.addEventListener('nexrig:build-added',()=>{status.textContent=text('Les huit composants ont été ajoutés au panier de démonstration.','All eight components were added to the demonstration cart.');});
 const previewToggle=document.getElementById('preview-toggle'),previewHost=document.getElementById('preview-content'),previewStatus=document.getElementById('preview-status');
 if(previewToggle&&previewHost){
  previewToggle.hidden=false;let mounted=false;
  previewToggle.addEventListener('click',async()=>{
   if(!mounted){previewToggle.disabled=true;previewStatus.textContent=text('Chargement de la vue…','Loading preview…');
    try{const module=await import(previewToggle.dataset.previewModule);module.mountPreview(previewHost,form);mounted=true;previewStatus.textContent='';}
    catch{previewStatus.textContent=text('La vue n’a pas pu être chargée. Réessayez ; les sélecteurs restent disponibles.','The preview could not load. Try again; component selectors remain available.');return;}
    finally{previewToggle.disabled=false;}
   }
   previewHost.hidden=!previewHost.hidden;previewToggle.setAttribute('aria-expanded',String(!previewHost.hidden));
   previewToggle.textContent=previewHost.hidden?text('Voir en 3D','View in 3D'):text('Masquer la vue 3D','Hide 3D preview');
  });
 }
 update(false);
})();
