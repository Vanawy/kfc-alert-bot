const { loadImage, createCanvas } = require('canvas');
const uniqueFilename = require('unique-filename');
const fs = require('fs/promises');
/**
 * Create single image from multiple images 
 * @param {string[]} images Pathes to images 
 * @returns {Promise<string>}
 */
module.exports = function(images) {
    const loadedImages = images.map(img => loadImage(img));
    return Promise.all(loadedImages)
    .then(images => {
        const width = Math.max(...images.map(image => image.width));
        const height = images.reduce((height, img) => height + img.height, 0);

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        let y = 0;
        images.forEach(image => {
            ctx.drawImage(image, 0, y);
            y += image.height;
        })
        return canvas;
    })
    .then(canvas => {
        const filename = uniqueFilename('/tmp') + '.png';
        return fs.writeFile(filename, canvas.toBuffer()).then(_ => filename);
    });
}