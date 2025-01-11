import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isValidString } from "utils/utils";

const prisma = new PrismaClient();

// Helper function to validate user input
const validateUserInput = (newPassword, oldPassword, res) => {
	if (!isValidString(newPassword)) {
		res.status(400).json({ message: "New password is required and must be a non-empty string." });
		return false;
	}
	if (!isValidString(oldPassword)) {
		res.status(400).json({ message: "Old password is required and must be a non-empty string." });
		return false;
	}
	return true;
};

// Register handler
export const handleRegister = async (data, res) => {
	const { user_name, password, role } = data;

	if (!validateUserInput(user_name, password, res)) return;

	try {
		// Check if the user already exists
		const existingUser = await prisma.user.findUnique({
			where: { user_name },
		});
		if (existingUser) {
			return res.status(400).json({ message: "Username already taken try another one!" });
		}

		// Hash the password before saving
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create a new user
		const newUser = await prisma.user.create({
			data: {
				user_name,
				password: hashedPassword,
				role: role || "user", // Default to "user" if no role is provided
			},
		});

		// Create JWT token
		const token = jwt.sign({ userId: newUser.id, role: newUser.role }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		return res.status(201).json({
			message: "User registered successfully",
			token,
			user: {
				id: newUser.id,
				user_name: newUser.user_name,
				role: newUser.role,
			},
		});
	} catch (error) {
		return res.status(500).json({ message: error?.message || "Internal server error" });
	}
};

// Login handler
export const handleLogin = async (data, res) => {
	const { password, asFlat, number, floor, user_name } = data;

	// Validate input
	if (!password || (!user_name && (!number || !floor))) {
		return res.status(400).json({ message: "Invalid input: All fields are required" });
	}

	try {
		// Determine query based on login method
		const query = asFlat
			? { where: { number, floor } }
			: { where: { user_name } };

		// Find the user or flat
		const user = await (asFlat ? prisma.flat.findFirst(query) : prisma.user.findUnique(query));

		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Verify password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Generate JWT token
		const token = jwt.sign(
			{ userId: user.id, role: user.role || "flat" },
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		// Respond with user data and token
		return res.status(200).json({
			message: "Login successful",
			token,
			user: {
				id: user.id,
				user_name: user.user_name || `${user.number}-${user.floor}`,
				role: user.role || "flat",
				phone: user.phone,
				img: user.img || null,
			},
		});
	} catch (error) {
		return res.status(500).json({ message: error.message || "Internal server error" });
	}
};


// Update password handler
export const handleUpdatePassword = async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	if (!validateUserInput(newPassword, oldPassword, res)) return;

	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user_id },
		});

		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		const isMatch = await bcrypt.compare(oldPassword, user.password); // Compare with hashed password

		if (!isMatch) {
			return res.status(400).json({ message: "Old password is incorrect" });
		}

		// Hash the new password
		user.password = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { id: user.id },
			data: { password: user.password },
		}); // Save updated user

		return res.status(200).json({ message: "Password updated successfully" });
	} catch (error) {
		return res.status(500).json({ message: error?.message || "Internal server error" });
	}
};
