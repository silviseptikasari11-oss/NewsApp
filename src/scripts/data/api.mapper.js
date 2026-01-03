import Map from '../utils/map.js';

export async function reportMapper(report) {
  return {
    ...report,
    location: {
      ...report.location,
      placeName: await Map.getPlaceNameByCoordinate(report.latitude, report.longitude),
    },
  };
}
