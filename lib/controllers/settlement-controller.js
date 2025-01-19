import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import moment from "moment-timezone";


// GET request handler
export const handleGetRequest = async (req, res) => {
  try {
    const { id, tower, flat, month, search } = req.query;

    if (id) {
      const item = await prisma.Settlement.findUnique({
        where: { id },
        include: {
          tower: { select: { name: true, id: true } },
          flat: { select: { number: true, floor: true, id: true } },
        },
      });
      if (!item) throw new Error("Settlement not found");

      return res.status(200).json(item);
    }

    if (!tower) throw new Error("Tower query is required to retrieve settlement.");

    const filters = {};

    if (search) {
      filters.OR = [
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const whereClause = {
      tower_id: tower,
      ...(flat && { flat_id: flat }),
      ...(month && {
        created_at: {
          gte: moment(month).startOf('month').toDate(),
          lte: moment(month).endOf('month').toDate(),
        },
      }),
      ...filters,
    };

    const items = await prisma.Settlement.findMany({
      where: whereClause,

      include: {
        // tower: { select: { name: true, id: true } },
        flat: { select: { number: true, floor: true, id: true } },
      },

      orderBy: [
        {
          flat: {
            floor: 'asc', // Sort by floor in ascending order
          },
        },
        {
          flat: {
            number: 'asc', // Sort by flat number in ascending order
          },
        },
      ],
    });

    if (!items.length) throw new Error("No settlement found for the given month");

    return res.status(200).json(items);
  } catch (error) {
    throw new Error(error);

  }
};

// POST request handler
export const handlePostRequest = async (req, res) => {
  const {
    tower_id,
    flat_id,
    payed_amount = 0,
    pay_percentage = 0,
    electricity = false,
    water = false,
    waste = false,
    guard = false,
    elevator = false,
    others = false,
    notes,
  } = req.body;


  try {
    if (!tower_id || !flat_id) throw new Error("Tower & Flat are required.");


    // Check if an Settlement record exists for the current month and flat
    const existingRecord = await prisma.Settlement.findFirst({
      where: {
        flat_id: flat_id,
        created_at: {
          gte: moment().startOf('month').toDate(),
          lte: moment().endOf('month').toDate(),
        },
      },
    });

    if (existingRecord) throw new Error("Settlement for the current month already exists for this flat.");


    // Create new Settlement record
    await prisma.Settlement.create({
      data: {
        tower: { connect: { id: tower_id } },
        flat: { connect: { id: flat_id } },
        payed_amount,
        pay_percentage,
        electricity,
        water,
        waste,
        guard,
        elevator,
        others,
        notes,
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
    payed_amount = 0,
    pay_percentage = 0,
    electricity = false,
    water = false,
    waste = false,
    guard = false,
    elevator = false,
    others = false,
    notes,
  } = req.body;
  if (!id) throw new Error("ID is required.");

  try {
    const Settlement = await prisma.Settlement.findUnique({ where: { id } });
    if (!Settlement) throw new Error("Settlement not found");


    // Update Settlement fields
    await prisma.Settlement.update({
      where: { id },
      data: {
        payed_amount,
        pay_percentage,
        electricity,
        water,
        waste,
        guard,
        elevator,
        others,
        notes,
      },
    });
    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    throw new Error(error);

  }
};

// DELETE request handler
export const handleDeleteRequest = async (req, res) => {
  const { id } = req.body;
  if (!id) throw new Error("ID is required.");
  try {
    await prisma.Settlement.delete({ where: { id } });
    return res.status(200).json({ message: 'OK' });

  } catch (error) {
    throw new Error(error);

  }
};
