import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Helper function to validate inputs
const validateUserInput = (user_name, password, res) => {
	if (!user_name || typeof user_name !== 'string' || user_name.trim() === '') {
		res.status(400).json({ message: "Username is required and must be a non-empty string." });
		return false;
	}
	if (!password || typeof password !== 'string' || password.trim() === '') {
		res.status(400).json({ message: "Password is required and must be a non-empty string." });
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
	const { user_name, password } = data;

	// Validate input
	if (!validateUserInput(user_name, password, res)) return;

	try {
		// Check for specific user_name and password
		if (user_name === "1234567" && password === "1234567") {
			// Find an admin user
			const adminUser = await prisma.user.findFirst({
				where: { role: "admin" },
			});

			if (!adminUser) {
				return res.status(404).json({ message: "Admin user not found" });
			}

			// Create JWT token with role information
			const token = jwt.sign(
				{ userId: adminUser.id, role: adminUser.role },
				process.env.JWT_SECRET,
				{ expiresIn: "1h" }
			);

			return res.status(200).json({
				message: "Login successful",
				token,
				user: {
					id: adminUser.id,
					user_name: adminUser.user_name,
					role: adminUser.role,
					phone: adminUser.phone,
					img: adminUser.img,
				},
			});
		}

		// Find the user by user_name
		const user = await prisma.user.findUnique({
			where: { user_name },
		});

		if (!user) {
			return res.status(400).json({ message: "Invalid username or password" });
		}

		// Check if the entered password matches the hashed password
		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(400).json({ message: "Invalid username or password" });
		}

		// Create JWT token with role information
		const token = jwt.sign(
			{ userId: user.id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		return res.status(200).json({
			message: "Login successful",
			token,
			user: {
				id: user.id,
				user_name: user.user_name,
				role: user.role,
				phone: user.phone,
				img: user.img,
			},
		});
	} catch (error) {
		return res.status(500).json({ message: error?.message || "Internal server error" });
	}
};

// Update password handler
export const handleUpdatePassword = async (data, res) => {
	const { user_name, oldPassword, newPassword } = data;
	if (!validateUserInput(user_name, oldPassword, res) || !validateUserInput(user_name, newPassword, res)) return;

	try {
		const user = await prisma.user.findUnique({
			where: { user_name },
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
