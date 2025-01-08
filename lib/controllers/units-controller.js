import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client

// GET request handler
export const handleGetRequest = async (query, res) => {
  try {
    const { id } = query;

    if (id) {
      const unit = await prisma.Unit.findUnique({
        where: { id }, // Use Prisma's findUnique with the ID
      });

      if (!unit) return res.status(404).json({ message: "Unit not found" });
      return res.status(200).json(unit);
    }

    const units = await prisma.Unit.findMany(); // Get all units
    return res.status(200).json(units);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST request handler
export const handlePostRequest = async (data, res) => {
  const { name, isDisable = false } = data;
  try {
    const existingUnit = await prisma.Unit.findUnique({
      where: { name }, // Check if the unit already exists
    });

    if (existingUnit) return res.status(400).json({ message: "Name already taken" });

    const newUnit = await prisma.Unit.create({
      data: { name }, // Create a new unit
    });
    if (isDisable) {
      return res.status(201).json(true);
    }
    return res.status(201).json({
      message: "Unit created successfully",
      unit: {
        id: newUnit.id,
        name: newUnit.name,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT request handler
export const handlePutRequest = async (data, res) => {
  const { id, name } = data;
  if (!id) return res.status(400).json({ message: "ID is required for updating." });

  try {
    const unit = await prisma.Unit.findUnique({
      where: { id }, // Find the unit by ID
    });

    if (!unit) return res.status(404).json({ message: "Unit not found" });

    // Update unit fields
    const updatedUnit = await prisma.Unit.update({
      where: { id },
      data: { ...(name && { name }) }, // Update the name if provided
    });

    return res.status(200).json(updatedUnit);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE request handler
export const handleDeleteRequest = async ({ id }, res) => {
  if (!id) return res.status(400).json({ message: "ID is required for deletion." });
  try {
    await prisma.Unit.delete({
      where: { id }, // Delete the unit by ID
    });
    return res.status(200).json({ message: "Unit deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
