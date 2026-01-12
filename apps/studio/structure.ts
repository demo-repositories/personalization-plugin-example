import {
  BookIcon,
  CogIcon,
  DocumentIcon,
  DocumentTextIcon,
  HelpCircleIcon,
  HomeIcon,
  type IconSymbol,
  MenuIcon,
  BlockElementIcon,
  UserIcon,
} from "@sanity/icons";
import type {
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";

import type { SchemaType, SingletonType } from "./schemaTypes";
import { getTitleCase } from "./utils/helper";

type Base<T = SchemaType> = {
  id?: string;
  type: T;
  preview?: boolean;
  title?: string;
  icon?: IconSymbol;
};

type CreateSingleTon = {
  S: StructureBuilder;
} & Base<SingletonType>;

const createSingleTon = ({ S, type, title, icon }: CreateSingleTon) => {
  const newTitle = title ?? getTitleCase(type);
  return S.listItem()
    .title(newTitle)
    .icon(icon ?? DocumentIcon)
    .child(S.document().schemaType(type).documentId(type));
};

type CreateList = {
  S: StructureBuilder;
} & Base;

// This function creates a list item for a type. It takes a StructureBuilder instance (S),
// a type, an icon, and a title as parameters. It generates a title for the type if not provided,
// and uses a default icon if not provided. It then returns a list item with the generated or
// provided title and icon.

const createList = ({ S, type, icon, title, id }: CreateList) => {
  const newTitle = title ?? getTitleCase(type);
  return S.documentTypeListItem(type)
    .id(id ?? type)
    .title(newTitle)
    .icon(icon ?? DocumentIcon);
};

type CreateIndexList = {
  S: StructureBuilder;
  list: Base;
  index: Base<SingletonType>;
};

const createIndexList = ({ S, index, list }: CreateIndexList) => {
  const indexTitle = index.title ?? getTitleCase(index.type);
  const listTitle = list.title ?? getTitleCase(list.type);
  return S.listItem()
    .title(listTitle)
    .icon(index.icon ?? DocumentIcon)
    .child(
      S.list()
        .title(indexTitle)
        .items([
          S.listItem()
            .title(indexTitle)
            .icon(index.icon ?? DocumentIcon)
            .child(
              S.document()
                .views([S.view.form()])
                .schemaType(index.type)
                .documentId(index.type),
            ),
          S.documentTypeListItem(list.type)
            .title(`${listTitle}`)
            .icon(list.icon ?? DocumentIcon),
        ]),
    );
};

export const structure = (
  S: StructureBuilder,
  context: StructureResolverContext,
) => {
  return S.list()
    .title("Content")
    .items([
      createSingleTon({ S, type: "homePage", icon: HomeIcon }),
      S.divider(),
      createList({ S, type: "page", title: "Pages" }),
      createIndexList({
        S,
        index: { type: "blogIndex", icon: BookIcon },
        list: { type: "blog", title: "Blogs", icon: DocumentTextIcon },
      }),
      createList({
        S,
        type: "faq",
        title: "FAQs",
        icon: HelpCircleIcon,
      }),
      createList({ S, type: "author", title: "Authors", icon: UserIcon }),
      S.divider(),
      createSingleTon({
        S,
        type: "navbar",
        title: "Navbar",
        icon: MenuIcon,
      }),
      createSingleTon({
        S,
        type: "footer",
        title: "Footer",
        icon: BlockElementIcon,
      }),
      createSingleTon({
        S,
        type: "settings",
        title: "Global Settings",
        icon: CogIcon,
      }),
    ]);
};
