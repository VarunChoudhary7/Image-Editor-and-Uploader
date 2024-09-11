const express = require('express');
const router = express.Router();
const Request = require('../model/imageModel');


router.get('/status/:requestId', async (req, res) => {

    try {
        const { requestId } = req.params; 
        
        const request = await Request.findOne({requestId : requestId });
        
        if (!request) {
            return res.status(404).json({
                message: 'Request not found',
                requestId
            });
        }

        res.status(200).json({
            requestId: request.requestId,
            status: request.status,
            outputFilePath: request.status === 'completed' ? request.outputFilePath : null,
        });

    } catch (error) {
        console.error('Error fetching request status:', error);
        res.status(500).json({
            message: 'An error occurred while fetching the request status'
        });
    }
});

module.exports = router;
