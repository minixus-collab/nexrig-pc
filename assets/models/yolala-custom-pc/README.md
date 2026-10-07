# Custom Gaming PC — licensed example

Based on **Custom Gaming PC** (https://skfb.ly/otsTr) by **Yolala3D | Y3D**, licensed under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).

Canonical source: https://sketchfab.com/3d-models/custom-gaming-pc-1a24273417534f69afa0f7c62b643ffc
Current author profile: https://sketchfab.com/Yolala3d
The supplied archive's original credit uses the author's earlier name, **Yolala1232**. It is retained verbatim in `source-license.txt`; the visible viewer credit includes both names.

The user supplied the glTF archive on 7 October 2026. `pc.glb` is a modified version: presentation floor removed, six fan impeller/hub groups given animation pivots, side panel marked for toggling, welded/simplified geometry, Meshopt compression, textures resized to at most 1024 pixels and converted to WebP. The viewer changes framing, lighting and power appearance. Manufacturer logos are part of the supplied artwork; this is an attributed example, not an endorsement or an exact match for catalogue selections.

The original unpacked files total about 74 MB; this browser asset is about 7 MB. It loads only after choosing **Realistic example PC**. Keep the existing generic configurable views available, including if the example fails to load. Real mobile GPU performance has not been measured.

## Reproduce

Extract the authorized source archive into a temporary directory. With Python/numpy and Node.js:

```sh
python3 scripts/prepare_realistic_pc.py /tmp/nexrig-real-model/scene.gltf
npm install --prefix /tmp/nexrig-real-tools --cache /tmp/nexrig-npm-cache @gltf-transform/cli@4.2.1 --ignore-scripts --no-audit --no-fund
/tmp/nexrig-real-tools/node_modules/.bin/gltf-transform optimize /tmp/nexrig-real-model/prepared.gltf assets/models/yolala-custom-pc/pc.glb --compress meshopt --flatten false --join false --instance false --palette false --simplify-error 0.0001 --texture-compress webp --texture-size 1024
```

Preserve hierarchy so the marked side panel and six rotor pivots survive. Meshoptimizer decoder 0.24.0 is vendored locally under its MIT license. No source archive, online embed or third-party runtime requests are needed by the site.
