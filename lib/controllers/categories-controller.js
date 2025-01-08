import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client


// GET request handler
export const handleGetRequest = async (query, res) => {
  try {
    const { id } = query;
    if (id) {
      const category = await prisma.Category.findUnique({
        where: { id },
      });
      if (!category) return res.status(404).json({ message: "Category not found" });
      return res.status(200).json(category);
    }

    const categories = await prisma.Category.findMany();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST request handler
export const handlePostRequest = async (data, res) => {
  const { name } = data;
  try {
    const existingCategory = await prisma.Category.findUnique({
      where: { name },
    });
    if (existingCategory) return res.status(400).json({ message: "Name already taken" });

    const newCategory = await prisma.Category.create({
      data: { name },
    });

    return res.status(201).json({
      message: "Category created successfully",
      category: {
        id: newCategory.id,
        name: newCategory.name,
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
    const category = await prisma.Category.findUnique({
      where: { id },
    });
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Update category fields
    const updatedCategory = await prisma.Category.update({
      where: { id },
      data: {
        ...(name && { name }),
      },
    });
    return res.status(200).json(updatedCategory);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE request handler
export const handleDeleteRequest = async ({ id }, res) => {
  if (!id) return res.status(400).json({ message: "ID is required for deletion." });
  try {
    await prisma.Category.delete({
      where: { id },
    });
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
