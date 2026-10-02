/* Curated requirements comparisons; no inferred FPS or performance guarantees. */
(()=>{
 'use strict';const form=document.getElementById('game-finder-form');if(!form)return;
 const data=JSON.parse(document.getElementById('finder-data').textContent),products=new Map(data.products.map(p=>[p.id,p]));
 const en=document.documentElement.lang==='en',t=(fr,english)=>en?english:fr,base='/nexrig-pc/',result=document.getElementById('finder-result');
 const money=n=>new Intl.NumberFormat(en?'en-MA':'fr-MA',{style:'currency',currency:'MAD',maximumFractionDigits:0}).format(n);
 function node(tag,text,parent=result){const el=document.createElement(tag);el.textContent=text;parent.append(el);return el;}
 let activeGame=null, activeBudget=Infinity;
 const build=document.getElementById('pc-selector');
 function show(apply=false){result.replaceChildren();const g=data.games.find(g=>g.id===document.getElementById('finder-game').value);if(!g)return;
  node('h3',g.name+' · '+(g.requirement_level==='minimum'?t('Exigences minimales de référence','Minimum reference requirements'):t('Exigences recommandées de référence','Recommended reference requirements')));
  node('p',`CPU: ${g.cpu_reference} · GPU: ${g.gpu_reference} · RAM: ${g.ram_gb} GB`);
  if(g.storage_gb)node('p',t('Espace libre requis : ','Required free space: ')+g.storage_gb+' GB');if(g.storage_note)node('p',g.storage_note);
  const source=node('a',t('Vérifier les exigences officielles actuelles','Check current official requirements'));source.href=g.source_url;
  node('p',t('Les CPU et GPU suggérés sont des choix de catalogue évalués pour dépasser ces références de base. Cela ne constitue pas un benchmark.','The suggested CPUs and GPUs are curated catalogue choices assessed to exceed these baseline references. This is not a benchmark.'));
  const raw=document.getElementById('finder-budget').value,budget=raw===''?Infinity:Number(raw);
  const choices=cat=>g.component_options[cat].map(id=>products.get(id)).filter(Boolean).sort((a,b)=>a.demo_price_mad-b.demo_price_mad);
  const candidates=[];
  choices('cpu').forEach(cpu=>choices('motherboard').filter(board=>board.socket===cpu.socket).forEach(board=>choices('ram').filter(ram=>ram.capacity_gb>=g.ram_gb&&ram.memory_generation===board.memory_generation&&cpu.ram.includes(ram.memory_generation)).forEach(ram=>{
   const parts={cpu,motherboard:board,ram};
   ['gpu','storage','cooling','psu','case'].forEach(cat=>{parts[cat]=choices(cat).find(p=>cat!=='storage'||((!g.storage_gb||p.capacity_gb>=g.storage_gb)&&(!g.storage_note||p.storage_protocol==='NVMe')));});
   if(Object.values(parts).every(Boolean))candidates.push({parts,total:Object.values(parts).reduce((n,p)=>n+p.demo_price_mad,0)});
  })));
  candidates.sort((a,b)=>a.total-b.total);const suggestion=candidates.find(c=>c.total<=budget);
  if(!suggestion){activeGame=null;node('p',t('Aucune sélection de composants dans ce budget de démonstration. Vos choix actuels sont conservés.','No component selection within this demonstration budget. Your current choices are preserved.'));return;}
  node('p',t('Suggestion composant par composant : modifiez chaque pièce dans les sélecteurs ci-dessous.','Part-by-part suggestion: change any part using the selectors below.'));
  if(apply){activeGame=g;activeBudget=budget;Object.entries(suggestion.parts).forEach(([cat,p])=>{build.elements[cat].value=p.id;});build.dispatchEvent(new Event('change',{bubbles:true}));}
  const summary=node('p','');summary.id='finder-selection-status';
  function selectionStatus(){if(!activeGame){summary.textContent=t('Cliquez sur « Suggérer des composants » pour remplir les sélecteurs.','Click “Suggest components” to fill the selectors.');return;}
   const selected=Object.fromEntries(Object.keys(g.component_options).map(cat=>[cat,products.get(build.elements[cat].value)]));const warnings=[];
   if(!selected.ram||selected.ram.capacity_gb<activeGame.ram_gb)warnings.push(t('RAM sous la référence du jeu.','RAM is below the game reference.'));
   for(const cat of ['cpu','gpu'])if(!activeGame.component_options[cat].includes(selected[cat]?.id))warnings.push(t('Comparaison '+cat.toUpperCase()+' non évaluée pour ce jeu.','This '+cat.toUpperCase()+' comparison has not been assessed for this game.'));
   const drive=selected.storage;if(!drive||(activeGame.storage_gb&&drive.capacity_gb<activeGame.storage_gb)||(activeGame.storage_note&&drive.storage_protocol!=='NVMe'))warnings.push(t('Stockage à vérifier selon les exigences du jeu.','Check storage against the game requirements.'));
   const total=Object.values(selected).reduce((n,p)=>n+(p?.demo_price_mad||0),0);if(total>activeBudget)warnings.push(t('Votre sélection dépasse le budget de démonstration.','Your selection exceeds the demonstration budget.'));
   summary.textContent=activeGame.name+' · '+money(total)+' · '+(warnings.length?warnings.join(' '):t('Références matérielles de base prises en compte ; performances et compatibilité complète à vérifier.','Baseline hardware references considered; performance and complete compatibility still need verification.'));
  }
  build.onchange=selectionStatus;build.onreset=()=>{activeGame=null;requestAnimationFrame(selectionStatus);};selectionStatus();
 }
 form.addEventListener('submit',event=>{event.preventDefault();show(true);});form.addEventListener('change',()=>{activeGame=null;result.replaceChildren();node('p',t('Critères modifiés : demandez une nouvelle suggestion.','Criteria changed: request a new suggestion.'));});show(false);
})();
