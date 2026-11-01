import {ReadingGame,alphabet} from './core.mjs';
const $=id=>document.getElementById(id);
let game,muted=false,activeAudio;
function stopAudio(){if(activeAudio){activeAudio.pause();activeAudio.currentTime=0;activeAudio=null;}}
function sound(name){
 stopAudio();if(muted)return;
 const audio=new Audio(`res/sound/${name}.wav`);activeAudio=audio;
 audio.play().then(()=>{if(activeAudio===audio)$('audio-note').textContent='';}).catch(error=>{if(activeAudio===audio && error.name!=='AbortError')$('audio-note').textContent='Ljudet kunde inte spelas. Du kan fortsätta spela och prova ljudknappen igen.';});
}
$('sound').addEventListener('click',()=>{muted=!muted;stopAudio();$('sound').textContent=muted?'Ljud av':'Ljud på';$('sound').setAttribute('aria-pressed',String(muted));if(!muted)sound('letter_0');});
function image(src,alt){const img=document.createElement('img');img.src=src;img.alt=alt;return img;}
function menu(){stopAudio();$('play').hidden=true;$('menu').hidden=false;}
function render(){
 $('feedback').textContent='';$('next').hidden=true;$('replay').hidden=true;$('letters').replaceChildren();$('options').replaceChildren();
 $('coins').textContent=game.coins;
 const q=game.question;
 $('position').textContent=`Bana ${game.stage+1} · ${q?game.index+1:game.words.length}/${game.words.length}`;
 $('prompt').textContent=q?'Vilken bild passar ordet?':`Banan klar! Du samlade ${game.coins} mynt.`;
 if(!q){$('replay').hidden=false;$('prompt').focus();return;}
 for(const letter of q.word){
  const idx=alphabet.indexOf(letter),button=document.createElement('button');
  button.setAttribute('aria-label',`Lyssna på ${letter.toUpperCase()}`);button.append(image(`res/image/alpha/${idx}.png`,letter.toUpperCase()));button.addEventListener('click',()=>sound('letter_'+idx));$('letters').append(button);
 }
 for(const option of game.options){
  const button=document.createElement('button');button.append(image(`res/image/level/${game.stage}/${option.image}.png`,option.word));
  button.addEventListener('click',()=>{
   const result=game.answer(option.image);$('coins').textContent=game.coins;
   if(result==='wrong'){sound('wrong_answer');$('feedback').textContent='Försök igen!';}
   if(result==='correct'){
    sound('correct_answer');for(const b of $('options').children)b.disabled=true;button.classList.add('correct');
    $('feedback').textContent='Rätt! Du fick ett mynt.';$('next').textContent=game.index===game.words.length-1?'Visa resultat →':'Nästa ord →';$('next').hidden=false;$('next').focus();
   }
  });$('options').append(button);
 }
 $('prompt').focus();
}
$('back').addEventListener('click',()=>{menu();$('stages').children[game.stage].focus();});
$('next').addEventListener('click',()=>{if(!game.solved)return;game.next();render();});
$('replay').addEventListener('click',()=>{game.start(game.stage);render();});
async function load(){
 $('loading').hidden=false;$('error').hidden=true;
 try{
  const response=await fetch('words.json');if(!response.ok)throw Error('Fetch');const stages=await response.json();
  if(stages.length!==3||stages.some((s,i)=>s.length!==[5,12,18][i]))throw Error('Data');
  game=new ReadingGame(stages);$('stages').replaceChildren(...stages.map((words,stage)=>{
   const button=document.createElement('button');button.append(image(`res/image/level/${stage}/stage.png`,''));
   const label=document.createElement('span');label.textContent=`Bana ${stage+1}`;const detail=document.createElement('small');detail.textContent=`${words.length} ord`;button.append(label,detail);
   button.addEventListener('click',()=>{game.start(stage);$('menu').hidden=true;$('play').hidden=false;render();});return button;
  }));menu();
 }catch{$('error').hidden=false;}finally{$('loading').hidden=true;}
}
$('retry').addEventListener('click',load);load();
