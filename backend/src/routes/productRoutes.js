const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { 
    createProduct, getAllProducts, getProductByBarcode, 
    updateProduct, deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('store_manager', 'admin'), upload.single('image'), createProduct);
router.get('/', protect, authorize('store_manager', 'admin'), getAllProducts);
router.get('/scan/:barcode', protect, authorize('store_manager', 'admin'), getProductByBarcode);
router.route('/:id')
    .put(protect, authorize('store_manager', 'admin'), updateProduct)
    .delete(protect, authorize('store_manager', 'admin'), deleteProduct);

module.exports = router;