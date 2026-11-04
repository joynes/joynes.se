export async function createAudio(){
 const names=['music-garden','music-locks','music-quarry','motor','cannon','beacon'],raw=await Promise.all(names.map(async name=>{const r=await fetch('assets/'+name+'.mp3?v=1.0.0');if(!r.ok)throw Error('Audio unavailable');return[name,await r.arrayBuffer()];})),context=new AudioContext(),buffers={},info={};
 try{await Promise.all(raw.map(async([name,bytes])=>{const b=await context.decodeAudioData(bytes);buffers[name]=b;let peak=0;for(const v of b.getChannelData(0))peak=Math.max(peak,Math.abs(v));if(peak<.0001)throw Error('Silent audio');info[name]={duration:b.duration,peak};}));}catch(e){await context.close();throw e;}
 const master=context.createGain(),limiter=context.createDynamicsCompressor(),meter=context.createAnalyser();limiter.threshold.value=-10;limiter.ratio.value=6;meter.fftSize=256;limiter.connect(master).connect(meter).connect(context.destination);let muted=false,music,motor,motorGain,musicGain;const voices=new Set();
 function stopLoops(){for(const node of[music,motor])if(node)try{node.stop();node.disconnect();}catch{}music=motor=null;musicGain?.disconnect();motorGain?.disconnect();}
 function resume(){void context.resume();}
 function start(id){stopLoops();resume();music=context.createBufferSource();music.buffer=buffers['music-'+id];music.loop=true;musicGain=context.createGain();musicGain.gain.value=.23;music.connect(musicGain).connect(limiter);music.start();motor=context.createBufferSource();motor.buffer=buffers.motor;motor.loop=true;motorGain=context.createGain();motorGain.gain.value=0;motor.connect(motorGain).connect(limiter);motor.start();}
 function cue(name,rate=1,gain=.3){const s=context.createBufferSource(),g=context.createGain();s.buffer=buffers[name];s.playbackRate.value=rate;g.gain.value=gain;s.connect(g).connect(limiter);voices.add(s);s.onended=()=>{voices.delete(s);s.disconnect();g.disconnect();};s.start();}
 function update(game){if(!motorGain)return;const speed=Math.hypot(game.player.vx,game.player.vy),moving=game.status==='active'&&speed>.1;motorGain.gain.setTargetAtTime(moving?.1:0,context.currentTime,.04);motor.playbackRate.setTargetAtTime(.8+Math.min(1,speed/4.9)*.45,context.currentTime,.08);}
 function mute(value){muted=value;master.gain.value=value?0:1;}
 function pause(){void context.suspend();}
 function stats(){const wave=new Float32Array(meter.fftSize);meter.getFloatTimeDomainData(wave);return{state:context.state,muted,peak:Math.max(...wave.map(Math.abs)),buffers:info,motor:Math.round((motorGain?.gain.value||0)*1000)/1000};}
 async function dispose(){stopLoops();for(const s of voices)try{s.stop();}catch{}voices.clear();await context.close();}
 return{start,cue,update,resume,pause,mute,stats,dispose};
}
