import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client


// GET request handler
export const handleGetRequest = async (req, res) => {
  try {
    const { id, search } = req.query;
    if (id) {
      const tower = await prisma.Tower.findUnique({ where: { id } });
      if (!tower) return res.status(404).json({ message: "Tower not found" });
      return res.status(200).json(tower);
    }

    // Building the search filter
    const filters = {
      user_id: req.user_id
    };

    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const towers = await prisma.Tower.findMany({ where: { ...filters } });
    return res.status(200).json(towers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST request handler
export const handlePostRequest = async (req, res) => {
  const { name, address, num_of_floors } = req.body;
  try {
    const existingTower = await prisma.tower.findUnique({
      where: { name },
    });
    if (existingTower) return res.status(400).json({ message: "Name already taken" });

    const newTower = await prisma.Tower.create({
      data: {
        name,
        address,
        num_of_floors,
        user: { connect: { id: req.user_id } }
      },
    });

    return res.status(201).json({
      message: "Tower created successfully",
      tower: newTower,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT request handler
export const handlePutRequest = async (req, res) => {
  const { id, name, address, num_of_floors } = req.body;
  if (!id) return res.status(400).json({ message: "ID is required for updating." });

  try {
    const tower = await prisma.Tower.findUnique({
      where: { id, user_id: req.user_id },
    });
    if (!tower) return res.status(404).json({ message: "Tower not found" });

    // Update tower fields
    const updatedTower = await prisma.Tower.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(num_of_floors && { num_of_floors }),
      },
    });
    return res.status(200).json(updatedTower);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE request handler
export const handleDeleteRequest = async (req, res) => {
  const { id } = req.body;

  if (!id) res.status(400).json({ message: "ID is required for deletion." });

  try {
    // Start a transaction to ensure atomicity
    const deleteTransaction = await prisma.$transaction([
      prisma.Flat.deleteMany({ where: { tower_id: id } }),
      prisma.EstimatedExpenses.deleteMany({ where: { tower_id: id } }),
      prisma.Tower.delete({ where: { id, user_id: req.user_id } }),
    ]);

    if (deleteTransaction) {
      return res.status(200).json({ message: "Tower deleted successfully" });
    } else {
      return res.status(404).json({ message: "Tower not found" });
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error deleting tower:", error);
    return res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};
