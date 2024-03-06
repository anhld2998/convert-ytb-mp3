module.exports = function (app, passport) {
  
  const ytdl = require("ytdl-core");
  const ffmpeg = require("fluent-ffmpeg");
  const fs = require("fs");
  app.get("/", (req, res) => {
    res.render("index");
  });
  app.get("/convert-mp3", (req, res) => {
    res.render("index");
  });
  app.post("/convert-mp3", function (req, res) {
    const youtubeUrl = req.body.youtubeUrl;
    const outputDirectory = "./static/mp3";

    // Get the protocol (http or https) and hostname from the request object
    const protocol = req.protocol;
    const hostname = req.hostname || "localhost"; // Fallback to "localhost" if hostname is not available

    // Define the fallback URL for localhost
    const localhostUrl = "http://localhost:8080/mp3/";

    // Construct the domain URL based on the protocol and hostname
    const domainUrl =
      hostname === "localhost"
        ? localhostUrl
        : `${protocol}://${hostname}/mp3/`;

    downloadAndConvertToMp3(youtubeUrl, outputDirectory, (result) => {
      if (result.success) {
        const filename = encodeURIComponent(result.fileName); // Encode the filename
        res.json({
          success: true,
          fileUrl: `${domainUrl}${filename}`,
          filename: filename,
        });
      } else {
        res.json({ success: false, error: result.error });
      }
    });
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
