// lib/prisma.js
import { PrismaClient } from '@prisma/client';

// Declare a variable to hold the Prisma client instance
let prisma;

// Check if the environment is development or production
if (process.env.NODE_ENV === 'development') {
	// In development mode, instantiate a new Prisma client instance for each request
	prisma = new PrismaClient({
		log: ['query', 'info', 'warn', 'error'], // Enable logging in development
	});
} else {
	// In production mode, reuse the same Prisma client instance
	if (!global.prisma) {
		global.prisma = new PrismaClient();
	}
	prisma = global.prisma;
}

// Handle Prisma client errors
prisma.$on('error', (error) => {
	console.error('Prisma Client Error:', error.message);
});

// Optionally log when the client is connected
prisma.$connect().catch((error) => {
	console.error('Prisma Client Connection Error:', error.message);
});

// Export the Prisma client instance
export default prisma;