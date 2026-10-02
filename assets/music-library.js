/* Catalog grouping and queues are shared by the archive and AI player. */
(function (root) {
  function songKey(title) {
    return String(title).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/^\d+\s*[-.]\s*/, '').replace(/^joynes\s*-\s*/, '')
      .replace(/\([^)]*\)/g, '').replace(/\s*[–—]\s*.*$/, '')
      .replace(/[- ]part\d+.*$/, '').replace(/[- ]faithful[- ]cover[- ]test$/, '')
      .replace(/[^a-z0-9]+/g, '');
  }

  // Verified archive aliases. Unknown names stay separate rather than using fuzzy matches.
  const aliases = {
    nudro4: 'nudro', hrm15: 'hrm', trorjagvet: 'trorjagvetvadduvillha'
  };
  function groupKey(title) {
    const key = songKey(title);
    return aliases[key] || key;
  }
  function shuffle(tracks, random = Math.random) {
    const result = tracks.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function queueStartingWith(tracks, track, shuffled) {
    const rest = tracks.filter(entry => entry.id !== track.id);
    return [track, ...(shuffled ? shuffle(rest) : rest)];
  }
  function build(categories, catalog, resolveHref) {
    const groups = new Map();
    const tracks = [];
    const getGroup = (key, title) => {
      if (!groups.has(key)) groups.set(key, { id: key, title, tracks: [] });
      return groups.get(key);
    };
    for (const category of categories.filter(entry => ['music', 'old'].includes(entry.id))) {
      for (const item of category.items) {
        const key = groupKey(item[0]);
        const group = getGroup(key, item[0].replace(/^\d+\s*-\s*joynes\s*-\s*/i, ''));
        const track = {
          id: 'archive-' + key, title: group.title, href: resolveHref(item[2][0][1]),
          ai: false, source: 'Joynes archive', generationType: 'Original',
          groupId: key, sourcePlaylists: [], sourceUrl: item[2][0][1]
        };
        group.tracks.push(track);
        tracks.push(track);
        item[3] = { ...item[3], groupId: key };
        group.archiveItem = item;
        group.archiveCategory = category;
      }
    }
    for (const entry of catalog.tracks) {
      const key = groupKey(entry.title);
      const group = getGroup(key, entry.title.replace(/\s*\([^)]*\)/g, '').replace(/\s*[–—]\s*.*$/, ''));
      const track = { ...entry, groupId: key };
      group.tracks.push(track);
      tracks.push(track);
    }
    function groupItem(group, allowedTracks = group.tracks) {
      const original = group.tracks.find(track => !track.ai);
      const aiTracks = allowedTracks.filter(track => track.ai);
      return [group.title,
        `${original ? 'Archive original · ' : ''}${aiTracks.length} AI-generated ${aiTracks.length === 1 ? 'version' : 'versions'} · Suno`,
        [], { groupId: group.id, slug: group.id }];
    }
    const music = categories.find(entry => entry.id === 'music');
    const old = categories.find(entry => entry.id === 'old');
    music.items.push(...old.items);
    for (const group of groups.values()) {
      if (!group.archiveItem) music.items.push(groupItem(group));
      else {
        const count = group.tracks.filter(track => track.ai).length;
        if (count) group.archiveItem[1] += ` · ${count} AI-generated ${count === 1 ? 'variation' : 'variations'}`;
      }
    }
    music.description = 'Original Joynes tracks and new AI interpretations. Open a song to explore its original and variations, or switch to AI-only shuffle.';
    music.sub = 'Originals, variations and personal playlists.';
    const aiTracks = tracks.filter(track => track.ai);
    const aiCategory = {
      id: 'ai', name: 'Music', title: 'Music', glyph: 'M', musicView: true,
      kicker: 'AI mode · Suno · Shuffle', sub: '47 Suno tracks · AI-only shuffle.',
      description: 'AI-generated music from Suno. Choose any version to play it first, then shuffle through only AI tracks.',
      featured: [], tracks: aiTracks,
      items: [...groups.values()].filter(group => group.tracks.some(track => track.ai)).map(group => groupItem(group))
    };
    const personal = [
      { id: 'estelle', title: 'Estelle', sourcePlaylist: 'Estelle' },
      { id: 'milian', title: 'Milian', sourcePlaylist: 'Milian' },
      { id: 'stephanie', title: 'Stephanie', sourcePlaylist: 'Steffi' }
    ];
    for (const person of personal) {
      const selected = aiTracks.filter(track => track.sourcePlaylists.includes(person.sourcePlaylist));
      categories.push({
        ...person, name: person.title, glyph: person.title[0], musicView: true,
        kicker: 'Personal playlist · Suno', sub: `${selected.length} AI-generated tracks`,
        description: `Only the ${selected.length} songs categorized in the ${person.sourcePlaylist} playlist on Suno.`,
        tracks: selected, featured: [],
        items: [...groups.values()].filter(group => selected.some(track => track.groupId === group.id))
          .map(group => groupItem(group, selected.filter(track => track.groupId === group.id)))
      });
    }
    return { groups, tracks, aiTracks, personal, groupItem, aiView: aiCategory };
  }
  root.JoynesMusic = { songKey, groupKey, shuffle, queueStartingWith, build };
})(typeof window === 'undefined' ? globalThis : window);
