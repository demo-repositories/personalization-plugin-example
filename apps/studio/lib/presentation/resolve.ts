import { defineDocuments, defineLocations } from "sanity/presentation";

export const locations = {
  page: defineLocations({
    select: { title: "title", slug: "slug.current" },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || "Untitled",
          href: doc?.slug ? `/${doc.slug.replace(/^\//, "")}` : "/",
        },
      ],
    }),
  }),
  blog: defineLocations({
    select: { title: "title", slug: "slug.current" },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || "Untitled",
          href: doc?.slug ? doc.slug : "/blog",
        },
        { title: "Blog", href: "/blog" },
      ],
    }),
  }),
  blogIndex: defineLocations({
    select: { title: "title" },
    resolve: () => ({
      locations: [{ title: "Blog", href: "/blog" }],
    }),
  }),
  homePage: defineLocations({
    select: { title: "title" },
    resolve: () => ({
      locations: [{ title: "Home", href: "/" }],
    }),
  }),
};

export const mainDocuments = defineDocuments([
  { route: "/", type: "homePage" },
  { route: "/home/:variant", type: "homePage" },
  {
    route: "/blog",
    type: "blogIndex",
  },
  {
    route: "/:slug+",
    resolve: (ctx) => {
      const slugParam = ctx.params.slug;
      const slug =
        Array.isArray(slugParam) ? slugParam.join("/") : slugParam || "";
      return {
        filter: `_type == "page" && slug.current == $slug`,
        params: { slug: `/${slug}` },
      };
    },
  },
  {
    route: "/blog/:slug+",
    resolve: (ctx) => {
      const slugParam = ctx.params.slug;
      // First segment is the blog slug; second may be experiment variant
      const blogSlug =
        Array.isArray(slugParam) ? slugParam[0] : slugParam || "";
      return {
        filter: `_type == "blog" && slug.current == $slug`,
        params: { slug: `/blog/${blogSlug}` },
      };
    },
  },
]);
