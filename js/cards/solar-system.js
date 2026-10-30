window.PLANETENUHR_SOLAR_SYSTEM = (() => {
  'use strict';
  /** Creates the solar-system card controller without listeners or timers.
   * @param {object} options Document, planets, radii, model, artwork, labels and formatting adapters.
   * @returns {{render:Function}} Renderer receiving the common dashboard context.
   */
  function create(options){
    const document = options.document;
    /** Updates retained orbit, marker and label templates for one selection.
     * @param {object} context Shared selection with an explicit date.
     * @returns {void}
     */
    function render(context){
      const date = context.date;
      const t = options.getTranslations();
      const system = document.getElementById('solarSystem');
      if (!system) {
        return;
      }

      const size = system.clientWidth || 760;
      const center = size / 2;
      const radiusFractions = options.radiusFractions;
      const maxRadius = size * radiusFractions.neptune;
      const artwork = options.artwork;

      options.planets.forEach(planet => {
        const orbitRadius = size * radiusFractions[planet.key];
        let orbit = system.querySelector('[data-solar-orbit="' + planet.key + '"]');
        if (!orbit) {
          orbit = document.getElementById('solarOrbitTemplate').content.firstElementChild.cloneNode(true);
          orbit.dataset.solarOrbit = planet.key;
          system.appendChild(orbit);
        }
        orbit.style.width = (orbitRadius * 2) + 'px';
        orbit.style.height = (orbitRadius * 2) + 'px';
      });

      options.planets.forEach(planet => {
        const pos = options.planetPosition(planet, date);
        const theta = Math.atan2(pos.y, pos.x);
        const screenRadius = size * radiusFractions[planet.key];
        const x = center + screenRadius * Math.cos(theta);
        const y = center + screenRadius * Math.sin(theta);

        let marker = system.querySelector('[data-solar-marker="' + planet.key + '"]');
        if (!marker) {
          marker = document.getElementById('solarPlanetMarkerTemplate').content.firstElementChild.cloneNode(true);
          marker.classList.add(planet.key);
          marker.dataset.solarMarker = planet.key;
          system.appendChild(marker);
        }
        marker.style.left = x + 'px';
        marker.style.top = y + 'px';
        marker.title = t['planet_' + planet.key] || planet.key;
        artwork.mount(marker, planet.key);

        let label = system.querySelector('[data-solar-planet="' + planet.key + '"]');
        if (!label) {
          label = document.getElementById('solarPlanetLabelTemplate').content.firstElementChild.cloneNode(true);
          label.dataset.solarPlanet = planet.key;
          system.appendChild(label);
        }
        label.querySelector('[data-solar-name]').textContent = t['planet_' + planet.key] || planet.key;
        label.style.left = x + 'px';
        label.style.top = y + 'px';
        let labelTransform = 'translate(14px, -22px)';
        let labelTextAlign = 'left';

        if (x > center + maxRadius * 0.72) {
          labelTransform = 'translate(calc(-100% - 14px), -22px)';
          labelTextAlign = 'right';
        } else if (x < center - maxRadius * 0.72) {
          labelTransform = 'translate(14px, -22px)';
          labelTextAlign = 'left';
        } else if (y < center - maxRadius * 0.72) {
          labelTransform = 'translate(-50%, 12px)';
          labelTextAlign = 'center';
        } else if (y > center + maxRadius * 0.72) {
          labelTransform = 'translate(-50%, -24px)';
          labelTextAlign = 'center';
        }

        label.style.transform = labelTransform;
        label.style.textAlign = labelTextAlign;
      });

      const tz = options.getDisplayTimeZone();
      const solarDate = document.getElementById('solarDate');
      if (solarDate) {
        solarDate.textContent = t.solar_date + ': ' + options.formatDateTime(date, tz);
      }
      options.layoutLabels(system);
    }
    return {render};
  }
  return {create};
})();
