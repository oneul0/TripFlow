import {test,expect} from '@playwright/test';
test.beforeEach(async({context})=>{await context.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:5174'?route.continue():route.abort());});
async function login(page){
 await page.getByRole('button',{name:'회원가입',exact:true}).click();await page.getByLabel('이름',{exact:true}).fill('합성회원');await page.getByLabel('이메일',{exact:true}).fill('board@example.test');await page.getByLabel('비밀번호',{exact:true}).fill('synthetic123');await page.getByLabel('비밀번호 확인',{exact:true}).fill('synthetic123');await page.getByRole('button',{name:'가입하기',exact:true}).click();await expect(page.locator('#recovery-code')).toBeVisible();await page.getByRole('button',{name:'닫기',exact:true}).click();
 await page.getByRole('button',{name:'로그인',exact:true}).click();await page.getByLabel('이메일',{exact:true}).fill('board@example.test');await page.getByLabel('비밀번호',{exact:true}).fill('synthetic123');await page.getByRole('button',{name:'로그인하기',exact:true}).click();await expect(page.getByRole('button',{name:'내 정보',exact:true})).toBeVisible();
}
for(const width of [360,768,1440])test(`F110-COURSE 저장 코스→후기→복원 ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/#home');await login(page);
 await page.goto('/#course-editor');await page.getByLabel('목적 지역',{exact:true}).selectOption('1');await page.getByRole('button',{name:'코스 추천받기',exact:true}).click();await page.getByRole('button',{name:'이 코스 저장',exact:true}).click();
 await page.getByRole('button',{name:'후기로 공유',exact:true}).click();await expect(page).toHaveURL(/#board\/write\?courseId=/);
 await expect(page.locator('[data-attachment-status]')).toHaveText('코스를 첨부했습니다.');
 const before=await page.locator('[data-attachment-preview] li').allTextContents();expect(before.length).toBeGreaterThan(0);
 await page.getByLabel('제목',{exact:true}).fill('코스 첨부 후기');await page.getByLabel('본문',{exact:true}).fill('합성 방문 후기');await page.getByRole('button',{name:'게시글 등록',exact:true}).click();
 await expect(page).toHaveURL(/#board\/post\//);await page.reload();await expect(page.locator('.board-detail h2')).toHaveText('코스 첨부 후기');expect(await page.locator('.board-course-attachment li').allTextContents()).toEqual(before);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('#board')).toHaveAttribute('data-depth','3');
 await page.getByRole('button',{name:'수정',exact:true}).click();await page.getByLabel('본문',{exact:true}).fill('수정한 본문');await page.getByRole('button',{name:'수정 저장',exact:true}).click();expect(await page.locator('.board-course-attachment li').allTextContents()).toEqual(before);
 await page.getByRole('button',{name:'삭제',exact:true}).click();await page.getByRole('button',{name:'삭제하기',exact:true}).click();await expect(page).toHaveURL(/#board$/);
});

test('F110-COURSE-02 비로그인 직접 진입 후 로그인하면 이어쓴다',async({page})=>{
 await page.goto('/#home');await login(page);
 await page.getByRole('button',{name:'로그아웃',exact:true}).click();
 await page.goto('/#board/write?courseId=missing');
 await page.getByLabel('이메일',{exact:true}).fill('board@example.test');await page.getByLabel('비밀번호',{exact:true}).fill('synthetic123');await page.getByRole('button',{name:'로그인하기',exact:true}).click();
 await expect(page.getByLabel('제목',{exact:true})).toBeVisible();await expect(page).toHaveURL(/courseId=missing/);
 await expect(page.locator('[data-attachment-status]')).toContainText('코스');
});
