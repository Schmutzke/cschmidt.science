/**
 * Form module — handles the citizen contribution form
 *
 * The form is populated when a user clicks on the map (lat/lng auto-filled)
 * and submitted via POST to the backend API. After successful submission,
 * the form resets and the inventory list refreshes.
 */

const FormModule = (() => {

  /**
   * Set the location fields from a map click.
   * @param {number} lat
   * @param {number} lng
   */
  function setLocation(lat, lng) {
    document.getElementById('form-lat').value = lat.toFixed(6);
    document.getElementById('form-lng').value = lng.toFixed(6);
  }

  /**
   * Initialise form submission handler.
   */
  function init() {
    const form = document.getElementById('contribution-form');
    const status = document.getElementById('form-status');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      status.className = '';

      // Collect checked style features
      const featureCheckboxes = form.querySelectorAll('input[name="features"]:checked');
      const style_features = Array.from(featureCheckboxes).map(cb => cb.value);

      if (style_features.length === 0) {
        status.textContent = 'Please select at least one modernist feature.';
        status.className = 'error';
        return;
      }

      const lat = parseFloat(document.getElementById('form-lat').value);
      const lng = parseFloat(document.getElementById('form-lng').value);

      if (!lat || !lng) {
        status.textContent = 'Please click on the map to set a location first.';
        status.className = 'error';
        return;
      }

      // Build the submission payload
      const data = {
        latitude: lat,
        longitude: lng,
        address: document.getElementById('form-address').value || null,
        style_features,
        decade: document.getElementById('form-decade').value || null,
        photo_filename: document.getElementById('form-photo').files[0]?.name || null,
        notes: document.getElementById('form-notes').value || null,
        contributor_name: document.getElementById('form-name').value || null,
        contributor_email: document.getElementById('form-email').value || null,
      };

      // Disable submit button while sending
      const submitBtn = document.getElementById('form-submit');
      submitBtn.disabled = true;
      status.textContent = 'Submitting...';

      try {
        await Api.createContribution(data);
        status.textContent = 'Observation submitted! Thank you for contributing.';
        status.className = 'success';
        form.reset();
        MapModule.clearClickMarker();

        // Refresh the inventory list to show the new contribution
        if (typeof ListModule !== 'undefined') {
          ListModule.refresh();
        }
      } catch (err) {
        status.textContent = err.message || 'Submission failed. Please try again.';
        status.className = 'error';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  return { init, setLocation };
})();
