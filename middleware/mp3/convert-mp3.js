const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const { promisify } = require('util');
const mkdirAsync = promisify(fs.mkdir);
const ffmpegPath = require("ffmpeg-static");

module.exports = {
  // Middleware để tải video từ YouTube và chuyển đổi thành định dạng mp3
  downloadAndConvertToMp3Middleware: async function (url, outputDir, callback) {
    try {
      // Tạo thư mục đầu ra nếu chưa tồn tại
      await mkdirAsync(outputDir, { recursive: true });

      // Lấy thông tin về video từ URL
      const info = await ytdl.getInfo(url);

      // Xây dựng tên file mp3 từ tiêu đề của video
      const fileName = `${info.videoDetails.title.replace(/[<>:"/\\|?*]/g, "")}.mp3`;
      const outputFilePath = `${outputDir}/${fileName}`;

      // Sử dụng đường dẫn ffmpeg đã cài đặt để chuyển đổi video
      ffmpeg.setFfmpegPath(ffmpegPath);

      // Tạo stream từ URL video chỉ với âm thanh
      const stream = ytdl(url, { quality: 'lowestaudio', filter: 'audioonly' })
        .on('error', (err) => {
          console.error("Lỗi tải xuống audio:", err.message);
          callback({ success: false, error: "Lỗi tải xuống audio: " + err.message });
        });

      // Chuyển đổi video thành định dạng mp3
      ffmpeg(stream)
        .audioBitrate(128) // Bitrate của audio đầu ra
        .outputOptions('-vn') // chỉ định output là audio only
        .on('error', (err) => {
          console.error("Lỗi chuyển đổi:", err.message);
          callback({ success: false, error: "Lỗi chuyển đổi: " + err.message });
        })
        .on('end', () => {
          callback({ success: true, fileName }); // Gọi callback khi chuyển đổi hoàn thành
        })
        .save(outputFilePath); // Lưu file mp3 đã chuyển đổi
    } catch (err) {
      console.error("Lỗi:", err.message);
      callback({ success: false, error: "Lỗi: " + err.message });
    }
  }
};
