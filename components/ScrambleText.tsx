"use client";

import React from "react";
import { GLYPHS } from "@/lib/glyph-atlas";

/**
 * Resolves text out of matrix noise: every character starts as a random glyph
 * and settles into place left to right, like a decode.
 *
 * The initial state is the real text, so the server-rendered markup and the
 * first client render agree — the scramble starts in an effect, after hydration.
 */

type Tag = "span" | "p" | "h2" | "li" | "div";

const CHAR_STEP = 26; // ms between successive characters locking in
const SETTLE = 360; // ms a character spends scrambling before it locks

export default function ScrambleText({
	text,
	delay = 0,
	className,
	as = "span",
}: {
	text: string;
	delay?: number;
	className?: string;
	as?: Tag;
}) {
	const [out, setOut] = React.useState(text);

	React.useEffect(() => {
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		let raf = 0;
		let start = 0;
		const total = delay + text.length * CHAR_STEP + SETTLE;

		const tick = (now: number) => {
			// Handled inside the frame rather than in the effect body so every
			// state write goes through the same path.
			if (reduced) {
				setOut(text);
				return;
			}
			if (!start) start = now;
			const t = now - start;

			let next = "";
			for (let i = 0; i < text.length; i++) {
				const ch = text[i];
				// Spaces stay put so the text keeps its shape while resolving.
				if (ch === " ") {
					next += " ";
					continue;
				}
				const lockAt = delay + i * CHAR_STEP + SETTLE;
				next +=
					t >= lockAt
						? ch
						: GLYPHS[(Math.random() * GLYPHS.length) | 0];
			}
			setOut(next);

			if (t < total) raf = requestAnimationFrame(tick);
			else setOut(text);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [text, delay]);

	return React.createElement(as, { className }, out);
}
