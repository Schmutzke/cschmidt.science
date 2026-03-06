import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      LinkedIn: "https://www.linkedin.com/in/librarianshipahoi/",
      Mastodon: "https://openbiblio.social/@Dieter_Boolean",
      ORCiD: "https://orcid.org/0000-0001-9116-223X",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({
      title: "Pages",
      sortFn: (a, b) => {
        const order: Record<string, number> = {
          "My Story": 1,
          "Curriculum Vitae": 2,
          "Publications": 3,
          "Teaching": 4,
          "Mentorship": 5,
          "Projects & Service": 6,
          "Contact": 7,
        }
        const orderA = order[a.displayName] ?? 99
        const orderB = order[b.displayName] ?? 99
        return orderA - orderB
      },
    }),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({
      title: "Pages",
      sortFn: (a, b) => {
        const order: Record<string, number> = {
          "My Story": 1,
          "Curriculum Vitae": 2,
          "Publications": 3,
          "Teaching": 4,
          "Mentorship": 5,
          "Projects & Service": 6,
          "Contact": 7,
        }
        const orderA = order[a.displayName] ?? 99
        const orderB = order[b.displayName] ?? 99
        return orderA - orderB
      },
    }),
  ],
  right: [],
}
