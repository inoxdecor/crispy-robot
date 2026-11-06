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
async function pin(){await page.evaluate(()=>scrollTo({top:document.querySelector('.service-journey').getBoundingClientRect().top+scrollY-(innerWidth<=860?76:90),behavior:'instant'}));await page.waitForTimeout(150);}
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
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>!document.querySelector('.service-scroll'));
  assert.equal(await page.locator('.service-scroll').count(),0);
  await page.locator('.sh2').nth(2).click();
  assert.match(await selected(),/Software engineering/);
  assert.deepEqual(errors,[]);
  console.log('PASS reduced-motion accordion fallback; no runtime errors');
} finally {await browser.close();}
