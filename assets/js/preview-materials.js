/* Original, locally generated studio environment and surface textures. */
import * as THREE from './vendor/three-0.160.1.module.min.js';
export function createStudioMaterials(renderer,scene){
 const width=512,height=256,pixels=new Float32Array(width*height*4);
 const wrapDistance=(a,b)=>Math.min(Math.abs(a-b),1-Math.abs(a-b));
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const u=x/width,v=y/height;
  const panel=(cx,cy,sx,sy,power)=>power*Math.exp(-Math.pow(wrapDistance(u,cx)/sx,6)-Math.pow((v-cy)/sy,6));
  const neutral=.035+panel(.17,.37,.035,.2,3.4)+panel(.66,.36,.085,.13,2.1)+panel(.43,.08,.2,.045,3);
  const rim=panel(.86,.48,.018,.2,1.1),i=(y*width+x)*4;pixels[i]=neutral+rim*.55;pixels[i+1]=neutral+rim*.48;pixels[i+2]=neutral+rim;pixels[i+3]=1;
 }
 const environment=new THREE.DataTexture(pixels,width,height,THREE.RGBAFormat,THREE.FloatType);environment.mapping=THREE.EquirectangularReflectionMapping;environment.minFilter=environment.magFilter=THREE.LinearFilter;environment.needsUpdate=true;
 const pmrem=new THREE.PMREMGenerator(renderer);const target=pmrem.fromEquirectangular(environment);scene.environment=target.texture;environment.dispose();pmrem.dispose();
 function surfaceTexture(brushed){const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d'),data=ctx.createImageData(256,256);let seed=48371;const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let y=0;y<256;y++){const row=next();for(let x=0;x<256;x++){const shade=brushed?150+row*65+next()*12:175+next()*55;const i=(y*256+x)*4;data.data[i]=data.data[i+1]=data.data[i+2]=shade;data.data[i+3]=255;}}ctx.putImageData(data,0,0);const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(9,9);texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);return texture;}
 const metalTexture=surfaceTexture(true),plasticTexture=surfaceTexture(false),prepared=new WeakSet();
 function uvFor(geometry){if(geometry.attributes.uv)return;const position=geometry.attributes.position,normal=geometry.attributes.normal,uv=new Float32Array(position.count*2);for(let i=0;i<position.count;i++){const nx=Math.abs(normal?.getX(i)||0),ny=Math.abs(normal?.getY(i)||0),nz=Math.abs(normal?.getZ(i)??1);if(nx>ny&&nx>nz){uv[i*2]=position.getZ(i);uv[i*2+1]=position.getY(i);}else if(ny>nz){uv[i*2]=position.getX(i);uv[i*2+1]=position.getZ(i);}else{uv[i*2]=position.getX(i);uv[i*2+1]=position.getY(i);}}geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));}
 function prepare(root){root.traverse(mesh=>{if(!mesh.isMesh)return;let material=mesh.material;if(!material?.isMeshStandardMaterial)return;
 if(material.name==='Smoked side glass'){
  if(!material.isMeshPhysicalMaterial){const glass=new THREE.MeshPhysicalMaterial({name:material.name,color:0xcedae5,metalness:0,roughness:.075,transparent:true,opacity:.065,ior:1.46,clearcoat:.8,clearcoatRoughness:.12,envMapIntensity:.38,side:THREE.FrontSide,depthWrite:false});mesh.material=glass;material=glass;}
  mesh.castShadow=false;return;
 }
 uvFor(mesh.geometry);if(prepared.has(material))return;prepared.add(material);
 if(material.name==='RGB diffuser'){
  // Use the vertex spectrum for emission too, preserving visible blade geometry.
  material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#ifdef USE_COLOR\n totalEmissiveRadiance *= vColor;\n#endif');};
  material.customProgramCacheKey=()=> 'nexrig-rgb-spectrum-v1';material.envMapIntensity=.18;material.roughness=.34;material.needsUpdate=true;return;
 }
 if(material.name==='Brushed aluminium')material.color.setHex(0x7c8692);
 if(material.name==='Satin case panels'){material.roughnessMap=plasticTexture;material.bumpMap=plasticTexture;material.bumpScale=.00006;}
 const metallic=material.metalness>.55;material.envMapIntensity=metallic?.72:.3;
 if(metallic){material.roughnessMap=metalTexture;material.bumpMap=metalTexture;material.bumpScale=.00012;material.roughness=Math.max(.25,material.roughness);}
 else if(!material.map&&material.metalness<.35){material.roughnessMap=plasticTexture;material.bumpMap=plasticTexture;material.bumpScale=.00009;material.roughness=Math.max(.52,material.roughness);}
 material.needsUpdate=true;
 });}
 return {prepare};
}
