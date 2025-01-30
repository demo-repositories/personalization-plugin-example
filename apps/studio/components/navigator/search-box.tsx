import { SearchIcon } from "@sanity/icons";
import { Box, Card, Flex, TextInput, useGlobalKeyDown } from "@sanity/ui";
import { useCallback, useRef } from "react";

import { useNavigator } from "./navigator-context";

interface SearchBoxProps {
  domRef?: React.RefObject<HTMLDivElement>;
}

export function SearchBox({ domRef }: SearchBoxProps): JSX.Element {
  const { searchTerm, handleSearch } = useNavigator();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleGlobalKeyDown = useCallback((event: KeyboardEvent): void => {
    const isSearchHotkey =
      event.key.toLowerCase() === "f" &&
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey;

    if (isSearchHotkey) {
      event.preventDefault();
      inputRef.current?.focus();
    }
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      handleSearch(event.currentTarget.value);
    },
    [handleSearch],
  );

  useGlobalKeyDown(handleGlobalKeyDown);

  return (
    <Box paddingBottom={1} paddingX={1} flex={1} ref={domRef}>
      <Flex flex={1}>
        <Card as="div" tone="transparent" flex={1}>
          <TextInput
            ref={inputRef}
            aria-label="Pages navigator input"
            onChange={handleInputChange}
            value={searchTerm}
            placeholder="Search pages and folders"
            border={false}
            fontSize={1}
            icon={SearchIcon}
          />
        </Card>
      </Flex>
    </Box>
  );
}
