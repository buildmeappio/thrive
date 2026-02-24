'use server';

import authHandlers from '../server/handlers';
import ErrorMessages from '@/constants/ErrorMessages';

const getMaxTravelDistances = async () => {
  try {
    const distances = await authHandlers.getMaxTravelDistances();
    return distances;
  } catch (error) {
    console.error(error);
    throw new Error(ErrorMessages.MAX_TRAVEL_DISTANCES_NOT_FOUND);
  }
};

export default getMaxTravelDistances;
