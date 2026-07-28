"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A GPU-driven particle field that feels like drifting through pressurized air:
 * particles stream toward the camera (flight), sway along noise-based air
 * currents, fade with atmospheric depth, and lean slightly toward the pointer.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uDepth;
  uniform vec2 uPointer;

  attribute float aScale;
  attribute float aSeed;

  varying float vFade;

  //
  // Simplex 3D noise (Ashima Arts / Stefan Gustavson)
  //
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
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
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

  void main() {
    vec3 pos = position;

    // Continuous flight: cycle depth toward the camera and wrap around.
    float range = uDepth;
    pos.z = mod(pos.z + uTime * 4.0, range) - range * 0.5;

    // Air currents: swirling, noise-driven sway.
    float t = uTime * 0.15;
    vec3 np = pos * 0.06 + vec3(aSeed, aSeed * 0.5, t);
    pos.x += snoise(np) * 3.0;
    pos.y += snoise(np + 50.0) * 3.0;

    // Pointer "pressure": the whole field leans toward the cursor.
    pos.xy += uPointer * 4.0 * (pos.z / range + 0.5);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Atmospheric depth fade — dim both very near and very far particles.
    float dist = -mv.z;
    vFade = smoothstep(range * 0.5, range * 0.15, dist) * smoothstep(0.0, 8.0, dist);

    gl_PointSize = uSize * aScale * (300.0 / max(dist, 0.001));
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vFade;

  void main() {
    // Soft round particle with a gentle glow falloff so points read as haze,
    // not hard pixels.
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = pow(smoothstep(0.5, 0.0, d), 1.6) * vFade * 0.6;
    vec3 col = mix(uColorA, uColorB, vFade);
    gl_FragColor = vec4(col, alpha);
  }
`;

function ParticleField({ count = 2000, depth = 120 }: { count?: number; depth?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const { size } = useThree();

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 90; // x spread
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60; // y spread
      positions[i * 3 + 2] = Math.random() * depth; // z (wrapped in shader)
      scales[i] = 0.4 + Math.random() * 1.4;
      seeds[i] = Math.random() * 100;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return geo;
  }, [count, depth]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 1.5 },
          uDepth: { value: depth },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uColorA: { value: new THREE.Color("#3a1d6e") }, // deep violet
          uColorB: { value: new THREE.Color("#c9b8ff") }, // soft lavender
        },
      }),
    [depth]
  );

  // Dispose GPU resources on unmount.
  React.useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  const onPointerMove = (x: number, y: number) => {
    pointer.current.set((x / size.width) * 2 - 1, -((y / size.height) * 2 - 1));
  };

  React.useEffect(() => {
    const handler = (e: PointerEvent) => onPointerMove(e.clientX, e.clientY);
    window.addEventListener("pointermove", handler);
    return () => window.removeEventListener("pointermove", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta;
    const p = material.uniforms.uPointer.value as THREE.Vector2;
    p.lerp(pointer.current, 0.03); // easing gives a soft "pressure" feel
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

export default function HeroBackground() {
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #1b1233 0%, #0c0a1a 55%, #060509 100%)",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 0.1], fov: 75, near: 0.1, far: 200 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ParticleField />
      </Canvas>
      {/* Vignette: draws focus to center and deepens edge contrast. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, transparent 30%, rgba(3,2,8,0.55) 100%)",
        }}
      />
    </div>
  );
}
