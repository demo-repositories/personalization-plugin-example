import {
  EditIcon,
  EyeOpenIcon,
  FolderIcon,
  WarningOutlineIcon,
} from "@sanity/icons";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import type { FocusEvent, FormEvent, MouseEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  type ObjectFieldProps,
  set,
  type SlugValue,
  unset,
  useFormValue,
  useValidationStatus,
} from "sanity";
import {
  usePresentationNavigate,
  usePresentationParams,
} from "sanity/presentation";
import slugify from "slugify";
import { styled } from "styled-components";

import { getDocumentPath, stringToPathname } from "../utils/helper";
import type { DocumentWithLocale } from "../utils/types";

const UnlockButton = styled(Button)`
  position: static !important;
  cursor: pointer;
  > span:nth-of-type(2) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
`;

const FolderText = styled(Text)`
  span {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
`;

interface PreviewButtonProps {
  localizedPathname: string;
}

export function PathnameFieldComponent(props: ObjectFieldProps<SlugValue>) {
  const document = useFormValue([]) as DocumentWithLocale;
  const validation = useValidationStatus(
    document?._id.replace(/^drafts\./, ""),
    document?._type,
  );
  const {
    inputProps: { onChange, value, readOnly },
    title,
    description,
  } = props;

  const segments = value?.current?.split("/").slice(0);
  const folder = segments?.slice(0, -1).join("/");
  const slug = segments?.slice(-1)[0] || "";
  const [folderLocked, setFolderLocked] = useState(!!folder);

  const fullPathInputRef = useRef<HTMLInputElement>(null);
  const pathSegmentInputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (value?: string) => {
      const finalValue = value
        ? stringToPathname(value, { allowTrailingSlash: true })
        : undefined;
      onChange(
        typeof value === "string"
          ? set({
              current: finalValue,
              _type: "slug",
            })
          : unset(),
      );
    },
    [onChange],
  );

  const updateFinalSegment = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      const segment = slugify(e.currentTarget.value, {
        lower: true,
        remove: /[^a-zA-Z0-9 ]/g,
      });
      const finalValue = [folder, segment]
        .filter((part): part is string => typeof part === "string")
        .join("/");
      handleChange(finalValue);
    },
    [folder, handleChange],
  );

  const updateFullPath = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      handleChange(e.currentTarget.value);
    },
    [handleChange],
  );

  const unlockFolder = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFolderLocked(false);
    requestAnimationFrame(() => {
      fullPathInputRef.current?.focus();
    });
  }, []);

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setFolderLocked(!!folder);
    },
    [folder],
  );

  const localizedPathname = getDocumentPath({
    ...document,
    slug: value?.current,
  });

  const pathInput = useMemo(() => {
    if (folderLocked && folder) {
      return (
        <Stack space={2}>
          <Flex gap={1} align="center">
            <Card
              paddingLeft={2}
              paddingRight={1}
              paddingY={1}
              border
              radius={1}
              tone="transparent"
              style={{ position: "relative" }}
            >
              <Flex gap={2} align="center">
                <Text muted>
                  <FolderIcon />
                </Text>
                <FolderText muted>{folder}</FolderText>
                <UnlockButton
                  icon={EditIcon}
                  onClick={unlockFolder}
                  title="Edit path's folder"
                  mode="bleed"
                  tone="primary"
                  padding={2}
                  fontSize={1}
                  disabled={readOnly}
                >
                  <span />
                </UnlockButton>
              </Flex>
            </Card>
            <Text muted size={2}>
              /
            </Text>
            <Box flex={1}>
              <TextInput
                value={slug}
                onChange={updateFinalSegment}
                ref={pathSegmentInputRef}
                onBlur={handleBlur}
                disabled={readOnly}
              />
            </Box>
          </Flex>
          <PreviewButton localizedPathname={localizedPathname || ""} />
        </Stack>
      );
    }

    return (
      <Stack space={2}>
        <Box>
          <TextInput
            value={value?.current || ""}
            onChange={updateFullPath}
            ref={fullPathInputRef}
            onBlur={handleBlur}
            disabled={readOnly}
            style={{ width: "100%" }}
          />
        </Box>
        <PreviewButton localizedPathname={localizedPathname || ""} />
      </Stack>
    );
  }, [
    folderLocked,
    folder,
    value,
    updateFullPath,
    handleBlur,
    readOnly,
    localizedPathname,
    unlockFolder,
    slug,
    updateFinalSegment,
  ]);

  return (
    <Stack space={3}>
      <Stack space={2} flex={1}>
        <Text size={1} weight="semibold">
          {title}
        </Text>
        {description && <Text size={1}>{description}</Text>}
      </Stack>

      {typeof value?.current === "string" && (
        <Text muted>
          {window.location.origin}
          {localizedPathname}
        </Text>
      )}

      {pathInput}
      {validation.validation.length > 0 ? (
        <Badge
          tone="critical"
          padding={4}
          style={{
            borderRadius: "var(--card-radius)",
          }}
        >
          <Flex gap={4} align="center">
            <WarningOutlineIcon />
            <Text size={1} color="red">
              {validation.validation[0].message}
            </Text>
          </Flex>
        </Badge>
      ) : null}
    </Stack>
  );
}

function PreviewButton({ localizedPathname }: PreviewButtonProps) {
  const navigate = useSafeNavigate();
  const preview = useSafePreview();

  const isDisabled =
    !navigate ||
    typeof localizedPathname !== "string" ||
    preview === localizedPathname;

  const handleClick = useCallback(() => {
    if (navigate) {
      navigate(localizedPathname);
    }
  }, [navigate, localizedPathname]);

  return (
    <Button
      text="Preview"
      fontSize={1}
      height="100%"
      mode="default"
      tone="default"
      icon={EyeOpenIcon}
      disabled={isDisabled}
      title="Preview page"
      onClick={isDisabled ? undefined : handleClick}
    />
  );
}

function useSafeNavigate() {
  try {
    return usePresentationNavigate();
  } catch {
    return null;
  }
}

function useSafePreview() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { preview } = usePresentationParams();
    return preview;
  } catch {
    return null;
  }
}
