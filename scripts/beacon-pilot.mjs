import{findPath}from'../games/rall-054/enhanced/core.mjs';
export function command(game,level){
 const p=game.player,beacons=game.beacons.filter(b=>!b.linked).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
 let target=beacons[0];
 if(!target)target=game.extractionOpen?level.spawn:game.enemies.filter(e=>e.hp>0).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||level.spawn;
 const range=beacons.length?1.72:game.extractionOpen?.85:4.2;
 let moveX=0,moveY=0;
 if(Math.hypot(target.x-p.x,target.y-p.y)>range){const route=findPath(level,game,p,target),waypoint=route[1]||route[0]||target;const dx=waypoint.x-p.x,dy=waypoint.y-p.y,n=Math.hypot(dx,dy)||1;moveX=dx/n;moveY=dy/n;}
 return{moveX,moveY,fire:true,shield:true,aimX:0,aimY:0};
}
