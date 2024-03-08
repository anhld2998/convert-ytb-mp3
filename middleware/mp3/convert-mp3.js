const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const { PassThrough } = require('stream');
const { promisify } = require('util');

const mkdirAsync = promisify(fs.mkdir);

module.exports = {
  downloadAndConvertToMp3Middleware: async function (url, outputDir, callback) {
    try {
      const info = await ytdl.getInfo(url);

      const videoFormat = ytdl.chooseFormat(info.formats, {
        quality: 'lowestaudio',
        filter: 'audioonly'
      });

      const fileName = `${info.videoDetails.title.replace(/[<>:"/\\|?*]/g, "")}.mp3`;
      const outputFilePath = `${outputDir}/${fileName}`;

      await mkdirAsync(outputDir, { recursive: true });

      const passthroughStream = new PassThrough();

      const ffmpegPath = require("ffmpeg-static");
      if (!fs.existsSync(ffmpegPath)) {
        throw new Error("FFmpeg not found at the specified path");
      }

      ffmpeg.setFfmpegPath(ffmpegPath);

      const ffmpegProcess = ffmpeg(passthroughStream)
        .audioBitrate(128)
        .on("end", () => {
          callback({ success: true, fileName }); 
        })
        .on("error", (err) => {
          console.error("Conversion Error:", err.message);
          callback({ success: false, error: "Conversion Error: " + err.message }); 
        })
        .save(outputFilePath);

      ytdl(url, { format: videoFormat }).pipe(passthroughStream);

    } catch (err) {
      console.error("Error:", err.message);
      callback({ success: false, error: "Error: " + err.message }); 
    }
  }
};
