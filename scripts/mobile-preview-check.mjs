import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
  for(const viewport of [{width:360,height:640},{width:375,height:812},{width:390,height:844}]) {
    const context=await browser.newContext({viewport,isMobile:true,hasTouch:true});
    await context.addInitScript(()=>localStorage.setItem('benzz_analytics_consent_v1',JSON.stringify({version:1,choice:'denied'})));
    const page=await context.newPage();
    await page.goto(process.env.TEST_BASE_URL || 'http://127.0.0.1:3011');
    await page.locator('.service-scroll').waitFor();
    for(let i=0;i<7;i++) {
      await page.locator('.sh2').nth(i).click();
      await page.waitForTimeout(650);
      const fit=await page.evaluate(()=>{
        const preview=document.querySelector('#pvp'),mockup=preview.querySelector('.mk');
        const p=preview.getBoundingClientRect(),m=mockup.getBoundingClientRect(),list=document.querySelector('#sr').getBoundingClientRect();
        return {contained:m.top>=p.top&&m.bottom<=p.bottom+1,fullWidth:m.width>=p.width-30,notClipped:mockup.scrollHeight<=mockup.clientHeight+2,notOverlapping:p.bottom<=list.top+1,visible:p.top>=55&&p.bottom<innerHeight,width:document.documentElement.scrollWidth<=innerWidth};
      });
      assert.ok(Object.values(fit).every(Boolean),`${viewport.width} service ${i}: ${JSON.stringify(fit)}`);
      if(i===1)await page.screenshot({path:`artifacts/services-clear-${viewport.width}.png`});
    }
    for(let i=0;i<5;i++) {
      await page.locator('#tabs button').nth(i).click();
      await page.waitForTimeout(650);
      const fit=await page.evaluate(()=>{
        const stage=document.querySelector('#stg'),preview=document.querySelector('#lay'),mockup=preview.querySelector('.mk');
        const p=preview.getBoundingClientRect(),s=stage.getBoundingClientRect(),card=stage.querySelector('.fp').getBoundingClientRect();
        const tab=document.querySelector('#tabs [aria-selected="true"]').getBoundingClientRect();
        return {contained:p.left>=s.left-1&&p.right<=s.right+1,notClipped:mockup.scrollHeight<=mockup.clientHeight+2,notOverlapping:p.bottom<=card.top+1,tabVisible:tab.left>=-1&&tab.right<=innerWidth+1,width:document.documentElement.scrollWidth<=innerWidth};
      });
      assert.ok(Object.values(fit).every(Boolean),`${viewport.width} showcase ${i}: ${JSON.stringify(fit)}`);
      if(i===1)await page.screenshot({path:`artifacts/showcase-clear-${viewport.width}.png`});
    }
    console.log(`PASS ${viewport.width}x${viewport.height}: all 7 service and 5 Showcase previews contained, no overlap/clipping/overflow`);
    await context.close();
  }
} finally {await browser.close();}
