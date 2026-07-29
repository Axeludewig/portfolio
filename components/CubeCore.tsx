"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildGlyphAtlas } from "@/lib/glyph-atlas";

/**
 * The solid core suspended inside the glass info cube. Shares the globe's
 * language — the same glyph atlas, the same violet — but as a lit mesh rather
 * than points, so it reads as a dense object rather than a cloud.
 *
 * A WebGL canvas cannot depth-interleave with CSS 3D faces (it is one flat
 * layer in the stacking order), so this sits *behind* the translucent faces.
 * Since backface-visibility hides the rear faces, the result reads as a core
 * seen through glass.
 *
 * Rotation is locked to the CSS cube's 36s period and pauses with it.
 */

const SIZE = 1.85;
const TURN = (Math.PI * 2) / 36; // rad/s — one turn per 36s, matching the CSS

function Core({ paused, reducedMotion }: { paused: boolean; reducedMotion: boolean }) {
	const meshRef = useRef<THREE.Group>(null);

	const { texture, edges } = useMemo(() => {
		const { texture } = buildGlyphAtlas();
		// Meshes expect the standard flipped UV origin, unlike the point shader.
		texture.flipY = true;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(1.6, 1.6);
		texture.needsUpdate = true;
		const edges = new THREE.EdgesGeometry(
			new THREE.BoxGeometry(SIZE, SIZE, SIZE)
		);
		return { texture, edges };
	}, []);

	React.useEffect(
		() => () => {
			texture.dispose();
			edges.dispose();
		},
		[texture, edges]
	);

	useFrame((_, delta) => {
		if (!meshRef.current || paused || reducedMotion) return;
		meshRef.current.rotation.y += delta * TURN;
		// Drift the glyphs across the faces so the surface never sits still.
		texture.offset.y -= delta * 0.05;
		texture.offset.x += delta * 0.012;
	});

	return (
		<group ref={meshRef} rotation={[-0.24, 0.6, 0]}>
			<mesh>
				<boxGeometry args={[SIZE, SIZE, SIZE]} />
				{/* Dark body so it reads as solid; the glyphs are emissive only,
				    which makes them glow through the glass without lighting the
				    whole face. */}
				<meshStandardMaterial
					color="#150e2c"
					roughness={0.28}
					metalness={0.65}
					emissive="#7c3aed"
					emissiveMap={texture}
					emissiveIntensity={1.5}
				/>
			</mesh>
			<lineSegments geometry={edges}>
				<lineBasicMaterial color="#c4b5fd" transparent opacity={0.5} />
			</lineSegments>
		</group>
	);
}

export default function CubeCore({ paused }: { paused: boolean }) {
	const [reducedMotion, setReducedMotion] = React.useState(false);
	const [enabled, setEnabled] = React.useState(false);

	React.useEffect(() => {
		const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
		// This is the page's third WebGL context. It is pure decoration behind
		// glass, so it is skipped on small screens rather than spending a mobile
		// GPU budget on something barely visible.
		const wide = window.matchMedia("(min-width: 640px)");
		const update = () => {
			setReducedMotion(motion.matches);
			setEnabled(wide.matches);
		};
		update();
		motion.addEventListener("change", update);
		wide.addEventListener("change", update);
		return () => {
			motion.removeEventListener("change", update);
			wide.removeEventListener("change", update);
		};
	}, []);

	if (!enabled) return null;

	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0 flex items-center justify-center"
		>
			<div className="size-[var(--cube-size)]">
				<Canvas
					camera={{ position: [0, 0, 4.2], fov: 45 }}
					dpr={[1, 2]}
					gl={{ antialias: true, alpha: true }}
				>
					<ambientLight intensity={0.45} />
					<directionalLight position={[3, 5, 4]} intensity={2.2} />
					<pointLight
						position={[-3, -1, -3]}
						intensity={18}
						color="#7c3aed"
						distance={12}
					/>
					<Core paused={paused} reducedMotion={reducedMotion} />
				</Canvas>
			</div>
		</div>
	);
}
