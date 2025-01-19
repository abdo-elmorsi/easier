import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import ErrorHandler from "helper/apis/ErrorHandler";
import { isValidString, validateAndHashPassword } from "utils/utils";

const prisma = new PrismaClient();

// Register handler
export const handleRegister = async (req, res) => {
	const { user_name, password, role } = req.body;

	if (!isValidString(user_name)) throw new Error("User name must be a valid string");
	;

	try {
		// Check if the user already exists
		const existingUser = await prisma.user.findUnique({
			where: { user_name },
		});
		if (existingUser) throw ErrorHandler.conflict("Name already taken");


		// Hash the password before saving
		const hashedPassword = await validateAndHashPassword(password);

		// Create a new user
		await prisma.user.create({
			data: {
				user_name,
				password: hashedPassword,
				role: role || "user", // Default to "user" if no role is provided
			},
		});



		return res.status(200).json({ message: 'OK' });

	} catch (error) {
		throw ErrorHandler.internalError(error);

	}
};

// Login handler
export const handleLogin = async (req, res) => {
	const { password, asFlat, number, floor, user_name } = req.body;

	// Validate input
	if (!password || (!user_name && (!number || !floor))) throw ErrorHandler.validationError("Invalid input: All fields are required");

	try {
		// Determine query based on login method
		const query = asFlat
			? { where: { number, floor } }
			: { where: { user_name } };

		// Find the user or flat
		const user = await (asFlat ? prisma.flat.findFirst(query) : prisma.user.findUnique(query));

		if (!user) throw ErrorHandler.unauthorized("Invalid credentials");

		// Verify password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) throw ErrorHandler.unauthorized("Invalid credentials");


		// Respond with user data 
		return res.status(200).json({
			user: {
				id: user.id,
				user_name: user.user_name || `${user.number}-${user.floor}`,
				role: user.role || "flat",
				phone: user.phone,
				img: user.img || null,
			},
		});
	} catch (error) {
		throw ErrorHandler.internalError(error);

	}
};


// Update password handler
export const handleUpdatePassword = async (req, res) => {
	const { oldPassword, newPassword } = req.body;

	if (!isValidString(newPassword)) throw new Error(" passwords must be valid");
	if (!isValidString(oldPassword)) throw new Error(" passwords must be valid");


	try {
		const user = await prisma.user.findUnique({ where: { id: req.user_id } });

		if (!user) throw new Error("User not found");


		const isMatch = await bcrypt.compare(oldPassword, user.password); // Compare with hashed password

		if (!isMatch) throw new Error("Old password is incorrect");


		// Hash the new password
		user.password = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { id: user.id },
			data: { password: user.password },
		}); // Save updated user

		return res.status(200).json({ message: 'OK' });

	} catch (error) {
		throw ErrorHandler.internalError(error);

	}
};
