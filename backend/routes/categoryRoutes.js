const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Category controller (will be created next)
const categoryController = {
  getAllCategories: async (req, res) => {
    const Category = require('../models/Category');
    try {
      const categories = await Category.find({ isActive: true });
      res.status(200).json({ categories });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getCategoryById: async (req, res) => {
    const Category = require('../models/Category');
    try {
      const category = await Category.findById(req.params.id);
      if (!category) return res.status(404).json({ message: 'Category not found' });
      res.status(200).json({ category });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  createCategory: async (req, res) => {
    const Category = require('../models/Category');
    const { authenticate, isAdmin } = require('../middleware/authMiddleware');
    try {
      const { name, description } = req.body;
      const category = new Category({ name, description });
      await category.save();
      res.status(201).json({ message: 'Category created', category });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin routes (protected)
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
router.post('/', authenticate, isAdmin, categoryController.createCategory);

module.exports = router;
