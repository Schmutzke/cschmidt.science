/**
 * Linked Data module — displays external identifiers for known buildings
 *
 * When a user selects a known building on the map, this module fetches its
 * record from the API and renders a panel showing how it connects to three
 * external linked open data sources:
 *
 *   1. Wikidata (https://www.wikidata.org/) — a free, structured knowledge
 *      base. Each building may have a QID (e.g. Q109268356).
 *
 *   2. OpenStreetMap (https://www.openstreetmap.org/) — the community-built
 *      world map. Each building footprint has a way ID.
 *
 *   3. GlobalBuildingAtlas (https://data.globalbuildingatlas.org/) — TU Munich's
 *      worldwide building footprint dataset. Each building has a unique ID.
 *
 * This panel demonstrates the linked open data principles that make the
 * inventory interoperable with other heritage and geospatial datasets.
 */

const LinkedDataModule = (() => {
  const contentEl = () => document.getElementById('linked-data-content');
  const placeholderEl = () => document.querySelector('#linked-data-panel > .placeholder');

  /**
   * Show linked data for a specific building.
   * Called from map popup "View linked data" links.
   * @param {string} buildingId - UUID of the building
   */
  async function show(buildingId) {
    // Switch to the linked data tab
    if (typeof AppModule !== 'undefined') {
      AppModule.switchTab('linked-data');
    }

    const content = contentEl();
    const placeholder = placeholderEl();

    content.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
    if (placeholder) placeholder.textContent = 'Loading linked data...';

    try {
      const building = await Api.getBuilding(buildingId);
      const ld = building.linked_data || {};

      if (placeholder) placeholder.style.display = 'none';
      content.style.display = 'block';

      content.innerHTML = `
        <div class="linked-data-card">
          <div class="ld-building-name">${building.name}</div>
          <p style="font-size:0.85rem;color:#555;margin-bottom:12px;">${building.address || ''}</p>

          <!-- Wikidata identifier -->
          <div class="ld-identifier">
            <span class="ld-label">Wikidata</span>
            ${ld.wikidata
              ? `<a href="${ld.wikidata.url}" target="_blank" rel="noopener">${ld.wikidata.qid}</a>`
              : '<span class="ld-missing">Not yet linked</span>'
            }
          </div>

          <!-- OpenStreetMap identifier -->
          <div class="ld-identifier">
            <span class="ld-label">OpenStreetMap</span>
            ${ld.openstreetmap
              ? `<a href="${ld.openstreetmap.url}" target="_blank" rel="noopener">way/${ld.openstreetmap.way_id}</a>`
              : '<span class="ld-missing">Not yet linked</span>'
            }
          </div>

          <!-- GlobalBuildingAtlas identifier -->
          <div class="ld-identifier">
            <span class="ld-label">GlobalBuildingAtlas</span>
            ${ld.global_building_atlas
              ? `<a href="${ld.global_building_atlas.url}" target="_blank" rel="noopener">${ld.global_building_atlas.building_id}</a>`
              : '<span class="ld-missing">Not yet linked</span>'
            }
          </div>

          <div class="ld-explanation">
            <strong>What is linked open data?</strong><br>
            Each identifier above connects this building record to an external
            dataset. This means the same building can be found across Wikidata
            (structured knowledge), OpenStreetMap (community maps), and the
            GlobalBuildingAtlas (building footprints). Linking records across
            datasets makes the inventory part of a larger open knowledge graph
            for architectural heritage.
          </div>
        </div>

        ${building.description ? `<p style="font-size:0.85rem;color:#444;margin-top:8px;">${building.description}</p>` : ''}
      `;
    } catch (err) {
      if (placeholder) {
        placeholder.textContent = 'Could not load linked data: ' + err.message;
      }
    }
  }

  return { show };
})();
