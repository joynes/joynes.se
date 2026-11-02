"""Preserve all 173 release files, adding only documented DOS compatibility/music."""
import copy, hashlib, json, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'games/rall-030'
def sha(b): return hashlib.sha256(b).hexdigest()
archive=ROOT/'original/rall-v030-fighter.zip'
meta=json.loads((ROOT/'recovered-music/sources.json').read_text())
aliases={'druno.xm':'Druno.xm','sectop.xm':'Sectop.xm','bacols.xm':'Bacols.xm','sdrugzl.xm':'Sdrugzl.xm','drakz.xm':'Drakz.xm','dzew2x.xm':'Dzew2.xm','nudro4.xm':'Nudro.xm','hentia4.xm':'Hentia.xm'}
manifest={'originalDriveId':'1FGPeHw10MCgX4vUwJNITWSx8r84M4TZ8','originalArchiveSha256':sha(archive.read_bytes()),'originalYear':1999,'originalFiles':{},'supportFiles':{},'recoveredMusic':[]}
with zipfile.ZipFile(archive) as src,zipfile.ZipFile(ROOT/'game.jsdos','w',zipfile.ZIP_DEFLATED) as dst:
    entries=src.infolist()
    for entry in sorted(entries,key=lambda e:(not e.is_dir(),e.filename.count('/'),e.filename)):
        assert entry.filename.startswith('rall003/') and '..' not in Path(entry.filename).parts
        data=src.read(entry);dst.writestr(copy.copy(entry),data)
        if not entry.is_dir():manifest['originalFiles'][entry.filename]=sha(data)
    additions={'rall003/allegro.cfg':(ROOT/'audio-profile.cfg').read_bytes(),'rall003/ALMOUSE.COM':(ROOT/'vendor/mouse-compat/ALMOUSE.COM').read_bytes(),'rall003/CWSDPMI.EXE':(ROOT/'vendor/cwsdpmi/CWSDPMI.EXE').read_bytes(),'.jsdos/dosbox.conf':(ROOT/'dosbox.conf').read_bytes(),'.jsdos/jsdos.json':b'{"version":"8"}\n'}
    for item in meta:
        data=(ROOT/'recovered-music'/item['file']).read_bytes();target='rall003/music/mod/'+aliases[item['file']];additions[target]=data
        manifest['recoveredMusic'].append({**item,'runtimePath':target,'sha256':sha(data),'relatedRevision':item['file'] in ['nudro4.xm','hentia4.xm','dzew2x.xm']})
    for name,data in additions.items():
        entry=zipfile.ZipInfo(name,(2026,11,2,0,0,0));entry.compress_type=zipfile.ZIP_DEFLATED;dst.writestr(entry,data);manifest['supportFiles'][name]=sha(data)
with zipfile.ZipFile(archive) as src,zipfile.ZipFile(ROOT/'game.jsdos') as dst:
    for name in manifest['originalFiles']:assert src.read(name)==dst.read(name)
assert len(manifest['originalFiles'])==173
manifest['bundleSha256']=sha((ROOT/'game.jsdos').read_bytes())
manifest['emulator']={'version':'8.5.2','backend':'dosboxDirect'}
(ROOT/'source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Verified 173 unchanged original files and 8 documented recovered music files')
