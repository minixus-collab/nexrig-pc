/* Personal website feedback, saved only on this device. */
(()=>{
 'use strict';const form=document.getElementById('site-rating');if(!form)return;
 const key='nexrig.website-rating.v1',en=document.documentElement.lang==='en',status=document.getElementById('rating-status');
 const message=(fr,english)=>en?english:fr;
 try{const saved=localStorage.getItem(key);if(/^[1-5]$/.test(saved||'')){form.elements.rating.value=saved;status.textContent=message('Votre note sur cet appareil : ','Your rating on this device: ')+saved+'/5';}}catch{}
 form.addEventListener('submit',event=>{event.preventDefault();const value=form.elements.rating.value;if(!/^[1-5]$/.test(value))return;
 try{localStorage.setItem(key,value);status.textContent=message('Merci ! Votre note est enregistrée sur cet appareil : ','Thank you! Your rating is saved on this device: ')+value+'/5';}
 catch{status.textContent=message('Votre note : ','Your rating: ')+value+'/5 · '+message('Le navigateur ne permet pas son enregistrement.','Your browser cannot save it.');}
 });
 form.querySelector('[data-clear-rating]').addEventListener('click',()=>{try{localStorage.removeItem(key);}catch{}form.reset();status.textContent=message('Votre note a été effacée ici.','Your rating has been cleared here.');});
})();
