function _nelsonPts(ys) {
  const x0 = 14, x1 = 226, n = ys.length, step = (x1 - x0) / (n - 1);
  return ys.map((y, i) => [+(x0 + i * step).toFixed(1), y]);
}
function nelsonSVG(ys, badIdx, opts) {
  opts = opts || {};
  const pts = _nelsonPts(ys);
  const bad = new Set(badIdx);
  const line = pts.map(p => p[0] + ',' + p[1]).join(' ');
  const circles = pts.map((p, i) =>
    `<circle cx="${p[0]}" cy="${p[1]}" r="3" class="pt${bad.has(i) ? ' bad' : ''}"/>`).join('');
  const zones = (opts.zones || []).map(z =>
    `<line class="zone" x1="10" y1="${z}" x2="230" y2="${z}"/>`).join('');
  return `<svg viewBox="0 0 240 100" class="rule-svg" role="img" aria-label="${opts.alt || 'control chart rule'}">
<line class="ucl" x1="10" y1="15" x2="230" y2="15"/>
<line class="cl" x1="10" y1="50" x2="230" y2="50"/>
<line class="lcl" x1="10" y1="85" x2="230" y2="85"/>
${zones}<polyline class="ln" points="${line}"/>${circles}</svg>`;
}
// SVG flowchart: "Which control chart should I use?"
// Grid-aligned so every arrow lands on the next shape.
function chartFlowSVG() {
  return `<svg viewBox="0 0 545 510" class="flow-svg" role="img" aria-label="Flowchart: which control chart to use">
  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="flow-arrowhead"/>
    </marker>
  </defs>

  <!-- START -->
  <rect x="170" y="4" width="170" height="30" rx="15" class="flow-start"/>
  <text x="255" y="24" text-anchor="middle" class="flow-t-start">What data do you have?</text>

  <!-- Q1: measured or counted -->
  <polygon points="255,60 350,110 255,160 160,110" class="flow-q"/>
  <text x="255" y="105" text-anchor="middle" class="flow-t-q">Measured or</text>
  <text x="255" y="123" text-anchor="middle" class="flow-t-q">Counted?</text>

  <path d="M255,34 L255,58" class="flow-line" marker-end="url(#arr)"/>

  <!-- Q1 → left (measured) -->
  <path d="M160,110 L120,110 L120,186" class="flow-line" marker-end="url(#arr)"/>
  <text x="140" y="100" text-anchor="middle" class="flow-t-yes">Measured</text>

  <!-- Q1 → right (counted) -->
  <path d="M350,110 L390,110 L390,186" class="flow-line" marker-end="url(#arr)"/>
  <text x="370" y="100" text-anchor="middle" class="flow-t-no">Counted</text>

  <!-- LEFT: Q2 rational subgroups? -->
  <polygon points="120,188 198,230 120,272 42,230" class="flow-q"/>
  <text x="120" y="224" text-anchor="middle" class="flow-t-q">Form rational</text>
  <text x="120" y="242" text-anchor="middle" class="flow-t-q">subgroups?</text>

  <!-- Q2L No → I–MR -->
  <path d="M42,230 L20,230 L20,288" class="flow-line" marker-end="url(#arr)"/>
  <text x="31" y="222" text-anchor="middle" class="flow-t-no">No</text>
  <rect x="0" y="290" width="72" height="40" rx="8" class="flow-chart"/>
  <text x="36" y="308" text-anchor="middle" class="flow-t-chart">I–MR</text>
  <text x="36" y="322" text-anchor="middle" class="flow-t-sub">1 value</text>

  <!-- Q2L Yes → Q3L -->
  <path d="M120,272 L120,316" class="flow-line" marker-end="url(#arr)"/>
  <text x="132" y="300" text-anchor="start" class="flow-t-yes">Yes</text>

  <!-- Q3L: subgroup size -->
  <polygon points="120,318 198,360 120,402 42,360" class="flow-q"/>
  <text x="120" y="354" text-anchor="middle" class="flow-t-q">Subgroup</text>
  <text x="120" y="372" text-anchor="middle" class="flow-t-q">size n?</text>

  <!-- 2–9 → X̄–R -->
  <path d="M42,360 L22,360 L22,457" class="flow-line" marker-end="url(#arr)"/>
  <text x="32" y="392" text-anchor="middle" class="flow-t-yes">2–9</text>
  <rect x="0" y="459" width="72" height="40" rx="8" class="flow-chart"/>
  <text x="36" y="477" text-anchor="middle" class="flow-t-chart">X̄–R</text>
  <text x="36" y="491" text-anchor="middle" class="flow-t-sub">range</text>

  <!-- ≥10 → X̄–S -->
  <path d="M198,360 L218,360 L218,457" class="flow-line" marker-end="url(#arr)"/>
  <text x="208" y="392" text-anchor="middle" class="flow-t-yes">≥ 10</text>
  <rect x="182" y="459" width="72" height="40" rx="8" class="flow-chart"/>
  <text x="218" y="477" text-anchor="middle" class="flow-t-chart">X̄–S</text>
  <text x="218" y="491" text-anchor="middle" class="flow-t-sub">std dev</text>

  <!-- RIGHT: Q2R defective? -->
  <polygon points="390,188 468,230 390,272 312,230" class="flow-q"/>
  <text x="390" y="224" text-anchor="middle" class="flow-t-q">Unit is</text>
  <text x="390" y="242" text-anchor="middle" class="flow-t-q">defective?</text>

  <!-- Q2R Yes → Q3a (n constant?) -->
  <path d="M390,272 L390,295 L329,295 L329,315" class="flow-line" marker-end="url(#arr)"/>
  <text x="402" y="300" text-anchor="start" class="flow-t-yes">Yes</text>

  <!-- Q2R No → Q3b (same unit?) -->
  <path d="M468,230 L490,230 L490,280 L469,280 L469,315" class="flow-line" marker-end="url(#arr)"/>
  <text x="505" y="255" text-anchor="start" class="flow-t-no">No</text>

  <!-- Q3a: n constant? -->
  <polygon points="329,317 391,355 329,393 267,355" class="flow-q"/>
  <text x="329" y="351" text-anchor="middle" class="flow-t-q">n</text>
  <text x="329" y="367" text-anchor="middle" class="flow-t-q">constant?</text>

  <!-- Yes → np -->
  <path d="M267,355 L267,425 L294,425 L294,457" class="flow-line" marker-end="url(#arr)"/>
  <text x="276" y="400" text-anchor="start" class="flow-t-yes">Yes</text>
  <rect x="264" y="459" width="60" height="40" rx="8" class="flow-chart"/>
  <text x="294" y="477" text-anchor="middle" class="flow-t-chart">np</text>
  <text x="294" y="491" text-anchor="middle" class="flow-t-sub">const n</text>

  <!-- No → p -->
  <path d="M391,355 L391,425 L364,425 L364,457" class="flow-line" marker-end="url(#arr)"/>
  <text x="400" y="400" text-anchor="start" class="flow-t-no">No</text>
  <rect x="334" y="459" width="60" height="40" rx="8" class="flow-chart"/>
  <text x="364" y="477" text-anchor="middle" class="flow-t-chart">p</text>
  <text x="364" y="491" text-anchor="middle" class="flow-t-sub">var n</text>

  <!-- Q3b: same unit? -->
  <polygon points="469,317 531,355 469,393 407,355" class="flow-q"/>
  <text x="469" y="351" text-anchor="middle" class="flow-t-q">Same</text>
  <text x="469" y="367" text-anchor="middle" class="flow-t-q">unit?</text>

  <!-- Yes → c -->
  <path d="M407,355 L407,425 L434,425 L434,457" class="flow-line" marker-end="url(#arr)"/>
  <text x="416" y="400" text-anchor="start" class="flow-t-yes">Yes</text>
  <rect x="404" y="459" width="60" height="40" rx="8" class="flow-chart"/>
  <text x="434" y="477" text-anchor="middle" class="flow-t-chart">c</text>
  <text x="434" y="491" text-anchor="middle" class="flow-t-sub">same unit</text>

  <!-- No → u -->
  <path d="M531,355 L531,425 L504,425 L504,457" class="flow-line" marker-end="url(#arr)"/>
  <text x="524" y="400" text-anchor="end" class="flow-t-no">No</text>
  <rect x="474" y="459" width="60" height="40" rx="8" class="flow-chart"/>
  <text x="504" y="477" text-anchor="middle" class="flow-t-chart">u</text>
  <text x="504" y="491" text-anchor="middle" class="flow-t-sub">var unit</text>
</svg>`;
}

// SVG flowchart: "8 Steps to Implement SPC" — vertical spine with dashed
// rework loops (fix → re-test, remove special cause → re-collect, improve →
// re-plot) and a runtime reaction loop (signal → react → keep plotting).
function spcFlowSVG() {
  return `<svg viewBox="0 0 545 780" class="flow-svg" role="img" aria-label="Flowchart: 8 steps to implement SPC">
  <defs>
    <marker id="arr8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="flow-arrowhead"/>
    </marker>
  </defs>

  <!-- START / step 1 -->
  <rect x="165" y="4" width="210" height="30" rx="15" class="flow-start"/>
  <text x="270" y="24" text-anchor="middle" class="flow-t-start">1 · Pick process &amp; CTQ</text>
  <path d="M270,34 L270,52" class="flow-line" marker-end="url(#arr8)"/>

  <!-- D1: step 2 — MSA gate -->
  <polygon points="270,54 370,94 270,134 170,94" class="flow-q"/>
  <text x="270" y="88" text-anchor="middle" class="flow-t-q">2 · MSA pass?</text>
  <text x="270" y="104" text-anchor="middle" class="flow-t-q">GRR ≤ 10% · ndc ≥ 5</text>
  <path d="M170,94 L130,94 L130,140" class="flow-line" marker-end="url(#arr8)"/>
  <text x="150" y="86" text-anchor="middle" class="flow-t-no">No</text>
  <rect x="45" y="142" width="170" height="30" rx="8" class="flow-adv"/>
  <text x="130" y="161" text-anchor="middle" class="flow-t-adv">Fix gauge / method</text>
  <path d="M45,157 L16,157 L16,74 L216,74" class="flow-line" stroke-dasharray="5 4" marker-end="url(#arr8)"/>
  <path d="M270,134 L270,166" class="flow-line" marker-end="url(#arr8)"/>
  <text x="285" y="154" text-anchor="start" class="flow-t-yes">Yes</text>

  <!-- step 3: baseline -->
  <rect x="165" y="168" width="210" height="34" rx="8" class="flow-chart"/>
  <text x="270" y="184" text-anchor="middle" class="flow-t-chart">3 · Baseline data</text>
  <text x="270" y="197" text-anchor="middle" class="flow-t-sub">20–25 rational subgroups</text>
  <path d="M270,202 L270,224" class="flow-line" marker-end="url(#arr8)"/>

  <!-- step 4: chart + limits -->
  <rect x="165" y="226" width="210" height="34" rx="8" class="flow-chart"/>
  <text x="270" y="242" text-anchor="middle" class="flow-t-chart">4 · Chart + limits</text>
  <text x="270" y="255" text-anchor="middle" class="flow-t-sub">from baseline, not specs</text>
  <path d="M270,260 L270,286" class="flow-line" marker-end="url(#arr8)"/>

  <!-- D2: in control? -->
  <polygon points="270,288 370,328 270,368 170,328" class="flow-q"/>
  <text x="270" y="322" text-anchor="middle" class="flow-t-q">Baseline in control?</text>
  <text x="270" y="338" text-anchor="middle" class="flow-t-q">(Nelson 1–3)</text>
  <path d="M170,328 L130,328 L130,374" class="flow-line" marker-end="url(#arr8)"/>
  <text x="150" y="320" text-anchor="middle" class="flow-t-no">No</text>
  <rect x="45" y="376" width="170" height="30" rx="8" class="flow-adv"/>
  <text x="130" y="395" text-anchor="middle" class="flow-t-adv">Remove special causes</text>
  <path d="M45,391 L10,391 L10,185 L164,185" class="flow-line" stroke-dasharray="5 4" marker-end="url(#arr8)"/>
  <path d="M270,368 L270,396" class="flow-line" marker-end="url(#arr8)"/>
  <text x="285" y="386" text-anchor="start" class="flow-t-yes">Yes</text>

  <!-- step 5: plot live -->
  <rect x="165" y="398" width="210" height="34" rx="8" class="flow-chart"/>
  <text x="270" y="414" text-anchor="middle" class="flow-t-chart">5 · Plot in real time</text>
  <text x="270" y="427" text-anchor="middle" class="flow-t-sub">points as they run</text>
  <path d="M270,432 L270,458" class="flow-line" marker-end="url(#arr8)"/>

  <!-- D3: signal? -->
  <polygon points="270,460 365,498 270,536 175,498" class="flow-q"/>
  <text x="270" y="492" text-anchor="middle" class="flow-t-q">Signal fired?</text>
  <text x="270" y="508" text-anchor="middle" class="flow-t-q">(Nelson rule)</text>
  <path d="M365,498 L420,498 L420,540" class="flow-line" marker-end="url(#arr8)"/>
  <text x="392" y="490" text-anchor="middle" class="flow-t-yes">Yes</text>

  <!-- step 6: reaction plan -->
  <rect x="345" y="542" width="190" height="44" rx="8" class="flow-adv"/>
  <text x="440" y="560" text-anchor="middle" class="flow-t-adv">6 · Reaction plan</text>
  <text x="440" y="575" text-anchor="middle" class="flow-t-sub">contain → fix → verify</text>
  <path d="M500,542 L500,415 L376,415" class="flow-line" stroke-dasharray="5 4" marker-end="url(#arr8)"/>

  <path d="M270,536 L270,566" class="flow-line" marker-end="url(#arr8)"/>
  <text x="282" y="556" text-anchor="start" class="flow-t-no">No</text>

  <!-- D4: stable & capable? -->
  <polygon points="270,568 375,606 270,644 165,606" class="flow-q"/>
  <text x="270" y="600" text-anchor="middle" class="flow-t-q">Stable &amp; capable?</text>
  <text x="270" y="616" text-anchor="middle" class="flow-t-q">Cp/Cpk ≥ target?</text>
  <path d="M165,606 L125,606 L125,652" class="flow-line" marker-end="url(#arr8)"/>
  <text x="145" y="598" text-anchor="middle" class="flow-t-no">No</text>

  <!-- step 7: improve -->
  <rect x="40" y="654" width="175" height="40" rx="8" class="flow-adv"/>
  <text x="127" y="672" text-anchor="middle" class="flow-t-adv">7 · Improve process</text>
  <text x="127" y="686" text-anchor="middle" class="flow-t-sub">reduce common cause</text>
  <path d="M40,674 L4,674 L4,415 L164,415" class="flow-line" stroke-dasharray="5 4" marker-end="url(#arr8)"/>
  <path d="M270,644 L270,676" class="flow-line" marker-end="url(#arr8)"/>
  <text x="285" y="666" text-anchor="start" class="flow-t-yes">Yes</text>

  <!-- step 8: standardize -->
  <rect x="165" y="678" width="210" height="34" rx="8" class="flow-chart"/>
  <text x="270" y="694" text-anchor="middle" class="flow-t-chart">8 · Standardize</text>
  <text x="270" y="707" text-anchor="middle" class="flow-t-sub">audit &amp; re-baseline</text>
  <path d="M270,712 L270,734" class="flow-line" marker-end="url(#arr8)"/>

  <!-- END -->
  <rect x="185" y="736" width="170" height="30" rx="15" class="flow-start"/>
  <text x="270" y="756" text-anchor="middle" class="flow-t-start">Sustained SPC</text>
</svg>`;
}

// Structured Nelson rule guide for learners: what the pattern is,
// what it means, why it matters, and what to do about it.
const NELSON_RULES = [
  {
    id: 1,
    title: 'Point beyond a control limit',
    pattern: 'One point falls above UCL or below LCL (outside the 3σ limits).',
    means: 'A single sample is far from the process average — farther than normal noise alone can explain. About 0.3% of points fall outside by chance; one real spike is almost always a special cause.',
    why: 'This is the strongest and fastest signal. Something changed: wrong setup, bad material, measurement mistake, tool breakage, or operator error. Ignoring it risks shipping bad product.',
    how: 'Look at the exact point. Check the date/time stamp. Ask what changed that hour: material lot, operator, machine, gauge, environment. Compare with any recent setup or maintenance log.',
    action: 'Stop reacting blindly — search for the special cause first. Quarantine product made since the signal. Do not “tune” the process until you know why the point spiked. Once the cause is removed, resume and confirm the next points behave.'
  },
  {
    id: 2,
    title: 'Shift in the process mean',
    pattern: '9 (or more) consecutive points all on one side of the centerline.',
    means: 'The process average has moved. Any single point near the line is normal; nine in a row on the same side is not — the odds are about 1 in 500 for a stable process.',
    why: 'A mean shift is often silent. Units still look “inside limits,” but you are making them at the wrong average — more scrap, more rework, tighter safety margins used up.',
    how: 'Check if the first of the nine points lines up with a change: new supplier, gauge recalibration, fixture wear, day vs night shift, seasonal temperature. Verify the measurement system before blaming the process.',
    action: 'Confirm the measurement system, then investigate the shift source. If the shift is real, recenter the process to target and recompute limits only after the special cause is removed.'
  },
  {
    id: 3,
    title: 'Trend (steady drift up or down)',
    pattern: '6 (or 7) consecutive points steadily increasing or decreasing.',
    means: 'The process is drifting in one direction. Random noise does not climb or fall for six steps in a row — something is changing slowly over time.',
    why: 'Trends usually end in a control-limit violation or a defective batch if left alone. Catching the trend early lets you fix the cause before scrap piles up.',
    how: 'Common trend causes: tool wear, heater temperature drift, consumable running out, progressive contamination, battery/voltage decay. Plot time on the x-axis and match the slope to maintenance or consumable logs.',
    action: 'Schedule maintenance, tool change, or replenishment before points hit a limit. Do not chase every point with small setting changes — that adds noise. Fix the underlying drift source.'
  },
  {
    id: 4,
    title: 'Systematic alternation (up–down–up–down)',
    pattern: '14 consecutive points alternating up and down.',
    means: 'The process is cycling between two (or more) states instead of varying randomly. A truly random pattern almost never zig-zags fourteen times in a row.',
    why: 'Alternation usually means two sources are mixed: day/night shifts, two machines, two operators, alternating fixtures, or a control loop that is hunting. Averaging them hides the real variation of each source.',
    how: 'Tag each point with shift, machine, operator, or fixture. If odd/even or A/B patterns appear, you have found the second source.',
    action: 'Chart each source separately, or balance the mix so every subgroup contains both sources evenly. Then recompute limits from the corrected data.'
  },
  {
    id: 5,
    title: 'Warning zone — near 2σ (2 of 3)',
    pattern: '2 of 3 consecutive points beyond 2σ on the same side (Zone A).',
    means: 'Points are hugging the outer zone without fully crossing the limit. This is an early warning that the mean may be moving — Rule 1 has not fired yet, but the process is already drifting.',
    why: 'Catching a shift in Zone A gives you time to correct before out-of-control points appear. Waiting for Rule 1 means more product may already be off-target.',
    how: 'Increase inspection frequency, double-check data entry and the gauge, and watch the next few points. If a third consecutive point also lands in Zone A, treat it like a confirmed shift.',
    action: 'Treat as a warning, not a line-stop. Verify data and measurement, then investigate likely shift causes (setup, material, calibration). Escalate if Rule 1 or Rule 6 also fires.'
  },
  {
    id: 6,
    title: 'Drift zone — near 1σ (4 of 5)',
    pattern: '4 of 5 consecutive points beyond 1σ on the same side (Zone B).',
    means: 'Most recent points sit between 1σ and 2σ on one side. The mean is creeping; this is a softer, earlier version of Rule 2.',
    why: 'Gradual drift is easy to miss because no single point looks bad. By the time Rule 2 fires, the process may have been off-target for a full shift.',
    how: 'Look for slow physical changes: wear, temperature, humidity, slow contamination. Confirm the gauge has not drifted. Compare recent subgroups with last week’s average.',
    action: 'Confirm the measurement system, then correct the process setting back toward target. Avoid “tuning” on every point — that is tampering. One verified correction, then watch.'
  },
  {
    id: 7,
    title: 'Stratification (too tight around the mean)',
    pattern: '15 consecutive points within 1σ of the centerline (Zone C).',
    means: 'Points look “too good.” In a healthy process, about 68% of points fall outside ±1σ; fifteen in a row inside that band is statistically suspicious.',
    why: 'Either the control limits are wrong (subgroups mix many sources, or n is wrong), or the gauge resolution is too coarse to see real variation. You are flying blind with false limits.',
    how: 'Check how subgroups were formed. Are they mixing shifts/machines? Is the gauge rounding? Recompute limits from truly rational subgroups.',
    action: 'Rebuild rational subgroups, verify gauge resolution, recompute control limits from homogeneous data. Do not celebrate “stable” data until the limits are proven valid.'
  },
  {
    id: 8,
    title: 'Mixture (bimodal pattern)',
    pattern: '8 consecutive points beyond 1σ on both sides (few or none near the center).',
    means: 'Points hug the outer zones and avoid the middle — a classic two-population signature. One average is actually two different processes mixed together.',
    why: 'A mixture inflates overall variation and makes capability look worse than either stream alone. It can also hide a serious defect rate in one of the streams.',
    how: 'Separate data by machine, shift, material lot, cavity, or pre/post-maintenance period. Plot each stream. If one stream sits high and one low, you have confirmed a mixture.',
    action: 'Stratify the data and chart each stream on its own limits, or run a single homogeneous stream. Recompute capability only after the streams are separated.'
  }
];
// Compact action strings for translated lessons / short lists
const NELSON_ACTIONS = NELSON_RULES.map(r => r.action);
const NELSON_DIAG = [
  nelsonSVG([52, 46, 55, 48, 10, 50, 44, 53, 47, 51], [4], { alt: 'Rule 1: one point beyond 3 sigma' }),
  nelsonSVG([44, 42, 46, 40, 43, 45, 41, 44, 43, 45], [0, 1, 2, 3, 4, 5, 6, 7, 8], { alt: 'Rule 2: nine points on one side of the center line' }),
  nelsonSVG([70, 64, 58, 52, 46, 40, 55, 50], [0, 1, 2, 3, 4, 5], { alt: 'Rule 3: six consecutive points steadily increasing' }),
  nelsonSVG([40, 58, 42, 56, 40, 58, 42, 56, 40, 58, 42, 56, 40, 58], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], { alt: 'Rule 4: fourteen points alternating up and down' }),
  nelsonSVG([45, 26, 34, 24, 46], [1, 3], { zones: [28, 72], alt: 'Rule 5: two of three points beyond 2 sigma, same side' }),
  nelsonSVG([42, 34, 30, 36, 33, 45], [1, 2, 3, 4], { zones: [39, 61], alt: 'Rule 6: four of five points beyond 1 sigma, same side' }),
  nelsonSVG([50, 47, 53, 49, 51, 46, 52, 48, 50, 47, 53, 49, 51, 48, 50], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], { zones: [39, 61], alt: 'Rule 7: fifteen points in Zone C, within 1 sigma' }),
  nelsonSVG([30, 70, 32, 68, 28, 72, 30, 70], [0, 1, 2, 3, 4, 5, 6, 7], { zones: [39, 61], alt: 'Rule 8: eight points beyond 1 sigma on both sides' })
];

// SVG histogram-style curve for capability examples: bell curve + spec limits
// opts: { mean, sigma, lsl, usl, label, cpk, cp, mode }
// mode: 'capable' (green), 'offcenter' (amber), 'wide' (red)
function capCurveSVG(opts) {
  const o = opts;
  const W = 520, H = 200, padL = 40, padR = 20, padT = 28, padB = 40;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  // x scale: from min(lsl, mean-4sigma) to max(usl, mean+4sigma)
  const x0 = Math.min(o.lsl, o.mean - 4 * o.sigma);
  const x1 = Math.max(o.usl, o.mean + 4 * o.sigma);
  const sx = v => padL + ((v - x0) / (x1 - x0)) * plotW;
  // normal curve y (peak at padT)
  const pdf = x => Math.exp(-0.5 * ((x - o.mean) / o.sigma) ** 2);
  const sy = p => padT + plotH - p * plotH;

  // sample points along curve
  const pts = [];
  for (let i = 0; i <= 80; i++) {
    const x = x0 + (i / 80) * (x1 - x0);
    pts.push([sx(x), sy(pdf(x))]);
  }
  const curve = pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

  // shaded out-of-spec tails (approximate with filled path)
  const tail = (from, to) => {
    const seg = pts.filter(p => p[0] >= sx(from) && p[0] <= sx(to));
    if (!seg.length) return '';
    const first = seg[0], last = seg[seg.length - 1];
    return `<path d="M${first[0]},${sy(0)} L${seg.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L')} L${last[0]},${sy(0)} Z" class="cap-tail"/>`;
  };

  const col = o.mode === 'capable' ? '#16a34a' : o.mode === 'offcenter' ? '#d97706' : '#dc2626';

  return `<svg viewBox="0 0 ${W} ${H}" class="cap-svg" role="img" aria-label="${o.label || 'capability curve'}">
  <rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" class="cap-plot"/>
  <!-- out-of-spec shading -->
  ${o.lsl != null ? tail(x0, o.lsl) : ''}
  ${o.usl != null ? tail(o.usl, x1) : ''}
  <!-- curve -->
  <polyline points="${curve}" fill="none" class="cap-curve" stroke="${col}"/>
  <!-- spec limit lines -->
  ${o.lsl != null ? `<line x1="${sx(o.lsl)}" y1="${padT}" x2="${sx(o.lsl)}" y2="${padT + plotH}" class="cap-spec"/>
  <text x="${sx(o.lsl)}" y="${H - 18}" text-anchor="middle" class="cap-spec-t">LSL ${o.lsl}</text>` : ''}
  ${o.usl != null ? `<line x1="${sx(o.usl)}" y1="${padT}" x2="${sx(o.usl)}" y2="${padT + plotH}" class="cap-spec"/>
  <text x="${sx(o.usl)}" y="${H - 18}" text-anchor="middle" class="cap-spec-t">USL ${o.usl}</text>` : ''}
  <!-- mean line -->
  <line x1="${sx(o.mean)}" y1="${padT}" x2="${sx(o.mean)}" y2="${padT + plotH}" class="cap-mean"/>
  <text x="${sx(o.mean)}" y="${H - 18}" text-anchor="middle" class="cap-mean-t">μ ${o.mean}</text>
  <!-- badges -->
  <rect x="${padL}" y="4" width="118" height="20" rx="10" fill="${col}" opacity="0.15"/>
  <text x="${padL + 59}" y="18" text-anchor="middle" font-size="12" font-weight="700" fill="${col}">${o.badge}</text>
</svg>`;
}

// Standard notation with proper HTML bars/subscripts (no Unicode combining marks)
const M = {
  xb: '<span class="mb">X</span>',
  xbb: '<span class="mb2"><span class="mb">X</span></span>',
  rb: '<span class="mb">R</span>',
  mrb: '<span class="mb">MR</span>',
  sb: '<span class="mb">S</span>',
  pb: '<span class="mb">p</span>',
  npb: '<span class="mb">np</span>',
  cb: '<span class="mb">c</span>',
  ub: '<span class="mb">u</span>',
  a2: 'A<sub>2</sub>',
  d2: 'd<sub>2</sub>',
  d3: 'D<sub>3</sub>',
  d4: 'D<sub>4</sub>',
  b3: 'B<sub>3</sub>',
  b4: 'B<sub>4</sub>',
  sw: 'σ<sub>within</sub>',
  so: 'σ<sub>overall</sub>'
};

const CAP_EXAMPLES = [
  {
    id: 'centered',
    title: 'Example A — Capable & centered',
    badge: 'Cp 1.67 · Cpk 1.67',
    mode: 'capable',
    mean: 5.00, sigma: 0.03, lsl: 4.85, usl: 5.15,
    story: 'Pin diameter: target 5.00 mm, spec 4.85–5.15 mm. Mean sits on target, spread is narrow.',
    numbers: `<b>Cp</b> = (5.15 − 4.85) / (6 × 0.03) = 0.30 / 0.18 = <b>1.67</b><br><b>Cpk</b> = min(5.15 − 5.00, 5.00 − 4.85) / (3 × 0.03) = 0.15 / 0.09 = <b>1.67</b> (centered → Cp = Cpk)`,
    means: 'Precise <i>and</i> centered. The whole curve sits inside the spec limits with margin on both sides.',
    why: 'This is the goal state. Customers get consistent parts and you have headroom for normal drift.',
    action: 'Keep the chart in control, monitor regularly. No process change needed — just maintain.'
  },
  {
    id: 'offcenter',
    title: 'Example B — Precise but OFF-CENTER (Cp high, Cpk low)',
    badge: 'Cp 1.67 · Cpk 0.56',
    mode: 'offcenter',
    mean: 5.10, sigma: 0.03, lsl: 4.85, usl: 5.15,
    story: 'Same pin, same σ — but the mean drifted to 5.10 (near USL) after a machine re-set that ignored the target.',
    numbers: '<b>Cp</b> = 0.30 / 0.18 = <b>1.67</b> (unchanged — spread is still narrow)<br><b>Cpk</b> = (5.15 − 5.10) / (3 × 0.03) = 0.05 / 0.09 = <b>0.56</b> (nearest spec is USL)',
    means: 'The machine <i>can</i> hold the tolerance (good Cp) but is running off-target. Risk is all on the high side; scrap is already occurring above USL.',
    why: 'Cp looks fine so people relax — but the curve is shifted so one tail is outside USL. A good Cp wasted by a bad mean.',
    action: 'Recenter the mean to 5.00 (adjust machine offset). Cheapest improvement possible — do not touch variation.'
  },
  {
    id: 'wide',
    title: 'Example C — Too wide (Cp low, Cpk low)',
    badge: 'Cp 0.50 · Cpk 0.50',
    mode: 'wide',
    mean: 5.00, sigma: 0.10, lsl: 4.85, usl: 5.15,
    story: 'Mean is on target, but spread is huge (σ more than tripled). Tooling wear, mixed lots, or unstable temperature.',
    numbers: '<b>Cp</b> = 0.30 / (6 × 0.10) = 0.30 / 0.60 = <b>0.50</b><br><b>Cpk</b> = 0.15 / 0.30 = <b>0.50</b> (centered, so Cpk = Cp — but both fail)',
    means: 'Centering cannot save this process. The curve is simply too wide: tails fall outside both LSL and USL even with a perfect mean.',
    why: 'Recentering will not help. You must find and reduce variation — special causes first (Charts page), then common-cause redesign.',
    action: 'Run the Charts page to eliminate special causes, then a variation-reduction project: material control, tool maintenance, environment.'
  },
  {
    id: 'pp',
    title: 'Example D — Cpk vs Ppk (short-term vs long-term)',
    badge: 'Cpk 1.67 · Ppk 0.89',
    mode: 'wide',
    mean: 5.00, sigma: 0.06, lsl: 4.85, usl: 5.15,
    story: 'Within each shift the machine is tight (σ_within = 0.03 → Cpk 1.67), but the mean moves between shifts so overall σ grows to 0.06 → Ppk drops.',
    numbers: `<b>Cpk</b> (σ<sub>within</sub> = ${M.mrb}/${M.d2} = 0.03) = 0.15 / 0.09 = <b>1.67</b><br><b>Ppk</b> (σ<sub>overall</sub> = 0.06) = 0.15 / 0.18 = <b>0.83</b> — long-term performance is what the customer feels`,
    means: 'Stable inside a shift, but drifts between shifts. Capability looks great on paper; real delivered performance is much worse.',
    why: 'Customers experience the long-term spread (Pp/Ppk). Reporting only Cp/Cpk hides setup-to-setup instability.',
    action: 'Compare both in the Cpk tab. If Ppk ≪ Cpk, standardize setups (first-article checks, setup sheets) before celebrating capability.'
  }
];

// ---------------------------------------------------------------------------
// Formula-box helpers — structured math presentation
// rows: [lhs, rhs] pairs; optional note line under the equations
function fm(title, rows, note) {
  return `<div class="fm">
  <div class="fm-h">${title}</div>
  ${rows.map(([l, r]) => `<div class="fm-eq"><span class="fm-l">${l}</span> = ${r}</div>`).join('\n  ')}
  ${note ? `<div class="fm-n">${note}</div>` : ''}
</div>`;
}

// Control-chart constants table (n = 2…10)
function constTable() {
  const R = [
    [2, 1.880, 0, 3.267, 0, 3.267, 1.128],
    [3, 1.023, 0, 2.574, 0, 2.568, 1.693],
    [4, 0.729, 0, 2.282, 0, 2.266, 2.059],
    [5, 0.577, 0, 2.114, 0, 2.089, 2.326],
    [6, 0.483, 0, 2.004, 0, 1.970, 2.534],
    [7, 0.419, 0.076, 1.924, 0.076, 1.882, 2.704],
    [8, 0.373, 0.136, 1.864, 0.136, 1.815, 2.847],
    [9, 0.337, 0.184, 1.816, 0.184, 1.761, 2.970],
    [10, 0.308, 0.223, 1.777, 0.223, 1.716, 3.078]
  ];
  const f = v => (v === 0 ? '0' : v.toFixed(3));
  return `<table class="nt">
<tr><th>n</th><th>${M.a2}</th><th>${M.d3}</th><th>${M.d4}</th><th>${M.b3}</th><th>${M.b4}</th><th>${M.d2}</th></tr>
${R.map(r => `<tr><td class="nt-s">${r[0]}</td><td class="nt-s">${r[1].toFixed(3)}</td><td class="nt-s">${f(r[2])}</td><td class="nt-s">${r[3].toFixed(3)}</td><td class="nt-s">${f(r[4])}</td><td class="nt-s">${r[5].toFixed(3)}</td><td class="nt-s">${r[6].toFixed(3)}</td></tr>`).join('\n')}
</table>
<div class="fm-n">${M.a2}, ${M.d3}, ${M.d4} → X̄–R limits &nbsp;·&nbsp; ${M.b3}, ${M.b4} → X̄–S limits &nbsp;·&nbsp; ${M.d2} → σ from range (MR̄/${M.d2})</div>`;
}

// Shared notation legend (used at the top of the first chart lesson)
function notationLegend() {
  const bar = '<span class="mb">x</span>';
  const dbar = '<span class="mb2"><span class="mb">X</span></span>';
  return `<table class="nt">
<tr><th>Symbol</th><th>Say</th><th>Meaning</th></tr>
<tr><td class="nt-s">x<sub>i</sub></td><td>x-sub-i</td><td>the i-th individual measurement</td></tr>
<tr><td class="nt-s">${bar}</td><td>x-bar</td><td>average of one subgroup</td></tr>
<tr><td class="nt-s">${dbar}</td><td>x-double-bar</td><td>grand mean — average of all subgroup averages</td></tr>
<tr><td class="nt-s">R</td><td>R</td><td>range of one subgroup (max − min)</td></tr>
<tr><td class="nt-s"><span class="mb">R</span></td><td>R-bar</td><td>average of the subgroup ranges</td></tr>
<tr><td class="nt-s"><span class="mb">MR</span></td><td>MR-bar</td><td>average moving range |x<sub>i</sub> − x<sub>i−1</sub>|</td></tr>
<tr><td class="nt-s">σ</td><td>sigma</td><td>standard deviation (within = short-term, overall = long-term)</td></tr>
<tr><td class="nt-s">n</td><td>n</td><td>subgroup or sample size</td></tr>
<tr><td class="nt-s">UCL / CL / LCL</td><td>—</td><td>upper / center / lower control limit</td></tr>
<tr><td class="nt-s">${M.a2}, ${M.d4}, ${M.d2} …</td><td>—</td><td>constants that depend only on n (see table in X̄–R lesson)</td></tr>
</table>`;
}

// ---------------------------------------------------------------------------
// Shared example-card builder for chart lessons
// blocks: { numbers?, means, why, action }
function exCard(title, badge, story, svgHtml, blocks) {
  return `
<div class="cap-example">
  <div class="cap-ex-title"><b>${title}</b></div>
  <div class="cap-ex-badge">${badge}</div>
  <div class="cap-ex-story">${story}</div>
  ${svgHtml}
  <div class="guide-blocks">
    ${blocks.numbers ? `<div class="rule-block"><span class="rule-lbl">Numbers</span> ${blocks.numbers}</div>` : ''}
    <div class="rule-block"><span class="rule-lbl">What it means</span> ${blocks.means}</div>
    <div class="rule-block"><span class="rule-lbl">Why it matters</span> ${blocks.why}</div>
    <div class="rule-action"><span class="rule-lbl">Action</span> ${blocks.action}</div>
  </div>
</div>`;
}

const _avg = a => a.reduce((s, v) => s + v, 0) / a.length;

// --- X̄–R example data: 12 subgroups × n=5, mean shifts at subgroup 8 ---
const XR_SUB = [
  [50.1, 49.8, 50.3, 50.0, 49.9],
  [49.9, 50.2, 50.0, 50.1, 49.8],
  [50.3, 50.0, 49.9, 50.2, 50.1],
  [50.0, 49.7, 50.1, 49.9, 50.2],
  [49.8, 50.0, 50.2, 50.1, 49.9],
  [50.2, 50.1, 50.0, 50.3, 50.0],
  [50.1, 49.9, 50.4, 50.0, 50.2],
  [51.8, 51.9, 52.0, 51.7, 51.9],
  [51.7, 51.9, 51.8, 52.1, 51.6],
  [51.8, 52.0, 51.9, 51.7, 51.8],
  [50.2, 50.0, 50.1, 49.9, 50.3],
  [50.0, 50.2, 49.9, 50.1, 50.0]
];
function _xbarRCharts() {
  const means = XR_SUB.map(a => +_avg(a).toFixed(3));
  const ranges = XR_SUB.map(a => +(Math.max(...a) - Math.min(...a)).toFixed(3));
  // limits from baseline subgroups 1–7 only
  const baseM = means.slice(0, 7), baseR = ranges.slice(0, 7);
  const xbb = _avg(baseM), rbar = _avg(baseR);
  const A2 = 0.577, D4 = 2.114; // n = 5
  const uclX = xbb + A2 * rbar, lclX = xbb - A2 * rbar;
  const uclR = D4 * rbar;
  const sig = means.map((m, i) => (m > uclX || m < lclX ? i : -1)).filter(i => i >= 0);
  return {
    means, ranges, xbb, rbar, uclX, lclX, uclR, sig,
    xbarSvg: ctrlChartSVG({
      data: means, cl: +xbb.toFixed(3), ucl: +uclX.toFixed(3), lcl: +lclX.toFixed(3),
      shiftAt: 8, signalAt: sig,
      yLabel: 'X̄', xLabel: 'Subgroup',
      badge: `X̄ chart · CL ${xbb.toFixed(2)} · UCL ${uclX.toFixed(2)} · shift at sg 8`
    }),
    rSvg: ctrlChartSVG({
      data: ranges, cl: +rbar.toFixed(3), ucl: +uclR.toFixed(3), lcl: 0,
      shiftAt: null, signalAt: [],
      yLabel: 'R', xLabel: 'Subgroup',
      badge: `R chart · R̄ ${rbar.toFixed(2)} · UCL ${uclR.toFixed(2)} · all in control`
    })
  };
}

// --- I–MR example: 20 individuals, step +1.8 at index 10 ---
const IM_DATA = [
  100.1, 99.8, 100.3, 100.0, 99.7, 100.2, 100.1, 99.9, 100.4, 100.0,
  101.9, 102.1, 101.8, 102.0, 101.7, 102.2, 101.9, 102.0, 101.8, 102.1
];
function _imrCharts() {
  const mr = IM_DATA.map((v, i) => (i === 0 ? null : +Math.abs(v - IM_DATA[i - 1]).toFixed(3))).slice(1);
  const xbar = _avg(IM_DATA);
  const mrbar = _avg(mr);
  const uclI = xbar + 2.66 * mrbar, lclI = xbar - 2.66 * mrbar;
  const uclMR = 3.267 * mrbar;
  const sigI = IM_DATA.map((v, i) => (v > uclI || v < lclI ? i : -1)).filter(i => i >= 0);
  const sigMR = mr.map((v, i) => (v > uclMR ? i + 1 : -1)).filter(i => i >= 0);
  return {
    xbar, mrbar, uclI, lclI, uclMR, sigI, sigMR,
    iSvg: ctrlChartSVG({
      data: IM_DATA, cl: +xbar.toFixed(3), ucl: +uclI.toFixed(3), lcl: +lclI.toFixed(3),
      shiftAt: 11, signalAt: sigI,
      yLabel: 'Value', xLabel: 'Sample',
      badge: `I chart · CL ${xbar.toFixed(2)} · UCL ${uclI.toFixed(2)} · points 11–20 high`
    }),
    mrSvg: ctrlChartSVG({
      data: mr, cl: +mrbar.toFixed(3), ucl: +uclMR.toFixed(3), lcl: 0,
      shiftAt: 11, signalAt: sigMR,
      yLabel: 'MR', xLabel: 'Sample',
      badge: `MR chart · MR̄ ${mrbar.toFixed(2)} · UCL ${uclMR.toFixed(2)} · spike at the step`
    })
  };
}

// --- Attribute examples ---
function _pChart() {
  const ns = [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50];
  const ds = [2, 1, 3, 2, 0, 1, 2, 3, 1, 12, 2, 1];
  const pbar = ds.reduce((s, v) => s + v, 0) / ns.reduce((s, v) => s + v, 0);
  const ps = ds.map((d, i) => +(d / ns[i]).toFixed(4));
  // variable limits per point
  const ucls = ns.map(n => +(pbar + 3 * Math.sqrt((pbar * (1 - pbar)) / n)).toFixed(4));
  const lcls = ns.map(n => +Math.max(0, pbar - 3 * Math.sqrt((pbar * (1 - pbar)) / n)).toFixed(4));
  const sig = ps.map((p, i) => (p > ucls[i] || p < lcls[i] ? i : -1)).filter(i => i >= 0);
  // For the SVG use constant limits (max UCL) for readability; note variable limits in story
  const uclMax = Math.max(...ucls);
  const lclMin = Math.min(...lcls);
  return {
    pbar, ps, ucls, sig, uclMax, lclMin,
    svg: ctrlChartSVG({
      data: ps, cl: +pbar.toFixed(4), ucl: uclMax, lcl: 0,
      shiftAt: null, signalAt: sig,
      yLabel: 'p', xLabel: 'Sample',
      badge: `p chart · p̄ ${(pbar * 100).toFixed(1)}% · UCL ≈ ${(uclMax * 100).toFixed(1)}% · sample 10 signals`
    })
  };
}
function _npChart() {
  const n = 50;
  const ds = [2, 1, 3, 2, 0, 1, 2, 3, 1, 12, 2, 1];
  const pbar = ds.reduce((s, v) => s + v, 0) / (n * ds.length);
  const cl = n * pbar;
  const ucl = cl + 3 * Math.sqrt(cl * (1 - pbar));
  const sig = ds.map((d, i) => (d > ucl ? i : -1)).filter(i => i >= 0);
  return {
    pbar, cl, ucl, sig, ds,
    svg: ctrlChartSVG({
      data: ds, cl: +cl.toFixed(2), ucl: +ucl.toFixed(2), lcl: 0,
      shiftAt: null, signalAt: sig,
      yLabel: 'np', xLabel: 'Sample',
      badge: `np chart · n=50 · CL ${cl.toFixed(1)} bad/box · UCL ${ucl.toFixed(1)} · sample 10`
    })
  };
}
function _cChart() {
  const cs = [4, 3, 5, 2, 6, 3, 4, 3, 2, 5, 12, 4];
  const cbar = _avg(cs);
  const ucl = cbar + 3 * Math.sqrt(cbar);
  const sig = cs.map((c, i) => (c > ucl ? i : -1)).filter(i => i >= 0);
  return {
    cbar, ucl, sig,
    svg: ctrlChartSVG({
      data: cs, cl: +cbar.toFixed(3), ucl: +ucl.toFixed(3), lcl: 0,
      shiftAt: null, signalAt: sig,
      yLabel: 'c', xLabel: 'Sample',
      badge: `c chart · c̄ ${cbar.toFixed(1)} · UCL ${ucl.toFixed(1)} · panel 11 = 12 scratches`
    })
  };
}
function _uChart() {
  const units = [20, 20, 20, 20, 10, 20, 20, 25, 25, 25, 30, 30];
  const defects = [3, 5, 2, 6, 8, 4, 3, 2, 4, 5, 9, 4];
  const totalD = defects.reduce((s, v) => s + v, 0);
  const totalU = units.reduce((s, v) => s + v, 0);
  const ubar = totalD / totalU;
  const us = defects.map((d, i) => +(d / units[i]).toFixed(4));
  const ucls = units.map(n => +(ubar + 3 * Math.sqrt(ubar / n)).toFixed(4));
  const sig = us.map((u, i) => (u > ucls[i] ? i : -1)).filter(i => i >= 0);
  const uclMax = Math.max(...ucls);
  return {
    ubar, us, ucls, sig, uclMax,
    svg: ctrlChartSVG({
      data: us, cl: +ubar.toFixed(4), ucl: uclMax, lcl: 0,
      shiftAt: null, signalAt: sig,
      yLabel: 'u', xLabel: 'Sample',
      badge: `u chart · ū ${ubar.toFixed(2)} defects/m² · sample 5 signals (8 defects / 10 m² = 0.80)`
    })
  };
}

// --- Laney overdispersion examples: classic chart alarms everywhere; Laney
// widens the limits by σz = MR̄(z)/d₂ so only genuine extremes remain.
// kind 'p' (defectives, se = √(p̄(1−p̄)/n)) or 'u' (defects/unit, se = √(ū/n)).
function _laneyExample(defects, units, kind) {
  const totalD = defects.reduce((s, v) => s + v, 0);
  const totalU = units.reduce((s, v) => s + v, 0);
  const ubar = totalD / totalU;
  const rates = defects.map((d, i) => +(d / units[i]).toFixed(4));
  const se = units.map(n => kind === 'p'
    ? Math.sqrt((ubar * (1 - ubar)) / n)
    : Math.sqrt(ubar / n));
  const z = rates.map((p, i) => (p - ubar) / se[i]);
  const mr = z.slice(1).map((v, i) => Math.abs(v - z[i]));
  const mrbar = _avg(mr);
  const sigmaZ = mrbar / 1.128;
  const classicUcl = se.map(s => ubar + 3 * s);
  const classicLcl = se.map(s => Math.max(0, ubar - 3 * s));
  const laneyUcl = se.map(s => ubar + 3 * sigmaZ * s);
  const laneyLcl = se.map(s => Math.max(0, ubar - 3 * sigmaZ * s));
  const classicSig = rates.map((p, i) => (p > classicUcl[i] || p < classicLcl[i] ? i : -1)).filter(i => i >= 0);
  const laneySig = rates.map((p, i) => (p > laneyUcl[i] || p < laneyLcl[i] ? i : -1)).filter(i => i >= 0);
  const uclMax = Math.max(...classicUcl), lclMin = Math.min(...classicLcl);
  const uclLmax = Math.max(...laneyUcl);
  const name = kind === 'p' ? 'p' : 'u';
  return {
    ubar, sigmaZ, classicSig, laneySig, uclMax, lclMin, uclLmax,
    classicSvg: ctrlChartSVG({
      data: rates, cl: +ubar.toFixed(4), ucl: +uclMax.toFixed(4), lcl: +lclMin.toFixed(4),
      shiftAt: null, signalAt: classicSig,
      yLabel: name, xLabel: 'Sample',
      badge: `classic ${name} chart · ${classicSig.length} of ${rates.length} samples signal · limits too tight`
    }),
    laneySvg: ctrlChartSVG({
      data: rates, cl: +ubar.toFixed(4), ucl: +uclLmax.toFixed(4), lcl: 0,
      shiftAt: null, signalAt: laneySig,
      yLabel: name, xLabel: 'Sample',
      badge: `Laney ${name}′ chart · σz = ${sigmaZ.toFixed(2)} · limits ×${sigmaZ.toFixed(2)} · ${laneySig.length} signals`
    })
  };
}
function _laneyPExample() {
  // 12 lots of 500; lots 5–8 from a suspect material lot (p jumps ~4% → ~14%)
  return _laneyExample([20, 18, 22, 19, 70, 74, 68, 72, 21, 17, 23, 20], new Array(12).fill(500), 'p');
}
function _laneyUExample() {
  // 12 fabric rolls; rolls 9–12 from Machine B (defects/m² jumps ~0.17 → ~0.50)
  return _laneyExample(
    [30, 20, 40, 30, 50, 20, 40, 30, 120, 140, 110, 130],
    [200, 200, 200, 200, 200, 200, 200, 200, 250, 250, 250, 250], 'u');
}

const LESSONS = [
  {
    title: 'How to Use This App',
    body: `
<p>This app has five pages (tabs). Each one answers a different quality question. Learn them in order — they follow the real SPC workflow.</p>
<table>
<tr><th>Page</th><th>Question it answers</th><th>When to use it</th></tr>
<tr><td>📚 <b>Learn</b></td><td>What do the rules and numbers mean?</td><td>First time, and whenever you forget a rule</td></tr>
<tr><td>📊 <b>Charts</b></td><td>Is the process stable right now?</td><td>Every shift / every batch — live monitoring</td></tr>
<tr><td>🎯 <b>Cpk</b></td><td>Can the process meet the customer specs?</td><td>Capability studies, PPAP, customer reports</td></tr>
<tr><td>🧰 <b>Tools</b></td><td>Can we trust the measurement? Which defects matter? How do we improve Cpk?</td><td>MSA studies, Pareto priority, improvement planning</td></tr>
<tr><td>🧠 <b>Quiz</b></td><td>Do I understand SPC well enough to use it?</td><td>Training check, certification, refreshers</td></tr>
</table>
<h4>Recommended learning path</h4>
<ol>
<li>Read the lessons in this Learn tab (theory + what to do)</li>
<li>Open <b>Charts</b> → Load Sample → Analyze — see a real chart and rule hits</li>
<li>Open <b>Cpk</b> → Load Sample → enter LSL/USL → see Cp/Cpk and the histogram</li>
<li>Open <b>Tools</b> → run Gage R&R and Pareto on the samples</li>
<li>Take the <b>Quiz</b> until you pass confidently</li>
</ol>
<div class="callout"><b>Golden rule of SPC:</b> Stability first (Charts), then capability (Cpk). Never report Cpk from an out-of-control process — the number is meaningless.</div>`
  },
  {
    title: 'Charts Page — Is the Process Stable?',
    body: `
<div class="guide-blocks">
<div class="rule-block"><span class="rule-lbl">What it is</span> The Charts page plots your data on control charts (X̄–R, I–MR, p, np, c, u, EWMA, CUSUM…), draws UCL / CL / LCL, and automatically checks Nelson rules 1–8 for out-of-control patterns.</div>
<div class="rule-block"><span class="rule-lbl">What it means</span> A chart answers: <i>“Is this process predictable?”</i> Points inside the limits with no patterns = common-cause noise only (in control). A rule violation = a special cause is acting on the process right now.</div>
<div class="rule-block"><span class="rule-lbl">Why you must check it</span> If you skip this and go straight to Cpk, you may calculate capability on a process that is shifting, drifting, or cycling. The Cpk will look “okay” today and fail tomorrow. Stability is the foundation of every other number in this app.</div>
<div class="rule-block rule-howto"><span class="rule-lbl">How to use the page</span>
<ol>
<li>Choose the chart type that matches your data (variables → X̄–R or I–MR; counts → p/np/c/u)</li>
<li>Enter data in the worksheet (one row = one subgroup), or press <b>Load Sample</b></li>
<li>Press <b>Analyze ▶</b></li>
<li>Read the green/red status badge first: “In control ✓” or “Signal detected”</li>
<li>Scroll to the <b>Violations</b> card — each hit lists the rule, why it matters, and the action</li>
<li>Zoom/pan the chart with pinch, scroll wheel, or +/− buttons to inspect dense areas</li>
</ol></div>
<div class="rule-action"><span class="rule-lbl">What you should do</span>
<ul>
<li><b>In control:</b> leave the process alone. Document the limits. Reduce common-cause variation only via a management-led project.</li>
<li><b>Out of control:</b> do <u>not</u> adjust settings to “chase the points.” Find the special cause (setup, material, operator, gauge, environment). Contain product made since the signal. Fix the cause, then re-check the chart.</li>
<li>Always check the <b>R / MR chart first</b>. If variation is unstable, the average chart’s limits cannot be trusted.</li>
</ul></div>
</div>
<div class="callout"><b>Tip:</b> Sample data is built in. Press Load Sample for every chart type to see what “good” and “bad” patterns look like before you enter real factory data.</div>`
  },
  {
    title: 'Cpk Page — Can We Meet Specs?',
    body: `
<div class="guide-blocks">
<div class="rule-block"><span class="rule-lbl">What it is</span> The Cpk (Capability) page compares your process spread and center against the customer’s specification limits (LSL / USL). It computes Cp, Cpk, Pp, Ppk, estimated PPM out, sigma level, and draws a histogram with the spec limits overlaid.</div>
<div class="rule-block"><span class="rule-lbl">What it means</span>
<ul>
<li><b>Cp / Pp</b> — potential: is the process spread narrow enough vs tolerance? (Ignores centering.)</li>
<li><b>Cpk / Ppk</b> — actual: same, but also accounts for where the mean sits relative to the nearest spec limit.</li>
<li><b>Histogram</b> — visual: do the tails cross LSL/USL? Is the curve centered?</li>
</ul></div>
<div class="rule-block"><span class="rule-lbl">Why you must check it</span> Customers do not buy “in control” — they buy parts inside specification. A stable process can still be incapable (too wide). An incapable process creates scrap, rework, warranty claims, and lost contracts. Capability is usually required for PPAP, ISO/IATF audits, and supplier approval.</div>
<div class="rule-block rule-howto"><span class="rule-lbl">How to use the page</span>
<ol>
<li>Paste or enter measurements (individual values, continuous data)</li>
<li>Enter <b>LSL</b> and/or <b>USL</b> from the drawing or customer spec (at least one is required; both for Cp/Cpk)</li>
<li>Press <b>Analyze ▶</b></li>
<li>Read the badge: Not capable / Marginal / Capable</li>
<li>Look at the stats grid: Cp vs Cpk, Pp vs Ppk, mean vs target, estimated PPM, sigma level</li>
<li>Optional: view the histogram card to see how much of the curve falls outside the limits</li>
</ol></div>
<div class="rule-block"><span class="rule-lbl">How to interpret the numbers</span>
<table>
<tr><th>Cpk</th><th>Meaning</th><th>What to do</th></tr>
<tr><td>&lt; 1.00</td><td>Process cannot reliably meet specs</td><td>Act now: center the mean if off-target, then reduce variation</td></tr>
<tr><td>1.00 – 1.33</td><td>Marginal</td><td>Improve variation; monitor closely</td></tr>
<tr><td>≥ 1.33</td><td>Generally capable</td><td>Maintain; keep the chart in control</td></tr>
<tr><td>≈ 2.00</td><td>Six Sigma level</td><td>Excellent; sustain with SPC</td></tr>
</table></div>
<div class="rule-action"><span class="rule-lbl">What you should do</span>
<ul>
<li><b>Cp high, Cpk low</b> → process is precise but off-center → adjust the mean (easy win)</li>
<li><b>Both low</b> → variation is too large → process change needed (tooling, method, material)</li>
<li><b>Before reporting Cpk:</b> confirm the Charts page is in control. Capability of an unstable process is a fiction.</li>
<li>Use the <b>Cpk Planner</b> in Tools to calculate exactly how much σ you must remove for a target Cpk.</li>
</ul></div>
</div>`
  },
  {
    title: 'Tools Page — Gage R&R, Pareto & Planner',
    body: `
<p>Three tools that answer the questions <i>“Can we trust the data?”</i>, <i>“Where do we attack first?”</i>, and <i>“How much do we improve?”</i></p>

<h4>🔬 Gage R&R (Measurement System Analysis)</h4>
<div class="guide-blocks">
<div class="rule-block"><span class="rule-lbl">What it is</span> A study of the measurement system itself: several parts × several operators × repeated trials. It splits total observed variation into part-to-part (real) vs equipment (repeatability) vs operator (reproducibility).</div>
<div class="rule-block"><span class="rule-lbl">What it means</span> %GRR = how much of the variation you see is the <b>gauge</b>, not the process. ndc = how many distinct categories the gauge can resolve. If the gauge is noisy, every chart and Cpk number built on it is wrong.</div>
<div class="rule-block"><span class="rule-lbl">Why you must check it</span> You cannot control what you cannot measure. A gauge with %GRR &gt; 30% will create false alarms on the control chart and hide real process shifts. Customer and IATF/ISO audits require MSA before trusting SPC data.</div>
<div class="rule-block rule-howto"><span class="rule-lbl">How to use the page</span>
<ol>
<li>Set Parts (≥2), Operators (≥2), Trials (2–3)</li>
<li><b>Build Grid</b> or <b>Load Sample</b></li>
<li>Enter each operator’s measurements for each part/trial</li>
<li><b>Analyze ▶</b> — read %EV, %RV, %GRR, %PV, ndc</li>
</ol></div>
<div class="rule-action"><span class="rule-lbl">What you should do</span>
<ul>
<li><b>%GRR ≤ 10%</b> → measurement system is good; trust the data</li>
<li><b>10–30%</b> → marginal: improve gauge, fixturing, or operator method</li>
<li><b>&gt; 30%</b> → unacceptable: do not use this gauge for SPC until fixed</li>
<li><b>ndc &lt; 5</b> → gauge cannot resolve the parts well enough; upgrade resolution</li>
<li><b>EV high</b> → fix the instrument. <b>RV high</b> → train operators / standardize the method.</li>
</ul></div>
</div>

<h4>📊 Pareto Chart</h4>
<div class="guide-blocks">
<div class="rule-block"><span class="rule-lbl">What it is</span> A bar chart of defect categories sorted from most to least frequent, plus a cumulative % line. It finds the “vital few” categories that cause most of the pain.</div>
<div class="rule-block"><span class="rule-lbl">What it means</span> The 80/20 rule: often ~20% of defect types cause ~80% of total defects. The chart shows where limited time and money will have the biggest impact.</div>
<div class="rule-block"><span class="rule-lbl">Why you must check it</span> Fixing every defect type equally wastes effort. Pareto focuses the team on the few categories worth a full improvement project — standard practice in quality circles and Six Sigma DMAIC.</div>
<div class="rule-block rule-howto"><span class="rule-lbl">How to use the page</span>
<ol>
<li>Enter defect category names and counts (or Load Sample)</li>
<li><b>Draw Pareto ▶</b></li>
<li>Read the left bars (counts) and the cumulative line (right axis)</li>
<li>Look for where the cumulative line crosses ~80%</li>
</ol></div>
<div class="rule-action"><span class="rule-lbl">What you should do</span> Attack the bars left of the 80% line first. Assign an owner and a root-cause project to each vital-few category. Re-run the Pareto after the project to confirm the bar actually dropped.</div>
</div>

<h4>🎯 Cpk Improvement Planner</h4>
<div class="guide-blocks">
<div class="rule-block"><span class="rule-lbl">What it is</span> A calculator: given today’s mean, σ, and spec limits, what mean and σ do you need to hit a target Cpk (e.g. 1.33)?</div>
<div class="rule-block"><span class="rule-lbl">What it means</span> It turns “we need better Cpk” into concrete engineering goals: “center the mean to X” and/or “reduce σ from A to B.”</div>
<div class="rule-block"><span class="rule-lbl">Why you must check it</span> Without a numeric target, improvement projects drift. The planner tells you whether centering alone is enough or whether variation reduction is mandatory — and how far.</div>
<div class="rule-block rule-howto"><span class="rule-lbl">How to use the page</span> Enter current Mean, σ, LSL, USL and Target Cpk → <b>Plan ▶</b>. The result shows Option A (center only), Option B (reduce variation), or both.</div>
<div class="rule-action"><span class="rule-lbl">What you should do</span> If centering alone gets you to target Cpk, do that first (cheap). If not, use the required-σ number as the project goal for a variation-reduction effort.</div>
</div>`
  },
  {
    title: 'Quiz Page — Test Your Understanding',
    body: `
<div class="guide-blocks">
<div class="rule-block"><span class="rule-lbl">What it is</span> A set of multiple-choice questions covering every lesson: common vs special cause, chart selection, Nelson rules, Cp/Cpk interpretation, Gage R&R acceptance, and Pareto. Your score is saved and shown to the admin on the leaderboard.</div>
<div class="rule-block"><span class="rule-lbl">What it means</span> The quiz measures whether you can <i>apply</i> SPC, not just memorize formulas. Each wrong answer has an explanation (“why”) so you learn from mistakes immediately.</div>
<div class="rule-block"><span class="rule-lbl">Why you must check it</span> Training without a knowledge check is often forgotten within weeks. A passing score is evidence for audits and for your supervisor that the team understands how to react to control-chart signals.</div>
<div class="rule-block rule-howto"><span class="rule-lbl">How to use the page</span>
<ol>
<li>Read each question carefully; pick the best answer</li>
<li>Read the feedback — even if you were right, the “why” reinforces the rule</li>
<li>Press <b>Next</b> through all questions; your final score is posted automatically</li>
<li>If you scored low, go back to Learn, re-read the missed topics, then <b>Restart</b></li>
</ol></div>
<div class="rule-action"><span class="rule-lbl">What you should do</span> Aim for a pass on the first attempt after studying. Re-take after a few weeks to keep the knowledge fresh. Admins can open the leaderboard to see class progress.</div>
</div>
<div class="callout"><b>Tip:</b> Keep the Learn tab open in another window while taking the quiz the first time — look up rules you are unsure of, then try again from memory.</div>`
  },
  {
    title: 'Which Chart Should I Use? (Flowchart)',
    body: `
<p>Choosing the wrong chart wastes time and hides problems. Answer two questions — <b>measured or counted?</b> and <b>can you form subgroups?</b> — and the flowchart below gives the right chart.</p>

<div class="flow-wrap">
${chartFlowSVG()}
</div>

<div class="guide-blocks">
<div class="rule-block"><span class="rule-lbl">What it means</span>
Every control chart is built for a specific kind of data. Using an X̄–R chart on pass/fail counts, or an I–MR chart when you can form subgroups, produces wrong limits and false signals. The flowchart follows the classic Shewhart / AIAG chart-selection logic used in manufacturing worldwide.</div>

<div class="rule-block"><span class="rule-lbl">Why you must check it</span>
Wrong chart → wrong control limits → you either chase phantom problems or miss real ones. Auditors and customers expect the chart type to match the data type. Getting this right is the single most common “first decision” in any SPC project.</div>

<div class="rule-block rule-howto"><span class="rule-lbl">How to walk the flowchart</span>
<ol>
<li><b>START</b> — look at one data point. Can you measure it on a continuous scale (length, weight, time, temp)? → <b>left branch</b>. Is it a yes/no or a count of flaws? → <b>right branch</b>.</li>
<li><b>Left (variables):</b> Can you collect back-to-back units as a subgroup (same shift, same material, n readings together)?</li>
<li>If <b>Yes</b> — what is n? 2–9 → <b>X̄–R</b>. 10 or more → <b>X̄–S</b>.</li>
<li>If <b>No</b> — one measurement at a time (batch, destructive test, long cycle) → <b>I–MR</b>.</li>
<li><b>Right (attributes):</b> Is the unit <i>defective</i> (pass/fail) or are you counting <i>defects</i> (flaws on a unit)?</li>
<li>Defective + constant n → <b>np</b>. Defective + changing n → <b>p</b>.</li>
<li>Defects + same inspection unit every time → <b>c</b>. Defects + different unit size → <b>u</b>.</li>
<li>Advanced: if classic p/c charts fire constantly because counts vary more than theory (overdispersion) → <b>Laney p′ / u′</b>. If you need to catch small (0.5–1.5σ) sustained shifts fast → <b>EWMA</b> or <b>CUSUM</b>.</li>
</ol></div>

<div class="rule-block"><span class="rule-lbl">Quick reference table</span>
<table>
<tr><th>Data type</th><th>Situation</th><th>Chart</th><th>Example</th></tr>
<tr><td rowspan="3">Measured<br>(variables)</td><td>Subgroups, n = 2–9</td><td><b>X̄–R</b></td><td>5 diameters every hour</td></tr>
<tr><td>Subgroups, n ≥ 10</td><td><b>X̄–S</b></td><td>20 fill weights per batch</td></tr>
<tr><td>One value at a time</td><td><b>I–MR</b></td><td>Lab result per batch; oven temp</td></tr>
<tr><td rowspan="2">Counted<br>(attributes)</td><td>Pass/fail, constant n</td><td><b>np</b></td><td># bad in each box of 50</td></tr>
<tr><td>Pass/fail, variable n</td><td><b>p</b></td><td>% error invoices, batch sizes differ</td></tr>
<tr><td rowspan="2">Flaw counts</td><td>Same inspection unit</td><td><b>c</b></td><td>scratches per panel</td></tr>
<tr><td>Different unit size</td><td><b>u</b></td><td>defects per m² of fabric</td></tr>
<tr><td>Advanced</td><td>Overdispersion / small shifts</td><td><b>Laney p′/u′</b>, <b>EWMA</b>, <b>CUSUM</b></td><td>See Advanced lessons</td></tr>
</table></div>

<div class="rule-action"><span class="rule-lbl">What you should do</span>
<ol>
<li>Write down your data type (measured vs counted) before opening the Charts page.</li>
<li>Decide if rational subgroups are possible with your process cycle time.</li>
<li>Pick the chart from the flowchart or table above.</li>
<li>In the app: <b>Charts</b> → select that chart type → Load Sample (to confirm the layout) → enter your real data → <b>Analyze ▶</b>.</li>
<li>Always check the <b>R / MR / S chart first</b>, then the average (or p/c) chart.</li>
</ol></div>
</div>

<div class="callout"><b>Rule of thumb:</b> If you can take 3–5 readings back-to-back as a true subgroup, use X̄–R. If you can only get one reading, use I–MR. If you are counting good/bad, use p or np. If you are counting flaws, use c or u. When in doubt, ask: “Is this a measurement or a count?” — that alone eliminates half the charts.</div>`
  },
  {
    title: 'What is SPC?',
    body: `
<p><b>Statistical Process Control (SPC)</b> uses simple statistical methods to monitor, control, and improve a process. Instead of inspecting quality in, SPC builds quality in by understanding variation.</p>
<div class="callout"><b>Shewhart's insight:</b> all processes vary. SPC distinguishes the variation that is <b>always there</b> (common cause) from variation that is <b>not usual</b> (special cause) — and tells you which action to take.</div>

<h4>Why it is important — the business case</h4>
<ul>
<li><b>Money:</b> every defect means scrap, rework, warranty claims, or a lost customer. Prevention costs a fraction of failure — quality leaders estimate every $1 spent on prevention saves many dollars in internal and external failure. SPC finds problems <i>while the batch is running</i> — not after it is shipped.</li>
<li><b>Trust:</b> a stable, capable process means predictable quality and delivery, fewer complaints, and stronger customer relationships.</li>
<li><b>Decisions:</b> SPC replaces opinion and "adjust it because I think it drifted" with data. Nobody argues with a control chart.</li>
<li><b>Compliance:</b> SPC records and capability studies (Cp/Cpk) are required or contractual evidence in IATF 16949, AS9100, and most ISO 9001 supply chains.</li>
</ul>

<h4>Examples where SPC matters</h4>
<ul>
<li><b>Manufacturing:</b> bolt torque, bearing diameter, weld strength, bottle fill weight (500 ml ± 5 ml)</li>
<li><b>Hospital:</b> patient wait time, lab test turnaround, sterilizer temperature</li>
<li><b>Call center:</b> hold time, first-call resolution, billing-error rate</li>
<li><b>Software:</b> defects per release, build time, p95 response time</li>
<li><b>Food & pharma:</b> tablet weight, hardness, moisture content</li>
</ul>

<h4>Scenario to work through: the bottle fill line</h4>
<p><b>Setup:</b> A beverage line fills 500 ml bottles; specification is 495–505 ml. Every hour you measure 5 bottles as one subgroup (rational subgrouping — same hour, same operator). After 25 subgroups you build an X̄–R chart.</p>
<ol>
<li><b>Check stability first:</b> the R chart is stable → the X̄ limits are trustworthy. All X̄ points are inside the limits in a random pattern → the process is <b>in control</b>.</li>
<li><b>Then capability:</b> grand average = 500.1 ml, σ estimated = 1.3 → Cp = 1.28, Cpk = 1.21. The customer requires Cpk ≥ 1.33 — <b>stable but not quite capable</b>: common-cause variation alone is too wide.</li>
<li><b>A signal arrives:</b> at hour 30 a point exceeds the UCL; at hour 32, nine consecutive points sit above the centerline. That is a <b>special cause</b>. Investigation: a new syrup batch (denser) arrived at hour 29, so the flowmeter under-fills.</li>
<li><b>Act in the right order:</b> first quarantine and fix the affected bottles, retrain on the recipe change → back in control. <b>Then</b>, to close the capability gap, management improves the process design (flowmeter auto-calibration, recentered target).</li>
<li><b>Never:</b> "adjust the filler every hour because the last reading moved." That is tampering — Deming's funnel experiment proves it makes variation worse.</li>
</ol>
<div class="callout"><b>Rule of thumb:</b> Chart shows a signal → find the cause, fix it, re-check. Chart stable but incapable → change the process design (management), not the operator. Always ask: "Is this signal or noise?"</div>`
  },
  {
    title: 'Common Cause vs Special Cause',
    body: `
<p>Every process has two kinds of variation. Treating them with the wrong action makes things <b>worse</b>.</p>
<table>
<tr><th></th><th>Common cause</th><th>Special cause</th></tr>
<tr><td>Also called</td><td>Random / natural noise</td><td>Assignalbe / non-random</td></tr>
<tr><td>Example</td><td>Normal tool wear, material lot variation</td><td>Wrong setting, bad operator, broken fixture</td></tr>
<tr><td>Pattern</td><td>Stable, unpredictable in detail</td><td>Shifts, trends, spikes</td></tr>
<tr><td>Action</td><td><b>Change the process design</b> (management)</td><td><b>Act immediately</b> to remove the cause</td></tr>
<tr><td>Reacting blindly</td><td>Tampering — increases variation</td><td>Delay — makes defects</td></tr>
</table>
<div class="callout"><b>Rule of thumb:</b> If the chart is in control → the process is as good as its design allows. Improving beyond that needs a management-led change. If a special cause is present → find and fix it before anything else.</div>`
  },
  {
    title: 'Data Collection & Rational Subgroups',
    body: `
<p>SPC is only as good as the data. Collect data the way the process actually behaves.</p>
<h4>Rational subgrouping</h4>
<ul>
<li>Values within a subgroup should vary only from <b>common causes</b> (same shift, same material lot, back-to-back units)</li>
<li>Subgroups should be far enough apart for <b>special causes</b> to appear between them</li>
<li>Typical subgroup size: <b>4–5</b> for variables charts, sampled every hour or every batch</li>
</ul>
<h4>Good practices</h4>
<ul>
<li>Measure where variation happens — not the easiest place to measure</li>
<li>Record context (operator, machine, material) with each subgroup</li>
<li>Use the same gauge; make sure the measurement system is capable (see MSA lesson)</li>
<li>Sample frequency should be able to detect a shift <b>before</b> many defects are made</li>
</ul>
<div class="callout"><b>Variables data</b> = measured on a continuous scale (length, weight, time). <b>Attribute data</b> = counted (defectives yes/no, number of defects). Variables charts give more information with fewer samples.</div>`
  },
  {
    title: 'X̄–R & X̄–S Charts',
    body: `
<p>For <b>continuous measurements</b> collected in subgroups of 2–10. The average chart tracks the process average; the R or S chart tracks variation inside subgroups.</p>

<h4>Symbols used in every control-chart formula</h4>
${notationLegend()}

<h4>X̄–R chart (subgroup size 2–9)</h4>
<div class="fm-grid">
${fm('X̄ chart — process average', [
  ['CL', `${M.xbb}`],
  ['UCL', `${M.xbb} + ${M.a2} · ${M.rb}`],
  ['LCL', `${M.xbb} − ${M.a2} · ${M.rb}`]
], 'Grand mean ± A₂ × average range. A₂ comes from the constants table.')}
${fm('R chart — within-subgroup spread', [
  ['CL', `${M.rb}`],
  ['UCL', `${M.d4} · ${M.rb}`],
  ['LCL', `${M.d3} · ${M.rb}`]
], 'For n ≤ 6, D₃ = 0 so LCL sits on zero.')}
</div>

<h4>X̄–S chart (subgroup size ≥ 10, or automated data)</h4>
<div class="fm-grid">
${fm('Why S instead of R', [
  ['R', 'uses only 2 values (max − min)'],
  ['S', 'uses every value — more precise when n is large']
], 'Switch to S for n ≥ 10 or when the software computes σ directly.')}
${fm('S chart limits', [
  ['CL', `${M.sb}`],
  ['UCL', `${M.b4} · ${M.sb}`],
  ['LCL', `${M.b3} · ${M.sb}`]
], 'S̄ = average of the subgroup standard deviations.')}
</div>

<h4>Control-chart constants (by subgroup size n)</h4>
${constTable()}

<h4>Interpretation order</h4>
<ol><li>Check the <b>R or S chart first</b>. If variation is out of control, the X̄ limits are not trustworthy.</li>
<li>Then check the X̄ chart for level shifts.</li></ol>
<h4>Worked example: diameter, 12 hourly subgroups of n = 5</h4>
<p>Baseline subgroups 1–7 define the limits (grand mean and R̄ from the stable period only). At <b>subgroup 8</b> the mean steps up ~1.8 mm and stays high for three subgroups, then returns.</p>
${(() => {
  const c = _xbarRCharts();
  return exCard('Paired charts — check R first, then X̄',
    `X̄: ${c.sig.map(i => 'sg ' + (i + 1)).join(', ')} ABOVE UCL ${c.uclX.toFixed(2)} · R: all in control`,
    `X̄ chart (top): subgroups 8–10 sit far above UCL. R chart (bottom): every range stays inside its limits — <b>within-subgroup spread did not change</b>, only the level did.`,
    `<div class="cap-chart-row">${c.xbarSvg}${c.rSvg}</div>`,
    {
      numbers: `${M.a2} = 0.577, ${M.d4} = 2.114 (n = 5). Baseline ${M.xbb} = ${c.xbb.toFixed(2)}, ${M.rb} = ${c.rbar.toFixed(2)} → X̄ limits ${c.lclX.toFixed(2)}–${c.uclX.toFixed(2)}, R UCL = ${c.uclR.toFixed(2)}.`,
      means: 'The process average jumped while the spread within each hour stayed the same. That signature points to a <b>level change</b> (new material lot, setting, fixture, or operator), not a variability problem.',
      why: 'If you only looked at R you would conclude “all good” while every part after subgroup 7 was off-target. Checking X̄ second (but still every run) catches the shift before scrap piles up.',
      action: 'Use the first out-of-control subgroup (8) as the time marker and diff shift logs — setting change, lot change, tool change. Verify with the gauge, fix, return to baseline, then recalculate limits from the new stable period.'
    });
})()}
<div class="callout">In the app: go to <b>Charts</b> → choose X̄–R → load the sample to see both charts and rule violations live.</div>`
  },
  {
    title: 'I–MR Charts',
    body: `
<p>Use an <b>Individuals–Moving Range</b> chart when you cannot form subgroups: destructive tests, batch processes, long cycle times, or one measurement per batch.</p>
<div class="fm-grid">
${fm('I chart — individuals', [
  ['CL', `${M.xb}`],
  ['UCL', `${M.xb} + 2.66 · ${M.mrb}`],
  ['LCL', `${M.xb} − 2.66 · ${M.mrb}`]
], '2.66 = 3/d₂ with d₂ = 1.128 (the constant for n = 2).')}
${fm('MR chart — moving range', [
  ['MR<sub>i</sub>', `|x<sub>i</sub> − x<sub>i−1</sub>|`],
  ['CL', `${M.mrb}`],
  ['UCL', `${M.d4} · ${M.mrb} = 3.267 · ${M.mrb}`],
  ['LCL', '0']
], 'MR̄ = average of the moving ranges; it estimates short-term σ (σ = MR̄ / d₂).')}
</div>
<h4>Cautions</h4>
<ul>
<li>I–MR assumes the data are <b>independent and normally distributed</b>. Autocorrelated or non-normal data need special treatment (EWMA, transformation, different limits)</li>
<li>Because limits use adjacent differences, one bad point creates <b>two</b> out-of-control MR points</li>
<li>Within (short-term) σ ≠ overall σ — this difference is the basis of Cp vs Pp and process sigma level</li>
</ul>
<h4>Worked example: oven temperature, 20 batches, one reading each</h4>
<p>Stable around 100 °C for 10 batches, then the setpoint slips <b>+1.8 °C at batch 11</b> and stays there.</p>
${(() => {
  const c = _imrCharts();
  return exCard('Paired I + MR — the step is visible on both charts',
    `I: batches 11–20 outside limits · MR: spike at the step (point ${c.sigMR.map(i => i + 1).join(', ')})`,
    `I chart (top): every point from 11 onward sits above UCL — a classic sustained shift. MR chart (bottom): one large moving range exactly at the step (batch 10→11), then ranges return to normal because within-segment variation never changed.`,
    `<div class="cap-chart-row">${c.iSvg}${c.mrSvg}</div>`,
    {
      numbers: `${M.xb} = ${c.xbar.toFixed(2)}, ${M.mrb} = ${c.mrbar.toFixed(2)} → I limits ${c.lclI.toFixed(2)}–${c.uclI.toFixed(2)}, MR UCL = ${c.uclMR.toFixed(2)}.`,
      means: 'One MR spike + a run of I points on one side = a <b>level shift</b>, not a variance change. The MR signal marks <i>when</i> it happened; the I run shows it never recovered.',
      why: 'I–MR limits come from short-term MR. A permanent shift inflates overall σ but barely moves MR̄ — capability (Pp) collapses while the MR chart stays quiet. Missing the I run means running off-target all shift.',
      action: 'At the MR spike, freeze the process context (batch 10→11): who was on shift, which lot, which setting. Correct, then verify with 5+ new individuals back inside limits before releasing.'
    });
})()}
<div class="callout"><b>Practice:</b> in the app open <b>Charts → I–MR → Load Sample</b>, then try the same 20 numbers — the app should flag the same points.</div>`
  },
  {
    title: 'Attribute Charts: p, np, c, u',
    body: `
<p>Use attribute charts when data are <b>counts</b>.</p>
<table>
<tr><th>Chart</th><th>Data</th><th>Example</th></tr>
<tr><td>p</td><td>Fraction defective (variable n)</td><td>% of invoices with errors per batch of varying size</td></tr>
<tr><td>np</td><td>Number defective (constant n)</td><td># of bad switches in each box of 50</td></tr>
<tr><td>c</td><td>Defects per unit (constant inspection area)</td><td># of scratches on each panel</td></tr>
<tr><td>u</td><td>Defects per unit (variable unit size)</td><td>defects per m² of fabric</td></tr>
</table>
<h4>Key points</h4>
<ul>
<li>Defect <b>vs</b> defective: a defect is a flaw; a defective is a unit with ≥ 1 flaw</li>
<li>Limits depend on sample size — p and u charts use <b>variable limits</b> when n changes</li>
<li>np and c assume constant sample size</li>
<li>For low defect counts, use Laney p′/u′ charts or Poisson-based limits</li>
</ul>
<h4>Formulas</h4>
<div class="fm-grid">
${fm('p chart — fraction defective', [
  ['p<sub>i</sub>', 'd<sub>i</sub> / n<sub>i</sub>'],
  ['CL', `${M.pb} = Σd<sub>i</sub> / Σn<sub>i</sub>`],
  ['UCL / LCL', `${M.pb} ± 3 · √( ${M.pb}(1 − ${M.pb}) / n<sub>i</sub> )`]
], 'd = number defective in sample i; n<sub>i</sub> = sample size. Limits step when n changes.')}
${fm('np chart — count defective', [
  ['CL', `${M.npb} = n · ${M.pb}`],
  ['UCL / LCL', `${M.npb} ± 3 · √( ${M.npb}(1 − ${M.pb}) )`]
], 'Only valid when every sample has the same n.')}
</div>
<div class="fm-grid">
${fm('c chart — defects per constant unit', [
  ['CL', `${M.cb} = Σc<sub>i</sub> / k`],
  ['UCL / LCL', `${M.cb} ± 3 · √${M.cb}`]
], 'Poisson limits; k = number of samples. LCL cut off at 0.')}
${fm('u chart — defects per unit (variable size)', [
  ['u<sub>i</sub>', 'c<sub>i</sub> / n<sub>i</sub>'],
  ['CL', `${M.ub} = Σc<sub>i</sub> / Σn<sub>i</sub>`],
  ['UCL / LCL', `${M.ub} ± 3 · √( ${M.ub} / n<sub>i</sub> )`]
], 'n<sub>i</sub> = inspection units in sample i (area, length, …).')}
</div>
<h4>Worked examples: 12 samples of the same defect story</h4>
<p>Sample 10 is the bad one for p and np, panel 11 for c, and sample 5 for u — the chart type changes, the signal doesn't (and only the u chart finds the small-area problem).</p>
${(() => {
  const p = _pChart();
  return exCard('p chart — fraction defective, variable n',
    `p̄ = ${(p.pbar * 100).toFixed(1)}% · sample 10 = ${(p.ps[9] * 100).toFixed(0)}% vs UCL ≈ ${(p.uclMax * 100).toFixed(0)}%`,
    `Twelve lots of 50 inspected; lot 10 contained 12 defectives (24%) — far above the red line. All other lots sit below UCL. Because n is constant here the limits look flat; with varying n they would step up/down per lot.`,
    p.svg,
    {
      numbers: `${M.pb} = total defectives / total inspected = 30/600 = ${(p.pbar).toFixed(3)}. UCL per lot ≈ ${M.pb} + 3√( ${M.pb}(1 − ${M.pb}) / n ) ≈ ${(p.uclMax).toFixed(3)}.`,
      means: 'The fraction of bad units in lot 10 is not random noise at your sample size — the binomial model says this almost never happens by chance.',
      why: 'p is what customers feel (% defective shipped). One bad lot that sails through undetected can trigger a return, a line stop, or an 8D.',
      action: 'Quarantine lot 10, pull the defect Pareto (Tools → Pareto), and check lot-specific causes (material, machine, operator). After the fix, keep sampling — if p̄ drops, recalc limits.'
    });
})()}
${(() => {
  const np = _npChart();
  return exCard('np chart — count defective, constant n',
    `n = 50/lot · CL = ${np.cl.toFixed(1)} bad · UCL = ${np.ucl.toFixed(1)} · lot 10 = 12 bad`,
    `Same data as the p chart, plotted as raw counts instead of fractions. Lot 10 = 12 bad switches in the box of 50, above UCL ≈ ${np.ucl.toFixed(1)}. With constant n, p and np always flag the same samples — np is just easier for operators to read.`,
    np.svg,
    {
      numbers: `${M.npb} = n · ${M.pb} = ${np.cl.toFixed(1)}; UCL = ${M.npb} + 3√( ${M.npb}(1 − ${M.pb}) ) = ${np.ucl.toFixed(1)}.`,
      means: 'Count charts are identical signals to fraction charts when n never changes — pick whichever the team reads faster.',
      why: 'Mixed metaphors (% vs counts) cause confusion on the shop floor. Stick to one presentation per chart.',
      action: 'Use np when lot size is fixed; switch to p the moment lot sizes vary (or the limits will be wrong). Same investigation as p: quarantine, Pareto, fix, re-baseline.'
    });
})()}
${(() => {
  const c = _cChart();
  return exCard('c chart — defects per constant unit',
    `c̄ = ${c.cbar.toFixed(1)} · UCL = ${c.ucl.toFixed(1)} · panel 11 = 12 scratches`,
    `Twelve panels, same size, scratches counted on each. Panel 11 has 12 scratches vs UCL ≈ ${c.ucl.toFixed(1)} — a Poisson outlier. Clusters of middling counts (never a single spike) can also trip Nelson rules 5–6.`,
    c.svg,
    {
      numbers: `${M.cb} = total scratches / panels = ${(c.cbar * 12).toFixed(0)}/12 = ${c.cbar.toFixed(2)}; UCL = ${M.cb} + 3√${M.cb} = ${c.ucl.toFixed(2)}.`,
      means: 'Scratch count on one panel is a draw from a Poisson distribution with mean c̄. 12 draws against mean ~4.4 are essentially impossible by chance.',
      why: 'Defect counts drive rework hours even when the unit still “passes”. A defect cluster = one assignable cause hit that panel (handling, fixture, abrasive dust).',
      action: 'Trace which station handled panel 11 (traveler/router history), inspect that station, then keep the c chart running — c is sensitive to inspection consistency too.'
    });
})()}
${(() => {
  const u = _uChart();
  return exCard('u chart — defects per variable unit size',
    `ū = ${u.ubar.toFixed(2)} defects/m² · sample 5 = 8 defects / 10 m² = 0.80 vs UCL ≈ ${u.uclMax.toFixed(2)}`,
    `Inspection area varies (10, 20, 25, 30 m²), so limits step with each sample — larger areas get tighter (lower) limits. Sample 5 has only 8 defects, but they were packed into a tiny 10 m² area: the rate 0.80/m² is far above UCL ≈ ${u.uclMax.toFixed(2)}. Sample 11 (9 defects / 30 m² = 0.30) looks worse in raw count but its rate is fine — that is exactly what a c chart would get wrong.`,
    u.svg,
    {
      numbers: `${M.ub} = total defects / total area = 55/265 = ${u.ubar.toFixed(3)} defects/m²; per-sample UCL = ${M.ub} + 3√( ${M.ub} / n<sub>i</sub> ), max ≈ ${u.uclMax.toFixed(2)} (at the smallest area).`,
      means: 'A u chart is a c chart divided by area — you are comparing <b>rates</b>, not raw counts. The dashed line is the maximum UCL; real limits step up and down with nᵢ.',
      why: 'Without dividing by unit size, a big sample always “looks” worse and a small sample hides defects. Sample 11 has more raw defects than sample 5, but sample 5 is the real problem.',
      action: 'Signal at sample 5 → check that 10 m² area specifically. Keep recording nᵢ every sample; if you forget n, the chart is wrong. For very low rates consider Laney u′.'
    });
})()}
<div class="callout"><b>Practice:</b> in the app <b>Charts → Attribute</b> lets you switch between p / np / c / u with the same counts — confirm that p and np flag the same samples, and that c misses what u catches when unit sizes differ.</div>`
  },
  {
    title: 'Out-of-Control Rules (Nelson)',
    body: `
<p>Control limits alone are not enough. A process can be “inside the lines” yet already broken. Nelson (and Western Electric) rules look for <b>patterns</b> that random noise almost never produces — each one is a clue that a <b>special cause</b> is acting on the process.</p>
<h4>How to use this guide</h4>
<p>For every rule below you get four short blocks:</p>
<ul>
<li><b>Pattern</b> — what the points look like on the chart</li>
<li><b>What it means</b> — the statistical meaning in plain language</li>
<li><b>Why it matters</b> — what can go wrong if you ignore it</li>
<li><b>Action</b> — what to do next, in the right order</li>
</ul>
<div class="callout"><b>Remember:</b> a rule is a <i>clue</i>, not a verdict. Investigate first. Never adjust the process just to “make the chart look good” — that hides the real problem and makes variation worse.</div>
<ol class="nelson-rules">
${NELSON_RULES.map(r => `
<li class="nelson-rule" data-rule="${r.id}">
  <div class="rule-head"><b>Rule ${r.id}:</b> ${r.title}</div>
  ${NELSON_DIAG[r.id - 1]}
  <div class="rule-detail">
    <div class="rule-block"><span class="rule-lbl">Pattern</span> ${r.pattern}</div>
    <div class="rule-block"><span class="rule-lbl">What it means</span> ${r.means}</div>
    <div class="rule-block"><span class="rule-lbl">Why it matters</span> ${r.why}</div>
    <div class="rule-block rule-howto"><span class="rule-lbl">How to investigate</span> ${r.how}</div>
    <div class="rule-action"><span class="rule-lbl">Action</span> ${r.action}</div>
  </div>
</li>`).join('')}
</ol>
<div class="callout"><b>Warning:</b> more rules = more false alarms. Start with rules 1–3 in production; add 5–6 as early warnings once your measurement system is proven. Rules 7–8 are almost always a <i>data</i> problem, not a process problem — fix subgrouping or the gauge first. Never stop the line for a single weak-pattern signal without investigation.</div>`
  },
{
    title: 'Capability: Cp, Cpk, Pp, Ppk',
    body: `
<p>Control charts answer <i>"is the process stable?"</i>. Capability answers <i>"can it meet specifications?"</i> — you need <b>both</b>.</p>

<h4>Formulas (quick reference)</h4>
<div class="fm-grid">
${fm('Capability — what the machine can do', [
  ['Cp', `(USL − LSL) / (6 · ${M.sw})`],
  ['Cpk', `min( USL − ${M.xb}, ${M.xb} − LSL ) / (3 · ${M.sw})`]
], 'Uses short-term σ (from subgroups or MR̄/d₂). Ignores centering (Cp) or includes it (Cpk).')}
${fm('Performance — what the customer gets', [
  ['Pp', `(USL − LSL) / (6 · ${M.so})`],
  ['Ppk', `min( USL − ${M.xb}, ${M.xb} − LSL ) / (3 · ${M.so})`]
], 'Same formulas with long-term σ = stdev of ALL data.')}
</div>
${fm('Where the two σ values come from', [
  [`${M.sw}`, `range method: ${M.mrb} / ${M.d2} — or subgroup σ pooled`],
  [`${M.so}`, 'standard deviation of the complete data set (all points, all time)']
], 'σ<sub>within</sub> ≤ σ<sub>overall</sub> always — drift between subgroups inflates the overall value.')}

<h4>Reading the numbers</h4>
<ul>
<li>Cpk &lt; 1.00: process cannot reliably meet specs — act now</li>
<li>1.00 – 1.33: marginal; reduce variation</li>
<li>≥ 1.33: generally considered capable</li>
<li>≈ 2.00: Six Sigma level (≈ 3.4 defects per million after 1.5σ shift)</li>
</ul>

<h4>Worked examples with charts</h4>
<p>Four typical factory situations. Each chart is a bell curve of the process with the specification limits (dashed red) and the process mean (solid). The shaded red tails show estimated scrap.</p>

<div class="cap-examples">
${CAP_EXAMPLES.map(ex => `
<div class="cap-example">
  <div class="cap-ex-title"><b>${ex.title}</b></div>
  <div class="cap-ex-badge">${ex.badge}</div>
  <div class="cap-ex-story">${ex.story}</div>
  ${capCurveSVG(ex)}
  <div class="guide-blocks">
    <div class="rule-block"><span class="rule-lbl">Numbers</span> ${ex.numbers}</div>
    <div class="rule-block"><span class="rule-lbl">What it means</span> ${ex.means}</div>
    <div class="rule-block"><span class="rule-lbl">Why it matters</span> ${ex.why}</div>
    <div class="rule-action"><span class="rule-lbl">Action</span> ${ex.action}</div>
  </div>
</div>`).join('')}
</div>

<h4>Cp/Cpk vs Pp/Ppk — which should you report?</h4>
<table>
<tr><th></th><th>Cp / Cpk</th><th>Pp / Ppk</th></tr>
<tr><td>σ used</td><td>Within-subgroup (short-term)</td><td>Overall, all points (long-term)</td></tr>
<tr><td>Answers</td><td>“What can this machine do if perfectly set?”</td><td>“What does the customer actually receive?”</td></tr>
<tr><td>Use for</td><td>Machine capability studies (run-at-rate)</td><td>Ongoing performance / PPAP / customer reports</td></tr>
<tr><td>Red flag</td><td>Cpk ≫ Ppk → drifts between shifts</td><td>Ppk is the number customers feel</td></tr>
</table>

<div class="callout"><b>Cp high but Cpk low</b> = precise but off-center → adjust the mean (cheap win). <b>Both low</b> = too wide → reduce variation (harder). <b>Cpk high but Ppk low</b> = stable within a shift but drifting between shifts → stabilize setups. Capability numbers from an <b>out-of-control</b> process are meaningless — fix stability first (Charts page), then study capability.</div>

<div class="callout"><b>Practice in the app:</b> Open <b>Cpk</b> → Load Sample → enter LSL 4.85, USL 5.15 → Analyze. Compare the histogram with the curves above. Then change one data point to a high value and watch Cpk drop while Cp stays put.</div>`
  },
  {
    title: '8 Steps to Implement SPC',
    body: `
<p>You now know the charts and the rules. This is the <b>rollout sequence</b> — the order that separates projects that stick from projects that die after the first month. Each step has an output you can verify before moving on.</p>
<div class="flow-wrap">
${spcFlowSVG()}
</div>
<h4>The roadmap</h4>
<table>
<tr><th>#</th><th>Step</th><th>Output / done when…</th></tr>
<tr><td>1</td><td>Pick the right process &amp; characteristic</td><td>One critical-to-quality (CTQ) characteristic chosen with a business reason</td></tr>
<tr><td>2</td><td>Prove the measurement system (MSA)</td><td>%GRR ≤ 10% (≤30% by contract), ndc ≥ 5</td></tr>
<tr><td>3</td><td>Collect baseline data</td><td>20–25 rational subgroups collected under normal conditions</td></tr>
<tr><td>4</td><td>Choose the chart &amp; compute trial limits</td><td>Correct chart type for the data; UCL/CL/LCL calculated from baseline</td></tr>
<tr><td>5</td><td>Run the chart in real time</td><td>Points plotted as the process runs, not reconstructed later</td></tr>
<tr><td>6</td><td>Interpret signals with a reaction plan</td><td>Team knows <i>what to do</i> the moment a rule fires</td></tr>
<tr><td>7</td><td>Remove special causes, then reduce common cause</td><td>Chart stable first; then capability improved against specs</td></tr>
<tr><td>8</td><td>Standardize, audit &amp; re-baseline</td><td>Documented ownership, periodic limit review, MSA re-run</td></tr>
</table>
<div class="guide-blocks">
<div class="rule-block"><span class="rule-lbl">Step 1 — Pick the process &amp; characteristic</span> Choose a process that hurts (scrap, escapes, customer complaints) and <b>one</b> CTQ characteristic per chart — the dimension or count the customer feels. Rule: if you cannot say <i>why</i> this characteristic matters to quality or cost, chart something else. Resist charting everything; 3 well-run charts beat 15 ignored ones.</div>
<div class="rule-block"><span class="rule-lbl">Step 2 — Prove the measurement system first</span> Run a Gage R&R (numeric data) or attribute agreement study (go/no-go) <b>before</b> baseline collection. If %GRR &gt; 10% or ndc &lt; 5, the chart will measure your gauge, not your process. Fix the gauge, re-run, then continue. Skipping this is the most common reason SPC projects fail silently.</div>
<div class="rule-block"><span class="rule-lbl">Step 3 — Collect baseline data</span> 20–25 rational subgroups under normal, stable conditions (see Data Collection lesson). Do not cherry-pick a good week and do not include known upsets — trial limits must reflect the process as it truly runs. Record conditions (shift, material lot, machine) alongside the numbers.</div>
<div class="rule-block"><span class="rule-lbl">Step 4 — Choose the chart &amp; compute trial limits</span> Use the flowchart lesson: measured or counted? subgroups or individuals? Constants (A₂, D₄, d₂…) come from the subgroup size. Trial limits come from your baseline only — never from spec limits. If the baseline is already out of control, investigate those points <b>before</b> freezing the limits, or you bake the upsets into the lines.</div>
<div class="rule-block rule-howto"><span class="rule-lbl">Step 5 — Run it in real time</span> Plot points as the process runs — that is the whole point of <i>control</i>. Reconstructing last week's data on Friday detects nothing. Someone must look at the chart during the shift, not in a monthly report. In this app: Charts page → your chart type → Analyze as data arrives.</div>
<div class="rule-block rule-howto"><span class="rule-lbl">Step 6 — Interact with a reaction plan</span> A signal without a defined reaction is noise. Document: who is notified, containment (stop/hold/quarantine), investigation (5-why / Ishikawa), corrective action, and verification on the chart afterward. Start with Nelson rules 1–3 in production. Also train the <i>in-control</i> reaction: do not adjust the process just because a point moved inside limits — that is tampering.</div>
<div class="rule-block"><span class="rule-lbl">Step 7 — Remove special causes, then reduce common cause</span> Two phases, two owners: special causes → the floor team fixes the assignable cause and the chart returns to control. Common cause → only a management-led change (better machine, new fixture, redesigned process) reduces the spread. Then — and only then — study capability (Cp/Cpk). Stability first, capability second; the order cannot be reversed.</div>
<div class="rule-action"><span class="rule-lbl">Step 8 — Standardize, audit &amp; re-baseline</span> Write the chart, sampling plan, and reaction plan into the control plan. Assign ownership (who plots, who reacts, who reviews). Re-compute limits when the process legitimately changes (improvement, new machine) — not to make signals disappear. Re-run MSA annually or after gauge repair. Extend to the next process only after this one has run stable for a sustained period.</div>
</div>
<div class="callout"><b>Anti-patterns to avoid:</b> charting before MSA · limits from spec instead of baseline · reacting to every point (tampering) · charts with no named owner · re-baselining to hide signals · declaring victory on stability without checking capability. If your rollout stalls, one of these is usually why.</div>
<div class="callout"><b>Sequence check:</b> Steps 1–2 choose <i>what</i> to watch and prove you can trust the data · Steps 3–4 build the chart · Steps 5–6 run and react · Steps 7–8 improve and sustain. Skipping sideways (e.g. jumping to Step 7 charts without Step 2 MSA) guarantees a rework later.</div>`
  }
];

// ---------------------------------------------------------------------------
// Control-chart example SVG (points + optional overlay + limits + shift marker)
// cfg: { data, cl, ucl, lcl, signalAt, shiftAt, overlay:{pts,color,label},
//        badge, label, yMin, yMax }
function ctrlChartSVG(cfg) {
  const W = 520, H = 200, padL = 48, padR = 16, padT = 26, padB = 34;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const n = cfg.data.length;
  const sx = i => padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);

  // y range: data + limits + overlay, padded
  const allVals = [...cfg.data, cfg.ucl, cfg.lcl, cfg.cl];
  if (cfg.overlay) allVals.push(...cfg.overlay.pts);
  let yMin = Math.min(...allVals), yMax = Math.max(...allVals);
  const pad = (yMax - yMin) * 0.12 || 1;
  yMin -= pad; yMax += pad;
  const sy = v => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const line = pts => pts.map((v, i) => sx(i).toFixed(1) + ',' + sy(v).toFixed(1)).join(' ');
  const sig = cfg.signalAt;
  const sigSet = new Set(Array.isArray(sig) ? sig : sig != null ? [sig] : []);

  const pts = cfg.data.map((v, i) =>
    `<circle cx="${sx(i).toFixed(1)}" cy="${sy(v).toFixed(1)}" r="${sigSet.has(i) ? 5 : 3.2}" class="ctrl-pt${sigSet.has(i) ? ' ctrl-sig' : ''}"/>`
  ).join('');

  const overlayPath = cfg.overlay
    ? `<polyline points="${line(cfg.overlay.pts)}" fill="none" stroke="${cfg.overlay.color}" stroke-width="2.2" class="ctrl-ovl"/>` +
      cfg.overlay.pts.map((v, i) => {
        const ovSig = cfg.overlay.signalAt;
        const on = ovSig != null && (Array.isArray(ovSig) ? ovSig.includes(i) : i === ovSig);
        return on
          ? `<circle cx="${sx(i).toFixed(1)}" cy="${sy(v).toFixed(1)}" r="5" fill="${cfg.overlay.color}" stroke="#fff" stroke-width="1.5"/>`
          : '';
      }).join('')
    : '';

  const shiftLine = cfg.shiftAt != null && cfg.shiftAt > 0
    ? `<line x1="${sx(cfg.shiftAt - 0.5)}" y1="${padT}" x2="${sx(cfg.shiftAt - 0.5)}" y2="${padT + plotH}" class="ctrl-shift"/>
       <text x="${sx(cfg.shiftAt - 0.5) + 4}" y="${padT + 11}" class="ctrl-shift-t">shift</text>`
    : '';

  const xTicks = `<text x="${sx(0).toFixed(1)}" y="${padT + plotH + 13}" text-anchor="middle" class="ctrl-ax-t">1</text>` +
    (n > 1 ? `<text x="${sx(n - 1).toFixed(1)}" y="${padT + plotH + 13}" text-anchor="middle" class="ctrl-ax-t">${n}</text>` : '');
  const xTitle = `<text x="${(padL + plotW / 2).toFixed(1)}" y="${H - 4}" text-anchor="middle" class="ctrl-ax-title">${cfg.xLabel || 'Sample'}</text>`;
  const yTitle = `<text transform="translate(11,${(padT + plotH / 2).toFixed(1)}) rotate(-90)" text-anchor="middle" class="ctrl-ax-title">${cfg.yLabel || 'Value'}</text>`;

  return `<svg viewBox="0 0 ${W} ${H}" class="ctrl-svg" role="img" aria-label="${cfg.label || 'control chart example'}">
  <rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" class="ctrl-plot"/>
  <line x1="${padL}" y1="${sy(cfg.ucl)}" x2="${padL + plotW}" y2="${sy(cfg.ucl)}" class="ctrl-lim"/>
  <text x="${padL - 4}" y="${sy(cfg.ucl) + 4}" text-anchor="end" class="ctrl-lim-t">UCL</text>
  <line x1="${padL}" y1="${sy(cfg.cl)}" x2="${padL + plotW}" y2="${sy(cfg.cl)}" class="ctrl-cl"/>
  <text x="${padL - 4}" y="${sy(cfg.cl) + 4}" text-anchor="end" class="ctrl-cl-t">CL</text>
  <line x1="${padL}" y1="${sy(cfg.lcl)}" x2="${padL + plotW}" y2="${sy(cfg.lcl)}" class="ctrl-lim"/>
  <text x="${padL - 4}" y="${sy(cfg.lcl) + 4}" text-anchor="end" class="ctrl-lim-t">LCL</text>
  ${shiftLine}
  <polyline points="${line(cfg.data)}" fill="none" class="ctrl-line"/>
  ${pts}
  ${overlayPath}
  <text x="${padL}" y="16" class="ctrl-badge">${cfg.badge || ''}</text>
  ${xTicks}${xTitle}${yTitle}
</svg>`;
}

// Shared demo: 0–10 stable (μ=100, σ=1), then +1σ shift at point 11 (index 10)
const ADV_X = [
  100.1, 99.6, 100.4, 99.8, 100.2, 100.5, 99.7, 100.3, 100.0, 99.9,
  100.9, 101.4, 100.7, 101.2, 101.5, 100.8, 101.3, 101.1, 101.6, 101.0
];
function _ewmaSeries(data, lambda, mu0) {
  let z = mu0;
  return data.map(x => { z = lambda * x + (1 - lambda) * z; return +z.toFixed(4); });
}
function _cusumSeries(data, k, sigma, mu0) {
  let s = 0;
  return data.map(x => { s = Math.max(0, s + x - (mu0 + k * sigma)); return +s.toFixed(4); });
}

const ADV_CHART_EXAMPLES = [
  {
    id: 'i',
    title: 'Chart 1 — Shewhart I-chart (baseline): the small shift hides',
    badge: 'I-chart: NO signal — all points inside limits',
    chart: {
      data: ADV_X, cl: 100, ucl: 103, lcl: 97,
      shiftAt: 11, signalAt: null,
      yLabel: 'Value', xLabel: 'Sample',
      badge: 'I-chart · 1σ shift at point 11 · no points beyond ±3σ'
    },
    story: 'Same 20 samples as the other two charts. Points 1–10 are stable at 100; at point 11 the process mean steps up by 1σ (new tool offset). UCL/LCL = 100 ± 3·1 = 103 / 97.',
    means: 'Every individual point is still inside ±3σ, so the classic I-chart “rule 1” stays quiet. A 1σ step is real but small compared with 3σ limits — that is exactly where Shewhart charts are weak.',
    why: 'Operators watching only this chart will keep running. Ten units of scrap accumulate every sampling period while the chart still looks green.',
    action: 'Do not stop at the I-chart for small shifts. Layer EWMA or CUSUM on the same data (next charts). Also run Nelson rule 2 (9 points on one side) — it eventually fires, but only after ~9 points.'
  },
  {
    id: 'ewma',
    title: 'Chart 2 — EWMA (λ = 0.2, L = 2): smoothed line catches it',
    badge: 'EWMA: SIGNAL at point 15 — 5 points after the shift',
    chart: (() => {
      const z = _ewmaSeries(ADV_X, 0.2, 100);
      const ucl = 100 + 2 * Math.sqrt(0.2 / 1.8); // ≈ 100.667
      const sig = z.findIndex((v, i) => i >= 10 && v > ucl);
      return {
        data: ADV_X, cl: 100, ucl: +ucl.toFixed(3), lcl: +(200 - ucl).toFixed(3),
        shiftAt: 11, signalAt: null,
        overlay: { pts: z, color: '#7c3aed', label: 'EWMA', signalAt: sig },
        yLabel: 'Value', xLabel: 'Sample',
        badge: `EWMA z-series (purple) · crosses UCL ≈ ${ucl.toFixed(3)} at point ${sig + 1}`
      };
    })(),
    story: 'z<sub>0</sub> = 100, λ = 0.2 (each new point gets 20% weight, the past fades). Purple line = EWMA. Steady-state limits = 100 ± L·σ·√(λ/(2−λ)) with L = 2 → ±0.667.',
    means: 'The EWMA is a weighted moving average that remembers the recent past. After the shift it climbs steadily and crosses the upper limit at point 15 — only 5 points after the cause appeared, while the raw points (gray) never leave ±3σ.',
    why: 'EWMA turns many weak hints into one strong signal. It is robust to non-normal data and is the standard “small shift detector” in industry.',
    action: 'When EWMA signals: investigate the shift cause (setup, tool offset, material lot). Reset z after the cause is removed. Tune λ: 0.05–0.1 for very small shifts; 0.2 default; 0.4+ approaches a Shewhart chart.'
  },
  {
    id: 'cusum',
    title: 'Chart 3 — CUSUM (k = 0.5, h = 4): accumulation crosses h·σ',
    badge: 'CUSUM: SIGNAL at point 17 — S₊ = 4.3 > h·σ = 4',
    chart: (() => {
      const s = _cusumSeries(ADV_X, 0.5, 1, 100);
      const sig = s.findIndex((v, i) => i >= 10 && v > 4);
      return {
        data: s, cl: 0, ucl: 4, lcl: -0.8,
        shiftAt: 11, signalAt: sig,
        yLabel: 'S₊', xLabel: 'Sample',
        badge: `CUSUM S₊ chart · decision line h·σ = 4 · signal at point ${sig + 1}`
      };
    })(),
    story: 'k = 0.5σ allowance (ignores noise), h = 4 decision interval. S<sub>+</sub> = max(0, S<sub>+</sub> + x<sub>i</sub> − 100.5) each step. This chart plots <b>only S₊</b> (the raw points are in Chart 1). Orange dashes = where the process shifted.',
    means: 'Each point above target + 0.5σ adds to S₊; in-control noise subtracts, but max(0, …) keeps it from going negative. After the shift, S₊ climbs in a near-straight ramp and crosses the red decision line h·σ = 4 at point 17 — 7 points after the cause. The ramp <i>starts</i> at point 11, dating the cause.',
    why: 'CUSUM is the optimal detector for a sustained small shift. The ramp start also tells you <i>when</i> the shift began — match it against shift logs, tool changes, or material lots.',
    action: 'On signal: use the ramp start as the time window of the cause, fix it, then reset S₊ = 0. Tune h = 4–5 (smaller h → faster, more false alarms); k = half the shift you want to catch (k = 0.5σ for a 1σ shift).'
  }
];

const ADVANCED_LESSONS = [
  {
    title: 'Advanced Charts: EWMA & CUSUM',
    body: `
<p>Shewhart charts (X̄, I) are great at spotting <b>large</b> shifts (≥ 2σ) but slow on <b>small, sustained</b> shifts. EWMA and CUSUM accumulate evidence and detect shifts of 0.5–1.5σ much faster.</p>

<h4>EWMA — Exponentially Weighted Moving Average</h4>
${fm('Recursion & steady-state limits', [
  ['z<sub>i</sub>', 'λ · x<sub>i</sub> + (1 − λ) · z<sub>i−1</sub>'],
  ['z<sub>0</sub>', 'target (or x<sub>1</sub>)'],
  ['UCL / LCL', `μ<sub>0</sub> ± L · σ · √( λ / (2 − λ) )`]
], 'λ = 0.2 default: small λ → sensitive to small shifts, slower reaction; large λ → behaves like a Shewhart chart. Limits are wider for the first few points (transient), then settle. Use L = 2.7–3.0 (L = 2 for early warning). Robust to non-normality.')}

<h4>CUSUM — Cumulative Sum</h4>
<div class="fm-grid">
${fm('One-sided accumulators', [
  ['S<sub>+</sub>', 'max( 0, S<sub>+</sub> + x<sub>i</sub> − (μ<sub>0</sub> + k·σ) )'],
  ['S<sub>−</sub>', 'max( 0, S<sub>−</sub> + (μ<sub>0</sub> − k·σ) − x<sub>i</sub> )']
], 'S₋ mirrors S₊ below the target.')}
${fm('Signal rule & speed', [
  ['signal', 'S<sub>+</sub> &gt; h·σ  (or S<sub>−</sub> &gt; h·σ)'],
  ['time to signal', '≈ h / ( shift/σ − k ) points']
], 'k = half the shift you want to catch (k = 0.5 for a 1σ shift); h = 4–5 decision interval. k·σ is the “allowance” that stops noise accumulating.')}
</div>

<div class="callout"><b>Same data, three charts below.</b> The process steps up by <b>1σ at point 11</b>. Only the advanced charts see it in time.</div>

<h4>Worked examples — one shift, three views</h4>

<div class="cap-examples">
${ADV_CHART_EXAMPLES.map(ex => `
<div class="cap-example">
  <div class="cap-ex-title"><b>${ex.title}</b></div>
  <div class="cap-ex-badge">${ex.badge}</div>
  <div class="cap-ex-story">${ex.story}</div>
  ${ctrlChartSVG(ex.chart)}
  <div class="guide-blocks">
    <div class="rule-block"><span class="rule-lbl">What it means</span> ${ex.means}</div>
    <div class="rule-block"><span class="rule-lbl">Why it matters</span> ${ex.why}</div>
    <div class="rule-action"><span class="rule-lbl">Action</span> ${ex.action}</div>
  </div>
</div>`).join('')}
</div>

<h4>When to use which</h4>
<table>
<tr><th></th><th>I / X̄ Shewhart</th><th>EWMA</th><th>CUSUM</th></tr>
<tr><td>Best at</td><td>Large shifts, individual spikes</td><td>Small smooth shifts, non-normal data</td><td>Sustained small shifts (optimal)</td></tr>
<tr><td>Memory</td><td>None (only the last point)</td><td>Exponential (recent past)</td><td>Full since last reset</td></tr>
<tr><td>Tells you when</td><td>Exact point</td><td>Gradual climb</td><td>Ramp start = cause window</td></tr>
<tr><td>Tune with</td><td>3σ limits</td><td>λ and L</td><td>k and h</td></tr>
</table>

<div class="callout"><b>Practice in the app:</b> Charts → chart type <b>I-MR</b> or <b>EWMA / CUSUM</b> → paste the 20 numbers above (or Load Sample) → Analyze. Compare: I-chart quiet, EWMA/CUSUM flagged. Use the zoom buttons on the chart to inspect the signal region.</div>`
  },
  {
    title: 'Advanced Attribute Charts: Laney p′ & u′',
    body: `
<p>Real attribute data often shows <b>overdispersion</b>: the counts vary more than binomial/Poisson theory predicts (clusters, hard-to-inspect spots, varying difficulty). Classic p and c charts then give false alarms.</p>
<h4>Why it happens</h4>
<ul>
<li>Defects cluster (a bad batch of material, one operator, one mold)</li>
<li>Inspection "zones" differ in difficulty</li>
<li>Sample sizes large → even tiny model violations become huge limits violations</li>
</ul>
<h4>Laney's fix</h4>
${fm('Three steps to p′ / u′', [
  ['step 1', 'standardized residuals z<sub>i</sub> from the classic p or c chart'],
  ['step 2', `σ<sub>z</sub> = moving range of the z<sub>i</sub> / ${M.d2} — the overdispersion factor`],
  ['step 3', 'widen all limits by σ<sub>z</sub> → p′ (Laney p) or u′ (Laney u)']
], 'σz ≈ 1 → classic limits were fine · σz ≫ 1 → widen (honest chart) · σz &lt; 1 → tighten (rare).')}

<h4>Worked example 1 — p vs p′: 12 lots of 500 switches</h4>
<p>Baseline lots run ~4% defective. Lots 5–8 all came from one suspect material lot and jumped to ~14–15%. Binomial 3σ limits are far narrower than that spread — so the classic chart alarms on almost everything.</p>
${(() => {
  const c = _laneyPExample();
  const lotList = a => !a.length ? 'none'
    : a.length === 1 ? 'lot ' + (a[0] + 1)
    : a.slice(0, -1).map(i => 'lot ' + (i + 1)).join(', ') + ' and lot ' + (a[a.length - 1] + 1);
  return exCard('Classic p (top) vs Laney p′ (bottom)',
    `classic p: ${c.classicSig.length} of 12 samples signal · Laney p′: ${c.laneySig.length} still signal · σz = ${c.sigmaZ.toFixed(2)}`,
    `Top: classic p chart with binomial 3σ limits — quiet lots dip below LCL (“too good”) and the whole material-lot cluster sits above UCL: ${c.classicSig.length} alarms from one special cause. Bottom: Laney p′ widens every limit by σz = ${c.sigmaZ.toFixed(2)} — the false alarms disappear; only ${lotList(c.laneySig)} still flag.`,
    `<div class="cap-chart-row">${c.classicSvg}${c.laneySvg}</div>`,
    {
      numbers: `p̄ = Σd / Σn = ${c.ubar.toFixed(3)}. Classic UCL ≈ ${c.uclMax.toFixed(3)}, LCL ≈ ${c.lclMin.toFixed(3)}. σz = MR̄/d₂ = ${c.sigmaZ.toFixed(2)} → Laney UCL ≈ ${c.uclLmax.toFixed(3)} (all limits ×${c.sigmaZ.toFixed(2)} wider).`,
      means: 'The binomial model treats every lot as an independent coin flip with the same p. Lots 5–8 share one cause (the material lot), so they move together — that clustering is overdispersion, and it blows σz up to ~1.9.',
      why: 'On the classic chart the team would chase alarms on almost every lot, including quiet ones. Alarm fatigue follows, and then real signals get ignored. The classic limits were not “wrong math” — they answered the wrong question (lot-to-lot noise only).',
      action: 'When σz &gt; ~1.2, monitor with p′ instead of p. Still investigate the cluster: pull the material lot behind lots 5–8, fix it, then recompute — σz should fall toward 1 and the classic limits become usable again.'
    });
})()}

<h4>Worked example 2 — u vs u′: 12 fabric rolls</h4>
<p>Defects per m² on rolls 1–8 (Machine A) stay low and steady. Rolls 9–12 (Machine B) run ~3× higher. Unit size varies (200 or 250 m²), so the u chart uses per-sample limits.</p>
${(() => {
  const c = _laneyUExample();
  return exCard('Classic u (top) vs Laney u′ (bottom)',
    `classic u: ${c.classicSig.length} of 12 samples signal · Laney u′: ${c.laneySig.length} signal · σz = ${c.sigmaZ.toFixed(2)}`,
    `Top: classic u chart — Machine A’s low rolls fall below LCL and Machine B’s rolls sit above UCL: ${c.classicSig.length} alarms, almost one per sample. Bottom: Laney u′ widens limits by σz = ${c.sigmaZ.toFixed(2)} → ${c.laneySig.length === 0 ? 'every point sits inside; the machine-to-machine difference is now visible as a clean two-level pattern' : 'only the most extreme rolls remain'}.`,
    `<div class="cap-chart-row">${c.classicSvg}${c.laneySvg}</div>`,
    {
      numbers: `ū = Σdefects / Σm² = ${c.ubar.toFixed(3)} /m². Classic UCL ≈ ${c.uclMax.toFixed(3)}, LCL ≈ ${c.lclMin.toFixed(3)}. σz = ${c.sigmaZ.toFixed(2)} → Laney UCL ≈ ${c.uclLmax.toFixed(3)}.`,
      means: 'Poisson limits assume defects scatter randomly over every roll at the same rate. Machine B is simply a worse machine — two populations mixed in one chart. σz absorbs that difference into wider limits so the chart stops lying about “surprises.”',
      why: 'Without dividing by unit size the big rolls always look worse; with classic u limits the split between machines creates alarms everywhere. Either way the team cannot see which samples are genuinely unusual.',
      action: 'Use u′ while you work the real fix: chart Machine A and Machine B on separate u charts, or repair Machine B. Once both machines behave alike, σz returns toward 1.'
    });
})()}

<div class="callout"><b>In the app:</b> Charts → chart type <b>Laney p′ / Laney u′</b> → Load Sample → Analyze. The stats grid shows σz and “limits widened for overdispersion” when it matters. Always investigate <b>why</b> overdispersion exists — Laney charts prevent false alarms, but the real opportunity is removing the clustering cause.</div>`
  },
  {
    title: 'Gage R&R — Reading the Output',
    body: `
<p>Before you can believe a control chart or capability study, the measurement system must be studied with a <b>Gage R&R</b>: several parts × several operators × repeated trials.</p>
<h4>Worked example — caliper study: 5 parts × 3 operators × 2 trials</h4>
<p>Five parts were taken from normal production so they span the real process range (≈96.5–103.6 mm). Three operators each measured every part twice, in random order, without seeing each other's readings — the standard MSA study layout.</p>
${(() => {
  if (typeof SPC === 'undefined') return '';
  const rows = [
    [1, 1, 96.55, 96.70], [1, 2, 97.10, 97.00], [1, 3, 97.60, 97.50],
    [2, 1, 98.05, 98.20], [2, 2, 98.60, 98.45], [2, 3, 99.05, 99.20],
    [3, 1, 99.55, 99.70], [3, 2, 100.15, 100.00], [3, 3, 100.55, 100.70],
    [4, 1, 101.05, 101.20], [4, 2, 101.60, 101.75], [4, 3, 102.05, 102.20],
    [5, 1, 102.60, 102.70], [5, 2, 103.10, 102.95], [5, 3, 103.45, 103.60]
  ];
  const r = SPC.gageRR(rows);
  const table = `<table><tr><th>Part</th><th>Op</th><th>Trial 1</th><th>Trial 2</th></tr>` +
    rows.map(c => `<tr><td>${c[0]}</td><td>${c[1]}</td><td>${c[2].toFixed(2)}</td><td>${c[3].toFixed(2)}</td></tr>`).join('') +
    `</table>`;
  const sd = label => (r.components.find(c => c[0].startsWith(label)) || [null, 0, NaN])[2].toFixed(4);
  const stats = `<div class="stats-grid">
    <div class="stat"><div class="val">${sd('Repeat')}</div><div class="lbl">Repeat (EV) σ</div></div>
    <div class="stat"><div class="val">${sd('Reproduc')}</div><div class="lbl">Repro (RV) σ</div></div>
    <div class="stat"><div class="val">${sd('Gage R&R')}</div><div class="lbl">GRR σ</div></div>
    <div class="stat"><div class="val">${sd('Parts')}</div><div class="lbl">Parts (PV) σ</div></div>
    <div class="stat"><div class="val">${r.grrPct.toFixed(1)}%</div><div class="lbl">%GRR</div></div>
    <div class="stat"><div class="val">${r.ndc}</div><div class="lbl">ndc</div></div>
    <div class="stat"><div class="val">${r.parts}×${r.operators}×${r.trials}</div><div class="lbl">Study</div></div>
  </div>`;
  const bar = (label, pct, isPV) => {
    const cls = isPV ? (pct >= 50 ? 'good' : 'warn') : (pct <= 10 ? 'good' : pct <= 30 ? 'warn' : 'bad');
    return `<div class="gbar"><span>${label}</span><div class="track"><div class="fill ${cls}" style="width:${Math.min(100, pct).toFixed(1)}%"></div></div><span class="num">${pct.toFixed(1)}%</span></div>`;
  };
  const bars = `<div class="gage-bars">${bar('%EV repeatability', r.evPct, false)}${bar('%RV reproducibility', r.rvPct, false)}${bar('%GRR total', r.grrPct, false)}${bar('%PV parts', r.pvPct, true)}</div>`;
  return exCard(`Study results — ${r.verdict.cls === 'ok' ? 'acceptable' : r.verdict.cls === 'warn' ? 'marginal' : 'unacceptable'}`,
    `badge: %GRR = ${r.grrPct.toFixed(1)}% · ndc = ${r.ndc} · ${r.verdict.msg}`,
    `Each operator is consistent with himself (EV only ${r.evPct.toFixed(1)}%), but the operators disagree with each other: on part 3, Op 1 read ${rows[6][2].toFixed(2)}/${rows[6][3].toFixed(2)} while Op 3 read ${rows[8][2].toFixed(2)}/${rows[8][3].toFixed(2)} — about 1 mm of pure bias on the same part. Reproducibility (${r.rvPct.toFixed(1)}%) dominates the gauge error, and ndc = ${r.ndc} barely separates the parts.`,
    table + stats + bars,
    {
      numbers: `σ(EV) = ${sd('Repeat')}, σ(RV) = ${sd('Reproduc')}, σ(GRR) = ${sd('Gage R&R')}, σ(parts) = ${sd('Parts')}. %GRR = ${r.grrPct.toFixed(1)}% (marginal: 10–30%), %PV = ${r.pvPct.toFixed(1)}% — parts still dominate, just barely.`,
      means: r.reproducibilityNote === 'operator-to-operator bias dominates reproduction error'
        ? 'Reproducibility comes from operator-to-operator bias, not the interaction. The gauge is fine; the operators are not reading it the same way.'
        : 'Reproducibility comes mostly from an operator × part interaction — the method itself fails on certain parts.',
      why: 'A %GRR of 20% means one fifth of every reading is gauge noise. Control limits widen, false alarms multiply, and a 1 mm difference between operators can decide "in spec" vs "scrap" at random.',
      action: 'Train the three operators to one standardized method (same fixture, same force, same zeroing), then re-run the study. Expect RV to drop toward the EV level and %GRR to fall under 10%.'
    });
})()}

<h4>The numbers</h4>
<table>
<tr><th>Output</th><th>Meaning</th><th>Target</th></tr>
<tr><td>%EV (repeatability)</td><td>Same operator, same part — equipment variation</td><td rowspan="3">GRR: ≤10% good, 10–30% marginal, &gt;30% reject</td></tr>
<tr><td>%RV (reproducibility)</td><td>Operator-to-operator + interaction</td></tr>
<tr><td>%GRR</td><td>Total gauge variation ÷ study variation</td></tr>
<tr><td>%PV (parts)</td><td>Actual part-to-part variation</td><td>must dominate</td></tr>
<tr><td>ndc</td><td>Distinct categories the gauge can distinguish</td><td>≥ 5</td></tr>
</table>
<h4>How to use the output — reading order</h4>
<ol>
<li><b>Verdict badge first</b> — %GRR ≤ 10%: proceed to SPC. 10–30%: usable only with caution. &gt; 30%: stop; do not chart or judge capability with this gauge.</li>
<li><b>%PV must dominate</b> — if parts are &lt; 50% of variation, the study parts were too similar; re-select parts that span the real process spread.</li>
<li><b>Split EV vs RV</b> — this decides who to fix: EV high → the instrument/fixture; RV high → the operators/method.</li>
<li><b>ndc ≥ 5?</b> — ndc is the number of honest "buckets" the gauge can sort parts into. ndc &lt; 5 → the gauge cannot resolve the process; upgrade resolution before any X̄ chart.</li>
<li><b>Contribution %</b> — attack the largest component first; fixing the biggest bar moves %GRR the most.</li>
</ol>
<h4>What should be done — action table</h4>
<table>
<tr><th>Symptom</th><th>Likely cause</th><th>Action</th></tr>
<tr><td>%EV high</td><td>Instrument, fixture, environment</td><td>Calibrate/repair, improve resolution, stabilize temperature, fix clamping</td></tr>
<tr><td>%RV high</td><td>Operators measure differently</td><td>Standard work instruction, hands-on training, gauging aids, blind readings</td></tr>
<tr><td>Operator × part interaction</td><td>Method fails on specific part families</td><td>Redesign fixture or fixtureless gauge; split study by part family</td></tr>
<tr><td>ndc &lt; 5</td><td>Gauge noise ≈ part variation</td><td>Higher-resolution gauge before charting anything</td></tr>
<tr><td>%GRR &gt; 30%</td><td>System unusable</td><td>Do not use for SPC/Cpk decisions until fixed, then re-run the study</td></tr>
</table>
<div class="callout">Use the <b>Tools → Gage R&R</b> panel: <b>Build Grid</b> → enter your Part/Op/T1/T2… data (or <b>Load Sample</b>) → <b>Analyze</b>. Then change one cell to see how %GRR and ndc respond.</div>`
  },
  {
    title: 'Advanced Capability: Normality, Confidence & Planning',
    body: `
<p>Capability numbers are only trustworthy when their assumptions hold — and they are estimates from a sample, so they carry uncertainty.</p>
<h4>1. Check normality first</h4>
<ul>
<li>Cp/Cpk assume the data are (approximately) normal</li>
<li>Use the <b>Anderson–Darling</b> test: A² ≤ 0.752 → normal at 5% level</li>
<li>If non-normal: transform (Box-Cox) or use percentile-based capability (ISO 22514) — do not report Cp/Cpk blindly</li>
</ul>
<h4>2. Confidence intervals</h4>
${fm('95% confidence intervals', [
  ['Cp CI', 'Cp · √( χ² / df )  — chi-square distribution'],
  ['Cpk CI', 'Cpk ± 1.96 · √( 1/(9n) + Cpk² / (2(n − 1)) )  — Bissell approx.']
], 'A wide CI = "not enough data": doubling n shrinks CI width by ~√2. Never certify capability from a lower CI bound below your requirement.')}
<h4>3. Improve: plan with the Cpk target</h4>
<div class="fm-grid">
${fm('Center first (cheap)', [
  ['when', 'Cp good but Cpk low'],
  ['do', 'adjust mean toward target']
], 'No new tooling needed — just re-center.')}
${fm('Then reduce variation', [
  ['required σ', 'tolerance / (6 · target Cpk)'],
  ['example', 'tolerance 0.20, Cpk 1.33 → σ ≤ 0.0251']
], 'Use the <b>Cpk Planner</b> in Tools to get Option A (center) vs Option B (reduce σ) automatically.')}
</div>
<div class="callout">Capability → Control first: if the chart is out of control, Cp/Cpk describe nothing stable. Fix special causes, then re-study capability.</div>`
  }
];

const MSA_LESSON = {
  title: 'Bonus: Measurement System Analysis (MSA)',
  body: `
<p>Before trusting SPC data, trust the <b>measurement system</b>. A gauge that varies more than the process destroys the chart. MSA studies the gauge itself — the main study is <b>Gage R&R</b> (see the Gage R&R lesson for a worked example and the action table).</p>
<h4>How to run a Gage R&R study</h4>
${fm('Plan', [
  ['characteristic', 'the one dimension you will chart (e.g. bore diameter)'],
  ['why', 'gauge variation must be small vs tolerance and vs process spread'],
  ['team', 'quality engineer + the operators who really use the gauge']
], 'Decide success criteria up front: %GRR ≤ 10% (or ≤ 30% by contract), ndc ≥ 5.')}
${fm('Select parts & operators', [
  ['parts', '5–10 parts taken from NORMAL process output — span the real spread; include near-spec parts if the decision is scrap/accept'],
  ['operators', '2–3 real production operators, not one lab technician'],
  ['trials', '2–3 repeats per part × operator cell']
], 'More parts beats more trials for the same effort: 10×3×2 is better than 5×3×3.')}
${fm('Collect data', [
  ['randomize', 'shuffle the part order per operator so time/drift cannot fake a pattern'],
  ['blind', 'operators must not see previous readings — re-set the part each trial as in real use'],
  ['sheet', 'one row per Part × Op: Part, Op, T1, T2… — exactly the Tools page grid layout']
], 'Same environment as production (temperature, lighting, fixture). Note anything unusual in the log.')}
${fm('Analyze & act', [
  ['tool', 'Tools → Gage R&R → Build Grid → enter data → Analyze'],
  ['read', 'verdict → %GRR → EV vs RV split → ndc → largest component'],
  ['act', 'EV: fix instrument/fixture · RV: train & standardize method · then RE-RUN the study to confirm']
], 'A study without a follow-up re-run is a measurement of the problem, not a fix.')}
<h4>When to re-run the study</h4>
<ul>
<li>New gauge, gauge repair, or new fixture</li>
<li>New operator joins the team</li>
<li>Annual re-validation, or per customer/IATF requirement</li>
<li>SPC signals that look like measurement noise</li>
</ul>
<h4>Other MSA studies (beyond R&R)</h4>
<ul>
<li><b>Bias / linearity</b> — compare gauge readings to a traceable reference across the range; fixes constant or sloped offset</li>
<li><b>Stability</b> — same reference part measured over time; catches calibration drift</li>
<li><b>Attribute agreement</b> — for go/no-go or defect-type data: 2–3 appraisers × 30–50 known samples × 2 rounds; measure % agreement and Cohen's kappa — the numeric Gage R&R does not apply to yes/no data</li>
</ul>
<h4>Common measurement problems</h4>
<ul>
<li>Operator bias, calibration drift</li>
<li>Resolution too coarse (need ≥ 10 divisions across tolerance)</li>
<li>Fixtures that damage or deform the part</li>
</ul>
<div class="callout">A rough check: have 2 operators measure the same 10 parts twice. If the operator-to-operator difference is large compared with part-to-part, fix the measurement system before charting.</div>`
};

const SAMPLE_DATA = {
  'xbar-r': '5.02, 5.01, 4.99, 5.03, 5.00\n5.01, 4.98, 5.00, 5.02, 5.01\n4.99, 5.00, 5.01, 4.98, 5.00\n5.03, 5.02, 5.01, 5.00, 5.02\n5.00, 4.99, 4.98, 5.01, 4.99\n4.98, 4.99, 5.00, 4.97, 5.00\n5.01, 5.02, 5.03, 5.01, 5.00\n5.00, 5.01, 4.99, 5.02, 5.01\n4.97, 4.98, 4.99, 4.96, 4.98\n5.00, 5.01, 5.02, 5.00, 5.01\n5.02, 5.03, 5.01, 5.04, 5.02\n5.01, 5.00, 4.99, 5.01, 5.00',
  'xbar-s': null,
  'i-mr': '5.01\n5.03\n4.98\n5.00\n5.02\n4.99\n4.97\n5.00\n5.01\n5.04\n5.02\n4.98\n4.96\n4.99\n5.00\n5.01\n5.03\n5.05\n5.02\n5.00',
  p: '3, 50\n5, 50\n2, 50\n6, 50\n4, 50\n8, 50\n3, 50\n2, 50\n4, 50\n5, 50\n12, 50\n4, 50',
  np: '3, 50\n5, 50\n2, 50\n6, 50\n4, 50\n7, 50\n3, 50\n2, 50\n4, 50\n5, 50\n11, 50\n4, 50',
  c: '4\n3\n5\n2\n6\n3\n4\n3\n2\n5\n3\n4\n12\n5\n3',
  u: '3, 20\n5, 20\n2, 20\n6, 20\n4, 20\n8, 20\n3, 20\n2, 25\n4, 25\n5, 25\n12, 30\n4, 30',
  cap: '5.01\n4.99\n5.02\n5.00\n4.98\n5.01\n5.03\n4.97\n5.00\n5.02\n4.99\n5.01\n5.04\n4.98\n5.00\n5.02\n4.96\n5.01\n4.99\n5.03\n5.00\n4.98\n5.01\n5.02\n4.99'
};

// Curriculum order for the English Learn tab: foundations → charts → rules →
// capability → measurement → advanced → app guide. (Translated lessons ship
// in their own order; this reorders the English arrays only.)
const LESSON_ORDER = [
  'What is SPC?',
  'Common Cause vs Special Cause',
  'Data Collection & Rational Subgroups',
  'Which Chart Should I Use? (Flowchart)',
  'X̄–R & X̄–S Charts',
  'I–MR Charts',
  'Attribute Charts: p, np, c, u',
  'Out-of-Control Rules (Nelson)',
  'Capability: Cp, Cpk, Pp, Ppk',
  'Advanced Charts: EWMA & CUSUM',
  'Advanced Attribute Charts: Laney p′ & u′',
  'Gage R&R — Reading the Output',
  'Advanced Capability: Normality, Confidence & Planning',
  'Bonus: Measurement System Analysis (MSA)',
  '8 Steps to Implement SPC',
  'How to Use This App',
  'Charts Page — Is the Process Stable?',
  'Cpk Page — Can We Meet Specs?',
  'Tools Page — Gage R&R, Pareto & Planner',
  'Quiz Page — Test Your Understanding'
];

function orderLessons(list) {
  const byTitle = new Map(list.map(l => [l.title, l]));
  const out = [];
  LESSON_ORDER.forEach(title => {
    const l = byTitle.get(title);
    if (l) { out.push(l); byTitle.delete(title); }
  });
  byTitle.forEach(l => out.push(l));
  return out;
}

if (typeof module !== 'undefined') module.exports = { LESSONS, ADVANCED_LESSONS, MSA_LESSON, SAMPLE_DATA, orderLessons };
