// Original mesh authoring helpers. No manufacturer geometry or physical-fit claims.
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import fs from 'node:fs';
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(x=>{this.result=x;this.onloadend?.();});}readAsDataURL(blob){blob.arrayBuffer().then(x=>{this.result='data:application/octet-stream;base64,'+Buffer.from(x).toString('base64');this.onloadend?.();});}};
export {T};
const material=(name,color,metalness=.2,roughness=.5)=>new T.MeshStandardMaterial({name,color,metalness,roughness});
export const M={metal:material('Brushed aluminium',0x626b77,.8,.32),silver:material('Machined edges',0xaab3bd,.85,.25),black:material('Graphite polymer',0x151920,.1,.58),blade:material('Satin impeller',0x20252d,.12,.6),pcb:material('PCB solder mask',0x193930,.15,.75),copper:material('Copper',0xaa6a39,.85,.3),gold:material('Gold plated contacts',0xc6a354,.75,.32),purple:material('Purple accent',0x7653db,.4,.38),white:material('Connector markings',0xcbd1da,.1,.65),casePanel:material('Satin case panels',0x9098a3,.45,.42),rgb:material('RGB diffuser',0xffffff,0,.34)};
M.rgb.vertexColors=true;
export function spectrum(geometry,axis='angle'){
 const position=geometry.attributes.position,colors=[];const color=new T.Color();geometry.computeBoundingBox();const bounds=geometry.boundingBox;
 for(let i=0;i<position.count;i++){const phase=axis==='angle'?(Math.atan2(position.getY(i),position.getX(i))+Math.PI)/(Math.PI*2):(position.getX(i)-bounds.min.x)/Math.max(.0001,bounds.max.x-bounds.min.x);color.setHSL((.58+phase*.72)%1,.95,.48);colors.push(color.r,color.g,color.b);}
 geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));return geometry;
}
export function rgbRing(parent,r,t,x,y,z){return mesh(parent,spectrum(new T.TorusGeometry(r,t,8,64)),M.rgb,x,y,z);}
export function rgbBar(parent,w,h,d,x,y,z){return mesh(parent,spectrum(new T.BoxGeometry(w,h,d,16,1,1),'length'),M.rgb,x,y,z);}
export function mesh(parent,g,m,x=0,y=0,z=0){const a=new T.Mesh(g,m);a.position.set(x,y,z);parent.add(a);return a;}
export function hardwareBox(w,h,d){
 // Round visible enclosures and chips; keep tiny contacts/fins inexpensive and crisp.
 const smallest=Math.min(w,h,d),largest=Math.max(w,h,d);
 return smallest>=.02&&largest>=.08?new RoundedBoxGeometry(w,h,d,1,Math.min(.012,smallest*.16)):new T.BoxGeometry(w,h,d);
}
export function box(p,w,h,d,x,y,z,m=M.black){return mesh(p,hardwareBox(w,h,d),m,x,y,z);}
export function cylinder(p,r,depth,x,y,z,m=M.silver,segments=24){const a=mesh(p,new T.CylinderGeometry(r,r,depth,segments),m,x,y,z);a.rotation.x=Math.PI/2;return a;}
export function ring(p,r,t,x,y,z,m=M.silver){return mesh(p,new T.TorusGeometry(r,t,8,48),m,x,y,z);}
export function rounded(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
export function plate(p,w,h,d,r,x,y,z,m=M.metal,holes=[]){const shape=rounded(w,h,r);for(const hole of holes)shape.holes.push(hole);return extrude(p,shape,d,x,y,z,m);}
export function extrude(p,shape,d,x,y,z,m=M.metal){return mesh(p,new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSize:Math.min(.006,d*.22),bevelThickness:Math.min(.006,d*.22),bevelSegments:2,curveSegments:16}),m,x,y,z);}
export function screw(p,x,y,z,r=.018){cylinder(p,r,.01,x,y,z,M.silver,12);box(p,r*1.2,.004,.003,x,y,z+.006,M.black);box(p,.004,r*1.2,.003,x,y,z+.006,M.black);}
export function wire(p,points,r=.015,m=M.black){return mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),32,r,8,false),m);}
export function slot(x,y,w,h){const hole=new T.Path();hole.moveTo(x-w/2,y-h/2);hole.lineTo(x+w/2,y-h/2);hole.lineTo(x+w/2,y+h/2);hole.lineTo(x-w/2,y+h/2);hole.closePath();return hole;}
export function bladeGeometry(radius){
 // Narrow swept blades, nine separate vanes with genuine gaps and a pitched surface.
 const vertices=[],indices=[],rows=15,cols=4;
 for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){const u=i/rows,v=j/cols,r=radius*(.24+.68*u),angle=.46*u+(v-.5)*(.53-.14*u);vertices.push(Math.cos(angle)*r,Math.sin(angle)*r,radius*((v-.5)*.15+Math.sin(u*Math.PI)*.025));}
 for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function fan(p,x,y,z,r,{grille=false,frame=true,rgb=true}={}){
 const f=new T.Group();f.position.set(x,y,z);p.add(f);
 if(frame){const hole=new T.Path();hole.absarc(0,0,r*.96,0,Math.PI*2,true);plate(f,r*2.14,r*2.14,.04,r*.13,0,0,-.035,M.black,[hole]);for(const dx of [-1,1])for(const dy of [-1,1])screw(f,dx*r*.9,dy*r*.9,.014,r*.045);}
 ring(f,r*.97,r*.025,0,0,.017,M.metal);if(rgb)rgbRing(f,r*.91,r*.026,0,0,.021);else ring(f,r*.91,r*.012,0,0,.006,M.metal);
 const rotor=new T.Group();rotor.name='Fan rotor';rotor.userData.fanRotor=true;rotor.position.z=.015;f.add(rotor);
 const blades=bladeGeometry(r),bladeMaterial=M.blade.clone();bladeMaterial.side=T.DoubleSide;
 for(let i=0;i<9;i++){const a=mesh(rotor,blades,bladeMaterial);a.rotation.z=i*Math.PI*2/9;}
 cylinder(rotor,r*.23,.07,0,0,-.001,M.black);cylinder(rotor,r*.17,.012,0,0,.04,M.metal);ring(rotor,r*.135,r*.009,0,0,.049,M.silver);
 // Moulded hub marks rotate with the impeller, not with the fixed housing.
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3;box(rotor,r*.048,r*.014,.003,Math.cos(a)*r*.11,Math.sin(a)*r*.11,.052,M.black).rotation.z=a;}
 for(let i=0;i<4;i++){const a=i*Math.PI/2;wire(f,[[0,0,-.04],[Math.cos(a)*r*.45,Math.sin(a)*r*.45,-.04],[Math.cos(a+.15)*r*.94,Math.sin(a+.15)*r*.94,-.04]],r*.022,M.black);}
 if(grille){for(let i=1;i<=5;i++)ring(f,r*(.2+i*.13),r*.013,0,0,.09,M.silver);for(let i=0;i<4;i++){const a=i*Math.PI/2;wire(f,[[0,0,.09],[Math.cos(a)*r*.94,Math.sin(a)*r*.94,.09]],r*.016,M.silver);}}
 return f;
}
export async function save(model,file){
 model.updateMatrixWorld(true);const packed=new T.Group();packed.name=model.name;
 const retained=[];model.traverse(node=>{if(node.userData.fanRotor||node.userData.removableCover)retained.push(node);});
 function packMeshes(nodes,transform,parent){const batches=new Map();for(const node of nodes){let geometry=node.geometry.clone().applyMatrix4(transform.clone().multiply(node.matrixWorld));if(geometry.index){const expanded=geometry.toNonIndexed();geometry.dispose();geometry=expanded;}geometry.deleteAttribute('uv');const list=batches.get(node.material)||[];list.push(geometry);batches.set(node.material,list);}for(const [material,list] of batches)parent.add(new T.Mesh(mergeVertices(mergeGeometries(list)),material));}
 const fixed=[];model.traverse(node=>{if(!node.isMesh)return;let parent=node.parent;while(parent){if(parent.userData.fanRotor||parent.userData.removableCover)return;parent=parent.parent;}fixed.push(node);});packMeshes(fixed,new T.Matrix4(),packed);
 for(const rotor of retained){const pivot=new T.Group();pivot.name=rotor.name;pivot.userData={...rotor.userData};rotor.matrixWorld.decompose(pivot.position,pivot.quaternion,pivot.scale);const meshes=[];rotor.traverse(node=>{if(node.isMesh)meshes.push(node);});packMeshes(meshes,rotor.matrixWorld.clone().invert(),pivot);packed.add(pivot);}
 const data=await new GLTFExporter().parseAsync(packed,{binary:true});fs.writeFileSync(file,Buffer.from(data));console.log(file,data.byteLength,'bytes',retained.filter(node=>node.userData.fanRotor).length,'animated fan pivots');
}
