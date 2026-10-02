import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
for(const width of [360,768,1440])test('CB-FLOW 후보부터 PNG 티켓까지 '+width,async({page,context})=>{
 await context.route('**/*',r=>new URL(r.request().url()).origin==='http://127.0.0.1:5174'?r.continue():r.abort());await page.setViewportSize({width,height:1000});await page.goto('/#course-editor');
 await expect(page.locator('[data-picker-results] article').first()).toBeVisible();
 await page.getByRole('button',{name:'후보 담기',exact:true}).first().click();await page.getByRole('button',{name:'후보 담기',exact:true}).first().click();await expect(page.locator('.picked-count')).toContainText('2곳');
 await page.getByRole('button',{name:'후보로 코스 구성하기 →'}).click();await page.getByRole('button',{name:'코스에 추가',exact:true}).first().click();await page.getByRole('button',{name:'코스에 추가',exact:true}).click();
 const titles=await page.locator('[data-course-stops] strong').allTextContents();await page.getByRole('button',{name:'← 후보 다시 고르기'}).click();await page.getByRole('button',{name:'후보로 코스 구성하기 →'}).click();expect(await page.locator('[data-course-stops] strong').allTextContents()).toEqual(titles);
 await page.getByRole('button',{name:'코스 생성',exact:true}).click();await expect(page.locator('.ticket-preview')).toBeVisible();for(const title of titles)await expect(page.locator('.ticket-preview')).toContainText(title);
 const received=page.waitForEvent('download');await page.getByRole('button',{name:'티켓 이미지 다운로드'}).click();const download=await received;expect(download.suggestedFilename()).toBe('tripflow-course-ticket.png');const data=await readFile(await download.path());expect(data.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');expect(data.readUInt32BE(16)).toBe(800);expect(data.readUInt32BE(20)).toBeGreaterThan(500);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByRole('button',{name:'코스 다시 수정'}).click();await page.locator('[data-remove-stop]').last().click();await expect(page.getByRole('button',{name:'3. 생성 · 티켓 받기'})).toBeDisabled();
});
