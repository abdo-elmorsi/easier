// utils/uploadImage.js
import cloudinary from '../lib/cloudinaryConfig';

export const uploadImageToCloudinary = async (file, folder = 'default_folder') => {
	try {
		// Check if the input file is a valid string (base64 or file path)
		if (!file || (typeof file !== 'string' && !(file instanceof Buffer))) {
			throw new Error('Invalid file input');
		}

		// Upload the image to Cloudinary, ensuring JPEG format
		const result = await cloudinary.uploader.upload(file, {
			folder: folder,
			use_filename: true,
			unique_filename: false,
			format: 'jpeg', // Force the image to be uploaded as a JPEG
		});

		return result;
	} catch (error) {
		console.error('Error uploading image to Cloudinary:', error);
		throw new Error(`Image upload failed: ${error.message}`);
	}
};
