"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Text3D, Center, Float, OrbitControls } from "@react-three/drei";

/**
 * Extruded 3D name laid out as stacked, centered lines (a nameplate).
 * Renders in its own inline canvas so it sits cleanly in the page layout.
 * Bright near-white face for contrast against the dark atmosphere; a violet
 * rim light adds brand accent.
 */

const SIZE = 2.0;
const LINE_GAP = SIZE * 1.15;

function Line({ text, y }: { text: string; y: number }) {
	return (
		<Center position={[0, y, 0]}>
			<Text3D
				font="/fonts/bebasneue.typeface.json"
				size={SIZE}
				height={0.5}
				letterSpacing={0.06}
				curveSegments={32}
				bevelEnabled
				bevelThickness={0.05}
				bevelSize={0.02}
				bevelSegments={10}
			>
				{text.toUpperCase()}
				<meshStandardMaterial
					color="#f4f1ff"
					roughness={0.35}
					metalness={0.2}
					emissive="#6d28d9"
					emissiveIntensity={0.12}
				/>
			</Text3D>
		</Center>
	);
}

function Nameplate({ lines }: { lines: string[] }) {
	// Center the stack vertically around y = 0.
	const top = ((lines.length - 1) / 2) * LINE_GAP;
	return (
		<Center>
			<Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
				{lines.map((line, i) => (
					<Line key={line} text={line} y={top - i * LINE_GAP} />
				))}
			</Float>
		</Center>
	);
}

export default function Name3D({ lines = ["Axel"] }: { lines?: string[] }) {
	return (
		<div className="h-64 w-full sm:h-72">
			<Canvas
				camera={{ position: [0, 0, 9], fov: 45 }}
				dpr={[1, 2]}
				gl={{ antialias: true }}
			>
				<ambientLight intensity={0.5} />
				{/* Key light — crisp white highlight on the bevels. */}
				<directionalLight position={[4, 6, 8]} intensity={3} color="#ffffff" />
				{/* Soft cool fill. */}
				<directionalLight position={[-6, -1, 4]} intensity={1} color="#cbd5ff" />
				{/* Violet rim light from behind for edge definition + brand accent. */}
				<pointLight position={[0, 0, -6]} intensity={40} color="#7c3aed" distance={20} />
				<React.Suspense fallback={null}>
					<Nameplate lines={lines} />
				</React.Suspense>
				{/* Look-only: gentle drag to rotate, no zoom/pan. */}
				<OrbitControls
					enableZoom={false}
					enablePan={false}
					minPolarAngle={Math.PI / 2.6}
					maxPolarAngle={Math.PI / 1.7}
				/>
			</Canvas>
		</div>
	);
}
