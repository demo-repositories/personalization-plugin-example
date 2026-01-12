import { notFound } from "next/navigation";
import { PageBuilder } from "@/components/pagebuilder";
import { Tracking } from "@/components/tracking";
import { getDeferredTrackingData } from "@/lib/experiments";
import { sanityFetch } from "@/lib/sanity/live";
import { queryHomePageData } from "@/lib/sanity/query";
import { getMetaData } from "@/lib/seo";

const EXPERIMENT_VARIANTS = ["control", "variant", "variant-a", "variant-b", "variant-c"];

async function fetchHomePageData() {
  return await sanityFetch({
    query: queryHomePageData,
  });
}

export async function generateMetadata() {
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
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;
  const trackingData = await getDeferredTrackingData();

  // Validate variant
  if (!EXPERIMENT_VARIANTS.includes(variant)) {
    return notFound();
  }

  const { data: homePageData } = await fetchHomePageData();

  if (!homePageData) {
    return notFound();
  }

  const { _id, _type, pageBuilder } = homePageData ?? {};

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
