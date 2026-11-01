// Read-only observation of the real Unity/PhysX pose, solely for browser tests.
// The calibration callback uses visible browser controls. No WASM memory is written.
exports.observeDriver = async function(page, calibrate) {
  const candidates = await page.evaluate(() => {
    const heap = instance.Module.HEAPF32, hits = [];
    for (let index = 4; index < heap.length - 8; index++) {
      if (Math.abs(heap[index] - 15.98891) > .001 || Math.abs(heap[index + 2] - 3.1055236) > .001 || Math.abs(heap[index + 1]) > 1) continue;
      const pose = Array.from(heap.subarray(index, index + 7));
      if (Math.abs(pose.slice(3).reduce((total, value) => total + value * value, 0) - 1) < .002) hits.push({index, pose});
    }
    return hits;
  });
  await calibrate();
  const moving = await page.evaluate(candidates => candidates.filter(candidate => {
    const pose = Array.from(instance.Module.HEAPF32.subarray(candidate.index, candidate.index + 7));
    return Number.isFinite(pose[2]) && pose[2] > candidate.pose[2] + .2 && pose[2] < candidate.pose[2] + 5 &&
      Math.abs(pose.slice(3).reduce((total, value) => total + value * value, 0) - 1) < .002;
  }).map(candidate => candidate.index), candidates);
  const index = moving.at(-1);
  if (!index) throw new Error('Browser input did not move an observed native vehicle pose');
  const read = async () => page.evaluate(index => {
    const values = Array.from(instance.Module.HEAPF32.subarray(index, index + 7));
    const [x, y, z, qx, qy, qz, qw] = values;
    const quaternionLength = Math.hypot(qx, qy, qz, qw);
    if (![x,y,z,qx,qy,qz,qw].every(Number.isFinite) || Math.abs(quaternionLength - 1) > .02) throw new Error('Native pose no longer valid');
    return {x,y,z,yaw:Math.atan2(2*(qw*qy+qx*qz),1-2*(qy*qy+qz*qz))};
  }, index);
  read.samples=()=>page.evaluate(indices=>indices.map(index=>({index,pose:Array.from(instance.Module.HEAPF32.subarray(index,index+7))})),moving);
  return read;
};
