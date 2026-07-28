import Image from "next/image";
import LandingHero from "./LandingHero";
import HeroBackground from "@/components/HeroBackground";

export default function Home() {
	return (
		<div className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<HeroBackground />
			<main className="row-start-2 flex w-full flex-col items-center gap-[32px]">
				<LandingHero />
			</main>
			<footer className="row-start-3 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
				<a
					className="flex items-center gap-2 transition-colors hover:text-white"
					href="https://www.linkedin.com/in/axeludewig/"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image
						aria-hidden
						src="/linkedin.svg"
						alt=""
						width={20}
						height={20}
					/>
					LinkedIn
				</a>
				<a
					className="flex items-center gap-2 transition-colors hover:text-white"
					href="/blog"
					rel="noopener noreferrer"
				>
					<Image
						aria-hidden
						src="/globe.svg"
						alt=""
						width={16}
						height={16}
						className="invert"
					/>
					Blog
				</a>
			</footer>
		</div>
	);
}
