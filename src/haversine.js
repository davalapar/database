
// const radians = (degrees) => degrees * (Math.PI / 180);

const degreesToRadiansMultiplier = Math.PI / 180;
const earthRadius = 6371e3;

/**
 *  Haversine: https://www.movable-type.co.uk/scripts/latlong.html
 * @param {number} lat1 first coordinate latitude in degrees
 * @param {number} lon1 first coordinate longitude in degrees
 * @param {number} lat2 second coordinate latitude in degrees
 * @param {number} lon2 second coordinate longitude in degrees
 * @returns {number} meters
 */
const haversine = (lat1, lon1, lat2, lon2) => {
  // first latitude in radians
  const lat1r = lat1 * degreesToRadiansMultiplier;
  // second latitude in radians
  const lat2r = lat2 * degreesToRadiansMultiplier;
  // delta between first and second latitude:
  const latdr = (lat2 - lat1) * degreesToRadiansMultiplier;
  // delta between first and second longitude:
  const londr = (lon2 - lon1) * degreesToRadiansMultiplier;
  // square of half the chord length between the points
  const x = Math.sin(latdr / 2) * Math.sin(latdr / 2) + Math.cos(lat1r) * Math.cos(lat2r) * Math.sin(londr / 2) * Math.sin(londr / 2);
  // earth radius * angular distance in radians:
  return earthRadius * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
};

module.exports = haversine;
