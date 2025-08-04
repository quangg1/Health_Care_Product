const drugSchema = require('../models/drugModel');
const User = require('../models/userModel'); // Assuming the user model is in the same directory

// Get all drugs
exports.getAllDrugsController = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', category = '' } = req.query;
        
        // Build query
        let query = {};
        
        // Search by drug name
        if (search) {
            query.tenThuoc = { $regex: search, $options: 'i' };
        }
        
        // Filter by company (as category)
        if (category) {
            query.congTy = { $regex: category, $options: 'i' };
        }
        
        // Calculate pagination
        const skip = (page - 1) * limit;
        
        // Get drugs with pagination
        const drugs = await drugSchema
            .find(query)
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 });
        
        // Get total count for pagination
        const total = await drugSchema.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: drugs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching drugs:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching drugs',
            error: error.message 
        });
    }
};

// Get drug by ID
exports.getDrugByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        
        const drug = await drugSchema.findById(id);
        
        if (!drug) {
            return res.status(404).json({
                success: false,
                message: 'Drug not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: drug
        });
    } catch (error) {
        console.error('Error fetching drug:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching drug',
            error: error.message 
        });
    }
};

// Get drug categories (companies)
exports.getDrugCategoriesController = async (req, res) => {
    try {
        const categories = await drugSchema.aggregate([
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

// Create new drug
exports.createDrugController = async (req, res) => {
    try {
        const { soDangKy, tenThuoc, thanhPhan, congTy, quocGia, linkChiTiet, imageUrl, dangBaoChe, dongGoi, hanSuDung, congTySx, congTyDk, huongDan } = req.body;
        if (!soDangKy || !tenThuoc || !linkChiTiet || !thanhPhan ||!huongDan) {
            return res.status(400).send({
                success: false,
                message: "All fields are required",
            });
        }
        const newDrug = await drugSchema.create(req.body);
        res.status(201).json(newDrug);
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