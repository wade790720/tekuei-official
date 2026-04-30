import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function InkTrailCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let W = window.innerWidth
    let H = window.innerHeight

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false })
    renderer.setSize(W, H)
    renderer.setPixelRatio(1)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const rtOpts = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    }

    let rtA = new THREE.WebGLRenderTarget(W, H, rtOpts)
    let rtB = new THREE.WebGLRenderTarget(W, H, rtOpts)

    const accumMat = new THREE.ShaderMaterial({
      uniforms: {
        uPrev: { value: null },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uPrevMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uVelocity: { value: 0 },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(W, H) },
        uDecay: { value: 0.988 },
      },
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D uPrev; uniform vec2 uMouse,uPrevMouse,uResolution;
        uniform float uVelocity,uTime,uDecay; varying vec2 vUv;
        vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);float a=dot(hash2(i)*2.-1.,f),b=dot(hash2(i+vec2(1,0))*2.-1.,f-vec2(1,0)),c=dot(hash2(i+vec2(0,1))*2.-1.,f-vec2(0,1)),d=dot(hash2(i+vec2(1,1))*2.-1.,f-vec2(1,1));return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
        float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.1+vec2(1.73,2.71);a*=.48;}return v;}
        float trailDist(vec2 uv,vec2 m0,vec2 m1){float ar=uResolution.x/uResolution.y,best=1e9;for(int i=0;i<10;i++){float t=float(i)/9.;vec2 d=(uv-mix(m0,m1,t))*vec2(ar,1.);best=min(best,length(d));}return best;}
        void main(){
          vec4 prev=texture2D(uPrev,vUv)*uDecay;
          float fbmVal=fbm(vUv*(3.8+uVelocity)+uTime*0.018)*0.044+fbm(vUv*8.5+vec2(1.3,2.1))*0.016;
          float dist=trailDist(vUv,uPrevMouse,uMouse)-fbmVal;
          float r0=0.010+uVelocity*0.022,r1=r0*3.,r2=r0*5.8;
          float core=smoothstep(r0,0.,dist),mid=smoothstep(r1,r0*.5,dist),outer=smoothstep(r2,r1*.5,dist);
          vec3 cCore=vec3(.255,.240,.230),cMid=vec3(.195,.182,.175),cOuter=vec3(.150,.142,.150);
          float vf=1.-clamp(uVelocity*1.5,0.,.45);
          vec3 ink=mix(cOuter,cMid,mid); ink=mix(ink,cCore,core);
          float alpha=clamp(core*.70*vf+mid*.24*vf+outer*.06,0.,.80);
          gl_FragColor=vec4(max(prev.rgb,ink*alpha),max(prev.a,alpha));
        }
      `,
      depthTest: false,
      depthWrite: false,
    })

    const displayMat = new THREE.ShaderMaterial({
      uniforms: { uInk: { value: null } },
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
      fragmentShader: `
        precision highp float; uniform sampler2D uInk; varying vec2 vUv;
        float rand(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}
        void main(){
          vec4 ink=texture2D(uInk,vUv);
          vec3 color=mix(vec3(.129,.125,.149),ink.rgb,ink.a);
          color=clamp(color+rand(vUv*480.)*.024-.012,0.,1.);
          gl_FragColor=vec4(color,1.);
        }
      `,
      depthTest: false,
      depthWrite: false,
    })

    const geo = new THREE.PlaneBufferGeometry(2, 2)
    const quad = new THREE.Mesh(geo, accumMat)
    scene.add(quad)

    const dScene = new THREE.Scene()
    const dCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    dScene.add(new THREE.Mesh(geo, displayMat))

    const m = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, vx: 0, vy: 0 }

    const onMove = (e) => {
      m.px = m.x
      m.py = m.y
      m.vx = e.clientX / W - m.x
      m.vy = 1 - e.clientY / H - m.y
      m.x = e.clientX / W
      m.y = 1 - e.clientY / H
    }

    const onTouchMove = (e) => {
      const t = e.touches[0]
      if (!t) return
      m.px = m.x
      m.py = m.y
      m.x = t.clientX / W
      m.y = 1 - t.clientY / H
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('touchmove', onTouchMove, { passive: true })

    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      renderer.setSize(W, H)
      rtA.setSize(W, H)
      rtB.setSize(W, H)
      accumMat.uniforms.uResolution.value.set(W, H)
    }

    window.addEventListener('resize', onResize)

    let t = 0
    let rafId = 0

    const loop = () => {
      rafId = window.requestAnimationFrame(loop)
      t += 0.016
      const vel = Math.min(Math.sqrt(m.vx * m.vx + m.vy * m.vy) * 10, 1)
      m.vx *= 0.82
      m.vy *= 0.82

      accumMat.uniforms.uPrev.value = rtA.texture
      accumMat.uniforms.uMouse.value.set(m.x, m.y)
      accumMat.uniforms.uPrevMouse.value.set(m.px, m.py)
      accumMat.uniforms.uVelocity.value = vel
      accumMat.uniforms.uTime.value = t

      quad.material = accumMat
      renderer.setRenderTarget(rtB)
      renderer.render(scene, camera)

      displayMat.uniforms.uInk.value = rtB.texture
      renderer.setRenderTarget(null)
      renderer.render(dScene, dCam)

      ;[rtA, rtB] = [rtB, rtA]
    }

    rafId = window.requestAnimationFrame(loop)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('touchmove', onTouchMove)

      geo.dispose()
      accumMat.dispose()
      displayMat.dispose()
      rtA.dispose()
      rtB.dispose()
      renderer.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} className="ink-canvas" aria-hidden />
}
