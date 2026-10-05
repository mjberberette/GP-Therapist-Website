import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const GOLDEN = THREE.MathUtils.degToRad(137.508)
const lerp = THREE.MathUtils.lerp
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (v: number) => v * v * (3 - 2 * v)

type PetalOpts = {
  w: number
  h: number
  cup: number
  bend: number
  curl: number
  base: THREE.Color
  mid: THREE.Color
  edge: THREE.Color
  segW?: number
  segH?: number
}

function makePetal(o: PetalOpts) {
  const segW = o.segW ?? 10
  const segH = o.segH ?? 14
  const g = new THREE.PlaneGeometry(1, 1, segW, segH)
  const pos = g.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)
  const c = new THREE.Color()

  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) + 0.5
    const v = pos.getY(i) + 0.5
    const xn = (u - 0.5) * 2
    const profile = 0.32 + 0.68 * Math.sin(Math.PI * Math.min(1, v * 0.86))
    const vEff = v - 0.38 * xn * xn * Math.pow(v, 2.5)

    const x = xn * 0.5 * o.w * profile
    const y = vEff * o.h
    let z = -o.cup * xn * xn * o.w * 0.5 * profile
    z += o.bend * v * v * o.h
    z += o.curl * Math.pow(Math.max(0, v - 0.62) / 0.38, 2) * o.h * 0.32
    z += 0.025 * o.h * Math.sin(xn * 7 + v * 5) * v * v
    pos.setXYZ(i, x, y, z)

    const t = smooth(clamp01(v * 1.25))
    c.copy(o.base).lerp(o.mid, t)
    const rim = Math.pow(Math.max(Math.abs(xn), clamp01((v - 0.75) / 0.25)), 3)
    c.lerp(o.edge, rim * 0.75)
    colors.set([c.r, c.g, c.b], i * 3)
  }

  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  g.computeVertexNormals()
  return g
}

type PetalRig = { pivot: THREE.Object3D; mesh: THREE.Object3D; closed: number; open: number; t: number }

const PALETTE = {
  base: new THREE.Color('#0a0004'),
  mid: new THREE.Color('#82041c'),
  edge: new THREE.Color('#120005'),
  leafBase: new THREE.Color('#010402'),
  leafMid: new THREE.Color('#06120a'),
  leafEdge: new THREE.Color('#020703'),
}

function buildRose(count: number, material: THREE.Material) {
  const group = new THREE.Group()
  const rigs: PetalRig[] = []

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const geo = makePetal({
      w: lerp(0.42, 1.22, t),
      h: lerp(0.5, 1.2, Math.pow(t, 0.8)),
      cup: lerp(1.15, 0.45, t),
      bend: lerp(-0.05, 0.12, t),
      curl: lerp(0.1, 0.55, t),
      base: PALETTE.base,
      mid: PALETTE.mid,
      edge: PALETTE.edge,
    })
    const mesh = new THREE.Mesh(geo, material)
    mesh.position.z = lerp(0.03, 0.2, t)
    mesh.position.y = lerp(0.12, -0.05, t)
    const pivot = new THREE.Object3D()
    pivot.rotation.y = i * GOLDEN
    pivot.add(mesh)
    group.add(pivot)
    rigs.push({
      pivot,
      mesh,
      t,
      closed: lerp(-0.08, 0.14, Math.pow(t, 1.5)),
      open: lerp(0.28, 1.4, Math.pow(t, 1.15)),
    })
  }

  return { group, rigs }
}

function setBloom(rigs: PetalRig[], bloom: number) {
  for (const r of rigs) {
    const start = (1 - r.t) * 0.55
    const local = smooth(clamp01((bloom - start) / 0.45))
    r.mesh.rotation.x = lerp(r.closed, r.open, local)
  }
}

function buildSepals(material: THREE.Material) {
  const group = new THREE.Group()
  for (let i = 0; i < 5; i++) {
    const geo = makePetal({
      w: 0.22,
      h: 0.75,
      cup: 0.3,
      bend: 0.3,
      curl: 0.6,
      base: PALETTE.leafBase,
      mid: PALETTE.leafMid,
      edge: PALETTE.leafEdge,
      segW: 4,
      segH: 8,
    })
    const mesh = new THREE.Mesh(geo, material)
    mesh.rotation.x = Math.PI * 0.62
    mesh.position.set(0, 0.02, 0.14)
    const pivot = new THREE.Object3D()
    pivot.rotation.y = (i / 5) * Math.PI * 2 + 0.3
    pivot.add(mesh)
    group.add(pivot)
  }
  return group
}

function buildStem(material: THREE.Material) {
  const group = new THREE.Group()
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.08, -1.4, 0.05),
    new THREE.Vector3(-0.1, -3, -0.1),
    new THREE.Vector3(0.05, -5.5, 0.1),
  ])
  const stem = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.045, 8), material)
  group.add(stem)

  const thornGeo = new THREE.ConeGeometry(0.03, 0.14, 6)
  for (let i = 0; i < 6; i++) {
    const p = curve.getPointAt(0.12 + i * 0.13)
    const thorn = new THREE.Mesh(thornGeo, material)
    const a = i * 2.3
    thorn.position.set(p.x + Math.cos(a) * 0.05, p.y, p.z + Math.sin(a) * 0.05)
    thorn.rotation.set(Math.sin(a) * 1.3, 0, -Math.cos(a) * 1.3)
    group.add(thorn)
  }

  const leafGeo = makePetal({
    w: 0.6,
    h: 1.3,
    cup: 0.25,
    bend: 0.25,
    curl: 0.2,
    base: PALETTE.leafBase,
    mid: PALETTE.leafMid,
    edge: PALETTE.leafEdge,
    segW: 6,
    segH: 10,
  })
  ;[
    { at: 0.28, ry: 0.6, rz: -1.05 },
    { at: 0.45, ry: 3.6, rz: 1.0 },
  ].forEach(({ at, ry, rz }) => {
    const p = curve.getPointAt(at)
    const pivot = new THREE.Object3D()
    pivot.position.copy(p)
    pivot.rotation.set(0, ry, rz)
    pivot.add(new THREE.Mesh(leafGeo, material))
    group.add(pivot)
  })
  return group
}

export type RoseSceneOptions = { mobile: boolean }

export class RoseScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private clock = new THREE.Clock()
  private hero: THREE.Group
  private heroRigs: PetalRig[]
  private field!: THREE.InstancedMesh
  private fieldData: { pos: THREE.Vector3; rot: THREE.Euler; scale: number; spin: number }[] = []
  private petals!: THREE.InstancedMesh
  private petalData: { p: THREE.Vector3; v: THREE.Vector3; r: THREE.Euler; s: number; sway: number }[] = []
  private dummy = new THREE.Object3D()
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
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !opts.mobile, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.mobile ? 1.5 : 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = opts.mobile ? 1.4 : 1.2
    this.renderer.setClearColor('#0a0708')

    this.scene.fog = new THREE.FogExp2('#0a0708', 0.12)
    this.camera = new THREE.PerspectiveCamera(opts.mobile ? 52 : 38, 1, 0.1, 60)

    const petalMat = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.6,
      sheen: 0.45,
      sheenRoughness: 0.45,
      sheenColor: new THREE.Color('#b0142f'),
      side: THREE.DoubleSide,
    })
    const greenMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide })
    const stemMat = new THREE.MeshStandardMaterial({ color: '#07140b', roughness: 0.8 })

    const { group, rigs } = buildRose(opts.mobile ? 26 : 34, petalMat)
    this.hero = new THREE.Group()
    this.hero.add(group, buildSepals(greenMat), buildStem(stemMat))
    this.heroRigs = rigs
    this.scene.add(this.hero)

    this.buildField(petalMat)
    this.buildPetals(petalMat)
    this.buildLights()

    this.resize()
    window.addEventListener('pointermove', this.onPointer, { passive: true })
    this.loop()
  }

  private buildLights() {
    this.scene.add(new THREE.AmbientLight('#3a0814', 1))
    const key = new THREE.SpotLight('#ffc2b8', 9, 0, 0.42, 0.9, 0)
    key.position.set(1.5, 7.5, 2.5)
    key.target = this.hero
    this.scene.add(key)
    const rim = new THREE.PointLight('#ff1f45', 10, 0, 0)
    rim.position.set(-2.5, 1.5, -2.5)
    this.scene.add(rim)
    const back = new THREE.PointLight('#ff1f45', 3, 0, 0)
    back.position.set(2.5, 0.5, -3)
    this.scene.add(back)
    const violet = new THREE.PointLight('#5a2bb8', 1.2, 0, 0)
    violet.position.set(-3, -1, 2.5)
    this.scene.add(violet)
  }

  private buildField(material: THREE.Material) {
    const { group, rigs } = buildRose(18, material)
    setBloom(rigs, 0.85)
    group.updateMatrixWorld(true)
    const parts: THREE.BufferGeometry[] = []
    group.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh
        parts.push(m.geometry.clone().applyMatrix4(m.matrixWorld))
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
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    if (!this.visible) {
      this.clock.getDelta()
      return
    }
    const dt = Math.min(this.clock.getDelta(), 0.05)
    this.update(dt, this.clock.elapsedTime)
    this.renderer.render(this.scene, this.camera)
    if (this.onFirstFrame) {
      this.onFirstFrame()
      this.onFirstFrame = undefined
    }
  }

  renderStatic(p: number) {
    this.target = p
    this.progress = p
    this.update(0, 0)
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('pointermove', this.onPointer)
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.geometry.dispose()
        const mat = m.material as THREE.Material | THREE.Material[]
        ;(Array.isArray(mat) ? mat : [mat]).forEach((x) => x.dispose())
      }
    })
    this.renderer.dispose()
  }
}
