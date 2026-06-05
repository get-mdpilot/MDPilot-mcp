import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';

// ── Shared GLSL: Ashima simplex noise + fbm ─────────────────────────────────
const NOISE_GLSL = /* glsl */ `
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
float fbm(vec3 p){
  float total = 0.0, amp = 0.5, freq = 1.0;
  for (int i = 0; i < 5; i++){
    total += snoise(p * freq) * amp;
    freq *= 2.0; amp *= 0.5;
  }
  return total;
}
`;

// ── Terrain shaders ──────────────────────────────────────────────────────────
const TERRAIN_VERT = /* glsl */ `
uniform float uTime;
uniform float uScroll;
varying float vHeight;
varying vec3  vWorldPos;
${NOISE_GLSL}
void main(){
  vec3 pos = position;
  // Ridged fbm for sharp mountain peaks
  vec3 np = vec3(pos.x * 0.045, pos.y * 0.045, uScroll * 0.15 + uTime * 0.01);
  float ridge = 1.0 - abs(fbm(np));
  ridge = ridge * ridge;
  float h = ridge * 26.0 + fbm(np * 2.0) * 4.0;
  pos.z += h;
  vHeight = h;
  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const TERRAIN_FRAG = /* glsl */ `
precision highp float;
uniform vec3  uColorA;   // low / near
uniform vec3  uColorB;   // high / atmosphere
uniform vec3  uFogColor;
uniform float uFogDensity;
uniform float uLight;
varying float vHeight;
varying vec3  vWorldPos;
void main(){
  float hN = clamp(vHeight / 30.0, 0.0, 1.0);
  vec3 col = mix(uColorA, uColorB, pow(hN, 0.8));
  // atmospheric blue rim on the peaks
  col += uColorB * pow(hN, 3.0) * 0.6 * uLight;
  // exponential distance fog
  float dist = length(vWorldPos - cameraPosition);
  float fog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
  col = mix(col, uFogColor, clamp(fog, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
}
`;

// ── Atmospheric light-ray shafts (additive, behind peaks) ────────────────────
const RAYS_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
const RAYS_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uScroll;
uniform float uLight;
uniform vec3  uColorB;
varying vec2 vUv;
${NOISE_GLSL}
void main(){
  // vertical shafts modulated by slow noise, brightest toward the top
  float shafts = 0.0;
  for (float i = 0.0; i < 5.0; i++){
    float x = vUv.x * 6.0 + i * 1.7 + uScroll * 0.2;
    float n = snoise(vec3(x, uTime * 0.05 + i, 0.0));
    shafts += smoothstep(0.55, 1.0, n);
  }
  shafts /= 5.0;
  float verticalFade = smoothstep(0.0, 0.85, vUv.y);      // fade in toward top (between peaks)
  float edgeFade = smoothstep(0.0,0.15,vUv.x)*smoothstep(1.0,0.85,vUv.x);
  float a = shafts * verticalFade * edgeFade * (0.35 + uLight * 0.5);
  gl_FragColor = vec4(uColorB * 1.4, a);
}
`;

function hexToVec3(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

export interface MountainSceneOptions {
  canvas: HTMLCanvasElement;
  colorA: string; // near/low
  colorB: string; // high/atmosphere
  fog: string;
}

export class MountainScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private composer: EffectComposer;
  private bokeh: BokehPass;
  private terrainMat: THREE.ShaderMaterial;
  private raysMat: THREE.ShaderMaterial;
  private clock = new THREE.Clock();
  private targetScroll = 0;
  private scroll = 0;
  private velocity = 0;
  private baseCamZ: number;
  private disposed = false;

  constructor(opts: MountainSceneOptions) {
    const { canvas } = opts;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h, false);

    const fogColor = hexToVec3(opts.fog);
    this.scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.0);
    this.scene.background = fogColor;

    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    this.camera.position.set(0, 14, 60);
    this.camera.lookAt(0, 10, -40);
    this.baseCamZ = this.camera.position.z;

    // Terrain — large subdivided plane laid flat
    const geo = new THREE.PlaneGeometry(400, 400, 256, 256);
    geo.rotateX(-Math.PI / 2);
    this.terrainMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uScroll:     { value: 0 },
        uColorA:     { value: hexToVec3(opts.colorA) },
        uColorB:     { value: hexToVec3(opts.colorB) },
        uFogColor:   { value: fogColor.clone() },
        uFogDensity: { value: 0.006 },
        uLight:      { value: 0.5 },
      },
      vertexShader: TERRAIN_VERT,
      fragmentShader: TERRAIN_FRAG,
    });
    const terrain = new THREE.Mesh(geo, this.terrainMat);
    terrain.position.z = -80;
    this.scene.add(terrain);

    // Light-ray shaft plane behind the peaks
    const raysGeo = new THREE.PlaneGeometry(400, 160);
    this.raysMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:   { value: 0 },
        uScroll: { value: 0 },
        uLight:  { value: 0.5 },
        uColorB: { value: hexToVec3(opts.colorB) },
      },
      vertexShader: RAYS_VERT,
      fragmentShader: RAYS_FRAG,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const rays = new THREE.Mesh(raysGeo, this.raysMat);
    rays.position.set(0, 55, -260);
    this.scene.add(rays);

    // Post-processing: depth-of-field so distant peaks blur like a lens
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bokeh = new BokehPass(this.scene, this.camera, {
      focus: 70.0,
      aperture: 0.00018,
      maxblur: 0.012,
    });
    this.composer.addPass(this.bokeh);
    this.composer.setSize(w, h);
  }

  resize(w: number, h: number) {
    if (this.disposed) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
  }

  // Lenis feeds normalized scroll progress (0..1) + raw velocity
  setScroll(progress: number, velocity: number) {
    this.targetScroll = progress;
    this.velocity = velocity;
  }

  setColors(colorA: string, colorB: string, fog: string) {
    (this.terrainMat.uniforms.uColorA.value as THREE.Color).set(colorA);
    (this.terrainMat.uniforms.uColorB.value as THREE.Color).set(colorB);
    (this.terrainMat.uniforms.uFogColor.value as THREE.Color).set(fog);
    (this.raysMat.uniforms.uColorB.value as THREE.Color).set(colorB);
    const fogCol = hexToVec3(fog);
    (this.scene.background as THREE.Color).set(fog);
    (this.scene.fog as THREE.FogExp2).color.copy(fogCol);
  }

  render() {
    if (this.disposed) return;
    const dt = this.clock.getDelta();
    const t = this.clock.elapsedTime;

    // Smooth the scroll; velocity nudges the camera physically
    this.scroll += (this.targetScroll - this.scroll) * Math.min(1, dt * 4);
    const vel = THREE.MathUtils.clamp(this.velocity, -4, 4);

    // Camera dollies through the range on scroll; velocity adds parallax sway
    this.camera.position.z = this.baseCamZ - this.scroll * 120;
    this.camera.position.x = Math.sin(t * 0.1) * 2 + vel * 1.5;
    this.camera.position.y = 14 + this.scroll * 8 - Math.abs(vel) * 0.6;
    this.camera.lookAt(0, 10 + this.scroll * 6, this.camera.position.z - 80);

    // Fog + light breathe with scroll velocity, every frame
    const speed = Math.min(1, Math.abs(vel) / 4);
    this.terrainMat.uniforms.uTime.value = t;
    this.terrainMat.uniforms.uScroll.value = this.scroll * 10;
    this.terrainMat.uniforms.uFogDensity.value = 0.006 + this.scroll * 0.004 + speed * 0.002;
    this.terrainMat.uniforms.uLight.value = 0.4 + speed * 0.6;
    this.raysMat.uniforms.uTime.value = t;
    this.raysMat.uniforms.uScroll.value = this.scroll * 10;
    this.raysMat.uniforms.uLight.value = 0.4 + speed * 0.6;

    // Focus tracks scroll so the "in-focus" band shifts as you move through
    const focusU = this.bokeh.uniforms as Record<string, { value: number }>;
    if (focusU['focus']) focusU['focus'].value = 60 + this.scroll * 30;

    this.composer.render();
  }

  dispose() {
    this.disposed = true;
    this.terrainMat.dispose();
    this.raysMat.dispose();
    this.scene.traverse(o => {
      if (o instanceof THREE.Mesh) o.geometry.dispose();
    });
    this.composer.dispose();
    this.renderer.dispose();
  }
}
