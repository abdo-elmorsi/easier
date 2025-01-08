// utils/uploadImage.js
import cloudinary from '../lib/cloudinaryConfig';

export const uploadImageToCloudinary = async (filePath, folder = 'default_folder') => {
	try {
		const result = await cloudinary.uploader.upload(filePath, {
			folder: folder,
			use_filename: true,
			unique_filename: false,
		});
		return result;
	} catch (error) {
		console.error('Error uploading image to Cloudinary:', error);
		throw new Error('Image upload failed');
	}
};
