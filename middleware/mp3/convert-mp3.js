const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
module.exports = {
  downloadAndConvertToMp3Middleware: async function (url, outputDir, callback) {
    try {
      const info = await ytdl.getInfo(url);
      const videoFormat = ytdl.chooseFormat(info.formats, {
        filter: "audioonly",
      });

      const fileName = info.videoDetails.title.replace(/[<>:"\/\\|?*]/g, "") + ".mp3";

      const outputFilePath = `${outputDir}/${fileName}`;

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      ffmpeg.setFfmpegPath(require("ffmpeg-static"));
      ffmpeg(videoFormat.url)
        .audioBitrate(128)
        .on("end", () => {
          const result = { success: true, fileName: fileName };
          callback(result); // Call the callback function with the result
        })
        .on("error", (err) => {
          const result = {
            success: false,
            error: "Lỗi khi chuyển đổi: " + err.message,
          };
          console.error(result.error);
          callback(result); // Call the callback function with the error message
        })
        .save(outputFilePath);
    } catch (err) {
      const result = { success: false, error: "Lỗi: " + err.message };
      console.error(result.error);
      callback(result); // Call the callback function with the error message
    }
  }
};
