import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client


// GET request handler
export const handleGetRequest = async (req, res) => {
  try {
    const { id, search } = req.query;
    if (id) {
      const tower = await prisma.Tower.findUnique({ where: { id } });
      if (!tower) throw new Error("Tower not found");

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

    const items = await prisma.Tower.findMany({ where: { ...filters } });
    return res.status(200).json(items);
  } catch (error) {
    throw new Error(error);
  }
};

// POST request handler
export const handlePostRequest = async (req, res) => {
  const { name, address, num_of_floors } = req.body;
  try {
    const existingTower = await prisma.tower.findUnique({ where: { name } });
    if (existingTower) throw new Error("Name already taken");


    await prisma.Tower.create({
      data: {
        name,
        address,
        num_of_floors,
        user: { connect: { id: req.user_id } }
      },
    });

    return res.status(200).json({ message: 'OK' });

  } catch (error) {
    throw new Error(error);
  }
};

// PUT request handler
export const handlePutRequest = async (req, res) => {
  const { id, name, address, num_of_floors } = req.body;
  if (!id) throw new Error("ID is required.");

  try {
    const tower = await prisma.Tower.findUnique({ where: { id, user_id: req.user_id } });
    if (!tower) throw new Error("Tower is not found");


    // Update tower fields
    await prisma.Tower.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(num_of_floors && { num_of_floors }),
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
    // Start a transaction to ensure atomicity
    const deleteTransaction = await prisma.$transaction([
      prisma.Flat.deleteMany({ where: { tower_id: id } }),
      prisma.EstimatedExpenses.deleteMany({ where: { tower_id: id } }),
      prisma.Tower.delete({ where: { id, user_id: req.user_id } }),
    ]);

    if (deleteTransaction) {
      return res.status(200).json({ message: 'OK' });
    } else {
      throw new Error("Couldn't delete the transaction from the database");
    }
  } catch (error) {
    throw new Error(error);
  }
};
