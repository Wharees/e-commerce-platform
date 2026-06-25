const Product = require('../models/Product');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

/**
 * Get all products with filtering and pagination
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, sort, minPrice, maxPrice } = req.query;

    let query = { isActive: true, isApproved: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.$and = [];
      if (minPrice) {
        query.$and.push({
          $or: [
            { discountPrice: { $gte: minPrice } },
            { price: { $gte: minPrice } }
          ]
        });
      }
      if (maxPrice) {
        query.$and.push({
          $or: [
            { discountPrice: { $lte: maxPrice } },
            { price: { $lte: maxPrice } }
          ]
        });
      }
    }

    const skip = (page - 1) * limit;
    let sortOption = { createdAt: -1 };

    // Handle sorting
    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'popular') {
      sortOption = { reviewCount: -1 };
    }

   const products = await Product.find(query)
      .populate('vendor', 'fullName') // <-- Changed 'name' to 'fullName'
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get product by ID
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create product (Vendor only)
 */
exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, quantity, category, tags, sku } = req.body;

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const product = new Product({
      name,
      description,
      price,
      quantity,
      category,
      vendor: req.userId,
      tags: tags || [],
      sku: sku || `SKU-${Date.now()}`
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update product (Vendor only)
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, quantity, category, tags, discount } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify vendor owns the product
    if (product.vendor_id.toString() !== req.userId) {
      return res.status(403).json({
        message: 'You can only update your own products'
      });
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (category) product.category = category;
    if (tags) product.tags = tags;
    if (discount !== undefined) product.discount = discount;

    await product.save();

    res.status(200).json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete product (Vendor only)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // --- THE BULLETPROOF VENDOR CHECK ---
    // The "?." (optional chaining) stops the server from crashing if Mongoose hides the ID
    const productVendorId = product.vendor?._id?.toString() || product.vendor?.toString();
    const requestUserId = req.userId?.toString();

    if (productVendorId !== requestUserId) {
      return res.status(403).json({
        message: 'You can only delete your own products'
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get vendor products
 */
exports.getVendorProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find({ vendor: req.userId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ vendor: req.userId });

    res.status(200).json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Upload product images
 */
/**
 * Upload product images
 */
exports.uploadProductImages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // --- THE BULLETPROOF VENDOR CHECK ---
    // This safely extracts the ID whether Mongoose populated the vendor object or not!
    const productVendorId = product.vendor._id ? product.vendor._id.toString() : product.vendor.toString();
    const requestUserId = req.userId.toString();

    if (productVendorId !== requestUserId) {
      // If it fails, this will print the exact mismatch in your backend terminal!
      console.log("❌ ID Mismatch! Product belongs to:", productVendorId, " | User requesting is:", requestUserId);
      
      return res.status(403).json({
        message: 'You can only update your own products'
      });
    }

    // Store file paths
    const images = req.files.map(file => file.path);
    product.images = images;
    if (!product.thumbnail) {
      product.thumbnail = images[0];
    }

    await product.save();

    res.status(200).json({
      message: 'Images uploaded successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Search products
 */
exports.searchProducts = async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(
      { $text: { $search: query }, isActive: true, isApproved: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments({
      $text: { $search: query },
      isActive: true,
      isApproved: true
    });

    res.status(200).json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get trending products
 */
exports.getTrendingProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.find({
      isActive: true,
      isApproved: true
    })
      .sort({ reviewCount: -1, rating: -1 })
      .limit(parseInt(limit));

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
