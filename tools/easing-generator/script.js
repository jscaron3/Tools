
(function () {
  const W = 200, OFF = 20;

  const x1i = document.getElementById('x1'), y1i = document.getElementById('y1'),
        x2i = document.getElementById('x2'), y2i = document.getElementById('y2');
  const x1o = document.getElementById('x1out'), y1o = document.getElementById('y1out'),
        x2o = document.getElementById('x2out'), y2o = document.getElementById('y2out');

  const curvePath = document.getElementById('curvePath');
  const h1 = document.getElementById('handle1Line'), h2 = document.getElementById('handle2Line');
  const p1 = document.getElementById('p1'), p2 = document.getElementById('p2');
  const cssOut = document.getElementById('cssOut');


  const svg = document.getElementById('curveSvg');
  const ball = document.getElementById('ball');
  const preset = document.getElementById('preset');
	
	function setBezierValues(x1, y1, x2, y2) {
		x1i.value = x1;
		y1i.value = y1;
		x2i.value = x2;
		y2i.value = y2;
		render();
	}

  function toSvg(x, y) {
    return { sx: OFF + x * W, sy: (OFF + W) - y * W };
  }
  function fromSvg(sx, sy) {
    return { x: (sx - OFF) / W, y: ((OFF + W) - sy) / W };
  }
  function clamp01(v) {
    return Math.min(1, Math.max(0, v));
  }
  function getVals() {
    return [parseFloat(x1i.value), parseFloat(y1i.value), parseFloat(x2i.value), parseFloat(y2i.value)];
  }

  function render() {
    const [x1, y1, x2, y2] = getVals();
    x1o.textContent = x1.toFixed(2);
    y1o.textContent = y1.toFixed(2);
    x2o.textContent = x2.toFixed(2);
    y2o.textContent = y2.toFixed(2);

    const start = toSvg(0, 0), end = toSvg(1, 1);
    const c1 = toSvg(x1, y1), c2 = toSvg(x2, y2);

    curvePath.setAttribute('d', `M ${start.sx} ${start.sy} C ${c1.sx} ${c1.sy}, ${c2.sx} ${c2.sy}, ${end.sx} ${end.sy}`);

    h1.setAttribute('x2', c1.sx); h1.setAttribute('y2', c1.sy);
    h2.setAttribute('x2', c2.sx); h2.setAttribute('y2', c2.sy);

    p1.setAttribute('cx', c1.sx); p1.setAttribute('cy', c1.sy);
    p2.setAttribute('cx', c2.sx); p2.setAttribute('cy', c2.sy);

    cssOut.value = `cubic-bezier(${x1.toFixed(2)}, ${y1.toFixed(2)}, ${x2.toFixed(2)}, ${y2.toFixed(2)})`;
  }

  [x1i, y1i, x2i, y2i].forEach(el => el.addEventListener('input', render));

  preset.addEventListener('change', () => {
    const [a, b, c, d] = preset.value.split(',').map(Number);
    x1i.value = a; y1i.value = b; x2i.value = c; y2i.value = d;
    render();
  });

  document.getElementById('copyBtn').addEventListener('click', () => {
    cssOut.select();
    navigator.clipboard?.writeText(cssOut.value);
  });
	
	
	function parseBezier(value) {
  const match = value.match(
    /cubic-bezier\s*\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)/i
  );

  if (!match) return null;

  return {
    x1: parseFloat(match[1]),
    y1: parseFloat(match[2]),
    x2: parseFloat(match[3]),
    y2: parseFloat(match[4])
  };
}

cssOut.addEventListener('input', () => {
  const bezier = parseBezier(cssOut.value);

  if (!bezier) return;

  setBezierValues(
    clamp01(bezier.x1),
    Math.min(2, Math.max(-1, bezier.y1)),
    clamp01(bezier.x2),
    Math.min(2, Math.max(-1, bezier.y2))
  );
});

cssOut.addEventListener('blur', () => {
  const bezier = parseBezier(cssOut.value);

  if (!bezier) {
    render(); // restore valid value
    return;
  }

  setBezierValues(
    clamp01(bezier.x1),
    Math.min(2, Math.max(-1, bezier.y1)),
    clamp01(bezier.x2),
    Math.min(2, Math.max(-1, bezier.y2))
  );
});

  document.getElementById('invertBtn').addEventListener('click', () => {
    const [x1, y1, x2, y2] = getVals();
    const nx1 = clamp01(1 - x2), ny1 = 1 - y2;
    const nx2 = clamp01(1 - x1), ny2 = 1 - y1;
    x1i.value = nx1.toFixed(2);
    y1i.value = ny1.toFixed(2);
    x2i.value = nx2.toFixed(2);
    y2i.value = ny2.toFixed(2);
    render();
  });

  // Drag handles
  function setupDrag(circle, xInput, yInput) {
    let dragging = false;
    circle.addEventListener('pointerdown', e => {
      dragging = true;
      circle.setPointerCapture(e.pointerId);
    });
    circle.addEventListener('pointerup', () => dragging = false);
    circle.addEventListener('pointercancel', () => dragging = false);
    circle.addEventListener('pointermove', e => {
      if (!dragging) return;
      const rect = svg.getBoundingClientRect();
      const scale = 240 / rect.width;
      const sx = (e.clientX - rect.left) * scale;
      const sy = (e.clientY - rect.top) * scale;
      const { x, y } = fromSvg(sx, sy);
      xInput.value = clamp01(x).toFixed(2);
      yInput.value = Math.min(2, Math.max(-1, y)).toFixed(2);
      render();
    });
  }
  setupDrag(p1, x1i, y1i);
  setupDrag(p2, x2i, y2i);

  // Preview animation
  let animId = null;
  document.getElementById('playBtn').addEventListener('click', () => {
    if (animId) cancelAnimationFrame(animId);
    const [x1, y1, x2, y2] = getVals();

    function bezierY(t) {
      let tau = t;
      for (let i = 0; i < 8; i++) {
        const x = 3 * (1 - tau) * (1 - tau) * tau * x1 + 3 * (1 - tau) * tau * tau * x2 + tau * tau * tau;
        const dx = 3 * (1 - tau) * (1 - tau) * x1 + 6 * (1 - tau) * tau * (x2 - x1) + 3 * tau * tau * (1 - x2);
        if (Math.abs(dx) < 1e-6) break;
        tau -= (x - t) / dx;
        tau = Math.min(1, Math.max(0, tau));
      }
      return 3 * (1 - tau) * (1 - tau) * tau * y1 + 3 * (1 - tau) * tau * tau * y2 + tau * tau * tau;
    }

    const container = ball.parentElement;
    const maxX = container.clientWidth - 32;
    const duration = Math.max(50, parseFloat(document.getElementById('speed').value) || 900);
    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const y = bezierY(t);
      ball.style.left = (8 + y * maxX) + 'px';
      if (t < 1) animId = requestAnimationFrame(frame);
    }
    ball.style.left = '8px';
    animId = requestAnimationFrame(frame);
  });

  // Init
  const [a, b, c, d] = preset.value.split(',').map(Number);
  x1i.value = a; y1i.value = b; x2i.value = c; y2i.value = d;
  render();
})();
