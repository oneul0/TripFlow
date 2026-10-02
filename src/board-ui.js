import {mountAttachment,renderAttachment} from './board-attachment-ui.js';
import {categories} from './modules/board.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=value=>new Date(value).toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'});
export function mountBoard(root,{board,members,onLogin=()=>{},courseService={listMine:async()=>[],get:async()=>null},navigate}={}){
  let category='',query='',page=1,currentId=null,generation=0,route='board';const pageSize=7;
  root.innerHTML=`<div class="board-heading"><div><p class="eyebrow">TRAVEL STORIES</p><h1>커뮤니티<span class="board-dot">.</span></h1><p>함께 나누는 여행 이야기</p></div><button class="board-primary" id="board-write" type="button">＋ 글쓰기</button></div>

  <div id="board-message" role="status" aria-live="polite"></div><div class="board-layout"><div class="board-main"><div id="board-featured" class="board-featured"></div><div id="board-content"></div></div>
  <aside class="board-sidebar"><section><p class="eyebrow">START A CONVERSATION</p><h2>어떤 이야기를<br>나눠볼까요?</h2><ul><li><span>01</span><div><strong>여행 후기</strong><p>다녀온 곳의 기억을 기록해요.</p></div></li><li><span>02</span><div><strong>코스 공유</strong><p>나만의 여행 순서를 나눠요.</p></div></li><li><span>03</span><div><strong>여행 질문</strong><p>여행 전 궁금한 것을 물어봐요.</p></div></li></ul></section><section class="board-guide"><h2>게시판 이용 안내</h2><p>서로의 여행을 존중하는 따뜻한 이야기를 나눠주세요.</p><p>예시 글에는 <b>샘플</b> 표시가 있어요.</p><p>로그인 후 글을 작성할 수 있고, 본인 글만 수정·삭제할 수 있어요.</p></section></aside></div>`;
  const content=root.querySelector('#board-content'),message=root.querySelector('#board-message'),featured=root.querySelector('#board-featured');
  function announce(text){message.textContent=text;}
  function button(label,handler,className='board-secondary'){const b=document.createElement('button');b.type='button';b.className=className;b.textContent=label;b.addEventListener('click',handler);return b;}
  function focusHeading(){content.querySelector('h2')?.focus();}
  function badge(post){return `<span class="board-category category-${esc(post.category)}">${esc(categories[post.category])}</span>${post.sample?'<span class="board-sample">샘플</span>':''}${post.courseAttachment?'<span class="board-sample">코스 첨부</span>':''}`;}
  function showList(){generation++;currentId=null;announce('');try{
    featured.replaceChildren();featured.hidden=true;
    content.innerHTML=`<div class="board-list-panel"><form id="board-search" class="board-search"><label class="visually-hidden" for="board-query">게시글 검색</label><input id="board-query" name="query" placeholder="제목, 내용, 작성자로 검색해보세요" maxlength="100" value="${esc(query)}"><button class="board-primary" type="submit">검색</button></form><div class="board-tabs" aria-label="게시글 분류"></div><div id="board-list-status" role="status"></div><div class="board-table-wrap"><table class="board-table"><caption class="visually-hidden">여행 게시글 목록</caption><thead><tr><th>분류</th><th>제목</th><th>작성자</th><th>작성일</th></tr></thead><tbody></tbody></table></div><nav class="board-pagination" aria-label="게시글 페이지"></nav></div>`;
    for(const [value,label] of Object.entries({'':'전체',...categories})){const b=button(label,()=>{category=value;page=1;list();},'board-tab');b.setAttribute('aria-pressed',String(value===category));content.querySelector('.board-tabs').append(b);}
    const posts=board.list({query,category}),pages=Math.max(1,Math.ceil(posts.length/pageSize));page=Math.min(page,pages);
    content.querySelector('#board-list-status').textContent=posts.length?`총 ${posts.length}개의 이야기`:'검색 결과가 없습니다. 다른 검색어나 분류를 선택해보세요.';
    const body=content.querySelector('tbody');for(const post of posts.slice((page-1)*pageSize,page*pageSize)){
      const row=document.createElement('tr');row.innerHTML=`<td>${badge(post)}</td><td class="board-title-cell"></td><td>${esc(post.authorName)}</td><td><time datetime="${esc(post.createdAt)}">${date(post.createdAt)}</time></td>`;
      const cell=row.querySelector('.board-title-cell');cell.append(button(post.title,()=>detail(post.id),'board-post-link'));const excerpt=document.createElement('p');excerpt.className='board-row-excerpt';excerpt.textContent=post.content.slice(0,140);cell.append(excerpt);body.append(row);
    }
    const pagination=content.querySelector('.board-pagination');const prev=button('이전',()=>{page--;list();});prev.disabled=page===1;pagination.append(prev);
    // Keep pagination compact even after many locally created posts.
    const start=Math.max(1,Math.min(page-2,pages-4));for(let n=start;n<=Math.min(pages,start+4);n++){const b=button(String(n),()=>{page=n;list();});if(n===page)b.setAttribute('aria-current','page');b.setAttribute('aria-label',`${n}페이지`);pagination.append(b);}
    const next=button('다음',()=>{page++;list();});next.disabled=page===pages;pagination.append(next);
    content.querySelector('#board-search').addEventListener('submit',event=>{event.preventDefault();query=new FormData(event.currentTarget).get('query').trim();page=1;list();});
  }catch(error){featured.hidden=true;content.replaceChildren(button('다시 시도',list));announce(error.message);}}
  function showDetail(id){generation++;try{
    const post=board.get(id);currentId=id;featured.hidden=true;announce('');
    content.innerHTML=`<article class="board-detail"><div class="board-detail-top">${badge(post)}</div><h2 tabindex="-1">${esc(post.title)}</h2><p class="board-detail-meta">${esc(post.authorName)} · 작성 ${date(post.createdAt)}${post.updatedAt!==post.createdAt?` · 수정 ${date(post.updatedAt)}`:''}</p>${post.sample?'<p class="board-sample-note">예시로 제공하는 여행 이야기입니다.</p>':''}<div class="board-post-body"></div><div class="board-detail-actions"></div><div id="board-delete-confirm"></div></article>`;
    content.querySelector('.board-post-body').textContent=post.content;const attachmentRoot=document.createElement('section');attachmentRoot.className='board-course-attachment';content.querySelector('.board-post-body').after(attachmentRoot);renderAttachment(attachmentRoot,post.courseAttachment);const actions=content.querySelector('.board-detail-actions');actions.append(button('← 목록으로',list));
    if(!post.sample&&members.current()?.id===post.authorId){actions.append(button('수정',()=>edit(id)),button('삭제',()=>{
      const confirm=content.querySelector('#board-delete-confirm');confirm.innerHTML='<div class="board-confirm" role="group" aria-label="게시글 삭제 확인"><p>이 글을 삭제할까요? 삭제한 글은 복구할 수 없습니다.</p><div></div></div>';confirm.querySelector('div div').append(button('취소',()=>confirm.replaceChildren()),button('삭제하기',()=>{try{board.remove(id);list();announce('게시글을 삭제했습니다.');}catch(error){announce(error.message);}},'board-danger'));confirm.querySelector('button').focus();
    },'board-danger'));}focusHeading();
  }catch(error){announce(error.message);}}
  function showEdit(id=null,courseId=''){const request=++generation;try{
    if(!members.current()){featured.hidden=true;content.replaceChildren(button('로그인하고 이어쓰기',onLogin));announce('글을 작성하려면 로그인해주세요. 로그인 후 이 화면에서 이어갈 수 있습니다.');onLogin();return;}
    const post=id?board.get(id):null;if(post&&(post.sample||post.authorId!==members.current().id))throw Error('작성자만 수정할 수 있습니다.');
    featured.hidden=true;announce('');content.innerHTML=`<section class="board-editor"><p class="eyebrow">YOUR TRAVEL JOURNAL</p><h2 tabindex="-1">${post?'이야기 수정':'새로운 이야기'}</h2><p>여행의 기억을 차근차근 기록해보세요.</p><form id="board-editor-form"><label for="board-category">분류</label><select id="board-category" name="category">${Object.entries(categories).map(([value,label])=>`<option value="${value}" ${value===(post?.category||(courseId?'course':'review'))?'selected':''}>${label}</option>`).join('')}</select><label for="board-title">제목</label><input id="board-title" name="title" maxlength="100" required placeholder="어떤 여행을 다녀오셨나요?" value="${esc(post?.title||'')}"><label for="board-body">본문</label><textarea id="board-body" name="content" maxlength="5000" required rows="12" placeholder="여행 코스, 좋았던 순간, 기억하고 싶은 팁을 나눠주세요.">${esc(post?.content||'')}</textarea><p class="board-character-count" id="board-character-count"></p><p class="board-form-note">연락처 등 개인정보가 포함되지 않았는지 확인해주세요.</p><div class="board-editor-actions"><button class="board-secondary" id="board-cancel" type="button">취소</button><button class="board-primary" type="submit">${post?'수정 저장':'게시글 등록'}</button></div></form></section>`;
    const form=content.querySelector('form'),body=form.elements.content;
    const attachmentRoot=document.createElement('div');attachmentRoot.className='board-course-attachment';form.querySelector('.board-editor-actions').before(attachmentRoot);
    const attachment=mountAttachment(attachmentRoot,{courseService,members,initial:post?.courseAttachment??null,courseId,isActive:()=>request===generation,onBusy:busy=>{form.querySelector('[type=submit]').disabled=busy;}});const count=()=>content.querySelector('#board-character-count').textContent=`${body.value.length.toLocaleString()} / 5,000자`;count();body.addEventListener('input',count);
    content.querySelector('#board-cancel').addEventListener('click',()=>{
      const changed=form.elements.title.value!==(post?.title||'')||body.value!==(post?.content||'')||form.elements.category.value!==(post?.category||(courseId?'course':'review'))||JSON.stringify(attachment.value())!==JSON.stringify(post?.courseAttachment??null);
      if(changed&&!window.confirm('작성 중인 내용을 취소할까요?'))return;post?detail(post.id):list();
    });
    form.addEventListener('submit',event=>{event.preventDefault();if(form.querySelector('[type=submit]').disabled)return;try{const input={...Object.fromEntries(new FormData(form)),courseAttachment:attachment.value()};const saved=post?board.update(post.id,input):board.create(input);detail(saved.id);announce(post?'수정했습니다.':'게시글을 등록했습니다.');}catch(error){announce(error.message);}});focusHeading();
  }catch(error){announce(error.message);}}
  function list(){if(navigate)navigate('board');else showList();}
  function detail(id){if(navigate)navigate('board/post/'+encodeURIComponent(id));else showDetail(id);}
  function edit(id=null){if(navigate)navigate(id?'board/edit/'+encodeURIComponent(id):'board/write');else showEdit(id);}
  function render(hash='board'){route=hash;const [path,queryString='']=hash.split('?');try{if(path==='board/write')showEdit(null,new URLSearchParams(queryString).get('courseId')||'');else if(path.startsWith('board/post/'))showDetail(decodeURIComponent(path.slice(11)));else if(path.startsWith('board/edit/'))showEdit(decodeURIComponent(path.slice(11)));else showList();}catch(error){announce(error.message);}}
  root.querySelector('#board-write').addEventListener('click',()=>edit());showList();
  return {render,leave(){generation++;},refresh(){render(route);},destroy(){generation++;root.replaceChildren();}};
}
