import {test,expect} from '@playwright/test';
test.beforeEach(async({context,page})=>{
 await context.route('**/*',r=>new URL(r.request().url()).origin==='http://127.0.0.1:5174'?r.continue():r.abort());
 await page.emulateMedia({reducedMotion:'reduce'});
});
for(const width of [360,768,1440])test(`EDIT-01~04 홈·커뮤니티·지도 ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/#home');
 await expect(page.locator('.home-story')).toHaveCount(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('.home-story').first().focus();await page.keyboard.press('Enter');
 await expect(page.locator('.board-detail h2')).toBeFocused();
 expect((await page.locator('.board-detail').boundingBox()).width).toBeLessThanOrEqual(760);
 await page.getByRole('button',{name:'← 목록으로',exact:true}).click();
 await expect(page.locator('.board-featured-card')).toHaveCount(0);
 await expect(page.locator('.board-row-excerpt').first()).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('.primary-nav a[href="#explore"]').click();
 await page.getByRole('button',{name:'지도 보기',exact:true}).click();
 const panel=await page.locator('.region-panel').boundingBox(),map=await page.locator('.map-stage').boundingBox();
 if(width===1440){expect(panel.x).toBeLessThan(map.x);expect(panel.width).toBe(400);}else expect(panel.y).toBeGreaterThan(map.y);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
