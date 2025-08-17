const Product = require('../models/productModel');
const User = require('../models/userModel'); // Assuming the user model is in the same directory

// Get all products
exports.getAllProductsController = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            main_category = '',
            sub_category = '',
            minPrice,
            maxPrice,
            sortBy = 'name'
        } = req.query;

        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (main_category) {
            query.main_category = main_category;
        }
        if (sub_category) {
            query.sub_category = sub_category;
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) {
                query.price.$gte = Number(minPrice);
            }
            if (maxPrice) {
                query.price.$lte = Number(maxPrice);
            }
        }

        let sortOption = {};
        if (sortBy === 'price-asc') {
            sortOption = { price: 1 };
        } else if (sortBy === 'price-desc') {
            sortOption = { price: -1 };
        } else {
            sortOption = { name: 1 };
        }


        const skip = (page - 1) * limit;
        const products = await Product
            .find(query)
            .sort(sortOption)
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        // Add virtual category field
        products.forEach(p => {
            p.category = [p.main_category, p.sub_category].filter(Boolean).join(' > ');
        });

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// Create new product
exports.createProductController = async (req, res) => {
    try {
        const {
            soDangKy, name, thanhPhan, congTy, quocGia, linkChiTiet, imageUrl, dangBaoChe, dongGoi, hanSuDung,
            congTySx, congTyDk, huongDan, price, description, details, usageGuideHref, usageGuideImage,
            product_info, brand, main_category, sub_category
        } = req.body;

        if (!soDangKy || !name || !main_category || !sub_category) {
            return res.status(400).send({
                success: false,
                message: "Các trường bắt buộc: soDangKy, name, main_category, sub_category",
            });
        }
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get product by ID
exports.getProductByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findById(id).lean();
        if (product) {
            product.category = [product.main_category, product.sub_category].filter(Boolean).join(' > ');
        }
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// Get product categories (companies)
exports.getProductCategoriesController = async (req, res) => {
    try {
        const categories = await Product.aggregate([
            {
                $group: {
                    _id: '$congTy',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: '$_id',
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// Get main categories
exports.getMainCategoriesController = async (req, res) => {
    try {
        const mainCategories = await Product.aggregate([
            {
                $group: {
                    _id: '$main_category',
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    _id: { $ne: null }
                }
            },
            {
                $project: {
                    name: '$_id',
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: mainCategories
        });
    } catch (error) {
        console.error('Error fetching main categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching main categories',
            error: error.message
        });
    }
};

// Get subcategories by main category
exports.getSubcategoriesController = async (req, res) => {
    try {
        const { mainCategory } = req.params;
        
        const subcategories = await Product.aggregate([
            {
                $match: {
                    main_category: mainCategory
                }
            },
            {
                $group: {
                    _id: '$sub_category',
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    _id: { $ne: null }
                }
            },
            {
                $project: {
                    name: '$_id',
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: subcategories
        });
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subcategories',
            error: error.message
        });
    }
};

// Create new product
exports.createProductController = async (req, res) => {
    try {
        const {
            soDangKy, name, thanhPhan, congTy, quocGia, linkChiTiet, imageUrl, dangBaoChe, dongGoi, hanSuDung,
            congTySx, congTyDk, huongDan, price, description, details, usageGuideHref, usageGuideImage,
            product_info, brand, main_category, sub_category
        } = req.body;
        if (!soDangKy || !name || !main_category || !sub_category) {
            return res.status(400).send({
                success: false,
                message: "Các trường bắt buộc: soDangKy, name, main_category, sub_category",
            });
        }
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Save cart data to user database
exports.saveCartToDatabase = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = req.body.cartItems;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = cartItems;
    await user.save();

    res.status(200).json({ message: 'Cart saved successfully', cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Error saving cart', error });
  }
};