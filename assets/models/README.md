# Original NEXRIG GPU model

`nexrig-dual-fan-gpu.glb` is an original generic dual-fan GPU model created for NEXRIG. It does not reproduce a manufacturer product or certify dimensions. No downloaded manufacturer geometry, branding or textures are included. Mesh geometry and materials are authored in `scripts/create_gpu_model.mjs`.

365 meshes: contoured shroud with circular openings, curved fan blades, 96 heatsink fins, copper heatpipes, port shells, PCB components, power socket, gold PCIe contacts and vented backplate. Approximately 3.34 MB uncompressed; loaded on demand when the viewer has a selected GPU, never on initial page load.

To regenerate, install Three.js 0.160.1 in a temporary directory, copy the generator there and run `node create_gpu_model.mjs /absolute/path/to/nexrig-dual-fan-gpu.glb`. The script includes a Node FileReader adapter for GLB export and needs no textures or external assets. Preserve the pinned version.

GLTFLoader.js and BufferGeometryUtils.js are locally vendored from Three.js 0.160.1, with import paths adapted for this site's existing local module. They use the same MIT license retained at `assets/js/vendor/three-LICENSE.txt`.
