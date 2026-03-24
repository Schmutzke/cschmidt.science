---
publish: true
title: Greater Victoria Modernist Building Inventory
description: A citizen science proof-of-concept for documenting mid-century modernist architecture in the Capital Regional District, using linked open data and community contributions.
---

The **Greater Victoria Modernist Building Inventory** is a proof-of-concept web application that invites citizens to document mid-century modernist buildings across the Capital Regional District.

> [**Launch the Inventory →**](/static/inventory/)

## How It Works

1. **Explore** a map of Greater Victoria centred on the downtown core
2. **Click** on a building or location to open the observation form
3. **Record** modernist architectural features you observe: flat roofs, ribbon windows, pilotis, extensive glazing, brise soleil, exposed concrete, and more — see the [full feature list with sources](Modernist%20Building%20Features%20—%20Sources)
4. **Submit** your observation to the growing community inventory

Each building record in the inventory connects to three external datasets following **linked open data** principles:

- **[Wikidata](https://www.wikidata.org/)** — structured knowledge about the building (architect, date, heritage status)
- **[OpenStreetMap](https://www.openstreetmap.org/)** — community-mapped building footprint and location
- **[BC Register of Historic Places](https://apps.nrs.gov.bc.ca/bcrhp/)** — the provincial heritage register with 1,300+ properties in Greater Victoria

## Why Mid-Century Modernism?

Victoria's mid-century modern buildings — roughly 1945 to 1975 ([Segger 2019](https://heritagebc.ca/wp-content/uploads/2020/01/Segger_Martin_ConservGuide_2019.pdf); [Algie & Ashby 2007](http://winnipegarchitecture.ca/wp-content/uploads/2012/10/CMC-Proceedings_Eng_a.pdf)) — are increasingly at risk. While landmark structures like the **BC Electric Company Building** (1515 Blanshard Street, 1955, Sharp & Thompson, Berwick, Pratt) are recognized on the [Canadian Register of Historic Places](https://www.historicplaces.ca/), hundreds of smaller modernist commercial and residential buildings remain unrecorded ([Segger 2012–2017](https://legacy.uvic.ca/gallery/victoriamodern/)). Many lack heritage protection — in Victoria, listing on the Heritage Register alone [does not restrict future actions by an owner](https://www.victoria.ca/building-business/permits-development-construction/heritage-conservation) — and face demolition or unsympathetic renovation.

Citizen science offers a way to build a comprehensive inventory faster than any single institution could manage alone ([Orr et al. 2022](https://www.tandfonline.com/doi/full/10.1080/13505033.2022.2147299); [Bai et al. 2022](https://dl.acm.org/doi/fullHtml/10.1145/3569092)). Locally, the [Hallmark Heritage Society](https://hallmarkheritagesociety.ca/) has compiled archives on over 3,500 buildings through volunteer effort since 1973.

## Seed Buildings

The proof-of-concept includes three example records with real linked data identifiers:

| Building | Decade | Features | Wikidata |
|----------|--------|----------|----------|
| BC Electric Company Building, 1515 Blanshard St | 1950s | Extensive glazing, flat roof | — |
| McPherson Library, UVic | 1960s | Exposed concrete, ribbon windows, flat roof | — |
| Mid-Century Commercial Building, 1060 Fort St | 1960s | Brise soleil, pilotis, flat roof | — |

## Technology

The application is structured in three layers:

- **Frontend**: Plain HTML, CSS, and JavaScript with [Leaflet.js](https://leafletjs.com/) for mapping. No build step.
- **Backend**: Node.js and Express, deployed on Oracle Cloud (Montreal region).
- **Database**: PostgreSQL + PostGIS running on the same Canadian server. No third-party database services — all data stays in Canada.

## References

- [Full references and sources](Greater%20Victoria%20Modernist%20Building%20Inventory%20—%20References) — periodization, heritage risk, documentation gaps, citizen science methodology
- [Modernist building features — sources](Modernist%20Building%20Features%20—%20Sources) — architectural preservation literature behind the feature checklist

## Status

This is a **proof-of-concept** developed to support a grant proposal. Contributions submitted through the app are stored persistently in the database.
