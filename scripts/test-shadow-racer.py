"""Verify original binaries and the strictly read-only AS3 observer."""
import importlib.util
from pathlib import Path
import hashlib
import unittest
import zlib

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('shadow_builder', ROOT/'scripts/build-shadow-racer.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class OriginalPreservation(unittest.TestCase):
    def test_both_archived_releases_and_runtime_reproduce(self):
        for version, expected in [('20080928', 'ca347f3481ee254d60ec3bd856821b6f6546f8567120872509659844622a4e3b'),
                                  ('20081005', '4bf85f616c53e2f11fef8c40458e032c2555cbf0a8951bcddcf1f5ca26d73c89')]:
            with self.subTest(version=version):
                source=(ROOT/f'games/shadow-racer/original/shadow-racer-{version}.swf').read_bytes()
                self.assertEqual(hashlib.sha256(source).hexdigest(), expected)
                runtime, proof=builder.build(source)
                self.assertEqual(runtime, (ROOT/f'games/shadow-racer/shadow-racer-{version}.swf').read_bytes())
                self.assertEqual(proof['methodsUnchanged'], 337)
                self.assertTrue(proof['originalInstructionsPreserved'])
                self.assertEqual(proof['changedTags'], 1)

    def test_inserted_code_can_only_read_and_trace(self):
        for version in ['20080928', '20081005']:
            raw=zlib.decompress((ROOT/f'games/shadow-racer/shadow-racer-{version}.swf').read_bytes()[8:])
            reader=builder.Reader(raw); reader.take((5+4*(raw[0]>>3)+7)//8+4)
            while reader.pos<len(raw):
                header=int.from_bytes(reader.take(2),'little'); tag,size=header>>6,header&63
                if size==63: size=int.from_bytes(reader.take(4),'little')
                payload=reader.take(size)
                if tag!=82: continue
                abc=builder.Abc(payload[payload.index(b'\0',4)+1:])
                traits=next(traits for name,traits in abc.classes if name=='ShadowRacerPrototype2')
                method=next(method for name,kind,method,name_id in traits if name=='run')
                code=abc.bodies[method]['code']; start=code.index(b'\xd0\x30')+2
                original=(ROOT/f'games/shadow-racer/original/shadow-racer-{version}.swf').read_bytes()
                _,proof=builder.build(original)
                probe=builder.Reader(code[start:start+proof['observerBytes']]); calls=[]
                while probe.pos<len(probe.data):
                    opcode=probe.byte()
                    if opcode in (0xd0,0x76): pass  # receiver / Boolean conversion
                    elif opcode in (0x66,0x5d,0x2c): probe.number()  # reads / literal
                    elif opcode in (0x10,0x12): probe.take(3)  # local control flow
                    elif opcode==0x4f:
                        target,count=probe.number(),probe.number()
                        self.assertEqual(abc.names[target],'trace')
                        calls.append(count)
                    else: self.fail(f'Observer contains a non-read instruction: {opcode:x}')
                self.assertEqual(calls,[14,2])


if __name__=='__main__': unittest.main()
