const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const { promisify } = require('util');
const mkdirAsync = promisify(fs.mkdir);
const ffmpegPath = require("ffmpeg-static");

module.exports = {
  downloadAndConvertToMp3Middleware: async function (url, outputDir, callback) {
    try {
      await mkdirAsync(outputDir, { recursive: true });

      const info = await ytdl.getInfo(url);

      const fileName = `${info.videoDetails.title.replace(/[<>:"/\\|?*]/g, "")}.mp3`;
      const outputFilePath = `${outputDir}/${fileName}`;

      ffmpeg.setFfmpegPath(ffmpegPath);

      const stream = ytdl(url, { quality: 'lowestaudio', filter: 'audioonly' })
        .on('error', (err) => {
          console.error("Lỗi tải xuống audio:", err.message);
          callback({ success: false, error: "Lỗi tải xuống audio: " + err.message });
        });

      ffmpeg(stream)
        .audioBitrate(128)
        .outputOptions('-vn') // chỉ định output là audio only
        .on('error', (err) => {
          console.error("Lỗi chuyển đổi:", err.message);
          callback({ success: false, error: "Lỗi chuyển đổi: " + err.message });
        })
        .on('end', () => {
          callback({ success: true, fileName });
        })
        .save(outputFilePath);
    } catch (err) {
      console.error("Lỗi:", err.message);
      callback({ success: false, error: "Lỗi: " + err.message });
    }
  }
};
