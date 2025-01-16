import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import moment from "moment-timezone";
import { validateAndHashPassword } from "utils/utils";


// GET request handler
export const handleGetRequest = async (query, res) => {
  try {
    const { id, tower, year, search } = query;
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
    if (!tower) {
      return res.status(400).json({ message: "Tower query is required to retrieve OpeningBalance." });
    }

    // Building the search filter
    const filters = {};

    if (search) {
      const searchInt = parseInt(search, 10);

      filters.OR = [
        { balance: { equals: isNaN(searchInt) ? undefined : searchInt } },
      ];
    }

    const whereClause = {
      tower_id: tower,
      ...(year && {
        created_at: {
          gte: moment(year).startOf('year').toDate(),
          lte: moment(year).endOf('year').toDate(),
        },
      }),
      ...filters,
    };

    // Fetch all OpeningBalance for the specified tower and filter criteria
    const OpeningBalance = await prisma.OpeningBalance.findMany({
      where: whereClause,
      include: {
        tower: { select: { name: true, id: true } },
      },
    });



    return res.status(200).json(OpeningBalance);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST request handler
export const handlePostRequest = async (data, res) => {
  const {
    balance,
    towerId,
  } = data;
  try {
    if (!towerId) {
      return res.status(400).json({ message: "Tower is required." });
    }

    const existingOpeningBalance = await prisma.OpeningBalance.findFirst({
      where: {
        tower_id: towerId,
        created_at: {
          gte: moment().startOf('year').toDate(),
          lte: moment().endOf('year').toDate(),
        },
      },
    });
    if (existingOpeningBalance) return res.status(400).json({ message: "OpeningBalance with the same year already exists in this tower." });

    const newOpeningBalance = await prisma.OpeningBalance.create({
      data: {
        balance,
        tower: { connect: { id: towerId } },
      },
    });

    return res.status(201).json({
      message: "OpeningBalance created successfully",
      flat: newOpeningBalance,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT request handler
export const handlePutRequest = async (data, res) => {
  const {
    id,
    balance,
  } = data;
  if (!id) return res.status(400).json({ message: "ID is required for updating." });

  try {
    const OpeningBalance = await prisma.OpeningBalance.findUnique({ where: { id } });
    if (!OpeningBalance) return res.status(404).json({ message: "OpeningBalance not found" });


    // Update OpeningBalance fields
    const updatedOpeningBalance = await prisma.OpeningBalance.update({
      where: { id },
      data: { balance: balance },
    });
    return res.status(200).json(updatedOpeningBalance);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE request handler
export const handleDeleteRequest = async ({ id }, res) => {
  if (!id) return res.status(400).json({ message: "ID is required for deletion." });
  try {
    await prisma.OpeningBalance.delete({
      where: { id },
    });
    return res.status(200).json({ message: "OpeningBalance deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
