import { Prisma, VisibilityStatus } from "@prisma/client";
import {
  BAD_REQUEST,
  commonVariables,
  NOT_FOUND,
  OK,
  propertyMessages,
  propertyVariables,
} from "@constants";
import { IApiResponse } from "@customTypes";
import { prismaService } from "@services";

/**
 * Retrieves an users from the database .
 * @returns {Promise<IApiResponse>} - The response object with the status, success, message, and data.
 */
export const getProperties = async (
  pageNumber: number,
  pageSize: number,
  search: string,
  sortOrder: string, // 'asc' | 'desc'
  sortBy: string,
  filters: propertyVariables.PropertyFilters = {}
): Promise<IApiResponse> => {
  search = search?.trim() ?? "";

  // pagination
  const limit = pageSize || 10;
  const offset = (pageNumber - 1) * limit;

  // --- SORTING ---
  const sortOrderBy =
    sortOrder === Prisma.SortOrder.asc
      ? Prisma.SortOrder.asc
      : Prisma.SortOrder.desc;

  const orderBy = (() => {
    switch (sortBy) {
      case "PRICE_HIGH_TO_LOW":
        return [{ specifications: { price_max: sortOrderBy } }];

      case "PRICE_LOW_TO_HIGH":
        return [{ specifications: { price_min: sortOrderBy } }];

      case "OLDEST":
        return [{ created_at: "asc" }];

      default:
        return [{ created_at: "desc" }];
    }
  })();

  // --- FILTERS ---
  const where: Prisma.PropertyListWhereInput = {
    scrape_status: filters.scrape_status,
    visibility_status: filters.visibility_status,

    specifications: {
      some: {
        ...(filters.property_type && {
          property_type: filters.property_type,
        }),

        ...(filters.price_min && {
          price_min: { gte: filters.price_min },
        }),

        ...(filters.price_max && {
          price_max: { lte: filters.price_max },
        }),

        ...(filters.location && {
          location: {
            contains: filters.location,
          },
        }),
      },
    },

    // --- GLOBAL SEARCH ---
    ...(search && {
      OR: [
        { title: { contains: search } },
        {
          specifications: {
            some: {
              OR: [
                { title: { contains: search } },
                { location: { contains: search } },
                { landmarks: { contains: search } },
                { description: { contains: search } },
              ],
            },
          },
        },
      ],
    }),
  };

  // Fetch data
  const propertyList = await prismaService.getRecords(
    commonVariables.DB_COLLECTIONS.PROPERTY,
    {
      where: { ...where },
      select: {
        id: true,
        title: true,
        price: true,
        image: true,
        description: true,
        visibility_status: true,
        specifications: true,
      },
      skip: offset,
      take: limit,
      orderBy,
    }
  );

  const total = await prismaService.getCounts(
    commonVariables.DB_COLLECTIONS.PROPERTY,
    { where }
  );

  return {
    status: OK,
    success: true,
    message: propertyMessages.PROPERTY_FETCHED_SUCCESSFULLY,
    data: { total, properties: propertyList },
  };
};

/**
 * Service to get the user BY id
 * @param {number} id user id
 * @returns {IApiResponse}
 */
export const getPropertyById = async (id: number) => {
  const isExits = await prismaService.findFirstRecord(
    commonVariables.DB_COLLECTIONS.USER,
    {
      id: Number(id),
      deleted_at: null,
    },
    {
      select: {
        id: true,
      },
    }
  );

  if (isExits === null) {
    return {
      status: BAD_REQUEST,
      success: false,
      message: propertyMessages.PROPERTY_NOT_FOUND,
      data: null,
    };
  }

  return {
    status: OK,
    success: true,
    message: propertyMessages.PROPERTY_FETCHED_SUCCESSFULLY,
    data: isExits,
  };
};

export const updatePropertyStatusById = async (
  id: number,
  status: VisibilityStatus
): Promise<IApiResponse> => {
  console.log("id", id);

  const existingUser = await prismaService.getOneRecord(
    commonVariables.DB_COLLECTIONS.PROPERTY,
    { id },
    { id: true },
    null
  );

  if (!existingUser) {
    return {
      status: NOT_FOUND,
      success: false,
      message: propertyMessages.PROPERTY_NOT_FOUND,
      data: null,
    };
  }

  // Update user status
  await prismaService.updateRecord(
    commonVariables.DB_COLLECTIONS.PROPERTY,
    { visibility_status: status as VisibilityStatus },
    { id }
  );

  return {
    status: OK,
    success: true,
    message: propertyMessages.PROPERTY_UPDATE_STATUS,
    data: null,
  };
};

/**
 * Deletes a student from the database.
 * @param {string} userId - The ID of the student to be deleted.
 * @returns {Promise<IApiResponse>} - The response object with the status, success, message, and data.
 */
export const deletePropertyById = async (id: number): Promise<IApiResponse> => {
  try {
    const existingProperty = await prismaService.getOneRecord(
      commonVariables.DB_COLLECTIONS.PROPERTY,
      { id },
      { id: true },
      null
    );
    if (!existingProperty) {
      return {
        status: NOT_FOUND,
        success: false,
        message: propertyMessages.PROPERTY_NOT_FOUND,
        data: null,
      };
    }

    const deletedProperty = await prismaService.deleteUserById(
      commonVariables.DB_COLLECTIONS.PROPERTY,
      id
    );

    return {
      status: deletedProperty ? OK : BAD_REQUEST,
      success: Boolean(deletedProperty),
      message: deletedProperty
        ? propertyMessages.PROPERTY_DELETED
        : propertyMessages.DELETE_FAILED,
      data: null,
    };
  } catch (error) {
    return {
      status: BAD_REQUEST,
      success: false,
      message: propertyMessages.DELETE_FAILED,
      data: null,
    };
  }
};
