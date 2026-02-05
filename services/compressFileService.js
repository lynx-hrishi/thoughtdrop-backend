import fs from 'fs';
import sharp from 'sharp';

export const compressIfNeededService = async (buffer, mimetype) => {
    try {
        if (buffer.length > 1 * 1024 * 1024) {
            console.log(`Compressing image of size: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`);

            let quality = 85;
            
            // Initial compression
            if (mimetype.includes("jpeg") || mimetype.includes("jpg")) {
                buffer = await sharp(buffer).jpeg({ quality }).toBuffer();
            } else if (mimetype.includes("png")) {
                buffer = await sharp(buffer).png({ quality: 90, compressionLevel: 9 }).toBuffer();
            } else if (mimetype.includes("webp")) {
                buffer = await sharp(buffer).webp({ quality }).toBuffer();
            }

            // Iteratively reduce quality until under 1MB
            while (buffer.length > 1 * 1024 * 1024 && quality > 50) {
                quality -= 5;
                if (mimetype.includes("jpeg") || mimetype.includes("jpg")) {
                    buffer = await sharp(buffer).jpeg({ quality }).toBuffer();
                } else if (mimetype.includes("png")) {
                    buffer = await sharp(buffer).png({ quality: Math.max(quality, 50), compressionLevel: 9 }).toBuffer();
                } else if (mimetype.includes("webp")) {
                    buffer = await sharp(buffer).webp({ quality }).toBuffer();
                }
            }
            
            console.log(`Compressed to: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`);
        }
        return buffer;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw new Error('Image compression failed');
    }
}


// const compressIfNeeded = async (filepath, mimetype) => {
//             let buffer = fs.readFileSync(filepath);

//             if (buffer.length > 5 *1024 * 1024){
//                 console.log(`Compressing: ${filepath}`);

//                 // Default Compression Settings
//                 if (mimetype.includes("jpeg") || mimetype.includes("jpg")){
//                     buffer = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();
//                 }
//                 else if(mimetype.includes("png")){
//                     buffer = await sharp(buffer).png({ quality: 90, compressionLevel: 9 }).toBuffer();
//                 }
//                 else if(mimetype.includes("webp")){
//                     buffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
//                 }

//                 // Iteratively reduce quality until under 5mb
//                 let quality = 85;
//                 while (buffer.length > 5 * 1024 * 1024 && quality > 50){
//                     quality -= 5;
//                     if (mimetype.includes("jpeg") || mimetype.includes("jpg")){
//                         buffer = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();
//                     }
//                     else if(mimetype.includes("png")){
//                         buffer = await sharp(buffer).png({ quality: 90, compressionLevel: 9 }).toBuffer();
//                     }
//                     else if(mimetype.includes("webp")){
//                         buffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
//                     }
//                 }
//             }
//             return buffer;
//         }