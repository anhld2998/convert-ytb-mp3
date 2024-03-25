// const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
// const fs = require('fs').promises;
// const ytdl = require('ytdl-core');
// const ffmpeg = require('fluent-ffmpeg');
// const ffmpegPath = require('ffmpeg-static');


// if (isMainThread) {
//   module.exports = {
//     downloadAndConvertToMp3Middleware: async function (url, outputDir, callback) {
//       try {
//         await fs.mkdir(outputDir, { recursive: true });
//         const worker = new Worker(__filename, {
//           workerData: { url, outputDir }
//         });
//         worker.on('message', (message) => {
//           if (message.success) {
//             callback({ success: true, fileName: message.fileName });
//           } else {
//             callback({ success: false, error: message.error });
//           }
//         });
//         worker.on('error', (err) => {
//           console.error('Lỗi worker:', err);
//           callback({ success: false, error: 'Lỗi worker: ' + err.message });
//         });
//       } catch (err) {
//         console.error('Lỗi:', err);
//         callback({ success: false, error: 'Lỗi: ' + err.message });
//       }
//     },
//     downloadVideo // Đưa hàm downloadVideo vào export
//   };
// } else {
//   const { url, outputDir } = workerData;
//   (async () => {
//     try {
//       const info = await ytdl.getInfo(url);
//       const fileName = `${info.videoDetails.title.replace(/[<>:"/\\|?*]/g, '')}.mp3`;
//       const outputFilePath = `${outputDir}/${fileName}`;
//       ffmpeg.setFfmpegPath(ffmpegPath);

//       const stream = ytdl(url, { quality: 'lowestaudio', filter: 'audioonly' })
//         .on('error', (err) => {
//           throw new Error('Lỗi tải xuống audio: ' + err.message);
//         });

//       ffmpeg(stream)
//         .audioBitrate(128)
//         .outputOptions('-vn')
//         .on('error', (err) => {
//           throw new Error('Lỗi chuyển đổi: ' + err.message);
//         })
//         .on('end', () => {
//           parentPort.postMessage({ success: true, fileName });
//         })
//         .save(outputFilePath);
//     } catch (err) {
//       parentPort.postMessage({ success: false, error: err.message });
//     }
//   })();
// }




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
