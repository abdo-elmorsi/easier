import prisma from 'lib/prisma';
import ErrorHandler from 'helper/apis/ErrorHandler';

// GET request handler
export const handleGetRequest = async (req, res) => {
  try {
    const { tower_id } = req.query;
    const messages = await prisma.chatMessage.findMany({
      where: {
        tower_id: tower_id  // Make sure tower_id is defined
      },
      include: {
        flat: {
          select: {
            number: true,
            floor: true,
            id: true
          }
        },
      },
      orderBy: {
        created_at: "asc",
      },
      take: 50,
    });
    return res.status(200).json(messages);
  } catch (error) {
    throw ErrorHandler.internalError(error);
  }
};

// POST request handler
export const handlePostRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const tower_id = req.user?.tower_id;
    const { content } = req.body;


    const tower = await prisma.Tower.findUnique({ where: { id: tower_id } });
    if (!tower) throw ErrorHandler.notFound("Tower not found");


    const newMessage = await prisma.chatMessage.create({
      data: {
        content,
        tower_id: tower_id,
        flat_id: userRole === 'flat' ? userId : null
      },
      include: {
        flat: {
          select: {
            number: true,
            floor: true,
            id: true
          }
        },
      }
    });
    return res.status(201).json(newMessage);
  } catch (error) {
    throw ErrorHandler.internalError(error);
  }
};

// PUT request handler
export const handlePutRequest = async (req, res) => {
  try {
    const { id, content } = req.body;
    if (!id) throw ErrorHandler.badRequest('Message ID is required');

    const updatedMessage = await prisma.chatMessage.update({
      where: { id },
      data: { content },
    });
    return res.status(200).json(updatedMessage);
  } catch (error) {
    throw ErrorHandler.internalError(error);
  }
};

// DELETE request handler
export const handleDeleteRequest = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) throw ErrorHandler.badRequest('Message ID is required');

    await prisma.chatMessage.delete({ where: { id } });
    return res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    throw ErrorHandler.internalError(error);
  }
};