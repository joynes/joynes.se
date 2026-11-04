import*as T from'./vendor/render-engine.mjs?v=fb335b10d13e';
import{ground,WHEEL_RADIUS}from'./core.mjs?v=c3bbf84468aa';
const ASSETS='assets/';
export async function createGraphics(canvas,levels){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-500,500,300,-300,.1,6000),skyLight=new T.HemisphereLight(0xfff6df,0x8aab9b,2.2),sun=new T.DirectionalLight(0xffedcf,3);
 sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-700,right:700,top:500,bottom:-500,near:1,far:2200});sun.shadow.normalBias=.8;sun.shadow.bias=-.0002;scene.add(skyLight,sun,sun.target);
 const loader=new T.GLTFLoader();let models;
 try{models=await Promise.all(['buggy',...levels.map(l=>'route-'+l.id)].map(name=>loader.loadAsync(`${ASSETS}${name}.glb?v=1.0.0`)));}catch(error){renderer.dispose();throw error;}
 const car=models[0].scene,worlds=models.slice(1).map(m=>m.scene),wheels=[],cargo=[];let active=-1,focusX=120,viewWidth=1000,viewHeight=600,readyView=false;
 const modelStats=[];
 for(const [i,model]of[car,...worlds].entries()){
  let meshes=0,triangles=0;model.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;o.castShadow=true;o.receiveShadow=true;if(o.name.startsWith('DepotGlow'))o.material=o.material.clone();}});modelStats.push({name:i?'route-'+levels[i-1].id:'buggy',meshes,triangles});scene.add(model);if(i)model.visible=false;
 }
 for(const name of['RearNearWheel','RearFarWheel','FrontNearWheel','FrontFarWheel']){const wheel=car.getObjectByName(name);if(wheel)wheels.push(wheel);}
 for(let i=0;i<3;i++)cargo.push(car.getObjectByName('Cargo_'+i));
 const glow=new T.Mesh(new T.SphereGeometry(1,8,5),new T.MeshBasicMaterial({color:0xffdf79,transparent:true,opacity:.8}));glow.position.set(-47,12,0);car.add(glow);glow.visible=false;
 const rotors=worlds.map(world=>{const result=[];world.traverse(o=>{if(o.name.startsWith('Rotor_'))result.push(o);});return result;});
 function resize(){
  const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);viewWidth=r.width<600?650:1000;viewHeight=viewWidth*r.height/r.width;camera.left=-viewWidth/2;camera.right=viewWidth/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;camera.updateProjectionMatrix();readyView=true;
 }
 function select(index,job){
  if(active!==index){worlds.forEach((w,i)=>w.visible=i===index);active=index;scene.background=new T.Color(levels[index].sky);scene.fog=new T.Fog(levels[index].sky,1000,3500);}
  focusX=job.x+110;resize();
 }
 function render(job,index){
  if(!readyView)resize();if(!readyView)return;if(index!==active)select(index,job);
  const level=levels[index];car.position.set(job.x,job.y,0);car.rotation.z=job.angle;
  for(const wheel of wheels)wheel.rotation.z=-job.travel/WHEEL_RADIUS;
  cargo.forEach((o,i)=>{if(o)o.visible=i>=job.delivered;});glow.visible=job.boostTime>0;glow.scale.set(18+Math.sin(job.time*40)*5,6,7);
  for(const rotor of rotors[index])rotor.rotation.z=job.time*1.4;
  worlds[index].traverse(o=>{if(!o.name.startsWith('DepotGlow')||!o.isMesh)return;const n=Number(o.name.match(/\d+/)?.[0]),done=n<job.delivered,on=n===job.delivered,color=new T.Color(done?0x6faf93:on?0xffce65:0xaaa58d);o.material.color.copy(color);o.material.emissive.copy(color).multiplyScalar(on?.6+.15*Math.sin(job.time*3):done?.12:.03);});
  const desired=job.x+110+Math.max(0,job.vx)*.16;focusX+=(desired-focusX)*.12;
  const targetY=job.y+viewHeight*.13;camera.position.set(focusX,targetY+160,720);camera.lookAt(focusX,targetY,0);
  sun.position.set(job.x+200,450,350);sun.target.position.set(job.x,0,0);renderer.render(scene,camera);
 }
 function depotPoint(index,delivered){
  const level=levels[index],x=level.depots[delivered];if(x===undefined)return null;const point=new T.Vector3(x,ground(level,x,true)+105,0).project(camera);return{x:(point.x+1)/2,y:(1-point.y)/2,visible:point.z>-1&&point.z<1&&Math.abs(point.x)<1&&Math.abs(point.y)<1};
 }
 function stats(){const box=new T.Box3().setFromObject(car),size=new T.Vector3();box.getSize(size);return{models:modelStats,wheels:wheels.length,cargoVisible:cargo.filter(o=>o?.visible).length,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,viewport:[renderer.domElement.width,renderer.domElement.height],carSize:[size.x,size.y,size.z],webgl2:renderer.getContext() instanceof WebGL2RenderingContext};}
 function dispose(){scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});renderer.dispose();}
 return{select,render,resize,depotPoint,stats,dispose};
}
