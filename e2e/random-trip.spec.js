import {test,expect} from '@playwright/test';
test.beforeEach(async({context,page})=>{
 await context.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:5174'?route.continue():route.abort());
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#random-trip');await page.locator('#random-trip').scrollIntoViewIfNeeded();
});
for(const width of [360,768,1440])test(`RND 키보드 던지기·후보 복원 ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});
 await page.locator('[data-scope]').selectOption('11');
 const launch=page.getByRole('button',{name:'공 던지기'});await launch.focus();await page.keyboard.press('Enter');
 await expect(page.locator('[data-count]')).toHaveText('1');await expect(page.locator('[data-candidates]')).toContainText('서울특별시');
 await launch.click();await expect(page.locator('[data-count]')).toHaveText('1');await expect(page.locator('[data-status]')).toContainText('이미 담은');
 await page.reload();await expect(page.locator('[data-count]')).toHaveText('1');
 await page.locator('.primary-nav a[href="#candidates"]').click();await page.locator('[data-remove]').click();await expect(page.locator('[data-count]')).toHaveText('0');await page.locator('[data-undo]').click();await expect(page.locator('[data-count]')).toHaveText('1');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('RND 휠 확대와 실제 마우스 쓸어 던지기',async({page})=>{
 await page.setViewportSize({width:1440,height:1100});await page.locator('[data-scope]').selectOption('11');const svg=page.locator('.random-ground-svg');await svg.scrollIntoViewIfNeeded();await svg.hover();await page.mouse.wheel(0,-100);await expect(page.locator('[data-zoom-label]')).toHaveText('1.1×');
 await page.getByRole('button',{name:'랜덤 지도 축소',exact:true}).click();
 const box=await svg.boundingBox(),ball=await page.locator('[data-ball]').boundingBox(),x=ball.x+ball.width/2,y=ball.y+ball.height/2;
 await page.mouse.move(x,y);await page.mouse.down();
 // Maintain gesture velocity in wall-clock time, including browser rendering cost.
 const start=Date.now();while(Date.now()-start<450){await page.mouse.move(x,y-box.height/600*630*(Date.now()-start)/1000);await page.waitForTimeout(15);}
 await page.mouse.move(x,y-box.height/600*630*(Date.now()-start)/1000);
 await page.mouse.up();await expect(page.locator('[data-count]')).toHaveText('1');
});
test('RND 비행 중 범위 잠금과 크기 변경 취소',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('button',{name:'공 던지기'}).click();await expect(page.locator('[data-scope]')).toBeDisabled();
 await page.setViewportSize({width:900,height:900});await expect(page.locator('[data-status]')).toContainText('취소');await page.waitForTimeout(1800);await expect(page.locator('[data-count]')).toHaveText('0');
});
