const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'nexrig-realistic-'));
fs.symlinkSync(path.resolve(__dirname,'..'),path.join(dir,'nexrig-pc'),'dir');
const server=require('node:child_process').spawn('python3',['-m','http.server','8782','--bind','127.0.0.1','--directory',dir],{stdio:'ignore'});
(async()=>{let browser;try{
 for(let i=0;i<30;i++){try{await fetch('http://127.0.0.1:8782/');break;}catch{await new Promise(r=>setTimeout(r,100));}}
 browser=await chromium.launch({executablePath:'/usr/lib/chromium/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const lang of ['fr','en']){
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];let requests=0;
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/yolala-custom-pc/pc.glb'))requests++;});
  await page.goto('http://127.0.0.1:8782/nexrig-pc/'+(lang==='en'?'en/pc-builder/':'configurateur/'));
  await page.locator('#preview-toggle').click();const select=page.locator('.preview-part-select'),stage=page.locator('.motherboard-stage');await select.waitFor();
  assert.equal(requests,0,'The detailed model must not load in the generic preview');
  await select.selectOption('realistic');await page.waitForFunction(()=>document.querySelector('.motherboard-stage').dataset.exampleModel==='ready',null,{timeout:60000});
  assert.equal(requests,1);assert.equal(await stage.getAttribute('data-example-fans'),'6');
  assert(await page.locator('.preview-model-credit').isVisible());
  assert.equal(await page.locator('.preview-model-credit a').last().getAttribute('href'),'https://creativecommons.org/licenses/by/4.0/');
  assert((await page.locator('.preview-count').textContent()).includes('RTX 2060'));
  assert(await page.getByRole('button',{name:lang==='en'?'Exploded view':'Vue éclatée',exact:true}).isDisabled());
  const power=page.getByRole('button',{name:lang==='en'?'Power on PC':'Allumer le PC',exact:true});await power.click();await stage.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>Number(document.querySelector('.motherboard-stage').dataset.animationFrames)>1);
  const frames=Number(await stage.getAttribute('data-animation-frames'));
  const side=page.getByRole('button',{name:lang==='en'?'Open side panel':'Ouvrir le panneau latéral',exact:true});await side.click();assert.equal(await side.getAttribute('aria-pressed'),'true');assert.equal(await stage.getAttribute('data-powered'),'true');await side.click();
  const zoom=page.getByLabel('Zoom',{exact:true});await zoom.fill('140');await zoom.dispatchEvent('input');assert(Number(await stage.getAttribute('data-preview-zoom'))<9);
  if(lang==='en')await stage.screenshot({path:'/tmp/nexrig-realistic-pc.png'});
  await page.getByRole('button',{name:lang==='en'?'Power off PC':'Éteindre le PC',exact:true}).click();assert.equal(await stage.getAttribute('data-animation-active'),'false');
  const stopped=await stage.getAttribute('data-animation-frames');await page.waitForTimeout(120);assert.equal(await stage.getAttribute('data-animation-frames'),stopped);assert(Number(stopped)>=frames);
  for(const width of [320,390,768]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await select.selectOption('build');assert(!(await page.locator('.preview-model-credit').isVisible()));
  await page.locator('#finder-game').selectOption('fortnite');await page.waitForFunction(()=>document.querySelector('.motherboard-stage').dataset.gpuModel==='ready');
  await select.selectOption('gpu');assert.equal(await stage.getAttribute('data-installed-parts'),'gpu');
  await select.selectOption('realistic');assert.equal(requests,1,'Reuse the decoded example model');
  assert.deepEqual(errors,[]);await page.close();
 }
 const page=await browser.newPage();await page.route('**/yolala-custom-pc/pc.glb*',r=>r.abort());
 await page.goto('http://127.0.0.1:8782/nexrig-pc/en/pc-builder/');await page.locator('#preview-toggle').click();await page.locator('.preview-part-select').selectOption('realistic');
 await page.waitForFunction(()=>document.querySelector('.motherboard-stage').dataset.exampleModel==='failed');assert(await page.locator('#build-gpu').isEnabled());assert(await page.getByRole('button',{name:'Retry models',exact:true}).isVisible());
 await page.unroute('**/yolala-custom-pc/pc.glb*');await page.getByRole('button',{name:'Retry models',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.motherboard-stage').dataset.exampleModel==='ready',null,{timeout:60000});await page.close();
 console.log('PASS bilingual realistic model: lazy local compressed loading, six animated rotors, visible attribution, fixed configuration disclosure, power/panel/zoom, mobile layout, cached switching to generic parts and failed-load retry.');
}finally{if(browser)await browser.close();server.kill();fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
