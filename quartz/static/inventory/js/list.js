/**
 * List module — inventory list view with filtering
 *
 * Displays known buildings and citizen contributions in a scrollable list.
 * Known buildings appear at the top (with a distinct style), followed by
 * citizen contributions. Supports filtering by decade and style feature.
 */

const ListModule = (() => {
  const listContainer = () => document.getElementById('inventory-list');
  let knownBuildings = [];

  /**
   * Initialise the list and filter controls.
   */
  function init() {
    document.getElementById('filter-decade').addEventListener('change', refresh);
    document.getElementById('filter-feature').addEventListener('change', refresh);
    refresh();
  }

  /**
   * Store known buildings so the list can display them.
   * Called from AppModule after loading buildings.
   */
  function setBuildings(buildings) {
    knownBuildings = buildings;
    refresh();
  }

  /**
   * Fetch contributions from the API (with current filters) and render
   * both known buildings and contributions in the list.
   */
  async function refresh() {
    const decade = document.getElementById('filter-decade').value;
    const feature = document.getElementById('filter-feature').value;

    const container = listContainer();
    container.innerHTML = '<p class="placeholder">Loading...</p>';

    try {
      const contributions = await Api.getContributions({ decade, feature });

      let html = '';

      // --- Known buildings section ---
      // Filter known buildings by the same criteria
      let filteredBuildings = knownBuildings;
      if (decade) {
        filteredBuildings = filteredBuildings.filter(b => b.decade === decade);
      }
      if (feature) {
        filteredBuildings = filteredBuildings.filter(b =>
          (b.style_features || []).includes(feature)
        );
      }

      if (filteredBuildings.length > 0) {
        html += '<div class="list-section-label">Known Buildings</div>';
        html += filteredBuildings.map(b => {
          const features = (b.style_features || [])
            .map(f => f.replace(/_/g, ' '))
            .join(', ');

          return `
            <div class="inventory-item known-item" data-lat="${b.latitude}" data-lng="${b.longitude}" data-id="${b.id}">
              <div class="item-address">${b.name}</div>
              <div class="item-features">${features}</div>
              ${b.decade ? `<span class="item-decade">${b.decade}</span>` : ''}
              <div class="item-meta">Click to view linked data</div>
            </div>
          `;
        }).join('');
      }

      // --- Contributions section ---
      if (contributions.length > 0) {
        html += '<div class="list-section-label">Citizen Contributions</div>';
        html += contributions.map(c => {
          const features = (c.style_features || [])
            .map(f => f.replace(/_/g, ' '))
            .join(', ');

          const date = c.created_at
            ? new Date(c.created_at).toLocaleDateString()
            : '';

          return `
            <div class="inventory-item contribution-item" data-lat="${c.latitude}" data-lng="${c.longitude}">
              <div class="item-address">${c.address || 'Unnamed location'}</div>
              <div class="item-features">${features}</div>
              ${c.decade ? `<span class="item-decade">${c.decade}</span>` : ''}
              <div class="item-date">${date}</div>
            </div>
          `;
        }).join('');
      }

      if (!html) {
        container.innerHTML = '<p class="placeholder">No entries yet. Click the map to add the first!</p>';
        return;
      }

      container.innerHTML = html;

      // Update contribution markers on map
      MapModule.displayContributions(contributions);

      // Click handlers for list items
      container.querySelectorAll('.known-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.dataset.id;
          if (id) LinkedDataModule.show(id);
        });
      });

      container.querySelectorAll('.contribution-item').forEach(item => {
        item.addEventListener('click', () => {
          const lat = parseFloat(item.dataset.lat);
          const lng = parseFloat(item.dataset.lng);
          // Leaflet map isn't directly exposed, so we'll use the global reference
          if (lat && lng && window._victoriaMap) {
            window._victoriaMap.flyTo([lat, lng], 17);
          }
        });
      });

    } catch (err) {
      container.innerHTML = `<p class="placeholder">Could not load inventory: ${err.message}</p>`;
    }
  }

  return { init, refresh, setBuildings };
})();
