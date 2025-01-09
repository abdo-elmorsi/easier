import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client


// GET request handler
export const handleGetRequest = async (query, res) => {
  try {
    const { id, user_id, search } = query;
    if (id) {
      const tower = await prisma.Tower.findUnique({ where: { id } });
      if (!tower) return res.status(404).json({ message: "Tower not found" });
      return res.status(200).json(tower);
    }

    // Building the search filter
    const filters = {};

    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const towers = await prisma.Tower.findMany({ where: { user_id, ...filters } });
    return res.status(200).json(towers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST request handler
export const handlePostRequest = async (data, res) => {
  const { name, address, num_of_floors, user_id } = data;
  try {
    const existingTower = await prisma.tower.findUnique({
      where: { name },
    });
    if (existingTower) return res.status(400).json({ message: "Name already taken" });
    console.log({ user_id });

    const newTower = await prisma.Tower.create({
      data: {
        name,
        address,
        num_of_floors,
        user: { connect: { id: user_id } },
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
export const handlePutRequest = async (data, res) => {
  const { id, name, address, num_of_floors } = data;
  if (!id) return res.status(400).json({ message: "ID is required for updating." });

  try {
    const tower = await prisma.Tower.findUnique({
      where: { id },
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
export const handleDeleteRequest = async ({ id }, res) => {
  if (!id) return res.status(400).json({ message: "ID is required for deletion." });
  try {
    await prisma.Tower.delete({
      where: { id },
    });
    return res.status(200).json({ message: "Tower deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
