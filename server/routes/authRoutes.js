const express = require('express');
const { registerUser, authUser, updateUserProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Only images allowed!');
        }
    }
});

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);
router.put('/password', protect, changePassword);

module.exports = router;
