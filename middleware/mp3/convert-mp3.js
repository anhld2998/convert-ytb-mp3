const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const { promisify } = require('util');
const mkdirAsync = promisify(fs.mkdir);
const ffmpegPath = require('ffmpeg-static');

if (isMainThread) {
  module.exports = {
    downloadAndConvertToMp3Middleware: async function (url, outputDir, callback) {
      try {
        await mkdirAsync(outputDir, { recursive: true });
        const worker = new Worker(__filename, {
          workerData: { url, outputDir }
        });
        worker.on('message', (message) => {
          if (message.success) {
            callback({ success: true, fileName: message.fileName });
          } else {
            callback({ success: false, error: message.error });
          }
        });
        worker.on('error', (err) => {
          console.error('Lỗi worker:', err);
          callback({ success: false, error: 'Lỗi worker: ' + err.message });
        });
      } catch (err) {
        console.error('Lỗi:', err);
        callback({ success: false, error: 'Lỗi: ' + err.message });
      }
    }
  };
} else {
  const { url, outputDir } = workerData;

  (async () => {
    try {
      const info = await ytdl.getInfo(url);
      const fileName = `${info.videoDetails.title.replace(/[<>:"/\\|?*]/g, '')}.mp3`;
      const outputFilePath = `${outputDir}/${fileName}`;
      ffmpeg.setFfmpegPath(ffmpegPath);

      const stream = ytdl(url, { quality: 'lowestaudio', filter: 'audioonly' })
        .on('error', (err) => {
          throw new Error('Lỗi tải xuống audio: ' + err.message);
        });

      ffmpeg(stream)
        .audioBitrate(128)
        .outputOptions('-vn')
        .on('error', (err) => {
          throw new Error('Lỗi chuyển đổi: ' + err.message);
        })
        .on('end', () => {
          parentPort.postMessage({ success: true, fileName });
        })
        .save(outputFilePath);
    } catch (err) {
      parentPort.postMessage({ success: false, error: err.message });
    }
  })();
}
