import ErrorHandler from "helper/apis/ErrorHandler";
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
		throw ErrorHandler.internalError(error);
	}
};

export const getEstimatedExpenses = async (req, res) => {
	try {
		const { tower_id } = req.query; // Optional filter for tower_id 

		// Return early if no tower query is provided
		if (!tower_id) throw ErrorHandler.badRequest("Tower query is required.");


		// Fetch the EstimatedExpenses data, grouped by month
		const expenses = await prisma.EstimatedExpenses.findMany({
			where: {
				tower_id,
			},
			orderBy: {
				created_at: 'asc',
			},
		});

		const processedData = expenses.map(expense => {
			const formattedDate = moment(expense.created_at).format('MMM YYYY');
			return {
				month: formattedDate,
				electricity: expense.electricity,
				water: expense.water,
				waste: expense.waste,
				guard: expense.guard,
				elevator: expense.elevator,
				others: expense.others,
				total: expense.electricity + expense.water + expense.waste + expense.guard + expense.elevator + expense.others,
			};
		});

		return res.status(200).json(processedData);
	} catch (error) {
		throw ErrorHandler.internalError(error);
	}
};
export const getPayments = async (req, res) => {
	try {
		const { tower_id } = req.query;

		if (!tower_id) throw ErrorHandler.badRequest("Tower query is required.");


		const settlements = await prisma.Settlement.findMany({
			where: {
				tower_id,
			},
			select: {
				payed_amount: true,
				created_at: true,
			},
		});
		console.log({ settlements });

		const groupedByMonth = settlements.reduce((acc, settlement) => {
			const formattedDate = moment(settlement.created_at).format('MMM YYYY');

			if (!acc[formattedDate]) {
				acc[formattedDate] = { month: formattedDate, payed_amount: 0 };
			}

			// Sum up the payed_amount for each month
			acc[formattedDate].payed_amount += settlement.payed_amount;

			return acc;
		}, {});
		console.log({ groupedByMonth });

		// Convert the object into an array of objects
		const groupedArray = Object.values(groupedByMonth);

		console.log({ groupedArray });



		return res.status(200).json(groupedArray);
	} catch (error) {
		throw ErrorHandler.internalError(error);
	}
};

