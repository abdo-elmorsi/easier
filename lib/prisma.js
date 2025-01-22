// lib/prisma.js
import { PrismaClient } from "@prisma/client";

let prisma; // Declare a variable to hold the Prisma client instance

const getPrismaInstance = () => {
	if (process.env.NODE_ENV === "development") {
		// In development, create a new instance if not already initialized
		if (!globalThis.prisma) {
			globalThis.prisma = new PrismaClient({
				log: ["info", "warn", "error"], // Enable detailed logs in development
			});

			globalThis.prisma.$on("error", (error) => {
				console.error("Prisma Client Error:", error.message);
			});
		}
		return globalThis.prisma;
	} else {
		// In production, reuse the singleton instance
		if (!globalThis.prisma) {
			globalThis.prisma = new PrismaClient({
				log: ["error"], // Minimize logs in production for better performance
			});

			globalThis.prisma.$on("error", (error) => {
				console.error("Prisma Client Error:", error.message);
			});
		}
		return globalThis.prisma;
	}
};

// Lazy initialization
prisma = getPrismaInstance();

// Graceful shutdown handling
const handleShutdown = async () => {
	try {
		if (prisma) {
			await prisma.$disconnect();
			console.info("Prisma client disconnected gracefully.");
		}
	} catch (error) {
		console.error("Error while disconnecting Prisma client:", error.message);
	}
};

process.on("SIGINT", handleShutdown); // Handle Ctrl+C
process.on("SIGTERM", handleShutdown); // Handle termination signal

export default prisma;
