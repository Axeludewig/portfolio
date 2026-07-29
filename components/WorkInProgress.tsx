import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function WorkInProgress() {
	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
				<div className="flex flex-col gap-4 items-center justify-center">
					<div className="flex flex-wrap gap-2 items-center justify-center">
						{" "}
						<Image
							aria-hidden
							src="/hammer.svg"
							alt=""
							width={35}
							height={35}
							className="invert"
						/>{" "}
						<p className="text-2xl text-slate-200">
							Work In Progress...
						</p>
					</div>
					<div className="flex items-center justify-center">
						<Link
							href="/"
							className="flex items-center gap-2 hover:shadow-2xl"
						>
							<Button>Go Back</Button>
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}

export default WorkInProgress;
