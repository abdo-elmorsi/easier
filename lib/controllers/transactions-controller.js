import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import moment from 'moment-timezone';

// Validate transaction type
const isValidTransactionType = (type) => {
  const validTypes = [
    "storeIn",
    "storeOut",
    "storeToMarket",
    "marketToStore",
    "marketOut",
    "marketReturn"
  ];
  return validTypes.includes(type);
};

// Validate quantity
const isValidQuantity = (quantity) => quantity > 0;

// Get transactions with optional filters and pagination
export const getTransactions = async (req, res) => {

  try {
    const {
      id,
      productId,
      createdById,
      lastUpdatedById,
      search,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      getProductDetails = false
    } = req.query;

    // Fetch a specific transaction by ID
    if (id) {
      const transaction = await prisma.Transaction.findUnique({
        where: { id },
        include: {
          product: { select: { name: true, id: true } },
          // createdBy: { select: { user_name: true, id: true } },
          // lastUpdatedBy: { select: { user_name: true, id: true } },
        },
      });

      if (!transaction) return res.status(404).json({ message: "Transaction not found" });

      return res.status(200).json(transaction);
    }

    // Initialize filter object
    const transactionFilter = {};
    if (productId) transactionFilter.productId = productId;
    if (createdById) transactionFilter.createdById = createdById;
    if (lastUpdatedById) transactionFilter.lastUpdatedById = lastUpdatedById;

    // Handle multiple types
    if (type) {
      // Convert `type` into an array if it's not already one
      const typeArray = type.split(',').map(t => t.trim()).filter(Boolean);
      transactionFilter.type = { in: typeArray }; // Prisma supports `in` for multiple values
    }
    // Search filter: Can search by product name, description, or quantity
    if (search) {
      transactionFilter.OR = [
        { product: { name: { contains: search, mode: 'insensitive' } } }, // Search by product name
        { description: { contains: search, mode: 'insensitive' } }, // Search by description
        { quantity: { equals: isNaN(Number(search)) ? undefined : Number(search) } }, // Search by quantity if a number
      ];
    }

    // Handle date filtering with timezone adjustment
    if (startDate || endDate) {
      transactionFilter.createdAt = {};
      if (startDate) {
        const start = moment.tz(startDate, req.headers['timezone']).startOf("day").toDate();
        transactionFilter.createdAt.gte = start;
      }
      if (endDate) {
        const end = moment.tz(endDate, req.headers['timezone']).endOf("day").toDate();
        transactionFilter.createdAt.lte = end;
      }
    }

    const totalTransactions = await prisma.transaction.count({
      where: transactionFilter,
    });

    const transactions = await prisma.transaction.findMany({
      where: transactionFilter,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            ...(getProductDetails ? {
              price: true,
              wholesalePrice: true,
              piecesNo: true,
            } : {})
          }
        },
        createdBy: { select: { user_name: true, id: true } },
        lastUpdatedBy: { select: { user_name: true, id: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
    });

    return res.status(200).json({
      message: "Transactions retrieved successfully",
      transactions,
      currentPage: page,
      totalPages: Math.ceil(totalTransactions / limit),
      totalTransactions,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



// Handle stock movement
export const handleStockMovement = async (data, res) => {
  const { productId, type, quantity, createdById, description, customDate = null } = data;

  if (!isValidTransactionType(type)) {
    return res.status(400).json({ message: "Invalid transaction type" });
  }

  if (!isValidQuantity(quantity)) {
    return res.status(400).json({ message: "Quantity must be greater than zero" });
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const stockCheckTypes = ["storeOut", "storeToMarket"];
    const marketCheckTypes = ["marketOut", "marketToStore"];

    if (stockCheckTypes.includes(type) && product.quantityInStore < quantity) {
      return res.status(400).json({ message: "Insufficient stock for this operation" });
    }

    if (marketCheckTypes.includes(type) && product.quantityInMarket < quantity) {
      return res.status(400).json({ message: "Insufficient stock for this operation" });
    }

    // Update stock first
    await updateProductStock(productId, quantity, type, product, "add");

    // Fetch updated product state after stock update
    const updatedProduct = await prisma.product.findUnique({ where: { id: productId } });

    // const customDate = new Date('2024-11-06T21:27:31.455Z');
    // const customDate = new Date();
    // customDate.setHours(customDate.getHours() - 3);

    const newTransaction = await prisma.transaction.create({
      data: {
        product: { connect: { id: productId } },
        type,
        quantity,
        createdBy: { connect: { id: createdById } },
        lastUpdatedBy: { connect: { id: createdById } },
        ...(customDate ? {
          createdAt: customDate,
          updatedAt: customDate
        } : {}),
        description,
      },
    });

    return res.status(200).json({
      message: "Stock movement recorded successfully",
      product: updatedProduct, // Return the updated product state
      transaction: newTransaction,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update stock movement
export const updateStockMovement = async (data, res) => {
  const { id, quantity, lastUpdatedById, description, customDate = null } = data;

  if (!isValidQuantity(quantity)) {
    return res.status(400).json({ message: "Quantity must be greater than zero" });
  }

  try {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: { product: true } // Include product to get current stock info
    });

    if (!existingTransaction) return res.status(404).json({ message: "Transaction not found" });

    const { productId, type, quantity: oldQuantity } = existingTransaction;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Adjust stock by removing the old quantity based on the transaction type
    await updateProductStock(productId, oldQuantity, type, product, 'remove'); // Specify remove action

    // Update the transaction record
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        product: { connect: { id: productId } },
        quantity,
        lastUpdatedBy: { connect: { id: lastUpdatedById } },
        ...(customDate ? {
          createdAt: customDate,
        } : {}),
        description,
      },
    });

    // Fetch updated product state after removing old quantity
    const updatedProduct = await prisma.product.findUnique({ where: { id: productId } });

    // Now add the new quantity to the product stock
    await updateProductStock(productId, quantity, updatedTransaction.type, updatedProduct, 'add'); // Specify add action

    return res.status(200).json({
      message: "Stock movement updated successfully",
      product: updatedProduct, // Return the updated product state
      transaction: updatedTransaction,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// DELETE request handler
export const handleDeleteRequest = async ({ id }, res) => {
  if (!id) return res.status(400).json({ message: "ID is required for deletion." });

  try {
    await prisma.transaction.delete({ where: { id } });
    return res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// Update product stock based on transaction type
const updateProductStock = async (productId, quantity, type, product, action) => {
  const updates = {
    quantityInStore: product.quantityInStore,
    quantityInMarket: product.quantityInMarket,
    quantityInStock: product.quantityInStock
  };


  // Adjust the stock based on the action (remove/add)
  if (action === 'remove') {
    switch (type) {
      case "storeIn":
        updates.quantityInStore -= quantity;
        updates.quantityInStock -= quantity;
        break;
      case "storeOut":
        updates.quantityInStore += quantity; // Store out means we add back to stock
        updates.quantityInStock += quantity;
        break;
      case "storeToMarket":
        updates.quantityInStore += quantity; // Store to market means we add back to store
        updates.quantityInMarket -= quantity;
        break;
      case "marketToStore":
        updates.quantityInMarket += quantity; // Market to store means we add back to market
        updates.quantityInStore -= quantity;
        break;
      case "marketOut":
        updates.quantityInMarket += quantity; // Market out means we add back to stock
        updates.quantityInStock += quantity;
        break;
      case "marketReturn":
        updates.quantityInMarket -= quantity;
        updates.quantityInStock -= quantity;
        break;
      default:
        throw new Error("Unsupported transaction type");
    }
  } else if (action === 'add') {
    switch (type) {
      case "storeIn":
        updates.quantityInStore += quantity;
        updates.quantityInStock += quantity;
        break;
      case "storeOut":
        updates.quantityInStore -= quantity;
        updates.quantityInStock -= quantity;
        break;
      case "storeToMarket":
        updates.quantityInStore -= quantity;
        updates.quantityInMarket += quantity;
        break;
      case "marketToStore":
        updates.quantityInMarket -= quantity;
        updates.quantityInStore += quantity;
        break;
      case "marketOut":
        updates.quantityInMarket -= quantity;
        updates.quantityInStock -= quantity;
        break;
      case "marketReturn":
        updates.quantityInMarket += quantity;
        updates.quantityInStock += quantity;
        break;
      default:
        throw new Error("Unsupported transaction type");
    }
  }

  await prisma.product.update({
    where: { id: productId },
    data: updates,
  });
};