/* eslint-disable */

export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiaGxwMjU5OSIsImEiOiJjazg5NmQ2NzQwM2U5M29tcDZmYTVtZ3ZlIn0.QFg9zGy98AhvhhpUY52hLA';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/hlp2599/ck896oqvj2tmf1iqvz2opu6n6',
    scrollZoom: false
    // center: [72.511788, 23.036345],
    // zoom: 10
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // loc.coordinates.reverse();
    //Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    //Extends the map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 200,
      right: 100,
      left: 100
    }
  });
};
