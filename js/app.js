(() => {
  const $ = id => document.getElementById(id);
  const fmt = SPC.fmt3;
  const esc = v => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  // ---------- Language ----------
  (function initLang() {
    const saved = localStorage.getItem('spcLang');
    window.SPC_LANG = (saved && LANGS[saved]) ? saved : 'en';
  })();

  function applyStaticI18n() {
    document.documentElement.lang = window.SPC_LANG;
    document.documentElement.dir = LANG_DIR[window.SPC_LANG] || 'ltr';
    document.title = t('title');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (el.tagName === 'OPTGROUP') { el.label = t(el.dataset.i18n); return; }
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.dataset.i18nTitle);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
  }

  function buildLessons() {
    const lang = window.SPC_LANG;
    let base = null;
    if (lang === 'ar' && typeof TRANS_AR !== 'undefined') base = TRANS_AR.lessons;
    else if (lang === 'hi' && typeof TRANS_HI !== 'undefined') base = TRANS_HI.lessons;
    else if (lang === 'bn' && typeof TRANS_BN !== 'undefined') base = TRANS_BN.lessons;
    const enAll = orderLessons([...LESSONS, ...ADVANCED_LESSONS, MSA_LESSON]);
    if (!base) return enAll;
    // All lessons are translated in every language now, so nothing is appended.
    // Add a title here if a future EN-only lesson must be shown in all languages.
    const EN_ONLY_TITLES = [];
    const missing = enAll.filter(l => EN_ONLY_TITLES.includes(l.title));
    return missing.length ? base.concat(missing) : base;
  }

  function buildQuiz() {
    const en = QUIZ;
    let base = en;
    const lang = window.SPC_LANG;
    if (lang === 'ar' && typeof TRANS_AR !== 'undefined') base = TRANS_AR.quiz;
    else if (lang === 'hi' && typeof TRANS_HI !== 'undefined') base = TRANS_HI.quiz;
    else if (lang === 'bn' && typeof TRANS_BN !== 'undefined') base = TRANS_BN.quiz;
    // Top up translated sets with the English ASQ bank so every language gets the full set.
    if (base.length < en.length) base = base.concat(en.slice(base.length));
    return base;
  }

  function violationText(v) {
    if (v.rule === 'C+') return t('cusum.plus', v.params || {});
    if (v.rule === 'C−') return t('cusum.minus', v.params || {});
    if (v.params) {
      const p = Object.assign({}, v.params);
      if (p.side) p.side = t('side.' + p.side);
      if (p.dir) p.dir = t('dir.' + p.dir);
      const key = 'rule.' + v.rule;
      const txt = t(key, p);
      if (txt !== key) return txt;
    }
    return v.msg;
  }

  function chartTitleOf(series) {
    if (!series) return '';
    if (series.titleKey === 'ctitle.ewma' && series.titleParams)
      return `${t('ctitle.ewma')} (λ = ${series.titleParams.lambda}, L = ${series.titleParams.L})`;
    if (series.titleKey === 'ctitle.cusum' && series.titleParams)
      return `${t('ctitle.cusum')} (k = ${series.titleParams.k}, h = ${series.titleParams.h})`;
    if (series.titleKey) {
      let s = t(series.titleKey);
      if (series.overdispersed) s += t('ctitle.overdisp');
      return s;
    }
    return series.title;
  }

  function gageComponentKey(label) {
    if (label.startsWith('Repeat')) return 'gcomp.repeat';
    if (label.startsWith('Reproducibility')) return 'gcomp.repro';
    if (label.startsWith('Parts')) return 'gcomp.parts';
    if (label === 'Gage R&R') return 'gcomp.grr';
    if (label.startsWith('Total')) return 'gcomp.total';
    return null;
  }

  // ---------- Tabs ----------
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $('tab-' + btn.dataset.tab).classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // ---------- Lessons ----------
  let allLessons = buildLessons();
  let lessonIdx = Math.min(parseInt(localStorage.getItem('spcLesson') || '0', 10), allLessons.length - 1);
  if (!Number.isFinite(lessonIdx)) lessonIdx = 0;

  function renderLesson() {
    if (lessonIdx >= allLessons.length) lessonIdx = allLessons.length - 1;
    const L = allLessons[lessonIdx];
    $('lessonCard').innerHTML = `<h2>${L.title}</h2>${L.body}`;
    // Inject rule detail into translated Nelson lessons that only have short lines.
    const nelsonList = $('lessonCard').querySelector('.nelson-rules');
    if (nelsonList && !nelsonList.querySelector('.rule-detail') && typeof NELSON_RULES !== 'undefined') {
      const isEn = window.SPC_LANG === 'en';
      const items = nelsonList.querySelectorAll('li');
      items.forEach((li, i) => {
        const r = NELSON_RULES[i];
        if (!r) return;
        li.classList.add('nelson-rule');
        if (isEn) {
          li.innerHTML = `
          <div class="rule-head"><b>Rule ${r.id}:</b> ${r.title}</div>
          ${NELSON_DIAG[r.id - 1] || ''}
          <div class="rule-detail">
            <div class="rule-block"><span class="rule-lbl">Pattern</span> ${r.pattern}</div>
            <div class="rule-block"><span class="rule-lbl">What it means</span> ${r.means}</div>
            <div class="rule-block"><span class="rule-lbl">Why it matters</span> ${r.why}</div>
            <div class="rule-block rule-howto"><span class="rule-lbl">How to investigate</span> ${r.how}</div>
            <div class="rule-action"><span class="rule-lbl">Action</span> ${r.action}</div>
          </div>`;
        } else {
          // Keep the translated line + diagram; append translated why/action detail.
          li.insertAdjacentHTML('beforeend', `
          <div class="rule-detail">
            <div class="rule-block"><span class="rule-lbl">${t('rule.whyLbl')}</span> ${t('rule.why.' + r.id)}</div>
            <div class="rule-action"><span class="rule-lbl">${t('rule.action')}</span> ${t('rule.act.' + r.id)}</div>
          </div>`);
        }
      });
    }
    $('lessonProgress').textContent = `${lessonIdx + 1} / ${allLessons.length}`;
    $('lessonDots').innerHTML = allLessons.map((_, i) =>
      `<span class="${i === lessonIdx ? 'active' : ''}" data-i="${i}"></span>`).join('');
    $('lessonDots').querySelectorAll('span').forEach(s => {
      s.addEventListener('click', () => { lessonIdx = +s.dataset.i; renderLesson(); });
    });
    localStorage.setItem('spcLesson', String(lessonIdx));
  }
  $('prevLesson').addEventListener('click', () => { if (lessonIdx > 0) { lessonIdx--; renderLesson(); } });
  $('nextLesson').addEventListener('click', () => { if (lessonIdx < allLessons.length - 1) { lessonIdx++; renderLesson(); } });
  renderLesson();

  // ---------- Worksheet engine ----------
  function createSheet({ table, sizeEl, headers, rowCount, minCols = 1, maxCols = 20, minRows = 1 }) {
    let focusedRow = null;
    const state = {
      headers: [...headers],
      rows: Array.from({ length: rowCount }, () => new Array(headers.length).fill(''))
    };

    function render() {
      const thead = '<tr><th class="rownum">#</th>' +
        state.headers.map(h => `<th>${esc(h)}</th>`).join('') + '</tr>';
      const tbody = state.rows.map((row, r) => {
        const tds = row.map((v, c) =>
          `<td><input type="text" inputmode="decimal" data-r="${r}" data-c="${c}" value="${esc(v)}"></td>`).join('');
        return `<tr><td class="rownum">${r + 1}</td>${tds}</tr>`;
      }).join('');
      table.innerHTML = `<thead>${thead}</thead><tbody>${tbody}</tbody>`;
      if (sizeEl) sizeEl.textContent = `${state.headers.length} × ${state.rows.length}`;
    }

    table.addEventListener('input', e => {
      const el = e.target;
      if (el.tagName !== 'INPUT') return;
      state.rows[+el.dataset.r][+el.dataset.c] = el.value;
    });

    table.addEventListener('focusin', e => {
      if (e.target.tagName === 'INPUT') focusedRow = +e.target.dataset.r;
    });

    function focusCell(r, c) {
      const cell = table.querySelector(`input[data-r="${r}"][data-c="${c}"]`);
      if (cell) { cell.focus(); cell.select(); }
    }

    table.addEventListener('keydown', e => {
      const el = e.target;
      if (el.tagName !== 'INPUT') return;
      const r = +el.dataset.r, c = +el.dataset.c;

      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (r === state.rows.length - 1) addRow();
        focusCell(r + 1, c);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (r > 0) focusCell(r - 1, c);
        return;
      }
      if (e.key === 'ArrowLeft' && el.selectionStart === 0 && el.selectionEnd === 0) {
        e.preventDefault();
        if (c > 0) focusCell(r, c - 1);
        return;
      }
      if (e.key === 'ArrowRight' && el.selectionStart === el.value.length && el.selectionEnd === el.value.length) {
        e.preventDefault();
        if (c < state.headers.length - 1) focusCell(r, c + 1);
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        let nr = r, nc = c + (e.shiftKey ? -1 : 1);
        if (nc >= state.headers.length) { nr = r + 1; nc = 0; }
        if (nc < 0) { nr = r - 1; nc = state.headers.length - 1; }
        if (nr >= state.rows.length) addRow();
        if (nr >= 0) focusCell(nr, nc);
      }
    });

    function addRow() {
      state.rows.push(new Array(state.headers.length).fill(''));
      render();
    }

    function delRow() {
      if (state.rows.length <= minRows) return;
      const r = focusedRow !== null && focusedRow < state.rows.length ? focusedRow : state.rows.length - 1;
      state.rows.splice(r, 1);
      focusedRow = null;
      render();
    }

    function addCol() {
      if (state.headers.length >= maxCols) return;
      state.headers.push('V' + (state.headers.length + 1));
      state.rows.forEach(row => row.push(''));
      render();
    }

    function delCol() {
      if (state.headers.length <= minCols) return;
      state.headers.pop();
      state.rows.forEach(row => row.pop());
      render();
    }

    function setHeaders(newHeaders) {
      state.headers = [...newHeaders];
      state.rows.forEach(row => {
        while (row.length < state.headers.length) row.push('');
        row.length = state.headers.length;
      });
      render();
    }

    function reset(headers, rowCount) {
      state.headers = [...headers];
      state.rows = Array.from({ length: rowCount }, () => new Array(headers.length).fill(''));
      focusedRow = null;
      render();
    }

    function setRows(data, padCols) {
      const ncol = padCols || Math.max(state.headers.length, ...data.map(r => r.length));
      state.rows = data.map(r => {
        const row = r.map(v => v === null || v === undefined ? '' : String(v));
        while (row.length < ncol) row.push('');
        return row.slice(0, ncol);
      });
      while (state.rows.length < minRows) state.rows.push(new Array(ncol).fill(''));
      state.headers = Array.from({ length: ncol }, (_, i) => state.headers[i] || 'V' + (i + 1));
      focusedRow = null;
      render();
    }

    function getRawRows() {
      return state.rows.map(row => row.map(v => String(v).trim()));
    }

    function getNumberRows() {
      const rows = [];
      getRawRows().forEach((row, ri) => {
        const vals = [];
        row.forEach((v, ci) => {
          if (v === '') return;
          const num = Number(v);
          if (!Number.isFinite(num))
            throw new Error(t('err.notNumber', { row: ri + 1, col: state.headers[ci] || ci + 1, val: v }));
          vals.push(num);
        });
        if (vals.length) rows.push(vals);
      });
      return rows;
    }

    function isEmpty() {
      return getRawRows().every(row => row.every(v => v === ''));
    }

    function clearValues() {
      state.rows.forEach(row => row.fill(''));
      render();
    }

    render();
    return {
      addRow, delRow, addCol, delCol, setHeaders, reset, setRows,
      getNumberRows, isEmpty, clearValues, getRows: getRawRows,
      get headers() { return state.headers; }
    };
  }

  // ---------- Sheet header translation ----------
  const COL_KEYS = {
    'Value': 'col.value', 'Defectives': 'col.defectives', 'Sample n': 'col.sampleN',
    'Defects': 'col.defects', 'Units': 'col.units', 'Measurement': 'col.measurement',
    'Part': 'col.part', 'Op': 'col.op', 'Defect type': 'col.defectType', 'Count': 'col.count'
  };
  const COL_REV = {};
  Object.keys(LANGS).forEach(lang => {
    Object.keys(COL_KEYS).forEach(en => {
      const v = I18N[lang] && I18N[lang][COL_KEYS[en]];
      if (v) COL_REV[v] = COL_KEYS[en];
    });
  });
  function trHeader(h) {
    if (COL_KEYS[h]) return t(COL_KEYS[h]);
    if (COL_REV[h]) return t(COL_REV[h]);
    return h;
  }
  const trHeaders = hs => hs.map(trHeader);

  // ---------- Chart analysis ----------
  const chartType = $('chartType');
  const SHEET_CONFIGS = {
    'xbar-r': { headers: ['V1', 'V2', 'V3', 'V4', 'V5'], rows: 12, cols: true, minCols: 2, maxCols: 10, hintKey: 'hint.xbar-r' },
    'xbar-s': { headers: ['V1', 'V2', 'V3', 'V4', 'V5'], rows: 12, cols: true, minCols: 2, maxCols: 25, hintKey: 'hint.xbar-s' },
    'i-mr': { headers: ['Value'], rows: 15, cols: false, minCols: 1, maxCols: 1, hintKey: 'hint.i-mr' },
    p: { headers: ['Defectives', 'Sample n'], rows: 12, cols: false, minCols: 2, maxCols: 2, hintKey: 'hint.p' },
    np: { headers: ['Defectives', 'Sample n'], rows: 12, cols: false, minCols: 2, maxCols: 2, hintKey: 'hint.np' },
    c: { headers: ['Defects'], rows: 12, cols: false, minCols: 1, maxCols: 1, hintKey: 'hint.c' },
    u: { headers: ['Defects', 'Units'], rows: 12, cols: false, minCols: 2, maxCols: 2, hintKey: 'hint.u' },
    ewma: { headers: ['Value'], rows: 15, cols: false, minCols: 1, maxCols: 1, hintKey: 'hint.ewma' },
    cusum: { headers: ['Value'], rows: 15, cols: false, minCols: 1, maxCols: 1, hintKey: 'hint.cusum' },
    'laney-p': { headers: ['Defectives', 'Sample n'], rows: 12, cols: false, minCols: 2, maxCols: 2, hintKey: 'hint.laney-p' },
    'laney-u': { headers: ['Defects', 'Units'], rows: 12, cols: false, minCols: 2, maxCols: 2, hintKey: 'hint.laney-u' }
  };

  const PARAM_CONFIG = {
    ewma: { show: ['paramLambdaWrap', 'paramLWrap'], helpKey: 'param.helpEwma' },
    cusum: { show: ['paramKWrap', 'paramHWrap'], helpKey: 'param.helpCusum' }
  };

  const sheet = createSheet({
    table: $('dataSheet'),
    sizeEl: $('sheetSize'),
    headers: trHeaders(SHEET_CONFIGS['xbar-r'].headers),
    rowCount: SHEET_CONFIGS['xbar-r'].rows,
    minCols: 2, maxCols: 10
  });

  function applySheetConfig(resetData = true) {
    const cfg = SHEET_CONFIGS[chartType.value];
    $('dataHint').textContent = t(cfg.hintKey);
    $('dataHint').dataset.i18n = cfg.hintKey;
    $('btnAddCol').hidden = !cfg.cols;
    $('btnDelCol').hidden = !cfg.cols;
    if (resetData) sheet.reset(trHeaders(cfg.headers), cfg.rows);

    ['paramLambdaWrap', 'paramLWrap', 'paramKWrap', 'paramHWrap'].forEach(id => { $(id).hidden = true; });
    const pc = PARAM_CONFIG[chartType.value];
    $('paramRow').hidden = !pc;
    $('paramHelp').hidden = !pc;
    if (pc) {
      pc.show.forEach(id => { $(id).hidden = false; });
      $('paramHelp').textContent = t(pc.helpKey);
    }
  }

  chartType.addEventListener('change', () => applySheetConfig(true));
  applySheetConfig();

  $('btnAddRow').addEventListener('click', () => sheet.addRow());
  $('btnDelRow').addEventListener('click', () => sheet.delRow());
  $('btnAddCol').addEventListener('click', () => sheet.addCol());
  $('btnDelCol').addEventListener('click', () => sheet.delCol());
  $('btnReset').addEventListener('click', () => sheet.clearValues());

  // ---------- Demo data generator ----------
  const gauss = () => {
    let u = 0, v = 0;
    while (!u) u = Math.random();
    while (!v) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const FLAT_TYPES = ['i-mr', 'c', 'ewma', 'cusum'];

  function generatePattern(type, pattern) {
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    if (type === 'xbar-r' || type === 'xbar-s') {
      const k = 12, n = 5, mu = 100, sd = 1.5, sx = sd / Math.sqrt(n);
      const halfUCL = 0.577 * 2.3 * sd;
      return Array.from({ length: k }, (_, i) => {
        let off = 0;
        if (pattern === 'shift' && i >= 5) off = halfUCL * 1.2;
        else if (pattern === 'trend') off = i * 0.5;
        else if (pattern === 'cycle') off = 2 * Math.sin(2 * Math.PI * i / 6);
        else if (pattern === 'mixture') off = (i % 2 ? 2.4 : -2.4);
        const center = mu + off + gauss() * sx;
        return Array.from({ length: n }, () => +(center + gauss() * sd).toFixed(3));
      });
    }
    if (FLAT_TYPES.includes(type)) {
      const k = 25, mu = 100, sd = 2;
      return Array.from({ length: k }, (_, i) => {
        let off = 0;
        if (pattern === 'shift' && i >= 18) off = 6;
        else if (pattern === 'trend') off = i * 0.45;
        else if (pattern === 'cycle') off = 3.5 * Math.sin(2 * Math.PI * i / 8);
        else if (pattern === 'mixture') off = (i % 2 ? 6 : -6);
        return [+(mu + off + gauss() * sd).toFixed(3)];
      });
    }
    if (type === 'p' || type === 'np') {
      const k = 12, nS = 50;
      return Array.from({ length: k }, (_, i) => {
        let p = 0.06;
        if (pattern === 'shift' && i >= 6) p = 0.22;
        else if (pattern === 'trend') p = 0.03 + i * 0.015;
        else if (pattern === 'cycle') p = 0.06 + 0.06 * Math.sin(2 * Math.PI * i / 6);
        else if (pattern === 'mixture') p = (i % 2 ? 0.17 : 0.01);
        p = clamp(p, 0, 0.95);
        const c = clamp(Math.round(nS * p + gauss() * Math.sqrt(nS * p * (1 - p))), 0, nS);
        return [c, nS];
      });
    }
    if (type === 'c' || type === 'u') {
      const k = 15, units = 20;
      return Array.from({ length: k }, (_, i) => {
        let lam = 4;
        if (pattern === 'shift' && i >= 7) lam = 9;
        else if (pattern === 'trend') lam = 2 + i * 0.5;
        else if (pattern === 'cycle') lam = 4 + 3 * Math.sin(2 * Math.PI * i / 6);
        else if (pattern === 'mixture') lam = (i % 2 ? 8 : 1);
        lam = Math.max(0.3, lam);
        const c = clamp(Math.round(lam + gauss() * Math.sqrt(lam)), 0, 999);
        return type === 'u' ? [c, units] : [c];
      });
    }
    return null;
  }

  document.querySelectorAll('.chip.gen').forEach(btn => {
    btn.addEventListener('click', () => {
      const rows = generatePattern(chartType.value, btn.dataset.pattern);
      if (!rows) { alert(t('err.demoNA')); return; }
      sheet.setRows(rows);
    });
  });

  const SAMPLE_FALLBACK = { 'xbar-s': 'xbar-r', ewma: 'i-mr', cusum: 'i-mr', 'laney-p': 'p', 'laney-u': 'u' };

  function fillSheetFromText(text) {
    const type = chartType.value;
    let rows;
    if (FLAT_TYPES.includes(type)) rows = SPC.parseNumbers(text).map(v => [v]);
    else rows = SPC.parseSubgroups(text);
    if (!rows.length) throw new Error(t('err.text'));
    sheet.setRows(rows);
  }

  $('btnSample').addEventListener('click', () => {
    const type = chartType.value;
    const data = SAMPLE_DATA[type] || SAMPLE_DATA[SAMPLE_FALLBACK[type]] || SAMPLE_DATA['xbar-r'];
    try { fillSheetFromText(data); }
    catch (err) { alert(err.message); }
  });

  $('btnImport').addEventListener('click', () => $('fileInput').click());
  $('fileInput').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        fillSheetFromText(reader.result);
        $('dataPaste').value = reader.result;
      } catch (err) { alert(err.message); }
    };
    reader.readAsText(f);
    e.target.value = '';
  });

  $('btnPasteLoad').addEventListener('click', () => {
    try { fillSheetFromText($('dataPaste').value); }
    catch (err) { alert(err.message); }
  });

  let lastModel = null;

  function renderModel(model, rows) {
    lastModel = { model, rows };
    let violations;
    if (model.customViolations) {
      violations = model.customViolations;
    } else {
      violations = SPC.nelsonViolations(model.primary.points, model.primary);
      if (model.primary.onlyRule1) violations = violations.filter(v => v.rule === 1);
    }

    $('resultCard').hidden = false;
    $('chartTitle').textContent = chartTitleOf(model.primary);
    const badge = $('statusBadge');
    const bad = violations.filter(v => v.level === 'bad');
    badge.textContent = bad.length ? t('sig.bad', { n: bad.length }) : t('sig.ok');
    badge.className = 'badge ' + (bad.length ? 'bad' : 'ok');

    $('statsGrid').innerHTML = model.stats.map(([l, v]) =>
      `<div class="stat"><div class="val">${typeof v === 'number' ? fmt(v) : v}</div><div class="lbl">${tStat(l)}</div></div>`).join('');

    Chart.drawControlChart($('mainChart'), model.primary, violations, model.overlay || null);

    if (model.secondary) {
      $('mrCard').hidden = false;
      $('mrTitle').textContent = chartTitleOf(model.secondary);
      const secViol = SPC.nelsonViolations(model.secondary.points, model.secondary);
      Chart.drawControlChart($('mrChart'), model.secondary, secViol);
    } else {
      $('mrCard').hidden = true;
    }

    $('violationsCard').hidden = false;
    $('violationList').innerHTML = violations.length
      ? violations.map(v => {
          const n = +v.rule;
          const R = (typeof NELSON_RULES !== 'undefined' && n >= 1 && n <= 8) ? NELSON_RULES[n - 1] : null;
          const isEn = window.SPC_LANG === 'en';
          const lbl = t('rule.lbl', { n: v.rule });
          const title = R ? `${lbl} — ${isEn ? R.title : t('rule.title.' + n)}` : lbl;
          let act;
          if (R) {
            act = isEn ? R.action : t('rule.act.' + n);
          } else {
            const k = 'rule.act.' + v.rule;
            const tr = t(k);
            act = tr !== k ? tr : '';
          }
          const why = R ? (isEn ? R.why : t('rule.why.' + n)) : '';
          return `<li class="${v.level === 'warn' ? 'warn-only' : ''}">
            <div class="viol-title">${title}</div>
            <div class="viol-what">${violationText(v)}</div>
            ${R ? `<div class="viol-why"><b>${isEn ? 'Why:' : t('rule.whyLbl') + ':'}</b> ${why}</div>` : ''}
            ${act ? `<div class="rule-action"><span class="rule-lbl">${t('rule.action')}</span> ${act}</div>` : ''}
          </li>`;
        }).join('')
      : `<li class="warn-only">${t('rule.none')}</li>`;

    if (capSheet.isEmpty()) {
      const flat = rows.map(r => r.length === 1 ? [r[0]] : r);
      capSheet.setRows(flat);
    }
  }

  $('btnAnalyze').addEventListener('click', () => {
    try {
      const type = chartType.value;
      let rows = sheet.getNumberRows();
      if (!rows.length) throw new Error(t('err.noData'));
      if (type === 'i-mr' && rows.length < 3) throw new Error(t('err.imr3'));
      if (type === 'ewma' && rows.length < 8) throw new Error(t('err.ewma8'));
      if (type === 'cusum' && rows.length < 8) throw new Error(t('err.cusum8'));
      if (!['i-mr', 'c', 'ewma', 'cusum'].includes(type) && rows.length < 2)
        throw new Error(t('err.twoRows'));

      if (type === 'p' || type === 'np' || type === 'laney-p') {
        const missingN = rows.some(r => r.length < 2);
        if (missingN) {
          const nStr = prompt(t('err.promptN'), '50');
          if (!nStr || !Number.isFinite(+nStr) || +nStr <= 0) throw new Error(t('err.promptN2'));
          rows = rows.map(r => [r[0], +nStr]);
        }
      }
      if (type === 'u' || type === 'laney-u') {
        rows = rows.map(r => r.length > 1 ? [r[0], r[1]] : [r[0], 1]);
      }
      if (type === 'xbar-r' || type === 'xbar-s') {
        const sizes = rows.map(r => r.length);
        if (new Set(sizes).size > 1)
          throw new Error(t('err.equalSub'));
      }

      const opts = {
        lambda: $('paramLambda').value,
        L: $('paramL').value,
        k: $('paramK').value,
        h: $('paramH').value
      };
      renderModel(SPC.build(type, rows, opts), rows);
      $('resultCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      alert(err.message);
    }
  });

  // ---------- Capability ----------
  let lastCap = null;
  let lastCapCalc = null;
  const capSheet = createSheet({
    table: $('capSheet'),
    sizeEl: $('capSheetSize'),
    headers: trHeaders(['Measurement']),
    rowCount: 15,
    minCols: 1, maxCols: 1, minRows: 2
  });

  $('btnCapAddRow').addEventListener('click', () => capSheet.addRow());
  $('btnCapDelRow').addEventListener('click', () => capSheet.delRow());
  $('btnCapClear').addEventListener('click', () => capSheet.clearValues());
  $('btnCapReset').addEventListener('click', () => capSheet.clearValues());

  $('btnCapSample').addEventListener('click', () => {
    const vals = SPC.parseNumbers(SAMPLE_DATA.cap).map(v => [v]);
    capSheet.setRows(vals);
    $('lsl').value = '4.90';
    $('target').value = '5.00';
    $('usl').value = '5.10';
  });

  function renderCapability(calc) {
    const { values, lsl, usl } = calc;
    const r = SPC.capability(values, { lsl, usl, target: NaN });
    $('capResult').hidden = false;
    Chart.drawHistogram($('capChart'), values, { lsl, usl });

    const cell = (v, lbl) => `<div class="stat"><div class="val">${v === undefined || v === null || !Number.isFinite(v) ? '—' : v.toFixed(3)}</div><div class="lbl">${lbl}</div></div>`;
    $('capGrid').innerHTML = [
      cell(r.Cp, 'Cp'), cell(r.Cpk, 'Cpk'),
      cell(r.Pp, 'Pp'), cell(r.Ppk, 'Ppk'),
      cell(r.mean, t('cap.mean')), cell(r.sdWithin, t('stats.σ within')),
      cell(r.sdOverall, t('stats.σ overall')), cell(r.n, 'n')
    ].join('') + (Number.isFinite(r.ppms.total)
      ? `<div class="stat"><div class="val">${r.ppms.total < 1 ? r.ppms.total.toFixed(1) : Math.round(r.ppms.total)}</div><div class="lbl">${t('stats.Est. PPM out')}</div></div>` : '')
     + (r.sigmaLevel ? `<div class="stat"><div class="val">${r.sigmaLevel.toFixed(2)}σ</div><div class="lbl">${t('stats.Sigma level')}</div></div>` : '');

    const verdict = $('capVerdict');
    const cpk = r.Cpk;
    if (!Number.isFinite(cpk)) {
      verdict.textContent = t('v.needBoth');
      verdict.className = 'verdict warn';
    } else if (cpk < 1) {
      const why = Math.abs(r.Cp - cpk) > 0.3 ? t('v.offCenter') : t('v.reduceVar');
      verdict.textContent = t('v.bad', { cpk: cpk.toFixed(2), why });
      verdict.className = 'verdict bad';
    } else if (cpk < 1.33) {
      verdict.textContent = t('v.margin', { cpk: cpk.toFixed(2) });
      verdict.className = 'verdict warn';
    } else {
      verdict.textContent = t('v.ok', { cpk: cpk.toFixed(2) });
      verdict.className = 'verdict ok';
    }
    const ad = SPC.andersonDarling(values);
    const ci = SPC.capabilityCI(values, { lsl, usl });
    $('normCard').hidden = false;
    if (ad) {
      $('adResult').style.display = '';
      $('adResult').textContent = t(ad.normal ? 'ad.pass' : 'ad.fail', { a2: ad.A2.toFixed(3) });
      $('adResult').className = 'ad-result ' + (ad.normal ? 'ok' : 'bad');
    } else {
      $('adResult').style.display = '';
      $('adResult').textContent = t('ad.need5');
      $('adResult').className = 'ad-result ok';
    }
    const ciCell = (arr, lbl) => arr
      ? `<div class="stat"><div class="val">${arr[0].toFixed(3)}–${arr[1].toFixed(3)}</div><div class="lbl">${lbl}</div></div>`
      : '';
    $('ciGrid').innerHTML = ciCell(ci && ci.cp, t('ci.cp')) + ciCell(ci && ci.cpk, t('ci.cpk')) +
      `<div class="stat"><div class="val">${values.length}</div><div class="lbl">${t('ci.n')}</div></div>`;
    $('ciHint').textContent = ci ? t('ci.hint') : t('ci.need4');
    $('capTableBody').innerHTML = t('howto.table');
    return r;
  }

  $('btnCapCalc').addEventListener('click', () => {
    try {
      const values = capSheet.getNumberRows().map(r => r[0]);
      if (values.length < 2) throw new Error(t('err.capVals'));
      const lsl = $('lsl').value === '' ? NaN : parseFloat($('lsl').value);
      const usl = $('usl').value === '' ? NaN : parseFloat($('usl').value);
      if (!Number.isFinite(lsl) && !Number.isFinite(usl))
        throw new Error(t('err.lslUsl'));
      if (Number.isFinite(lsl) && Number.isFinite(usl) && usl <= lsl)
        throw new Error(t('err.order'));

      lastCapCalc = { values, lsl, usl };
      const r = renderCapability(lastCapCalc);
      lastCap = { values, lsl, usl, r };
      $('capResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      alert(err.message);
    }
  });

  // ---------- Tools: Gage R&R ----------
  const gageSheet = createSheet({
    table: $('gageSheet'),
    sizeEl: null,
    headers: trHeaders(['Part', 'Op', 'T1', 'T2']),
    rowCount: 15,
    minCols: 2, maxCols: 6, minRows: 2
  });

  let lastGageRes = null;

  function gageConfig() {
    return {
      parts: Math.min(20, Math.max(2, +$('gParts').value || 5)),
      ops: Math.min(5, Math.max(2, +$('gOps').value || 3)),
      trials: Math.min(3, Math.max(2, +$('gTrials').value || 2))
    };
  }

  function buildGageGrid(sample) {
    const { parts, ops, trials } = gageConfig();
    const headers = trHeaders(['Part', 'Op', ...Array.from({ length: trials }, (_, i) => 'T' + (i + 1))]);
    const rows = [];
    for (let p = 1; p <= parts; p++) {
      for (let o = 1; o <= ops; o++) {
        if (sample) {
          const trueVal = 97 + (p - 1) * 1.5 + (p % 3) * 0.4;
          const bias = (o - 1) * 0.07 - 0.07;
          rows.push([p, o, ...Array.from({ length: trials }, () => +(trueVal + bias + gauss() * 0.09).toFixed(3))]);
        } else {
          rows.push([p, o, ...Array.from({ length: trials }, () => '')]);
        }
      }
    }
    gageSheet.reset(headers, rows.length);
    gageSheet.setRows(rows);
    $('gageSheetWrap').hidden = false;
  }

  $('btnGSetup').addEventListener('click', () => buildGageGrid(false));
  $('btnGSample').addEventListener('click', () => buildGageGrid(true));

  function renderGage(res) {
    $('gageResult').hidden = false;
    $('gageBadge').textContent = `${t('badge.gage.' + res.verdict.cls)} · %GRR = ${res.grrPct.toFixed(1)}% · ndc = ${res.ndc}`;
    $('gageBadge').className = 'badge ' + res.verdict.cls;
    $('gageGrid').innerHTML = res.components.map(([label, v, sd]) =>
      `<div class="stat"><div class="val">${sd.toFixed(4)}</div><div class="lbl">${t(gageComponentKey(label) || label)}</div></div>`).join('') +
      `<div class="stat"><div class="val">${res.contributionPct.toFixed(1)}%</div><div class="lbl">${t('gstat.contrib')}</div></div>` +
      `<div class="stat"><div class="val">${res.ndc}</div><div class="lbl">${t('gstat.ndc')}</div></div>` +
      `<div class="stat"><div class="val">${res.parts}×${res.operators}×${res.trials}</div><div class="lbl">${t('gstat.study')}</div></div>`;
    const bars = [
      { key: 'bar.ev', pct: res.evPct, isPV: false },
      { key: 'bar.rv', pct: res.rvPct, isPV: false },
      { key: 'bar.grr', pct: res.grrPct, isPV: false },
      { key: 'bar.pv', pct: res.pvPct, isPV: true }
    ];
    $('gageBars').innerHTML = bars.map(b => {
      const cls = b.isPV ? (b.pct >= 50 ? 'good' : 'warn') : (b.pct <= 10 ? 'good' : b.pct <= 30 ? 'warn' : 'bad');
      return `<div class="gbar"><span>${t(b.key)}</span><div class="track"><div class="fill ${cls}" style="width:${Math.min(100, b.pct).toFixed(1)}%"></div></div><span class="num">${b.pct.toFixed(1)}%</span></div>`;
    }).join('');
    const reproKey = res.reproducibilityNote.includes('operator-to-operator') ? 'repro.op' : 'repro.int';
    $('gageNote').textContent = t('gage.note', { repro: t(reproKey) });
  }

  $('btnGCalc').addEventListener('click', () => {
    try {
      let rows = gageSheet.getRows();
      rows = rows.filter(r => r.some(v => v !== ''));
      if (!rows.length) throw new Error(t('err.gageData'));
      const res = SPC.gageRR(rows);
      lastGageRes = res;
      renderGage(res);
      $('gageResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) { alert(err.message); }
  });

  // ---------- Tools: Pareto ----------
  const parSheet = createSheet({
    table: $('parSheet'),
    sizeEl: $('parSheetSize'),
    headers: trHeaders(['Defect type', 'Count']),
    rowCount: 8,
    minCols: 2, maxCols: 2, minRows: 2
  });

  let lastParetoRes = null;

  $('btnParAddRow').addEventListener('click', () => parSheet.addRow());
  $('btnParDelRow').addEventListener('click', () => parSheet.delRow());
  $('btnParSample').addEventListener('click', () => {
    parSheet.setRows([['Wrong label', 67], ['Scratch', 45], ['Crack', 30], ['Dent', 12], ['Glue smear', 8], ['Missing print', 4]]);
  });

  function renderPareto(res) {
    $('parResult').hidden = false;
    Chart.drawPareto($('parChart'), res);
    const vital = res.items.slice(0, res.vitalIdx + 1);
    $('parGrid').innerHTML =
      `<div class="stat"><div class="val">${res.total}</div><div class="lbl">${t('par.total')}</div></div>` +
      `<div class="stat"><div class="val">${res.items.length}</div><div class="lbl">${t('par.cats')}</div></div>` +
      `<div class="stat"><div class="val">${vital.length}</div><div class="lbl">${t('par.vital')}</div></div>` +
      `<div class="stat"><div class="val">${vital.reduce((s, it) => s + it.count, 0)}</div><div class="lbl">${t('par.vitalDef')}</div></div>`;
  }

  $('btnParDraw').addEventListener('click', () => {
    try {
      const raw = parSheet.getRows().filter(r => r[0] !== '' || r[1] !== '');
      if (raw.length < 2) throw new Error(t('err.pareto2'));
      const res = SPC.pareto(raw);
      if (res.items.length < 2) throw new Error(t('err.paretoCounts'));
      lastParetoRes = res;
      renderPareto(res);
      $('parResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) { alert(err.message); }
  });

  // ---------- Tools: Cpk Planner ----------
  let lastPlanArgs = null;

  $('btnPlanFromCap').addEventListener('click', () => {
    if (!lastCap || !lastCap.values || lastCap.values.length < 2) {
      alert(t('err.capFirst'));
      return;
    }
    const r = SPC.capability(lastCap.values, { lsl: lastCap.lsl, usl: lastCap.usl, target: NaN });
    $('planMean').value = r.mean.toFixed(4);
    $('planSigma').value = r.sdWithin.toFixed(4);
    if (Number.isFinite(lastCap.lsl)) $('planLsl').value = lastCap.lsl;
    if (Number.isFinite(lastCap.usl)) $('planUsl').value = lastCap.usl;
    alert(t('plan.filled'));
  });

  function renderPlan(args) {
    const { m, sigma, lsl, usl, targetCpk: target } = args;
    const plan = SPC.cpkPlan({ mean: m, sigma, lsl, usl, targetCpk: target });
    let html = `<h4>${t('plan.now')}</h4>` +
      t('plan.current', { cpk: plan.current.toFixed(2), t: target.toFixed(2), s: sigma.toFixed(4), m: m.toFixed(4), c: ((lsl + usl) / 2).toFixed(4) });

    html += `<h4>${t('plan.optA')}</h4>`;
    if (plan.center.viable) {
      html += t('plan.optAok', {
        shift: (plan.center.shift >= 0 ? '+' : '') + plan.center.shift.toFixed(4),
        mean: plan.center.bestMean.toFixed(4),
        t: target.toFixed(2)
      });
    } else {
      const bestCpk = ((usl - lsl) / (6 * sigma)).toFixed(2);
      html += t('plan.optAno', { best: bestCpk, t: target.toFixed(2) });
    }

    html += `<h4>${t('plan.optB')}</h4>`;
    if (plan.reduceOnly.already) {
      html += t('plan.optBok');
    } else {
      html += t('plan.optBno', {
        now: sigma.toFixed(4),
        need: plan.reduceOnly.sigmaNeed.toFixed(4),
        pct: plan.reduceOnly.pct.toFixed(1)
      });
    }

    html += `<h4>${t('plan.optC')}</h4>`;
    const bothPct = plan.both.pct;
    if (bothPct === null) {
      html += t('plan.optCno');
    } else {
      html += t('plan.optCok', {
        center: ((lsl + usl) / 2).toFixed(4),
        need: plan.both.sigmaNeed.toFixed(4),
        pct: bothPct.toFixed(1)
      });
    }
    html += `<p style="margin-top:8px">${t('plan.rule')}</p>`;

    const pr = $('planResult');
    pr.hidden = false;
    pr.innerHTML = html;
  }

  $('btnPlan').addEventListener('click', () => {
    try {
      const m = parseFloat($('planMean').value);
      const sigma = parseFloat($('planSigma').value);
      const lsl = parseFloat($('planLsl').value);
      const usl = parseFloat($('planUsl').value);
      const target = parseFloat($('planTarget').value);
      if (![m, sigma, lsl, usl, target].every(Number.isFinite)) throw new Error(t('err.plannerFill'));
      if (sigma <= 0) throw new Error(t('err.plannerSigma'));
      if (usl <= lsl) throw new Error(t('err.order'));

      lastPlanArgs = { m, sigma, lsl, usl, targetCpk: target };
      renderPlan(lastPlanArgs);
      $('planResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) { alert(err.message); }
  });

  // ---------- Quiz ----------
  let quizItems = buildQuiz();
  let qIdx = 0, score = 0, answered = false, quizPosted = false;

  function postQuizScore() {
    try {
      fetch('/api/quiz/score', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ score: score, total: quizItems.length })
      }).catch(() => {});
    } catch (e) { /* offline / file:// — score just won't sync */ }
  }

  function renderQuiz() {
    answered = false;
    if (qIdx >= quizItems.length) {
      $('quizProgress').textContent = t('quiz.finished');
      $('quizQuestion').textContent = t('quiz.score', { score, n: quizItems.length });
      $('quizOptions').innerHTML = '';
      $('quizFeedback').textContent = score >= quizItems.length * 0.8
        ? t('quiz.good')
        : score >= quizItems.length * 0.5
          ? t('quiz.mid')
          : t('quiz.bad');
      if (!quizPosted) {
        quizPosted = true;
        postQuizScore();
      }
      $('btnQuizNext').hidden = true;
      $('btnQuizRestart').hidden = false;
      return;
    }
    const item = quizItems[qIdx];
    $('quizProgress').textContent = t('quiz.qOf', { q: qIdx + 1, n: quizItems.length, score });
    $('quizQuestion').textContent = item.q;
    $('quizFeedback').textContent = '';
    $('btnQuizNext').hidden = true;
    const nextKey = qIdx === quizItems.length - 1 ? 'quiz.seeResults' : 'btn.next';
    $('btnQuizNext').textContent = t(nextKey);
    $('btnQuizNext').dataset.i18n = nextKey;
    $('btnQuizRestart').hidden = true;
    $('quizOptions').innerHTML = item.options.map((o, i) =>
      `<button class="quiz-opt" data-i="${i}">${o}</button>`).join('');
    $('quizOptions').querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const pick = +btn.dataset.i;
        const correct = item.answer;
        $('quizOptions').querySelectorAll('.quiz-opt').forEach((b, i) => {
          b.disabled = true;
          if (i === correct) b.classList.add('correct');
          else if (i === pick) b.classList.add('wrong');
        });
        if (pick === correct) score++;
        $('quizFeedback').textContent = (pick === correct ? t('quiz.correct') : t('quiz.wrong')) + item.why;
        $('btnQuizNext').hidden = false;
      });
    });
  }
  $('btnQuizNext').addEventListener('click', () => { qIdx++; renderQuiz(); });
  $('btnQuizRestart').addEventListener('click', () => { qIdx = 0; score = 0; quizPosted = false; renderQuiz(); });
  renderQuiz();

  // ---------- Language switch ----------
  function setLang(lang) {
    window.SPC_LANG = (lang && LANGS[lang]) ? lang : 'en';
    localStorage.setItem('spcLang', window.SPC_LANG);
    applyStaticI18n();
    allLessons = buildLessons();
    if (lessonIdx >= allLessons.length) lessonIdx = allLessons.length - 1;
    quizItems = buildQuiz();
    renderLesson();
    applySheetConfig(false);
    sheet.setHeaders(trHeaders(sheet.headers));
    capSheet.setHeaders(trHeaders(capSheet.headers));
    gageSheet.setHeaders(trHeaders(gageSheet.headers));
    parSheet.setHeaders(trHeaders(parSheet.headers));
    renderQuiz();
    if (lastModel) renderModel(lastModel.model, lastModel.rows);
    if (lastCapCalc) renderCapability(lastCapCalc);
    if (lastGageRes) renderGage(lastGageRes);
    if (lastParetoRes) renderPareto(lastParetoRes);
    if (lastPlanArgs) renderPlan(lastPlanArgs);
  }

  const langSel = $('langSel');
  langSel.value = window.SPC_LANG;
  langSel.addEventListener('change', () => setLang(langSel.value));
  applyStaticI18n();

  // ---------- Theme (dark mode) ----------
  const themeBtn = $('themeBtn');
  function isDarkTheme() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function syncThemeBtn() {
    if (!themeBtn) return;
    themeBtn.textContent = isDarkTheme() ? '☀️' : '🌙';
  }
  syncThemeBtn();
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const dark = isDarkTheme();
      if (dark) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('spcTheme', dark ? 'light' : 'dark'); } catch (e) {}
      const mc = document.querySelector('meta[name="theme-color"]');
      if (mc) mc.setAttribute('content', dark ? '#0f766e' : '#0f172a');
      syncThemeBtn();
      if (lastModel) renderModel(lastModel.model, lastModel.rows);
      if (lastCapCalc) Chart.drawHistogram($('capChart'), lastCapCalc.values, { lsl: lastCapCalc.lsl, usl: lastCapCalc.usl });
      if (lastParetoRes) renderPareto(lastParetoRes);
    });
  }

  // ---------- Nav toggle (desktop rail collapse / mobile drawer) ----------
  const navToggle = $('navToggle');
  const navBackdrop = $('navBackdrop');
  const desktopMQ = window.matchMedia('(min-width: 1024px)');
  function syncNavToggle() {
    if (!navToggle) return;
    const collapsed = document.documentElement.getAttribute('data-nav') === 'collapsed';
    const expanded = desktopMQ.matches ? !collapsed : document.body.classList.contains('nav-open');
    navToggle.setAttribute('aria-expanded', String(expanded));
  }
  function closeDrawer() {
    document.body.classList.remove('nav-open');
    syncNavToggle();
  }
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      if (desktopMQ.matches) {
        const collapsed = document.documentElement.getAttribute('data-nav') === 'collapsed';
        if (collapsed) document.documentElement.removeAttribute('data-nav');
        else document.documentElement.setAttribute('data-nav', 'collapsed');
        try { localStorage.setItem('spcNav', collapsed ? 'expanded' : 'collapsed'); } catch (e) {}
        window.dispatchEvent(new Event('resize'));
      } else {
        document.body.classList.toggle('nav-open');
      }
      syncNavToggle();
    });
  }
  if (navBackdrop) navBackdrop.addEventListener('click', closeDrawer);
  document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) closeDrawer();
  });
  const onMQChange = () => { closeDrawer(); };
  if (desktopMQ.addEventListener) desktopMQ.addEventListener('change', onMQChange);
  else if (desktopMQ.addListener) desktopMQ.addListener(onMQChange);
  syncNavToggle();

  // ---------- Redraw on resize ----------
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (lastModel) renderModel(lastModel.model, lastModel.rows);
      if (lastCapCalc) {
        Chart.drawHistogram($('capChart'), lastCapCalc.values, { lsl: lastCapCalc.lsl, usl: lastCapCalc.usl });
      }
      if (lastParetoRes) renderPareto(lastParetoRes);
    }, 250);
  });

  // ---------- Chart zoom (pinch / wheel / drag / buttons) ----------
  if (window.ChartZoom) ChartZoom.attachAll();
})();
