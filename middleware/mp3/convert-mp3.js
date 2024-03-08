const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const { promisify } = require('util');

const mkdirAsync = promisify(fs.mkdir);

module.exports = {
  downloadAndConvertToMp3Middleware: async function (url, outputDir, callback) {
    try {
      const info = await ytdl.getInfo(url, { quality: 'highestaudio', filter: 'audioonly' });

      const fileName = `${info.videoDetails.title.replace(/[<>:"/\\|?*]/g, "")}.mp3`;
      const outputFilePath = `${outputDir}/${fileName}`;

      await mkdirAsync(outputDir, { recursive: true });

      const ffmpegPath = require("ffmpeg-static");
      if (!fs.existsSync(ffmpegPath)) {
        throw new Error("Không tìm thấy FFmpeg tại đường dẫn đã chỉ định");
      }
      ffmpeg.setFfmpegPath(ffmpegPath);
      
      // Sử dụng stream audio để chuyển đổi trực tiếp sang MP3
      const stream = ytdl(url, { filter: 'audioonly' }) // Thay đổi định dạng ở đây
        .on('error', (err) => {
          console.error("Lỗi tải xuống audio:", err.message);
          callback({ success: false, error: "Lỗi tải xuống audio: " + err.message });
        });
      ffmpeg(stream)
        .audioBitrate(128)
        .save(outputFilePath)
        .on('end', () => {
          callback({ success: true, fileName });
        })
        .on('error', (err) => {
          console.error("Lỗi chuyển đổi:", err.message);
          callback({ success: false, error: "Lỗi chuyển đổi: " + err.message });
        });

    } catch (err) {
      console.error("Lỗi:", err.message);
      callback({ success: false, error: "Lỗi: " + err.message });
    }
  }
};
