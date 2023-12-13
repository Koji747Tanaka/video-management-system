const ffmpeg = require('../ffmpeg');

const processVideo = (inputPath, outputPath, io, uniqueName) => {
    let totalTime;

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .addOptions([
                '-profile:v baseline',
                '-level 3.0',
                '-start_number 0',
                '-hls_time 10',
                '-hls_list_size 0',
                '-f hls'
            ])
            .audioCodec('libmp3lame')
            .videoCodec('libx264')
            .audioBitrate(128)
            .on('codecData', data => {
                totalTime = parseInt(data.duration.replace(/:/g, ''));
            })
            .on('progress', function (progress) {
                const time = parseInt(progress.timemark.replace(/:/g, ''));
                const percent = Math.floor((time / totalTime) * 100);
                console.log('Processing: ' + percent + '% done');
                io.emit('progressUpdate', { progress: percent });
            })
            .on('end', () => {
                console.log('File has been converted successfully');
                resolve();
            })
            .on('error', (err) => {
                console.log('Converting error happened: ' + err.message);
                reject(err);
            })
            .save(outputPath);
    });
}

const takeScreenshot = (inputPath, outputPath, uniqueName) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .takeScreenshots({
                count: 1,
                timemarks: ['00:00:01.000'],
                folder: outputPath,
                filename: uniqueName
            })
            .on('error', function (err) {
                console.log('screenshot error happened: ' + err.message);
                reject(err);
            })
            .on('end', function () {
                console.log('Screenshot process finished');
                resolve();
            });
    });
}
module.exports = { processVideo, takeScreenshot};

