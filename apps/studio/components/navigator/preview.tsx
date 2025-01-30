import { isImageSource, type SanityImageSource } from "@sanity/asset-utils";
import { DocumentIcon } from "@sanity/icons";
import imageUrlBuilder from "@sanity/image-url";
import type React from "react";
import {
  type ComponentType,
  createElement,
  isValidElement,
  useCallback,
  useMemo,
} from "react";
import { isValidElementType } from "react-is";
import { useObservable } from "react-rx";
import {
  getPreviewStateObservable,
  getPreviewValueWithFallback,
  type ImageUrlFitMode,
  isString,
  type SanityDefaultPreviewProps,
  type SchemaType,
  useClient,
  useDocumentPreviewStore,
  useSchema,
} from "sanity";

import type { FolderTreeNode, TreeNode } from "../../utils/types";

export const PreviewElement = (props: {
  item: Exclude<TreeNode, FolderTreeNode>; // Only accepts a PageTreeNode, FolderTreeNode is forbidden
  type: "media" | "title" | "subtitle";
  fallback?: React.ReactNode | string;
}): React.ReactElement | null => {
  const schema = useSchema();
  const { _type } = props.item;
  const schemaType = schema.get(_type);

  if (!schemaType) {
    return null;
  }

  return <Preview schemaType={schemaType} {...props} />;
};

PreviewElement.displayName = "PreviewElement";

const Preview = ({
  schemaType,
  item,
  type,
  fallback,
}: {
  schemaType: SchemaType;
  item: Exclude<TreeNode, FolderTreeNode>;
  type: "media" | "title" | "subtitle";
  fallback?: React.ReactNode | string;
}) => {
  const documentPreviewStore = useDocumentPreviewStore();
  const observable = useMemo(
    () =>
      getPreviewStateObservable(documentPreviewStore, schemaType, item._id, ""),
    [item._id, documentPreviewStore, schemaType],
  );
  const previewState = useObservable(observable);

  const draft = previewState?.draft;
  const published = previewState?.published;
  const isLoading = previewState?.isLoading;

  const previewValues = getPreviewValueWithFallback({
    draft,
    published,
    value: { ...item },
  });

  const showPreview =
    schemaType?.icon ||
    (typeof schemaType?.preview?.prepare === "function" && !isLoading);

  if (type === "media") {
    return showPreview ? (
      <PreviewMedia
        {...previewValues}
        isPlaceholder={isLoading ?? true}
        layout="default"
        icon={schemaType?.icon}
      />
    ) : (
      <>{!isLoading ? fallback : null}</>
    );
  }

  if (type === "title") {
    return showPreview && previewValues?.title ? (
      <>{previewValues?.title}</>
    ) : (
      <>{fallback}</>
    );
  }

  if (type === "subtitle") {
    return showPreview && previewValues?.subtitle ? (
      <>{previewValues?.subtitle}</>
    ) : (
      <>{fallback}</>
    );
  }

  return null;
};

Preview.displayName = "Preview";

export const PreviewMedia = (
  props: SanityDefaultPreviewProps,
): React.ReactElement => {
  const { icon, media: mediaProp, imageUrl, title } = props;

  const client = useClient({
    apiVersion: "2024-03-12",
  });
  const imageBuilder = useMemo(() => imageUrlBuilder(client), [client]);

  // NOTE: This function exists because the previews provides options
  // for the rendering of the media (dimensions)
  const renderMedia = useCallback(
    (options: {
      dimensions: {
        width?: number;
        height?: number;
        fit: ImageUrlFitMode;
        dpr?: number;
      };
    }) => {
      const dimensions = options.dimensions
        ? options.dimensions
        : {
            width: 30,
            height: 30,
            fit: "max" as ImageUrlFitMode,
            dpr: 1,
          };

      // Handle sanity image
      return (
        <img
          alt={isString(title) ? title : undefined}
          referrerPolicy="strict-origin-when-cross-origin"
          src={
            imageBuilder
              .image(
                mediaProp as SanityImageSource /*will only enter this code path if it's compatible*/,
              )
              .width(dimensions?.width || 100)
              .height(dimensions.height || 100)
              .fit(dimensions.fit)
              .dpr(dimensions.dpr || 1)
              .url() || ""
          }
        />
      );
    },
    [imageBuilder, mediaProp, title],
  );

  const renderIcon = useCallback(() => {
    return createElement(icon || DocumentIcon);
  }, [icon]);

  const media = useMemo(() => {
    if (icon === false) {
      // Explicitly disabled
      return false;
    }

    if (isValidElementType(mediaProp)) {
      return mediaProp;
    }

    if (isValidElement(mediaProp)) {
      return mediaProp;
    }

    if (isImageSource(mediaProp)) {
      return renderMedia;
    }

    // Handle image urls
    if (isString(imageUrl)) {
      return (
        <img
          src={imageUrl}
          alt={isString(title) ? title : undefined}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      );
    }

    // Render fallback icon
    return renderIcon;
  }, [icon, imageUrl, mediaProp, renderIcon, renderMedia, title]);

  if (typeof media === "number" || typeof media === "string") {
    return <>{media}</>;
  }

  const Media = media as ComponentType;

  return <Media />;
};

// PreviewMedia.displayName = "PreviewMedia";

// export { PreviewElement };
