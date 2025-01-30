import {
  ChevronRightIcon,
  DocumentIcon,
  EditIcon,
  FolderIcon,
  PublishIcon,
} from "@sanity/icons";
import { Badge, Box, Flex, Stack, Text, Tooltip } from "@sanity/ui";
import { useCallback, useMemo, useState } from "react";
import { useColorSchemeValue } from "sanity";
import {
  usePresentationNavigate,
  usePresentationParams,
} from "sanity/presentation";
import styled from "styled-components";

import { formatPath } from "../../utils/helper";
import type { ListItemProps, PageTreeNode } from "../../utils/types";
import { useNavigatorContext } from "./navigator-context";
import { PreviewElement } from "./preview";

interface StyledComponentProps {
  isPreviewed?: boolean;
  currentScheme?: string;
  muted?: boolean;
  variant?: "publish" | "edit";
}

const NavigatorList = styled(Box)`
  border: 2px solid transparent;
  padding: 2px;
  border-radius: 8px;
  height: 88vh;
  overflow-y: auto;
  margin: 0;
  display: flex;
  gap: 0.25rem;
  flex-direction: column;
`;

const NavigatorItem = styled(Stack)<StyledComponentProps>`
  --bg-selected: ${({ currentScheme }) =>
    currentScheme === "light" ? "#D5E2FB" : "#26344B"};
  --fg-selected: ${({ currentScheme }) =>
    currentScheme === "light" ? "#20386B" : "#B2CBF9"};
  --hover-bg: ${({ currentScheme }) =>
    currentScheme === "light" ? "#F2F3F5" : "#2A2C30"};

  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ isPreviewed }) =>
    isPreviewed ? "var(--bg-selected)" : "var(--card-bg-color)"};
  color: ${({ isPreviewed }) =>
    isPreviewed ? "var(--fg-selected)" : "inherit"};
  transition: background-color 0.2s ease-in-out;
  border: 2px solid transparent;
  min-height: 33px;

  &:focus-visible {
    outline: none;
    background-color: var(--hover-bg);
  }

  &:hover {
    background-color: var(--hover-bg);
  }
`;

const ContentContainer = styled(Stack)`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
`;

const StyledText = styled(Text)<StyledComponentProps>`
  --fg-selected: ${({ currentScheme }) =>
    currentScheme === "light" ? "#20386B" : "#B2CBF9"};
  color: ${({ isPreviewed }) => isPreviewed && "var(--fg-selected)"};
`;

const StatusIcon = styled(Text)<StyledComponentProps>`
  --published: ${({ currentScheme }) =>
    currentScheme === "light" ? "#3e7147" : "#8fd89f"};
  --edited: ${({ currentScheme }) =>
    currentScheme === "light" ? "#716327" : "#F5D456"};

  padding: 0 8px;
  opacity: ${({ muted }) => (muted ? 0.3 : 1)};
  color: ${({ muted, variant }) =>
    muted
      ? "inherit"
      : `var(--${variant === "publish" ? "published" : "edited"})`};
`;

function NavigatorListItem({ item, active, idx, setActive }: ListItemProps) {
  const { setCurrentDir } = useNavigatorContext();
  const listItemId = `item-${idx}`;
  const { preview } = usePresentationParams();
  const navigate = usePresentationNavigate();
  const scheme = useColorSchemeValue();

  const path = useMemo(() => formatPath(item.slug ?? ""), [item.slug]);
  const previewed = preview === path;
  const isFolder = item._type === "folder";
  const childrenCount = isFolder ? Object.keys(item.children).length : 0;
  const isUnpublished =
    item._id.startsWith("drafts.") && item?._updatedAt === item?._createdAt;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (isFolder) {
        setCurrentDir(item.slug || "");
      } else {
        navigate(path, {
          type: item._type,
          id: item._id,
        });
      }
    },
    [isFolder, item, navigate, path, setCurrentDir],
  );

  const renderIcon = useCallback(
    () => (
      <Flex
        align="center"
        justify="center"
        style={{
          position: "relative",
          width: 33,
          height: 33,
          flexShrink: 0,
        }}
      >
        {isFolder ? (
          <FolderIcon style={{ width: 20, height: 20 }} />
        ) : (
          <DocumentIcon style={{ width: 20, height: 20 }} />
        )}
        <div
          style={{
            boxShadow: "inset 0 0 0 1px var(--card-fg-color)",
            opacity: 0.1,
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        />
      </Flex>
    ),
    [isFolder],
  );

  const renderContent = useCallback(
    () => (
      <ContentContainer>
        <StyledText
          size={1}
          textOverflow="ellipsis"
          isPreviewed={previewed}
          currentScheme={scheme}
          weight="medium"
        >
          {!isFolder ? (
            <PreviewElement fallback={item.title} type="title" item={item} />
          ) : (
            item.title
          )}
        </StyledText>
        <StyledText
          size={1}
          muted
          textOverflow="ellipsis"
          isPreviewed={previewed}
          currentScheme={scheme}
        >
          {!isFolder ? (
            <PreviewElement fallback={path} type="subtitle" item={item} />
          ) : (
            path
          )}
        </StyledText>
      </ContentContainer>
    ),
    [isFolder, item, path, previewed, scheme],
  );

  return (
    <NavigatorItem
      as="li"
      role="option"
      padding={3}
      onClick={handleClick}
      aria-label={item.title}
      aria-selected={listItemId === active}
      currentScheme={scheme}
      isPreviewed={previewed}
      id={listItemId}
      tabIndex={0}
    >
      <Flex gap={2} align="center" flex={1}>
        {renderIcon()}
        {renderContent()}
      </Flex>

      {isFolder ? (
        <Flex gap={2}>
          {childrenCount > 0 && (
            <Badge mode="outline" fontSize={0}>
              {childrenCount}
            </Badge>
          )}
          <Tooltip
            content={
              <Box padding={2}>
                <Text size={1}>Open folder</Text>
              </Box>
            }
            fallbackPlacements={["right", "left"]}
            placement="top"
            portal
          >
            <ChevronRightIcon />
          </Tooltip>
        </Flex>
      ) : (
        <Flex gap={2}>
          <StatusIcon
            size={1}
            muted={isUnpublished}
            currentScheme={scheme}
            weight="bold"
            variant="publish"
          >
            <Tooltip
              content={
                <Box padding={2}>
                  <Text size={1}>
                    {isUnpublished ? "Not published yet" : "Published"}
                  </Text>
                </Box>
              }
              fallbackPlacements={["right", "left"]}
              placement="top"
              portal
            >
              <PublishIcon />
            </Tooltip>
          </StatusIcon>
          <StatusIcon
            size={1}
            muted={!(item as PageTreeNode).edited}
            currentScheme={scheme}
            weight="bold"
            variant="edit"
          >
            <Tooltip
              content={
                <Box padding={2}>
                  <Text size={1}>
                    {(item as PageTreeNode).edited
                      ? "Edited"
                      : "No unpublished edits"}
                  </Text>
                </Box>
              }
              fallbackPlacements={["right", "left"]}
              placement="top"
              portal
            >
              <EditIcon />
            </Tooltip>
          </StatusIcon>
        </Flex>
      )}
    </NavigatorItem>
  );
}

export function NavigatorListView() {
  const { items } = useNavigatorContext();
  const { preview } = usePresentationParams();

  const activeDescendantIndex = useMemo(
    () => items.findIndex((item) => item.slug === preview) ?? 0,
    [items, preview],
  );

  const [activeDescendant, setActiveDescendant] = useState(
    `item-${activeDescendantIndex}`,
  );

  return (
    <NavigatorList
      id="navigator-list"
      as="ul"
      role="listbox"
      aria-label="Pages and folders"
      aria-activedescendant={activeDescendant}
    >
      {items.map((item, idx) => (
        <NavigatorListItem
          key={item._id}
          idx={idx}
          item={item}
          active={activeDescendant}
          setActive={setActiveDescendant}
        />
      ))}
    </NavigatorList>
  );
}
