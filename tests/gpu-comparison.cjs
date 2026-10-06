const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),os=require('os'),path=require('path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'nexrig-compare-'));fs.symlinkSync(path.resolve(__dirname,'..'),path.join(dir,'nexrig-pc'),'dir');
const server=require('child_process').spawn('python3',['-m','http.server','8779','--bind','127.0.0.1','--directory',dir],{stdio:'ignore'});
(async()=>{let browser;try{
for(let i=0;i<30;i++){try{await fetch('http://127.0.0.1:8779/');break}catch{await new Promise(r=>setTimeout(r,100));}}
browser=await chromium.launch({executablePath:'/usr/lib/chromium/chromium',args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message)});
const data=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/products.json'),'utf8')),gpus=data.filter(p=>p.category==='gpu');
await page.goto('http://127.0.0.1:8779/nexrig-pc/en/graphics-cards/');await page.waitForSelector('.gpu-compare-select');
assert.equal(await page.locator('.gpu-compare-select').count(),gpus.length);assert(await page.locator('[data-show-comparison]').isDisabled());
for(let i=0;i<3;i++)await page.locator('.gpu-compare-select').nth(i).click();
assert(await page.locator('.gpu-compare-select').nth(3).isDisabled());assert(await page.locator('.gpu-compare-select').nth(0).isEnabled());
await page.locator('[data-show-comparison]').click();assert(await page.locator('.comparison-results').isVisible());
assert.equal(await page.locator('.comparison-scroll thead th').count(),4);
const table=await page.locator('.comparison-scroll').textContent();for(const p of gpus.slice(0,3)){assert(table.includes(p.name));assert(table.includes(p.architecture));assert(table.includes(`${p.vram_gb} GB`));}
await page.locator('#shop-search').fill('no-matching-gpu');assert.equal(await page.locator('.shop-card:visible').count(),0);assert.equal(await page.locator('.comparison-selection li').count(),3);
await page.locator('[data-compare-remove]').first().click();assert.equal(await page.locator('.comparison-selection li').count(),2);assert.equal(await page.locator('.comparison-scroll thead th').count(),3);
await page.locator('#shop-search').fill('');await page.locator('[data-add-to-cart]').first().focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('[data-cart-count]').textContent==='1');assert.equal(await page.locator('[data-cart-count]').first().textContent(),'1');
await page.locator('[data-add-to-cart]').first().click();await page.waitForFunction(()=>document.querySelector('[data-cart-count]').textContent==='2');
await page.reload();await page.waitForSelector('.gpu-compare-select');assert.equal(await page.locator('.comparison-selection li').count(),2);
await page.locator('.language-switch').click();await page.waitForSelector('.gpu-compare-select');assert.equal(await page.locator('.comparison-selection li').count(),2);assert((await page.locator('#gpu-comparison-title').textContent()).includes('Comparer'));
await page.locator('[data-show-comparison]').click();assert((await page.locator('.comparison-scroll').textContent()).includes('Go'));
for(const width of [320,390,768]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(width<=390)assert(await page.locator('.comparison-scroll').evaluate(e=>e.scrollWidth>e.clientWidth));}
await page.locator('[data-clear-comparison]').click();assert.equal(await page.locator('.comparison-selection li').count(),0);assert(await page.locator('[data-show-comparison]').isDisabled());assert(!await page.locator('.comparison-results').isVisible());
await page.evaluate(()=>sessionStorage.setItem('nexrig.gpu-comparison.v1',JSON.stringify(['not-real','amd-ryzen-5-5600','nvidia-geforce-rtx-3060','nvidia-geforce-rtx-3060'])));await page.reload();await page.waitForSelector('.gpu-compare-select');assert.equal(await page.locator('.comparison-selection li').count(),1);
await page.goto('http://127.0.0.1:8779/nexrig-pc/en/shop/');await page.waitForSelector('.gpu-compare-select');assert.equal(await page.locator('.gpu-compare-select').count(),gpus.length);
await page.goto('http://127.0.0.1:8779/nexrig-pc/en/processors/');await page.waitForFunction(()=>document.documentElement.dataset.cartReady==='true');assert.equal(await page.locator('.gpu-comparison').count(),0);
const failed=await browser.newPage();await failed.route('**/data/products.json*',r=>r.abort());await failed.goto('http://127.0.0.1:8779/nexrig-pc/en/graphics-cards/');await failed.waitForFunction(()=>document.querySelector('#cart-status').textContent.includes('could not load'));assert.equal(await failed.locator('.gpu-compare-select').count(),0);await failed.close();
assert.deepEqual(errors,[]);console.log('PASS GPU comparison values, max 3, filters/removal, cart isolation, reload/language persistence, invalid storage, mobile/tablet scrolling, shop and failed fetch.');
}finally{if(browser)await browser.close();server.kill();fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
