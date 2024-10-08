const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const triggerWebhook = require('../webhooks/webhook');
const Request = require('../model/imageModel');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, getDownloadURL, uploadBytes } = require('firebase/storage');
const config = require('../config/firebaseconfig');
const {validateSerialNumber, validateURL, validateProductName} = require('./validationServices');
const { Parser } = require('json2csv');


const app = initializeApp(config.firebaseConfig);
const storage = getStorage(app);

const validateCSV = (data) => {
    let colKeys = Object.keys(data[0]);
    if(colKeys.length !== 3){
        return {
            isValid : false,
            errorMessage : "Invalid Number Of Columns Found"
        }
    }
    for(const row of data){
        colKeys = Object.keys(row);
        for(let j = 0; j<colKeys.length; j++){  //serial number validator, url validator, product name validator
            console.log(row[colKeys.at(j)]);
            const serialNumber = row[colKeys[0]]; 
            const productName = row[colKeys[1]];          
            
            if (!validateSerialNumber(serialNumber)) {
                return {
                    isValid: false,
                    errorMessage: `Invalid Serial Number: ${serialNumber}`
                };
            }
    
            if (!validateProductName(productName)) {
                return {
                    isValid: false,
                    errorMessage: `Invalid Product Name: ${productName}`
                };
            }
        }
    
        // If everything is valid
        return {
            isValid: true,
            errorMessage: ""
        };
    };
    
  
        
    
    return {
        isValid : true,
        errorMessage : ""
    }
    

};

const downloadImage = async (url, outputPath) => {
    const response = await axios({ url, responseType: 'stream' });
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
};

const compressImage = async (url, outputPath, tempInputPath) => {
    try {
        await downloadImage(url, tempInputPath);

        await sharp(tempInputPath)
            .jpeg({ quality: 50 }) 
            .toFile(outputPath);

        return outputPath;
    } catch (error) {
        console.error(`Failed to process image from ${url}:`, error);
        return null;
    }
};

const processImages = async (requestId, productData) => {
    const outputData = [];
    for (const row of productData) {
        
        console.log("in process");
        const serialNumber = row[Object.keys(row)[0]];
        const productName = row[Object.keys(row)[1]];
        const inputUrls = row[Object.keys(row)[2]];
        const tempInputPath = `./uploads/temp-${productName}.jpeg`;
        const urls = inputUrls.split(',');
        console.log(urls);

        const outputUrls = await Promise.all(urls.map(async (url, index) => {   //check allSettled
            const outputPath = `./services/output/processedImages/${productName}_${index}.jpg`;  
            await compressImage(url, outputPath, tempInputPath); 
            const onlineOutput = `output-images/${productName}_${index}.jpg`;
            const outputUrl = uploadFile(outputPath, onlineOutput, {contentType : "image/jpeg"});
            return outputUrl;
        }));

        //fs.unlinkSync(tempInputPath);
        const finalUrls = outputUrls.join(', ');   
        
        
        outputData.push({'S. No.': serialNumber, 'Product Name': productName, 'Input Image Urls': inputUrls,'Output Image Urls': finalUrls });
    }
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(outputData);

    const outFilePath = `output_${requestId}.csv`;
    fs.writeFileSync(outFilePath, csv)

    const outputFile = await uploadFile(outFilePath, `output-files/${outFilePath}`, {contentType : "text/csv"});
    
    await Request.findOneAndUpdate(
        { requestId : `${requestId}` },
        { status: 'completed', outputFilePath: outputFile } //online upload
    );

    triggerWebhook(requestId, outputData);
};

const uploadFile = async (filePath, fileOutputPath, metadata) => {
    const file = fs.readFileSync(filePath);

    try{
        
        const storageRef = ref(storage, fileOutputPath);

        const snapshot = await uploadBytes(storageRef, file, metadata);
        
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        fs.unlinkSync(filePath);

        return downloadURL;

    } catch(e){
        return null;
    }
    
}

module.exports = {
    validateCSV,
    processImages,
    uploadFile,
};


