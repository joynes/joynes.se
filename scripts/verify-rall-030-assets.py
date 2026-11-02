"""Compare every deployed game/support/source asset to the tested release ledger."""
import hashlib,json,os,urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
base=os.environ.get('HOMEPAGE_BASE_URL','https://joynes.github.io/joynes.se/').rstrip('/')+'/'
ledger=json.loads((Path(__file__).resolve().parents[1]/'docs/games/rall-030-assets.json').read_text())
def check(pair):
    path,expected=pair
    with urllib.request.urlopen(base+path,timeout=90) as response:
        data=response.read()
        assert response.status==200,path
    actual=hashlib.sha256(data).hexdigest()
    assert actual==expected,(path,expected,actual)
    return {'path':path,'sha256':actual,'bytes':len(data)}
with ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(check,ledger['assets'].items()))
print(json.dumps({'base':base,'verified':len(results),'assets':results},indent=2))
