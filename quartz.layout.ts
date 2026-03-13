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
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
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
          "About Me": 1,
          "My Work": 2,
          "Education & Positions": 3,
          "Publications": 4,
          "Presentations": 5,
          "Blog Posts & Public Writing": 6,
          "Teaching": 7,
          "Mentorship": 8,
          "Service & Memberships": 9,
          "Contact Me": 10,
        }
        const orderA = order[a.displayName] ?? 99
        const orderB = order[b.displayName] ?? 99
        return orderA - orderB
      },
    }),
  ],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
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
          "About Me": 1,
          "My Work": 2,
          "Education & Positions": 3,
          "Publications": 4,
          "Presentations": 5,
          "Blog Posts & Public Writing": 6,
          "Teaching": 7,
          "Mentorship": 8,
          "Service & Memberships": 9,
          "Contact Me": 10,
        }
        const orderA = order[a.displayName] ?? 99
        const orderB = order[b.displayName] ?? 99
        return orderA - orderB
      },
    }),
  ],
  right: [],
}
