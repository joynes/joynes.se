"""Preview only intended public files, never the repository or its Git/config files."""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from tempfile import TemporaryDirectory
import argparse
import os
import shutil

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=8767)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]

def copy_public(source, target):
    try:
        os.link(source, target)
    except OSError:
        shutil.copy2(source, target)

with TemporaryDirectory(prefix='joynes-games-preview-') as temporary:
    public = Path(temporary)
    shutil.copy2(root / 'index.html', public / 'index.html')
    for name in ('assets', 'games'):
        shutil.copytree(root / name, public / name, copy_function=copy_public)
    handler = partial(SimpleHTTPRequestHandler, directory=str(public))
    server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    print(f'Game preview: http://127.0.0.1:{args.port}/', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
