const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadImage');
const upload = require('../config/multer');

router.post('/upload-image', upload.single('image'), uploadImage);

module.exports = router;