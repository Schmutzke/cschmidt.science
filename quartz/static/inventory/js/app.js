/**
 * App module — initialisation and tab switching
 *
 * Wires together the map, form, list, and linked data modules.
 * Handles sidebar tab navigation.
 */

const AppModule = (() => {

  /**
   * Switch to a sidebar tab by name.
   * @param {string} tabName - "inventory", "form", or "linked-data"
   */
  function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('#sidebar-tabs .tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content panels
    document.querySelectorAll('.tab-content').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });
  }

  /**
   * Initialise the application.
   */
  function init() {
    // Set up sidebar tab switching
    document.querySelectorAll('#sidebar-tabs .tab').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Initialise map
    MapModule.init();

    // Initialise contribution form
    FormModule.init();

    // Initialise inventory list (triggers initial data load)
    ListModule.init();

    // Load known buildings onto the map
    loadBuildings();

    console.log('Greater Victoria Modernist Building Inventory — ready');
  }

  /**
   * Fetch known buildings from the API and display on map.
   */
  async function loadBuildings() {
    try {
      const buildings = await Api.getBuildings();
      MapModule.displayBuildings(buildings);
    } catch (err) {
      console.warn('Could not load known buildings:', err.message);
    }
  }

  return { init, switchTab };
})();

// Start the app when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  AppModule.init();
});
