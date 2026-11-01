import {additionQuestions, subtractionQuestions} from './questions.mjs';
export const banks = {plus:additionQuestions,minus:subtractionQuestions};
export function readProgress(storage) {
  return Object.fromEntries(['plus','minus'].map(mode=>{
    let value=0;
    try {
      const raw=storage.getItem(mode+'Index');
      const n=Number(raw);
      if (raw!==null && Number.isInteger(n) && n>=0 && n<=banks[mode].length) value=n;
    } catch {}
    return [mode,value];
  }));
}
export class Course {
  constructor(progress={plus:0,minus:0}) {this.progress={...progress};this.mode=null;this.solved=false;}
  start(mode) {if(!banks[mode]) throw Error('Unknown mode');this.mode=mode;this.solved=false;}
  get question() {return this.mode?banks[this.mode][this.progress[this.mode]]:null;}
  answer(value) {
    if(!this.mode || this.solved || !this.question || !this.question.answers.includes(value)) return 'ignored';
    if(value!==this.question.correct) return 'wrong';
    this.solved=true;return 'correct';
  }
  next() {if(this.solved) {this.progress[this.mode]++;this.solved=false;} }
  restart() {this.progress[this.mode]=0;this.solved=false;}
  stop() {this.mode=null;this.solved=false;}
}
