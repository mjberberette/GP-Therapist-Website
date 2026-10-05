import * as THREE from 'three'

const NOISE = /* glsl */ `
float vhash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(vhash(i), vhash(i + vec2(1, 0)), f.x), mix(vhash(i + vec2(0, 1)), vhash(i + vec2(1, 1)), f.x), f.y);
}
`

/**
 * Velvet rose petal: physical sheen + IBL, with injected fan-shaped veins,
 * mottled pigment and a crimson fresnel glow that reads as light scattering
 * through the petal edges.
 */
export function createVelvetMaterial({ rimStrength = 0.6 } = {}) {
  const mat = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.62,
    sheen: 0.55,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color('#b0142f'),
    side: THREE.DoubleSide,
    envMapIntensity: 0.35,
  })
  mat.defines = { ...(mat.defines ?? {}), USE_UV: '' }

  const uniforms = {
    uRim: { value: new THREE.Color('#ff1c43') },
    uRimStrength: { value: rimStrength },
    uVein: { value: 0.22 },
  }

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform vec3 uRim;
uniform float uRimStrength;
uniform float uVein;
${NOISE}`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
{
  float fan = (vUv.x - 0.5) / (vUv.y + 0.25);
  float veins = smoothstep(0.6, 1.0, abs(sin(fan * 24.0 + vnoise(vUv * vec2(9.0, 3.0)) * 2.4)));
  float mottle = vnoise(vUv * 13.0) * 0.55 + vnoise(vUv * 41.0) * 0.3;
  diffuseColor.rgb *= 1.0 - uVein * veins * smoothstep(0.05, 0.7, vUv.y);
  diffuseColor.rgb *= 0.84 + mottle * 0.3;
}`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
{
  vec3 vdir = normalize(vViewPosition);
  float fres = pow(clamp(1.0 - abs(dot(normal, vdir)), 0.0, 1.0), 2.2);
  float redness = clamp(diffuseColor.r * 4.0, 0.0, 1.0);
  totalEmissiveRadiance += uRim * fres * uRimStrength * (0.3 + 0.7 * vUv.y) * redness;
}`,
      )
  }
  mat.customProgramCacheKey = () => 'velvet-petal'
  return { material: mat, uniforms }
}

export function createLeafMaterial() {
  return new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.78,
    metalness: 0,
    side: THREE.DoubleSide,
    envMapIntensity: 0.12,
  })
}

export function createStemMaterial() {
  return new THREE.MeshStandardMaterial({ color: '#06120a', roughness: 0.8, envMapIntensity: 0.12 })
}
