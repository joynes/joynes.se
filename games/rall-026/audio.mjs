// The emulators8.5.2 CI sound stream is mono Float32 at soundFrequency().
export class NativeAudio{
 constructor(){this.context=null;this.gain=null;this.sources=new Set();this.next=0;this.muted=false;this.buffers=0;this.nonzero=0;this.samples=0;this.played=0;this.peak=0;}
 async unlock(){if(!this.context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;this.context=new Audio({sampleRate:44100,latencyHint:'interactive'});this.gain=this.context.createGain();this.gain.gain.value=this.muted?0:.7;this.gain.connect(this.context.destination);}await this.context.resume();}
 push(samples,rate){
  this.buffers++;this.samples+=samples.length;let peak=0;for(const sample of samples)peak=Math.max(peak,Math.abs(sample));if(peak>.001)this.nonzero++;this.peak=Math.max(this.peak,peak);
  const context=this.context;if(!context||context.state!=='running'||!rate)return;
  if(this.next>context.currentTime+.3)return;
  const buffer=context.createBuffer(1,samples.length,rate);buffer.copyToChannel(samples,0);const source=context.createBufferSource();source.buffer=buffer;source.connect(this.gain);
  const when=Math.max(this.next,context.currentTime+.035);source.start(when);this.next=when+buffer.duration;this.sources.add(source);source.onended=()=>{this.sources.delete(source);source.disconnect();};this.played++;
 }
 setMuted(muted){this.muted=muted;if(this.gain)this.gain.gain.value=muted?0:.7;}
 clear(){for(const source of this.sources){try{source.stop();}catch{}source.disconnect();}this.sources.clear();this.next=0;}
 async close(){this.clear();if(this.context){await this.context.close();this.context=null;this.gain=null;}}
 snapshot(){return{buffers:this.buffers,nonzero:this.nonzero,samples:this.samples,played:this.played,peak:this.peak,muted:this.muted,state:this.context?.state||'closed',queued:this.sources.size};}
}
