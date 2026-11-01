"""Locate warm/purple sphere regions, excluding the green board and blue sky.
Used only to observe real Unity frames in browser tests, never to alter a game.
"""
import json,sys
from PIL import Image
im=Image.open(sys.argv[1]).convert('HSV')
w,h=im.size
pixels=im.load()
mask=bytearray(w*h)
for y in range(h):
 for x in range(w):
  hue,sat,value=pixels[x,y]
  if (hue<45 or hue>175) and sat>80 and value>40:mask[y*w+x]=1
found=[]
for index in range(len(mask)):
 if not mask[index]:continue
 mask[index]=0;pending=[index];count=0;left=w;top=h;right=0;bottom=0
 while pending:
  current=pending.pop();y,x=divmod(current,w);count+=1
  left=min(left,x);right=max(right,x);top=min(top,y);bottom=max(bottom,y)
  for xx,yy in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
   if 0<=xx<w and 0<=yy<h:
    at=yy*w+xx
    if mask[at]:mask[at]=0;pending.append(at)
 bw=right-left+1;bh=bottom-top+1
 if count>=50 and 9<=bw<=100 and 9<=bh<=100 and .45<bw/bh<2.1:
  found.append({'x':(left+right)/2,'y':(top+bottom)/2,'width':bw,'height':bh,'area':count})
print(json.dumps(found))
