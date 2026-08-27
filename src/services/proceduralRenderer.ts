// High-Performance Procedural Cinematic Canvas Renderer

export function renderProceduralScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  type: string,
  time: number // progress in seconds
) {
  ctx.save();

  switch (type) {
    case "cyberpunk":
      renderCyberpunk(ctx, width, height, time);
      break;
    case "nebula":
      renderNebula(ctx, width, height, time);
      break;
    case "sunset":
      renderSunset(ctx, width, height, time);
      break;
    case "particles":
      renderParticles(ctx, width, height, time);
      break;
    case "synthwave":
      renderSynthwave(ctx, width, height, time);
      break;
    case "aurora":
      renderAurora(ctx, width, height, time);
      break;
    case "matrix":
      renderMatrix(ctx, width, height, time);
      break;
    case "mountains":
      renderMountains(ctx, width, height, time);
      break;
    default:
      renderNebula(ctx, width, height, time);
      break;
  }

  ctx.restore();
}

function renderCyberpunk(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Dark neon night sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, "#050518");
  skyGrad.addColorStop(0.5, "#0b0c2a");
  skyGrad.addColorStop(1, "#18062b");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Distant glowing moon / cyber orb
  const orbX = w * 0.75 + Math.sin(t * 0.2) * 10;
  const orbY = h * 0.25;
  const orbGrad = ctx.createRadialGradient(orbX, orbY, 5, orbX, orbY, 120);
  orbGrad.addColorStop(0, "rgba(255, 0, 128, 0.9)");
  orbGrad.addColorStop(0.3, "rgba(0, 240, 255, 0.4)");
  orbGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(orbX, orbY, 120, 0, Math.PI * 2);
  ctx.fill();

  // Background skyscraper silhouettes
  const bgBuildings = 14;
  for (let i = 0; i < bgBuildings; i++) {
    const bw = w / (bgBuildings * 0.7);
    const bx = (i * bw * 0.75) - (t * 12 % bw);
    const bh = h * (0.35 + Math.sin(i * 99) * 0.2);
    const by = h * 0.7 - bh;

    ctx.fillStyle = `rgba(15, 23, 42, ${0.7 + (i % 3) * 0.1})`;
    ctx.fillRect(bx, by, bw * 0.85, bh + h * 0.3);

    // Glowing antenna lights
    if (i % 2 === 0) {
      ctx.fillStyle = Math.sin(t * 5 + i) > 0 ? "#ff0055" : "#00ffff";
      ctx.beginPath();
      ctx.arc(bx + bw * 0.42, by - 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Foreground Neon Skyscrapers
  const fgBuildings = 9;
  for (let i = 0; i < fgBuildings; i++) {
    const bw = w / (fgBuildings * 0.65);
    const bx = (i * bw * 0.85) - (t * 30 % bw) - 50;
    const bh = h * (0.5 + Math.sin(i * 47) * 0.25);
    const by = h - bh;

    // Building body
    ctx.fillStyle = "#090915";
    ctx.fillRect(bx, by, bw * 0.8, bh);

    // Neon edge highlight
    ctx.strokeStyle = i % 2 === 0 ? "rgba(0, 240, 255, 0.5)" : "rgba(255, 0, 128, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, bw * 0.8, bh);

    // Lit window matrix
    const rows = 12;
    const cols = 5;
    const winW = (bw * 0.8 - 20) / cols;
    const winH = (bh - 30) / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const litSeed = Math.sin(i * 100 + r * 20 + c * 5);
        if (litSeed > 0.1) {
          const color = litSeed > 0.7 ? "#00ffff" : litSeed > 0.4 ? "#ff007f" : "#fef08a";
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.6 + Math.sin(t * 3 + r + c) * 0.3;
          ctx.fillRect(bx + 10 + c * winW, by + 15 + r * winH, winW * 0.6, winH * 0.5);
        }
      }
    }
    ctx.globalAlpha = 1.0;
  }

  // Flying Vehicles / Spinners with light streaks
  for (let v = 0; v < 6; v++) {
    const speed = (v % 2 === 0 ? 1 : -1) * (80 + v * 35);
    const vx = ((t * speed + v * 200) % (w + 400)) - 200;
    const vy = h * (0.35 + (v * 0.08) % 0.4);
    const vColor = v % 2 === 0 ? "#00f0ff" : "#ff0055";

    // Streak
    ctx.strokeStyle = vColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.lineTo(vx - (speed > 0 ? 60 : -60), vy);
    ctx.stroke();

    // Vehicle point
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(vx, vy, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Atmospheric neon rain
  ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
  ctx.lineWidth = 1;
  const rainCount = 45;
  for (let r = 0; r < rainCount; r++) {
    const rx = (Math.sin(r * 123) * 0.5 + 0.5) * w;
    const ry = ((t * 400 + r * 77) % h);
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 4, ry + 16);
    ctx.stroke();
  }
}

function renderNebula(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Deep space background
  ctx.fillStyle = "#03020d";
  ctx.fillRect(0, 0, w, h);

  // Twinkling stars
  const starCount = 120;
  for (let i = 0; i < starCount; i++) {
    const sx = ((Math.sin(i * 391) * 0.5 + 0.5) * w);
    const sy = ((Math.cos(i * 721) * 0.5 + 0.5) * h);
    const size = (i % 7 === 0 ? 2.5 : 1.2);
    const flicker = 0.3 + 0.7 * Math.sin(t * 4 + i);
    ctx.fillStyle = i % 5 === 0 ? `rgba(167, 139, 250, ${flicker})` : i % 3 === 0 ? `rgba(56, 189, 248, ${flicker})` : `rgba(255, 255, 255, ${flicker})`;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Multi-layered swirling nebula clouds
  const centers = [
    { x: w * 0.4 + Math.sin(t * 0.2) * 40, y: h * 0.45 + Math.cos(t * 0.25) * 30, r: w * 0.5, c1: "rgba(147, 51, 234, 0.45)", c2: "rgba(219, 39, 119, 0.25)" },
    { x: w * 0.65 + Math.cos(t * 0.15) * 30, y: h * 0.6 + Math.sin(t * 0.3) * 35, r: w * 0.45, c1: "rgba(6, 182, 212, 0.4)", c2: "rgba(99, 102, 241, 0.2)" },
    { x: w * 0.5, y: h * 0.5, r: w * 0.3, c1: "rgba(236, 72, 153, 0.35)", c2: "rgba(124, 58, 237, 0.15)" },
  ];

  centers.forEach((neb) => {
    const grad = ctx.createRadialGradient(neb.x, neb.y, 10, neb.x, neb.y, neb.r);
    grad.addColorStop(0, neb.c1);
    grad.addColorStop(0.5, neb.c2);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(neb.x, neb.y, neb.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Cosmic dust tendrils
  ctx.lineWidth = 4;
  for (let k = 0; k < 5; k++) {
    ctx.strokeStyle = k % 2 === 0 ? "rgba(192, 132, 252, 0.15)" : "rgba(34, 211, 238, 0.15)";
    ctx.beginPath();
    const startX = w * 0.2 + k * 80;
    ctx.moveTo(startX, h * 0.8);
    ctx.bezierCurveTo(
      w * 0.5 + Math.sin(t * 0.5 + k) * 60,
      h * 0.5 + Math.cos(t * 0.4 + k) * 60,
      w * 0.6 + Math.cos(t * 0.6 + k) * 70,
      h * 0.2,
      w * 0.8,
      h * 0.1
    );
    ctx.stroke();
  }
}

function renderSunset(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Dramatic Sunset Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
  skyGrad.addColorStop(0, "#1e1b4b");
  skyGrad.addColorStop(0.3, "#831843");
  skyGrad.addColorStop(0.6, "#c2410c");
  skyGrad.addColorStop(0.85, "#ea580c");
  skyGrad.addColorStop(1, "#fbbf24");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.65);

  // Brilliant Golden Sun
  const sunX = w * 0.5 + Math.sin(t * 0.1) * 15;
  const sunY = h * 0.52;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 140);
  sunGrad.addColorStop(0, "#ffffff");
  sunGrad.addColorStop(0.2, "#fef08a");
  sunGrad.addColorStop(0.5, "#f97316");
  sunGrad.addColorStop(1, "rgba(234, 88, 12, 0)");
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
  ctx.fill();

  // Ocean Water Base
  const seaY = h * 0.65;
  const seaGrad = ctx.createLinearGradient(0, seaY, 0, h);
  seaGrad.addColorStop(0, "#b45309");
  seaGrad.addColorStop(0.3, "#78350f");
  seaGrad.addColorStop(0.7, "#0f172a");
  seaGrad.addColorStop(1, "#020617");
  ctx.fillStyle = seaGrad;
  ctx.fillRect(0, seaY, w, h - seaY);

  // Ocean Wave Reflections
  const waveRows = 20;
  for (let r = 0; r < waveRows; r++) {
    const wy = seaY + (r / waveRows) * (h - seaY);
    const waveDistFromCenter = Math.abs(wy - seaY) / (h - seaY);
    const waveWidth = (w * 0.4) * (1 - waveDistFromCenter * 0.4);
    const alpha = (1 - waveDistFromCenter * 0.6) * 0.45;

    ctx.strokeStyle = `rgba(254, 240, 138, ${alpha})`;
    ctx.lineWidth = 1.5 + waveDistFromCenter * 2;
    ctx.beginPath();
    const waveOffset = Math.sin(t * 3 + r * 0.8) * 20;
    ctx.moveTo(sunX - waveWidth * 0.5 + waveOffset, wy);
    ctx.lineTo(sunX + waveWidth * 0.5 + waveOffset, wy);
    ctx.stroke();
  }

  // Silhouette Horizon Sea Cliffs
  ctx.fillStyle = "#09090b";
  ctx.beginPath();
  ctx.moveTo(0, seaY);
  ctx.lineTo(w * 0.25, seaY - 35);
  ctx.lineTo(w * 0.4, seaY);
  ctx.lineTo(0, seaY);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(w, seaY);
  ctx.lineTo(w * 0.72, seaY - 50);
  ctx.lineTo(w * 0.6, seaY);
  ctx.lineTo(w, seaY);
  ctx.fill();
}

function renderParticles(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Dark void background
  ctx.fillStyle = "#02040a";
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.5;
  const numParticles = 140;

  for (let i = 0; i < numParticles; i++) {
    const angle = i * 0.15 + t * (0.8 + (i % 5) * 0.1);
    const radius = ((i * 3 + t * 40) % (Math.min(w, h) * 0.48));
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius * 0.75;
    const size = 1.5 + (radius / (Math.min(w, h) * 0.48)) * 3.5;

    const hue = (i * 7 + t * 40) % 360;
    ctx.fillStyle = `hsla(${hue}, 95%, 65%, ${0.4 + (radius / 200) * 0.6})`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();

    // Connecting energy lines
    if (i % 6 === 0) {
      const nextAngle = (i + 1) * 0.15 + t * 0.8;
      const nextRadius = (((i + 1) * 3 + t * 40) % (Math.min(w, h) * 0.48));
      const nx = cx + Math.cos(nextAngle) * nextRadius;
      const ny = cy + Math.sin(nextAngle) * nextRadius * 0.75;
      ctx.strokeStyle = `hsla(${hue}, 90%, 60%, 0.25)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(nx, ny);
      ctx.stroke();
    }
  }

  // Core glow center
  const centerGlow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 80);
  centerGlow.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  centerGlow.addColorStop(0.3, "rgba(56, 189, 248, 0.6)");
  centerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = centerGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, 80, 0, Math.PI * 2);
  ctx.fill();
}

function renderSynthwave(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Retro Gradient Sky
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  sky.addColorStop(0, "#090014");
  sky.addColorStop(0.5, "#2e0854");
  sky.addColorStop(1, "#831843");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.6);

  // Synthwave Sun with horizontal blinds
  const sunX = w * 0.5;
  const sunY = h * 0.48;
  const sunRadius = Math.min(w, h) * 0.22;
  const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
  sunGrad.addColorStop(0, "#fde047");
  sunGrad.addColorStop(0.6, "#f43f5e");
  sunGrad.addColorStop(1, "#c026d3");

  ctx.save();
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = sunGrad;
  ctx.fillRect(sunX - sunRadius, sunY - sunRadius, sunRadius * 2, sunRadius * 2);

  // Blinds cutout
  const stripes = 8;
  for (let s = 0; s < stripes; s++) {
    const sy = sunY + (s / stripes) * sunRadius;
    const sh = 2 + s * 1.2;
    ctx.fillStyle = "#2e0854";
    ctx.fillRect(sunX - sunRadius, sy, sunRadius * 2, sh);
  }
  ctx.restore();

  // Mountain wireframe silhouettes
  ctx.fillStyle = "#110324";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.6);
  ctx.lineTo(w * 0.15, h * 0.48);
  ctx.lineTo(w * 0.35, h * 0.6);
  ctx.lineTo(w * 0.65, h * 0.45);
  ctx.lineTo(w * 0.85, h * 0.58);
  ctx.lineTo(w, h * 0.52);
  ctx.lineTo(w, h * 0.6);
  ctx.fill();

  // Moving 3D Grid Floor
  const floorY = h * 0.6;
  ctx.fillStyle = "#060112";
  ctx.fillRect(0, floorY, w, h - floorY);

  const horizonCenter = w * 0.5;
  ctx.strokeStyle = "#00f0ff";
  ctx.lineWidth = 1.5;

  // Perspective vertical lines radiating from center
  const numLines = 24;
  for (let i = 0; i <= numLines; i++) {
    const bottomX = (i / numLines) * w * 1.6 - w * 0.3;
    ctx.beginPath();
    ctx.moveTo(horizonCenter, floorY);
    ctx.lineTo(bottomX, h);
    ctx.stroke();
  }

  // Horizontal grid lines moving forward
  const hLines = 14;
  for (let j = 0; j < hLines; j++) {
    const progress = ((j + (t * 2 % 1)) / hLines);
    const lineY = floorY + Math.pow(progress, 2.5) * (h - floorY);
    ctx.strokeStyle = `rgba(255, 0, 128, ${progress * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(w, lineY);
    ctx.stroke();
  }
}

function renderAurora(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Dark Arctic Night Sky
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#020b14");
  sky.addColorStop(0.6, "#041b2d");
  sky.addColorStop(1, "#02070f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Stars
  for (let i = 0; i < 90; i++) {
    const sx = (Math.sin(i * 411) * 0.5 + 0.5) * w;
    const sy = (Math.cos(i * 819) * 0.5 + 0.5) * h * 0.7;
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  // Aurora curtains (undulating ribbon waves)
  const ribbons = [
    { color: "rgba(52, 211, 153, 0.4)", y: h * 0.25, speed: 0.6, amp: 45 },
    { color: "rgba(45, 212, 191, 0.5)", y: h * 0.35, speed: 0.8, amp: 55 },
    { color: "rgba(168, 85, 247, 0.35)", y: h * 0.45, speed: 0.5, amp: 65 },
  ];

  ribbons.forEach((ribbon) => {
    ctx.save();
    ctx.fillStyle = ribbon.color;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);

    for (let x = 0; x <= w; x += 15) {
      const wave = Math.sin((x / w) * 6 + t * ribbon.speed) * ribbon.amp + Math.cos((x / w) * 3 - t * 0.4) * 20;
      const y = ribbon.y + wave;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // Mountain Silhouettes with Snowy Highlights
  ctx.fillStyle = "#050d1a";
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.68);
  ctx.lineTo(w * 0.2, h * 0.58);
  ctx.lineTo(w * 0.45, h * 0.7);
  ctx.lineTo(w * 0.7, h * 0.55);
  ctx.lineTo(w, h * 0.66);
  ctx.lineTo(w, h);
  ctx.fill();

  // Snow cap glow
  ctx.strokeStyle = "rgba(203, 213, 225, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.16, h * 0.6);
  ctx.lineTo(w * 0.2, h * 0.58);
  ctx.lineTo(w * 0.24, h * 0.61);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w * 0.66, h * 0.57);
  ctx.lineTo(w * 0.7, h * 0.55);
  ctx.lineTo(w * 0.74, h * 0.58);
  ctx.stroke();
}

function renderMatrix(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Pure black digital background
  ctx.fillStyle = "#010804";
  ctx.fillRect(0, 0, w, h);

  const cols = 35;
  const colWidth = w / cols;
  const chars = "0123456789ABCDEF01アイウエオカキクケコサシスセソタチツテト";

  ctx.font = "14px monospace";
  for (let i = 0; i < cols; i++) {
    const speed = 60 + ((i * 17) % 80);
    const dropY = ((t * speed + i * 85) % (h + 300)) - 100;
    const numRows = 16;

    for (let r = 0; r < numRows; r++) {
      const charY = dropY - r * 18;
      if (charY < -20 || charY > h + 20) continue;

      const charIdx = Math.floor((i * 13 + r * 7 + t * 4) % chars.length);
      const char = chars[charIdx];

      if (r === 0) {
        // Leading glow character
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#00ff66";
        ctx.shadowBlur = 10;
      } else {
        const alpha = Math.max(0.1, 1 - r / numRows);
        ctx.fillStyle = `rgba(0, 255, 102, ${alpha})`;
        ctx.shadowBlur = 0;
      }

      ctx.fillText(char, i * colWidth + 4, charY);
    }
  }
  ctx.shadowBlur = 0;
}

function renderMountains(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Dawn sky
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#0f172a");
  sky.addColorStop(0.4, "#334155");
  sky.addColorStop(0.7, "#f59e0b");
  sky.addColorStop(1, "#fef3c7");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Rising Sun
  const sunX = w * 0.65;
  const sunY = h * 0.55;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 150);
  sunGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  sunGrad.addColorStop(0.3, "rgba(251, 191, 36, 0.6)");
  sunGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 150, 0, Math.PI * 2);
  ctx.fill();

  // Distant Layer 1
  ctx.fillStyle = "rgba(71, 85, 105, 0.7)";
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.58);
  ctx.lineTo(w * 0.3, h * 0.48);
  ctx.lineTo(w * 0.55, h * 0.6);
  ctx.lineTo(w * 0.8, h * 0.44);
  ctx.lineTo(w, h * 0.52);
  ctx.lineTo(w, h);
  ctx.fill();

  // Cascading Fog / Mist
  ctx.fillStyle = "rgba(254, 243, 199, 0.25)";
  ctx.fillRect(0, h * 0.52 + Math.sin(t * 0.5) * 10, w, 40);

  // Foreground Mountain Layer
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.7);
  ctx.lineTo(w * 0.25, h * 0.55);
  ctx.lineTo(w * 0.5, h * 0.75);
  ctx.lineTo(w * 0.85, h * 0.62);
  ctx.lineTo(w, h * 0.78);
  ctx.lineTo(w, h);
  ctx.fill();
}
