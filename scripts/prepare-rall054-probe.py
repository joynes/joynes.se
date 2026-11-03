#!/usr/bin/env python3
"""Prepare an unpublished compatibility probe without modifying release files."""

import argparse
import copy
import hashlib
import json
from pathlib import Path
import shutil
import struct
import zipfile


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sdk", type=Path, help="Official Boxedwine26R1Web.zip")
    parser.add_argument("release", type=Path, help="Original rall0054 release SFX")
    parser.add_argument("--gdi", action="store_true",
                        help="Stage the tested GDI graphics compatibility change")
    parser.add_argument("--output", type=Path,
                        default=Path("test-results/rall054-repro"))
    args = parser.parse_args()
    workspace = Path(__file__).resolve().parents[1]
    output = args.output.resolve()
    if not output.is_relative_to(workspace / "test-results"):
        parser.error("Probe output must be inside this repository's test-results directory")
    if output.exists():
        parser.error("Output already exists; choose a new probe directory")

    with zipfile.ZipFile(args.sdk) as sdk, zipfile.ZipFile(args.release) as source:
        entries = [e for e in source.infolist() if not e.is_dir()]
        if len(entries) != 81 or sum(e.filename.lower().endswith(".fmp") for e in entries) != 6:
            parser.error("Expected the original 81-file, six-map rall0054 release")
        if any(not e.filename.startswith("rall/") or ".." in Path(e.filename).parts
               for e in entries):
            parser.error("Unexpected release path")
        required = {"boxedwine.html", "boxedwine-shell.js", "boxedwine.js",
                    "boxedwine.wasm", "boxedwine.zip"}
        allowed = required | {"boxedwine.css", "read.txt", "readme.txt"}
        members = [n for n in sdk.namelist()
                   if n.startswith("SingleThreaded/") and n.split("/", 1)[1] in allowed]
        if not required.issubset({n.split("/", 1)[1] for n in members}):
            parser.error("SDK does not contain the expected SingleThreaded build")
        if any(".." in Path(n).parts for n in members):
            parser.error("Unexpected SDK path")
        output.mkdir(parents=True)
        for member in members:
            target = output / member.split("/", 1)[1]
            target.parent.mkdir(parents=True, exist_ok=True)
            data = sdk.read(member)
            if args.gdi and member == "SingleThreaded/boxedwine.js":
                # The host UI scales the fixed Windows desktop. Prevent SDL from
                # clamping that desktop to the phone's smaller physical screen.
                for dimension in ("width", "height"):
                    before = f"HEAP32[(({dimension})>>2)] = screen.{dimension};".encode()
                    after = f"HEAP32[(({dimension})>>2)] = Module['rallDisplay{dimension.title()}'] || screen.{dimension};".encode()
                    if data.count(before) != 1:
                        parser.error("Unexpected SDK display-size import signature")
                    data = data.replace(before, after)
            if args.gdi and member == "SingleThreaded/boxedwine-shell.js":
                before = b"Config.storageMode = STORAGE_INDEXED_DB;"
                if data.count(before) != 1:
                    parser.error("Unexpected SDK storage configuration signature")
                data = data.replace(before, b"Config.storageMode = STORAGE_MEMORY;")
            target.write_bytes(data)
        ledger = []
        with zipfile.ZipFile(output / "rall.zip", "w") as staged:
            for entry in entries:
                data = source.read(entry)
                runtime = data
                if args.gdi and entry.filename == "rall/rall.exe":
                    if data[0xb788:0xb78c] != bytes.fromhex("6a01ffd6"):
                        parser.error("Unexpected executable graphics-call signature")
                    runtime = data[:0xb789] + b"\x00" + data[0xb78a:]
                if args.gdi and entry.filename == "rall/config/graph.cfg":
                    runtime += b"\r\n[graphics]\r\ngfx_card = GDIB\r\n"
                preserved = copy.copy(entry)
                preserved.compress_type = zipfile.ZIP_DEFLATED
                staged.writestr(preserved, runtime)
                ledger.append({"path": entry.filename, "bytes": len(data),
                               "sha256": sha256(data),
                               "runtimeSha256": sha256(runtime),
                               "changed": runtime != data})
        templates = []
        for name in ("single_menu.bmp", "single_menu2.bmp"):
            data = source.read("rall/graph/menu/" + name)
            width, height = struct.unpack_from("<ii", data, 18)
            depth, = struct.unpack_from("<H", data, 28)
            if depth != 24 or height <= 0:
                parser.error("Unexpected menu bitmap format")
            offset, = struct.unpack_from("<I", data, 10)
            stride = (width * 3 + 3) & ~3
            samples = []
            for y in (3, 14, 25, 36):
                for x in range(3, width - 3, 19):
                    b, g, r = data[offset + (height - 1 - y) * stride + x * 3:][:3]
                    samples.append([x, y, r, g, b])
            templates.append({"name": name, "width": width, "height": height,
                              "samples": samples})

    with zipfile.ZipFile(output / "rall.zip") as staged:
        assert len(staged.infolist()) == len(ledger)
        for entry in ledger:
            assert sha256(staged.read(entry["path"])) == entry["runtimeSha256"]
    shutil.copytree(workspace / "scripts/rall054-probe-ui", output / "controls")
    (output / "controls/menu-templates.json").write_text(json.dumps(templates))
    (output / "preservation.json").write_text(json.dumps({
        "status": "unpublished compatibility experiment; gameplay unverified",
        "sourceSha256": sha256(args.release.read_bytes()),
        "sdkSha256": sha256(args.sdk.read_bytes()),
        "files": ledger,
    }, indent=2) + "\n")
    changed = sum(entry["changed"] for entry in ledger)
    print(f"Prepared {output}; {81 - changed}/81 release files are byte-identical.")
    if changed:
        print("GDI compatibility: one executable byte and the graphics configuration differ.")
    print("Serve this directory on loopback, then open:")
    print("boxedwine.html?app=rall&p=rall.exe&auto=false&sound=true&resolution=640x480")
    if args.gdi:
        print("The local touch/keyboard prototype is at controls/ (800x600 runtime, cropped to the native game).")


if __name__ == "__main__":
    main()
