import { EarthGlobeIcon } from "@sanity/icons";
import { useToast } from "@sanity/ui";
import { useCallback } from "react";
import {
  definePlugin,
  type DocumentActionComponent,
  useGetFormValue,
} from "sanity";
import { useRouter } from "sanity/router";

interface PresentationUrlAction {
  documentId: string;
}

export const presentationUrl = definePlugin(() => {
  return {
    name: "presentationUrl",
    document: {
      unstable_fieldActions: (props: DocumentActionComponent[]) => {
        return [
          {
            name: "open-in-presentation",
            useAction: ({ documentId }: PresentationUrlAction) => {
              const getFormValue = useGetFormValue();
              const router = useRouter();
              const toast = useToast();

              const handlePresentationOpen = useCallback(() => {
                const slug = getFormValue(["slug", "current"]);

                if (typeof slug !== "string") {
                  toast.push({
                    title: "No slug found",
                    status: "error",
                    description: "Please ensure the document has a valid slug",
                  });
                  return;
                }

                const origin =
                  process.env.SANITY_STUDIO_PRESENTATION_URL ??
                  "http://localhost:3000";
                const path = slug.startsWith("/") ? slug : `/${slug}`;
                const previewUrl = `${origin.replace(/\/$/, "")}${path}`;

                router.navigateUrl({
                  path: `/presentation?preview=${encodeURIComponent(previewUrl)}`,
                });
              }, [getFormValue, toast, router]);

              return {
                type: "action" as const,
                icon: EarthGlobeIcon,
                hidden: documentId === "root",
                renderAsButton: true,
                onAction: handlePresentationOpen,
                title: "Open in Presentation",
              };
            },
          },
          ...props,
        ];
      },
    },
  };
});
