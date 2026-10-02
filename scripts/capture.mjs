import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
await mkdir('docs/screenshots',{recursive:true});
const browser=await chromium.launch({channel:'msedge'});
try {
 for(const width of [360,1440]){
  const page=await browser.newPage({viewport:{width,height:1000}});
  await page.goto('http://127.0.0.1:5173');
  await page.locator('.place-card').first().waitFor();
  await page.evaluate(() => {
   window.scrollTo(0,document.body.scrollHeight);
  });
  await page.locator('.about').scrollIntoViewIfNeeded();
  await page.evaluate(() => { window.scrollTo({top:0,behavior:'instant'}); document.getAnimations().forEach(animation=>animation.finish()); });
  await page.screenshot({path:`docs/screenshots/home-${width}.png`,fullPage:true});
  await page.screenshot({path:`docs/screenshots/home-${width}-preview.png`});
  await page.close();
 }
} finally {await browser.close();}
