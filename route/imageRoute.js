const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const statusController = require('../controllers/statusController');
const upload = require('../services/multerServices')


router.get('/', (req, res)=>{
    res.send("You are in images");
});

router.post('/upload', upload.single('file'), imageController.uploadCSV);

router.get('/status/:requestId', statusController);

module.exports = router;
