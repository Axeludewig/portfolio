import Image from "next/image";
import LandingHero from "./LandingHero";

export default function Home() {
	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
				<LandingHero />
			</main>
			<footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="https://drive.google.com/file/d/1eJIeewE1ZFcjcyEebOdcjgxTgmzLMGnC/view?usp=sharing"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image
						aria-hidden
						src="/file.svg"
						alt="File icon"
						width={16}
						height={16}
					/>
					PDF Resume
				</a>
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="https://www.linkedin.com/in/axeludewig/"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image
						aria-hidden
						src="/linkedin.svg"
						alt="File icon"
						width={22}
						height={22}
					/>
					LinkedIn
				</a>
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="/blog"
					rel="noopener noreferrer"
				>
					<Image
						aria-hidden
						src="/globe.svg"
						alt="Globe icon"
						width={16}
						height={16}
					/>
					Go to my Blog →
				</a>
			</footer>
		</div>
	);
}
