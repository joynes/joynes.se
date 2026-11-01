import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import crypto from'node:crypto';
import{SETTINGS,createCar,step,speed,pitch}from'../games/car-topview/core.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('original acceleration, friction, symmetric reverse, stop and pitch',()=>{
 assert.deepEqual(SETTINGS,{acceleration:400,maxSpeed:800,friction:200,steerSpeed:3,driftFactor:2});
 for(const[dir,sign]of[['up',-1],['down',1]]){const c=createCar();for(let i=0;i<60;i++)step(c,{[dir]:true});near(c.vx,sign*200);near(c.y,300);near(c.x,512+sign*101.6666666667);near(pitch(c),1.125);for(let i=0;i<60;i++)step(c,{});near(speed(c),0);near(pitch(c),.5);}
});
test('steering at rest, both keys cancel, lateral friction is twice longitudinal',()=>{
 const c=createCar();for(let i=0;i<60;i++)step(c,{right:true});near(c.angle,3);near(c.x,512);near(c.y,300);
 const a=createCar();step(a,{up:true,down:true,left:true,right:true});near(a.angle,0);near(speed(a),0);
 a.vx=100;a.vy=100;step(a,{});near(a.vx,100-200/60);near(a.vy,100-400/60);
});
test('source speed cap and rotated rectangle contacts keep car inside all four visible walls',()=>{
 const c=createCar();c.vx=2000;step(c,{});near(speed(c),800);near(pitch(c),3);
 for(const angle of[0,Math.PI/2,Math.PI,Math.PI*1.5,.4]){
  const v=createCar();v.angle=angle;for(let i=0;i<1200;i++)step(v,{up:true});const hx=Math.abs(Math.cos(angle))*15+Math.abs(Math.sin(angle))*25,hy=Math.abs(Math.sin(angle))*15+Math.abs(Math.cos(angle))*25;
  assert.ok(v.x>=20+hx-1e-7&&v.x<=1004-hx+1e-7);assert.ok(v.y>=20+hy-1e-7&&v.y<=580-hy+1e-7);
 }
});
test('original car and PCM24 motor audio retain exact source bytes',()=>{
 const p=JSON.parse(fs.readFileSync('games/car-topview/provenance.json'));for(const[name,expected]of Object.entries(p.originalAssetsSha256)){assert.equal(crypto.createHash('sha256').update(fs.readFileSync('games/car-topview/'+name)).digest('hex'),expected);}
});
