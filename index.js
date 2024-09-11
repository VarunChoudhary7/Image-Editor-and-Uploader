require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const imageRoutes = require('./route/imageRoute');

const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));


app.use(express.json());
app.use('/images', imageRoutes);

app.post('/', (req, res) => {
    console.log('Webhook received:', req.body);
    res.status(200).send('Webhook processed successfully');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
