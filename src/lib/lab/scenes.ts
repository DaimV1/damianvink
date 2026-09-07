import * as THREE from "three";
import { feature } from "topojson-client";
import world from "world-atlas/land-110m.json";
import type { Topology, GeometryCollection } from "topojson-specification";

export type SceneControls = {
  spread: number;
  angle: number;
  speed: number;
  playing: boolean;
  reset: number;
};
export function buildScene(kind: "assembly" | "earth", scene: THREE.Scene) {
  const root = new THREE.Group();
  scene.add(root);
  const parts: { group: THREE.Group; start: number; offset: number }[] = [];
  const steel = new THREE.MeshStandardMaterial({
    color: 0xc2d0e1,
    metalness: 0.65,
    roughness: 0.28,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x30435a,
    metalness: 0.55,
    roughness: 0.35,
  });
  const blue = new THREE.MeshStandardMaterial({ color: 0x487fff, metalness: 0.45, roughness: 0.3 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xefb15f, metalness: 0.5, roughness: 0.3 });
  const materials: THREE.Material[] = [steel, dark, blue, gold];
  const textures: THREE.Texture[] = [];
  function mesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    parent: THREE.Group,
    x = 0,
  ) {
    const obj = new THREE.Mesh(geometry, material);
    obj.position.x = x;
    parent.add(obj);
    return obj;
  }
  function cylinder(
    radius: number,
    length: number,
    material: THREE.Material,
    parent: THREE.Group,
    x = 0,
    sides = 64,
  ) {
    const obj = mesh(
      new THREE.CylinderGeometry(radius, radius, length, sides),
      material,
      parent,
      x,
    );
    obj.rotation.z = Math.PI / 2;
    return obj;
  }
  function ring(
    outer: number,
    inner: number,
    length: number,
    material: THREE.Material,
    parent: THREE.Group,
    x = 0,
  ) {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: length,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      curveSegments: 48,
    });
    geo.translate(0, 0, -length / 2);
    geo.rotateY(Math.PI / 2);
    return mesh(geo, material, parent, x);
  }
  let earth: THREE.Group | undefined;
  if (kind === "assembly") {
    const group = (start: number, offset: number) => {
      const g = new THREE.Group();
      root.add(g);
      parts.push({ group: g, start, offset });
      return g;
    };
    const shaft = group(-0.7, -2.9);
    cylinder(0.24, 2.7, steel, shaft);
    cylinder(0.34, 0.22, dark, shaft, -0.5);
    const key = mesh(new THREE.BoxGeometry(0.6, 0.09, 0.1), gold, shaft, -0.9);
    key.position.y = 0.24;
    const housing = group(0, 0);
    ring(1.04, 0.73, 0.85, blue, housing);
    const foot = mesh(new THREE.BoxGeometry(1.25, 0.2, 2.4), dark, housing);
    foot.position.y = -1.05;
    const bearing = group(0.05, 1.7);
    ring(0.7, 0.57, 0.32, steel, bearing);
    ring(0.36, 0.25, 0.32, steel, bearing);
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      const ball = mesh(new THREE.SphereGeometry(0.105, 16, 12), gold, bearing);
      ball.position.set(0, Math.cos(a) * 0.465, Math.sin(a) * 0.465);
    }
    const cover = group(0.55, 3);
    ring(1.04, 0.38, 0.12, steel, cover);
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const bolt = cylinder(0.1, 0.1, dark, cover, 0.12, 6);
      bolt.position.y = Math.cos(a) * 0.86;
      bolt.position.z = Math.sin(a) * 0.86;
    }
    const nut = group(0.83, 4);
    ring(0.36, 0.25, 0.1, gold, nut);
    const axisMaterial = new THREE.LineDashedMaterial({
      color: 0x547398,
      dashSize: 0.16,
      gapSize: 0.12,
      transparent: true,
      opacity: 0.6,
    });
    materials.push(axisMaterial);
    const axis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-6, 0, 0),
        new THREE.Vector3(6, 0, 0),
      ]),
      axisMaterial,
    );
    axis.computeLineDistances();
    root.add(axis);
    const grid = new THREE.GridHelper(18, 36, 0x263b55, 0x152438);
    grid.position.y = -1.18;
    scene.add(grid);
    root.position.y = 0.3;
  } else {
    earth = new THREE.Group();
    root.add(earth);
    root.rotation.z = THREE.MathUtils.degToRad(-23.4);
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.fillStyle = "#10263f";
    ctx.fillRect(0, 0, 2048, 1024);
    ctx.strokeStyle = "#25405e";
    ctx.lineWidth = 1;
    for (let lon = -180; lon <= 180; lon += 15) {
      const x = ((lon + 180) / 360) * 2048;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let lat = -75; lat <= 75; lat += 15) {
      const y = ((90 - lat) / 180) * 1024;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(2048, y);
      ctx.stroke();
    }
    const topology = world as unknown as Topology<{ land: GeometryCollection }>;
    const land = feature(topology, topology.objects.land);
    ctx.fillStyle = "#7ba5c8";
    ctx.strokeStyle = "#b0d5ed";
    ctx.lineWidth = 0.7;
    for (const f of land.features) {
      const geometry = f.geometry;
      const polygons =
        geometry.type === "MultiPolygon"
          ? geometry.coordinates
          : geometry.type === "Polygon"
            ? [geometry.coordinates]
            : [];
      for (const polygon of polygons) {
        ctx.beginPath();
        for (const loop of polygon) {
          loop.forEach(([lon, lat], i) => {
            const x = ((lon + 180) / 360) * 2048,
              y = ((90 - lat) / 180) * 1024;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
        }
        ctx.fill("evenodd");
        ctx.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.82,
      metalness: 0.1,
    });
    materials.push(earthMaterial);
    mesh(new THREE.SphereGeometry(2.45, 96, 64), earthMaterial, earth);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x448cff,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.13,
    });
    materials.push(haloMaterial);
    mesh(new THREE.SphereGeometry(2.5, 64, 48), haloMaterial, earth);
    const axisMaterial = new THREE.LineBasicMaterial({ color: 0x617b99 });
    materials.push(axisMaterial);
    root.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, -3, 0),
          new THREE.Vector3(0, 3, 0),
        ]),
        axisMaterial,
      ),
    );
    earth.rotation.y = -Math.PI / 2;
  }
  let spin = 0;
  let lastReset = -1;
  return {
    update(c: SceneControls, delta: number) {
      if (c.reset !== lastReset) {
        spin = 0;
        lastReset = c.reset;
      }
      if (kind === "assembly") {
        root.rotation.y = (c.angle * Math.PI) / 180;
        parts.forEach(({ group, start, offset }) => {
          group.position.x = start + (offset * c.spread) / 100;
        });
      } else if (earth) {
        if (c.playing) spin += delta * c.speed * 0.3;
        earth.rotation.y = -Math.PI / 2 + spin + (c.angle * Math.PI) / 180;
      }
    },
    dispose() {
      textures.forEach((t) => t.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
