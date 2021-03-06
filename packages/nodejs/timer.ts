/*
measure the execution's duration.
example:
 setTimer('connection')
 connect().then(()=>console.log("connected", getTimer('connection')))

 logs: connected +5s (i.e: connection took 5 seconds)

 */

const timer: { [key: string]: number } = {};

export function setTimer(name = 'default', time?: number) {
  timer[name] = time || new Date().getTime();
}

export function getTimer(name?: string, timeline = false) {
  const _now = now();
  const diff = (_now - timer[name || 'default'] || _now) / 1000;
  // if(!timeline) calculate the diff cumulativly,
  // i.e: the difference between now and the last timer, not from the start
  // ex: +3s
  if (!timeline) { setTimer(name, _now); }

  return !timeline ? '+' + diff + 's' : diff;
}

export function endTimer(name?: string, timeline?: boolean) {
  const diff = getTimer(name, timeline);
  removeTimer(name);
  return diff;
}

export function removeTimer(name?: string) {
  delete timer[name || 'default'];
}

export function resetTimer(name?: string) {
  setTimer(name, 0);
}

/**
 * get the current timestamp in milli seconds
 * @method now
 * @return timestamp in milli seconds
 */
export function now(): number {
  return Math.round(new Date().getTime());
}
