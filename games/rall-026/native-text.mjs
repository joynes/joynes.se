// Observe DOS video RAM through typed-array reads only. The SDK's full-memory
// debugger walks guest page tables; it is intentionally never called here.
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const high="ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´­±‗¾¶§÷¸°¨·¹³²■ ";
const low=[' ','☺','☻','♥','♦','♣','♠','•','◘','○','◙','♂','♀','♪','♫','☼','►','◄','↕','‼','¶','§','▬','↨','↑','↓','→','←','∟','↔','▲','▼'];
export function decodeByte(code){return code<32?low[code]:code===127?'⌂':code<128?String.fromCharCode(code):high[code-128];}
export async function locateTextMemory(module,{signal,timeout=18000}={}){
 const deadline=performance.now()+timeout,needle='PRESS KEY TO CONTINUE',prefix='init DIGI_SB driver';
 while(performance.now()<deadline){
  const ram=[],video=[];let h=module.HEAPU8;
  for(let start=0;start<h.length-100;start+=4*1024*1024){
   if(signal?.aborted)throw new DOMException('Stopped','AbortError');h=module.HEAPU8;
   const end=Math.min(h.length-100,start+4*1024*1024);
   for(let i=start;i<end;i++){
    if(h[i]===80&&h[i+2]===82&&h[i+4]===69){
     let matches=true;for(let j=0;j<needle.length;j++)if(h[i+j*2]!==needle.charCodeAt(j)){matches=false;break;}
     if(matches){const base=i-23*160;let valid=base>0;for(let j=0;j<prefix.length&&valid;j++)valid=h[base+13*160+j*2]===prefix.charCodeAt(j);if(valid)video.push(base);}
    }
    // BIOS mode3,80 columns,25 rows,16-pixel font and640KB conventional RAM.
    if(h[i]===3&&h[i+1]===80&&h[i+2]===0&&h[i+59]===24&&h[i+60]===16&&h[i+61]===0){const base=i-0x449;if(base>0&&h[base+0x413]===128&&h[base+0x414]===2)ram.push(base);}
   }
   await pause(0);
  }
  if(ram.length===1&&video.length===1)return Object.freeze({ram:ram[0],video:video[0]});
  await pause(300);
 }
 throw Error('DOS-programmet nådde inte sin startskärm. Försök igen.');
}
export function readTextScreen(module,addresses){
 if(!addresses)return null;
 const h=module.HEAPU8,{ram,video}=addresses,word=offset=>h[ram+offset]|h[ram+offset+1]<<8;
 const cols=word(0x44a),rows=h[ram+0x484]+1,offset=word(0x44e);
 if(cols!==80||rows<20||rows>60||video+offset+cols*rows*2>=h.length)return null;
 const codes=[],attributes=[],lines=[],players=[];
 for(let y=0;y<rows;y++){let line='';for(let x=0;x<cols;x++){
  const index=video+offset+(y*cols+x)*2,code=h[index],attribute=h[index+1];codes.push(code);attributes.push(attribute);line+=decodeByte(code);if(code===1||code===2)players.push({id:code,x,y,attribute});
 }lines.push(line);}
 const ticks=(word(0x46c)+word(0x46e)*65536)>>>0;
 return{cols,rows,fontHeight:word(0x485),ticks,codes,attributes,players,text:lines.join('\n')};
}
export function screenPhase(text=''){
 if(text.includes('PRESS KEY TO CONTINUE'))return'initializing';
 if(text.includes('Presented by...'))return'intro';
 if(text.includes('[Press SPACE]'))return'title';
 if(text.includes('Play Song')&&text.includes('Change Midi-Volume'))return'sound-settings';
 if(text.includes('Create Player')&&text.includes('Sound Settings'))return'options';
 if(text.includes('Menu [Rall v 0.026'))return'menu';
 if(text.includes('Artificial Intelligens'))return'ai-intro';
 if(text.includes('Get ready for action!'))return'two-player-intro';
 if(text.includes('killed with'))return'result';
 if(text.includes('Rooftop 2'))return'playing';
 if(/Player.?[12].*(win|won)|winner|game over/i.test(text))return'result';
 if(text.includes('Registration info:'))return'credits';
 if(text.includes("make options available"))return'options';
 if(text.includes('Player 1:')&&text.includes('Player 2:'))return'controls';
 return'original-screen';
}
