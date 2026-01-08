const express = require('express');
const router = express.Router();
const { 
    registerUser, loginUser, getUserProfile, logoutUser, registerAdmin, registerManager,
    updateUserProfile, deleteUserAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/registerAdmin', registerAdmin);
router.post('/registerManager', registerManager);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile)
    .delete(protect, deleteUserAccount);

module.exports = router;