import ErrorHandler from "helper/apis/ErrorHandler";
import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import moment from "moment-timezone";


// GET request handler
export const getMonthlyReport = async (req, res) => {
	try {
		const { tower_id, flat_id, search, month = new Date() } = req.query;

		if (!tower_id) throw new Error("Tower is required!");


		const flatCount = await prisma.Flat.count({
			where: { tower_id },
		});

		const estimatedExpenses = await prisma.EstimatedExpenses.findFirst({
			where: {
				tower_id,
				created_at: {
					gte: moment(month).startOf('month').toDate(),
					lte: moment(month).endOf('month').toDate(),
				},
			},
			select: {
				electricity: true,
				water: true,
				waste: true,
				guard: true,
				elevator: true,
				others: true,
			}
		});

		console.log({ flatCount });
		console.log({ estimatedExpenses });


		const whereClause = {
			flat_id,
			tower_id,
			created_at: {
				gte: moment(month).startOf('month').toDate(),
				lte: moment(month).endOf('month').toDate(),
			},
		};
		if (search) {
			whereClause.OR = [{ notes: { contains: search, mode: 'insensitive' } }];
		}
		const items = await prisma.Settlement.findMany({
			where: whereClause,
			include: {
				// tower: { select: { name: true, id: true } },
				flat: { select: { number: true, floor: true, id: true } },
			},
			orderBy: [
				{
					flat: {
						floor: 'asc', // Sort by floor in ascending order
					},
				},
				{
					flat: {
						number: 'asc', // Sort by flat number in ascending order
					},
				},
			],
		})

		const expenseKeys = ['electricity', 'water', 'waste', 'guard', 'elevator', 'others'];

		const calcAmount = (isHas, payPercentage, estimatedAmount, flatCount) => {
			return isHas ? (estimatedAmount / flatCount) * (payPercentage / 100) : 0;
		};

		const formattedItems = items.map(item => {
			const total_expenses = expenseKeys.reduce((total, key) => {
				const amount = calcAmount(item[key], item.pay_percentage, estimatedExpenses[key], flatCount);
				item[key] = amount; // Update item with calculated amount
				return total + amount; // Accumulate the total amount
			}, 0);

			return {
				...item,
				total_expenses,
				net_amount: item.payed_amount - total_expenses
			};
		});

		return res.status(200).json(formattedItems);
	} catch (error) {
		throw ErrorHandler.internalError(error);

	}
};
