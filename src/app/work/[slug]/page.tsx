import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CASE_STUDIES } from "@/lib/content";
import { CaseStudyView } from "@/components/work/CaseStudyView";

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = CASE_STUDIES.find((c) => c.slug === slug);
  if (!study) return {};
  return {
    title: `${study.title} — ${study.tag}`,
    description: study.summary,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const idx = CASE_STUDIES.findIndex((c) => c.slug === slug);
  if (idx === -1) notFound();
  const study = CASE_STUDIES[idx];
  const nextStudy = CASE_STUDIES[(idx + 1) % CASE_STUDIES.length];

  return (
    <main id="main">
      <CaseStudyView study={study} next={{ slug: nextStudy.slug, title: nextStudy.title }} />
    </main>
  );
}
