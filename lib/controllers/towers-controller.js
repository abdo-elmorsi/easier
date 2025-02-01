import ErrorHandler from "helper/apis/ErrorHandler";
import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client


// GET request handler
export const handleGetRequest = async (req, res) => {
  try {
    const { id, search, for_select, user_email } = req.query;
    if (id) {
      const tower = await prisma.Tower.findUnique({ where: { id } });
      if (!tower) throw ErrorHandler.notFound("Tower not found");

      return res.status(200).json(tower);
    }

    // Building the search filter
    const filters = {
      user_id: req.user?.id,
      ...(user_email ? {
        user: {
          email: user_email,
        }
      } : {})
    };

    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.Tower.findMany({
      where: { ...filters },
      ...(for_select ? {
        select: {
          id: true,
          name: true,
        }
      } : {}),

    });
    return res.status(200).json(items);
  } catch (error) {
    throw ErrorHandler.internalError(error);
  }
};

// POST request handler
export const handlePostRequest = async (req, res) => {
  const { name, address, num_of_floors } = req.body;
  try {
    const existingTower = await prisma.tower.findUnique({ where: { name } });
    if (existingTower) throw ErrorHandler.conflict("Name already taken");


    await prisma.Tower.create({
      data: {
        name,
        address,
        num_of_floors,
        user: { connect: { id: req.user?.id } }
      },
    });

    return res.status(200).json({ message: 'OK' });

  } catch (error) {
    throw ErrorHandler.internalError(error);

  }
};

// PUT request handler
export const handlePutRequest = async (req, res) => {
  const { id, name, address, num_of_floors } = req.body;
  if (!id) throw ErrorHandler.badRequest("ID is required.");

  try {
    const tower = await prisma.Tower.findUnique({ where: { id, user_id: req.user?.id } });
    if (!tower) throw ErrorHandler.notFound("Tower is not found");


    const existingTower = await prisma.Tower.findFirst({
      where: {
        name,
        NOT: { id }, // Exclude the current tower being updated
      }
    });
    if (existingTower) throw ErrorHandler.conflict("Name already taken");



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
    throw ErrorHandler.internalError(error);


  }
};

// DELETE request handler
export const handleDeleteRequest = async (req, res) => {
  const { id } = req.body;
  if (!id) throw ErrorHandler.badRequest("ID is required.");

  try {
    // Start a transaction to ensure atomicity
    const deleteTransaction = await prisma.$transaction([
      prisma.Flat.deleteMany({ where: { tower_id: id } }),
      prisma.EstimatedExpenses.deleteMany({ where: { tower_id: id } }),
      prisma.Tower.delete({ where: { id, user_id: req.user?.id } }),
    ]);

    if (deleteTransaction) {
      return res.status(200).json({ message: 'OK' });
    } else {
      throw ErrorHandler.internalError("Couldn't delete the transaction from the database");
    }
  } catch (error) {
    throw ErrorHandler.internalError(error);

  }
};
