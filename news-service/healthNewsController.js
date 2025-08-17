const axios = require('axios');

const getHealthNews = async (req, res) => {
  try {
    const API_KEY = process.env.VITE_NEWS_API_KEY || '9e6216cf85d24c568f07a0ccfb209d1f';
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&category=health&apiKey=${API_KEY}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getHealthNews };