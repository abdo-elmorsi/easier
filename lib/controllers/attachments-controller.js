import ErrorHandler from "helper/apis/ErrorHandler";
import CloudinaryService from "lib/CloudinaryService";


// GET request handler
export const handleGetRequest = async (req, res) => {
  try {
    const { id, page = 1, perPage = 100, public_ids = '' } = req.query;

    // Check if we need a single image by ID
    if (id) {
      const image = await CloudinaryService.getImageById(id);
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }
      return res.status(200).json(image);
    }


    // Parse public_ids as an array, even if it's a string (e.g. 'id1,id2')
    if (public_ids) {
      const publicIdArray = public_ids.split(','); // Convert to an array of IDs
      const images = await Promise.all(publicIdArray.map(async (public_id) => {
        const image = await CloudinaryService.getImageById(public_id);
        return image;
      }));
      return res.status(200).json(images);

    }


    const items = await CloudinaryService.getAllImages({ page, perPage });

    return res.status(200).json(items);

  } catch (error) {
    throw ErrorHandler.internalError(error);
  }
};




// DELETE request handler
export const handleDeleteRequest = async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) throw new Error("ID is required.");

  try {
    await CloudinaryService.getImageById(publicId);

    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    throw ErrorHandler.internalError(error);

  }
};
