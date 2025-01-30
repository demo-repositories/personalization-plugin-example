import { AddIcon, ArrowLeftIcon, HomeIcon } from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  Text,
  Tooltip,
  type TooltipProps,
} from "@sanity/ui";
import type { PropsWithChildren } from "react";
import { useIntentLink } from "sanity/router";

import { getTemplateName, pathnameToTitle } from "../../utils/helper";
import type { HeaderProps } from "../../utils/types";
import { useNavigator } from "./navigator-context";

type TooltipWrapperProps = PropsWithChildren & {
  tooltipText: string;
  tooltipProps?: Omit<TooltipProps, "content" | "children">;
};

function TooltipWrapper({
  children,
  tooltipText,
  tooltipProps,
}: TooltipWrapperProps) {
  return (
    <Tooltip
      content={
        <Box padding={2}>
          <Text muted size={1}>
            {tooltipText}
          </Text>
        </Box>
      }
      fallbackPlacements={["right", "left"]}
      placement="top"
      portal
      {...tooltipProps}
    >
      {children as JSX.Element}
    </Tooltip>
  );
}

export function Header({ pages, domRef, children }: HeaderProps) {
  const { currentDir, setCurrentDir, items } = useNavigator();
  const types = Array.from(
    new Set(items.map((item) => item._type)),
  ) as string[];
  const handleBack = () => {
    if (!currentDir) return;

    const parentDir = currentDir.split("/").slice(0, -1).join("/");
    setCurrentDir(parentDir);
  };

  const handleBackToRoot = () => setCurrentDir("");

  const renderNavigationButtons = () => (
    <Card>
      <Flex align="center" gap={2} width="100%">
        <Button
          mode="bleed"
          icon={<ArrowLeftIcon viewBox="2.5 6 20 20" height={18} width={24} />}
          padding={2}
          disabled={!currentDir}
          onClick={handleBack}
        />
        <Text size={1} weight="semibold">
          {resolveTitle(currentDir)}
        </Text>
      </Flex>
    </Card>
  );

  const renderActionButtons = () => (
    <Flex align="center" gap={1}>
      {currentDir && (
        <TooltipWrapper tooltipText="Back to root">
          <Button
            fontSize={0}
            mode="bleed"
            tone="positive"
            icon={<HomeIcon />}
            onClick={handleBackToRoot}
          />
        </TooltipWrapper>
      )}
      {pages && pages.length > 0 && (
        <MenuButton
          id="create-new-page"
          button={<Button fontSize={0} mode="bleed" icon={<AddIcon />} />}
          popover={{ portal: true }}
          menu={
            <Menu>
              {pages
                .filter(({ type }) => types.includes(type))
                .map(({ type, title }) => (
                  <MenuItem
                    key={type}
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    {...useIntentLink({
                      intent: "create",
                      params: [
                        {
                          type,
                          template: getTemplateName(type),
                        },
                        {
                          slug: `${currentDir}/`,
                        },
                      ],
                    })}
                    as="a"
                  >
                    <Text size={1}>
                      {" "}
                      Create {currentDir} {title}
                    </Text>
                  </MenuItem>
                ))}
            </Menu>
          }
        />
      )}
    </Flex>
  );

  return (
    <Card
      ref={domRef}
      borderBottom
      paddingX={1}
      paddingTop={3}
      paddingBottom={1}
      flex={1}
    >
      <Flex paddingX={1} paddingBottom={3} flex={1} justify="space-between">
        {renderNavigationButtons()}
        {renderActionButtons()}
      </Flex>
      <Flex align="center" wrap="wrap">
        {children}
      </Flex>
    </Card>
  );
}

function resolveTitle(currentDir: string): string {
  if (!currentDir) {
    return "Pages";
  }
  return pathnameToTitle(currentDir);
}
