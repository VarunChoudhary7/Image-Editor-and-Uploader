const { v4: uuidv4 } = require('uuid');
const csv = require('csv-parser');
const fs = require('fs');
const imageService = require('../services/imageService');
const Request = require('../model/imageModel');
const path = require('path')

    const uploadCSV = (req, res) => {

    const filePath = req.file.path; 
    
    const results = [];
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            let requestId = null;
            try{
                const validationResult = imageService.validateCSV(results);
            if (!validationResult.isValid) {
                return res.status(400).json({errorMessage : validationResult.errorMessage});
            }
            requestId = uuidv4();
            const url = await imageService.uploadFile(filePath, `input-files/${requestId}.csv`, { contentType : "text/csv"});
            
            if(url == null){
                return res.status(500).json({errorMessage : "Some unexpected error occured while generating input URL"});
            }
            const request = new Request({ requestId, inputFilePath: url});
            await request.save();
            }
            catch(e){
                console.log(e);
                return res.status(500).json({errorMessage : "Unable to Process"});
            }
            try{
                imageService.processImages(requestId, results);
            }
            catch(e){
                console.log("Error in processing file",requestId);
                console.log(e);
            }

            res.json({ requestId });
            
        });
};


module.exports = {
    uploadCSV
};