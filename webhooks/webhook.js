const axios = require('axios');

//good webhook

const triggerWebhook = async (requestId, outputData) => {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
        console.log('No webhook URL defined');
        return;
    }

    try {
        const response = await axios.post(webhookUrl, {
            requestId,
            outputData,
        });

        console.log(`Webhook triggered successfully for request ${requestId}:`, response.data); //We can use WhatsApp or Email
    } catch (error) {
        console.error(`Failed to trigger webhook for request ${requestId}:`, error.message);
    }
};

module.exports = triggerWebhook;
