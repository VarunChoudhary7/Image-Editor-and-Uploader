const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const statusController = require('../controllers/statusController');
const upload = require('../services/multerServices')


router.get('/');

router.post('/upload', upload.single('file'), imageController.uploadCSV);
//router.post('/upload', imageController.uploadCSV);

router.get('/status/:requestId', statusController);

module.exports = router;
