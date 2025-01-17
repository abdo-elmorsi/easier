import { ActionType, PageType } from "assets";
import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client


// GET request handler
export const handleGetRequest = async (req, res) => {
  try {
    const {
      search,
      action_id,
      page_id,
      user_id,
      page = 1,
      limit = 10,
    } = req.query;

    // Initialize filters
    const filters = {
      AND: [],
    };

    // Apply search filter if provided
    if (search) {
      filters.AND.push({
        OR: [
          { details: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Apply action filters if provided
    if (action_id) {
      filters.AND.push({
        action: { contains: ActionType[+action_id], mode: 'insensitive' },
      });
    }

    if (page_id) {
      filters.AND.push({
        action: { contains: PageType[+page_id], mode: 'insensitive' },
      });
    }

    // Add user_id filter if provided
    if (user_id) {
      filters.AND.push({ user_id: user_id });
    }

    const whereClause = filters;

    // Get total count of UserLogs
    const totalUserLogs = await prisma.UserLog.count({
      where: whereClause,
    });

    // Get paginated UserLogs
    const userLogs = await prisma.UserLog.findMany({
      where: whereClause,
      include: {
        user: { select: { user_name: true, id: true } },
      },
      skip: (page - 1) * limit,
      take: Number(limit),
    });

    return res.status(200).json({
      message: "User logs retrieved successfully",
      data: userLogs,
      currentPage: page,
      totalPages: Math.ceil(totalUserLogs / limit),
      totalUserLogs,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// POST request handler
export const handlePostRequest = async ({ action, status, details, user_id = null }) => {

  console.log("test".repeat(10));


  await prisma.UserLog.create({
    data: {
      action,
      status,
      details,
      // user: { connect: { id: user_id || req.user_id } }
      user_id: user_id
    },
  });
};



// DELETE request handler
export const handleDeleteRequest = async (req, res) => {
  const { id } = req.body;

  if (!id) res.status(400).json({ message: "ID is required for deletion." });

  try {
    await prisma.UserLog.delete({ where: { id } });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error deleting tower:", error);
    return res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};
