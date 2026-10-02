import {it,expect,afterEach} from 'vitest';
import {mountCourses} from '../src/course-ui.js';
let ui;afterEach(()=>{ui?.destroy();localStorage.clear();document.body.replaceChildren();});
it('CB-02/05 후보 블록 편집은 점수와 상세 조건 없이 시작한다',()=>{document.body.innerHTML='<div id="app"><nav class="primary-nav"></nav><main><div class="home-entries"></div></main></div>';ui=mountCourses(document.querySelector('#app'));ui.render('course-editor','course-editor');expect(document.querySelector('[data-candidate-list]')).not.toBeNull();expect(document.querySelector('[data-course-stops]')).not.toBeNull();expect(document.querySelector('[data-fit]')).toBeNull();expect(document.querySelector('[name=budget]')).toBeNull();expect(document.querySelector('[data-conditions]')).toBeNull();expect(document.querySelector('[data-course-totals]').textContent).toContain('예상 시간');});

it('CB-03 값이 전혀 없으면 합계를 0으로 표시하지 않는다',()=>{document.body.innerHTML='<div id="app"><nav class="primary-nav"></nav><main></main></div>';ui=mountCourses(document.querySelector('#app'));ui.render('course-editor','course-editor');expect(document.querySelector('[data-course-totals]').textContent).not.toMatch(/0분|0원/);});
