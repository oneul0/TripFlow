const normalize=email=>String(email??'').trim().toLowerCase();
const profile=account=>account?{id:account.id,email:account.email,name:account.name}:null;
export function validAccounts(data){return Array.isArray(data)&&data.every(a=>a&&['id','email','name','salt','passwordHash','recoveryHash'].every(key=>typeof a[key]==='string'));}
export function validSession(data){return data===null||(typeof data==='object'&&typeof data.id==='string');}
export function createMembers({accounts,session,crypto=globalThis.crypto}) {
  const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
  async function hash(value,salt) {
    const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(value),'PBKDF2',false,['deriveBits']);
    const bytes=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256);
    return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
  }
  function checkPassword(value){if(typeof value!=='string'||value.length<8||value.length>128) throw Error('비밀번호는 8~128자로 입력해주세요.');}
  function checkName(value){const name=String(value??'').trim();if(name.length<2||name.length>30) throw Error('이름은 2~30자로 입력해주세요.');return name;}
  function currentAccount(){const s=session.read();if(!s) return null;return accounts.read().find(a=>a.id===s.id)??null;}
  function requireAccount(){const a=currentAccount();if(!a) throw Error('먼저 로그인해주세요.');return a;}
  return {
    current:()=>profile(currentAccount()),
    async register({email,name,password,confirm}) {
      email=normalize(email);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error('올바른 이메일을 입력해주세요.');
      name=checkName(name);checkPassword(password);if(password!==confirm) throw Error('비밀번호 확인이 일치하지 않습니다.');
      if(accounts.read().some(a=>a.email===email)) throw Error('이미 가입한 이메일입니다.');
      const salt=random(),recoveryCode=random();
      const account={id:crypto.randomUUID(),email,name,salt,passwordHash:await hash(password,salt),recoveryHash:await hash(recoveryCode,salt)};
      // Re-read after asynchronous hashing to avoid lost updates within this tab.
      const latest=accounts.read();if(latest.some(a=>a.email===email)) throw Error('이미 가입한 이메일입니다.');
      accounts.write([...latest,account]);return {...profile(account),recoveryCode};
    },
    async login(email,password) {
      const account=accounts.read().find(a=>a.email===normalize(email));
      if(!account||typeof password!=='string'||await hash(password,account.salt)!==account.passwordHash) throw Error('이메일 또는 비밀번호가 일치하지 않습니다.');
      const latest=accounts.read().find(a=>a.id===account.id);
      if(!latest||latest.passwordHash!==account.passwordHash) throw Error('계정이 변경되었습니다. 다시 로그인해주세요.');
      session.write({id:account.id});return profile(latest);
    },
    logout(){session.write(null);},
    update(name){const a=requireAccount();name=checkName(name);accounts.write(accounts.read().map(item=>item.id===a.id?{...item,name}:item));return profile({...a,name});},
    async remove(password){const a=requireAccount();if(await hash(password,a.salt)!==a.passwordHash) throw Error('비밀번호가 일치하지 않습니다.');session.write(null);accounts.write(accounts.read().filter(item=>item.id!==a.id));},
    async reset(email,recoveryCode,password){
      checkPassword(password);const a=accounts.read().find(item=>item.email===normalize(email));
      if(!a||await hash(recoveryCode,a.salt)!==a.recoveryHash) throw Error('이메일 또는 복구 코드가 일치하지 않습니다.');
      const passwordHash=await hash(password,a.salt);session.write(null);
      accounts.write(accounts.read().map(item=>item.id===a.id?{...item,passwordHash}:item));
    }
  };
}
