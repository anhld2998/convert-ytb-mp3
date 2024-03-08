module.exports = function (app) {
  const { downloadAndConvertToMp3Middleware } = require('../middleware/mp3/convert-mp3'); // Adjust the path accordingly
  const youtubeUtils = require('../middleware/research/main');
  app.get("/", (req, res) => {
    res.render("dashboard");
  });
  app.get("/convert-mp3", (req, res) => {
    res.render("index");
  });
  app.post("/convert-mp3", (req, res) => {
    const { youtubeUrl } = req.body;
    const outputDirectory = "./public/mp3";
    const protocol = req.protocol;
    const hostname = req.hostname || "localhost";
    const localhostUrl = `${process.env.URL_LOCAL}/mp3/`;
    const domainUrl = hostname === "localhost" ? localhostUrl : `${protocol}://${hostname}/mp3/`;
    downloadAndConvertToMp3Middleware(youtubeUrl, outputDirectory, (result) => {
      if (result.success) {
        const filename = decodeURIComponent(result.fileName);
        res.json({ success: true, fileUrl: `${domainUrl}${filename}`, filename });
      } else {
        res.json({ success: false, error: result.error });
      }
    });
  });
  app.get('/research-ytb', (req, res) => {
    res.render('research')
  })
  const axios = require("axios");
  app.get("/search", async (req, res) => {
    try {
      const apiKey = process.env.TOKEN_GOOGLE;
      const query = youtubeUtils.extractVideoId(req.query.q);
      const response = await axios.get(
        process.env.URL_API_GOOGLE,
        {
          params: {
            key: apiKey,
            q: query,
            part: "snippet",
            type: "video",
            maxResults: 10,
          },
        }
      );
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching data from YouTube API:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

};
function encodeURIComponentVietnamese(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21') // !
    .replace(/'/g, '%27') // '
    .replace(/\(/g, '%28') // (
    .replace(/\)/g, '%29') // )
    .replace(/\*/g, '%2A') // *
    .replace(/%20/g, '+') // space
    .replace(/%C4%90/g, '%E1%BB%90') // Đ
    .replace(/%C4%91/g, '%E1%BB%91') // đ
    .replace(/%C3%80/g, '%C3%A0') // À
    .replace(/%C3%A0/g, '%C3%A0') // à
    .replace(/%C3%82/g, '%C3%A2') // Â
    .replace(/%C3%A2/g, '%C3%A2') // â
    .replace(/%C3%88/g, '%C3%A8') // È
    .replace(/%C3%A8/g, '%C3%A8'); // è
    // Add more replacements as needed for other Vietnamese characters
}
