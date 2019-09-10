const map = (from: number, fromMin: number, fromMax: number, toMin: number, toMax: number) => {
  if (from < fromMin) {
    from = fromMin;
  } else if (from > fromMax) {
    from = fromMax;
  }

  const fromAbs = from - fromMin;
  const fromMaxAbs = fromMax - fromMin;

  const normal = fromAbs / fromMaxAbs;

  const toMaxAbs = toMax - toMin;
  const toAbs = toMaxAbs * normal;

  const to = toAbs + toMin;

  return to;
};

const randomInRange = (min: number, max: number) => {
  const randomValue = Math.random();
  return min + randomValue * (max - min);
};

export default {
  map,
  randomInRange
};
