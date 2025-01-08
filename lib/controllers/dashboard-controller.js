import prisma from "lib/prisma";
import moment from 'moment-timezone';
import { calculatePercentageChange, getDateRange } from "utils/utils";

// Get report with user count, product count, transaction count (sales/purchases), and percentage change
export const getCounts = async (req, res) => {
	try {
		const { startDate, endDate } = req.query;
		const timezone = req.headers['timezone'] || 'UTC'; // Default to UTC if no timezone is provided

		if (!startDate || !endDate) {
			return res.status(400).json({ message: "Please provide both startDate and endDate." });
		}

		// Get date range for the current period
		const { start, end } = getDateRange(startDate, endDate, timezone);

		// Get date range for the previous period (for percentage comparison)
		const previousStart = moment.tz(startDate, timezone).subtract(end - start, 'milliseconds').toDate();
		const previousEnd = moment.tz(startDate, timezone).subtract(1, 'days').endOf("day").toDate();

		// Count users in the current and previous periods
		const userCount = await prisma.user.count();

		// const prevUserCount = await prisma.user.count({
		// 	where: {
		// 		createdAt: {
		// 			gte: previousStart,
		// 			lte: previousEnd,
		// 		},
		// 	},
		// });

		// Count products in the current and previous periods
		const productCount = await prisma.product.count();

		// const prevProductCount = await prisma.product.count({
		// 	where: {
		// 		createdAt: {
		// 			gte: previousStart,
		// 			lte: previousEnd,
		// 		},
		// 	},
		// });

		// Count sales (marketOut) transactions in the current and previous periods
		const salesCount = await prisma.transaction.count({
			where: {
				type: 'marketOut',
				createdAt: {
					gte: start,
					lte: end,
				},
			},
		});

		const prevSalesCount = await prisma.transaction.count({
			where: {
				type: 'marketOut',
				createdAt: {
					gte: previousStart,
					lte: previousEnd,
				},
			},
		});

		// Count purchase (storeIn) transactions in the current and previous periods
		const purchaseCount = await prisma.transaction.count({
			where: {
				type: 'storeIn',
				createdAt: {
					gte: start,
					lte: end,
				},
			},
		});

		const prevPurchaseCount = await prisma.transaction.count({
			where: {
				type: 'storeIn',
				createdAt: {
					gte: previousStart,
					lte: previousEnd,
				},
			},
		});

		// Calculate percentage change for users, products, sales, and purchases
		const userPercentChange = calculatePercentageChange(0, userCount);
		const productPercentChange = calculatePercentageChange(0, productCount);
		const salesPercentChange = calculatePercentageChange(prevSalesCount, salesCount);
		const purchasePercentChange = calculatePercentageChange(prevPurchaseCount, purchaseCount);

		// Return report data
		res.status(200).json({
			userCount,
			productCount,
			salesCount,                // Include sales count
			purchaseCount,             // Include purchase count
			userPercentChange,
			productPercentChange,
			salesPercentChange,        // Include sales percentage change
			purchasePercentChange,     // Include purchase percentage change
		});

	} catch (error) {
		return res.status(500).json({ message: error?.message || "An error occurred while generating the report" });
	}
};


