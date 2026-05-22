import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BLOG_POSTS } from "@/lib/blog/posts";
import { formatDateBR } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guias práticos sobre consulta de CPF, CNPJ, veicular, score de crédito, locação e LGPD. Por trás de cada decisão importante, uma capivara puxada.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog · Capivara",
    description:
      "Guias práticos sobre consulta de CPF, CNPJ, veicular e proteção de dados.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <div className="bg-paper">
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="outline" className="mb-3 font-mono">
            Blog
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cocoa">
            Antes de decidir, leia uma capivara.
          </h1>
          <p className="mt-4 text-tabaco text-lg leading-relaxed">
            Guias práticos sobre consultas, score, LGPD e tudo que toca a
            decisão de fazer negócio com alguém novo.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-lg border border-line bg-card overflow-hidden transition-all duration-200 ease-[var(--ease-cap)] hover:shadow-[var(--shadow-pop)] hover:-translate-y-1 hover:border-fur/60"
              >
                {/* Cover com gradiente + emoji */}
                <div
                  className="h-40 flex items-center justify-center text-6xl bg-gradient-to-br from-saffron/20 via-cream to-fur/15"
                  aria-hidden
                >
                  {post.ogImageEmoji ?? "🐾"}
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-3 text-xs font-mono text-tabaco mb-3">
                    <Badge variant="outline">{post.category}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {post.readingMinutes} min
                    </span>
                  </div>

                  <h2 className="font-display text-xl font-bold text-cocoa leading-tight mb-2 group-hover:text-fur transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-sm text-tabaco leading-relaxed mb-4 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto pt-4 border-t border-line/60 flex items-center justify-between text-xs">
                    <span className="font-mono text-tabaco">
                      {formatDateBR(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-cocoa group-hover:text-fur transition-colors">
                      Ler artigo
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
