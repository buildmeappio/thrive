import { HttpError } from "@/utils/httpError";
import {
  CreateChaperoneInput,
  UpdateChaperoneInput,
  ChaperoneData,
  ChaperoneWithAvailability,
} from "../types/Chaperone";
import { convertTimeToUTC, convertUTCToLocal } from "@/utils/timezone";
import prisma from "@/lib/db";
import logger from "@/utils/logger";

export const createChaperone = async (data: CreateChaperoneInput) => {
  try {
    logger.log("Creating chaperone with data:", JSON.stringify(data, null, 2));

    // Check if email already exists
    const existingChaperone = await prisma.chaperone.findFirst({
      where: {
        email: data.email,
        deletedAt: null,
      },
    });

    if (existingChaperone) {
      throw HttpError.badRequest("A chaperone with this email already exists");
    }

    // Create chaperone and availability in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const chaperone = await tx.chaperone.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone ? data.phone : null,
          gender: data.gender || null,
        },
      });

      // Create availability if provided and has data
      if (
        data.availability &&
        ((data.availability.weeklyHours &&
          data.availability.weeklyHours.length > 0) ||
          (data.availability.overrideHours &&
            data.availability.overrideHours.length > 0))
      ) {
        const availabilityProvider = await tx.availabilityProvider.create({
          data: {
            providerType: "CHAPERONE",
            refId: chaperone.id,
          },
        });

        // Create weekly hours
        if (
          data.availability.weeklyHours &&
          data.availability.weeklyHours.length > 0
        ) {
          for (const weeklyHour of data.availability.weeklyHours) {
            if (weeklyHour.enabled && weeklyHour.timeSlots.length > 0) {
              const weeklyHourRecord = await tx.providerWeeklyHours.create({
                data: {
                  availabilityProviderId: availabilityProvider.id,
                  dayOfWeek: weeklyHour.dayOfWeek,
                  enabled: weeklyHour.enabled,
                },
              });

              // Create time slots for this day (convert to UTC)
              for (const slot of weeklyHour.timeSlots) {
                await tx.providerWeeklyTimeSlot.create({
                  data: {
                    weeklyHourId: weeklyHourRecord.id,
                    startTime: convertTimeToUTC(
                      slot.startTime,
                      undefined,
                      new Date(),
                    ),
                    endTime: convertTimeToUTC(
                      slot.endTime,
                      undefined,
                      new Date(),
                    ),
                  },
                });
              }
            }
          }
        }

        // Create override hours
        if (
          data.availability.overrideHours &&
          data.availability.overrideHours.length > 0
        ) {
          for (const overrideHour of data.availability.overrideHours) {
            if (overrideHour.timeSlots.length > 0) {
              const overrideHourRecord = await tx.providerOverrideHours.create({
                data: {
                  availabilityProviderId: availabilityProvider.id,
                  date: new Date(overrideHour.date),
                },
              });

              // Create time slots for this override date (convert to UTC using override date)
              const overrideDate = new Date(overrideHour.date);
              for (const slot of overrideHour.timeSlots) {
                await tx.providerOverrideTimeSlot.create({
                  data: {
                    overrideHourId: overrideHourRecord.id,
                    startTime: convertTimeToUTC(
                      slot.startTime,
                      undefined,
                      overrideDate,
                    ),
                    endTime: convertTimeToUTC(
                      slot.endTime,
                      undefined,
                      overrideDate,
                    ),
                  },
                });
              }
            }
          }
        }
      }

      return chaperone;
    });

    return result;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    logger.error("Error creating chaperone:", error);
    throw HttpError.internalServerError("Internal server error");
  }
};

export const updateChaperone = async (
  id: string,
  data: UpdateChaperoneInput,
) => {
  try {
    // Check if chaperone exists
    const existingChaperone = await prisma.chaperone.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingChaperone) {
      throw HttpError.notFound("Chaperone not found");
    }

    // If email is being updated, check if it's already in use
    if (data.email && data.email !== existingChaperone.email) {
      const emailExists = await prisma.chaperone.findFirst({
        where: {
          email: data.email,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (emailExists) {
        throw HttpError.badRequest(
          "A chaperone with this email already exists",
        );
      }
    }

    // Update chaperone and availability in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updateData: Partial<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        gender: string | null;
      }> = {};
      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined)
        updateData.phone = data.phone ? data.phone : null;
      if (data.gender !== undefined) updateData.gender = data.gender || null;

      const chaperone = await tx.chaperone.update({
        where: { id },
        data: updateData,
      });

      // Update availability if provided
      if (data.availability) {
        // Find or create availability provider
        let availabilityProvider = await tx.availabilityProvider.findFirst({
          where: {
            refId: id,
            providerType: "CHAPERONE",
            deletedAt: null,
          },
        });

        if (!availabilityProvider) {
          availabilityProvider = await tx.availabilityProvider.create({
            data: {
              providerType: "CHAPERONE",
              refId: id,
            },
          });
        }

        // Delete existing weekly hours and override hours
        await tx.providerWeeklyTimeSlot.deleteMany({
          where: {
            weeklyHour: {
              availabilityProviderId: availabilityProvider.id,
            },
          },
        });
        await tx.providerWeeklyHours.deleteMany({
          where: {
            availabilityProviderId: availabilityProvider.id,
          },
        });
        await tx.providerOverrideTimeSlot.deleteMany({
          where: {
            overrideHour: {
              availabilityProviderId: availabilityProvider.id,
            },
          },
        });
        await tx.providerOverrideHours.deleteMany({
          where: {
            availabilityProviderId: availabilityProvider.id,
          },
        });

        // Create new weekly hours
        if (
          data.availability.weeklyHours &&
          data.availability.weeklyHours.length > 0
        ) {
          for (const weeklyHour of data.availability.weeklyHours) {
            if (weeklyHour.enabled && weeklyHour.timeSlots.length > 0) {
              const weeklyHourRecord = await tx.providerWeeklyHours.create({
                data: {
                  availabilityProviderId: availabilityProvider.id,
                  dayOfWeek: weeklyHour.dayOfWeek,
                  enabled: weeklyHour.enabled,
                },
              });

              // Convert times to UTC before saving
              for (const slot of weeklyHour.timeSlots) {
                await tx.providerWeeklyTimeSlot.create({
                  data: {
                    weeklyHourId: weeklyHourRecord.id,
                    startTime: convertTimeToUTC(
                      slot.startTime,
                      undefined,
                      new Date(),
                    ),
                    endTime: convertTimeToUTC(
                      slot.endTime,
                      undefined,
                      new Date(),
                    ),
                  },
                });
              }
            }
          }
        }

        // Create new override hours
        if (
          data.availability.overrideHours &&
          data.availability.overrideHours.length > 0
        ) {
          for (const overrideHour of data.availability.overrideHours) {
            if (overrideHour.timeSlots.length > 0) {
              const overrideHourRecord = await tx.providerOverrideHours.create({
                data: {
                  availabilityProviderId: availabilityProvider.id,
                  date: new Date(overrideHour.date),
                },
              });

              // Convert times to UTC using override date as reference
              const overrideDate = new Date(overrideHour.date);
              for (const slot of overrideHour.timeSlots) {
                await tx.providerOverrideTimeSlot.create({
                  data: {
                    overrideHourId: overrideHourRecord.id,
                    startTime: convertTimeToUTC(
                      slot.startTime,
                      undefined,
                      overrideDate,
                    ),
                    endTime: convertTimeToUTC(
                      slot.endTime,
                      undefined,
                      overrideDate,
                    ),
                  },
                });
              }
            }
          }
        }
      }

      return chaperone;
    });

    return result;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    logger.error("Error updating chaperone:", error);
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getChaperones = async (): Promise<ChaperoneData[]> => {
  try {
    const chaperones = await prisma.chaperone.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return chaperones.map((chaperone) => ({
      id: chaperone.id,
      firstName: chaperone.firstName,
      lastName: chaperone.lastName,
      email: chaperone.email,
      phone: chaperone.phone,
      gender: chaperone.gender,
      fullName: `${chaperone.firstName} ${chaperone.lastName}`,
      createdAt: chaperone.createdAt,
    }));
  } catch (error) {
    logger.error("Error getting chaperones:", error);
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getChaperoneById = async (
  id: string,
): Promise<ChaperoneWithAvailability> => {
  try {
    const chaperone = await prisma.chaperone.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!chaperone) {
      throw HttpError.notFound("Chaperone not found");
    }

    // Fetch availability data
    const availabilityProvider = await prisma.availabilityProvider.findFirst({
      where: {
        refId: id,
        providerType: "CHAPERONE",
        deletedAt: null,
      },
      include: {
        weeklyHours: {
          where: { deletedAt: null },
          include: {
            timeSlots: {
              where: { deletedAt: null },
              orderBy: { startTime: "asc" },
            },
          },
        },
        overrideHours: {
          where: { deletedAt: null },
          include: {
            timeSlots: {
              where: { deletedAt: null },
              orderBy: { startTime: "asc" },
            },
          },
          orderBy: { date: "asc" },
        },
      },
    });

    const chaperoneWithAvailability: ChaperoneWithAvailability = {
      ...chaperone,
      availability: availabilityProvider
        ? {
            weeklyHours: availabilityProvider.weeklyHours.map((wh) => ({
              id: wh.id,
              dayOfWeek: wh.dayOfWeek,
              enabled: wh.enabled,
              timeSlots: wh.timeSlots.map((ts) => ({
                id: ts.id,
                startTime: convertUTCToLocal(
                  ts.startTime,
                  undefined,
                  new Date(),
                ),
                endTime: convertUTCToLocal(ts.endTime, undefined, new Date()),
              })),
            })),
            overrideHours: availabilityProvider.overrideHours.map((oh) => ({
              id: oh.id,
              date: oh.date.toISOString().split("T")[0],
              timeSlots: oh.timeSlots.map((ts) => ({
                id: ts.id,
                startTime: convertUTCToLocal(ts.startTime, undefined, oh.date),
                endTime: convertUTCToLocal(ts.endTime, undefined, oh.date),
              })),
            })),
          }
        : undefined,
    };

    return chaperoneWithAvailability;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    logger.error("Error getting chaperone by id:", error);
    throw HttpError.internalServerError("Internal server error");
  }
};

export const deleteChaperone = async (id: string) => {
  try {
    const existingChaperone = await prisma.chaperone.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingChaperone) {
      throw HttpError.notFound("Chaperone not found");
    }

    // Soft delete - set deletedAt timestamp
    const chaperone = await prisma.chaperone.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return chaperone;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    logger.error("Error deleting chaperone:", error);
    throw HttpError.internalServerError("Internal server error");
  }
};
