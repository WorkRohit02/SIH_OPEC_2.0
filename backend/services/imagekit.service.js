const imagekit = require('../config/imagekit');
const { hashEvidenceBuffer } = require('./hash.service');

/**
 * IMAGEKIT SERVICE
 * Media storage service for evidence images, videos, and overlays.
 * Never stores large binary files directly in MongoDB.
 */

/**
 * Uploads evidence media file to ImageKit
 * @param {Buffer} fileBuffer Original file buffer
 * @param {string} fileName Original filename
 * @param {string} mimeType MIME type
 * @param {string} testId Human readable test ID or test ObjectId
 * @param {string} category 'ORIGINAL' | 'PROCESSED' | 'OVERLAY'
 * @returns {Object} ImageKit metadata object with SHA-256
 */
const uploadMedia = async (fileBuffer, fileName, mimeType, testId, category = 'ORIGINAL') => {
  const sha256Hash = hashEvidenceBuffer(fileBuffer);
  const year = new Date().getFullYear();
  const folderPath = `/color-safe/evidence/${year}/${testId}/${category.toLowerCase()}`;

  if (imagekit) {
    try {
      const response = await imagekit.upload({
        file: fileBuffer, // Buffer or Base64
        fileName: `${Date.now()}_${fileName}`,
        folder: folderPath,
        useUniqueFileName: true,
        tags: ['color-safe', category.toLowerCase(), testId.toString()],
      });

      return {
        fileId: response.fileId,
        url: response.url,
        fileName: response.name,
        mimeType: mimeType,
        size: response.size || fileBuffer.length,
        width: response.width || 0,
        height: response.height || 0,
        uploadedAt: new Date(),
        sha256: sha256Hash,
        storagePath: response.filePath,
        category: category,
      };
    } catch (error) {
      console.error('[ImageKit Service Upload Error]:', error.message);
      throw new Error(`Media storage upload failed: ${error.message}`);
    }
  }

  // Fallback mode for local development/testing when ImageKit keys are not present
  const mockFileId = `local_fallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return {
    fileId: mockFileId,
    url: `https://sih-opec-drug.onrender.com/uploads/mock_${mockFileId}.jpg`,
    fileName: fileName,
    mimeType: mimeType,
    size: fileBuffer.length,
    width: 1920,
    height: 1080,
    uploadedAt: new Date(),
    sha256: sha256Hash,
    storagePath: `${folderPath}/${fileName}`,
    category: category,
  };
};

/**
 * Deletes media file from ImageKit
 * @param {string} fileId 
 */
const deleteMedia = async (fileId) => {
  if (imagekit && fileId && !fileId.startsWith('local_fallback_')) {
    try {
      await imagekit.deleteFile(fileId);
      return true;
    } catch (error) {
      console.error('[ImageKit Service Delete Error]:', error.message);
      return false;
    }
  }
  return true;
};

module.exports = {
  uploadMedia,
  deleteMedia,
};
