"""Verify native asset preservation independently of the conversion code.
Requires UnityPy 1.25.4. Prints only aggregate counts and edited object identities.
"""
import argparse
import hashlib
import json
import math
import re
import struct
import yaml
from pathlib import Path
import UnityPy
p = argparse.ArgumentParser()
p.add_argument('original', type=Path)
p.add_argument('release', type=Path)
p.add_argument('provenance', type=Path)
p.add_argument('--source-repo', type=Path)
a = p.parse_args()
original = UnityPy.load(str(a.original))
release = UnityPy.load(str(a.release))
before = {(o.assets_file.name, o.path_id): o for o in original.objects}
after = {(o.assets_file.name, o.path_id): o for o in release.objects}
manifest = json.loads(a.provenance.read_text())
expected = {(edit['file'], edit['id']) for edit in manifest['changes']}
changed = set()
for key, obj in before.items():
    assert key in after, f'Original object removed: {key}'
    if obj.get_raw_data() != after[key].get_raw_data():
        changed.add(key)
added = set(after) - set(before)
assert changed | added == expected, f'Undocumented asset changes: {(changed | added) ^ expected}'
assert hashlib.sha256(a.original.read_bytes()).hexdigest() == manifest['nativeInputSha256']
assert hashlib.sha256(a.release.read_bytes()).hexdigest() == manifest['outputSha256']
if manifest['vehicle'] == 'bus':
    preserved_types = ['GameObject', 'Transform', 'Mesh', 'MeshFilter', 'MeshRenderer',
                       'SkinnedMeshRenderer', 'Material', 'Texture2D', 'Animator', 'AnimationClip',
                       'Rigidbody', 'WheelCollider', 'Camera']
    assert all(key not in changed for key, obj in before.items() if obj.type.name in preserved_types), 'Bus visuals, placement, camera or drivetrain changed'
    assert ('level1', 1820) not in changed and ('level1', 1819) not in changed, 'Original kart physics/input must be preserved'
sounds = [key for key, obj in before.items() if obj.type.name == 'AudioClip']
assert all(key not in changed for key in sounds)
# External audio/streaming resource bytes are also retained, not just AudioClip headers.
for name, file in original.file.files.items():
    if name.endswith('.resource'):
        assert file.bytes == release.file.files[name].bytes, f'Audio resource changed: {name}'
physics_matches = None
if a.source_repo:
    def documents(path):
        parts = re.split(r'^--- !u!\d+ &\d+(?: stripped)?\n', path.read_text(encoding='utf-8-sig'), flags=re.M)
        return [yaml.safe_load(body) for body in parts[1:]]
    base_documents = documents(a.source_repo / 'Assets/Karting/Prefabs/KartClassic/BaseKartClassic.prefab')
    stats = next(d['MonoBehaviour']['baseStats'].copy() for d in base_documents if 'baseStats' in d.get('MonoBehaviour', {}))
    for name in ['Assets/Karting/Prefabs/KartClassic/KartClassic_Player.prefab', 'Assets/Karting/Scenes/MainScene.unity']:
        for document in documents(a.source_repo / name):
            for modification in document.get('PrefabInstance', {}).get('m_Modification', {}).get('m_Modifications', []):
                if modification['propertyPath'].startswith('baseStats.'):
                    stats[modification['propertyPath'].split('.')[1]] = float(modification['value'])
    names = ['TopSpeed', 'Acceleration', 'ReverseSpeed', 'ReverseAcceleration', 'AccelerationCurve', 'Braking', 'CoastingDrag', 'Grip', 'Steer', 'AddedGravity']
    native = struct.unpack_from('<10f', after[('level1', 1820)].get_raw_data(), 32)
    for name, value in zip(names, native):
        assert math.isclose(stats[name], value, rel_tol=.00001), f'Source physics mismatch: {name}'
    physics_matches = dict(zip(names, native))
print(json.dumps({'preservedOriginalObjects': len(before) - len(changed), 'editedOriginalObjects': len(changed),
                  'addedSourcePoliceObjects': len(added), 'preservedAudioClips': len(sounds),
                  'allChangesMatchProvenance': True, 'sourcePhysicsPresetVerified': physics_matches}, indent=2))
