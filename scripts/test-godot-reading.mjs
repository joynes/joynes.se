import test from'node:test';import assert from'node:assert/strict';
import{BODY,GROUND_SENSOR,RIGHT_SENSOR,PLATFORMS,FLOOR,createWorld,step,move,isToRightOf,grounded,solved}from'../games/godot-reading/core.mjs';
test('three original objects, source geometry and gravitational settling on all authored surfaces',()=>{
 const world=createWorld();assert.deepEqual(world.objects.map(o=>o.id),['baloon','rocket','gun']);assert.equal(world.objects[1].x,204.8);assert.equal(world.objects[2].x,409.6);
 assert.ok(Math.abs(BODY.x-15.22348176)<1e-10);assert.equal(GROUND_SENSOR.y,32.3486);assert.ok(Math.abs(RIGHT_SENSOR.y-7.925407)<1e-10);
 for(const p of PLATFORMS){const o=world.objects[0];world.objects= [o];o.x=p.x;o.y=p.y-p.hy-BODY.y-70;o.vy=0;for(let i=0;i<180;i++)step(world);assert.ok(Math.abs(o.y-(p.y-p.hy-BODY.y))<.001);assert.ok(grounded(o));}
});
test('original adjacent right sensor requires grounding of BOTH objects',()=>{
 const left={x:500,y:FLOOR-BODY.y},right={x:535,y:FLOOR-BODY.y};assert.ok(isToRightOf(right,left));assert.equal(isToRightOf(left,right),false);
 assert.equal(isToRightOf({...right,x:650},left),false);assert.equal(isToRightOf({...right,y:300},left),false);assert.equal(isToRightOf(right,{...left,y:300}),false);
 const edge={x:500,y:FLOOR-GROUND_SENSOR.y-1};assert.equal(grounded(edge),false);
 // Grounding may be by different authored surfaces, but vertical sensor overlap still matters.
 assert.equal(isToRightOf({...right,y:PLATFORMS[1].y-PLATFORMS[1].hy-BODY.y},left),false);
});
test('drag limit, release, body contacts, replay and no win from arbitrary rightward placement',()=>{
 const w=createWorld(),[a,b]=w.objects;a.dragging=true;const y=a.y;for(let i=0;i<120;i++)step(w);assert.equal(a.y,y);const x=a.x;move(a,999,-999);assert.equal(a.x,x+100);assert.equal(a.y,200);a.dragging=false;
 for(let i=0;i<500;i++)step(w);assert.ok(grounded(a));assert.ok(grounded(b));assert.equal(solved(w),false);
 a.x=500;b.x=500;a.y=400;b.y=FLOOR-BODY.y;for(let i=0;i<300;i++)step(w);assert.ok(b.y-a.y>=BODY.y*2-.001);assert.ok(b.y<=FLOOR-BODY.y);
 const fresh=createWorld();assert.equal(fresh.objects[0].y,300);assert.equal(solved(fresh),false);
});
