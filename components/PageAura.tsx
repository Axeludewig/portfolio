import React from "react";

/**
 * Lightweight, CSS-only page backdrop for content pages (blog, etc.).
 * Keeps the dark, violet-tinted atmosphere of the hero without the cost of a
 * live WebGL canvas — better for reading and performance.
 */
export default function PageAura() {
	return (
		<div aria-hidden className="fixed inset-0 -z-10 bg-[#060509]">
			{/* Soft violet glow bleeding from the top. */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(60rem 40rem at 50% -8%, rgba(124,58,237,0.18), transparent 60%)",
				}}
			/>
			{/* Edge vignette for focus. */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(3,2,8,0.6) 100%)",
				}}
			/>
		</div>
	);
}
