const { processVideo, takeScreenshot} = require("../helpers/ffmpegHandler")
jest.mock('../ffmpeg'); // Mock the ffmpeg module
const ffmpeg = require('../ffmpeg');

describe('processVideo', () => {
    it('should process video and emit progress updates', async () => {
        const inputPath = 'input.mp4';
        const outputPath = 'output.m3u8';

        // Mock io object with an emit function
        const mockIo = { emit: jest.fn() };

        // Mocking chainable ffmpeg methods
        const mockFfmpeg = {
            addOptions: jest.fn().mockReturnThis(),
            audioCodec: jest.fn().mockReturnThis(),
            videoCodec: jest.fn().mockReturnThis(),
            audioBitrate: jest.fn().mockReturnThis(),
            on: jest.fn().mockImplementation(function (event, handler) {
                if (event === 'codecData') {
                    handler({ duration: '00:00:10' });
                }
                if (event === 'progress') {
                    handler({ timemark: '00:00:05' });
                }
                if (event === 'end') {
                    setTimeout(() => handler(), 0); // Simulate async behavior
                }
                return this;
            }),
            save: jest.fn()
        };

        // Mock the ffmpeg function to return the mockFfmpeg object
        ffmpeg.mockImplementation(() => mockFfmpeg);

        await processVideo(inputPath, outputPath, mockIo);

        // Check if ffmpeg and its methods are called correctly
        expect(ffmpeg).toHaveBeenCalledWith(inputPath);
        expect(mockFfmpeg.addOptions).toHaveBeenCalled();
        expect(mockFfmpeg.audioCodec).toHaveBeenCalledWith('libmp3lame');
        expect(mockFfmpeg.videoCodec).toHaveBeenCalledWith('libx264');
        expect(mockFfmpeg.audioBitrate).toHaveBeenCalledWith(128);
        expect(mockFfmpeg.save).toHaveBeenCalledWith(outputPath);

        // Check if io.emit was called with expected progress
        expect(mockIo.emit).toHaveBeenCalledWith('progressUpdate', { progress: 50 });
    });
});