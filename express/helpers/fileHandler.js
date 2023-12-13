const fs = require('fs');
const util = require('util');

const writeFileAsync = util.promisify(fs.writeFile);
const openAsync = util.promisify(fs.open);
const closeAsync = util.promisify(fs.close);

async function saveFile(filePath, data) {
    const fd = await openAsync(filePath, 'w');
    try {
        await writeFileAsync(fd, data);
        console.log("The file was saved!", filePath);
    } finally {
        await closeAsync(fd);
    }
}

function generateAlphabeticId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function generateUniqueName(originalName) {
    const videoName = originalName.substring(0, originalName.indexOf("."));
    const random = generateAlphabeticId(8); 
    const uniqueName = videoName + random;
    return {uniqueName, videoName};
}

module.exports = { saveFile, generateUniqueName };