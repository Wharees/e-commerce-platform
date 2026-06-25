const express = require('express');
const { body, param } = require('express-validator');
const productController = require('../controllers/productController');
const { authenticate, isVendor } = require('../middleware/authMiddleware');
const multer = require('multer'); // <-- 1. Import Multer

const router = express.Router();

// --- 2. Configure Multer ---
// This tells Multer exactly where to save the files and what to name them
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure you created an 'uploads' folder in your backend!
  },
  filename: function (req, file, cb) {
    // Adds a timestamp to the file name so you don't overwrite images with the same name
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
// ---------------------------

/**
 * Public routes
 */
router.get('/', productController.getAllProducts);
router.get('/trending', productController.getTrendingProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);

/**
 * Protected routes - Vendor only
 */
router.post('/add', authenticate, isVendor, [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('category').notEmpty().withMessage('Category is required')
], productController.createProduct);

router.post('/', authenticate, isVendor, [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('category').notEmpty().withMessage('Category is required')
], productController.createProduct);

router.put('/:id', authenticate, isVendor, productController.updateProduct);

router.delete('/:id', authenticate, isVendor, productController.deleteProduct);

router.get('/vendor/products/:vendorId', productController.getVendorProducts);

router.get('/vendor/my-products', authenticate, isVendor, productController.getVendorProducts);

// --- 3. Add the Multer middleware exactly here ---
// upload.array('images') tells Multer to look for the 'images' label we set in React
router.post('/:id/images', authenticate, isVendor, upload.array('images', 5), productController.uploadProductImages);

module.exports = router;