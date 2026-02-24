const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

console.log("Loading models...");

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Key:", process.env.GEMINI_API_KEY ? "Found" : "Missing");

    try {
        // Test gemini-1.5-flash
        console.log("Testing 'gemini-1.5-flash'...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Response:", result.response.text());
    } catch (error) {
        console.error("FAILED gemini-1.5-flash:", error.message);

        try {
            // Test gemini-pro
            console.log("Testing 'gemini-pro'...");
            const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result2 = await model2.generateContent("Hello");
            console.log("Response:", result2.response.text());
        } catch (err2) {
            console.error("FAILED gemini-pro:", err2.message);
        }
    }
}

run();
