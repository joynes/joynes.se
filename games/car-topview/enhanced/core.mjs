export const WIDTH=960,HEIGHT=640;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export function nearest(path,x,y){let best=Infinity,index=0;for(let i=0;i<path.length;i++){const d=Math.hypot(x-path[i][0],y-path[i][1]);if(d<best){best=d;index=i;}}return{distance:best,index};}
export function tangent(path,i){const a=path[(i+path.length-1)%path.length],b=path[(i+1)%path.length];return Math.atan2(b[1]-a[1],b[0]-a[0]);}
export function createRace(course){const [x,y]=course.path[0];return{x,y,angle:tangent(course.path,0),speed:0,time:0,energy:55,next:1,gates:8,offroad:0,penalty:0,status:'running',boosting:false,drifting:false,trail:[],ghost:[],sampleTime:0,medal:null};}
export function target(course,race){return course.path[Math.floor(race.next%race.gates*course.path.length/race.gates)];}
export function step(race,course,input,dt){
 if(race.status!=='running')return[];
 const events=[];dt=clamp(dt,0,1/30);race.time+=dt;
 const near=nearest(course.path,race.x,race.y),onRoad=near.distance<course.width/2-7;
 race.boosting=!!input.boost&&race.energy>1&&input.throttle>0&&onRoad;
 race.energy=clamp(race.energy+(race.boosting?-38:8)*dt,0,100);
 const max=race.boosting?370:270;
 race.speed+=(input.throttle*350-race.speed*(onRoad?.7:3.5))*dt;
 race.speed=clamp(race.speed,-90,onRoad?max:95);
 race.angle+=input.steer*2.8*clamp(Math.abs(race.speed)/90,.25,1)*Math.sign(race.speed||1)*dt;
 race.drifting=onRoad&&Math.abs(input.steer)>.4&&race.speed>150;
 if(race.drifting)race.energy=clamp(race.energy+12*dt,0,100);
 race.x=clamp(race.x+Math.cos(race.angle)*race.speed*dt,15,WIDTH-15);race.y=clamp(race.y+Math.sin(race.angle)*race.speed*dt,15,HEIGHT-15);
 race.offroad=onRoad?0:race.offroad+dt;
 if(race.offroad>2.5){const i=Math.floor((race.next-1)*course.path.length/race.gates);[race.x,race.y]=course.path[i];race.angle=tangent(course.path,i);race.speed=0;race.time+=3;race.penalty+=3;race.offroad=0;events.push('recover');}
 const goal=target(course,race);
 if(Math.hypot(race.x-goal[0],race.y-goal[1])<course.width*.48){
  race.next++;events.push('gate');
  if(race.next>race.gates){race.status='won';race.medal=race.time<=course.gold?'Gold':race.time<=course.silver?'Silver':'Bronze';events.push('won');}
 }
 if(race.status==='running'&&race.time>=course.limit){race.status='lost';events.push('lost');}
 if(race.time>=race.sampleTime){race.ghost.push([+race.time.toFixed(3),+race.x.toFixed(2),+race.y.toFixed(2),+race.angle.toFixed(3)]);race.sampleTime=race.time+.1;}
 return events;
}
