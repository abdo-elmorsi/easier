import ErrorHandler from "helper/apis/ErrorHandler";
import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import moment from "moment-timezone";


// GET request handler
export const handleGetRequest = async (req, res) => {
  try {
    const { tower_id } = req.user;
    const { id, year, search } = req.query;
    if (id) {
      const OpeningBalance = await prisma.OpeningBalance.findUnique({ where: { id } });

      if (!OpeningBalance) return res.status(404).json({ message: "OpeningBalance not found" });
      return res.status(200).json(OpeningBalance);
    }

    // Return early if no tower query is provided
    if (!tower_id) throw ErrorHandler.badRequest("Tower query is required.");


    // Building the search filter
    const filters = {};

    if (search) {
      const searchInt = parseInt(search, 10);

      filters.OR = [
        { balance: { equals: isNaN(searchInt) ? undefined : searchInt } },
      ];
    }

    const whereClause = {
      tower_id,
      ...(year && {
        created_at: {
          gte: moment(year).startOf('year').toDate(),
          lte: moment(year).endOf('year').toDate(),
        },
      }),
      ...filters,
    };

    // Fetch all OpeningBalance for the specified tower and filter criteria
    const items = await prisma.OpeningBalance.findMany({ where: whereClause });



    return res.status(200).json(items);
  } catch (error) {
    throw ErrorHandler.internalError(error);
  }
};

// POST request handler
export const handlePostRequest = async (req, res) => {
  const {
    balance,
    notes,
  } = req.body;
  try {

    const { tower_id } = req.user;
    if (!tower_id) throw ErrorHandler.badRequest("Tower query is required.");


    const existingOpeningBalance = await prisma.OpeningBalance.findFirst({
      where: {
        tower_id,
        created_at: {
          gte: moment().startOf('year').toDate(),
          lte: moment().endOf('year').toDate(),
        },
      },
    });
    if (existingOpeningBalance) throw ErrorHandler.conflict("OpeningBalance with the same year already exists in this tower.");


    await prisma.OpeningBalance.create({
      data: {
        balance,
        tower_id,
        notes,
      },
    });

    return res.status(200).json({ message: 'OK' });

  } catch (error) {
    throw ErrorHandler.internalError(error);

  }
};

// PUT request handler
export const handlePutRequest = async (req, res) => {
  const {
    id,
    balance,
    notes,
  } = req.body;
  if (!id) throw ErrorHandler.badRequest("ID is required");

  try {
    const OpeningBalance = await prisma.OpeningBalance.findUnique({ where: { id } });
    if (!OpeningBalance) throw ErrorHandler.notFound("OpeningBalance not found");


    // Update OpeningBalance fields
    await prisma.OpeningBalance.update({
      where: { id },
      data: { balance, notes },
    });
    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    throw ErrorHandler.internalError(error);
  }
};

// DELETE request handler
export const handleDeleteRequest = async (req, res) => {
  const { id } = req.body;
  if (!id) throw ErrorHandler.badRequest("ID is required");

  try {
    await prisma.OpeningBalance.delete({ where: { id } });
    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    throw ErrorHandler.internalError(error);
  }
};
