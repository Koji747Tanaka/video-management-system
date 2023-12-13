const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    userid: String,
    videoName: String,
    uniqueName: String
});

const Video = mongoose.model("Video", videoSchema);
module.exports = Video;