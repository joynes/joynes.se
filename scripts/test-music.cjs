const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(path.join(root, 'assets/music-library.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/music-catalog.js'), 'utf8'), context);
const api = context.window.JoynesMusic;
const catalog = context.window.joynesMusicCatalog;
function library() {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const categoryCode = html.match(/const categories = ([\s\S]*?);\s*function slugify/)[1];
  const categories = vm.runInContext(categoryCode, context);
  return { categories, ...api.build(categories, catalog, href => href) };
}
test('47 unique Suno recordings have local audio and public source metadata', () => {
  assert.equal(catalog.tracks.length, 47);
  assert.equal(new Set(catalog.tracks.map(t => t.id)).size, 47);
  for (const track of catalog.tracks) {
    assert.equal(track.ai, true);
    assert.ok(fs.statSync(path.join(root, track.href)).size > 100000);
    assert.match(track.sourceUrl, /^https:\/\/suno.com\/song\//);
    assert.ok(track.model && track.sourceFile && track.driveFileId);
    assert.ok(!JSON.stringify(track).includes('/Users/'));
  }
});
test('archive originals retain all known variations without merging unknown titles', () => {
  const lib = library();
  assert.equal(lib.tracks.filter(t => !t.ai).length, 23);
  assert.equal(lib.groups.get('ichbinstark').tracks.length, 7);
  assert.equal(lib.groups.get('sorthebridge').tracks.length, 3);
  assert.equal(lib.groups.get('sploth').tracks.length, 5);
  assert.equal(lib.groups.get('trorjagvetvadduvillha').tracks.length, 3);
  assert.equal(lib.groups.get('hrm').tracks.length, 3);
  assert.equal(lib.groups.get('nudro').tracks.length, 2);
  assert.equal(lib.groups.get('grisarna').tracks.length, 3);
  assert.equal(lib.groups.get('intothedeep').tracks.length, 4);
  assert.notEqual(api.groupKey('Backseat Apricots'), api.groupKey('Sous les vagues'));
});
test('AI shuffle starts with selected recording and contains only AI, once per cycle', () => {
  const lib = library();
  assert.ok(lib.categories.every(category => category.id !== 'ai'));
  assert.equal(lib.aiView.title, 'Music');
  const selected = lib.aiTracks[12];
  const queue = api.queueStartingWith(lib.aiTracks, selected, true);
  assert.equal(queue[0].id, selected.id);
  assert.equal(queue.length, 47);
  assert.equal(new Set(queue.map(t => t.id)).size, 47);
  assert.ok(queue.every(t => t.ai));
});
test('personal queues match Suno playlist membership exactly', () => {
  const lib = library();
  for (const [id, source, count] of [['estelle', 'Estelle', 1], ['milian', 'Milian', 7], ['stephanie', 'Steffi', 3]]) {
    const category = lib.categories.find(c => c.id === id);
    assert.equal(category.tracks.length, count);
    assert.ok(category.tracks.every(t => t.sourcePlaylists.includes(source)));
    const queue = api.queueStartingWith(category.tracks, category.tracks.at(-1), false);
    assert.equal(queue.length, count);
    assert.ok(queue.every(t => t.sourcePlaylists.includes(source)));
  }
});
