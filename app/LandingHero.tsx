import React from "react";
import MatrixGlobe from "@/components/MatrixGlobe";
import InfoCube from "@/components/InfoCube";

function LandingHero() {
	return (
		<div className="grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_minmax(0,440px)] lg:gap-16">
			{/* Left: the globe, with the name sitting over its equator. */}
			<div className="relative mx-auto w-full max-w-[560px]">
				<MatrixGlobe className="h-[320px] w-full sm:h-[420px] lg:h-[520px]" />
				<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
					{/* Scrim: the glyph field is high-contrast noise, so the text
					    needs its own dark backing to stay legible. */}
					<div
						aria-hidden
						className="absolute left-1/2 top-1/2 h-40 w-[115%] -translate-x-1/2 -translate-y-1/2"
						style={{
							background:
								"radial-gradient(ellipse at center, rgba(8,6,18,0.92) 0%, rgba(8,6,18,0.75) 45%, transparent 75%)",
						}}
					/>
					<h1 className="relative bg-gradient-to-b from-white to-violet-200 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-6xl">
						Axel Ludewig
					</h1>
					<p className="relative mt-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-violet-200 [text-shadow:0_1px_10px_rgba(8,6,18,0.95)] sm:text-xs">
						Full-Stack Software Engineer · Mexico
					</p>
				</div>
			</div>

			{/* Right: the details, as a slowly rotating cube. */}
			<InfoCube />
		</div>
	);
}

export default LandingHero;
