const Chart = (() => {
  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);

  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
  function palette() {
    const d = isDark();
    return {
      grid: d ? '#2a3648' : '#e2e8f0',
      label: d ? '#94a3b8' : '#64748b',
      red: d ? '#f87171' : '#dc2626',
      redTxt: d ? '#fca5a5' : '#dc2626',
      warn: d ? '#fbbf24' : '#d97706',
      amberTxt: d ? '#fcd34d' : '#b45309',
      blue: d ? '#60a5fa' : '#2563eb',
      line: d ? '#2dd4bf' : '#0f766e',
      bar: d ? '#115e59' : '#99f6e4',
      nonvital: d ? '#134e4a' : '#99f6e4',
      onBar: d ? '#e2e8f0' : '#334155',
      catLbl: d ? '#94a3b8' : '#475569'
    };
  }

  function setupCanvas(canvas, height) {
    const w = canvas.parentElement.clientWidth || canvas.clientWidth || 320;
    const dpr = DPR();
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h: height };
  }

  function niceTicks(min, max, count = 5) {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      const c = Number.isFinite(min) ? min : 0;
      return [c - 1, c - 0.5, c, c + 0.5, c + 1];
    }
    const span = max - min;
    const step0 = span / count;
    const mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const norms = [1, 2, 2.5, 5, 10];
    let step = mag;
    for (const nn of norms) {
      if (mag * nn >= step0) { step = mag * nn; break; }
    }
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(10));
    return ticks;
  }

  function drawControlChart(canvas, series, violations = [], overlay = null) {
    const P = palette();
    const H = 260;
    const { ctx, w, h } = setupCanvas(canvas, H);
    const pad = { l: 58, r: 12, t: 14, b: 30 };
    const pts = series.points;
    const n = pts.length;
    if (!n) return;

    const varLims = series.variableLimits || null;
    let yMin = Math.min(...pts), yMax = Math.max(...pts);
    if (overlay && overlay.points && overlay.points.length) {
      yMin = Math.min(yMin, ...overlay.points);
      yMax = Math.max(yMax, ...overlay.points);
    }
    if (varLims) {
      yMin = Math.min(yMin, ...varLims.map(l => l.lcl));
      yMax = Math.max(yMax, ...varLims.map(l => l.ucl));
    } else if (Number.isFinite(series.ucl)) {
      yMin = Math.min(yMin, series.lcl, series.cl);
      yMax = Math.max(yMax, series.ucl, series.cl);
    }
    const padY = (yMax - yMin || 1) * 0.12;
    const ticks = niceTicks(yMin - padY, yMax + padY, 5);
    const y0 = ticks[0], y1 = ticks[ticks.length - 1];

    const X = i => pad.l + (n === 1 ? (w - pad.l - pad.r) / 2 : (i / (n - 1)) * (w - pad.l - pad.r));
    const Y = v => pad.t + (1 - (v - y0) / (y1 - y0)) * (h - pad.t - pad.b);

    ctx.clearRect(0, 0, w, h);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = P.label;
    for (const t of ticks) {
      const y = Y(t);
      ctx.strokeStyle = P.grid;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.fillStyle = P.label;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(series.fmt ? series.fmt(t) : SPC.fmt3(t), pad.l - 5, y);
    }

    if (varLims) {
      ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      ctx.beginPath();
      varLims.forEach((l, i) => { const x = X(i), y = Y(l.ucl); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke();
      ctx.beginPath();
      varLims.forEach((l, i) => { const x = X(i), y = Y(l.lcl); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      if (Number.isFinite(series.ucl)) {
        ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(pad.l, Y(series.ucl)); ctx.lineTo(w - pad.r, Y(series.ucl)); ctx.stroke();
        ctx.fillStyle = P.redTxt; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
        ctx.fillText('UCL ' + SPC.fmt3(series.ucl), pad.l + 3, Y(series.ucl) - 2);
      }
      if (Number.isFinite(series.lcl)) {
        ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(pad.l, Y(series.lcl)); ctx.lineTo(w - pad.r, Y(series.lcl)); ctx.stroke();
        ctx.fillStyle = P.redTxt; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('LCL ' + SPC.fmt3(series.lcl), pad.l + 3, Y(series.lcl) + 2);
      }
      if (series.sigma && !series.isAttribute) {
        ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
        for (const k of [1, 2]) {
          for (const s of [1, -1]) {
            const yv = series.cl + s * k * series.sigma;
            if (yv > y0 && yv < y1) {
              ctx.beginPath(); ctx.moveTo(pad.l, Y(yv)); ctx.lineTo(w - pad.r, Y(yv)); ctx.stroke();
            }
          }
        }
        ctx.setLineDash([]);
      }
    }

    if (Number.isFinite(series.cl)) {
      ctx.strokeStyle = P.blue; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(pad.l, Y(series.cl)); ctx.lineTo(w - pad.r, Y(series.cl)); ctx.stroke();
      ctx.fillStyle = P.blue; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('CL ' + SPC.fmt3(series.cl), pad.l + 3, Y(series.cl) - 2);
    }

    const badSet = new Set(violations.filter(v => v.level === 'bad').map(v => v.idx));
    const warnSet = new Set(violations.filter(v => v.level === 'warn').map(v => v.idx));

    ctx.strokeStyle = P.line; ctx.lineWidth = 1.8;
    ctx.beginPath();
    pts.forEach((p, i) => { const x = X(i), y = Y(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.stroke();

    const r = Math.min(4, Math.max(2.2, 14 / Math.sqrt(n)));
    pts.forEach((p, i) => {
      const x = X(i), y = Y(p);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      if (badSet.has(i)) { ctx.fillStyle = P.red; }
      else if (warnSet.has(i)) { ctx.fillStyle = P.warn; }
      else { ctx.fillStyle = P.line; }
      ctx.fill();
      if (badSet.has(i)) { ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.5; ctx.stroke(); }
    });

    if (overlay && overlay.points && overlay.points.length) {
      const col = overlay.color || '#f59e0b';
      ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.setLineDash([]);
      ctx.beginPath();
      overlay.points.forEach((p, i) => {
        if (i >= n) return;
        const x = X(i), y = Y(p);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke();
      overlay.points.forEach((p, i) => {
        if (i >= n) return;
        ctx.beginPath(); ctx.arc(X(i), Y(p), r, 0, Math.PI * 2);
        ctx.fillStyle = col; ctx.fill();
      });
      ctx.fillStyle = col; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      ctx.fillText('● ' + (overlay.title || 'overlay'), w - pad.r, pad.t);
    }

    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('1', X(0), h - pad.b + 6);
    if (n > 1) ctx.fillText(String(n), X(n - 1), h - pad.b + 6);
    ctx.fillStyle = P.label;
    ctx.fillText(typeof t === 'function' ? t('chart.xlab') : 'Sample / Subgroup #', w / 2, h - 16);

    // y-axis title (rotated left side)
    let yTitle = (series.title || '').replace(/\s*\(.*?\)/, '').trim();
    if (series.titleKey && typeof t === 'function') {
      const tr = t(series.titleKey, series.titleParams);
      if (tr && tr !== series.titleKey) yTitle = tr.replace(/\s*\(.*?\)/, '').trim();
    }
    if (yTitle) {
      ctx.save();
      ctx.translate(11, pad.t + (h - pad.t - pad.b) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = P.label;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(yTitle, 0, 0);
      ctx.restore();
    }
    return { X, Y };
  }

  function drawHistogram(canvas, values, { lsl, usl }) {
    const P = palette();
    const H = 240;
    const { ctx, w, h } = setupCanvas(canvas, H);
    const pad = { l: 36, r: 12, t: 14, b: 34 };
    if (!values.length) return;

    const min = Math.min(...values, Number.isFinite(lsl) ? lsl : Infinity);
    const max = Math.max(...values, Number.isFinite(usl) ? usl : -Infinity);
    const m = SPC.mean(values);
    const sd = SPC.stdev(values) || (max - min) / 4 || 1;
    const lo = Math.min(min, Number.isFinite(lsl) ? lsl : min) - sd * 0.5;
    const hi = Math.max(max, Number.isFinite(usl) ? usl : max) + sd * 0.5;
    const nbins = Math.max(6, Math.min(20, Math.ceil(Math.sqrt(values.length) * 1.5)));
    const bw = (hi - lo) / nbins;
    const bins = new Array(nbins).fill(0);
    values.forEach(v => {
      let b = Math.floor((v - lo) / bw);
      if (b < 0) b = 0; if (b >= nbins) b = nbins - 1;
      bins[b]++;
    });
    const maxBin = Math.max(...bins, 1);

    const X = v => pad.l + ((v - lo) / (hi - lo)) * (w - pad.l - pad.r);
    const Y = c => pad.t + (1 - c / maxBin) * (h - pad.t - pad.b);

    ctx.clearRect(0, 0, w, h);
    ctx.font = '10px sans-serif';

    const barW = (w - pad.l - pad.r) / nbins;
    ctx.fillStyle = P.bar;
    ctx.strokeStyle = P.line; ctx.lineWidth = 1;
    bins.forEach((c, i) => {
      const x = pad.l + i * barW;
      ctx.fillRect(x + 0.5, Y(c), barW - 1, h - pad.b - Y(c));
      ctx.strokeRect(x + 0.5, Y(c), barW - 1, h - pad.b - Y(c));
    });

    const drawCurve = (mu, s, color) => {
      ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const x = lo + (hi - lo) * i / 100;
        const y = maxBin * Math.exp(-0.5 * ((x - mu) / s) ** 2);
        const px = X(x), py = Y(y);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    };
    drawCurve(m, sd, P.blue);
    drawCurve(m, SPC.mean(values.map(v => Math.abs(v - m))) * 1.253, '#f59e0b');

    const drawSpec = (v, label) => {
      if (!Number.isFinite(v)) return;
      const x = X(v);
      ctx.strokeStyle = P.red; ctx.lineWidth = 2; ctx.setLineDash([5, 3]);
      ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, h - pad.b); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = P.redTxt; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(label + ' ' + SPC.fmt3(v), x, pad.t + 10);
    };
    drawSpec(lsl, 'LSL');
    drawSpec(usl, 'USL');

    ctx.strokeStyle = P.blue; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(m), pad.t); ctx.lineTo(X(m), h - pad.b); ctx.stroke();

    ctx.fillStyle = P.label; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(SPC.fmt3(lo), pad.l, h - pad.b + 5);
    ctx.fillText(SPC.fmt3(hi), w - pad.r, h - pad.b + 5);
    ctx.fillText('— blue: overall fit · orange: within —', w / 2, h - 16);
  }

  function drawPareto(canvas, pareto) {
    const P = palette();
    const items = pareto.items;
    if (!items.length) return;
    const H = 260;
    const { ctx, w, h } = setupCanvas(canvas, H);
    const pad = { l: 38, r: 38, t: 16, b: 64 };
    const k = items.length;
    const maxCount = Math.max(...items.map(i => i.count)) || 1;
    const bw = (w - pad.l - pad.r) / k;
    const Yc = v => pad.t + (1 - v / maxCount) * (h - pad.t - pad.b);
    const Yp = p => pad.t + (1 - p / 100) * (h - pad.t - pad.b);

    ctx.clearRect(0, 0, w, h);
    ctx.font = '10px sans-serif';

    for (let i = 0; i <= 4; i++) {
      const v = (maxCount / 4) * i;
      const y = Yc(v);
      ctx.strokeStyle = P.grid; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.fillStyle = P.label; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(String(Math.round(v)), pad.l - 4, y);
      ctx.fillStyle = P.amberTxt; ctx.textAlign = 'left';
      ctx.fillText((i * 25) + '%', w - pad.r + 4, y);
    }

    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(pad.l, Yp(80)); ctx.lineTo(w - pad.r, Yp(80)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = P.warn; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('80%', pad.l + 2, Yp(80) - 2);

    items.forEach((it, i) => {
      const x = pad.l + i * bw;
      const y = Yc(it.count);
      ctx.fillStyle = i <= pareto.vitalIdx ? '#14b8a6' : P.nonvital;
      ctx.fillRect(x + 2, y, bw - 4, h - pad.b - y);
      ctx.strokeStyle = P.line; ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, y, bw - 4, h - pad.b - y);
      if (k <= 12) {
        ctx.fillStyle = P.onBar; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(String(it.count), x + bw / 2, y - 2);
      }
      ctx.save();
      ctx.translate(x + bw / 2, h - pad.b + 6);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = P.catLbl; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      const lbl = it.label.length > 16 ? it.label.slice(0, 15) + '…' : it.label;
      ctx.fillText(lbl, 0, 0);
      ctx.restore();
    });

    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
    ctx.beginPath();
    items.forEach((it, i) => {
      const x = pad.l + i * bw + bw / 2, y = Yp(it.cumPct);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
    items.forEach((it, i) => {
      const x = pad.l + i * bw + bw / 2, y = Yp(it.cumPct);
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b'; ctx.fill();
    });

    ctx.fillStyle = P.label;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('■ count (bars)   ● cumulative % (line)', w / 2, h - 4);
  }

  return { drawControlChart, drawHistogram, drawPareto, setupCanvas };
})();
