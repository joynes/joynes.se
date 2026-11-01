"""Restore the later source police variant in its shared native city runtime.
Analysis/build dependency: UnityPy==1.25.4, PyYAML==6.0.3, Pillow.
No changes to compiled WASM, framework or engine loader. Never edits input files.
"""
import argparse
import copy
import hashlib
import json
import math
import re
import struct
import subprocess
from pathlib import Path
import UnityPy
import yaml
from PIL import Image
from UnityPy.enums import TextureFormat
from UnityPy.streams import EndianBinaryReader

parser = argparse.ArgumentParser()
parser.add_argument('source_repo', type=Path)
parser.add_argument('native_data', type=Path)
parser.add_argument('output', type=Path)
parser.add_argument('--meshes', type=Path)
parser.add_argument('--vehicle', choices=['police', 'bus'], default='police')
args = parser.parse_args()
assert hashlib.sha256(args.native_data.read_bytes()).hexdigest() == 'e87553eae7e63f0bb54b6dc209665adc93c611018c959b467314a6086cba2a18', 'Expected the pinned 2023-01-24 native city build'
env = UnityPy.load(str(args.native_data))
objects = list(env.objects)
scene = {o.path_id: o for o in objects if o.assets_file.name == 'level1'}
shared = next(o.assets_file for o in objects if o.assets_file.name == 'sharedassets1.assets')
changes = []
# A deleted environment object left a null entry in the runtime batch list.
# Remove only that missing reference, preserving all five real environment groups.
combiner = scene[1765]
assert combiner.parse_as_object(check_read=False).m_Script.read().m_Name == 'MeshCombiner'
raw = bytearray(combiner.get_raw_data())
assert struct.unpack_from('<i', raw, 32)[0] == 6
assert bytes(raw[84:96]) == bytes(12)
del raw[84:96]
struct.pack_into('<i', raw, 32, 5)
combiner.set_raw_data(bytes(raw))
changes.append({'file': 'level1', 'id': 1765, 'fields': {'combineParents': 'removed one missing object; all 5 valid groups retained'}})


def patch_object(object_id, edit):
    obj = scene[object_id]
    tree = obj.parse_as_dict()
    edit(tree)
    obj.save_typetree(tree)
    changes.append({'file': 'level1', 'id': object_id, 'type': obj.type.name})

patch_object(1586, lambda d: d.update(m_Convex=True))
# The original 7-point gate counter is unreadable after fitting the game on a phone.
# Scale its anchored HUD container; the 3D camera and pause menu remain unchanged.
patch_object(1698, lambda d: d.update(m_LocalScale={'x': 3., 'y': 3., 'z': 1.},
                                    m_AnchoredPosition={'x': 60., 'y': -53.25}))
# Keep white progress text legible against the bright sky and clouds.
for object_id in [296, 298, 299, 300]:
    obj = shared.objects[object_id]
    parsed = obj.parse_as_object(check_read=False)
    assert parsed.m_Script.read().m_Name == 'Image'
    assert parsed.m_GameObject.read().m_Name in ['BackgroundImageTitle', 'BackgroundImageSubTitle']
    raw = bytearray(obj.get_raw_data())
    assert struct.unpack_from('<3f', raw, 44) == (0., 0., 0.)
    struct.pack_into('<f', raw, 56, .95)
    obj.set_raw_data(bytes(raw))
    changes.append({'file': shared.name, 'id': object_id, 'fields': {'backgroundAlpha': .95}})

# Preserve every physical gate. Correct the unreachable template requirement.
objective = scene[1827]
assert objective.parse_as_object(check_read=False).m_Script.read().m_Name == 'ObjectiveReachTargets'
raw = bytearray(objective.get_raw_data())
assert len(raw) == 132 and struct.unpack_from('<i', raw, 124)[0] == 20
struct.pack_into('<i', raw, 120, 1)  # mustCollectAllPickups
struct.pack_into('<i', raw, 124, 3)  # fallback before dynamic registration
objective.set_raw_data(bytes(raw))
changes.append({'file': 'level1', 'id': 1827, 'fields': {'mustCollectAllPickups': True, 'pickupsToCompleteObjective': 3}})
for object_id in [1839, 1840, 1841]:
    obj = scene[object_id]
    assert obj.parse_as_object(check_read=False).m_Script.read().m_Name == 'PickupObject'
    raw = bytearray(obj.get_raw_data())
    assert struct.unpack_from('<i', raw, 32)[0] == 1
    struct.pack_into('<i', raw, 32, 0)  # same TimeLimit mode as the objective; timer remains disabled
    obj.set_raw_data(bytes(raw))
    changes.append({'file': 'level1', 'id': object_id, 'fields': {'gameMode': 0}})

if args.vehicle == 'police':
    assert args.meshes, '--meshes is required for the police variant'
    meshes = json.loads(args.meshes.read_text())
    prefab_path = args.source_repo / 'Assets/Urban American Assets/Props/Vehicles/Police Car.prefab'
    parts = re.split(r'^--- !u!(\d+) &(\d+)(?: stripped)?\n', prefab_path.read_text(encoding='utf-8-sig'), flags=re.M)
    prefab = {}
    for index in range(1, len(parts), 3):
        _, object_id, body = parts[index:index + 3]
        document = yaml.safe_load(body)
        prefab[int(object_id)] = (next(iter(document)), next(iter(document.values())))
    transforms = {d['m_GameObject']['fileID']: d for kind, d in prefab.values() if kind == 'Transform'}
    vertices = []
    mesh_ids = {4300016: 'CarPolice', 4300018: 'WP1'}
    for kind, data in prefab.values():
        if kind != 'MeshFilter':
            continue
        mesh = meshes[mesh_ids[data['m_Mesh']['fileID']]]
        transform = transforms[data['m_GameObject']['fileID']]
        for original in mesh['vertices']:
            position = original['position'][:]
            normal = original['normal'][:]
            current = transform
            determinant = 1
            while current['m_Father']['fileID'] != 0:
                rotation = current['m_LocalRotation']
                assert abs(float(rotation['w']) - 1) < .0001 and all(abs(float(rotation[a])) < .0001 for a in 'xyz')
                for i, axis in enumerate('xyz'):
                    scale = float(current['m_LocalScale'][axis])
                    determinant *= scale
                    position[i] = position[i] * scale + float(current['m_LocalPosition'][axis])
                    normal[i] /= scale
                current = prefab[current['m_Father']['fileID']][1]
            length = math.sqrt(sum(n * n for n in normal))
            vertices.append({'position': position, 'normal': [n / length for n in normal], 'uv': original['uv'], 'mirror': determinant < 0})
    # Reflected left wheels need the opposite triangle winding.
    for index in range(0, len(vertices), 3):
        if vertices[index]['mirror']:
            vertices[index:index + 3] = reversed(vertices[index:index + 3])
    assert len(vertices) == (274 + 4 * 32) * 3

    def clone(template, name):
        obj = copy.copy(template)
        obj.path_id = max(shared.objects) + 1
        obj.data = None
        shared.objects[obj.path_id] = obj
        changes.append({'file': shared.name, 'id': obj.path_id, 'type': obj.type.name, 'name': name})
        return obj

    texture_template = next(o for o in shared.objects.values() if o.type.name == 'Texture2D')
    texture = clone(texture_template, 'JoynesSourcePoliceTexture')
    image = Image.open(args.source_repo / 'Assets/Urban American Assets/Props/Vehicles/Source/CarPolice.psd').convert('RGBA')
    texture_data = texture.parse_as_object()
    texture_data.m_Name = 'JoynesSourcePoliceTexture'
    texture_data.set_image(image, target_format=TextureFormat.RGBA32, mipmap_count=1)
    texture_data.save()

    material = clone(shared.objects[59], 'JoynesSourcePoliceMaterial')
    material_data = material.parse_as_dict()
    material_data['m_Name'] = 'JoynesSourcePoliceMaterial'
    for name, value in material_data['m_SavedProperties']['m_TexEnvs']:
        if name in ['_BaseMap', '_MainTex']:
            value['m_Texture'] = {'m_FileID': 0, 'm_PathID': texture.path_id}
    material.save_typetree(material_data)

    mesh_obj = clone(shared.objects[102], 'JoynesSourcePoliceMesh')
    mesh_data = mesh_obj.parse_as_dict()
    mesh_data['m_Name'] = 'JoynesSourcePoliceMesh'
    count = len(vertices)
    mesh_data['m_IndexFormat'] = 0
    mesh_data['m_IndexBuffer'] = struct.pack('<' + 'H' * count, *range(count))
    mesh_data['m_VertexData']['m_VertexCount'] = count
    channels = [{'stream': 0, 'offset': 0, 'format': 0, 'dimension': 0} for _ in range(14)]
    for index, offset, dimension in [(0, 0, 3), (1, 12, 3), (4, 24, 2)]:
        channels[index].update(offset=offset, dimension=dimension)
    mesh_data['m_VertexData']['m_Channels'] = channels
    mesh_data['m_VertexData']['m_DataSize'] = b''.join(struct.pack('<8f', *(v['position'] + v['normal'] + v['uv'])) for v in vertices)
    low = [min(v['position'][i] for v in vertices) for i in range(3)]
    high = [max(v['position'][i] for v in vertices) for i in range(3)]
    bounds = {'m_Center': {a: (low[i] + high[i]) / 2 for i, a in enumerate('xyz')},
              'm_Extent': {a: (high[i] - low[i]) / 2 for i, a in enumerate('xyz')}}
    mesh_data['m_LocalAABB'] = bounds
    mesh_data['m_SubMeshes'] = [{'firstByte': 0, 'indexCount': count, 'topology': 0, 'baseVertex': 0,
                               'firstVertex': 0, 'vertexCount': count, 'localAABB': bounds}]
    mesh_data['m_BakedConvexCollisionMesh'] = []
    mesh_data['m_BakedTriangleCollisionMesh'] = []
    mesh_data['m_IsReadable'] = True
    mesh_obj.save_typetree(mesh_data)
    # This renderer belongs only to the driven bus; parked vehicles stay intact.
    patch_object(1359, lambda d: d.update(m_Mesh={'m_FileID': 2, 'm_PathID': mesh_obj.path_id}))
    patch_object(1083, lambda d: d.update(m_Materials=[{'m_FileID': 2, 'm_PathID': material.path_id}]))
    patch_object(694, lambda d: d.update(m_LocalPosition={'x': -.52, 'y': .2875, 'z': -.18187761},
                                        m_LocalRotation={'x': 0., 'y': 0., 'z': 0., 'w': 1.},
                                        m_LocalScale={'x': .70832, 'y': .70832, 'z': .70832}))
    patch_object(219, lambda d: d.update(m_Name='Police Car'))
    # The later source disables the template driver and template wheel visuals.
    # Physical wheel colliders remain active; source police meshes include all four wheels.
    for object_id in [419, 391]:
        patch_object(object_id, lambda d: d.update(m_IsActive=False))

args.output.parent.mkdir(parents=True, exist_ok=True)
packed_files = {name: EndianBinaryReader(file.save(packer='original'))
                if type(file).__name__ == 'BundleFile' else file
                for name, file in env.file.files.items()}
args.output.write_bytes(env.file.save(files=packed_files))
manifest = {'nativeInputSha256': hashlib.sha256(args.native_data.read_bytes()).hexdigest(),
            'outputSha256': hashlib.sha256(args.output.read_bytes()).hexdigest(), 'vehicle': args.vehicle,
            'changes': changes,
            'sourceRepoCommit': subprocess.check_output(['git', '-C', str(args.source_repo), 'rev-parse', 'HEAD'], text=True).strip(),
            'tools': {'UnityPy': UnityPy.__version__, 'PyYAML': yaml.__version__}}
source_files = ['Assets/Karting/Scenes/MainScene.unity',
                'Assets/Karting/Prefabs/KartClassic/KartClassic_Player.prefab',
                'Assets/Karting/Scripts/KartSystems/TypeOfVehicle.cs',
                'Assets/Karting/Scripts/KartSystems/Inputs/KeyboardInput.cs',
                'Assets/Karting/Scripts/KartSystems/ArcadeKart.cs']
if args.vehicle == 'police':
    source_files += ['Assets/Urban American Assets/Props/Vehicles/Police Car.prefab',
                     'Assets/Urban American Assets/Props/Vehicles/Source/CarPack.FBX',
                     'Assets/Urban American Assets/Props/Vehicles/Source/CarPolice.psd']
    manifest['meshExportSha256'] = hashlib.sha256(args.meshes.read_bytes()).hexdigest()
    manifest['pivotNormalization'] = {name: meshes[name]['pivotNormalization'] for name in ['CarPolice', 'WP1']}
manifest['sourceFilesSha256'] = {name: hashlib.sha256((args.source_repo / name).read_bytes()).hexdigest() for name in source_files}
args.output.with_suffix('.provenance.json').write_text(json.dumps(manifest, indent=2))
# Verify the resulting archive can be independently parsed.
check = UnityPy.load(str(args.output))
restored = next(o for o in check.objects if o.assets_file.name == 'level1' and o.path_id == 1827)
assert struct.unpack_from('<i', restored.get_raw_data(), 124)[0] == 3
if args.vehicle == 'police':
    restored_mesh = next(o for o in check.objects if o.type.name == 'Mesh' and o.peek_name() == 'JoynesSourcePoliceMesh')
    assert restored_mesh.parse_as_dict()['m_VertexData']['m_VertexCount'] == 1206
print('Built', args.vehicle, args.output.stat().st_size, 'bytes;', len(changes), 'explicit asset edits')
