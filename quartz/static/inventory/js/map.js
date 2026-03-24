/**
 * Map module — Leaflet map setup and layer management
 *
 * Initialises the Leaflet map centred on Greater Victoria, BC, with:
 *   - OpenStreetMap base tile layer
 *   - A GeoJSON layer for GlobalBuildingAtlas building footprints
 *   - Markers for known buildings (from the seed data)
 *   - Markers for citizen contributions
 *   - Click handler to trigger the contribution form
 *
 * Greater Victoria centre coordinates: 48.4284° N, 123.3656° W
 */

const MapModule = (() => {
  let map;
  let footprintLayer;
  let buildingMarkers;
  let contributionMarkers;
  let clickMarker;

  // Distinct colours for the different layer types
  const FOOTPRINT_STYLE = {
    color: '#3498db',
    weight: 1,
    fillColor: '#3498db',
    fillOpacity: 0.15,
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
    footprintLayer = L.geoJSON(null, { style: FOOTPRINT_STYLE }).addTo(map);
    buildingMarkers = L.layerGroup().addTo(map);
    contributionMarkers = L.layerGroup().addTo(map);

    // Click handler — when user clicks the map, trigger the contribution form
    map.on('click', onMapClick);

    // Load building footprints when the map moves
    map.on('moveend', loadFootprints);
    loadFootprints(); // initial load
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
   * Load building footprints from the WFS proxy for the current map view.
   */
  async function loadFootprints() {
    try {
      const bounds = map.getBounds();
      const geojson = await Api.getWfsBuildings(bounds);
      footprintLayer.clearLayers();
      footprintLayer.addData(geojson);
    } catch (err) {
      // Silently fail — footprints are supplementary, not critical
      console.warn('Could not load building footprints:', err.message);
    }
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
