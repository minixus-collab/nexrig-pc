const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),os=require('os'),path=require('path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'nexrig-search-'));fs.symlinkSync(path.resolve(__dirname,'..'),path.join(dir,'nexrig-pc'),'dir');
const server=require('child_process').spawn('python3',['-m','http.server','8772','--bind','127.0.0.1','--directory',dir],{stdio:'ignore'});
(async()=>{let browser;try{
for(let i=0;i<30;i++){try{await fetch('http://127.0.0.1:8772/');break}catch{await new Promise(r=>setTimeout(r,100));}}
browser=await chromium.launch({executablePath:'/usr/lib/chromium/chromium',args:['--no-sandbox']});const page=await browser.newPage();
for(const lang of ['fr','en'])for(const width of [320,390,1440]){
await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:8772/nexrig-pc/'+(lang==='en'?'en/':''));
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${lang} ${width}`);
await page.locator('.search-toggle').click();assert.equal(await page.locator('#header-search-input').evaluate(e=>e===document.activeElement),true);
await page.keyboard.press('Escape');assert.equal(await page.locator('.search-toggle').getAttribute('aria-expanded'),'false');
await page.locator('.search-toggle').click();await page.locator('#header-search-input').fill('Ryzen 5 5600');await page.locator('#header-search-form button').click();
await page.waitForFunction(()=>document.querySelector('[data-shop-filters]')?.hidden===false);
assert.equal(await page.locator('#shop-search').inputValue(),'Ryzen 5 5600');assert(await page.locator('.shop-card:visible').count()>0);
assert.equal(await page.locator('.shop-card:visible').evaluateAll(cards=>cards.every(c=>c.textContent.includes('Ryzen 5 5600'))),true);
await page.locator('#shop-search').fill('no-such-product-zzz');assert(await page.locator('#shop-empty').isVisible());
}
console.log('PASS bilingual header search, filtered navigation, no matches, Escape/focus and responsive widths.');
}finally{if(browser)await browser.close();server.kill();fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
