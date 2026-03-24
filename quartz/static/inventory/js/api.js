/**
 * API client — fetch() wrappers for all backend endpoints
 *
 * All backend communication goes through this module so that the API
 * base URL only needs to be configured in one place.
 *
 * In production, API_BASE should point to the Oracle Cloud instance.
 * During local development, both frontend and backend run on localhost.
 */

// Configure this to match your backend deployment.
// For local dev: http://localhost:3000
// For production: https://your-oracle-cloud-instance.com
const API_BASE = window.API_BASE || 'http://localhost:3000';

const Api = {

  /**
   * Fetch all contributions, with optional filters.
   * @param {object} filters - { decade, feature }
   * @returns {Promise<Array>}
   */
  async getContributions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.decade) params.set('decade', filters.decade);
    if (filters.feature) params.set('feature', filters.feature);

    const url = `${API_BASE}/api/contributions?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch contributions: ${res.status}`);
    return res.json();
  },

  /**
   * Submit a new contribution.
   * @param {object} data - contribution form data
   * @returns {Promise<object>}
   */
  async createContribution(data) {
    const res = await fetch(`${API_BASE}/api/contributions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Submission failed: ${res.status}`);
    }
    return res.json();
  },

  /**
   * Fetch all known buildings (seeded records with linked data IDs).
   * @returns {Promise<Array>}
   */
  async getBuildings() {
    const res = await fetch(`${API_BASE}/api/buildings`);
    if (!res.ok) throw new Error(`Failed to fetch buildings: ${res.status}`);
    return res.json();
  },

  /**
   * Fetch a single building with enriched linked data URLs.
   * @param {string} id - building UUID
   * @returns {Promise<object>}
   */
  async getBuilding(id) {
    const res = await fetch(`${API_BASE}/api/buildings/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch building: ${res.status}`);
    return res.json();
  },

  /**
   * Fetch heritage properties from the BCRHP proxy.
   * @param {object} bounds - Leaflet LatLngBounds
   * @param {number} limit - max results (default 100)
   * @returns {Promise<object>} GeoJSON FeatureCollection
   */
  async getHeritageProperties(bounds, limit = 100) {
    const params = new URLSearchParams({
      minLng: bounds.getWest(),
      minLat: bounds.getSouth(),
      maxLng: bounds.getEast(),
      maxLat: bounds.getNorth(),
      limit: String(limit),
    });
    const res = await fetch(`${API_BASE}/api/heritage/properties?${params.toString()}`);
    if (!res.ok) throw new Error(`Heritage proxy error: ${res.status}`);
    return res.json();
  },
};
