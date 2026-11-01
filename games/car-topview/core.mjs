export const SETTINGS=Object.freeze({acceleration:400,maxSpeed:800,friction:200,steerSpeed:3,driftFactor:2});
export const WIDTH=1024,HEIGHT=600;
export function createCar(){return{x:512,y:300,angle:0,vx:0,vy:0};}
const toward=(v,d)=>Math.sign(v)*Math.max(0,Math.abs(v)-d);
export function speed(c){return Math.hypot(c.vx,c.vy);}
export function pitch(c){return .5+2.5*speed(c)/SETTINGS.maxSpeed;}
export function step(c,input,dt=1/60){
 c.angle+=((input.right?1:0)-(input.left?1:0))*SETTINGS.steerSpeed*dt;
 const cs=Math.cos(c.angle),sn=Math.sin(c.angle),axis=(input.down?1:0)-(input.up?1:0);
 c.vx+=SETTINGS.acceleration*axis*dt*cs;c.vy+=SETTINGS.acceleration*axis*dt*sn;
 let forward=c.vx*cs+c.vy*sn,lateral=-c.vx*sn+c.vy*cs;
 forward=toward(forward,SETTINGS.friction*dt);lateral=toward(lateral,SETTINGS.friction*SETTINGS.driftFactor*dt);
 c.vx=cs*forward-sn*lateral;c.vy=sn*forward+cs*lateral;
 const s=speed(c);if(s>SETTINGS.maxSpeed){c.vx*=SETTINGS.maxSpeed/s;c.vy*=SETTINGS.maxSpeed/s;}
 c.x+=c.vx*dt;c.y+=c.vy*dt;
 // Original 30×50 rotated collision rectangle against four aligned 20px walls.
 const hx=Math.abs(cs)*15+Math.abs(sn)*25,hy=Math.abs(sn)*15+Math.abs(cs)*25;
 if(c.x<20+hx){c.x=20+hx;if(c.vx<0)c.vx=0;}
 if(c.x>WIDTH-20-hx){c.x=WIDTH-20-hx;if(c.vx>0)c.vx=0;}
 if(c.y<20+hy){c.y=20+hy;if(c.vy<0)c.vy=0;}
 if(c.y>HEIGHT-20-hy){c.y=HEIGHT-20-hy;if(c.vy>0)c.vy=0;}
}
