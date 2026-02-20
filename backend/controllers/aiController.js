const { GoogleGenerativeAI } = require('@google/generative-ai');

// POST /api/ai/chat
const chatWithAI = async (req, res) => {
  try {
    // Only students can use this
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'AI service not configured.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash', 
      'gemini-1.5-flash', 
      'gemini-1.5-flash-latest', 
      'gemini-pro'
    ];
    let reply = '';
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = `You are an inclusive educational assistant for students with disabilities. Explain clearly and simply. Keep answers to 2-4 sentences. Be warm and encouraging.\n\nStudent asks: ${message.trim()}`;
        
        const result = await model.generateContent(prompt);
        reply = result.response.text();
        if (reply) break; 
      } catch (err) {
        console.error(`[AI] Failed with ${modelName}:`, err.message || err);
        lastError = err;
        // If it's not a 404/model error (e.g. quota, auth), don't bother trying other models
        if (!err.message?.includes('404') && !err.message?.includes('not found')) {
          break;
        }
      }
    }

    if (!reply) {
      throw lastError || new Error('All AI models failed to respond.');
    }

    res.json({ reply });
  } catch (error) {
    console.error('[AI] Final Gemini error:', error?.message || error);
    res.status(500).json({
      message: 'AI is not available right now. Please try again.',
      error: error?.message || (error && error.toString ? error.toString() : 'Unknown error'),
    });
  }
};

module.exports = { chatWithAI };
