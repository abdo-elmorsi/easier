import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import moment from "moment-timezone";


// GET request handler
export const handleGetRequest = async (req, res) => {
  try {
    const { id, tower_id, year, search } = req.query;
    if (id) {
      const OpeningBalance = await prisma.OpeningBalance.findUnique({
        where: { id },
        include: {
          tower: { select: { name: true, id: true } },
        },
      });
      if (!OpeningBalance) return res.status(404).json({ message: "OpeningBalance not found" });
      return res.status(200).json(OpeningBalance);
    }

    // Return early if no tower query is provided
    if (!tower_id) throw new Error("Tower query is required to retrieve OpeningBalance.");


    // Building the search filter
    const filters = {};

    if (search) {
      const searchInt = parseInt(search, 10);

      filters.OR = [
        { balance: { equals: isNaN(searchInt) ? undefined : searchInt } },
      ];
    }

    const whereClause = {
      tower_id: tower_id,
      ...(year && {
        created_at: {
          gte: moment(year).startOf('year').toDate(),
          lte: moment(year).endOf('year').toDate(),
        },
      }),
      ...filters,
    };

    // Fetch all OpeningBalance for the specified tower and filter criteria
    const items = await prisma.OpeningBalance.findMany({
      where: whereClause,
      // include: {
      //   tower: { select: { name: true, id: true } },
      // },
    });



    return res.status(200).json(items);
  } catch (error) {
    throw new Error(error);
  }
};

// POST request handler
export const handlePostRequest = async (req, res) => {
  const {
    balance,
    towerId,
  } = req.body;
  try {
    if (!towerId) throw new Error("Tower is required.");


    const existingOpeningBalance = await prisma.OpeningBalance.findFirst({
      where: {
        tower_id: towerId,
        created_at: {
          gte: moment().startOf('year').toDate(),
          lte: moment().endOf('year').toDate(),
        },
      },
    });
    if (existingOpeningBalance) throw new Error("OpeningBalance with the same year already exists in this tower.");


    await prisma.OpeningBalance.create({
      data: {
        balance,
        tower: { connect: { id: towerId } },
      },
    });

    return res.status(200).json({ message: 'OK' });

  } catch (error) {
    throw new Error(error);

  }
};

// PUT request handler
export const handlePutRequest = async (req, res) => {
  const {
    id,
    balance,
  } = req.body;
  if (!id) throw new Error("ID is required");

  try {
    const OpeningBalance = await prisma.OpeningBalance.findUnique({ where: { id } });
    if (!OpeningBalance) throw new Error("OpeningBalance not found");


    // Update OpeningBalance fields
    await prisma.OpeningBalance.update({
      where: { id },
      data: { balance: balance },
    });
    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    throw new Error(error);
  }
};

// DELETE request handler
export const handleDeleteRequest = async (req, res) => {
  const { id } = req.body;
  if (!id) throw new Error("ID is required");

  try {
    await prisma.OpeningBalance.delete({ where: { id } });
    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    throw new Error(error);
  }
};
