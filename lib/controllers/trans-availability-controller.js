import prisma from "lib/prisma";
import { getDateRange, sum } from "utils/utils";

// Validate if transaction type is valid
const isValidTransactionType = (type) => {
  const validTypes = [
    "salesReturn",
    "purchaseReturn"
  ];
  return validTypes.includes(type);
};



// Helper function to fetch transactions based on type
const fetchTransactionsByType = async (transactionFilter, type, page, limit) => {
  const typeMap = {
    salesReturn: {
      outType: "marketOut",
      returnType: "marketReturn"
    },
    purchaseReturn: {
      outType: "storeIn",
      returnType: "storeOut"
    }
  };

  const { outType, returnType } = typeMap[type];

  const outTransactions = await prisma.transaction.findMany({
    where: { ...transactionFilter, type: outType },
    select: { quantity: true },
    skip: (page - 1) * limit,
    take: limit,
  });

  const returnTransactions = await prisma.transaction.findMany({
    where: { ...transactionFilter, type: returnType },
    select: { quantity: true },
    skip: (page - 1) * limit,
    take: limit,
  });

  const availableQty = sum(outTransactions, "quantity") - sum(returnTransactions, "quantity");

  return availableQty;
};

// Get transactions with optional filters and pagination
export const getTransactions = async (req, res) => {
  try {
    const { productId, type, page = 1, limit = 50 } = req.query;
    const timezone = req.headers['timezone'] || 'UTC'; // Default to UTC if no timezone is provided

    // Initialize transaction filter object
    const transactionFilter = {};
    if (productId) transactionFilter.productId = productId;

    // Validate transaction type if provided
    if (type && !isValidTransactionType(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    // Handle date filtering
    const { start, end } = getDateRange(new Date(), new Date(), timezone);
    transactionFilter.createdAt = {
      gte: start,
      lte: end,
    };

    // Handle specific transaction types ('salesReturn' or 'purchaseReturn')
    if (type) {
      const availableQty = await fetchTransactionsByType(transactionFilter, type, page, limit);
      return res.status(200).json(availableQty);
    }

    // Return error if unsupported transaction type
    return res.status(404).json({ message: "Transaction type not supported" });

  } catch (error) {
    return res.status(500).json({ message: "An error occurred while retrieving transactions" });
  }
};
