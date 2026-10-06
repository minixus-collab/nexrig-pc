/* Curated requirements comparisons; no inferred FPS or performance guarantees. */
(()=>{
 'use strict';const form=document.getElementById('game-finder-form');if(!form)return;
 const data=JSON.parse(document.getElementById('finder-data').textContent),products=new Map(data.products.map(p=>[p.id,p]));
 const en=document.documentElement.lang==='en',t=(fr,english)=>en?english:fr,base='/nexrig-pc/',result=document.getElementById('finder-result');
 const money=n=>new Intl.NumberFormat(en?'en-MA':'fr-MA',{style:'currency',currency:'MAD',maximumFractionDigits:0}).format(n);
 function node(tag,text,parent=result){const el=document.createElement(tag);el.textContent=text;parent.append(el);return el;}
 function explainParts(selected,g,parent){
  parent.replaceChildren();
  const labels={cpu:t('Processeur','Processor'),gpu:t('Carte graphique','Graphics card'),ram:t('Mémoire RAM','RAM'),motherboard:t('Carte mère','Motherboard'),storage:t('Stockage','Storage'),cooling:t('Refroidissement','Cooling'),psu:t('Alimentation','Power supply'),case:t('Boîtier','Case')};
  const checks={
   cpu:t('Vérifiez le support du CPU dans la liste de la carte mère, la version du BIOS et les besoins de refroidissement.','Check the motherboard CPU support list, required BIOS version and cooling needs.'),
   gpu:t('Vérifiez les benchmarks du jeu pour votre résolution et vos réglages, la longueur et l’épaisseur de la carte, ainsi que les connecteurs et l’alimentation recommandée pour la référence exacte.','Check game benchmarks at your resolution and settings, card length and thickness, power connectors and the exact card’s recommended power supply.'),
   motherboard:t('Socket et génération de RAM sont contrôlés ; BIOS, format accepté par le boîtier, ports de stockage et connectique restent à vérifier.','Socket and RAM generation are checked; BIOS, case support for the board size, storage ports and connections still need verification.'),
   ram:t('Vérifiez le support CPU/carte mère, le format, la capacité maximale, les emplacements, la QVL et la stabilité des profils XMP/EXPO.','Check CPU/motherboard support, module format, maximum capacity, slot arrangement, QVL and XMP/EXPO stability.'),
   storage:t('La capacité annoncée n’est pas l’espace libre après Windows et vos autres jeux. Vérifiez le port, le protocole, le format et l’espace réellement disponible.','Advertised capacity is not free space after Windows and other games. Check the slot, protocol, form factor and actual available space.'),
   cooling:t('Vérifiez les fixations pour le socket, le dégagement RAM, la hauteur ou les emplacements de radiateur et des tests adaptés au CPU.','Check socket mounting hardware, RAM clearance, height or radiator mounting positions and cooling tests suited to the CPU.'),
   psu:t('La puissance totale du PC n’est pas calculée ici. Vérifiez les recommandations CPU/GPU, les connecteurs, la marge de puissance et les dimensions. Ne mélangez pas les câbles modulaires sans confirmation du fabricant.','Total system power is not calculated here. Check CPU/GPU recommendations, connectors, power headroom and dimensions. Do not mix modular cables without manufacturer confirmation.'),
   case:t('Vérifiez le format de carte mère, le dégagement GPU/refroidisseur, les dimensions de l’alimentation, les ventilateurs et les emplacements de stockage.','Check motherboard size, GPU/cooler clearance, PSU dimensions, fans and storage mounting positions.')
  };
  for(const cat of ['cpu','gpu','motherboard','ram','storage','cooling','psu','case']){
   const p=selected[cat],item=node('div','',parent);item.className='finder-part';item.dataset.explainedPart=cat;
   node('h4',labels[cat]+' · '+(p?p.name:t('Non sélectionné','Not selected')),item);
   let reason=t('Choisissez ce composant pour examiner sa justification.','Choose this part to review its explanation.');
   if(p){
    const listed=g.component_options[cat].includes(p.id);
    if(cat==='cpu'||cat==='gpu')reason=listed?t('Ce modèle fait partie des choix de catalogue retenus pour la référence '+(cat==='cpu'?g.cpu_reference:g.gpu_reference)+' de '+g.name+'. Ce rapprochement est éditorial, pas un résultat de benchmark.','This model is in the curated catalogue options for '+g.name+'’s reference '+(cat==='cpu'?g.cpu_reference:g.gpu_reference)+'. This is an editorial comparison, not a benchmark result.'):t('Vous avez choisi une autre pièce : son niveau de performance pour ce jeu n’a pas été évalué par ce guide.','You selected another part: this guide has not assessed its performance level for this game.');
    if(cat==='motherboard')reason=(selected.cpu&&p.socket===selected.cpu.socket?t('Le socket '+p.socket+' correspond au processeur sélectionné.','The '+p.socket+' socket matches the selected processor.'):t('Le socket doit correspondre au processeur sélectionné.','The socket must match the selected processor.'))+' '+t('La carte mère relie les composants ; ce choix ne promet pas de FPS supplémentaires.','The motherboard connects the parts; this choice does not promise extra FPS.');
    if(cat==='ram')reason=p.capacity_gb+' '+t('Go','GB')+' · '+p.memory_generation+' : '+(p.capacity_gb>=g.ram_gb?t('capacité au moins égale à la référence de '+g.ram_gb+' Go pour '+g.name+'.','capacity at least matches the '+g.ram_gb+' GB reference for '+g.name+'.'):t('capacité inférieure à la référence de '+g.ram_gb+' Go du jeu.','capacity is below the game’s '+g.ram_gb+' GB reference.'))+' '+t('La génération doit aussi correspondre à la plateforme.','The generation must also match the platform.');
    if(cat==='storage')reason=p.capacity_gb+' '+t('Go','GB')+' · '+(p.storage_protocol||p.drive_type)+'. '+(g.storage_gb?t('La référence du jeu indique '+g.storage_gb+' Go d’espace libre.','The game reference lists '+g.storage_gb+' GB of free space.'):t('Le guide ne dispose pas d’une valeur d’espace libre à comparer pour ce jeu.','This guide has no free-space value to compare for this game.'))+' '+(g.storage_note?t('Type demandé par la référence : ','Type requested by the reference: ')+g.storage_note+'. ':'')+t('Ce choix ne garantit pas une hausse des FPS.','This choice does not guarantee higher FPS.');
    if(cat==='cooling')reason=t('Cette pièce sert à refroidir le CPU, pas à atteindre une exigence GPU du jeu. Le guide ne valide pas sa fixation ni ses performances thermiques.','This part cools the CPU rather than meeting a game GPU requirement. The guide does not validate mounting or thermal performance.');
    if(cat==='psu')reason=p.wattage+' W. '+t('L’alimentation fournit l’énergie aux composants. La sélection dans la liste ne certifie pas que cette puissance convient au CPU et au GPU choisis.','The PSU powers the components. Inclusion in the options does not certify that this wattage suits the selected CPU and GPU.');
    if(cat==='case')reason=t('Le boîtier accueille les composants. Il est proposé pour compléter la sélection ; les dimensions et la ventilation ne sont pas certifiées par le guide.','The case houses the components. It completes the selection; dimensions and airflow are not certified by this guide.');
   }
   node('p',reason,item);node('p',t('À vérifier : ','Still to check: ')+checks[cat],item);
   if(p){const link=node('a',t('Voir la fiche de cette pièce','View this part’s specifications'),item);link.href=base+(en?'en/products/':'produits/')+p.id+'/';}
  }
 }
 let activeGame=null, activeBudget=Infinity, autoRequest=0;
 const build=document.getElementById('pc-selector');
 function show(apply=false){result.replaceChildren();const g=data.games.find(g=>g.id===document.getElementById('finder-game').value);if(!g)return;
  if(g.requirement_level==='pending'){activeGame=null;node('h3',g.name);node('p',t('Exigences à vérifier : aucune suggestion automatique n’est proposée pour ce jeu. Vos composants actuels sont conservés.','Requirements need verification: automatic suggestions are not available for this game. Your current components are preserved.'));const source=node('a',t('Consulter les exigences officielles','View official requirements'));source.href=g.source_url;return;}
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
   ['gpu','storage','cooling','psu','case'].forEach(cat=>{parts[cat]=choices(cat).find(p=>cat!=='storage'||((!g.storage_gb||p.capacity_gb>=g.storage_gb)&&(!g.storage_note||(g.storage_note==='NVMe SSD'?p.storage_protocol==='NVMe':p.drive_type==='SSD'))));});
   if(Object.values(parts).every(Boolean))candidates.push({parts,total:Object.values(parts).reduce((n,p)=>n+p.demo_price_mad,0)});
  })));
  candidates.sort((a,b)=>a.total-b.total);const suggestion=candidates.find(c=>c.total<=budget);
  if(!suggestion){activeGame=null;node('p',t('Aucune sélection de composants dans ce budget de démonstration. Vos choix actuels sont conservés.','No component selection within this demonstration budget. Your current choices are preserved.'));return;}
  node('p',t('La suggestion minimise le total fictif parmi les combinaisons de la liste retenue, en contrôlant socket, génération de RAM et références de RAM/stockage. Ce n’est pas une optimisation des FPS ni une vérification complète du montage.','The suggestion minimizes the fictional total within the curated options, checking socket, RAM generation and RAM/storage references. It does not optimize FPS or fully verify assembly.'));
  node('p',t('Suggestion composant par composant : modifiez chaque pièce dans les sélecteurs ci-dessous.','Part-by-part suggestion: change any part using the selectors below.'));
  if(apply){activeGame=g;activeBudget=budget;Object.entries(suggestion.parts).forEach(([cat,p])=>{build.elements[cat].value=p.id;});build.dispatchEvent(new Event('change',{bubbles:true}));}
  const summary=node('p','');summary.id='finder-selection-status';
  const reasons=node('details','');reasons.className='finder-explanations';reasons.open=true;node('summary',t('Pourquoi ces pièces ? Vérifications restantes','Why these parts? Remaining checks'),reasons);const reasonsBody=node('div','',reasons);reasonsBody.className='finder-parts';
  function selectionStatus(){if(!activeGame){reasons.hidden=true;reasonsBody.replaceChildren();summary.textContent=t('Cliquez sur « Suggérer des composants » pour remplir les sélecteurs.','Click “Suggest components” to fill the selectors.');return;}
   const selected=Object.fromEntries(Object.keys(g.component_options).map(cat=>[cat,products.get(build.elements[cat].value)]));const warnings=[];reasons.hidden=false;explainParts(selected,activeGame,reasonsBody);
   if(!selected.ram||selected.ram.capacity_gb<activeGame.ram_gb)warnings.push(t('RAM sous la référence du jeu.','RAM is below the game reference.'));
   for(const cat of ['cpu','gpu'])if(!activeGame.component_options[cat].includes(selected[cat]?.id))warnings.push(t('Comparaison '+cat.toUpperCase()+' non évaluée pour ce jeu.','This '+cat.toUpperCase()+' comparison has not been assessed for this game.'));
   const drive=selected.storage;if(!drive||(activeGame.storage_gb&&drive.capacity_gb<activeGame.storage_gb)||(activeGame.storage_note&&(activeGame.storage_note==='NVMe SSD'?drive.storage_protocol!=='NVMe':drive.drive_type!=='SSD')))warnings.push(t('Stockage à vérifier selon les exigences du jeu.','Check storage against the game requirements.'));
   const total=Object.values(selected).reduce((n,p)=>n+(p?.demo_price_mad||0),0);if(total>activeBudget)warnings.push(t('Votre sélection dépasse le budget de démonstration.','Your selection exceeds the demonstration budget.'));
   summary.textContent=activeGame.name+' · '+money(total)+' · '+(warnings.length?warnings.join(' '):t('Références matérielles de base prises en compte ; performances et compatibilité complète à vérifier.','Baseline hardware references considered; performance and complete compatibility still need verification.'));
  }
  build.onchange=selectionStatus;build.onreset=()=>{activeGame=null;requestAnimationFrame(selectionStatus);};selectionStatus();return true;
 }
 form.addEventListener('submit',event=>{event.preventDefault();autoRequest++;show(true);});
 form.addEventListener('change',event=>{
  const request=++autoRequest;
  if(event.target.id==='finder-game'){
   if(!show(true))return;
   const add=()=>{if(request!==autoRequest)return;const button=document.getElementById('build-add');if(!button.disabled)build.requestSubmit(button);};
   if(document.documentElement.dataset.cartReady==='true')add();
   else document.addEventListener('nexrig:cart-ready',()=>requestAnimationFrame(add),{once:true});
  }else{activeGame=null;result.replaceChildren();node('p',t('Critères modifiés : demandez une nouvelle suggestion.','Criteria changed: request a new suggestion.'));}
 });show(false);
})();
