import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BLOG_POSTS, findPost } from "@/lib/blog/posts";
import { formatDateBR } from "@/lib/formatters";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return { title: "Artigo não encontrado" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  const Body = post.body;

  // JSON-LD Article (rich snippet)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Capivara",
      logo: { "@type": "ImageObject", url: "/icon.svg" },
    },
    keywords: post.tags.join(", "),
    inLanguage: "pt-BR",
  };

  return (
    <article className="bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 md:py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-tabaco hover:text-fur transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Voltar ao blog
        </Link>

        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-tabaco mb-4">
            <Badge variant="outline">{post.category}</Badge>
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDateBR(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {post.readingMinutes} min de leitura
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cocoa leading-[1.1]">
            {post.title}
          </h1>

          <p className="mt-4 text-lg text-tabaco leading-relaxed">
            {post.excerpt}
          </p>
        </header>

        <div className="prose-capivara">
          <Body />
        </div>

        {/* CTA pós-artigo */}
        <div className="mt-12 rounded-2xl bg-cocoa text-cream p-8 md:p-10 text-center">
          <h2 className="font-display text-2xl font-bold">
            Pronto pra puxar uma capivara?
          </h2>
          <p className="mt-2 text-cream/80">
            Sem mensalidade. Você paga só pela consulta que fizer.
          </p>
          <Button asChild variant="accent" size="lg" className="mt-5">
            <Link href="/consultar">
              Começar agora
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Outros artigos */}
        <OutrosArtigos atualSlug={post.slug} />
      </div>
    </article>
  );
}

function OutrosArtigos({ atualSlug }: { atualSlug: string }) {
  const outros = BLOG_POSTS.filter((p) => p.slug !== atualSlug).slice(0, 2);
  if (outros.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-bold text-cocoa mb-4">
        Leia também
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {outros.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group flex flex-col rounded-lg border border-line bg-card p-5 hover:border-fur/60 hover:shadow-[var(--shadow-card)] transition-all"
          >
            <Badge variant="outline" className="mb-2 self-start">
              {p.category}
            </Badge>
            <h3 className="font-display font-bold text-cocoa text-base group-hover:text-fur transition-colors">
              {p.title}
            </h3>
            <p className="text-xs text-tabaco mt-1 line-clamp-2">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
