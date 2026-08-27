import { useEffect, useRef, useState } from "react";

const H = 220;
const GROUND = 36;
const BEST_KEY = "vink-run-best";

type Kind = "box" | "pole" | "air";
type Obstacle = { x: number; w: number; h: number; kind: Kind };
type Mode = "ready" | "play" | "dead";

export function VinkRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
    const startBest = Number.isFinite(stored) ? stored : 0;
    setBest(startBest);
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 720;
    let state: Mode = "ready";
    let y = 0;
    let v = 0;
    let duck = false;
    let holdDuck = false;
    let obstacles: Obstacle[] = [];
    let score = 0;
    let bestLocal = startBest;
    let speed = 6;
    let spawnIn = 90;
    let groundX = 0;
    let deadAt = 0;
    let raf = 0;
    let last = performance.now();

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

    function resize() {
      const next = Math.max(320, Math.floor(wrap.clientWidth));
      if (next === W) return;
      W = next;
      canvas.width = W;
      canvas.height = H;
    }

    function floorY() {
      return H - GROUND;
    }

    function birdBox() {
      const bh = duck && y >= floorY() - 1 ? 16 : 22;
      const bw = duck && y >= floorY() - 1 ? 28 : 24;
      return { x: 52, y: y - bh, w: bw, h: bh };
    }

    function spawn() {
      const roll = Math.random();
      if (roll < 0.18 && speed > 7) {
        obstacles.push({ x: W + 8, w: 28, h: 16, kind: "air" });
      } else if (roll < 0.55) {
        obstacles.push({ x: W + 8, w: 22, h: 28 + Math.round(Math.random() * 10), kind: "box" });
      } else {
        obstacles.push({ x: W + 8, w: 14, h: 38 + Math.round(Math.random() * 16), kind: "pole" });
      }
      spawnIn = 55 + Math.random() * 70 - Math.min(20, speed);
    }

    function resetPlay() {
      y = floorY();
      v = 0;
      duck = false;
      obstacles = [];
      score = 0;
      speed = 6;
      spawnIn = 50;
      groundX = 0;
    }

    function jump() {
      const now = performance.now();
      if (state === "ready") {
        resetPlay();
        state = "play";
        v = -11.2;
        return;
      }
      if (state === "play" && y >= floorY() - 0.5) {
        duck = false;
        v = -11.2;
        return;
      }
      if (state === "dead" && now - deadAt > 420) {
        state = "ready";
        y = floorY();
        v = 0;
        obstacles = [];
      }
    }

    function setDuck(on: boolean) {
      holdDuck = on;
      if (state === "play" && y >= floorY() - 0.5) duck = on;
    }

    function hit(o: Obstacle) {
      const b = birdBox();
      const ox = o.x;
      const oy = o.kind === "air" ? floorY() - 62 : floorY() - o.h;
      return b.x < ox + o.w && b.x + b.w > ox && b.y < oy + o.h && b.y + b.h > oy;
    }

    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }

    function drawVink(c: ReturnType<typeof colors>) {
      const b = birdBox();
      const cx = b.x + b.w * 0.45;
      const cy = b.y + b.h * 0.55;
      const run = state === "play" && y >= floorY() - 0.5 ? Math.sin(performance.now() / 70) * 2 : 0;
      ctx.save();
      ctx.translate(cx, cy + run);
      if (v < -1) ctx.rotate(-0.25);
      else if (v > 4) ctx.rotate(0.35);
      ctx.fillStyle = c.blue;
      ctx.beginPath();
      ctx.ellipse(0, 0, duck ? 14 : 13, duck ? 6.5 : 8.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(11, -2);
      ctx.lineTo(20, 1);
      ctx.lineTo(11, 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = c.paper;
      ctx.beginPath();
      ctx.arc(4, -2.2, 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function draw() {
      const c = colors();
      ctx.fillStyle = c.paper;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = c.line;
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 24) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H - GROUND);
        ctx.stroke();
      }

      ctx.fillStyle = c.line;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.ellipse((groundX * 0.3 + 80) % (W + 80) - 40, 38, 22, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse((groundX * 0.22 + 320) % (W + 80) - 40, 58, 30, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = c.line;
      ctx.fillRect(0, H - GROUND, W, GROUND);
      ctx.fillStyle = c.blue;
      ctx.fillRect(0, H - GROUND, W, 3);
      ctx.fillStyle = c.grey;
      const dash = 18;
      const off = groundX % (dash * 2);
      for (let x = -off; x < W; x += dash * 2) ctx.fillRect(x, H - 14, dash, 2);

      for (const o of obstacles) {
        const oy = o.kind === "air" ? floorY() - 62 : floorY() - o.h;
        ctx.fillStyle = c.line;
        roundRect(o.x, oy, o.w, o.h, o.kind === "pole" ? 3 : 5);
        ctx.fill();
        if (o.kind !== "air") {
          ctx.fillStyle = c.blue;
          ctx.fillRect(o.x, oy, o.w, 3);
        }
      }

      drawVink(c);

      ctx.fillStyle = c.ink;
      ctx.font = "700 22px Space Grotesk, sans-serif";
      ctx.textAlign = "right";
      if (state === "play" || state === "dead") ctx.fillText(String(Math.floor(score)), W - 16, 28);
      ctx.font = "12px IBM Plex Mono, monospace";
      ctx.fillStyle = c.grey;
      ctx.textAlign = "left";
      ctx.fillText("record " + bestLocal, 16, H - 14);
      ctx.textAlign = "right";
      ctx.fillText("spatie / \u2193", W - 16, H - 14);

      if (state === "ready") {
        ctx.textAlign = "center";
        ctx.fillStyle = c.ink;
        ctx.font = "700 20px Space Grotesk, sans-serif";
        ctx.fillText("Vink vliegt door.", W / 2, 78);
        ctx.font = "14px IBM Plex Sans, sans-serif";
        ctx.fillStyle = c.muted;
        ctx.fillText("Spatie of tik om te springen", W / 2, 102);
      }
      if (state === "dead") {
        ctx.textAlign = "center";
        ctx.fillStyle = c.ink;
        ctx.font = "700 20px Space Grotesk, sans-serif";
        ctx.fillText("Raak.", W / 2, 78);
        ctx.font = "14px IBM Plex Sans, sans-serif";
        ctx.fillStyle = c.muted;
        ctx.fillText("Tik voor opnieuw", W / 2, 102);
      }
    }

    function step(now: number) {
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      resize();
      if (state === "play") {
        v += 0.62 * dt;
        if (v > 14) v = 14;
        y += v * dt;
        if (y > floorY()) {
          y = floorY();
          v = 0;
          duck = holdDuck;
        }
        speed += 0.0018 * dt;
        groundX += speed * dt;
        score += 0.12 * speed * dt;
        spawnIn -= dt;
        if (spawnIn <= 0) spawn();
        for (const o of obstacles) o.x -= speed * dt;
        obstacles = obstacles.filter((o) => o.x + o.w > -20);
        if (obstacles.some(hit)) {
          state = "dead";
          deadAt = now;
          const nextBest = Math.max(bestLocal, Math.floor(score));
          if (nextBest !== bestLocal) {
            bestLocal = nextBest;
            localStorage.setItem(BEST_KEY, String(bestLocal));
            setBest(bestLocal);
          }
        }
      } else if (state === "ready") {
        y = floorY();
      }
      draw();
      raf = requestAnimationFrame(step);
    }

    function onPointer(e: PointerEvent) {
      e.preventDefault();
      jump();
    }
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        jump();
      }
      if (e.code === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        setDuck(true);
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "ArrowDown" || e.key === "s" || e.key === "S") setDuck(false);
    }

    resize();
    y = floorY();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    canvas.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div ref={wrapRef} className="w-full">
      <canvas
        ref={canvasRef}
        width={720}
        height={H}
        className="w-full rounded-xl border border-line bg-elevated touch-none"
        role="img"
        aria-label="Vink-runner: spatie of tik om te springen, pijl omlaag om te bukken"
      />
      <p className="mt-3 flex justify-between font-mono text-xs text-muted">
        <span>
          Record: <strong className="text-ink">{best}</strong>
        </span>
        <span>Spatie springt · ↓ bukt</span>
      </p>
    </div>
  );
}
