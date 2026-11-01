export const alphabet = 'abcdefghijklmnopqrstuvwxyzåäö';
export function shuffle(values, random=Math.random) {
  const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}
export class ReadingGame {
 constructor(stages,random=Math.random){this.stages=stages;this.random=random;this.stage=null;}
 start(stage){if(!this.stages[stage])throw Error('Unknown stage');this.stage=stage;this.words=shuffle(this.stages[stage],this.random);this.index=0;this.coins=0;this.solved=false;this.setOptions();}
 get question(){return this.words?.[this.index];}
 setOptions(){if(!this.question){this.options=[];return;}this.options=shuffle([this.question,...shuffle(this.words.filter(w=>w!==this.question),this.random).slice(0,3)],this.random);}
 answer(image){
  if(this.solved||!this.question||!this.options.some(w=>w.image===image))return 'ignored';
  if(image!==this.question.image){this.coins=Math.max(0,this.coins-1);return 'wrong';}
  this.coins++;this.solved=true;return 'correct';
 }
 next(){if(!this.solved)return;this.index++;this.solved=false;this.setOptions();}
}
