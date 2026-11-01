const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const root='games/hardword/';
function setup(mode='normal'){
 const map=new Map([['music_vol','other-game'],['joynes.hardword.app_age','7']]);
 const native={get length(){return map.size;},key:i=>[...map.keys()][i]??null,getItem:k=>map.get(k)??null,setItem(k,v){if(mode==='full')throw Error('Quota');map.set(k,v);},removeItem:k=>map.delete(k)};
 let notice;
 const document={body:{prepend:n=>{notice=n;}},getElementById:()=>notice,createElement:()=>({setAttribute(){},style:{}})};
 const window={};Object.defineProperty(window,'localStorage',{get(){if(mode==='blocked')throw Error('Denied');return native;}});
 vm.runInNewContext(fs.readFileSync(root+'storage.js','utf8'),{window,document});return {s:window.appStorage,map,get notice(){return notice;}};
}
test('Progress namespace, enumeration, removal and clear never alter sibling games',()=>{
 const {s,map}=setup();assert.equal(s.getItem('app_age'),'7');assert.equal(s.getItem('music_vol'),null);s.setItem('coins_v1','{"balance":25}');assert.equal(s.length,2);assert.equal(s.key(2),null);assert.equal(map.get('joynes.hardword.coins_v1'),'{"balance":25}');s.removeItem('app_age');assert.equal(s.length,1);s.clear();assert.equal(s.length,0);assert.equal(map.get('music_vol'),'other-game');
});
test('Blocked or full storage preserves session progress and shows a truthful notice',()=>{
 for(const mode of ['blocked','full']){const env=setup(mode);env.s.setItem('app_age',8);env.s.setItem('coins_v1','{"balance":22}');assert.equal(env.s.getItem('app_age'),'8');assert.equal(env.s.getItem('coins_v1'),'{"balance":22}');assert.ok(env.notice.textContent.includes('sidan är öppen'));}
});
test('Original music, fonts and icons retain exact source hashes; app URLs stay within its directory',()=>{
 const manifest=JSON.parse(fs.readFileSync(root+'original-assets.json'));
 for(const [path,hash]of Object.entries(manifest.sha256))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(root+path)).digest('hex'),hash);
 const html=fs.readFileSync(root+'index.html','utf8');for(const match of html.matchAll(/<(script|link|audio)[^>]*(?:src|href)="([^"]+)"/g)){assert.ok(!match[2].startsWith('/'));if(match[2].startsWith('./'))assert.ok(fs.existsSync(root+match[2]));}
 const script=[...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');assert.doesNotThrow(()=>new vm.Script(script));
 const app=JSON.parse(fs.readFileSync(root+'manifest.json'));assert.equal(app.scope,'./');assert.equal(app.start_url,'./');
});
