const express = require('express');
const { 
    createDrugController, 
    getAllDrugsController, 
    getDrugByIdController, 
    getDrugCategoriesController 
} = require('../controllers/drugController');

const router = express.Router();

// Get all drugs with pagination and search
router.get('/', getAllDrugsController);

// Get drug by ID
router.get('/:id', getDrugByIdController);

// Get drug categories (companies)
router.get('/categories/all', getDrugCategoriesController);

// Create new drug
router.post('/create', createDrugController);

module.exports = router; 
