/* Chart zoom / pan — pinch, wheel, drag, double-tap reset */
window.ChartZoom = (() => {
  const MIN = 1, MAX = 6;

  function clampView(st, root, canvas) {
    const vw = root.clientWidth || canvas.clientWidth || 1;
    const vh = canvas.clientHeight || parseFloat(canvas.style.height) || 260;
    if (st.scale <= MIN + 0.001) {
      st.scale = 1; st.tx = 0; st.ty = 0;
      return;
    }
    const maxX = 0, minX = vw - vw * st.scale;
    const maxY = 0, minY = vh - vh * st.scale;
    st.tx = Math.min(maxX, Math.max(minX, st.tx));
    st.ty = Math.min(maxY, Math.max(minY, st.ty));
  }

  function apply(st, canvas) {
    canvas.style.transform =
      'translate(' + st.tx.toFixed(2) + 'px,' + st.ty.toFixed(2) + 'px) scale(' + st.scale.toFixed(4) + ')';
  }

  function reset(st, canvas) {
    st.scale = 1; st.tx = 0; st.ty = 0;
    apply(st, canvas);
  }

  function zoomAt(st, root, canvas, nextScale, cx, cy) {
    const prev = st.scale;
    nextScale = Math.min(MAX, Math.max(MIN, nextScale));
    if (nextScale === prev) return;
    // Keep point (cx,cy) under the cursor/finger
    const k = nextScale / prev;
    st.tx = cx - k * (cx - st.tx);
    st.ty = cy - k * (cy - st.ty);
    st.scale = nextScale;
    clampView(st, root, canvas);
    apply(st, canvas);
  }

  function attach(root) {
    const canvas = root.querySelector('canvas');
    if (!canvas || canvas.dataset.zoomReady) return;
    canvas.dataset.zoomReady = '1';

    const st = { scale: 1, tx: 0, ty: 0 };
    const pointers = new Map();
    let pinchDist = 0, pinchMid = null;
    let lastTap = 0;

    function localPos(e) {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, localPos(e));
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
        pinchMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      }
      // double-tap reset
      const now = Date.now();
      if (now - lastTap < 320 && pointers.size === 1) {
        reset(st, canvas);
        lastTap = 0;
      } else {
        lastTap = now;
      }
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      const prev = pointers.get(e.pointerId);
      const cur = localPos(e);
      pointers.set(e.pointerId, cur);

      if (pointers.size === 1 && st.scale > MIN) {
        st.tx += cur.x - prev.x;
        st.ty += cur.y - prev.y;
        clampView(st, root, canvas);
        apply(st, canvas);
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        if (pinchDist > 0) {
          const ratio = d / pinchDist;
          // pan with midpoint movement + zoom around midpoint
          st.tx += mid.x - pinchMid.x;
          st.ty += mid.y - pinchMid.y;
          pinchMid = mid;
          zoomAt(st, root, canvas, st.scale * ratio, mid.x, mid.y);
        }
        pinchDist = d;
      }
    });

    function up(e) {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
      if (pointers.size === 1) {
        // continue as pan from remaining finger — rebase not needed (tx/ty absolute)
      }
    }
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const pos = localPos(e);
      const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      zoomAt(st, root, canvas, st.scale * factor, pos.x, pos.y);
    }, { passive: false });

    // Buttons
    root.querySelectorAll('[data-zoom]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const mode = btn.getAttribute('data-zoom');
        const cx = (root.clientWidth || 300) / 2;
        const cy = (canvas.clientHeight || 260) / 2;
        if (mode === 'in') zoomAt(st, root, canvas, st.scale * 1.4, cx, cy);
        else if (mode === 'out') zoomAt(st, root, canvas, st.scale / 1.4, cx, cy);
        else reset(st, canvas);
      });
    });

    // Hint fades after first use
    const hint = root.querySelector('.chart-zoom-hint');
    if (hint) {
      const hide = () => { hint.classList.add('gone'); };
      canvas.addEventListener('pointerdown', hide, { once: true });
      canvas.addEventListener('wheel', hide, { once: true });
      setTimeout(() => hint.classList.add('gone'), 6000);
    }
  }

  function attachAll() {
    document.querySelectorAll('.chart-zoom').forEach(attach);
  }

  return { attach, attachAll };
})();
