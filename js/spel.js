(function () {
  var canvas = document.getElementById("vink-game");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var W = 400;
  var H = 560;
  var GROUND = 48;
  var bestKey = "vink-best";

  var state = "ready";
  var birdY = H / 2;
  var birdV = 0;
  var birdX = 92;
  var birdR = 12;
  var pipes = [];
  var score = 0;
  var best = parseInt(localStorage.getItem(bestKey) || "0", 10);
  var frame = 0;
  var deadAt = 0;

  function colors() {
    var s = getComputedStyle(document.documentElement);
    return {
      paper: s.getPropertyValue("--paper-elevated").trim() || "#161920",
      ink: s.getPropertyValue("--ink").trim() || "#eceae4",
      blue: s.getPropertyValue("--blue").trim() || "#4d8cff",
      grey: s.getPropertyValue("--grey").trim() || "#8b8d94",
      line: s.getPropertyValue("--line-strong").trim() || "rgba(255,255,255,0.14)",
      muted: s.getPropertyValue("--ink-muted").trim() || "#a8a9ad"
    };
  }

  function resetPlay() {
    birdY = H / 2;
    birdV = 0;
    pipes = [];
    score = 0;
    frame = 0;
    spawn(280);
    spawn(500);
  }

  function spawn(x) {
    var gap = 148;
    var min = 80;
    var max = H - GROUND - 80 - gap;
    var top = min + Math.random() * (max - min);
    pipes.push({ x: x, top: top, gap: gap, w: 52, passed: false });
  }

  function flap() {
    var now = performance.now();
    if (state === "ready") {
      resetPlay();
      state = "play";
      birdV = -7.2;
      return;
    }
    if (state === "play") {
      birdV = -7.2;
      return;
    }
    if (state === "dead" && now - deadAt > 500) {
      state = "ready";
      birdY = H / 2;
      birdV = 0;
      pipes = [];
    }
  }

  function hitPipe(p) {
    var left = p.x;
    var right = p.x + p.w;
    var cx = birdX;
    var cy = birdY;
    if (cx + birdR < left || cx - birdR > right) return false;
    if (cy - birdR < p.top) return true;
    if (cy + birdR > p.top + p.gap) return true;
    return false;
  }

  function step() {
    if (state === "play") {
      birdV += 0.38;
      if (birdV > 9) birdV = 9;
      birdY += birdV;
      frame += 1;

      for (var i = 0; i < pipes.length; i++) {
        pipes[i].x -= 2.55;
        if (!pipes[i].passed && pipes[i].x + pipes[i].w < birdX) {
          pipes[i].passed = true;
          score += 1;
          if (score > best) {
            best = score;
            localStorage.setItem(bestKey, String(best));
          }
        }
      }
      if (pipes.length && pipes[0].x < -70) {
        pipes.shift();
        spawn(pipes[pipes.length - 1].x + 220);
      }

      var floor = H - GROUND - birdR;
      if (birdY > floor || birdY < birdR + 4) {
        state = "dead";
        deadAt = performance.now();
      } else {
        for (var j = 0; j < pipes.length; j++) {
          if (hitPipe(pipes[j])) {
            state = "dead";
            deadAt = performance.now();
            break;
          }
        }
      }
    } else if (state === "ready") {
      birdY = H / 2 + Math.sin(performance.now() / 280) * 6;
    }

    draw();
    requestAnimationFrame(step);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    var c = colors();
    ctx.fillStyle = c.paper;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = c.line;
    ctx.lineWidth = 1;
    for (var gx = 0; gx < W; gx += 24) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, H - GROUND);
      ctx.stroke();
    }

    ctx.fillStyle = c.line;
    for (var i = 0; i < pipes.length; i++) {
      var p = pipes[i];
      roundRect(p.x, 0, p.w, p.top, 4);
      ctx.fill();
      roundRect(p.x, p.top + p.gap, p.w, H - GROUND - (p.top + p.gap), 4);
      ctx.fill();
    }

    ctx.fillStyle = c.line;
    ctx.fillRect(0, H - GROUND, W, GROUND);
    ctx.fillStyle = c.blue;
    ctx.fillRect(0, H - GROUND, W, 3);

    var tilt = Math.max(-0.6, Math.min(0.8, birdV / 10));
    ctx.save();
    ctx.translate(birdX, birdY);
    ctx.rotate(tilt);
    ctx.fillStyle = c.blue;
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, -2);
    ctx.lineTo(20, 1);
    ctx.lineTo(12, 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c.paper;
    ctx.beginPath();
    ctx.arc(4, -2, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = c.ink;
    ctx.font = "700 28px Space Grotesk, sans-serif";
    ctx.textAlign = "center";
    if (state === "play" || state === "dead") {
      ctx.fillText(String(score), W / 2, 48);
    }

    ctx.font = "12px IBM Plex Mono, monospace";
    ctx.fillStyle = c.grey;
    ctx.textAlign = "left";
    ctx.fillText("record " + best, 16, H - 18);
    ctx.textAlign = "right";
    ctx.fillText("spatie / tik", W - 16, H - 18);

    if (state === "ready") {
      ctx.textAlign = "center";
      ctx.fillStyle = c.ink;
      ctx.font = "700 22px Space Grotesk, sans-serif";
      ctx.fillText("Vink", W / 2, H / 2 - 56);
      ctx.font = "15px IBM Plex Sans, sans-serif";
      ctx.fillStyle = c.muted;
      ctx.fillText("Tik of spatie om te vliegen", W / 2, H / 2 - 30);
    }
    if (state === "dead") {
      ctx.textAlign = "center";
      ctx.fillStyle = c.ink;
      ctx.font = "700 22px Space Grotesk, sans-serif";
      ctx.fillText("Raak.", W / 2, H / 2 - 20);
      ctx.font = "15px IBM Plex Sans, sans-serif";
      ctx.fillStyle = c.muted;
      ctx.fillText("Tik voor opnieuw", W / 2, H / 2 + 6);
    }
  }

  canvas.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    flap();
  });
  window.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      flap();
    }
  });

  var bestEl = document.getElementById("vink-best");
  if (bestEl) bestEl.textContent = String(best);
  setInterval(function () {
    if (bestEl) bestEl.textContent = String(best);
  }, 400);

  requestAnimationFrame(step);
})();
