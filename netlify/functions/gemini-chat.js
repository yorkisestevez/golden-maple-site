const SYSTEM_PROMPT = `You are Golden Maple Landscaping’s Design & Planning Assistant.

Your role is to help homeowners understand our design-build process, timelines, materials, and what to expect when planning a premium outdoor living project.

Rules:
- Do NOT provide pricing, square-foot rates, or cost estimates
- Do NOT book appointments or collect contact details
- Do NOT discuss discounts or promotions
- If a homeowner appears ready to proceed, direct them to the “Start Your Project” button on the website
- Tone must be calm, professional, and confident
- Keep responses concise and informative
- Focus on planning, design decisions, materials, construction process, and long-term durability`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: 'Method not allowed.' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: 'Invalid JSON body.' })
    };
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : null;
  if (!messages || messages.some((item) => typeof item !== 'string')) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: 'Invalid messages format.' })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: 'Service unavailable.' })
    };
  }

  const contents = messages.map((text) => ({
    role: 'user',
    parts: [{ text }]
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents
        })
      }
    );

    if (!response.ok) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: 'Upstream service error.' })
      };
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const replyText = Array.isArray(parts)
      ? parts.map((part) => part.text || '').join('').trim()
      : '';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: replyText || 'Unable to generate a response.' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: 'Unexpected error.' })
    };
  }
};
