/* ═══════════════════════════════════════════════════════════
   EcoTrace — Charts Component
   Custom Canvas/SVG-based chart library (no dependencies)
   ═══════════════════════════════════════════════════════════ */

const Charts = (() => {

  const categoryColors = {
    transport: '#38bdf8',
    food: '#34d399',
    home: '#fbbf24',
    lifestyle: '#c084fc',
  };

  /**
   * Donut Chart
   * Renders a donut/pie chart on a canvas element
   */
  function donut(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = options.size || 220;
    
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = (size / 2) - 10;
    const innerRadius = radius * (options.innerRadius || 0.62);
    const total = data.reduce((sum, d) => sum + d.value, 0);

    if (total === 0) return;

    // Animate drawing
    let progress = 0;
    const duration = 1200;
    const start = performance.now();

    function draw(now) {
      progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      ctx.clearRect(0, 0, size, size);

      let startAngle = -Math.PI / 2;

      data.forEach((segment) => {
        const sliceAngle = (segment.value / total) * Math.PI * 2 * eased;
        const endAngle = startAngle + sliceAngle;

        // Draw segment
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true);
        ctx.closePath();

        ctx.fillStyle = segment.color || categoryColors[segment.category] || '#34d399';
        ctx.fill();

        // Subtle segment border
        ctx.strokeStyle = 'rgba(6, 13, 9, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        startAngle = endAngle;
      });

      // Center circle (for clean donut look)
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius - 1, 0, Math.PI * 2);
      ctx.fillStyle = options.centerColor || 'rgba(6, 13, 9, 0.01)';
      ctx.fill();

      if (progress < 1) {
        requestAnimationFrame(draw);
      }
    }

    requestAnimationFrame(draw);
  }

  /**
   * Bar Chart (Sparkline variant)
   * Renders a mini bar chart for weekly overview
   */
  function barChart(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = options.width || canvas.parentElement.clientWidth || 300;
    const height = options.height || 80;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const maxVal = Math.max(...data.map(d => d.total), 1);
    const barWidth = Math.min(24, (width / data.length) - 8);
    const gap = (width - barWidth * data.length) / (data.length + 1);
    const bottomPad = 18;
    const chartHeight = height - bottomPad;

    // Animate
    let progress = 0;
    const duration = 800;
    const start = performance.now();

    function draw(now) {
      progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      ctx.clearRect(0, 0, width, height);

      data.forEach((d, i) => {
        const x = gap + i * (barWidth + gap);
        const barHeight = (d.total / maxVal) * chartHeight * eased;
        const y = chartHeight - barHeight;

        // Bar
        const gradient = ctx.createLinearGradient(x, y, x, chartHeight);
        
        const today = Formatter.dateKey();
        if (d.date === today) {
          gradient.addColorStop(0, '#34d399');
          gradient.addColorStop(1, '#059669');
        } else {
          gradient.addColorStop(0, 'rgba(52, 211, 153, 0.5)');
          gradient.addColorStop(1, 'rgba(52, 211, 153, 0.2)');
        }

        // Rounded top
        const r = Math.min(barWidth / 2, 4);
        ctx.beginPath();
        ctx.moveTo(x, chartHeight);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.lineTo(x + barWidth - r, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
        ctx.lineTo(x + barWidth, chartHeight);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Day label
        const dayLabel = new Date(d.date).toLocaleDateString('en', { weekday: 'short' }).charAt(0);
        ctx.fillStyle = d.date === today ? '#34d399' : 'rgba(167, 196, 184, 0.5)';
        ctx.font = '500 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(dayLabel, x + barWidth / 2, height - 3);
      });

      if (progress < 1) {
        requestAnimationFrame(draw);
      }
    }

    requestAnimationFrame(draw);
  }

  /**
   * Line Chart
   * Simple trend line with gradient fill
   */
  function lineChart(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = options.width || canvas.parentElement.clientWidth || 300;
    const height = options.height || 120;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    if (data.length < 2) return;

    const values = data.map(d => d.total);
    const maxVal = Math.max(...values, 1);
    const minVal = 0;
    const range = maxVal - minVal || 1;
    const pad = { top: 10, right: 10, bottom: 20, left: 10 };
    const chartWidth = width - pad.left - pad.right;
    const chartHeight = height - pad.top - pad.bottom;

    const points = values.map((v, i) => ({
      x: pad.left + (i / (values.length - 1)) * chartWidth,
      y: pad.top + chartHeight - ((v - minVal) / range) * chartHeight,
    }));

    // Animate
    let progress = 0;
    const duration = 1000;
    const startTime = performance.now();

    function draw(now) {
      progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const drawCount = Math.ceil(points.length * eased);

      ctx.clearRect(0, 0, width, height);

      if (drawCount < 2) {
        if (progress < 1) requestAnimationFrame(draw);
        return;
      }

      const visiblePoints = points.slice(0, drawCount);

      // Gradient fill under line
      const gradient = ctx.createLinearGradient(0, pad.top, 0, height);
      gradient.addColorStop(0, 'rgba(52, 211, 153, 0.15)');
      gradient.addColorStop(1, 'rgba(52, 211, 153, 0.01)');

      ctx.beginPath();
      ctx.moveTo(visiblePoints[0].x, height - pad.bottom);
      visiblePoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(visiblePoints[visiblePoints.length - 1].x, height - pad.bottom);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.moveTo(visiblePoints[0].x, visiblePoints[0].y);
      for (let i = 1; i < visiblePoints.length; i++) {
        const xc = (visiblePoints[i].x + visiblePoints[i - 1].x) / 2;
        const yc = (visiblePoints[i].y + visiblePoints[i - 1].y) / 2;
        ctx.quadraticCurveTo(visiblePoints[i - 1].x, visiblePoints[i - 1].y, xc, yc);
      }
      ctx.lineTo(visiblePoints[visiblePoints.length - 1].x, visiblePoints[visiblePoints.length - 1].y);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Dots on each point
      visiblePoints.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, i === visiblePoints.length - 1 ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = i === visiblePoints.length - 1 ? '#34d399' : 'rgba(52, 211, 153, 0.6)';
        ctx.fill();

        if (i === visiblePoints.length - 1) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      if (progress < 1) {
        requestAnimationFrame(draw);
      }
    }

    requestAnimationFrame(draw);
  }

  /**
   * Progress Ring (SVG-based)
   * Creates an animated circular progress indicator
   */
  function progressRing(containerId, value, max, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const size = options.size || 120;
    const strokeWidth = options.strokeWidth || 8;
    const radius = (size / 2) - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const percent = Math.min(value / max, 1);
    const offset = circumference * (1 - percent);
    const color = options.color || '#34d399';

    container.innerHTML = `
      <div class="progress-ring" style="width:${size}px;height:${size}px;">
        <svg class="progress-ring__svg" width="${size}" height="${size}">
          <circle class="progress-ring__circle-bg" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${strokeWidth}"/>
          <circle class="progress-ring__circle" cx="${size/2}" cy="${size/2}" r="${radius}" 
            stroke-width="${strokeWidth}" stroke="${color}"
            stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"
            style="--circumference:${circumference};--offset:${offset};animation:drawCircle 1.2s cubic-bezier(0.19,1,0.22,1) forwards;"/>
        </svg>
        <div class="progress-ring__label">
          <span class="progress-ring__value">${options.label || Math.round(percent * 100)}</span>
          <span class="progress-ring__unit">${options.unit || '%'}</span>
        </div>
      </div>
    `;
  }

  return { donut, barChart, lineChart, progressRing };
})();
