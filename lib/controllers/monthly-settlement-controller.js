import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import moment from "moment-timezone";


// GET request handler
export const handleGetRequest = async (query, res) => {
  try {
    const { id, tower, flat, month, search } = query;

    if (id) {
      const estimatedMonthlySettlement = await prisma.MonthlySettlement.findUnique({
        where: { id },
        include: {
          tower: { select: { name: true, id: true } },
          flat: { select: { number: true, floor: true, id: true } },
        },
      });
      if (!estimatedMonthlySettlement) return res.status(404).json({ message: "MonthlySettlement not found" });
      return res.status(200).json(estimatedMonthlySettlement);
    }

    if (!tower) {
      return res.status(400).json({ message: "Tower query is required to retrieve monthly settlement." });
    }

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

    const estimatedMonthlySettlement = await prisma.MonthlySettlement.findMany({
      where: whereClause,

      include: {
        tower: { select: { name: true, id: true } },
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

    if (!estimatedMonthlySettlement.length) return res.status(404).json({ message: "No monthly settlement found for the given month" });

    return res.status(200).json(estimatedMonthlySettlement);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST request handler
export const handlePostRequest = async (data, res) => {
  const {
    tower_id,
    flat_id,
    payed_amount = 0,
    electricity = 0,
    water = 0,
    waste = 0,
    guard = 0,
    elevator = 0,
    others = 0,
    net_estimated_expenses = 0,
    notes,
  } = data;


  try {
    if (!tower_id) {
      return res.status(400).json({ message: "Tower is required." });
    }
    if (!flat_id) {
      return res.status(400).json({ message: "Flat is required." });
    }
    // Get the current date in a specific timezone (e.g., 'UTC')
    const currentMonth = moment().tz('UTC');
    const firstDayOfMonth = currentMonth.clone().startOf('month').toDate();
    const lastDayOfMonth = currentMonth.clone().endOf('month').toDate();

    // Check if an MonthlySettlement record exists for the current month and flat
    const existingRecord = await prisma.MonthlySettlement.findFirst({
      where: {
        flat_id: flat_id,
        created_at: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    if (existingRecord) {
      return res.status(400).json({ message: "MonthlySettlement for the current month already exists for this flat." });
    }

    // Create new MonthlySettlement record
    const monthlySettlement = await prisma.MonthlySettlement.create({
      data: {
        tower: { connect: { id: tower_id } },
        flat: { connect: { id: flat_id } },
        payed_amount,
        electricity,
        water,
        waste,
        guard,
        elevator,
        others,
        notes,
        net_estimated_expenses

      },
    });

    return res.status(201).json({
      message: "MonthlySettlement created successfully",
      estimatedMonthlySettlement: monthlySettlement,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT request handler
export const handlePutRequest = async (data, res) => {
  const {
    id,
    payed_amount = 0,
    electricity = 0,
    water = 0,
    waste = 0,
    guard = 0,
    elevator = 0,
    others = 0,
    net_estimated_expenses = 0,
    notes,
  } = data;
  if (!id) return res.status(400).json({ message: "ID is required for updating." });


  try {
    const estimatedMonthlySettlement = await prisma.MonthlySettlement.findUnique({
      where: { id },
    });
    if (!estimatedMonthlySettlement) return res.status(404).json({ message: "MonthlySettlement not found" });



    // Update MonthlySettlement fields
    const UpdatedMonthlySettlement = await prisma.MonthlySettlement.update({
      where: { id },
      data: {
        payed_amount: payed_amount,
        electricity: electricity,
        water: water,
        waste: waste,
        guard: guard,
        elevator: elevator,
        others: others,
        net_estimated_expenses: net_estimated_expenses,
        notes: notes,
      },
    });
    return res.status(200).json(UpdatedMonthlySettlement);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE request handler
export const handleDeleteRequest = async ({ id }, res) => {
  if (!id) return res.status(400).json({ message: "ID is required for deletion." });
  try {
    await prisma.MonthlySettlement.delete({
      where: { id },
    });
    return res.status(200).json({ message: "MonthlySettlement deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
