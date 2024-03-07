module.exports = function (app) {
  const { downloadAndConvertToMp3Middleware } = require('../middleware/mp3/convert-mp3'); // Adjust the path accordingly
  const youtubeUtils = require('../middleware/research/main');
  app.get("/", (req, res) => {
    res.render("index");
  });
  app.get("/convert-mp3", (req, res) => {
    res.render("index");
  });
  app.post("/convert-mp3", (req, res) => {
    const { youtubeUrl } = req.body;
    const outputDirectory = "./static/mp3";
    const protocol = req.protocol;
    const hostname = req.hostname || "localhost";
    const localhostUrl = "http://localhost:8080/mp3/";
    const domainUrl = hostname === "localhost" ? localhostUrl : `${protocol}://${hostname}/mp3/`;
  
    downloadAndConvertToMp3Middleware(youtubeUrl, outputDirectory, (result) => {
      if (result.success) {
        const filename = encodeURIComponent(result.fileName);
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
      const apiKey = "AIzaSyBAoy3B2-vJlVGscCQsb3Yr4EXrB59r9cQ";
      const query = youtubeUtils.extractVideoId(req.query.q);
      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
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
