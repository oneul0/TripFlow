import { defineConfig,loadEnv } from 'vite';
export default defineConfig(({mode})=>{
 const live=mode==='live';
 const map=live||mode==='map';
 const env=live||map?loadEnv(mode,process.cwd(),'VITE_'):{};
 return {
  // Never expose arbitrary VITE_* values; only explicit public integration settings.
  envPrefix:[],
  define:{
   'import.meta.env.VITE_DATA_MODE':JSON.stringify(live?'live':'sample'),
   'import.meta.env.VITE_TOUR_API_KEY':JSON.stringify(live?env.VITE_TOUR_API_KEY||'':''),
   'import.meta.env.VITE_TOUR_API_BASE_URL':JSON.stringify(live?env.VITE_TOUR_API_BASE_URL||'':''),
   'import.meta.env.VITE_MAP_MODE':JSON.stringify(map?'kakao':'sample'),
   'import.meta.env.VITE_KAKAO_MAP_APP_KEY':JSON.stringify(map?env.VITE_KAKAO_MAP_APP_KEY||'':''),
  },
  test:{environment:'jsdom',include:['tests/**/*.test.js'],setupFiles:['./tests/setup.js']},
 };
});
