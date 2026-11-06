import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context = await browser.newContext({viewport:{width:1440,height:1000}});
await context.addInitScript(() => localStorage.setItem('benzz_analytics_consent_v1',JSON.stringify({version:1,choice:'denied'})));
await context.route(/https:\/\/(?:www\.)?(?:googletagmanager\.com|google-analytics\.com)\//,r=>r.abort());
const page = await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:3011';
const selected=()=>page.locator('.sh2[aria-expanded="true"]').innerText();
async function pin(selector='.service-journey'){await page.evaluate(selector=>scrollTo({top:document.querySelector(selector).getBoundingClientRect().top+scrollY-(innerWidth<=860?76:90),behavior:'instant'}),selector);await page.waitForTimeout(150);}
async function wheel(delta){await page.mouse.wheel(0,delta);await page.waitForTimeout(450);}
try {
  await page.goto(base); await page.locator('.service-scroll').waitFor();
  await pin(); await page.mouse.move(600,450);
  await wheel(100); assert.match(await selected(),/Mobile apps/);
  await wheel(100); assert.match(await selected(),/Software engineering/);
  await wheel(-100); assert.match(await selected(),/Mobile apps/);
  await page.locator('.sh2').nth(4).click();
  await wheel(100); assert.match(await selected(),/Design and brand/);
  await wheel(100); assert.match(await selected(),/Growth and support/);
  const end=await page.evaluate(()=>scrollY);
  await wheel(400); assert.ok(await page.evaluate(()=>scrollY)>end+100,'Last service must release page scrolling');
  await page.screenshot({path:'artifacts/service-scroll-desktop.png'});
  console.log('PASS desktop gestures, reverse, click continuation and boundary release');
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await mobile.addInitScript(() => localStorage.setItem('benzz_analytics_consent_v1',JSON.stringify({version:1,choice:'denied'})));
  const phone=await mobile.newPage(); await phone.goto(base); await phone.locator('.service-scroll').waitFor();
  const cdp=await mobile.newCDPSession(phone);
  await phone.evaluate(()=>scrollTo({top:document.querySelector('.service-journey').getBoundingClientRect().top+scrollY-76,behavior:'instant'}));
  await phone.waitForTimeout(150);
  async function swipe(up=true){
    const from=up?650:400,to=up?400:650;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:from}]});
    for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200,y:from+(to-from)*i/5}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await phone.waitForTimeout(600);
  }
  await swipe(); assert.match(await phone.locator('.sr.on').innerText(),/Mobile apps/);
  await swipe(); assert.match(await phone.locator('.sr.on').innerText(),/Software engineering/);
  await swipe(false); assert.match(await phone.locator('.sr.on').innerText(),/Mobile apps/);
  await phone.screenshot({path:'artifacts/service-scroll-mobile.png'});
  assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  console.log('PASS actual mobile swipe progression and reverse');
  await pin('.showcase-journey');
  await page.mouse.move(600,450);
  const showcaseSelected=()=>page.locator('#tabs [aria-selected="true"]').textContent();
  await wheel(100); assert.equal(await showcaseSelected(),'Mobile apps');
  await wheel(100); assert.equal(await showcaseSelected(),'Dashboards');
  await wheel(-100); assert.equal(await showcaseSelected(),'Mobile apps');
  await page.locator('#tabs button').nth(3).click();
  await wheel(100); assert.equal(await showcaseSelected(),'AI tools');
  assert.equal(await page.locator('#lay').getAttribute('aria-labelledby'),'t4');
  await page.screenshot({path:'artifacts/showcase-scroll-desktop.png'});
  const showcaseEnd=await page.evaluate(()=>scrollY);
  await wheel(350); assert.ok(await page.evaluate(()=>scrollY)>showcaseEnd+100);
  await page.locator('#tabs button').nth(1).click();
  await page.keyboard.press('ArrowRight');
  assert.equal(await showcaseSelected(),'Dashboards');
  await wheel(100); assert.equal(await showcaseSelected(),'E-commerce');
  console.log('PASS Showcase wheel/reverse/click/keyboard continuation and boundary release');
  await phone.evaluate(()=>scrollTo({top:document.querySelector('.showcase-journey').getBoundingClientRect().top+scrollY-76,behavior:'instant'}));
  await phone.waitForTimeout(200);
  await swipe(); assert.equal(await phone.locator('#tabs [aria-selected="true"]').textContent(),'Mobile apps');
  await swipe(); assert.equal(await phone.locator('#tabs [aria-selected="true"]').textContent(),'Dashboards');
  await swipe(false); assert.equal(await phone.locator('#tabs [aria-selected="true"]').textContent(),'Mobile apps');
  await phone.locator('#tabs button').nth(3).tap();
  await swipe(); assert.equal(await phone.locator('#tabs [aria-selected="true"]').textContent(),'AI tools');
  await phone.screenshot({path:'artifacts/showcase-scroll-mobile.png'});
  console.log('PASS Showcase mobile swipe/reverse/tap continuation');
  for (const viewport of [{width:390,height:667},{width:360,height:640}]) {
    await phone.setViewportSize(viewport);
    for (const [journeySelector,activeSelector,expected] of [
      ['.service-journey','.sh2[aria-expanded="true"]','Mobile apps'],
      ['.showcase-journey','#tabs [aria-selected="true"]','Mobile apps'],
    ]) {
      await phone.evaluate(selector=>scrollTo({top:document.querySelector(selector).getBoundingClientRect().top+scrollY-76,behavior:'instant'}),journeySelector);
      await phone.waitForTimeout(200);
      async function marginSwipe(up) {
        const from=up?500:300,to=up?300:500;
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:5,y:from}]});
        for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:5,y:from+(to-from)*i/5}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await phone.waitForTimeout(600);
      }
      await marginSwipe(true);
      assert.ok((await phone.locator(activeSelector).textContent()).includes(expected));
      await marginSwipe(false);
      assert.ok((await phone.locator(activeSelector).textContent()).toLowerCase().includes(journeySelector.includes('showcase')?'websites':'web development'));
      await phone.evaluate(selector=>{
        const journey=document.querySelector(selector);
        const count=selector.includes('showcase')?5:7;
        scrollBy({top:parseFloat(journey.style.getPropertyValue('--service-travel'))/(count-1),behavior:'instant'});
      },journeySelector);
      await phone.waitForTimeout(200);
      assert.ok((await phone.locator(activeSelector).textContent()).includes(expected),'Native page scrolling must select next item');
      assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await phone.setViewportSize({...viewport,height:viewport.height-50});
      await phone.waitForTimeout(150);
      assert.ok((await phone.locator(activeSelector).textContent()).includes(expected),'Browser toolbar resize must preserve selection');
      await phone.setViewportSize(viewport);
      await phone.waitForTimeout(150);
      await phone.screenshot({path:`artifacts/${journeySelector.includes('showcase')?'showcase':'services'}-mobile-${viewport.width}x${viewport.height}.png`});
    }
    console.log(`PASS ${viewport.width}x${viewport.height}: both sections, margin swipes/reverse and native scrolling`);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>!document.querySelector('.service-scroll'));
  assert.equal(await page.locator('.showcase-scroll').count(),0);
  assert.equal(await page.locator('.service-scroll').count(),0);
  await page.locator('.sh2').nth(2).click();
  assert.match(await selected(),/Software engineering/);
  assert.deepEqual(errors,[]);
  console.log('PASS reduced-motion accordion fallback; no runtime errors');
} finally {await browser.close();}
