const assert=require('node:assert/strict'),{chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const data=require('../data/products.json'), parts=data.find(p=>p.category==='pc').components;
const root=fs.mkdtempSync(path.join(os.tmpdir(),'nexrig-build-'));fs.symlinkSync(path.resolve(__dirname,'..'),path.join(root,'nexrig-pc'),'dir');
const server=require('node:child_process').spawn('python3',['-m','http.server','8766','--bind','127.0.0.1','--directory',root],{stdio:'ignore'});
(async()=>{let browser;try{
 for(let i=0;i<30;i++){try{await fetch('http://127.0.0.1:8766/');break;}catch{await new Promise(r=>setTimeout(r,100));}}
 browser=await chromium.launch({executablePath:'/usr/lib/chromium/chromium',args:['--no-sandbox']});const p=await browser.newPage();
 for(const lang of ['fr','en']){
  const url='http://127.0.0.1:8766/nexrig-pc/'+(lang==='fr'?'configurateur/':'en/pc-builder/');await p.goto(url);await p.waitForFunction(()=>document.documentElement.dataset.cartReady==='true');
  await p.evaluate(()=>{localStorage.clear();});await p.reload();await p.waitForFunction(()=>document.documentElement.dataset.cartReady==='true');
  assert(await p.locator('#build-add').isDisabled());
  for(const [cat,id] of Object.entries(parts))await p.locator('#build-'+cat).selectOption(id);
  assert(await p.locator('#build-add').isEnabled());const total=Object.values(parts).reduce((s,id)=>s+data.find(x=>x.id===id).demo_price_mad,0);
  assert.equal(await p.locator('#build-total').innerText(),new Intl.NumberFormat(lang==='fr'?'fr-MA':'en-MA',{style:'currency',currency:'MAD',maximumFractionDigits:0}).format(total));
  const cpu=data.find(x=>x.id===parts.cpu),badBoard=data.find(x=>x.category==='motherboard'&&x.socket!==cpu.socket);await p.locator('#build-motherboard').selectOption(badBoard.id);assert(await p.locator('#build-add').isDisabled());assert(await p.locator('.build-error').count()>0);await p.locator('#build-motherboard').selectOption(parts.motherboard);
  const ram=data.find(x=>x.id===parts.ram),badRAM=data.find(x=>x.category==='ram'&&x.memory_generation!==ram.memory_generation);await p.locator('#build-ram').selectOption(badRAM.id);assert(await p.locator('#build-add').isDisabled());await p.locator('#build-ram').selectOption(parts.ram);
  await p.reload();await p.waitForFunction(()=>!document.getElementById('build-add').disabled);assert.equal(await p.locator('#build-cpu').inputValue(),parts.cpu);
  for(const width of [320,390,768,1440]){await p.setViewportSize({width,height:900});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  for(const game of ['fortnite','valorant','cs2','overwatch-2','gta-v-legacy','gta-v-enhanced','apex-legends','rocket-league']){const before=await p.evaluate(()=>JSON.parse(localStorage.getItem('nexrig.demo-cart.v1')||'[]').reduce((n,x)=>n+x.quantity,0));await p.locator('#finder-game').selectOption(game);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('nexrig.demo-cart.v1')).reduce((n,x)=>n+x.quantity,0)),before+8);await p.locator('#game-finder-form button').click();assert.equal(await p.locator('#finder-result article').count(),0);for(const [cat,id] of Object.entries(parts))assert.equal(await p.locator('#build-'+cat).inputValue(),id);assert((await p.locator('#finder-result > a').getAttribute('href')).startsWith('https://'));}
  assert.equal(await p.locator('#finder-result article').count(),0);for(const [cat,id] of Object.entries(parts))assert.equal(await p.locator('#build-'+cat).inputValue(),id);
  for(const game of ['rust','arc-raiders','rainbow-six-siege']){await p.locator('#finder-game').selectOption(game);await p.locator('#game-finder-form button').click();assert((await p.locator('#finder-result').innerText()).includes(lang==='fr'?'Exigences à vérifier':'Requirements need verification'));assert.equal(await p.locator('#build-cpu').inputValue(),parts.cpu);}
  await p.locator('#finder-game').selectOption('fortnite');
  await p.locator('#finder-budget').fill('1');await p.locator('#game-finder-form button').click();assert((await p.locator('#finder-result').innerText()).includes(lang==='fr'?'Aucune sélection':'No component selection'));
  await p.locator('#finder-budget').fill('');await p.locator('#finder-game').selectOption('cs2');await p.locator('#game-finder-form button').click();assert((await p.locator('#finder-result > h3').innerText()).includes(lang==='fr'?'minimales':'Minimum'));
  assert(!/\d+\s*FPS/.test(await p.locator('#finder-result').innerText()));assert.equal(await p.locator('#build-cpu').inputValue(),parts.cpu);
  const alternateGPU=data.find(x=>x.category==='gpu'&&!require('../data/game-requirements.json').games[0].component_options.gpu.includes(x.id));await p.locator('#build-gpu').selectOption(alternateGPU.id);assert((await p.locator('#finder-selection-status').innerText()).includes(lang==='fr'?'non évaluée':'not been assessed'));await p.locator('#build-gpu').selectOption(parts.gpu);
  await p.evaluate(()=>{localStorage.removeItem('nexrig.demo-cart.v1');window.dispatchEvent(new StorageEvent('storage',{key:'nexrig.demo-cart.v1'}));});await p.locator('#build-add').click();const cart=await p.evaluate(()=>JSON.parse(localStorage.getItem('nexrig.demo-cart.v1')));assert.equal(cart.length,8);assert(cart.every(x=>x.quantity===1));assert.deepEqual(cart.map(x=>x.id).sort(),Object.values(parts).sort());
  await p.goto('http://127.0.0.1:8766/nexrig-pc/'+(lang==='fr'?'panier/':'en/cart/'));await p.waitForSelector('.cart-row');assert.equal(await p.locator('.cart-row').count(),8);
 }
 console.log('PASS: bilingual selector, totals, socket/RAM conflicts, saved selection, responsive layout and eight shared-cart items; game finder budget filtering, minimum-tier label and editable component suggestions.');
 }finally{if(browser)await browser.close();server.kill();fs.rmSync(root,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
