import {test,expect} from '@playwright/test';
test.beforeEach(async({context})=>{
 await context.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:5174'?route.continue():route.abort());
});
test('회원 전체 흐름과 관광 검색',async({page})=>{
 await page.goto('/');await page.locator('.primary-nav a[href="#explore"]').click();await expect(page.getByText('샘플 데이터 모드',{exact:false}).first()).toBeVisible();
 await page.getByLabel('지역',{exact:true}).selectOption('39');await page.getByLabel('콘텐츠 유형').selectOption('39');await page.getByRole('button',{name:'여행지 찾기'}).click();await expect(page.locator('#results')).toContainText('제주');
 await page.getByRole('button',{name:'회원가입',exact:true}).click();
 await page.getByLabel('이름',{exact:true}).fill('테스트회원');await page.getByLabel('이메일',{exact:true}).fill('test@example.com');await page.getByLabel('비밀번호',{exact:true}).fill('password123');await page.getByLabel('비밀번호 확인').fill('password123');await page.getByRole('button',{name:'가입하기'}).click();
 await expect(page.locator('#recovery-code')).toBeVisible();const code=await page.locator('#recovery-code').textContent();await page.getByRole('button',{name:'닫기'}).click();
 await page.getByRole('button',{name:'로그인',exact:true}).click();await page.getByLabel('이메일',{exact:true}).fill('test@example.com');await page.getByLabel('비밀번호',{exact:true}).fill('password123');await page.getByRole('button',{name:'로그인하기'}).click();
 await expect(page.getByRole('button',{name:'내 정보'})).toBeVisible();await page.reload();await page.getByRole('button',{name:'내 정보'}).click();await page.getByLabel('이름',{exact:true}).fill('변경회원');await page.getByRole('button',{name:'정보 저장'}).click();await expect(page.locator('#account-panel')).toContainText('저장했습니다');
 await page.getByRole('button',{name:'닫기'}).click();await page.getByRole('button',{name:'로그아웃'}).click();await page.getByRole('button',{name:'로그인',exact:true}).click();await page.getByRole('button',{name:'비밀번호 찾기'}).click();await page.getByLabel('이메일',{exact:true}).fill('test@example.com');await page.getByLabel('복구 코드').fill(code);await page.getByLabel('새 비밀번호').fill('newpassword123');await page.getByRole('button',{name:'비밀번호 재설정'}).click();await expect(page.locator('#account-panel')).toContainText('재설정했습니다');await page.getByRole('button',{name:'닫기'}).click();
 await page.getByRole('button',{name:'로그인',exact:true}).click();await page.getByLabel('이메일',{exact:true}).fill('test@example.com');await page.getByLabel('비밀번호',{exact:true}).fill('newpassword123');await page.getByRole('button',{name:'로그인하기'}).click();await page.getByRole('button',{name:'내 정보'}).click();await page.getByLabel('탈퇴 확인 비밀번호').fill('newpassword123');await page.getByRole('button',{name:'회원 탈퇴'}).click();await expect(page.getByRole('button',{name:'로그인',exact:true})).toBeVisible();
});
for(const width of [360,768,1440]) test(`반응형 ${width}px`,async({page})=>{await page.setViewportSize({width,height:900});await page.goto('/#explore');await expect(page.locator('.place-card').first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);});
test('서울 구 선택과 지도·목록 연동',async({page})=>{
 await page.goto('/#explore');await page.locator('[data-result-view="map"]').click();await expect(page.locator('#map-surface svg')).toBeVisible();
 const jongno=page.getByRole('button',{name:/^종로구 \d+개$/});await jongno.click();
 await expect(jongno).toHaveAttribute('aria-pressed','true');await expect(page.locator('#region-title')).toHaveText('종로구');
 await expect(page.locator('#results')).toContainText('경복궁');await expect(page.locator('#results')).not.toContainText('국립중앙박물관');
 await page.locator('[data-result-view="list"]').click();await page.getByRole('button',{name:'경복궁 지도에서 보기',exact:true}).click();await expect(page.locator('#map-detail')).toContainText('경복궁');
 await page.getByRole('button',{name:'서울 전체',exact:false}).click();await expect(page.locator('#results')).toContainText('국립중앙박물관');
});
