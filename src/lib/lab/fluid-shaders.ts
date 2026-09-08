/**
 * Ripple simulation: a discrete 2D wave equation over a small render-target
 * texture, run as a ping-pong compute pass (classic "water ripple" shader
 * technique). R channel holds height, G channel holds vertical velocity.
 */
export const RIPPLE_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const RIPPLE_FRAGMENT = /* glsl */ `
  uniform sampler2D tPrev;
  uniform vec2 uTexel;
  uniform float uDt;
  uniform float uDamping;
  uniform vec3 uInject; // xy = uv position, z = strength (0 = none)
  varying vec2 vUv;

  void main() {
    vec2 h = texture2D(tPrev, vUv).rg;
    float hl = texture2D(tPrev, vUv - vec2(uTexel.x, 0.0)).r;
    float hr = texture2D(tPrev, vUv + vec2(uTexel.x, 0.0)).r;
    float hd = texture2D(tPrev, vUv - vec2(0.0, uTexel.y)).r;
    float hu = texture2D(tPrev, vUv + vec2(0.0, uTexel.y)).r;
    float laplacian = (hl + hr + hd + hu) * 0.25 - h.r;

    float vel = h.g + laplacian * 2.4 - h.g * uDamping;
    float height = h.r + vel * uDt;

    float edge = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x)
      * smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
    height *= mix(0.8, 1.0, edge);
    vel *= mix(0.8, 1.0, edge);

    float d = distance(vUv, uInject.xy);
    height += uInject.z * exp(-d * d * 360.0);

    gl_FragColor = vec4(height, vel, 0.0, 1.0);
  }
`;

/** Liquid surface: samples the ripple texture to displace a plane and shade it like water. */
export const SURFACE_VERTEX = /* glsl */ `
  uniform sampler2D tHeight;
  uniform float uHeightScale;
  uniform vec2 uTexel;
  varying vec3 vNormal;
  varying float vHeight;

  void main() {
    float h = texture2D(tHeight, uv).r;
    float hl = texture2D(tHeight, uv - vec2(uTexel.x, 0.0)).r;
    float hr = texture2D(tHeight, uv + vec2(uTexel.x, 0.0)).r;
    float hd = texture2D(tHeight, uv - vec2(0.0, uTexel.y)).r;
    float hu = texture2D(tHeight, uv + vec2(0.0, uTexel.y)).r;
    vec3 tangentX = normalize(vec3(2.0 * uTexel.x, (hr - hl) * uHeightScale, 0.0));
    vec3 tangentZ = normalize(vec3(0.0, (hu - hd) * uHeightScale, 2.0 * uTexel.y));
    vNormal = normalize(cross(tangentZ, tangentX));
    vHeight = h;

    vec3 displaced = position + vec3(0.0, h * uHeightScale, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

export const SURFACE_FRAGMENT = /* glsl */ `
  uniform vec3 uColorDeep;
  uniform vec3 uColorShallow;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying float vHeight;

  void main() {
    vec3 light = normalize(vec3(0.4, 1.0, 0.5));
    float diffuse = clamp(dot(normalize(vNormal), light), 0.0, 1.0);
    vec3 viewDir = vec3(0.0, 1.0, 0.0);
    float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), viewDir), 0.0, 1.0), 2.5);
    vec3 base = mix(uColorDeep, uColorShallow, clamp(vHeight * 3.0 + 0.5, 0.0, 1.0));
    vec3 color = base * (0.55 + 0.45 * diffuse) + fresnel * 0.35;
    gl_FragColor = vec4(color, uOpacity);
  }
`;
