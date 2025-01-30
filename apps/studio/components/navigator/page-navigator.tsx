import { useMemo } from "react";
import { useObservable } from "react-rx";
import { useDocumentStore } from "sanity";

import { Header } from "./header";
import { NavigatorListView } from "./list";
import { NavigatorProvider } from "./navigator-context";
import { SearchBox } from "./search-box";

export function createPagesNavigator() {
  return function PagesNavigator() {
    return <DefaultNavigator />;
  };
}

const pagesRouteQuery = /* groq */ `
*[defined(slug.current)] {
  _id,
  _rev,
  _originalId,
  _type,
  "slug": slug.current,
  _createdAt,
  _updatedAt,
}
`;

function DefaultNavigator() {
  const documentStore = useDocumentStore();
  const observable = useMemo(
    () =>
      documentStore.listenQuery(
        pagesRouteQuery,
        {},
        { perspective: "previewDrafts" },
      ),
    [documentStore],
  );
  const results = useObservable(observable, []);

  return (
    <NavigatorProvider data={results ?? []}>
      <Header
        pages={[
          { title: "Slug Page", type: "page" },
          { title: "Blog Page", type: "blog" },
        ]}
      >
        <SearchBox />
        <NavigatorListView />
      </Header>
    </NavigatorProvider>
  );
}
