import {Course,readProgress,banks} from './core.mjs';
const $=id=>document.getElementById(id);
let storage;
try{storage=window.localStorage;}catch{$('storage-note').hidden=false;}
const game=new Course(readProgress(storage));
function save(){try{if(!storage)throw Error();for(const mode of ['plus','minus'])storage.setItem(mode+'Index',game.progress[mode]);}catch{$('storage-note').hidden=false;}}
function progress(){$('progress').textContent=`Klarade frågor: Plus ${game.progress.plus}/10 · Minus ${game.progress.minus}/10`;}
function show(id){for(const section of ['menu','play','exit-screen'])$(section).hidden=section!==id;}
function render(){
  $('grimace').classList.remove('happy');$('next').hidden=true;$('feedback').textContent='';$('options').replaceChildren();
  $('score').textContent=`Du har klarat ${game.progress[game.mode]} av ${banks[game.mode].length} frågor!`;
  const q=game.question;
  $('restart').hidden=!!q;
  $('question').textContent=q?`${q.q.replace('-', '−')} = ?`:'Du har klarat alla frågor!';
  if(q)for(const value of q.answers){
    const button=document.createElement('button');button.textContent=value;
    button.addEventListener('click',()=>{
      const result=game.answer(value);
      if(result==='wrong')$('feedback').textContent='Försök igen!';
      if(result==='correct'){
        for(const option of $('options').children)option.disabled=true;
        button.classList.add('correct');$('feedback').textContent='Rätt! Bra jobbat!';$('grimace').classList.add('happy');
        // Commit the solved question now so reload also preserves the last answer.
        const completed=game.progress[game.mode]+1;
        try{if(!storage)throw Error();storage.setItem(game.mode+'Index',completed);}catch{$('storage-note').hidden=false;}
        $('score').textContent=`Du har klarat ${completed} av ${banks[game.mode].length} frågor!`;
        $('next').textContent=completed===banks[game.mode].length?'Visa resultat →':'Nästa fråga →';
        $('next').hidden=false;$('next').focus();
      }
    });$('options').append(button);
  }
  $('question').focus();
}
for(const button of document.querySelectorAll('[data-mode]'))button.addEventListener('click',()=>{
  game.start(button.dataset.mode);show('play');$('mode-label').textContent=game.mode==='plus'?'Plus +':'Minus −';render();
});
$('next').addEventListener('click',()=>{if(!game.solved)return;game.next();save();render();});
$('back').addEventListener('click',()=>{const mode=game.mode;if(game.solved)game.next();save();game.stop();progress();show('menu');document.querySelector(`[data-mode="${mode}"]`).focus();});
$('restart').addEventListener('click',()=>{game.restart();save();progress();render();});
$('exit').addEventListener('click',()=>{show('exit-screen');$('exit-screen').querySelector('h2').focus();});
$('return').addEventListener('click',()=>{show('menu');document.querySelector('[data-mode="plus"]').focus();});
progress();
