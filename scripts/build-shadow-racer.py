"""Add a read-only native-state trace to the archived AS3 movie.

The original physics/rules bytecode and all other SWF tags stay byte-identical.
Only the run method gains a guarded trace before its original instructions.
No player position, input, score, timer, or game mode is written by the probe.
"""
import hashlib
import json
import struct
import sys
import zlib
from pathlib import Path


def u30(value):
    out = bytearray()
    while True:
        out.append((value & 127) | (128 if value > 127 else 0))
        value >>= 7
        if not value:
            return bytes(out)


class Reader:
    def __init__(self, data):
        self.data, self.pos = data, 0

    def take(self, size):
        result = self.data[self.pos:self.pos + size]
        self.pos += size
        assert len(result) == size
        return result

    def byte(self):
        return self.take(1)[0]

    def number(self):
        value = 0
        for shift in range(0, 35, 7):
            byte = self.byte()
            value |= (byte & 127) << shift
            if not byte & 128:
                return value
        raise ValueError('invalid variable integer')


class Abc(Reader):
    def __init__(self, data):
        super().__init__(data)
        self.take(4)
        for _ in range(2):
            for _ in range(max(0, self.number() - 1)):
                self.number()
        self.take(max(0, self.number() - 1) * 8)
        self.strings = ['']
        for _ in range(max(0, self.number() - 1)):
            self.strings.append(self.take(self.number()).decode('utf8'))
        self.namespaces = [None]
        for _ in range(max(0, self.number() - 1)):
            self.namespaces.append((self.byte(), self.strings[self.number()]))
        self.nssets = [None]
        for _ in range(max(0, self.number() - 1)):
            self.nssets.append([self.number() for _ in range(self.number())])
        self.names = ['']
        self.multinames = [None]
        for _ in range(max(0, self.number() - 1)):
            kind = self.byte(); namespace = None; nsset = None
            if kind in (7, 13):
                namespace = self.number(); name = self.number()
            elif kind in (15, 16):
                name = self.number()
            elif kind in (17, 18):
                name = 0
            elif kind in (9, 14):
                name = self.number(); nsset = self.number()
            elif kind in (27, 28):
                name = 0; nsset = self.number()
            elif kind == 29:
                name = 0; self.number()
                for _ in range(self.number()):
                    self.number()
            else:
                raise ValueError('unknown multiname ' + str(kind))
            self.names.append(self.strings[name])
            self.multinames.append(dict(kind=kind, namespace=namespace, nsset=nsset))
        for _ in range(self.number()):
            count = self.number(); self.number()
            for _ in range(count):
                self.number()
            self.number(); flags = self.byte()
            if flags & 8:
                for _ in range(self.number()):
                    self.number(); self.byte()
            if flags & 128:
                for _ in range(count):
                    self.number()
        for _ in range(self.number()):
            self.number(); count = self.number()
            for _ in range(count * 2):
                self.number()
        self.classes = []
        class_count = self.number()
        for _ in range(class_count):
            name = self.number(); nsset = self.number(); flags = self.byte()
            if flags & 8:
                self.number()
            for _ in range(self.number()):
                self.number()
            self.number()
            self.classes.append((self.names[name], self.traits()))
        for _ in range(class_count):
            self.number(); self.traits()
        for _ in range(self.number()):
            self.number(); self.traits()
        self.bodies = {}
        for _ in range(self.number()):
            start = self.pos
            method = self.number(); stack = self.number()
            locals_ = self.number(); initial = self.number(); scope = self.number()
            code = self.take(self.number()); code_end = self.pos
            exception_count = self.number()
            for _ in range(exception_count * 5):
                self.number()
            self.traits()
            self.bodies[method] = dict(start=start, end=self.pos, stack=stack,
                locals=locals_, initial=initial, scope=scope, code=code,
                tail=data[code_end:self.pos], exceptions=exception_count)
        assert self.pos == len(data)

    def traits(self):
        result = []
        for _ in range(self.number()):
            name = self.number(); flags = self.byte(); kind = flags & 15
            index = None
            if kind in (0, 6):
                self.number(); self.number()
                if self.number():
                    self.byte()
            elif kind in (1, 2, 3, 4, 5):
                self.number(); index = self.number()
            else:
                raise ValueError('unknown trait')
            if flags & 64:
                for _ in range(self.number()):
                    self.number()
            result.append((self.names[name], kind, index, name))
        return result


def instrument_abc(data, enhanced=False):
    abc = Abc(data)
    traits = dict((name, (kind, method, name_id)) for name, kind, method, name_id
                  in next(traits for name, traits in abc.classes if name == 'ShadowRacerPrototype2'))
    method = traits['run'][1]
    body = abc.bodies[method]
    prologue = body['code'].index(b'\xd0\x30') + 2  # getlocal0, pushscope
    assert prologue <= 18  # Debug build may have a source-file/line preamble.
    assert body['exceptions'] == 0
    def unique(name):
        hits = [i for i, text in enumerate(abc.names) if text == name]
        assert len(hits) == 1, (name, hits)
        return hits[0]
    def prop(index):
        return b'\x66' + u30(index)
    def own(name):
        return b'\xd0' + prop(traits[name][2])
    trace = unique('trace')
    car_traits = dict((name, name_id) for name, kind, method, name_id
                     in next(traits for name, traits in abc.classes if name == 'Car'))
    points = b''
    for name in ('wheelParticleB', 'left', 'right'):
        for axis in ('px', 'py'):
            points += own('car') + prop(car_traits[name]) + prop(unique(axis))
    observed = (b'\x5d' + u30(trace) + b'\x2c' + u30(abc.strings.index('ShadowRacerPrototype2'))
        + own('mode') + own('car') + prop(unique('px'))
        + own('car') + prop(unique('py'))
        + own('car') + prop(unique('crashLimit'))
        + own('myTimer') + prop(unique('currentCount')) + points + own('keyPress') + own('frameNr')
        + b'\x4f' + u30(trace) + u30(14))
    local_count = body['locals']
    if enhanced:
        # Presentation-only geometry reads. The only writes are two new locals.
        def public(name):
            hits = [i for i, text in enumerate(abc.names) if text == name
                    and abc.multinames[i]['kind'] == 7
                    and abc.namespaces[abc.multinames[i]['namespace']] == (22, '')]
            assert len(hits) == 1, (name, hits)
            return hits[0]
        index_name = next(i for i, item in enumerate(abc.multinames) if item
                          and item['kind'] == 27 and any(abc.namespaces[n] == (22, '')
                          for n in abc.nssets[item['nsset']]))
        loop = bytearray(); labels = {}; jumps = []
        def emit(data): loop.extend(data)
        def label(name): labels[name] = len(loop)
        def jump(op, name):
            loop.append(op); jumps.append((len(loop), name)); loop.extend(b'\0\0\0')
        idx, particle = body['locals'], body['locals'] + 1
        get = lambda n: b'\x62' + u30(n)
        put = lambda n: b'\x63' + u30(n)
        emit(own('frameNr') + b'\x24\0'); jump(0x14, 'end')  # ifne
        emit(b'\x24\0' + put(idx)); label('loop'); emit(b'\x09')
        emit(get(idx) + own('surfaces') + prop(unique('particles')) + prop(public('length')))
        jump(0x18, 'end')  # ifge
        emit(own('surfaces') + prop(unique('particles')) + get(idx) + prop(index_name) + put(particle))
        emit(b'\x5d' + u30(trace) + b'\x2c' + u30(abc.strings.index('Surfaces')) + get(idx))
        for name in ('px', 'py', 'width', 'height', 'radian'):
            emit(get(particle) + prop(unique(name)))
        emit(b'\x4f' + u30(trace) + u30(7) + b'\xc2' + u30(idx)); jump(0x10, 'loop')
        label('end')
        for at, name in jumps:
            loop[at:at+3] = (labels[name] - at - 3).to_bytes(3, 'little', signed=True)
        suffix = b'\x4f' + u30(trace) + u30(14)
        assert observed.endswith(suffix)
        observed = bytes(loop) + observed[:-len(suffix)] + b'\xd0' + prop(public('x')) + b'\xd0' + prop(public('y')) + b'\x4f' + u30(trace) + u30(16)
        local_count += 2
    ready = (b'\x5d' + u30(trace) + b'\x2c' + u30(abc.strings.index('ShadowRacerPrototype2'))
             + own('mode') + b'\x4f' + u30(trace) + u30(2))
    prefix = (own('car') + b'\x76\x12' + (len(observed)+4).to_bytes(3, 'little')
              + observed + b'\x10' + len(ready).to_bytes(3, 'little') + ready)
    code = body['code'][:prologue] + prefix + body['code'][prologue:]
    replacement = (u30(method) + u30(max(body['stack'], 20 if enhanced else 16)) + u30(local_count)
        + u30(body['initial']) + u30(body['scope']) + u30(len(code)) + code + body['tail'])
    patched = data[:body['start']] + replacement + data[body['end']:]
    check = Abc(patched)
    # Structural proof: every other method is exactly the same, and removing
    # this trace restores the original run code byte for byte.
    for index, original in abc.bodies.items():
        revised = check.bodies[index]
        assert revised['tail'] == original['tail']
        assert revised['locals'] == original['locals'] + (2 if enhanced and index == method else 0)
        assert revised['initial'] == original['initial']
        assert revised['scope'] == original['scope']
        if index != method:
            assert revised['code'] == original['code']
        else:
            assert revised['code'][:prologue] + revised['code'][prologue+len(prefix):] == original['code']
    return patched, dict(methodsUnchanged=len(abc.bodies)-1, observerMethod='ShadowRacerPrototype2.run',
                        observerBytes=len(prefix), originalInstructionsPreserved=True, presentationGeometryObserver=enhanced, observerOnlyLocals=2 if enhanced else 0)


def build(source, enhanced=False):
    assert source[:3] == b'CWS'
    raw = zlib.decompress(source[8:])
    rect_bytes = (5 + 4 * (raw[0] >> 3) + 7) // 8
    reader = Reader(raw); reader.take(rect_bytes + 4)
    result = raw[:reader.pos]; changed = 0; proof = None
    while reader.pos < len(raw):
        start = reader.pos
        header = struct.unpack('<H', reader.take(2))[0]
        tag, size = header >> 6, header & 63
        if size == 63:
            size = struct.unpack('<I', reader.take(4))[0]
        payload = reader.take(size)
        if tag == 82:
            offset = payload.index(b'\0', 4) + 1
            abc, proof = instrument_abc(payload[offset:], enhanced=enhanced)
            payload = payload[:offset] + abc
            result += struct.pack('<HI', (tag << 6) | 63, len(payload)) + payload
            changed += 1
        else:
            result += raw[start:reader.pos]
    assert changed == 1
    output = source[:4] + struct.pack('<I', len(result) + 8) + zlib.compress(result, 9)
    proof.update(originalSha256=hashlib.sha256(source).hexdigest(),
                 runtimeSha256=hashlib.sha256(output).hexdigest(), changedTags=1)
    return output, proof


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1] / 'games/shadow-racer'
    proofs = {}
    for version in ('20080928', '20081005'):
        output, proof = build((root/f'original/shadow-racer-{version}.swf').read_bytes())
        (root/f'shadow-racer-{version}.swf').write_bytes(output)
        proofs[version] = proof
    (root/'native-observer-proof.json').write_text(json.dumps(proofs, indent=2)+'\n')
    print(json.dumps(proofs))
