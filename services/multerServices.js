const multer = require('multer');
const path = require('path');

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Directory where files will be saved
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Create the Multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Only allow CSV files
        if (file.mimetype !== 'text/csv') {
            return cb(new Error('Only CSV files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Export the upload middleware
module.exports = upload;
