/* Source-based benchmark lookup. No fabricated FPS or extrapolation. */
(()=>{
 'use strict';
 const form=document.getElementById('fps-form');if(!form)return;
 const build=document.getElementById('pc-selector'), result=document.getElementById('fps-result');
 const en=document.documentElement.lang==='en',t=(fr,english)=>en?english:fr;
 const products=new Map(JSON.parse(document.getElementById('builder-products').textContent).map(p=>[p.id,p]));
 const records=JSON.parse(document.getElementById('fps-benchmarks').textContent).benchmarks;
 const game=document.getElementById('fps-game'),resolution=document.getElementById('fps-resolution'),preset=document.getElementById('fps-preset');
 function presets(){preset.replaceChildren();const values=game.value==='fortnite'?['performance','dx12-low','dx12-medium','dx12-high','dx12-epic']:['low','medium','high'];const labels={performance:t('Mode Performance','Performance Mode'),low:t('Faible','Low'),medium:t('Moyen','Medium'),high:t('Élevé','High'),'dx12-low':'DirectX 12 · '+t('Faible','Low'),'dx12-medium':'DirectX 12 · '+t('Moyen','Medium'),'dx12-high':'DirectX 12 · '+t('Élevé','High'),'dx12-epic':'DirectX 12 · '+t('Épique (Nanite/Lumen désactivés)','Epic (Nanite/Lumen off)')};values.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=labels[v];preset.append(o);});}
 function paragraph(text){const p=document.createElement('p');p.textContent=text;result.append(p);}
 function clear(){result.replaceChildren();paragraph(t('Sélection modifiée : recherchez de nouveau un benchmark.','Selection changed: look for a benchmark again.'));}
 game.addEventListener('change',()=>{presets();clear();});resolution.addEventListener('change',clear);preset.addEventListener('change',clear);build.addEventListener('change',clear);build.addEventListener('reset',clear);
 form.addEventListener('submit',event=>{
  event.preventDefault();result.replaceChildren();
  const cpu=products.get(build.elements.cpu.value),gpu=products.get(build.elements.gpu.value),ram=products.get(build.elements.ram.value);
  if(!cpu||!gpu||!ram){paragraph(t('Sélectionnez un CPU, un GPU et un kit RAM dans le configurateur.','Select a CPU, GPU and RAM kit in the builder.'));return;}
  const board=products.get(build.elements.motherboard.value);
  if(!cpu.ram.includes(ram.memory_generation)||(board&&(board.socket!==cpu.socket||board.memory_generation!==ram.memory_generation))){paragraph(t('Corrigez les incompatibilités de socket ou de RAM avant la recherche.','Resolve socket or RAM mismatches before searching.'));return;}
  const heading=document.createElement('h3');heading.textContent=game.selectedOptions[0].textContent+' · '+resolution.selectedOptions[0].textContent+' · '+preset.selectedOptions[0].textContent;result.append(heading);
  paragraph(cpu.name+' · '+gpu.name+' · '+ram.name);
  const matches=records.filter(r=>r.cpu_id===cpu.id&&r.gpu_id===gpu.id&&r.ram_id===ram.id&&r.game_id===game.value&&r.resolution===resolution.value&&r.preset===preset.value&&r.rendering==='native'&&r.ray_tracing===false&&r.frame_generation===false);
  if(!matches.length){paragraph(t('Aucune donnée de benchmark disponible pour cette combinaison.','No benchmark data available for this combination.'));paragraph(t('Aucun FPS n’est affiché tant qu’un test correspondant et sa source n’ont pas été vérifiés.','FPS will appear only after a matching test and its source have been verified.'));return;}
  matches.forEach(r=>{paragraph(t('Moyenne mesurée : ','Measured average: ')+r.average_fps+' FPS');if(r.one_percent_low_fps!=null)paragraph('1% low: '+r.one_percent_low_fps+' FPS');paragraph(r.test_conditions+' · '+r.game_version+' · '+r.test_date);const a=document.createElement('a');a.href=r.source_url;a.textContent=r.source_name;result.append(a);});
  paragraph(t('Résultats de tests publiés, pas une garantie pour votre PC.','Published test results, not a guarantee for your PC.'));
 });
 presets();
})();
