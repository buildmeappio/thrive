import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

class MaximumDistanceTravelService {
  async getMaximumDistanceTravels() {
    try {
      const distances = await prisma.maximumDistanceTravel.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          name: "asc",
        },
      });

      return distances;
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.MAX_TRAVEL_DISTANCES_NOT_FOUND,
        500
      );
    }
  }
}

export default new MaximumDistanceTravelService();
