import { useEffect, useRef, useState } from "react";
import type { SceneControls } from "@/lib/lab/scenes";
import type { Vector3 } from "three";

export type SceneKind = "assembly" | "earth" | "solar" | "particles" | "bracket" | "vessels";

/** Camera distance and position per demo, tuned by eye. x/y are functions of distance. */
const CAMERA_FRAMING: Record<
  SceneKind,
  {
    distance: (aspect: number) => number;
    x: (distance: number) => number;
    y: (distance: number) => number;
    lookAt: [number, number, number];
  }
> = {
  assembly: {
    distance: (a) => Math.max(14, 10 / a),
    x: (d) => d * 0.3,
    y: (d) => d * 0.32,
    lookAt: [0, 0, 0],
  },
  solar: {
    distance: (a) => Math.max(16, 13 / a),
    x: () => 0,
    y: (d) => d * 0.62,
    lookAt: [0, 0, 0],
  },
  particles: {
    distance: (a) => Math.max(11, 9.5 / a),
    x: () => 0,
    y: (d) => d * 0.22,
    lookAt: [0, 0, 0],
  },
  bracket: {
    distance: (a) => Math.max(10, 8.5 / a),
    x: (d) => d * 0.4,
    y: (d) => d * 0.3,
    lookAt: [1.4, 0, 0],
  },
  earth: { distance: (a) => Math.max(9.3, 8.2 / a), x: () => 0, y: () => 1, lookAt: [0, 0, 0] },
  vessels: {
    distance: (a) => Math.max(11.5, 9.8 / a),
    x: () => 0,
    y: (d) => d * 0.18,
    lookAt: [0, -0.3, 0],
  },
};

export function InteractiveScene({
  kind,
  controls,
  label,
  unavailable,
}: {
  kind: SceneKind;
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
          const framing = CAMERA_FRAMING[kind];
          const distance = framing.distance(camera.aspect);
          camera.position.set(framing.x(distance), framing.y(distance), distance);
          camera.lookAt(...framing.lookAt);
          camera.updateProjectionMatrix();
        });
        const lost = (event: Event) => {
          event.preventDefault();
          renderer.setAnimationLoop(null);
          setStatus("error");
        };
        renderer.domElement.addEventListener("webglcontextlost", lost);
        const raycaster = new THREE.Raycaster();
        const pointerPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const pointerNDC = new THREE.Vector2();
        const pointerWorld = new THREE.Vector3();
        let pointerActive = false;
        const onPointerMove = (event: PointerEvent) => {
          const rect = renderer.domElement.getBoundingClientRect();
          pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          pointerActive = true;
        };
        const onPointerLeave = () => {
          pointerActive = false;
        };
        renderer.domElement.addEventListener("pointermove", onPointerMove);
        renderer.domElement.addEventListener("pointerleave", onPointerLeave);
        cleanup = () => {
          resize.disconnect();
          renderer.setAnimationLoop(null);
          renderer.domElement.removeEventListener("webglcontextlost", lost);
          renderer.domElement.removeEventListener("pointermove", onPointerMove);
          renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
          scene.traverse((object) => {
            if (
              object instanceof THREE.Mesh ||
              object instanceof THREE.Line ||
              object instanceof THREE.Points
            ) {
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
          let pointer: Vector3 | null = null;
          if (kind === "particles" && pointerActive) {
            raycaster.setFromCamera(pointerNDC, camera);
            pointer = raycaster.ray.intersectPlane(pointerPlane, pointerWorld);
          }
          model?.update(current.current, delta, pointer, renderer);
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
