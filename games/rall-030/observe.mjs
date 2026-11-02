export function header(data,width,height,templates){
 if(width!==320||height!==200)return null;
 const hits=[];
 for(const [name,t] of Object.entries(templates)){
  let correct=0,total=0,bright=0;const ox=name==='mai_sou'?60:100,oy=name==='mai_sou'?0:50;
  for(let y=0;y<t.height;y++)for(let x=0;x<t.width;x++){
   const i=((y+oy)*width+x+ox)*4,r=data[i],g=data[i+1],b=data[i+2],fg=r>g*1.2&&r>b*1.2&&r>10;
   correct+=Number(fg===Boolean(t.mask[y*t.width+x]));total++;bright=Math.max(bright,r);
  }
  if(correct/total>.98&&bright>180)hits.push({name,score:correct/total});
 }
 return hits.sort((a,b)=>b.score-a.score)[0]?.name||null;
}
function maskAt(data,width,x,y){let mask=0;for(let py=0;py<5;py++)for(let px=0;px<4;px++){const i=((y+py)*width+x+px)*4;if((data[i]|data[i+1]|data[i+2])!==0)mask|=1<<(py*4+px);}return mask;}
export function fontReader(glyphs){const byChar=new Map(),byMask=new Map();for(const g of glyphs){if(g.width!==4||g.height!==5||g.code>126)continue;let mask=0;g.pixels.forEach((v,i)=>{if(v)mask|=1<<i});byChar.set(String.fromCharCode(g.code),mask);if(!byMask.has(mask))byMask.set(mask,String.fromCharCode(g.code));}
 return{
 line(data,width,y,x=0,max=80){let s='';for(let i=0;i<max&&x+4<=width;i++,x+=4)s+=byMask.get(maskAt(data,width,x,y))??'?';return s.trimEnd();},
 match(data,width,text,x,y){for(const c of text){if(maskAt(data,width,x,y)!==byChar.get(c))return false;x+=4;}return true;},
 number(data,width,x,y){const s=this.line(data,width,y,x,10);const m=s.match(/-?\d+/);return m?Number(m[0]):null;}
 };
}
export function readHud(data,width,height,font){const y=height-20;if(y<0||!font.match(data,width,'Energy',0,y+5)||!font.match(data,width,'Points',0,y+10)||!font.match(data,width,'Level',0,y+15))return null;return{name:font.line(data,width,y,0,10),energy:font.number(data,width,24,y+5),points:font.number(data,width,24,y+10),level:font.number(data,width,20,y+15)};}
