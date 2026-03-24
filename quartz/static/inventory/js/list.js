/**
 * List module — inventory list view with filtering
 *
 * Displays all citizen contributions in a scrollable list alongside the map.
 * Supports filtering by decade and by style feature. Each list item shows
 * the address/description, observed features, decade, and submission date.
 */

const ListModule = (() => {
  const listContainer = () => document.getElementById('inventory-list');

  /**
   * Initialise the list and filter controls.
   */
  function init() {
    // Attach filter change handlers
    document.getElementById('filter-decade').addEventListener('change', refresh);
    document.getElementById('filter-feature').addEventListener('change', refresh);

    // Initial load
    refresh();
  }

  /**
   * Fetch contributions from the API (with current filters) and render.
   */
  async function refresh() {
    const decade = document.getElementById('filter-decade').value;
    const feature = document.getElementById('filter-feature').value;

    const container = listContainer();
    container.innerHTML = '<p class="placeholder">Loading...</p>';

    try {
      const contributions = await Api.getContributions({ decade, feature });

      if (contributions.length === 0) {
        container.innerHTML = '<p class="placeholder">No contributions yet. Click the map to add the first!</p>';
        return;
      }

      container.innerHTML = contributions.map(c => {
        const features = (c.style_features || [])
          .map(f => f.replace(/_/g, ' '))
          .join(', ');

        const date = c.created_at
          ? new Date(c.created_at).toLocaleDateString()
          : '';

        return `
          <div class="inventory-item" data-lat="${c.latitude}" data-lng="${c.longitude}">
            <div class="item-address">${c.address || 'Unnamed location'}</div>
            <div class="item-features">${features}</div>
            ${c.decade ? `<span class="item-decade">${c.decade}</span>` : ''}
            <div class="item-date">${date}</div>
          </div>
        `;
      }).join('');

      // Update map markers
      MapModule.displayContributions(contributions);

      // Click a list item to pan the map to that location
      container.querySelectorAll('.inventory-item').forEach(item => {
        item.addEventListener('click', () => {
          const lat = parseFloat(item.dataset.lat);
          const lng = parseFloat(item.dataset.lng);
          if (lat && lng) {
            // Access the map through MapModule (we'd need to expose the map
            // or add a panTo method — for the POC, we trigger a fly-to)
            if (typeof MapModule !== 'undefined' && MapModule._map) {
              MapModule._map.flyTo([lat, lng], 17);
            }
          }
        });
      });

    } catch (err) {
      container.innerHTML = `<p class="placeholder">Could not load inventory: ${err.message}</p>`;
    }
  }

  return { init, refresh };
})();
