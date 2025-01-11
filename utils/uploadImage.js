// utils/uploadImage.js
import cloudinary from '../lib/cloudinaryConfig';

/**
 * Upload a single image to Cloudinary
 * @param {string | Buffer} file - The image file as a base64 string or file path.
 * @param {string} [folder='default_folder'] - The folder in Cloudinary to store the image.
 * @returns {Promise<Object>} - The result of the upload.
 * @throws Will throw an error if the upload fails.
 */
export const uploadImageToCloudinary = async (file, folder = 'default_folder') => {
	if (!file || (typeof file !== 'string' && !(file instanceof Buffer))) {
		throw new Error('Invalid file input');
	}

	try {
		const result = await cloudinary.uploader.upload(file, {
			folder,
			use_filename: true,
			unique_filename: false,
			format: 'jpeg', // Ensure the image is uploaded as a JPEG
		});
		return result;
	} catch (error) {
		console.error('Error uploading image to Cloudinary:', error);
		throw new Error(`Image upload failed: ${error.message}`);
	}
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<string | Buffer>} files - An array of image files as base64 strings or file paths.
 * @param {string} [folder='default_folder'] - The folder in Cloudinary to store the images.
 * @returns {Promise<Array<Object>>} - An array of results from the uploads.
 * @throws Will throw an error if any upload fails.
 */
export const uploadImagesToCloudinary = async (files, folder = 'default_folder') => {
	if (!Array.isArray(files) || files.length === 0) {
		throw new Error('Invalid files input. Must be a non-empty array of images.');
	}

	const uploadPromises = files.map(file => uploadImageToCloudinary(file, folder));

	try {
		const results = await Promise.all(uploadPromises);
		return results;
	} catch (error) {
		console.error('Error uploading images to Cloudinary:', error);
		throw new Error(`Batch image upload failed: ${error.message}`);
	}
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete.
 * @throws Will throw an error if the deletion fails.
 */
export const deleteImageFromCloudinary = async (publicId) => {
	if (!publicId) {
		throw new Error('Public ID is required to delete the image.');
	}

	try {
		await cloudinary.uploader.destroy(publicId);
	} catch (error) {
		console.error('Error deleting image from Cloudinary:', error);
		throw new Error(`Image deletion failed: ${error.message}`);
	}
};