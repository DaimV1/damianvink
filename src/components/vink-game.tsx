import { useEffect, useRef, useState } from "react";

const W = 400;
const H = 560;
const GROUND = 48;
const BEST_KEY = "vink-best";

type Pipe = { x: number; top: number; gap: number; w: number; passed: boolean };
type Mode = "ready" | "play" | "dead";

export function VinkGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
    setBest(Number.isFinite(stored) ? stored : 0);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let state: Mode = "ready";
    let birdY = H / 2;
    let birdV = 0;
    const birdX = 92;
    const birdR = 12;
    let pipes: Pipe[] = [];
    let score = 0;
    let bestLocal = Number.isFinite(stored) ? stored : 0;
    let deadAt = 0;
    let raf = 0;

    function colors() {
      const s = getComputedStyle(document.documentElement);
      return {
        paper: s.getPropertyValue("--paper-elevated").trim() || "#15171d",
        ink: s.getPropertyValue("--ink").trim() || "#f1efe8",
        blue: s.getPropertyValue("--accent").trim() || "#5b8cff",
        grey: s.getPropertyValue("--ink-subtle").trim() || "#6e717a",
        line: s.getPropertyValue("--line-strong").trim() || "rgba(255,255,255,0.16)",
        muted: s.getPropertyValue("--ink-muted").trim() || "#9b9da6",
      };
    }

    function spawn(x: number) {
      const gap = 148;
      const min = 80;
      const max = H - GROUND - 80 - gap;
      const top = min + Math.random() * (max - min);
      pipes.push({ x, top, gap, w: 52, passed: false });
    }

    function resetPlay() {
      birdY = H / 2;
      birdV = 0;
      pipes = [];
      score = 0;
      spawn(280);
      spawn(500);
    }

    function flap() {
      const now = performance.now();
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

    function hitPipe(p: Pipe) {
      const left = p.x;
      const right = p.x + p.w;
      if (birdX + birdR < left || birdX - birdR > right) return false;
      if (birdY - birdR < p.top) return true;
      if (birdY + birdR > p.top + p.gap) return true;
      return false;
    }

    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      ctx!.beginPath();
      ctx!.moveTo(x + r, y);
      ctx!.arcTo(x + w, y, x + w, y + h, r);
      ctx!.arcTo(x + w, y + h, x, y + h, r);
      ctx!.arcTo(x, y + h, x, y, r);
      ctx!.arcTo(x, y, x + w, y, r);
      ctx!.closePath();
    }

    function draw() {
      const c = colors();
      ctx!.fillStyle = c.paper;
      ctx!.fillRect(0, 0, W, H);
      ctx!.strokeStyle = c.line;
      ctx!.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 24) {
        ctx!.beginPath();
        ctx!.moveTo(gx, 0);
        ctx!.lineTo(gx, H - GROUND);
        ctx!.stroke();
      }
      ctx!.fillStyle = c.line;
      for (const p of pipes) {
        roundRect(p.x, 0, p.w, p.top, 4);
        ctx!.fill();
        roundRect(p.x, p.top + p.gap, p.w, H - GROUND - (p.top + p.gap), 4);
        ctx!.fill();
      }
      ctx!.fillStyle = c.line;
      ctx!.fillRect(0, H - GROUND, W, GROUND);
      ctx!.fillStyle = c.blue;
      ctx!.fillRect(0, H - GROUND, W, 3);

      const tilt = Math.max(-0.6, Math.min(0.8, birdV / 10));
      ctx!.save();
      ctx!.translate(birdX, birdY);
      ctx!.rotate(tilt);
      ctx!.fillStyle = c.blue;
      ctx!.beginPath();
      ctx!.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.beginPath();
      ctx!.moveTo(12, -2);
      ctx!.lineTo(20, 1);
      ctx!.lineTo(12, 4);
      ctx!.closePath();
      ctx!.fill();
      ctx!.fillStyle = c.paper;
      ctx!.beginPath();
      ctx!.arc(4, -2, 2.2, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();

      ctx!.fillStyle = c.ink;
      ctx!.font = "700 28px Space Grotesk, sans-serif";
      ctx!.textAlign = "center";
      if (state === "play" || state === "dead") {
        ctx!.fillText(String(score), W / 2, 48);
      }
      ctx!.font = "12px IBM Plex Mono, monospace";
      ctx!.fillStyle = c.grey;
      ctx!.textAlign = "left";
      ctx!.fillText("record " + bestLocal, 16, H - 18);
      ctx!.textAlign = "right";
      ctx!.fillText("spatie / tik", W - 16, H - 18);

      if (state === "ready") {
        ctx!.textAlign = "center";
        ctx!.fillStyle = c.ink;
        ctx!.font = "700 22px Space Grotesk, sans-serif";
        ctx!.fillText("Vink", W / 2, H / 2 - 56);
        ctx!.font = "15px IBM Plex Sans, sans-serif";
        ctx!.fillStyle = c.muted;
        ctx!.fillText("Tik of spatie om te vliegen", W / 2, H / 2 - 30);
      }
      if (state === "dead") {
        ctx!.textAlign = "center";
        ctx!.fillStyle = c.ink;
        ctx!.font = "700 22px Space Grotesk, sans-serif";
        ctx!.fillText("Raak.", W / 2, H / 2 - 20);
        ctx!.font = "15px IBM Plex Sans, sans-serif";
        ctx!.fillStyle = c.muted;
        ctx!.fillText("Tik voor opnieuw", W / 2, H / 2 + 6);
      }
    }

    function step() {
      if (state === "play") {
        birdV += 0.38;
        if (birdV > 9) birdV = 9;
        birdY += birdV;
        for (const p of pipes) {
          p.x -= 2.55;
          if (!p.passed && p.x + p.w < birdX) {
            p.passed = true;
            score += 1;
            if (score > bestLocal) {
              bestLocal = score;
              localStorage.setItem(BEST_KEY, String(bestLocal));
              setBest(bestLocal);
            }
          }
        }
        if (pipes.length && pipes[0].x < -70) {
          pipes.shift();
          spawn(pipes[pipes.length - 1].x + 220);
        }
        const floor = H - GROUND - birdR;
        if (birdY > floor || birdY < birdR + 4) {
          state = "dead";
          deadAt = performance.now();
        } else if (pipes.some(hitPipe)) {
          state = "dead";
          deadAt = performance.now();
        }
      } else if (state === "ready") {
        birdY = H / 2 + Math.sin(performance.now() / 280) * 6;
      }
      draw();
      raf = requestAnimationFrame(step);
    }

    function onPointer(e: PointerEvent) {
      e.preventDefault();
      flap();
    }
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        flap();
      }
    }

    canvas.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="mx-auto max-w-[400px]">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full rounded-xl border border-line bg-elevated touch-none"
        role="img"
        aria-label="Vink: tik of spatie om te vliegen"
      />
      <p className="mt-3 flex justify-between font-mono text-xs text-muted">
        <span>
          Record: <strong className="text-ink">{best}</strong>
        </span>
        <span>Mobiel: tik op het veld</span>
      </p>
    </div>
  );
}
