"""Prepare the supplied Yolala3D glTF archive without changing its source file.

Requires numpy. Run with the extracted scene.gltf path; writes prepared.gltf
beside it so the original relative buffer/texture paths remain valid.
"""
import json
import sys
from pathlib import Path
import numpy as np

source = Path(sys.argv[1])
document = json.loads(source.read_text())
document['asset']['copyright'] = 'Custom Gaming PC by Yolala3D | Y3D (Yolala1232), https://skfb.ly/otsTr, CC BY 4.0 https://creativecommons.org/licenses/by/4.0/; adapted for NEXRIG.'
nodes = document['nodes']
# Fail clearly for a different asset revision rather than editing arbitrary nodes.
assert nodes[58]['name'] == 'Cube_12'
assert nodes[789]['name'] == 'Cube.154_380'
parents = {child: i for i, node in enumerate(nodes) for child in node.get('children', [])}

def world_matrix(index):
    node = nodes[index]
    assert not any(key in node for key in ('translation', 'rotation', 'scale'))
    matrix = np.array(node.get('matrix', np.eye(4).T.flatten())).reshape(4, 4).T
    return world_matrix(parents[index]) @ matrix if index in parents else matrix

world = [world_matrix(i) for i in range(len(nodes))]
nodes[2]['children'].remove(58)  # Remove the presentation floor, not PC hardware.
nodes[789]['extras'] = {'previewSidePanel': True}
for base in (418, 440, 462, 484, 633, 655):
    assert nodes[base]['name'].startswith('Cylinder.')
    leaf = nodes[base]['children'][0]
    primitive = document['meshes'][nodes[leaf]['mesh']]['primitives'][0]
    bounds = document['accessors'][primitive['attributes']['POSITION']]
    center = (world[leaf] @ np.r_[(np.array(bounds['min']) + np.array(bounds['max'])) / 2, 1])[:3]
    pivot = np.eye(4)
    pivot[:3, 3] = center
    if base >= 633:  # Roof fans: local Z axis follows their physical spindle.
        pivot[:3, :3] = np.array([[1, 0, 0], [0, 0, -1], [0, 1, 0]])
    children = list(range(base + 4, base + 20, 2))
    index = len(nodes)
    nodes.append({'name': f'Example fan rotor {base}',
                  'matrix': (np.linalg.inv(world[2]) @ pivot).T.flatten().tolist(),
                  'children': children, 'extras': {'fanRotor': True}})
    nodes[2]['children'].append(index)
    for child in children:
        nodes[2]['children'].remove(child)
        nodes[child]['matrix'] = (np.linalg.inv(pivot) @ world[child]).T.flatten().tolist()
output = source.with_name('prepared.gltf')
output.write_text(json.dumps(document))
print(output)
