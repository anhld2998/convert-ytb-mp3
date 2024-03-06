module.exports = function (app) {
  const axios = require('axios');
  const ytdl = require("ytdl-core");
  const ffmpeg = require("fluent-ffmpeg");
  const fs = require("fs");
  app.get("/", (req, res) => {
    res.render("index");
  });
  app.get("/convert-mp3", (req, res) => {
    res.render("index");
  });
  app.post("/convert-mp3", async (req, res) => {
    const youtubeUrl = req.body.youtubeUrl;
    const postUrl = "https://www.y2mate.com/mates/convertV2/index";
    try {
        // Gửi yêu cầu POST đến API của y2mate.com
        const response = await axios.post(postUrl, {
            video_id: youtubeUrl,
            ajax: "1",
            bitrate: "128",
            start: "1",
            end: "999",
            type: "youtube",
           
        });

        if (response.status === 200 && response.data.status === 'success') {
            const fileUrl = response.data.link;
            const filename = encodeURIComponent(response.data.title) + ".mp3";
            const domainUrl = "http://localhost:8080/mp3/"; // Thay thế bằng đường dẫn thực của bạn
            res.json({
                success: true,
                fileUrl: `${domainUrl}${filename}`,
                filename: filename,
            });
        } else {
            res.json({ success: false, error: "Lỗi khi chuyển đổi video sang mp3" });
        }
    } catch (error) {
        console.error("Lỗi khi gửi yêu cầu chuyển đổi:", error.message);
        res.json({ success: false, error: "Lỗi khi gửi yêu cầu chuyển đổi" });
    }
});

  async function downloadAndConvertToMp3(url, outputDir, callback) {
    try {
      const info = await ytdl.getInfo(url);
      const videoFormat = ytdl.chooseFormat(info.formats, {
        filter: "audioonly",
      });

      const fileName = sanitizeFilename(info.videoDetails.title) + ".mp3";

      const outputFilePath = `${outputDir}/${fileName}`;

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      ffmpeg.setFfmpegPath(require("ffmpeg-static"));
      ffmpeg(videoFormat.url)
        .audioBitrate(128)
        .on("end", () => {
          const result = { success: true, fileName: fileName };
          console.log("Chuyển đổi hoàn thành!");
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

  function sanitizeFilename(filename) {
    return filename.replace(/[<>:"\/\\|?*]/g, "");
  }
};
