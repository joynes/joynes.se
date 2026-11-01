import {Memit} from './core.mjs';
const $=id=>document.getElementById(id);
const labels={practice:'Öva',guess:'Gissa',take10:'Ta 10',exam:'Prov'};
let game,lastMode;
function setFeedback(text='',kind=''){$('feedback').textContent=text;$('feedback').dataset.kind=kind;}
function updateScore(){
 const answered=game.index+(game.solved?1:0);
 $('score').hidden=game.mode==='practice';$('score').textContent=`Poäng: ${game.score.toFixed(2)} · Klarade: ${answered}/${game.questions.length}`;
}
function brokenImage(img){img.addEventListener('error',()=>setFeedback('En bild kunde inte laddas. Prova att ladda om sidan.','wrong'));}
function render(){
 for(const id of ['portrait','name','grid','answer-form','next','result','typing-rules'])$(id).hidden=true;
 $('grid').replaceChildren();$('answer').value='';$('answer').disabled=false;$('answer-form').querySelector('button').disabled=false;setFeedback();updateScore();
 $('position').textContent=game.complete?`${game.questions.length} av ${game.questions.length}`:`${game.index+1} av ${game.questions.length}`;
 if(game.complete){
  $('prompt').textContent='Omgången är klar!';$('result').hidden=false;
  $('result-title').textContent=game.mode==='practice'?'Du har övat på alla hjältar!':game.mistakes===0?'Full pott!':`Ditt resultat: ${game.score.toFixed(2)} poäng`;
  $('result-detail').textContent=game.mode==='practice'?`${game.questions.length} bilder och namn genomgångna.`:`${game.questions.length} frågor klarade · ${game.mistakes} felsvar.`;
  $('prompt').focus();return;
 }
 const q=game.question;
 $('prompt').textContent=game.mode==='practice'?'Bild och namn':game.mode==='guess'?`Välj bilden: ${q.name}`:'Vad heter hjälten?';
 if(game.mode==='guess'){
  $('grid').hidden=false;
  for(const option of game.options){
   const button=document.createElement('button'),img=document.createElement('img');img.src=option.image;img.alt=option.name;brokenImage(img);button.append(img);
   button.addEventListener('click',()=>{
    const result=game.choose(option.id);updateScore();
    if(result.kind==='wrong'){button.classList.add('wrong');button.disabled=true;setFeedback('Fel bild. −1 poäng. Försök igen!','wrong');}
    if(result.kind==='correct'){for(const b of $('grid').children)b.disabled=true;button.classList.add('correct');solved();}
   });$('grid').append(button);
  }
 }else{
  $('portrait').src=q.image;$('portrait').alt=game.mode==='practice'?q.name:'Dota-hjälte att namnge';$('portrait').hidden=false;
  if(game.mode==='practice'){$('name').textContent=q.name;$('name').hidden=false;$('next').hidden=false;}
  else{$('answer-form').hidden=false;$('typing-rules').hidden=false;}
 }
 $('next').textContent=game.index===game.questions.length-1?'Visa resultat →':'Nästa →';
 if(['take10','exam'].includes(game.mode))$('answer').focus();else $('prompt').focus();
}
function solved(){setFeedback('Rätt! +1 poäng.','correct');$('next').hidden=false;$('next').focus();}
function start(mode){lastMode=mode;game.start(mode);$('menu').hidden=true;$('play').hidden=false;$('mode-label').textContent=labels[mode];render();}
$('answer-form').addEventListener('submit',event=>{
 event.preventDefault();const result=game.submit($('answer').value);updateScore();
 if(result.kind==='empty'){setFeedback('Skriv ett namn först.');$('answer').focus();return;}
 if(result.kind==='correct'){$('answer').disabled=true;$('answer-form').querySelector('button').disabled=true;solved();}
 if(result.kind==='wrong'){
  const deduction=(1-result.credit).toFixed(2);setFeedback(`Rätt namn är ${game.question.name}. Skriv det igen! Avdrag: ${deduction} poäng${result.credit?` (stavningslikhet gav ${result.credit.toFixed(2)} i återbäring)`:''}.`,'wrong');$('answer').value='';$('answer').focus();
 }
});
$('next').addEventListener('click',()=>{game.next();render();});
$('replay').addEventListener('click',()=>start(lastMode));
$('back').addEventListener('click',()=>{$('play').hidden=true;$('menu').hidden=false;document.querySelector(`[data-mode="${lastMode}"]`).focus();});
brokenImage($('portrait'));
for(const b of document.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>start(b.dataset.mode));
async function load(){
 $('error').hidden=true;$('loading').hidden=false;
 try{
  const response=await fetch('dota-heroes.json');if(!response.ok)throw Error('Fetch');const data=await response.json();
  if(!Array.isArray(data.items)||data.items.length<6||new Set(data.items.map(i=>i.id)).size!==data.items.length||data.items.some(i=>!i.name||!/^images\/[a-z0-9_]+\.png$/.test(i.image)))throw Error('Data');
  game=new Memit(data.items);$('dataset').textContent=`${data.items.length} hjältar · ${data.title}`;$('menu').hidden=false;
 }catch{$('error').hidden=false;}finally{$('loading').hidden=true;}
}
$('retry').addEventListener('click',load);load();
