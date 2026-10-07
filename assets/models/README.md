# Original NEXRIG hardware models

These GLBs are original generic models authored for NEXRIG. They contain no downloaded manufacturer geometry, logos or third-party textures and do not reproduce an exact product or certify physical fit. The detailed motherboard is authored in `assets/js/build-preview.js` with its own generated PCB texture.

| Asset | Details |
| --- | --- |
| `nexrig-dual-fan-gpu.glb` | Contoured shroud and circular openings, nine separate swept/pitched blades per fan, heatsink fins, copper pipes, ports, vented backplate and PCIe contacts |
| `nexrig-cpu.glb` | Layered substrate, stepped heatspreader, underside contact array and edge components |
| `nexrig-ram.glb` | Keyed gold contacts, IC packages, heatspreader, diffuser and screws; viewer shows the selected kit's module count up to four |
| `nexrig-m2.glb` | Controller, NAND packages, keyed contacts, mounting ring and small PCB components |
| `nexrig-sata.glb` / `nexrig-hdd.glb` | Rounded enclosure, connector contacts, fasteners and different SSD/HDD covers |
| `nexrig-cooler.glb` | Stacked fins, bent copper heatpipes, mounting hardware and pitched impeller |
| `nexrig-aio.glb` | Dual-fan radiator, pump and flexible hoses |
| `nexrig-psu.glb` | Folded enclosure, open fan aperture, wire grille, power inlet, switch and modular sockets |
| `nexrig-case.glb` | Roof/floor/back panels, front fan mesh, three detailed fans, rear expansion slots, basement, feet, I/O and separate smoked side panel |

The assembled layout mounts RAM perpendicular to the board and the GPU horizontally, adds illustrative power cables and supports opening the side panel, hiding the case and an exploded view. The geometry is shared with the individual inspection views; selected references remain clearly labeled as generic representations. Air/AIO and M.2/SATA/HDD variants follow catalogue fields. Case format, dimensions, radiator size, motherboard layout and exact product appearance are not matched.

Approximately 6 MB of GLBs cover all variants; only selected variants load after activating the viewer. Geometry is baked, merged by material and indexed to remove duplicate vertices. Models use 4–10 material batches each; the motherboard's small details are also batched. Loaded variants are cached in the current preview. Missing assets keep simplified geometry and offer an explicit retry button. Fan pivots are retained as separately batched groups with `fanRotor` extras, so only impeller geometry rotates in the optional power simulation. There are no external runtime model requests; animation runs only while explicitly powered on, enabled and visible.

## Regenerate

Use an isolated temporary directory with Node.js and Three.js 0.160.1:

```sh
npm install --prefix /tmp/nexrig-model-tools --cache /tmp/nexrig-npm-cache three@0.160.1 --ignore-scripts --no-audit --no-fund
cp scripts/model_geometry.mjs scripts/create_gpu_model.mjs scripts/create_component_models.mjs /tmp/nexrig-model-tools/
node /tmp/nexrig-model-tools/create_gpu_model.mjs "$PWD/assets/models/nexrig-dual-fan-gpu.glb"
node /tmp/nexrig-model-tools/create_component_models.mjs "$PWD/assets/models"
python3 scripts/build_catalogue.py
```

`model_geometry.mjs` supplies the mesh helpers, pitched fan geometry, batching and Node FileReader adapter. Preserve the pinned Three.js version. Bump `MODEL_VERSION` in `build-preview.js` after asset edits to invalidate cached files.

GLTFLoader.js and BufferGeometryUtils.js are locally vendored from Three.js 0.160.1 with imports adapted to the site's existing module. The MIT license is retained at `assets/js/vendor/three-LICENSE.txt`.

Studio appearance is applied by `assets/js/preview-materials.js`: locally generated HDR reflections and shared surface textures, generated UVs for baked geometry, subtle metal/plastic roughness and physical glass. The generic hardware geometry and original source provenance remain unchanged.

The v4 geometry includes a faceted GPU shroud and inset vents, bevelled case rails, rear drive sled and cable grommets, panel seals, thumb screws and recessed roof controls. The viewer supplies routed, layered cables with combs and connector shells. These are generic visual assembly details, not dimensions or exact wiring for the selected references.

The v5 pass rounds visible chip/enclosure edges while preserving small contact and fin geometry. Fan hub caps and moulded marks share the impeller pivot, so the central hub rotates with the blades. These refinements remain original generic artwork, not photorealistic product scans.

## Candidate for a more realistic complete PC

[Custom Gaming PC](https://sketchfab.com/3d-models/custom-gaming-pc-1a24273417534f69afa0f7c62b643ffc) by [Yolala3D | Y3D](https://sketchfab.com/Yolala3d) is listed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (checked 7 October 2026). It is **not included in this repository**. The download API requires authenticated Sketchfab access; an authorized downloaded archive is needed before integration. Retain author credit, source, license and an account of modifications when integrating.

The listing has approximately 1.04 million triangles, so inspect and optimize it before browser use. The thumbnail is an offline rendered example; it does not establish how the downloaded materials will look in WebGL. Check component separation, textures, scales and fan pivots in the actual archive. This fixed example configuration cannot be presented as an exact match for every builder selection.
