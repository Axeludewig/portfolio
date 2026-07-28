// Blog content lives here. To add a post, append an entry to `posts`.
// `content` supports a tiny markdown-lite convention: a line starting with
// "## " renders as a subheading; everything else is a paragraph.
//
// NOTE: The entries below are sample posts — replace their text with your own.

export type Post = {
	slug: string;
	title: string;
	excerpt: string;
	date: string; // ISO (YYYY-MM-DD)
	readingTime: string;
	tag: string;
	content: string[];
};

export const posts: Post[] = [
	{
		slug: "building-a-3d-portfolio-with-react-three-fiber",
		title: "Building a 3D Portfolio with React Three Fiber",
		excerpt:
			"How I built an animated particle hero and extruded 3D name in Next.js — and the performance trade-offs that actually matter.",
		date: "2026-06-18",
		readingTime: "6 min read",
		tag: "WebGL",
		content: [
			"I wanted my portfolio to feel like something, not just read like a résumé. The goal was an atmospheric hero — the sense of drifting through pressurized air — without tanking performance or accessibility.",
			"## Why React Three Fiber",
			"Three.js is powerful but imperative. React Three Fiber wraps it in declarative JSX components, which means the 3D scene lives in the same mental model as the rest of the app. State, props, and cleanup all work the way you'd expect in React.",
			"## Moving the work to the GPU",
			"The particle field is thousands of points. Animating each one on the CPU every frame would stutter. Instead, the motion — forward flight, noise-driven sway, depth fade — is computed in a vertex shader. The CPU just advances a single time uniform.",
			"## What I'd tell my past self",
			"Start with the feeling, then optimize. Prototype the look, then pull the heavy math onto the GPU, then add the reduced-motion fallback. Doing it in that order kept the project fun instead of a pile of premature abstractions.",
		],
	},
	{
		slug: "shipping-laravel-apis-on-aws",
		title: "Shipping Laravel APIs That Scale on AWS",
		excerpt:
			"A pragmatic setup for deploying Laravel to AWS — queues, caching, and the boring reliability work that keeps things up.",
		date: "2026-05-02",
		readingTime: "8 min read",
		tag: "Backend",
		content: [
			"Most 'scaling' advice is written for problems you don't have yet. Here's the setup I actually reach for when a Laravel API needs to be reliable in production.",
			"## Push slow work off the request",
			"Anything that isn't needed to render the response — emails, image processing, third-party calls — goes onto a queue. The request returns fast, and workers chew through jobs independently.",
			"## Cache the expensive reads",
			"A thin caching layer in front of the database absorbs the repetitive reads that dominate most APIs. The trick is invalidation discipline: cache with intent, and know exactly what busts each key.",
			"## Reliability is unglamorous",
			"Health checks, structured logs, and alerting on the right metrics do more for uptime than any clever architecture. Boring, observable systems are the ones that stay up.",
		],
	},
	{
		slug: "vue-or-react-what-i-reach-for",
		title: "Vue or React: What I Reach For and Why",
		excerpt:
			"Both are great. Here's the honest, project-by-project heuristic I use to pick between them.",
		date: "2026-03-21",
		readingTime: "5 min read",
		tag: "Frontend",
		content: [
			"I've shipped production apps in both Vue and React. The 'which is better' debate misses the point — they're solving the same problem with different ergonomics.",
			"## When I reach for Vue",
			"Smaller teams, faster onboarding, or when the template-first model fits the team's mental model. Vue's single-file components and reactivity are hard to beat for velocity on a focused product.",
			"## When I reach for React",
			"Large apps, deep component ecosystems, and anything where I want the broadest hiring pool and library support. The React ecosystem — including tools like React Three Fiber — is unmatched in breadth.",
			"## The real answer",
			"Pick the one your team will maintain well. Tooling maturity and team familiarity beat framework benchmarks every time.",
		],
	},
];

export function getPost(slug: string): Post | undefined {
	return posts.find((post) => post.slug === slug);
}

export function formatDate(iso: string): string {
	// Parse as UTC to avoid off-by-one from local timezones.
	const [year, month, day] = iso.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	});
}
