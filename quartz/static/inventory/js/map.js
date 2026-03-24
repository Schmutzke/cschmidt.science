/**
 * Map module — Leaflet map setup and layer management
 *
 * Initialises the Leaflet map centred on Greater Victoria, BC, with:
 *   - OpenStreetMap base tile layer
 *   - A GeoJSON layer for BC Register of Historic Places heritage properties,
 *     colour-coded by era: MCM-era (1945–1975) in blue, other heritage in
 *     muted amber, and missing-date properties in soft red
 *   - Markers for known buildings (from the seed data)
 *   - Markers for citizen contributions
 *   - Click handler to trigger the contribution form
 *   - A map legend explaining the layer colours
 *
 * Greater Victoria centre coordinates: 48.4284° N, 123.3656° W
 */

const MapModule = (() => {
  let map;
  let heritageLayer;
  let buildingMarkers;
  let contributionMarkers;
  let clickMarker;

  // MCM era boundaries (inclusive)
  const MCM_START = 1945;
  const MCM_END = 1975;

  // Heritage property styles by era category
  const STYLE_MCM = {
    color: '#1a5fb4',
    weight: 2.5,
    fillColor: '#3584e4',
    fillOpacity: 0.35,
  };

  const STYLE_OTHER_HERITAGE = {
    color: '#b5a06b',
    weight: 1,
    fillColor: '#e5d9b6',
    fillOpacity: 0.18,
  };

  const STYLE_MISSING_DATE = {
    color: '#c0392b',
    weight: 1.5,
    fillColor: '#e8a9a3',
    fillOpacity: 0.22,
  };

  // Known buildings: larger red markers with a white building icon
  const KNOWN_BUILDING_ICON = L.divIcon({
    className: 'known-building-marker',
    html: '<div style="background:#c0392b;width:28px;height:28px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:bold;">B</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  // Contributions: medium green markers
  const CONTRIBUTION_ICON = L.divIcon({
    className: 'contribution-marker',
    html: '<div style="background:#27ae60;width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.4);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  /**
   * Parse a construction date string and return the earliest year found,
   * or null if no year can be extracted.
   * Handles formats like "1955", "1954-1955", "c. 1960", "circa 1950", etc.
   */
  function parseYear(dateStr) {
    if (!dateStr) return null;
    const match = dateStr.match(/(\d{4})/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Classify a heritage feature into one of three categories.
   * Returns 'mcm', 'other', or 'missing'.
   */
  function classifyHeritage(feature) {
    const year = parseYear((feature.properties || {}).construction_date);
    if (year === null) return 'missing';
    if (year >= MCM_START && year <= MCM_END) return 'mcm';
    return 'other';
  }

  /**
   * Return the appropriate style for a heritage feature based on its era.
   */
  function heritageStyle(feature) {
    const category = classifyHeritage(feature);
    if (category === 'mcm') return STYLE_MCM;
    if (category === 'missing') return STYLE_MISSING_DATE;
    return STYLE_OTHER_HERITAGE;
  }

  /**
   * Initialise the Leaflet map.
   */
  function init() {
    // Centre on Greater Victoria, BC — will be adjusted to fit buildings once loaded
    map = L.map('map').setView([48.4284, -123.3656], 13);

    // OpenStreetMap tile layer — free, no API key needed
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Prepare empty layer groups
    heritageLayer = L.geoJSON(null, {
      style: heritageStyle,
      onEachFeature: onEachHeritage,
    }).addTo(map);
    buildingMarkers = L.layerGroup().addTo(map);
    contributionMarkers = L.layerGroup().addTo(map);

    // Click handler — when user clicks the map, trigger the contribution form
    map.on('click', onMapClick);

    // Load heritage properties when the map moves
    map.on('moveend', loadHeritageProperties);
    loadHeritageProperties(); // initial load

    // Add the legend
    addLegend();
  }

  /**
   * Handle map click — place a marker and open the contribution form.
   */
  function onMapClick(e) {
    const { lat, lng } = e.latlng;

    // Remove previous click marker if any
    if (clickMarker) {
      map.removeLayer(clickMarker);
    }

    // Place a temporary marker at the clicked location
    clickMarker = L.marker([lat, lng]).addTo(map);
    clickMarker.bindPopup('New observation here').openPopup();

    // Notify the form module with the clicked coordinates
    if (typeof FormModule !== 'undefined') {
      FormModule.setLocation(lat, lng);
    }

    // Switch to the form tab
    if (typeof AppModule !== 'undefined') {
      AppModule.switchTab('form');
    }
  }

  /**
   * Attach popup to each heritage property polygon.
   */
  function onEachHeritage(feature, layer) {
    const p = feature.properties || {};
    const category = classifyHeritage(feature);
    const date = p.construction_date ? `<br>Built: ${p.construction_date}` : '<br><em>Date unknown</em>';
    const status = p.registration_status ? `<br>Status: ${p.registration_status}` : '';
    const link = p.bcrhp_url
      ? `<br><a href="${p.bcrhp_url}" target="_blank" rel="noopener">View on BCRHP &rarr;</a>`
      : '';

    const eraLabel = category === 'mcm'
      ? '<br><strong style="color:#1a5fb4;">Mid-century modern era</strong>'
      : category === 'missing'
        ? '<br><em style="color:#c0392b;">Construction date missing</em>'
        : '';

    layer.bindPopup(`
      <div class="building-popup">
        <div class="popup-name">${p.name || 'Heritage Property'}</div>
        <div class="popup-address">${p.city || ''}${date}${status}${eraLabel}</div>
        ${link}
      </div>
    `);
  }

  /**
   * Load heritage properties from the BCRHP proxy for the current map view.
   */
  async function loadHeritageProperties() {
    try {
      const bounds = map.getBounds();
      const geojson = await Api.getHeritageProperties(bounds);
      heritageLayer.clearLayers();
      heritageLayer.addData(geojson);
    } catch (err) {
      // Silently fail — heritage overlays are supplementary, not critical
      console.warn('Could not load heritage properties:', err.message);
    }
  }

  /**
   * Add a legend control to the bottom-right of the map.
   */
  function addLegend() {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'map-legend');
      div.innerHTML = `
        <div class="legend-title">Map Legend</div>
        <div class="legend-item">
          <span class="legend-swatch" style="background:#3584e4;border-color:#1a5fb4;"></span>
          Heritage property (1945–1975)
        </div>
        <div class="legend-item">
          <span class="legend-swatch" style="background:#e5d9b6;border-color:#b5a06b;"></span>
          Heritage property (other era)
        </div>
        <div class="legend-item">
          <span class="legend-swatch" style="background:#e8a9a3;border-color:#c0392b;"></span>
          Heritage property (date unknown)
        </div>
        <div class="legend-item">
          <span class="legend-swatch legend-circle" style="background:#c0392b;"></span>
          Known modernist building
        </div>
        <div class="legend-item">
          <span class="legend-swatch legend-circle" style="background:#27ae60;"></span>
          Citizen contribution
        </div>
      `;
      return div;
    };

    legend.addTo(map);
  }

  /**
   * Display known buildings (seed data) as red markers on the map.
   * After placing markers, zoom the map to fit all buildings.
   * @param {Array} buildings - array of building records from the API
   */
  function displayBuildings(buildings) {
    buildingMarkers.clearLayers();
    const coords = [];

    buildings.forEach(b => {
      // Extract coordinates from whichever format the API returns:
      //   - PostgreSQL production: top-level latitude/longitude from ST_Y/ST_X
      //   - Demo mode: latitude/longitude fields or location.coordinates
      let lat, lng;

      if (b.latitude && b.longitude) {
        lat = b.latitude;
        lng = b.longitude;
      } else if (b.location && typeof b.location === 'object' && b.location.coordinates) {
        [lng, lat] = b.location.coordinates;
      }

      // Skip if we couldn't determine coordinates
      if (!lat || !lng) return;

      coords.push([lat, lng]);

      const marker = L.marker([lat, lng], { icon: KNOWN_BUILDING_ICON })
        .addTo(buildingMarkers);

      marker.bindPopup(`
        <div class="building-popup">
          <div class="popup-name">${b.name}</div>
          <div class="popup-address">${b.address || ''}</div>
          <div class="popup-link" onclick="LinkedDataModule.show('${b.id}')">
            View linked data &rarr;
          </div>
        </div>
      `);
    });

    // Zoom map to fit all known buildings with some padding
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }

  /**
   * Display citizen contributions as green markers on the map.
   * @param {Array} contributions - array of contribution records
   */
  function displayContributions(contributions) {
    contributionMarkers.clearLayers();

    contributions.forEach(c => {
      if (!c.latitude || !c.longitude) return;

      const featureLabels = (c.style_features || [])
        .map(f => f.replace(/_/g, ' '))
        .join(', ');

      const marker = L.marker([c.latitude, c.longitude], { icon: CONTRIBUTION_ICON })
        .addTo(contributionMarkers);

      marker.bindPopup(`
        <div class="building-popup">
          <div class="popup-name">${c.address || 'Unnamed observation'}</div>
          <div class="popup-address">${featureLabels}</div>
          <div class="popup-address">${c.decade || ''}</div>
        </div>
      `);
    });
  }

  /**
   * Remove the temporary click marker (after form submission).
   */
  function clearClickMarker() {
    if (clickMarker) {
      map.removeLayer(clickMarker);
      clickMarker = null;
    }
  }

  return { init, displayBuildings, displayContributions, clearClickMarker };
})();
