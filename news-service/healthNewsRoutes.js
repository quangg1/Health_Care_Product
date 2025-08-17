const express = require('express');
const router = express.Router();
const { getHealthNews } = require('./healthNewsController');

router.get('/', getHealthNews);

module.exports = router;