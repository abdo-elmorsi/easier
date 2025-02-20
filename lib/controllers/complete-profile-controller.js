import ErrorHandler from "helper/apis/ErrorHandler";
import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import { validateAndHashPassword } from "utils/utils";


// GET request handler
export const handleGetRequest = async (req, res) => {
  try {
    const { id } = req.query;
    // Fetch a specific flat by ID
    if (!id) throw ErrorHandler.badRequest("Id query is required.");

    const flat = await prisma.Flat.findUnique({ where: { id } });
    if (!flat) throw ErrorHandler.notFound("Flat not found");
    return res.status(200).json(flat);
  } catch (error) {
    return ErrorHandler.internalError(error);
  }
};

// PUT request handler
export const handlePutRequest = async (req, res) => {
  const {
    id,
    phone,
    user_name,
    email,
    password,
  } = req.body;


  if (!id) throw ErrorHandler.badRequest("ID is required.");



  try {
    const flat = await prisma.Flat.findUnique({ where: { id } });
    if (!flat) throw ErrorHandler.notFound("Flat not found");

    let hashedPassword = await validateAndHashPassword(password);

    // Update flat fields
    await prisma.Flat.update({
      where: { id },
      data: {
        phone,
        user_name,
        email,
        password: hashedPassword,
      },
    });
    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    throw ErrorHandler.internalError(error);
  }
};
