import { notFound } from "next/navigation";

import { PageBuilder } from "@/components/pagebuilder";
import { Tracking } from "@/components/tracking";
import { getDeferredTrackingData } from "@/lib/experiments";
import { sanityFetch } from "@/lib/sanity/live";
import { queryHomePageData, queryPageById } from "@/lib/sanity/query";
import { getMetaData } from "@/lib/seo";

const EXPERIMENT_VARIANTS = [
  "control",
  "variant-a",
  "variant-b",
  "variant-c",
];

async function fetchHomePageData() {
  return await sanityFetch({
    query: queryHomePageData,
  });
}

async function fetchPageById(id: string) {
  return await sanityFetch({
    query: queryPageById,
    params: { id },
  });
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ pageId?: string }>;
}) {
  const { pageId } = await searchParams;

  // If a specific page ID is provided (from experiment), fetch that page
  if (pageId) {
    const pageData = await fetchPageById(pageId);
    if (pageData.data) {
      return getMetaData(pageData.data);
    }
  }

  // Fall back to default homepage
  const homePageData = await fetchHomePageData();
  if (!homePageData.data) {
    return getMetaData({});
  }
  return getMetaData(homePageData.data);
}

export async function generateStaticParams() {
  // Generate static pages for all variants
  return EXPERIMENT_VARIANTS.map((variant) => ({ variant }));
}

export default async function HomeVariantPage({
  params,
  searchParams,
}: {
  params: Promise<{ variant: string }>;
  searchParams: Promise<{ pageId?: string }>;
}) {
  const { variant } = await params;
  const { pageId } = await searchParams;
  const trackingData = await getDeferredTrackingData();

  // Validate variant
  if (!EXPERIMENT_VARIANTS.includes(variant)) {
    return notFound();
  }

  // If a specific page ID is provided (from experiment), fetch that page
  let pageData;
  if (pageId) {
    const result = await fetchPageById(pageId);
    pageData = result.data;
  } else {
    // Fall back to default homepage
    const result = await fetchHomePageData();
    pageData = result.data;
  }

  if (!pageData) {
    return notFound();
  }

  const { _id, _type, pageBuilder } = pageData;

  return (
    <>
      <PageBuilder pageBuilder={pageBuilder ?? []} id={_id} type={_type} />
      {trackingData && (
        <Tracking
          userGroup={trackingData.userGroup}
          userId={trackingData.userId}
        />
      )}
    </>
  );
}
