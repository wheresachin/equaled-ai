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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Embed system instruction inside the prompt for maximum compatibility
    const prompt = `You are an inclusive educational assistant for students with disabilities. Explain clearly and simply. Keep answers to 2-4 sentences. Be warm and encouraging.\n\nStudent asks: ${message.trim()}`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error('[AI] Gemini error:', error?.message || error);
    res.status(500).json({
      message: 'AI is not available right now. Please try again.',
      error: error?.message || (error && error.toString ? error.toString() : 'Unknown error'),
    });
  }
};

module.exports = { chatWithAI };
