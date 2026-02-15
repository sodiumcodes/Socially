/**
 * Image Validation Utility
 * Handles aspect ratio validation, resizing, and file validation for post images
 */

const TARGET_ASPECT_RATIO = 4 / 5; // 4:5 ratio
const ASPECT_RATIO_TOLERANCE = 0.05; // 5% tolerance
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Validate if an image file meets the aspect ratio requirements
 * @param {File} file - The image file to validate
 * @returns {Promise<{isValid: boolean, width: number, height: number, ratio: number, message?: string}>}
 */
export const validateImageAspectRatio = (file) => {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            const ratio = width / height;
            const expectedRatio = TARGET_ASPECT_RATIO;

            const isValid = Math.abs(ratio - expectedRatio) <= ASPECT_RATIO_TOLERANCE;

            URL.revokeObjectURL(url);

            resolve({
                isValid,
                width,
                height,
                ratio,
                message: isValid
                    ? 'Image aspect ratio is valid'
                    : `Image must have a 4:5 aspect ratio. Current: ${width}x${height} (${ratio.toFixed(2)}:1)`
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({
                isValid: false,
                width: 0,
                height: 0,
                ratio: 0,
                message: 'Failed to load image'
            });
        };

        img.src = url;
    });
};

/**
 * Validate file type and size
 * @param {File} file - The file to validate
 * @returns {{isValid: boolean, message?: string}}
 */
export const validateFile = (file) => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            isValid: false,
            message: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
        };
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
        return {
            isValid: false,
            message: `File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size of ${MAX_FILE_SIZE_MB}MB`
        };
    }

    return { isValid: true };
};

/**
 * Crop image to 4:5 aspect ratio
 * @param {File} file - The image file to crop
 * @returns {Promise<File>} - Cropped image file
 */
export const cropImageTo4x5 = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const originalWidth = img.naturalWidth;
            const originalHeight = img.naturalHeight;
            const targetRatio = TARGET_ASPECT_RATIO;

            let sourceWidth, sourceHeight, sourceX, sourceY;

            // Calculate crop dimensions
            const currentRatio = originalWidth / originalHeight;

            if (currentRatio > targetRatio) {
                // Image is too wide, crop width
                sourceHeight = originalHeight;
                sourceWidth = sourceHeight * targetRatio;
                sourceX = (originalWidth - sourceWidth) / 2;
                sourceY = 0;
            } else {
                // Image is too tall, crop height
                sourceWidth = originalWidth;
                sourceHeight = sourceWidth / targetRatio;
                sourceX = 0;
                sourceY = (originalHeight - sourceHeight) / 2;
            }

            // Set canvas size to maintain quality
            canvas.width = sourceWidth;
            canvas.height = sourceHeight;

            // Draw cropped image
            ctx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, sourceWidth, sourceHeight
            );

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    const croppedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    });
                    URL.revokeObjectURL(url);
                    resolve(croppedFile);
                } else {
                    URL.revokeObjectURL(url);
                    reject(new Error('Failed to crop image'));
                }
            }, file.type, 0.95);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
};

/**
 * Validate multiple images
 * @param {FileList|File[]} files - Array of files to validate
 * @param {number} maxImages - Maximum number of images allowed
 * @returns {Promise<{isValid: boolean, validFiles: File[], errors: string[]}>}
 */
export const validateMultipleImages = async (files, maxImages = 5) => {
    const fileArray = Array.from(files);
    const errors = [];
    const validFiles = [];

    // Check count
    if (fileArray.length > maxImages) {
        errors.push(`Maximum ${maxImages} images allowed. You selected ${fileArray.length}.`);
        return { isValid: false, validFiles: [], errors };
    }

    // Validate each file
    for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        // Validate file type and size
        const fileValidation = validateFile(file);
        if (!fileValidation.isValid) {
            errors.push(`Image ${i + 1}: ${fileValidation.message}`);
            continue;
        }

        // Validate aspect ratio
        const aspectValidation = await validateImageAspectRatio(file);
        if (!aspectValidation.isValid) {
            errors.push(`Image ${i + 1}: ${aspectValidation.message}`);
            continue;
        }

        validFiles.push(file);
    }

    return {
        isValid: errors.length === 0,
        validFiles,
        errors
    };
};

/**
 * Auto-crop multiple images to 4:5 aspect ratio
 * @param {FileList|File[]} files - Array of files to crop
 * @returns {Promise<File[]>} - Array of cropped files
 */
export const autoCropImages = async (files) => {
    const fileArray = Array.from(files);
    const croppedFiles = [];

    for (const file of fileArray) {
        try {
            const croppedFile = await cropImageTo4x5(file);
            croppedFiles.push(croppedFile);
        } catch (error) {
            console.error('Failed to crop image:', error);
            // If cropping fails, use original file
            croppedFiles.push(file);
        }
    }

    return croppedFiles;
};
