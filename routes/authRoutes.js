const express = require('express');
const { registerControler, loginController } = require('../controllers/authController');

const router = express.Router();

// REGISTER || POST
router.post('/register', registerControler);

// LOGIN || POST
router.post('/login', loginController);

module.exports = router;