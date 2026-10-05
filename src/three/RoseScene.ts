import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildRose, buildSepals, buildStem, clamp01, lerp, makePetal, setBloom, smooth, type PetalRig } from './geometry'
import { createLeafMaterial, createStemMaterial, createVelvetMaterial } from './materials'
import { createBackdrop, createDust, createLightShafts } from './atmosphere'
import { createPost, type Post } from './post'

export type RoseSceneOptions = { mobile: boolean }

export class RoseScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private timer = new THREE.Timer()
  private post: Post
  private hero: THREE.Group
  private heroRigs: PetalRig[]
  private field!: THREE.InstancedMesh
  private fieldData: { pos: THREE.Vector3; rot: THREE.Euler; scale: number; spin: number }[] = []
  private petals!: THREE.InstancedMesh
  private petalData: { p: THREE.Vector3; v: THREE.Vector3; r: THREE.Euler; s: number; sway: number }[] = []
  private backdrop: ReturnType<typeof createBackdrop>
  private shafts: ReturnType<typeof createLightShafts>
  private dust: ReturnType<typeof createDust>
  private velvet: ReturnType<typeof createVelvetMaterial>
  private envTarget: THREE.WebGLRenderTarget
  private dummy = new THREE.Object3D()
  private heroWorld = new THREE.Vector3()
  private target = 0
  private progress = 0
  private pointer = new THREE.Vector2()
  private pointerEased = new THREE.Vector2()
  private raf = 0
  private visible = true
  private mobile: boolean
  private lookAt = new THREE.Vector3()
  onFirstFrame?: () => void

  constructor(private canvas: HTMLCanvasElement, opts: RoseSceneOptions) {
    this.mobile = opts.mobile
    const mobile = opts.mobile

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = mobile ? 1.35 : 1.15
    this.renderer.setClearColor('#070405')
    if (!mobile) {
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFShadowMap
    }

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04)
    pmrem.dispose()
    this.scene.environment = this.envTarget.texture
    this.scene.environmentIntensity = 0.16

    this.scene.fog = new THREE.FogExp2('#070405', 0.13)
    this.camera = new THREE.PerspectiveCamera(mobile ? 52 : 38, 1, 0.1, 80)

    this.velvet = createVelvetMaterial()
    const leafMat = createLeafMaterial()
    const stemMat = createStemMaterial()

    const { group, rigs } = buildRose(mobile ? 26 : 34, this.velvet.material, mobile ? 0.8 : 1)
    this.hero = new THREE.Group()
    this.hero.add(group, buildSepals(leafMat), buildStem(stemMat, leafMat))
    this.heroRigs = rigs
    this.scene.add(this.hero)

    this.backdrop = createBackdrop()
    this.shafts = createLightShafts(mobile ? 3 : 4)
    this.dust = createDust(mobile ? 250 : 600)
    this.dust.uniforms.uPixelRatio.value = this.renderer.getPixelRatio()
    this.scene.add(this.backdrop.mesh, this.shafts.group, this.dust.points)

    const distant = createVelvetMaterial({ rimStrength: 0.12 }).material
    distant.envMapIntensity = 0.12
    this.buildField(distant)
    this.buildPetals(distant)
    this.buildLights()

    this.post = createPost(this.renderer, this.scene, this.camera, {
      mobile,
      hideFromDepth: [this.backdrop.mesh, this.shafts.group, this.dust.points],
    })

    this.resize()
    window.addEventListener('pointermove', this.onPointer, { passive: true })
    this.loop()
  }

  private buildLights() {
    this.scene.add(new THREE.AmbientLight('#3a0814', 0.8))

    const key = new THREE.SpotLight('#ffc2b8', 10, 0, 0.42, 0.9, 0)
    key.position.set(1.5, 7.5, 2.5)
    key.target = this.hero
    if (!this.mobile) {
      key.castShadow = true
      key.shadow.mapSize.set(1024, 1024)
      key.shadow.bias = -0.0004
      key.shadow.normalBias = 0.03
      key.shadow.camera.near = 3
      key.shadow.camera.far = 14
    }
    this.scene.add(key)

    const rim = new THREE.PointLight('#ff1f45', 11, 0, 0)
    rim.position.set(-2.5, 1.5, -2.5)
    this.scene.add(rim)
    const back = new THREE.PointLight('#ff1f45', 3, 0, 0)
    back.position.set(2.5, 0.5, -3)
    this.scene.add(back)
    const violet = new THREE.PointLight('#5a2bb8', 1.4, 0, 0)
    violet.position.set(-3, -1, 2.5)
    this.scene.add(violet)
  }

  private buildField(material: THREE.Material) {
    const { group, rigs } = buildRose(18, material, 0.6)
    setBloom(rigs, 0.85)
    group.updateMatrixWorld(true)
    const parts: THREE.BufferGeometry[] = []
    group.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh
        parts.push(m.geometry.clone().applyMatrix4(m.matrixWorld))
        m.geometry.dispose()
      }
    })
    const merged = mergeGeometries(parts)!
    parts.forEach((p) => p.dispose())

    const layout = [
      [-3.4, 0.6, -3.5, 1.0],
      [3.6, -0.4, -4.2, 1.15],
      [-1.6, -1.8, -6, 1.3],
      [2.2, 2.2, -7.5, 1.4],
      [-4.8, 2.4, -8, 1.5],
      [5.2, 1.4, -9, 1.6],
      [0.4, 3.6, -10, 1.5],
      [-2.6, -2.8, 1.6, 0.9],
      [2.9, -2.4, 2.0, 1.0],
      [-6.2, -1.2, -5, 1.2],
      [6.4, -2.4, -6.5, 1.3],
    ]
    const count = this.mobile ? 8 : layout.length
    this.field = new THREE.InstancedMesh(merged, material, count)
    for (let i = 0; i < count; i++) {
      const [x, y, z, s] = layout[i]
      this.fieldData.push({
        pos: new THREE.Vector3(x * (this.mobile ? 0.7 : 1), y, z),
        rot: new THREE.Euler(0.6 + Math.random() * 0.8, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.8),
        scale: s,
        spin: (Math.random() - 0.5) * 0.15,
      })
    }
    this.scene.add(this.field)
  }

  private buildPetals(material: THREE.Material) {
    const geo = makePetal({
      w: 0.22,
      h: 0.26,
      cup: 0.6,
      bend: 0.1,
      curl: 0.4,
      base: new THREE.Color('#3a0410'),
      mid: new THREE.Color('#8f1028'),
      edge: new THREE.Color('#2a030b'),
      segW: 4,
      segH: 5,
    })
    const count = this.mobile ? 70 : 160
    this.petals = new THREE.InstancedMesh(geo, material, count)
    for (let i = 0; i < count; i++) {
      this.petalData.push({
        p: new THREE.Vector3((Math.random() - 0.5) * 12, Math.random() * 10 - 4, (Math.random() - 0.5) * 10 - 1),
        v: new THREE.Vector3((Math.random() - 0.5) * 0.15, -(0.25 + Math.random() * 0.35), 0),
        r: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
        s: 0.6 + Math.random() * 0.9,
        sway: Math.random() * Math.PI * 2,
      })
    }
    this.scene.add(this.petals)
  }

  private onPointer = (e: PointerEvent) => {
    this.pointer.set(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5)
  }

  setProgress(p: number) {
    this.target = clamp01(p)
  }

  setVisible(v: boolean) {
    this.visible = v
  }

  resize() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.post.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  private update(dt: number, time: number) {
    this.progress += (this.target - this.progress) * Math.min(1, dt * 4)
    const p = this.progress

    const bloom = smooth(clamp01((p - 0.08) / 0.55))
    setBloom(this.heroRigs, bloom)

    this.pointerEased.lerp(this.pointer, Math.min(1, dt * 2.5))

    const orbit = lerp(-0.25, 0.9, smooth(clamp01(p / 0.85))) + this.pointerEased.x * 0.25
    const dive = smooth(clamp01((p - 0.6) / 0.4))
    const dist = lerp(this.mobile ? 7.4 : 6.2, this.mobile ? 5.4 : 4.6, smooth(clamp01(p / 0.65))) - dive * 1.4
    const height = lerp(0.35, 2.8, smooth(clamp01(p / 0.6))) + dive * 1.8 - this.pointerEased.y * 0.4

    this.camera.position.set(Math.sin(orbit) * dist, height, Math.cos(orbit) * dist)
    this.lookAt.set(0, lerp(0.1, 0.35, bloom) - dive * 0.2, 0)
    this.camera.lookAt(this.lookAt)

    this.hero.rotation.y = time * 0.08
    this.hero.position.y = Math.sin(time * 0.6) * 0.05 + (this.mobile ? 0.5 : 0) * (1 - dive)
    this.hero.position.x = this.mobile ? 0 : lerp(1.15, 0, smooth(clamp01(p / 0.3)))
    this.hero.rotation.z = Math.sin(time * 0.4) * 0.03

    this.fieldData.forEach((f, i) => {
      this.dummy.position.copy(f.pos)
      this.dummy.position.y += Math.sin(time * 0.3 + i) * 0.12 + p * 1.2 * (f.pos.z > 0 ? 2 : 0.4)
      this.dummy.rotation.set(f.rot.x, f.rot.y + time * f.spin, f.rot.z)
      this.dummy.scale.setScalar(f.scale * lerp(0.85, 1.05, p))
      this.dummy.updateMatrix()
      this.field.setMatrixAt(i, this.dummy.matrix)
    })
    this.field.instanceMatrix.needsUpdate = true

    const fall = lerp(0.6, 1.8, smooth(clamp01((p - 0.25) / 0.5)))
    const visibleCount = Math.floor(this.petalData.length * lerp(0.35, 1, smooth(clamp01((p - 0.15) / 0.5))))
    this.petals.count = visibleCount
    for (let i = 0; i < visibleCount; i++) {
      const d = this.petalData[i]
      d.p.x += (d.v.x + Math.sin(time * 0.8 + d.sway) * 0.12) * dt * fall
      d.p.y += d.v.y * dt * fall
      d.p.z += Math.cos(time * 0.6 + d.sway) * 0.05 * dt
      if (d.p.y < -5) {
        d.p.y = 6
        d.p.x = (Math.random() - 0.5) * 12
      }
      d.r.x += dt * 0.9 * fall
      d.r.y += dt * 0.6
      this.dummy.position.copy(d.p)
      this.dummy.rotation.copy(d.r)
      this.dummy.scale.setScalar(d.s)
      this.dummy.updateMatrix()
      this.petals.setMatrixAt(i, this.dummy.matrix)
    }
    this.petals.instanceMatrix.needsUpdate = true

    this.backdrop.uniforms.uTime.value = time
    this.backdrop.uniforms.uIntensity.value = lerp(0.65, 1, bloom)
    this.shafts.uniforms.uTime.value = time
    this.shafts.uniforms.uStrength.value = lerp(0.55, 1.25, bloom) * (1 - dive * 0.5)
    this.shafts.group.position.x = this.hero.position.x - 1.15
    this.dust.uniforms.uTime.value = time
    this.dust.uniforms.uIntensity.value = lerp(0.6, 1.1, p)
    this.velvet.uniforms.uRimStrength.value = lerp(0.45, 0.8, bloom)

    const { grade, bloom: bloomPass, bokeh } = this.post
    grade.uniforms.uTime.value = time
    bloomPass.strength = lerp(this.mobile ? 0.45 : 0.55, this.mobile ? 0.65 : 0.8, bloom)
    if (bokeh) {
      this.hero.getWorldPosition(this.heroWorld)
      this.heroWorld.y += 0.3
      ;(bokeh.uniforms as Record<string, THREE.IUniform>).focus.value = this.camera.position.distanceTo(this.heroWorld)
    }
  }

  private render() {
    this.post.composer.render()
  }

  private loop = (now?: number) => {
    this.raf = requestAnimationFrame(this.loop)
    this.timer.update(now)
    if (!this.visible) return
    const dt = Math.min(this.timer.getDelta(), 0.05)
    this.update(dt, this.timer.getElapsed())
    this.render()
    if (this.onFirstFrame) {
      this.onFirstFrame()
      this.onFirstFrame = undefined
    }
  }

  renderStatic(p: number) {
    this.target = p
    this.progress = p
    this.update(0, 0)
    this.render()
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.timer.dispose()
    window.removeEventListener('pointermove', this.onPointer)
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh || (o as THREE.Points).isPoints) {
        m.geometry.dispose()
        const mat = m.material as THREE.Material | THREE.Material[]
        ;(Array.isArray(mat) ? mat : [mat]).forEach((x) => x.dispose())
      }
    })
    this.envTarget.dispose()
    this.post.composer.dispose()
    this.renderer.dispose()
  }
}
