import {test,expect} from '@playwright/test';
test.beforeEach(async({context})=>{
 await context.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:5174'?route.continue():route.abort());
});
for(const width of [360,768,1440])test(`TOUR-45 세부 분류 접기와 샘플 안내 ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/#explore');
 const details=page.locator('.classification-filter');await expect(details).not.toHaveAttribute('open','');
 await details.locator('summary').focus();await page.keyboard.press('Enter');
 await expect(details).toHaveAttribute('open','');
 await expect(details).toContainText('샘플에는 세부 분류 정보가 없습니다');
 await expect(page.getByLabel('대분류',{exact:true})).toBeDisabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:/여행지 찾기/}).click();await expect(page.locator('.place-card').first()).toBeVisible();
});
