import {createWeatherHandler} from './server/weather.js';
import { defineConfig,loadEnv } from 'vite';
import {createTourHandler} from './server/tour.js';
export default defineConfig(({mode})=>{
 const live=mode==='live';
 const map=live||mode==='map';
 const env=live||map?loadEnv(mode,process.cwd(),''):{};
 return {
  // Never expose arbitrary VITE_* values; only explicit public integration settings.
  envPrefix:[],
  plugins:live?[{name:'tour-server',configureServer(server){server.middlewares.use(createTourHandler({key:env.TOUR_API_KEY||''}));server.middlewares.use(createWeatherHandler({key:env.WEATHER_API_KEY||'',baseUrl:env.WEATHER_API_BASE_URL||undefined}));},configurePreviewServer(server){server.middlewares.use(createTourHandler({key:env.TOUR_API_KEY||''}));server.middlewares.use(createWeatherHandler({key:env.WEATHER_API_KEY||'',baseUrl:env.WEATHER_API_BASE_URL||undefined}));}}]:[],
  define:{
   'import.meta.env.VITE_DATA_MODE':JSON.stringify(live?'live':'sample'),
   'import.meta.env.VITE_TOUR_API_KEY':JSON.stringify(''),
   'import.meta.env.VITE_TOUR_API_BASE_URL':JSON.stringify(''),
   'import.meta.env.VITE_MAP_MODE':JSON.stringify(map?'kakao':'sample'),
   'import.meta.env.VITE_KAKAO_MAP_APP_KEY':JSON.stringify(map?env.VITE_KAKAO_MAP_APP_KEY||'':''),
  },
  test:{environment:'jsdom',include:['tests/**/*.test.js'],setupFiles:['./tests/setup.js']},
 };
});
