/* Curated requirements comparisons; no inferred FPS or performance guarantees. */
(()=>{
 'use strict';const form=document.getElementById('game-finder-form');if(!form)return;
 const data=JSON.parse(document.getElementById('finder-data').textContent),products=new Map(data.products.map(p=>[p.id,p]));
 const en=document.documentElement.lang==='en',t=(fr,english)=>en?english:fr,base='/nexrig-pc/',result=document.getElementById('finder-result');
 const money=n=>new Intl.NumberFormat(en?'en-MA':'fr-MA',{style:'currency',currency:'MAD',maximumFractionDigits:0}).format(n);
 function node(tag,text,parent=result){const el=document.createElement(tag);el.textContent=text;parent.append(el);return el;}
 function show(){result.replaceChildren();const g=data.games.find(g=>g.id===document.getElementById('finder-game').value);if(!g)return;
  node('h3',g.name+' · '+(g.requirement_level==='minimum'?t('Exigences minimales de référence','Minimum reference requirements'):t('Exigences recommandées de référence','Recommended reference requirements')));
  node('p',`CPU: ${g.cpu_reference} · GPU: ${g.gpu_reference} · RAM: ${g.ram_gb} GB`);
  if(g.storage_gb)node('p',t('Espace libre requis : ','Required free space: ')+g.storage_gb+' GB');if(g.storage_note)node('p',g.storage_note);
  const source=node('a',t('Vérifier les exigences officielles actuelles','Check current official requirements'));source.href=g.source_url;
  node('p',t('Les CPU et GPU proposés ci-dessous sont des choix de catalogue évalués pour dépasser ces références de base. Cela ne constitue pas un benchmark.','The CPUs and GPUs below are curated catalogue choices assessed to exceed these baseline references. This is not a benchmark.'));
  const raw=document.getElementById('finder-budget').value,budget=raw===''?Infinity:Number(raw);
  const builds=g.candidate_build_ids.map(id=>products.get(id)).filter(p=>{if(!p||p.category!=='pc'||p.demo_price_mad>budget)return false;const ram=products.get(p.components.ram),drive=products.get(p.components.storage);return ram.capacity_gb>=g.ram_gb&&(!g.storage_gb||drive.capacity_gb>=g.storage_gb)&&(!g.storage_note||drive.storage_protocol==='NVMe');}).sort((a,b)=>a.demo_price_mad-b.demo_price_mad);
  if(!builds.length){node('p',t('Aucune configuration du catalogue dans ce budget de démonstration. Augmentez le budget ou consultez le configurateur.','No catalogue configuration within this demonstration budget. Increase the budget or use the component builder.'));return;}
  node('p',`${builds.length} `+t('configurations correspondent ; les trois moins chères sont affichées.','configurations match; the three least expensive are shown.'));
  const grid=node('div','');grid.className='shop-grid';
  builds.slice(0,3).forEach(p=>{const article=node('article','',grid);article.className='guide-card';node('h3',p.name,article);node('p',money(p.demo_price_mad)+' · '+t('Prix de démonstration','Demonstration price'),article);node('p',['cpu','gpu','ram','storage'].map(cat=>products.get(p.components[cat]).name).join(' · '),article);
   const a=node('a',t('Voir les huit composants','View all eight components'),article);a.href=base+(en?'en/products/':'produits/')+p.id+'/';
   const button=node('button',t('Personnaliser cette configuration','Customize this configuration'),article);button.type='button';button.className='shop-button';button.addEventListener('click',()=>{const build=document.getElementById('pc-selector');Object.entries(p.components).forEach(([cat,id])=>{build.elements[cat].value=id;});build.dispatchEvent(new Event('change',{bubbles:true}));build.scrollIntoView({behavior:'smooth',block:'start'});build.elements.cpu.focus({preventScroll:true});});
  });
 }
 form.addEventListener('submit',event=>{event.preventDefault();show();});form.addEventListener('change',()=>{result.replaceChildren();node('p',t('Critères modifiés : recherchez de nouveau.','Criteria changed: search again.'));});show();
})();
