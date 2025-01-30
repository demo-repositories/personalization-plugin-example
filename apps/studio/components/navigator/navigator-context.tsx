// Import required React types and hooks
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

// Import utility functions and types
import { buildTree, findTreeByPath } from "../../utils/helper";
import type {
  NavigatorContextType,
  Page,
  ReducerAction,
  Tree,
} from "../../utils/types";

// URL parameter key for storing current directory
const CURRENT_DIR_PARAM = "page-dir";

// State interface for the navigator reducer
interface State {
  currentDir: string;
  searchTerm: string;
}

// Initial context value with empty defaults
const initialContextValue: NavigatorContextType = {
  rootTree: {},
  currentDir: "",
  setCurrentDir: () => undefined,
  searchTerm: "",
  handleSearch: () => undefined,
  items: [],
};

// Create context for navigator state management
const NavigatorContext =
  createContext<NavigatorContextType>(initialContextValue);

// Action types for the reducer
enum ActionType {
  SET_CURRENT_DIR = "SET_CURRENT_DIR",
  SET_SEARCH_TERM = "SET_SEARCH_TERM",
}

// Reducer function to handle state updates
function reducer(state: State, action: ReducerAction): State {
  switch (action.type) {
    case ActionType.SET_CURRENT_DIR:
      return { ...state, currentDir: action.payload as string };
    case ActionType.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload as string };
    default:
      return state;
  }
}

// Props interface for NavigatorProvider component
interface NavigatorProviderProps {
  data: Page[];
  children: React.ReactNode;
}

// Main provider component that manages navigation state
export function NavigatorProvider({ data, children }: NavigatorProviderProps) {
  // Initialize state with URL params
  const initialState: State = {
    currentDir:
      new URLSearchParams(window.location.search).get(CURRENT_DIR_PARAM) ?? "",
    searchTerm: "",
  };

  // Set up reducer for state management
  const [state, dispatch] = useReducer(reducer, initialState);

  // Build and filter tree based on search term
  const rootTree = useMemo(() => {
    const tree = buildTree(data);
    return searchTree({
      tree,
      searchTerm: state.searchTerm,
    });
  }, [data, state.searchTerm]);

  // Handler for search term updates
  const handleSearch = useCallback((input: string) => {
    dispatch({ type: ActionType.SET_SEARCH_TERM, payload: input });
  }, []);

  // Handler for directory changes, updates URL params
  const setCurrentDir = useCallback((dir: string) => {
    dispatch({ type: ActionType.SET_CURRENT_DIR, payload: dir });
    const url = new URL(window.location.href);
    if (dir) {
      url.searchParams.set(CURRENT_DIR_PARAM, dir);
    } else {
      url.searchParams.delete(CURRENT_DIR_PARAM);
    }
    window.history.pushState({}, "", url);
  }, []);

  // Get current tree based on selected directory
  const targetTree = useMemo(
    () => findTreeByPath(rootTree, state.currentDir),
    [rootTree, state.currentDir],
  );

  const currentTree = targetTree || rootTree;

  // Sort items in current directory
  const items = useMemo(
    () =>
      Object.values(currentTree).sort((a, b) =>
        a.slug && b.slug ? a.slug.localeCompare(b.slug) : 0,
      ),
    [currentTree],
  );

  // Reset directory if current path becomes invalid
  useEffect(() => {
    if (!targetTree && state.currentDir) {
      setCurrentDir("");
    }
  }, [targetTree, state.currentDir, setCurrentDir]);

  // Prepare context value with all required data
  const contextValue = useMemo(
    () => ({
      items,
      rootTree,
      ...state,
      setCurrentDir,
      handleSearch,
    }),
    [items, rootTree, state, setCurrentDir, handleSearch],
  );

  return (
    <NavigatorContext.Provider value={contextValue}>
      {children}
    </NavigatorContext.Provider>
  );
}

// Hook to access navigator context
export const useNavigator = () => useContext(NavigatorContext);

// Interface for search tree function parameters
interface SearchTreeParams {
  tree: Tree;
  searchTerm: string;
}

// Function to filter tree based on search term
function searchTree({ tree: root, searchTerm }: SearchTreeParams): Tree {
  const query = searchTerm.toLowerCase().trim();
  if (!query) return root;

  const searchResults: Tree = {};
  const searchInTree = (tree: Tree): void => {
    for (const [key, item] of Object.entries(tree)) {
      // Check if item title or slug matches search query
      const matchesSearch = [
        item.title.toLowerCase(),
        item.slug?.toLowerCase() ?? "",
      ].some(
        (text) =>
          text.startsWith(query) ||
          text.split(/[\s/]/).some((word) => word.startsWith(query)),
      );

      if (matchesSearch) {
        searchResults[key] = item;
      }

      // Recursively search through child items
      if (item.children) {
        searchInTree(item.children as Tree);
      }
    }
  };

  searchInTree(root);
  return searchResults;
}

export const useNavigatorContext = () => useContext(NavigatorContext);
