"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLYPHS, ATLAS_COLS, buildGlyphAtlas } from "@/lib/glyph-atlas";

/**
 * A globe built entirely out of characters. Points are spread evenly over a
 * sphere (Fibonacci lattice); each one samples a glyph from a canvas texture
 * atlas. Glyphs re-roll continuously and flash bright white on change, so the
 * surface reads like matrix rain wrapped around a planet.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uGlyphSize;  // glyph height in world units
  uniform float uProjScale;  // drawingBufferHeight / (2 * tan(fov/2))
  uniform vec3  uImpact;     // cursor hit point, unit vector in local space
  uniform float uHover;      // 0..1, eased in and out as the cursor enters
  uniform float uWidth;      // disturbance radius, in radians of arc
  uniform float uRipple;     // 0 disables oscillation (reduced motion)

  attribute float aChar;
  attribute float aChange;
  attribute float aScale;

  varying float vChar;
  varying float vFacing;
  varying float vFlash;
  varying float vDisturb;

  void main() {
    vec3 dir = normalize(position);

    // Geodesic angle from the cursor's impact point, in radians (0 at the
    // cursor, PI on the far side). Measuring along the surface rather than
    // through the sphere is what makes the disturbance travel correctly:
    // it wraps over the horizon instead of punching through the middle.
    float d = acos(clamp(dot(dir, uImpact), -1.0, 1.0));

    // Three superposed responses, in falling order of locality:
    //  1. a bulge under the cursor, pushing glyphs outward along the normal
    //  2. ripples radiating out from it, damped with distance
    //  3. a low-amplitude wave across the whole globe, so every glyph moves
    float bulge  = exp(-(d * d) / (uWidth * uWidth));
    float ripple = sin(d * 9.0 - uTime * 5.0) * exp(-(d * d) / (uWidth * uWidth * 6.0));
    float global = sin(d * 3.0 - uTime * 2.2);

    float disp = uHover * (
      bulge * 0.55 +
      uRipple * (ripple * 0.22 + global * 0.06)
    );

    vec3 pos = position + dir * disp;
    vDisturb = clamp(abs(disp) * 2.2, 0.0, 1.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Points on the far side of the globe dim out, which gives the sphere
    // volume without needing any depth testing between transparent points.
    vec3 worldNormal = normalize(mat3(modelMatrix) * dir);
    vFacing = smoothstep(-0.35, 0.85, worldNormal.z);

    // Recently re-rolled glyphs flare, then settle back.
    vFlash = exp(-(uTime - aChange) * 3.0);

    vChar = aChar;
    // Perspective-correct: a glyph uGlyphSize units tall projects to this many
    // device pixels at distance -mv.z. Disturbed glyphs swell slightly.
    gl_PointSize = uGlyphSize * aScale * (1.0 + vDisturb * 0.45)
                 * uProjScale / max(-mv.z, 0.001);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform float uCols;
  uniform float uRows;
  uniform vec3 uColor;
  uniform vec3 uFlashColor;

  varying float vChar;
  varying float vFacing;
  varying float vFlash;
  varying float vDisturb;

  void main() {
    float col = mod(vChar, uCols);
    float row = floor(vChar / uCols);
    vec2 uv = (vec2(col, row) + gl_PointCoord) / vec2(uCols, uRows);

    float mask = texture2D(uAtlas, uv).a;
    if (mask < 0.06) discard;

    // Displacement reads as energy: disturbed glyphs brighten toward white,
    // which keeps the wave legible even where it barely moves them.
    float hot = max(vFlash, vDisturb);
    float alpha = mask * (0.18 + vFacing * 0.82) * (0.55 + hot * 0.45);
    vec3 color = mix(uColor, uFlashColor, hot * 0.9);
    gl_FragColor = vec4(color, alpha);
  }
`;

function GlyphSphere({
	count = 1600,
	radius = 2.6,
	reducedMotion = false,
	hovering,
}: {
	count?: number;
	radius?: number;
	reducedMotion?: boolean;
	hovering: React.RefObject<boolean>;
}) {
	const groupRef = useRef<THREE.Group>(null);
	const { size, viewport, camera, raycaster, pointer } = useThree();

	const { geometry, material, chars, changes } = useMemo(() => {
		const { texture, rows } = buildGlyphAtlas();

		const positions = new Float32Array(count * 3);
		const chars = new Float32Array(count);
		const changes = new Float32Array(count);
		const scales = new Float32Array(count);

		// Fibonacci lattice — even coverage with no clustering at the poles.
		const golden = Math.PI * (3 - Math.sqrt(5));
		for (let i = 0; i < count; i++) {
			const y = 1 - (i / (count - 1)) * 2;
			const r = Math.sqrt(Math.max(0, 1 - y * y));
			const theta = golden * i;
			positions[i * 3 + 0] = Math.cos(theta) * r * radius;
			positions[i * 3 + 1] = y * radius;
			positions[i * 3 + 2] = Math.sin(theta) * r * radius;
			chars[i] = Math.floor(Math.random() * GLYPHS.length);
			changes[i] = -Math.random() * 4;
			scales[i] = 0.75 + Math.random() * 0.6;
		}

		const geo = new THREE.BufferGeometry();
		geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		geo.setAttribute("aChar", new THREE.BufferAttribute(chars, 1));
		geo.setAttribute("aChange", new THREE.BufferAttribute(changes, 1));
		geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

		const mat = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uTime: { value: 0 },
				// Roughly the mean point spacing on the sphere, sqrt(4*PI*r^2/N),
				// so glyphs tile the surface without smearing into each other.
				uGlyphSize: { value: Math.sqrt((4 * Math.PI * radius * radius) / count) * 1.15 },
				uProjScale: { value: 1000 },
				uImpact: { value: new THREE.Vector3(0, 0, 1) },
				uHover: { value: 0 },
				uWidth: { value: 0.55 },
				uRipple: { value: 1 },
				uAtlas: { value: texture },
				uCols: { value: ATLAS_COLS },
				uRows: { value: rows },
				uColor: { value: new THREE.Color("#a78bfa") }, // violet body
				uFlashColor: { value: new THREE.Color("#ffffff") }, // fresh glyph
			},
		});

		return { geometry: geo, material: mat, chars, changes };
	}, [count, radius]);

	React.useEffect(
		() => () => {
			geometry.dispose();
			material.dispose();
			(material.uniforms.uAtlas.value as THREE.Texture).dispose();
		},
		[geometry, material]
	);

	// gl_PointSize is in device pixels, so this has to track both the canvas
	// height and the DPR.
	React.useEffect(() => {
		const fov = (camera as THREE.PerspectiveCamera).fov ?? 45;
		material.uniforms.uProjScale.value =
			(size.height * viewport.dpr) / (2 * Math.tan((fov * Math.PI) / 360));
	}, [size.height, viewport.dpr, camera, material]);

	// Reduced motion keeps the cursor bulge (it's user-driven) but drops the
	// self-running oscillation.
	React.useEffect(() => {
		material.uniforms.uRipple.value = reducedMotion ? 0 : 1;
	}, [reducedMotion, material]);

	const elapsed = useRef(0);
	const hitSphere = useMemo(
		() => new THREE.Sphere(new THREE.Vector3(0, 0, 0), radius),
		[radius]
	);
	const hitPoint = useMemo(() => new THREE.Vector3(), []);

	useFrame((_, delta) => {
		elapsed.current += delta;
		material.uniforms.uTime.value = elapsed.current;

		// Project the cursor onto the globe. The hit lands in world space, but
		// the disturbance has to be expressed in the sphere's local frame —
		// otherwise the globe's own rotation would drag the bulge around with
		// it instead of leaving it parked under the cursor.
		let onGlobe = false;
		if (groupRef.current && hovering.current) {
			raycaster.setFromCamera(pointer, camera);
			if (raycaster.ray.intersectSphere(hitSphere, hitPoint)) {
				groupRef.current.worldToLocal(hitPoint).normalize();
				const impact = material.uniforms.uImpact.value as THREE.Vector3;
				// Ease toward the new point so fast cursor moves drag the
				// disturbance rather than teleporting it.
				impact.lerp(hitPoint, 0.25).normalize();
				onGlobe = true;
			}
		}
		const target = onGlobe ? 1 : 0;
		material.uniforms.uHover.value +=
			(target - material.uniforms.uHover.value) * Math.min(1, delta * 6);

		if (groupRef.current && !reducedMotion) {
			groupRef.current.rotation.y += delta * 0.16;
			// Slow nod so the poles drift in and out of view.
			groupRef.current.rotation.x =
				-0.22 + Math.sin(elapsed.current * 0.25) * 0.09;
		}

		if (reducedMotion) return;

		// Re-roll a slice of the glyphs each frame. Scaling by delta keeps the
		// churn rate steady regardless of framerate.
		const charAttr = geometry.getAttribute("aChar") as THREE.BufferAttribute;
		const changeAttr = geometry.getAttribute("aChange") as THREE.BufferAttribute;
		const flips = Math.min(chars.length, Math.round(chars.length * 1.6 * delta));
		for (let n = 0; n < flips; n++) {
			const i = (Math.random() * chars.length) | 0;
			chars[i] = Math.floor(Math.random() * GLYPHS.length);
			changes[i] = elapsed.current;
		}
		charAttr.needsUpdate = true;
		changeAttr.needsUpdate = true;
	});

	return (
		<group ref={groupRef}>
			<points geometry={geometry} material={material} />
		</group>
	);
}

export default function MatrixGlobe({ className }: { className?: string }) {
	const [reducedMotion, setReducedMotion] = React.useState(false);

	React.useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setReducedMotion(mq.matches);
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, []);

	// r3f keeps reporting the last pointer position after the cursor leaves the
	// canvas, so track enter/leave ourselves and let the disturbance settle.
	const hovering = React.useRef(false);

	return (
		<div
			className={className}
			onPointerEnter={() => {
				hovering.current = true;
			}}
			onPointerLeave={() => {
				hovering.current = false;
			}}
		>
			<Canvas
				camera={{ position: [0, 0, 7.4], fov: 45 }}
				dpr={[1, 2]}
				gl={{ antialias: true, alpha: true }}
			>
				<GlyphSphere reducedMotion={reducedMotion} hovering={hovering} />
			</Canvas>
		</div>
	);
}
