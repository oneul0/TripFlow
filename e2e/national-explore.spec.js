import {test,expect} from '@playwright/test';
test.beforeEach(async({context})=>{await context.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:5174'?route.continue():route.abort());});
for(const width of [360,768,1440])test(`MAP-20 전국 지역 선택 ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/#explore');
 for(const [area,name] of [['6','부산'],['39','제주']]){
  await page.getByLabel('지역',{exact:true}).selectOption(area);await page.getByRole('button',{name:'여행지 찾기',exact:true}).click();await page.getByRole('button',{name:'지도 보기',exact:true}).click();
  await expect(page.locator('#map-explorer h3')).toContainText(name);
  await expect(page.locator('#district-list')).not.toContainText('강남구');
  await page.locator('#district-list button').first().click();await expect(page.getByLabel('지역',{exact:true})).toHaveValue(area);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
