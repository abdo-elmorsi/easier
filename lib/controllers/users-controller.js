import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import jwt from "jsonwebtoken";
import { isValidString, validateAndHashPassword } from "utils/utils";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "utils/uploadImage";


// Helper function to validate user input
const validateUserInput = (user_name, password, res) => {
  if (!isValidString(user_name)) {
    res.status(400).json({ message: "Username is required and must be a non-empty string." });
    return false;
  }
  if (!isValidString(password)) {
    res.status(400).json({ message: "Password is required and must be a non-empty string." });
    return false;
  }
  return true;
};

// GET request handler
export const handleGetRequest = async (query, res) => {
  try {
    const { id, search } = query;

    // Fetch specific user by ID
    if (id) {
      const user = await prisma.User.findUnique({
        where: { id },
        select: {
          id: true,
          user_name: true,
          role: true,
          img: true,
          phone: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!user) return res.status(404).json({ message: "User not found" });
      return res.status(200).json(user);
    }

    // Building the search filter
    const filters = {};

    if (search) {
      filters.OR = [
        { user_name: { contains: search, mode: 'insensitive' } }, // Case-insensitive search on user_name
        { phone: { contains: search, mode: 'insensitive' } },    // Case-insensitive search on phone
      ];
    }

    // Define fields to return based on forSelect flag
    const selectFields = {
      id: true,
      user_name: true,
      role: true,
      img: true,
      phone: true,
      created_at: true,
      updated_at: true
    }; // Otherwise, return full user info

    const users = await prisma.User.findMany({
      where: filters,
      select: selectFields,
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



// POST request handler
export const handlePostRequest = async (data, res) => {
  const { user_name, password, role = "user", img, phone } = data;

  if (!validateUserInput(user_name, password, res)) return;

  try {
    const existingUser = await prisma.User.findUnique({
      where: { user_name },
    });
    if (existingUser) return res.status(400).json({ message: "Username already taken" });

    // Hash the password before saving
    let hashedPassword = await validateAndHashPassword(password);

    // Upload image if provided
    let newImageUrl = null;
    if (img) {
      newImageUrl = await uploadImageToCloudinary(img, 'users');
    }



    const newUser = await prisma.User.create({
      data: {
        user_name,
        password: hashedPassword,
        role,
        ...(newImageUrl && { img: newImageUrl?.public_id || null }),
        phone
      }, // Use the User model for creation
    });

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const { password: _, ...sanitizedUser } = newUser; // Exclude password

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: sanitizedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT request handler
export const handlePutRequest = async (data, res) => {
  const { id, user_name, password, img, phone } = data;

  // Check if ID is provided
  if (!id) return res.status(400).json({ message: "User ID is required for updating." });

  try {
    // Fetch the user from the database
    const user = await prisma.User.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Validate user_name if provided
    if (user_name && !isValidString(user_name)) {
      return res.status(400).json({ message: "Username must be a valid non-empty string." });
    }

    // Validate password if provided
    let hashedPassword = password ? await validateAndHashPassword(password) : null;
    if (password && !hashedPassword) {
      return res.status(400).json({ message: "Password must be a valid non-empty string." });
    }

    // Prepare the update data object
    const updateData = {
      user_name,
      phone,
      ...(hashedPassword && { password: hashedPassword }), // Only update password if it's provided
    };

    // Check if a new image is provided
    if (img) {
      // Delete the old image if it exists
      if (user.img) {
        await deleteImageFromCloudinary(user.img); // Function to delete image from Cloudinary
      }

      // Upload the new image
      const newImageUrl = await uploadImageToCloudinary(img, 'users');
      updateData.img = newImageUrl?.public_id || null; // Update image with new image ID
    }

    // Update the user with the provided data
    const updatedUser = await prisma.User.update({
      where: { id },
      data: updateData,
    });

    // Exclude password from the response
    const { password: _, ...sanitizedUser } = updatedUser;

    return res.status(200).json({
      message: "User updated successfully",
      user: sanitizedUser,
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: `Error updating user: ${error.message}` });
  }
};


// DELETE request handler
export const handleDeleteRequest = async ({ id }, res) => {
  if (!id) res.status(400).json({ message: "User ID is required for deletion." });

  try {
    // Fetch the user from the database
    const user = await prisma.User.findUnique({ where: { id } });

    // Check if the user exists
    if (!user) res.status(404).json({ message: "User not found." });

    // Delete towers and associated flats if they exist
    const towers = await prisma.Tower.findMany({ where: { user_id: id } });

    if (towers.length > 0) {
      await prisma.$transaction([...towers.map((tower) => prisma.Flat.deleteMany({ where: { tower_id: tower.id } })),
      prisma.Tower.deleteMany({ where: { user_id: id } }),
      ]);
    }

    // Delete the associated image from Cloudinary if it exists
    if (user.img) await deleteImageFromCloudinary(user.img); // Function to delete image from Cloudinary


    // Delete the user from the database
    await prisma.User.delete({ where: { id } });

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: `Error deleting user: ${error.message}` });
  }
};
