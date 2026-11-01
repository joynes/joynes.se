"""Read-only comparison of explicit Unity source transforms and a native WebGL scene.
Requires UnityPy 1.25.4 and PyYAML 6.0.3 in an analysis-only Python environment.
Does not extract settings, credentials, textures or compiled code.
"""
import argparse
import json
import re
from pathlib import Path
import UnityPy
import yaml

parser = argparse.ArgumentParser()
parser.add_argument('source_scene', type=Path)
parser.add_argument('web_data', type=Path)
parser.add_argument('--native-scene', default='level1')
args = parser.parse_args()
text = args.source_scene.read_text(encoding='utf-8-sig')
parts = re.split(r'^--- !u!(\d+) &(\d+)(?: stripped)?\n', text, flags=re.M)
source = {}
for index in range(1, len(parts), 3):
    _, object_id, body = parts[index:index + 3]
    document = yaml.safe_load(body)
    source[int(object_id)] = (next(iter(document)), next(iter(document.values())))
source_objects = {i: d for i, (kind, d) in source.items() if kind == 'GameObject'}
source_transforms = {d['m_GameObject']['fileID']: d for kind, d in source.values()
                     if kind == 'Transform' and 'm_GameObject' in d}
environment = UnityPy.load(str(args.web_data))
native_objects = {}
native_transforms = {}
for obj in environment.objects:
    if obj.assets_file.name != args.native_scene:
        continue
    if obj.type.name == 'GameObject':
        native_objects[obj.path_id] = obj.parse_as_dict()
    elif obj.type.name == 'Transform':
        data = obj.parse_as_dict()
        native_transforms[data['m_GameObject']['m_PathID']] = data
by_name = {data['m_Name']: native_transforms[i] for i, data in native_objects.items()
           if i in native_transforms}
results = []
for object_id, data in source_objects.items():
    name = data.get('m_Name', '')
    if name not in by_name or object_id not in source_transforms:
        continue
    src = source_transforms[object_id]
    native = by_name[name]
    differences = {}
    for field in ['m_LocalPosition', 'm_LocalRotation', 'm_LocalScale']:
        changed = {axis: [value, native[field][axis]] for axis, value in src[field].items()
                   if abs(float(value) - native[field][axis]) > 0.0001}
        if changed:
            differences[field] = changed
    results.append({'name': name, 'differences': differences})
print(json.dumps({'sourceExplicitGameObjects': len(source_objects),
                  'nativeGameObjects': len(native_objects),
                  'matchedNames': len(results),
                  'exactTransforms': sum(not row['differences'] for row in results),
                  'differences': [row for row in results if row['differences']]}, indent=2))
