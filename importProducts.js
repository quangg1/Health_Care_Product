const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: './.env' });

// Connect to database
const connectionDb = require('./config/db');
const Product = require('./models/productModel');

// Function to map JSON data to product schema (đầy đủ trường mới)
const mapProductData = (item) => {
  // Tạo tên sản phẩm và số đăng ký duy nhất nếu thiếu
  const productName = item.name || 'Unknown Product';
  const uniqueId = `${productName}-${item.packaging || ''}-${item.dosageForm || ''}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    name: productName,
    soDangKy: item.soDangKy || item.registrationNumber || uniqueId,
    thanhPhan: item.thanhPhan || item.ingredients || (item.details && (item.details['Thành phần chính'] || item.details['Thành phần'])) || '',
    congTy: item.congTy || item.brand || '',
    quocGia: item.quocGia || item.country || '',
    linkChiTiet: item.linkChiTiet || item.usageGuideHref || '',
    imageUrl: item.imageUrl || item.image || '',
    dangBaoChe: item.dangBaoChe || item.dosageForm || (item.details && item.details['Dạng bào chế']) || '',
    dongGoi: item.dongGoi || item.packaging || (item.details && item.details['Cách đóng gói']) || '',
    hanSuDung: item.hanSuDung || item.expiryDate || (item.details && (item.details['Hạn dùng'] || item.details['Hạn sử dụng'])) || '',
    congTySx: item.congTySx || item.manufacturer || (item.details && (item.details['Nhà sản xuất'] || item.details['NSX'])) || '',
    congTyDk: item.congTyDk || item.registrationCompany || '',
    huongDan: item.huongDan || item.usageInstructions || '',
    price: parseFloat(item.price) || 0,
    description: item.description || '',
    details: item.details || {},
    usageGuideHref: item.usageGuideHref || '',
    usageGuideImage: item.usageGuideImage || '',
    product_info: item.product_info || {},
    brand: item.brand || '',
    main_category: item.main_category || '',
    sub_category: item.sub_category || ''
  };
};

// Function to import a single JSON file
const importJsonFile = async (filePath) => {
  try {
    console.log(`Importing file: ${filePath}`);
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);

    // Map data to product schema
    const products = Array.isArray(jsonData) ? jsonData.map(mapProductData) : [mapProductData(jsonData)];

    // Insert products into database, handling duplicates
    let importedCount = 0;
    for (const product of products) {
      try {
        await Product.create(product);
        importedCount++;
      } catch (error) {
        // If it's a duplicate key error, skip this product
        if (error.code === 11000) {
          console.log(`Skipping duplicate product: ${product.name} with registration number: ${product.soDangKy}`);
        } else {
          // If it's another error, re-throw it
          throw error;
        }
      }
    }

    console.log(`Successfully imported ${importedCount} products from ${filePath}`);
    return importedCount;
  } catch (error) {
    console.error(`Error importing file ${filePath}:`, error.message);
    return 0;
  }
};

// Function to import all JSON files
const importAllJsonFiles = async () => {
  try {
    // Connect to database
    await connectionDb();

    // Get all JSON files in the root directory
    const files = fs.readdirSync('.');
    const jsonFiles = files.filter(file =>
      path.extname(file) === '.json' &&
      !file.includes('package') &&
      file !== 'tsconfig.node.json' &&
      file !== 'tsconfig.app.json' &&
      file !== 'tsconfig.json'
    );

    console.log(`Found ${jsonFiles.length} JSON files to import`);

    let totalImported = 0;

    // Import each JSON file
    for (const file of jsonFiles) {
      const filePath = path.join('.', file);
      const importedCount = await importJsonFile(filePath);
      totalImported += importedCount;
    }

    console.log(`\nImport completed. Total products imported: ${totalImported}`);

    // Close database connection
    process.exit(0);
  } catch (error) {
    console.error('Error during import process:', error);
    process.exit(1);
  }
};

// Run the import
importAllJsonFiles();