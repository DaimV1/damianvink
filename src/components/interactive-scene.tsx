import { useEffect, useRef, useState } from "react";
import type { SceneControls } from "@/lib/lab/scenes";

export function InteractiveScene({
  kind,
  controls,
  label,
  unavailable,
}: {
  kind: "assembly" | "earth" | "solar";
  controls: SceneControls;
  label: string;
  unavailable: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const current = useRef(controls);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    current.current = controls;
  }, [controls]);
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    const element = host.current;
    if (!element) return;
    async function init() {
      try {
        const [THREE, { buildScene }] = await Promise.all([
          import("three"),
          import("@/lib/lab/scenes"),
        ]);
        if (cancelled || !element) return;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x081321, 1);
        renderer.domElement.setAttribute("role", "img");
        renderer.domElement.setAttribute("aria-label", label);
        element.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
        scene.add(new THREE.HemisphereLight(0xd0e5ff, 0x23334b, 2.6));
        const key = new THREE.DirectionalLight(0xffffff, 3.4);
        key.position.set(3, 6, 7);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x518eff, 2.4);
        rim.position.set(-4, 2, -4);
        scene.add(rim);
        const resize = new ResizeObserver(() => {
          const w = element.clientWidth,
            h = element.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          const distance =
            kind === "assembly"
              ? Math.max(14, 10 / camera.aspect)
              : kind === "solar"
                ? Math.max(16, 13 / camera.aspect)
                : Math.max(9.3, 8.2 / camera.aspect);
          camera.position.set(
            kind === "assembly" ? distance * 0.3 : 0,
            kind === "assembly" ? distance * 0.32 : kind === "solar" ? distance * 0.62 : 1,
            distance,
          );
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
        });
        const lost = (event: Event) => {
          event.preventDefault();
          renderer.setAnimationLoop(null);
          setStatus("error");
        };
        renderer.domElement.addEventListener("webglcontextlost", lost);
        cleanup = () => {
          resize.disconnect();
          renderer.setAnimationLoop(null);
          renderer.domElement.removeEventListener("webglcontextlost", lost);
          scene.traverse((object) => {
            if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
              object.geometry.dispose();
              const mats = Array.isArray(object.material) ? object.material : [object.material];
              mats.forEach((m) => m.dispose());
            }
          });
          model?.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
        const model = buildScene(kind, scene);
        resize.observe(element);
        let last = performance.now();
        renderer.setAnimationLoop((time: number) => {
          const delta = Math.min((time - last) / 1000, 0.05);
          last = time;
          if (document.hidden) return;
          model?.update(current.current, delta);
          renderer.render(scene, camera);
        });
        setStatus("ready");
      } catch {
        cleanup?.();
        if (!cancelled) setStatus("error");
      }
    }
    void init();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [kind, label]);
  return (
    <div className="relative h-[320px] w-full sm:h-[470px]">
      <div
        ref={host}
        className="absolute inset-0 overflow-hidden [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
      />
      {status !== "ready" && (
        <div
          role="status"
          className="absolute inset-0 grid place-items-center bg-[#081321] p-8 text-center text-base text-slate-300"
        >
          {status === "error" ? unavailable : "3D…"}
        </div>
      )}
    </div>
  );
}
