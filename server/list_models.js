const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await axios.get(url);
        const models = response.data.models.map(m => m.name).join('\n');
        fs.writeFileSync('models_list.txt', models);
        console.log("Models list written to models_list.txt");
    } catch (error) {
        console.error("Error listing models:", error.response ? error.response.data : error.message);
    }
}

listModels();
