/**
 * 墨流し — Suminagashi fluid ink (from 墨流し.html)
 * @param {HTMLCanvasElement} canvas
 * @param {{ onFirstInput?: () => void, interactiveSelector?: string }} [options]
 */
export function mountSuminagashi(canvas, options = {}) {
  if (!canvas) return null;
/* ════════════════════════════════════════════════════
   墨流し — Suminagashi fluid ink for TEKUEI
   GPU stable-fluids simulation (advection / pressure /
   vorticity) with ink rendered as pigment absorbed into
   procedurally generated washi paper.
═════════════════════════════════════════════════════ */


const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 墨色（顯示色 → 吸收係數） ── */
const INKS = [
  {hex:[0x33,0x2e,0x28]}, // 墨黑 · 主墨
  {hex:[0x2c,0x48,0x78]}, // 深藍（保留，低機率點綴）
  {hex:[0xb3,0x40,0x2a]}, // 朱紅 · 點睛 #b3402a
  {hex:[0x3f,0x60,0x48]}, // 松葉綠（保留，低機率點綴）
];
const INK_PRIMARY = 0;
const INK_ACCENT = 2; // #b3402a
const ENCOUNTER_CHANCE = 0.14; // 兩色各自落墨後，偶爾相近相碰才自然混合

INKS.forEach(i=>{
  const c = i.hex.map(v=>v/255);
  // pigment absorption per RGB channel（越深的色吸收越多）
  i.absorb = c.map(v=>Math.pow(1.0 - v, 1.15));
});

function randomSpot(){
  return {
    x: 0.14 + Math.random() * 0.72,
    y: 0.18 + Math.random() * 0.62,
  };
}

function addInkDrop(inkIdx, x, y, scale){
  addDrop(x, y, inkIdx, scale);
  if (Math.random() < 0.55){
    const a = Math.random() * Math.PI * 2;
    splatVelocity(x, y, Math.cos(a) * 48, Math.sin(a) * 48, 0.0038);
  }
}

const state = {
  ink: 0,
  rotate: false,
  auto: !reducedMotion,
  washing: 0,           // 0..1 wash strength envelope
  lastInput: performance.now(),
  introHidden: false,
};

/* ════════════════ WebGL setup ════════════════ */
/* 著色器為 GLSL 100（texture2D / gl_FragColor），優先使用 WebGL1 避免黑屏 */
const params = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
let gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
let isGL2 = false;
if (!gl) {
  gl = canvas.getContext('webgl2', params);
  isGL2 = !!gl;
}
if (!gl) {
  console.warn('[suminagashi] WebGL unavailable');
  return { dispose() {}, wash() {}, pause() {}, resume() {}, drop() {} };
}

let halfFloat, supportLinear;
if (isGL2) {
  gl.getExtension('EXT_color_buffer_float');
  supportLinear = !!gl.getExtension('OES_texture_float_linear') || !!gl.getExtension('OES_texture_half_float_linear');
} else {
  halfFloat = gl.getExtension('OES_texture_half_float');
  supportLinear = !!gl.getExtension('OES_texture_half_float_linear');
}
const HALF = isGL2 ? gl.HALF_FLOAT : (halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE);

function fmt(internal, format){ return isGL2 ? {internal, format} : {internal: format, format}; }
const F_RGBA = isGL2 ? {internal: gl.RGBA16F, format: gl.RGBA} : {internal: gl.RGBA, format: gl.RGBA};
const F_RG   = isGL2 ? {internal: gl.RG16F,   format: gl.RG}   : {internal: gl.RGBA, format: gl.RGBA};
const F_R    = isGL2 ? {internal: gl.R16F,    format: gl.RED}  : {internal: gl.RGBA, format: gl.RGBA};

/* ── shaders ── */
function compile(type, src){
  const s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s), src);
  return s;
}
function program(vs, fs){
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, 'aPos');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p));
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i=0;i<n;i++){ const info = gl.getActiveUniform(p,i); u[info.name] = gl.getUniformLocation(p, info.name); }
  return {p, u};
}

const VERT = `
precision highp float;
attribute vec2 aPos;
varying vec2 vUv, vL, vR, vT, vB;
uniform vec2 texelSize;
void main(){
  vUv = aPos*0.5+0.5;
  vL = vUv - vec2(texelSize.x,0.0);
  vR = vUv + vec2(texelSize.x,0.0);
  vT = vUv + vec2(0.0,texelSize.y);
  vB = vUv - vec2(0.0,texelSize.y);
  gl_Position = vec4(aPos,0.0,1.0);
}`;

const FRAG_COPY = `
precision highp float; varying vec2 vUv;
uniform sampler2D uTexture; uniform float uValue;
void main(){ gl_FragColor = uValue * texture2D(uTexture, vUv); }`;

const FRAG_SPLAT = `
precision highp float; varying vec2 vUv;
uniform sampler2D uTarget;
uniform vec3 uColor;
uniform vec2 uPoint;
uniform float uRadius;
uniform float uAspect;
void main(){
  vec2 d = vUv - uPoint;
  d.x *= uAspect;
  float g = exp(-dot(d,d)/uRadius);
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + uColor*g, 1.0);
}`;

const FRAG_ADVECT = `
precision highp float; varying vec2 vUv;
uniform sampler2D uVelocity, uSource;
uniform vec2 texelSize, dyeTexelSize;
uniform float dt, dissipation, uFeather;
#ifdef MANUAL_FILTER
vec4 bilerp(sampler2D s, vec2 uv, vec2 tsize){
  vec2 st = uv/tsize - 0.5;
  vec2 i = floor(st), f = fract(st);
  vec4 a = texture2D(s, (i+vec2(0.5,0.5))*tsize);
  vec4 b = texture2D(s, (i+vec2(1.5,0.5))*tsize);
  vec4 c = texture2D(s, (i+vec2(0.5,1.5))*tsize);
  vec4 d = texture2D(s, (i+vec2(1.5,1.5))*tsize);
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
#endif
void main(){
#ifdef MANUAL_FILTER
  vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
  vec4 result = bilerp(uSource, coord, dyeTexelSize);
#else
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  vec4 result = texture2D(uSource, coord);
#endif
  float rate = 1.0;
  if (uFeather > 0.5) {
    float density = dot(result.rgb, vec3(0.34));
    // 淡邊先向紙暈化，濃心慢褪 — 避免整片被推向一側
    rate = mix(2.4, 0.22, smoothstep(0.012, 0.26, density));
  }
  float decay = 1.0 + dissipation * rate * dt;
  gl_FragColor = result/decay;
}`;

const FRAG_DIV = `
precision highp float; varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uVelocity;
void main(){
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  gl_FragColor = vec4(0.5*(R-L+T-B), 0.0, 0.0, 1.0);
}`;

const FRAG_CURL = `
precision highp float; varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uVelocity;
void main(){
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  gl_FragColor = vec4(0.5*(R-L-T+B), 0.0, 0.0, 1.0);
}`;

const FRAG_VORTICITY = `
precision highp float; varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uVelocity, uCurl;
uniform float curl, dt;
void main(){
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5*vec2(abs(T)-abs(B), abs(R)-abs(L));
  force /= length(force)+0.0001;
  force *= curl*C;
  force.y *= -1.0;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  vel += force*dt;
  vel = clamp(vel, -1000.0, 1000.0);
  gl_FragColor = vec4(vel, 0.0, 1.0);
}`;

const FRAG_PRESSURE = `
precision highp float; varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uPressure, uDivergence;
void main(){
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float div = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L+R+B+T-div)*0.25, 0.0, 0.0, 1.0);
}`;

const FRAG_GRADSUB = `
precision highp float; varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uPressure, uVelocity;
void main(){
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  vel -= vec2(R-L, T-B);
  gl_FragColor = vec4(vel, 0.0, 1.0);
}`;

/* 顯示：和紙 + 墨染（pigment absorption） */
const FRAG_DISPLAY = `
precision highp float;
varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uDye;
uniform vec2 uRes;
uniform float uTime;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i=0;i<4;i++){ v += a*noise(p); p *= 2.07; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = vUv;
  vec2 px = uv * uRes;

  /* ── 和紙底色 ── */
  vec3 paper = vec3(0.952, 0.933, 0.892);

  /* 大塊雲狀厚薄不均 */
  float cloud = fbm(uv*3.2);
  paper *= 0.985 + 0.03*cloud;

  /* 紙纖維：兩個方向被拉長的細噪聲 */
  float fibH = noise(vec2(px.x*0.045, px.y*0.9));
  float fibV = noise(vec2(px.x*0.9,  px.y*0.05));
  paper *= 1.0 - 0.045*(fibH-0.5) - 0.035*(fibV-0.5);

  /* 細顆粒 */
  float grain = hash(px + fract(uTime)*0.0);
  paper *= 0.985 + 0.03*grain;

  /* 邊緣淡暗角 */
  vec2 q = uv - 0.5;
  float vig = 1.0 - 0.16*smoothstep(0.28, 0.75, dot(q,q)*1.6);
  paper *= vig;

  /* ── 墨：吸收係數累積 → 染進紙裡 ── */
  vec3 a = texture2D(uDye, uv).rgb;

  /* 粒狀沉澱：濃度梯度處顏料堆積（墨流し的邊緣線） */
  float dC = dot(texture2D(uDye, vUv).rgb, vec3(0.34));
  float dL = dot(texture2D(uDye, vL ).rgb, vec3(0.34));
  float dR = dot(texture2D(uDye, vR ).rgb, vec3(0.34));
  float dT = dot(texture2D(uDye, vT ).rgb, vec3(0.34));
  float dB = dot(texture2D(uDye, vB ).rgb, vec3(0.34));
  float edge = abs(dR-dL) + abs(dT-dB);
  float granulation = smoothstep(0.0, 0.45, edge) * smoothstep(0.0, 0.25, dC);

  /* 纖維讓墨吸收略不均 → 染色感 */
  float soak = 1.0 + 0.35*(fbm(px*0.03)-0.5) + 0.18*(grain-0.5);

  vec3 absorbed = exp(-(a*1.35 + vec3(granulation*0.5)) * soak);
  vec3 col = paper * absorbed;

  /* 濃墨處微微偏暖，像滲進纖維 */
  float density = clamp(dC*0.8, 0.0, 1.0);
  col = mix(col, col*vec3(1.012,1.0,0.985), density*0.5);

  /* 朱紅墨：綠藍吸收較強時略帶暖赭點綴 */
  float accent = smoothstep(0.018, 0.11, a.g + a.b - a.r * 0.42);
  col = mix(col, col * vec3(1.06, 0.97, 0.94), accent * 0.42);

  /* 極淡殘墨向和紙暈化，收尾更乾淨 */
  float ghost = 1.0 - smoothstep(0.0, 0.09, dC);
  col = mix(col, paper * vig, ghost * 0.42);

  gl_FragColor = vec4(col, 1.0);
}`;

/* ── geometry ── */
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

function blit(target){
  if (target == null){
    gl.viewport(0,0,gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  } else {
    gl.viewport(0,0,target.width, target.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}

/* ── FBOs ── */
function createFBO(w,h,fmtPair,filter){
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, fmtPair.internal, w, h, 0, fmtPair.format, HALF, null);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
  return {
    tex, fbo, width:w, height:h,
    texelSizeX: 1/w, texelSizeY: 1/h,
    attach(id){ gl.activeTexture(gl.TEXTURE0+id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; }
  };
}
function createDoubleFBO(w,h,fmtPair,filter){
  let a = createFBO(w,h,fmtPair,filter);
  let b = createFBO(w,h,fmtPair,filter);
  return {
    width:w, height:h, texelSizeX:1/w, texelSizeY:1/h,
    get read(){return a}, get write(){return b},
    swap(){ const t=a; a=b; b=t; }
  };
}

const filter = supportLinear ? gl.LINEAR : gl.NEAREST;
const manualDefine = supportLinear ? '' : '#define MANUAL_FILTER\n';

const progCopy      = program(VERT, FRAG_COPY);
const progSplat     = program(VERT, FRAG_SPLAT);
const progAdvect    = program(VERT, manualDefine + FRAG_ADVECT);
const progDiv       = program(VERT, FRAG_DIV);
const progCurl      = program(VERT, FRAG_CURL);
const progVorticity = program(VERT, FRAG_VORTICITY);
const progPressure  = program(VERT, FRAG_PRESSURE);
const progGradSub   = program(VERT, FRAG_GRADSUB);
const progDisplay   = program(VERT, FRAG_DISPLAY);

if (!gl.getProgramParameter(progDisplay.p, gl.LINK_STATUS)) {
  console.warn('[suminagashi] display shader failed to link');
  return { dispose() {}, wash() {}, pause() {}, resume() {}, drop() {} };
}

/* ── resolution ── */
const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || (navigator.maxTouchPoints>1 && window.innerWidth<900);
const SIM_RES = isMobile ? 112 : 160;
const DYE_RES = isMobile ? 512 : 860;
const PRESSURE_ITERS = isMobile ? 16 : 22;

let velocity, dye, divergence, curlFBO, pressure;

function getRes(base){
  const dw = Math.max(1, gl.drawingBufferWidth);
  const dh = Math.max(1, gl.drawingBufferHeight);
  const aspect = dw / dh;
  let w, h;
  if (aspect >= 1) { w = Math.round(base * aspect); h = base; }
  else { w = base; h = Math.round(base / aspect); }
  return { w: Math.max(w, 8), h: Math.max(h, 8) };
}

function initFBOs(){
  const s = getRes(SIM_RES), d = getRes(DYE_RES);
  velocity   = createDoubleFBO(s.w, s.h, F_RG, filter);
  dye        = createDoubleFBO(d.w, d.h, F_RGBA, filter);
  divergence = createFBO(s.w, s.h, F_R, gl.NEAREST);
  curlFBO    = createFBO(s.w, s.h, F_R, gl.NEAREST);
  pressure   = createDoubleFBO(s.w, s.h, F_R, gl.NEAREST);
}

function resizeCanvas(){
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 2 : 1.6);
  const cw = canvas.clientWidth || window.innerWidth;
  const ch = canvas.clientHeight || window.innerHeight;
  const w = Math.max(1, Math.floor(cw * dpr));
  const h = Math.max(1, Math.floor(ch * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    initFBOs();
  }
}
window.addEventListener('resize', resizeCanvas);

/* ════════════════ splats ════════════════ */
const ASPECT = ()=> canvas.width/canvas.height;

function splatVelocity(x, y, dx, dy, radius){
  gl.useProgram(progSplat.p);
  gl.uniform2f(progSplat.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(progSplat.u.uTarget, velocity.read.attach(0));
  gl.uniform1f(progSplat.u.uAspect, ASPECT());
  gl.uniform2f(progSplat.u.uPoint, x, y);
  gl.uniform3f(progSplat.u.uColor, dx, dy, 0);
  gl.uniform1f(progSplat.u.uRadius, radius);
  blit(velocity.write); velocity.swap();
}
function splatDye(x, y, amount, radius, inkIdx){
  const a = INKS[inkIdx].absorb;
  gl.useProgram(progSplat.p);
  gl.uniform2f(progSplat.u.texelSize, dye.texelSizeX, dye.texelSizeY);
  gl.uniform1i(progSplat.u.uTarget, dye.read.attach(0));
  gl.uniform1f(progSplat.u.uAspect, ASPECT());
  gl.uniform2f(progSplat.u.uPoint, x, y);
  gl.uniform3f(progSplat.u.uColor, a[0]*amount, a[1]*amount, a[2]*amount);
  gl.uniform1f(progSplat.u.uRadius, radius);
  blit(dye.write); dye.swap();
}

/* 一滴墨：隨時間慢慢暈開（多幀注入 + 微弱外推） */
const drops = [];
function addDrop(x, y, inkIdx, scale){
  drops.push({x, y, ink:inkIdx, t:0, dur:1.4+Math.random()*0.6, scale:scale||1, phase:Math.random()*Math.PI*2});
  // 初始的輕微外推，像水面被一滴墨打到
  const n = 7;
  for (let i=0;i<n;i++){
    const a = (i/n)*Math.PI*2 + Math.random();
    splatVelocity(x, y, Math.cos(a)*22*(scale||1), Math.sin(a)*22*(scale||1), 0.0009*(scale||1));
  }
}
function updateDrops(dt){
  for (let i=drops.length-1;i>=0;i--){
    const d = drops[i];
    d.t += dt;
    const k = d.t/d.dur;
    if (k>=1){ drops.splice(i,1); continue; }
    const fade = Math.pow(1-k, 1.6);
    const r = (0.00018 + k*0.0028) * d.scale;
    splatDye(d.x, d.y, 0.55*fade*dt*60/14, r, d.ink);
    // 暈開時帶一點不對稱的微流，邊緣才不會是正圓
    const wob = d.phase + k*5.0;
    splatVelocity(d.x + Math.cos(wob)*0.004, d.y + Math.sin(wob)*0.004,
                  Math.cos(wob+1.7)*4*fade, Math.sin(wob+1.7)*4*fade, 0.0015*d.scale);
  }
}

/* ════════════════ pointer ════════════════ */
const pointer = {down:false, moved:false, x:0, y:0, px:0, py:0, downX:0, downY:0, downT:0};
let dragInkSet = false;
let dragInkIdx = INK_PRIMARY;

function currentlyDraggingInk(){
  if (!dragInkSet){
    dragInkIdx = state.ink === INK_ACCENT ? INK_ACCENT : INK_PRIMARY;
    dragInkSet = true;
  }
  return dragInkIdx;
}

function toUV(e){
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX ?? (e.touches&&e.touches[0].clientX)) - rect.left;
  const cy = (e.clientY ?? (e.touches&&e.touches[0].clientY)) - rect.top;
  return [cx/rect.width, 1 - cy/rect.height];
}
function currentInk(){
  if (state.rotate){
    state.ink = (state.ink+1) % INKS.length;
      }
  return state.ink;
}
function markInput(){
  state.lastInput = performance.now();
  if (!state.introHidden){
    state.introHidden = true;
    options.onFirstInput?.();
  }
}

const interactiveSel = options.interactiveSelector || 'a,button,input,textarea,select,[role="button"]';
function isInteractive(t){ return t?.closest?.(interactiveSel); }
function onPointerDown(e){
  if (isInteractive(e.target)) return;
  const [x,y] = toUV(e);
  pointer.down = true; pointer.moved = false;
  pointer.x = pointer.px = pointer.downX = x;
  pointer.y = pointer.py = pointer.downY = y;
  pointer.downT = performance.now();
  markInput();
}
function onPointerMove(e){
  if (!pointer.down || isInteractive(e.target)) return;
  const [x,y] = toUV(e);
  pointer.px = pointer.x; pointer.py = pointer.y;
  pointer.x = x; pointer.y = y;
  const dx = x-pointer.px, dy = y-pointer.py;
  if (Math.abs(x-pointer.downX)+Math.abs(y-pointer.downY) > 0.012) pointer.moved = true;
  if (pointer.moved){
    const speed = Math.min(Math.hypot(dx,dy)*60, 1.2);
    splatVelocity(x, y, dx*1400, dy*1400, 0.0024);
    splatDye(x, y, 0.05 + speed*0.10, 0.00035 + speed*0.0009, currentlyDraggingInk());
  }
  markInput();
}
function onPointerUp(e){
  if (!pointer.down) return;
  pointer.down = false;
  dragInkSet = false;
  if (!pointer.moved && performance.now()-pointer.downT < 450){
    addDrop(pointer.downX, pointer.downY, currentInk(), 0.85+Math.random()*0.5);
  }
  markInput();
}
window.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);
window.addEventListener('pointercancel', onPointerUp);

/* ════════════════ 自動演出 ════════════════ */
let primaryTimer = 2.4;
let accentTimer = 5.8;
const encounterTimers = [];

/** 另一色在附近稍後落墨 — 不疊同一點，靠水流自然相碰 */
function maybeEncounter(otherInk, baseX, baseY){
  if (Math.random() > ENCOUNTER_CHANCE) return;
  const spread = 0.04 + Math.random() * 0.08;
  const ang = Math.random() * Math.PI * 2;
  const ox = Math.min(0.92, Math.max(0.08, baseX + Math.cos(ang) * spread));
  const oy = Math.min(0.88, Math.max(0.12, baseY + Math.sin(ang) * spread));
  const delay = 120 + Math.random() * 480;
  const id = setTimeout(() => {
    if (disposed) return;
    addInkDrop(otherInk, ox, oy, 0.38 + Math.random() * 0.52);
  }, delay);
  encounterTimers.push(id);
}

function autoPerform(dt, now){
  if (!state.auto || reducedMotion) return;
  if (now - state.lastInput < 3000) return;  // 使用者在玩的時候安靜
  primaryTimer -= dt;
  accentTimer -= dt;

  if (primaryTimer <= 0){
    primaryTimer = 3.6 + Math.random() * 5.8;
    const { x, y } = randomSpot();
    addInkDrop(INK_PRIMARY, x, y, 0.58 + Math.random() * 0.82);
    maybeEncounter(INK_ACCENT, x, y);
  }

  if (accentTimer <= 0){
    accentTimer = 6.2 + Math.random() * 9.5;
    const { x, y } = randomSpot();
    addInkDrop(INK_ACCENT, x, y, 0.32 + Math.random() * 0.55);
    maybeEncounter(INK_PRIMARY, x, y);
  }
}

/* ════════════════ simulation step ════════════════ */
let lastT = performance.now();
function step(dt){
  gl.disable(gl.BLEND);

  // curl & vorticity（漩渦）
  gl.useProgram(progCurl.p);
  gl.uniform2f(progCurl.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(progCurl.u.uVelocity, velocity.read.attach(0));
  blit(curlFBO);

  gl.useProgram(progVorticity.p);
  gl.uniform2f(progVorticity.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(progVorticity.u.uVelocity, velocity.read.attach(0));
  gl.uniform1i(progVorticity.u.uCurl, curlFBO.attach(1));
  gl.uniform1f(progVorticity.u.curl, 22);
  gl.uniform1f(progVorticity.u.dt, dt);
  blit(velocity.write); velocity.swap();

  // divergence
  gl.useProgram(progDiv.p);
  gl.uniform2f(progDiv.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(progDiv.u.uVelocity, velocity.read.attach(0));
  blit(divergence);

  // pressure clear + jacobi
  gl.useProgram(progCopy.p);
  gl.uniform2f(progCopy.u.texelSize, pressure.texelSizeX, pressure.texelSizeY);
  gl.uniform1i(progCopy.u.uTexture, pressure.read.attach(0));
  gl.uniform1f(progCopy.u.uValue, 0.7);
  blit(pressure.write); pressure.swap();

  gl.useProgram(progPressure.p);
  gl.uniform2f(progPressure.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(progPressure.u.uDivergence, divergence.attach(0));
  for (let i=0;i<PRESSURE_ITERS;i++){
    gl.uniform1i(progPressure.u.uPressure, pressure.read.attach(1));
    blit(pressure.write); pressure.swap();
  }

  // gradient subtract
  gl.useProgram(progGradSub.p);
  gl.uniform2f(progGradSub.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(progGradSub.u.uPressure, pressure.read.attach(0));
  gl.uniform1i(progGradSub.u.uVelocity, velocity.read.attach(1));
  blit(velocity.write); velocity.swap();

  // advect velocity
  gl.useProgram(progAdvect.p);
  gl.uniform2f(progAdvect.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  if (!supportLinear) gl.uniform2f(progAdvect.u.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(progAdvect.u.uVelocity, velocity.read.attach(0));
  gl.uniform1i(progAdvect.u.uSource,   velocity.read.attach(0));
  gl.uniform1f(progAdvect.u.dt, dt);
  gl.uniform1f(progAdvect.u.dissipation, 2.8);   // 水流快速平息，墨不再被推向一側
  gl.uniform1f(progAdvect.u.uFeather, 0.0);
  blit(velocity.write); velocity.swap();

  // advect dye（墨）
  const washDecay = state.washing>0 ? 1.6*state.washing : 0;
  gl.uniform1i(progAdvect.u.uVelocity, velocity.read.attach(0));
  gl.uniform1i(progAdvect.u.uSource,   dye.read.attach(1));
  if (!supportLinear) gl.uniform2f(progAdvect.u.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
  gl.uniform1f(progAdvect.u.dissipation, 0.016 + washDecay);  // 邊緣先褪、向紙暈化
  gl.uniform1f(progAdvect.u.uFeather, 1.0);
  blit(dye.write); dye.swap();
}

function render(now){
  gl.useProgram(progDisplay.p);
  gl.uniform2f(progDisplay.u.texelSize, dye.texelSizeX, dye.texelSizeY);
  gl.uniform1i(progDisplay.u.uDye, dye.read.attach(0));
  gl.uniform2f(progDisplay.u.uRes, canvas.width, canvas.height);
  gl.uniform1f(progDisplay.u.uTime, now*0.001);
  blit(null);
}

/* ════════════════ 洗い流す ════════════════ */
let washT = 0;
function startWash(){
  washT = 5.0;  // 洗 5 秒
  
  // 洗的時候給一點水流，墨像被水推開
  for (let i=0;i<5;i++){
    const x = Math.random(), y = Math.random();
    const a = Math.random()*Math.PI*2;
    splatVelocity(x, y, Math.cos(a)*60, Math.sin(a)*60, 0.01);
  }
  markInput();
}
function updateWash(dt){
  if (washT>0){
    washT -= dt;
    state.washing = Math.min(1, washT/1.2);  // 收尾時平滑歸零
    if (washT<=0){
      state.washing = 0;
      
    }
  }
}

/* ════════════════ UI ════════════════ */
/* ════════════════ main loop ════════════════ */
resizeCanvas();
if (velocity && dye) render(performance.now());

/* 開場：主墨先暈開，朱紅在另一處各自落墨 */
let t0, t1, rafId, paused = false, disposed = false;
if (!reducedMotion){
  t0 = setTimeout(()=> addInkDrop(INK_PRIMARY, 0.5, 0.55, 1.3), 600);
  t1 = setTimeout(()=> addInkDrop(INK_ACCENT, 0.28, 0.38, 0.55), 3200);
}

function frame(now){
  if (disposed) return;
  let dt = (now - lastT)/1000;
  lastT = now;
  dt = Math.min(dt, 1/30);
  if (!document.hidden && !paused && velocity && dye) {
    resizeCanvas();
    updateDrops(dt);
    autoPerform(dt, now);
    updateWash(dt);
    step(dt);
    render(now);
  }
  rafId = requestAnimationFrame(frame);
}
rafId = requestAnimationFrame(frame);

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      clearTimeout(t0); clearTimeout(t1);
      encounterTimers.forEach(clearTimeout);
    },
    wash: startWash,
    pause() { paused = true; },
    resume() { paused = false; lastT = performance.now(); },
    drop: (x, y, idx) => addDrop(x ?? Math.random(), y ?? Math.random(), idx ?? INK_PRIMARY, 1),
  };
}
