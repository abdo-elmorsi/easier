import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import { validateAndHashPassword } from "utils/utils";


// GET request handler
export const handleGetRequest = async (query, res) => {
  try {
    const { id, tower, payPercentage, search } = query;
    if (id) {
      const flat = await prisma.Flat.findUnique({
        where: { id },
        include: {
          tower: { select: { name: true, id: true } },
        },
      });
      if (!flat) return res.status(404).json({ message: "Flat not found" });
      return res.status(200).json(flat);
    }

    // Return early if no tower query is provided
    if (!tower) {
      return res.status(400).json({ message: "Tower query is required to retrieve flats." });
    }

    // Building the search filter
    const filters = {};

    if (search) {
      filters.OR = [
        { number: { contains: search, mode: 'insensitive' } },
      ];
    }

    const whereClause = {
      ...(tower && { tower_id: tower }), // Add tower_id conditionally if it exists
      ...(payPercentage && { pay_percentage: +payPercentage }),
      ...filters,
    };

    const flats = await prisma.Flat.findMany({
      where: whereClause,
      include: {
        tower: { select: { name: true, id: true } },
      },
    });
    return res.status(200).json(flats);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST request handler
export const handlePostRequest = async (data, res) => {
  const {
    number,
    floor,
    password,
    phone,
    towerId,
    pay_percentage,
    electricity,
    water,
    waste,
    guard,
    elevator,
    others,
  } = data;
  try {
    if (!towerId) {
      return res.status(400).json({ message: "Tower is required." });
    }

    const existingFlat = await prisma.Flat.findFirst({
      where: { number, floor, tower_id: towerId },
    });
    if (existingFlat) return res.status(400).json({ message: "Flat with the same number and floor already exists in this tower." });


    // Hash the password before saving
    let hashedPassword = await validateAndHashPassword(password);


    const newFlat = await prisma.Flat.create({
      data: {
        number,
        floor,
        phone,
        password: hashedPassword,
        tower: { connect: { id: towerId } },
        pay_percentage,
        electricity,
        water,
        waste,
        guard,
        elevator,
        others,
      },
    });

    return res.status(201).json({
      message: "Flat created successfully",
      flat: newFlat,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT request handler
export const handlePutRequest = async (data, res) => {
  const {
    id,
    number,
    floor,
    phone,
    password,
    pay_percentage,
    electricity,
    water,
    waste,
    guard,
    elevator,
    others,
  } = data;
  if (!id) return res.status(400).json({ message: "ID is required for updating." });


  try {
    const flat = await prisma.Flat.findUnique({
      where: { id },
    });
    if (!flat) return res.status(404).json({ message: "Flat not found" });


    const existingFlat = await prisma.Flat.findFirst({
      where: {
        number,
        floor,
        tower_id: flat.tower_id,
        NOT: { id }, // Exclude the current flat being updated
      },
    });
    if (existingFlat) return res.status(400).json({ message: "Flat with the same number and floor already exists in this tower." });



    // Validate password if provided
    let hashedPassword = password ? await validateAndHashPassword(password) : null;
    if (password && !hashedPassword) {
      return res.status(400).json({ message: "Password must be a valid non-empty string." });
    }

    // Update flat fields
    const updatedFlat = await prisma.Flat.update({
      where: { id },
      data: {
        ...(number && { number }),
        ...(floor && { floor }),
        ...(phone && { phone }),
        ...(password && { hashedPassword }),
        pay_percentage: pay_percentage,
        electricity: electricity,
        water: water,
        waste: waste,
        guard: guard,
        elevator: elevator,
        others: others,
      },
    });
    return res.status(200).json(updatedFlat);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE request handler
export const handleDeleteRequest = async ({ id }, res) => {
  if (!id) return res.status(400).json({ message: "ID is required for deletion." });
  try {
    await prisma.Flat.delete({
      where: { id },
    });
    return res.status(200).json({ message: "Flat deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
