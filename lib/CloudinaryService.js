import cloudinary from './cloudinaryConfig';

class CloudinaryService {
	/**
	 * Upload a single image to Cloudinary
	 * @param {string | Buffer} file - The image file as a base64 string or file path.
	 * @param {string} [folder='default_folder'] - The folder in Cloudinary to store the image.
	 * @returns {Promise<Object>} - The result of the upload.
	 * @throws Will throw an error if the upload fails.
	 */
	static async uploadImage(file, folder = 'default_folder') {
		if (!file || (typeof file !== 'string' && !(file instanceof Buffer))) {
			throw new Error('Invalid file input');
		}

		try {
			const result = await cloudinary.uploader.upload(file, {
				folder,
				use_filename: true,
				unique_filename: false,
				format: 'jpeg', // Ensure the image is uploaded as a JPEG
				transformation: [
					{
						width: 800,
						height: 800,
						quality: '100',
					},
				],
				resource_type: 'image',
			});
			return result;
		} catch (error) {
			console.error('Error uploading image to Cloudinary:', error);
			throw new Error(`Image upload failed: ${error.message}`);
		}
	}

	/**
	 * Upload multiple images to Cloudinary
	 * @param {Array<string | Buffer>} files - An array of image files as base64 strings or file paths.
	 * @param {string} [folder='default_folder'] - The folder in Cloudinary to store the images.
	 * @returns {Promise<Array<Object>>} - An array of results from the uploads.
	 * @throws Will throw an error if any upload fails.
	 */
	static async uploadImages(files, folder = 'default_folder') {
		if (!Array.isArray(files) || files.length === 0) {
			throw new Error('Invalid files input. Must be a non-empty array of images.');
		}

		const uploadPromises = files.map(file => this.uploadImage(file, folder));

		try {
			const results = await Promise.all(uploadPromises);
			return results;
		} catch (error) {
			console.error('Error uploading images to Cloudinary:', error);
			throw new Error(`Batch image upload failed: ${error.message}`);
		}
	}

	/**
	 * Delete an image from Cloudinary
	 * @param {string} publicId - The public ID of the image to delete.
	 * @throws Will throw an error if the deletion fails.
	 */
	static async deleteImage(publicId) {
		if (!publicId) {
			throw new Error('Public ID is required to delete the image.');
		}

		try {
			await cloudinary.uploader.destroy(publicId);
		} catch (error) {
			console.error('Error deleting image from Cloudinary:', error);
			throw new Error(`Image deletion failed: ${error.message}`);
		}
	}

	/**
	 * Get image data from Cloudinary by public ID
	 * @param {string} publicId - The public ID of the image.
	 * @returns {Promise<Object>} - The image data from Cloudinary.
	 * @throws Will throw an error if the retrieval fails.
	 */
	static async getImageById(publicId) {
		if (!publicId) {
			throw new Error('Public ID is required to fetch the image data.');
		}

		try {
			const imageData = await cloudinary.api.resource(publicId, {
				exif: false, // Retrieve EXIF metadata
				colors: false, // Retrieve prominent colors
				phash: false, // Retrieve perceptual hash
			});
			return imageData;
		} catch (error) {
			console.error('Error fetching image data from Cloudinary:', error);
			throw new Error(`Image data retrieval failed: ${error.message}`);
		}
	}

	/**
	 * Get all images data from Cloudinary
	 * @param {Object} options - Optional parameters for pagination and filtering.
	 * @param {number} [options.page=1] - The page number for pagination (defaults to 1).
	 * @param {number} [options.perPage=100] - The number of items per page (defaults to 100).
	 * @returns {Promise<Array>} - The data of all images from Cloudinary.
	 * @throws Will throw an error if the retrieval fails.
	 */
	static async getAllImages({ page = 1, perPage = 100 } = {}) {
		try {
			const response = await cloudinary.api.resources({
				type: 'upload', // Limit to images uploaded
				resource_type: 'image', // Specify resource type (image)
				max_results: perPage, // Limit the number of results per page
				page, // The current page for pagination
			});

			return response.resources; // Returns an array of image data
		} catch (error) {
			console.error('Error fetching all image data from Cloudinary:', error);
			throw new Error(`Fetching all images failed: ${error.message}`);
		}
	}
}

export default CloudinaryService;
