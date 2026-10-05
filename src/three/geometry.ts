import * as THREE from 'three'

export const GOLDEN = THREE.MathUtils.degToRad(137.508)
export const lerp = THREE.MathUtils.lerp
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const smooth = (v: number) => v * v * (3 - 2 * v)

export const PALETTE = {
  base: new THREE.Color('#080003'),
  mid: new THREE.Color('#82041c'),
  edge: new THREE.Color('#100004'),
  leafBase: new THREE.Color('#010402'),
  leafMid: new THREE.Color('#0b1d11'),
  leafEdge: new THREE.Color('#020703'),
}

type PetalOpts = {
  w: number
  h: number
  cup: number
  bend: number
  curl: number
  ruffle?: number
  base: THREE.Color
  mid: THREE.Color
  edge: THREE.Color
  segW?: number
  segH?: number
  seed?: number
}

export function makePetal(o: PetalOpts) {
  const segW = o.segW ?? 14
  const segH = o.segH ?? 18
  const seed = o.seed ?? 0
  const ruffle = o.ruffle ?? 1
  const g = new THREE.PlaneGeometry(1, 1, segW, segH)
  const pos = g.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)
  const c = new THREE.Color()

  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) + 0.5
    const v = pos.getY(i) + 0.5
    const xn = (u - 0.5) * 2
    const profile = 0.3 + 0.7 * Math.sin(Math.PI * Math.min(1, v * 0.86))
    const vEff = v - 0.38 * xn * xn * Math.pow(v, 2.5)

    const x = xn * 0.5 * o.w * profile
    const y = vEff * o.h
    let z = -o.cup * xn * xn * o.w * 0.5 * profile
    z += o.bend * v * v * o.h
    z += o.curl * Math.pow(Math.max(0, v - 0.62) / 0.38, 2) * o.h * 0.32
    const edge = Math.pow(Math.abs(xn), 2) * Math.pow(v, 1.5)
    z += ruffle * o.h * edge * (0.035 * Math.sin(xn * 9 + seed * 3.1) + 0.02 * Math.sin(v * 13 + seed))
    pos.setXYZ(i, x, y, z)

    const t = smooth(clamp01(v * 1.2))
    c.copy(o.base).lerp(o.mid, t)
    const rim = Math.pow(Math.max(Math.abs(xn), clamp01((v - 0.78) / 0.22)), 3)
    c.lerp(o.edge, rim * 0.8)
    colors.set([c.r, c.g, c.b], i * 3)
  }

  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  g.computeVertexNormals()
  return g
}

export type PetalRig = { mesh: THREE.Mesh; closed: number; open: number; t: number }

export function buildRose(count: number, material: THREE.Material, detail = 1) {
  const group = new THREE.Group()
  const rigs: PetalRig[] = []

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const geo = makePetal({
      w: lerp(0.4, 1.24, t),
      h: lerp(0.48, 1.2, Math.pow(t, 0.8)),
      cup: lerp(1.2, 0.45, t),
      bend: lerp(-0.06, 0.12, t),
      curl: lerp(0.08, 0.55, t),
      ruffle: lerp(0.4, 1.3, t),
      base: PALETTE.base,
      mid: PALETTE.mid,
      edge: PALETTE.edge,
      segW: Math.round(14 * detail),
      segH: Math.round(18 * detail),
      seed: i,
    })
    const mesh = new THREE.Mesh(geo, material)
    mesh.position.z = lerp(0.03, 0.2, t)
    mesh.position.y = lerp(0.12, -0.05, t)
    mesh.castShadow = true
    mesh.receiveShadow = true
    const pivot = new THREE.Object3D()
    pivot.rotation.y = i * GOLDEN
    pivot.add(mesh)
    group.add(pivot)
    rigs.push({
      mesh,
      t,
      closed: lerp(-0.08, 0.14, Math.pow(t, 1.5)),
      open: lerp(0.28, 1.4, Math.pow(t, 1.15)),
    })
  }

  return { group, rigs }
}

export function setBloom(rigs: PetalRig[], bloom: number) {
  for (const r of rigs) {
    const start = (1 - r.t) * 0.55
    const local = smooth(clamp01((bloom - start) / 0.45))
    r.mesh.rotation.x = lerp(r.closed, r.open, local)
  }
}

const leafColors = { base: PALETTE.leafBase, mid: PALETTE.leafMid, edge: PALETTE.leafEdge }

export function buildSepals(material: THREE.Material) {
  const group = new THREE.Group()
  for (let i = 0; i < 5; i++) {
    const geo = makePetal({ w: 0.2, h: 0.6, cup: 0.3, bend: 0.3, curl: 0.6, ...leafColors, segW: 4, segH: 8 })
    const mesh = new THREE.Mesh(geo, material)
    mesh.rotation.x = Math.PI * 0.7
    mesh.position.set(0, 0.02, 0.12)
    mesh.castShadow = true
    const pivot = new THREE.Object3D()
    pivot.rotation.y = (i / 5) * Math.PI * 2 + 0.3
    pivot.add(mesh)
    group.add(pivot)
  }
  return group
}

export function buildStem(material: THREE.Material, leafMaterial: THREE.Material) {
  const group = new THREE.Group()
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.08, -1.4, 0.05),
    new THREE.Vector3(-0.1, -3, -0.1),
    new THREE.Vector3(0.05, -5.5, 0.1),
  ])
  const stem = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.045, 10), material)
  stem.castShadow = true
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

  const leafGeo = makePetal({ w: 0.6, h: 1.3, cup: 0.25, bend: 0.25, curl: 0.2, ruffle: 0.6, ...leafColors, segW: 8, segH: 12 })
  ;[
    { at: 0.28, ry: 0.6, rz: -1.05 },
    { at: 0.45, ry: 3.6, rz: 1.0 },
  ].forEach(({ at, ry, rz }) => {
    const p = curve.getPointAt(at)
    const pivot = new THREE.Object3D()
    pivot.position.copy(p)
    pivot.rotation.set(0, ry, rz)
    const leaf = new THREE.Mesh(leafGeo, leafMaterial)
    leaf.castShadow = true
    pivot.add(leaf)
    group.add(pivot)
  })
  return group
}
