const axios = require('axios');

async function testChat() {
    try {
        const response = await axios.post('http://127.0.0.1:5001/api/chat', {
            message: "Hello, are you there?",
            history: []
        });
        console.log("Success! AI Response:", response.data.reply);
    } catch (error) {
        console.error("Chat Test Failed:", error.response ? error.response.data : error.message);
    }
}

testChat();
