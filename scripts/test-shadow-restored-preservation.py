"""Verify the new presentation observer cannot write any native game state."""
import hashlib,importlib.util,json,unittest,zlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=Path(__file__).with_name('build-shadow-racer.py');sp=importlib.util.spec_from_file_location('observer',p);builder=importlib.util.module_from_spec(sp);sp.loader.exec_module(builder)
class Preservation(unittest.TestCase):
 def test_originals_and_extended_observers(self):
  for version,sha in [('20080928','ca347f3481ee254d60ec3bd856821b6f6546f8567120872509659844622a4e3b'),('20081005','4bf85f616c53e2f11fef8c40458e032c2555cbf0a8951bcddcf1f5ca26d73c89')]:
   source=(root/f'games/shadow-racer/original/shadow-racer-{version}.swf').read_bytes();self.assertEqual(hashlib.sha256(source).hexdigest(),sha)
   old,_=builder.build(source);self.assertEqual(old,(root/f'games/shadow-racer/shadow-racer-{version}.swf').read_bytes())
   data,proof=builder.build(source,enhanced=True);self.assertEqual(data,(root/f'games/shadow-racer/restored/shadow-racer-{version}.swf').read_bytes());self.assertTrue(proof['originalInstructionsPreserved']);self.assertEqual(proof['methodsUnchanged'],337)
   raw=zlib.decompress(data[8:]);r=builder.Reader(raw);r.take((5+4*(raw[0]>>3)+7)//8+4)
   while r.pos<len(raw):
    head=int.from_bytes(r.take(2),'little');tag,size=head>>6,head&63
    if size==63:size=int.from_bytes(r.take(4),'little')
    payload=r.take(size)
    if tag!=82:continue
    abc=builder.Abc(payload[payload.index(b'\0',4)+1:]);traits=next(t for n,t in abc.classes if n=='ShadowRacerPrototype2');method=next(m for n,k,m,i in traits if n=='run');body=abc.bodies[method];start=body['code'].index(b'\xd0\x30')+2;probe=builder.Reader(body['code'][start:start+proof['observerBytes']]);bounds=set();jumps=[];calls=[]
    while probe.pos<len(probe.data):
     bounds.add(probe.pos);op=probe.byte()
     if op in [0xd0,0x76,0x09]:pass
     elif op in [0x66,0x5d,0x2c]:probe.number()
     elif op==0x24:probe.byte()
     elif op in [0x62,0x63,0xc2]:self.assertIn(probe.number(),[body['locals']-2,body['locals']-1])
     elif op in [0x10,0x12,0x14,0x18]:offset=int.from_bytes(probe.take(3),'little',signed=True);jumps.append(probe.pos+offset)
     elif op==0x4f:
      target,count=probe.number(),probe.number();self.assertEqual(abc.names[target],'trace');calls.append(count)
     else:self.fail(f'Unexpected observer instruction: {op:x}')
    bounds.add(len(probe.data));self.assertTrue(all(t in bounds for t in jumps));self.assertEqual(calls,[7,16,2])
 def test_public_assets_match_provenance(self):
  assets=root/'games/shadow-racer/restored/assets'
  graphics=json.loads((assets/'graphics-provenance.json').read_text())['assets']
  for name,sha in graphics.items():self.assertEqual(hashlib.sha256((assets/name).read_bytes()).hexdigest(),sha)
  audio=json.loads((assets/'audio-provenance.json').read_text())['assets'];self.assertEqual(len(audio),5)
  for record in audio:
   self.assertEqual(hashlib.sha256((assets/record['asset']).read_bytes()).hexdigest(),record['sha256']);self.assertLess(record['peak'],1);self.assertGreater(record['rms'],.0001)
if __name__=='__main__':unittest.main()
