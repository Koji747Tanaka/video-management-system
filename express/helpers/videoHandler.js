const findThumbnailFile = (files, uniqueName) => {
    return files.find(file => file.startsWith(uniqueName));
}

const createResponseObject = (foundFile, video) => {
    const thumbURLStem = process.env.SERVER_HOST + "/thumbnails/";
    const videoURLStem = process.env.SERVER_HOST + "/transcoded/";
    const nameWithoutEx = foundFile.substring(0, foundFile.indexOf("."));

    return {
        thumbUrl: thumbURLStem + foundFile,
        videoUrl: videoURLStem + nameWithoutEx + "/" + nameWithoutEx + ".m3u8",
        videoName: video.videoName,
        uniqueName: nameWithoutEx,
    };
}

module.exports = {findThumbnailFile, createResponseObject}