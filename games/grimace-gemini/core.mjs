export const STORAGE_KEY = 'grimaceMathScores';
export function readScores(storage) {
  try {
    const data = JSON.parse(storage.getItem(STORAGE_KEY));
    return Object.fromEntries(['plus', 'minus'].map(key => [key,
      Number.isSafeInteger(data?.[key]) && data[key] >= 0 && data[key] <= 1000000 ? data[key] : 0]));
  } catch { return {plus: 0, minus: 0}; }
}
export function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function makeQuestion(mode, level, random = Math.random) {
  if (!['plus', 'minus'].includes(mode)) throw new Error('Unknown mode');
  const draw = max => Math.floor(random() * max) + 1;
  let a, b, answer;
  if (mode === 'plus') {
    a = draw(level * 1.5 + 5); b = draw(level * 1.5 + 5); answer = a + b;
  } else {
    b = draw(level + 3); answer = draw(level * 1.5 + 4); a = b + answer;
  }
  const candidates = [];
  for (let offset = -4; offset <= 4; offset++) {
    if (offset && answer + offset >= 0) candidates.push(answer + offset);
  }
  return {a, b, answer, options: shuffle([answer, ...shuffle(candidates, random).slice(0, 3)], random)};
}
export class MathGame {
  constructor(scores = {plus: 0, minus: 0}, random = Math.random) {
    this.scores = {...scores}; this.random = random; this.mode = null; this.question = null; this.solved = false;
  }
  start(mode) { this.mode = mode; return this.next(); }
  stop() { this.mode = null; this.question = null; this.solved = false; }
  next() {
    if (!this.mode) return null;
    this.solved = false;
    return this.question = makeQuestion(this.mode, this.scores[this.mode], this.random);
  }
  answer(value) {
    if (!this.mode || this.solved || !this.question.options.includes(value)) return 'ignored';
    if (value !== this.question.answer) return 'wrong';
    this.solved = true; this.scores[this.mode]++; return 'correct';
  }
}
