export function shuffled(values, random = Math.random) {
  const result = values.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export class QuizGame {
  constructor(stages, random = Math.random) {
    if (!Array.isArray(stages) || !stages.length) throw new Error('Frågebanken saknas.');
    for (const stage of stages) {
      if (!stage.questions?.length) throw new Error('En bana saknar frågor.');
      for (const q of stage.questions) {
        if (!q.question || !Number.isInteger(q.answer) || !q.options?.[q.answer] || new Set(q.options).size !== q.options.length) throw new Error('En fråga är ogiltig.');
      }
    }
    this.stages = stages;
    this.random = random;
    this.stageIndex = -1;
    this.status = 'menu';
    this.score = 0;
    this.position = 0;
    this.questions = [];
  }

  start(index) {
    if (!Number.isInteger(index) || !this.stages[index]) throw new Error('Banan finns inte.');
    this.stageIndex = index;
    this.questions = shuffled(this.stages[index].questions, this.random).map(q => ({
      ...q, options: shuffled(q.options.map((text, i) => ({ text, correct: i === q.answer })), this.random)
    }));
    this.score = 0;
    this.position = 0;
    this.wrongOptions = new Set();
    this.status = 'playing';
  }

  get current() { return this.questions[this.position]; }
  get stage() { return this.stages[this.stageIndex]; }

  answer(index) {
    if (this.status !== 'playing' || !this.current?.options[index] || this.wrongOptions.has(index)) return null;
    if (this.current.options[index].correct) {
      this.score++;
      this.status = 'answered';
      return true;
    }
    this.score = Math.max(0, this.score - 1);
    this.wrongOptions.add(index);
    return false;
  }

  next() {
    if (this.status !== 'answered') return false;
    this.position++;
    this.wrongOptions = new Set();
    this.status = this.position === this.questions.length ? 'complete' : 'playing';
    return true;
  }

  menu() { this.status = 'menu'; }
}

export function readBestScores(storage, stages) {
  let raw;
  try { raw = JSON.parse(storage.getItem('joynes.quiz.best.v1') || '{}'); } catch { return {}; }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return Object.fromEntries(stages.flatMap(stage => {
    const value = raw[stage.id];
    return Number.isInteger(value) && value >= 0 && value <= stage.questions.length ? [[stage.id, value]] : [];
  }));
}
