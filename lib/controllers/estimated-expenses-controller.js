import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import moment from "moment-timezone";


// GET request handler
export const handleGetRequest = async (query, res) => {
  try {
    const { id, tower, month, search } = query;

    if (id) {
      const estimatedExpenses = await prisma.EstimatedExpenses.findUnique({
        where: { id },
        include: {
          tower: { select: { name: true, id: true } },
        },
      });
      if (!estimatedExpenses) return res.status(404).json({ message: "EstimatedExpenses not found" });
      return res.status(200).json(estimatedExpenses);
    }

    if (!tower) {
      return res.status(400).json({ message: "Tower query is required to retrieve estimated expenses." });
    }

    const filters = {};

    if (search) {
      filters.OR = [
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const whereClause = {
      ...(tower && { tower_id: tower }),
      ...(month && {
        created_at: {
          gte: moment(month).startOf('month').toDate(),
          lte: moment(month).endOf('month').toDate(),
        },
      }),
      ...filters,
    };

    const estimatedExpenses = await prisma.EstimatedExpenses.findMany({
      where: whereClause,
      include: {
        tower: { select: { name: true, id: true } },
      },
      orderBy: {
        created_at: 'desc',
      }
    });

    if (!estimatedExpenses.length) return res.status(404).json({ message: "No estimated expenses found for the given month" });

    return res.status(200).json(estimatedExpenses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST request handler
export const handlePostRequest = async (data, res) => {
  const {
    towerId,
    electricity,
    water,
    waste,
    guard,
    elevator,
    others,
    notes,
  } = data;


  try {
    if (!towerId) {
      return res.status(400).json({ message: "Tower is required." });
    }
    // Get the current date in a specific timezone (e.g., 'UTC')
    const currentMonth = moment().tz('UTC');

    const firstDayOfMonth = currentMonth.clone().startOf('month').toDate();
    const lastDayOfMonth = currentMonth.clone().endOf('month').toDate();

    // Check if an EstimatedExpenses record exists for the current month and tower
    const existingRecord = await prisma.EstimatedExpenses.findFirst({
      where: {
        tower_id: towerId,
        created_at: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    if (existingRecord) {
      return res.status(400).json({ message: "EstimatedExpenses for the current month already exists for this tower." });
    }

    // Create new EstimatedExpenses record
    const newEstimatedExpenses = await prisma.EstimatedExpenses.create({
      data: {
        tower: { connect: { id: towerId } },
        electricity,
        water,
        waste,
        guard,
        elevator,
        others,
        notes,
      },
    });

    return res.status(201).json({
      message: "EstimatedExpenses created successfully",
      estimatedExpenses: newEstimatedExpenses,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT request handler
export const handlePutRequest = async (data, res) => {
  const {
    id,
    electricity,
    water,
    waste,
    guard,
    elevator,
    others,
    notes,
  } = data;
  if (!id) return res.status(400).json({ message: "ID is required for updating." });

  try {
    // Find the EstimatedExpenses by ID
    const estimatedExpenses = await prisma.EstimatedExpenses.findUnique({
      where: { id },
    });
    if (!estimatedExpenses) return res.status(404).json({ message: "EstimatedExpenses not found" });

    // Get the tower ID from the EstimatedExpenses object (assumes there is a tower relation in EstimatedExpenses)
    const towerId = estimatedExpenses.tower_id;


    // Check if there is a MonthlySettlement for the same tower and within the current month
    const existingMonthlySettlement = await prisma.MonthlySettlement.findFirst({
      where: {
        tower_id: towerId,
        created_at: {
          gte: moment().startOf('month').toDate(),
          lte: moment().endOf('month').toDate(),
        },
      },
    });

    if (existingMonthlySettlement) {
      // If there is a MonthlySettlement for the current month, prevent update
      return res.status(400).json({
        message: "Cannot update EstimatedExpenses, MonthlySettlement exists for this tower in the current month.",
      });
    }

    // If no existing MonthlySettlement, proceed to update EstimatedExpenses
    const updatedEstimatedExpenses = await prisma.EstimatedExpenses.update({
      where: { id },
      data: {
        electricity: electricity,
        water: water,
        waste: waste,
        guard: guard,
        elevator: elevator,
        others: others,
        notes: notes,
      },
    });

    return res.status(200).json(updatedEstimatedExpenses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// DELETE request handler
export const handleDeleteRequest = async ({ id }, res) => {
  if (!id) return res.status(400).json({ message: "ID is required for deletion." });
  try {
    await prisma.EstimatedExpenses.delete({
      where: { id },
    });
    return res.status(200).json({ message: "EstimatedExpenses deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
