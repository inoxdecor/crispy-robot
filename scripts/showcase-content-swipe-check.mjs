import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
  for(const viewport of [{width:360,height:640},{width:390,height:844},{width:412,height:915}]) {
    const context=await browser.newContext({viewport,isMobile:true,hasTouch:true});
    await context.addInitScript(()=>localStorage.setItem('benzz_analytics_consent_v1',JSON.stringify({version:1,choice:'denied'})));
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.env.TEST_BASE_URL || 'http://127.0.0.1:3011',{waitUntil:'domcontentloaded',timeout:60000});
    await page.locator('.showcase-scroll').waitFor();
    await page.evaluate(()=>scrollTo({top:document.querySelector('.showcase-journey').getBoundingClientRect().top+scrollY-76,behavior:'instant'}));
    const cdp=await context.newCDPSession(page);
    async function swipe(direction=1) {
      const point=await page.locator('#lay .mk').evaluate(el=>{
        const r=el.getBoundingClientRect(),s=document.querySelector('#stg').getBoundingClientRect();return {x:r.x+r.width/2,y:Math.min(innerHeight-40,r.bottom-20,s.bottom-20)};
      });
      const from=direction>0?point.y:Math.max(230,point.y-180),to=from-direction*180;
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:point.x,y:from}]});
      for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x,y:from+(to-from)*i/6}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.waitForTimeout(650);
    }
    const names=['Websites','Mobile apps','Dashboards','E-commerce','AI tools'];
    for(let i=1;i<names.length;i++) {
      await swipe();
      assert.equal(await page.locator('#tabs [aria-selected="true"]').textContent(),names[i]);
      const top=await page.locator('#build .sc').evaluate(el=>el.getBoundingClientRect().top);
      assert.ok(Math.abs(top-76)<=2,`Whole stage must stay pinned: ${top}`);
    }
    await swipe();
    assert.ok(Math.abs(await page.locator('#ai').evaluate(el=>el.getBoundingClientRect().top)-76)<=2,'Final swipe must leave Showcase for the next section');
    // Return to the section before tapping a visible tab, as a person would.
    await page.evaluate(()=>scrollTo({top:document.querySelector('.showcase-journey').getBoundingClientRect().top+scrollY-76,behavior:'instant'}));
    await page.waitForTimeout(250);
    await page.locator('#tabs button').nth(1).tap();
    await swipe();assert.equal(await page.locator('#tabs [aria-selected="true"]').textContent(),'Dashboards');
    await swipe(-1);assert.equal(await page.locator('#tabs [aria-selected="true"]').textContent(),'Mobile apps');
    await page.locator('#stg').evaluate(el=>{el.style.height='140px';el.scrollTop=0;});
    await swipe();
    assert.equal(await page.locator('#tabs [aria-selected="true"]').textContent(),'Mobile apps','Overflow content must be readable before advancing');
    await swipe();
    assert.equal(await page.locator('#tabs [aria-selected="true"]').textContent(),'Dashboards','Continuing on the preview must advance after reading its content');
    assert.deepEqual(errors,[]);
    console.log(`PASS ${viewport.width}x${viewport.height}: swipes ON preview, full sequence pinned, next-section exit, tap continuation and reverse`);
    await context.close();
  }
} finally {await browser.close();}
