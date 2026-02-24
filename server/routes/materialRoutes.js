const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const {
    uploadMaterial,
    getMaterials,
    deleteMaterial
} = require('../controllers/materialController');

// Configure Multer for file uploads
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
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|ppt|pptx|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Only document files allowed!');
        }
    }
});

router.route('/')
    .post(protect, upload.single('file'), uploadMaterial)
    .get(protect, getMaterials);

router.route('/:id')
    .delete(protect, deleteMaterial);

module.exports = router;
