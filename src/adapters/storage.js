export function createStore(storage,key,fallback,validate=()=>true) {
  return {
    read() {
      let raw;
      try {raw=storage.getItem(key);} catch {throw Error('저장소를 읽을 수 없습니다. 브라우저 설정을 확인해주세요.');}
      if(raw===null) return structuredClone(fallback);
      let saved;
      try {saved=JSON.parse(raw);} catch {throw Error('저장 데이터가 손상되었습니다. 기존 데이터는 유지됩니다.');}
      if(saved?.version!==1) throw Error('지원하지 않는 저장 데이터 버전입니다.');
      if(!Object.hasOwn(saved,'data')||!validate(saved.data)) throw Error('저장 데이터 형식이 올바르지 않습니다.');
      return saved.data;
    },
    write(data) {
      if(!validate(data)) throw Error('저장 데이터 형식이 올바르지 않습니다.');
      try {storage.setItem(key,JSON.stringify({version:1,data}));} catch {throw Error('저장하지 못했습니다. 저장 공간과 브라우저 설정을 확인해주세요.');}
    }
  };
}
