export const WHEEL_RADIUS=16,WHEEL_BASE=52;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export function ground(level,x,ignoreGaps=false){
 if(!ignoreGaps&&level.gaps.some(([a,b])=>x>a&&x<b))return null;
 const points=level.profile,step=points[1][0]-points[0][0],i=clamp(Math.floor(x/step),0,points.length-2),a=points[i],b=points[i+1];return a[1]+(b[1]-a[1])*clamp((x-a[0])/(b[0]-a[0]),0,1);
}
export function slope(level,x){return(ground(level,x+12,true)-ground(level,x-12,true))/24;}
export function createJob(level){const x=120;return{x,y:ground(level,x)+WHEEL_RADIUS,vx:0,vy:0,angle:Math.atan(slope(level,x)),omega:0,time:0,energy:100,hull:3,delivered:0,dock:0,grounded:true,status:'running',boostCooldown:0,boostTime:0,rescues:0,distance:0,travel:0,wind:0,lastReason:''};}
function recover(job,level,reason){
 job.lastReason=reason;job.hull--;job.rescues++;job.time+=5;job.dock=0;
 if(job.hull<=0){job.status='lost';return['lost',reason];}
 const x=job.delivered?level.depots[job.delivered-1]+140:120;
 Object.assign(job,{x,y:ground(level,x)+WHEEL_RADIUS,vx:0,vy:0,angle:Math.atan(slope(level,x)),omega:0,grounded:true,energy:100,boostTime:0,boostCooldown:.6});return['recover',reason];
}
export function step(job,level,input,dt=1/120){
 if(job.status!=='running')return[];
 dt=clamp(dt,0,1/30);job.time+=dt;job.boostCooldown=Math.max(0,job.boostCooldown-dt);job.boostTime=Math.max(0,job.boostTime-dt);job.energy=clamp(job.energy+5*dt,0,100);const events=[];
 if(input.boost&&job.boostCooldown===0&&job.energy>=30){
  const direction=input.throttle<0||job.vx< -20?-1:1;job.energy-=30;job.boostCooldown=.9;job.boostTime=.55;job.vx+=direction*145;job.vy=Math.max(job.vy,280);job.grounded=false;events.push('boost');
 }
 const wasGrounded=job.grounded,roadSlope=slope(level,job.x),remaining=3-job.delivered;
 job.wind=level.windZones.reduce((sum,z)=>sum+(job.x>=z.from&&job.x<=z.to?z.push*(.8+.2*Math.sin(job.time*1.5)):0),0);
 let acceleration=input.throttle>0?420/(1+remaining*.07):input.throttle<0?(job.vx>5?-680:-260):0;
 acceleration+=job.wind-(wasGrounded?1.1:.16)*job.vx;
 if(wasGrounded)acceleration-=Math.sin(Math.atan(roadSlope))*220;
 job.vx=clamp(job.vx+acceleration*dt,job.boostTime>0?-280:-140,job.boostTime>0?440:310);
 job.vy-=600*dt;
 job.omega+=(-input.lean*7+(wasGrounded?angleDiff(Math.atan(roadSlope),job.angle)*24-job.omega*7:-job.omega*.65))*dt;
 job.angle=angleDiff(job.angle+job.omega*dt,0);
 const beforeX=job.x;job.x+=job.vx*dt;job.y+=job.vy*dt;job.distance+=Math.abs(job.x-beforeX);job.travel+=job.x-beforeX;
 if(job.x<25){job.x=25;job.vx=Math.max(0,job.vx);}if(job.x>level.length-25){job.x=level.length-25;job.vx=Math.min(0,job.vx);}
 const dx=WHEEL_BASE/2*Math.cos(job.angle),dy=WHEEL_BASE/2*Math.sin(job.angle),front=ground(level,job.x+dx),rear=ground(level,job.x-dx),supports=[];
 if(front!==null)supports.push(front+WHEEL_RADIUS-dy);if(rear!==null)supports.push(rear+WHEEL_RADIUS+dy);
 job.grounded=false;
 if(supports.length){
  const height=Math.max(...supports),penetration=height-job.y;
  if(penetration>=0){
   if(!wasGrounded&&(penetration>60||job.vy<-510||Math.abs(angleDiff(job.angle,Math.atan(roadSlope)))>1.25))return recover(job,level,'Rough landing');
   job.y=height;job.vy=clamp(job.vx*roadSlope,-180,180);job.grounded=true;
  }
 }
 if(job.y< -350)return recover(job,level,'Missed the ledge');
 const depot=level.depots[job.delivered];
 if(depot!==undefined&&Math.abs(job.x-depot)<95&&Math.abs(job.vx)<35&&job.grounded&&Math.abs(job.angle)<.6)job.dock+=dt;else job.dock=0;
 if(job.dock>=.85){job.delivered++;job.dock=0;job.energy=100;job.hull=Math.min(3,job.hull+1);events.push('delivery');if(job.delivered===level.depots.length){job.status='won';events.push('won');}}
 if(job.status==='running'&&job.time>=level.limit){job.status='lost';events.push('lost');}
 return events;
}
