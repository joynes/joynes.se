"""Run with Blender --background --python this.py -- SOURCE_FBX OUTPUT_JSON.
Exports the source police body/wheel meshes for conversion into the existing Unity runtime.
The imported FBX's mesh origins are normalized to the prefab's intended body/wheel pivots.
"""
import bpy
import json
import sys
from pathlib import Path
args = sys.argv[sys.argv.index('--') + 1:]
source, destination = map(Path, args)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(source))
result = {}
for name in ['CarPolice', 'WP1']:
    mesh = bpy.data.objects[name].data
    mesh.calc_loop_triangles()
    center = [(min(v.co[i] for v in mesh.vertices) + max(v.co[i] for v in mesh.vertices)) / 2 for i in range(3)]
    vertices = []
    for triangle in mesh.loop_triangles:
        # Unity uses left-handed coordinates; reflect X and reverse winding.
        for loop_index in reversed(triangle.loops):
            vertex = mesh.vertices[mesh.loops[loop_index].vertex_index]
            pos = [(vertex.co[i] - center[i]) * .01 for i in range(3)]
            normal = list(mesh.corner_normals[loop_index].vector)
            pos[0] *= -1
            normal[0] *= -1
            uv = list(mesh.uv_layers.active.data[loop_index].uv)
            vertices.append({'position': pos, 'normal': normal, 'uv': uv})
    result[name] = {'vertices': vertices, 'sourceVertexCount': len(mesh.vertices),
                    'sourceTriangleCount': len(mesh.loop_triangles), 'pivotNormalization': center}
destination.write_text(json.dumps(result))
print('Exported', {name: item['sourceTriangleCount'] for name, item in result.items()})
