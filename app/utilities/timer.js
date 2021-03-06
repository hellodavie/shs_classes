const TIMER_MAX_TIMEOUT = 4 * 24 * 3600000;
const TIMER_INTERVAL = TIMER_MAX_TIMEOUT + 60 * 1000 * 1;

let timers = [];
let timerChecker;

export function TimerPolling(func, date) {
  timers.push({
    cb: func,
    date: date
  });

  if (!timerChecker) timerChecker = window.setTimeout(function () {
    const temp = timers;
    timers = [];
    for (let i = 0; i < temp.length; i++) {
      const t = temp[i];
      TimerDynamic(t.cb, t.date, 20000, true)
    }
  }, TIMER_INTERVAL)
}


export function TimerDynamic(cb, date, minInterval, usePolling = true) {
  if (!date) return;
  const timeDiff = date - Date.now();
  let interval;

  if (timeDiff > 0) {
    if (timeDiff > TIMER_MAX_TIMEOUT) {
      if (usePolling) return TimerPolling(cb, date); else return;
    }

    if (minInterval) {
      interval = Math.max(minInterval, timeDiff);
    } else {
      interval = timeDiff;
    }
  } else if (!minInterval || timeDiff === 0) {
    cb();
    return;
  } else {
    interval = minInterval;
  }

  return setTimeout(cb, interval);
}
