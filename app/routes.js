const { downloadAndConvertToMp3Middleware } = require("../middleware/mp3/convert-mp3");
const youtubeUtils = require("../middleware/research/main");
const { OAuth2Client } = require('google-auth-library');
const axios = require("axios");

module.exports = function (app) {
  // Route cho trang chính

  app.get("/", (req, res) => {
    res.render("dashboard");
  });

  // Route để chuyển đổi video YouTube thành file mp3
  app.post("/convert-mp3", (req, res) => {
    const { youtubeUrl } = req.body;
    const outputDirectory = "./public/mp3";
    const protocol = req.protocol;
    const hostname = req.hostname || "localhost";
    const domainUrl = `${hostname === "localhost" ? process.env.URL_LOCAL : `${protocol}://${hostname}`}/mp3/`;

    // Middleware để tải và chuyển đổi video
    downloadAndConvertToMp3Middleware(youtubeUrl, outputDirectory, (result) => {
      const { success, fileName, error } = result;
      if (success) {
        const filename = decodeURIComponent(fileName);
        res.json({ success: true, fileUrl: `${domainUrl}${filename}`, filename });
      } else {
        res.json({ success: false, error });
      }
    });
  });

  // Middleware để cập nhật token khi cần
  app.use(async (req, res, next) => {
    const currentTime = new Date().getTime();
    const expirationTime = req.session.tokenExpirationTime;

    if (expirationTime - currentTime < 300000) { // Kiểm tra nếu token sắp hết hạn trong 5 phút
      try {
        const refreshedToken = await refreshToken(req.session.refreshToken);
        req.session.accessToken = refreshedToken.access_token;
        req.session.tokenExpirationTime = new Date().getTime() + (refreshedToken.expires_in * 1000);
        process.env.TOKEN_GOOGLE = refreshedToken.access_token;
      } catch (error) {
        console.error('Lỗi cập nhật token:', error);
        return res.status(500).send('Lỗi máy chủ nội bộ');
      }
    }
    next();
  });

  // Route để tìm kiếm video trên YouTube
  app.get('/search', async (req, res) => {
    try {
      const apiKey = process.env.TOKEN_GOOGLE;
      const query = youtubeUtils.extractVideoId(req.query.q);
      const response = await axios.get(process.env.URL_API_GOOGLE, {
        params: {
          key: apiKey,
          q: query,
          part: 'snippet',
          type: 'video',
          maxResults: 10,
        },
      });
      res.json(response.data);
    } catch (error) {
      console.error('Lỗi khi truy vấn dữ liệu từ YouTube API:', error);
      res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
  });
};

// Hàm để cập nhật token
async function refreshToken(refreshToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const oauth2Client = new OAuth2Client(clientId, clientSecret);

  try {
    const { tokens } = await oauth2Client.refreshToken(refreshToken);
    return tokens;
  } catch (error) {
    throw new Error("Lỗi cập nhật token: " + error.message);
  }
}
