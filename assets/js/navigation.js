/* Responsive navigation only: existing links and native category controls. */
(()=>{
 'use strict';
 const header=document.querySelector('.header'),nav=header?.querySelector('nav');if(!nav)return;
 const en=document.documentElement.lang==='en',mobile=matchMedia('(max-width: 1099px)');
 const openLabel=en?'Open menu':'Ouvrir le menu',closeLabel=en?'Close menu':'Fermer le menu';
 nav.classList.add('primary-navigation');if(!nav.id)nav.id='navigation';
 let toggle=header.querySelector('.menu');
 if(!toggle){toggle=document.createElement('button');toggle.className='menu';toggle.type='button';toggle.textContent='☰';nav.before(toggle);}
 toggle.setAttribute('aria-controls',nav.id);
 const backdrop=document.createElement('div');backdrop.className='menu-backdrop';backdrop.hidden=true;backdrop.setAttribute('aria-hidden','true');document.body.append(backdrop);
 let opened=false,previousOverflow;
 const groups=[...nav.querySelectorAll('.nav-group')];
 function groupOpen(g,value){
  if(value&&!mobile.matches)groups.filter(other=>other!==g).forEach(other=>groupOpen(other,false));
  g.toggleAttribute('open',value);g.querySelector('.nav-group-links').hidden=!value;
  const button=g.querySelector('.nav-group-toggle');button.setAttribute('aria-expanded',String(value));button.querySelector('span').textContent=value?'▴':'▾';
  button.setAttribute('aria-label',(en?(value?'Hide categories: ':'Show categories: '):(value?'Masquer les catégories : ':'Afficher les catégories : '))+g.querySelector('.nav-hub-link').textContent);
 }
 groups.forEach(g=>{let timer;
  g.querySelector('.nav-group-toggle').addEventListener('click',()=>groupOpen(g,!g.hasAttribute('open')));
  g.addEventListener('pointerenter',event=>{clearTimeout(timer);if(!mobile.matches&&event.pointerType==='mouse'&&matchMedia('(hover:hover) and (pointer:fine)').matches)groupOpen(g,true);});
  g.addEventListener('pointerleave',()=>{timer=setTimeout(()=>{if(!g.contains(document.activeElement))groupOpen(g,false);},200);});
  g.addEventListener('focusout',()=>{setTimeout(()=>{if(!g.contains(document.activeElement))groupOpen(g,false);},0);});
 });

 function setOpen(value,restore=false){
  opened=mobile.matches&&value;
  nav.classList.toggle('drawer-open',opened);nav.inert=mobile.matches&&!opened;
  toggle.setAttribute('aria-expanded',String(opened));toggle.setAttribute('aria-label',opened?closeLabel:openLabel);
  backdrop.hidden=!opened;
  if(opened){if(previousOverflow===undefined)previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
  else if(previousOverflow!==undefined){document.body.style.overflow=previousOverflow;previousOverflow=undefined;}
  if(restore&&mobile.matches)toggle.focus();
 }
 toggle.addEventListener('click',()=>setOpen(!opened));
 backdrop.addEventListener('click',()=>setOpen(false,true));
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  if(mobile.matches)setOpen(false);
  groups.forEach(g=>{groupOpen(g,false);});
  if(a.getAttribute('href')?.startsWith('#')){const target=document.getElementById(a.hash.slice(1));if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}}
 }));
 document.addEventListener('click',event=>{if(!header.contains(event.target)&&!opened)groups.forEach(g=>{groupOpen(g,false);});});
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
   const active=groups.find(g=>g.hasAttribute('open')&&g.contains(document.activeElement));groups.forEach(g=>{groupOpen(g,false);});
   if(opened){event.preventDefault();setOpen(false,true);}else if(active)active.querySelector('.nav-group-toggle').focus();
  }
  if(event.key==='Tab'&&opened){
   const targets=[toggle,...nav.querySelectorAll('a,button')].filter(e=>e.getClientRects().length),first=targets[0],last=targets.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 });
 function resize(){groups.forEach(g=>{groupOpen(g,false);});setOpen(false);}
 mobile.addEventListener('change',resize);header.classList.add('responsive-navigation');resize();
})();
