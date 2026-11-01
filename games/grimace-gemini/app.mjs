import {MathGame, readScores, STORAGE_KEY} from './core.mjs';
const $ = id => document.getElementById(id);
let storage;
try { storage = window.localStorage; } catch { $('storage-note').hidden = false; }
const game = new MathGame(readScores(storage));
function progress() { $('progress').textContent = `Klarade frågor: Plus ${game.scores.plus} · Minus ${game.scores.minus}`; }
function save() {
  try {
    if (!storage) throw new Error('Unavailable');
    storage.setItem(STORAGE_KEY, JSON.stringify(game.scores));
  } catch { $('storage-note').hidden = false; }
}
function renderQuestion() {
  const q = game.question;
  $('grimace').classList.remove('happy');
  $('next').hidden = true; $('feedback').textContent = '';
  $('score').textContent = `Du har klarat ${game.scores[game.mode]} frågor i ${game.mode === 'plus' ? 'plus' : 'minus'}!`;
  $('question').textContent = `${q.a} ${game.mode === 'plus' ? '+' : '−'} ${q.b} = ?`;
  $('options').replaceChildren(...q.options.map(value => {
    const button = document.createElement('button'); button.textContent = value;
    button.addEventListener('click', () => {
      const result = game.answer(value);
      if (result === 'wrong') { $('feedback').textContent = 'Försök igen! Du klarar det.'; }
      if (result === 'correct') {
        save(); progress();
        $('score').textContent = `Du har klarat ${game.scores[game.mode]} frågor i ${game.mode === 'plus' ? 'plus' : 'minus'}!`;
        for (const option of $('options').children) option.disabled = true;
        button.classList.add('correct'); $('feedback').textContent = 'Rätt! Bra jobbat!';
        $('grimace').classList.add('happy'); $('next').hidden = false; $('next').focus();
      }
    }); return button;
  }));
  $('question').focus();
}
for (const button of document.querySelectorAll('[data-mode]')) button.addEventListener('click', () => {
  game.start(button.dataset.mode); $('menu').hidden = true; $('play').hidden = false;
  $('mode-label').textContent = button.dataset.mode === 'plus' ? 'Plus +' : 'Minus −'; renderQuestion();
});
$('next').addEventListener('click', () => { if (!game.solved) return; game.next(); renderQuestion(); });
$('back').addEventListener('click', () => {
  const mode = game.mode; game.stop(); $('grimace').classList.remove('happy');
  $('play').hidden = true; $('menu').hidden = false; progress(); document.querySelector(`[data-mode="${mode}"]`).focus();
});
progress();
