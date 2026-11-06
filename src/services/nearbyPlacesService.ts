import { API } from '../api';

export const getNearbyPlacesService = async (lat: number, lng: number) => {
  return API.Instance.get(API.API_ROUTES.nearbyPlaces, {
    params: { lat, lng },
  });
};
