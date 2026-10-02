import 'bootstrap/dist/css/bootstrap.min.css';
import './tokens.css';
import './design-system.css';
import './map.css';
import {installMotion} from './motion.js';
import {createSampleCatalog,createTourApiCatalog} from './adapters/catalog.js';
import {localSearch,createLogger,unavailableAssistant} from './adapters/extensions.js';
import {createStore} from './adapters/storage.js';
import {createMembers,validAccounts,validSession} from './modules/members.js';
import {createTourService} from './modules/tour.js';
import {mountApp} from './ui.js';
import {resolveRuntime} from './runtime.js';
try {
const {key,mode}=resolveRuntime(import.meta.env);
const logger=createLogger(import.meta.env.DEV?(event,fields)=>console.info(event,fields):undefined);
const catalog=key?createTourApiCatalog({key,baseUrl:import.meta.env.VITE_TOUR_API_BASE_URL||undefined}):createSampleCatalog();
const tour=createTourService({catalog,search:localSearch,logger});
 const members=createMembers({accounts:createStore(localStorage,'enjoytrip.accounts',[],validAccounts),session:createStore(sessionStorage,'enjoytrip.session',null,validSession)});
 // Composition root: future providers are injected here, inside the same application.
 mountApp(document.querySelector('#app'),{tour,members,mode,mapMode:import.meta.env.VITE_MAP_MODE,mapKey:import.meta.env.VITE_KAKAO_MAP_APP_KEY,assistant:unavailableAssistant});
 installMotion(document.querySelector('#app'));
 logger.record('app.started',{mode});
} catch(error){document.querySelector('#app').textContent=`앱을 시작하지 못했습니다. ${error.message}`;}
