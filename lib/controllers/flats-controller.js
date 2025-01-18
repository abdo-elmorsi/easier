import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import moment from "moment-timezone";
import { validateAndHashPassword } from "utils/utils";


// GET request handler
export const handleGetRequest = async (req, res) => {
  try {
    const { id, tower, payPercentage, search, for_settlement = false } = req.query;
    if (id) {
      const flat = await prisma.Flat.findUnique({
        where: { id },
        include: {
          tower: { select: { name: true, id: true } },
        },
      });
      if (!flat) throw new Error("Flat not found");

      return res.status(200).json(flat);
    }

    // Return early if no tower query is provided
    if (!tower) throw new Error("Tower query is required to retrieve flats.");


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

    // Fetch all flats for the specified tower and filter criteria
    const flats = await prisma.Flat.findMany({
      where: whereClause,
      include: {
        tower: { select: { name: true, id: true } },
      },
    });


    if (for_settlement) {
      // Filter out flats that do not have a Settlement for the current month
      const flatsWithoutSettlement = [];
      for (const flat of flats) {
        const Settlement = await prisma.Settlement.findFirst({
          where: {
            flat_id: flat.id,
            created_at: {
              gte: moment().startOf('month').toDate(),
              lte: moment().endOf('month').toDate(),
            },
          },
        });

        if (!Settlement) {
          flatsWithoutSettlement.push(flat);
        }
      }

      return res.status(200).json(flatsWithoutSettlement);
    }
    return res.status(200).json(flats);
  } catch (error) {
    throw new Error(error);

  }
};

// POST request handler
export const handlePostRequest = async (req, res) => {
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
  } = req.body;
  try {
    if (!towerId) throw new Error("Tower is required.");



    const existingFlat = await prisma.Flat.findFirst({ where: { number, floor, tower_id: towerId } });
    if (existingFlat) throw new Error("Flat with the same number and floor already exists in this tower.");



    // Hash the password before saving
    let hashedPassword = await validateAndHashPassword(password);


    await prisma.Flat.create({
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

    return res.status(200).json({ message: 'OK' });

  } catch (error) {
    throw new Error(error);

  }
};

// PUT request handler
export const handlePutRequest = async (req, res) => {
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
  } = req.body;
  if (!id) throw new Error("ID is required.");



  try {
    const flat = await prisma.Flat.findUnique({ where: { id } });
    if (!flat) throw new Error("Flat not found");


    const existingFlat = await prisma.Flat.findFirst({
      where: {
        number,
        floor,
        tower_id: flat.tower_id,
        NOT: { id }, // Exclude the current flat being updated
      },
    });
    if (existingFlat) throw new Error("Flat with the same number and floor already exists in this tower.");




    // Validate password if provided
    let hashedPassword = password ? await validateAndHashPassword(password) : null;
    if (password && !hashedPassword) throw new Error("Password must be a valid non-empty string.");


    // Update flat fields
    await prisma.Flat.update({
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
    await prisma.Flat.delete({ where: { id } });
    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    throw new Error(error);

  }
};
