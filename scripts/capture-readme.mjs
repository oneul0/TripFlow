// Explicit documentation capture: synthetic data only; never reuse a live server.
import {chromium,expect} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:5178',dir='docs/screenshots/readme';
await mkdir(dir,{recursive:true});
try{await fetch(origin);throw Error('Capture port is occupied; stop that server first.');}catch(e){if(e.message.includes('occupied'))throw e;}
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--mode','harness','--port','5178','--strictPort'],{stdio:'ignore',windowsHide:true});
let browser;
try{
 for(let n=0;;n++){try{if((await fetch(origin)).ok)break;}catch{}if(n>80)throw Error('Capture server unavailable');await new Promise(r=>setTimeout(r,250));}
 browser=await chromium.launch({channel:'msedge'});const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});
 await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
 const page=await context.newPage();
 async function go(hash){await page.goto(origin+'/#'+hash);await page.locator('[data-app-view]:visible').waitFor();await page.evaluate(()=>document.fonts.ready);}
 async function shot(name,selector){await page.evaluate(()=>document.activeElement?.blur());const target=selector?page.locator(selector):page;if(selector)await target.scrollIntoViewIfNeeded();else await page.evaluate(()=>window.scrollTo(0,0));await target.screenshot({path:dir+'/'+name+'.png',animations:'disabled'});console.log(name);}
 await go('home');await shot('home');
 await go('explore');await page.locator('.place-card').first().waitFor();await page.locator('[data-result-view=map]').click();await shot('f101-map','#explore');
 await page.locator('[data-result-view=list]').click();await page.getByLabel('지역',{exact:true}).selectOption('39');await page.getByLabel('콘텐츠 유형').selectOption('39');await page.getByRole('button',{name:'여행지 찾기'}).click();await expect(page.locator('#results')).toContainText('제주');await shot('f102-food','#explore');
 await page.getByLabel('지역',{exact:true}).selectOption('1');await page.getByLabel('콘텐츠 유형').selectOption('14');await page.getByRole('button',{name:'여행지 찾기'}).click();await expect(page.locator('#results')).toContainText('박물관');await shot('f103-culture','#explore');
 await page.getByRole('button',{name:'회원가입',exact:true}).click();await shot('f107-signup','#account-dialog');
 await page.getByLabel('이름',{exact:true}).fill('여행자 가온');await page.getByLabel('이메일',{exact:true}).fill('readme@example.test');await page.getByLabel('비밀번호',{exact:true}).fill('synthetic123');await page.getByLabel('비밀번호 확인',{exact:true}).fill('synthetic123');await page.getByRole('button',{name:'가입하기',exact:true}).click();await page.locator('#recovery-code').waitFor();await page.getByRole('button',{name:'닫기',exact:true}).click();
 await page.getByRole('button',{name:'로그인',exact:true}).click();await shot('f108-login','#account-dialog');await page.getByRole('button',{name:'비밀번호 찾기',exact:true}).click();await shot('f108-recovery','#account-dialog');await page.getByRole('button',{name:'닫기',exact:true}).click();
 await page.getByRole('button',{name:'로그인',exact:true}).click();await page.getByLabel('이메일',{exact:true}).fill('readme@example.test');await page.getByLabel('비밀번호',{exact:true}).fill('synthetic123');await page.getByRole('button',{name:'로그인하기',exact:true}).click();await page.getByRole('button',{name:'내 정보',exact:true}).click();await shot('f107-profile','#account-dialog');await page.getByRole('button',{name:'닫기',exact:true}).click();
 await go('course-editor');await page.locator('[data-picker-results] article').first().waitFor();await page.getByRole('button',{name:'후보 담기',exact:true}).first().click();await page.getByRole('button',{name:'후보 담기',exact:true}).first().click();await shot('f104-pick','#course-editor');await page.getByRole('button',{name:'후보로 코스 구성하기 →'}).click();await page.getByRole('button',{name:'코스에 추가',exact:true}).first().click();await page.getByRole('button',{name:'코스에 추가',exact:true}).click();await shot('f104-build','#course-editor');await page.getByRole('button',{name:'코스 생성',exact:true}).click();await shot('f104-ticket','.ticket-preview');
 await page.getByRole('button',{name:'후기로 공유',exact:true}).click();await page.getByLabel('제목',{exact:true}).fill('서울에서 천천히 걷는 하루');await page.getByLabel('본문',{exact:true}).fill('먼저 둘러볼 장소와 다음 목적지를 연결해 하루 코스를 만들었어요. 각 장소의 체류 시간은 여유 있게 잡아보세요. 이 글은 화면 소개용 샘플입니다.');await shot('f110-write','#board');await page.getByRole('button',{name:'게시글 등록',exact:true}).click();await page.locator('.board-detail').waitFor();await shot('f110-detail','#board');await go('board');await shot('f110-board','#board');
 await go('courses');await shot('f104-shared','#courses');await go('my-trips');await shot('f104-my-trips','#my-trips');
 await go('random-trip');await page.locator('.random-ground-svg').waitFor();await shot('rnd-game','#random-trip');await page.locator('[data-scope]').selectOption('11');await page.locator('[data-throw]').click();await expect(page.locator('[data-count]')).toHaveText('1');await go('candidates');await shot('rnd-candidates','#candidates');
 await page.setViewportSize({width:360,height:900});await go('home');await shot('nf-mobile');
}finally{await browser?.close();server.kill();}

