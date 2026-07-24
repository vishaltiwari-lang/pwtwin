import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage, getAllPages } from "@/lib/content";
import Companion from "@/components/Companion";

export function generateStaticParams() {
  return getAllPages().map((p) => ({ pageId: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pageId: string }>;
}): Promise<Metadata> {
  const { pageId } = await params;
  const page = getPage(pageId);
  if (!page) return { title: "Page not found — PW Twin" };
  return {
    title: `${page.title} — PW Twin`,
    description: `${page.subject}: ${page.concept}`,
  };
}

export default async function CompanionPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const page = getPage(pageId);
  if (!page) notFound();
  return <Companion page={page} />;
}
