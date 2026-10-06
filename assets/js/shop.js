/* Shared demonstration cart. Prices and quantities come from the catalogue, never storage. */
(() => {
  'use strict';
  const en = document.documentElement.lang === 'en';
  const t = en ? {
    added: 'added to your demonstration cart.', removed: 'Item removed.', cleared: 'Cart cleared.',
    demo: 'Demonstration price — no sales', qty: 'Quantity', remove: 'Remove', total: 'Line total',
    empty: 'Your cart is empty.', browse: 'Browse graphics cards', found: 'products shown',
    memory: 'Browser storage is unavailable. This cart will not persist after leaving the page.',
    failed: 'The catalogue could not load. Refresh the page to try again.', updated: 'Quantity updated.',
    limit: 'Maximum quantity: 99 per product.', invalid: 'Enter a whole-number quantity from 1 to 99.'
  } : {
    added: 'ajouté au panier de démonstration.', removed: 'Article retiré.', cleared: 'Panier vidé.',
    demo: 'Prix de démonstration — aucune vente', qty: 'Quantité', remove: 'Retirer', total: 'Total de la ligne',
    empty: 'Votre panier est vide.', browse: 'Explorer les cartes graphiques', found: 'produits affichés',
    memory: 'Le stockage du navigateur est indisponible. Ce panier ne sera pas conservé après avoir quitté la page.',
    failed: 'Le catalogue n’a pas pu être chargé. Actualisez la page pour réessayer.', updated: 'Quantité mise à jour.',
    limit: 'Quantité maximale : 99 par produit.', invalid: 'Saisissez une quantité entière de 1 à 99.'
  };
  const runtime = document.currentScript;
  const catalogueURL = runtime?.dataset.catalogueUrl || '/nexrig-pc/data/products.json';
  const catalogueCount = Number(runtime?.dataset.catalogueCount || 0);
  const key = 'nexrig.demo-cart.v1';
  const money = value => new Intl.NumberFormat(en ? 'en-MA' : 'fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(value);
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let products = new Map(), cart = [], persistent = true, toastTimer;
  let status = document.getElementById('cart-status');
  if (!status) { status = document.createElement('div'); status.id = 'cart-status'; status.className = 'cart-status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); document.body.append(status); }
  function announce(message) { clearTimeout(toastTimer); status.textContent = message; toastTimer = setTimeout(() => {status.textContent = '';}, 5000); }
  function clean(value) {
    if (!Array.isArray(value)) return [];
    const result = new Map();
    for (const item of value) {
      if (!item || !products.has(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) continue;
      result.set(item.id, {id: item.id, quantity: Math.min(99, (result.get(item.id)?.quantity || 0) + item.quantity)});
    }
    return [...result.values()];
  }
  function read() {
    try { return clean(JSON.parse(localStorage.getItem(key) || '[]')); }
    catch (error) { if (!(error instanceof SyntaxError)) persistent = false; return []; }
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(cart)); }
    catch { persistent = false; }
    render();
    const warning = document.getElementById('cart-storage-warning');
    if (warning) { warning.hidden = persistent; warning.textContent = persistent ? '' : t.memory; }
  }
  const productURL = id => `/nexrig-pc/${en ? 'en/products' : 'produits'}/${id}/`;
  function render() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('[data-cart-count]').forEach(el => {el.textContent = String(count);});
    const container = document.getElementById('cart-items');
    if (!container) return;
    if (!cart.length) {
      container.innerHTML = `<div class="cart-empty"><p>${t.empty}</p><a class="shop-button" href="/nexrig-pc/${en ? 'en/graphics-cards' : 'cartes-graphiques'}/">${t.browse}</a></div>`;
    } else {
      container.innerHTML = cart.map(item => {
        const p = products.get(item.id);
        return `<article class="cart-row"><img src="${esc(p.image_url || `/nexrig-pc/assets/images/${p.category}-illustration.svg`)}" alt="" width="480" height="320"><div><h2><a href="${productURL(p.id)}">${esc(p.name)}</a></h2><span>${money(p.demo_price_mad)}</span><small class="shop-disclaimer">${t.demo}</small><div class="cart-controls"><label for="qty-${p.id}">${t.qty}<input id="qty-${p.id}" class="cart-quantity" data-quantity="${p.id}" type="number" min="1" max="99" step="1" value="${item.quantity}" aria-label="${t.qty}: ${esc(p.name)}"></label><button class="shop-button secondary" type="button" data-remove="${p.id}" aria-label="${t.remove}: ${esc(p.name)}">${t.remove}</button></div><p class="shop-specs">${t.total}: ${money(p.demo_price_mad * item.quantity)}</p></div></article>`;
      }).join('');
    }
    const total = cart.reduce((sum, item) => sum + products.get(item.id).demo_price_mad * item.quantity, 0);
    document.getElementById('cart-total').textContent = money(total);
    document.getElementById('clear-cart').disabled = !cart.length;
  }
  const searchToggle = document.querySelector('.search-toggle');
  const searchForm = document.getElementById('header-search-form');
  if (searchToggle && searchForm) {
    searchToggle.hidden = false; searchForm.hidden = true;
    const closeSearch = () => {searchForm.hidden = true; searchToggle.setAttribute('aria-expanded', 'false');};
    searchToggle.addEventListener('click', () => {
      const open = searchForm.hidden; searchForm.hidden = !open;
      searchToggle.setAttribute('aria-expanded', String(open));
      if (open) searchForm.elements.q.focus();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !searchForm.hidden) {closeSearch(); searchToggle.focus();}
    });
    document.addEventListener('click', event => {if (!event.target.closest('.header-search')) closeSearch();});
  }
  function initComparison() {
    const cards = [...document.querySelectorAll('.shop-card[data-product-id]')].filter(card => products.get(card.dataset.productId)?.category === 'gpu');
    if (!cards.length) return;
    const words = en ? {
      title: 'Compare graphics cards', help: 'Select 2 or 3 graphics cards using the buttons on their product cards. Filters do not remove your selection.',
      select: 'Select for comparison', selected: 'Selected for comparison', compare: 'Compare selected GPUs', clear: 'Clear comparison', remove: 'Remove from comparison',
      count: 'selected (maximum 3)', limit: 'Maximum reached. Remove a graphics card to select another.',
      note: 'Catalogue specifications only. More VRAM does not automatically mean higher performance. Check benchmarks and the exact card manufacturer’s compatibility details. Prices are fictional demonstrations, not market offers.',
      model: 'Model', brand: 'Brand', chip: 'GPU chip brand', vram: 'VRAM', type: 'Memory type', architecture: 'Architecture', price: 'Demonstration price — no sales', missing: 'Not specified', caption: 'Selected graphics card specifications'
    } : {
      title: 'Comparer les cartes graphiques', help: 'Sélectionnez 2 ou 3 cartes graphiques avec les boutons de leurs fiches. Les filtres conservent votre sélection.',
      select: 'Sélectionner pour comparer', selected: 'Sélectionnée pour comparaison', compare: 'Comparer les GPU sélectionnés', clear: 'Vider la comparaison', remove: 'Retirer de la comparaison',
      count: 'sélectionnées (maximum 3)', limit: 'Maximum atteint. Retirez une carte graphique pour en sélectionner une autre.',
      note: 'Caractéristiques du catalogue uniquement. Plus de VRAM ne signifie pas automatiquement plus de performances. Vérifiez les benchmarks et la compatibilité de la référence exacte chez son fabricant. Les prix sont fictifs, pas des offres de marché.',
      model: 'Modèle', brand: 'Marque', chip: 'Fabricant de la puce GPU', vram: 'VRAM', type: 'Type de mémoire', architecture: 'Architecture', price: 'Prix de démonstration — aucune vente', missing: 'Non précisé', caption: 'Caractéristiques des cartes graphiques sélectionnées'
    };
    const selectionKey = 'nexrig.gpu-comparison.v1';
    let selected = [];
    try {
      const stored = JSON.parse(sessionStorage.getItem(selectionKey) || '[]');
      if (Array.isArray(stored)) selected = [...new Set(stored.filter(id => typeof id === 'string' && products.get(id)?.category === 'gpu'))].slice(0,3);
    } catch { /* Comparison remains usable without browser storage. */ }
    const panel = document.createElement('section');
    panel.className = 'gpu-comparison'; panel.setAttribute('aria-labelledby', 'gpu-comparison-title');
    panel.innerHTML = `<h2 id="gpu-comparison-title">${words.title}</h2><p>${words.help}</p><p class="comparison-count" role="status" aria-live="polite"></p><ul class="comparison-selection"></ul><div class="comparison-actions"><button type="button" class="shop-button" data-show-comparison>${words.compare}</button><button type="button" class="shop-button secondary" data-clear-comparison>${words.clear}</button></div><p class="comparison-limit"></p><div class="comparison-results" hidden><p>${words.note}</p><div class="comparison-scroll" tabindex="0" role="region" aria-label="${words.caption}"></div></div>`;
    cards[0].closest('.shop-grid').before(panel);
    const results = panel.querySelector('.comparison-results'), scroll = panel.querySelector('.comparison-scroll');
    const buttons = cards.map(card => {
      const button = document.createElement('button');button.type='button';button.className='shop-button secondary gpu-compare-select';button.dataset.compareId=card.dataset.productId;
      card.querySelector('.shop-actions').prepend(button);return button;
    });
    function update() {
      try {sessionStorage.setItem(selectionKey, JSON.stringify(selected));} catch { /* No persistence required. */ }
      panel.querySelector('.comparison-count').textContent = `${selected.length} / 3 ${words.count}`;
      panel.querySelector('[data-show-comparison]').disabled = selected.length < 2;
      panel.querySelector('[data-clear-comparison]').disabled = !selected.length;
      panel.querySelector('.comparison-limit').textContent = selected.length === 3 ? words.limit : '';
      for (const button of buttons) {
        const active = selected.includes(button.dataset.compareId);
        button.textContent = active ? words.selected : words.select;
        button.setAttribute('aria-pressed', String(active));
        button.setAttribute('aria-label', `${button.textContent}: ${products.get(button.dataset.compareId).name}`);
        button.disabled = !active && selected.length === 3;
      }
      panel.querySelector('.comparison-selection').innerHTML = selected.map(id => `<li><span>${esc(products.get(id).name)}</span><button type="button" class="comparison-remove" data-compare-remove="${esc(id)}" aria-label="${words.remove}: ${esc(products.get(id).name)}">${words.remove}</button></li>`).join('');
      const chosen = selected.map(id => products.get(id));
      const rows = [[words.brand,p=>p.brand],[words.chip,p=>p.chip_brand || p.brand],[words.vram,p=>p.vram_gb == null ? null : `${p.vram_gb} ${en?'GB':'Go'}`],[words.type,p=>p.memory_type],[words.architecture,p=>p.architecture],[words.price,p=>money(p.demo_price_mad)]];
      scroll.innerHTML = `<table><caption>${words.caption}</caption><thead><tr><th scope="col">${words.model}</th>${chosen.map(p=>`<th scope="col"><a href="${productURL(p.id)}">${esc(p.name)}</a></th>`).join('')}</tr></thead><tbody>${rows.map(([label,value])=>`<tr><th scope="row">${label}</th>${chosen.map(p=>`<td>${esc(value(p) ?? words.missing)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      if (selected.length < 2) results.hidden = true;
    }
    buttons.forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.compareId;
      if (selected.includes(id)) selected = selected.filter(item=>item!==id);
      else if (selected.length < 3) selected.push(id);
      update();
    }));
    panel.addEventListener('click', event => {
      const remove = event.target.closest('[data-compare-remove]');
      if (remove) {
        const previous = [...panel.querySelectorAll('[data-compare-remove]')].indexOf(remove);
        selected = selected.filter(id=>id!==remove.dataset.compareRemove);update();
        const remaining = panel.querySelectorAll('[data-compare-remove]');
        (remaining[Math.min(previous,remaining.length-1)] || buttons.find(button=>!button.disabled))?.focus();
      }
      if (event.target.closest('[data-clear-comparison]')) {selected=[];update();buttons[0]?.focus();}
      if (event.target.closest('[data-show-comparison]') && selected.length >= 2) {results.hidden=false;scroll.focus();scroll.scrollIntoView({block:'nearest',behavior:'instant'});}
    });
    update();
  }
  function initFilters() {
    const form = document.querySelector('[data-shop-filters]');
    if (!form) return;
    form.hidden = false;
    form.elements.search.value = (new URLSearchParams(location.search).get('q') || '').slice(0, 160);
    const cards = [...document.querySelectorAll('.shop-grid [data-product-id]')];
    const count = document.getElementById('shop-result');
    const empty = document.getElementById('shop-empty');
    function filter() {
      const query = form.elements.search.value.trim().toLocaleLowerCase();
      const brand = form.elements.brand.value;
      const category = form.elements.category?.value || '';
      const resolution = form.elements.resolution?.value || '';
      const refresh = form.elements.refresh?.value || '';
      const panel = form.elements.panel?.value || '';
      const coolerType = form.elements.cooler_type?.value || '';
      const radiator = form.elements.radiator?.value || '';
      const socket = form.elements.socket?.value || '';
      const formFactor = form.elements.form_factor?.value || '';
      const wattage = form.elements.wattage?.value || '';
      const modularity = form.elements.modularity?.value || '';
      const chipBrand = form.elements.chip_brand?.value || '';
      const generation = form.elements.generation?.value || '';
      const capacity = form.elements.capacity?.value || '';
      const driveType = form.elements.drive_type?.value || '';
      const protocol = form.elements.storage_protocol?.value || '';
      let shown = 0;
      for (const card of cards) {
        const p = products.get(card.dataset.productId);
        const expansionMatches = ['case_format','screen_inches','switch_technology','keyboard_size','connection_type','upholstery','audio_type','signal_path','cpu_platform','memory_generation'].every(key => !form.elements[key]?.value || String(p[key]) === form.elements[key].value);
        const matches = (!category || p.category === category) && expansionMatches && (!resolution || p.resolution === resolution) && (!refresh || String(p.refresh_hz) === refresh) && (!panel || p.panel_type === panel) && (!coolerType || p.cooler_type === coolerType) && (!radiator || String(p.radiator_mm) === radiator) && (!socket || p.socket === socket) && (!formFactor || p.form_factor === formFactor) && (!wattage || String(p.wattage) === wattage) && (!modularity || p.modularity === modularity) && (!chipBrand || (p.chip_brand || p.brand) === chipBrand) && (!brand || p.brand === brand) && (!generation || p.memory_generation === generation) && (!capacity || String(p.capacity_gb) === capacity) && (!driveType || p.drive_type === driveType) && (!protocol || p.storage_protocol === protocol) && `${p.name} ${p.sku || ''} ${p.search_terms || ''}`.toLocaleLowerCase().includes(query);
        card.hidden = !matches; if (matches) shown++;
      }
      const order = form.elements.sort.value;
      const sorted = [...cards].sort((a,b) => {
        const pa=products.get(a.dataset.productId), pb=products.get(b.dataset.productId);
        if (order === 'price-low') return pa.demo_price_mad-pb.demo_price_mad;
        if (order === 'price-high') return pb.demo_price_mad-pa.demo_price_mad;
        if (order === 'name') return pa.name.localeCompare(pb.name);
        return cards.indexOf(a)-cards.indexOf(b);
      });
      sorted.forEach(card => card.parentElement.append(card));
      count.textContent = `${shown} / ${cards.length} ${t.found}`; empty.hidden = !!shown;
    }
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('input', filter); form.addEventListener('change', filter);
    form.addEventListener('reset', () => requestAnimationFrame(filter)); filter();
  }
  document.addEventListener('click', event => {
    const add = event.target.closest('[data-add-to-cart]');
    if (add && products.has(add.dataset.addToCart)) {
      const id=add.dataset.addToCart, existing=cart.find(item=>item.id===id);
      if (existing?.quantity===99) {announce(t.limit); return;}
      if (existing) existing.quantity++; else cart.push({id,quantity:1});
      save(); announce(`${products.get(id).name} ${t.added}${persistent ? '' : ' '+t.memory}`);
    }
    const remove = event.target.closest('[data-remove]');
    if (remove) { cart=cart.filter(item=>item.id!==remove.dataset.remove);save();announce(t.removed);document.querySelector('[data-remove], .cart-empty a')?.focus(); }
    if (event.target.closest('#clear-cart')) {cart=[];save();announce(t.cleared);document.querySelector('.cart-empty a')?.focus();}
  });
  document.addEventListener('nexrig:add-build', event => {
    const ids=event.detail?.ids;
    if (!Array.isArray(ids) || ids.length!==8 || new Set(ids).size!==8 || ids.some(id=>!products.has(id))) return;
    const categories=ids.map(id=>products.get(id).category);
    if (!['cpu','gpu','motherboard','ram','storage','cooling','psu','case'].every(cat=>categories.includes(cat))) return;
    if(ids.some(id=>cart.some(item=>item.id===id && item.quantity>=99))){announce(t.limit);return;}
    ids.forEach(id=>{const item=cart.find(x=>x.id===id);if(item)item.quantity++;else cart.push({id,quantity:1});});
    save();announce(en?'Components added to your demonstration cart.':'Composants ajoutés au panier de démonstration.');
    document.dispatchEvent(new CustomEvent('nexrig:build-added'));
  });
  document.addEventListener('change', event => {
    if (!event.target.matches('[data-quantity]')) return;
    const input=event.target, item=cart.find(entry=>entry.id===input.dataset.quantity), value=Number(input.value);
    if (!item) return;
    if (!Number.isInteger(value) || value<1 || value>99) { input.value=String(item.quantity);announce(t.invalid);return; }
    item.quantity=value;save();document.getElementById(input.id)?.focus();announce(t.updated);
  });
  window.addEventListener('storage', event => { if (event.key===key || event.key===null) {cart=read();render();} });
  fetch(catalogueURL, {cache: 'no-cache'}).then(response=>{if(!response.ok)throw Error('catalogue');return response.json();}).then(data=>{
    if (!Array.isArray(data) || (catalogueCount && data.length !== catalogueCount)) throw Error('incomplete catalogue');
    const ids = new Set(data.map(p => p.id));
    if ([...document.querySelectorAll('[data-add-to-cart]')].some(button => !ids.has(button.dataset.addToCart))) throw Error('missing products');
    products=new Map(data.map(p=>[p.id,p]));cart=read();render();initFilters();initComparison();document.documentElement.dataset.cartReady="true";document.dispatchEvent(new CustomEvent("nexrig:cart-ready"));
    document.querySelectorAll('[data-add-to-cart]').forEach(button=>{button.disabled=false;});
    const loading=document.getElementById('cart-loading');if(loading)loading.hidden=true;
    const warning=document.getElementById('cart-storage-warning');if(warning&&!persistent){warning.hidden=false;warning.textContent=t.memory;}
  }).catch(()=>{announce(t.failed);const loading=document.getElementById('cart-loading');if(loading)loading.textContent=t.failed;});
})();
