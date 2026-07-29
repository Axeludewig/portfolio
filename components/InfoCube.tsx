"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import CubeCore from "@/components/CubeCore";

/**
 * The details card as a slowly rotating cube. Built with CSS 3D transforms
 * rather than WebGL so the content stays real DOM — selectable, clickable,
 * crisp at any DPR, and readable by crawlers and screen readers.
 *
 * Rotation pauses on hover and on focus-within, since the faces carry links.
 */

const STACK = [
	{ src: "/php.svg", label: "PHP" },
	{ src: "/laravel.svg", label: "Laravel" },
	{ src: "/js.svg", label: "JavaScript" },
	{ src: "/vue.svg", label: "Vue" },
	{ src: "/react.svg", label: "React" },
	{ src: "/tailwind.svg", label: "Tailwind CSS" },
	{ src: "/nextjs.svg", label: "Next.js" },
	{ src: "/nodejs.svg", label: "Node.js" },
	{ src: "/aws.svg", label: "AWS" },
];

const FOCUS = [
	"End-to-end web apps, frontend through deploy",
	"Laravel and Node APIs on AWS",
	"React, Next.js, and Vue interfaces",
	"Shipping small, iterating fast",
];

function FaceLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-violet-300/80">
			{children}
		</p>
	);
}

export default function InfoCube() {
	// The CSS cube pauses via :hover / :focus-within. The WebGL core can't read
	// those, so mirror them into state and hand it the same signal — otherwise
	// the two would drift apart while one is paused.
	const [paused, setPaused] = React.useState(false);

	return (
		<div
			className="cube-scene relative mx-auto w-full max-w-[420px] py-10 [--cube-size:280px] sm:[--cube-size:340px]"
			onPointerEnter={() => setPaused(true)}
			onPointerLeave={() => setPaused(false)}
			onFocus={() => setPaused(true)}
			onBlur={() => setPaused(false)}
		>
			<CubeCore paused={paused} />
			<div className="cube mx-auto">
				{/* Front — the pitch */}
				<div className="cube-face cube-front">
					<FaceLabel>Axel Ludewig</FaceLabel>
					<h2 className="mb-2 text-xl font-semibold text-white">
						Building web apps that ship
					</h2>
					<p className="text-sm leading-relaxed text-slate-300">
						Full-stack software engineer based in Mexico, focused on
						fast, reliable web applications built end to end.
					</p>
				</div>

				{/* Right — the stack */}
				<div className="cube-face cube-right">
					<FaceLabel>Stack</FaceLabel>
					<div className="flex flex-wrap gap-2">
						{STACK.map((tech) => (
							<div
								key={tech.label}
								title={tech.label}
								className="flex size-9 items-center justify-center rounded-lg bg-white/95 shadow-sm ring-1 ring-white/10"
							>
								<Image
									aria-hidden
									src={tech.src}
									alt={tech.label}
									width={20}
									height={20}
								/>
							</div>
						))}
					</div>
				</div>

				{/* Back — what the work actually is */}
				<div className="cube-face cube-back">
					<FaceLabel>Focus</FaceLabel>
					<ul className="space-y-2.5 text-sm leading-snug text-slate-300">
						{FOCUS.map((item) => (
							<li key={item} className="flex gap-2">
								<span aria-hidden className="text-violet-400">
									—
								</span>
								{item}
							</li>
						))}
					</ul>
				</div>

				{/* Left — where to go next */}
				<div className="cube-face cube-left justify-center gap-3">
					<FaceLabel>Elsewhere</FaceLabel>
					<Link
						href="/projects"
						className="flex items-center justify-between rounded-lg bg-white/95 px-4 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-white"
					>
						View Projects
						<ArrowUpRight className="size-4" />
					</Link>
					<a
						href="https://www.linkedin.com/in/axeludewig/"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-between rounded-lg border border-white/15 px-4 py-2.5 text-sm text-slate-200 transition-colors hover:border-violet-400/40 hover:text-white"
					>
						LinkedIn
						<ArrowUpRight className="size-4" />
					</a>
					<Link
						href="/blog"
						className="flex items-center justify-between rounded-lg border border-white/15 px-4 py-2.5 text-sm text-slate-200 transition-colors hover:border-violet-400/40 hover:text-white"
					>
						Blog
						<ArrowUpRight className="size-4" />
					</Link>
				</div>

				{/* Caps: no content, just so the cube reads as a solid. */}
				<div aria-hidden className="cube-face cube-top" />
				<div aria-hidden className="cube-face cube-bottom" />
			</div>

			<div aria-hidden className="cube-shadow" />
		</div>
	);
}
