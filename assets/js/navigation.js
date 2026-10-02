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
  groups.forEach(g=>{g.open=false;});
  if(a.getAttribute('href')?.startsWith('#')){const target=document.getElementById(a.hash.slice(1));if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}}
 }));
 groups.forEach(g=>g.addEventListener('toggle',()=>{if(g.open&&!mobile.matches)groups.filter(other=>other!==g).forEach(other=>{other.open=false;});}));
 document.addEventListener('click',event=>{if(!header.contains(event.target)&&!opened)groups.forEach(g=>{g.open=false;});});
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
   const active=groups.find(g=>g.open&&g.contains(document.activeElement));groups.forEach(g=>{g.open=false;});
   if(opened){event.preventDefault();setOpen(false,true);}else if(active)active.querySelector('summary').focus();
  }
  if(event.key==='Tab'&&opened){
   const targets=[toggle,...nav.querySelectorAll('a,summary')].filter(e=>e.getClientRects().length),first=targets[0],last=targets.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 });
 function resize(){groups.forEach(g=>{g.open=false;});setOpen(false);}
 mobile.addEventListener('change',resize);header.classList.add('responsive-navigation');resize();
})();
