const express = require('express');
const {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    getProductCategoriesController,
    getMainCategoriesController,
    getSubcategoriesController
} = require('../controllers/productController');

const router = express.Router();

// Get all products with pagination and search
router.get('/', getAllProductsController);

// Get product by ID
router.get('/:id', getProductByIdController);

// Get product categories (companies)
router.get('/categories/all', getProductCategoriesController);

// Get main categories
router.get('/categories/main', getMainCategoriesController);

// Get subcategories by main category
router.get('/categories/sub/:mainCategory', getSubcategoriesController);

// Create new product
router.post('/create', createProductController);

module.exports = router;
