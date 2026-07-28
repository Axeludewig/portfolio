import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import { posts, formatDate, type Post } from "@/lib/posts";
import PageAura from "@/components/PageAura";

export const metadata = {
	title: "Blog — Axel Ramirez Ludewig",
	description:
		"Notes on building for the web: frontend, backend, and the occasional 3D experiment.",
};

function TagPill({ tag }: { tag: string }) {
	return (
		<span className="inline-flex items-center rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-300">
			{tag}
		</span>
	);
}

function MetaRow({ post }: { post: Post }) {
	return (
		<div className="flex items-center gap-3 text-xs text-slate-500">
			<time dateTime={post.date}>{formatDate(post.date)}</time>
			<span aria-hidden>·</span>
			<span className="inline-flex items-center gap-1">
				<Clock className="size-3" />
				{post.readingTime}
			</span>
		</div>
	);
}

function FeaturedCard({ post }: { post: Post }) {
	return (
		<Link
			href={`/blog/${post.slug}`}
			className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl transition-colors hover:border-violet-400/30 sm:p-10"
		>
			<div className="mb-4 flex items-center gap-3">
				<TagPill tag={post.tag} />
				<span className="text-xs font-medium uppercase tracking-widest text-violet-300/70">
					Featured
				</span>
			</div>
			<h2 className="mb-3 text-2xl font-semibold text-white sm:text-3xl">
				{post.title}
			</h2>
			<p className="mb-6 max-w-2xl text-slate-300">{post.excerpt}</p>
			<div className="flex items-center justify-between">
				<MetaRow post={post} />
				<span className="inline-flex items-center gap-1 text-sm font-medium text-violet-300 transition-transform group-hover:translate-x-0.5">
					Read
					<ArrowUpRight className="size-4" />
				</span>
			</div>
		</Link>
	);
}

function PostCard({ post }: { post: Post }) {
	return (
		<Link
			href={`/blog/${post.slug}`}
			className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.05]"
		>
			<div className="mb-3">
				<TagPill tag={post.tag} />
			</div>
			<h3 className="mb-2 text-lg font-semibold text-white">
				{post.title}
			</h3>
			<p className="mb-6 flex-1 text-sm leading-relaxed text-slate-400">
				{post.excerpt}
			</p>
			<MetaRow post={post} />
		</Link>
	);
}

export default function BlogHome() {
	const [featured, ...rest] = posts;

	return (
		<main className="relative min-h-screen px-6 py-16 sm:px-10 sm:py-24">
			<PageAura />
			<div className="mx-auto w-full max-w-5xl">
				<Link
					href="/"
					className="mb-12 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
				>
					<ArrowLeft className="size-4" />
					Back home
				</Link>

				<header className="mb-14">
					<p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-violet-300/80">
						Writing
					</p>
					<h1 className="text-4xl font-bold text-white sm:text-5xl">
						Blog
					</h1>
					<p className="mt-4 max-w-xl text-slate-400">
						Notes on building for the web — frontend, backend, and the
						occasional 3D experiment.
					</p>
				</header>

				{posts.length === 0 ? (
					<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center text-slate-400 backdrop-blur-xl">
						No posts yet — check back soon.
					</div>
				) : (
					<div className="space-y-10">
						{featured && <FeaturedCard post={featured} />}
						{rest.length > 0 && (
							<div className="grid gap-6 sm:grid-cols-2">
								{rest.map((post) => (
									<PostCard key={post.slug} post={post} />
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</main>
	);
}
