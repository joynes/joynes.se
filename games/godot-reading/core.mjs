// Scene dimensions and rectangle sensors reconstructed from Godot source 97a4f8a.
export const WIDTH=1024, HEIGHT=600;
export const BODY={x:8.40148*1.812,y:12.3609*1.906};
export const GROUND_SENSOR={x:11.1093*.886*2,y:16.1743*2};
export const RIGHT_SENSOR={x:11.1093*.886*.858,y:16.1743*.49};
export const PLATFORMS=[
 {id:'upper',x:574-379,y:126+122,hx:512*.38,hy:99.0001*.138},
 {id:'lower',x:1205-522,y:330+93,hx:512*.236,hy:99.0001*.138},
 {id:'floor',x:512-1,y:597+823,hx:512,hy:99.0001*8.594}
];
export const FLOOR=PLATFORMS[2].y-PLATFORMS[2].hy;
export const NAMES=['baloon','rocket','gun'];
export const LABELS={baloon:'Ballong',rocket:'Raket',gun:'Leksakspistol'};
export function overlaps(a,b){return Math.abs(a.x-b.x)<a.hx+b.hx&&Math.abs(a.y-b.y)<a.hy+b.hy;}
function area(o){return {x:o.x,y:o.y+1,hx:GROUND_SENSOR.x,hy:GROUND_SENSOR.y};}
export function grounded(o){return PLATFORMS.some(p=>overlaps(area(o),p));}
export function isToRightOf(right,left){
 if(!grounded(left)||!grounded(right))return false;
 const sensor={x:left.x+31,y:left.y+1.01,hx:RIGHT_SENSOR.x,hy:RIGHT_SENSOR.y};
 // Godot get_overlapping_areas includes both Area2D and AreaRight on each object.
 return overlaps(sensor,area(right))||overlaps(sensor,{x:right.x+31,y:right.y+1.01,hx:RIGHT_SENSOR.x,hy:RIGHT_SENSOR.y});
}
export function createWorld(){return {objects:NAMES.map((id,n)=>({id,x:WIDTH*.2*n,y:HEIGHT/2,vx:0,vy:0,dragging:false})),time:0};}
export function move(o,dx,dy){o.x=Math.max(BODY.x,Math.min(WIDTH-BODY.x,o.x+Math.max(-100,Math.min(100,dx))));o.y=Math.max(BODY.y,Math.min(HEIGHT-BODY.y,o.y+Math.max(-100,Math.min(100,dy))));o.vx=o.vy=0;}
export function step(world,dt=1/60){
 world.time+=dt;
 for(const o of world.objects){
  if(o.dragging)continue;
  o.vy=(o.vy+98*dt)*Math.max(0,1-.1*dt);
  o.x+=o.vx*dt;o.y+=o.vy*dt;
  o.x=Math.max(BODY.x,Math.min(WIDTH-BODY.x,o.x));o.y=Math.max(BODY.y,o.y);
  for(const p of PLATFORMS){
   const dx=o.x-p.x,dy=o.y-p.y,px=BODY.x+p.hx-Math.abs(dx),py=BODY.y+p.hy-Math.abs(dy);
   if(px<=0||py<=0)continue;
   if(py<=px){o.y+=(dy<0?-py:py);o.vy=0;}else{o.x+=(dx<0?-px:px);o.vx=0;}
  }
 }
 // Character-mode bodies translate without rotating; resolve rectangle contacts.
 for(let pass=0;pass<4;pass++)for(let i=0;i<world.objects.length;i++)for(let j=i+1;j<world.objects.length;j++){
  const a=world.objects[i],b=world.objects[j],dx=b.x-a.x,dy=b.y-a.y;
  const px=BODY.x*2-Math.abs(dx),py=BODY.y*2-Math.abs(dy);
  if(px<=0||py<=0||a.dragging||b.dragging)continue;
  if(py<px){const top=dy>=0?a:b,below=dy>=0?b:a;top.y=below.y-BODY.y*2;top.vy=0;}
  else{const sign=dx>=0?1:-1;a.x-=sign*px/2;b.x+=sign*px/2;a.vx=b.vx=0;}
 }
 for(const o of world.objects){o.x=Math.max(BODY.x,Math.min(WIDTH-BODY.x,o.x));if(o.y>FLOOR-BODY.y){o.y=FLOOR-BODY.y;o.vy=0;}}
}
export function solved(world){return isToRightOf(world.objects[0],world.objects[1]);}
