import { maximumDistanceTravelService } from "../services";

const getMaxTravelDistances = async () => {
  const distances =
    await maximumDistanceTravelService.getMaximumDistanceTravels();
  return distances;
};

export default getMaxTravelDistances;
