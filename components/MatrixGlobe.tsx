"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A globe built entirely out of characters. Points are spread evenly over a
 * sphere (Fibonacci lattice); each one samples a glyph from a canvas texture
 * atlas. Glyphs re-roll continuously and flash bright white on change, so the
 * surface reads like matrix rain wrapped around a planet.
 */

const GLYPHS =
	"アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\{}[]$#@*+=";
const ATLAS_COLS = 12;
const CELL = 64; // px per glyph cell in the atlas

/** Renders every glyph into a grid texture so the shader can index into it. */
function buildAtlas() {
	const rows = Math.ceil(GLYPHS.length / ATLAS_COLS);
	const canvas = document.createElement("canvas");
	canvas.width = ATLAS_COLS * CELL;
	canvas.height = rows * CELL;
	const ctx = canvas.getContext("2d")!;
	ctx.fillStyle = "#fff";
	ctx.font = `600 ${CELL * 0.72}px ui-monospace, "SF Mono", Menlo, monospace`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	for (let i = 0; i < GLYPHS.length; i++) {
		const col = i % ATLAS_COLS;
		const row = Math.floor(i / ATLAS_COLS);
		ctx.fillText(GLYPHS[i], (col + 0.5) * CELL, (row + 0.55) * CELL);
	}
	const texture = new THREE.CanvasTexture(canvas);
	texture.flipY = false; // atlas rows run top-down, like gl_PointCoord
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	return { texture, rows };
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uGlyphSize;  // glyph height in world units
  uniform float uProjScale;  // drawingBufferHeight / (2 * tan(fov/2))

  attribute float aChar;
  attribute float aChange;
  attribute float aScale;

  varying float vChar;
  varying float vFacing;
  varying float vFlash;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;

    // Points on the far side of the globe dim out, which gives the sphere
    // volume without needing any depth testing between transparent points.
    vec3 worldNormal = normalize(mat3(modelMatrix) * normalize(position));
    vFacing = smoothstep(-0.35, 0.85, worldNormal.z);

    // Recently re-rolled glyphs flare, then settle back.
    vFlash = exp(-(uTime - aChange) * 3.0);

    vChar = aChar;
    // Perspective-correct: a glyph uGlyphSize units tall projects to this many
    // device pixels at distance -mv.z.
    gl_PointSize = uGlyphSize * aScale * uProjScale / max(-mv.z, 0.001);
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

  void main() {
    float col = mod(vChar, uCols);
    float row = floor(vChar / uCols);
    vec2 uv = (vec2(col, row) + gl_PointCoord) / vec2(uCols, uRows);

    float mask = texture2D(uAtlas, uv).a;
    if (mask < 0.06) discard;

    float alpha = mask * (0.18 + vFacing * 0.82) * (0.55 + vFlash * 0.45);
    vec3 color = mix(uColor, uFlashColor, vFlash * 0.9);
    gl_FragColor = vec4(color, alpha);
  }
`;

function GlyphSphere({
	count = 1600,
	radius = 2.6,
	reducedMotion = false,
}: {
	count?: number;
	radius?: number;
	reducedMotion?: boolean;
}) {
	const groupRef = useRef<THREE.Group>(null);
	const { size, viewport, camera } = useThree();

	const { geometry, material, chars, changes } = useMemo(() => {
		const { texture, rows } = buildAtlas();

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

	const elapsed = useRef(0);

	useFrame((_, delta) => {
		elapsed.current += delta;
		material.uniforms.uTime.value = elapsed.current;

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

	return (
		<div className={className}>
			<Canvas
				camera={{ position: [0, 0, 7.4], fov: 45 }}
				dpr={[1, 2]}
				gl={{ antialias: true, alpha: true }}
			>
				<GlyphSphere reducedMotion={reducedMotion} />
			</Canvas>
		</div>
	);
}
