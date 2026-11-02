"""Compare a game's deployed assets with its tested release ledger."""
import hashlib,json,os,re,sys,urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
root=Path(__file__).resolve().parents[1]
game=sys.argv[1] if len(sys.argv)>1 else 'marble-tables'
assert re.fullmatch(r'[a-z0-9-]+',game),'Invalid game identifier'
base=os.environ.get('HOMEPAGE_BASE_URL','https://joynes.github.io/joynes.se/').rstrip('/')+'/'
ledger=json.loads((root/'docs/games'/f'{game}-assets.json').read_text())
def verify(item):
    path,expected=item
    with urllib.request.urlopen(base+path,timeout=90) as response:
        data=response.read();assert response.status==200,path
    digest=hashlib.sha256(data).hexdigest()
    assert digest==expected,(path,expected,digest)
    return {'path':path,'sha256':digest,'bytes':len(data)}
with ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(verify,ledger['assets'].items()))
print(json.dumps({'base':base,'game':game,'verified':len(results),'assets':results},indent=2))
