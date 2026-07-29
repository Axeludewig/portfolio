"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import CubeCore from "@/components/CubeCore";
import ScrambleText from "@/components/ScrambleText";

/**
 * The details card as a static CSS cube. Faces don't rotate into view — the
 * content on the front face scrambles out and reassembles as the next face,
 * advancing on a timer and on click.
 *
 * CSS 3D rather than WebGL so the content stays real DOM: selectable text,
 * clickable links, crisp at any DPR, and legible to crawlers.
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

const FACES = [
	{ id: "intro", label: "Axel Ludewig", title: "Building web apps that ship" },
	{ id: "stack", label: "Stack", title: "What I build with" },
	{ id: "focus", label: "Focus", title: "How I work" },
	{ id: "links", label: "Elsewhere", title: "Where to find me" },
] as const;

const INTERVAL = 6500; // ms a face holds before advancing

function FaceBody({ face }: { face: (typeof FACES)[number]["id"] }) {
	if (face === "intro") {
		return (
			<ScrambleText
				as="p"
				delay={340}
				className="text-sm leading-relaxed text-slate-300"
				text="Full-stack software engineer based in Mexico, focused on fast, reliable web applications built end to end."
			/>
		);
	}

	if (face === "stack") {
		return (
			<div className="face-rise flex flex-wrap gap-2" style={{ animationDelay: "320ms" }}>
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
		);
	}

	if (face === "focus") {
		return (
			<ul className="space-y-2.5 text-sm leading-snug text-slate-300">
				{FOCUS.map((item, i) => (
					<li key={item} className="flex gap-2">
						<span aria-hidden className="text-violet-400">
							—
						</span>
						<ScrambleText text={item} delay={300 + i * 90} />
					</li>
				))}
			</ul>
		);
	}

	return (
		<div
			className="face-rise flex flex-col gap-3"
			style={{ animationDelay: "320ms" }}
		>
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
	);
}

export default function InfoCube() {
	const [index, setIndex] = React.useState(0);
	const [paused, setPaused] = React.useState(false);
	const face = FACES[index];

	const advance = React.useCallback(
		(to?: number) =>
			setIndex((i) => (to === undefined ? (i + 1) % FACES.length : to)),
		[]
	);

	React.useEffect(() => {
		if (paused) return;
		// Keyed off index as well as paused, so clicking restarts the dwell
		// rather than cutting the new face short.
		const id = setTimeout(() => advance(), INTERVAL);
		return () => clearTimeout(id);
	}, [index, paused, advance]);

	return (
		<div
			className="cube-scene relative mx-auto w-full max-w-[420px] py-10 [--cube-size:280px] sm:[--cube-size:340px]"
			onPointerEnter={() => setPaused(true)}
			onPointerLeave={() => setPaused(false)}
		>
			<CubeCore paused={paused} />

			<div className="cube mx-auto">
				{/* Front — the only face carrying content; the rest are panels
				    that give the cube its solidity. */}
				<div
					className="cube-face cube-front cursor-pointer select-none"
					onClick={(e) => {
						// Let links do their job instead of advancing.
						if ((e.target as HTMLElement).closest("a")) return;
						advance();
					}}
				>
					<ScrambleText
						key={`${face.id}-label`}
						as="p"
						className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-violet-300/80"
						text={face.label}
					/>
					<ScrambleText
						key={`${face.id}-title`}
						as="h2"
						delay={140}
						className="mb-4 text-xl font-semibold text-white"
						text={face.title}
					/>
					<div key={face.id} className="flex-1">
						<FaceBody face={face.id} />
					</div>
				</div>

				<div aria-hidden className="cube-face cube-right" />
				<div aria-hidden className="cube-face cube-back" />
				<div aria-hidden className="cube-face cube-left" />
				<div aria-hidden className="cube-face cube-top" />
				<div aria-hidden className="cube-face cube-bottom" />
			</div>

			<div aria-hidden className="cube-shadow" />

			{/* Keyboard-reachable equivalent of clicking the face. */}
			<div className="mt-6 flex items-center justify-center gap-2">
				{FACES.map((f, i) => (
					<button
						key={f.id}
						type="button"
						onClick={() => advance(i)}
						aria-label={`Show ${f.label}`}
						aria-current={i === index}
						className={
							i === index
								? "h-1.5 w-6 rounded-full bg-violet-400 transition-all"
								: "h-1.5 w-1.5 rounded-full bg-white/25 transition-all hover:bg-white/50"
						}
					/>
				))}
			</div>
		</div>
	);
}
