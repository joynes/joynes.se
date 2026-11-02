export function findCursor(data,width,height,templates){
 const found=[];
 for(const t of templates)for(let y=-6;y<=height-7;y++)for(let x=-6;x<=width-7;x++){
  let match=true,visible=0;for(const [dx,dy,r,g,b]of t.samples){if(x+dx<0||x+dx>=width||y+dy<0||y+dy>=height)continue;visible++;const i=((y+dy)*width+x+dx)*4;if(Math.abs(data[i]-r)>2||Math.abs(data[i+1]-g)>2||Math.abs(data[i+2]-b)>2){match=false;break;}}
  if(match&&visible>=12)found.push({x,y,template:t.name});
 }
 return found.length===1?found[0]:null;
}
