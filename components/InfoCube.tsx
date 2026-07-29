"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ScrambleText from "@/components/ScrambleText";

/**
 * The details as a CSS cube with content on all four side faces. Advancing
 * turns the cube a quarter step, so the next face genuinely rotates into view,
 * and its letters resolve out of matrix noise as the rotation settles.
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

/**
 * Order matters: the cube turns -90deg per step, which brings the faces to the
 * front in exactly this sequence.
 */
const FACES = [
	{ id: "intro", side: "cube-front", label: "Axel Ludewig", title: "Building web apps that ship" },
	{ id: "stack", side: "cube-right", label: "Stack", title: "What I build with" },
	{ id: "focus", side: "cube-back", label: "Focus", title: "How I work" },
	{ id: "links", side: "cube-left", label: "Elsewhere", title: "Where to find me" },
] as const;

const INTERVAL = 6500; // ms a face holds before advancing
const SETTLE = 350; // ms into the 900ms turn before the text starts resolving

function FaceBody({ id, active, turn }: { id: string; active: boolean; turn: number }) {
	// Only the face being turned into view animates; the others just hold their
	// finished content, out of sight.
	const scrambleKey = active ? turn : "idle";

	if (id === "intro") {
		return (
			<ScrambleText
				key={scrambleKey}
				as="p"
				delay={active ? SETTLE + 190 : 0}
				className="text-sm leading-relaxed text-slate-300"
				text="Full-stack software engineer based in Mexico, focused on fast, reliable web applications built end to end."
			/>
		);
	}

	if (id === "stack") {
		return (
			<div
				key={scrambleKey}
				className="face-rise flex flex-wrap gap-2"
				style={{ animationDelay: `${SETTLE + 170}ms` }}
			>
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

	if (id === "focus") {
		return (
			<ul key={scrambleKey} className="space-y-2.5 text-sm leading-snug text-slate-300">
				{FOCUS.map((item, i) => (
					<li key={item} className="flex gap-2">
						<span aria-hidden className="text-violet-400">
							—
						</span>
						<ScrambleText
							text={item}
							delay={active ? SETTLE + 150 + i * 90 : 0}
						/>
					</li>
				))}
			</ul>
		);
	}

	return (
		<div
			key={scrambleKey}
			className="face-rise flex flex-col gap-3"
			style={{ animationDelay: `${SETTLE + 170}ms` }}
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
	// Counts total quarter turns rather than wrapping, so the cube keeps
	// rotating the same direction instead of unwinding on every fourth step.
	const [turn, setTurn] = React.useState(0);
	const [paused, setPaused] = React.useState(false);
	const index = turn % FACES.length;

	const goTo = React.useCallback((target: number) => {
		// Step forward to the requested face, never backward.
		setTurn((t) => t + ((target - (t % FACES.length)) + FACES.length) % FACES.length);
	}, []);

	React.useEffect(() => {
		if (paused) return;
		// Keyed on turn as well, so clicking restarts the dwell rather than
		// cutting the new face short.
		const id = setTimeout(() => setTurn((t) => t + 1), INTERVAL);
		return () => clearTimeout(id);
	}, [turn, paused]);

	return (
		<div
			className="cube-scene relative mx-auto w-full max-w-[420px] py-10 [--cube-size:280px] sm:[--cube-size:340px]"
			onPointerEnter={() => setPaused(true)}
			onPointerLeave={() => setPaused(false)}
		>
			<div
				className="cube mx-auto"
				style={{ "--turn": `${turn * -90}deg` } as React.CSSProperties}
			>
				{FACES.map((face, i) => {
					const active = i === index;
					return (
						<div
							key={face.id}
							className={`cube-face ${face.side} cursor-pointer select-none`}
							aria-hidden={!active}
							onClick={(e) => {
								// Let links do their job instead of advancing.
								if ((e.target as HTMLElement).closest("a")) return;
								setTurn((t) => t + 1);
							}}
						>
							<ScrambleText
								key={`${face.id}-label-${active ? turn : "idle"}`}
								as="p"
								delay={active ? SETTLE : 0}
								className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-violet-300/80"
								text={face.label}
							/>
							<ScrambleText
								key={`${face.id}-title-${active ? turn : "idle"}`}
								as="h2"
								delay={active ? SETTLE + 90 : 0}
								className="mb-4 text-xl font-semibold text-white"
								text={face.title}
							/>
							<div className="flex-1">
								<FaceBody id={face.id} active={active} turn={turn} />
							</div>
							<div
								className="cube-shade"
								style={{ opacity: active ? 0 : 0.6 }}
							/>
						</div>
					);
				})}

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
						onClick={() => goTo(i)}
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
