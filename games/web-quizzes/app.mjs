import { QuizGame, readBestScores } from './core.mjs';

const el = id => document.getElementById(id);
export let game;
let best = {};
let storage;
try { storage = window.localStorage; } catch { storage = {getItem: () => null, setItem: () => { throw new Error('Storage unavailable'); }}; }

function screens(name) {
  for (const id of ['menu', 'play', 'result']) el(id).hidden = id !== name;
}

function showMenu() {
  game.menu();
  screens('menu');
  el('stages').replaceChildren(...game.stages.map((stage, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'stage-button';
    button.classList.toggle('complete', best[stage.id] === stage.questions.length);
    const number = document.createElement('strong');
    number.textContent = `Bana ${index + 1}`;
    const title = document.createElement('span');
    title.textContent = stage.title;
    const record = document.createElement('span');
    record.className = 'best';
    record.textContent = `Bästa: ${best[stage.id] || 0} / ${stage.questions.length}`;
    button.append(number, title, record);
    button.addEventListener('click', () => start(index));
    return button;
  }));
}

function start(index) {
  game.start(index);
  screens('play');
  el('stage-name').textContent = `Bana ${index + 1} · ${game.stage.title}`;
  renderQuestion();
}

function updateScore() {
  el('score').textContent = `Poäng: ${game.score}`;
  el('progress-text').textContent = `Fråga ${game.position + 1} av ${game.questions.length}`;
  el('progress').max = game.questions.length;
  el('progress').value = game.position;
}

function renderQuestion() {
  el('question').textContent = game.current.question;
  el('feedback').textContent = '';
  el('feedback').classList.remove('error');
  el('next').hidden = true;
  el('options').replaceChildren(...game.current.options.map((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option';
    button.textContent = option.text;
    button.addEventListener('click', () => {
      const correct = game.answer(index);
      if (correct === null) return;
      el('score').textContent = `Poäng: ${game.score}`;
      button.disabled = true;
      button.classList.add(correct ? 'correct' : 'wrong');
      el('feedback').classList.toggle('error', !correct);
      el('feedback').textContent = correct ? 'Rätt! En poäng till.' : 'Inte riktigt. Försök med ett annat svar. Poängen går aldrig under noll.';
      if (correct) {
        el('options').querySelectorAll('button').forEach(b => { b.disabled = true; });
        el('progress').value = game.position + 1;
        el('next').hidden = false;
        el('next').textContent = game.position === game.questions.length - 1 ? 'Se resultat →' : 'Nästa fråga →';
        el('next').focus({preventScroll: true});
      }
    });
    return button;
  }));
  updateScore();
  el('question').focus({preventScroll: true});
  el('play').scrollIntoView({block: 'start', behavior: 'instant'});
}

function showResult() {
  const previous = best[game.stage.id] || 0;
  best[game.stage.id] = Math.max(previous, game.score);
  try { storage.setItem('joynes.quiz.best.v1', JSON.stringify(best)); }
  catch { el('storage-notice').hidden = false; }
  screens('result');
  el('final-score').textContent = `${game.score} av ${game.questions.length} poäng`;
  el('record').textContent = game.score > previous ? 'Nytt personbästa!' : `Ditt bästa resultat är ${best[game.stage.id]} poäng.`;
  el('result-title').focus({preventScroll: true});
  el('result').scrollIntoView({block: 'start', behavior: 'instant'});
}

el('next').addEventListener('click', () => {
  if (!game?.next()) return;
  if (game.status === 'complete') showResult();
  else renderQuestion();
});
el('back-menu').addEventListener('click', showMenu);
el('choose-stage').addEventListener('click', showMenu);
el('restart').addEventListener('click', () => start(game.stageIndex));

async function load() {
  try {
    const response = await fetch(new URL('./questions.json', import.meta.url));
    if (!response.ok) throw new Error('Kunde inte hämta frågorna.');
    game = new QuizGame(await response.json());
    best = readBestScores(storage, game.stages);
    showMenu();
  } catch {
    const text = document.createElement('p');
    text.textContent = 'Frågorna kunde inte laddas. Kontrollera anslutningen och försök igen.';
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'button';
    retry.textContent = 'Försök igen';
    retry.addEventListener('click', load);
    el('stages').replaceChildren(text, retry);
  }
}
await load();
