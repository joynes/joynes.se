const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||'../gme-bld/worldforge-self-test');
const base=process.env.WORLDFORGE_BASE_URL||'https://worldforge-self-test.joynez11.chatgpt.site/';
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
function files(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(directory,e.name)):[path.join(directory,e.name)]);}
(async()=>{
 const entries=[...files(path.join(root,'public')),...files(path.join(root,'dist/client/assets'))];
 const audit={sourceCommit:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),base,checkedAt:new Date().toISOString(),assets:{}};
 let index=0;
 await Promise.all(Array.from({length:4},async()=>{while(index<entries.length){const file=entries[index++];
  const name=file.startsWith(path.join(root,'public')+path.sep)?path.relative(path.join(root,'public'),file):'assets/'+path.relative(path.join(root,'dist/client/assets'),file);
  const local=sha(fs.readFileSync(file)),response=await fetch(new URL(name,base));assert.ok(response.ok,name+' HTTP '+response.status);
  const actual=sha(Buffer.from(await response.arrayBuffer()));assert.equal(actual,local,name+' SHA256');audit.assets[name]=local;
 }}));
 audit.assets=Object.fromEntries(Object.entries(audit.assets).sort(([a],[b])=>a.localeCompare(b)));
 const output=process.env.WORLDFORGE_ASSET_AUDIT||'test-results/worldforge-assets.json';fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(audit,null,2)+'\n');console.log('PASS: '+entries.length+' public and compiled asset SHA256 hashes match live WorldForge.');
})().catch(error=>{console.error(error);process.exitCode=1;});
