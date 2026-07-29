import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// eslint-config-next ships CommonJS, so unwrap the interop default.
const unwrap = (mod) => mod.default ?? mod;

const config = [
	{
		ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
	},
	...unwrap(coreWebVitals),
	...unwrap(typescript),
	{
		// react-three-fiber components are imperative by design: geometry is
		// seeded with Math.random() in useMemo, and useFrame mutates typed
		// arrays in place to push per-frame updates to the GPU. useFrame runs on
		// the rAF loop rather than during render, so the React Compiler's purity
		// and immutability rules don't apply — they'd only be satisfied by
		// reallocating buffers every frame.
		files: [
			"components/HeroBackground.tsx",
			"components/MatrixGlobe.tsx",
			"components/CubeCore.tsx",
		],
		rules: {
			"react-hooks/purity": "off",
			"react-hooks/immutability": "off",
		},
	},
];

export default config;
