const { initializeApp } = require("firebase/app");
const { getStorage, ref, getDownloadURL, uploadBytes } = require("firebase/storage");
const multer = require('multer');
const config = require("../config/firebaseconfig");
const express = require('express');
const router = express.Router();

const app = initializeApp(config.firebaseConfig);
const storage = getStorage(app);
const upload = multer({ storage: multer.memoryStorage() });
        
router.post("/uploadImage", upload.single('file'), async (req, res)=>{
    
    console.log("in upload");

    try{
        
        const storageRef = ref(storage, `/user/${req.file.originalname}`);
        
        const metadata = {
            contentType: req.file.mimetype
        };

        console.log(storageRef);

        const snapshot = await uploadBytes(storageRef, req.file.buffer, metadata);

        // const snapshot =  await uploadBytes(storageRef, fileDetails.buffer, metatype).then(async (snapshot) => {
        //         fileStatus.isUploaded = true;
        //         fileStatus.filePath = `gs://assignment-76868.appspot.com/${req.file.originalname}`;   
        //         resolve(fileStatus);
        //     }).catch((error) => {
        //         console.log('Error: ', error);
        //         reject(fileStatus);
        //     });

        const downloadURL = await getDownloadURL(snapshot.ref);
        
        console.log('File uploaded successfully');
        return res.send({
            message: 'file uploaded',
            name: req.file.originalname,
            type: req.file.mimetype,
            downloadURL: downloadURL
        })
    } catch(e){
        return res.status(400).send(e);
    }

});

module.exports = router;