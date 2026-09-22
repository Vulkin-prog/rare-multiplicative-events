/* LPF V2, Theorem 7.11: one sign, spatial test phi(x) = 1.
 * Finite Poisson-target calculations, not an arithmetic simulation.
 * No dependencies, network access, DOM access or unseeded randomness.
 */
(function (root) {
  'use strict';
  const BETA = Math.log(2), ALPHA = BETA / 2;
  const CD = 3 + 2 * Math.SQRT2, CC = 4 / BETA;
  const LIMIT = Object.freeze({ dVariance: CD, cVariance: CC, covariance: CC,
    residualVariance: CD - CC, cResidualCovariance: 0,
    correlation: Math.sqrt(CC / CD) });
  const LOG_FACTORIAL = [0, 0];

  function parameters(J, theta) {
    if (!Number.isInteger(J) || J < 1 || J > 10) throw new RangeError('J must be an integer from 1 to 10.');
    if (!Number.isFinite(theta) || theta < 0 || theta > 1) throw new RangeError('theta must be between 0 and 1.');
    const lambda = Math.pow(2, J + theta), mu = lambda / 2;
    return { J, theta, lambda, mu, criticalMean: Math.pow(2, theta - 1) };
  }

  function seedNumber(seed) {
    if (typeof seed === 'number' && Number.isFinite(seed)) return seed >>> 0;
    const value = String(seed === undefined ? 'LPF-V2' : seed);
    let h = 2166136261;
    for (let j = 0; j < value.length; ++j) h = Math.imul(h ^ value.charCodeAt(j), 16777619);
    return h >>> 0;
  }

  function random(seed) {
    let state = seedNumber(seed);
    return function () {
      state = (state + 0x6D2B79F5) | 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      // Strictly between zero and one: logarithms and rejection ratios stay finite.
      return (((t ^ (t >>> 14)) >>> 0) + 0.5) / 4294967296;
    };
  }

  function logFactorial(k) {
    for (let j = LOG_FACTORIAL.length; j <= k; ++j) LOG_FACTORIAL.push(LOG_FACTORIAL[j - 1] + Math.log(j));
    return LOG_FACTORIAL[k];
  }

  // Knuth for small means; Hoermann's transformed rejection (PTRS) for larger ones.
  // No truncation of the Poisson count. In particular, J=10 does not cap N at 512.
  function poisson(mu, rng) {
    if (mu < 30) {
      const threshold = Math.exp(-mu);
      let product = 1, k = 0;
      do { ++k; product *= rng(); } while (product > threshold);
      return k - 1;
    }
    const b = 0.931 + 2.53 * Math.sqrt(mu), a = -0.059 + 0.02483 * b;
    const inverseAlpha = 1.1239 + 1.1328 / (b - 3.4), vr = 0.9277 - 3.6224 / (b - 2);
    const logMu = Math.log(mu);
    for (;;) {
      const u = rng() - 0.5, v = rng(), us = 0.5 - Math.abs(u);
      const k = Math.floor((2 * a / us + b) * u + mu + 0.43);
      if (k < 0) continue;
      if (us >= 0.07 && v <= vr) return k;
      if (us < 0.013 && v > us) continue;
      if (Math.log(v * inverseAlpha / (a / (us * us) + b)) <= -mu + k * logMu - logFactorial(k)) return k;
    }
  }

  function finiteCovariance(J, theta) {
    const p = parameters(J, theta === undefined ? 0 : theta);
    let weightedLagSum = 0, geometricSum = 0, positiveSum = 0;
    for (let j = 0; j <= J; ++j) {
      const rj = Math.exp(-ALPHA * j);
      geometricSum += rj;
      positiveSum += 1 / rj;
      if (j > 0) weightedLagSum += (J + 1 - j) * rj;
    }
    const dVariance = (J + 1 + 2 * weightedLagSum) / J;
    const cVariance = 2 / ALPHA + 2 * Math.expm1(-ALPHA * J) / (J * ALPHA * ALPHA);
    const covariance = 2 * (J + 1 - geometricSum) / (J * ALPHA);
    const residualVariance = dVariance + cVariance - 2 * covariance;
    const cResidualCovariance = covariance - cVariance;
    const scale = Math.sqrt(p.mu) * Math.pow(2, -J) / Math.sqrt(J);
    const dCriticalCovariance = scale * positiveSum;
    const cCriticalCovariance = scale * Math.expm1(ALPHA * J) / ALPHA;
    const residualCriticalCovariance = dCriticalCovariance - cCriticalCovariance;
    const matrix = [
      [dVariance, covariance, dVariance - covariance, dCriticalCovariance],
      [covariance, cVariance, cResidualCovariance, cCriticalCovariance],
      [dVariance - covariance, cResidualCovariance, residualVariance, residualCriticalCovariance],
      [dCriticalCovariance, cCriticalCovariance, residualCriticalCovariance, p.criticalMean]
    ];
    return Object.assign(p, { dVariance, cVariance, covariance, residualVariance,
      cResidualCovariance, dCriticalCovariance, cCriticalCovariance, residualCriticalCovariance,
      correlation: covariance / Math.sqrt(dVariance * cVariance),
      cResidualCorrelation: cResidualCovariance / Math.sqrt(cVariance * residualVariance),
      order: ['d', 'c', 'residual', 'critical'], matrix,
      mean: [0, 0, 0, p.criticalMean] });
  }

  // If an externally supplied lifetime equals an integer, survival uses V > t.
  function calculate(p, lifetimes) {
    const endCounts = new Int32Array(p.J + 1);
    let integralSum = 0, critical = 0;
    for (const v of lifetimes) {
      if (!Number.isFinite(v) || v < 0) throw new RangeError('Lifetimes must be finite and nonnegative.');
      const last = Math.min(p.J, Math.ceil(v) - 1);
      if (last >= 0) ++endCounts[last];
      if (v > p.J) ++critical;
      integralSum += Math.expm1(ALPHA * Math.min(v, p.J));
    }
    const integerSamples = new Array(p.J + 1);
    let survivors = 0, dSum = 0;
    for (let j = p.J; j >= 0; --j) {
      survivors += endCounts[j];
      const mean = p.mu * Math.pow(2, -j), h = (survivors - mean) / Math.sqrt(mean);
      integerSamples[j] = { t: j, survivors, mean, h };
      dSum += h;
    }
    const c = (integralSum / (ALPHA * Math.sqrt(p.mu))
      + Math.sqrt(p.mu) * Math.expm1(-ALPHA * p.J) / ALPHA) / Math.sqrt(p.J);
    const d = dSum / Math.sqrt(p.J);
    return { d, c, residual: d - c, critical, total: lifetimes.length, integerSamples };
  }

  function draw(p, rng) {
    const n = poisson(p.mu, rng), lifetimes = new Array(n);
    for (let i = 0; i < n; ++i) lifetimes[i] = -Math.log(rng()) / BETA;
    return lifetimes;
  }

  function fromLifetimes(J, theta, lifetimes) {
    const p = parameters(J, theta);
    return Object.assign({}, p, calculate(p, lifetimes));
  }

  function oneSample(J, theta, seed, steps) {
    const p = parameters(J, theta), rng = random(seed);
    const lifetimes = draw(p, rng).sort((a, b) => a - b);
    const result = calculate(p, lifetimes);
    const count = steps === undefined ? 160 : steps;
    if (!Number.isInteger(count) || count < 1 || count > 2000) throw new RangeError('steps must be an integer from 1 to 2000.');
    const points = [], jumps = [];
    let removed = 0;
    for (let k = 0; k <= count; ++k) {
      const t = p.J * k / count;
      while (removed < lifetimes.length && lifetimes[removed] <= t) ++removed;
      const survivors = lifetimes.length - removed, mean = p.mu * Math.pow(2, -t);
      points.push({ t, survivors, mean, h: (survivors - mean) / Math.sqrt(mean) });
    }
    for (let k = 0; k < lifetimes.length && lifetimes[k] <= p.J; ++k) {
      const t = lifetimes[k], mean = p.mu * Math.pow(2, -t);
      jumps.push({ t, before: (lifetimes.length - k - mean) / Math.sqrt(mean),
        after: (lifetimes.length - k - 1 - mean) / Math.sqrt(mean),
        survivorsBefore: lifetimes.length - k, survivorsAfter: lifetimes.length - k - 1 });
    }
    return Object.assign({}, p, result, { seed: seedNumber(seed), lifetimes, points, jumps,
      exact: finiteCovariance(J, theta), limit: LIMIT });
  }

  function simulate(J, theta, trials, seed) {
    const p = parameters(J, theta), rng = random(seed);
    if (!Number.isInteger(trials) || trials < 1 || trials > 2000) throw new RangeError('trials must be an integer from 1 to 2000.');
    const samples = [], means = [0, 0, 0, 0];
    const scatter = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
    let totalMean = 0;
    for (let k = 1; k <= trials; ++k) {
      const a = calculate(p, draw(p, rng));
      samples.push({ d: a.d, c: a.c, residual: a.residual, critical: a.critical, total: a.total });
      const v = [a.d, a.c, a.residual, a.critical], delta = v.map((x, i) => x - means[i]);
      for (let i = 0; i < 4; ++i) means[i] += delta[i] / k;
      for (let i = 0; i < 4; ++i) for (let j = 0; j < 4; ++j) scatter[i][j] += delta[i] * (v[j] - means[j]);
      totalMean += (a.total - totalMean) / k;
    }
    const covariance = scatter.map(row => row.map(x => trials > 1 ? x / (trials - 1) : null));
    const meanSE = means.map((_, i) => trials > 1 ? Math.sqrt(Math.max(0, covariance[i][i]) / trials) : null);
    return Object.assign({}, p, { trials, seed: seedNumber(seed), samples,
      empirical: { order: ['d', 'c', 'residual', 'critical'], mean: means, covariance, meanSE, totalMean },
      exact: finiteCovariance(J, theta), limit: LIMIT });
  }

  const api = Object.freeze({ version: '1.0.0', scope: 'One sign; spatial test phi(x)=1; finite Poisson target.',
    beta: BETA, alpha: ALPHA, limit: LIMIT, parameters, finiteCovariance,
    fromLifetimes, oneSample, trajectory: oneSample, simulate });
  root.FlowCompression = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
