import 'bootstrap/dist/css/bootstrap.min.css';
import './tokens.css';
import './design-system.css';
import './map.css';
import './random-trip.css';
import './navigation.css';
import './course.css';
import './board.css';
import './editorial.css';
import './arcade.css';
import {createBoard,validPosts} from './modules/board.js';
import {samplePosts} from './data/board-posts.js';
import {createCourseCommunity} from './modules/course-community.js';
import {createBoardCourses} from './adapters/board-courses.js';
import {installMotion} from './motion.js';
import {createSampleCatalog} from './adapters/catalog.js';
import {createServerCatalog} from './adapters/server-catalog.js';
import {localSearch,createLogger,unavailableAssistant} from './adapters/extensions.js';
import {createStore} from './adapters/storage.js';
import {createMembers,validAccounts,validSession} from './modules/members.js';
import {createTourService} from './modules/tour.js';
import {mountApp} from './ui.js';
import {resolveRuntime} from './runtime.js';
try {
const {mode}=resolveRuntime(import.meta.env);
const logger=createLogger(import.meta.env.DEV?(event,fields)=>console.info(event,fields):undefined);
const catalog=mode==='live'?createServerCatalog():createSampleCatalog();
const tour=createTourService({catalog,search:localSearch,logger});
 const members=createMembers({accounts:createStore(localStorage,'enjoytrip.accounts',[],validAccounts),session:createStore(sessionStorage,'enjoytrip.session',null,validSession)});
 let courseCommunity;try{courseCommunity=createCourseCommunity(localStorage);}catch{courseCommunity=null;}
 const courseService=createBoardCourses({community:courseCommunity,members});
 const board=createBoard({posts:createStore(localStorage,'tripflow.posts',[],validPosts),members,samples:samplePosts});
 // Composition root: future providers are injected here, inside the same application.
 mountApp(document.querySelector('#app'),{tour,members,board,courseCommunity,courseService,mode,mapMode:import.meta.env.VITE_MAP_MODE,mapKey:import.meta.env.VITE_KAKAO_MAP_APP_KEY,tourPreview:catalog.preview,assistant:unavailableAssistant});
 installMotion(document.querySelector('#app'));
 logger.record('app.started',{mode});
} catch(error){document.querySelector('#app').textContent=`앱을 시작하지 못했습니다. ${error.message}`;}
