export function renderHomeStories(root,board){
 root.replaceChildren();
 try{
  const posts=board?.list().slice(0,3)||[];
  if(!posts.length){const p=document.createElement('p');p.textContent='첫 여행 이야기를 나눠보세요.';root.append(p);return;}
  for(const post of posts){
   const link=document.createElement('a'),title=document.createElement('h3'),excerpt=document.createElement('p'),meta=document.createElement('small');
   link.href=`#board/post/${encodeURIComponent(post.id)}`;link.className='home-story';
   title.textContent=post.title;excerpt.textContent=post.content.slice(0,110);
   meta.textContent=`${post.authorName} · ${new Date(post.createdAt).toLocaleDateString('ko-KR')}${post.sample?' · 샘플':''}`;
   link.append(title,excerpt,meta);root.append(link);
  }
 }catch{
  const message=document.createElement('p'),retry=document.createElement('button');
  message.textContent='이야기를 불러오지 못했습니다.';retry.type='button';retry.textContent='다시 시도';retry.addEventListener('click',()=>renderHomeStories(root,board));root.append(message,retry);
 }
}
