"""Package every original file unchanged, plus the documented DOS host."""
import copy
import hashlib
import json
from pathlib import Path
import zipfile

ROOT=Path(__file__).resolve().parents[1]/'games/rall-026'
original=ROOT/'original/rall-v026-ascii.zip'
source=zipfile.ZipFile(original)
manifest={'originalArchiveSha256':hashlib.sha256(original.read_bytes()).hexdigest(),
          'originalDriveId':'1cfHERaNYoya5ZZmlUe3ZzySeNkCug_aB','originalYear':1998,
          'originalFiles':{},'supportFiles':{}}
with zipfile.ZipFile(ROOT/'game.jsdos','w',zipfile.ZIP_DEFLATED) as bundle:
    for entry in source.infolist():
        if not entry.is_dir():
            assert entry.filename.startswith('Rall0026/') and '..' not in Path(entry.filename).parts
            data=source.read(entry);bundle.writestr(copy.copy(entry),data)
            manifest['originalFiles'][entry.filename]=hashlib.sha256(data).hexdigest()
    additions={'Rall0026/CWSDPMI.EXE':(ROOT/'vendor/cwsdpmi/CWSDPMI.EXE').read_bytes(),
               '.jsdos/dosbox.conf':(ROOT/'dosbox.conf').read_bytes(),
               '.jsdos/jsdos.json':b'{"version":"8"}\n'}
    for name,data in additions.items():
        info=zipfile.ZipInfo(name,(2026,11,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16;bundle.writestr(info,data);manifest['supportFiles'][name]=hashlib.sha256(data).hexdigest()
with zipfile.ZipFile(ROOT/'game.jsdos') as bundle:
    for entry in source.infolist():
        if not entry.is_dir():assert bundle.read(entry.filename)==source.read(entry)
manifest['bundleSha256']=hashlib.sha256((ROOT/'game.jsdos').read_bytes()).hexdigest()
manifest['emulator']={'version':'8.5.2','backend':'dosboxDirect','dosboxCommit':'528578d5a6f76afd4d5ef4e722b5670826f1183a'}
manifest['dpmi']={'release':5,'arguments':'-p -x','binaryUnmodified':True}
(ROOT/'source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f"Verified {len(manifest['originalFiles'])} unchanged original files; bundle {manifest['bundleSha256']}")
