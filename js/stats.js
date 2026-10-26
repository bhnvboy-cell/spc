const SPC = (() => {
  const factors = {
    A2:  { 2: 1.880, 3: 1.023, 4: 0.729, 5: 0.577, 6: 0.483, 7: 0.419, 8: 0.373, 9: 0.337, 10: 0.308 },
    A3:  { 2: 2.659, 3: 1.954, 4: 1.628, 5: 1.427, 6: 1.287, 7: 1.182, 8: 1.099, 9: 1.032, 10: 0.975 },
    D3:  { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0.076, 8: 0.136, 9: 0.184, 10: 0.223 },
    D4:  { 2: 3.267, 3: 2.574, 4: 2.282, 5: 2.114, 6: 2.004, 7: 1.924, 8: 1.864, 9: 1.816, 10: 1.777 },
    B3:  { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0.029, 7: 0.113, 8: 0.179, 9: 0.232, 10: 0.276 },
    B4:  { 2: 3.267, 3: 2.568, 4: 2.266, 5: 2.089, 6: 1.964, 7: 1.874, 8: 1.806, 9: 1.751, 10: 1.707 }
  };

  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;

  const stdev = a => {
    if (a.length < 2) return 0;
    const m = mean(a);
    return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
  };

  const range = a => Math.max(...a) - Math.min(...a);

  const movingRanges = a => a.slice(1).map((x, i) => Math.abs(x - a[i]));

  const median = a => {
    const s = [...a].sort((x, y) => x - y);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  };

  const parseNumbers = text =>
    text.split(/[\s,;\t\n\r]+/).filter(t => t.length).map(Number).filter(n => Number.isFinite(n));

  const parseSubgroups = text => text.trim().split(/\n/).map(l => parseNumbers(l)).filter(a => a.length);

  function subgroupStats(rows) {
    return rows.map(r => ({
      n: r.length,
      mean: mean(r),
      range: range(r),
      sd: stdev(r)
    }));
  }

  function xbarR(rows) {
    const sg = subgroupStats(rows);
    const k = sg.length;
    const xbarbar = mean(sg.map(s => s.mean));
    const rbar = mean(sg.map(s => s.range));
    const n = sg[0].n;
    const A2 = factors.A2[n] ?? 3 / Math.sqrt(n);
    const D3 = factors.D3[n] ?? 0;
    const D4 = factors.D4[n] ?? 3.686;
    return {
      type: 'xbar-r', subgroupCount: k, n,
      primary: {
        title: 'X̄ Chart (subgroup averages)', titleKey: 'ctitle.xbarR',
        points: sg.map(s => s.mean),
        cl: xbarbar, ucl: xbarbar + A2 * rbar, lcl: xbarbar - A2 * rbar,
        sigma: rbar / (A2 * 3)
      },
      secondary: {
        title: 'R Chart (subgroup ranges)', titleKey: 'ctitle.R',
        points: sg.map(s => s.range),
        cl: rbar, ucl: D4 * rbar, lcl: D3 * rbar,
        sigma: (D4 * rbar - rbar) / 3
      },
      stats: [
        ['X̿ (grand mean)', xbarbar], ['R̄ (avg range)', rbar],
        ['A₂', A2], ['D₃', D3], ['D₄', D4],
        ['Subgroups', k], ['Subgroup size', n]
      ]
    };
  }

  function xbarS(rows) {
    const sg = subgroupStats(rows);
    const k = sg.length;
    const xbarbar = mean(sg.map(s => s.mean));
    const sbar = mean(sg.map(s => s.sd));
    const n = sg[0].n;
    const A3 = factors.A3[n] ?? 3 / (Math.sqrt(n) * (1 - 1 / (4 * n)));
    const B3 = factors.B3[n] ?? 0;
    const B4 = factors.B4[n] ?? 3;
    return {
      type: 'xbar-s', subgroupCount: k, n,
      primary: {
        title: 'X̄ Chart (subgroup averages)', titleKey: 'ctitle.xbarS',
        points: sg.map(s => s.mean),
        cl: xbarbar, ucl: xbarbar + A3 * sbar, lcl: xbarbar - A3 * sbar,
        sigma: sbar / (A3 * 3)
      },
      secondary: {
        title: 'S Chart (subgroup std. deviations)', titleKey: 'ctitle.S',
        points: sg.map(s => s.sd),
        cl: sbar, ucl: B4 * sbar, lcl: B3 * sbar,
        sigma: Math.max((B4 * sbar - sbar) / 3, 1e-12)
      },
      stats: [
        ['X̿ (grand mean)', xbarbar], ['S̄ (avg std. dev)', sbar],
        ['A₃', A3], ['B₃', B3], ['B₄', B4],
        ['Subgroups', k], ['Subgroup size', n]
      ]
    };
  }

  function imr(raw) {
    const values = raw.map(r => Array.isArray(r) ? r[0] : r);
    const mr = movingRanges(values);
    const mrbar = mean(mr);
    const xbar = mean(values);
    const d2 = 1.128;
    const sigmaWithin = mrbar / d2;
    return {
      type: 'i-mr', subgroupCount: values.length, n: 1,
      primary: {
        title: 'Individuals Chart (individual values)', titleKey: 'ctitle.i',
        points: [...values],
        cl: xbar, ucl: xbar + 2.66 * mrbar, lcl: xbar - 2.66 * mrbar,
        sigma: sigmaWithin
      },
      secondary: {
        title: 'MR Chart (moving ranges)', titleKey: 'ctitle.mr',
        points: mr.map((m, i) => m),
        cl: mrbar, ucl: 3.267 * mrbar, lcl: 0,
        sigma: (3.267 * mrbar - mrbar) / 3
      },
      stats: [
        ['X̄ (mean)', xbar], ['MR̄ (avg moving range)', mrbar],
        ['σ (within) = MR̄/d₂', sigmaWithin],
        ['Points', values.length]
      ]
    };
  }

  function pChart(rows) {
    const counts = rows.map(r => r[0]);
    const sizes = rows.map(r => (r.length > 1 ? r[1] : NaN));
    const useSizes = sizes.every(n => Number.isFinite(n));
    const ns = useSizes ? sizes : rows.map(r => r.length);
    const pbar = counts.reduce((s, c, i) => s + c / ns[i], 0) / counts.length;
    const points = counts.map((c, i) => c / ns[i]);
    const limits = points.map((p, i) => {
      const se = Math.sqrt(pbar * (1 - pbar) / ns[i]);
      return { ucl: pbar + 3 * se, lcl: Math.max(0, pbar - 3 * se) };
    });
    return {
      type: 'p', subgroupCount: counts.length, n: null,
      primary: {
        title: 'p Chart (fraction defective)', titleKey: 'ctitle.p',
        points, cl: pbar, ucl: null, lcl: null,
        variableLimits: limits,
        sigma: Math.sqrt(pbar * (1 - pbar) / mean(ns)),
        isAttribute: true
      },
      secondary: null,
      stats: [
        ['p̄ (avg fraction)', pbar], ['p̄ as %', (pbar * 100).toFixed(2) + '%'],
        ['Subgroups', counts.length],
        ['Avg subgroup size', mean(ns).toFixed(1)]
      ]
    };
  }

  function npChart(rows) {
    const counts = rows.map(r => r[0]);
    const sizes = rows.map(r => (r.length > 1 ? r[1] : NaN));
    const useSizes = sizes.every(n => Number.isFinite(n));
    const ns = useSizes ? sizes : rows.map(() => rows[0].length);
    const n0 = ns[0];
    const pbar = mean(counts.map((c, i) => c / ns[i]));
    const cl = n0 * pbar;
    const sd = Math.sqrt(cl * (1 - pbar));
    return {
      type: 'np', subgroupCount: counts.length, n: n0,
      primary: {
        title: 'np Chart (count defective)', titleKey: 'ctitle.np',
        points: [...counts],
        cl, ucl: cl + 3 * sd, lcl: Math.max(0, cl - 3 * sd),
        sigma: sd, isAttribute: true
      },
      secondary: null,
      stats: [
        ['n (subgroup size)', n0], ['p̄', pbar],
        ['CL = n·p̄', cl], ['UCL', cl + 3 * sd], ['LCL', Math.max(0, cl - 3 * sd)]
      ]
    };
  }

  function cChart(raw) {
    const counts = raw.map(r => Array.isArray(r) ? r[0] : r);
    const cbar = mean(counts);
    const sd = Math.sqrt(cbar);
    return {
      type: 'c', subgroupCount: counts.length, n: null,
      primary: {
        title: 'c Chart (count of defects)', titleKey: 'ctitle.c',
        points: [...counts],
        cl: cbar, ucl: cbar + 3 * sd, lcl: Math.max(0, cbar - 3 * sd),
        sigma: sd, isAttribute: true
      },
      secondary: null,
      stats: [['c̄ (avg defects)', cbar], ['√c̄', sd], ['Subgroups', counts.length]]
    };
  }

  function uChart(rows) {
    const counts = rows.map(r => r[0]);
    const units = rows.map(r => (r.length > 1 ? r[1] : 1));
    const u = counts.map((c, i) => c / units[i]);
    const totalC = counts.reduce((s, c) => s + c, 0);
    const totalN = units.reduce((s, n) => s + n, 0);
    const ubar = totalC / totalN;
    const limits = u.map((_, i) => {
      const se = Math.sqrt(ubar / units[i]);
      return { ucl: ubar + 3 * se, lcl: Math.max(0, ubar - 3 * se) };
    });
    return {
      type: 'u', subgroupCount: counts.length, n: null,
      primary: {
        title: 'u Chart (defects per unit)', titleKey: 'ctitle.u',
        points: u, cl: ubar, ucl: null, lcl: null,
        variableLimits: limits,
        sigma: Math.sqrt(ubar / mean(units)), isAttribute: true
      },
      secondary: null,
      stats: [
        ['ū (defects/unit)', ubar], ['Total defects', totalC],
        ['Total units', totalN], ['Subgroups', counts.length]
      ]
    };
  }

  const chartBuilders = {
    'xbar-r': xbarR, 'xbar-s': xbarS, 'i-mr': imr,
    p: pChart, np: npChart, c: cChart, u: uChart,
    ewma, cusum,
    'laney-p': rows => laney(rows, 'p'),
    'laney-u': rows => laney(rows, 'u')
  };

  function build(type, rows, opts) {
    const fn = chartBuilders[type];
    if (!fn) throw new Error('Unknown chart type: ' + type);
    if (!rows || !rows.length) throw new Error('No data provided.');
    return fn(rows, opts);
  }

  function nelsonViolations(points, series) {
    const { cl, ucl, lcl, sigma, variableLimits } = series;
    const n = points.length;
    const violations = [];
    const at = i => variableLimits ? variableLimits[i] : { ucl, lcl };
    const isOutHi = (p, i) => p > at(i).ucl;
    const isOutLo = (p, i) => p < at(i).lcl;
    const isOut = (p, i) => isOutHi(p, i) || isOutLo(p, i);
    const zoneHi = (p, i, k) => sigma && p > cl + k * sigma && !isOutHi(p, i);
    const zoneLo = (p, i, k) => sigma && p < cl - k * sigma && !isOutLo(p, i);

    for (let i = 0; i < n; i++) {
      if (isOut(points[i], i))
        violations.push({ rule: 1, idx: i, msg: `Point ${i + 1} beyond control limit (${fmt3(points[i])})`, level: 'bad', params: { point: i + 1, val: fmt3(points[i]) } });
    }
    for (let side = 1; side >= -1; side -= 2) {
      let run = 0;
      for (let i = 0; i < n; i++) {
        const same = side > 0 ? points[i] > cl : points[i] < cl;
        run = same ? run + 1 : 0;
        if (run === 9) violations.push({ rule: 2, idx: i, msg: `9 consecutive points on the ${side > 0 ? 'upper' : 'lower'} side of centerline`, level: 'bad', params: { side: side > 0 ? 'up' : 'down' } });
      }
    }
    for (let i = 0; i + 6 < n; i++) {
      const seg = points.slice(i, i + 7);
      let up = true, down = true;
      for (let j = 0; j < seg.length - 1; j++) {
        if (seg[j + 1] <= seg[j]) up = false;
        if (seg[j + 1] >= seg[j]) down = false;
      }
      if (up || down) violations.push({ rule: 3, idx: i + 6, msg: `7 consecutive points trending ${up ? 'upward' : 'downward'}`, level: 'bad', params: { dir: up ? 'up' : 'down' } });
    }
    for (let i = 0; i + 13 < n; i++) {
      let alt = true;
      for (let j = i; j < i + 13; j++) {
        if ((points[j] - cl) * (points[j + 1] - cl) > 0) { alt = false; break; }
      }
      if (alt) violations.push({ rule: 4, idx: i + 13, msg: '14 consecutive points alternating up/down', level: 'bad' });
    }
    if (sigma) {
      for (let side = 1; side >= -1; side -= 2) {
        for (let i = 0; i + 2 < n; i++) {
          const w = i + 3;
          const beyond = points.slice(i, w).filter((p, j) => side > 0 ? zoneHi(p, i + j, 2) || isOutHi(p, i + j) : zoneLo(p, i + j, 2) || isOutLo(p, i + j)).length;
          if (beyond >= 2) violations.push({ rule: 5, idx: w - 1, msg: `2 of 3 consecutive points beyond 2σ on the ${side > 0 ? 'upper' : 'lower'} side`, level: 'bad', params: { side: side > 0 ? 'up' : 'down' } });
        }
        for (let i = 0; i + 4 < n; i++) {
          const w = i + 5;
          const beyond = points.slice(i, w).filter((p, j) => side > 0 ? zoneHi(p, i + j, 1) || isOutHi(p, i + j) : zoneLo(p, i + j, 1) || isOutLo(p, i + j)).length;
          if (beyond >= 4) violations.push({ rule: 6, idx: w - 1, msg: `4 of 5 consecutive points beyond 1σ on the ${side > 0 ? 'upper' : 'lower'} side`, level: 'bad', params: { side: side > 0 ? 'up' : 'down' } });
        }
      }
      let in1 = 0, out1 = 0;
      for (let i = 0; i < n; i++) {
        const within = !isOut(points[i], i) && !zoneHi(points[i], i, 1) && !zoneLo(points[i], i, 1);
        in1 = within ? in1 + 1 : 0;
        if (in1 === 15) violations.push({ rule: 7, idx: i, msg: '15 consecutive points within 1σ of centerline (stratified/homogeneous)', level: 'warn' });
        const beyond = !isOut(points[i], i) && (zoneHi(points[i], i, 1) || zoneLo(points[i], i, 1));
        out1 = beyond ? out1 + 1 : 0;
        if (out1 === 8) violations.push({ rule: 8, idx: i, msg: '8 consecutive points beyond 1σ (both sides, none in zone C)', level: 'warn' });
      }
    }
    const seen = new Set();
    return violations.filter(v => {
      const key = v.rule + ':' + v.idx;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function erf(x) {
    const t = 1 / (1 + 0.3275911 * Math.abs(x));
    const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return x >= 0 ? y : -y;
  }

  const phi = z => 0.5 * (1 + erf(z / Math.SQRT2));

  function capability(values, { lsl, usl, target }) {
    const n = values.length;
    const m = mean(values);
    const sdOverall = stdev(values);
    const mrbar = mean(movingRanges(values));
    const sdWithin = n > 1 ? mrbar / 1.128 : sdOverall;
    const r = { n, mean: m, sdWithin, sdOverall };
    const sw = sdWithin || 1e-12, so = sdOverall || 1e-12;

    if (Number.isFinite(lsl) && Number.isFinite(usl) && usl > lsl) {
      const tol = usl - lsl;
      r.Cp = tol / (6 * sw);
      r.Pp = tol / (6 * so);
      r.Cpu = (usl - m) / (3 * sw);
      r.Cpl = (m - lsl) / (3 * sw);
      r.Ppu = (usl - m) / (3 * so);
      r.Ppl = (m - lsl) / (3 * so);
      r.Cpk = Math.min(r.Cpu, r.Cpl);
      r.Ppk = Math.min(r.Ppu, r.Ppl);
      r.Cpm = Number.isFinite(target) ? tol / (6 * Math.sqrt(so ** 2 + (m - target) ** 2)) : undefined;
    } else if (Number.isFinite(usl)) {
      r.Cpu = (usl - m) / (3 * sw); r.Cpk = r.Cpu;
      r.Ppu = (usl - m) / (3 * so); r.Ppk = r.Ppu;
    } else if (Number.isFinite(lsl)) {
      r.Cpl = (m - lsl) / (3 * sw); r.Cpk = r.Cpl;
      r.Ppl = (m - lsl) / (3 * so); r.Ppk = r.Ppl;
    }

    r.ppms = { total: null, above: null, below: null };
    if (Number.isFinite(lsl) || Number.isFinite(usl)) {
      const below = Number.isFinite(lsl) ? phi((lsl - m) / so) : 0;
      const above = Number.isFinite(usl) ? 1 - phi((usl - m) / so) : 0;
      r.ppms.below = below * 1e6;
      r.ppms.above = above * 1e6;
      r.ppms.total = below * 1e6 + above * 1e6;
      r.sigmaLevel = Number.isFinite(r.Cpk) ? Math.min(3 * r.Cpk + 1.5, 6) : null;
    }
    return r;
  }

  function normalQuantile(p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    const pl = 0.02425;
    let q, r;
    if (p < pl) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (p > 1 - pl) {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  function chiSquareQuantile(p, df) {
    const z = normalQuantile(p);
    const a = 2 / (9 * df);
    return df * Math.pow(1 - a + z * Math.sqrt(a), 3);
  }

  function withinSigma(values) {
    if (values.length < 3) return stdev(values) || 1e-12;
    const mrbar = mean(movingRanges(values));
    return (mrbar / 1.128) || stdev(values) || 1e-12;
  }

  function ewma(raw, opts = {}) {
    const values = raw.map(r => Array.isArray(r) ? r[0] : r);
    const lambda = Number.isFinite(+opts.lambda) && +opts.lambda > 0 && +opts.lambda <= 1 ? +opts.lambda : 0.2;
    const L = Number.isFinite(+opts.L) && +opts.L > 0 ? +opts.L : 3;
    const s = withinSigma(values);
    const m = mean(values);
    const z = [];
    let prev = m;
    values.forEach(x => {
      prev = lambda * x + (1 - lambda) * prev;
      z.push(prev);
    });
    const hw = i => L * s * Math.sqrt(lambda / (2 - lambda) * (1 - Math.pow(1 - lambda, 2 * (i + 1))));
    return {
      type: 'ewma', subgroupCount: values.length, n: 1,
      primary: {
        title: `EWMA Chart (λ = ${lambda}, L = ${L})`, titleKey: 'ctitle.ewma', titleParams: { lambda, L },
        points: z, cl: m, ucl: null, lcl: null,
        variableLimits: z.map((_, i) => ({ ucl: m + hw(i), lcl: m - hw(i) })),
        sigma: null, onlyRule1: true
      },
      secondary: null,
      stats: [
        ['λ (smoothing)', lambda], ['L (width)', L],
        ['Center (X̄)', m], ['σ within (MR̄/d₂)', s],
        ['Steady-state half-width', L * s * Math.sqrt(lambda / (2 - lambda))],
        ['Points', values.length]
      ]
    };
  }

  function cusum(raw, opts = {}) {
    const values = raw.map(r => Array.isArray(r) ? r[0] : r);
    const k = Number.isFinite(+opts.k) && +opts.k >= 0 ? +opts.k : 0.5;
    const h = Number.isFinite(+opts.h) && +opts.h > 0 ? +opts.h : 4;
    const s = withinSigma(values);
    const target = Number.isFinite(+opts.target) ? +opts.target : mean(values);
    let sp = 0, sm = 0;
    const Sp = [], Sm = [];
    values.forEach(v => {
      sp = Math.max(0, sp + (v - (target + k * s)));
      sm = Math.max(0, sm + ((target - k * s) - v));
      Sp.push(sp); Sm.push(sm);
    });
    const ucl = h * s;
    const viol = [];
    Sp.forEach((v, i) => {
      if (v > ucl) viol.push({ rule: 'C+', idx: i, level: 'bad', msg: `Upper CUSUM signal at point ${i + 1} (S₊ = ${fmt3(v)} > hσ = ${fmt3(ucl)}) — mean shifted high`, params: { point: i + 1, val: fmt3(v), thr: fmt3(ucl) } });
    });
    Sm.forEach((v, i) => {
      if (v > ucl) viol.push({ rule: 'C−', idx: i, level: 'bad', msg: `Lower CUSUM signal at point ${i + 1} (S₋ = ${fmt3(v)} > hσ = ${fmt3(ucl)}) — mean shifted low`, params: { point: i + 1, val: fmt3(v), thr: fmt3(ucl) } });
    });
    return {
      type: 'cusum', subgroupCount: values.length, n: 1, customViolations: viol,
      primary: {
        title: `CUSUM Chart (k = ${k}, h = ${h}) — upper accumulation`, titleKey: 'ctitle.cusum', titleParams: { k, h },
        points: Sp, cl: 0, ucl, lcl: -ucl, sigma: null, onlyRule1: true,
        isCusum: true
      },
      overlay: {
        title: 'lower accumulation (−S₋)', titleKey: 'overlay.sm',
        points: Sm.map(v => -v), color: '#f59e0b'
      },
      secondary: null,
      stats: [
        ['k (allowance, σ units)', k], ['h (decision interval, σ units)', h],
        ['Target', target], ['σ within', s],
        ['Signal threshold h·σ', ucl],
        ['Detectable shift ≈ k·σ', k * s],
        ['Points', values.length]
      ]
    };
  }

  function laney(rows, kind) {
    const counts = rows.map(r => r[0]);
    let ubar, pts, ns, seBase;
    if (kind === 'p') {
      ns = rows.map(r => (r.length > 1 ? r[1] : NaN));
      const useSizes = ns.every(Number.isFinite);
      if (useSizes) ns = rows.map(r => r[1]);
      else ns = rows.map(r => r.length);
      ubar = counts.reduce((s, c, i) => s + c / ns[i], 0) / counts.length;
      pts = counts.map((c, i) => c / ns[i]);
      seBase = i => Math.sqrt(ubar * (1 - ubar) / ns[i]);
    } else {
      ns = rows.map(r => (r.length > 1 ? r[1] : 1));
      ubar = counts.reduce((s, c, i) => s + c / ns[i], 0) / counts.length;
      pts = counts.map((c, i) => c / ns[i]);
      seBase = i => Math.sqrt(ubar / ns[i]);
    }
    const z = pts.map((p, i) => (p - ubar) / (seBase(i) || 1e-12));
    const sigmaZ = z.length > 1 ? mean(movingRanges(z)) / 1.128 : 1;
    const label = kind === 'p' ? "p′ Chart (Laney)" : 'u′ Chart (Laney)';
    const statName = kind === 'p' ? 'p̄ (avg fraction)' : 'ū (defects/unit)';
    return {
      type: 'laney-' + kind, subgroupCount: pts.length, n: null,
      primary: {
        title: label + (sigmaZ > 1 ? ' — overdispersed' : ''),
        titleKey: kind === 'p' ? 'ctitle.laneyP' : 'ctitle.laneyU',
        overdispersed: sigmaZ > 1,
        points: pts, cl: ubar, ucl: null, lcl: null,
        variableLimits: pts.map((_, i) => ({
          ucl: ubar + 3 * sigmaZ * seBase(i),
          lcl: Math.max(0, ubar - 3 * sigmaZ * seBase(i))
        })),
        sigma: null, isAttribute: true, onlyRule1: true
      },
      secondary: null,
      stats: [
        [statName, ubar], ['σz (overdispersion factor)', sigmaZ],
        ['Subgroups', pts.length],
        sigmaZ > 1 ? ['Interpretation', 'limits widened for overdispersion'] : ['Interpretation', 'no overdispersion detected']
      ]
    };
  }

  function andersonDarling(values) {
    const n = values.length;
    if (n < 5) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const m = mean(sorted);
    const s = stdev(sorted) || 1e-12;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const f1 = Math.min(Math.max(phi((sorted[i] - m) / s), 1e-15), 1 - 1e-15);
      const f2 = Math.min(Math.max(phi((sorted[n - 1 - i] - m) / s), 1e-15), 1 - 1e-15);
      sum += (2 * (i + 1) - 1) * (Math.log(f1) + Math.log(1 - f2));
    }
    const A2 = -n - sum / n;
    const crit = { '10%': 0.631, '5%': 0.752, '1%': 1.035 };
    const normal = A2 <= crit['5%'];
    return {
      A2, crit,
      normal,
      verdict: normal
        ? `A² = ${A2.toFixed(3)} ≤ 0.752 — data is consistent with normality at the 5% level ✓`
        : `A² = ${A2.toFixed(3)} > 0.752 — reject normality at the 5% level ✗ (Cp/Cpk assumptions may not hold)`
    };
  }

  function capabilityCI(values, { lsl, usl }) {
    const n = values.length;
    if (n < 4) return null;
    const r = capability(values, { lsl, usl });
    const df = n - 1;
    const z = normalQuantile(0.975);
    const out = {};
    if (Number.isFinite(r.Cp)) {
      const lo = r.Cp * Math.sqrt(chiSquareQuantile(0.025, df) / df);
      const hi = r.Cp * Math.sqrt(chiSquareQuantile(0.975, df) / df);
      out.cp = [Math.max(0, lo), hi];
    }
    if (Number.isFinite(r.Cpk)) {
      const se = Math.sqrt(1 / (9 * n) + r.Cpk * r.Cpk / (2 * (n - 1)));
      out.cpk = [Math.max(0, r.Cpk - z * se), r.Cpk + z * se];
    }
    return out;
  }

  function gageRR(rows) {
    if (!rows || rows.length < 4) throw new Error('Gage R&R needs at least 2 parts × 2 operators × 2 trials of data.');
    const parts = [...new Set(rows.map(r => String(r[0])))];
    const ops = [...new Set(rows.map(r => String(r[1])))];
    const trials = rows.length ? rows[0].length - 2 : 0;
    if (trials < 2) throw new Error('Each row needs Part, Operator, and at least 2 trial values.');
    const a = parts.length, b = ops.length, n = trials;
    if (a < 2 || b < 2) throw new Error('Need at least 2 parts and 2 operators to study variation.');

    const cell = {};
    rows.forEach(r => {
      const key = r[0] + '|' + r[1];
      const vals = r.slice(2).map(Number);
      if (vals.length !== n || vals.some(v => !Number.isFinite(v)))
        throw new Error(`Row for part ${r[0]}, operator ${r[1]} has missing/non-numeric trial values. Every cell needs all ${n} trials.`);
      (cell[key] = cell[key] || []).push(...vals);
    });

    const grand = mean(rows.flatMap(r => r.slice(2).map(Number)));
    const partMean = {}, opMean = {}, cellMean = {};
    parts.forEach(p => {
      const vals = rows.filter(r => String(r[0]) === p).flatMap(r => r.slice(2).map(Number));
      partMean[p] = mean(vals);
    });
    ops.forEach(o => {
      const vals = rows.filter(r => String(r[1]) === o).flatMap(r => r.slice(2).map(Number));
      opMean[o] = mean(vals);
    });
    Object.keys(cell).forEach(k => { cellMean[k] = mean(cell[k]); });

    let ssp = 0, sso = 0, ssint = 0, sse = 0;
    parts.forEach(p => { ssp += b * n * (partMean[p] - grand) ** 2; });
    ops.forEach(o => { sso += a * n * (opMean[o] - grand) ** 2; });
    parts.forEach(p => ops.forEach(o => {
      const cm = cellMean[p + '|' + o];
      if (cm !== undefined) ssint += n * (cm - partMean[p] - opMean[o] + grand) ** 2;
    }));
    Object.keys(cell).forEach(k => {
      cell[k].forEach(v => { sse += (v - cellMean[k]) ** 2; });
    });

    const dfp = a - 1, dfo = b - 1, dfint = (a - 1) * (b - 1), dfe = a * b * (n - 1);
    if (dfe < 1) throw new Error('Not enough trials for an error estimate.');
    const msp = ssp / dfp, mso = sso / dfo, msint = ssint / dfint, mse = sse / dfe;

    let sInt2, sOp2, msErrUsed = mse;
    if (msint > mse) {
      sInt2 = (msint - mse) / n;
      sOp2 = Math.max(0, (mso - msint) / (a * n));
    } else {
      const msPool = (ssint + sse) / (dfint + dfe);
      sInt2 = 0;
      msErrUsed = msPool;
      sOp2 = Math.max(0, (mso - msPool) / (a * n));
    }
    const sErr2 = msErrUsed;
    const sPart2 = Math.max(0, (msp - msint) / (b * n));

    const EV = Math.sqrt(sErr2), RV = Math.sqrt(sOp2 + sInt2), GRR = Math.sqrt(sErr2 + sOp2 + sInt2);
    const PV = Math.sqrt(sPart2), TV = Math.sqrt(GRR * GRR + PV * PV) || 1e-12;
    const pct = v => (v / TV) * 100;
    const ndcVal = GRR > 0 ? Math.max(1, Math.floor(1.41 * PV / GRR)) : 99;
    const grrPct = (GRR / TV) * 100;
    const verdict = grrPct <= 10 ? { cls: 'ok', msg: 'Gauge is acceptable (GRR ≤ 10%)' }
      : grrPct <= 30 ? { cls: 'warn', msg: 'Marginal — improve gauge or method (10–30%)' }
      : { cls: 'bad', msg: 'Unacceptable gauge — GRR > 30%, do not use for SPC decisions' };

    return {
      parts: a, operators: b, trials: n,
      components: [
        ['Repeat (EV, repeatability)', sErr2, EV],
        ['Reproducibility (operators + interaction)', sOp2 + sInt2, RV],
        ['Parts (PV)', sPart2, PV],
        ['Gage R&R', sErr2 + sOp2 + sInt2, GRR],
        ['Total variation', TV * TV, TV]
      ],
      grrPct, contributionPct: ((sErr2 + sOp2 + sInt2) / (TV * TV)) * 100,
      evPct: pct(EV), rvPct: pct(RV), pvPct: pct(PV),
      ndc: ndcVal, verdict,
      reproducibilityNote: (sOp2 > sInt2 ? 'operator-to-operator bias dominates reproduction error' : 'operator × part interaction dominates reproduction error')
    };
  }

  function pareto(items) {
    const clean = items
      .filter(it => it && String(it[0]).length && Number.isFinite(+it[1]) && +it[1] >= 0)
      .map(it => ({ label: String(it[0]), count: +it[1] }))
      .sort((x, y) => y.count - x.count);
    const total = clean.reduce((s, it) => s + it.count, 0) || 1;
    let cum = 0;
    clean.forEach(it => {
      cum += it.count;
      it.cumPct = (cum / total) * 100;
    });
    const vital = clean.findIndex(it => it.cumPct >= 80);
    return { items: clean, total, vitalIdx: vital };
  }

  function cpkPlan({ mean: m, sigma, lsl, usl, targetCpk }) {
    const t = Number.isFinite(+targetCpk) && +targetCpk > 0 ? +targetCpk : 1.33;
    const tol = usl - lsl;
    const center = (lsl + usl) / 2;
    const current = Math.min(usl - m, m - lsl) / (3 * sigma);
    const sigmaMaxCentered = tol / (6 * t);
    const lowerOk = lsl + 3 * t * sigma, upperOk = usl - 3 * t * sigma;
    const centeringViable = upperOk >= lowerOk;
    const bestMean = centeringViable ? Math.min(Math.max(center, lowerOk), upperOk) : null;
    const sigmaNeedKeepMean = Math.min(usl - m, m - lsl) / (3 * t);
    return {
      targetCpk: t, current,
      center: { viable: centeringViable, shift: centeringViable ? +(bestMean - m).toFixed(6) : null, bestMean },
      reduceOnly: {
        sigmaNeed: sigmaNeedKeepMean,
        pct: sigmaNeedKeepMean < sigma ? (1 - sigmaNeedKeepMean / sigma) * 100 : null,
        already: sigma <= sigmaNeedKeepMean
      },
      both: {
        sigmaNeed: sigmaMaxCentered,
        pct: sigmaMaxCentered < sigma ? (1 - sigmaMaxCentered / sigma) * 100 : null,
        shift: centeringViable ? +(center - m).toFixed(6) : null
      }
    };
  }

  const fmt3 = x => (Number.isFinite(x) ? (Math.abs(x) >= 100 || (Math.abs(x) < 0.001 && x !== 0) ? x.toExponential(2) : x.toFixed(3)) : '—');

  return {
    mean, stdev, range, movingRanges, median, parseNumbers, parseSubgroups,
    build, nelsonViolations, capability, fmt3, factors,
    ewma, cusum, laney, andersonDarling, capabilityCI, gageRR, pareto, cpkPlan,
    normalQuantile, chiSquareQuantile, withinSigma
  };
})();

if (typeof module !== 'undefined') module.exports = SPC;
