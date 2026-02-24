const { GoogleGenerativeAI } = require('@google/generative-ai');

// @desc    Process chat message with Google Gemini
// @route   POST /api/chat
// @access  Public
const processChat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message: 'API Key is missing. Please add GEMINI_API_KEY to your .env file.',
                isConfigError: true
            });
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Transform frontend history to Gemini format
        // Frontend: [{ text: "...", isBot: boolean }]
        // Gemini:   [{ role: "user" | "model", parts: [{ text: "..." }] }]
        let validHistory = (history || [])
            .filter(msg => msg.text && msg.text.trim() !== '') // Filter empty
            .map(msg => ({
                role: msg.isBot ? "model" : "user",
                parts: [{ text: msg.text }]
            }))
            .slice(-10); // Keep last 10 messages for context window management

        // Google Gemini requires history to start with 'user'
        // If the first message is from the model (e.g. welcome message), remove it
        if (validHistory.length > 0 && validHistory[0].role === 'model') {
            validHistory.shift();
        }

        const chat = model.startChat({
            history: validHistory,
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ message: 'Failed to get AI response: ' + (error.message || error) });
    }
};

module.exports = { processChat };
