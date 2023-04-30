function addZero(num: number) {
  return num < 10 ? "0" + num : num;
}

export function durationToTime(duration: number) {
  const r: { [key: string]: any } = {}; // result
  const s: { [key: string]: any } = {
    hour: 3600,
    minute: 60,
    second: 1
  };

  Object.keys(s).forEach(function (key) {
    r[key] = addZero(Math.floor(duration / s[key]));
    duration -= r[key] * s[key];
  });

  return `${r.minute}:${r.second}`;
}
