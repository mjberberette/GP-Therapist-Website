import * as THREE from 'three'

const FBM = /* glsl */ `
float h3(vec3 p) { return fract(sin(dot(p, vec3(17.1, 113.3, 71.7))) * 43758.5453); }
float n3(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 5; i++) { s += a * n3(p); p *= 2.03; a *= 0.5; }
  return s;
}
`

/** Inside-out dome with a slow, drifting crimson smoke. */
export function createBackdrop() {
  const uniforms = {
    uTime: { value: 0 },
    uGlow: { value: new THREE.Color('#3d0714') },
    uSmoke: { value: new THREE.Color('#5a0b1e') },
    uViolet: { value: new THREE.Color('#24103d') },
    uMist: { value: new THREE.Color('#4a1a7a') },
    uBase: { value: new THREE.Color('#070405') },
    uIntensity: { value: 1 },
  }
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uGlow, uSmoke, uViolet, uMist, uBase;
      uniform float uIntensity;
      varying vec3 vDir;
      ${FBM}
      void main() {
        vec3 d = normalize(vDir);
        float horizon = 1.0 - abs(d.y);
        float glow = pow(max(0.0, dot(d, normalize(vec3(0.0, 0.15, -1.0)))), 3.0);
        float smoke = fbm(d * 2.4 + vec3(uTime * 0.015, uTime * 0.01, 0.0));
        smoke = smoothstep(0.35, 0.85, smoke);
        float mist = smoothstep(0.4, 0.9, fbm(d * 1.7 - vec3(uTime * 0.012, 0.0, uTime * 0.008) + 4.0));
        float side = max(0.0, dot(d, normalize(vec3(-0.75, 0.35, -0.6))));
        float side2 = max(0.0, dot(d, normalize(vec3(0.8, 0.6, -0.4))));
        vec3 col = uBase;
        col = mix(col, uViolet, smoothstep(0.0, 1.0, d.y) * 0.75);
        col += uGlow * glow * 1.4;
        col += uSmoke * smoke * (0.25 + horizon * 0.35);
        col += uMist * (side * side * 0.55 + side2 * side2 * side2 * 0.35) * (0.45 + mist * 0.9);
        gl_FragColor = vec4(col * uIntensity, 1.0);
      }`,
  })
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(40, 48, 24), mat)
  mesh.renderOrder = -10
  mesh.frustumCulled = false
  return { mesh, uniforms }
}

/** Additive cones that read as volumetric light pouring onto the rose. */
export function createLightShafts(count = 4) {
  const group = new THREE.Group()
  const uniforms = { uTime: { value: 0 }, uStrength: { value: 1 } }
  const geo = new THREE.CylinderGeometry(0.15, 2.4, 12, 48, 1, true)
  geo.translate(0, -6, 0)

  for (let i = 0; i < count; i++) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...uniforms, uSeed: { value: i * 1.7 }, uColor: { value: new THREE.Color(i % 2 ? '#c49aff' : '#ffd2c4') } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        varying vec3 vNormalV;
        varying vec3 vViewPos;
        varying float vH;
        varying vec3 vWorld;
        void main() {
          vH = -position.y / 12.0;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mv.xyz;
          vNormalV = normalize(normalMatrix * normal);
          vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime, uStrength, uSeed;
        uniform vec3 uColor;
        varying vec3 vNormalV;
        varying vec3 vViewPos;
        varying float vH;
        varying vec3 vWorld;
        ${FBM}
        void main() {
          float facing = abs(dot(normalize(vNormalV), normalize(vViewPos)));
          float core = pow(clamp(facing, 0.0, 1.0), 3.0);
          float along = smoothstep(0.0, 0.18, vH) * pow(clamp(1.0 - vH, 0.0, 1.0), 1.6);
          float dust = 0.55 + 0.45 * fbm(vWorld * 0.9 + vec3(0.0, -uTime * 0.12, uSeed));
          float a = core * along * dust * 0.075 * uStrength;
          gl_FragColor = vec4(uColor * a, a);
        }`,
    })
    const cone = new THREE.Mesh(geo, mat)
    const spread = (i - (count - 1) / 2) * 0.55
    cone.position.set(2.6 + spread * 1.6, 7.5, 1.2 - Math.abs(spread) * 0.6)
    cone.rotation.set(0.12 + spread * 0.05, 0, -0.24 - spread * 0.1)
    cone.scale.setScalar(0.8 + (i % 3) * 0.18)
    cone.renderOrder = 5
    group.add(cone)
  }
  return { group, uniforms }
}

/** Soft glowing motes drifting through the scene; they feed the bloom pass. */
export function createDust(count: number) {
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  const size = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 14
    pos[i * 3 + 1] = (Math.random() - 0.5) * 10
    pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 1
    seed[i] = Math.random() * 100
    size[i] = Math.random() * 0.8 + 0.25
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))

  const uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uIntensity: { value: 1 },
  }
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uPixelRatio;
      attribute float aSeed, aSize;
      varying float vTwinkle;
      varying float vWarm;
      void main() {
        vec3 p = position;
        p.y += mod(uTime * 0.06 * (0.5 + fract(aSeed)) + aSeed, 10.0) - 5.0;
        p.x += sin(uTime * 0.2 + aSeed) * 0.35;
        p.z += cos(uTime * 0.17 + aSeed * 1.3) * 0.35;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min(aSize * 46.0 * uPixelRatio / -mv.z, 18.0 * uPixelRatio);
        vTwinkle = 0.55 + 0.45 * sin(uTime * (1.0 + fract(aSeed * 7.0) * 2.0) + aSeed);
        vTwinkle *= smoothstep(1.2, 3.0, -mv.z);
        vWarm = fract(aSeed * 3.7);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uIntensity;
      varying float vTwinkle;
      varying float vWarm;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a *= a;
        vec3 col = mix(vec3(1.0, 0.35, 0.42), vec3(1.0, 0.86, 0.78), vWarm);
        col = mix(col, vec3(0.72, 0.5, 1.0), step(0.62, fract(vWarm * 5.13)) * 0.85);
        gl_FragColor = vec4(col * a * vTwinkle * 1.6 * uIntensity, a * vTwinkle * uIntensity);
      }`,
  })
  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  points.renderOrder = 6
  return { points, uniforms }
}
