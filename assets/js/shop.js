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
        return `<article class="cart-row"><img src="/nexrig-pc/assets/images/${p.category}-illustration.svg" alt="" width="480" height="320"><div><h2><a href="${productURL(p.id)}">${esc(p.name)}</a></h2><span>${money(p.demo_price_mad)}</span><small class="shop-disclaimer">${t.demo}</small><div class="cart-controls"><label for="qty-${p.id}">${t.qty}<input id="qty-${p.id}" class="cart-quantity" data-quantity="${p.id}" type="number" min="1" max="99" step="1" value="${item.quantity}" aria-label="${t.qty}: ${esc(p.name)}"></label><button class="shop-button secondary" type="button" data-remove="${p.id}" aria-label="${t.remove}: ${esc(p.name)}">${t.remove}</button></div><p class="shop-specs">${t.total}: ${money(p.demo_price_mad * item.quantity)}</p></div></article>`;
      }).join('');
    }
    const total = cart.reduce((sum, item) => sum + products.get(item.id).demo_price_mad * item.quantity, 0);
    document.getElementById('cart-total').textContent = money(total);
    document.getElementById('clear-cart').disabled = !cart.length;
  }
  function initFilters() {
    const form = document.querySelector('[data-shop-filters]');
    if (!form) return;
    form.hidden = false;
    const cards = [...document.querySelectorAll('.shop-grid [data-product-id]')];
    const count = document.getElementById('shop-result');
    const empty = document.getElementById('shop-empty');
    function filter() {
      const query = form.elements.search.value.trim().toLocaleLowerCase();
      const brand = form.elements.brand.value;
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
        const matches = (!wattage || String(p.wattage) === wattage) && (!modularity || p.modularity === modularity) && (!chipBrand || (p.chip_brand || p.brand) === chipBrand) && (!brand || p.brand === brand) && (!generation || p.memory_generation === generation) && (!capacity || String(p.capacity_gb) === capacity) && (!driveType || p.drive_type === driveType) && (!protocol || p.storage_protocol === protocol) && `${p.name} ${p.sku || ''}`.toLocaleLowerCase().includes(query);
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
    products=new Map(data.map(p=>[p.id,p]));cart=read();render();initFilters();
    document.querySelectorAll('[data-add-to-cart]').forEach(button=>{button.disabled=false;});
    const loading=document.getElementById('cart-loading');if(loading)loading.hidden=true;
    const warning=document.getElementById('cart-storage-warning');if(warning&&!persistent){warning.hidden=false;warning.textContent=t.memory;}
  }).catch(()=>{announce(t.failed);const loading=document.getElementById('cart-loading');if(loading)loading.textContent=t.failed;});
})();
