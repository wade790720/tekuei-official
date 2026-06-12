/**
 * 和紙材質 · 與 suminagashiEngine FRAG_DISPLAY 紙面相同（無墨）
 * @param {HTMLCanvasElement} canvas
 */
export function mountWashiPaper(canvas) {
  if (!canvas) return null

  const params = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false }
  let gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params)
  if (!gl) {
    gl = canvas.getContext('webgl2', params)
  }
  if (!gl) {
    console.warn('[washiPaper] WebGL unavailable')
    return { dispose() {} }
  }

  function compile(type, src) {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('[washiPaper]', gl.getShaderInfoLog(s))
    }
    return s
  }

  const VERT = `
precision highp float;
attribute vec2 aPos;
varying vec2 vUv;
void main(){
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

  /* 與墨流し display shader 和紙段落一致（無墨染） */
  const FRAG_PAPER = `
precision highp float;
varying vec2 vUv;
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

  vec3 paper = vec3(0.952, 0.933, 0.892);

  float cloud = fbm(uv*3.2);
  paper *= 0.985 + 0.03*cloud;

  float fibH = noise(vec2(px.x*0.045, px.y*0.9));
  float fibV = noise(vec2(px.x*0.9,  px.y*0.05));
  paper *= 1.0 - 0.045*(fibH-0.5) - 0.035*(fibV-0.5);

  float grain = hash(px + fract(uTime)*0.0);
  paper *= 0.985 + 0.03*grain;

  vec2 q = uv - 0.5;
  float vig = 1.0 - 0.16*smoothstep(0.28, 0.75, dot(q,q)*1.6);
  paper *= vig;

  gl_FragColor = vec4(paper, 1.0);
}`

  const prog = gl.createProgram()
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_PAPER))
  gl.bindAttribLocation(prog, 0, 'aPos')
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[washiPaper] shader link failed', gl.getProgramInfoLog(prog))
    return { dispose() {} }
  }

  const uRes = gl.getUniformLocation(prog, 'uRes')
  const uTime = gl.getUniformLocation(prog, 'uTime')

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

  function render() {
    const w = canvas.width
    const h = canvas.height
    if (!w || !h) return

    gl.viewport(0, 0, w, h)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.useProgram(prog)
    gl.uniform2f(uRes, w, h)
    gl.uniform1f(uTime, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6)
    const cw = canvas.clientWidth || window.innerWidth
    const ch = canvas.clientHeight || window.innerHeight
    const w = Math.max(1, Math.floor(cw * dpr))
    const h = Math.max(1, Math.floor(ch * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    render()
  }

  resize()
  window.addEventListener('resize', resize)

  return {
    dispose() {
      window.removeEventListener('resize', resize)
    },
  }
}
