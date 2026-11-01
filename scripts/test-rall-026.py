"""Preserve the full 1998 DOS release, not a reimplementation of its rules."""
import hashlib
import json
from pathlib import Path
import unittest
import zipfile

GAME = Path(__file__).resolve().parents[1] / 'games/rall-026'
sha = lambda data: hashlib.sha256(data).hexdigest()


class ReleasePreservation(unittest.TestCase):
    def test_every_original_file_is_unchanged(self):
        manifest = json.loads((GAME/'source-manifest.json').read_text())
        archive = GAME/'original/rall-v026-ascii.zip'
        self.assertEqual(sha(archive.read_bytes()), manifest['originalArchiveSha256'])
        with zipfile.ZipFile(archive) as original, zipfile.ZipFile(GAME/'game.jsdos') as runtime:
            files = [entry.filename for entry in original.infolist() if not entry.is_dir()]
            self.assertEqual(len(files), 23)
            self.assertEqual(set(files), set(manifest['originalFiles']))
            self.assertEqual(sum(name.lower().endswith('.wav') for name in files), 9)
            self.assertEqual(sum(name.lower().endswith('.mid') for name in files), 4)
            for name in files:
                with self.subTest(name=name):
                    self.assertEqual(runtime.read(name), original.read(name))
                    self.assertEqual(sha(runtime.read(name)), manifest['originalFiles'][name])
            self.assertEqual(set(runtime.namelist())-set(files), set(manifest['supportFiles']))
            for name, digest in manifest['supportFiles'].items():
                self.assertEqual(sha(runtime.read(name)), digest)
            self.assertEqual(runtime.read('.jsdos/dosbox.conf'), (GAME/'dosbox.conf').read_bytes())
            self.assertEqual(runtime.read('Rall0026/CWSDPMI.EXE'), (GAME/'vendor/cwsdpmi/CWSDPMI.EXE').read_bytes())
        self.assertEqual(sha((GAME/'game.jsdos').read_bytes()), manifest['bundleSha256'])

    def test_sources_and_compatibility_configuration_are_supplied(self):
        conf = (GAME/'dosbox.conf').read_text()
        self.assertIn('CWSDPMI -p -x\nrall.exe', conf)
        self.assertIn('prebuffer=0', conf)
        for path in ['vendor/emulators/sources/emulators-v8.5.2.tar.gz',
                     'vendor/emulators/sources/dosbox-528578d.tar.gz',
                     'vendor/emulators/LICENSE', 'vendor/emulators/LICENSE_LIBZIP',
                     'vendor/cwsdpmi/csdpmi5s.zip', 'vendor/cwsdpmi/CWSDPMI.DOC']:
            self.assertGreater((GAME/path).stat().st_size, 100)


if __name__ == '__main__':
    unittest.main()
