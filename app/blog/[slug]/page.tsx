import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { posts, getPost, formatDate } from "@/lib/posts";
import PageAura from "@/components/PageAura";

// Pre-render every post at build time.
export function generateStaticParams() {
	return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = getPost(slug);
	if (!post) return { title: "Post not found" };
	return {
		title: `${post.title} — Axel Ramirez Ludewig`,
		description: post.excerpt,
	};
}

export default async function BlogPost({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = getPost(slug);
	if (!post) notFound();

	return (
		<main className="relative min-h-screen px-6 py-16 sm:px-10 sm:py-24">
			<PageAura />
			<article className="mx-auto w-full max-w-2xl">
				<Link
					href="/blog"
					className="mb-12 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
				>
					<ArrowLeft className="size-4" />
					All posts
				</Link>

				<header className="mb-10 border-b border-white/10 pb-8">
					<div className="mb-4 flex items-center gap-3 text-xs text-slate-500">
						<span className="inline-flex items-center rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-0.5 font-medium text-violet-300">
							{post.tag}
						</span>
						<time dateTime={post.date}>{formatDate(post.date)}</time>
						<span aria-hidden>·</span>
						<span className="inline-flex items-center gap-1">
							<Clock className="size-3" />
							{post.readingTime}
						</span>
					</div>
					<h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
						{post.title}
					</h1>
				</header>

				<div className="space-y-6">
					{post.content.map((block, i) =>
						block.startsWith("## ") ? (
							<h2
								key={i}
								className="pt-4 text-xl font-semibold text-white"
							>
								{block.slice(3)}
							</h2>
						) : (
							<p
								key={i}
								className="leading-relaxed text-slate-300"
							>
								{block}
							</p>
						)
					)}
				</div>

				<footer className="mt-16 border-t border-white/10 pt-8">
					<Link
						href="/blog"
						className="inline-flex items-center gap-2 text-sm font-medium text-violet-300 transition-colors hover:text-violet-200"
					>
						<ArrowLeft className="size-4" />
						Back to all posts
					</Link>
				</footer>
			</article>
		</main>
	);
}
