import ErrorHandler from "helper/apis/ErrorHandler";
import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import moment from "moment-timezone";


// GET request handler
export const getMonthlyReport = async (req, res) => {
	const { tower_id, flat_id, search, month = new Date() } = req.query;
	try {

		if (!tower_id) throw ErrorHandler.badRequest("Tower is required!");


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
export const getAnnuallyReport = async (req, res) => {
	const { tower_id, flat_id, search, year = new Date() } = req.query;
	try {

		if (!tower_id || !flat_id) {
			const missingField = !tower_id ? "Tower" : "Flat";
			throw ErrorHandler.badRequest(`${missingField} is required!`);
		}

		const flatCount = await prisma.Flat.count({ where: { tower_id } });

		const yearStart = moment(year).startOf('year').toDate();
		const yearEnd = moment(year).endOf('year').toDate();

		const estimatedExpenses = await prisma.EstimatedExpenses.findMany({
			where: {
				tower_id,
				created_at: {
					gte: yearStart,
					lte: yearEnd,
				},
			},
			select: {
				electricity: true,
				water: true,
				waste: true,
				guard: true,
				elevator: true,
				others: true,
				created_at: true,
			}
		});

		const whereClause = {
			flat_id,
			tower_id,
			created_at: {
				gte: yearStart,
				lte: yearEnd,
			},
			...(search && { OR: [{ notes: { contains: search, mode: 'insensitive' } }] }),
		};

		const items = await prisma.Settlement.findMany({
			where: whereClause,
			include: {
				flat: { select: { number: true, floor: true, id: true } },
			},
			orderBy: [
				{ flat: { floor: 'asc' } },
				{ flat: { number: 'asc' } },
			],
		});

		const expenseKeys = ['electricity', 'water', 'waste', 'guard', 'elevator', 'others'];

		const calculateAmount = (isHas, payPercentage, estimatedAmount, flatCount) =>
			isHas ? (estimatedAmount / flatCount) * (payPercentage / 100) : 0;

		const formattedItems = items.map(item => {
			const totalExpenses = expenseKeys.reduce((total, key) => {
				const itemMonth = moment(item.created_at).month();
				const currentEstimatedExpenses = estimatedExpenses.find(estimated =>
					moment(estimated.created_at).month() === itemMonth
				);

				const estimatedAmount = currentEstimatedExpenses ? currentEstimatedExpenses[key] : 0;
				const amount = calculateAmount(item[key], item.pay_percentage, estimatedAmount, flatCount);

				item[key] = amount;

				return total + amount;
			}, 0);

			return {
				...item,
				total_expenses: totalExpenses,
				net_amount: item.payed_amount - totalExpenses
			};
		});

		return res.status(200).json(formattedItems);
	} catch (error) {
		throw ErrorHandler.internalError(error);
	}
};


export const getTowerBalances = async (req, res) => {
	const { tower_id } = req.query;

	try {
		if (!tower_id) throw ErrorHandler.badRequest("Tower is required!");

		const openingBalance = await prisma.OpeningBalance.findFirst({
			where: {
				tower_id,
				created_at: {
					gte: moment().startOf('year').toDate(),
					lte: moment().endOf('year').toDate(),
				},
			},
		});

		const totalIncome = await prisma.Settlement.aggregate({
			where: {
				tower_id,
				created_at: {
					gte: moment().startOf('year').toDate(),
					lte: moment().endOf('year').toDate(),
				},
			},
			_sum: {
				payed_amount: true,
			},
		});


		const totalOutCome = await prisma.EstimatedExpenses.aggregate({
			where: {
				tower_id,
				created_at: {
					gte: moment().startOf('year').toDate(),
					lte: moment().endOf('year').toDate(),
				},
			},
			_sum: {
				electricity: true,
				water: true,
				waste: true,
				guard: true,
				elevator: true,
				others: true,
			},
		})

		const _openingBalance = openingBalance?.balance || 0;
		const _totalIncome = totalIncome._sum?.payed_amount || 0;
		const _totalOutCome = totalOutCome._sum || {
			electricity: 0,
			water: 0,
			waste: 0,
			guard: 0,
			elevator: 0,
			others: 0,
		};

		const _balance = _openingBalance + _totalIncome
			+ _totalOutCome.electricity
			+ _totalOutCome.water
			+ _totalOutCome.waste
			+ _totalOutCome.guard
			+ _totalOutCome.elevator
			+ _totalOutCome.others

		res.status(200).json({
			openingBalance: _openingBalance,
			totalIncome: _totalIncome,
			totalOutCome: _totalOutCome,
			balance: _balance
		});
	} catch (error) {
		throw ErrorHandler.internalError(error);
	}
};