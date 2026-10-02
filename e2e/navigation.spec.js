import {test,expect} from '@playwright/test';
test.beforeEach(async({context,page})=>{await context.route('**/*',r=>new URL(r.request().url()).origin==='http://127.0.0.1:5174'?r.continue():r.abort());await page.emulateMedia({reducedMotion:'reduce'});});
for(const width of [360,768,1440])test(`UIA 홈→랜덤→후보→상세, 최대 3단계 ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/');
 await expect(page.locator('[data-app-view]:visible')).toHaveCount(1);await expect(page.locator('#home')).toBeVisible();
 for(const link of await page.locator('.primary-nav a').all())await expect(link).toBeVisible();
 await page.locator('.primary-nav a[href="#random-trip"]').focus();await page.keyboard.press('Enter');
 await expect(page.locator('#random-trip h2')).toBeFocused();await page.locator('[data-scope]').selectOption('11');await page.locator('[data-throw]').click();
 await page.locator('.random-bag-link').click();await expect(page.locator('#candidates')).toBeVisible();await page.locator('[data-details]').first().click();
 await expect(page.locator('#candidate-detail')).toBeVisible();await expect(page.locator('[data-app-view]:visible')).toHaveAttribute('data-depth','3');
 await expect(page.locator('[data-tour-status]')).toContainText('합성 샘플');await page.reload();await expect(page.locator('#candidate-detail')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('.back-link').click();await expect(page.locator('#candidates')).toBeVisible();await page.goBack();await expect(page.locator('#candidate-detail')).toBeVisible();
 await page.locator('.primary-nav a[href="#explore"]').click();await page.getByLabel('지역',{exact:true}).selectOption('39');await page.locator('[data-result-view="map"]').click();
 await page.locator('.primary-nav a[href="#home"]').click();await page.locator('.primary-nav a[href="#explore"]').click();await expect(page.getByLabel('지역',{exact:true})).toHaveValue('39');await expect(page.locator('#map-explorer')).toBeVisible();await expect(page.locator('#results')).toBeHidden();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('UIA 없는 후보 주소 안내와 비행 중 이동 취소',async({page})=>{
 await page.goto('/#candidate/missing');await expect(page).toHaveURL(/#candidates$/);await expect(page.locator('[data-route-message]')).toContainText('찾을 수 없습니다');
 await page.locator('.primary-nav a[href="#random-trip"]').click();await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('[data-throw]').click();await page.locator('.primary-nav a[href="#home"]').click();
 await page.waitForTimeout(1800);await page.locator('.primary-nav a[href="#random-trip"]').click();await expect(page.locator('[data-count]')).toHaveText('0');await expect(page.locator('[data-status]')).toContainText('취소');
});
