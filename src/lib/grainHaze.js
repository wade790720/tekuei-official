// Grain haze: a soft patch of light that breaks into sand-like grain and drifts very slowly.
// The method and the numbers follow the background on p5aholic.me (Keita Yamada): a noise field that warps
// itself twice, raised to the 6th power, sampled with a fixed random offset per pixel, inside a soft mask.
// The shader is written for this site. Her grain and blur textures are replaced by a hash and a formula.
// The colour comes from CSS `color`.

const P5_CONTRAST = 0.45 // her lightest grey (0.5) over her background (0.05)
const SHARE = 0.375 // ours is 35 to 40% as strong as hers
const FRAME_MS = 100 // the field drifts too slowly to need more than ten frames a second
const MAX_DPR = 1.5

const VERTEX = `
attribute vec2 corner;
void main() {
  gl_Position = vec4(corner, 0.0, 1.0);
}`

const FRAGMENT = `
precision highp float;
uniform vec2 size;
uniform float time;
uniform float seed;
uniform vec3 tint;
uniform float strength;

// 2D simplex noise. Copyright (C) 2011 Ashima Arts, MIT License. https://github.com/ashima/webgl-noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 10.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// The field drifts sideways and upward, a few hundredths of a unit per second.
float field(vec2 p) {
  return 0.5 + 0.5 * snoise(vec2(p.x + time * 0.02, p.y - time * 0.04 + seed));
}

// Domain warping: the field bends its own coordinates twice, which gives the curl of smoke.
float warped(vec2 p) {
  vec2 q = vec2(field(p), field(p + vec2(5.2, 1.3)));
  vec2 r = vec2(field(p + 4.0 * q + vec2(1.7, 9.2)), field(p + 4.0 * q + vec2(8.3, 2.8)));
  return field(p + r);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / size;
  // A soft round patch, a little left of centre and above it.
  float mask = 1.0 - smoothstep(0.1, 0.8, length((uv - vec2(0.42, 0.56)) * vec2(1.0, 1.25)));

  // Every pixel looks the field up a little off its own place, always the same way.
  // That fixed offset is the grain; it grows where the mask fades.
  float reach = pow(hash(gl_FragCoord.xy), 1.5) + 0.5 * (1.0 - mask);
  float angle = hash(gl_FragCoord.xy + 17.0) * 6.2831853;
  vec2 offset = 0.05 * reach * vec2(cos(angle), sin(angle));

  vec2 scale = vec2(0.2, 0.4) + 0.1 * (1.0 - mask);
  float light = warped(uv * scale + offset);
  light = smoothstep(0.0, 1.0, pow(light * 1.05, 6.0));

  float alpha = light * mask * strength;
  gl_FragColor = vec4(tint * alpha, alpha);
}`

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

/**
 * @param {HTMLCanvasElement} canvas  size comes from CSS; it is decoration, give it aria-hidden
 * @returns {() => void} cleanup
 */
export function mountGrainHaze(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false })
  if (!gl) return () => {} // no WebGL: the page keeps its plain background

  const program = gl.createProgram()
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return () => {}
  gl.useProgram(program)

  // One triangle that covers the canvas.
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const corner = gl.getAttribLocation(program, 'corner')
  gl.enableVertexAttribArray(corner)
  gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0)

  const uniform = (name) => gl.getUniformLocation(program, name)
  const [r, g, b] = (getComputedStyle(canvas).color.match(/[\d.]+/g) ?? [255, 255, 255]).map(Number)
  gl.uniform3f(uniform('tint'), r / 255, g / 255, b / 255)
  gl.uniform1f(uniform('strength'), P5_CONTRAST * SHARE)
  gl.uniform1f(uniform('seed'), Math.random() * 100)
  const size = uniform('size')
  const time = uniform('time')

  const started = performance.now()
  function draw() {
    gl.uniform1f(time, (performance.now() - started) / 1000)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) return
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(size, canvas.width, canvas.height)
    draw()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => ro.disconnect()

  let raf = 0
  let last = 0
  let onScreen = true
  const loop = (now) => {
    raf = requestAnimationFrame(loop)
    if (now - last < FRAME_MS) return
    last = now
    draw()
  }
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !onScreen) raf = requestAnimationFrame(loop)
    if (!entry.isIntersecting) cancelAnimationFrame(raf)
    onScreen = entry.isIntersecting
  })
  io.observe(canvas)
  raf = requestAnimationFrame(loop)

  return () => {
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
  }
}
