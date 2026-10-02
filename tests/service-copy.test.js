import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
it('UX-COPY-01 사용자 화면에서 개발 안내 문구를 제거한다',()=>{const files=['random-trip.js','board-ui.js','course-ui.js','ui.js','map-explorer.js','region-details.js'];const source=files.map(f=>readFileSync(new URL('../src/'+f,import.meta.url),'utf8')).join('\n');for(const text of ['가까운 육지 보정 ON','브라우저에 저장되는 데모 게시판','이 브라우저에만 저장·공유됩니다.','학습용 로컬 데모 계정입니다.','최신 행정경계가 아닌 개발 기준 데이터','공개 JavaScript 키와 도메인 설정'])expect(source).not.toContain(text);});
