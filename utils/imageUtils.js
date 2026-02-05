import { compressIfNeededService } from '../services/compressFileService.js';

/**
 * Utility function to compress a single image file
 * @param {Object} file - Multer file object with buffer and mimetype
 * @returns {Buffer} - Compressed image buffer
 */
export const compressImage = async (file) => {
    if (!file || !file.buffer || !file.mimetype) {
        throw new Error('Invalid file object provided');
    }
    
    return await compressIfNeededService(file.buffer, file.mimetype);
};

/**
 * Utility function to compress multiple image files
 * @param {Array} files - Array of multer file objects
 * @returns {Array} - Array of compressed image buffers
 */
export const compressImages = async (files) => {
    if (!Array.isArray(files) || files.length === 0) {
        return [];
    }
    
    return await Promise.all(
        files.map(file => compressImage(file))
    );
};