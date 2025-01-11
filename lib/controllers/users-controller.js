import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import jwt from "jsonwebtoken";
import { isValidString, validateAndHashPassword } from "utils/utils";
import bcrypt from "bcryptjs";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "utils/uploadImage";

const base64Image = `data:image/jpeg;base64,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`

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
  if (!id) {
    return res.status(400).json({ message: "ID is required for deletion." });
  }

  try {
    // Fetch the user from the database
    const user = await prisma.User.findUnique({
      where: { id },
    });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Delete the associated image from Cloudinary if it exists
    if (user.img) {
      await deleteImageFromCloudinary(user.img); // Function to delete image from Cloudinary
    }

    // Delete the user from the database
    await prisma.User.delete({
      where: { id },
    });

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: `Error deleting user: ${error.message}` });
  }
};