(function (window) {
  const COLORS = ["#0a3d6e", "#1565b0", "#3d8fd6", "#7fb7e8", "#c5e0f6", "#06284a"];

  function sum(values) {
    return values.reduce(function (total, n) { return total + n; }, 0);
  }

  function drawPie(canvas, labels, values) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const total = sum(values);
    if (!total) {
      ctx.fillStyle = "#4e6478";
      ctx.font = "16px Segoe UI, sans-serif";
      ctx.fillText("No submitted records yet", 24, h / 2);
      return;
    }
    const cx = w * 0.32;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 16;
    let start = -Math.PI / 2;
    values.forEach(function (value, i) {
      const slice = (value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      start += slice;
    });
    let y = 28;
    ctx.font = "14px Segoe UI, sans-serif";
    labels.forEach(function (label, i) {
      const pct = Math.round((values[i] / total) * 100);
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fillRect(w * 0.58, y - 11, 12, 12);
      ctx.fillStyle = "#12263a";
      ctx.fillText(label + " (" + values[i] + ", " + pct + "%)", w * 0.58 + 20, y);
      y += 24;
    });
  }

  function drawBar(canvas, labels, values) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const max = Math.max.apply(null, values.concat([1]));
    const pad = { t: 24, r: 16, b: 78, l: 40 };
    const cw = w - pad.l - pad.r;
    const ch = h - pad.t - pad.b;
    ctx.strokeStyle = "#c5d8ea";
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, h - pad.b);
    ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();
    values.forEach(function (value, i) {
      const slot = cw / values.length;
      const bw = slot * 0.62;
      const x = pad.l + slot * i + (slot - bw) / 2;
      const bh = (value / max) * ch;
      const y = h - pad.b - bh;
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fillRect(x, y, bw, bh);
      ctx.fillStyle = "#12263a";
      ctx.font = "13px Segoe UI, sans-serif";
      ctx.fillText(String(value), x + bw / 2 - 4, y - 6);
      ctx.save();
      ctx.translate(x + bw / 2, h - pad.b + 14);
      ctx.rotate(-0.45);
      ctx.fillText(labels[i], -18, 8);
      ctx.restore();
    });
  }

  window.StatsCharts = { drawPie: drawPie, drawBar: drawBar };
})(window);
