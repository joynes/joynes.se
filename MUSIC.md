# Music library

`assets/music-catalog.js` contains the 47 recordings imported from **Suno – Gillade låtar**, exported on 2026-08-14 and imported on 2026-10-02. Audio is served from `assets/audio/ai/`, using stable Suno song IDs as filenames. The imported files were verified against the file sizes in the supplied Google Drive folder and validated with ffprobe.

Each recording preserves its title, Suno URL, model, generation type, duration, style, source filename, Drive file ID and original Suno playlist memberships. Local download paths and account information are excluded from the public catalog. Every recording in this import is marked AI-generated, including titles that contain “original”. “Archive original” is reserved for the existing Joynes archive recordings.

`assets/music-library.js` groups titles case-insensitively, ignoring punctuation, export track numbers and version suffixes. Explicit archive aliases map NUDRO4 → nudro, HRM15 → hrm, and Tror Jag Vet → Tror jag vet vad du vill ha. Unknown names remain separate; do not add a guessed association based only on a genre or prompt.

Personal playlists follow source memberships exactly: Estelle (1 track), Milian (7 tracks), Stephanie (the Suno playlist named Steffi, 3 tracks). The user initially said “Emilia”; Milian is the provisional name based on the supplied metadata, pending clarification.

AI mode is a switch inside Music, at `#music/ai`, and has no separate portal. Old `#ai` links redirect to the Music mode. AI mode plays the selected recording first and shuffles all remaining AI recordings without repetition within a cycle. Personal playback queues only their categorized recordings. Opening a song from the archive allows an original/variations queue; choosing the original exits AI-only playback.

Run catalog and grouping tests with `node --test scripts/test-music.cjs`. Serve the site with `python3 serve.py` for local audio playback and seeking. GitHub Pages publishes the root of `master`; joynes.se forwards to that Pages site.
