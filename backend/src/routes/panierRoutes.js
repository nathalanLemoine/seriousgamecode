const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { 
    createPanier, addItemToPanier, getAvailablePaniers, getPanierDetails,
    updatePanier, deletePanier
} = require('../controllers/panierController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.get('/', protect, getAvailablePaniers); 


router.post('/', protect, authorize('store_manager', 'admin'), upload.single('image'), createPanier);
router.post('/:id/items', protect, authorize('store_manager', 'admin'), addItemToPanier);

router.route('/:id')
    .get(protect, getPanierDetails)
    .put(protect, authorize('store_manager', 'admin'), updatePanier)
    .delete(protect, authorize('store_manager', 'admin'), deletePanier);

module.exports = router;