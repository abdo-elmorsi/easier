import ErrorHandler from "helper/apis/ErrorHandler";
import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import moment from "moment-timezone";
import { validateAndHashPassword } from "utils/utils";


// GET request handler
export const handleGetRequest = async (req, res) => {
  try {
    const { tower_id } = req.user;
    const { id, payPercentage, search, for_select, for_settlement = false } = req.query;

    // Fetch a specific flat by ID
    if (id) {
      const flat = await prisma.Flat.findUnique({ where: { id } });
      if (!flat) throw ErrorHandler.notFound("Flat not found");
      return res.status(200).json(flat);
    }

    // Ensure tower_id query parameter is provided
    if (!tower_id) throw ErrorHandler.badRequest("Tower query is required.");

    // Build search filters
    const filters = search
      ? { OR: [{ number: { contains: search, mode: "insensitive" } }] }
      : {};

    // Construct the main query
    const whereClause = {
      tower_id, // Tower ID is mandatory
      ...(payPercentage && { pay_percentage: Number(payPercentage) }),
      ...filters,
      ...(for_settlement
        ? {
          Settlement: {
            none: { created_at: { gte: moment().startOf("month").toDate(), lte: moment().endOf("month").toDate() } },
          },
        }
        : {}),
    };

    // Define fields to retrieve based on `for_select`
    const flatFields = for_select
      ? { id: true, number: true, floor: true }
      : {
        id: true,
        number: true,
        floor: true,
        phone: true,
        user_name: true,
        email: true,
        electricity: true,
        water: true,
        waste: true,
        guard: true,
        elevator: true,
        others: true,
        pay_percentage: true,
        created_at: true,
        updated_at: true,
        tower_id: true,
      };

    // Fetch flats matching the query
    const flats = await prisma.Flat.findMany({
      where: whereClause,
      select: flatFields,
    });

    return res.status(200).json(flats);
  } catch (error) {
    return ErrorHandler.internalError(error);
  }
};
// POST request handler
export const handlePostRequest = async (req, res) => {
  const {
    number,
    floor,
    password,
    phone,
    user_name,
    email,
    pay_percentage,
    electricity,
    water,
    waste,
    guard,
    elevator,
    others,
  } = req.body;
  try {

    const { tower_id } = req.user;

    if (!tower_id) throw ErrorHandler.badRequest("Tower query is required.");


    const existingFlat = await prisma.Flat.findFirst({ where: { number, floor, tower_id } });
    if (existingFlat) throw ErrorHandler.validationError("Flat with the same number and floor already exists in this tower.");


    // Hash the password before saving
    let hashedPassword = await validateAndHashPassword(password);


    await prisma.Flat.create({
      data: {
        number,
        floor,
        phone,
        user_name,
        email,
        ...(password && { password: hashedPassword }),
        tower_id,
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
    throw ErrorHandler.internalError(error);

  }
};

// PUT request handler
export const handlePutRequest = async (req, res) => {
  const {
    id,
    number,
    floor,
    phone,
    user_name,
    email,
    password,
    pay_percentage,
    electricity,
    water,
    waste,
    guard,
    elevator,
    others,
  } = req.body;

  const { tower_id } = req.user;

  if (!id) throw ErrorHandler.badRequest("ID is required.");



  try {
    const flat = await prisma.Flat.findUnique({ where: { id } });
    if (!flat) throw ErrorHandler.notFound("Flat not found");


    const existingFlat = await prisma.Flat.findFirst({
      where: {
        number,
        floor,
        tower_id,
        NOT: { id }, // Exclude the current flat being updated
      },
    });
    if (existingFlat) throw ErrorHandler.conflict("Flat with the same number and floor already exists in this tower.");




    // Validate password if provided
    let hashedPassword = password ? await validateAndHashPassword(password) : null;
    if (password && !hashedPassword) throw ErrorHandler.validationError("Password must be a valid non-empty string.");


    // Update flat fields
    await prisma.Flat.update({
      where: { id },
      data: {
        ...(number && { number }),
        ...(floor && { floor }),
        ...(phone && { phone }),
        ...(user_name && { user_name }),
        ...(email && { email }),
        ...(password && { password: hashedPassword }),
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
    throw ErrorHandler.internalError(error);

  }
};

// DELETE request handler
export const handleDeleteRequest = async (req, res) => {
  const { id } = req.body;
  if (!id) throw ErrorHandler.badRequest("ID is required.");
  try {
    await prisma.Flat.delete({ where: { id } });
    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    throw ErrorHandler.internalError(error);

  }
};
