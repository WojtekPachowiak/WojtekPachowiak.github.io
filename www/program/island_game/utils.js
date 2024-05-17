export const triangleWave = (t, p) => {
  return 2 * Math.abs(t / p - Math.floor(t / p + 0.5));
};
