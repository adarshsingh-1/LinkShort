const Url = require("../model/urlModel");
const { nanoid } = require("nanoid");

const createShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "Original URL is required" });
    }

    let url = await Url.findOne({ originalUrl });

    if (url) {
      return res.status(200).json({
        shortCode: url.shortCode,
        shortUrl: `${req.protocol}://${req.get("host")}/${url.shortCode}`,
        originalUrl: url.originalUrl,
      });
    }

    const shortCode = nanoid(8);

    url = new Url({
      originalUrl,
      shortCode,
    });

    await url.save();

    res.status(201).json({
      shortCode: url.shortCode,
      shortUrl: `${req.protocol}://${req.get("host")}/${url.shortCode}`,
      originalUrl: url.originalUrl,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    url.clicks += 1;
    await url.save();
    res.redirect(url.originalUrl);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUrlAnalytics = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    res.status(200).json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.status(200).json(urls);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createShortUrl,
  redirectUrl,
  getUrlAnalytics,
  getAllUrls,
};
