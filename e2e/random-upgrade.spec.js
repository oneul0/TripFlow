import {test,expect} from '@playwright/test';
test.beforeEach(async({context,page})=>{await context.route('**/*',r=>new URL(r.request().url()).origin==='http://127.0.0.1:5174'?r.continue():r.abort());await page.goto('/#random-trip');await page.locator('#random-trip').scrollIntoViewIfNeeded();});
test('RND-11 공 렌더러와 지도 투영의 화면 크기가 일치한다',async({page})=>{await page.setViewportSize({width:1440,height:1100});const ground=await page.locator('.random-ground-svg').boundingBox(),scene=await page.locator('.random-ball-scene').boundingBox();expect(scene.width).toBeCloseTo(ground.width,0);expect(scene.height).toBeCloseTo(ground.height,0);expect(scene.x).toBeCloseTo(ground.x,0);});
test('RND-10 던지기 전 원형 드래그가 공을 회전시킨다',async({page})=>{await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('.random-ground-svg').scrollIntoViewIfNeeded();const ball=page.locator('[data-ball]'),b=await ball.boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;await page.mouse.move(x,y);await page.mouse.down();for(let i=0;i<=30;i++)await page.mouse.move(x+28*Math.cos(i/4),y+28*Math.sin(i/4));expect(Math.abs(Number(await ball.getAttribute('data-rotation')))).toBeGreaterThan(180);await page.locator('.random-ground-svg').dispatchEvent('pointercancel');await page.mouse.up();await expect(page.locator('[data-count]')).toHaveText('0');});
test('RND-12 전국 부산 읍면동과 제주 후보·관광정보',async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('[data-scope] option')).toHaveCount(18);await page.locator('[data-scope]').selectOption({label:'부산광역시'});await page.locator('[data-city]').selectOption({label:'해운대구'});await expect(page.locator('[data-level]')).toHaveValue('town');expect(await page.locator('[data-shapes] path').count()).toBeGreaterThan(10);await page.locator('[data-scope]').selectOption({label:'제주특별자치도'});await page.locator('[data-power]').fill('220');await page.locator('[data-throw]').click();await expect(page.locator('[data-candidates]')).toContainText('제주특별자치도');await page.locator('.primary-nav a[href="#candidates"]').click();await page.locator('[data-details]').first().click();await expect(page.locator('[data-tour-status]')).toContainText('합성 샘플');await expect(page.locator('[data-detail-note]')).toContainText('전체 관광정보');await expect(page.locator('[data-region-map] svg')).toBeVisible();});

test('RND-SPIN-01 잡은 공 관성·감쇠·반짝이 및 취소 정리',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('.random-ground-svg').scrollIntoViewIfNeeded();
 const ball=page.locator('[data-ball]'),b=await ball.boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;
 await page.mouse.move(x,y);await page.mouse.down();await expect(page.locator('#random-trip')).toHaveAttribute('data-holding','true');
 for(let i=0;i<=30;i++)await page.mouse.move(x+28*Math.cos(i/4),y+28*Math.sin(i/4));
 const before=Number(await ball.getAttribute('data-rotation'));await page.waitForTimeout(250);const after=Number(await ball.getAttribute('data-rotation'));expect(after).toBeGreaterThan(before);
 const speed=Number((await page.locator('[data-spin]').textContent()).replace('SPIN ',''));await page.waitForTimeout(300);expect(Number((await page.locator('[data-spin]').textContent()).replace('SPIN ',''))).toBeLessThan(speed);
 expect(await page.locator('[data-sparkles] path').count()).toBeGreaterThan(0);expect(await page.locator('[data-sparkles] path').count()).toBeLessThanOrEqual(12);
 await page.locator('.random-ground-svg').dispatchEvent('pointercancel');await page.mouse.up();await expect(page.locator('[data-sparkles] path')).toHaveCount(0);await expect(page.locator('[data-held-glow]')).toHaveAttribute('visibility','hidden');
 await page.waitForTimeout(100);expect(Number(await ball.getAttribute('data-rotation'))).toBe(0);
});
test('RND-SPIN-01 모션 감소에서는 정적 잡기 표시만 제공',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.random-ground-svg').scrollIntoViewIfNeeded();const b=await page.locator('[data-ball]').boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await expect(page.locator('[data-held-glow]')).toHaveAttribute('visibility','visible');await page.waitForTimeout(200);await expect(page.locator('[data-sparkles] path')).toHaveCount(0);await page.locator('.random-ground-svg').dispatchEvent('pointercancel');await page.mouse.up();
});

test('RND-ZOOM-01 축소로 읍면동→시도→전국 복귀',async({page})=>{
 await page.locator('[data-scope]').selectOption({label:'부산광역시'});await page.locator('[data-city]').selectOption({label:'해운대구'});
 await page.getByRole('button',{name:'랜덤 지도 확대',exact:true}).click();await page.getByRole('button',{name:'랜덤 지도 축소',exact:true}).click();
 await expect(page.locator('[data-level]')).toHaveValue('town');await expect(page.locator('[data-zoom-label]')).toHaveText('1.0×');
 await page.getByRole('button',{name:'랜덤 지도 축소',exact:true}).click();await expect(page.locator('[data-level]')).toHaveValue('city');await expect(page.locator('[data-city]')).toHaveValue('');await expect(page.locator('[data-scope]')).not.toHaveValue('');
 const svg=page.locator('.random-ground-svg');await svg.scrollIntoViewIfNeeded();await svg.hover();await page.mouse.wheel(0,150);
 await expect(page.locator('[data-scope]')).toHaveValue('');await expect(page.locator('[data-level]')).toHaveValue('province');await expect(page.locator('[data-shapes] path')).toHaveCount(17);
 await page.getByRole('button',{name:'랜덤 지도 축소',exact:true}).click();await expect(page.locator('[data-zoom-label]')).toHaveText('1.0×');await expect(page.locator('[data-count]')).toHaveText('0');
});
