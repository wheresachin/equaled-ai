const stripThinkBlocks = (text = '') =>
  text.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim();

const callSarvamChat = async ({ systemPrompt, userPrompt, temperature = 0.7 }) => {
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
        { role: 'user', content: userPrompt },
      ],
      temperature,
      n: 1,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[Sarvam AI] Chat API error:', data);
    throw new Error(data?.message || data?.error || 'Sarvam AI request failed');
  }

  return stripThinkBlocks(data?.choices?.[0]?.message?.content || '');
};

const extractJSON = (text = '') => {
  if (!text) return null;

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidates = [
    fenced?.[1],
    text,
    text.match(/\{[\s\S]*\}/)?.[0],
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate.trim());
    } catch (_) {}
  }

  return null;
};

const VOICE_INTENTS = [
  'NAVIGATE_HOME',
  'NAVIGATE_DASHBOARD',
  'NAVIGATE_LESSONS',
  'NAVIGATE_LOGIN',
  'NAVIGATE_TALK_TO_AI',
  'NAVIGATE_BACK',
  'ENABLE_EYE_TRACKER',
  'DISABLE_EYE_TRACKER',
  'ENABLE_HAND_TRACKER',
  'DISABLE_HAND_TRACKER',
  'INCREASE_FONT',
  'DECREASE_FONT',
  'ENABLE_CONTRAST',
  'DISABLE_CONTRAST',
  'ENABLE_CAPTIONS',
  'DISABLE_CAPTIONS',
  'ENABLE_FOCUS',
  'DISABLE_FOCUS',
  'SCROLL_UP',
  'SCROLL_DOWN',
  'STOP_LISTENING',
  'ENABLE_VOICE',
  'SET_VISUAL_MODE',
  'SET_HEARING_MODE',
  'SET_MOTOR_MODE',
  'SET_COGNITIVE_MODE',
  'RESET_DISABILITY_MODE',
];

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

    let reply = await callSarvamChat({
      systemPrompt,
      userPrompt: message.trim(),
      temperature: 0.7,
    });

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

// ── Sarvam Voice Intent Resolver ─────────────────────────────────────────────
const resolveVoiceIntent = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const alternatives = Array.isArray(req.body?.alternatives)
      ? req.body.alternatives
      : [];
    const transcript = typeof req.body?.transcript === 'string' ? req.body.transcript : '';

    const phrases = [transcript, ...alternatives]
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 5);

    if (phrases.length === 0) {
      return res.status(400).json({ message: 'Transcript is required.' });
    }

    if (!process.env.SARVAM_API_KEY) {
      return res.status(500).json({ message: 'AI service not configured.' });
    }

    const systemPrompt =
      'You convert speech transcripts into one command intent for an accessibility app. ' +
      'Return JSON only, no markdown, no explanation. ' +
      'Use exactly this shape: {"intent":"INTENT_NAME"} or {"intent":null}. ' +
      'Choose only from these intents: ' + VOICE_INTENTS.join(', ') + '. ' +
      'If the user is asking to turn off visual, hearing, motor, or cognitive mode, return RESET_DISABILITY_MODE. ' +
      'If the user is asking to turn on a mode, return the matching SET_*_MODE intent. ' +
      'If the user is asking to turn on or off a feature like captions, contrast, focus, eye tracker, hand tracker, or voice control, return the matching ENABLE_* or DISABLE_* intent. ' +
      'If the transcript is unclear or unrelated, return {"intent":null}.';

    const numberedPhrases = phrases.map((phrase, index) => `${index + 1}. ${phrase}`).join('\n');

    const reply = await callSarvamChat({
      systemPrompt,
      userPrompt:
        'Speech recognition candidates:\n' +
        numberedPhrases +
        '\n\nPick the single best intent for what the student most likely meant.',
      temperature: 0,
    });

    const parsed = extractJSON(reply);
    const intent = VOICE_INTENTS.includes(parsed?.intent) ? parsed.intent : null;

    res.json({ intent });
  } catch (error) {
    console.error('[Sarvam AI] Voice intent error:', error?.message || error);
    res.status(500).json({
      message: 'Voice intent service is not available right now.',
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

module.exports = { chatWithAI, resolveVoiceIntent, sarvamTTS, sarvamSTT };
