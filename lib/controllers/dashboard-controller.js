import prisma from "lib/prisma";
import moment from 'moment-timezone';

// Get report with user count, product count, transaction count (sales/purchases), and percentage change
export const getCounts = async (req, res) => {
	try {


		// Count Tower in the current and previous periods
		const towerCount = await prisma.Tower.count();

		const flatCount = await prisma.Flat.count();

		// Return report data
		res.status(200).json({
			towerCount,
			flatCount,
		});

	} catch (error) {
		return res.status(500).json({ message: error?.message || "An error occurred while generating the report" });
	}
};

export const getEstimatedExpenses = async (req, res) => {
	try {
		const { tower_id } = req.query; // Optional filter for tower_id 
		const timezone = req.headers['timezone'] || 'UTC'; // Default to UTC if no timezone is provided

		// Fetch the EstimatedExpenses data, grouped by month
		const expenses = await prisma.EstimatedExpenses.findMany({
			where: {
				tower_id: tower_id ? tower_id : undefined, // Filter by tower if provided
			},
			include: {
				tower: { select: { name: true, id: true } },
			},
			orderBy: {
				created_at: 'asc', // Order by date to ensure chronological order
			},
		});

		// Process data into a format suitable for Recharts
		const processedData = expenses.map(expense => {
			// Format the created_at date using moment-timezone with the provided timezone
			const formattedDate = moment(expense.created_at).tz(timezone || 'UTC').format('MMM YYYY'); // Default to UTC if no timezone provided
			return {
				month: formattedDate,
				electricity: expense.electricity,
				water: expense.water,
				waste: expense.waste,
				guard: expense.guard,
				elevator: expense.elevator,
				others: expense.others,
				total: expense.electricity + expense.water + expense.waste + expense.guard + expense.elevator + expense.others,
				tower_id: expense.tower_id, // Include tower ID to differentiate if needed
				tower_name: expense.tower.name, // Include tower ID to differentiate if needed
			};
		});

		return res.status(200).json(processedData);
	} catch (error) {
		return res.status(500).json({ message: error?.message || "An error occurred while generating the report" });
	}
};

