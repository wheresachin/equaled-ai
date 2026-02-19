const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION =
  'You are an inclusive educational assistant. ' +
  'Explain clearly and simply for students with disabilities. ' +
  'Keep answers concise (2-4 sentences). Be warm and encouraging.';

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

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const result = await model.generateContent(message.trim());
    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error('[AI] Gemini error:', error);
    res.status(500).json({
      message: 'AI is not available right now. Please try again.',
      reply: 'Sorry, I could not process your request. Please try again.',
    });
  }
};

module.exports = { chatWithAI };
