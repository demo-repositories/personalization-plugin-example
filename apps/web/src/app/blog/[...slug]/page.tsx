import { notFound } from "next/navigation";
import { Tracking } from "@/components/tracking";
import { RichText } from "@/components/richtext";
import { SanityImage } from "@/components/sanity-image";
import { TableOfContent } from "@/components/table-of-content";
import { getDeferredTrackingData } from "@/lib/experiments";
import { client } from "@/lib/sanity/client";
import { sanityFetch } from "@/lib/sanity/live";
import { queryBlogPaths, queryBlogSlugPageData } from "@/lib/sanity/query";
import { getMetaData } from "@/lib/seo";

const EXPERIMENT_VARIANTS = ["control", "variant-a"];

async function fetchBlogSlugPageData(blogSlug: string, variant: string) {
  const queryParams = {
    slug: `/blog/${blogSlug}`,
    experiment: "blog-title",
    variant: variant,
  };
  return await sanityFetch({
    query: queryBlogSlugPageData,
    params: queryParams,
  });
}

async function fetchBlogPaths() {
  const slugs = await client.fetch(queryBlogPaths);
  const paths: { slug: string }[] = [];
  for (const slug of slugs) {
    if (!slug) continue;
    const [, , path] = slug.split("/");
    if (path) paths.push({ slug: path });
  }
  return paths;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const [blogSlug, variant = "control"] = slug;
  if (!blogSlug) return getMetaData({});
  const { data } = await fetchBlogSlugPageData(blogSlug, variant);
  if (!data) return getMetaData({});
  return getMetaData(data);
}

export async function generateStaticParams() {
  const paths = await fetchBlogPaths();
  return paths.flatMap(({ slug }) =>
    EXPERIMENT_VARIANTS.map((variant) => ({ slug: [slug, variant] }))
  );
}

export default async function BlogSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const [blogSlug, variant = "control"] = slug;
  if (!blogSlug) return notFound();
  const trackingData = await getDeferredTrackingData();

  const { data } = await fetchBlogSlugPageData(blogSlug, variant);
  if (!data) return notFound();
  const { title, description, image, richText } = data ?? {};

  return (
    <div className="container my-16 mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <main>
          <header className="mb-8">
            <h1 className="mt-2 text-4xl font-bold tracking-tight">{title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          </header>
          {image && (
            <div className="mb-12">
              <SanityImage
                asset={image}
                alt={title}
                width={1600}
                loading="eager"
                priority
                height={900}
                className="rounded-lg h-auto w-full"
              />
            </div>
          )}
          <RichText richText={richText ?? []} />
        </main>

        <aside className="hidden lg:block">
          <div className="sticky top-4 rounded-lg ">
            <TableOfContent richText={richText} />
          </div>
        </aside>
      </div>
      {trackingData && (
        <Tracking
          userGroup={trackingData.userGroup}
          userId={trackingData.userId}
        />
      )}
    </div>
  );
}
