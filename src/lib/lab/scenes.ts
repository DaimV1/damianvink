import * as THREE from "three";
import { feature } from "topojson-client";
import world from "world-atlas/land-110m.json";
import type { Topology, GeometryCollection } from "topojson-specification";
import { BRACKET_DEFAULTS, needsGusset, requiredThicknessMm, type BoltCount } from "./bracket";
import {
  RIPPLE_FRAGMENT,
  RIPPLE_VERTEX,
  SURFACE_FRAGMENT,
  SURFACE_VERTEX,
} from "./fluid-shaders";
import { stepVessels, VESSEL_DEFAULTS } from "./vessels";

export type SceneControls = {
  spread: number;
  angle: number;
  speed: number;
  playing: boolean;
  reset: number;
  span?: number;
  load?: number;
  bolts?: BoltCount;
  tilt?: number;
  valve?: number;
};

type VesselsRig = {
  update(c: SceneControls, delta: number, renderer: THREE.WebGLRenderer | undefined): void;
  dispose(): void;
};

const SIM_SIZE = 96;
const TANK_HALF_WIDTH = 0.65;
const TANK_DEPTH = 1.3;
const TANK_HEIGHT = 3.2;
const TANK_BASE_Y = -1.6;
const TANK_FILLABLE = 2.9;
const TANK_X = 2.05;
const PIPE_RADIUS = 0.15;
const PIPE_Y = TANK_BASE_Y + 0.32;

/**
 * Two glass tanks connected by a pipe. The liquid surface in each is a
 * real-time GPU wave simulation (ping-pong render targets running the
 * discrete wave equation, classic "water ripple" shader technique) driven
 * by how fast liquid is moving through the pipe; the bulk fill level itself
 * comes from stepVessels() in ./vessels (communicating-vessels physics).
 */
function buildVesselsRig(root: THREE.Group, materials: THREE.Material[]): VesselsRig {
  function makeRenderTarget() {
    return new THREE.WebGLRenderTarget(SIM_SIZE, SIM_SIZE, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });
  }
  const targetsA = [makeRenderTarget(), makeRenderTarget()];
  const targetsB = [makeRenderTarget(), makeRenderTarget()];

  const simMaterial = new THREE.ShaderMaterial({
    vertexShader: RIPPLE_VERTEX,
    fragmentShader: RIPPLE_FRAGMENT,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tPrev: { value: null },
      uTexel: { value: new THREE.Vector2(1 / SIM_SIZE, 1 / SIM_SIZE) },
      uDt: { value: 0 },
      uDamping: { value: 0.6 },
      uInject: { value: new THREE.Vector3(0.5, 0.5, 0) },
    },
  });
  materials.push(simMaterial);
  const simQuadGeometry = new THREE.PlaneGeometry(2, 2);
  const simScene = new THREE.Scene();
  simScene.add(new THREE.Mesh(simQuadGeometry, simMaterial));
  const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // Plain alpha-blended "glass" rather than MeshPhysicalMaterial transmission:
  // transmission needs an unoccluded view of what's behind it to look right,
  // and depthWrite:false + explicit renderOrder is what actually guarantees
  // the liquid inside stays visible through the shell from every angle.
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0xdfeeff,
    transparent: true,
    opacity: 0.14,
    roughness: 0.08,
    metalness: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  materials.push(glassMaterial);
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x9fc4e8,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  materials.push(edgeMaterial);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x2f6fb0,
    transparent: true,
    opacity: 0.55,
    roughness: 0.25,
    metalness: 0.05,
    depthWrite: false,
  });
  materials.push(bodyMaterial);

  function makeTank(x: number) {
    const shellGeometry = new THREE.BoxGeometry(
      TANK_HALF_WIDTH * 2 + 0.15,
      TANK_HEIGHT,
      TANK_DEPTH + 0.15,
    );
    const shell = new THREE.Mesh(shellGeometry, glassMaterial);
    shell.position.set(x, TANK_BASE_Y + TANK_HEIGHT / 2, 0);
    shell.renderOrder = 0;
    root.add(shell);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(shellGeometry), edgeMaterial);
    edges.renderOrder = 3;
    shell.add(edges);

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(TANK_HALF_WIDTH * 2 - 0.06, 1, TANK_DEPTH - 0.06),
      bodyMaterial,
    );
    body.position.set(x, TANK_BASE_Y, 0);
    body.scale.y = 0.0001;
    body.renderOrder = 1;
    root.add(body);

    const surfaceMaterial = new THREE.ShaderMaterial({
      vertexShader: SURFACE_VERTEX,
      fragmentShader: SURFACE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        tHeight: { value: null },
        uHeightScale: { value: 0.22 },
        uTexel: { value: new THREE.Vector2(1 / SIM_SIZE, 1 / SIM_SIZE) },
        uColorDeep: { value: new THREE.Color(0x2c5f9e) },
        uColorShallow: { value: new THREE.Color(0x79b3e8) },
        uOpacity: { value: 0.88 },
      },
    });
    materials.push(surfaceMaterial);
    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(TANK_HALF_WIDTH * 2 - 0.06, TANK_DEPTH - 0.06, 40, 40),
      surfaceMaterial,
    );
    surface.rotation.x = -Math.PI / 2;
    surface.position.set(x, TANK_BASE_Y, 0);
    surface.renderOrder = 2;
    root.add(surface);

    return { body, surface, surfaceMaterial };
  }

  const tankA = makeTank(-TANK_X);
  const tankB = makeTank(TANK_X);

  const pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, TANK_X * 2 - TANK_HALF_WIDTH * 2 + 0.3, 20),
    bodyMaterial,
  );
  pipe.renderOrder = 1;
  pipe.rotation.z = Math.PI / 2;
  pipe.position.set(0, PIPE_Y, 0);
  root.add(pipe);

  let levelA = VESSEL_DEFAULTS.levelA;
  let levelB = VESSEL_DEFAULTS.levelB;
  let lastVesselReset = -1;
  let readA = 0;
  let readB = 0;
  let seeded = false;

  function computeRipple(
    renderer: THREE.WebGLRenderer,
    targets: THREE.WebGLRenderTarget[],
    readIndex: number,
    dt: number,
    injectX: number,
    injectZ: number,
    injectStrength: number,
  ) {
    const writeIndex = 1 - readIndex;
    simMaterial.uniforms.tPrev.value = targets[readIndex].texture;
    simMaterial.uniforms.uDt.value = dt;
    (simMaterial.uniforms.uInject.value as THREE.Vector3).set(injectX, injectZ, injectStrength);
    renderer.setRenderTarget(targets[writeIndex]);
    renderer.render(simScene, simCamera);
    renderer.setRenderTarget(null);
    return writeIndex;
  }

  return {
    update(c, delta, renderer) {
      if (!renderer) return;
      if (!seeded) {
        for (const t of [...targetsA, ...targetsB]) {
          renderer.setRenderTarget(t);
          renderer.clear(true, true, true);
        }
        renderer.setRenderTarget(null);
        seeded = true;
      }
      const tilt = c.tilt ?? VESSEL_DEFAULTS.tilt;
      const valve = c.valve ?? VESSEL_DEFAULTS.valve;

      if (c.reset !== lastVesselReset) {
        lastVesselReset = c.reset;
        levelA = VESSEL_DEFAULTS.levelA;
        levelB = VESSEL_DEFAULTS.levelB;
      }

      let flow = 0;
      if (c.playing) {
        const result = stepVessels({ levelA, levelB }, tilt, valve, Math.min(delta, 0.033));
        levelA = result.state.levelA;
        levelB = result.state.levelB;
        flow = result.flow;
      }

      root.rotation.z = -(tilt * Math.PI) / 180;

      const heightA = Math.max(0.02, levelA * TANK_FILLABLE);
      tankA.body.scale.y = heightA;
      tankA.body.position.y = TANK_BASE_Y + heightA / 2;
      tankA.surface.position.y = TANK_BASE_Y + heightA;

      const heightB = Math.max(0.02, levelB * TANK_FILLABLE);
      tankB.body.scale.y = heightB;
      tankB.body.position.y = TANK_BASE_Y + heightB / 2;
      tankB.surface.position.y = TANK_BASE_Y + heightB;

      const injectStrength = Math.min(0.4, Math.abs(flow) * 6);
      const dt = Math.min(delta, 0.033);
      readA = computeRipple(renderer, targetsA, readA, dt, 0.92, 0.5, injectStrength);
      readB = computeRipple(renderer, targetsB, readB, dt, 0.08, 0.5, injectStrength);

      tankA.surfaceMaterial.uniforms.tHeight.value = targetsA[readA].texture;
      tankB.surfaceMaterial.uniforms.tHeight.value = targetsB[readB].texture;
    },
    dispose() {
      targetsA.forEach((t) => t.dispose());
      targetsB.forEach((t) => t.dispose());
      simQuadGeometry.dispose();
    },
  };
}

export function buildScene(
  kind: "assembly" | "earth" | "solar" | "particles" | "bracket" | "vessels",
  scene: THREE.Scene,
) {
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
  const planets: { group: THREE.Group; orbit: number; angle: number; start: number; speedFactor: number }[] =
    [];
  let points: THREE.Points | undefined;
  let homes: Float32Array | undefined;
  let phases: Float32Array | undefined;
  let bracketGroup: THREE.Group | undefined;
  let rebuildBracket: ((spanMm: number, loadN: number, bolts: BoltCount) => void) | undefined;
  let vessels: VesselsRig | undefined;
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
  } else if (kind === "earth") {
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
  } else if (kind === "solar") {
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xf7b955 });
    materials.push(sunMaterial);
    mesh(new THREE.SphereGeometry(0.85, 48, 32), sunMaterial, root);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffb057,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
    });
    materials.push(glowMaterial);
    mesh(new THREE.SphereGeometry(1.15, 32, 24), glowMaterial, root);

    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x2c4867,
      transparent: true,
      opacity: 0.55,
    });
    materials.push(orbitMaterial);

    const PLANET_DATA = [
      { name: "Mercurius", color: 0x9c9891, orbit: 1.7, size: 0.11, period: 0.24 },
      { name: "Venus", color: 0xd9b382, orbit: 2.25, size: 0.17, period: 0.62 },
      { name: "Aarde", color: 0x4d7ec2, orbit: 2.85, size: 0.18, period: 1 },
      { name: "Mars", color: 0xc1592f, orbit: 3.5, size: 0.13, period: 1.88 },
      { name: "Jupiter", color: 0xd8ae7e, orbit: 4.6, size: 0.42, period: 11.86 },
      { name: "Saturnus", color: 0xe3c98f, orbit: 5.85, size: 0.36, period: 29.46, ring: true },
      { name: "Uranus", color: 0x9fd4d4, orbit: 6.85, size: 0.26, period: 84 },
      { name: "Neptunus", color: 0x3f5fc9, orbit: 7.75, size: 0.25, period: 164.8 },
    ];

    PLANET_DATA.forEach((p, i) => {
      const orbitPoints: THREE.Vector3[] = [];
      const segments = 96;
      for (let s = 0; s <= segments; s++) {
        const a = (s / segments) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(Math.cos(a) * p.orbit, 0, Math.sin(a) * p.orbit));
      }
      root.add(
        new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(orbitPoints), orbitMaterial),
      );

      const planetMaterial = new THREE.MeshStandardMaterial({
        color: p.color,
        roughness: 0.75,
        metalness: 0.08,
      });
      materials.push(planetMaterial);
      const group = new THREE.Group();
      root.add(group);
      mesh(new THREE.SphereGeometry(p.size, 32, 24), planetMaterial, group);
      if (p.ring) {
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xcbb178,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        });
        materials.push(ringMaterial);
        const ringMesh = new THREE.Mesh(
          new THREE.RingGeometry(p.size * 1.4, p.size * 2.1, 48),
          ringMaterial,
        );
        ringMesh.rotation.x = Math.PI / 2.3;
        group.add(ringMesh);
      }
      const start = (i / PLANET_DATA.length) * Math.PI * 2;
      planets.push({ group, orbit: p.orbit, angle: start, start, speedFactor: 1 / Math.sqrt(p.period) });
    });
  } else if (kind === "particles") {
    const COUNT = 4000;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    homes = new Float32Array(COUNT * 3);
    phases = new Float32Array(COUNT);
    const inner = new THREE.Color(0xf7b955);
    const outer = new THREE.Color(0x5b8cff);
    for (let i = 0; i < COUNT; i++) {
      const r = Math.sqrt(Math.random()) * 4.2;
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      const z = (Math.random() - 0.5) * 1.6 * (1 - (r / 4.2) * 0.5);
      positions[i * 3] = homes[i * 3] = x;
      positions[i * 3 + 1] = homes[i * 3 + 1] = y;
      positions[i * 3 + 2] = homes[i * 3 + 2] = z;
      phases[i] = Math.random() * Math.PI * 2;
      const c = inner.clone().lerp(outer, r / 4.2);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const pointMaterial = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    materials.push(pointMaterial);
    points = new THREE.Points(geometry, pointMaterial);
    root.add(points);
  } else if (kind === "bracket") {
    bracketGroup = new THREE.Group();
    root.add(bracketGroup);
    const forceMaterial = new THREE.MeshBasicMaterial({ color: 0xe2564a });
    materials.push(forceMaterial);
    const gussetMaterial = new THREE.MeshStandardMaterial({
      color: 0xefb15f,
      metalness: 0.5,
      roughness: 0.3,
    });
    materials.push(gussetMaterial);

    const WALL_THICKNESS = 0.3;
    const WALL_HEIGHT = 3;
    const WALL_DEPTH = 1.3;
    const SHELF_DEPTH = 1;
    const MM_PER_UNIT = 40;
    const THICKNESS_MM_PER_UNIT = 12;

    function clearGroup(group: THREE.Group) {
      while (group.children.length) {
        const child = group.children[0];
        group.remove(child);
        child.traverse((object) => {
          if (
            object instanceof THREE.Mesh ||
            object instanceof THREE.Line ||
            object instanceof THREE.Points
          ) {
            object.geometry.dispose();
          }
        });
      }
    }

    const BOLT_LAYOUTS: Record<BoltCount, [number, number][]> = {
      2: [
        [-0.8, 0],
        [0.8, 0],
      ],
      4: [
        [-0.8, -0.4],
        [-0.8, 0.4],
        [0.8, -0.4],
        [0.8, 0.4],
      ],
      6: [
        [-0.9, -0.4],
        [-0.9, 0.4],
        [0, -0.4],
        [0, 0.4],
        [0.9, -0.4],
        [0.9, 0.4],
      ],
    };

    rebuildBracket = (spanMm, loadN, bolts) => {
      if (!bracketGroup) return;
      clearGroup(bracketGroup);
      const spanUnits = spanMm / MM_PER_UNIT;
      const thicknessUnits = requiredThicknessMm(spanMm, loadN) / THICKNESS_MM_PER_UNIT;
      const wallTopY = WALL_HEIGHT / 2;
      const shelfCenterY = wallTopY - thicknessUnits / 2;
      const shelfBottomY = shelfCenterY - thicknessUnits / 2;

      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(WALL_THICKNESS, WALL_HEIGHT, WALL_DEPTH),
        steel,
      );
      wall.position.set(-WALL_THICKNESS / 2, 0, 0);
      bracketGroup.add(wall);

      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(spanUnits, thicknessUnits, SHELF_DEPTH),
        blue,
      );
      shelf.position.set(spanUnits / 2, shelfCenterY, 0);
      bracketGroup.add(shelf);

      for (const [y, z] of BOLT_LAYOUTS[bolts]) {
        const bolt = cylinder(0.09, WALL_THICKNESS * 1.4, dark, bracketGroup, -WALL_THICKNESS / 2);
        bolt.position.y = y;
        bolt.position.z = z;
      }

      if (needsGusset(loadN)) {
        const fromX = 0;
        const fromY = shelfBottomY - 0.9;
        const toX = spanUnits * 0.55;
        const toY = shelfBottomY;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const length = Math.hypot(dx, dy);
        const brace = new THREE.Mesh(
          new THREE.BoxGeometry(length, 0.14, SHELF_DEPTH * 0.7),
          gussetMaterial,
        );
        brace.position.set((fromX + toX) / 2, (fromY + toY) / 2, 0);
        brace.rotation.z = Math.atan2(dy, dx);
        bracketGroup.add(brace);
      }

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 12), forceMaterial);
      shaft.position.set(spanUnits, shelfBottomY - 0.35, 0);
      bracketGroup.add(shaft);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.28, 16), forceMaterial);
      head.position.set(spanUnits, shelfBottomY - 0.84, 0);
      head.rotation.x = Math.PI;
      bracketGroup.add(head);
    };
  } else {
    vessels = buildVesselsRig(root, materials);
  }
  let spin = 0;
  let lastReset = -1;
  let flowTime = 0;
  let lastSpan = -1;
  let lastLoad = -1;
  let lastBolts: BoltCount | -1 = -1;
  const pointerLocal = new THREE.Vector3();
  return {
    update(
      c: SceneControls,
      delta: number,
      pointer?: THREE.Vector3 | null,
      renderer?: THREE.WebGLRenderer,
    ) {
      if (c.reset !== lastReset) {
        spin = 0;
        lastReset = c.reset;
        flowTime = 0;
        planets.forEach((p) => {
          p.angle = p.start;
        });
      }
      if (kind === "assembly") {
        root.rotation.y = (c.angle * Math.PI) / 180;
        parts.forEach(({ group, start, offset }) => {
          group.position.x = start + (offset * c.spread) / 100;
        });
      } else if (earth) {
        if (c.playing) spin += delta * c.speed * 0.3;
        earth.rotation.y = -Math.PI / 2 + spin + (c.angle * Math.PI) / 180;
      } else if (kind === "solar") {
        root.rotation.y = (c.angle * Math.PI) / 180;
        planets.forEach((p) => {
          if (c.playing) p.angle += delta * c.speed * p.speedFactor * 0.6;
          p.group.position.set(Math.cos(p.angle) * p.orbit, 0, Math.sin(p.angle) * p.orbit);
        });
      } else if (points && homes && phases) {
        root.rotation.y = (c.angle * Math.PI) / 180;
        if (c.playing) flowTime += delta * c.speed;
        let local: THREE.Vector3 | null = null;
        if (pointer) {
          pointerLocal.copy(pointer);
          root.worldToLocal(pointerLocal);
          local = pointerLocal;
        }
        const posAttr = points.geometry.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        const radius = 2.6;
        for (let i = 0; i < phases.length; i++) {
          const ph = phases[i];
          let px = homes[i * 3] + Math.sin(flowTime * 0.6 + ph) * 0.18;
          let py = homes[i * 3 + 1] + Math.cos(flowTime * 0.5 + ph * 1.3) * 0.18;
          const pz = homes[i * 3 + 2] + Math.sin(flowTime * 0.4 + ph * 0.7) * 0.12;
          if (local) {
            const dx = px - local.x;
            const dy = py - local.y;
            const dist = Math.hypot(dx, dy) + 0.0001;
            if (dist < radius) {
              const fall = 1 - dist / radius;
              const influence = fall * fall;
              const ux = dx / dist;
              const uy = dy / dist;
              px += -uy * influence * 2.1 + ux * influence * 1.1;
              py += ux * influence * 2.1 + uy * influence * 1.1;
            }
          }
          arr[i * 3] = px;
          arr[i * 3 + 1] = py;
          arr[i * 3 + 2] = pz;
        }
        posAttr.needsUpdate = true;
      } else if (rebuildBracket) {
        root.rotation.y = (c.angle * Math.PI) / 180;
        const spanMm = c.span ?? BRACKET_DEFAULTS.span;
        const loadN = c.load ?? BRACKET_DEFAULTS.load;
        const bolts = c.bolts ?? BRACKET_DEFAULTS.bolts;
        if (spanMm !== lastSpan || loadN !== lastLoad || bolts !== lastBolts) {
          rebuildBracket(spanMm, loadN, bolts);
          lastSpan = spanMm;
          lastLoad = loadN;
          lastBolts = bolts;
        }
      } else if (vessels) {
        vessels.update(c, delta, renderer);
      }
    },
    dispose() {
      textures.forEach((t) => t.dispose());
      materials.forEach((m) => m.dispose());
      vessels?.dispose();
    },
  };
}
