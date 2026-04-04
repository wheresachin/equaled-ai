// ── Sarvam AI Chat Completion ────────────────────────────────────────────────
const chatWithAI = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    if (!process.env.SARVAM_API_KEY) {
      return res.status(500).json({ message: 'AI service not configured.' });
    }

    const systemPrompt =
      'You are an inclusive educational assistant for students with disabilities. ' +
      'Keep your answers EXTREMELY brief, natural, and conversational. ' +
      'Maximum 1 to 2 short sentences. Reply ONLY to exactly what is asked without extra fluff. ' +
      "Support both Hindi and English based on the student's language.";

    const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'api-subscription-key': process.env.SARVAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sarvam-m',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message.trim() },
        ],
        temperature: 0.7,
        n: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Sarvam AI] Chat API error:', data);
      throw new Error(data?.message || data?.error || 'Sarvam AI request failed');
    }

    let reply =
      data?.choices?.[0]?.message?.content ||
      'Sorry, I could not understand that. Please try again.';

    // Strip out <think> blocks that Sarvam-M reasoning models often use
    reply = reply.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim();

    if (!reply) {
      reply = 'I am here to help!';
    }

    res.json({ reply });
  } catch (error) {
    console.error('[Sarvam AI] Chat error:', error?.message || error);
    res.status(500).json({
      message: 'AI is not available right now. Please try again.',
      error: error?.message || 'Unknown error',
    });
  }
};

// ── Sarvam Text-to-Speech ─────────────────────────────────────────────────────
const sarvamTTS = async (req, res) => {
  try {
    const { text, language_code = 'en-IN', speaker = 'meera', pace = 1.0 } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Text is required.' });
    }

    if (!process.env.SARVAM_API_KEY) {
      return res.status(500).json({ message: 'TTS service not configured.' });
    }

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': process.env.SARVAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim().slice(0, 2500),
        target_language_code: language_code,
        speaker: speaker,
        pace: pace,
        model: 'bulbul:v2',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Sarvam TTS] API error:', data);
      throw new Error(data?.message || 'Sarvam TTS request failed');
    }

    // audios is an array of base64-encoded WAV strings
    const audioBase64 = data?.audios?.[0];
    if (!audioBase64) {
      throw new Error('No audio returned from Sarvam TTS');
    }

    res.json({ audio: audioBase64, request_id: data.request_id });
  } catch (error) {
    console.error('[Sarvam TTS] Error:', error?.message || error);
    res.status(500).json({
      message: 'TTS service error. Please try again.',
      error: error?.message || 'Unknown error',
    });
  }
};

// ── Sarvam Speech-to-Text ─────────────────────────────────────────────────────
const sarvamSTT = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required.' });
    }

    if (!process.env.SARVAM_API_KEY) {
      return res.status(500).json({ message: 'STT service not configured.' });
    }

    const { language_code = 'unknown', model = 'saarika:v2.5' } = req.body;

    const formData = new FormData();
    // Sarvam STT strictly parses the internal boundary filename.
    // Ensure we use a File object so the boundary sends filename="audio.wav" explicitly.
    const audioFile = new File([req.file.buffer], 'audio.wav', { type: 'audio/wav' });
    formData.append('file', audioFile);
    formData.append('model', model);
    formData.append('language_code', language_code === 'unknown' ? 'hi-IN' : language_code);

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': process.env.SARVAM_API_KEY,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Sarvam STT] API error:', data);
      throw new Error(data?.message || 'Sarvam STT request failed');
    }

    res.json({
      transcript: data.transcript || '',
      language_code: data.language_code || language_code,
    });
  } catch (error) {
    console.error('[Sarvam STT] Error:', error?.message || error);
    res.status(500).json({
      message: 'STT service error. Please try again.',
      error: error?.message || 'Unknown error',
    });
  }
};

module.exports = { chatWithAI, sarvamTTS, sarvamSTT };
