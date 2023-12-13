const scopackager = require('simple-scorm-packager');

const packageScorm = (sourceFolderName, callback) => {
    const sourcePath = `./public/transcoded/${sourceFolderName}`;
    console.log("Packaging SCORM for: ", sourceFolderName);

    scopackager({
        version: '2004 4th Edition',
        organization: 'Chiba University',
        title: sourceFolderName,
        language: 'fr-FR',
        identifier: '00',
        masteryScore: 80,
        startingPage: 'index.html',
        source: sourcePath,
        package: {
            name: sourceFolderName,
            zip: true,
            outputFolder: './scormPackages'
        }
    }, callback);
};

module.exports = packageScorm