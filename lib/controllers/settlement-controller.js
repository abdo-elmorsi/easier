import ErrorHandler from "helper/apis/ErrorHandler";
import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import moment from "moment-timezone";


// GET request handler
export const handleGetRequest = async (req, res) => {
  try {
    const { tower_id } = req.user;
    const { id, flat, month = new Date(), search } = req.query;

    if (id) {
      const item = await prisma.Settlement.findUnique({
        where: { id },
        include: {
          flat: { select: { number: true, floor: true, id: true } },
        },
      });
      if (!item) throw ErrorHandler.notFound("Settlement not found");

      return res.status(200).json(item);
    }

    if (!tower_id) throw ErrorHandler.badRequest("Tower query is required.");

    const filters = {};

    if (search) {
      filters.OR = [
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const whereClause = {
      tower_id,
      ...(flat && { flat_id: flat }),

      created_at: {
        gte: moment(month).startOf('month').toDate(),
        lte: moment(month).endOf('month').toDate(),
      },
      ...filters,
    };

    const items = await prisma.Settlement.findMany({
      where: whereClause,
      include: {
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
        {
          created_at: 'desc',
        },
      ],
    });

    return res.status(200).json(items);
  } catch (error) {
    throw ErrorHandler.internalError(error);

  }
};

// POST request handler
export const handlePostRequest = async (req, res) => {
  const {
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
    const { tower_id } = req.user;
    if (!tower_id || !flat_id) throw ErrorHandler.badRequest("Tower & Flat are required.");


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

    if (existingRecord) throw ErrorHandler.conflict("Settlement for the current month already exists for this flat.");


    // Create new Settlement record
    await prisma.Settlement.create({
      data: {
        tower_id,
        flat_id,
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
    throw ErrorHandler.internalError(error);

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
  if (!id) throw ErrorHandler.badRequest("ID is required.");

  try {
    const Settlement = await prisma.Settlement.findUnique({ where: { id } });
    if (!Settlement) throw ErrorHandler.notFound("Settlement not found");


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
    throw ErrorHandler.internalError(error);

  }
};

// DELETE request handler
export const handleDeleteRequest = async (req, res) => {
  const { id } = req.body;
  if (!id) throw ErrorHandler.badRequest("ID is required.");
  try {
    await prisma.Settlement.delete({ where: { id } });
    return res.status(200).json({ message: 'OK' });

  } catch (error) {
    throw ErrorHandler.internalError(error);

  }
};
