const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const { promisify } = require('util');

const mkdirAsync = promisify(fs.mkdir);

module.exports = {
  downloadAndConvertToMp3Middleware: async function (url, outputDir, callback) {
    try {
      const info = await ytdl.getInfo(url);

      // Chọn định dạng có chất lượng cao hơn nếu có sẵn
      const videoFormat = ytdl.chooseFormat(info.formats, {
        quality: 'highestaudio',
        filter: 'audioonly'
      });

      const fileName = `${info.videoDetails.title.replace(/[<>:"/\\|?*]/g, "")}.mp3`;
      const outputFilePath = `${outputDir}/${fileName}`;

      await mkdirAsync(outputDir, { recursive: true });

      const ffmpegPath = require("ffmpeg-static");
      if (!fs.existsSync(ffmpegPath)) {
        throw new Error("Không tìm thấy FFmpeg tại đường dẫn đã chỉ định");
      }

      ffmpeg.setFfmpegPath(ffmpegPath);

      // Sử dụng FFmpeg trực tiếp để tải xuống và chuyển đổi video sang MP3
      ffmpeg(ytdl(url, { format: videoFormat }))
        .audioBitrate(128)
        .on("end", () => {
          callback({ success: true, fileName }); 
        })
        .on("error", (err) => {
          console.error("Lỗi chuyển đổi:", err.message);
          callback({ success: false, error: "Lỗi chuyển đổi: " + err.message }); 
        })
        .save(outputFilePath);

    } catch (err) {
      console.error("Lỗi:", err.message);
      callback({ success: false, error: "Lỗi: " + err.message }); 
    }
  }
};
