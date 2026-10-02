import {validAttachment,copyAttachment} from './course-attachment.js';
export const categories = {review:'여행 후기',course:'코스 공유',question:'여행 질문'};
export function validPosts(value) {
  return Array.isArray(value) && new Set(value.map(p=>p?.id)).size === value.length && value.every(p=>p &&
    ['id','authorId','authorName','title','content','createdAt','updatedAt'].every(k=>typeof p[k]==='string') &&
    p.id && p.authorId && p.authorName && p.title.trim().length>0 && p.title.length<=100 && p.content.trim().length>0 && p.content.length<=5000 &&
    Object.hasOwn(categories,p.category) && Number.isFinite(Date.parse(p.createdAt)) && Number.isFinite(Date.parse(p.updatedAt))&&validAttachment(p.courseAttachment??null));
}
export function createBoard({posts,members,samples=[],makeId=()=>crypto.randomUUID(),now=()=>new Date()}) {
  const all=()=>structuredClone([...posts.read(),...samples]);
  function get(id){const post=all().find(p=>p.id===id);if(!post)throw Error('게시글을 찾을 수 없습니다.');return {...post,courseAttachment:copyAttachment(post.courseAttachment??null)};}
  function user(){const value=members.current();if(!value)throw Error('글을 작성하려면 로그인해주세요.');return value;}
  function owned(id){const account=user(),post=get(id);if(post.sample)throw Error('샘플 게시글은 변경할 수 없습니다.');if(post.authorId!==account.id)throw Error('작성자만 수정하거나 삭제할 수 있습니다.');return post;}
  function fields({title='',content='',category='review'}={}){
    if(typeof title!=='string'||!title.trim()||title.trim().length>100)throw Error('제목은 1~100자로 입력해주세요.');
    if(typeof content!=='string'||!content.trim()||content.trim().length>5000)throw Error('본문은 1~5000자로 입력해주세요.');
    if(!Object.hasOwn(categories,category))throw Error('올바른 분류를 선택해주세요.');
    return {title:title.trim(),content:content.trim(),category};
  }
  return {
    get,
    list({query='',category=''}={}){const tokens=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);return all().filter(p=>(!category||p.category===category)&&tokens.every(t=>`${p.title} ${p.content} ${p.authorName}`.toLocaleLowerCase().includes(t))).sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));},
    create(input){const account=user(),data=fields(input),stamp=now().toISOString();const post={...data,id:makeId(),authorId:account.id,authorName:account.name,createdAt:stamp,updatedAt:stamp,courseAttachment:copyAttachment(input.courseAttachment??null)};posts.write([post,...posts.read()]);return structuredClone(post);},
    update(id,input){const post=owned(id),next={...post,...fields(input),updatedAt:now().toISOString(),courseAttachment:copyAttachment(input.courseAttachment===undefined?post.courseAttachment:input.courseAttachment)};posts.write(posts.read().map(p=>p.id===id?next:p));return structuredClone(next);},
    remove(id){owned(id);posts.write(posts.read().filter(p=>p.id!==id));}
  };
}
