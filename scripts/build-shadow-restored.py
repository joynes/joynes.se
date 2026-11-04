"""Build a read-only presentation observer around unchanged archived game code."""
from pathlib import Path
import importlib.util,json
p=Path(__file__).with_name('build-shadow-racer.py');sp=importlib.util.spec_from_file_location('observer',p);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
root=p.parents[1]/'games/shadow-racer';out=root/'restored';out.mkdir(exist_ok=True);proofs={}
for version in ('20080928','20081005'):
 data,proof=m.build((root/f'original/shadow-racer-{version}.swf').read_bytes(),enhanced=True)
 (out/f'shadow-racer-{version}.swf').write_bytes(data);proofs[version]=proof
(out/'native-observer-proof.json').write_text(json.dumps(proofs,indent=2)+'\n')
print(json.dumps(proofs,indent=2))
