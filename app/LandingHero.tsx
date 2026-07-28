import React from "react";
import Image from "next/image";
import MatrixGlobe from "@/components/MatrixGlobe";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

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

			{/* Right: the details card. */}
			<Card className="w-full border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl">
				<CardHeader>
					<CardTitle className="text-xl text-white">
						Building web apps that ship
					</CardTitle>
					<CardDescription className="text-slate-400">
						Projects, skills, and experience.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					<p className="text-sm leading-relaxed text-slate-300">
						I&apos;m a passionate full-stack software engineer based in Mexico,
						focused on building fast, reliable web applications end to
						end.
					</p>
					<div className="flex flex-wrap gap-2">
						{STACK.map((tech) => (
							<div
								key={tech.label}
								title={tech.label}
								className="flex size-9 items-center justify-center rounded-lg bg-white/95 shadow-sm ring-1 ring-white/10 transition-transform hover:-translate-y-0.5"
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
				</CardContent>
				<CardFooter>
					<Button asChild className="w-full">
						<a href="/projects">
							View Projects
							<ArrowUpRight className="size-4" />
						</a>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

export default LandingHero;
