export const modes = ['practice','guess','take10','exam'];
export function shuffle(values, random=Math.random) {
 const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}
export function normalize(value) {return value.normalize('NFKC').toLocaleLowerCase('en').replace(/\s+/gu,'');}
export function levenshtein(a,b) {
 const left=Array.from(a),right=Array.from(b);let row=right.map((_,i)=>i+1);row.unshift(0);
 for(let i=1;i<=left.length;i++){
  const next=[i];for(let j=1;j<=right.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(left[i-1]===right[j-1]?0:1));row=next;
 }return row[right.length];
}
export function similarityCredit(correct,answer) {
 const expected=normalize(correct),actual=normalize(answer);if(!expected.length)return 0;
 const fraction=1-levenshtein(expected,actual)/Array.from(expected).length;return fraction>=0.5?fraction:0;
}
export class Memit {
 constructor(items,random=Math.random){if(items.length<6)throw Error('At least six items required');this.items=items;this.random=random;this.mode=null;}
 start(mode){
  if(!modes.includes(mode))throw Error('Unknown mode');this.mode=mode;const items=shuffle(this.items,this.random);
  this.questions=['guess','take10'].includes(mode)?items.slice(0,10):items;
  this.index=0;this.score=0;this.mistakes=0;this.solved=false;this.wrongChoices=new Set();this.setOptions();
 }
 get question(){return this.questions?.[this.index];}
 get complete(){return !!this.mode && this.index>=this.questions.length;}
 setOptions(){this.options=this.mode==='guess'&&this.question?shuffle([this.question,...shuffle(this.questions.filter(x=>x.id!==this.question.id),this.random).slice(0,5)],this.random):[];}
 choose(id){
  if(this.mode!=='guess'||!this.question||this.solved||!this.options.some(x=>x.id===id)||this.wrongChoices.has(id))return {kind:'ignored'};
  if(id===this.question.id){this.score++;this.solved=true;return {kind:'correct'};}
  this.score--;this.mistakes++;this.wrongChoices.add(id);return {kind:'wrong',credit:0};
 }
 submit(answer){
  if(!['take10','exam'].includes(this.mode)||!this.question||this.solved)return {kind:'ignored'};
  if(!normalize(answer))return {kind:'empty'};
  if(normalize(answer)===normalize(this.question.name)){this.score++;this.solved=true;return {kind:'correct'};}
  const credit=similarityCredit(this.question.name,answer);this.score+=credit-1;this.mistakes++;return {kind:'wrong',credit};
 }
 next(){
  if(!this.question||(!this.solved&&this.mode!=='practice'))return;
  this.index++;this.solved=false;this.wrongChoices=new Set();this.setOptions();
 }
}
