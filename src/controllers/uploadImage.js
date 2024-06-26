const uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        res.status(200).json({ imageUrl: req.file.path });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
};

module.exports = {
    uploadImage,
};