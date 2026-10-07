import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
/** Depth of field that ignores additive FX (shafts, dust, backdrop) when sampling depth. */
class FocusBokehPass extends BokehPass {
  hide: THREE.Object3D[] = []
  render(...args: Parameters<BokehPass['render']>) {
    const prev = this.hide.map((o) => o.visible)
    this.hide.forEach((o) => (o.visible = false))
    super.render(...args)
    this.hide.forEach((o, i) => (o.visible = prev[i]))
  }
}

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uVignette: { value: 1.05 },
    uAberration: { value: 0.0016 },
    uGrain: { value: 0.045 },
    uShadowTint: { value: new THREE.Color('#1a0716') },
    uHighlightTint: { value: new THREE.Color('#ffe6dc') },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime, uVignette, uAberration, uGrain;
    uniform vec2 uResolution;
    uniform vec3 uShadowTint, uHighlightTint;
    varying vec2 vUv;

    float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }

    void main() {
      vec2 c = vUv - 0.5;
      float r2 = dot(c, c);
      vec2 off = c * r2 * uAberration * 18.0;
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + off).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - off).b;

      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col += uShadowTint * (1.0 - smoothstep(0.0, 0.25, lum)) * 0.6;
      col = mix(col, col * uHighlightTint, smoothstep(0.4, 1.4, lum) * 0.4);

      float vig = smoothstep(0.85, 0.15, r2 * uVignette * 2.2);
      col *= mix(0.35, 1.0, vig);

      float g = rand(vUv * uResolution + fract(uTime * 13.37)) - 0.5;
      col += g * uGrain * (0.6 + lum);

      gl_FragColor = vec4(max(col, 0.0), 1.0);
    }`,
}

export type Post = {
  composer: EffectComposer
  bloom: UnrealBloomPass
  bokeh: FocusBokehPass | null
  grade: ShaderPass
  setSize: (w: number, h: number) => void
}

export function createPost(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  { mobile, hideFromDepth }: { mobile: boolean; hideFromDepth: THREE.Object3D[] },
): Post {
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: mobile ? 0 : 2 })
  const composer = new EffectComposer(renderer, target)
  composer.addPass(new RenderPass(scene, camera))

  let bokeh: FocusBokehPass | null = null
  if (!mobile) {
    bokeh = new FocusBokehPass(scene, camera, { focus: 5, aperture: 0.0018, maxblur: 0.006 })
    bokeh.hide = hideFromDepth
    composer.addPass(bokeh)
  }

  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), mobile ? 0.5 : 0.62, 0.72, 0.62)
  composer.addPass(bloom)

  const grade = new ShaderPass(GradeShader)
  if (mobile) grade.uniforms.uAberration.value = 0.001
  composer.addPass(grade)
  composer.addPass(new OutputPass())

  const setSize = (w: number, h: number) => {
    const pr = renderer.getPixelRatio()
    composer.setPixelRatio(pr)
    composer.setSize(w, h)
    grade.uniforms.uResolution.value.set(w * pr, h * pr)
  }

  return { composer, bloom, bokeh, grade, setSize }
}
