import React from "react";
import Image from "next/image";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

function LandingHero() {
	return (
		<div>
			<div className="text-6xl w-full text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-black to-purple-900 p-2 tracking-widest mb-4">
				<h1>Axel Ramirez Ludewig</h1>
			</div>
			<div className="flex items-center justify-center">
				<Card className="w-full max-w-[400px] shadow-2xl hover:scale-105">
					<CardHeader>
						<CardTitle>Welcome to My Portfolio</CardTitle>
						<CardDescription>
							Discover my projects, skills, and experiences.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p>
							I am a{" "}
							<a className="underline decoration-sky-500/30 decoration-4">
								passionate
							</a>{" "}
							developer based in Mexico with experience in
							building web applications.
						</p>
						<div className="flex flex-wrap gap-2 mt-4">
							<Image
								aria-hidden
								src="/php.svg"
								alt="File icon"
								width={35}
								height={35}
							/>
							<Image
								aria-hidden
								src="/laravel.svg"
								alt="File icon"
								width={35}
								height={35}
							/>
							<Image
								aria-hidden
								src="/js.svg"
								alt="File icon"
								width={35}
								height={35}
							/>
							<Image
								aria-hidden
								src="/vue.svg"
								alt="File icon"
								width={35}
								height={35}
							/>
							<Image
								aria-hidden
								src="/react.svg"
								alt="File icon"
								width={35}
								height={35}
							/>
							<Image
								aria-hidden
								src="/tailwind.svg"
								alt="File icon"
								width={35}
								height={35}
							/>
							<Image
								aria-hidden
								src="/nextjs.svg"
								alt="File icon"
								width={35}
								height={35}
							/>
							<Image
								aria-hidden
								src="/nodejs.svg"
								alt="File icon"
								width={35}
								height={35}
							/>
							<Image
								aria-hidden
								src="/aws.svg"
								alt="File icon"
								width={35}
								height={35}
							/>
						</div>
					</CardContent>
					<CardFooter>
						<a
							href="/projects"
							className="text-blue-500 hover:underline"
						>
							View Projects
						</a>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}

export default LandingHero;
