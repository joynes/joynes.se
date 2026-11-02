"""Independently check original byte preservation and music provenance."""
import hashlib,json,subprocess,tempfile,unittest,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'games/rall-030'
def sha(b):return hashlib.sha256(b).hexdigest()
class Preservation(unittest.TestCase):
    def test_release_files_unchanged(self):
        archive=ROOT/'original/rall-v030-fighter.zip'
        self.assertEqual(sha(archive.read_bytes()),'06565cd6ab475ae9ff5bffa35f833813161be6a300e3c5036b17893e20dbe098')
        manifest=json.loads((ROOT/'source-manifest.json').read_text())
        with zipfile.ZipFile(archive) as src,zipfile.ZipFile(ROOT/'game.jsdos') as dst:
            originals=[e for e in src.infolist() if not e.is_dir()]
            self.assertEqual(len(originals),173)
            self.assertEqual(set(manifest['originalFiles']),{e.filename for e in originals})
            for e in originals:self.assertEqual(dst.read(e.filename),src.read(e))
            self.assertIn('rall003/music/mod/',dst.namelist())
            self.assertEqual(set(dst.namelist())-set(src.namelist()),set(manifest['supportFiles']))
            for name,digest in manifest['supportFiles'].items():self.assertEqual(sha(dst.read(name)),digest)
        self.assertEqual(sha((ROOT/'game.jsdos').read_bytes()),manifest['bundleSha256'])
    def test_recovered_music_is_separate_and_attributed(self):
        m=json.loads((ROOT/'source-manifest.json').read_text())
        self.assertEqual(len(m['recoveredMusic']),8)
        self.assertEqual({x['file'] for x in m['recoveredMusic'] if x['relatedRevision']},{'nudro4.xm','hentia4.xm','dzew2x.xm'})
        with zipfile.ZipFile(ROOT/'game.jsdos') as dst:
            for item in m['recoveredMusic']:
                data=(ROOT/'recovered-music'/item['file']).read_bytes()
                self.assertTrue(data.startswith(b'Extended Module: '))
                self.assertEqual(len(data),int(item['size']))
                self.assertEqual(sha(data),item['sha256'])
                self.assertEqual(dst.read(item['runtimePath']),data)
                self.assertTrue(item['id']);self.assertTrue(item['originalName'])
    def test_mouse_adapter_rebuilds_from_source(self):
        with tempfile.TemporaryDirectory() as tmp:
            target=Path(tmp)/'ALMOUSE.COM'
            subprocess.run(['nasm','-f','bin',str(ROOT/'vendor/mouse-compat/almouse.asm'),'-o',str(target)],check=True)
            self.assertEqual(target.read_bytes(),(ROOT/'vendor/mouse-compat/ALMOUSE.COM').read_bytes())
            self.assertEqual(target.stat().st_size,169)
if __name__=='__main__':unittest.main()
