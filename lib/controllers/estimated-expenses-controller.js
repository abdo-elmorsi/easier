import prisma from "lib/prisma"; // Ensure you have the correct import for your Prisma client
import moment from "moment-timezone";
import CloudinaryService from "lib/CloudinaryService";
import ErrorHandler from "helper/apis/ErrorHandler";


// GET request handler
export const handleGetRequest = async (req, res) => {
  try {
    const { id, tower_id, month, search } = req.query;

    if (id) {
      const estimatedExpenses = await prisma.EstimatedExpenses.findUnique({
        where: { id },
        include: {
          tower: { select: { name: true, id: true } },
        },
      });
      if (!estimatedExpenses) throw ErrorHandler.notFound("EstimatedExpenses not found");

      return res.status(200).json(estimatedExpenses);
    }

    if (!tower_id) throw ErrorHandler.badRequest("Tower query is required to retrieve estimated expenses.");


    const filters = {};

    if (search) {
      filters.OR = [
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const whereClause = {
      ...(tower_id && { tower_id: tower_id }),
      ...(month && {
        created_at: {
          gte: moment(month).startOf('month').toDate(),
          lte: moment(month).endOf('month').toDate(),
        },
      }),
      ...filters,
    };

    const items = await prisma.EstimatedExpenses.findMany({
      where: whereClause,
      // include: {
      //   tower: { select: { name: true, id: true } },
      // },
      orderBy: {
        created_at: 'desc',
      }
    });



    return res.status(200).json(items);
  } catch (error) {
    throw ErrorHandler.internalError(error);

  }
};

// POST request handler
export const handlePostRequest = async (req, res) => {
  const {
    towerId,
    electricity,
    water,
    waste,
    guard,
    elevator,
    others,
    notes,
    images
  } = req.body;


  try {
    if (!towerId) throw ErrorHandler.badRequest("Tower is required.");


    // Get the current date in a specific timezone (e.g., 'UTC')
    const currentMonth = moment().tz('UTC');

    const firstDayOfMonth = currentMonth.clone().startOf('month').toDate();
    const lastDayOfMonth = currentMonth.clone().endOf('month').toDate();

    // Check if an EstimatedExpenses record exists for the current month and tower
    const existingRecord = await prisma.EstimatedExpenses.findFirst({
      where: {
        tower_id: towerId,
        created_at: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    if (existingRecord) throw ErrorHandler.validationError("EstimatedExpenses for the current month already exists for this tower.");


    // Upload image if provided
    let newImagesUrls = null;
    if (images) {
      newImagesUrls = await CloudinaryService.uploadImages(images, 'estimated_expenses');
    }

    // Create new EstimatedExpenses record
    await prisma.EstimatedExpenses.create({
      data: {
        tower: { connect: { id: towerId } },
        electricity,
        water,
        waste,
        guard,
        elevator,
        others,
        notes,
        ...(newImagesUrls && { attachments: newImagesUrls?.map(img => img?.public_id) || [] }),
      },
    });

    return res.status(200).json({ message: 'OK' });

  } catch (error) {
    throw ErrorHandler.internalError(error);

  }
};

// PUT request handler
export const handlePutRequest = async (req, res) => {
  const {
    id,
    electricity,
    water,
    waste,
    guard,
    elevator,
    others,
    notes,
    images
  } = req.body;
  if (!id) throw ErrorHandler.badRequest("ID is required.");


  try {
    // Find the EstimatedExpenses by ID
    const estimatedExpenses = await prisma.EstimatedExpenses.findUnique({ where: { id } });
    if (!estimatedExpenses) throw ErrorHandler.notFound("EstimatedExpenses not found");




    // Upload image if provided
    let newImagesUrls = null;
    if (images) {
      if (estimatedExpenses.attachments.length > 0) {
        // Delete existing images from Cloudinary
        await Promise.all(estimatedExpenses.attachments.map(async (attachment) => await CloudinaryService.deleteImage(attachment)));
      }
      newImagesUrls = await CloudinaryService.uploadImages(images, 'estimated_expenses');
    }

    // If no existing EstimatedExpenses, proceed to update EstimatedExpenses
    await prisma.EstimatedExpenses.update({
      where: { id },
      data: {
        electricity: electricity,
        water: water,
        waste: waste,
        guard: guard,
        elevator: elevator,
        others: others,
        notes: notes,
        ...(newImagesUrls && { attachments: newImagesUrls?.map(img => img?.public_id) || [] }),
      },
    });

    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    throw ErrorHandler.internalError(error);

  }
};


// DELETE request handler
export const handleDeleteRequest = async (req, res) => {
  const { id } = req.body;
  if (!id) throw ErrorHandler.badRequest("ID is required.");
  try {
    await prisma.EstimatedExpenses.delete({ where: { id } });

    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    throw ErrorHandler.internalError(error);
  }
};
